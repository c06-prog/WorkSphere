# Phase 18D Report: Mobile Notification Context Navigation

## Checkpoint Baseline
- **Starting Checkpoint:** `2474dd61dc0d2dda9f659a32cf99a475a8038a6e`
- **Phase Scope:** Complete notification row press behavior to mark read (Phase 18C semantics) and type-safely navigate to referenced entity detail screens (`PROJECT`, `TASK`, `SERVICE_REQUEST`, `ASSET`).

---

## 1. Backend Reference Contract Audit & Verification

We verified the backend event dispatchers to ensure every notification payload reference type and reference ID mapping matches canonical design:

1. **`NotificationEventDispatcher.java`**:
   - `PROJECT_MEMBER_ADDED`: `referenceType = PROJECT`, `referenceId = projectId` (UUID).
   - `TASK_ASSIGNED`: `referenceType = TASK`, `referenceId = taskId` (UUID).
   - `TASK_STATUS_CHANGED`: `referenceType = TASK`, `referenceId = taskId` (UUID).
   - `COMMENT_ADDED` (Task): `referenceType = TASK`, `referenceId = taskId` (UUID).
   - `SERVICE_REQUEST_UPDATED`: `referenceType = SERVICE_REQUEST`, `referenceId = requestId` (UUID).
   - `ASSET_ASSIGNED`: `referenceType = ASSET`, `referenceId = assetId` (UUID).
2. **`TaskDeadlineScanner.java`**:
   - `TASK_DUE_SOON`: `referenceType = TASK`, `referenceId = taskId` (UUID).
   - `TASK_OVERDUE`: `referenceType = TASK`, `referenceId = taskId` (UUID).

All reference IDs in WorkSphere are RFC 4122 standard UUIDs.

---

## 2. Navigation Architecture & Route Ownership

The target entity detail screens reside in distinct navigators across WorkSphere Mobile:
- **`AppNavigator` (Root AppStack):**
  - `NotificationListScreen`: Native stack screen.
  - `AssetDetailScreen`: Native stack screen (`AssetDetail`, params: `{ assetId: string }`).
- **`MainTabNavigator` (Nested in AppStack via `MainTabs`):**
  - `TaskDetailScreen`: Registered in `MainTabNavigator` (`TaskDetail`, params: `{ taskId: string }`).
  - `ProjectDetailScreen`: Registered in `MainTabNavigator` (`ProjectDetail`, params: `{ projectId: string }`).
  - `ServiceRequestDetailScreen`: Registered in `MainTabNavigator` (`ServiceRequestDetail`, params: `{ requestId: string }`).

### Navigator Resolution Strategy
- Direct navigation for AppStack routes:
  ```ts
  navigation.navigate('AssetDetail', { assetId });
  ```
- Nested navigation for MainTabs routes:
  ```ts
  navigation.navigate('MainTabs', {
    screen: 'TaskDetail',
    params: { taskId },
  });
  ```
- Typed navigation helper `NotificationListNavigationProp` created with `CompositeNavigationProp<NativeStackNavigationProp<AppStackParamList, 'NotificationList'>, BottomTabNavigationProp<MainTabParamList>>`.

---

## 3. Implementation Details

### A. Pure Navigation Helper (`notificationNavigationHelper.ts`)
- Added RFC 4122 UUID validation `isValidUuid(id)`.
- Validates that non-UUID strings or empty reference IDs return `null` instead of generating invalid route params.
- Pure mapping from `(referenceType, referenceId)` -> `{ screen, params }`.

### B. Notification Card Feedback (`NotificationCard.tsx`)
- Added `isNavigating?: boolean` prop.
- Sets `disabled={isPending}` where `isPending = isMarkingRead || isNavigating`.
- Added accessibility announcement `Đang mở liên kết` and opacity dimming while in navigation flight.

### C. Press Orchestration & Edge Cases (`NotificationListScreen.tsx`)
1. **Synchronous Reentrancy Lock:**
   - Managed via `navigatingIdsRef.current` (Set of IDs in flight) and `setNavigatingId` state.
   - Prevents duplicate clicks or rapid double taps on the same notification from firing multiple mark-read mutations or navigation calls.
2. **Missing or Unsupported Reference Handling:**
   - If reference is missing, unsupported, or contains invalid UUID:
     - Automatically marks unread notification as read in background without blocking.
     - Displays accessible feedback banner: *"Thông báo này không có nội dung liên kết để mở."* (`testID="banner-notification-info"`).
     - Retains user on NotificationListScreen; zero crashes.
3. **Mark Read Before Navigation:**
   - If notification is unread (`read: false`), calls `markOneAsRead(notificationId)`.
   - If mutation fails, halts navigation and displays mutation error banner.
4. **Session Integrity Guard:**
   - Compares initial session state/user against post-mutation session state/user.
   - Discards navigation if user logged out or switched during in-flight mark-read.

---

## 4. Test Verification & Quality Gates

### A. Unit & Orchestration Tests
- `mobile/__tests__/notifications/notificationNavigationHelper.test.ts`: 9 tests passing (UUID validation and reference type mapping).
- `mobile/__tests__/notifications/NotificationContextNavigation.test.tsx`: 7 tests passing:
  - Case A: Unread TASK marks read and navigates to nested `TaskDetail`.
  - Case A: Unread ASSET marks read and navigates to `AssetDetail`.
  - Case B: Read PROJECT navigates without calling mark-read API.
  - Case B: Read SERVICE_REQUEST navigates without calling mark-read API.
  - Case C: Missing reference marks read and shows info banner without navigating.
  - Case D: Mark-read failure displays error banner and halts navigation.
  - Navigation Lock: Double-tap prevention verified.

### B. Full Real Navigator Tree Integration Tests
- `mobile/__tests__/notifications/NotificationNavigatorTreeIntegration.test.tsx`: 3 tests passing:
  - Verifies exact 5 bottom tabs are rendered (Dashboard, Projects, Tasks, Requests, More) without rogue tabs.
  - Full flow: Dashboard bell -> NotificationList -> TaskDetail (`MainTabs` nested) -> Back -> NotificationList.
  - Full flow: More tab -> NotificationList -> AssetDetail (`AppStack`) -> Back -> NotificationList.

### C. Quality Gate Metrics
- **TypeScript:** `npm --prefix mobile run typecheck` (0 errors, clean).
- **ESLint:** `npm --prefix mobile run lint` (0 errors, 48 historical warnings preserved).
- **Full Mobile Test Suite:** `npm --prefix mobile test -- --runInBand` (129 test suites passed, 1142 tests passed, 0 failed).

---

## 5. Architectural Compliance & Exclusions
- **No standalone Notification Detail screen:** Kept lightweight; notifications navigate directly to target entities.
- **No Push Notification / WebSocket:** Strictly kept to REST-refresh-only model.
- **Zero changes to backend or canonical `docs/`/`design/`:** Mobile client only.
- **Next Phase:** Phase 18E — Mobile Notification Polling, Invalidation & Polish.
