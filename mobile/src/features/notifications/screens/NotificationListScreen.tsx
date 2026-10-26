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

import React, { useCallback, useRef, useState, useEffect, useContext } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { NotificationListNavigationProp } from '../../../app/navigation/types';
import { AuthContext } from '../../../app/auth/AuthProvider';
import { EmptyState, ErrorState, LoadingIndicator } from '../../../shared/components';
import { ConfirmationDialog } from '../../../shared/components/ConfirmationDialog';
import { useNotificationBadge } from '../context/NotificationBadgeContext';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationResponse } from '../types/notificationTypes';
import { NotificationTabMode, useNotifications } from '../hooks/useNotifications';
import { getNotificationNavigationTarget } from '../navigation/notificationNavigationHelper';

export function NotificationListScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NotificationListNavigationProp>();
  const { unreadCount, refreshUnreadCount } = useNotificationBadge();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;

  const [confirmMarkAllVisible, setConfirmMarkAllVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const navigatingIdsRef = useRef<Set<string>>(new Set());
  const activeSessionUserIdRef = useRef<string | undefined>(currentUser?.id);

  // Synchronize session user
  useEffect(() => {
    activeSessionUserIdRef.current = currentUser?.id;
  }, [currentUser?.id]);

  // Clear locks on unmount
  useEffect(() => {
    const navigatingIds = navigatingIdsRef.current;
    return () => {
      navigatingIds.clear();
    };
  }, []);

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
    markOneAsRead,
    markAllAsRead,
    isMarkingId,
    isMarkingAll,
    mutationError,
    clearMutationError,
  } = useNotifications({ autoLoad: true });

  // Focus effect: Refresh unread badge authoritative baseline
  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount().catch(() => {});
    }, [refreshUnreadCount])
  );

  const handleTabPress = (newMode: NotificationTabMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const dispatchNavigationTarget = (target: NonNullable<ReturnType<typeof getNotificationNavigationTarget>>) => {
    switch (target.screen) {
      case 'AssetDetail':
        navigation.navigate('AssetDetail', target.params);
        break;
      case 'TaskDetail':
        navigation.navigate('MainTabs', {
          screen: 'TaskDetail',
          params: { ...target.params, returnOrigin: 'NotificationList' },
        });
        break;
      case 'ProjectDetail':
        navigation.navigate('MainTabs', {
          screen: 'ProjectDetail',
          params: { ...target.params, returnOrigin: 'NotificationList' },
        });
        break;
      case 'ServiceRequestDetail':
        navigation.navigate('MainTabs', {
          screen: 'ServiceRequestDetail',
          params: { ...target.params, returnOrigin: 'NotificationList' },
        });
        break;
    }
  };

  const handleNotificationPress = async (notification: NotificationResponse) => {
    const notificationId = notification.id;

    // Check synchronous lock to prevent rapid duplicate double-tap navigation
    if (navigatingIdsRef.current.has(notificationId)) {
      return;
    }

    const target = getNotificationNavigationTarget(notification.referenceType, notification.referenceId);

    // Case C & E: Missing or unsupported reference
    if (!target) {
      if (!notification.read) {
        await markOneAsRead(notificationId).catch(() => {});
      }
      setInfoMessage('Thông báo này không có nội dung liên kết để mở.');
      return;
    }

    // Set lock
    navigatingIdsRef.current.add(notificationId);
    setNavigatingId(notificationId);
    setInfoMessage(null);

    const initialUserId = authContext?.currentUser?.id ?? activeSessionUserIdRef.current;
    const initialSession = authContext?.sessionState ?? 'AUTHENTICATED';

    try {
      if (!notification.read) {
        // Case A: Unread notification
        const success = await markOneAsRead(notificationId);
        // Case D: Mark-read failed -> do not navigate
        if (!success) {
          return;
        }
      }

      const currentUserId = authContext?.currentUser?.id ?? activeSessionUserIdRef.current;
      const currentSession = authContext?.sessionState ?? 'AUTHENTICATED';

      // Session check: ensure user is still authenticated and session hasn't switched
      if (
        initialSession !== 'AUTHENTICATED' ||
        currentSession !== 'AUTHENTICATED' ||
        (initialUserId && currentUserId !== initialUserId)
      ) {
        return;
      }

      // Dispatch navigation
      dispatchNavigationTarget(target);
    } finally {
      navigatingIdsRef.current.delete(notificationId);
      setNavigatingId(null);
    }
  };

  const handleConfirmMarkAll = async () => {
    setConfirmMarkAllVisible(false);
    await markAllAsRead();
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

        <Pressable
          onPress={() => setConfirmMarkAllVisible(true)}
          disabled={unreadCount === 0 || isMarkingAll}
          accessibilityRole="button"
          accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
          testID="btn-mark-all-read"
          style={styles.markAllButton}
        >
          <Text
            style={[
              theme.typography.caption,
              styles.markAllButtonText,
              {
                color: unreadCount > 0 && !isMarkingAll ? theme.colors.primary : theme.colors.disabled,
              },
            ]}
          >
            Đọc tất cả
          </Text>
        </Pressable>
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

      {/* Mutation Error Banner */}
      {mutationError && (
        <View style={[styles.mutationErrorBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[theme.typography.caption, styles.errorText, { color: theme.colors.error }]}>
            {mutationError.message}
          </Text>
          <Pressable onPress={clearMutationError} style={styles.closeErrorButton} accessibilityLabel="Đóng thông báo lỗi">
            <Text style={[theme.typography.caption, styles.closeErrorText, { color: theme.colors.error }]}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* Info / Feedback Banner for Missing/Unsupported Reference */}
      {infoMessage && (
        <View style={[styles.mutationErrorBanner, { backgroundColor: theme.colors.surfaceVariant }]} testID="banner-notification-info">
          <Text style={[theme.typography.caption, styles.errorText, { color: theme.colors.textPrimary }]}>
            {infoMessage}
          </Text>
          <Pressable onPress={() => setInfoMessage(null)} style={styles.closeErrorButton} accessibilityLabel="Đóng thông báo">
            <Text style={[theme.typography.caption, styles.closeErrorText, { color: theme.colors.textSecondary }]}>✕</Text>
          </Pressable>
        </View>
      )}

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
              isMarkingRead={isMarkingId(item.id)}
              isNavigating={navigatingId === item.id}
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

      {/* Confirmation Dialog for Mark All Read */}
      <ConfirmationDialog
        visible={confirmMarkAllVisible}
        title="Đánh dấu tất cả đã đọc"
        message="Bạn có chắc chắn muốn đánh dấu tất cả thông báo hiện có là đã đọc?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmMarkAll}
        onCancel={() => setConfirmMarkAllVisible(false)}
        loading={isMarkingAll}
        testID="dialog-confirm-mark-all"
      />
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
  markAllButton: {
    minHeight: 48,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  markAllButtonText: {
    fontWeight: '600',
  },
  mutationErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
  },
  closeErrorButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeErrorText: {
    fontWeight: '700',
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
