/**
 * EditAssetModal Component Tests (SCR-AST-04)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EditAssetModal } from '../../src/features/assets/components/EditAssetModal';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { AssetDetailResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');

describe('EditAssetModal (SCR-AST-04)', () => {
  const mockAsset: AssetDetailResponse = {
    id: '11111111-2222-3333-4444-555555555555',
    assetCode: 'AST-2026-001',
    name: 'MacBook Pro 16 inch M3 Max',
    category: {
      id: 'cat-uuid-1',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
    },
    description: 'Mô tả ban đầu',
    serialNumber: 'C02G1234MD6R',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" 2024',
    purchaseDate: '2024-01-15',
    purchasePrice: 65000000,
    status: 'AVAILABLE',
    location: 'Tầng 4 - Phòng Công nghệ',
    warrantyEndDate: '2027-01-15',
    createdAt: '2024-01-15T00:00:00Z',
    version: 3,
    repairHistories: [],
    relatedServiceRequests: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = async (
    props: {
      visible?: boolean;
      asset?: AssetDetailResponse;
      onClose?: () => void;
      onSuccess?: (updated: AssetDetailResponse) => void;
      onConflict?: () => void;
    } = {}
  ) => {
    const defaultProps = {
      visible: true,
      asset: mockAsset,
      onClose: jest.fn(),
      onSuccess: jest.fn(),
      onConflict: jest.fn(),
      ...props,
    };

    return {
      ...defaultProps,
      rendered: await render(
        <ThemeProvider>
          <EditAssetModal {...defaultProps} />
        </ThemeProvider>
      ),
    };
  };

  it('renders pre-filled fields and displays assetCode as read-only', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    expect(getByTestId('edit-asset-modal')).toBeTruthy();
    expect(getByTestId('edit-asset-code-readonly')).toBeTruthy();
    expect(getByText('AST-2026-001')).toBeTruthy();
    // Zero raw database UUID or internal version exposed
    expect(rendered.queryByText('11111111-2222-3333-4444-555555555555')).toBeNull();
    expect(rendered.queryByText('version: 3')).toBeNull();

    expect(getByTestId('input-edit-asset-name').props.value).toBe('MacBook Pro 16 inch M3 Max');
    expect(getByTestId('input-edit-asset-serial-number').props.value).toBe('C02G1234MD6R');
  });

  it('submits update request including asset.version and invokes onSuccess', async () => {
    const updatedAsset: AssetDetailResponse = {
      ...mockAsset,
      name: 'MacBook Pro 16 inch M3 Max Updated',
      status: 'MAINTENANCE',
      version: 4,
    };
    (assetApi.updateAsset as jest.Mock).mockResolvedValue(updatedAsset);

    const onSuccess = jest.fn();
    const onClose = jest.fn();

    const { rendered } = await renderModal({ onSuccess, onClose });
    const { getByTestId } = rendered;

    // Change name
    await act(async () => {
      fireEvent.changeText(getByTestId('input-edit-asset-name'), 'MacBook Pro 16 inch M3 Max Updated');
    });

    // Select MAINTENANCE status
    await act(async () => {
      fireEvent.press(getByTestId('status-chip-MAINTENANCE'));
    });

    // Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-edit-asset'));
    });

    await waitFor(() => {
      expect(assetApi.updateAsset).toHaveBeenCalledWith(
        '11111111-2222-3333-4444-555555555555',
        expect.objectContaining({
          name: 'MacBook Pro 16 inch M3 Max Updated',
          status: 'MAINTENANCE',
          version: 3, // optimistic locking version sent
        })
      );
      expect(onSuccess).toHaveBeenCalledWith(updatedAsset);
    });
  });

  it('handles 409 OPTIMISTIC_LOCK_CONFLICT by invoking onConflict', async () => {
    (assetApi.updateAsset as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          code: 'OPTIMISTIC_LOCK_CONFLICT',
          message: 'Data was updated by another user',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    });

    const onConflict = jest.fn();
    const { rendered } = await renderModal({ onConflict });
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-edit-asset'));
    });

    await waitFor(() => {
      expect(onConflict).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents status change when asset is ASSIGNED', async () => {
    const assignedAsset: AssetDetailResponse = {
      ...mockAsset,
      status: 'ASSIGNED',
    };

    const { rendered } = await renderModal({ asset: assignedAsset });
    const { queryByTestId, getByText } = rendered;

    // Status chips should be hidden and locked message displayed
    expect(queryByTestId('status-chip-AVAILABLE')).toBeNull();
    expect(queryByTestId('status-chip-MAINTENANCE')).toBeNull();
    expect(
      getByText('Tài sản đang được cấp phát cho nhân viên. Trạng thái không thể thay đổi tại đây.')
    ).toBeTruthy();
  });
});
