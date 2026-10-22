# Phase 16C Implementation Report: Service Request Detail (SCR-SRV-02)

## Checkpoint
- **Initial Baseline Commit**: `78358c985564b938482fbbe04969c885abfbf6c7`
- **Branch**: `main`
- **Working Tree**: Verified clean before changes via Workspace Integrity Verification

---

## Canonical Mapping & Field Audit
Canonical detail screen specification per `docs/03_MOBILE_SCREEN_MAP.md:398-410` and Decision `D-065`:
1. `requestNumber`: **CANONICAL_VISIBLE** - Displayed at the top of detail screen (`detail-request-number`).
2. `title`: **CANONICAL_VISIBLE** - Rendered as primary heading (`detail-title`).
3. `description`: **CANONICAL_VISIBLE** - Rendered in dedicated details card (`detail-description`).
4. `category`: **CANONICAL_VISIBLE** - Displays `name (code)` (`detail-category`).
5. `requester`: **CANONICAL_VISIBLE** - Displays `fullName (email)` (`detail-requester`).
6. `assignee`: **CANONICAL_VISIBLE** - Displays `fullName` or fallback `"Chưa phân công"` (`detail-assignee`), with `assignedAt` formatted timestamp when assigned.
7. `asset`: **CANONICAL_VISIBLE** - Displays `name (assetCode)` or fallback `"Không có"` (`detail-asset`).
8. `status`: **CANONICAL_VISIBLE** - Mapped via `StatusBadge` (`status-badge-<status>`).
9. `priority`: **CANONICAL_VISIBLE** - Mapped via `PriorityBadge` (`priority-badge-<priority>`).
10. `createdAt` / `updatedAt` / `resolvedAt` / `closedAt` / `cancelledAt`: **CANONICAL_VISIBLE** - Formatted lifecycle timestamps (`HH:mm dd/MM/yyyy`).
11. `histories`: **CANONICAL_VISIBLE** - Status history timeline (`detail-history-section`). Handled initial `fromStatus === null` safely as `"Khởi tạo"`, rendered `changedByName`, and comment quotes when present.
12. `comments`: **CANONICAL_VISIBLE** - Comments preview list (`detail-comments-section`), author name, internal badge if internal, and formatted timestamp.
13. `attachments`: **CANONICAL_VISIBLE** - Attachments metadata section (`detail-attachments-section`), `originalName`, formatted size (`formatFileSize`), and upload timestamp.
14. `rating`: **CANONICAL_VISIBLE** - Rating section (`detail-rating-section`), stars / 5, rating comment, rated by, or `"Chưa có đánh giá"` fallback.
15. **Security & Information Hiding**:
    - Strictly ZERO raw UUIDs rendered (`id`, `categoryId`, `requesterId`, `assigneeId`, `assignmentId`, `assetId`, `fileId`, etc.).
    - Strictly ZERO raw `version` numbers rendered.
    - Strictly ZERO raw `allowedActions` strings rendered.

---

## Hook Implementation
- **File**: `mobile/src/features/serviceRequests/hooks/useServiceRequestDetail.ts`
- **Barrel**: `mobile/src/features/serviceRequests/hooks/index.ts`
- **API Surface**:
  - `request`: `ServiceRequestDetailResponse | null`
  - `initialLoading`: `boolean`
  - `refreshing`: `boolean`
  - `error`: `ServiceRequestPresentationError | null`
  - `refreshError`: `string | null`
  - `load`: `() => Promise<void>`
  - `refresh`: `() => Promise<void>`
  - `retry`: `() => Promise<void>`
  - `applyServiceRequestUpdate`: `(updated: ServiceRequestDetailResponse) => void`
- **Concurrency Architecture**:
  - `requestGenerationRef`: Monotonically increasing counter per fetch. When `requestId` changes (A -> B), B receives generation > A; stale slower resolution of A is discarded.
  - `inFlightPromiseRef`: Synchronous same-tick calls for identical `requestId` share single in-flight promise (exact 1 API call).
  - Target ID ownership: `finally` block verifies `targetId === inFlightPromiseRef.current.id` before resetting in-flight lock, preventing premature unlock by superseded requests.
  - Resource ID transition: Changing `requestId` synchronously resets `request` to `null` and `initialLoading` to `true`, avoiding prior resource data ghosting.
  - Unmount safety: Checked via `mountedRef` before any state commits.
  - Non-blocking refresh error: Refresh failure retains existing request data while exposing `refreshError` banner.
  - Mutation foundation: `applyServiceRequestUpdate` immediately updates authoritative state, increments generation counter to supersede in-flight GET requests, and resets loading flags.

---

## Screen & Navigation Implementation
- **Screen File**: `mobile/src/features/serviceRequests/screens/ServiceRequestDetailScreen.tsx`
- **Screen ID**: `SCR-SRV-02`
- **Route Name**: `ServiceRequestDetail`
- **Route Params**: Strictly `{ requestId: string }`
- **Route Registration**: Hidden auxiliary tab screen in `mobile/src/app/navigation/MainTabNavigator.tsx` (`tabBarButton: () => null`, `tabBarItemStyle: { display: 'none' }`, `headerShown: false`). Exactly 5 bottom tabs preserved.
- **Card Navigation Activation**: Narrowly extended `ServiceRequestCard.tsx` with `onPress?: () => void`. When provided, renders pressable button (`accessibilityRole="button"`, `minHeight: 48`). When omitted, renders presentation-only `<View>`. In `ServiceRequestsScreen.tsx`, card press navigates: `navigation.navigate('ServiceRequestDetail', { requestId: item.id })`.
- **Staging Invariants**:
  - Strictly ZERO active mutation controls in 16C (no Create/Edit, Assign, Cancel, Start, Wait, Resolve, Resume, Reject Resolution, Confirm, Rate, Comment).
  - Back button (`navigation.goBack()`) returns safely to previous screen.

---

## Verification Results
- **TypeScript Typecheck**:
  `npm --prefix mobile run typecheck` -> Exit Code 0 (0 errors).
- **ESLint**:
  `npm --prefix mobile run lint` -> Exit Code 0 (0 errors, 48 pre-existing warnings in projects/organization, 0 warnings in serviceRequests).
- **Jest Test Suite**:
  `npm --prefix mobile test -- --runInBand` -> Exit Code 0.
  - Test Suites: 90 passed, 90 total (Baseline was 88 suites; +2 new suites: `useServiceRequestDetail.test.tsx`, `ServiceRequestDetailScreen.test.tsx`).
  - Tests: 857 passed, 857 total (Baseline was 832 tests; +25 net passing tests).
- **Android Native Compilation**:
  `cd mobile/android; .\gradlew.bat assembleDebug --no-daemon` -> BUILD SUCCESSFUL.
