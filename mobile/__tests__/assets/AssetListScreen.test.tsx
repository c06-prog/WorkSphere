import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AssetListScreen } from '../../src/features/assets/screens/AssetListScreen';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { AuthContext } from '../../src/app/auth/AuthProvider';
import { AssetSummaryResponse, AssetCategoryResponse } from '../../src/features/assets/types/assetTypes';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

const mockAsset: AssetSummaryResponse = {
  id: 'ast-uuid-001',
  assetCode: 'LAP-2026-001',
  name: 'MacBook Pro M3 Max',
  category: {
    id: 'cat-uuid-001',
    code: 'LAPTOP',
    name: 'Máy tính xách tay',
  },
  serialNumber: 'SN-APPLE-999',
  model: 'MBP 16',
  status: 'ASSIGNED',
  location: 'Tầng 4 - Phòng IT',
  currentAssignee: {
    id: 'usr-uuid-100',
    fullName: 'Nguyễn Văn A',
  },
  version: 1,
};

const mockAsset2: AssetSummaryResponse = {
  id: 'ast-uuid-002',
  assetCode: 'MON-2026-002',
  name: 'Dell UltraSharp 27',
  category: {
    id: 'cat-uuid-002',
    code: 'MONITOR',
    name: 'Màn hình',
  },
  serialNumber: 'SN-DELL-888',
  status: 'AVAILABLE',
  version: 1,
};

const mockCategories: AssetCategoryResponse[] = [
  { id: 'cat-uuid-001', code: 'LAPTOP', name: 'Máy tính xách tay', active: true },
  { id: 'cat-uuid-002', code: 'MONITOR', name: 'Màn hình', active: true },
];

describe('AssetListScreen (SCR-AST-01)', () => {
  const renderScreen = async (roles: string[] = ['EMPLOYEE'], permissions: string[] = []) => {
    const authContextValue: any = {
      currentUser: {
        id: 'usr-tester',
        fullName: 'Tester',
        email: 'tester@worksphere.local',
        roles,
        permissions,
      },
      sessionState: 'AUTHENTICATED',
      initialized: true,
      login: jest.fn(),
      logout: jest.fn(),
    };

    return await render(
      <ThemeProvider>
        <AuthContext.Provider value={authContextValue}>
          <AssetListScreen />
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (assetApi.listCategories as jest.Mock).mockResolvedValue(mockCategories);
    (assetApi.getMyAssets as jest.Mock).mockResolvedValue({
      items: [mockAsset],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    (assetApi.getAssets as jest.Mock).mockResolvedValue({
      items: [mockAsset, mockAsset2],
      page: 0,
      size: 20,
      totalItems: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
  });

  describe('Permission & Segmented Control Gating', () => {
    it('renders only "Của tôi" without segmented control for regular employee lacking ASSET_READ', async () => {
      const { queryByTestId, getByText, getByTestId } = await renderScreen(
        ['EMPLOYEE'],
        ['TASK_CREATE', 'SERVICE_REQUEST_CREATE']
      );

      await waitFor(() => {
        expect(getByTestId('asset-list-flatlist')).toBeTruthy();
      });

      // Segmented control tabs must NOT exist
      expect(queryByTestId('tab-my-assets')).toBeNull();
      expect(queryByTestId('tab-all-assets')).toBeNull();

      // Asset directory search must NOT exist
      expect(queryByTestId('asset-search-input')).toBeNull();

      // Verify asset from my-assets is rendered
      expect(getByText('MacBook Pro M3 Max')).toBeTruthy();
      expect(getByText('LAP-2026-001')).toBeTruthy();

      // Verify assetApi.getAssets was NOT called
      expect(assetApi.getAssets).not.toHaveBeenCalled();
      expect(assetApi.getMyAssets).toHaveBeenCalledTimes(1);
    });

    it('renders segmented control for user with ASSET_READ permission', async () => {
      const { getByTestId } = await renderScreen(
        ['PROJECT_MANAGER'],
        ['ASSET_READ']
      );

      await waitFor(() => {
        expect(getByTestId('tab-my-assets')).toBeTruthy();
        expect(getByTestId('tab-all-assets')).toBeTruthy();
      });

      expect(assetApi.getMyAssets).toHaveBeenCalledTimes(1);
      expect(assetApi.getAssets).not.toHaveBeenCalled();
    });

    it('renders segmented control for user with ADMIN role', async () => {
      const { getByTestId } = await renderScreen(
        ['ADMIN'],
        []
      );

      await waitFor(() => {
        expect(getByTestId('tab-my-assets')).toBeTruthy();
        expect(getByTestId('tab-all-assets')).toBeTruthy();
      });

      expect(assetApi.getMyAssets).toHaveBeenCalledTimes(1);
      expect(assetApi.getAssets).not.toHaveBeenCalled();
    });
  });

  describe('Mode Switching & Data Isolation', () => {
    it('switches to "Tất cả tài sản" and calls /assets without mixing data', async () => {
      const { getByTestId, getByText } = await renderScreen(
        ['ADMIN'],
        ['ASSET_READ']
      );

      await waitFor(() => {
        expect(getByTestId('tab-all-assets')).toBeTruthy();
      });

      // Switch tab to all-assets
      fireEvent.press(getByTestId('tab-all-assets'));

      await waitFor(() => {
        expect(assetApi.getAssets).toHaveBeenCalledTimes(1);
      });

      // Verify search input is now visible
      expect(getByTestId('asset-search-input')).toBeTruthy();

      // Verify both items from /assets appear
      expect(getByText('MacBook Pro M3 Max')).toBeTruthy();
      expect(getByText('Dell UltraSharp 27')).toBeTruthy();
    });
  });

  describe('Navigation & Identifier Safety', () => {
    it('navigates to AssetDetail with assetId (strictly UUID, not assetCode) on card press', async () => {
      const { getByTestId } = await renderScreen(
        ['EMPLOYEE'],
        []
      );

      await waitFor(() => {
        expect(getByTestId('asset-card-ast-uuid-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('asset-card-ast-uuid-001'));

      expect(mockNavigate).toHaveBeenCalledWith('AssetDetail', {
        assetId: 'ast-uuid-001',
      });
      expect(mockNavigate).not.toHaveBeenCalledWith(
        'AssetDetail',
        expect.objectContaining({ assetId: 'LAP-2026-001' })
      );
    });
  });

  describe('Empty and Error States', () => {
    it('renders empty state for my assets when user has zero assigned assets', async () => {
      (assetApi.getMyAssets as jest.Mock).mockResolvedValueOnce({
        items: [],
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      });

      const { getByTestId, getByText } = await renderScreen(
        ['EMPLOYEE'],
        []
      );

      await waitFor(() => {
        expect(getByTestId('empty-state-my-assets')).toBeTruthy();
        expect(getByText('Chưa có tài sản nào')).toBeTruthy();
      });
    });

    it('renders error state with retry button on initial load failure', async () => {
      (assetApi.getMyAssets as jest.Mock).mockRejectedValueOnce(
        new Error('Network disconnected')
      );

      const { getByTestId, getByText } = await renderScreen(
        ['EMPLOYEE'],
        []
      );

      await waitFor(() => {
        expect(getByTestId('initial-error')).toBeTruthy();
        expect(getByText('Thử lại')).toBeTruthy();
      });

      // Press retry
      (assetApi.getMyAssets as jest.Mock).mockResolvedValueOnce({
        items: [mockAsset],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

      fireEvent.press(getByText('Thử lại'));

      await waitFor(() => {
        expect(getByText('MacBook Pro M3 Max')).toBeTruthy();
      });
    });
  });
});
