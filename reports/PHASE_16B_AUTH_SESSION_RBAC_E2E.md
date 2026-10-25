# Báo Cáo Thực Thi Giai Đoạn 16B — FLOW-01 Authentication, Session & RBAC E2E Wave

**Mã Luồng (Flow ID):** `FLOW-01` (Authentication, Session Management & RBAC Direct Matrix)  
**Tập vai trò kiểm định:** Cả 4 vai trò canonical (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`)  
**Starting Checkpoint Git:** `22e2620`  
**Ngày thực hiện:** 2026-10-25  
**Căn cứ pháp lý & quy chuẩn:**
- `docs/08_DEVELOPMENT_ROADMAP.md` (Mục 20 "Giai đoạn 16: Tích hợp và kiểm thử hệ thống")
- `reports/PHASE_16_SYSTEM_INTEGRATION_TEST_PLAN_FREEZE.md` (Wave 16B)
- `reports/artifacts/CANONICAL_ROLE_PERMISSION_MATRIX.md`
- Quyết định kiến trúc `D-056`, `D-065`, `D-068` trong `reports/DECISIONS.md`

---

## 1. Kết Quả Kiểm Tra Baseline Regression & Kỹ Thuật Tự Động (Static & Automated Gates)

### A. Backend Full Regression Suite
- **Lệnh thực thi:** `.\mvnw.cmd test` (Chạy đầy đủ cùng Testcontainers PostgreSQL 15-alpine).
- **Số lớp kiểm thử (Test classes):** 39 classes.
- **Tổng số test cases:** 340 tests.
- **Failures:** 0.
- **Errors:** 0.
- **Skipped:** 0.
- **Thời gian chạy:** 05:15 min.
- **Checkstyle:** 0 violations (đạt yêu cầu `checkstyle.xml` chuẩn).
- **Kết luận:** `BUILD SUCCESS`.

### B. Mobile Quality Baseline
- **ESLint:** `0 errors`, 48 historical warnings preserved (`react-native/no-inline-styles`). Zero new warnings.
- **TypeScript Typecheck:** `tsc --noEmit` hoàn thành với `0 errors`.
- **Auth Unit & Integration Tests:** 14 test suites (`__tests__/auth/`), 168/168 tests PASS (0 failures, 0 errors, 0 snapshots).

---

## 2. Xác Minh 4 Tài Khoản Canonical & Phân Chiếu Quyền Hạn (Permission Projection)

Bốn tài khoản E2E đại diện cho 4 vai trò chuẩn được khởi tạo độc lập và kiểm tra trực tiếp qua Database PostgreSQL `worksphere-dev-pg` và API `POST /api/v1/auth/login`:

| Tài Khoản Fixture | Vai Trò Hợp Chuẩn (Role) | Số Quyền Thực Tế Trong DB | Số Quyền Phân Chiếu Trong Token & User Response | Kết Quả Xác Minh |
|:---|:---:|:---:|:---:|:---:|
| `e2e_admin` | `ADMIN` | 29 | 29 | **PASS** — Toàn quyền hệ thống |
| `e2e_pm` | `PROJECT_MANAGER` | 19 | 19 | **PASS** — Đủ quyền quản lý dự án & task |
| `e2e_leader` | `TEAM_LEADER` | 15 | 15 | **PASS** — Quyền điều phối task, đọc dự án |
| `e2e_emp_canonical`| `EMPLOYEE` | 13 | 13 | **PASS** — Quyền thực thi cá nhân |

---

## 3. Nhật Ký Kiểm Thử Luồng FLOW-01 (Authentication & Session Lifecycle)

### A. FLOW-01A: Positive Login Matrix
- **Thực thi:** Gọi `POST /api/v1/auth/login` lần lượt với 4 tài khoản.
- **Phản hồi:**
  - `HTTP 200 OK` cho cả 4 tài khoản.
  - Cấp phát JWT `accessToken` (thời hạn 15 phút) và `refreshToken` (thời hạn 7 ngày).
  - Đối tượng `data.user` trả về đầy đủ `id`, `username`, `email`, `fullName`, danh sách `roles` và `permissions` khớp 100% với ma trận canonical.

### B. FLOW-01B: Negative Login & Boundary Matrix
1. **Sai mật khẩu:** `POST /api/v1/auth/login` với mật khẩu sai $\rightarrow$ `HTTP 422 Unprocessable Entity` (`INVALID_CREDENTIALS`), không cấp session.
2. **Tài khoản không tồn tại:** `POST /api/v1/auth/login` với `non_existent_user` $\rightarrow$ `HTTP 422 Unprocessable Entity` (bảo vệ danh tính, không phân biệt user tồn tại hay không).
3. **Để trống trường bắt buộc:** `POST /api/v1/auth/login` với password rỗng $\rightarrow$ `HTTP 400 Bad Request` (`VALIDATION_ERROR`).
4. **Direct call không kèm Token:** `GET /api/v1/me` không có header Authorization $\rightarrow$ `HTTP 401 Unauthorized` (`UNAUTHORIZED`).
5. **Direct call với Fake Token:** `GET /api/v1/me` với Bearer token giả $\rightarrow$ `HTTP 401 Unauthorized` (`UNAUTHORIZED`).

### C. Access Token & Token Refresh Flow
1. **Truy cập tài nguyên hợp lệ:** `GET /api/v1/me` với Bearer token hợp lệ $\rightarrow$ `HTTP 200 OK`, trả về đúng thông tin diễn viên hiện tại.
2. **Kích hoạt xoay vòng Refresh Token:** `POST /api/v1/auth/refresh` với `refreshToken` hợp lệ $\rightarrow$ `HTTP 200 OK`, thu hồi token cũ và cấp phát cặp access/refresh token mới.
3. **Đăng xuất & Vô hiệu hóa Phiên (Logout & Revocation):**
   - Gọi `POST /api/v1/auth/logout` với Bearer token và refresh token.
   - Thử nghiệm tái sử dụng refresh token cũ sau khi logout $\rightarrow$ `HTTP 422 Unprocessable Entity` (Token đã bị thu hồi / không hợp lệ), đảm bảo phiên làm việc được chấm dứt triệt để trên máy chủ.

### D. User Switching & Cross-User Session Isolation
- Xác thực đăng nhập đồng thời/tuần tự giữa `e2e_emp_canonical` (`User ID: dddddddd-...`) và `e2e_leader` (`User ID: cccccccc-...`).
- Xác minh `GET /api/v1/me` trả về chính xác ID và quyền hạn riêng biệt của từng người dùng.
- Trích xuất dữ liệu notification: Số đếm unread và danh sách thông báo hoàn toàn cách ly theo `recipient_id`, không có hiện tượng rò rỉ dữ liệu chéo (Zero Cross-User Leakage).

---

## 4. Ma Trận Kiểm Thử Phân Quyền Trực Tiếp (Direct API RBAC Matrix)

Đã kiểm thử thực tế bằng cách sử dụng Access Token của từng vai trò gọi vào các endpoint đại diện cho các cấp độ bảo vệ:

| Nhóm Endpoint | Thao Tác Thử Nghiệm | ADMIN | PROJECT_MANAGER | TEAM_LEADER | EMPLOYEE | Phù Hợp Ma Trận Canonical |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Basic Authenticated Read** | `GET /api/v1/me` | **ALLOWED** (`200 OK`) | **ALLOWED** (`200 OK`) | **ALLOWED** (`200 OK`) | **ALLOWED** (`200 OK`) | **ĐẠT** |
| **Admin-Only Management** | `POST /api/v1/admin/asset-categories` | **ALLOWED** (`201 Created`) | **DENIED** (`403 Forbidden`) | **DENIED** (`403 Forbidden`) | **DENIED** (`403 Forbidden`) | **ĐẠT** |
| **Project Creation** | `POST /api/v1/projects` | **ALLOWED** (`201 Created`) | **ALLOWED** (`201 Created`) | **DENIED** (`403 Forbidden`) | **DENIED** (`403 Forbidden`) | **ĐẠT** |

> [!NOTE]
> Kết quả kiểm tra khẳng định hệ thống kiểm soát quyền hạn phân lớp đa tầng tại Spring Security:
> - `EMPLOYEE` và `TEAM_LEADER` bị chặn ngay lập tức với mã `HTTP 403 Forbidden` khi cố gọi API tạo dự án.
> - `PROJECT_MANAGER` được phép tạo dự án nhưng bị chặn `HTTP 403 Forbidden` khi cố tạo danh mục tài sản quản trị (`ASSET_CATEGORY_MANAGE`).
> - `ADMIN` vượt qua kiểm tra quyền hợp lệ trên cả hai endpoint.

---

## 5. Bằng Chứng Thực Thi Runtime Trên Android (Android Runtime Evidence)

- **Môi trường thiết bị:** Android Emulator `Medium_Phone` (API 35, Android 15), serial `emulator-5554`.
- **Trạng thái khởi động:** Cold boot hoàn tất trong `45,277 ms`, `sys.boot_completed == 1`.
- **Mạng & Port Forwarding:** Cấu hình thành công `adb reverse tcp:8080 tcp:8080` và `adb reverse tcp:8081 tcp:8081`.
- **Metro Bundler:** Hoạt động ổn định trên port 8081, biên dịch thành công JavaScript bundle (`./index.js`, 1057 modules).
- **Ứng dụng Native:** Gói `com.workspheremobile`, Activity chính `com.workspheremobile.MainActivity`.
- **Khởi chạy & Relaunch:**
  - Ứng dụng khởi động mượt mà, focus chính xác tại `Window{... com.workspheremobile/com.workspheremobile.MainActivity}`.
  - Kiểm tra phím cứng Android Hardware Back (`input keyevent 4`): Ứng dụng đưa về màn hình chính NexusLauncher an toàn mà không bị crash native hay treo ANR.
  - Mở lại ứng dụng (Relaunch): `Running "WorkSphereMobile" with {"rootTag":11, "fabric":true}` nạp lại giao diện hoàn chỉnh.
- **Logcat Runtime:** Xác nhận không có ngoại lệ nghiêm trọng (Zero ANR, Zero Red Screen, Zero Native Crash).

---

## 6. Quy Trình Thu Dọn Tài Nguyên Hoàn Tất (Clean-up Verification)

Tuân thủ nghiêm ngặt runbook môi trường [PHASE_16_SYSTEM_E2E_ENVIRONMENT.md](file:///d:/WorkSphere/reports/runbooks/PHASE_16_SYSTEM_E2E_ENVIRONMENT.md):
1. Đã đóng ứng dụng trên emulator: `am force-stop com.workspheremobile`.
2. Đã xóa toàn bộ cấu hình reverse: `adb reverse --remove-all`.
3. Đã tắt Android Emulator an toàn: `adb emu kill` $\rightarrow$ `adb devices` trả về danh sách rỗng.
4. Đã dừng toàn bộ tiến trình nền (Spring Boot Backend PID 21352, Metro Bundler).
5. Đã giải phóng sạch sẽ các cổng mạng: Port 8080 và 8081 hoàn toàn không còn tiến trình nào lắng nghe (`Listening`).
6. Đã xóa các biến môi trường nhạy cảm trong phiên làm việc (`WORKSPHERE_E2E_PASSWORD`, `WORKSPHERE_E2E_LOGIN`).
7. Giữ nguyên toàn vẹn container và volume database PostgreSQL `worksphere-dev-pg`.

---

## 7. Kết Luận & Sẵn Sàng Cho Wave 16C

- Toàn bộ các tiêu chí nghiệm thu của Giai đoạn 16B đã hoàn thành xuất sắc:
  + 4 vai trò canonical đăng nhập và phân chiếu quyền hạn chính xác.
  + Kiểm thử positive/negative auth, token rotation, logout revocation đạt chuẩn.
  + Ma trận phân quyền trực tiếp (Direct API RBAC) được xác thực thực tế.
  + Bằng chứng chạy runtime trên Android Emulator API 35 đầy đủ, thu dọn sạch sẽ.
  + 0 lỗi P0, 0 lỗi P1 tồn đọng.

Hệ thống đã sẵn sàng 100% để chuyển tiếp sang **Giai đoạn 16C — FLOW-02 Project & FLOW-03 Task Management E2E Wave**.
