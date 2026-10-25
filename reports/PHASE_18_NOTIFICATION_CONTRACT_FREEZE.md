# PHASE 18 NOTIFICATION CONTRACT FREEZE
## Mobile Notification System

## 1. Executive Summary & Checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `eeac619d4aea3afc06941a87d3a59f74bdf328c2`
- **Phase Prerequisites**:
  - Phase 16: `CLOSED / MEMORY_CHECKPOINT_CLOSED`
  - Phase 17: `CLOSED / MEMORY_CHECKPOINT_CLOSED` (`07f5c6a3d5a4249f66c48a8b6e425d886a03485f`)
  - Phase 18: `AUDITED / CONTRACT_FROZEN` (Implementation not started)
- **Governing Architecture Decision**: **Decision D-067** (recorded in `reports/DECISIONS.md`)
- **Status**: **APPROVED / FROZEN**

---

## 2. Canonical Sources & Screen ID Normalization
The Mobile Notification Center is anchored in canonical documentation:
- `docs/01_PROJECT_SCOPE.md` (Section 3.5: In-app Notification System)
- `docs/03_MOBILE_SCREEN_MAP.md` (Section 11: Notification Module)
- `docs/06_API_CONTRACT.md` (Section 15: Notification APIs)
- `design/02_SCREEN_INVENTORY.md` (`SCR-NOT-01: Notification List Screen`)
- `design/08_API_SCREEN_MAPPING.md` (`SCR-NOT-01` mapping)

### Screen Identification Normalization
- **Canonical Screen ID**: **`SCR-NOT-01`** (Notification List Screen).
- **Alias Resolution**: Any informal prompt or legacy reference to `SCR-NOTIF-01` is resolved as an alias for `SCR-NOT-01`.
- **Standalone Notification Detail Screen**: **STRICTLY EXCLUDED**. Canonical API Contract Section 15 states that there is no `GET /notifications/{id}` endpoint. The application relies on context-based deep-linking from list items to the referenced domain entity (`TASK`, `PROJECT`, `SERVICE_REQUEST`, `ASSET`).

---

## 3. Endpoints Matrix & Permissions

| HTTP Method | Canonical Endpoint | Query / Path Params | Request Body | Response Body | Required Authority | Scope Status |
|:---|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/notifications` | `page`, `size`, `read` (opt boolean), `type` (opt enum), `sort=createdAt,desc` | None | `PagedResponse<NotificationResponse>` | `NOTIFICATION_READ` | **INCLUDED (Core)** |
| `PUT` | `/api/v1/notifications/{notificationId}/read` | `notificationId` (UUID) | None | `NotificationResponse` | `NOTIFICATION_UPDATE` | **INCLUDED (Core)** |
| `PUT` | `/api/v1/notifications/read-all` | None | None | `ReadAllNotificationsResponse` (`{ updatedCount: number }`) | `NOTIFICATION_UPDATE` | **INCLUDED (Core)** |
| `GET` | `/api/v1/notifications/unread-count` | None | None | `UnreadCountResponse` (`{ count: number }`) | `NOTIFICATION_READ` | **INCLUDED (Core)** |
| `GET` | `/api/v1/notification-preferences` | None | None | `NotificationPreferencesResponse` | `NOTIFICATION_READ` | **DEFERRED** (Web Admin / Settings) |
| `PUT` | `/api/v1/notification-preferences` | None | `UpdateNotificationPreferencesRequest` | `NotificationPreferencesResponse` | `NOTIFICATION_UPDATE` | **DEFERRED** (Web Admin / Settings) |

### Permission & Tenant Isolation
- Permissions `NOTIFICATION_READ` and `NOTIFICATION_UPDATE` are seeded in Flyway `V014` to all standard roles (`EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN`).
- Backend queries enforce recipient security via `principal.userId`: users can only view and update their own notifications.

---

## 4. Notification Types & Context Navigation Matrix

### Enums
- **`NotificationType`**: `PROJECT_MEMBER_ADDED`, `TASK_ASSIGNED`, `TASK_STATUS_CHANGED`, `TASK_DUE_SOON`, `TASK_OVERDUE`, `SERVICE_REQUEST_UPDATED`, `COMMENT_ADDED`, `ASSET_ASSIGNED`.
- **`NotificationReferenceType`**: `PROJECT`, `TASK`, `SERVICE_REQUEST`, `ASSET`.

### Navigation Matrix
| `referenceType` | In-App Target Screen | Route Parameter | Fallback Behavior on Missing / Invalid ID |
|:---|:---|:---|:---|
| `TASK` | `TaskDetail` | `{ taskId: referenceId }` | Mark read if unread, toast feedback, stay on `NotificationList` |
| `PROJECT` | `ProjectDetail` | `{ projectId: referenceId }` | Mark read if unread, toast feedback, stay on `NotificationList` |
| `SERVICE_REQUEST` | `ServiceRequestDetail` | `{ requestId: referenceId }` | Mark read if unread, toast feedback, stay on `NotificationList` |
| `ASSET` | `AssetDetail` | `{ assetId: referenceId }` | Mark read if unread, toast feedback, stay on `NotificationList` |
| `null` / Unknown | None | N/A | Mark read if unread, toast feedback, stay on `NotificationList` |

### Special Dispatcher Identity Guarantees
1. **`COMMENT_ADDED`**:
   - Backend `NotificationEventDispatcher.java` dispatches with `referenceType = TASK` and `referenceId = comment.getTaskId()`.
   - Client routes directly to `TaskDetail` (or comments sub-flow with `taskId`).
2. **`ASSET_ASSIGNED`**:
   - Backend `NotificationEventDispatcher.java` dispatches with `referenceType = ASSET` and `referenceId = event.assetId()` (the asset's UUID, **not** the assignment UUID).
   - Client routes directly to `AssetDetail` (`{ assetId }`).

---

## 5. Navigation & UI Integration Architecture

### Bottom Tab Isolation
- Preserves exactly five visible bottom tabs (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`).
- `NotificationList` is hosted within `AppNavigator` stack navigation (`AppStackParamList`), never as a bottom tab.

### Entry Points
1. **`DashboardScreen` Header**: Bell icon with an unread badge indicator.
2. **`MoreScreen` Menu Item**: "Thông báo" row with unread badge pill.

### Unread Badge Architecture
- Lightweight `NotificationBadgeContext` and `useNotificationBadge` hook.
- State: `unreadCount: number`.
- Actions:
  - `refreshUnreadCount()`: Fetches `GET /api/v1/notifications/unread-count`.
  - `decrementCount()`: Locally decrements badge count upon marking an individual notification read.
  - `resetCount()`: Sets count to 0 upon "Đọc tất cả".
- Refresh triggers: Initial mount and `useFocusEffect` on `DashboardScreen` and `MoreScreen`.
- Zero external state management libraries (No Redux, no Zustand).

### Mutation Concurrency Standard
- In accordance with D-063, D-065, D-066, and D-067:
  - Mark single notification read and Mark all notifications read must use synchronous `useRef` locks (`markingReadRef.current = true`, `markingAllRef.current = true`) to prevent race conditions or duplicate network calls caused by rapid tapping.

---

## 6. Strict Inclusions & Exclusions

### Inclusions
- Full TypeScript DTO contracts and API client adapter.
- In-app Notification List (`SCR-NOT-01`) with:
  - "Tất cả" (All) and "Chưa đọc" (Unread) filter tabs.
  - Visual cues: unread dot + bold title/message weight (accessible, non-color-only distinction).
  - Relative timestamp display (e.g., "5 phút trước", "Hôm qua").
  - Pull-to-refresh & infinite scroll pagination.
  - Empty, loading, and error states.
- Mark single notification as read on tap or swipe/button.
- Mark all notifications as read header action.
- Context navigation to source domain entities (`TASK`, `PROJECT`, `SERVICE_REQUEST`, `ASSET`).
- Header bell badge in `Dashboard` and badge row in `More`.

### Exclusions
- **Native Push Notifications**: No Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs).
- **Operating System Tray**: No Android Notification Channels or Android 13+ `POST_NOTIFICATIONS` runtime permissions.
- **Background Schedulers**: No WorkManager or headless background sync.
- **Real-time WebSockets**: No STOMP/WebSocket or SSE connections.
- **Notification Hard Delete**: No deletion endpoints exist in canonical contract.
- **Notification Preferences**: Deferred to Web Admin / User Settings module.

---

## 7. Phased Implementation Plan

| Subphase | Scope Description | Deliverables |
|:---|:---|:---|
| **Phase 18A** | Foundation & Contracts | Domain types, DTOs, API client (`notificationApi`), `NotificationBadgeContext`, mock factory, navigation param types. |
| **Phase 18B** | Notification List Screen (`SCR-NOT-01`) | Filter tabs ("Tất cả" / "Chưa đọc"), FlatList with pagination, relative time formatter, unread visual indicator, empty/error views. |
| **Phase 18C** | Read State Mutations & Badges | Mark single read, mark all read, synchronous `useRef` locks, badge synchronization with `Dashboard` and `More`. |
| **Phase 18D** | Context Deep-Linking | Navigation dispatcher to `TaskDetail`, `ProjectDetail`, `ServiceRequestDetail`, and `AssetDetail`, edge-case fallback handlers. |
| **Phase 18E** | Integration & Hardening | Comprehensive Jest test suites, full Mobile regression, Android runtime validation, and Phase 18 audit closure. |
