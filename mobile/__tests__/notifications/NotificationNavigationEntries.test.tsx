import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DashboardScreen } from '../../src/features/dashboard/screens/DashboardScreen';
import { MoreScreen } from '../../src/features/more/screens/MoreScreen';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { useDashboard } from '../../src/features/dashboard/hooks/useDashboard';
import { useAuth } from '../../src/app/auth/AuthProvider';
import { useNotificationBadge } from '../../src/features/notifications/context/NotificationBadgeContext';

jest.mock('../../src/features/dashboard/hooks/useDashboard');
jest.mock('../../src/app/auth/AuthProvider');
jest.mock('../../src/features/notifications/context/NotificationBadgeContext');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

describe('Notification Navigation Entry Points', () => {
  const mockUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBadge.mockReturnValue({
      unreadCount: 0,
      isLoading: false,
      error: null,
      refreshUnreadCount: jest.fn().mockResolvedValue(undefined),
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });
  });

  it('Dashboard bell button navigates to NotificationList', async () => {
    mockUseDashboard.mockReturnValue({
      data: {
        tasks: { completed: 1, inProgress: 2, pending: 3 },
        projects: { total: 2, onTrack: 2 },
        serviceRequests: { open: 1, inProgress: 1 },
        upcomingTasks: [],
        recentNotifications: [],
      },
      initialLoading: false,
      refreshing: false,
      error: null,
      refreshError: null,
      load: jest.fn(),
      refresh: jest.fn(),
    } as any);

    const { getByTestId } = await render(
      <ThemeProvider>
        <DashboardScreen />
      </ThemeProvider>
    );

    const bellBtn = getByTestId('btn-dashboard-notifications');
    expect(bellBtn).toBeTruthy();

    fireEvent.press(bellBtn);
    expect(mockNavigate).toHaveBeenCalledWith('NotificationList');
  });

  it('More screen "Thông báo" button navigates to NotificationList', async () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        id: 'user-1',
        permissions: [],
        roles: ['EMPLOYEE'],
      },
    } as any);

    const { getByTestId } = await render(
      <ThemeProvider>
        <MoreScreen />
      </ThemeProvider>
    );

    const moreBtn = getByTestId('btn-navigate-notifications');
    expect(moreBtn).toBeTruthy();

    fireEvent.press(moreBtn);
    expect(mockNavigate).toHaveBeenCalledWith('NotificationList');
  });
});
