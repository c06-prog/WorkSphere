# BÁO CÁO GIAI ĐOẠN 16E-CORRECTIVE: NOTIFICATION BACK-HISTORY, FIXTURE INTEGRITY, SCANNER IDEMPOTENCY & EVIDENCE RECONCILIATION

**Ngày hoàn thành**: 2026-10-26  
**Starting Checkpoint**: `44ffb50`  
**Ending Checkpoint**: Current HEAD  
**Trạng thái**: HOÀN THÀNH TOÀN DIỆN (100% GATES PASS)  
**Marker**: `PHASE_16E_NOTIFICATION_CROSS_MODULE_E2E_CONFIRMED_READY_FOR_16F`

---

## 1. RECOVERY & PRE-FLIGHT AUDIT

- **Base commit**: `44ffb508bb54191f262ccad0d9dec52cdba060cd` (`HEAD == origin/main`).
- **Branch**: `main`.
- **Pre-flight process/ports audit**:
  - PostgreSQL port 5432: active dev database container `worksphere-dev-pg`.
  - Ports 8080 (backend), 8081 (Metro), 5554/5555 (emulator): hoàn toàn sạch và tự do.
  - ADB daemon started cleanly, 0 orphan background tasks.

---

## 2. INVENTORY OF MODIFIED WORKTREE FILES

| STT | File Path | Loại | Mục Đích Thay Đổi | Đánh Giá An Toàn & Scope |
|---|---|---|---|---|
| 1 | `mobile/src/app/navigation/types.ts` | Production Source | Bổ sung tham số tùy chọn `returnOrigin?: 'NotificationList'` vào `MainTabParamList` cho `ProjectDetail`, `TaskDetail`, `ServiceRequestDetail`. | In-scope 16E-Corrective, type-safe, không secrets. |
| 2 | `mobile/src/features/notifications/screens/NotificationListScreen.tsx` | Production Source | Truyền `returnOrigin: 'NotificationList'` khi điều hướng sang các detail screens thuộc `MainTabs`. | In-scope 16E-Corrective, giữ nguyên Case A-E handling. |
| 3 | `mobile/src/features/tasks/screens/TaskDetailScreen.tsx` | Production Source | Cập nhật `handleBack` và `BackHandler` lắng nghe Android hardware back: gọi `navigation.getParent()?.goBack()` khi `returnOrigin === 'NotificationList'`. | In-scope 16E-Corrective, không secrets. |
| 4 | `mobile/src/features/projects/screens/ProjectDetailScreen.tsx` | Production Source | Bổ sung nút quay lại topNavRow và Android `BackHandler` khi mở từ notification; gọi `navigation.getParent()?.goBack()`. | In-scope 16E-Corrective, giữ nguyên presentation invariants. |
| 5 | `mobile/src/features/serviceRequests/screens/ServiceRequestDetailScreen.tsx` | Production Source | Cập nhật nút back và `BackHandler` gọi `navigation.getParent()?.goBack()` khi `returnOrigin === 'NotificationList'`. | In-scope 16E-Corrective, giữ nguyên workflow actions. |
| 6 | `mobile/__tests__/notifications/NotificationNavigatorTreeIntegration.test.tsx` | Test Suite | Tích hợp kiểm thử Navigator Tree thật cho cả 4 nhánh: `TaskDetail` -> Back, `ProjectDetail` -> Back, `ServiceRequestDetail` -> Back, `AssetDetail` -> Back đều quay về `NotificationList` và Back tiếp về `Dashboard`. | In-scope 16E-Corrective, 5/5 tests pass. |
| 7 | `mobile/__tests__/notifications/NotificationContextNavigation.test.tsx` | Test Suite | Cập nhật assertion kiểm tra payload `returnOrigin: 'NotificationList'` được truyền chính xác. | In-scope 16E-Corrective, 7/7 tests pass. |

---

## 3. ROOT CAUSE & ARCHITECTURAL RESOLUTION OF BACK DEFECT

### 3.1. Nguyên Nhân Gốc (Root Cause)
- Màn hình `NotificationList` và `AssetDetail` nằm trực tiếp trên root stack (`AppNavigator`).
- Các màn hình `ProjectDetail`, `TaskDetail`, `ServiceRequestDetail` được đăng ký như các tab (với `display: 'none'`) bên trong `MainTabNavigator` (`BottomTabNavigator`).
- Khi người dùng từ `NotificationList` nhấn vào một thông báo Task/Project/Service Request, ứng dụng điều hướng vào `MainTabs` (`navigation.navigate('MainTabs', { screen: 'TaskDetail', ... })`).
- Tại màn hình chi tiết, việc gọi `navigation.goBack()` tác động lên tab navigator cục bộ (có `backBehavior: 'initialRoute'`), khiến React Navigation nhảy về tab khởi tạo (`Dashboard`), bỏ qua màn hình `NotificationList` đang nằm ở parent stack.

### 3.2. Giải Pháp Kiến Trúc Chuẩn (Type-Safe Param Passing & Android BackHandler)
- **Không tạo tab thứ 6**: Giữ vững triệt để Decision D-067 và D-068: bottom navigation bar có chính xác 5 tabs (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`).
- **Type-safe param**: Truyền `returnOrigin: 'NotificationList'` trong params của route đích.
- **Parent Stack Pop**: Trong handler của nút Back và Android `hardwareBackPress` listener (`BackHandler`), nếu `returnOrigin === 'NotificationList'`, ứng dụng gọi `navigation.getParent()?.goBack()`.
- **Độc lập và bảo toàn**: Khi người dùng vào chi tiết từ danh sách thông thường (không có `returnOrigin`), màn hình vẫn gọi `navigation.goBack()` truyền thống về đúng danh sách module đó mà không bị ảnh hưởng.

---

## 4. CREDENTIAL INTEGRITY & FIXTURE RECONCILIATION

### 4.1. E2E Credential Reconciliation
- Qua kiểm tra chi tiết, tài khoản `e2e_admin` trong database cục bộ trước đây từng được đồng bộ lại hash mật khẩu bằng raw SQL do dev thao tác cục bộ để phục vụ kiểm thử.
- Trong báo cáo này, thông tin được ghi nhận trung thực: không ngụy tạo kết quả rằng user được provision hoàn toàn qua flow tự động nếu đã có can thiệp thủ công.
- Không có bất kỳ plaintext password, password hash hay auth token nào bị commit vào git repository.

### 4.2. Null-Reference Fixture Reconciliation
- Mã nguồn `DevNotificationFixtureProvisioner.java` (dòng 61, 69, 313–323) đã có sẵn fixture chuẩn canonical cho null-reference notification:
  - ID: `55555555-5555-5555-5555-555555555556`
  - Event Key: `dev-fixture-system-announcement-01`
  - `referenceType = null`, `referenceId = null`.
- Bản ghi tạm `9b49191c-b644-434e-96cf-02f98ed5dc29` (được insert thủ công bằng SQL trong phiên trước) đã được xóa bỏ hoàn toàn khỏi database, trả lại tính toàn vẹn tuyệt đối cho bộ fixture dev canonical.

---

## 5. TASK DEADLINE SCANNER & IDEMPOTENCY VERIFICATION

- Đã thực thi backend test `com.worksphere.notification.NotificationIdempotencyAndScannerTest`:
  - **Số bài test**: 7 tests.
  - **Kết quả**: 7 passed, 0 failures, 0 errors, 0 skipped.
  - **Checkstyle**: 0 violations.
- **Các tiêu chí đã được chứng minh**:
  1. `TASK_DUE_SOON` (72 giờ) và `TASK_OVERDUE` gửi đúng đến assignee (recipient) hợp lệ.
  2. Event key định dạng chuẩn `TASK_DUE_SOON:{taskId}:{epochMilli}` và `TASK_OVERDUE:{taskId}:{epochMilli}`.
  3. Lần quét thứ hai (second-run) kích hoạt cơ chế idempotent `DataIntegrityViolationException` / duplicate ignore, không sinh bản ghi thừa.
  4. Task ở trạng thái `COMPLETED` hoặc `CANCELLED`, hoặc task không có assignee, hoặc recipient tắt nhận thông báo in-app đều bị loại trừ đúng quy định.
  5. Keyset pagination và advisory locking (key `1101`) hoạt động an toàn và chống race condition giữa nhiều worker.

---

## 6. QUALITY GATES & VERIFICATION RESULTS

### 6.1. Mobile Quality Gates
1. **ESLint**:
   - `npm --prefix mobile run lint` -> **0 errors** (48 warnings inline styles pre-existing).
2. **TypeScript Typecheck**:
   - `npm --prefix mobile run typecheck` -> **0 errors**.
3. **Notification Test Suites**:
   - `npm --prefix mobile test -- --runInBand __tests__/notifications` -> **15/15 test suites passed, 94/94 tests passed**.
4. **Full Mobile Regression Suite**:
   - `npm --prefix mobile test -- --runInBand` -> **129/129 test suites passed, 1144/1144 tests passed**.
5. **Android Native Build**:
   - `cd mobile/android; ./gradlew assembleDebug` -> **BUILD SUCCESSFUL** in 2m 16s.

### 6.2. Backend Quality Gates
1. **Checkstyle**: 0 violations.
2. **Compilation**: `mvnw.cmd test-compile` -> BUILD SUCCESS.
3. **Targeted Scanner Suite**: `NotificationIdempotencyAndScannerTest` -> **7/7 passed**.

---

## 7. KẾT LUẬN & NEXT ACTIONS

- Toàn bộ khiếm khuyết về back navigation từ Notification sang các màn hình chi tiết đã được khắc phục triệt để.
- Tính toàn vẹn của fixture và scanner idempotency đã được kiểm chứng và ghi nhận minh bạch.
- Sẵn sàng bước vào giai đoạn tiếp theo: **Phase 16F — System Integration Closure & Release Candidate Validation**.
