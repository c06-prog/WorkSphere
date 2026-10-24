# PHASE 16 MEMORY CHECKPOINT
MOBILE SERVICE REQUESTS CLOSURE

## Closure checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Pre-Closure Checkpoint**: `b763dae1da46eb0b80890d67d76869613cdcf56e` (`docs(mobile): reconcile phase 16 final audit`)
- **Remote Sync**: Clean working tree, `HEAD == origin/main`.
- **Closure Ancestry**: Linear unbroken sequence from D-065 freeze through Phase 16A, 16B, 16C, 16D, 16E, 16F, 16G, validation completion, and final reconciliation.

## Phase status
- **Phase 16 Status**: `CLOSED` (`IMPLEMENTATION_COMPLETE`, `FINAL_AUDIT_PASS_WITH_E2E_DEFERRALS`, `FINAL_RECONCILIATION_COMPLETE`, `MEMORY_CHECKPOINT_CLOSED`).
- **Phase 17 Status**: `NOT STARTED`.

## Decision
- **Architecture Decision D-065**: Phase 16 Mobile Service Request Contract & Scope Freeze (`reports/DECISIONS.md`).
- **Core Principles**:
  1. Service Requests (`Phase 16`) are strictly decoupled from Asset Management (`Phase 17`).
  2. Public category source is `GET /api/v1/service-categories` (returns active categories only).
  3. Assignment user source is the Company Directory (`useDirectoryUsers`), single assignee UUID payload (`{ assigneeId }`). No Project Member picker.
  4. Routing transfers minimal IDs only (`requestId`, optional `assetId` for Create).
  5. Authorization is server-authoritative (`allowedActions`); unknown server action tokens are safely ignored, failing closed.
  6. All 12 client-side mutation flows strictly require synchronous `useRef` correctness locks before async dispatch.
  7. Attachments are strictly read-only metadata displays; client upload is deferred.

## Scope
Canonical Mobile Service Request screens:
- `SCR-SRV-01`: Service Request List (`ServiceRequestsScreen.tsx`)
- `SCR-SRV-02`: Service Request Detail (`ServiceRequestDetailScreen.tsx`)
- `SCR-SRV-03`: Reject Resolution Sheet (`RejectResolutionModal.tsx`)
- `SCR-SRV-04`: Create Service Request (`CreateServiceRequestScreen.tsx`)
- `SCR-SRV-05`: Service Request Comments (`ServiceRequestCommentsScreen.tsx`)
- `SCR-SRV-06`: Service Rating (`ServiceRatingModal.tsx`)

Auxiliary capabilities:
- Requester Edit Flow (`EditServiceRequestModal.tsx`)
- Assignee Selection Flow (`UserPickerModal` single selection)
- Resolution Note Submission (`ResolveServiceRequestModal.tsx`)
- Workflow status transitions and confirmation dialogs (`START`, `WAIT_FOR_USER`, `RESOLVE`, `RESUME`, `REJECT_RESOLUTION`, `CONFIRM`, `CANCEL`)

## Explicit exclusions
- Mobile Asset Management screens (`SCR-AST-01` .. `SCR-AST-06` strictly preserved for Phase 17).
- Service Category Admin CRUD (mutations restricted to backend admin endpoints).
- In-App Notification Center modifications (preserved as canonical database in-app notification center).
- Attachment upload, document/image picker, camera integration, or multipart dispatch.
- Attachment download, preview expansion, or external file viewer.
- Service Comment edit or delete operations (append-only feed).
- Service Request unassignment (reassignment only).

## Screen inventory
| ID | Screen / Modal | Component Path | Entry / Navigation | Authorization Gate |
|---|---|---|---|---|
| `SCR-SRV-01` | Service Request List | `mobile/src/features/serviceRequests/screens/ServiceRequestsScreen.tsx` | Bottom Tab `ServiceRequests` | Authenticated session |
| `SCR-SRV-02` | Service Request Detail | `mobile/src/features/serviceRequests/screens/ServiceRequestDetailScreen.tsx` | Hidden route `ServiceRequestDetail` | Query-level server ownership |
| `SCR-SRV-03` | Reject Resolution Sheet | `mobile/src/features/serviceRequests/components/RejectResolutionModal.tsx` | Modal from Detail action bar | `allowedActions.includes('REJECT_RESOLUTION')` |
| `SCR-SRV-04` | Create Service Request | `mobile/src/features/serviceRequests/screens/CreateServiceRequestScreen.tsx` | Hidden route `CreateServiceRequest` | `user.permissions.includes('SERVICE_REQUEST_CREATE')` |
| `SCR-SRV-05` | Service Request Comments | `mobile/src/features/serviceRequests/screens/ServiceRequestCommentsScreen.tsx` | Hidden route `ServiceRequestComments` | `allowedActions.includes('COMMENT')` |
| `SCR-SRV-06` | Service Rating | `mobile/src/features/serviceRequests/components/ServiceRatingModal.tsx` | Modal from Detail rating CTA | `allowedActions.includes('RATE')` |
| Auxiliary | Edit Service Request | `mobile/src/features/serviceRequests/components/EditServiceRequestModal.tsx` | Modal from Detail header/action | `allowedActions.includes('UPDATE')` |
| Auxiliary | Resolve Service Request | `mobile/src/features/serviceRequests/components/ResolveServiceRequestModal.tsx` | Modal from Detail action bar | `allowedActions.includes('RESOLVE')` |
| Auxiliary | Assign Service Request | `mobile/src/features/directory/components/UserPickerModal.tsx` | Modal from Detail assignee tile | `allowedActions.includes('ASSIGN')` |

## Navigation
- **Navigator**: `mobile/src/app/navigation/MainTabNavigator.tsx`
- **Visible Tabs (Exactly 5)**:
  1. `Dashboard` (label: "Dashboard")
  2. `Projects` (label: "Dự án")
  3. `Tasks` (label: "Công việc")
  4. `ServiceRequests` (label: "Yêu cầu")
  5. `More` (label: "Thêm")
- **Hidden Auxiliary Routes (Zero tab slots consumed)**:
  - `ServiceRequestDetail`
  - `CreateServiceRequest`
  - `ServiceRequestComments`
- Zero Phase 17 routes registered.

## Endpoint contract
11 Mobile Service Request endpoints verified 1:1 against backend Spring Boot controllers:
1. `GET /api/v1/service-categories` -> Active public categories (`List<ServiceCategoryResponse>`)
2. `GET /api/v1/service-requests` -> Paged request listing (`PageResponse<ServiceRequestSummaryResponse>`)
3. `POST /api/v1/service-requests` -> Create request (`CreateServiceRequestResponse`)
4. `GET /api/v1/service-requests/{requestId}` -> Authoritative request detail (`ServiceRequestDetailResponse`)
5. `PUT /api/v1/service-requests/{requestId}` -> Edit request (`ServiceRequestDetailResponse`)
6. `POST /api/v1/service-requests/{requestId}/assignments` -> Assignee change (`Void`)
7. `PUT /api/v1/service-requests/{requestId}/status` -> Workflow status change (`Void`)
8. `POST /api/v1/service-requests/{requestId}/reject-resolution` -> Reject resolution (`ServiceRequestDetailResponse`)
9. `GET /api/v1/service-requests/{requestId}/comments` -> Paged comments (`PageResponse<ServiceCommentResponse>`)
10. `POST /api/v1/service-requests/{requestId}/comments` -> Add comment (`ServiceCommentResponse`)
11. `POST /api/v1/service-requests/{requestId}/rating` -> Submit rating (`ServiceRatingResponse`)

## DTO contract
- **`CreateServiceRequestRequest`**: `{ categoryId: string, title: string, description: string, priority?: ServicePriority, assetId?: string, attachmentFileIds?: string[] }` (Requester derived server-side).
- **`CreateServiceRequestResponse`**: `{ id: string, requestNumber: string, status: ServiceStatus }` (3 fields; `createdAt` omitted per Java source truth).
- **`UpdateServiceRequestRequest`**: `{ categoryId?: string, title: string, description: string, priority?: ServicePriority, assetId?: string, version: number }`.
- **`AssignServiceRequestRequest`**: `{ assigneeId: string }` (unversioned, Void response).
- **`UpdateServiceRequestStatusRequest`**: `{ status: ServiceStatus, comment?: string, version: number }` (versioned, Void response).
- **`RejectResolutionRequest`**: `{ reason: string, version: number }` (versioned, returns `ServiceRequestDetailResponse`).
- **`CreateServiceCommentRequest`**: `{ content: string, isInternal: boolean }` (returns `ServiceCommentResponse`).
- **`CreateServiceRatingRequest`**: `{ score: number, comment?: string }` (unversioned, returns `ServiceRatingResponse`).

## Status state machine
- **Statuses**: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
- **Transitions**:
  - `OPEN -> ASSIGNED, CANCELLED`
  - `ASSIGNED -> IN_PROGRESS`
  - `IN_PROGRESS -> WAITING_FOR_USER, RESOLVED`
  - `WAITING_FOR_USER -> IN_PROGRESS`
  - `RESOLVED -> CLOSED, IN_PROGRESS` (Reopening requires dedicated reject-resolution endpoint)
  - `CLOSED`, `CANCELLED`: Terminal states.

## Action-endpoint semantics
- `ASSIGN`: `POST /assignments`, body `{ assigneeId }`, response `Void` -> triggers `invalidateAndRefresh`.
- `UPDATE`: `PUT /service-requests/{id}`, body contains `version`, returns updated `Detail` -> applied via `applyServiceRequestUpdate`.
- `CANCEL`: `PUT /status` with `CANCELLED`, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `START`: `PUT /status` with `IN_PROGRESS`, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `WAIT_FOR_USER`: `PUT /status` with `WAITING_FOR_USER`, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `RESOLVE`: `PUT /status` with `RESOLVED` and mandatory resolution comment, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `RESUME`: `PUT /status` with `IN_PROGRESS`, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `CONFIRM`: `PUT /status` with `CLOSED`, versioned, response `Void` -> triggers `invalidateAndRefresh`.
- `REJECT_RESOLUTION`: `POST /reject-resolution`, body `{ reason, version }`, returns updated `Detail` -> applied via `applyServiceRequestUpdate`.
- `COMMENT`: `GET/POST /comments`, response `ServiceCommentResponse` -> applied to comments feed.
- `RATE`: `POST /rating`, unversioned body `{ score, comment? }`, response `ServiceRatingResponse` -> triggers `invalidateAndRefresh`.

## Allowed actions
- Recognized authoritative action tokens: `ASSIGN`, `UPDATE`, `CANCEL`, `REJECT_RESOLUTION`, `CONFIRM`, `RATE`, `START`, `WAIT_FOR_USER`, `RESOLVE`, `RESUME`, `COMMENT`.
- Transport handles `string[]`. Unknown tokens are accepted safely and ignored in UI. Every interactive action strictly requires server-provided token in `allowedActions` AND client capability.

## Identity semantics
- `requestId`: UUID string of ServiceRequest entity (used in path params).
- `requestNumber`: Human-readable business identifier (`SR-YYYYMMDD-XXXX`), display only.
- `categoryId`: UUID string of ServiceCategory entity.
- `requesterId`: User UUID string derived server-side from JWT principal.
- `assigneeId`: Directory User UUID string used for assignment.
- `assignmentId`: UUID string of ServiceAssignment record, projection/audit only. Never sent in payloads.
- `assetId`: Optional Asset UUID string, validated and scoped server-side.
- `fileId`: StoredFile UUID string in read-only attachments metadata.
- `commentId`: ServiceComment UUID string.
- Zero ID conflation across distinct domain concepts.

## Category source
- Active public categories retrieved via `GET /api/v1/service-categories`.
- Displayed with human-readable name and code. Zero UUID rendering.
- Guarded by monotonic generation counter (`fetchGenRef`) and unmount safety (`mountedRef`).

## Assignment policy
- Sourced exclusively from Company Directory (`useDirectoryUsers`).
- Single user selection dispatching `{ assigneeId }`.
- No Project Member picker; no assignment versioning; no local fake assignment state.

## Create/Edit
- **Create**: Gated by `SERVICE_REQUEST_CREATE` permission; public category selector; optional `assetId`; synchronous `submittingRef` lock; navigation consumes `created.id` only.
- **Edit**: Gated by `allowedActions.includes('UPDATE')`; pre-fills authoritative Detail; submits `{ categoryId, title, description, priority, assetId, version }`; synchronous `submittingRef` lock; 409 conflict handled via dialog updating the version baseline without remounting.

## Comments
- Append-only feed; pagination `page=0, size=20, sort=createdAt,asc`.
- Monotonic query generation tracking, `paginationLockRef`, `addingRef` synchronous submit lock.
- Deduplication by comment ID; stale query invalidation. Zero optimistic comment fabrication.

## Internal comments
- Authorization strictly requires canonical `'ADMIN'` (`user.roles.includes('ADMIN')`) OR active assignee (`detail.assignee?.id === user.id`).
- Synthetic `ROLE_ADMIN` check eliminated. Fails closed while user identity or detail is unresolved.

## Rating
- Closed request evaluation; 1..5 star score, optional comment (max 2000 chars); unversioned payload; synchronous `submittingRef` lock; `SERVICE_RATING_ALREADY_EXISTS` mapped gracefully; refreshes Detail authoritatively.

## Attachment policy
- Read-only metadata display (file name, size, MIME type). Zero upload, file picker, camera, multipart, or fake ID creation.

## Asset boundary
- Optional `assetId` context passed on Create; read-only display on Detail; zero asset pickers; zero asset detail routes; zero `SCR-AST` screens; Phase 17 not started.

## Concurrency model
- **List**: Debounced search (300ms), monotonic generation counter (`queryGenRef`), `paginationLockRef`, deduplication by ID, retention of current list on error.
- **Detail**: In-flight promise identity supersession (`activePromiseRef`), focus freshness check, cache invalidation via `invalidateAndRefresh`.
- **Category Selector**: Monotonic generation tracking (`fetchGenRef`), unmount cancellation (`mountedRef`), stale retry supersession.
- **Comments**: Monotonic query generation counter, `paginationLockRef`, `addingRef` synchronous lock, deduplication by ID, invalidation of stale queries.

## Mutation-lock standard
Encountered 12 mutation flows, 100% verified to use synchronous `useRef` locks before asynchronous dispatch:
1. Create Request: `submittingRef` in `CreateServiceRequestScreen.tsx`
2. Edit Request: `submittingRef` in `EditServiceRequestModal.tsx`
3. Assign Request: `assignLockRef` in `ServiceRequestDetailScreen.tsx`
4. Start Request: `statusLockRef` in `ServiceRequestDetailScreen.tsx`
5. Wait for User: `statusLockRef` in `ServiceRequestDetailScreen.tsx`
6. Resolve Request: `submittingRef` in `ResolveServiceRequestModal.tsx`
7. Resume Request: `statusLockRef` in `ServiceRequestDetailScreen.tsx`
8. Confirm Resolution: `statusLockRef` in `ServiceRequestDetailScreen.tsx`
9. Reject Resolution: `submittingRef` in `RejectResolutionModal.tsx`
10. Cancel Request: `statusLockRef` in `ServiceRequestDetailScreen.tsx`
11. Add Comment: `addingRef` in `useServiceRequestComments.ts` & `submittingRef` in `ServiceRequestCommentsScreen.tsx`
12. Submit Rating: `submittingRef` in `ServiceRatingModal.tsx`

## Version-chain evidence
- **Edit Conflict Chain**: Proven by single-screen integration test (`v1 -> 409 Conflict -> reload authoritative v2 -> PUT v2 -> v3 applied`).
- **Workflow Version Chain**: Proven by single-screen integration test (`IN_PROGRESS v1 -> RESOLVE v1 -> refresh gives RESOLVED v2 -> REJECT v2 -> response gives IN_PROGRESS v3`) without remounting or manual version injection.

## Security model
- All Service Request network transport flows through shared `apiClient`.
- Zero custom Axios instances, zero manual Authorization headers, zero feature token storage, zero AsyncStorage/Keychain entity persistence, zero offline entity caches.
- Zero raw database UUIDs or version numbers rendered in UI.
- Backend enforces ultimate authorization fail-closed.

## Mobile baseline
- **ESLint**: 0 errors, 48 historical warnings in projects/organization, 0 warnings in serviceRequests.
- **TypeScript**: 0 errors (`tsc --noEmit`).
- **Jest Test Suite**: 98 suites, 926 tests PASS (0 failures, 0 skipped, 0 snapshots).

## Backend evidence
- Targeted backend MockMvc test suite with Testcontainers PostgreSQL:
  - `AssetServiceRequestIntegrationMockMvcTest`: 6 tests
  - `ServiceCategoryMockMvcTest`: 10 tests
  - `ServiceRequestMockMvcTest`: 17 tests
  - Total: 33 tests executed, 0 failures, 0 errors, 0 skipped.
  - Maven Checkstyle: 0 violations. Result: `BUILD SUCCESS` in 58.631 s.

## Android evidence
- Clean assembleDebug: `.\gradlew.bat clean assembleDebug --no-daemon`
  - Result: `BUILD SUCCESSFUL in 5m 10s` (213 actionable tasks: 184 executed, 29 up-to-date). Exit code: 0.
- Current Debug APK:
  - Location: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
  - Size: 157,662,829 bytes
  - Timestamp: `10/24/2026 5:43:11 PM` (matches clean assembleDebug run)
  - SHA-256: `ED73C5301606C83548F9989A8C7451A92D714BAC08556566F55F5FA36516384F`
  - Classification: `PHASE_16_CURRENT_APK_VERIFIED`

## Emulator and E2E deferrals
- `PHASE_16_EMULATOR_OFFLINE_SMOKE_NOT_EXECUTED` (emulator-5554 offline)
- `PHASE_16_AUTH_E2E_CREDENTIALS_NOT_AVAILABLE_SAFE_SKIP`
- `PHASE_16_MUTATION_E2E_DEFERRED`
- `PHASE_16_OFFLINE_DEVICE_E2E_DEFERRED`
- Carried forward as accepted non-blocking deferrals under project governance.

## Accepted historical debt
- 48 lint warnings for `react-native/no-inline-styles` in `features/projects` and `features/organization` (pre-existing since Phase 14E).
- 7 project mutation state-only submit guards (Phase 14 historical debt).
- AGP deprecation notices and KSP 2.2.0-2.0.2 compiler warning.
- Zero Phase-16-specific open debt.

## Resume rules
For future agents starting Phase 17 or inspecting Phase 16:
1. Do not reinterpret D-065 or merge Asset Management screens back into Phase 16.
2. Do not use Project Members for Service Request assignees; Directory users are authoritative.
3. Do not send `assignmentId` or `assigneeIds` array when assigning service requests.
4. Do not send `version` in assignment or rating requests (unversioned contracts).
5. Do not use generic status PUT for reject-resolution (dedicated POST endpoint required).
6. Do not treat Void mutation responses as Detail models.
7. Do not pass entity objects, actions, or permissions through route parameters.
8. Do not weaken synchronous `useRef` mutation locks to React state.
9. Do not reintroduce synthetic `ROLE_ADMIN` alias; canonical `'ADMIN'` is required.
10. Do not add comment edit/delete or request unassign without backend endpoint support.
11. Do not add attachment upload without an explicit contract and dependency decision.

## Phase 17 boundary
- **Phase 17**: Mobile Asset Management (`SCR-AST-01` through `SCR-AST-06`).
- **Current State**: `NOT STARTED`.
- Next task must begin with **PRE-PHASE 17 AUDIT / CONTRACT RECONCILIATION** using this Memory Checkpoint, `PROJECT_STATE.md`, and `HANDOFF.md` as authoritative repository-grounded state.

## Closure verdict
**`PHASE_16_MEMORY_CHECKPOINT_CLOSED`**
