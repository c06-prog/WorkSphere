# Phase 18C — Notification Read State & Shared Unread Badge Report

## 1. Overview & Objective
Phase 18C implements the full notification read lifecycle and shared badge synchronization across WorkSphere Mobile in compliance with Decision **D-067**:
- Single notification mark-as-read via `PUT /api/v1/notifications/{notificationId}/read`.
- Bulk mark-all-read via `PUT /api/v1/notifications/read-all`.
- Real-time unread count synchronization between the Notification Center list, Dashboard bell button badge, and More menu row badge using `NotificationBadgeContext`.
- Screen focus refresh via REST-only `useFocusEffect` hooks without background polling, native push, or WebSocket dependencies.
- Strict scope retention: Deep-link routing to entity detail (Task/Project/Service Request/Asset) is strictly deferred to Phase 18D.

---

## 2. Changes Summary

### 2.1 Notification Card Component (`mobile/src/features/notifications/components/NotificationCard.tsx`)
- Added `isMarkingRead?: boolean` prop.
- Disabled touch interactions while marking is in flight to eliminate rapid duplicate tap race conditions.
- Updated accessibility label to reflect pending state when marking read.

### 2.2 Notification State Hook (`mobile/src/features/notifications/hooks/useNotifications.ts`)
- Added `markOneAsRead(notificationId: string): Promise<boolean>`:
  - In `ALL` mode: updates target item to `read: true` in place.
  - In `UNREAD` mode: removes target item from list and decrements `totalItems`.
  - Decrements shared unread badge count via `applyNotificationRead()`.
  - Guarded with `markingIdsRef` and `markingIds` state map for per-item in-flight indicator.
- Added `markAllAsRead(): Promise<number>`:
  - In `ALL` mode: marks all displayed items `read: true`.
  - In `UNREAD` mode: clears the notification list completely.
  - Resets shared unread badge count to 0 via `applyAllRead()`.
  - Guarded with `markingAllRef` and `isMarkingAll` flag.
- Added mutation error reporting (`mutationError`, `clearMutationError`).
- Integrated `refreshUnreadCount` fallback on mutation errors.

### 2.3 Notification List Screen (`mobile/src/features/notifications/screens/NotificationListScreen.tsx`)
- Header "Đọc tất cả" button (`testID="btn-mark-all-read"`) conditionally rendered/enabled when `unreadCount > 0` and `!isMarkingAll`.
- Integrated `ConfirmationDialog` prompting user before executing bulk mark-all-as-read.
- Single notification card tap initiates `markOneAsRead(item.id)` when `!item.read`.
- Integrated `useFocusEffect` to refresh authoritative unread count on screen re-focus.
- Added user-facing dismissible mutation error banner.

### 2.4 Dashboard Screen (`mobile/src/features/dashboard/screens/DashboardScreen.tsx`)
- Integrated `useNotificationBadge` hook.
- Added `useFocusEffect` callback triggering `refreshUnreadCount().catch(() => {})`.
- Added unread badge pill container (`testID="badge-dashboard-notifications"`):
  - Hidden when `unreadCount === 0`.
  - Displays exact number `1..99` or `'99+'` when `>= 100`.
- Bell button `accessibilityLabel` dynamically includes unread count semantics.

### 2.5 More Screen (`mobile/src/features/more/screens/MoreScreen.tsx`)
- Integrated `useNotificationBadge` hook.
- Added `useFocusEffect` callback triggering `refreshUnreadCount().catch(() => {})`.
- Converted "Thông báo" navigation button into a row containing badge pill (`testID="badge-more-notifications"`).
- Badge hidden when `unreadCount === 0`.

---

## 3. Test Suites & Verification

### 3.1 New & Updated Tests
- `mobile/__tests__/notifications/useNotificationsMutations.test.ts`:
  - `markOneAsRead` marks single notification as read in `ALL` mode and updates badge.
  - `markOneAsRead` removes item and decrements count in `UNREAD` mode.
  - `markAllAsRead` resets badge count to 0 and updates items in `ALL` mode.
  - `markAllAsRead` empties list in `UNREAD` mode.
- `mobile/__tests__/notifications/NotificationListScreenMutations.test.tsx`:
  - Renders "Đọc tất cả" button, opens confirmation dialog, and executes bulk mark-as-read.
  - Tapping unread card triggers single mark-as-read mutation.
- `mobile/__tests__/notifications/NotificationBadges.test.tsx`:
  - Dashboard bell renders badge with exact count and 99+ overflow, hides when 0.
  - More menu renders badge pill with exact count and 99+ overflow, hides when 0.
- Updated mock configurations for `useNotificationBadge` and `useFocusEffect` across existing navigation and screen tests (`DashboardScreen.test.tsx`, `MoreScreenAssetEntry.test.tsx`, `authNavigationGuard.test.tsx`, `NotificationListScreen.test.tsx`, `useNotifications.test.ts`, `NotificationNavigationEntries.test.tsx`).

### 3.2 Quality Gates Executed
1. **TypeScript Typecheck**:
   ```powershell
   npm --prefix mobile run typecheck
   # Output: PASS (0 errors)
   ```
2. **ESLint**:
   ```powershell
   npm --prefix mobile run lint
   # Output: PASS (0 errors, 48 historical warnings preserved)
   ```
3. **Full Mobile Regression Suite**:
   ```powershell
   npm --prefix mobile test -- --runInBand
   # Output: Test Suites: 127 passed, 127 total
   #         Tests:       1131 passed, 1131 total
   #         Snapshots:   0 total
   #         Time:        37.729 s
   ```

---

## 4. Canonical & Safety Constraints Adherence
- No backend modifications.
- No changes to canonical documents (`docs/`, `design/`).
- No native push (APNs/FCM) or WebSocket/STOMP/SSE background daemons introduced.
- Strict REST-only polling / focus synchronization as mandated by D-067.
- Deep-link entity navigation deferred to Phase 18D.
