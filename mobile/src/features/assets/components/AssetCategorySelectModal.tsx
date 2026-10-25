/**
 * Phase 17D: Asset Category Select Modal
 * Accessible modal allowing users to select an active Asset Category for Asset creation or editing.
 * - Displays human-readable category code and name ([code] name).
 * - Never shows raw UUID.
 * - Supports client-side search by code and name.
 * - Filters to only active categories (active === true).
 * - Accessible radio selection semantics with touch targets >= 48dp.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppButton } from '../../../shared/components/AppButton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator';
import { SearchBar } from '../../../shared/components/SearchBar';
import { assetApi } from '../api/assetApi';
import { AssetCategoryResponse } from '../types/assetTypes';

export interface AssetCategorySelectModalProps {
  visible: boolean;
  selectedCategoryId?: string | null;
  onSelect: (category: AssetCategoryResponse | null) => void;
  onClose: () => void;
  title?: string;
  testID?: string;
}

export function AssetCategorySelectModal({
  visible,
  selectedCategoryId,
  onSelect,
  onClose,
  title = 'Chọn loại tài sản',
  testID = 'asset-category-select-modal',
}: AssetCategorySelectModalProps) {
  const theme = useAppTheme();
  const [categories, setCategories] = useState<AssetCategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [draftSelectedId, setDraftSelectedId] = useState<string | null>(
    selectedCategoryId ?? null
  );

  const mountedRef = useRef<boolean>(true);
  const requestGenerationRef = useRef<number>(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async () => {
    const gen = ++requestGenerationRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await assetApi.listCategories();
      if (!mountedRef.current || gen !== requestGenerationRef.current) return;
      const activeOnly = data.filter(c => c.active);
      setCategories(activeOnly);
    } catch {
      if (!mountedRef.current || gen !== requestGenerationRef.current) return;
      setError('Không thể tải danh sách loại tài sản. Vui lòng thử lại.');
    } finally {
      if (mountedRef.current && gen === requestGenerationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setDraftSelectedId(selectedCategoryId ?? null);
      setSearch('');
      loadCategories();
    }
  }, [visible, selectedCategoryId, loadCategories]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleConfirm = () => {
    const selected = categories.find(c => c.id === draftSelectedId) ?? null;
    onSelect(selected);
    onClose();
  };

  const handleClear = () => {
    setDraftSelectedId(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
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
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              testID="btn-close-asset-category-modal"
              accessibilityRole="button"
              accessibilityLabel="Đóng"
            >
              <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm theo mã hoặc tên loại tài sản..."
              testID="input-search-asset-category"
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            {loading ? (
              <View style={styles.centerContainer}>
                <LoadingIndicator
                  message="Đang tải danh sách loại tài sản..."
                  testID="asset-category-select-loading"
                />
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <ErrorState
                  title="Không thể tải loại tài sản"
                  message={error}
                  onRetry={loadCategories}
                  testID="asset-category-select-error"
                />
              </View>
            ) : filteredCategories.length === 0 ? (
              <View style={styles.centerContainer}>
                <EmptyState
                  title="Không tìm thấy loại tài sản"
                  description={
                    search.trim().length > 0
                      ? 'Không có loại tài sản nào phù hợp với tìm kiếm.'
                      : 'Hiện chưa có loại tài sản khả dụng.'
                  }
                  testID="asset-category-select-empty"
                />
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isSelected = item.id === draftSelectedId;
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        styles.itemRow,
                        {
                          borderBottomColor: theme.colors.border,
                          backgroundColor: isSelected
                            ? theme.colors.surfaceVariant
                            : pressed
                            ? theme.colors.background
                            : 'transparent',
                        },
                      ]}
                      onPress={() => setDraftSelectedId(item.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`[${item.code}] ${item.name}`}
                      testID={`asset-category-option-${item.id}`}
                    >
                      <View style={styles.itemTextContainer}>
                        <Text
                          style={[
                            theme.typography.caption,
                            styles.categoryCode,
                            { color: theme.colors.primary },
                          ]}
                        >
                          [{item.code}]
                        </Text>
                        <Text
                          style={[
                            theme.typography.body,
                            styles.categoryName,
                            { color: theme.colors.textPrimary },
                            isSelected ? styles.fontBold : styles.fontRegular,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.description ? (
                          <Text
                            style={[
                              theme.typography.caption,
                              styles.categoryDesc,
                              { color: theme.colors.textSecondary },
                            ]}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
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
                        {isSelected && (
                          <View
                            style={[
                              styles.radioDot,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <View style={styles.footerButton}>
              <AppButton
                title="Bỏ chọn"
                variant="outline"
                onPress={handleClear}
                testID="btn-clear-asset-category"
              />
            </View>
            <View style={styles.footerButton}>
              <AppButton
                title="Xác nhận"
                variant="primary"
                onPress={handleConfirm}
                testID="btn-confirm-asset-category"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  body: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  categoryCode: {
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 15,
  },
  categoryDesc: {
    marginTop: 2,
  },
  fontBold: {
    fontWeight: '700',
  },
  fontRegular: {
    fontWeight: '400',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
