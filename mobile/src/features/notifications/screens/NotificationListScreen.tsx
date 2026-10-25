/**
 * Phase 18B: Notification List Screen (SCR-NOT-01)
 * Displays user notifications with two modes:
 * 1. "Tất cả": Lists all notifications (read=undefined).
 * 2. "Chưa đọc": Lists only unread notifications (read=false).
 *
 * Implements:
 * - Segmented control filter tabs ("Tất cả", "Chưa đọc").
 * - FlatList with pull-to-refresh and infinite scroll pagination.
 * - LoadingIndicator for initial fetch, EmptyState for empty results, ErrorState for failures.
 * - Presentation card NotificationCard for individual rows.
 * - Safe Area insets and back button for AppStack navigation.
 * - Touch targets >= 48dp, accessible headers and semantics.
 *
 * Exclusions:
 * - Mark read / Mark all read mutation UI is deferred to Phase 18C.
 * - Context deep-link navigation is deferred to Phase 18D.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppStackNavProp } from '../../../app/navigation/types';
import { EmptyState, ErrorState, LoadingIndicator } from '../../../shared/components';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationResponse } from '../types/notificationTypes';
import { NotificationTabMode, useNotifications } from '../hooks/useNotifications';

export function NotificationListScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AppStackNavProp<'NotificationList'>>();

  const {
    notifications,
    mode,
    setMode,
    initialLoading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    paginationError,
    loadInitial,
    refresh,
    loadMore,
  } = useNotifications({ autoLoad: true });

  const handleTabPress = (newMode: NotificationTabMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const handleNotificationPress = (_notification: NotificationResponse) => {
    // In Phase 18B: Item press is a type-safe placeholder.
    // Mark-read mutation is implemented in Phase 18C, and context deep-linking in Phase 18D.
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="screen-notification-list"
    >
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          testID="btn-notification-back"
          style={styles.backButton}
        >
          <Text style={[theme.typography.body, styles.backButtonText, { color: theme.colors.primary }]}>
            ‹ Quay lại
          </Text>
        </Pressable>

        <Text
          style={[theme.typography.heading2, styles.headerTitle, { color: theme.colors.textPrimary }]}
          testID="notification-list-title"
        >
          Thông báo
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Segmented Filter Tabs: Tất cả / Chưa đọc */}
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => handleTabPress('ALL')}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'ALL' }}
          accessibilityLabel="Tất cả thông báo"
          testID="tab-notifications-all"
          style={[
            styles.tabButton,
            mode === 'ALL' && [styles.activeTabButton, { borderBottomColor: theme.colors.primary }],
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              mode === 'ALL' ? styles.tabTextActive : styles.tabTextInactive,
              {
                color: mode === 'ALL' ? theme.colors.primary : theme.colors.textSecondary,
              },
            ]}
          >
            Tất cả
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabPress('UNREAD')}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'UNREAD' }}
          accessibilityLabel="Thông báo chưa đọc"
          testID="tab-notifications-unread"
          style={[
            styles.tabButton,
            mode === 'UNREAD' && [styles.activeTabButton, { borderBottomColor: theme.colors.primary }],
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              mode === 'UNREAD' ? styles.tabTextActive : styles.tabTextInactive,
              {
                color: mode === 'UNREAD' ? theme.colors.primary : theme.colors.textSecondary,
              },
            ]}
          >
            Chưa đọc
          </Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      {initialLoading ? (
        <View style={styles.centerWrapper}>
          <LoadingIndicator
            size="large"
            message="Đang tải thông báo..."
            fullScreen
            testID="notification-loading"
          />
        </View>
      ) : error ? (
        <View style={styles.centerWrapper}>
          <ErrorState
            title="Không thể tải thông báo"
            message={error.message}
            onRetry={loadInitial}
            retryTitle="Thử lại"
            testID="notification-error-state"
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={handleNotificationPress}
              testID={`notification-card-${item.id}`}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              testID="notification-refresh-control"
            />
          }
          onEndReached={() => {
            if (hasNext && !loadingMore) {
              loadMore().catch(() => {});
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              title={mode === 'ALL' ? 'Không có thông báo' : 'Không có thông báo chưa đọc'}
              description={
                mode === 'ALL'
                  ? 'Bạn hiện chưa nhận được thông báo nào từ hệ thống.'
                  : 'Bạn đã đọc tất cả thông báo hiện có.'
              }
              testID="notification-empty-state"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader} testID="notification-footer-loader">
                <LoadingIndicator size="small" message="Đang tải thêm..." />
              </View>
            ) : paginationError ? (
              <View style={styles.footerErrorContainer}>
                <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
                  {paginationError.message}
                </Text>
              </View>
            ) : undefined
          }
          testID="notification-flat-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabTextInactive: {
    fontWeight: '500',
  },
  activeTabButton: {},
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerErrorContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
