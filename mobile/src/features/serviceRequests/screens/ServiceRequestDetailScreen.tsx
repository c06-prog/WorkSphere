/**
 * Phase 16C: Service Request Detail Screen (SCR-SRV-02)
 * Displays authoritative details of a single service request backed by
 * GET /api/v1/service-requests/{requestId}.
 *
 * Capabilities:
 * - Authoritative loading with full-screen LoadingIndicator.
 * - Full-screen ErrorState for initial load failures (404, 403, network) with retry.
 * - Non-blocking refresh error banner when pull-to-refresh fails while retaining data.
 * - Pull-to-refresh via RefreshControl.
 * - Back button with accessible touch target (>=48dp) navigating via navigation.goBack().
 * - Displays canonical core information: requestNumber, title, description, category,
 *   priority, status, requester, assignee, asset, and lifecycle timestamps.
 * - Status history timeline with safe fromStatus === null handling.
 * - Comments preview section displaying author, content, date, and internal badge.
 * - Attachments metadata section displaying originalName, formatted file size, and creation date.
 * - Rating section displaying score, comment, and rater information when present.
 * - Strictly zero raw database UUIDs (id, categoryId, requesterId, assigneeId, assetId, fileId).
 * - Strictly zero internal fields (version, allowedActions) exposed in presentation.
 * - Staged mutations: Zero active mutation controls (16D/16E/16F own them).
 */

import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { MainTabNavProp, MainTabScreenRouteProp } from '../../../app/navigation/types';
import {
  ErrorState,
  LoadingIndicator,
  PriorityBadge,
  StatusBadge,
} from '../../../shared/components';
import { ServiceStatus } from '../types/serviceRequestTypes';
import { useServiceRequestDetail } from '../hooks/useServiceRequestDetail';

/**
 * Defensive date-time formatter for UTC ISO strings.
 */
function formatDateTime(isoString?: string | null): string {
  if (!isoString || typeof isoString !== 'string') {
    return 'Chưa xác định';
  }

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return 'Chưa xác định';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return 'Chưa xác định';
  }
}

/**
 * Formats byte count to human-readable size.
 */
function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

const STATUS_LABELS: Record<ServiceStatus, string> = {
  OPEN: 'Mở',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang xử lý',
  WAITING_FOR_USER: 'Chờ phản hồi',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
};

export function ServiceRequestDetailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'ServiceRequestDetail'>>();
  const route = useRoute<MainTabScreenRouteProp<'ServiceRequestDetail'>>();

  const { requestId } = route.params;
  const {
    request,
    initialLoading,
    refreshing,
    error,
    refreshError,
    refresh,
    retry,
  } = useServiceRequestDetail(requestId);

  // Focus-aware refresh for return-from-child freshness without initial duplicate GET
  const isFirstMountRef = useRef<boolean>(true);
  useEffect(() => {
    if (!navigation?.addListener) return;
    const unsubscribe = navigation.addListener('focus', () => {
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        return;
      }
      refresh();
    });

    return () => {
      unsubscribe?.();
    };
  }, [navigation, refresh]);

  // 1. Initial Loading State
  if (initialLoading && !request && !error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="screen-service-request-detail"
      >
        <Text style={styles.screenIdHidden}>SCR-SRV-02</Text>
        <LoadingIndicator
          size="large"
          message="Đang tải chi tiết yêu cầu..."
          fullScreen
          testID="service-request-detail-loading"
        />
      </View>
    );
  }

  // 2. Initial Error State (404, 403, Network)
  if (error && !request) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="screen-service-request-detail"
      >
        <Text style={styles.screenIdHidden}>SCR-SRV-02</Text>
        <ErrorState
          title="Không thể tải chi tiết yêu cầu"
          message={error.message}
          onRetry={retry}
          retryTitle="Thử lại"
          testID="service-request-detail-error"
        />
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.errorBackBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          testID="btn-error-back"
          accessibilityRole="button"
          accessibilityLabel="Quay lại danh sách yêu cầu"
        >
          <Text style={[theme.typography.caption, { color: theme.colors.textPrimary }]}>
            Quay lại danh sách
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!request) {
    return null;
  }

  const assigneeText = request.assignee ? request.assignee.fullName : 'Chưa phân công';
  const assetText = request.asset ? `${request.asset.name} (${request.asset.assetCode})` : 'Không có';

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="screen-service-request-detail"
    >
      <Text style={styles.screenIdHidden}>SCR-SRV-02</Text>

      {/* Non-blocking Refresh Error Banner */}
      {refreshError ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.errorContainer,
              borderColor: theme.colors.error,
              borderRadius: theme.radii.small,
              padding: theme.spacing.sm,
            },
          ]}
          testID="service-request-refresh-error-banner"
          accessibilityRole="alert"
        >
          <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
            {refreshError}
          </Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        testID="service-request-detail-scroll"
      >
        {/* Top Header Row with Back Button & Request Number */}
        <View style={styles.topNavRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radii.small,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Quay lại danh sách yêu cầu"
            testID="btn-back"
          >
            <Text style={[theme.typography.body, styles.backBtnText, { color: theme.colors.primary }]}>
              ← Quay lại
            </Text>
          </Pressable>

          <View style={styles.badgeRow}>
            <PriorityBadge priority={request.priority} />
            <View style={styles.badgeSpacer} />
            <StatusBadge type="serviceRequest" status={request.status} />
          </View>
        </View>

        {/* Request Number & Title */}
        <View style={styles.headerBlock}>
          <Text
            style={[theme.typography.caption, styles.requestNumberText, { color: theme.colors.primary }]}
            testID="detail-request-number"
          >
            {request.requestNumber}
          </Text>
          <Text
            style={[theme.typography.heading1, styles.titleText, { color: theme.colors.textPrimary }]}
            testID="detail-title"
          >
            {request.title}
          </Text>
        </View>

        {/* Description Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="detail-description-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Nội dung chi tiết
          </Text>
          <Text
            style={[theme.typography.body, styles.descriptionText, { color: theme.colors.textSecondary }]}
            testID="detail-description"
          >
            {request.description}
          </Text>
        </View>

        {/* Core Information Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="detail-core-info-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Thông tin chung
          </Text>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
              Danh mục:
            </Text>
            <Text
              style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
              testID="detail-category"
            >
              {request.category.name} ({request.category.code})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
              Người yêu cầu:
            </Text>
            <Text
              style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
              testID="detail-requester"
            >
              {request.requester.fullName} ({request.requester.email})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
              Người xử lý:
            </Text>
            <Text
              style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
              testID="detail-assignee"
            >
              {assigneeText}
            </Text>
          </View>

          {request.assignee?.assignedAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
                Phân công lúc:
              </Text>
              <Text
                style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
                testID="detail-assigned-at"
              >
                {formatDateTime(request.assignee.assignedAt)}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
              Tài sản:
            </Text>
            <Text
              style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
              testID="detail-asset"
            >
              {assetText}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
              Ngày tạo:
            </Text>
            <Text
              style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
              testID="detail-created-at"
            >
              {formatDateTime(request.createdAt)}
            </Text>
          </View>

          {request.updatedAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
                Cập nhật:
              </Text>
              <Text
                style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
                testID="detail-updated-at"
              >
                {formatDateTime(request.updatedAt)}
              </Text>
            </View>
          ) : null}

          {request.resolvedAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
                Giải quyết lúc:
              </Text>
              <Text
                style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
                testID="detail-resolved-at"
              >
                {formatDateTime(request.resolvedAt)}
              </Text>
            </View>
          ) : null}

          {request.closedAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
                Đóng lúc:
              </Text>
              <Text
                style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
                testID="detail-closed-at"
              >
                {formatDateTime(request.closedAt)}
              </Text>
            </View>
          ) : null}

          {request.cancelledAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.labelCol, { color: theme.colors.textSecondary }]}>
                Hủy lúc:
              </Text>
              <Text
                style={[theme.typography.body, styles.valueCol, { color: theme.colors.textPrimary }]}
                testID="detail-cancelled-at"
              >
                {formatDateTime(request.cancelledAt)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Status History Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="detail-history-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Lịch sử trạng thái ({request.histories.length})
          </Text>

          {request.histories.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} testID="history-empty">
              Chưa có lịch sử trạng thái
            </Text>
          ) : (
            request.histories.map((h, idx) => {
              const fromLabel = h.fromStatus ? STATUS_LABELS[h.fromStatus] ?? h.fromStatus : 'Khởi tạo';
              const toLabel = STATUS_LABELS[h.toStatus] ?? h.toStatus;

              return (
                <View
                  key={`history-${idx}-${h.changedAt}`}
                  style={[
                    styles.historyItem,
                    idx < request.histories.length - 1 && [
                      styles.historyItemBorder,
                      { borderBottomColor: theme.colors.border },
                    ],
                  ]}
                  testID={`history-item-${idx}`}
                >
                  <View style={styles.historyTopRow}>
                    <Text style={[theme.typography.body, styles.historyTransition, { color: theme.colors.textPrimary }]}>
                      {fromLabel} → <Text style={{ color: theme.colors.primary }}>{toLabel}</Text>
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      {formatDateTime(h.changedAt)}
                    </Text>
                  </View>

                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Thực hiện bởi: <Text style={{ color: theme.colors.textPrimary }}>{h.changedByName}</Text>
                  </Text>

                  {h.comment ? (
                    <Text
                      style={[theme.typography.caption, styles.historyComment, { color: theme.colors.textPrimary }]}
                      testID={`history-comment-${idx}`}
                    >
                      "{h.comment}"
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        {/* Comments Preview Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="detail-comments-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Bình luận ({request.comments.length})
          </Text>

          {request.comments.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} testID="comments-empty">
              Chưa có bình luận
            </Text>
          ) : (
            request.comments.map((c, idx) => (
              <View
                key={`comment-${idx}-${c.createdAt}`}
                style={[
                  styles.commentItem,
                  idx < request.comments.length - 1 && [
                    styles.commentItemBorder,
                    { borderBottomColor: theme.colors.border },
                  ],
                ]}
                testID={`comment-item-${idx}`}
              >
                <View style={styles.commentHeader}>
                  <Text style={[theme.typography.body, styles.commentAuthor, { color: theme.colors.textPrimary }]}>
                    {c.authorName}
                  </Text>
                  {c.isInternal ? (
                    <View
                      style={[
                        styles.internalBadge,
                        { backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.radii.small },
                      ]}
                      testID={`comment-internal-badge-${idx}`}
                    >
                      <Text style={[theme.typography.caption, styles.internalBadgeText, { color: theme.colors.primary }]}>
                        Nội bộ
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[theme.typography.caption, styles.commentTime, { color: theme.colors.textSecondary }]}>
                    {formatDateTime(c.createdAt)}
                  </Text>
                </View>
                <Text style={[theme.typography.body, styles.commentContent, { color: theme.colors.textSecondary }]}>
                  {c.content}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Attachments Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="detail-attachments-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Tệp đính kèm ({request.attachments.length})
          </Text>

          {request.attachments.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} testID="attachments-empty">
              Không có tệp đính kèm
            </Text>
          ) : (
            request.attachments.map((att, idx) => (
              <View
                key={`att-${idx}-${att.originalName}`}
                style={[
                  styles.attachmentItem,
                  idx < request.attachments.length - 1 && [
                    styles.attachmentItemBorder,
                    { borderBottomColor: theme.colors.border },
                  ],
                ]}
                testID={`attachment-item-${idx}`}
              >
                <Text
                  style={[theme.typography.body, styles.attachmentName, { color: theme.colors.textPrimary }]}
                  numberOfLines={1}
                >
                  📄 {att.originalName}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  {formatFileSize(att.sizeBytes)} • {formatDateTime(att.createdAt)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Rating Section */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            },
          ]}
          testID="detail-rating-section"
        >
          <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
            Đánh giá dịch vụ
          </Text>

          {request.rating ? (
            <View testID="rating-content">
              <Text style={[theme.typography.body, styles.ratingScore, { color: theme.colors.primary }]}>
                ⭐ {request.rating.score} / 5 sao
              </Text>
              {request.rating.comment ? (
                <Text
                  style={[theme.typography.body, styles.ratingComment, { color: theme.colors.textSecondary }]}
                  testID="rating-comment"
                >
                  "{request.rating.comment}"
                </Text>
              ) : null}
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Đánh giá bởi: <Text style={{ color: theme.colors.textPrimary }}>{request.rating.ratedByName}</Text> •{' '}
                {formatDateTime(request.rating.createdAt)}
              </Text>
            </View>
          ) : (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} testID="rating-empty">
              Chưa có đánh giá
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenIdHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  scrollContent: {
    padding: 16,
  },
  banner: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacer: {
    width: 6,
  },
  headerBlock: {
    marginBottom: 16,
  },
  requestNumberText: {
    fontWeight: '700',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: '700',
  },
  sectionCard: {
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  labelCol: {
    width: 110,
    fontWeight: '500',
  },
  valueCol: {
    flex: 1,
  },
  historyItem: {
    gap: 2,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTransition: {
    fontWeight: '600',
  },
  historyComment: {
    fontStyle: 'italic',
    marginTop: 2,
  },
  commentItem: {
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontWeight: '600',
  },
  internalBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  internalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  commentContent: {
    marginTop: 2,
  },
  attachmentItem: {
    gap: 2,
  },
  attachmentName: {
    fontWeight: '500',
  },
  ratingScore: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  ratingComment: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  errorBackBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  commentItemBorder: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  commentTime: {
    marginLeft: 'auto',
  },
  attachmentItemBorder: {
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 6,
  },
});
