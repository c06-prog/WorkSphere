/**
 * Phase 16D: Service Category Select Modal
 * Accessible modal allowing users to select an active Service Category for Service Request creation or update.
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
import { serviceRequestApi } from '../api/serviceRequestApi';
import { ServiceCategoryResponse } from '../types/serviceRequestTypes';

export interface ServiceCategorySelectModalProps {
  visible: boolean;
  selectedCategoryId?: string | null;
  onSelect: (category: ServiceCategoryResponse | null) => void;
  onClose: () => void;
  title?: string;
  testID?: string;
}

export function ServiceCategorySelectModal({
  visible,
  selectedCategoryId,
  onSelect,
  onClose,
  title = 'Chọn danh mục yêu cầu',
  testID = 'service-category-select-modal',
}: ServiceCategorySelectModalProps) {
  const theme = useAppTheme();
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
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
    const generation = ++requestGenerationRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await serviceRequestApi.listCategories();
      if (!mountedRef.current || generation !== requestGenerationRef.current) {
        return;
      }
      // Only keep active categories for selection
      const activeOnly = data.filter(c => c.active);
      setCategories(activeOnly);
    } catch (err: unknown) {
      if (!mountedRef.current || generation !== requestGenerationRef.current) {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Không thể tải danh sách danh mục dịch vụ';
      setError(message);
    } finally {
      if (mountedRef.current && generation === requestGenerationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setDraftSelectedId(selectedCategoryId ?? null);
      setSearch('');
      loadCategories();
    } else {
      // Invalidate any in-flight category fetch when modal becomes hidden
      requestGenerationRef.current++;
    }
  }, [visible, selectedCategoryId, loadCategories]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
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
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.scrim}>
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
            <Text
              style={[
                theme.typography.heading3,
                styles.title,
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
              testID="btn-close-category-modal"
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
              placeholder="Tìm kiếm theo mã hoặc tên danh mục..."
              testID="input-search-category"
            />
          </View>

          {/* Body */}
          <View style={styles.body}>
            {loading ? (
              <View style={styles.centerContainer}>
                <LoadingIndicator
                  message="Đang tải danh sách danh mục..."
                  testID="category-select-loading"
                />
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <ErrorState
                  title="Không thể tải danh mục"
                  message={error}
                  onRetry={loadCategories}
                  testID="category-select-error"
                />
              </View>
            ) : filteredCategories.length === 0 ? (
              <View style={styles.centerContainer}>
                <EmptyState
                  title="Không tìm thấy danh mục"
                  description={
                    search.trim().length > 0
                      ? 'Không có danh mục nào phù hợp với tìm kiếm.'
                      : 'Hiện chưa có danh mục khả dụng.'
                  }
                  testID="category-select-empty"
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
                      testID={`category-option-${item.id}`}
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
                              styles.categoryDescription,
                              { color: theme.colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {isSelected ? (
                          <View
                            style={[
                              styles.radioInner,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <View style={styles.footerButtonWrapper}>
              <AppButton
                title="Bỏ chọn"
                variant="outline"
                onPress={handleClear}
                disabled={!draftSelectedId}
                testID="btn-clear-category-select"
              />
            </View>
            <View style={styles.footerButtonWrapper}>
              <AppButton
                title="Xác nhận"
                variant="primary"
                onPress={handleConfirm}
                testID="btn-confirm-category-select"
              />
            </View>
          </View>
        </View>
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
  container: {
    maxHeight: '85%',
    minHeight: '50%',
    width: '100%',
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
  title: {
    fontWeight: '700',
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  body: {
    flex: 1,
    minHeight: 200,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  categoryCode: {
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryName: {
    flex: 1,
  },
  categoryDescription: {
    marginTop: 2,
  },
  fontBold: {
    fontWeight: '700',
  },
  fontRegular: {
    fontWeight: '400',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButtonWrapper: {
    flex: 1,
  },
});
