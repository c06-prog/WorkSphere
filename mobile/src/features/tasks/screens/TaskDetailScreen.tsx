/**
 * Phase 15C: Task Detail Screen (SCR-TSK-02)
 *
 * Canonical UI & Presentation Rules:
 * - Back button to return to Tasks list via navigation.goBack()
 * - Header shows project name and task title (strictly zero raw UUIDs)
 * - Details section: project context, status badge, priority badge, description
 * - Progress section: clamped 0..100 progress bar, start date, due date, completed date, estimated/actual minutes
 * - People section: reporter full name, assignees list (fullName, assigned date; zero raw IDs)
 * - Hierarchy & Milestone section: parent task title (if present), milestone name (if present)
 * - Status History section: timeline of transitions (fromStatus -> toStatus, changedBy, changedAt, comment)
 * - Summaries section: read-only subtask count and comment count
 * - Staged capability gating: server allowedActions are evaluated safely, but child mutation controls
 *   (Edit, ChangeStatus, UpdateProgress, Assign, Subtasks, Comments) are strictly deferred to 15D, 15E, 15F
 * - Safe presentation error handling with reload/retry, and friendly 403 / 404 screens
 */

import React from 'react';
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
import { useTaskDetail } from '../hooks/useTaskDetail';
import { TaskStatus, TaskStatusHistoryItem } from '../api/taskTypes';

function formatDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) {
    return 'Chưa xác định';
  }
  const datePart = isoOrDate.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoOrDate;
}

function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) {
    return 'Chưa xác định';
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return formatDate(isoString);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return formatDate(isoString);
  }
}

export function TaskDetailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'TaskDetail'>>();
  const route = useRoute<MainTabScreenRouteProp<'TaskDetail'>>();

  const { taskId } = route.params;
  const { task, initialLoading, refreshing, error, refreshError, load, refresh } =
    useTaskDetail(taskId);

  // 1. Initial Loading State
  if (initialLoading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="task-detail-loading"
      >
        <LoadingIndicator size="large" message="Đang tải chi tiết công việc..." />
      </View>
    );
  }

  // 2. Initial Error State (404, 403, Network, Server)
  if (error || !task) {
    const errorTitle = error?.isNotFound
      ? 'Không tìm thấy công việc'
      : error?.isForbidden
      ? 'Không có quyền truy cập'
      : 'Không thể tải công việc';

    const errorMessage = error?.isNotFound
      ? 'Công việc không tồn tại hoặc đã bị xóa.'
      : error?.isForbidden
      ? 'Bạn không có quyền xem thông tin công việc này.'
      : error?.message ?? 'Đã xảy ra lỗi khi tải dữ liệu công việc.';

    const canRetry = !error?.isNotFound && !error?.isForbidden && error?.retryable !== false;

    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="task-detail-error"
      >
        <ErrorState
          title={errorTitle}
          message={errorMessage}
          onRetry={canRetry ? load : undefined}
          testID="task-detail-error-state"
        />
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButtonBottom,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          testID="btn-back-from-error"
          accessibilityRole="button"
          accessibilityLabel="Quay lại danh sách công việc"
        >
          <Text
            style={[
              theme.typography.body,
              styles.backButtonText,
              { color: theme.colors.textPrimary },
            ]}
          >
            ← Quay lại danh sách
          </Text>
        </Pressable>
      </View>
    );
  }

  const clampedProgress = Math.max(0, Math.min(100, Math.round(task.progressPercent ?? 0)));
  const formattedStartDate = formatDate(task.startDate);
  const formattedDueDate = formatDate(task.dueDate);
  const formattedCompletedAt = task.completedAt ? formatDate(task.completedAt) : null;
  const formattedCreatedAt = formatDateTime(task.createdAt);
  const formattedUpdatedAt = formatDateTime(task.updatedAt);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="screen-task-detail"
    >
      {/* Non-blocking refresh error banner */}
      {refreshError ? (
        <View
          style={[styles.refreshErrorBanner, { backgroundColor: theme.colors.errorContainer }]}
          testID="task-detail-refresh-error"
        >
          <Text
            style={[theme.typography.caption, styles.bannerText, { color: theme.colors.error }]}
          >
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
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            testID="task-detail-refresh-control"
          />
        }
      >
        {/* Back Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backNavRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại danh sách công việc"
          testID="btn-task-detail-back"
        >
          <Text style={[theme.typography.body, styles.backNavText, { color: theme.colors.primary }]}>
            ← Quay lại
          </Text>
        </Pressable>

        {/* Header Section: Project Context & Title */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <View style={styles.projectContextRow}>
            <Text
              style={[
                theme.typography.caption,
                styles.projectNameText,
                { color: theme.colors.textSecondary },
              ]}
              testID="task-detail-project-name"
            >
              {task.project?.name ?? 'Dự án'}
            </Text>
            <View style={styles.badgeRow}>
              <PriorityBadge priority={task.priority} />
              <View style={styles.badgeSpacer} />
              <StatusBadge type="task" status={task.status} />
            </View>
          </View>

          <Text
            style={[
              theme.typography.heading2,
              styles.taskTitleText,
              { color: theme.colors.textPrimary },
            ]}
            testID="task-detail-title"
          >
            {task.title}
          </Text>

          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text
                style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
              >
                Tiến độ thực hiện
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  styles.progressPercentText,
                  { color: theme.colors.textPrimary },
                ]}
                testID="task-detail-progress-percent"
              >
                {clampedProgress}%
              </Text>
            </View>
            <View
              style={[
                styles.progressBarTrack,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.radii.small,
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.small,
                    width: `${clampedProgress}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Schedule & Time Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading3,
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Thời gian & Tiến độ
          </Text>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Ngày bắt đầu:
            </Text>
            <Text
              style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
              testID="task-detail-start-date"
            >
              {formattedStartDate}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Hạn hoàn thành:
            </Text>
            <Text
              style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
              testID="task-detail-due-date"
            >
              {formattedDueDate}
            </Text>
          </View>

          {formattedCompletedAt ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Ngày hoàn thành:
              </Text>
              <Text
                style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
                testID="task-detail-completed-date"
              >
                {formattedCompletedAt}
              </Text>
            </View>
          ) : null}

          {task.estimatedMinutes !== null && task.estimatedMinutes !== undefined ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Thời gian ước tính:
              </Text>
              <Text style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}>
                {task.estimatedMinutes} phút
              </Text>
            </View>
          ) : null}

          {task.actualMinutes !== null && task.actualMinutes !== undefined ? (
            <View style={styles.infoRow}>
              <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Thời gian thực tế:
              </Text>
              <Text style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}>
                {task.actualMinutes} phút
              </Text>
            </View>
          ) : null}
        </View>

        {/* Hierarchy & Milestone Section (if present) */}
        {task.parentTask || task.milestone ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.medium,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.heading3,
                styles.sectionTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Phân cấp & Mốc dự án
            </Text>

            {task.parentTask ? (
              <View style={styles.infoRow}>
                <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Công việc cha:
                </Text>
                <Text
                  style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
                  testID="task-detail-parent-task"
                >
                  {task.parentTask.title}
                </Text>
              </View>
            ) : null}

            {task.milestone ? (
              <View style={styles.infoRow}>
                <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Mốc tiến độ:
                </Text>
                <Text
                  style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
                  testID="task-detail-milestone"
                >
                  {task.milestone.name}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Description Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading3,
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Mô tả công việc
          </Text>
          <Text
            style={[
              theme.typography.body,
              styles.descriptionText,
              { color: task.description ? theme.colors.textPrimary : theme.colors.textSecondary },
            ]}
            testID="task-detail-description"
          >
            {task.description && task.description.trim().length > 0
              ? task.description
              : 'Chưa có mô tả cho công việc này.'}
          </Text>
        </View>

        {/* Personnel Section: Reporter & Assignees */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading3,
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Nhân sự tham gia
          </Text>

          {/* Reporter */}
          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Người giao việc:
            </Text>
            <Text
              style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
              testID="task-detail-reporter"
            >
              {task.reporter?.fullName ?? 'Hệ thống'}
            </Text>
          </View>

          {/* Assignees */}
          <View style={styles.assigneeSection}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Người thực hiện:
            </Text>
            {task.assignees && task.assignees.length > 0 ? (
              <View style={styles.assigneeList} testID="task-detail-assignees-list">
                {task.assignees.map((assignee, index) => (
                  <View key={`assignee-${index}`} style={styles.assigneeItem}>
                    <Text style={[theme.typography.body, styles.assigneeName, { color: theme.colors.textPrimary }]}>
                      • {assignee.fullName}
                    </Text>
                    {assignee.assignedAt ? (
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        (Giao ngày: {formatDate(assignee.assignedAt)})
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text
                style={[theme.typography.body, styles.emptyText, { color: theme.colors.textSecondary }]}
                testID="task-detail-no-assignees"
              >
                Chưa phân công người thực hiện.
              </Text>
            )}
          </View>
        </View>

        {/* Summaries: Subtasks & Comments (Read-only summary in 15C) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading3,
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Công việc con & Bình luận
          </Text>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Công việc con:
            </Text>
            <Text
              style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
              testID="task-detail-subtask-count"
            >
              {task.subtasks ? task.subtasks.length : 0} công việc con
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Bình luận gần đây:
            </Text>
            <Text
              style={[theme.typography.body, styles.infoValue, { color: theme.colors.textPrimary }]}
              testID="task-detail-comment-count"
            >
              {task.recentComments ? task.recentComments.length : 0} bình luận
            </Text>
          </View>
        </View>

        {/* Status History Section */}
        {task.statusHistory && task.statusHistory.length > 0 ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.medium,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.heading3,
                styles.sectionTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Lịch sử trạng thái
            </Text>

            <View style={styles.historyList} testID="task-detail-status-history">
              {task.statusHistory.map((item: TaskStatusHistoryItem, index: number) => (
                <View
                  key={`history-${item.id || index}`}
                  style={[
                    styles.historyItem,
                    index > 0 ? styles.historyItemBorder : null,
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <Text
                      style={[
                        theme.typography.caption,
                        styles.historyChangedBy,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {item.changedBy?.fullName ?? 'Hệ thống'}
                    </Text>
                    <Text
                      style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
                    >
                      {formatDateTime(item.changedAt)}
                    </Text>
                  </View>
                  <View style={styles.historyTransitionRow}>
                    <StatusBadge type="task" status={item.fromStatus} />
                    <Text style={[theme.typography.body, styles.historyArrow, { color: theme.colors.textSecondary }]}>
                      →
                    </Text>
                    <StatusBadge type="task" status={item.toStatus as TaskStatus} />
                  </View>
                  {item.comment ? (
                    <Text
                      style={[
                        theme.typography.caption,
                        styles.historyComment,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      "{item.comment}"
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Audit Metadata Section */}
        <View style={styles.metadataSection}>
          <Text style={[theme.typography.caption, styles.metaText, { color: theme.colors.textSecondary }]}>
            Tạo ngày: {formattedCreatedAt}
          </Text>
          <Text style={[theme.typography.caption, styles.metaText, { color: theme.colors.textSecondary }]}>
            Cập nhật lần cuối: {formattedUpdatedAt}
          </Text>
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
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  refreshErrorBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  bannerText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  backNavRow: {
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
  },
  backNavText: {
    fontWeight: '600',
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  projectContextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectNameText: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacer: {
    width: 6,
  },
  taskTitleText: {
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPercentText: {
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 1.5,
    textAlign: 'right',
  },
  descriptionText: {
    lineHeight: 22,
  },
  assigneeSection: {
    marginTop: 8,
  },
  assigneeList: {
    marginTop: 4,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  assigneeName: {
    fontWeight: '500',
  },
  emptyText: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyList: {
    marginTop: 4,
  },
  historyItem: {
    paddingVertical: 10,
  },
  historyItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyChangedBy: {
    fontWeight: '600',
  },
  historyTransitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyArrow: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  historyComment: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  metadataSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  metaText: {
    marginBottom: 2,
  },
  backButtonBottom: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    fontWeight: '600',
  },
});
