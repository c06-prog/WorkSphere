# PHASE 18A REPORT: MOBILE NOTIFICATION CONTRACT FOUNDATION

## 1. Executive Summary & Checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `e00e033b79b4795ce1576360100aa2c5eefadad9`
- **Delivered Scope**: Phase 18A — Mobile Notification Contract Foundation.
- **Governing Architecture Decision**: **Decision D-067** (`reports/DECISIONS.md`).
- **Prerequisites Status**:
  - Phase 16: `CLOSED / MEMORY_CHECKPOINT_CLOSED`
  - Phase 17: `CLOSED / MEMORY_CHECKPOINT_CLOSED`
  - Phase 18: `18A COMPLETED / READY_FOR_18B`

---

## 2. Backend Contract Verification

Audited and aligned directly with backend source:
- Controller: `backend/src/main/java/com/worksphere/notification/web/NotificationController.java`
- Schedulers & Dispatchers: `backend/src/main/java/com/worksphere/notification/application/NotificationEventDispatcher.java`
- Domain Entities & Enums:
  - `backend/src/main/java/com/worksphere/notification/domain/NotificationType.java`
  - `backend/src/main/java/com/worksphere/notification/domain/NotificationReferenceType.java`
- DTO Responses:
  - `NotificationResponse` (UUID `id`, enum `type`, `title`, `message`, enum `referenceType`, UUID `referenceId`, `read`, `createdAt`)
  - `ReadAllNotificationsResponse` (`updatedCount`)
  - `UnreadCountResponse` (`count`)

| Endpoint | Method | Path | Required Permission | Backend Response Structure | Idempotent |
|:---|:---|:---|:---|:---|:---|
| List Notifications | `GET` | `/api/v1/notifications` | `NOTIFICATION_READ` | `ApiResponse<PagedData<NotificationResponse>>` | Yes |
| Mark One Read | `PUT` | `/api/v1/notifications/{notificationId}/read` | `NOTIFICATION_UPDATE` | `ApiResponse<Void>` (successNoContent) | Yes |
| Mark All Read | `PUT` | `/api/v1/notifications/read-all` | `NOTIFICATION_UPDATE` | `ApiResponse<ReadAllNotificationsResponse>` | Yes |
| Unread Count | `GET` | `/api/v1/notifications/unread-count` | `NOTIFICATION_READ` | `ApiResponse<UnreadCountResponse>` | Yes |

*Note*: `/api/v1/notification-preferences` is explicitly DEFERRED per Decision D-067 to the Web Admin / User Settings phase.

---

## 3. Files Created & Modified

### New Feature Files
1. `mobile/src/features/notifications/types/notificationTypes.ts`:
   - Canonical `NotificationType`: `PROJECT_MEMBER_ADDED`, `TASK_ASSIGNED`, `TASK_STATUS_CHANGED`, `TASK_DUE_SOON`, `TASK_OVERDUE`, `SERVICE_REQUEST_UPDATED`, `COMMENT_ADDED`, `ASSET_ASSIGNED`.
   - Canonical `NotificationReferenceType`: `PROJECT`, `TASK`, `SERVICE_REQUEST`, `ASSET`.
   - Query interface `NotificationListQuery` (supports `page`, `size`, `read`, `type`, `sort`).
   - DTOs: `NotificationResponse`, `ReadAllNotificationsResponse`, `UnreadCountResponse`, `NotificationPage`.
   - Runtime type guards: `isNotificationType`, `isNotificationReferenceType`, `isNotificationResponse`, `isNotificationPage`, `isReadAllNotificationsResponse`, `isUnreadCountResponse`.
2. `mobile/src/features/notifications/types/index.ts`: Barrel export.
3. `mobile/src/features/notifications/api/notificationApi.ts`:
   - Transport adapter: `getNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()`, `getUnreadNotificationCount()`.
   - `serializeNotificationListQuery`: Deterministic query serializer preserving boolean `read: false` and validating sort against canonical fields.
4. `mobile/src/features/notifications/api/index.ts`: Barrel export.
5. `mobile/src/features/notifications/errors/notificationErrorMapper.ts`:
   - Presentation error mapper `mapNotificationError()`.
   - Maps backend codes `NOTIFICATION_NOT_FOUND`, `ACCESS_DENIED`, HTTP 401, 403, 404, 400/422, network disconnection, timeouts, 5xx server errors.
   - Contextual Vietnamese error messages without leaking internal trace, token, recipientId, or database stack traces.
6. `mobile/src/features/notifications/errors/index.ts`: Barrel export.
7. `mobile/src/features/notifications/navigation/notificationNavigationHelper.ts`:
   - Pure mapping helper `getNotificationNavigationTarget(referenceType, referenceId)`.
   - Maps `TASK` -> `TaskDetail`, `PROJECT` -> `ProjectDetail`, `SERVICE_REQUEST` -> `ServiceRequestDetail`, `ASSET` -> `AssetDetail`.
   - Returns `null` on missing/unrecognized reference without throwing or mutating navigation state.
8. `mobile/src/features/notifications/navigation/index.ts`: Barrel export.
9. `mobile/src/features/notifications/context/NotificationBadgeContext.tsx`:
   - Context, provider, and hook: `NotificationBadgeContext`, `NotificationBadgeProvider`, `useNotificationBadge`.
   - Authoritative unread count synchronization, request coalescing for in-flight concurrent requests, user session change isolation (ignores stale async responses), local decrement via `applyNotificationRead` (with deduplication set preventing multiple decrements for the same notification), and zero-reset via `applyAllRead`.
10. `mobile/src/features/notifications/context/index.ts`: Barrel export.
11. `mobile/src/features/notifications/index.ts`: Root feature module barrel export.

### Modified Files
1. `mobile/src/app/navigation/types.ts`: Added `NotificationList: undefined` to `AppStackParamList` (Stack route under `AppNavigator`, strictly NOT a tab in `MainTabParamList`).
2. `mobile/src/app/providers/AppProviders.tsx`: Wrapped application tree with `NotificationBadgeProvider` inside `AuthProvider`.

### Test Files Created
1. `mobile/__tests__/notifications/notificationTypes.test.ts` (14 tests)
2. `mobile/__tests__/notifications/notificationApi.test.ts` (9 tests)
3. `mobile/__tests__/notifications/notificationErrorMapper.test.ts` (12 tests)
4. `mobile/__tests__/notifications/notificationNavigationHelper.test.ts` (8 tests)
5. `mobile/__tests__/notifications/NotificationBadgeContext.test.tsx` (8 tests)

---

## 4. Special Identity & Dispatcher Semantics Verified

1. **`COMMENT_ADDED`**:
   - Backend `NotificationEventDispatcher.java` sets `referenceType = TASK` and `referenceId = comment.getTaskId()`.
   - Mobile navigation helper receives `TASK` and `taskId`, correctly resolving to `TaskDetail` (`{ taskId }`).
2. **`ASSET_ASSIGNED`**:
   - Backend `NotificationEventDispatcher.java` sets `referenceType = ASSET` and `referenceId = event.assetId()`.
   - Mobile navigation helper receives `ASSET` and `assetId`, resolving directly to `AssetDetail` (`{ assetId }`).

---

## 5. Scope Boundary Compliance

Strictly excluded and deferred to subsequent subphases:
- Full `NotificationListScreen` UI (`SCR-NOT-01`) -> **Phase 18B**.
- Dashboard Header bell icon & More screen notification row unread badge -> **Phase 18C**.
- Interactive mark-read tap handling & list mutators -> **Phase 18C**.
- Real-time deep-link interaction -> **Phase 18D**.
- Native push notifications (FCM / APNs) -> **Deferred / Out of scope**.
- Native Android Notification channels / POST_NOTIFICATIONS -> **Deferred / Out of scope**.
- WebSocket / STOMP / SSE connections -> **Deferred / Out of scope**.

---

## 6. Quality Gates & Test Verification

| Quality Gate | Command | Result | Notes |
|:---|:---|:---|:---|
| TypeScript Typecheck | `npm --prefix mobile run typecheck` | **PASS (0 errors)** | Exit code 0 |
| ESLint Check | `npm --prefix mobile run lint` | **PASS (0 errors, 48 historical warnings preserved)** | Zero new warnings or errors |
| Notification Unit Tests | `npm --prefix mobile test -- --testPathPattern=notifications` | **PASS (5 suites, 51 tests)** | Exit code 0 |
| Full Mobile Regression | `npm --prefix mobile test -- --runInBand` | **PASS (119 suites, 1101 tests)** | 0 failures, 0 skipped |

---

## 7. Next Actions
- Proceed to **Phase 18B**: Notification List Screen Implementation (`SCR-NOT-01`).
