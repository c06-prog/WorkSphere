import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { AppButton } from '../../../shared/components/AppButton';
import type { MainTabNavProp } from '../../../app/navigation/types';

export function MoreScreen() {
  const navigation = useNavigation<MainTabNavProp<'More'>>();
  const { currentUser } = useAuth();

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
        <AppButton
          title="Thông báo"
          variant="outline"
          onPress={() => navigation.navigate('NotificationList')}
          accessibilityLabel="Xem danh sách thông báo"
          testID="btn-navigate-notifications"
          style={styles.buttonSpacing}
        />
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
});
