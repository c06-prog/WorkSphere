/**
 * Phase 17E: ReturnAssetModal Unit Tests (SCR-AST-06)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ReturnAssetModal } from '../../src/features/assets/components/ReturnAssetModal';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { AssetAssignmentResponse, AssetDetailResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');

describe('ReturnAssetModal (SCR-AST-06)', () => {
  const mockAssignedAsset: AssetDetailResponse = {
    id: 'ast-uuid-assigned-1111',
    assetCode: 'AST-ASSIGNED-01',
    name: 'MacBook Pro 16" M3',
    status: 'ASSIGNED',
    version: 4, // Asset.version
    currentAssignment: {
      id: 'asg-uuid-active-5555',
      assignedTo: {
        id: 'usr-employee-uuid',
        fullName: 'Trần Nhân Viên',
      },
      assignedBy: {
        id: 'usr-admin-uuid',
        fullName: 'Quản Trị Viên',
      },
      assignedAt: '2026-02-01T08:00:00Z',
      expectedReturnAt: '2026-12-31T17:00:00Z',
      notes: 'Máy và sạc zin',
    },
    repairHistories: [],
    relatedServiceRequests: [],
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockReturnedResponse: AssetAssignmentResponse = {
    id: 'asg-uuid-active-5555',
    assetId: 'ast-uuid-assigned-1111',
    assignedTo: 'usr-employee-uuid',
    assignedBy: 'usr-admin-uuid',
    assignedAt: '2026-02-01T08:00:00Z',
    returnedAt: '2026-10-25T11:00:00Z',
    returnCondition: 'Máy hoạt động tốt, không trầy xước',
    status: 'RETURNED',
    version: 1, // AssetAssignment.version
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = async (props: {
    visible?: boolean;
    asset?: AssetDetailResponse;
    assignmentVersion?: number;
    onClose?: () => void;
    onSuccess?: (res: AssetAssignmentResponse) => void;
    onConflict?: () => void;
  } = {}) => {
    const rendered = await render(
      <ThemeProvider>
        <ReturnAssetModal
          visible={props.visible ?? true}
          asset={props.asset ?? mockAssignedAsset}
          assignmentVersion={props.assignmentVersion ?? 0}
          onClose={props.onClose ?? jest.fn()}
          onSuccess={props.onSuccess ?? jest.fn()}
          onConflict={props.onConflict}
        />
      </ThemeProvider>
    );
    return { rendered };
  };

  it('renders modal with active assignee name and allowed resulting status options', async () => {
    const { rendered } = await renderModal();
    const { getByTestId, getByText, queryByTestId } = rendered;

    expect(getByTestId('return-asset-modal')).toBeTruthy();
    expect(getByText('Mã: AST-ASSIGNED-01 — MacBook Pro 16" M3')).toBeTruthy();
    expect(getByText('Trần Nhân Viên')).toBeTruthy();

    // Verify allowed resulting statuses are present
    expect(getByTestId('status-option-AVAILABLE')).toBeTruthy();
    expect(getByTestId('status-option-MAINTENANCE')).toBeTruthy();
    expect(getByTestId('status-option-BROKEN')).toBeTruthy();
    expect(getByTestId('status-option-RETIRED')).toBeTruthy();

    // Invariant: ASSIGNED is NOT an allowed resulting status
    expect(queryByTestId('status-option-ASSIGNED')).toBeNull();
  });

  it('submits return request with assetId, active assignmentId, Assignment.version, and resultingStatus', async () => {
    (assetApi.returnAsset as jest.Mock).mockResolvedValue(mockReturnedResponse);
    const onSuccess = jest.fn();

    const { rendered } = await renderModal({
      assignmentVersion: 0,
      onSuccess,
    });
    const { getByTestId } = rendered;

    // Change resulting status to MAINTENANCE
    await act(async () => {
      fireEvent.press(getByTestId('status-option-MAINTENANCE'));
    });

    // Fill return condition
    await act(async () => {
      fireEvent.changeText(
        getByTestId('input-return-condition'),
        'Cần bảo trì vệ sinh bụi và tra keo tản nhiệt'
      );
    });

    // Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-return-asset'));
    });

    await waitFor(() => {
      expect(assetApi.returnAsset).toHaveBeenCalledWith(
        'ast-uuid-assigned-1111', // assetId UUID (not assetCode)
        'asg-uuid-active-5555',   // active assignmentId UUID (not assignedTo user)
        {
          resultingAssetStatus: 'MAINTENANCE',
          returnCondition: 'Cần bảo trì vệ sinh bụi và tra keo tản nhiệt',
          version: 0,             // AssetAssignment.version (not Asset.version: 4)
        }
      );
      expect(onSuccess).toHaveBeenCalledWith(mockReturnedResponse);
    });
  });

  it('enforces synchronous submit lock on double-press', async () => {
    let resolvePromise: (val: AssetAssignmentResponse) => void = () => {};
    (assetApi.returnAsset as jest.Mock).mockReturnValue(
      new Promise<AssetAssignmentResponse>(resolve => {
        resolvePromise = resolve;
      })
    );

    const { rendered } = await renderModal();
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-return-asset'));
      fireEvent.press(getByTestId('btn-submit-return-asset'));
    });

    expect(assetApi.returnAsset).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePromise(mockReturnedResponse);
    });
  });

  it('triggers onConflict on HTTP 409 conflict without automatic stale mutation retry', async () => {
    (assetApi.returnAsset as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          code: 'OPTIMISTIC_LOCK_CONFLICT',
          message: 'Assignment was modified by another transaction',
          timestamp: '2026-10-25T11:00:00Z',
        },
      },
    });

    const onConflict = jest.fn();
    const { rendered } = await renderModal({ onConflict });
    const { getByTestId } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-return-asset'));
    });

    await waitFor(() => {
      expect(onConflict).toHaveBeenCalledTimes(1);
    });

    // Invariant: no automatic retry after 409
    expect(assetApi.returnAsset).toHaveBeenCalledTimes(1);
  });

  it('displays presentation-safe error when assignment is not active', async () => {
    (assetApi.returnAsset as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          success: false,
          code: 'ASSET_ASSIGNMENT_NOT_ACTIVE',
          message: 'Assignment not active',
          timestamp: '2026-10-25T11:00:00Z',
        },
      },
    });

    const { rendered } = await renderModal();
    const { getByTestId, getByText } = rendered;

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-return-asset'));
    });

    await waitFor(() => {
      expect(
        getByText('Phân công không ở trạng thái hoạt động')
      ).toBeTruthy();
    });
  });
});
