import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MoreScreen } from '../../src/features/more/screens/MoreScreen';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { AuthContext } from '../../src/app/auth/AuthProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

describe('MoreScreen Asset Entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMoreScreen = async (roles: string[] = ['EMPLOYEE'], permissions: string[] = []) => {
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
          <MoreScreen />
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  it('renders "Tài sản của tôi" button for regular employee and navigates to AssetList', async () => {
    const { getByTestId, getByText } = await renderMoreScreen(['EMPLOYEE'], []);

    expect(getByTestId('btn-navigate-assets')).toBeTruthy();
    expect(getByText('Tài sản của tôi')).toBeTruthy();

    fireEvent.press(getByTestId('btn-navigate-assets'));
    expect(mockNavigate).toHaveBeenCalledWith('AssetList');
  });

  it('renders "Quản lý tài sản" button for admin/manager with ASSET_READ/ASSET_MANAGE and navigates to AssetList', async () => {
    const { getByTestId, getByText } = await renderMoreScreen(['ADMIN'], ['ASSET_READ', 'ASSET_MANAGE']);

    expect(getByTestId('btn-navigate-assets')).toBeTruthy();
    expect(getByText('Quản lý tài sản')).toBeTruthy();

    fireEvent.press(getByTestId('btn-navigate-assets'));
    expect(mockNavigate).toHaveBeenCalledWith('AssetList');
  });
});
