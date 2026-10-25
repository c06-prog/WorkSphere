import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { useNotificationBadge } from '../../notifications';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { AppButton } from '../../../shared/components/AppButton';
import type { MainTabNavProp } from '../../../app/navigation/types';

export function MoreScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'More'>>();
  const { currentUser } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotificationBadge();

  // Focus effect: Refresh unread badge
  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount().catch(() => {});
    }, [refreshUnreadCount])
  );

  const badgeText = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null;
  const notificationAccessibilityLabel =
    unreadCount > 0
      ? `Xem danh sách thông báo, ${unreadCount} thông báo chưa đọc`
      : 'Xem danh sách thông báo, không có thông báo chưa đọc';

  const hasAssetManageOrRead =
    (currentUser?.permissions?.includes('ASSET_READ') ?? false) ||
    (currentUser?.permissions?.includes('ASSET_MANAGE') ?? false) ||
    (currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false);

  const assetButtonTitle = hasAssetManageOrRead
    ? 'Quản lý tài sản'
    : 'Tài sản của tôi';

  return (
    <PlaceholderScreen
      title="More"
      screenId="SCR-MAIN-03"
      subtitle="SCR-MAIN-03: More Menu Screen (Phase 12 Shell)"
      testID="screen-more"
    >
      <View style={styles.actionContainer}>
        {/* Notification Button with Pill Badge */}
        <Pressable
          onPress={() => navigation.navigate('NotificationList')}
          accessibilityRole="button"
          accessibilityLabel={notificationAccessibilityLabel}
          testID="btn-navigate-notifications"
          style={[
            styles.notificationRowButton,
            styles.buttonSpacing,
            {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <Text style={[theme.typography.label, styles.notificationButtonText, { color: theme.colors.primary }]}>
            Thông báo
          </Text>
          {badgeText && (
            <View
              style={[styles.badgePill, { backgroundColor: theme.colors.error }]}
              testID="badge-more-notifications"
            >
              <Text style={[styles.badgePillText, { color: theme.colors.onError }]}>
                {badgeText}
              </Text>
            </View>
          )}
        </Pressable>

        <AppButton
          title={assetButtonTitle}
          variant="outline"
          onPress={() => navigation.navigate('AssetList')}
          accessibilityLabel={`Xem ${assetButtonTitle.toLowerCase()}`}
          testID="btn-navigate-assets"
          style={styles.buttonSpacing}
        />
        <AppButton
          title="Hồ sơ cá nhân"
          variant="outline"
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Xem hồ sơ cá nhân"
          testID="btn-navigate-profile"
          style={styles.buttonSpacing}
        />
        <AppButton
          title="Cài đặt ứng dụng"
          variant="outline"
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Xem cài đặt ứng dụng"
          testID="btn-navigate-settings"
        />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: 16,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  notificationRowButton: {
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  notificationButtonText: {
    fontWeight: '600',
  },
  badgePill: {
    position: 'absolute',
    right: 16,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
