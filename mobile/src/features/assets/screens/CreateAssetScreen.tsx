/**
 * Phase 17D: Create Asset Screen (SCR-AST-03)
 * Full screen for creating a new Asset conforming to 06_API_CONTRACT.md section 14.4 and D-066.
 *
 * Invariants & Correctness Guarantees:
 * - Direct-route capability gating: Enforces ASSET_MANAGE permission or canonical ADMIN role.
 *   Fails closed for unauthorized users with an error state (no mutation possible).
 * - Normalized assetCode (uppercase, trimmed, matches ^[A-Z0-9][A-Z0-9_-]{1,49}$, 2-50 chars).
 * - Required fields: assetCode, categoryId (UUID), name (max 200).
 * - Category selected via AssetCategorySelectModal; displays human-readable [code] name, sends categoryId UUID.
 * - Format fields: purchaseDate (YYYY-MM-DD), warrantyEndDate (YYYY-MM-DD), purchasePrice (decimal/number >= 0).
 * - Clean string trimming: blanks converted to undefined so backend receives null/undefined, not empty strings.
 * - Initial status: Implicitly AVAILABLE; status field is strictly excluded from create payload.
 * - Synchronous submit lock (submittingRef) prevents duplicate same-tick submissions.
 * - On success, navigates to AssetDetail passing { assetId: created.id } (strictly UUID, NEVER assetCode).
 * - On error (409 conflict, validation), retains user inputs for correction.
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppStackNavProp } from '../../../app/navigation/types';
import { AppButton } from '../../../shared/components/AppButton';
import { AppTextInput } from '../../../shared/components/AppTextInput';
import { ErrorState } from '../../../shared/components/ErrorState';
import { assetApi } from '../api/assetApi';
import { mapAssetError } from '../errors/assetErrorMapper';
import { AssetCategoryResponse, CreateAssetRequest } from '../types/assetTypes';
import { AssetCategorySelectModal } from '../components/AssetCategorySelectModal';

export function CreateAssetScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AppStackNavProp<'CreateAsset'>>();
  const { currentUser } = useAuth();

  // Permission Check: ASSET_MANAGE or ADMIN
  const isAdmin = currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false;
  const canManage = (currentUser?.permissions?.includes('ASSET_MANAGE') ?? false) || isAdmin;

  // Form State
  const [assetCode, setAssetCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(''); // YYYY-MM-DD
  const [purchasePrice, setPurchasePrice] = useState<string>(''); // string for numeric input
  const [warrantyEndDate, setWarrantyEndDate] = useState<string>(''); // YYYY-MM-DD
  const [location, setLocation] = useState<string>('');

  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryResponse | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  // Validate form client-side before sending
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedCode = assetCode.trim().toUpperCase();
    if (!trimmedCode) {
      newErrors.assetCode = 'Mã tài sản không được để trống';
    } else if (trimmedCode.length < 2 || trimmedCode.length > 50) {
      newErrors.assetCode = 'Mã tài sản từ 2 đến 50 ký tự';
    } else if (!/^[A-Z0-9][A-Z0-9_-]{1,49}$/.test(trimmedCode)) {
      newErrors.assetCode =
        'Mã tài sản phải bắt đầu bằng chữ hoa hoặc số, chỉ chứa chữ hoa, số, gạch ngang và gạch dưới';
    }

    if (!selectedCategory?.id) {
      newErrors.categoryId = 'Loại tài sản không được để trống';
    }

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
    if (!canManage) return;

    setGeneralError(null);
    if (!validate()) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload: CreateAssetRequest = {
        assetCode: assetCode.trim().toUpperCase(),
        categoryId: selectedCategory!.id,
        name: name.trim(),
        description: description.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        model: model.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        purchasePrice: purchasePrice.trim() ? Number(purchasePrice.trim()) : undefined,
        warrantyEndDate: warrantyEndDate.trim() || undefined,
        location: location.trim() || undefined,
      };

      const created = await assetApi.createAsset(payload);
      // Navigate to AssetDetail with strictly UUID
      navigation.navigate('AssetDetail', { assetId: created.id });
    } catch (err: unknown) {
      const presentationError = mapAssetError(err);
      if (presentationError.fieldErrors) {
        setErrors(prev => ({ ...prev, ...presentationError.fieldErrors }));
      }
      setGeneralError(presentationError.message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Fail-closed direct route gate
  if (!canManage) {
    return (
      <View
        style={[styles.screen, styles.centerBox, { backgroundColor: theme.colors.background }]}
        testID="create-asset-unauthorized"
      >
        <ErrorState
          title="Không có quyền truy cập"
          message="Bạn cần quyền ASSET_MANAGE hoặc vai trò Quản trị viên để tạo tài sản mới."
          onRetry={undefined}
          testID="create-asset-forbidden-state"
        />
        <View style={styles.backButtonWrapper}>
          <AppButton
            title="Quay lại"
            variant="outline"
            onPress={() => navigation.goBack()}
            testID="btn-create-asset-unauthorized-back"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="create-asset-screen"
    >
      {/* Top Header Bar */}
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
          testID="btn-create-asset-back"
        >
          <Text style={[theme.typography.bodyMedium, styles.backButtonText, { color: theme.colors.primary }]}>
            ‹ Quay lại
          </Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={[theme.typography.heading3, styles.headerTitleText, { color: theme.colors.textPrimary }]}
        >
          Tạo tài sản mới
        </Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        testID="create-asset-scroll-view"
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
            testID="create-asset-general-error"
          >
            <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
              {generalError}
            </Text>
          </View>
        ) : null}

        {/* 1. Mã tài sản */}
        <View style={styles.fieldWrapper}>
          <AppTextInput
            label="Mã tài sản *"
            value={assetCode}
            onChangeText={text => {
              setAssetCode(text);
              if (errors.assetCode) setErrors(prev => ({ ...prev, assetCode: '' }));
            }}
            placeholder="VD: LAP-2026-001"
            autoCapitalize="characters"
            error={errors.assetCode}
            testID="input-asset-code"
          />
        </View>

        {/* 2. Loại tài sản (Category Picker) */}
        <View style={styles.fieldWrapper}>
          <Text style={[theme.typography.label, styles.fieldLabel, { color: theme.colors.textPrimary }]}>
            Loại tài sản *
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
            accessibilityLabel="Chọn loại tài sản"
            testID="btn-select-asset-category"
          >
            <Text
              style={[
                theme.typography.body,
                {
                  color: selectedCategory ? theme.colors.textPrimary : theme.colors.textSecondary,
                },
              ]}
              testID="selected-asset-category-text"
            >
              {selectedCategory
                ? `[${selectedCategory.code}] ${selectedCategory.name}`
                : '— Chọn loại tài sản —'}
            </Text>
            <Text style={[styles.arrowIcon, { color: theme.colors.textSecondary }]}>▼</Text>
          </Pressable>
          {errors.categoryId ? (
            <Text
              style={[theme.typography.caption, styles.errorCaption, { color: theme.colors.error }]}
              testID="error-asset-category"
            >
              {errors.categoryId}
            </Text>
          ) : null}
        </View>

        {/* 3. Tên tài sản */}
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
            testID="input-asset-name"
          />
        </View>

        {/* 4. Mô tả */}
        <View style={styles.fieldWrapper}>
          <AppTextInput
            label="Mô tả"
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả chi tiết cấu hình, tình trạng tài sản..."
            multiline
            numberOfLines={3}
            testID="input-asset-description"
          />
        </View>

        {/* 5. Số serial & Nhà sản xuất */}
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
              testID="input-asset-serial-number"
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
              testID="input-asset-manufacturer"
            />
          </View>
        </View>

        {/* 6. Model & Vị trí */}
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
              testID="input-asset-model"
            />
          </View>
          <View style={styles.halfField}>
            <AppTextInput
              label="Vị trí lưu trữ"
              value={location}
              onChangeText={text => {
                setLocation(text);
                if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
              }}
              placeholder="VD: Tầng 4 - Kho IT"
              error={errors.location}
              testID="input-asset-location"
            />
          </View>
        </View>

        {/* 7. Ngày mua & Giá mua */}
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
              testID="input-asset-purchase-date"
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
              testID="input-asset-purchase-price"
            />
          </View>
        </View>

        {/* 8. Hạn bảo hành */}
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
            testID="input-asset-warranty-end-date"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.submitSection}>
          <AppButton
            title={isSubmitting ? 'Đang tạo...' : 'Tạo tài sản'}
            variant="primary"
            onPress={handleSubmit}
            disabled={isSubmitting}
            testID="btn-submit-create-asset"
          />
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
        testID="create-asset-category-modal"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButtonWrapper: {
    marginTop: 16,
    width: '100%',
    maxWidth: 240,
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
  backButtonText: {
    fontWeight: '600',
  },
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpacer: {
    minWidth: 48,
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
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  submitSection: {
    marginTop: 8,
    marginBottom: 24,
  },
});
