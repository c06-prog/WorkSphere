# PHASE 18B REPORT: NOTIFICATION CENTER LIST

## 1. Executive Summary & Checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `058196daccbc742881673017c0b15c80ed0cbe92`
- **Delivered Scope**: Phase 18B — Notification Center List (`SCR-NOT-01`).
- **Governing Architecture Decision**: **Decision D-067** (`reports/DECISIONS.md`).
- **Phase Prerequisites**:
  - Phase 16: `CLOSED / MEMORY_CHECKPOINT_CLOSED`
  - Phase 17: `CLOSED / MEMORY_CHECKPOINT_CLOSED`
  - Phase 18A: `CLOSED / VERIFIED`
  - Phase 18B: `COMPLETED / READY_FOR_18C`

---

## 2. Architecture & Implementation Summary

### A. SCR-NOT-01 Canonical Screen
- **File**: `mobile/src/features/notifications/screens/NotificationListScreen.tsx`
- Registered in `AppNavigator` as stack route `NotificationList`.
- Features:
  - Header with Back navigation and title "Thông báo".
  - Segmented control tabs: "Tất cả" (mode `ALL`, queries `read=undefined`) and "Chưa đọc" (mode `UNREAD`, queries `read=false`).
  - FlatList with `NotificationCard` items, pull-to-refresh (`RefreshControl`), and infinite scroll pagination (`onEndReached`).
  - Dedicated empty states for `ALL` ("Không có thông báo") and `UNREAD` ("Không có thông báo chưa đọc").
  - `LoadingIndicator` for initial fetch and `ErrorState` with retry.

### B. useNotifications Hook
- **File**: `mobile/src/features/notifications/hooks/useNotifications.ts`
- State isolation: Independent queries for `ALL` and `UNREAD` modes with separate page/item resets.
- Concurrency protection: Monotonically increasing `queryGenerationRef` to discard stale async responses.
- Pagination guard: Synchronous `paginationLockRef` to eliminate duplicate concurrent `loadMore` dispatches.
- Sequential deduplication: Set-based deduplication by notification `id` preserving ordering.
- Pull-to-refresh: Resets to page 0 while preserving visible list during loading.
- Retains existing list items if a pagination page fails.

### C. NotificationCard Component
- **File**: `mobile/src/features/notifications/components/NotificationCard.tsx`
- Renders: `title`, `message`, localized relative timestamp, and accessible unread visual indicator (bullet dot + 700 font weight).
- Non-color-only distinction: Font weight differences (700 for unread, 500 for read) and accessible label state.
- In Phase 18B: `onPress` passes `notification` object in a type-safe callback without triggering mutations or entity deep-linking.

### D. Relative Timestamp Formatter
- **File**: `mobile/src/features/notifications/utils/notificationDate.ts`
- Localized Vietnamese rules:
  - `< 60s`: "Vừa xong"
  - `< 60m`: `${minutes} phút trước`
  - `< 24h`: `${hours} giờ trước`
  - `1 day`: `Hôm qua lúc HH:mm`
  - `older`: `dd/MM/yyyy HH:mm`
- Fully deterministic with optional `referenceNowMs` for reproducible test verification.

### E. Navigation Entry Points
1. **Dashboard Header Bell Button**:
   - `DashboardScreen.tsx`: Added bell button (`testID="btn-dashboard-notifications"`, touch target >= 48dp) that navigates to `NotificationList`.
2. **More Menu Item**:
   - `MoreScreen.tsx`: Added "Thông báo" button (`testID="btn-navigate-notifications"`) navigating to `NotificationList`.

---

## 3. Files Created & Modified

### New Files
1. `mobile/src/features/notifications/utils/notificationDate.ts`: Relative time formatting utility.
2. `mobile/src/features/notifications/hooks/useNotifications.ts`: Custom notification list hook.
3. `mobile/src/features/notifications/hooks/index.ts`: Barrel export.
4. `mobile/src/features/notifications/components/NotificationCard.tsx`: Notification card presentation component.
5. `mobile/src/features/notifications/components/index.ts`: Barrel export.
6. `mobile/src/features/notifications/screens/NotificationListScreen.tsx`: Canonical `SCR-NOT-01` screen.
7. `mobile/src/features/notifications/screens/index.ts`: Barrel export.
8. `mobile/__tests__/notifications/notificationDate.test.ts` (7 tests)
9. `mobile/__tests__/notifications/useNotifications.test.ts` (5 tests)
10. `mobile/__tests__/notifications/NotificationCard.test.tsx` (3 tests)
11. `mobile/__tests__/notifications/NotificationListScreen.test.tsx` (4 tests)
12. `mobile/__tests__/notifications/NotificationNavigationEntries.test.tsx` (2 tests)

### Modified Files
1. `mobile/src/app/navigation/AppNavigator.tsx`: Registered `NotificationList` stack screen with `NotificationListScreen`.
2. `mobile/src/features/dashboard/screens/DashboardScreen.tsx`: Added bell header button opening `NotificationList`.
3. `mobile/src/features/more/screens/MoreScreen.tsx`: Added "Thông báo" button opening `NotificationList`.
4. `mobile/src/features/notifications/index.ts`: Re-exported hooks, components, screens, and date utility.

---

## 4. Scope Exclusions (Deferred per Roadmap)

Intentionally deferred to subsequent subphases per Decision D-067:
- **Phase 18C**: Read state mutations (`markNotificationRead`, `markAllNotificationsRead`), `useRef` submission locks, and unread badge numbers on Dashboard bell and More row.
- **Phase 18D**: Context deep-linking (`TaskDetail`, `ProjectDetail`, `ServiceRequestDetail`, `AssetDetail`) triggered from notification item taps.
- **Out of Scope**: Native push notifications (FCM / APNs), Android notification channels / tray, WebSockets, background daemons.

---

## 5. Quality Gates Verification

| Quality Gate | Command | Result | Notes |
|:---|:---|:---|:---|
| TypeScript Typecheck | `npm --prefix mobile run typecheck` | **PASS (0 errors)** | Exit code 0 |
| ESLint Check | `npm --prefix mobile run lint` | **PASS (0 errors, 48 historical warnings preserved)** | Zero new warnings or errors |
| Notification Test Suites | `npm --prefix mobile test -- --testPathPattern=notifications` | **PASS (10 suites, 71 tests)** | Exit code 0 |
| Full Mobile Regression Suite | `npm --prefix mobile test -- --runInBand` | **PASS (124 suites, 1121 tests)** | 0 failures, 0 skipped |

---

## 6. Next Steps
- Proceed to **Phase 18C**: Read State Mutations & Shared Unread Badge Integration.
