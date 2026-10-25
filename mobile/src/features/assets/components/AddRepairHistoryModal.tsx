/**
 * Phase 17F-CORRECTIVE: Add Repair History Modal
 * Modal workflow triggered from AssetDetailScreen for adding an immutable repair or maintenance audit record.
 * Conforms strictly to 06_API_CONTRACT.md section 14.9.1 and CreateAssetRepairHistoryRequest.
 *
 * Invariants & Correctness Guarantees:
 * - assetId is the Asset UUID (never assetCode).
 * - CreateAssetRepairHistoryRequest: { repairType, description, vendorName, cost, startedAt, completedAt, result }.
 * - startedAt is required, formatted as ISO 8601 UTC Instant (YYYY-MM-DDTHH:mm:ssZ).
 * - completedAt is optional; if provided, must be >= startedAt.
 * - cost is optional (must be non-negative numeric).
 * - description is required (non-blank).
 * - vendorName (max 255 chars), result (max 1000 chars) are optional.
 * - Only users with ASSET_MANAGE or ADMIN authority can submit.
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - On success: invokes onCreated(record) and closes modal.
 * - Presentation-safe error mapping using mapAssetError (never leaks raw stack traces).
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
import { useAuth } from '../../../app/auth/AuthProvider';
import { assetApi } from '../api/assetApi';
import { mapAssetError } from '../errors/assetErrorMapper';
import {
  AssetRepairHistoryResponse,
  AssetRepairType,
  CreateAssetRepairHistoryRequest,
} from '../types/assetTypes';

export interface AddRepairHistoryModalProps {
  visible: boolean;
  assetId: string;
  onClose: () => void;
  onCreated: (record: AssetRepairHistoryResponse) => void;
  testID?: string;
}

const REPAIR_TYPES: { type: AssetRepairType; label: string }[] = [
  { type: 'MAINTENANCE', label: 'Bảo dưỡng' },
  { type: 'REPAIR', label: 'Sửa chữa' },
  { type: 'INSPECTION', label: 'Kiểm định' },
  { type: 'UPGRADE', label: 'Nâng cấp' },
];

export function AddRepairHistoryModal({
  visible,
  assetId,
  onClose,
  onCreated,
  testID = 'add-repair-history-modal',
}: AddRepairHistoryModalProps) {
  const theme = useAppTheme();
  const { currentUser } = useAuth();

  // Permission verification: ASSET_MANAGE or ADMIN
  const hasAssetManage =
    (currentUser?.permissions?.includes('ASSET_MANAGE') ?? false) ||
    (currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false);

  // Form input states
  const [repairType, setRepairType] = useState<AssetRepairType>('MAINTENANCE');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [cost, setCost] = useState('');
  const [startedDate, setStartedDate] = useState(''); // YYYY-MM-DD
  const [completedDate, setCompletedDate] = useState(''); // YYYY-MM-DD
  const [result, setResult] = useState('');

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Synchronous submit lock
  const submittingRef = useRef(false);
  const prevVisibleRef = useRef(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      const today = new Date().toISOString().slice(0, 10);
      setRepairType('MAINTENANCE');
      setDescription('');
      setVendorName('');
      setCost('');
      setStartedDate(today);
      setCompletedDate('');
      setResult('');
      setErrorMessage(null);
      setFieldErrors({});
      submittingRef.current = false;
      setIsSubmitting(false);
    }
    prevVisibleRef.current = visible;
  }, [visible, assetId]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!hasAssetManage) {
      setErrorMessage('Bạn không có quyền thêm lịch sử sửa chữa');
      return false;
    }

    if (!description.trim()) {
      errors.description = 'Mô tả nội dung sửa chữa không được để trống';
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startedDate.trim()) {
      errors.startedDate = 'Ngày bắt đầu không được để trống';
    } else if (!dateRegex.test(startedDate.trim())) {
      errors.startedDate = 'Ngày bắt đầu phải đúng định dạng YYYY-MM-DD';
    }

    if (completedDate.trim()) {
      if (!dateRegex.test(completedDate.trim())) {
        errors.completedDate = 'Ngày hoàn thành phải đúng định dạng YYYY-MM-DD';
      } else if (startedDate.trim() && dateRegex.test(startedDate.trim())) {
        if (completedDate.trim() < startedDate.trim()) {
          errors.completedDate = 'Ngày hoàn thành phải sau hoặc cùng ngày bắt đầu';
        }
      }
    }

    if (cost.trim()) {
      const parsedCost = Number(cost.trim());
      if (isNaN(parsedCost) || parsedCost < 0) {
        errors.cost = 'Chi phí phải là số không âm';
      }
    }

    if (vendorName.length > 255) {
      errors.vendorName = 'Đơn vị thực hiện tối đa 255 ký tự';
    }

    if (result.length > 1000) {
      errors.result = 'Kết quả tối đa 1000 ký tự';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // 1. Fail-closed permission check
    if (!hasAssetManage) {
      setErrorMessage('Bạn không có quyền thực hiện thao tác này');
      return;
    }

    // 2. Synchronous submit lock
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    const isoStartedAt = `${startedDate.trim()}T08:00:00Z`;
    let isoCompletedAt: string | undefined;
    if (completedDate.trim()) {
      isoCompletedAt = `${completedDate.trim()}T17:00:00Z`;
    }

    const payload: CreateAssetRepairHistoryRequest = {
      repairType,
      description: description.trim(),
      vendorName: vendorName.trim() ? vendorName.trim() : undefined,
      cost: cost.trim() ? Number(cost.trim()) : undefined,
      startedAt: isoStartedAt,
      completedAt: isoCompletedAt,
      result: result.trim() ? result.trim() : undefined,
    };

    try {
      const response = await assetApi.createRepairHistory(assetId, payload);
      onCreated(response);
      onClose();
    } catch (err: unknown) {
      const presentationError = mapAssetError(err);
      setErrorMessage(presentationError.message);
      if (presentationError.fieldErrors) {
        setFieldErrors(presentationError.fieldErrors);
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text
              style={[
                theme.typography.heading3,
                { color: theme.colors.textPrimary },
              ]}
            >
              Ghi nhận bảo dưỡng / sửa chữa
            </Text>
            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Đóng modal"
              testID="btn-modal-close"
              style={styles.closeButton}
            >
              <Text
                style={[
                  theme.typography.heading3,
                  { color: theme.colors.textSecondary },
                ]}
              >
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Form Scroll Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* General Error Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.errorContainer,
                    borderColor: theme.colors.error,
                  },
                ]}
                testID="add-repair-error-banner"
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.error },
                  ]}
                >
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Repair Type Selector */}
            <Text
              style={[
                theme.typography.caption,
                styles.label,
                { color: theme.colors.textSecondary },
              ]}
            >
              Loại dịch vụ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.typeSelectorRow}>
              {REPAIR_TYPES.map(item => {
                const isSelected = repairType === item.type;
                return (
                  <Pressable
                    key={item.type}
                    onPress={() => {
                      setRepairType(item.type);
                    }}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    testID={`chip-repair-type-${item.type.toLowerCase()}`}
                  >
                    <Text
                      style={[
                        theme.typography.caption,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        {
                          color: isSelected
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Description (Required) */}
            <AppTextInput
              label="Nội dung bảo dưỡng / sửa chữa"
              value={description}
              onChangeText={text => {
                setDescription(text);
                if (fieldErrors.description) {
                  setFieldErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              placeholder="VD: Thay thế bàn phím, vệ sinh tra keo tản nhiệt"
              multiline
              numberOfLines={3}
              error={fieldErrors.description}
              testID="input-repair-description"
            />

            {/* Started Date & Completed Date */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Ngày bắt đầu (YYYY-MM-DD)"
                  value={startedDate}
                  onChangeText={text => {
                    setStartedDate(text);
                    if (fieldErrors.startedDate) {
                      setFieldErrors(prev => ({ ...prev, startedDate: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  error={fieldErrors.startedDate}
                  testID="input-repair-started-date"
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Ngày xong (YYYY-MM-DD)"
                  value={completedDate}
                  onChangeText={text => {
                    setCompletedDate(text);
                    if (fieldErrors.completedDate) {
                      setFieldErrors(prev => ({ ...prev, completedDate: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  error={fieldErrors.completedDate}
                  testID="input-repair-completed-date"
                />
              </View>
            </View>

            {/* Cost & Vendor */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Chi phí (VNĐ)"
                  value={cost}
                  onChangeText={text => {
                    setCost(text);
                    if (fieldErrors.cost) {
                      setFieldErrors(prev => ({ ...prev, cost: '' }));
                    }
                  }}
                  placeholder="VD: 500000"
                  keyboardType="numeric"
                  error={fieldErrors.cost}
                  testID="input-repair-cost"
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Đơn vị thực hiện"
                  value={vendorName}
                  onChangeText={text => {
                    setVendorName(text);
                    if (fieldErrors.vendorName) {
                      setFieldErrors(prev => ({ ...prev, vendorName: '' }));
                    }
                  }}
                  placeholder="VD: FPT Services"
                  error={fieldErrors.vendorName}
                  testID="input-repair-vendor-name"
                />
              </View>
            </View>

            {/* Result */}
            <AppTextInput
              label="Kết quả xử lý"
              value={result}
              onChangeText={text => {
                setResult(text);
                if (fieldErrors.result) {
                  setFieldErrors(prev => ({ ...prev, result: '' }));
                }
              }}
              placeholder="VD: Đã thay thế thành công, thiết bị hoạt động tốt"
              multiline
              numberOfLines={2}
              error={fieldErrors.result}
              testID="input-repair-result"
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <View style={styles.actionBtn}>
              <AppButton
                title="Hủy"
                variant="outline"
                onPress={handleClose}
                disabled={isSubmitting}
                testID="btn-modal-cancel"
              />
            </View>
            <View style={styles.actionBtn}>
              <AppButton
                title="Ghi nhận"
                variant="primary"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                testID="btn-modal-submit"
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipTextSelected: {
    fontWeight: '700',
  },
  chipTextUnselected: {
    fontWeight: '500',
  },
  requiredStar: {
    color: '#EF4444',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
