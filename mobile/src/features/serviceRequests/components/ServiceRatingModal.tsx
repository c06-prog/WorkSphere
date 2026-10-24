/**
 * Phase 16F: Service Rating Modal (SCR-SRV-06)
 * Modal enabling the requester to rate a CLOSED service request.
 * Aligned with 06_API_CONTRACT.md section 13.10 and ServiceRequestApplicationService.java.
 *
 * Invariants & Correctness Guarantees:
 * - Only available when request status is CLOSED and allowedActions contains 'RATE'.
 * - Score is strictly mandatory (1 to 5 stars). Accessible touch targets >= 48dp.
 * - Comment is optional, max 2000 chars per backend CreateServiceRatingRequest validation.
 * - Synchronous submit lock (submittingRef) prevents rapid duplicate submissions.
 * - Maps duplicate rating error (SERVICE_RATING_ALREADY_EXISTS) and forbidden errors.
 * - Never transmits raw version (unversioned rating endpoint).
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
import { ServiceRatingResponse, ServiceRequestDetailResponse } from '../types/serviceRequestTypes';

export interface ServiceRatingModalProps {
  visible: boolean;
  request: ServiceRequestDetailResponse | null;
  onClose: () => void;
  onSuccess: (rating: ServiceRatingResponse) => void;
  testID?: string;
}

const MAX_COMMENT_LENGTH = 2000;
const STAR_SCORES = [1, 2, 3, 4, 5] as const;

export function ServiceRatingModal({
  visible,
  request,
  onClose,
  onSuccess,
  testID = 'modal-service-rating',
}: ServiceRatingModalProps) {
  const theme = useAppTheme();
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    if (visible) {
      setScore(0);
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

    if (score < 1 || score > 5) {
      setErrorMessage('Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`Nhận xét không được vượt quá ${MAX_COMMENT_LENGTH} ký tự`);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await serviceRequestApi.rateServiceRequest(request.id, {
        score,
        comment: trimmedComment.length > 0 ? trimmedComment : undefined,
      });

      if (mountedRef.current) {
        onClose();
        onSuccess(response);
      }
    } catch (err: unknown) {
      const mapped = mapServiceRequestError(err);
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
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.cardContent}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <Text
                  style={[
                    theme.typography.heading3,
                    { color: theme.colors.textPrimary },
                  ]}
                  accessibilityRole="header"
                >
                  Đánh giá dịch vụ
                </Text>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Đóng modal đánh giá"
                  testID="btn-close-rating-modal"
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>

              {/* Context Title */}
              <Text
                style={[
                  theme.typography.body,
                  styles.requestTitle,
                  { color: theme.colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {request.title}
              </Text>

              {/* Star Selection Row */}
              <View style={styles.starSection}>
                <Text
                  style={[
                    theme.typography.caption,
                    styles.sectionLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Chất lượng xử lý: <Text style={{ color: theme.colors.error }}>*</Text>
                </Text>
                <View style={styles.starsRow} accessibilityRole="radiogroup">
                  {STAR_SCORES.map(s => {
                    const isSelected = score >= s;
                    return (
                      <Pressable
                        key={`star-${s}`}
                        onPress={() => {
                          setScore(s);
                          setErrorMessage(null);
                        }}
                        style={({ pressed }) => [
                          styles.starTouchTarget,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: score === s }}
                        accessibilityLabel={`${s} sao`}
                        testID={`btn-rating-star-${s}`}
                      >
                        <Text
                          style={[
                            styles.starIcon,
                            {
                              color: isSelected
                                ? theme.colors.warning
                                : theme.colors.border,
                            },
                          ]}
                        >
                          ★
                        </Text>
                        <Text
                          style={[
                            theme.typography.caption,
                            {
                              color: isSelected
                                ? theme.colors.warning
                                : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {s}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Comment Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.sectionLabel,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Nhận xét / Ý kiến đóng góp (tùy chọn)
                  </Text>
                  <Text
                    style={[
                      theme.typography.caption,
                      {
                        color:
                          comment.length > MAX_COMMENT_LENGTH
                            ? theme.colors.error
                            : theme.colors.textSecondary,
                      },
                    ]}
                    testID="rating-comment-counter"
                  >
                    {comment.length}/{MAX_COMMENT_LENGTH}
                  </Text>
                </View>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Nhập cảm nhận của bạn về chất lượng hỗ trợ..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.textInput,
                    theme.typography.body,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                  accessibilityLabel="Nhận xét chất lượng dịch vụ"
                  testID="input-rating-comment"
                />
              </View>

              {/* Error Banner */}
              {errorMessage ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.error,
                    },
                  ]}
                  accessibilityRole="alert"
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: theme.colors.error },
                    ]}
                    testID="rating-error-message"
                  >
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <AppButton
                  title="Hủy bỏ"
                  variant="outline"
                  onPress={onClose}
                  disabled={submitting}
                  style={styles.cancelButton}
                  testID="btn-cancel-rating"
                />
                <AppButton
                  title={submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  variant="primary"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting || score < 1}
                  style={styles.submitButton}
                  testID="btn-submit-rating"
                />
              </View>
            </ScrollView>
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
  card: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    maxHeight: '90%',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestTitle: {
    marginTop: -8,
  },
  starSection: {
    gap: 8,
  },
  sectionLabel: {
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  starTouchTarget: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  starIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
  },
  submitButton: {
    flex: 1,
    minHeight: 48,
  },
});
