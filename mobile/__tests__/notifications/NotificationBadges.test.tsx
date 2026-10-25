import React from 'react';
import { render } from '@testing-library/react-native';
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

describe('Dashboard and More Notification Badges (Phase 18C)', () => {
  const mockUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

  const mockRefreshCount = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
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

    mockUseAuth.mockReturnValue({
      currentUser: { id: 'user-1', permissions: [], roles: ['EMPLOYEE'] },
    } as any);
  });

  it('Dashboard bell shows no badge when unreadCount is 0', async () => {
    mockUseBadge.mockReturnValue({
      unreadCount: 0,
      isLoading: false,
      error: null,
      refreshUnreadCount: mockRefreshCount,
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });

    const { queryByTestId, getByTestId } = await render(
      <ThemeProvider>
        <DashboardScreen />
      </ThemeProvider>
    );

    expect(queryByTestId('badge-dashboard-notifications')).toBeNull();
    const bell = getByTestId('btn-dashboard-notifications');
    expect(bell.props.accessibilityLabel).toBe('Thông báo, không có thông báo chưa đọc');
    expect(mockRefreshCount).toHaveBeenCalled();
  });

  it('Dashboard bell shows exact count when 1 <= unreadCount <= 99', async () => {
    mockUseBadge.mockReturnValue({
      unreadCount: 5,
      isLoading: false,
      error: null,
      refreshUnreadCount: mockRefreshCount,
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <DashboardScreen />
      </ThemeProvider>
    );

    expect(getByTestId('badge-dashboard-notifications')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    const bell = getByTestId('btn-dashboard-notifications');
    expect(bell.props.accessibilityLabel).toBe('Thông báo, 5 thông báo chưa đọc');
  });

  it('Dashboard bell shows "99+" when unreadCount >= 100', async () => {
    mockUseBadge.mockReturnValue({
      unreadCount: 120,
      isLoading: false,
      error: null,
      refreshUnreadCount: mockRefreshCount,
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <DashboardScreen />
      </ThemeProvider>
    );

    expect(getByTestId('badge-dashboard-notifications')).toBeTruthy();
    expect(getByText('99+')).toBeTruthy();
  });

  it('More screen shows badge pill with count when unreadCount > 0 and hides when 0', async () => {
    mockUseBadge.mockReturnValue({
      unreadCount: 12,
      isLoading: false,
      error: null,
      refreshUnreadCount: mockRefreshCount,
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <MoreScreen />
      </ThemeProvider>
    );

    expect(getByTestId('badge-more-notifications')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(mockRefreshCount).toHaveBeenCalled();
  });
});
