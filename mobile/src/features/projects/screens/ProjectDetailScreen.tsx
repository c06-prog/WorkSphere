/**
 * Phase 14D: Project Detail Screen (SCR-PRJ-02)
 *
 * Canonical UI & Presentation Rules:
 * - Back button to return to Projects list via navigation.goBack()
 * - Header shows project code and name (no raw UUID)
 * - Details section: code, department (with fallback), status badge, priority badge
 * - Progress section: clamped 0..100 progress bar, start date, planned end date, actual end date
 * - Manager section: manager full name, avatar placeholder/image
 * - Members summary section: member count, view all button disabled/gated until Phase 14E
 * - Milestone summary section: renders milestone items (name, status badge, formatted dueDate), view all button gated until 14E
 * - Action buttons: gated safely via server allowedActions AND client implementation capability (Phase 14E)
 * - Safe presentation error handling with reload/retry
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
import { useProjectDetail } from '../hooks/useProjectDetail';

function formatDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) {
    return 'Chưa xác định';
  }
  // If ISO datetime or date YYYY-MM-DD
  const datePart = isoOrDate.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoOrDate;
}

export function ProjectDetailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'ProjectDetail'>>();
  const route = useRoute<MainTabScreenRouteProp<'ProjectDetail'>>();

  const { projectId } = route.params;
  const { project, initialLoading, refreshing, error, refreshError, load, refresh } =
    useProjectDetail(projectId);

  // 1. Initial Loading State
  if (initialLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]} testID="project-detail-loading">
        <LoadingIndicator size="large" message="Đang tải thông tin dự án..." />
      </View>
    );
  }

  // 2. Initial Error State
  if (error || !project) {
    const errorTitle = error?.isNotFound
      ? 'Không tìm thấy dự án'
      : error?.isForbidden
      ? 'Không có quyền truy cập'
      : 'Không thể tải dự án';

    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]} testID="project-detail-error">
        <ErrorState
          title={errorTitle}
          message={error?.message ?? 'Đã xảy ra lỗi khi tải dữ liệu dự án.'}
          onRetry={error?.retryable !== false ? load : undefined}
          testID="project-detail-error-state"
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
          accessibilityLabel="Quay lại danh sách dự án"
        >
          <Text style={[theme.typography.body, styles.backButtonText, { color: theme.colors.textPrimary }]}>
            ← Quay lại danh sách
          </Text>
        </Pressable>
      </View>
    );
  }

  const clampedProgress = Math.max(0, Math.min(100, Math.round(project.progressPercent ?? 0)));
  const formattedStartDate = formatDate(project.startDate);
  const formattedPlannedEnd = formatDate(project.plannedEndDate);
  const formattedActualEnd = project.actualEndDate
    ? formatDate(project.actualEndDate)
    : 'Đang triển khai';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="screen-project-detail">
      {/* Non-blocking refresh error banner */}
      {refreshError ? (
        <View
          style={[styles.refreshErrorBanner, { backgroundColor: theme.colors.errorContainer }]}
          testID="project-detail-refresh-error"
        >
          <Text style={[theme.typography.caption, styles.bannerText, { color: theme.colors.error }]}>
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
          />
        }
      >
        {/* Top Header Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
            },
          ]}
          testID="project-detail-header-card"
        >
          <View style={styles.codeRow}>
            <Text style={[theme.typography.caption, styles.codeText, { color: theme.colors.primary }]}>
              {project.code}
            </Text>
            <View style={styles.badgeGroup}>
              <StatusBadge status={project.status} style={styles.badgeSpacing} testID="project-detail-status-badge" />
              <PriorityBadge priority={project.priority} testID="project-detail-priority-badge" />
            </View>
          </View>

          <Text style={[theme.typography.heading2, styles.projectName, { color: theme.colors.textPrimary }]}>
            {project.name}
          </Text>

          {project.description ? (
            <Text
              style={[theme.typography.body, styles.projectDescription, { color: theme.colors.textSecondary }]}
              testID="project-detail-description"
            >
              {project.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Phòng ban:{' '}
              <Text style={[styles.boldText, { color: theme.colors.textPrimary }]} testID="project-detail-department">
                {project.department?.name ?? 'Chưa phân bổ'}
              </Text>
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              Quản lý:{' '}
              <Text style={[styles.boldText, { color: theme.colors.textPrimary }]} testID="project-detail-manager">
                {project.manager.fullName}
              </Text>
            </Text>
          </View>
        </View>

        {/* Progress & Timeline Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
              marginTop: theme.spacing.md,
            },
          ]}
          testID="project-detail-progress-card"
        >
          <Text style={[theme.typography.heading3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            TIẾN ĐỘ DỰ ÁN
          </Text>

          <View style={styles.progressHeaderRow}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Hoàn thành</Text>
            <Text
              style={[theme.typography.body, styles.percentText, { color: theme.colors.primary }]}
              testID="project-detail-progress-percent"
            >
              {clampedProgress}%
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border, borderRadius: theme.radii.small }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${clampedProgress}%`,
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.small,
                },
              ]}
            />
          </View>

          <View style={styles.timelineGrid}>
            <View style={styles.timelineItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Bắt đầu</Text>
              <Text style={[theme.typography.body, styles.mediumText, { color: theme.colors.textPrimary }]} testID="project-detail-start-date">
                {formattedStartDate}
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Dự kiến kết thúc</Text>
              <Text style={[theme.typography.body, styles.mediumText, { color: theme.colors.textPrimary }]} testID="project-detail-planned-end-date">
                {formattedPlannedEnd}
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Thực tế kết thúc</Text>
              <Text style={[theme.typography.body, styles.mediumText, { color: theme.colors.textPrimary }]} testID="project-detail-actual-end-date">
                {formattedActualEnd}
              </Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
              marginTop: theme.spacing.md,
            },
          ]}
          testID="project-detail-members-card"
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[theme.typography.heading3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              THÀNH VIÊN ({project.memberCount})
            </Text>
          </View>
          <Text style={[theme.typography.caption, styles.membersSubtext, { color: theme.colors.textSecondary }]}>
            Quản lý dự án: {project.manager.fullName} cùng {Math.max(0, project.memberCount - 1)} thành viên khác.
          </Text>
        </View>

        {/* Milestone Summary Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.medium,
              padding: theme.spacing.md,
              marginTop: theme.spacing.md,
            },
          ]}
          testID="project-detail-milestones-card"
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[theme.typography.heading3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              MỐC TIẾN ĐỘ ({project.milestones.length})
            </Text>
          </View>

          {project.milestones.length === 0 ? (
            <Text style={[theme.typography.caption, styles.emptyMilestonesText, { color: theme.colors.textSecondary }]} testID="milestones-empty-text">
              Chưa có mốc tiến độ nào được thiết lập.
            </Text>
          ) : (
            project.milestones.map((milestone, index) => (
              <View
                key={milestone.id}
                style={[
                  styles.milestoneItem,
                  index > 0 ? styles.milestoneDivider : null,
                  index > 0 ? { borderTopColor: theme.colors.border } : null,
                ]}
                testID={`milestone-item-${milestone.id}`}
              >
                <View style={styles.milestoneTopRow}>
                  <Text style={[theme.typography.body, styles.milestoneName, { color: theme.colors.textPrimary }]}>
                    {milestone.name}
                  </Text>
                  <StatusBadge status={milestone.status} testID={`milestone-status-${milestone.id}`} />
                </View>
                <Text style={[theme.typography.caption, styles.milestoneDueText, { color: theme.colors.textSecondary }]}>
                  Hạn chót: {formatDate(milestone.dueDate)}
                </Text>
              </View>
            ))
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
    padding: 24,
  },
  refreshErrorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bannerText: {
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacing: {
    marginRight: 6,
  },
  projectName: {
    fontWeight: '700',
    marginTop: 8,
  },
  projectDescription: {
    marginTop: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  boldText: {
    fontWeight: '600',
  },
  percentText: {
    fontWeight: '700',
  },
  mediumText: {
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timelineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timelineItem: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersSubtext: {
    marginTop: 4,
  },
  emptyMilestonesText: {
    marginTop: 8,
  },
  milestoneItem: {
    width: '100%',
  },
  milestoneDivider: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneName: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  milestoneDueText: {
    marginTop: 2,
  },
  backButtonBottom: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: '600',
  },
});
