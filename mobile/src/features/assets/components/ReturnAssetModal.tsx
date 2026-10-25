/**
 * Phase 17E: Return Asset Modal (SCR-AST-06)
 * Modal workflow triggered from AssetDetailScreen for returning an ASSIGNED asset.
 * Conforms strictly to 06_API_CONTRACT.md section 14.7 and ReturnAssetRequest.
 *
 * Invariants & Correctness Guarantees:
 * - assetId is the Asset UUID (never assetCode).
 * - assignmentId is the active AssetAssignment UUID from currentAssignment.id.
 * - version sent is AssetAssignment.version (AssetAssignmentResponse.version / number).
 *   TUYỆT ĐỐI KHÔNG DÙNG Asset.version CHO RETURN.
 * - resultingAssetStatus strictly allows warehouse states:
 *   'AVAILABLE' | 'MAINTENANCE' | 'BROKEN' | 'RETIRED'.
 *   TUYỆT ĐỐI CẤM 'ASSIGNED'.
 * - returnCondition is optional (max 500 chars).
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - Optimistic locking: on HTTP 409 conflict, triggers onConflict() dialog with reload action.
 * - On success: invokes onSuccess(result) and closes modal.
 * - Presentation-safe error mapping using mapAssetError.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppButton } from '../../../shared/components/AppButton';
import { AppTextInput } from '../../../shared/components/AppTextInput';
import { assetApi } from '../api/assetApi';
import { mapAssetError } from '../errors/assetErrorMapper';
import {
  AssetAssignmentResponse,
  AssetDetailResponse,
  AssetStatus,
  ReturnAssetRequest,
} from '../types/assetTypes';

export interface ReturnAssetModalProps {
  visible: boolean;
  asset: AssetDetailResponse;
  assignmentVersion: number;
  onClose: () => void;
  onSuccess: (result: AssetAssignmentResponse) => void;
  onConflict?: () => void;
}

const ALLOWED_RESULTING_STATUSES: {
  status: Exclude<AssetStatus, 'ASSIGNED'>;
  label: string;
  description: string;
}[] = [
  {
    status: 'AVAILABLE',
    label: 'Sẵn sàng (Kho)',
    description: 'Tài sản hoạt động tốt, sẵn sàng cấp phát lại',
  },
  {
    status: 'MAINTENANCE',
    label: 'Bảo trì',
    description: 'Cần bảo dưỡng, vệ sinh hoặc kiểm tra kỹ thuật',
  },
  {
    status: 'BROKEN',
    label: 'Hỏng hóc',
    description: 'Tài sản phát sinh lỗi hoặc hỏng cần sửa chữa',
  },
  {
    status: 'RETIRED',
    label: 'Thanh lý',
    description: 'Hết hạn sử dụng hoặc không còn giá trị khai thác',
  },
];

export function ReturnAssetModal({
  visible,
  asset,
  assignmentVersion,
  onClose,
  onSuccess,
  onConflict,
}: ReturnAssetModalProps) {
  const theme = useAppTheme();

  // Resulting status selection
  const [resultingStatus, setResultingStatus] = useState<Exclude<AssetStatus, 'ASSIGNED'>>('AVAILABLE');

  // Condition notes
  const [returnCondition, setReturnCondition] = useState('');

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Synchronous submit lock
  const submittingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setResultingStatus('AVAILABLE');
      setReturnCondition('');
      setErrorMessage(null);
      setFieldErrors({});
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [visible, asset?.id, asset?.currentAssignment?.id]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!asset.currentAssignment?.id) {
      errors.assignment = 'Không tìm thấy thông tin lượt phân công đang hoạt động';
    }

    if (returnCondition.length > 500) {
      errors.returnCondition = 'Tình trạng bàn giao tối đa 500 ký tự';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!validate() || !asset.currentAssignment?.id) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: ReturnAssetRequest = {
      resultingAssetStatus: resultingStatus,
      returnCondition: returnCondition.trim() ? returnCondition.trim() : undefined,
      version: assignmentVersion, // AssetAssignment.version
    };

    try {
      const result = await assetApi.returnAsset(
        asset.id,
        asset.currentAssignment.id,
        payload
      );
      onSuccess(result);
    } catch (err: unknown) {
      const mapped = mapAssetError(err);
      if (mapped.isConflict && onConflict) {
        onConflict();
        return;
      }
      setErrorMessage(mapped.message);
      if (mapped.fieldErrors) {
        setFieldErrors(mapped.fieldErrors);
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submittingRef.current) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      testID="return-asset-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View
          style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}
          testID="return-asset-sheet"
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerTitleGroup}>
              <Text
                style={[
                  theme.typography.heading2,
                  styles.headerTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Thu hồi tài sản
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Mã: {asset.assetCode} — {asset.name}
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.closeButton}
              accessibilityLabel="Đóng modal thu hồi tài sản"
              accessibilityRole="button"
              testID="btn-close-return-modal"
            >
              <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Global Error Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.errorContainer,
                    borderColor: theme.colors.error,
                  },
                ]}
                testID="return-asset-error-banner"
              >
                <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Current Assignee Summary */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                },
              ]}
              testID="return-assignee-summary"
            >
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Đang bàn giao cho:
              </Text>
              <Text
                style={[
                  theme.typography.bodyMedium,
                  styles.assigneeNameText,
                  { color: theme.colors.textPrimary },
                ]}
                testID="text-return-assignee"
              >
                {asset.currentAssignment?.assignedTo?.fullName || '—'}
              </Text>
            </View>

            {/* Resulting Asset Status Selector */}
            <View style={styles.formGroup}>
              <Text
                style={[
                  theme.typography.label,
                  styles.groupLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Trạng thái tài sản sau thu hồi <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={styles.statusList}>
                {ALLOWED_RESULTING_STATUSES.map(item => {
                  const isSelected = resultingStatus === item.status;
                  return (
                    <Pressable
                      key={item.status}
                      onPress={() => setResultingStatus(item.status)}
                      style={[
                        styles.statusOption,
                        {
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: isSelected
                            ? theme.colors.primaryContainer
                            : theme.colors.surface,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Trạng thái ${item.label}: ${item.description}`}
                      testID={`status-option-${item.status}`}
                    >
                      <View style={styles.radioRow}>
                        <View
                          style={[
                            styles.radioCircle,
                            {
                              borderColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.border,
                            },
                          ]}
                        >
                          {isSelected ? (
                            <View
                              style={[
                                styles.radioDot,
                                { backgroundColor: theme.colors.primary },
                              ]}
                            />
                          ) : null}
                        </View>
                        <View style={styles.radioLabelGroup}>
                          <Text
                            style={[
                              theme.typography.bodyMedium,
                              isSelected ? styles.boldWeight : styles.normalWeight,
                              {
                                color: isSelected
                                  ? theme.colors.primary
                                  : theme.colors.textPrimary,
                              },
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Text
                            style={[
                              theme.typography.caption,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Return Condition Description */}
            <View style={styles.formGroup}>
              <AppTextInput
                label="Tình trạng khi thu hồi / Bàn giao"
                value={returnCondition}
                onChangeText={text => {
                  setReturnCondition(text);
                  if (fieldErrors.returnCondition) {
                    setFieldErrors(prev => ({ ...prev, returnCondition: '' }));
                  }
                }}
                placeholder="Ví dụ: Thiết bị hoạt động tốt, có xước nhẹ viền máy, đủ phụ kiện"
                multiline
                numberOfLines={3}
                maxLength={500}
                error={fieldErrors.returnCondition}
                testID="input-return-condition"
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <View style={styles.footerButtonWrapper}>
              <AppButton
                title="Hủy bỏ"
                variant="outline"
                onPress={handleClose}
                disabled={isSubmitting}
                accessibilityLabel="Hủy bỏ thu hồi tài sản"
                testID="btn-cancel-return-asset"
              />
            </View>
            <View style={styles.footerButtonWrapper}>
              <AppButton
                title={isSubmitting ? 'Đang thu hồi...' : 'Xác nhận thu hồi'}
                variant="primary"
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                accessibilityLabel="Xác nhận thu hồi tài sản về kho"
                testID="btn-submit-return-asset"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    minHeight: '60%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    marginBottom: 2,
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  formContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  assigneeNameText: {
    marginTop: 4,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: '#D32F2F',
  },
  statusList: {
    gap: 8,
  },
  statusOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabelGroup: {
    flex: 1,
  },
  boldWeight: {
    fontWeight: '700',
  },
  normalWeight: {
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButtonWrapper: {
    flex: 1,
  },
});
