# PRE-PHASE 18 AUDIT
## Mobile Notification System

## Checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Audited Checkpoint**: `16b398036721c442a3df08fa3ee9b21058008b3e`
- **Preceding Milestones**:
  - Phase 16: `7c14777` (`CLOSED / MEMORY_CHECKPOINT_CLOSED`)
  - Phase 17: `16b3980` (`CLOSED / MEMORY_CHECKPOINT_CLOSED`)
  - Phase 18: `NOT STARTED`
- **Git State**: Clean, `HEAD == origin/main`.

---

## Phase scope
- **Name**: Phase 18 — Mobile Notification System.
- **Canonical Sources**:
  - `docs/01_PROJECT_SCOPE.md` (Section 3.5: Trung tâm thông báo nội bộ in-app).
  - `docs/03_MOBILE_SCREEN_MAP.md` (Section 11: Notification Module).
  - `docs/06_API_CONTRACT.md` (Section 15: In-app Notification and Preference APIs).
  - `design/02_SCREEN_INVENTORY.md` (`SCR-NOT-01`: Notification List Screen).
  - `design/08_API_SCREEN_MAPPING.md` (Mapping for `SCR-NOT-01`).
- **Core Scope**:
  - Complete implementation of the in-app Notification Center (`SCR-NOT-01` / `SCR-NOTIF-01`).
  - Notification listing with pagination, pull-to-refresh, empty and error handling.
  - Read/unread state differentiation (visual non-color dot + typography weight).
  - Unread count badge integration.
  - Mutations: Mark individual notification read, mark all notifications read.
  - Deep-link / context navigation to source entities (`PROJECT`, `TASK`, `SERVICE_REQUEST`, `ASSET`) based on `referenceType` and `referenceId`.

---

## Canonical screens
- **`SCR-NOT-01` / `SCR-NOTIF-01` (Notification List Screen)**:
  - Role/Access: All authenticated users (`NOTIFICATION_READ`).
  - Core views: Notification list with tabs/filters ("Tất cả", "Chưa đọc"), relative timestamps, read/unread status indicator.
  - Actions: Mark all as read, tap to mark read and navigate to referenced entity.
  - Entry point: Header bell icon on Dashboard and/or More menu entry.
- **Notification Detail Screen**:
  - **NOT CANONICAL**: Canonical API Contract Section 15 explicitly notes: *"Không có endpoint riêng GET /notifications/{id}. Client sử dụng referenceType và referenceId từ item thông báo để điều hướng trực tiếp (deep link) đến màn hình chi tiết đối tượng liên quan (Project, Task, Service Request, Asset)."*
  - Therefore, tapping a notification navigates directly to the target entity screen rather than a standalone notification detail screen.
- **Notification Preferences / Settings Screen**:
  - Backend supports `GET/PUT /api/v1/notification-preferences`. In Mobile Phase 18, viewing/updating preferences can be hosted as a secondary action or deferred per roadmap priority.

---

## Explicit exclusions
Strictly excluded from Phase 18:
1. Native push notifications (Firebase Cloud Messaging / Apple Push Notification service) — API Contract Section 15 explicitly specifies Phase 11/Mobile delivery is in-app database notification only.
2. Android native notification channels, status bar tray notifications, or Android 13+ `POST_NOTIFICATIONS` runtime permission.
3. Native background workers / WorkManager background push sync.
4. WebSocket / STOMP / Server-Sent Events (SSE) connections (backend currently has zero WebSocket/STOMP dependencies).
5. Notification hard-delete or archive mutations (no backend endpoint exists).
6. Deep linking from external OS URI schemes (`worksphere://`) without in-app session.

---

## Backend source inventory
- **Controller**:
  - `backend/src/main/java/com/worksphere/notification/web/NotificationController.java`
- **Application Services & Schedulers**:
  - `backend/src/main/java/com/worksphere/notification/application/NotificationApplicationService.java`
  - `backend/src/main/java/com/worksphere/notification/application/NotificationEventDispatcher.java`
  - `backend/src/main/java/com/worksphere/notification/application/TaskDeadlineScanner.java`
- **Domain Entities & Enums**:
  - `backend/src/main/java/com/worksphere/notification/domain/Notification.java`
  - `backend/src/main/java/com/worksphere/notification/domain/NotificationPreference.java`
  - `backend/src/main/java/com/worksphere/notification/domain/NotificationType.java`
  - `backend/src/main/java/com/worksphere/notification/domain/NotificationReferenceType.java`
- **Repositories**:
  - `backend/src/main/java/com/worksphere/notification/infrastructure/persistence/NotificationRepository.java`
  - `backend/src/main/java/com/worksphere/notification/infrastructure/persistence/NotificationPreferenceRepository.java`
- **DTOs**:
  - `backend/src/main/java/com/worksphere/notification/api/response/NotificationResponse.java`
  - `backend/src/main/java/com/worksphere/notification/api/response/ReadAllNotificationsResponse.java`
  - `backend/src/main/java/com/worksphere/notification/api/response/UnreadCountResponse.java`
  - `backend/src/main/java/com/worksphere/notification/api/response/NotificationPreferencesResponse.java`
  - `backend/src/main/java/com/worksphere/notification/api/request/UpdateNotificationPreferencesRequest.java`

---

## Endpoint matrix
| Method | Path | Required Permission | Request Body | Response Data | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | `NOTIFICATION_READ` | None (Query: `page`, `size`, `read`, `type`, `sort`) | `PagedData<NotificationResponse>` | `PHASE_18_REQUIRED` | Scoped to authenticated user (`principal.userId`) |
| `PUT` | `/api/v1/notifications/{notificationId}/read` | `NOTIFICATION_UPDATE` | None | `ApiResponse<Void>` | `PHASE_18_REQUIRED` | Idempotent mark-read; returns 404 if not owned |
| `PUT` | `/api/v1/notifications/read-all` | `NOTIFICATION_UPDATE` | None | `ReadAllNotificationsResponse` (`updatedCount`) | `PHASE_18_REQUIRED` | Idempotent bulk mark-read for current user |
| `GET` | `/api/v1/notifications/unread-count` | `NOTIFICATION_READ` | None | `UnreadCountResponse` (`count`) | `PHASE_18_REQUIRED` | Fast unread badge query |
| `GET` | `/api/v1/notification-preferences` | `isAuthenticated()` | None | `NotificationPreferencesResponse` | `DEFERRED_OR_AUXILIARY` | Per-type push/email/in-app toggles |
| `PUT` | `/api/v1/notification-preferences` | `isAuthenticated()` | `UpdateNotificationPreferencesRequest` | `ApiResponse<Void>` | `DEFERRED_OR_AUXILIARY` | Update toggles |

---

## DTO contract
- **`NotificationResponse`**:
  ```typescript
  interface NotificationResponse {
    id: string; // UUID
    type: NotificationType;
    title: string;
    message: string;
    referenceType: NotificationReferenceType | null;
    referenceId: string | null; // UUID
    read: boolean;
    createdAt: string; // ISO-8601 Instant
  }
  ```
- **`UnreadCountResponse`**:
  ```typescript
  interface UnreadCountResponse {
    count: number;
  }
  ```
- **`ReadAllNotificationsResponse`**:
  ```typescript
  interface ReadAllNotificationsResponse {
    updatedCount: number;
  }
  ```

---

## Notification types
Backend canonical types defined in `NotificationType.java`:
1. `PROJECT_MEMBER_ADDED` -> Reference: `PROJECT`
2. `TASK_ASSIGNED` -> Reference: `TASK`
3. `TASK_STATUS_CHANGED` -> Reference: `TASK`
4. `TASK_DUE_SOON` -> Reference: `TASK`
5. `TASK_OVERDUE` -> Reference: `TASK`
6. `SERVICE_REQUEST_UPDATED` -> Reference: `SERVICE_REQUEST`
7. `COMMENT_ADDED` -> Reference: `TASK` (or context entity)
8. `ASSET_ASSIGNED` -> Reference: `ASSET`

Reference types defined in `NotificationReferenceType.java`:
- `PROJECT`
- `TASK`
- `SERVICE_REQUEST`
- `ASSET`

---

## Identity model
- `notificationId`: Primary key UUID of the notification.
- `recipientId`: User UUID owning the notification (server-enforced via JWT subject).
- `referenceId`: Target entity UUID.
- `referenceType`: Enum string (`PROJECT`, `TASK`, `SERVICE_REQUEST`, `ASSET`).
- Strict rule: Client must **never** parse entity IDs from the notification `title` or `message`; navigation must strictly rely on `referenceType` and `referenceId`.

---

## Read / unread lifecycle
- Newly generated notifications start with `is_read = false`, `read_at = null`.
- Marking a notification read via `PUT /api/v1/notifications/{id}/read` sets `is_read = true` and `read_at = Instant.now()`.
- Idempotent: If already read, returns 200 OK without error.
- Marking all read via `PUT /api/v1/notifications/read-all` updates all unread notifications for the recipient in a single transaction and returns `updatedCount`.
- Ownership check: A user cannot read another user's notification; returning 404 prevents user enumeration.

---

## Unread badge
- Sourced authoritatively from `GET /api/v1/notifications/unread-count`.
- Badge locations:
  1. Bell icon button on Dashboard header.
  2. "Thông báo" row under More menu.
- Display logic: Render exact integer when `count > 0` (or `99+` if `count > 99`); hidden or dot-free when `count === 0`.
- Optimistic / Local sync: When a single item is marked read, count decrements by 1; when mark-all-read succeeds, count resets to 0. Refreshed on screen focus.

---

## Entry & Navigation
- **Entry points**:
  1. Header Bell Icon in `DashboardScreen` (navigates to `NotificationList`).
  2. Menu item in `MoreScreen` ("Thông báo" with unread count pill).
- **Navigation Architecture**:
  - `AppNavigator` stack screen: `NotificationList` (`AppStackParamList`).
  - Does NOT occupy a bottom tab (bottom tabs remain frozen at 5: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`).
  - Context navigation from notification row:
    - `referenceType === 'TASK'` -> `navigation.navigate('TaskDetail', { taskId: referenceId })`
    - `referenceType === 'PROJECT'` -> `navigation.navigate('ProjectDetail', { projectId: referenceId })`
    - `referenceType === 'SERVICE_REQUEST'` -> `navigation.navigate('ServiceRequestDetail', { requestId: referenceId })`
    - `referenceType === 'ASSET'` -> `navigation.navigate('AssetDetail', { assetId: referenceId })`
    - Unknown or missing `referenceId` -> Fallback: marks read, stays on list, avoids crash.

---

## Security
- Endpoints require `NOTIFICATION_READ` (listing, unread count) or `NOTIFICATION_UPDATE` (marking read).
- Canonical permission matrix confirms all authenticated system roles (`EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN`) possess both `NOTIFICATION_READ` and `NOTIFICATION_UPDATE`.
- Direct-route security: Destination detail screens independently query backend using authenticated session; passing `{ taskId: referenceId }` grants zero client-side privilege bypass.

---

## Pagination / Filter / Sort
- **Pagination Defaults**: `page = 0`, `size = 20`.
- **Sorting Default**: `sort=createdAt,desc`.
- **Filtering**:
  - `read`: boolean filter (`read=false` for "Chưa đọc" tab, omitted for "Tất cả").
  - `type`: optional filter by `NotificationType`.

---

## Realtime boundary
- **Current Architecture**: `REST_REFRESH_ONLY` + focus-triggered invalidation.
- Neither backend nor mobile contains WebSocket, STOMP, or FCM push infrastructure.
- Safe foreground polling or focus-based refresh (`useFocusEffect`) provides responsive badge and list updates without complex daemon threads.

---

## Existing mobile source
- Dashboard preview: `DashboardScreen.tsx` currently displays up to 5 `recentNotifications` from `GET /dashboard`.
- Types: `dashboardTypes.ts` contains `RecentNotificationItem`.
- Missing in mobile:
  - `src/features/notifications/` module directory.
  - Dedicated `notificationApi.ts` and `notificationTypes.ts`.
  - `NotificationListScreen.tsx`.
  - Stack route `NotificationList` in `AppNavigator.tsx` and `types.ts`.
  - Context / Hook for global unread count badge.

---

## Reuse
- `apiClient`: Reused as-is for HTTP calls.
- `EmptyState`, `ErrorState`, `LoadingIndicator`: Reused for standard UI states.
- List concurrency patterns from `useAssets` / `useServiceRequests`: Reused (`queryGenerationRef`, `loadingMoreRef`, ID deduplication).
- Synchronous mutation locks (`submittingRef`): Reused for mark-read actions.
- Date formatting: Reused from `src/shared/utils/formatDate.ts`.

---

## Concurrency
- `queryGenerationRef`: Monotonically incremented query generation to reject out-of-order search/filter responses.
- `loadingMoreRef`: Prevents concurrent page append requests during fast scrolling.
- Deduping: Items keyed by `notification.id` to prevent duplicate render rows.
- Same-tick lock: `submittingRef` on "Đánh dấu tất cả đã đọc" to prevent double-invocations.

---

## Mutations
1. `markNotificationRead(notificationId: string)`:
   - Call `PUT /api/v1/notifications/{notificationId}/read`.
   - Update item in local list state (`read = true`).
   - Decrement unread count badge.
2. `markAllNotificationsRead()`:
   - Call `PUT /api/v1/notifications/read-all`.
   - Synchronous `submittingRef` lock.
   - Update all local items (`read = true`).
   - Reset unread count badge to 0.

---

## Errors
- `NOTIFICATION_NOT_FOUND` (404): Handled gracefully (treated as already read or deleted).
- `VALIDATION_ERROR` (400): Standard error presentation.
- Network / Server errors: Inline banner or toast; non-blocking retry.

---

## Tests
- **Contract Tests**: Parity between TypeScript DTOs and backend `NotificationResponse`.
- **Component Tests**:
  - `NotificationListScreen.test.tsx`: initial loading, list rendering, tab switching (All vs Unread), empty state, error retry, pull-to-refresh, pagination.
  - Mark-read item interaction and optimistic update.
  - Mark-all-read button interaction and unread badge reset.
  - Context navigation for each `referenceType` (`TASK`, `PROJECT`, `SERVICE_REQUEST`, `ASSET`).
  - Unread badge rendering on Dashboard header and More screen.

---

## Backend test evidence
- Tested and verified in backend test suite:
  - `NotificationMockMvcTest`: 6 tests passing.
  - `NotificationPreferenceMockMvcTest`: 5 tests passing.
  - `NotificationIdempotencyAndScannerTest`: 6 tests passing.
  - `SourceNotificationIntegrationTest`: 12 tests passing.
  - `V017MigrationTest`: 4 tests passing.
- Total: 33 backend tests specifically covering notifications, all passing.

---

## Decisions required (Proposed Decision D-067)
1. **D-067 Scope Freeze**:
   - Scope is in-app Notification Center only; native FCM/APNs push notifications are explicitly excluded.
2. **Navigation Structure**:
   - `NotificationListScreen` registered in `AppNavigator` stack.
   - Entry points: Dashboard header bell icon and More menu row.
3. **Deep Linking Semantics**:
   - Direct navigation to `TaskDetail`, `ProjectDetail`, `ServiceRequestDetail`, and `AssetDetail` using `referenceId`.
   - Automatic mark-as-read when tapping a notification item to navigate.
4. **Unread Badge Behavior**:
   - Sourced from `GET /api/v1/notifications/unread-count`.
   - Focus-based refresh on Dashboard and More screens.

---

## Proposed subphases
- **Phase 18A**: Notification Foundation & Contract Freeze (Types, DTOs, API Client, Error Mappers, Navigation Routes).
- **Phase 18B**: Notification Center List Screen (`NotificationListScreen` with tabs, pagination, refresh).
- **Phase 18C**: Read-State Mutations & Unread Badge Integration (Mark one read, mark all read, badge on Dashboard/More).
- **Phase 18D**: Deep-Link Context Navigation (`TASK`, `PROJECT`, `SERVICE_REQUEST`, `ASSET` routing).
- **Phase 18E**: Full Mobile & Backend Integration, Regression, and Android Verification.

---

## Readiness matrix
| Area | Backend Ready? | Canonical Defined? | Mobile Foundation? | Decision Needed? | Implementation Subphase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **List & Pagination** | YES (`GET /notifications`) | YES (`06_API_CONTRACT`) | REUSABLE | NO | Phase 18B | LOW |
| **Mark One Read** | YES (`PUT /notifications/{id}/read`) | YES (`06_API_CONTRACT`) | READY | NO | Phase 18C | LOW |
| **Mark All Read** | YES (`PUT /notifications/read-all`) | YES (`06_API_CONTRACT`) | READY | NO | Phase 18C | LOW |
| **Unread Count & Badge** | YES (`GET /notifications/unread-count`)| YES (`06_API_CONTRACT`) | READY | D-067 (placement) | Phase 18C | LOW |
| **Deep-Link Navigation** | YES (`referenceType`, `referenceId`) | YES (`03_MOBILE_SCREEN_MAP`) | TARGETS EXIST | D-067 (auto-read) | Phase 18D | LOW |
| **Native Push (FCM/APNs)**| NO (Excluded) | NO (Phase 11 web/in-app only)| NO | EXCLUDED | EXCLUDED | N/A |
| **Security / Permissions**| YES (`NOTIFICATION_READ/UPDATE`) | YES (`02_USER_ROLES`) | READY | NO | Phase 18A | LOW |
| **Android Runtime** | YES | YES | READY | NO | Phase 18E | LOW |

---

## Conclusion
`PRE_PHASE_18_AUDIT_PASS_READY_FOR_DECISION_FREEZE`
