/**
 * Phase 17B: Asset List Screen (SCR-AST-01)
 * Displays assets in two distinct operational modes:
 * 1. "Của tôi" (default): Queries /assets/my-assets via useMyAssets.
 *    Accessible to every authenticated employee.
 * 2. "Tất cả tài sản": Queries /assets via useAssets with search, category & status filtering.
 *    Strictly gated: only rendered if user holds ASSET_READ permission or ADMIN role.
 *
 * Invariants:
 * - Switching modes does not blend or contaminate data sets.
 * - Selecting an asset navigates to AssetDetail passing assetId (strictly UUID, NEVER assetCode).
 * - Segmented control hides entirely when user lacks ASSET_READ / ADMIN.
 * - Loading, empty, and error states properly separated.
 * - Pull-to-refresh resets pagination cleanly and preserves existing list during refresh.
 */

import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { AppStackNavProp } from '../../../app/navigation/types';
import { EmptyState, ErrorState, LoadingIndicator } from '../../../shared/components';
import { SearchBar } from '../../../shared/components/SearchBar';
import {
  AssetStatus,
  AssetSummaryResponse,
} from '../types/assetTypes';
import { AssetCard } from '../components/AssetCard';
import { useMyAssets } from '../hooks/useMyAssets';
import { useAssets } from '../hooks/useAssets';

export type AssetTabMode = 'my-assets' | 'all-assets';

interface StatusFilterOption {
  status: AssetStatus | undefined;
  label: string;
}

const ASSET_STATUS_FILTERS: StatusFilterOption[] = [
  { status: undefined, label: 'Tất cả trạng thái' },
  { status: 'AVAILABLE', label: 'Sẵn sàng' },
  { status: 'ASSIGNED', label: 'Đang cấp phát' },
  { status: 'MAINTENANCE', label: 'Bảo dưỡng' },
  { status: 'BROKEN', label: 'Hỏng' },
  { status: 'RETIRED', label: 'Thanh lý' },
];

export function AssetListScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AppStackNavProp<'AssetList'>>();
  const { currentUser } = useAuth();

  // Permission Gating: Check ASSET_READ permission or canonical ADMIN role
  const hasAssetRead =
    (currentUser?.permissions?.includes('ASSET_READ') ?? false) ||
    (currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false);

  const [activeTab, setActiveTab] = useState<AssetTabMode>('my-assets');

  // Mode 1: My Assets
  const myAssetsState = useMyAssets({
    autoLoad: true,
  });

  // Mode 2: Directory (All Assets) - only autoLoad if has permission
  const allAssetsState = useAssets({
    autoLoad: false,
  });

  const handleTabChange = (mode: AssetTabMode) => {
    if (mode === activeTab) {
      return;
    }
    setActiveTab(mode);
    if (mode === 'all-assets' && allAssetsState.assets.length === 0 && !allAssetsState.error) {
      allAssetsState.loadInitial();
    }
  };

  const handleAssetPress = (assetId: string) => {
    navigation.navigate('AssetDetail', { assetId });
  };

  // Select active state based on tab
  const isMyTab = activeTab === 'my-assets';
  const currentState = isMyTab ? myAssetsState : allAssetsState;

  const renderSegmentedControl = () => {
    if (!hasAssetRead) {
      return null;
    }

    return (
      <View
        style={[
          styles.segmentedContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.radii.medium,
            marginHorizontal: theme.spacing.md,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          },
        ]}
      >
        <Pressable
          onPress={() => handleTabChange('my-assets')}
          style={[
            styles.segmentButton,
            isMyTab && [
              styles.segmentActive,
              { backgroundColor: theme.colors.surface },
            ],
          ]}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: isMyTab }}
          accessibilityLabel="Chế độ Tài sản của tôi"
          testID="tab-my-assets"
        >
          <Text
            style={[
              theme.typography.label,
              styles.segmentText,
              { color: isMyTab ? theme.colors.primary : theme.colors.textSecondary },
              isMyTab ? styles.boldWeight : styles.mediumWeight,
            ]}
          >
            Của tôi
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('all-assets')}
          style={[
            styles.segmentButton,
            !isMyTab && [
              styles.segmentActive,
              { backgroundColor: theme.colors.surface },
            ],
          ]}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isMyTab }}
          accessibilityLabel="Chế độ Tất cả tài sản"
          testID="tab-all-assets"
        >
          <Text
            style={[
              theme.typography.label,
              styles.segmentText,
              { color: !isMyTab ? theme.colors.primary : theme.colors.textSecondary },
              !isMyTab ? styles.boldWeight : styles.mediumWeight,
            ]}
          >
            Tất cả tài sản
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerWrapper}>
        {renderSegmentedControl()}

        {/* Directory Controls: Search & Category Chips only for all-assets tab */}
        {!isMyTab && (
          <>
            <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }]}>
              <SearchBar
                value={allAssetsState.search}
                onChangeText={allAssetsState.setSearch}
                onClear={() => allAssetsState.setSearch('')}
                placeholder="Tìm kiếm tài sản theo tên, mã, sê-ri..."
                accessibilityLabel="Ô tìm kiếm tài sản"
                testID="asset-search-input"
              />
            </View>

            {/* Category Filter Chips */}
            {allAssetsState.categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.filterChipsRow,
                  { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.xs },
                ]}
                testID="asset-category-filter-scroll"
              >
                <Pressable
                  onPress={() => allAssetsState.setCategoryFilter(undefined)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        allAssetsState.categoryFilter === undefined
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      borderRadius: theme.radii.large,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Lọc tất cả loại tài sản"
                  testID="chip-category-all"
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      {
                        color:
                          allAssetsState.categoryFilter === undefined
                            ? theme.colors.surface
                            : theme.colors.textPrimary,
                      },
                      allAssetsState.categoryFilter === undefined ? styles.boldWeight : styles.mediumWeight,
                    ]}
                  >
                    Tất cả loại
                  </Text>
                </Pressable>

                {allAssetsState.categories.map(category => {
                  const isSelected = allAssetsState.categoryFilter === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => allAssetsState.setCategoryFilter(isSelected ? undefined : category.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                          borderRadius: theme.radii.large,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Lọc loại ${category.name}`}
                      testID={`chip-category-${category.id}`}
                    >
                      <Text
                        style={[
                          theme.typography.caption,
                          {
                            color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
                          },
                          isSelected ? styles.boldWeight : styles.mediumWeight,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}

        {/* Status Filter Chips (Available in both tabs) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterChipsRow,
            { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm },
          ]}
          testID="asset-status-filter-scroll"
        >
          {ASSET_STATUS_FILTERS.map(filter => {
            const isSelected = currentState.statusFilter === filter.status;
            return (
              <Pressable
                key={filter.label}
                onPress={() => currentState.setStatusFilter(isSelected ? undefined : filter.status)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surfaceVariant,
                    borderRadius: theme.radii.large,
                    borderColor: theme.colors.border,
                  },
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Lọc trạng thái ${filter.label}`}
                testID={`chip-status-${filter.status ?? 'ALL'}`}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    {
                      color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
                    },
                    isSelected ? styles.boldWeight : styles.mediumWeight,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFooter = () => {
    if (currentState.loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <LoadingIndicator size="small" message="Đang tải thêm tài sản..." testID="pagination-loading" />
        </View>
      );
    }

    if (currentState.paginationError) {
      return (
        <View style={styles.footerError}>
          <Text style={[theme.typography.caption, styles.errorText, { color: theme.colors.error }]}>
            {currentState.paginationError.message}
          </Text>
          <Pressable
            onPress={() => { currentState.retryPagination(); }}
            style={[styles.retryButton, { borderColor: theme.colors.primary }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Thử lại tải trang sau"
            testID="btn-retry-pagination"
          >
            <Text style={[theme.typography.caption, styles.retryText, { color: theme.colors.primary }]}>
              Thử lại
            </Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (currentState.initialLoading) {
      return null;
    }

    if (isMyTab) {
      return (
        <EmptyState
          title="Chưa có tài sản nào"
          description="Bạn hiện tại chưa được cấp phát tài sản nào trong hệ thống."
          testID="empty-state-my-assets"
        />
      );
    }

    const hasFilters =
      allAssetsState.search.trim().length > 0 ||
      allAssetsState.statusFilter !== undefined ||
      allAssetsState.categoryFilter !== undefined;

    return (
      <EmptyState
        title={hasFilters ? 'Không tìm thấy tài sản' : 'Danh mục tài sản trống'}
        description={
          hasFilters
            ? 'Không có tài sản nào phù hợp với điều kiện tìm kiếm và bộ lọc hiện tại.'
            : 'Hiện tại hệ thống chưa có thông tin tài sản nào trong danh mục.'
        }
        testID="empty-state-all-assets"
      />
    );
  };

  if (currentState.initialLoading && currentState.assets.length === 0) {
    return (
      <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]} testID="asset-list-screen">
        {renderSegmentedControl()}
        <View style={styles.centered}>
          <LoadingIndicator size="large" message="Đang tải danh sách tài sản..." testID="initial-loading" />
        </View>
      </View>
    );
  }

  if (currentState.error && currentState.assets.length === 0) {
    return (
      <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
        {renderSegmentedControl()}
        <ErrorState
          title="Không thể tải danh sách tài sản"
          message={currentState.error.message}
          onRetry={() => { currentState.loadInitial(); }}
          testID="initial-error"
        />
      </View>
    );
  }

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={currentState.assets}
        keyExtractor={(item: AssetSummaryResponse) => item.id}
        renderItem={({ item }) => (
          <AssetCard asset={item} onPress={handleAssetPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          currentState.assets.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={currentState.refreshing}
            onRefresh={() => { currentState.refresh(); }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            testID="asset-list-refresh-control"
          />
        }
        onEndReached={() => {
          if (currentState.hasNext && !currentState.loadingMore && !currentState.paginationError) {
            currentState.loadMore();
          }
        }}
        onEndReachedThreshold={0.3}
        testID="asset-list-flatlist"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  headerWrapper: {
    paddingBottom: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 14,
  },
  boldWeight: {
    fontWeight: '700',
  },
  mediumWeight: {
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerError: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 4,
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  retryText: {
    fontWeight: '600',
  },
});
