/**
 * Phase 17E: Assign Asset Modal (SCR-AST-05)
 * Modal workflow triggered from AssetDetailScreen for assigning an AVAILABLE asset to a user.
 * Conforms strictly to 06_API_CONTRACT.md section 14.6 and AssignAssetRequest.
 *
 * Invariants & Correctness Guarantees:
 * - assetId is the Asset UUID (never assetCode).
 * - assignedTo is the User UUID selected from UserPickerModal (human-readable name shown, raw UUID never displayed).
 * - AssignAssetRequest: { assignedTo, expectedReturnAt, notes }. NO version sent.
 * - expectedReturnAt is optional; if provided, formatted as ISO 8601 UTC Instant (YYYY-MM-DDTHH:mm:ssZ).
 * - notes is optional (max 1000 chars).
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - On success: invokes onSuccess(assignment) and closes modal.
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
import { UserPickerModal } from '../../directory/components/UserPickerModal';
import { UserDirectoryItem } from '../../directory/api/directoryTypes';
import { assetApi } from '../api/assetApi';
import { mapAssetError } from '../errors/assetErrorMapper';
import {
  AssetAssignmentResponse,
  AssetDetailResponse,
  AssignAssetRequest,
} from '../types/assetTypes';

export interface AssignAssetModalProps {
  visible: boolean;
  asset: AssetDetailResponse;
  onClose: () => void;
  onSuccess: (assignment: AssetAssignmentResponse) => void;
  onConflict?: () => void;
}

export function AssignAssetModal({
  visible,
  asset,
  onClose,
  onSuccess,
  onConflict,
}: AssignAssetModalProps) {
  const theme = useAppTheme();

  // Selected assignee state
  const [selectedUser, setSelectedUser] = useState<UserDirectoryItem | null>(null);
  const [userPickerVisible, setUserPickerVisible] = useState(false);

  // Form input states
  const [expectedReturnDate, setExpectedReturnDate] = useState(''); // YYYY-MM-DD
  const [notes, setNotes] = useState('');

  // UI status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Synchronous submit lock
  const submittingRef = useRef(false);

  const prevVisibleRef = useRef(false);

  // Reset form when modal opens with asset
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setSelectedUser(null);
      setExpectedReturnDate('');
      setNotes('');
      setErrorMessage(null);
      setFieldErrors({});
      submittingRef.current = false;
      setIsSubmitting(false);
    }
    prevVisibleRef.current = visible;
  }, [visible, asset?.id]);

  const handleUserSelectConfirm = (selectedUsers: UserDirectoryItem[]) => {
    if (selectedUsers.length > 0) {
      setSelectedUser(selectedUsers[0]);
      setFieldErrors(prev => ({ ...prev, assignedTo: '' }));
    }
    setUserPickerVisible(false);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedUser) {
      errors.assignedTo = 'Vui lòng chọn người nhận bàn giao';
    }

    if (expectedReturnDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(expectedReturnDate.trim())) {
        errors.expectedReturnDate = 'Hạn trả phải đúng định dạng YYYY-MM-DD';
      }
    }

    if (notes.length > 1000) {
      errors.notes = 'Ghi chú tối đa 1000 ký tự';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!validate() || !selectedUser) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    let isoExpectedReturnAt: string | undefined;
    if (expectedReturnDate.trim()) {
      // Build ISO UTC Instant: YYYY-MM-DDT17:00:00Z (end of working day)
      isoExpectedReturnAt = `${expectedReturnDate.trim()}T17:00:00Z`;
    }

    const payload: AssignAssetRequest = {
      assignedTo: selectedUser.id,
      expectedReturnAt: isoExpectedReturnAt,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    try {
      const result = await assetApi.assignAsset(asset.id, payload);
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
      testID="assign-asset-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View
          style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}
          testID="assign-asset-sheet"
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
                Cấp phát tài sản
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
              accessibilityLabel="Đóng modal cấp phát tài sản"
              accessibilityRole="button"
              testID="btn-close-assign-modal"
            >
              <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          {/* Form Body */}
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
                testID="assign-asset-error-banner"
              >
                <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Target Assignee Selector */}
            <View style={styles.formGroup}>
              <Text
                style={[
                  theme.typography.label,
                  styles.groupLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Người nhận bàn giao <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <Pressable
                onPress={() => setUserPickerVisible(true)}
                style={[
                  styles.selectorBox,
                  {
                    borderColor: fieldErrors.assignedTo
                      ? theme.colors.error
                      : theme.colors.border,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                accessibilityLabel="Chọn người nhận bàn giao tài sản"
                accessibilityRole="button"
                testID="btn-select-assignee"
              >
                <Text
                  style={[
                    theme.typography.body,
                    styles.selectorText,
                    {
                      color: selectedUser
                        ? theme.colors.textPrimary
                        : theme.colors.textSecondary,
                    },
                  ]}
                  testID="text-selected-assignee"
                >
                  {selectedUser
                    ? `${selectedUser.fullName} (${selectedUser.email || selectedUser.username})`
                    : 'Nhấn để chọn nhân viên từ danh bạ...'}
                </Text>
                <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>▼</Text>
              </Pressable>
              {fieldErrors.assignedTo ? (
                <Text
                  style={[
                    theme.typography.caption,
                    styles.fieldErrorText,
                    { color: theme.colors.error },
                  ]}
                  testID="error-assigned-to"
                >
                  {fieldErrors.assignedTo}
                </Text>
              ) : null}
            </View>

            {/* Expected Return Date */}
            <View style={styles.formGroup}>
              <AppTextInput
                label="Hạn trả dự kiến (YYYY-MM-DD)"
                value={expectedReturnDate}
                onChangeText={text => {
                  setExpectedReturnDate(text);
                  if (fieldErrors.expectedReturnDate) {
                    setFieldErrors(prev => ({ ...prev, expectedReturnDate: '' }));
                  }
                }}
                placeholder="2026-12-31"
                maxLength={10}
                error={fieldErrors.expectedReturnDate}
                testID="input-assign-expected-return-date"
              />
              <Text
                style={[
                  theme.typography.caption,
                  styles.hintText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Không bắt buộc nếu cấp phát dài hạn hoặc không xác định thời hạn.
              </Text>
            </View>

            {/* Handover Notes */}
            <View style={styles.formGroup}>
              <AppTextInput
                label="Ghi chú bàn giao"
                value={notes}
                onChangeText={text => {
                  setNotes(text);
                  if (fieldErrors.notes) {
                    setFieldErrors(prev => ({ ...prev, notes: '' }));
                  }
                }}
                placeholder="Ví dụ: Bàn giao máy kèm củ sạc 140W và cáp MagSafe"
                multiline
                numberOfLines={3}
                maxLength={1000}
                error={fieldErrors.notes}
                testID="input-assign-notes"
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
                accessibilityLabel="Hủy bỏ cấp phát tài sản"
                testID="btn-cancel-assign-asset"
              />
            </View>
            <View style={styles.footerButtonWrapper}>
              <AppButton
                title={isSubmitting ? 'Đang cấp phát...' : 'Xác nhận cấp phát'}
                variant="primary"
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                accessibilityLabel="Xác nhận cấp phát tài sản cho nhân viên"
                testID="btn-submit-assign-asset"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Directory User Picker Modal */}
      <UserPickerModal
        visible={userPickerVisible}
        mode="single"
        title="Chọn nhân viên nhận tài sản"
        selectedIds={selectedUser ? [selectedUser.id] : []}
        onConfirm={handleUserSelectConfirm}
        onCancel={() => setUserPickerVisible(false)}
        testID="assign-user-picker-modal"
      />
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
  selectorBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  selectorText: {
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    fontSize: 12,
  },
  fieldErrorText: {
    marginTop: 4,
  },
  hintText: {
    marginTop: 4,
    fontStyle: 'italic',
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
