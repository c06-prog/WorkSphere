/**
 * Phase 16B: Service Request List Screen (SCR-SRV-01)
 * Displays paginated list of service requests backed by GET /service-requests.
 *
 * Capabilities:
 * - Controlled search bar with 300ms debounce.
 * - Canonical status filter chips: Tất cả, Mở (OPEN), Đã phân công (ASSIGNED),
 *   Đang xử lý (IN_PROGRESS), Chờ phản hồi (WAITING_FOR_USER), Đã giải quyết (RESOLVED),
 *   Đã đóng (CLOSED), Đã hủy (CANCELLED).
 * - Canonical priority filter chips: Tất cả, Khẩn cấp (CRITICAL), Cao (HIGH),
 *   Trung bình (MEDIUM), Thấp (LOW).
 * - Canonical category filter chips: Tất cả, followed by active service categories.
 * - FlatList with ListHeaderComponent, onEndReached pagination, and footer retry on error.
 * - Pull-to-refresh preserving existing list during refresh.
 * - Full-screen LoadingIndicator for initial load.
 * - Full-screen ErrorState with retry for initial load failures.
 * - Differentiated empty states: "Chưa có yêu cầu dịch vụ nào" vs "Không tìm thấy yêu cầu".
 *
 * Staged Navigation Rule (16B):
 * - ServiceRequestCard is presentation-only (ServiceRequestDetail SCR-SRV-02 deferred to 16C).
 * - Create Request button absent in 16B (CreateServiceRequest SCR-SRV-04 deferred to 16D).
 * - Runtime Tab route retains exact name "ServiceRequests".
 */

import React from 'react';
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
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { MainTabNavProp } from '../../../app/navigation/types';
import { EmptyState, ErrorState, LoadingIndicator } from '../../../shared/components';
import { SearchBar } from '../../../shared/components/SearchBar';
import {
  ServicePriority,
  ServiceRequestSummaryResponse,
  ServiceStatus,
} from '../types/serviceRequestTypes';
import { ServiceRequestCard } from '../components/ServiceRequestCard';
import { useServiceRequests } from '../hooks/useServiceRequests';

interface StatusFilterOption {
  status: ServiceStatus | undefined;
  label: string;
}

interface PriorityFilterOption {
  priority: ServicePriority | undefined;
  label: string;
}

const STATUS_FILTERS: StatusFilterOption[] = [
  { status: undefined, label: 'Tất cả trạng thái' },
  { status: 'OPEN', label: 'Mở' },
  { status: 'ASSIGNED', label: 'Đã phân công' },
  { status: 'IN_PROGRESS', label: 'Đang xử lý' },
  { status: 'WAITING_FOR_USER', label: 'Chờ phản hồi' },
  { status: 'RESOLVED', label: 'Đã giải quyết' },
  { status: 'CLOSED', label: 'Đã đóng' },
  { status: 'CANCELLED', label: 'Đã hủy' },
];

const PRIORITY_FILTERS: PriorityFilterOption[] = [
  { priority: undefined, label: 'Tất cả ưu tiên' },
  { priority: 'CRITICAL', label: 'Khẩn cấp' },
  { priority: 'HIGH', label: 'Cao' },
  { priority: 'MEDIUM', label: 'Trung bình' },
  { priority: 'LOW', label: 'Thấp' },
];

export function ServiceRequestsScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'ServiceRequests'>>();

  const {
    requests,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    paginationError,
    refreshError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    loadInitial,
    refresh,
    loadMore,
    retryPagination,
    clearFilters,
  } = useServiceRequests();

  const isQueryActive =
    search.trim().length > 0 ||
    statusFilter !== undefined ||
    priorityFilter !== undefined ||
    categoryFilter !== undefined;

  // 1. Initial Loading State
  if (initialLoading && requests.length === 0 && !error) {
    return (
      <View
        style={[styles.centerWrapper, { backgroundColor: theme.colors.background }]}
        testID="screen-service-requests"
      >
        <Text style={styles.screenIdHidden}>SCR-SRV-01</Text>
        <LoadingIndicator
          size="large"
          message="Đang tải danh sách yêu cầu..."
          fullScreen
          testID="service-requests-loading"
        />
      </View>
    );
  }

  // 2. Initial Error State
  if (error && requests.length === 0) {
    return (
      <View
        style={[styles.centerWrapper, { backgroundColor: theme.colors.background }]}
        testID="screen-service-requests"
      >
        <Text style={styles.screenIdHidden}>SCR-SRV-01</Text>
        <ErrorState
          title="Không thể tải danh sách yêu cầu"
          message={error.message}
          onRetry={loadInitial}
          retryTitle="Thử lại"
          testID="service-requests-error"
        />
      </View>
    );
  }

  // Header Component (SearchBar + Filter Chips + Refresh Banner)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.screenIdHidden}>SCR-SRV-01</Text>

      {/* Top Title Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleContainer}>
          <Text
            style={[theme.typography.heading1, styles.pageTitle, { color: theme.colors.textPrimary }]}
            accessibilityRole="header"
          >
            Yêu cầu dịch vụ
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            SCR-SRV-01: Danh sách yêu cầu hỗ trợ và dịch vụ
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm yêu cầu..."
          accessibilityLabel="Tìm kiếm yêu cầu dịch vụ"
          testID="service-requests-search-bar"
        />
      </View>

      {/* Status Filter Chips Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
        testID="service-requests-status-filters"
      >
        {STATUS_FILTERS.map(f => {
          const isSelected = statusFilter === f.status;
          return (
            <Pressable
              key={`status-${f.label}`}
              onPress={() => setStatusFilter(f.status)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Lọc theo trạng thái: ${f.label}`}
              style={[
                styles.filterChip,
                {
                  borderRadius: theme.radii.full,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              testID={`filter-chip-status-${f.status ? f.status.toLowerCase() : 'all'}`}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.filterChipText,
                  { color: isSelected ? theme.colors.onPrimary : theme.colors.textPrimary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Priority Filter Chips Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRowSmall}
        testID="service-requests-priority-filters"
      >
        {PRIORITY_FILTERS.map(f => {
          const isSelected = priorityFilter === f.priority;
          return (
            <Pressable
              key={`priority-${f.label}`}
              onPress={() => setPriorityFilter(f.priority)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Lọc theo độ ưu tiên: ${f.label}`}
              style={[
                styles.filterChip,
                {
                  borderRadius: theme.radii.full,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              testID={`filter-chip-priority-${f.priority ? f.priority.toLowerCase() : 'all'}`}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.filterChipText,
                  { color: isSelected ? theme.colors.onPrimary : theme.colors.textPrimary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Category Filter Chips Bar (only when categories exist) */}
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRowSmall}
          testID="service-requests-category-filters"
        >
          <Pressable
            onPress={() => setCategoryFilter(undefined)}
            accessibilityRole="button"
            accessibilityState={{ selected: categoryFilter === undefined }}
            accessibilityLabel="Lọc theo danh mục: Tất cả danh mục"
            style={[
              styles.filterChip,
              {
                borderRadius: theme.radii.full,
                borderColor: categoryFilter === undefined ? theme.colors.primary : theme.colors.border,
                backgroundColor: categoryFilter === undefined ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            testID="filter-chip-category-all"
          >
            <Text
              style={[
                theme.typography.caption,
                styles.filterChipText,
                { color: categoryFilter === undefined ? theme.colors.onPrimary : theme.colors.textPrimary },
              ]}
            >
              Tất cả danh mục
            </Text>
          </Pressable>

          {categories.map(cat => {
            const isSelected = categoryFilter === cat.id;
            return (
              <Pressable
                key={`cat-${cat.id}`}
                onPress={() => setCategoryFilter(cat.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Lọc theo danh mục: ${cat.name}`}
                style={[
                  styles.filterChip,
                  {
                    borderRadius: theme.radii.full,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  },
                ]}
                testID={`filter-chip-category-${cat.id}`}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    styles.filterChipText,
                    { color: isSelected ? theme.colors.onPrimary : theme.colors.textPrimary },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Non-blocking Refresh Error Banner */}
      {refreshError ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.errorContainer,
              borderColor: theme.colors.error,
              borderRadius: theme.radii.small,
              padding: theme.spacing.sm,
            },
          ]}
          testID="service-requests-refresh-error-banner"
          accessibilityRole="alert"
        >
          <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
            {refreshError}
          </Text>
        </View>
      ) : null}
    </View>
  );

  // Footer Component (Loading more indicator / Pagination error retry)
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader} testID="service-requests-footer-loader">
          <LoadingIndicator size="small" message="Đang tải thêm yêu cầu..." />
        </View>
      );
    }

    if (paginationError) {
      return (
        <View
          style={[
            styles.paginationErrorContainer,
            { backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.radii.small },
          ]}
          testID="service-requests-pagination-error"
        >
          <Text style={[theme.typography.caption, styles.errorCenterText, { color: theme.colors.error }]}>
            {paginationError.message}
          </Text>
          <Pressable
            onPress={retryPagination}
            style={[styles.retryPaginationBtn, { backgroundColor: theme.colors.primary }]}
            testID="btn-retry-pagination"
            accessibilityRole="button"
            accessibilityLabel="Thử tải lại trang kế tiếp"
          >
            <Text style={[theme.typography.caption, styles.retryBtnText, { color: theme.colors.onPrimary }]}>
              Thử lại
            </Text>
          </Pressable>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  // Empty Component
  const renderEmpty = () => {
    if (initialLoading) {
      return null;
    }

    if (isQueryActive) {
      return (
        <EmptyState
          title="Không tìm thấy yêu cầu"
          description="Không có yêu cầu dịch vụ nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại."
          actionTitle="Xóa bộ lọc"
          onAction={clearFilters}
          testID="service-requests-empty-filtered"
        />
      );
    }

    return (
      <EmptyState
        title="Chưa có yêu cầu dịch vụ nào"
        description="Các yêu cầu hỗ trợ hoặc dịch vụ bạn tạo hoặc được giao sẽ xuất hiện tại đây."
        testID="service-requests-empty-all"
      />
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="screen-service-requests"
    >
      <FlatList<ServiceRequestSummaryResponse>
        data={requests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ServiceRequestCard
            request={item}
            onPress={() => navigation.navigate('ServiceRequestDetail', { requestId: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        testID="service-requests-flatlist"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenIdHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  headerContainer: {
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontWeight: '700',
  },
  searchBarWrapper: {
    marginTop: 8,
  },
  filterChipsRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipsRowSmall: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontWeight: '600',
  },
  banner: {
    borderWidth: 1,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  paginationErrorContainer: {
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  errorCenterText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  retryPaginationBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: {
    fontWeight: '600',
  },
  footerSpacer: {
    height: 24,
  },
});
