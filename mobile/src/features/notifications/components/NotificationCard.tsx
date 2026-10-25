/**
 * Phase 18B: Notification Card Component
 * Presentation card rendering a single notification item for SCR-NOT-01 (NotificationListScreen).
 *
 * Invariants:
 * - Displays title, message, relative timestamp, and unread visual indicator (non-color dot + typography weight).
 * - Never leaks internal recipient IDs, database keys, or raw stack traces.
 * - Long text is gracefully handled with wrapping and clear lines.
 * - Touch targets >= 48dp, accessibility role and labels.
 * - In Phase 18B: onPress invokes callback with notification (deep-linking and mark-read mutation deferred to 18C/18D).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { NotificationResponse } from '../types/notificationTypes';
import { formatRelativeTime } from '../utils/notificationDate';

export interface NotificationCardProps {
  notification: NotificationResponse;
  onPress?: (notification: NotificationResponse) => void;
  isMarkingRead?: boolean;
  testID?: string;
  referenceNowMs?: number;
}

export function NotificationCard({
  notification,
  onPress,
  isMarkingRead = false,
  testID,
  referenceNowMs,
}: NotificationCardProps) {
  const theme = useAppTheme();

  const isUnread = !notification.read;
  const timeText = formatRelativeTime(notification.createdAt, referenceNowMs);

  const accessibleLabel = [
    isUnread ? 'Chưa đọc' : 'Đã đọc',
    isMarkingRead ? 'Đang đánh dấu đã đọc' : '',
    `Tiêu đề: ${notification.title}`,
    `Nội dung: ${notification.message}`,
    `Thời gian: ${timeText}`,
  ]
    .filter(Boolean)
    .join(', ');

  const handlePress = () => {
    if (onPress && !isMarkingRead) {
      onPress(notification);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isMarkingRead}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      accessibilityState={{ selected: isUnread, disabled: isMarkingRead }}
      testID={testID ?? `notification-card-${notification.id}`}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isUnread
            ? theme.colors.surfaceVariant ?? '#F0F4F8'
            : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.medium,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          opacity: pressed ? 0.85 : isMarkingRead ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Unread indicator dot */}
        <View style={styles.indicatorContainer}>
          {isUnread ? (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.colors.primary },
              ]}
              testID="notification-unread-dot"
            />
          ) : (
            <View style={styles.readPlaceholder} />
          )}
        </View>

        {/* Text Body */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                theme.typography.body,
                styles.titleText,
                isUnread ? styles.titleUnread : styles.titleRead,
                { color: theme.colors.textPrimary },
              ]}
              numberOfLines={2}
              testID="notification-title"
            >
              {notification.title}
            </Text>
          </View>

          <Text
            style={[
              theme.typography.caption,
              styles.messageText,
              isUnread ? styles.messageUnread : styles.messageRead,
              { color: isUnread ? theme.colors.textPrimary : theme.colors.textSecondary },
            ]}
            numberOfLines={3}
            testID="notification-message"
          >
            {notification.message}
          </Text>

          <Text
            style={[
              theme.typography.caption,
              styles.timeText,
              { color: theme.colors.textSecondary },
            ]}
            testID="notification-time"
          >
            {timeText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    minHeight: 64,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorContainer: {
    width: 16,
    paddingTop: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readPlaceholder: {
    width: 8,
    height: 8,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  titleRead: {
    fontWeight: '500',
  },
  messageText: {
    lineHeight: 18,
    marginBottom: 6,
  },
  messageUnread: {
    fontWeight: '500',
  },
  messageRead: {
    fontWeight: '400',
  },
  timeText: {
    fontSize: 12,
  },
});
