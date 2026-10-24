/**
 * Phase 16E: Reject Resolution Bottom Sheet / Modal (SCR-SRV-03)
 * Modal enabling the requester to reject a resolved service request.
 * Aligned with wireframe spec 04_WIREFRAME_SPEC.md section 7 and 06_API_CONTRACT.md section 13.7.1.
 *
 * Invariants & Correctness Guarantees:
 * - Only available when status is RESOLVED and REJECT_RESOLUTION is present in allowedActions.
 * - Reason is strictly mandatory, non-blank, max 1000 chars.
 * - Passes authoritative version to POST /reject-resolution.
 * - Synchronous submit lock (submittingRef) prevents rapid duplicate submissions.
 * - Emits onConflict when HTTP 409 OPTIMISTIC_LOCK_CONFLICT is encountered.
 * - Accessible: minimum 48dp touch targets, character counter, explicit testIDs.
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
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppButton } from '../../../shared/components/AppButton';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { mapServiceRequestError } from '../errors/serviceRequestErrorMapper';
import { ServiceRequestDetailResponse } from '../types/serviceRequestTypes';

export interface RejectResolutionModalProps {
  visible: boolean;
  request: ServiceRequestDetailResponse | null;
  onClose: () => void;
  onSuccess: (updated: ServiceRequestDetailResponse) => void;
  onConflict?: () => void;
  testID?: string;
}

const MAX_REASON_LENGTH = 1000;

export function RejectResolutionModal({
  visible,
  request,
  onClose,
  onSuccess,
  onConflict,
  testID = 'reject-resolution-modal',
}: RejectResolutionModalProps) {
  const theme = useAppTheme();
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    if (visible) {
      setReason('');
      setErrorMessage(null);
      setSubmitting(false);
      submittingRef.current = false;
    }
    return () => {
      mountedRef.current = false;
    };
  }, [visible]);

  const handleSubmit = async () => {
    if (submittingRef.current || submitting || !request) {
      return;
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setErrorMessage('Vui lòng nêu rõ lý do sự cố chưa được xử lý');
      return;
    }

    if (trimmedReason.length > MAX_REASON_LENGTH) {
      setErrorMessage(`Lý do từ chối không được vượt quá ${MAX_REASON_LENGTH} ký tự`);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await serviceRequestApi.rejectResolution(request.id, {
        reason: trimmedReason,
        version: request.version,
      });

      if (mountedRef.current) {
        onClose();
        onSuccess(updated);
      }
    } catch (err: unknown) {
      const mapped = mapServiceRequestError(err);
      if (mapped.isConflict) {
        if (mountedRef.current) {
          onClose();
          onConflict?.();
        }
        return;
      }

      if (mountedRef.current) {
        setErrorMessage(mapped.message);
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  if (!request) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.scrim}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: theme.radii.large,
                borderTopRightRadius: theme.radii.large,
              },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <View>
                <Text
                  style={[
                    theme.typography.heading3,
                    styles.titleText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Từ chối kết quả xử lý
                </Text>
                <Text
                  style={[
                    theme.typography.caption,
                    styles.requestNumberText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {request.requestNumber}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                testID="btn-close-reject-modal"
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Error Banner */}
              {errorMessage ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: theme.colors.errorContainer,
                      borderColor: theme.colors.error,
                      borderRadius: theme.radii.small,
                    },
                  ]}
                  testID="reject-resolution-error"
                  accessibilityRole="alert"
                >
                  <Text style={[theme.typography.body, { color: theme.colors.error }]}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  theme.typography.bodyMedium,
                  styles.inputPrompt,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Vui lòng nêu rõ lý do sự cố chưa được xử lý: *
              </Text>

              {/* Text Input */}
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: errorMessage ? theme.colors.error : theme.colors.border,
                    borderRadius: theme.radii.medium,
                  },
                ]}
              >
                <TextInput
                  value={reason}
                  onChangeText={val => {
                    setReason(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Nhập lý do từ chối kết quả..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={MAX_REASON_LENGTH}
                  style={[
                    styles.textInput,
                    theme.typography.body,
                    { color: theme.colors.textPrimary },
                  ]}
                  testID="input-reject-resolution-reason"
                  accessibilityLabel="Lý do từ chối kết quả xử lý"
                />
              </View>

              {/* Character Count */}
              <Text
                style={[
                  theme.typography.caption,
                  styles.charCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Ký tự: {reason.trim().length}/{MAX_REASON_LENGTH}
              </Text>
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <View style={styles.actionRow}>
                <AppButton
                  title="Hủy bỏ"
                  variant="outline"
                  onPress={onClose}
                  disabled={submitting}
                  style={styles.cancelBtn}
                  testID="btn-cancel-reject-modal"
                />
                <AppButton
                  title="Xác nhận gửi lại"
                  variant="primary"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.submitBtn}
                  testID="btn-submit-reject-resolution"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestNumberText: {
    marginTop: 2,
  },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 20,
  },
  errorBanner: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputPrompt: {
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    padding: 12,
    minHeight: 120,
  },
  textInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1,
  },
});
