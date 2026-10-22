# Phase 16B Implementation Report: Service Request List (SCR-SRV-01)

## Checkpoint
- **Initial Baseline Commit**: `8292d13b5330279c6a3d4ab007eebbff9be4d894`
- **Branch**: `main`
- **Working Tree**: Clean before changes

---

## Canonical controls
Control classification audit for SCR-SRV-01 per `docs/03_MOBILE_SCREEN_MAP.md:382-397` and Decision `D-065`:
1. `search`: **CANONICAL_VISIBLE** - Exposed via `SearchBar` component with 300ms debounce.
2. `status`: **CANONICAL_VISIBLE** - Exposed as 8 status filter chips (`Tất cả trạng thái`, `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`, `CANCELLED`).
3. `priority`: **CANONICAL_VISIBLE** - Exposed as 5 priority filter chips (`Tất cả ưu tiên`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
4. `categoryId`: **CANONICAL_VISIBLE** - Exposed as category filter chips loaded from `serviceRequestApi.listCategories()`.
5. `requesterId`: **SUPPORTED_BUT_NOT_CANONICAL** - Supported by API adapter, but not exposed as an interactive user-picker filter in root list.
6. `assigneeId`: **SUPPORTED_BUT_NOT_CANONICAL** - Supported by API adapter, but not exposed as an interactive user-picker filter in root list.
7. `assetId`: **SUPPORTED_BUT_NOT_CANONICAL** - Asset picker deferred to Phase 17; creation without asset supported.
8. `createdFrom` / `createdTo`: **SUPPORTED_BUT_NOT_CANONICAL** - Not in canonical mobile list wireframe.
9. `mine` / `assigned-to-me`: **SUPPORTED_BUT_NOT_CANONICAL** - Backend scopes query at controller level using user principal permissions.

---

## Query defaults
- Backend query defaults from `ServiceRequestController.java:81-83`:
  - `page`: `0`
  - `size`: `20` (`PAGE_SIZE = 20`)
  - `sort`: `'createdAt,desc'` (`DEFAULT_SORT = 'createdAt,desc'`)
- Query parameters strictly whitelist-validated through `serviceRequestApi.serializeServiceRequestListQuery`.

---

## Hook
- **File**: `mobile/src/features/serviceRequests/hooks/useServiceRequests.ts`
- **Barrel**: `mobile/src/features/serviceRequests/hooks/index.ts`
- **API Surface**:
  - `requests`: `ServiceRequestSummaryResponse[]`
  - `totalItems`: `number`
  - `initialLoading`: `boolean`
  - `refreshing`: `boolean`
  - `loadingMore`: `boolean`
  - `hasNext`: `boolean`
  - `page`: `number`
  - `error`: `ServiceRequestPresentationError | null`
  - `paginationError`: `ServiceRequestPresentationError | null`
  - `refreshError`: `string | null`
  - `search`: `string`, `setSearch: (text: string) => void`
  - `statusFilter`: `ServiceStatus | undefined`, `setStatusFilter: (status: ServiceStatus | undefined) => void`
  - `priorityFilter`: `ServicePriority | undefined`, `setPriorityFilter: (priority: ServicePriority | undefined) => void`
  - `categoryFilter`: `string | undefined`, `setCategoryFilter: (categoryId: string | undefined) => void`
  - `categories`: `ServiceCategoryResponse[]`
  - `loadInitial: () => Promise<void>`
  - `refresh: () => Promise<void>`
  - `loadMore: () => Promise<void>`
  - `retryPagination: () => Promise<void>`
  - `clearFilters: () => void`

---

## Search
- 300ms debounce implemented using `setTimeout` and ref tracking (`debounceTimerRef`).
- Each keystroke cancels previous pending timer.
- Whitespace normalization:
  - Trims leading and trailing whitespace.
  - Preserves internal multiple whitespace.
  - Empty or whitespace-only searches normalize to `undefined` (omitted from query params).
- Timer safely cancelled on component unmount.

---

## Filters
- Filter setters (`setStatusFilter`, `setPriorityFilter`, `setCategoryFilter`) immediately trigger replace query (page = 0).
- `clearFilters()` resets search input, debounced search, status, priority, and category filter in a single synchronous transition.

---

## Query concurrency
- **Monotonic Generation**: `queryGenerationRef` increments on every replacement query (`mount`, `search`, `filter change`, `refresh`).
- **Latest-Query-Wins**: Any slower, in-flight response or rejection from an older generation is silently discarded without mutating component state or showing false error banners.
- **Unmount Safety**: `mountedRef.current` check guarantees no state updates occur after component unmount.

---

## Pagination
- Same-tick pagination lock: `paginationLockRef.current = true` prevents duplicate concurrent network requests when `loadMore` is invoked multiple times in the same tick.
- Precondition guard: `loadMore` returns immediately without dispatching network calls when `initialLoading`, `refreshing`, `loadingMore`, `!hasNext`, or blocking `error` is present.
- `retryPagination` allows retrying page N+1 without resetting existing list.

---

## Dedup
- When merging page N+1 items into existing list:
  - If an item with an existing ID is received, its payload is updated in-place preserving its existing position in the list.
  - Novel IDs are appended to the end of the array.
  - Prevents duplicate FlatList item keys and preserves backend ordering.

---

## Refresh
- Pull-to-refresh sets `refreshing: true` while retaining existing list content on screen.
- Successful refresh replaces list with authoritative page 0 data.
- Failed refresh retains existing list and displays non-blocking `refreshError` banner in header.
- Refresh invalidates any pending page N+1 append operation.

---

## Card
- **File**: `mobile/src/features/serviceRequests/components/ServiceRequestCard.tsx`
- **Fields Rendered**:
  - `requestNumber`: Human-readable identifier (e.g. `SR-2026-000123`).
  - `categoryName`: Localized category label.
  - `title`: Request title (clamped to 2 lines).
  - `requesterName`: Requester display name.
  - `assigneeName`: Assignee display name (or `'Chưa phân công'` when null).
  - `createdAt`: Localized Vietnamese timestamp format (`HH:mm DD/MM/YYYY`).
- **Security & Minimization**:
  - Zero raw UUIDs (`id`, `categoryId`, `requesterId`, `assigneeId`, `assetId`).
  - Zero `version`, `permissions`, or `allowedActions` exposed in presentation.

---

## Status/Priority
- **StatusBadge**: Reused as-is with `type="serviceRequest"` rendering all 7 canonical statuses (`Mở`, `Đã phân công`, `Đang xử lý`, `Chờ phản hồi`, `Đã giải quyết`, `Đã đóng`, `Đã hủy`).
- **PriorityBadge**: Reused as-is with `ServicePriority` mapped directly (`Khẩn cấp`, `Cao`, `Trung bình`, `Thấp`).

---

## Empty states
- Differentiated empty states:
  - **Global Empty**: `"Chưa có yêu cầu dịch vụ nào"` with description `"Các yêu cầu hỗ trợ hoặc dịch vụ bạn tạo hoặc được giao sẽ xuất hiện tại đây."` (`testID="service-requests-empty-all"`).
  - **Filtered Empty**: `"Không tìm thấy yêu cầu"` with description `"Không có yêu cầu dịch vụ nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại."` with active action button `"Xóa bộ lọc"` (`testID="service-requests-empty-filtered"`).

---

## Error states
- **Blocking Initial Error**: Full-screen `ErrorState` with `"Thử lại"` action calling `loadInitial` (`testID="service-requests-error"`).
- **Non-blocking Refresh Error**: Header banner displaying error message while preserving list items (`testID="service-requests-refresh-error-banner"`).
- **Inline Pagination Error**: Footer banner with retry button calling `retryPagination` (`testID="service-requests-pagination-error"`, `testID="btn-retry-pagination"`).

---

## Navigation staging
- **Strictly Staged**:
  - `ServiceRequestDetail` (`SCR-SRV-02`) is deferred to Phase 16C; card is strictly presentation-only (no button role, no onPress, no navigation trigger).
  - `CreateServiceRequest` (`SCR-SRV-04`) is deferred to Phase 16D; no Create button or FAB rendered in 16B.
  - Exactly 5 bottom tabs preserved: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`. Tab 4 placeholder replaced with real `ServiceRequestsScreen`.

---

## Accessibility
- Root header marked with `accessibilityRole="header"`.
- All interactive filter chips have `accessibilityRole="button"`, `accessibilityState={{ selected }}`, and minimum 48dp touch target height.
- Search input has `accessibilityRole="search"`.
- Card provides comprehensive accessible summary.

---

## Tests
- **Suites Added / Updated**:
  1. `mobile/__tests__/serviceRequests/useServiceRequests.test.tsx` (16 tests)
  2. `mobile/__tests__/serviceRequests/ServiceRequestCard.test.tsx` (7 tests)
  3. `mobile/__tests__/screens/ServiceRequestsScreen.test.tsx` (13 tests)
  4. `mobile/__tests__/navigation.test.tsx` (8 tests passing, tab order and switching verified)
- **Total Test Suites**: 88 passed, 88 total (+3 suites).
- **Total Tests**: 832 passed, 832 total (+36 tests).
- **Failures / Skipped**: 0 / 0.
- **Snapshots**: 0.

---

## Android
- **Command**: `cd mobile/android; .\gradlew.bat assembleDebug --no-daemon`
- **Result**: `BUILD SUCCESSFUL in 41s`
- **Actionable Tasks**: 203 (16 executed, 187 up-to-date)

---

## Security
- Zero token handling or storage alterations.
- Zero local caching / persistence of service requests.
- Zero raw database UUIDs rendered in UI.
- Zero premature navigation routes registered in runtime.
- Zero asset management screens or modals introduced.
- Zero backend source modifications.
- Zero directory feature modifications.
- Zero new dependencies added.

---

## Scope
- Strictly confined to Phase 16B Service Request List (SCR-SRV-01).

---

## Files
- `mobile/src/features/serviceRequests/components/ServiceRequestCard.tsx` (New)
- `mobile/src/features/serviceRequests/components/index.ts` (New)
- `mobile/src/features/serviceRequests/hooks/useServiceRequests.ts` (New)
- `mobile/src/features/serviceRequests/hooks/index.ts` (New)
- `mobile/src/features/serviceRequests/screens/ServiceRequestsScreen.tsx` (Replaced placeholder with real screen)
- `mobile/src/features/serviceRequests/index.ts` (Updated exports)
- `mobile/__tests__/serviceRequests/useServiceRequests.test.tsx` (New)
- `mobile/__tests__/serviceRequests/ServiceRequestCard.test.tsx` (New)
- `mobile/__tests__/screens/ServiceRequestsScreen.test.tsx` (New)
- `reports/PHASE_16B_SERVICE_REQUEST_LIST_REPORT.md` (New)

---

## 16C boundary
Phase 16C will implement Service Request Detail Screen (`SCR-SRV-02`) and Sheet Từ chối kết quả xử lý (`SCR-SRV-03`), register `ServiceRequestDetail` in navigation, and activate interactive navigation on `ServiceRequestCard`.

---

## Conclusion

PHASE_16B_PASS_PUSHED
