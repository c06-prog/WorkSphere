/**
 * Phase 17F-CORRECTIVE: AddRepairHistoryModal Unit Tests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AddRepairHistoryModal } from '../../src/features/assets/components/AddRepairHistoryModal';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { useAuth } from '../../src/app/auth/AuthProvider';
import { AssetRepairHistoryResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/app/auth/AuthProvider');
jest.mock('../../src/features/assets/api/assetApi');

describe('AddRepairHistoryModal Component', () => {
  const mockAssetId = '11111111-2222-3333-4444-555555555555';

    const mockCreatedResponse: AssetRepairHistoryResponse = {
    id: '99999999-8888-7777-6666-555555555555',
    repairType: 'MAINTENANCE',
    description: 'Vệ sinh và tra keo tản nhiệt',
    vendorName: 'FPT Services',
    cost: 500000,
    startedAt: '2026-10-25T08:00:00Z',
    completedAt: '2026-10-25T10:00:00Z',
    result: 'Hoạt động tốt',
    createdAt: '2026-10-25T10:05:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        username: 'manager',
        permissions: ['ASSET_MANAGE'],
        roles: ['EMPLOYEE'],
      },
    });
  });

  const renderModal = async (
    props: {
      visible?: boolean;
      assetId?: string;
      onClose?: () => void;
      onCreated?: (rec: AssetRepairHistoryResponse) => void;
    } = {}
  ) => {
    const defaultProps = {
      visible: true,
      assetId: mockAssetId,
      onClose: jest.fn(),
      onCreated: jest.fn(),
      ...props,
    };

    return {
      ...defaultProps,
      rendered: await render(
        <ThemeProvider>
          <AddRepairHistoryModal {...defaultProps} />
        </ThemeProvider>
      ),
    };
  };

  it('1. renders canonical fields and repair type chips', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    expect(getByTestId('add-repair-history-modal')).toBeTruthy();
    expect(getByText('Ghi nhận bảo dưỡng / sửa chữa')).toBeTruthy();
    expect(getByTestId('chip-repair-type-maintenance')).toBeTruthy();
    expect(getByTestId('chip-repair-type-repair')).toBeTruthy();
    expect(getByTestId('chip-repair-type-inspection')).toBeTruthy();
    expect(getByTestId('chip-repair-type-upgrade')).toBeTruthy();
    expect(getByTestId('input-repair-description')).toBeTruthy();
    expect(getByTestId('input-repair-started-date')).toBeTruthy();
    expect(getByTestId('input-repair-completed-date')).toBeTruthy();
    expect(getByTestId('input-repair-cost')).toBeTruthy();
    expect(getByTestId('input-repair-vendor-name')).toBeTruthy();
    expect(getByTestId('input-repair-result')).toBeTruthy();
    expect(getByTestId('btn-modal-submit')).toBeTruthy();
    expect(getByTestId('btn-modal-cancel')).toBeTruthy();
  });

  it('2. validates required fields: description and startedDate', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    // Clear startedDate which defaults to today
    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-started-date'), '');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Mô tả nội dung sửa chữa không được để trống')).toBeTruthy();
      expect(getByText('Ngày bắt đầu không được để trống')).toBeTruthy();
    });

    expect(assetApi.createRepairHistory).not.toHaveBeenCalled();
  });

  it('3. validates invalid startedDate and completedDate formats', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Bảo dưỡng định kỳ');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '25/10/2026'); // invalid format
      fireEvent.changeText(getByTestId('input-repair-completed-date'), 'not-a-date'); // invalid format
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Ngày bắt đầu phải đúng định dạng YYYY-MM-DD')).toBeTruthy();
      expect(getByText('Ngày hoàn thành phải đúng định dạng YYYY-MM-DD')).toBeTruthy();
    });

    expect(assetApi.createRepairHistory).not.toHaveBeenCalled();
  });

  it('4. validates completedDate cannot be before startedDate', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Bảo dưỡng định kỳ');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
      fireEvent.changeText(getByTestId('input-repair-completed-date'), '2026-10-20');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Ngày hoàn thành phải sau hoặc cùng ngày bắt đầu')).toBeTruthy();
    });

    expect(assetApi.createRepairHistory).not.toHaveBeenCalled();
  });

  it('5. validates negative cost is rejected', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Bảo dưỡng');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
      fireEvent.changeText(getByTestId('input-repair-cost'), '-100000');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Chi phí phải là số không âm')).toBeTruthy();
    });

    expect(assetApi.createRepairHistory).not.toHaveBeenCalled();
  });

  it('6. normalizes optional fields and submits valid payload with assetId UUID', async () => {
    (assetApi.createRepairHistory as jest.Mock).mockResolvedValueOnce(mockCreatedResponse);
    const onCreated = jest.fn();
    const onClose = jest.fn();

    const { rendered } = await renderModal({ onCreated, onClose });
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('chip-repair-type-repair'));
      fireEvent.changeText(getByTestId('input-repair-description'), 'Thay màn hình');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-20');
      fireEvent.changeText(getByTestId('input-repair-completed-date'), '2026-10-21');
      fireEvent.changeText(getByTestId('input-repair-cost'), '1500000');
      fireEvent.changeText(getByTestId('input-repair-vendor-name'), 'Trung tâm BH');
      fireEvent.changeText(getByTestId('input-repair-result'), 'Hoàn tất');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(assetApi.createRepairHistory).toHaveBeenCalledTimes(1);
      expect(assetApi.createRepairHistory).toHaveBeenCalledWith(mockAssetId, {
        repairType: 'REPAIR',
        description: 'Thay màn hình',
        vendorName: 'Trung tâm BH',
        cost: 1500000,
        startedAt: '2026-10-20T08:00:00Z',
        completedAt: '2026-10-21T10:00:00Z',
        result: 'Hoàn tất',
      });
      expect(onCreated).toHaveBeenCalledWith(mockCreatedResponse);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('7. allows ADMIN role to submit', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-admin',
        username: 'admin',
        roles: ['ADMIN'],
        permissions: [],
      },
    });

    (assetApi.createRepairHistory as jest.Mock).mockResolvedValueOnce(mockCreatedResponse);

    const { rendered } = await renderModal();
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Sửa chữa bởi Admin');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(assetApi.createRepairHistory).toHaveBeenCalledTimes(1);
    });
  });

  it('8. denies submission and displays error when user lacks ASSET_MANAGE/ADMIN', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-employee',
        username: 'employee',
        permissions: ['ASSET_READ'],
        roles: ['EMPLOYEE'],
      },
    });

    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Cố ý sửa');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Bạn không có quyền thực hiện thao tác này')).toBeTruthy();
    });

    expect(assetApi.createRepairHistory).not.toHaveBeenCalled();
  });

  it('9. synchronous submittingRef prevents duplicate submissions in same tick', async () => {
    let resolvePromise: (val: unknown) => void;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (assetApi.createRepairHistory as jest.Mock).mockImplementation(() => pendingPromise);
    const onCreated = jest.fn();

    const { rendered } = await renderModal({ onCreated });
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Kiểm định thiết bị');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
    });

    // Rapid double press
    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    expect(assetApi.createRepairHistory).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePromise!(mockCreatedResponse);
    });

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledTimes(1);
    });
  });

  it('10. handles 403 Forbidden error from backend without closing modal or losing form data', async () => {
    (assetApi.createRepairHistory as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 403,
        data: {
          success: false,
          code: 'ASSET_ACCESS_DENIED',
          message: 'Bạn không có quyền thao tác trên tài sản này',
          timestamp: '2026-10-25T10:00:00Z',
        },
      },
    });

    const onClose = jest.fn();
    const onCreated = jest.fn();
    const { rendered } = await renderModal({ onClose, onCreated });
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Mô tả không mất đi');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Bạn không có quyền truy cập hoặc thao tác trên tài sản này')).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      expect(onCreated).not.toHaveBeenCalled();
    });
  });

  it('11. handles 404 Asset Not Found without closing modal', async () => {
    (assetApi.createRepairHistory as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          success: false,
          code: 'ASSET_NOT_FOUND',
          message: 'Không tìm thấy tài sản',
          timestamp: '2026-10-25T10:00:00Z',
        },
      },
    });

    const onClose = jest.fn();
    const { rendered } = await renderModal({ onClose });
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.changeText(getByTestId('input-repair-description'), 'Mô tả test 404');
      fireEvent.changeText(getByTestId('input-repair-started-date'), '2026-10-25');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-submit'));
    });

    await waitFor(() => {
      expect(getByText('Không tìm thấy thông tin tài sản')).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('12. Cancel button invokes onClose when not submitting', async () => {
    const onClose = jest.fn();
    const { rendered } = await renderModal({ onClose });
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal-cancel'));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
