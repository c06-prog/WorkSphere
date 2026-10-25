/**
 * Phase 17D: Edit Asset Modal (SCR-AST-04)
 * Modal flow triggered from AssetDetailScreen for updating Asset specifications and warehouse status.
 * Conforms strictly to 06_API_CONTRACT.md section 14.5 and UpdateAssetRequest.
 *
 * Invariants & Correctness Guarantees:
 * - Pre-fills fields from authoritative AssetDetailResponse:
 *   categoryId, name, description, serialNumber, manufacturer, model,
 *   purchaseDate, purchasePrice, warrantyEndDate, status, location, version.
 * - assetCode is unmodifiable (read-only display).
 * - version sent in UpdateAssetRequest strictly refers to Asset.version (Long).
 * - Status transitions restricted to warehouse states (AVAILABLE, MAINTENANCE, BROKEN, RETIRED).
 * - ASSIGNED status transition is strictly disallowed in general update.
 * - If asset is ASSIGNED, status cannot be changed via general update.
 * - RETIRED status is terminal (no transition allowed if current status is RETIRED).
 * - Category selectable via AssetCategorySelectModal.
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - Optimistic locking: on HTTP 409 conflict, triggers onConflict() dialog with reload action.
 * - On success, invokes onSuccess(updated) with updated AssetDetailResponse and closes modal.
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
  AssetCategoryResponse,
  AssetDetailResponse,
  AssetStatus,
  UpdateAssetRequest,
} from '../types/assetTypes';
import { AssetCategorySelectModal } from './AssetCategorySelectModal';

export interface EditAssetModalProps {
  visible: boolean;
  asset: AssetDetailResponse;
  onClose: () => void;
  onSuccess: (updated: AssetDetailResponse) => void;
  onConflict: () => void;
  testID?: string;
}

interface StatusOption {
  status: AssetStatus;
  label: string;
}

export function EditAssetModal({
  visible,
  asset,
  onClose,
  onSuccess,
  onConflict,
  testID = 'edit-asset-modal',
}: EditAssetModalProps) {
  const theme = useAppTheme();

  // Form State
  const [name, setName] = useState<string>(() => asset?.name ?? '');
  const [description, setDescription] = useState<string>(() => asset?.description ?? '');
  const [serialNumber, setSerialNumber] = useState<string>(() => asset?.serialNumber ?? '');
  const [manufacturer, setManufacturer] = useState<string>(() => asset?.manufacturer ?? '');
  const [model, setModel] = useState<string>(() => asset?.model ?? '');
  const [purchaseDate, setPurchaseDate] = useState<string>(() => asset?.purchaseDate ?? '');
  const [purchasePrice, setPurchasePrice] = useState<string>(() =>
    asset?.purchasePrice !== undefined && asset?.purchasePrice !== null
      ? String(asset.purchasePrice)
      : ''
  );
  const [warrantyEndDate, setWarrantyEndDate] = useState<string>(() => asset?.warrantyEndDate ?? '');
  const [location, setLocation] = useState<string>(() => asset?.location ?? '');
  const [status, setStatus] = useState<AssetStatus>(() => asset?.status ?? 'AVAILABLE');

  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryResponse | null>(() =>
    asset?.category
      ? {
          id: asset.category.id,
          code: asset.category.code,
          name: asset.category.name,
          active: true,
        }
      : null
  );
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // Sync state whenever modal opens or asset changes
  useEffect(() => {
    if (visible && asset) {
      setName(asset.name ?? '');
      setDescription(asset.description ?? '');
      setSerialNumber(asset.serialNumber ?? '');
      setManufacturer(asset.manufacturer ?? '');
      setModel(asset.model ?? '');
      setPurchaseDate(asset.purchaseDate ?? '');
      setPurchasePrice(
        asset.purchasePrice !== undefined && asset.purchasePrice !== null
          ? String(asset.purchasePrice)
          : ''
      );
      setWarrantyEndDate(asset.warrantyEndDate ?? '');
      setLocation(asset.location ?? '');
      setStatus(asset.status ?? 'AVAILABLE');
      setSelectedCategory(
        asset.category
          ? {
              id: asset.category.id,
              code: asset.category.code,
              name: asset.category.name,
              active: true,
            }
          : null
      );
      setErrors({});
      setGeneralError(null);
    }
  }, [visible, asset]);

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  // Available status transitions based on current asset.status
  const isAssigned = asset?.status === 'ASSIGNED';
  const isRetired = asset?.status === 'RETIRED';

  const availableStatusOptions: StatusOption[] = (() => {
    if (isAssigned) {
      // Locked: cannot change status while assigned
      return [{ status: 'ASSIGNED', label: 'Đang cấp phát (Khóa)' }];
    }
    if (isRetired) {
      // Terminal: retired cannot change
      return [{ status: 'RETIRED', label: 'Thanh lý (Đã đóng)' }];
    }

    // Warehouse transitions:
    // AVAILABLE -> AVAILABLE, MAINTENANCE, BROKEN, RETIRED
    // MAINTENANCE -> MAINTENANCE, AVAILABLE, BROKEN, RETIRED
    // BROKEN -> BROKEN, MAINTENANCE, AVAILABLE, RETIRED
    return [
      { status: 'AVAILABLE', label: 'Sẵn sàng' },
      { status: 'MAINTENANCE', label: 'Bảo dưỡng' },
      { status: 'BROKEN', label: 'Hỏng' },
      { status: 'RETIRED', label: 'Thanh lý' },
    ];
  })();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Tên tài sản không được để trống';
    } else if (trimmedName.length > 200) {
      newErrors.name = 'Tên tài sản tối đa 200 ký tự';
    }

    if (serialNumber.trim().length > 150) {
      newErrors.serialNumber = 'Số serial tối đa 150 ký tự';
    }

    if (manufacturer.trim().length > 150) {
      newErrors.manufacturer = 'Nhà sản xuất tối đa 150 ký tự';
    }

    if (model.trim().length > 150) {
      newErrors.model = 'Model tối đa 150 ký tự';
    }

    if (location.trim().length > 255) {
      newErrors.location = 'Vị trí tối đa 255 ký tự';
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (purchaseDate.trim() && !dateRegex.test(purchaseDate.trim())) {
      newErrors.purchaseDate = 'Ngày mua phải có định dạng YYYY-MM-DD';
    }

    if (warrantyEndDate.trim() && !dateRegex.test(warrantyEndDate.trim())) {
      newErrors.warrantyEndDate = 'Hạn bảo hành phải có định dạng YYYY-MM-DD';
    }

    if (purchasePrice.trim()) {
      const priceNum = Number(purchasePrice.trim());
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.purchasePrice = 'Giá mua phải là số không âm';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    setGeneralError(null);
    if (!validate()) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload: UpdateAssetRequest = {
        categoryId: selectedCategory?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        model: model.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        purchasePrice: purchasePrice.trim() ? Number(purchasePrice.trim()) : undefined,
        warrantyEndDate: warrantyEndDate.trim() || undefined,
        status: isAssigned ? undefined : status,
        location: location.trim() || undefined,
        version: asset.version, // Asset.version
      };

      const updated = await assetApi.updateAsset(asset.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      const presentationError = mapAssetError(err);
      if (presentationError.isConflict) {
        // Optimistic lock conflict (409)
        onConflict();
        onClose();
        return;
      }

      if (presentationError.fieldErrors) {
        setErrors(prev => ({ ...prev, ...presentationError.fieldErrors }));
      }
      setGeneralError(presentationError.message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text
              style={[
                theme.typography.heading3,
                styles.headerTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Chỉnh sửa thông tin tài sản
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
              testID="btn-close-edit-asset-modal"
              accessibilityRole="button"
              accessibilityLabel="Đóng modal"
            >
              <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            testID="edit-asset-scroll-view"
          >
            {generalError ? (
              <View
                style={[
                  styles.generalErrorBox,
                  {
                    backgroundColor: theme.colors.errorContainer,
                    borderColor: theme.colors.error,
                  },
                ]}
                testID="edit-asset-general-error"
              >
                <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Read-only Asset Code */}
            <View style={styles.fieldWrapper}>
              <Text style={[theme.typography.label, styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Mã tài sản (Cố định)
              </Text>
              <View
                style={[
                  styles.readOnlyBox,
                  { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border },
                ]}
              >
                <Text
                  style={[theme.typography.bodyMedium, styles.codeText, { color: theme.colors.textPrimary }]}
                  testID="edit-asset-code-readonly"
                >
                  {asset.assetCode}
                </Text>
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.fieldWrapper}>
              <Text style={[theme.typography.label, styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Loại tài sản
              </Text>
              <Pressable
                onPress={() => setCategoryModalVisible(true)}
                style={[
                  styles.selectorBox,
                  {
                    borderColor: errors.categoryId ? theme.colors.error : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Thay đổi loại tài sản"
                testID="btn-edit-select-asset-category"
              >
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: selectedCategory ? theme.colors.textPrimary : theme.colors.textSecondary,
                    },
                  ]}
                  testID="edit-selected-asset-category-text"
                >
                  {selectedCategory
                    ? `[${selectedCategory.code}] ${selectedCategory.name}`
                    : '— Chưa chọn loại tài sản —'}
                </Text>
                <Text style={[styles.arrowIcon, { color: theme.colors.textSecondary }]}>▼</Text>
              </Pressable>
              {errors.categoryId ? (
                <Text style={[theme.typography.caption, styles.errorCaption, { color: theme.colors.error }]}>
                  {errors.categoryId}
                </Text>
              ) : null}
            </View>

            {/* Name */}
            <View style={styles.fieldWrapper}>
              <AppTextInput
                label="Tên tài sản *"
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="VD: MacBook Pro 16 inch M3 Max"
                error={errors.name}
                testID="input-edit-asset-name"
              />
            </View>

            {/* Description */}
            <View style={styles.fieldWrapper}>
              <AppTextInput
                label="Mô tả"
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết cấu hình, tình trạng tài sản..."
                multiline
                numberOfLines={3}
                testID="input-edit-asset-description"
              />
            </View>

            {/* Status Selection (Warehouse states) */}
            <View style={styles.fieldWrapper}>
              <Text style={[theme.typography.label, styles.fieldLabel, { color: theme.colors.textPrimary }]}>
                Trạng thái tài sản
              </Text>
              {isAssigned ? (
                <View
                  style={[
                    styles.readOnlyBox,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Tài sản đang được cấp phát cho nhân viên. Trạng thái không thể thay đổi tại đây.
                  </Text>
                </View>
              ) : isRetired ? (
                <View
                  style={[
                    styles.readOnlyBox,
                    { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Tài sản đã thanh lý (RETIRED). Trạng thái này là vĩnh viễn và không thể thay đổi.
                  </Text>
                </View>
              ) : (
                <View style={styles.statusChipsContainer} testID="edit-asset-status-selector">
                  {availableStatusOptions.map(opt => {
                    const isSelected = status === opt.status;
                    return (
                      <Pressable
                        key={opt.status}
                        onPress={() => setStatus(opt.status)}
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.surfaceVariant,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Trạng thái ${opt.label}`}
                        testID={`status-chip-${opt.status}`}
                      >
                        <Text
                          style={[
                            theme.typography.caption,
                            {
                              color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
                              
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Serial Number & Manufacturer */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Số serial"
                  value={serialNumber}
                  onChangeText={text => {
                    setSerialNumber(text);
                    if (errors.serialNumber) setErrors(prev => ({ ...prev, serialNumber: '' }));
                  }}
                  placeholder="VD: C02G1234MD6R"
                  error={errors.serialNumber}
                  testID="input-edit-asset-serial-number"
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Nhà sản xuất"
                  value={manufacturer}
                  onChangeText={text => {
                    setManufacturer(text);
                    if (errors.manufacturer) setErrors(prev => ({ ...prev, manufacturer: '' }));
                  }}
                  placeholder="VD: Apple"
                  error={errors.manufacturer}
                  testID="input-edit-asset-manufacturer"
                />
              </View>
            </View>

            {/* Model & Location */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Model"
                  value={model}
                  onChangeText={text => {
                    setModel(text);
                    if (errors.model) setErrors(prev => ({ ...prev, model: '' }));
                  }}
                  placeholder="VD: MacBook Pro 16"
                  error={errors.model}
                  testID="input-edit-asset-model"
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Vị trí"
                  value={location}
                  onChangeText={text => {
                    setLocation(text);
                    if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                  }}
                  placeholder="VD: Tầng 4 - Kho IT"
                  error={errors.location}
                  testID="input-edit-asset-location"
                />
              </View>
            </View>

            {/* Purchase Date & Price */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Ngày mua (YYYY-MM-DD)"
                  value={purchaseDate}
                  onChangeText={text => {
                    setPurchaseDate(text);
                    if (errors.purchaseDate) setErrors(prev => ({ ...prev, purchaseDate: '' }));
                  }}
                  placeholder="2026-01-15"
                  error={errors.purchaseDate}
                  testID="input-edit-asset-purchase-date"
                />
              </View>
              <View style={styles.halfField}>
                <AppTextInput
                  label="Giá mua (VNĐ)"
                  value={purchasePrice}
                  onChangeText={text => {
                    setPurchasePrice(text);
                    if (errors.purchasePrice) setErrors(prev => ({ ...prev, purchasePrice: '' }));
                  }}
                  placeholder="VD: 55000000"
                  keyboardType="numeric"
                  error={errors.purchasePrice}
                  testID="input-edit-asset-purchase-price"
                />
              </View>
            </View>

            {/* Warranty End Date */}
            <View style={styles.fieldWrapper}>
              <AppTextInput
                label="Hạn bảo hành (YYYY-MM-DD)"
                value={warrantyEndDate}
                onChangeText={text => {
                  setWarrantyEndDate(text);
                  if (errors.warrantyEndDate) setErrors(prev => ({ ...prev, warrantyEndDate: '' }));
                }}
                placeholder="2028-01-15"
                error={errors.warrantyEndDate}
                testID="input-edit-asset-warranty-end-date"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Hủy"
                  variant="outline"
                  onPress={onClose}
                  disabled={isSubmitting}
                  testID="btn-cancel-edit-asset"
                />
              </View>
              <View style={styles.actionButton}>
                <AppButton
                  title={isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                  variant="primary"
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  testID="btn-submit-edit-asset"
                />
              </View>
            </View>
          </ScrollView>

          {/* Category Select Modal */}
          <AssetCategorySelectModal
            visible={categoryModalVisible}
            selectedCategoryId={selectedCategory?.id}
            onSelect={cat => {
              setSelectedCategory(cat);
              if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));
            }}
            onClose={() => setCategoryModalVisible(false)}
            testID="edit-asset-category-modal"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  generalErrorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 6,
    fontWeight: '600',
  },
  readOnlyBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  codeText: {
    fontWeight: '700',
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  arrowIcon: {
    fontSize: 12,
  },
  errorCaption: {
    marginTop: 4,
  },
  statusChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  boldWeight: {
    fontWeight: '700',
  },
  normalWeight: {
    fontWeight: '400',
  },
});