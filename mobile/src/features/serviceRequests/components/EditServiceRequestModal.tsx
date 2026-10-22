/**
 * Phase 16D: Edit Service Request Modal
 * Modal flow for requester to update an existing OPEN Service Request.
 * Conforms strictly to 06_API_CONTRACT.md section 13.5 and UpdateServiceRequestRequest.
 *
 * Invariants & Correctness Guarantees:
 * - Pre-fills fields from authoritative ServiceRequestDetailResponse:
 *   category, title, description, priority, asset, version.
 * - Allows changing category via ServiceCategorySelectModal.
 * - Strictly zero raw database UUIDs or internal version numbers exposed in presentation.
 * - Preserves asset reference internally (sent as assetId).
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - Optimistic locking: on HTTP 409 conflict (isConflict: true), invokes onConflict()
 *   allowing the parent screen to prompt user to reload latest authoritative data.
 * - On success, invokes onSuccess(updated) with the updated ServiceRequestDetailResponse.
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
import { PriorityBadge } from '../../../shared/components/PriorityBadge';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { mapServiceRequestError } from '../errors/serviceRequestErrorMapper';
import {
  ServiceCategoryResponse,
  ServicePriority,
  ServiceRequestDetailResponse,
  UpdateServiceRequestRequest,
} from '../types/serviceRequestTypes';
import { ServiceCategorySelectModal } from './ServiceCategorySelectModal';

const PRIORITIES: { priority: ServicePriority; label: string }[] = [
  { priority: 'CRITICAL', label: 'Khẩn cấp' },
  { priority: 'HIGH', label: 'Cao' },
  { priority: 'MEDIUM', label: 'Trung bình' },
  { priority: 'LOW', label: 'Thấp' },
];

export interface EditServiceRequestModalProps {
  visible: boolean;
  request: ServiceRequestDetailResponse;
  onClose: () => void;
  onSuccess: (updated: ServiceRequestDetailResponse) => void;
  onConflict: () => void;
}

export function EditServiceRequestModal({
  visible,
  request,
  onClose,
  onSuccess,
  onConflict,
}: EditServiceRequestModalProps) {
  const theme = useAppTheme();

  // Form State
  const [title, setTitle] = useState<string>(() => request?.title ?? '');
  const [description, setDescription] = useState<string>(() => request?.description ?? '');
  const [priority, setPriority] = useState<ServicePriority>(() => request?.priority ?? 'MEDIUM');
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(() =>
    request?.category
      ? {
          id: request.category.id,
          code: request.category.code,
          name: request.category.name,
        }
      : null
  );

  // Modal Visibility for Category Picker
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // Validation & Submission State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Synchronous correctness lock
  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const prevVisibleRef = useRef<boolean>(visible);

  useEffect(() => {
    mountedRef.current = true;
    if (visible && !prevVisibleRef.current) {
      setTitle(request.title);
      setDescription(request.description);
      setPriority(request.priority);
      setSelectedCategory({
        id: request.category.id,
        code: request.category.code,
        name: request.category.name,
      });
      setFieldErrors({});
      setSubmitError(null);
      setSubmitting(false);
      submittingRef.current = false;
    }
    prevVisibleRef.current = visible;

    return () => {
      mountedRef.current = false;
    };
  }, [visible, request]);

  const handleSelectCategory = (cat: ServiceCategoryResponse | null) => {
    if (cat) {
      setSelectedCategory({
        id: cat.id,
        code: cat.code,
        name: cat.name,
      });
      if (fieldErrors.categoryId) {
        setFieldErrors(prev => ({ ...prev, categoryId: '' }));
      }
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedCategory?.id) {
      errors.categoryId = 'Vui lòng chọn danh mục yêu cầu';
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errors.title = 'Tiêu đề không được để trống';
    } else if (trimmedTitle.length > 255) {
      errors.title = 'Tiêu đề tối đa 255 ký tự';
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      errors.description = 'Mô tả không được để trống';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!validate()) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    const payload: UpdateServiceRequestRequest = {
      categoryId: selectedCategory?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      assetId: request.asset?.id,
      version: request.version,
    };

    try {
      const updated = await serviceRequestApi.updateServiceRequest(request.id, payload);
      if (mountedRef.current) {
        onSuccess(updated);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const mapped = mapServiceRequestError(err);
        if (mapped.isConflict) {
          onConflict();
        } else {
          setSubmitError(mapped.message);
          if (mapped.fieldErrors) {
            setFieldErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
          }
        }
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID="edit-service-request-modal"
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
                borderRadius: theme.radii.large,
              },
            ]}
          >
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
                  Chỉnh sửa yêu cầu
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
                testID="btn-close-edit-modal"
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            {/* Form Scroll Area */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Submit Error Banner */}
              {submitError ? (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: theme.colors.errorContainer,
                      borderColor: theme.colors.error,
                      borderRadius: theme.radii.small,
                    },
                  ]}
                  testID="edit-service-request-error"
                  accessibilityRole="alert"
                >
                  <Text style={[theme.typography.body, { color: theme.colors.error }]}>
                    {submitError}
                  </Text>
                </View>
              ) : null}

              {/* Category Selector */}
              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    theme.typography.caption,
                    styles.fieldLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Danh mục yêu cầu *
                </Text>
                <Pressable
                  onPress={() => setCategoryModalVisible(true)}
                  style={({ pressed }) => [
                    styles.selectButton,
                    {
                      borderColor: fieldErrors.categoryId
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: theme.radii.small,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Chọn danh mục yêu cầu"
                  testID="btn-edit-select-category"
                >
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color: selectedCategory
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedCategory
                      ? `[${selectedCategory.code}] ${selectedCategory.name}`
                      : 'Chọn danh mục yêu cầu...'}
                  </Text>
                </Pressable>
                {fieldErrors.categoryId ? (
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.errorText,
                      { color: theme.colors.error },
                    ]}
                  >
                    {fieldErrors.categoryId}
                  </Text>
                ) : null}
              </View>

              {/* Title Field */}
              <View style={styles.fieldBlock}>
                <AppTextInput
                  label="Tiêu đề yêu cầu *"
                  value={title}
                  onChangeText={val => {
                    setTitle(val);
                    if (fieldErrors.title) {
                      setFieldErrors(prev => ({ ...prev, title: '' }));
                    }
                  }}
                  placeholder="Nhập tiêu đề yêu cầu..."
                  maxLength={255}
                  error={fieldErrors.title}
                  testID="input-edit-service-request-title"
                />
              </View>

              {/* Priority Selector */}
              <View style={styles.fieldBlock}>
                <Text
                  style={[
                    theme.typography.caption,
                    styles.fieldLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Mức độ ưu tiên
                </Text>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map(p => {
                    const isSelected = priority === p.priority;
                    return (
                      <Pressable
                        key={p.priority}
                        onPress={() => setPriority(p.priority)}
                        style={({ pressed }) => [
                          styles.priorityChip,
                          {
                            borderRadius: theme.radii.small,
                            borderColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.border,
                            backgroundColor: isSelected
                              ? theme.colors.surfaceVariant
                              : theme.colors.surface,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Mức ưu tiên ${p.label}`}
                        testID={`edit-priority-option-${p.priority}`}
                      >
                        <PriorityBadge priority={p.priority} />
                        <Text
                          style={[
                            theme.typography.caption,
                            styles.priorityChipLabel,
                            isSelected ? styles.fontBold : styles.fontRegular,
                            {
                              color: isSelected
                                ? theme.colors.primary
                                : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Description Field */}
              <View style={styles.fieldBlock}>
                <AppTextInput
                  label="Mô tả chi tiết *"
                  value={description}
                  onChangeText={val => {
                    setDescription(val);
                    if (fieldErrors.description) {
                      setFieldErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  placeholder="Mô tả chi tiết vấn đề cần hỗ trợ..."
                  multiline
                  numberOfLines={4}
                  error={fieldErrors.description}
                  testID="input-edit-service-request-description"
                />
              </View>

              {/* Associated Asset Info (if any) */}
              {request.asset ? (
                <View
                  style={[
                    styles.assetInfoBox,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radii.small,
                    },
                  ]}
                  testID="edit-asset-info"
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.assetInfoLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Tài sản liên quan:
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      styles.assetInfoValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {request.asset.name} ({request.asset.assetCode})
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <View style={styles.footerBtn}>
                <AppButton
                  title="Hủy"
                  variant="outline"
                  onPress={onClose}
                  disabled={submitting}
                  testID="btn-cancel-edit-service-request"
                />
              </View>
              <View style={styles.footerBtn}>
                <AppButton
                  title="Lưu thay đổi"
                  variant="primary"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  testID="btn-submit-edit-service-request"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Category Selection Modal */}
      <ServiceCategorySelectModal
        visible={categoryModalVisible}
        selectedCategoryId={selectedCategory?.id}
        onSelect={handleSelectCategory}
        onClose={() => setCategoryModalVisible(false)}
      />
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
    maxHeight: '90%',
    width: '100%',
  },
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleText: {
    fontWeight: '700',
  },
  requestNumberText: {
    fontWeight: '600',
  },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  errorBanner: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
  },
  selectButton: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
    gap: 6,
  },
  priorityChipLabel: {
    fontSize: 12,
  },
  fontBold: {
    fontWeight: '700',
  },
  fontRegular: {
    fontWeight: '400',
  },
  assetInfoBox: {
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  assetInfoLabel: {
    marginBottom: 2,
  },
  assetInfoValue: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  footerBtn: {
    flex: 1,
  },
});
