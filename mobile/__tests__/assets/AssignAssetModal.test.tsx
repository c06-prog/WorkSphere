/**
 * Phase 17E: AssignAssetModal Unit Tests (SCR-AST-05)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AssignAssetModal } from '../../src/features/assets/components/AssignAssetModal';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { directoryApi } from '../../src/features/directory/api/directoryApi';
import { AssetAssignmentResponse, AssetDetailResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');
jest.mock('../../src/features/directory/api/directoryApi');

describe('AssignAssetModal (SCR-AST-05)', () => {
  const mockAsset: AssetDetailResponse = {
    id: 'ast-uuid-1111-2222',
    assetCode: 'AST-AVAILABLE-01',
    name: 'Dell XPS 15 9530',
    status: 'AVAILABLE',
    version: 1,
    repairHistories: [],
    relatedServiceRequests: [],
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockAssignmentResponse: AssetAssignmentResponse = {
    id: 'asg-uuid-9999',
    assetId: 'ast-uuid-1111-2222',
    assignedTo: 'tech-user-uuid-1',
    assignedBy: 'usr-admin-uuid',
    assignedAt: '2026-10-25T10:00:00Z',
    status: 'ACTIVE',
    version: 0,
  };

  const mockDirectoryUsers = {
    items: [
      {
        id: 'tech-user-uuid-1',
        username: 'nguyen.van.a',
        fullName: 'Nguyễn Văn A',
        email: 'a.nguyen@worksphere.local',
        status: 'ACTIVE',
        avatarUrl: null,
        departmentName: 'Phòng IT',
      },
    ],
    page: 0,
    size: 20,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (directoryApi.searchUsers as jest.Mock).mockResolvedValue(mockDirectoryUsers);
  });

  const renderModal = async (props: {
    visible?: boolean;
    asset?: AssetDetailResponse;
    onClose?: () => void;
    onSuccess?: (asg: AssetAssignmentResponse) => void;
    onConflict?: () => void;
  } = {}) => {
    const rendered = await render(
      <ThemeProvider>
        <AssignAssetModal
          visible={props.visible ?? true}
          asset={props.asset ?? mockAsset}
          onClose={props.onClose ?? jest.fn()}
          onSuccess={props.onSuccess ?? jest.fn()}
          onConflict={props.onConflict}
        />
      </ThemeProvider>
    );
    return { rendered };
  };

  it('renders modal structure and displays assetCode and name', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    expect(getByTestId('assign-asset-modal')).toBeTruthy();
    expect(getByText('Mã: AST-AVAILABLE-01 — Dell XPS 15 9530')).toBeTruthy();
    expect(getByTestId('btn-select-assignee')).toBeTruthy();
  });

  it('validates that assignee is required before submission', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-assign-asset'));
    });

    expect(getByText('Vui lòng chọn người nhận bàn giao')).toBeTruthy();
    expect(assetApi.assignAsset).not.toHaveBeenCalled();
  });

  it('submits assign request with User UUID, ISO return date, and without version', async () => {
    (assetApi.assignAsset as jest.Mock).mockResolvedValue(mockAssignmentResponse);
    const onSuccess = jest.fn();

    const { rendered } = await renderModal({ onSuccess });
    const { getByTestId, getByText } = rendered;

    // 1. Open User Picker Modal
    await act(async () => {
      fireEvent.press(getByTestId('btn-select-assignee'));
    });

    await waitFor(() => {
      expect(getByTestId('user-picker-item-nguyen.van.a')).toBeTruthy();
    });

    // 2. Select User Item and confirm
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-item-nguyen.van.a'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-confirm-btn'));
    });

    await waitFor(() => {
      expect(getByText('Nguyễn Văn A (a.nguyen@worksphere.local)')).toBeTruthy();
    });

    // 3. Fill optional return date and notes
    await act(async () => {
      fireEvent.changeText(
        getByTestId('input-assign-expected-return-date'),
        '2026-12-31'
      );
      fireEvent.changeText(
        getByTestId('input-assign-notes'),
        'Bàn giao nguyên seal'
      );
    });

    // 4. Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-assign-asset'));
    });

    await waitFor(() => {
      expect(assetApi.assignAsset).toHaveBeenCalledWith(
        'ast-uuid-1111-2222',
        {
          assignedTo: 'tech-user-uuid-1', // User UUID
          expectedReturnAt: '2026-12-31T17:00:00Z',
          notes: 'Bàn giao nguyên seal',
        }
      );
      // Verify Assign request DOES NOT send version
      const calledPayload = (assetApi.assignAsset as jest.Mock).mock.calls[0][1];
      expect(calledPayload).not.toHaveProperty('version');
      expect(onSuccess).toHaveBeenCalledWith(mockAssignmentResponse);
    });
  });

  it('enforces synchronous submit lock on double-press', async () => {
    let resolvePromise: (val: AssetAssignmentResponse) => void = () => {};
    (assetApi.assignAsset as jest.Mock).mockReturnValue(
      new Promise<AssetAssignmentResponse>(resolve => {
        resolvePromise = resolve;
      })
    );

    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    // Select user
    await act(async () => {
      fireEvent.press(getByTestId('btn-select-assignee'));
    });
    await waitFor(() => {
      expect(getByTestId('user-picker-item-nguyen.van.a')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-item-nguyen.van.a'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-confirm-btn'));
    });

    await waitFor(() => {
      expect(getByText('Nguyễn Văn A (a.nguyen@worksphere.local)')).toBeTruthy();
    });

    // Double press submit button
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-assign-asset'));
      fireEvent.press(getByTestId('btn-submit-assign-asset'));
    });

    expect(assetApi.assignAsset).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePromise(mockAssignmentResponse);
    });
  });

  it('displays presentation-safe error when backend returns ASSET_ALREADY_ASSIGNED', async () => {
    (assetApi.assignAsset as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          success: false,
          code: 'ASSET_ALREADY_ASSIGNED',
          message: 'Asset already assigned',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    });

    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    // Select user
    await act(async () => {
      fireEvent.press(getByTestId('btn-select-assignee'));
    });
    await waitFor(() => {
      expect(getByTestId('user-picker-item-nguyen.van.a')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-item-nguyen.van.a'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('user-picker-confirm-btn'));
    });

    await waitFor(() => {
      expect(getByText('Nguyễn Văn A (a.nguyen@worksphere.local)')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-assign-asset'));
    });

    await waitFor(() => {
      expect(
        getByText('Tài sản đã được cấp phát cho người dùng khác')
      ).toBeTruthy();
    });
  });
});
