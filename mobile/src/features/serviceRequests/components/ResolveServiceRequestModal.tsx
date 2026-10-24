/**
 * Phase 16E: Resolve Service Request Modal
 * Modal allowing handler/admin to submit a solution comment when resolving a service request (RESOLVE).
 * Aligned with ServiceRequestApplicationService.java and 06_API_CONTRACT.md section 13.7.
 *
 * Invariants:
 * - Status transition: IN_PROGRESS -> RESOLVED.
 * - Solution comment is mandatory and non-blank (SERVICE_RESOLUTION_REQUIRED).
 * - Max length 1000 characters.
 * - Synchronous submit lock.
 * - Handles optimistic locking (HTTP 409 OPTIMISTIC_LOCK_CONFLICT).
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

export interface ResolveServiceRequestModalProps {
  visible: boolean;
  request: ServiceRequestDetailResponse | null;
  onClose: () => void;
  onSuccess: () => void;
  onConflict?: () => void;
  testID?: string;
}

const MAX_COMMENT_LENGTH = 1000;

export function ResolveServiceRequestModal({
  visible,
  request,
  onClose,
  onSuccess,
  onConflict,
  testID = 'resolve-service-request-modal',
}: ResolveServiceRequestModalProps) {
  const theme = useAppTheme();
  const [comment, setComment] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    if (visible) {
      setComment('');
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

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setErrorMessage('Cần cập nhật giải pháp xử lý khi hoàn tất yêu cầu');
      return;
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`Giải pháp xử lý không được vượt quá ${MAX_COMMENT_LENGTH} ký tự`);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await serviceRequestApi.updateServiceRequestStatus(request.id, {
        status: 'RESOLVED',
        comment: trimmedComment,
        version: request.version,
      });

      if (mountedRef.current) {
        onClose();
        onSuccess();
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
                  Giải quyết yêu cầu
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
                testID="btn-close-resolve-modal"
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
                  testID="resolve-service-request-error"
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
                Giải pháp xử lý: *
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
                  value={comment}
                  onChangeText={val => {
                    setComment(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Nhập giải pháp xử lý chi tiết..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={MAX_COMMENT_LENGTH}
                  style={[
                    styles.textInput,
                    theme.typography.body,
                    { color: theme.colors.textPrimary },
                  ]}
                  testID="input-resolve-service-request-comment"
                  accessibilityLabel="Giải pháp xử lý yêu cầu"
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
                Ký tự: {comment.trim().length}/{MAX_COMMENT_LENGTH}
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
                  testID="btn-cancel-resolve-modal"
                />
                <AppButton
                  title="Xác nhận giải quyết"
                  variant="primary"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.submitBtn}
                  testID="btn-submit-resolve-service-request"
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
