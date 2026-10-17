import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../app/providers/ThemeProvider';

export type StatusCategory = 'project' | 'task' | 'serviceRequest' | 'generic';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  type?: StatusCategory;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const CANONICAL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PLANNED: 'Kế hoạch',
  OPEN: 'Mở',
  ACTIVE: 'Đang thực hiện',
  IN_PROGRESS: 'Đang xử lý',
  DONE: 'Đã hoàn thành',
  RESOLVED: 'Đã giải quyết',
  ON_HOLD: 'Tạm dừng',
  WAITING: 'Đang chờ',
  WAITING_FOR_USER: 'Chờ phản hồi',
  PENDING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
};

export function StatusBadge({
  status,
  label,
  testID,
  style,
}: StatusBadgeProps) {
  const theme = useAppTheme();
  const normalized = status.toUpperCase().trim();

  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (normalized) {
      case 'DRAFT':
      case 'PLANNED':
      case 'OPEN':
        return {
          bg: theme.colors.infoContainer,
          text: theme.colors.info,
          border: theme.colors.info,
        };
      case 'ACTIVE':
      case 'IN_PROGRESS':
      case 'DONE':
      case 'RESOLVED':
        return {
          bg: theme.colors.successContainer,
          text: theme.colors.success,
          border: theme.colors.success,
        };
      case 'ON_HOLD':
      case 'WAITING':
      case 'WAITING_FOR_USER':
      case 'PENDING':
        return {
          bg: theme.colors.warningContainer,
          text: theme.colors.warning,
          border: theme.colors.warning,
        };
      case 'COMPLETED':
      case 'CLOSED':
        return {
          bg: theme.colors.successContainer,
          text: '#047857',
          border: '#047857',
        };
      case 'CANCELLED':
      case 'REJECTED':
        return {
          bg: theme.colors.errorContainer,
          text: theme.colors.error,
          border: theme.colors.error,
        };
      default:
        return {
          bg: theme.colors.surfaceVariant,
          text: theme.colors.textSecondary,
          border: theme.colors.border,
        };
    }
  };

  const colors = getBadgeColors();
  const displayLabel = label ?? CANONICAL_STATUS_LABELS[normalized] ?? status;

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderRadius: theme.radii.small,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xxs,
        },
        style,
      ]}
      testID={testID ?? `status-badge-${normalized.toLowerCase()}`}
      accessibilityLabel={`Trạng thái: ${displayLabel}`}
    >
      <Text
        style={[
          theme.typography.caption,
          styles.badgeText,
          { color: colors.text },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '500',
  },
});
