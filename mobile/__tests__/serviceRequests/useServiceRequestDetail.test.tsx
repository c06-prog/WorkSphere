/**
 * Phase 16C: useServiceRequestDetail Unit & Concurrency Tests
 *
 * Test Scenarios:
 * 1. Initial query on mount with exact requestId.
 * 2. Successful service request detail resolution.
 * 3. Initial error mapping (404 Not Found, 403 Forbidden) and retry recovery.
 * 4. Pull-to-refresh success replaces service request data.
 * 5. Pull-to-refresh failure retains existing request data and sets refreshError.
 * 6. Same-ID concurrent load calls share in-flight promise (exactly 1 API call).
 * 7. Cross-ID supersession: Request A, switch to B, B resolves first, slower A does not overwrite B.
 * 8. Stale failure: Request A, switch to B, B succeeds, A rejects later -> no stale error, B retained.
 * 9. Cross-ID synchronous clearing: changing requestId synchronously resets request to null and initialLoading to true.
 * 10. Unmount safety: pending request resolving or rejecting after unmount causes no state update or crash.
 * 11. applyServiceRequestUpdate immediately updates request state and supersedes pending in-flight GET requests.
 */

import { act, renderHook } from '@testing-library/react-native';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ServiceRequestDetailResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { useServiceRequestDetail } from '../../src/features/serviceRequests/hooks/useServiceRequestDetail';

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');

describe('Phase 16C: useServiceRequestDetail Custom Hook', () => {
  const mockDetailA: ServiceRequestDetailResponse = {
    id: 'req-uuid-1',
    requestNumber: 'SR-2026-000101',
    category: {
      id: 'cat-uuid-1',
      code: 'NETWORK',
      name: 'Hạ tầng mạng',
    },
    requester: {
      id: 'user-uuid-1',
      fullName: 'Nguyễn Văn Yêu Cầu',
      email: 'requester@worksphere.local',
    },
    assignee: {
      assignmentId: 'assign-uuid-1',
      id: 'user-uuid-2',
      fullName: 'Trần Kỹ Thuật',
      email: 'technician@worksphere.local',
      assignedAt: '2026-10-22T08:15:00Z',
    },
    asset: {
      id: 'asset-uuid-1',
      assetCode: 'ASSET-ROUTER-01',
      name: 'Router Cisco tầng 2',
    },
    title: 'Mất tín hiệu mạng Wi-Fi khu vực lễ tân',
    description: 'Từ sáng nay nhân viên và khách không thể kết nối Wi-Fi tại tầng trệt.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-22T08:30:00Z',
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    allowedActions: ['UPDATE_STATUS', 'ASSIGN', 'ADD_COMMENT'],
    version: 3,
    histories: [
      {
        id: 'hist-uuid-1',
        requestId: 'req-uuid-1',
        fromStatus: null,
        toStatus: 'OPEN',
        changedBy: 'user-uuid-1',
        changedByName: 'Nguyễn Văn Yêu Cầu',
        comment: 'Tạo yêu cầu dịch vụ',
        changedAt: '2026-10-22T08:00:00Z',
      },
    ],
    comments: [
      {
        id: 'comm-uuid-1',
        requestId: 'req-uuid-1',
        authorId: 'user-uuid-2',
        authorName: 'Trần Kỹ Thuật',
        content: 'Đang kiểm tra modem và switch chính.',
        isInternal: false,
        isEdited: false,
        editedAt: null,
        createdAt: '2026-10-22T08:20:00Z',
        updatedAt: null,
      },
    ],
    attachments: [
      {
        fileId: 'att-uuid-1',
        originalName: 'network_diagram.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 204800,
        downloadUrl: '/api/v1/files/att-uuid-1',
        uploadedBy: 'user-uuid-1',
        createdAt: '2026-10-22T08:05:00Z',
      },
    ],
    rating: null,
  };

  const mockDetailB: ServiceRequestDetailResponse = {
    ...mockDetailA,
    id: 'req-uuid-2',
    requestNumber: 'SR-2026-000102',
    title: 'Cấp tài khoản VPN làm việc từ xa',
    description: 'Yêu cầu mở quyền truy cập VPN nội bộ.',
    status: 'OPEN',
    assignee: null,
    asset: null,
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. performs initial query on mount with exact requestId', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetailA);

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledTimes(1);
    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledWith('req-uuid-1');
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.request).toEqual(mockDetailA);
    expect(result.current.error).toBeNull();
    expect(result.current.refreshError).toBeNull();
  });

  it('2. sets 404 Not Found error on initial failure and recovers on retry', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 404,
        data: { code: 'SERVICE_REQUEST_NOT_FOUND', message: 'Yêu cầu dịch vụ không tồn tại.' },
      },
    });

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-not-found'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.request).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.isNotFound).toBe(true);
    expect(result.current.error?.retryable).toBe(false);

    // Retry recovery
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetailA);

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.request).toEqual(mockDetailA);
  });

  it('3. sets 403 Forbidden presentation error with non-retryable flag', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 403,
        data: { code: 'ACCESS_DENIED', message: 'Bạn không có quyền xem yêu cầu này.' },
      },
    });

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-forbidden'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.request).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.isForbidden).toBe(true);
    expect(result.current.error?.retryable).toBe(false);
  });

  it('4. pull-to-refresh preserves request data during refresh and replaces on success', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetailA);

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.request).toEqual(mockDetailA);

    const updatedDetailA: ServiceRequestDetailResponse = {
      ...mockDetailA,
      status: 'RESOLVED',
      resolvedAt: '2026-10-22T10:00:00Z',
      version: 4,
    };

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(updatedDetailA);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.request).toEqual(updatedDetailA);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.refreshError).toBeNull();
  });

  it('5. pull-to-refresh preserves request data when refresh fails and sets refreshError', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetailA);

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.request).toEqual(mockDetailA);

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockRejectedValueOnce(
      new Error('Mất kết nối mạng khi làm mới')
    );

    await act(async () => {
      await result.current.refresh();
    });

    // Request data is still preserved!
    expect(result.current.request).toEqual(mockDetailA);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.refreshError).not.toBeNull();
    expect(typeof result.current.refreshError).toBe('string');
  });

  it('6. same-ID concurrent load calls share in-flight promise (exactly 1 API call)', async () => {
    let resolveDetail!: (val: ServiceRequestDetailResponse) => void;
    const pendingPromise = new Promise<ServiceRequestDetailResponse>(res => {
      resolveDetail = res;
    });

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockReturnValue(pendingPromise);

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = result.current.load();
      p2 = result.current.load();
    });

    // Exactly 1 network request dispatched
    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDetail(mockDetailA);
      await Promise.all([p1, p2, pendingPromise]);
    });

    expect(result.current.request).toEqual(mockDetailA);
  });

  it('7. cross-ID supersession: Request B resolves first, slower Request A does not overwrite B', async () => {
    let resolveA!: (val: ServiceRequestDetailResponse) => void;
    const promiseA = new Promise<ServiceRequestDetailResponse>(res => {
      resolveA = res;
    });

    let resolveB!: (val: ServiceRequestDetailResponse) => void;
    const promiseB = new Promise<ServiceRequestDetailResponse>(res => {
      resolveB = res;
    });

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockImplementation((id: string) => {
      if (id === 'req-uuid-1') return promiseA;
      if (id === 'req-uuid-2') return promiseB;
      return Promise.resolve(mockDetailA);
    });

    const { result, rerender } = await renderHook<any, { id: string }>(
      ({ id }: { id: string }) => useServiceRequestDetail(id),
      {
        initialProps: { id: 'req-uuid-1' },
      }
    );

    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledWith('req-uuid-1');

    // Switch route / id to req-uuid-2
    await rerender({ id: 'req-uuid-2' });

    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledWith('req-uuid-2');

    // Resolve B first
    await act(async () => {
      resolveB(mockDetailB);
      await promiseB;
    });

    expect(result.current.request).toEqual(mockDetailB);

    // Resolve A later
    await act(async () => {
      resolveA(mockDetailA);
      await promiseA;
    });

    // Stale Request A must NOT overwrite Request B!
    expect(result.current.request).toEqual(mockDetailB);
  });

  it('8. stale failure: old Request A rejecting does not overwrite successful Request B', async () => {
    let rejectA!: (err: unknown) => void;
    const promiseA = new Promise<ServiceRequestDetailResponse>((_, rej) => {
      rejectA = rej;
    });

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockImplementation((id: string) => {
      if (id === 'req-uuid-1') return promiseA;
      if (id === 'req-uuid-2') return Promise.resolve(mockDetailB);
      return Promise.resolve(mockDetailA);
    });

    const { result, rerender } = await renderHook<any, { id: string }>(
      ({ id }: { id: string }) => useServiceRequestDetail(id),
      {
        initialProps: { id: 'req-uuid-1' },
      }
    );

    // Switch to Request B
    await rerender({ id: 'req-uuid-2' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.request).toEqual(mockDetailB);
    expect(result.current.error).toBeNull();

    // Reject old Request A
    await act(async () => {
      rejectA(new Error('Network failure for old request A'));
      try {
        await promiseA;
      } catch {
        // Expected
      }
      await Promise.resolve();
    });

    // Stale error must NOT be shown
    expect(result.current.request).toEqual(mockDetailB);
    expect(result.current.error).toBeNull();
  });

  it('9. cross-ID synchronous clearing: changing requestId synchronously resets request to null and initialLoading to true', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetailA);

    const { result, rerender } = await renderHook<any, { id: string }>(
      ({ id }: { id: string }) => useServiceRequestDetail(id),
      {
        initialProps: { id: 'req-uuid-1' },
      }
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.request).toEqual(mockDetailA);

    // Return pending promise for req-uuid-2
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    await rerender({ id: 'req-uuid-2' });

    // Request is reset synchronously to prevent ghosting previous data
    expect(result.current.request).toBeNull();
    expect(result.current.initialLoading).toBe(true);
  });

  it('10. unmount safety: does not update state after unmount', async () => {
    let resolveDetail!: (val: ServiceRequestDetailResponse) => void;
    const pendingPromise = new Promise<ServiceRequestDetailResponse>(res => {
      resolveDetail = res;
    });

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockReturnValue(pendingPromise);

    const { result, unmount } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    await unmount();

    await act(async () => {
      resolveDetail(mockDetailA);
      await pendingPromise;
    });

    // Successful unmount without warning or state update crash
    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledTimes(1);
    expect(result.current.request).toBeNull();
  });

  it('11. applyServiceRequestUpdate immediately updates request state and supersedes pending in-flight GET requests', async () => {
    let resolveGetA!: (val: ServiceRequestDetailResponse) => void;
    const pendingGetA = new Promise<ServiceRequestDetailResponse>(res => {
      resolveGetA = res;
    });
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockReturnValueOnce(pendingGetA);

    const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-1'));

    expect(result.current.initialLoading).toBe(true);

    const mutationResult: ServiceRequestDetailResponse = {
      ...mockDetailA,
      title: 'Tiêu đề sau khi cập nhật',
      status: 'RESOLVED',
      version: 4,
    };

    // Apply mutation before GET A resolves
    await act(async () => {
      result.current.applyServiceRequestUpdate(mutationResult);
    });

    expect(result.current.request?.title).toBe('Tiêu đề sau khi cập nhật');
    expect(result.current.request?.status).toBe('RESOLVED');
    expect(result.current.request?.version).toBe(4);
    expect(result.current.initialLoading).toBe(false);

    // Now GET A resolves with stale data
    await act(async () => {
      resolveGetA(mockDetailA);
      await pendingGetA;
    });

    // Stale GET must NOT overwrite mutation result
    expect(result.current.request?.title).toBe('Tiêu đề sau khi cập nhật');
    expect(result.current.request?.status).toBe('RESOLVED');
  });
});
