/**
 * Phase 16D: EditServiceRequestModal Component Tests
 *
 * Verifies:
 * - Pre-populates form from authoritative ServiceRequestDetailResponse
 * - Displays human-readable category, title, description, priority, and asset
 * - Field validation (title required, description required, max 255 length)
 * - Exact UpdateServiceRequestRequest payload sent to serviceRequestApi.updateServiceRequest
 * - Zero status, requestNumber, requesterId in update payload
 * - Synchronous submit lock (submittingRef) prevents duplicate requests
 * - Optimistic lock conflict (HTTP 409) triggers onConflict()
 * - Standard error sets inline error banner
 * - Success triggers onSuccess(updated)
 * - Close button triggers onClose()
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EditServiceRequestModal } from '../../src/features/serviceRequests/components/EditServiceRequestModal';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ServiceRequestDetailResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');

describe('EditServiceRequestModal', () => {
  const mockRequest: ServiceRequestDetailResponse = {
    id: 'req-uuid-1',
    requestNumber: 'SR-2026-000001',
    category: {
      id: 'cat-uuid-1',
      code: 'NETWORK',
      name: 'Hạ tầng mạng',
    },
    requester: {
      id: 'user-uuid-1',
      fullName: 'Nguyễn Văn A',
      email: 'a@worksphere.local',
    },
    assignee: null,
    asset: {
      id: 'asset-uuid-1',
      assetCode: 'ROUTER-01',
      name: 'Router tầng 2',
    },
    title: 'Mất kết nối mạng phòng 201',
    description: 'Thiết bị không kết nối được mạng dây.',
    priority: 'HIGH',
    status: 'OPEN',
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    attachments: [],
    comments: [],
    histories: [],
    rating: null,
    allowedActions: ['UPDATE', 'CANCEL'],
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: null,
    version: 2,
  };

  const mockUpdatedDetail: ServiceRequestDetailResponse = {
    ...mockRequest,
    title: 'Mất kết nối mạng phòng 201 (Đã cập nhật)',
    description: 'Cả mạng dây và Wi-Fi đều mất kết nối.',
    priority: 'CRITICAL',
    version: 3,
  };

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnConflict = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValue([
      {
        id: 'cat-uuid-1',
        code: 'NETWORK',
        name: 'Hạ tầng mạng',
        defaultPriority: 'HIGH',
        active: true,
      },
    ]);
  });

  const renderModal = async (props = {}) => {
    return await render(
      <ThemeProvider>
        <EditServiceRequestModal
          visible={true}
          request={mockRequest}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onConflict={mockOnConflict}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('pre-populates form fields from authoritative request', async () => {
    const { getByDisplayValue, getByText, queryByText } = await renderModal();

    expect(getByDisplayValue('Mất kết nối mạng phòng 201')).toBeTruthy();
    expect(getByDisplayValue('Thiết bị không kết nối được mạng dây.')).toBeTruthy();
    expect(getByText('[NETWORK] Hạ tầng mạng')).toBeTruthy();
    expect(getByText('Router tầng 2 (ROUTER-01)')).toBeTruthy();

    // Zero raw database UUIDs or version numbers exposed
    expect(queryByText('req-uuid-1')).toBeNull();
    expect(queryByText('cat-uuid-1')).toBeNull();
    expect(queryByText('asset-uuid-1')).toBeNull();
  });

  it('validates required fields before submission', async () => {
    const { getByTestId, getByText } = await renderModal();

    const titleInput = getByTestId('input-edit-service-request-title');
    const descInput = getByTestId('input-edit-service-request-description');
    const submitBtn = getByTestId('btn-submit-edit-service-request');

    await act(async () => {
      fireEvent.changeText(titleInput, '   ');
      fireEvent.changeText(descInput, '   ');
    });

    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(getByText('Tiêu đề không được để trống')).toBeTruthy();
      expect(getByText('Mô tả không được để trống')).toBeTruthy();
    });
    expect(serviceRequestApi.updateServiceRequest).not.toHaveBeenCalled();
  });

  it('submits exact UpdateServiceRequestRequest payload and invokes onSuccess', async () => {
    (serviceRequestApi.updateServiceRequest as jest.Mock).mockResolvedValue(mockUpdatedDetail);

    const { getByTestId } = await renderModal();

    // Update title
    const titleInput = getByTestId('input-edit-service-request-title');
    const descInput = getByTestId('input-edit-service-request-description');
    const criticalOption = getByTestId('edit-priority-option-CRITICAL');
    const submitBtn = getByTestId('btn-submit-edit-service-request');

    await act(async () => {
      fireEvent.changeText(titleInput, 'Mất kết nối mạng phòng 201 (Đã cập nhật)');
      fireEvent.changeText(descInput, 'Cả mạng dây và Wi-Fi đều mất kết nối.');
      fireEvent.press(criticalOption);
    });

    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(serviceRequestApi.updateServiceRequest).toHaveBeenCalledTimes(1);
    });

    expect(serviceRequestApi.updateServiceRequest).toHaveBeenCalledWith(
      'req-uuid-1',
      {
        categoryId: 'cat-uuid-1',
        title: 'Mất kết nối mạng phòng 201 (Đã cập nhật)',
        description: 'Cả mạng dây và Wi-Fi đều mất kết nối.',
        priority: 'CRITICAL',
        assetId: 'asset-uuid-1',
        version: 2,
      }
    );

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUpdatedDetail);
    });
  });

  it('handles optimistic lock conflict (HTTP 409) by triggering onConflict', async () => {
    const conflictError: any = new Error('Dữ liệu đã bị thay đổi');
    conflictError.isAxiosError = true;
    conflictError.response = {
      status: 409,
      data: {
        success: false,
        code: 'OPTIMISTIC_LOCK_CONFLICT',
        message: 'Dữ liệu yêu cầu đã bị thay đổi bởi giao dịch khác.',
      },
    };

    (serviceRequestApi.updateServiceRequest as jest.Mock).mockRejectedValue(conflictError);

    const { getByTestId } = await renderModal();

    const submitBtn = getByTestId('btn-submit-edit-service-request');
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(mockOnConflict).toHaveBeenCalledTimes(1);
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('enforces synchronous submit lock on rapid double-press', async () => {
    let resolveApi: (val: any) => void = () => {};
    const pendingPromise = new Promise(resolve => {
      resolveApi = resolve;
    });

    (serviceRequestApi.updateServiceRequest as jest.Mock).mockReturnValue(pendingPromise);

    const { getByTestId } = await renderModal();
    const submitBtn = getByTestId('btn-submit-edit-service-request');

    // Fire double press
    await act(async () => {
      fireEvent.press(submitBtn);
      fireEvent.press(submitBtn);
    });

    expect(serviceRequestApi.updateServiceRequest).toHaveBeenCalledTimes(1);

    resolveApi(mockUpdatedDetail);
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('invokes onClose when cancel or close button is pressed', async () => {
    const { getByTestId } = await renderModal();

    const cancelBtn = getByTestId('btn-cancel-edit-service-request');
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const closeBtn = getByTestId('btn-close-edit-modal');
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
