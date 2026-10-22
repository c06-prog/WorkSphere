/**
 * Phase 16D: Create Service Request Screen (SCR-SRV-04)
 * Implements canonical service request creation form conforming strictly to 06_API_CONTRACT.md section 13.3.
 *
 * Invariants & Correctness Guarantees:
 * - Direct-route capability gating: Enforces currentUser.permissions.includes('SERVICE_REQUEST_CREATE').
 * - Category selection via ServiceCategorySelectModal (human-readable [code] name; strictly zero raw UUIDs).
 * - Auto-populates priority from category.defaultPriority when selected.
 * - Exact CreateServiceRequestRequest DTO fields: categoryId, title, description, priority, assetId.
 * - Strictly zero status, requestNumber, requesterId, or version fields in create form.
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - On success, navigates directly to ServiceRequestDetail: { requestId: created.id }.
 */

import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { MainTabNavProp, MainTabScreenRouteProp } from '../../../app/navigation/types';
import { AppButton } from '../../../shared/components/AppButton';
import { AppTextInput } from '../../../shared/components/AppTextInput';
import { ErrorState } from '../../../shared/components/ErrorState';
import { PriorityBadge } from '../../../shared/components/PriorityBadge';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { mapServiceRequestError } from '../errors/serviceRequestErrorMapper';
import {
  CreateServiceRequestRequest,
  ServiceCategoryResponse,
  ServicePriority,
} from '../types/serviceRequestTypes';
import { ServiceCategorySelectModal } from '../components/ServiceCategorySelectModal';

const PRIORITIES: { priority: ServicePriority; label: string }[] = [
  { priority: 'CRITICAL', label: 'Khẩn cấp' },
  { priority: 'HIGH', label: 'Cao' },
  { priority: 'MEDIUM', label: 'Trung bình' },
  { priority: 'LOW', label: 'Thấp' },
];

export function CreateServiceRequestScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'CreateServiceRequest'>>();
  const route = useRoute<MainTabScreenRouteProp<'CreateServiceRequest'>>();
  const { currentUser } = useAuth();

  const routeAssetId = route.params?.assetId;

  // Authorization Check
  const canCreate = currentUser?.permissions?.includes('SERVICE_REQUEST_CREATE') ?? false;

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryResponse | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<ServicePriority>('MEDIUM');

  // Modal Visibility
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // Validation & Submission State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Synchronous correctness lock
  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSelectCategory = (cat: ServiceCategoryResponse | null) => {
    setSelectedCategory(cat);
    if (cat?.defaultPriority) {
      setPriority(cat.defaultPriority);
    }
    if (fieldErrors.categoryId) {
      setFieldErrors(prev => ({ ...prev, categoryId: '' }));
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
    if (!selectedCategory) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    const payload: CreateServiceRequestRequest = {
      categoryId: selectedCategory.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      assetId: routeAssetId && routeAssetId.trim().length > 0 ? routeAssetId.trim() : undefined,
    };

    try {
      const created = await serviceRequestApi.createServiceRequest(payload);
      if (mountedRef.current) {
        navigation.navigate('ServiceRequestDetail', { requestId: created.id });
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const mapped = mapServiceRequestError(err);
        setSubmitError(mapped.message);
        if (mapped.fieldErrors) {
          setFieldErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
        }
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  // Direct-route permission gate: Fail-closed unauthorized presentation
  if (!canCreate) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="screen-create-service-request"
      >
        <Text style={styles.screenIdHidden}>SCR-SRV-04</Text>
        <ErrorState
          title="Không có quyền truy cập"
          message="Bạn không có quyền tạo yêu cầu dịch vụ"
          onRetry={() => navigation.goBack()}
          retryTitle="Quay lại"
          testID="create-service-request-permission-error"
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="screen-create-service-request"
    >
      <Text style={styles.screenIdHidden}>SCR-SRV-04</Text>

      {/* Top Header Row with Back Button & Screen Title */}
      <View
        style={[
          styles.headerRow,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
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

        <Text
          style={[
            theme.typography.heading2,
            styles.headerTitle,
            { color: theme.colors.textPrimary },
          ]}
          accessibilityRole="header"
        >
          Tạo yêu cầu dịch vụ
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
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
              testID="create-service-request-error"
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
              testID="btn-select-category"
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
              testID="input-service-request-title"
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
                    testID={`priority-option-${p.priority}`}
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
              testID="input-service-request-description"
            />
          </View>

          {/* Route Asset Context Display (if present) */}
          {routeAssetId ? (
            <View
              style={[
                styles.assetContextBox,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.small,
                },
              ]}
              testID="create-service-request-asset-info"
            >
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Yêu cầu này được gắn với tài sản được chỉ định từ ngữ cảnh trước.
              </Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <View style={styles.submitWrapper}>
            <AppButton
              title="Tạo yêu cầu"
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              testID="btn-submit-create-service-request"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <ServiceCategorySelectModal
        visible={categoryModalVisible}
        selectedCategoryId={selectedCategory?.id}
        onSelect={handleSelectCategory}
        onClose={() => setCategoryModalVisible(false)}
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
    padding: 24,
  },
  screenIdHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
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
  headerTitle: {
    fontWeight: '700',
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  assetContextBox: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  submitWrapper: {
    marginTop: 8,
  },
});
