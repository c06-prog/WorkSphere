/**
 * Phase 17E: Integration Test for Asset Navigation Flow
 * Verifies runtime navigator resolution:
 * More -> AssetList -> AssetDetail -> CreateServiceRequest (with assetId parameter)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AppRoot } from '../../src/app/AppRoot';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { authApi } from '../../src/features/auth/api/authApi';
import { secureStorage } from '../../src/shared/storage/secureStorage';
import { AssetDetailResponse, AssetSummaryResponse } from '../../src/features/assets/types/assetTypes';
import { PagedData } from '../../src/shared/api';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');
jest.mock('../../src/features/auth/api/authApi');
jest.mock('../../src/shared/storage/secureStorage');

describe('Phase 17E Navigator Runtime Integration: AssetDetail -> CreateServiceRequest', () => {
  const mockAssetSummary: AssetSummaryResponse = {
    id: '11111111-2222-3333-4444-555555555555',
    assetCode: 'AST-TEST-FLOW-01',
    name: 'Thiết bị Kiểm thử Điều hướng',
    category: {
      id: 'cat-01',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
    },
    status: 'AVAILABLE',
    version: 1,
  };

  const mockPagedAssets: PagedData<AssetSummaryResponse> = {
    items: [mockAssetSummary],
    page: 0,
    size: 20,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  const mockAssetDetail: AssetDetailResponse = {
    id: '11111111-2222-3333-4444-555555555555',
    assetCode: 'AST-TEST-FLOW-01',
    name: 'Thiết bị Kiểm thử Điều hướng',
    category: {
      id: 'cat-01',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
    },
    status: 'AVAILABLE',
    version: 1,
    repairHistories: [],
    relatedServiceRequests: [],
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('mock-refresh-token');
    (authApi.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'usr-admin-01',
      username: 'admin',
      fullName: 'Quản trị viên',
      email: 'admin@worksphere.local',
      roles: ['ADMIN'],
      permissions: ['ASSET_MANAGE', 'SERVICE_REQUEST_CREATE'],
    });
    (assetApi.listCategories as jest.Mock).mockResolvedValue([]);
    (assetApi.getMyAssets as jest.Mock).mockResolvedValue(mockPagedAssets);
    (assetApi.getAssets as jest.Mock).mockResolvedValue(mockPagedAssets);
    (assetApi.getAssetDetail as jest.Mock).mockResolvedValue(mockAssetDetail);
  });

  it('navigates from More -> AssetList -> AssetDetail and dispatches to CreateServiceRequest with route params', async () => {
    const { getByTestId, getByLabelText, findByTestId, getByText } = await render(
      <AppRoot
        sessionState="AUTHENTICATED"
        initialAuthState={{
          sessionState: 'AUTHENTICATED',
          currentUser: {
            id: 'usr-admin-01',
            username: 'admin',
            fullName: 'Quản trị viên',
            email: 'admin@worksphere.local',
            roles: ['ADMIN'],
            permissions: ['ASSET_MANAGE', 'SERVICE_REQUEST_CREATE'],
          },
          initialized: true,
        }}
      />
    );

    // 1. More Tab
    await act(async () => {
      fireEvent.press(getByLabelText('Tab 5: Thêm'));
    });
    await waitFor(() => {
      expect(getByTestId('screen-more')).toBeTruthy();
      expect(getByTestId('btn-navigate-assets')).toBeTruthy();
    });

    // 2. Open AssetList
    await act(async () => {
      fireEvent.press(getByTestId('btn-navigate-assets'));
    });

    const assetListFlatlist = await findByTestId('asset-list-flatlist');
    expect(assetListFlatlist).toBeTruthy();

    // 3. Open AssetDetail
    await waitFor(() => {
      expect(getByText('AST-TEST-FLOW-01')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('asset-card-11111111-2222-3333-4444-555555555555'));
    });

    const assetDetailScreen = await findByTestId('asset-detail-screen');
    expect(assetDetailScreen).toBeTruthy();

    // 4. Press "Báo hỏng / Yêu cầu dịch vụ" CTA
    await waitFor(() => {
      expect(getByTestId('btn-asset-report-fault')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('btn-asset-report-fault'));
    });

    // 5. Verifies Destination Screen renders (SCR-SRV-04)
    const createServiceRequestScreen = await findByTestId('screen-create-service-request');
    expect(createServiceRequestScreen).toBeTruthy();
    expect(getByTestId('create-service-request-asset-info')).toBeTruthy();
  });
});
