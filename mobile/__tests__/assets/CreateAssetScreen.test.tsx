import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CreateAssetScreen } from '../../src/features/assets/screens/CreateAssetScreen';
import { AuthContext } from '../../src/app/auth/AuthProvider';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/assets/api/assetApi');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

describe('CreateAssetScreen (SCR-AST-03)', () => {
  const mockCategories = [
    {
      id: 'cat-uuid-1',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
      description: 'Dành cho nhân viên',
      active: true,
    },
    {
      id: 'cat-uuid-2',
      code: 'MONITOR',
      name: 'Màn hình ngoài',
      description: 'Màn hình máy tính',
      active: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (assetApi.listCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  const renderScreen = async (currentUserOverride?: any) => {
    const authContextValue: any = {
      currentUser: currentUserOverride ?? {
        id: 'usr-admin',
        fullName: 'System Administrator',
        roles: ['ADMIN'],
        permissions: ['ASSET_MANAGE'],
      },
      tokens: { accessToken: 'token-xyz', refreshToken: 'refresh-xyz' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
      sessionState: 'AUTHENTICATED',
    };

    return await render(
      <AuthContext.Provider value={authContextValue}>
        <ThemeProvider>
          <CreateAssetScreen />
        </ThemeProvider>
      </AuthContext.Provider>
    );
  };

  it('fails closed and renders forbidden state when user lacks ASSET_MANAGE or ADMIN', async () => {
    const { getByTestId, queryByTestId, getByText } = await renderScreen({
      id: 'usr-employee',
      fullName: 'Employee One',
      roles: ['EMPLOYEE'],
      permissions: ['ASSET_READ'],
    });

    expect(getByTestId('create-asset-unauthorized')).toBeTruthy();
    expect(getByText('Bạn cần quyền ASSET_MANAGE hoặc vai trò Quản trị viên để tạo tài sản mới.')).toBeTruthy();
    expect(queryByTestId('create-asset-screen')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('btn-create-asset-unauthorized-back'));
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders form when user has ASSET_MANAGE permission', async () => {
    const { getByTestId } = await renderScreen({
      id: 'usr-manager',
      fullName: 'Asset Manager',
      roles: ['EMPLOYEE'],
      permissions: ['ASSET_MANAGE'],
    });

    expect(getByTestId('create-asset-screen')).toBeTruthy();
    expect(getByTestId('input-asset-code')).toBeTruthy();
    expect(getByTestId('input-asset-name')).toBeTruthy();
    expect(getByTestId('btn-select-asset-category')).toBeTruthy();
    expect(getByTestId('btn-submit-create-asset')).toBeTruthy();
  });

  it('renders form when user has ADMIN role', async () => {
    const { getByTestId } = await renderScreen({
      id: 'usr-admin',
      fullName: 'System Administrator',
      roles: ['ADMIN'],
      permissions: [],
    });

    expect(getByTestId('create-asset-screen')).toBeTruthy();
  });

  it('validates required fields: assetCode, categoryId, and name', async () => {
    const { getByTestId, getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-asset'));
    });

    await waitFor(() => {
      expect(getByText('Mã tài sản không được để trống')).toBeTruthy();
      expect(getByText('Loại tài sản không được để trống')).toBeTruthy();
      expect(getByText('Tên tài sản không được để trống')).toBeTruthy();
    });

    expect(assetApi.createAsset).not.toHaveBeenCalled();
  });

  it('validates assetCode regex pattern and length', async () => {
    const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

    const codeInput = getByPlaceholderText('VD: LAP-2026-001');
    await act(async () => {
      fireEvent.changeText(codeInput, 'laptop@#$');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-asset'));
    });

    await waitFor(() => {
      expect(
        getByText('Mã tài sản phải bắt đầu bằng chữ hoa hoặc số, chỉ chứa chữ hoa, số, gạch ngang và gạch dưới')
      ).toBeTruthy();
    });

    expect(assetApi.createAsset).not.toHaveBeenCalled();
  });

  it('validates date format YYYY-MM-DD and price >= 0', async () => {
    const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

    const dateInput = getByPlaceholderText('2026-01-15');
    const priceInput = getByPlaceholderText('VD: 55000000');

    await act(async () => {
      fireEvent.changeText(dateInput, '2026/10/25');
      fireEvent.changeText(priceInput, '-5000');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-asset'));
    });

    await waitFor(() => {
      expect(getByText('Ngày mua phải có định dạng YYYY-MM-DD')).toBeTruthy();
      expect(getByText('Giá mua phải là số không âm')).toBeTruthy();
    });

    expect(assetApi.createAsset).not.toHaveBeenCalled();
  });

  it('selects category from AssetCategorySelectModal', async () => {
    const { getByTestId, getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByTestId('btn-select-asset-category'));
    });

    await waitFor(() => {
      expect(getByTestId('asset-category-option-cat-uuid-1')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('asset-category-option-cat-uuid-1'));
    });

    await waitFor(() => {
      expect(
        getByTestId('asset-category-option-cat-uuid-1').props.accessibilityState.selected
      ).toBe(true);
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-asset-category'));
    });

    await waitFor(() => {
      expect(getByText('[LAPTOP] Máy tính xách tay')).toBeTruthy();
    });
  });

  it('successfully creates asset and navigates to AssetDetail passing assetId', async () => {
    const createdAsset = {
      id: 'created-uuid-999',
      assetCode: 'AST-2026-009',
      name: 'Dell XPS 15 9530',
      status: 'AVAILABLE',
      category: mockCategories[0],
    };
    (assetApi.createAsset as jest.Mock).mockResolvedValue(createdAsset);

    const { getByTestId, getByPlaceholderText } = await renderScreen();

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('VD: LAP-2026-001'), 'AST-2026-009');
      fireEvent.changeText(getByPlaceholderText('VD: MacBook Pro 16 inch M3 Max'), 'Dell XPS 15 9530');
    });

    // Select category
    await act(async () => {
      fireEvent.press(getByTestId('btn-select-asset-category'));
    });
    await waitFor(() => {
      expect(getByTestId('asset-category-option-cat-uuid-1')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('asset-category-option-cat-uuid-1'));
    });
    await waitFor(() => {
      expect(
        getByTestId('asset-category-option-cat-uuid-1').props.accessibilityState.selected
      ).toBe(true);
    });
    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-asset-category'));
    });

    // Optional fields
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('VD: C02G1234MD6R'), 'SN987654321');
      fireEvent.changeText(getByPlaceholderText('VD: Apple'), 'Dell');
      fireEvent.changeText(getByPlaceholderText('VD: MacBook Pro 16'), 'XPS 15');
      fireEvent.changeText(getByPlaceholderText('VD: Tầng 4 - Kho IT'), 'Kho IT - Kệ A3');
      fireEvent.changeText(getByPlaceholderText('2026-01-15'), '2026-01-10');
      fireEvent.changeText(getByPlaceholderText('VD: 55000000'), '45000000');
      fireEvent.changeText(getByPlaceholderText('2028-01-15'), '2029-01-10');
    });

    // Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-asset'));
    });

    await waitFor(() => {
      expect(assetApi.createAsset).toHaveBeenCalledWith({
        assetCode: 'AST-2026-009',
        categoryId: 'cat-uuid-1',
        name: 'Dell XPS 15 9530',
        serialNumber: 'SN987654321',
        manufacturer: 'Dell',
        model: 'XPS 15',
        location: 'Kho IT - Kệ A3',
        purchaseDate: '2026-01-10',
        purchasePrice: 45000000,
        warrantyEndDate: '2029-01-10',
        description: undefined,
      });
      expect(mockNavigate).toHaveBeenCalledWith('AssetDetail', {
        assetId: 'created-uuid-999',
      });
    });
  });

  it('displays backend conflict error on duplicate assetCode', async () => {
    (assetApi.createAsset as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          code: 'ASSET_CODE_ALREADY_EXISTS',
          message: 'Asset code already exists',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    });

    const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('VD: LAP-2026-001'), 'AST-DUPLICATE');
      fireEvent.changeText(getByPlaceholderText('VD: MacBook Pro 16 inch M3 Max'), 'Device Name');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-select-asset-category'));
    });
    await waitFor(() => {
      expect(getByTestId('asset-category-option-cat-uuid-1')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(getByTestId('asset-category-option-cat-uuid-1'));
    });
    await waitFor(() => {
      expect(
        getByTestId('asset-category-option-cat-uuid-1').props.accessibilityState.selected
      ).toBe(true);
    });
    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-asset-category'));
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-asset'));
    });

    await waitFor(() => {
      expect(
        getByText('Mã tài sản đã tồn tại trong hệ thống')
      ).toBeTruthy();
    });
  });
});
