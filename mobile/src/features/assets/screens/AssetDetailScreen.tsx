/**
 * Phase 17C: Asset Detail Screen (SCR-AST-02)
 * Displays authoritative details of an Asset backed by GET /api/v1/assets/{assetId}.
 *
 * Capabilities:
 * - Authoritative loading with full-screen LoadingIndicator.
 * - Full-screen ErrorState for initial load failures (404, 403, network) with retry.
 * - Non-blocking refresh error banner when pull-to-refresh fails while retaining data.
 * - Pull-to-refresh via RefreshControl.
 * - Back button with accessible touch target (>=48dp) navigating via navigation.goBack().
 * - Displays canonical core information: assetCode, name, category, serialNumber,
 *   manufacturer, model, location, status, purchaseDate, purchasePrice, warrantyEndDate, description.
 * - Current assignment info: assignedTo, assignedBy, assignedAt, expectedReturnAt, notes.
 * - Repair history preview via RepairHistoryPreview component.
 * - Related service requests list with navigation to ServiceRequestDetail.
 * - "Báo hỏng / Yêu cầu dịch vụ" CTA button:
 *   Visible if user is the active assignee OR holds ASSET_MANAGE / ADMIN authority.
 *   Dispatches navigation to CreateServiceRequest with route param { assetId: asset.id }.
 * - Strictly zero raw database UUIDs or internal version numbers exposed in presentation.
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
import { useAuth } from '../../../app/auth/AuthProvider';
import { AppStackScreenRouteProp, AssetDetailNavigationProp } from '../../../app/navigation/types';
import {
  AppButton,
  ConfirmationDialog,
  ErrorState,
  LoadingIndicator,
  StatusBadge,
} from '../../../shared/components';
import { useAssetDetail } from '../hooks/useAssetDetail';
import { RepairHistoryPreview } from '../components/RepairHistoryPreview';
import { AssetDetailResponse } from '../types/assetTypes';
import { EditAssetModal } from '../components/EditAssetModal';

export function AssetDetailScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AssetDetailNavigationProp>();
  const route = useRoute<AppStackScreenRouteProp<'AssetDetail'>>();
  const { currentUser } = useAuth();

  const assetId = route.params?.assetId;

  const {
    asset,
    initialLoading,
    refreshing,
    error,
    refreshError,
    refresh,
    retry,
    applyAssetUpdate,
    invalidateAndRefresh,
  } = useAssetDetail(assetId);

  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [conflictDialogVisible, setConflictDialogVisible] = React.useState(false);

  // Authorization checks
  const isAdmin = currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false;
  const hasAssetManage = (currentUser?.permissions?.includes('ASSET_MANAGE') ?? false) || isAdmin;
  const isActiveAssignee = Boolean(
    currentUser?.id && asset?.currentAssignment?.assignedTo?.id === currentUser.id
  );

  // Report fault visibility: Active assignee OR Manager/Admin
  const canReportFault = isActiveAssignee || hasAssetManage;

  const handleEditSuccess = (updatedAsset: AssetDetailResponse) => {
    setEditModalVisible(false);
    if (updatedAsset) {
      applyAssetUpdate(updatedAsset);
    }
  };

  const handleEditConflict = () => {
    setEditModalVisible(false);
    setConflictDialogVisible(true);
  };

  const handleReloadOnConflict = async () => {
    setConflictDialogVisible(false);
    await invalidateAndRefresh();
  };

  const handleReportFault = () => {
    if (!asset?.id) return;
    navigation.navigate('CreateServiceRequest', { assetId: asset.id });
  };

  const handleServiceRequestPress = (serviceRequestId: string) => {
    navigation.navigate('ServiceRequestDetail', { requestId: serviceRequestId });
  };

  const formatDate = (isoString?: string | null): string => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return isoString;
    }
  };

  const formatCurrency = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return '—';
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
  };

  if (initialLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
        testID="asset-detail-loading"
      >
        <LoadingIndicator />
        <Text style={[theme.typography.body, styles.loadingSubText, { color: theme.colors.textSecondary }]}>
          Đang tải thông tin tài sản...
        </Text>
      </View>
    );
  }

  if (error || !asset) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
        testID="asset-detail-error"
      >
        <ErrorState
          title={error?.isNotFound ? 'Không tìm thấy tài sản' : 'Lỗi tải thông tin'}
          message={error?.message || 'Không thể tải thông tin chi tiết tài sản.'}
          onRetry={error?.retryable ? retry : undefined}
          testID="asset-detail-error-state"
        />
        <AppButton
          title="Quay lại"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backButtonFallback}
          testID="btn-asset-detail-back-fallback"
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]} testID="asset-detail-screen">
      {/* Top Header */}
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
          style={styles.backButtonTouch}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          testID="btn-asset-detail-back"
        >
          <Text style={[theme.typography.bodyMedium, styles.backButtonText, { color: theme.colors.primary }]}>
            ‹ Quay lại
          </Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={[theme.typography.heading3, styles.headerTitleText, { color: theme.colors.textPrimary }]}
        >
          {asset.assetCode}
        </Text>
                {hasAssetManage ? (
          <Pressable
            onPress={() => setEditModalVisible(true)}
            style={styles.editButtonTouch}
            accessibilityRole="button"
            accessibilityLabel="Chỉnh sửa tài sản"
            testID="btn-asset-detail-edit"
          >
            <Text style={[theme.typography.bodyMedium, styles.editButtonText, { color: theme.colors.primary }]}>
              Sửa
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerRightSpacer} />
        )}
      </View>

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
      >
        {/* Refresh error banner */}
        {refreshError ? (
          <View
            style={[
              styles.refreshErrorBanner,
              { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error },
            ]}
            testID="asset-detail-refresh-error"
          >
            <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
              {refreshError}
            </Text>
          </View>
        ) : null}

        {/* Hero Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          testID="asset-detail-hero"
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroCodeBox}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                MÃ TÀI SẢN
              </Text>
              <Text
                style={[
                  theme.typography.heading2,
                  styles.heroCodeText, { color: theme.colors.primary },
                ]}
                testID="asset-detail-code"
              >
                {asset.assetCode}
              </Text>
            </View>
            <StatusBadge
              status={asset.status}
              type="asset"
              testID="asset-detail-status-badge"
            />
          </View>

          <Text
            style={[
              theme.typography.heading2,
              styles.heroNameText, { color: theme.colors.textPrimary },
            ]}
            testID="asset-detail-name"
          >
            {asset.name}
          </Text>

          {asset.category ? (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Loại: {asset.category.name}
              </Text>
            </View>
          ) : null}

          {asset.description ? (
            <Text
              style={[
                theme.typography.body,
                styles.heroDescText, { color: theme.colors.textSecondary },
              ]}
              testID="asset-detail-description"
            >
              {asset.description}
            </Text>
          ) : null}
        </View>

        {/* General Specifications Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          testID="asset-detail-specs"
        >
          <Text style={[theme.typography.heading3, styles.cardHeading, { color: theme.colors.textPrimary }]}>
            Thông số kỹ thuật & Thông tin
          </Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Số serial
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.notesText, { color: theme.colors.textPrimary }]}>
                {asset.serialNumber || '—'}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Nhà sản xuất
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {asset.manufacturer || '—'}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Model
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {asset.model || '—'}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Vị trí lưu trữ
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {asset.location || '—'}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Ngày mua
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {formatDate(asset.purchaseDate)}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Giá mua
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {formatCurrency(asset.purchasePrice)}
              </Text>
            </View>

            <View style={styles.gridItemFull}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Hạn bảo hành
              </Text>
              <Text style={[theme.typography.bodyMedium, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                {formatDate(asset.warrantyEndDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Assignment Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          testID="asset-detail-assignment"
        >
          <Text style={[theme.typography.heading3, styles.cardHeading, { color: theme.colors.textPrimary }]}>
            Thông tin cấp phát hiện tại
          </Text>

          {asset.currentAssignment ? (
            <View style={styles.assignmentDetails}>
              <View style={styles.assignmentRow}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Người sử dụng:
                </Text>
                <Text
                  style={[
                    theme.typography.bodyMedium,
                    styles.assigneeNameText, { color: theme.colors.textPrimary },
                  ]}
                  testID="asset-detail-assignee"
                >
                  {asset.currentAssignment.assignedTo?.fullName || '—'}
                </Text>
              </View>

              {asset.currentAssignment.assignedBy ? (
                <View style={styles.assignmentRow}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Người cấp phát:
                  </Text>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                    {asset.currentAssignment.assignedBy.fullName}
                  </Text>
                </View>
              ) : null}

              <View style={styles.assignmentRow}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Ngày cấp phát:
                </Text>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                  {formatDate(asset.currentAssignment.assignedAt)}
                </Text>
              </View>

              {asset.currentAssignment.expectedReturnAt ? (
                <View style={styles.assignmentRow}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Hạn trả dự kiến:
                  </Text>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                    {formatDate(asset.currentAssignment.expectedReturnAt)}
                  </Text>
                </View>
              ) : null}

              {asset.currentAssignment.notes ? (
                <View style={styles.assignmentNotesBox}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Ghi chú bàn giao:
                  </Text>
                  <Text style={[theme.typography.body, styles.gridValueText, { color: theme.colors.textPrimary }]}>
                    {asset.currentAssignment.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View
              style={[styles.emptyBox, { backgroundColor: theme.colors.surfaceVariant }]}
              testID="asset-detail-no-assignment"
            >
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Tài sản hiện đang ở kho và chưa được cấp phát cho ai.
              </Text>
            </View>
          )}
        </View>

        {/* Repair History Preview Section */}
        <RepairHistoryPreview
          assetId={asset.id}
          initialHistories={asset.repairHistories}
          testID="asset-detail-repair-history"
        />

        {/* Related Service Requests Section */}
        {asset.relatedServiceRequests && asset.relatedServiceRequests.length > 0 ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            testID="asset-detail-related-requests"
          >
            <Text style={[theme.typography.heading3, styles.cardHeading, { color: theme.colors.textPrimary }]}>
              Yêu cầu dịch vụ liên quan
            </Text>

            <View style={styles.requestsList}>
              {asset.relatedServiceRequests.map((req, idx) => (
                <Pressable
                  key={req.id || idx}
                  onPress={() => handleServiceRequestPress(req.id)}
                  style={[
                    styles.requestItem,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem yêu cầu dịch vụ ${req.requestNumber}`}
                  testID={`related-request-item-${idx}`}
                >
                  <View style={styles.requestItemHeader}>
                    <Text style={[theme.typography.caption, styles.requestNumberText, { color: theme.colors.primary }]}>
                      {req.requestNumber}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      {req.status}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[theme.typography.bodyMedium, styles.requestTitleText, { color: theme.colors.textPrimary }]}
                  >
                    {req.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionSection} testID="asset-detail-actions">
          {hasAssetManage ? (
            <View style={styles.actionButtonItem}>
              <AppButton
                title="Chỉnh sửa thông tin"
                variant="secondary"
                onPress={() => setEditModalVisible(true)}
                accessibilityLabel="Chỉnh sửa thông tin tài sản"
                testID="btn-asset-action-edit"
              />
            </View>
          ) : null}
          {canReportFault ? (
            <View style={styles.actionButtonItem}>
              <AppButton
                title="Báo hỏng / Yêu cầu dịch vụ"
                variant="primary"
                onPress={handleReportFault}
                accessibilityLabel="Báo hỏng hoặc tạo yêu cầu dịch vụ cho tài sản này"
                testID="btn-asset-report-fault"
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
      {/* Edit Asset Modal */}
      {asset ? (
        <EditAssetModal
          visible={editModalVisible}
          asset={asset}
          onClose={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
          onConflict={handleEditConflict}
        />
      ) : null}

      {/* Conflict Dialog */}
      <ConfirmationDialog
        visible={conflictDialogVisible}
        title="Xung đột dữ liệu"
        message="Dữ liệu tài sản đã được cập nhật bởi người dùng khác trong khi bạn đang thao tác. Bạn có muốn tải lại dữ liệu mới nhất không?"
        confirmText="Tải lại dữ liệu"
        cancelText="Hủy bỏ"
        onConfirm={handleReloadOnConflict}
        onCancel={() => setConflictDialogVisible(false)}
        testID="dialog-asset-conflict"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButtonTouch: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRightSpacer: {
    minWidth: 48,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  refreshErrorBanner: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCodeBox: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
  gridItemFull: {
    width: '100%',
  },
  assignmentDetails: {
    gap: 8,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentNotesBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emptyBox: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestsList: {
    gap: 8,
  },
  requestItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  requestItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  backButtonFallback: {
    marginTop: 16,
  },
  loadingSubText: {
    marginTop: 12,
  },
  backButtonText: {
    fontWeight: '600',
  },
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
  },
  heroCodeText: {
    marginTop: 2,
  },
  heroNameText: {
    marginTop: 12,
  },
  heroDescText: {
    marginTop: 12,
  },
  cardHeading: {
    marginBottom: 12,
  },
  gridValueText: {
    marginTop: 2,
  },
  assigneeNameText: {
    fontWeight: '600',
  },
  notesText: {
    marginTop: 2,
  },
  requestNumberText: {
    fontWeight: '600',
  },
  requestTitleText: {
    marginTop: 4,
  },
  editButtonTouch: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editButtonText: {
    fontWeight: '600',
  },
  actionButtonItem: {
    marginBottom: 8,
  },
});