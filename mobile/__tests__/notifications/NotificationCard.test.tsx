import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationCard } from '../../src/features/notifications/components/NotificationCard';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

describe('NotificationCard Component', () => {
  const FIXED_NOW = new Date('2026-10-25T19:00:00.000Z').getTime();

  const sampleUnread: NotificationResponse = {
    id: 'notif-101',
    type: 'TASK_ASSIGNED',
    title: 'Phân công nhiệm vụ mới',
    message: 'Bạn được giao hoàn thành tính năng Notification Center.',
    referenceType: 'TASK',
    referenceId: 'task-101',
    read: false,
    createdAt: new Date(FIXED_NOW - 10 * 60 * 1000).toISOString(), // 10 mins ago
  };

  const sampleRead: NotificationResponse = {
    ...sampleUnread,
    id: 'notif-102',
    read: true,
  };

  it('renders title, message, and relative timestamp correctly', async () => {
    const { getByText, getByTestId } = await render(
      <ThemeProvider>
        <NotificationCard notification={sampleUnread} referenceNowMs={FIXED_NOW} />
      </ThemeProvider>
    );

    expect(getByText('Phân công nhiệm vụ mới')).toBeTruthy();
    expect(getByText('Bạn được giao hoàn thành tính năng Notification Center.')).toBeTruthy();
    expect(getByText('10 phút trước')).toBeTruthy();
    expect(getByTestId('notification-unread-dot')).toBeTruthy();
  });

  it('does NOT render unread dot for read notifications', async () => {
    const { queryByTestId } = await render(
      <ThemeProvider>
        <NotificationCard notification={sampleRead} referenceNowMs={FIXED_NOW} />
      </ThemeProvider>
    );

    expect(queryByTestId('notification-unread-dot')).toBeNull();
  });

  it('calls onPress callback with notification object', async () => {
    const mockPress = jest.fn();
    const { getByTestId } = await render(
      <ThemeProvider>
        <NotificationCard
          notification={sampleUnread}
          onPress={mockPress}
          referenceNowMs={FIXED_NOW}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('notification-card-notif-101'));
    expect(mockPress).toHaveBeenCalledWith(sampleUnread);
  });
});
