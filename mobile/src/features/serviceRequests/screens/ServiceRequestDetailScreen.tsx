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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
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
  ConfirmationDialog,
  ErrorState,
  LoadingIndicator,
  PriorityBadge,
  StatusBadge,
} from '../../../shared/components';
import {
  hasServiceRequestAction,
  ServiceRequestDetailResponse,
  ServiceStatus,
} from '../types/serviceRequestTypes';
import { useServiceRequestDetail } from '../hooks/useServiceRequestDetail';
import { EditServiceRequestModal } from '../components/EditServiceRequestModal';
import { RejectResolutionModal } from '../components/RejectResolutionModal';
import { ResolveServiceRequestModal } from '../components/ResolveServiceRequestModal';
import { ServiceRatingModal } from '../components/ServiceRatingModal';
import { ServiceRatingResponse } from '../types/serviceRequestTypes';
import { UserPickerModal } from '../../directory/components/UserPickerModal';
import { UserDirectoryItem } from '../../directory/api/directoryTypes';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { mapServiceRequestError } from '../errors/serviceRequestErrorMapper';

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

const WORKFLOW_ACTIONS = [
  'ASSIGN',
  'START',
  'WAIT_FOR_USER',
  'RESOLVE',
  'RESUME',
  'REJECT_RESOLUTION',
  'CONFIRM',
  'CANCEL',
] as const;

function hasAnyWorkflowAction(allowedActions: string[] | undefined): boolean {
  if (!allowedActions || !Array.isArray(allowedActions)) return false;
  return WORKFLOW_ACTIONS.some(action => allowedActions.includes(action));
}

export function ServiceRequestDetailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'ServiceRequestDetail'>>();
  const route = useRoute<MainTabScreenRouteProp<'ServiceRequestDetail'>>();

  const { requestId, returnOrigin } = route.params;
  const {
    request,
    initialLoading,
    refreshing,
    error,
    refreshError,
    refresh,
    retry,
    invalidateAndRefresh,
    applyServiceRequestUpdate,
  } = useServiceRequestDetail(requestId);

  const handleBack = useCallback(() => {
    if (returnOrigin === 'NotificationList') {
      const parentNav = navigation.getParent?.();
      if (parentNav?.goBack) {
        parentNav.goBack();
        return;
      }
    }
    navigation.goBack();
  }, [navigation, returnOrigin]);

  useEffect(() => {
    if (returnOrigin !== 'NotificationList') return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => {
      backHandler.remove();
    };
  }, [handleBack, returnOrigin]);

  // Edit & Conflict state
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [conflictModalVisible, setConflictModalVisible] = useState<boolean>(false);

  // Workflow modals & dialogs state (Phase 16E)
  const [assignPickerVisible, setAssignPickerVisible] = useState<boolean>(false);
  const [resolveModalVisible, setResolveModalVisible] = useState<boolean>(false);
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState<boolean>(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState<boolean>(false);
  const [ratingModalVisible, setRatingModalVisible] = useState<boolean>(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Synchronous mutation correctness locks
  const assignLockRef = useRef<boolean>(false);
  const statusLockRef = useRef<boolean>(false);

  const handleEditSuccess = (updated: ServiceRequestDetailResponse) => {
    setEditModalVisible(false);
    applyServiceRequestUpdate(updated);
  };

  const handleEditConflict = () => {
    setEditModalVisible(false);
    setConflictModalVisible(true);
  };

  const handleReloadOnConflict = async () => {
    setConflictModalVisible(false);
    await invalidateAndRefresh();
  };

  // ASSIGN mutation handler
  const handleAssignConfirm = async (selectedUsers: UserDirectoryItem[]) => {
    if (assignLockRef.current || selectedUsers.length === 0 || !request) {
      return;
    }

    const targetUser = selectedUsers[0];
    assignLockRef.current = true;
    setActionErrorMessage(null);

    try {
      await serviceRequestApi.assignServiceRequest(request.id, {
        assigneeId: targetUser.id,
      });
      setAssignPickerVisible(false);
      await invalidateAndRefresh();
    } catch (err: unknown) {
      const mapped = mapServiceRequestError(err);
      if (mapped.isConflict) {
        setAssignPickerVisible(false);
        setConflictModalVisible(true);
      } else {
        setActionErrorMessage(mapped.message);
      }
    } finally {
      assignLockRef.current = false;
    }
  };

  // Generic direct status transition handler (CANCEL, START, WAIT_FOR_USER, RESUME, CONFIRM)
  const executeStatusTransition = async (targetStatus: ServiceStatus, comment?: string) => {
    if (statusLockRef.current || !request) {
      return;
    }

    statusLockRef.current = true;
    setActionErrorMessage(null);

    try {
      await serviceRequestApi.updateServiceRequestStatus(request.id, {
        status: targetStatus,
        comment,
        version: request.version,
      });
      setCancelDialogVisible(false);
      setConfirmDialogVisible(false);
      await invalidateAndRefresh();
    } catch (err: unknown) {
      setCancelDialogVisible(false);
      setConfirmDialogVisible(false);
      const mapped = mapServiceRequestError(err);
      if (mapped.isConflict) {
        setConflictModalVisible(true);
      } else {
        setActionErrorMessage(mapped.message);
      }
    } finally {
      statusLockRef.current = false;
    }
  };

  // RESOLVE success handler
  const handleResolveSuccess = async () => {
    setResolveModalVisible(false);
    await invalidateAndRefresh();
  };

  // REJECT_RESOLUTION success handler
  const handleRejectSuccess = (updated: ServiceRequestDetailResponse) => {
    setRejectModalVisible(false);
    applyServiceRequestUpdate(updated);
  };

  // RATE success handler (Phase 16F)
  const handleRatingSuccess = async (_rating: ServiceRatingResponse) => {
    setRatingModalVisible(false);
    await invalidateAndRefresh();
  };

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
          onPress={handleBack}
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

      {/* Workflow Action Error Banner */}
      {actionErrorMessage ? (
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
          testID="service-request-action-error-banner"
          accessibilityRole="alert"
        >
          <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
            {actionErrorMessage}
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
            onPress={handleBack}
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
            {hasServiceRequestAction(request.allowedActions, 'UPDATE') ? (
              <Pressable
                onPress={() => setEditModalVisible(true)}
                style={({ pressed }) => [
                  styles.editButton,
                  {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chỉnh sửa yêu cầu"
                testID="btn-edit-service-request"
              >
                <Text
                  style={[
                    theme.typography.caption,
                    styles.editBtnText,
                    { color: theme.colors.primary },
                  ]}
                >
                  ✎ Chỉnh sửa
                </Text>
              </Pressable>
            ) : null}
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

        {/* Workflow Action Bar (Phase 16E) */}
        {hasAnyWorkflowAction(request.allowedActions) ? (
          <View style={styles.workflowActionBar} testID="workflow-action-bar">
            {/* ASSIGN: Phân công */}
            {hasServiceRequestAction(request.allowedActions, 'ASSIGN') ? (
              <Pressable
                onPress={() => setAssignPickerVisible(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.assignButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Phân công người xử lý"
                testID="btn-assign-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                  Phân công
                </Text>
              </Pressable>
            ) : null}

            {/* START: Bắt đầu xử lý */}
            {hasServiceRequestAction(request.allowedActions, 'START') ? (
              <Pressable
                onPress={() => executeStatusTransition('IN_PROGRESS')}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Bắt đầu xử lý yêu cầu"
                testID="btn-start-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                  Bắt đầu xử lý
                </Text>
              </Pressable>
            ) : null}

            {/* WAIT_FOR_USER: Chờ phản hồi */}
            {hasServiceRequestAction(request.allowedActions, 'WAIT_FOR_USER') ? (
              <Pressable
                onPress={() => executeStatusTransition('WAITING_FOR_USER')}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Chờ phản hồi từ người yêu cầu"
                testID="btn-wait-user-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.textPrimary }]}>
                  Chờ phản hồi
                </Text>
              </Pressable>
            ) : null}

            {/* RESOLVE: Hoàn tất xử lý / Giải quyết */}
            {hasServiceRequestAction(request.allowedActions, 'RESOLVE') ? (
              <Pressable
                onPress={() => setResolveModalVisible(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.success,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Giải quyết yêu cầu"
                testID="btn-resolve-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, styles.whiteText]}>
                  Giải quyết
                </Text>
              </Pressable>
            ) : null}

            {/* RESUME: Tiếp tục xử lý */}
            {hasServiceRequestAction(request.allowedActions, 'RESUME') ? (
              <Pressable
                onPress={() => executeStatusTransition('IN_PROGRESS')}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Tiếp tục xử lý yêu cầu"
                testID="btn-resume-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                  Tiếp tục xử lý
                </Text>
              </Pressable>
            ) : null}

            {/* REJECT_RESOLUTION: Từ chối kết quả (SCR-SRV-03) */}
            {hasServiceRequestAction(request.allowedActions, 'REJECT_RESOLUTION') ? (
              <Pressable
                onPress={() => setRejectModalVisible(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.errorContainer,
                    borderColor: theme.colors.error,
                    borderWidth: 1,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Từ chối kết quả xử lý"
                testID="btn-reject-resolution-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.error }]}>
                  Từ chối kết quả
                </Text>
              </Pressable>
            ) : null}

            {/* CONFIRM: Xác nhận hoàn tất (đóng yêu cầu) */}
            {hasServiceRequestAction(request.allowedActions, 'CONFIRM') ? (
              <Pressable
                onPress={() => setConfirmDialogVisible(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.success,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Xác nhận hoàn tất và đóng yêu cầu"
                testID="btn-confirm-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, styles.whiteText]}>
                  Xác nhận hoàn tất
                </Text>
              </Pressable>
            ) : null}

            {/* CANCEL: Hủy yêu cầu */}
            {hasServiceRequestAction(request.allowedActions, 'CANCEL') ? (
              <Pressable
                onPress={() => setCancelDialogVisible(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.error,
                    borderWidth: 1,
                    borderRadius: theme.radii.small,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Hủy yêu cầu dịch vụ"
                testID="btn-cancel-service-request"
              >
                <Text style={[theme.typography.bodyMedium, styles.actionButtonText, { color: theme.colors.error }]}>
                  Hủy yêu cầu
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

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
          <View style={styles.sectionHeaderRow}>
            <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
              Bình luận ({request.comments.length})
            </Text>
            <Pressable
              onPress={() => navigation.navigate('ServiceRequestComments', { requestId: request.id })}
              style={({ pressed }) => [
                styles.viewAllButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Xem tất cả bình luận"
              testID="btn-view-all-comments"
            >
              <Text style={[theme.typography.bodySmall, styles.viewAllButtonText, { color: theme.colors.primary }]}>
                Xem tất cả ›
              </Text>
            </Pressable>
          </View>

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
          <View style={styles.sectionHeaderRow}>
            <Text style={[theme.typography.heading3, styles.sectionHeader, { color: theme.colors.textPrimary }]}>
              Đánh giá dịch vụ
            </Text>
            {hasServiceRequestAction(request.allowedActions, 'RATE') ? (
              <Pressable
                onPress={() => setRatingModalVisible(true)}
                style={({ pressed }) => [
                  styles.rateActionButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Đánh giá chất lượng dịch vụ"
                testID="btn-open-rate-service-request"
              >
                <Text style={[theme.typography.bodySmall, styles.rateActionButtonText]}>
                  Đánh giá ngay
                </Text>
              </Pressable>
            ) : null}
          </View>

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

      {/* Edit Service Request Modal */}
      <EditServiceRequestModal
        visible={editModalVisible}
        request={request}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        onConflict={handleEditConflict}
      />

      {/* Optimistic Lock Conflict Confirmation Dialog */}
      <ConfirmationDialog
        visible={conflictModalVisible}
        title="Xung đột dữ liệu"
        message="Dữ liệu yêu cầu dịch vụ đã được cập nhật bởi người dùng khác trong khi bạn đang thao tác. Bạn có muốn tải lại dữ liệu mới nhất không?"
        confirmText="Tải lại dữ liệu"
        cancelText="Hủy bỏ"
        onConfirm={handleReloadOnConflict}
        onCancel={() => setConflictModalVisible(false)}
        testID="dialog-service-request-conflict"
      />

      {/* User Directory Assignee Picker Modal (Phase 16E) */}
      <UserPickerModal
        visible={assignPickerVisible}
        mode="single"
        title="Phân công người xử lý"
        selectedIds={request.assignee ? [request.assignee.id] : []}
        onConfirm={handleAssignConfirm}
        onCancel={() => setAssignPickerVisible(false)}
        testID="modal-assign-service-request"
      />

      {/* Resolve Service Request Modal (Phase 16E) */}
      <ResolveServiceRequestModal
        visible={resolveModalVisible}
        request={request}
        onClose={() => setResolveModalVisible(false)}
        onSuccess={handleResolveSuccess}
        onConflict={handleEditConflict}
        testID="modal-resolve-service-request"
      />

      {/* Reject Resolution Sheet (SCR-SRV-03 / Phase 16E) */}
      <RejectResolutionModal
        visible={rejectModalVisible}
        request={request}
        onClose={() => setRejectModalVisible(false)}
        onSuccess={handleRejectSuccess}
        onConflict={handleEditConflict}
        testID="modal-reject-resolution"
      />

      {/* Cancel Confirmation Dialog (Phase 16E) */}
      <ConfirmationDialog
        visible={cancelDialogVisible}
        title="Hủy yêu cầu dịch vụ"
        message="Bạn có chắc chắn muốn hủy yêu cầu dịch vụ này không? Thao tác này không thể hoàn tác."
        confirmText="Hủy yêu cầu"
        cancelText="Đóng"
        isDanger={true}
        onConfirm={() => executeStatusTransition('CANCELLED')}
        onCancel={() => setCancelDialogVisible(false)}
        testID="dialog-cancel-service-request"
      />

      {/* Confirm (Close) Confirmation Dialog (Phase 16E) */}
      <ConfirmationDialog
        visible={confirmDialogVisible}
        title="Xác nhận hoàn tất"
        message="Bạn có đồng ý kết quả xử lý và đóng yêu cầu dịch vụ này không?"
        confirmText="Đồng ý & Đóng"
        cancelText="Hủy bỏ"
        onConfirm={() => executeStatusTransition('CLOSED')}
        onCancel={() => setConfirmDialogVisible(false)}
        testID="dialog-confirm-service-request"
      />

      {/* Service Rating Modal (SCR-SRV-06 / Phase 16F) */}
      <ServiceRatingModal
        visible={ratingModalVisible}
        request={request}
        onClose={() => setRatingModalVisible(false)}
        onSuccess={handleRatingSuccess}
        testID="modal-service-rating"
      />
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
  editButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editBtnText: {
    fontWeight: '600',
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
  workflowActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignButton: {},
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  whiteText: {
    color: '#ffffff',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  viewAllButtonText: {
    fontWeight: '600',
  },
  rateActionButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
