import { act, renderHook } from '@testing-library/react-native';
import { useAssetDetail } from '../../src/features/assets/hooks/useAssetDetail';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { AssetDetailResponse } from '../../src/features/assets/types/assetTypes';

jest.mock('../../src/features/assets/api/assetApi');

describe('useAssetDetail Hook', () => {
  const mockAsset: AssetDetailResponse = {
    id: '11111111-2222-3333-4444-555555555555',
    assetCode: 'AST-2026-001',
    name: 'MacBook Pro 16 inch M3 Max',
    category: {
      id: 'cat-uuid-1',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
    },
    description: 'Tài sản cấp phát cho kỹ sư phần mềm cao cấp',
    serialNumber: 'C02G1234MD6R',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" 2024',
    purchaseDate: '2024-01-15',
    purchasePrice: 65000000,
    status: 'ASSIGNED',
    location: 'Tầng 4 - Phòng Công nghệ',
    warrantyEndDate: '2027-01-15',
    currentAssignment: {
      id: 'asg-uuid-1',
      assignedTo: {
        id: 'usr-uuid-1',
        fullName: 'Nguyễn Văn A',
      },
      assignedBy: {
        id: 'usr-uuid-admin',
        fullName: 'Quản trị viên Hệ thống',
      },
      assignedAt: '2024-02-01T08:30:00Z',
      expectedReturnAt: '2026-02-01T08:30:00Z',
      notes: 'Bàn giao đầy đủ phụ kiện sạc 140W',
    },
    repairHistories: [
      {
        id: 'rep-uuid-1',
        repairType: 'MAINTENANCE',
        description: 'Vệ sinh định kỳ và tra keo tản nhiệt',
        vendorName: 'Apple Care Service Center',
        cost: 500000,
        startedAt: '2024-06-10T09:00:00Z',
        completedAt: '2024-06-11T16:00:00Z',
        result: 'Hoàn thành tốt',
        createdAt: '2024-06-10T09:00:00Z',
      },
    ],
    relatedServiceRequests: [
      {
        id: 'srv-uuid-1',
        requestNumber: 'REQ-2024-001',
        title: 'Màn hình bị sọc nhỏ góc phải',
        status: 'RESOLVED',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-11T16:00:00Z',
    version: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. loads asset detail successfully on mount', async () => {
    (assetApi.getAssetDetail as jest.Mock).mockResolvedValueOnce(mockAsset);

    const { result } = await renderHook(() =>
      useAssetDetail('11111111-2222-3333-4444-555555555555')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.asset).toEqual(mockAsset);
    expect(result.current.error).toBeNull();
    expect(assetApi.getAssetDetail).toHaveBeenCalledWith(
      '11111111-2222-3333-4444-555555555555'
    );
  });

  it('2. maps 404 error correctly when asset is not found', async () => {
    const error404 = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          success: false,
          code: 'ASSET_NOT_FOUND',
          message: 'Asset not found',
          timestamp: '2026-10-24T10:00:00Z',
        },
      },
    };
    (assetApi.getAssetDetail as jest.Mock).mockRejectedValueOnce(error404);

    const { result } = await renderHook(() =>
      useAssetDetail('non-existent-uuid')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.asset).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.isNotFound).toBe(true);
    expect(result.current.error?.message).toBe('Không tìm thấy thông tin tài sản');
  });

  it('3. maps 403 error correctly when user lacks access permission', async () => {
    const error403 = {
      isAxiosError: true,
      response: {
        status: 403,
        data: {
          success: false,
          code: 'ASSET_ACCESS_DENIED',
          message: 'Access denied',
          timestamp: '2026-10-24T10:00:00Z',
        },
      },
    };
    (assetApi.getAssetDetail as jest.Mock).mockRejectedValueOnce(error403);

    const { result } = await renderHook(() =>
      useAssetDetail('forbidden-uuid')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.asset).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.isForbidden).toBe(true);
  });

  it('4. supports pull-to-refresh preserving existing asset data on refresh failure', async () => {
    (assetApi.getAssetDetail as jest.Mock).mockResolvedValueOnce(mockAsset);

    const { result } = await renderHook(() =>
      useAssetDetail('11111111-2222-3333-4444-555555555555')
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.asset).toEqual(mockAsset);

    // Refresh fails with network error
    (assetApi.getAssetDetail as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await act(async () => {
      await result.current.refresh();
    });

    // Existing asset retained
    expect(result.current.asset).toEqual(mockAsset);
    expect(result.current.refreshError).toBeTruthy();
    expect(result.current.refreshing).toBe(false);
  });

  it('5. deduplicates concurrent calls for the same assetId', async () => {
    let resolveDetail!: (data: AssetDetailResponse) => void;
    const pendingPromise = new Promise<AssetDetailResponse>((resolve) => {
      resolveDetail = resolve;
    });
    (assetApi.getAssetDetail as jest.Mock).mockReturnValue(pendingPromise);

    const { result } = await renderHook(() =>
      useAssetDetail('11111111-2222-3333-4444-555555555555')
    );

    // Call load() while in-flight
    await act(async () => {
      result.current.load();
    });

    expect(assetApi.getAssetDetail).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDetail(mockAsset);
      await pendingPromise;
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.asset).toEqual(mockAsset);
  });

  it('6. applies optimistic update correctly via applyAssetUpdate', async () => {
    (assetApi.getAssetDetail as jest.Mock).mockResolvedValueOnce(mockAsset);

    const { result } = await renderHook(() =>
      useAssetDetail('11111111-2222-3333-4444-555555555555')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.asset?.status).toBe('ASSIGNED');

    const updatedAsset: AssetDetailResponse = {
      ...mockAsset,
      status: 'MAINTENANCE',
      version: 4,
    };

    await act(async () => {
      result.current.applyAssetUpdate(updatedAsset);
    });

    expect(result.current.asset?.status).toBe('MAINTENANCE');
    expect(result.current.asset?.version).toBe(4);
  });

  it('7. discards stale response when assetId changes', async () => {
    let resolveAssetA!: (data: AssetDetailResponse) => void;
    const promiseA = new Promise<AssetDetailResponse>((resolve) => {
      resolveAssetA = resolve;
    });

    const mockAssetB: AssetDetailResponse = {
      ...mockAsset,
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Dell Precision 5570',
    };

    (assetApi.getAssetDetail as jest.Mock).mockImplementation((id: string) => {
      if (id === '11111111-2222-3333-4444-555555555555') {
        return promiseA;
      }
      return Promise.resolve(mockAssetB);
    });

    const { result, rerender } = await renderHook<any, { id: string }>(
      ({ id }: { id: string }) => useAssetDetail(id),
      { initialProps: { id: '11111111-2222-3333-4444-555555555555' } }
    );

    // Rerender with ID B
    await rerender({ id: '22222222-2222-2222-2222-222222222222' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.asset).toEqual(mockAssetB);

    // Now resolve A late
    await act(async () => {
      resolveAssetA(mockAsset);
      await promiseA;
    });

    // Asset B must NOT be overwritten by Asset A
    expect(result.current.asset).toEqual(mockAssetB);
  });
});
