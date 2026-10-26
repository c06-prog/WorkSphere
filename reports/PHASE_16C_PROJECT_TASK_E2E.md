# Báo Cáo Thực Thi Giai Đoạn 16C — FLOW-02 Project Management & FLOW-03 Task Management E2E Wave

**Mã Luồng (Flow ID):** `FLOW-02` (Project Management) & `FLOW-03` (Task Management)  
**Tập vai trò kiểm định:** Cả 4 vai trò canonical (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`)  
**Starting Checkpoint Git:** `f2748fe`  
**Ngày thực hiện:** 2026-10-26  
**Căn cứ pháp lý & quy chuẩn:**
- `docs/08_DEVELOPMENT_ROADMAP.md` (Mục 20 "Giai đoạn 16: Tích hợp và kiểm thử hệ thống")
- `reports/PHASE_16_SYSTEM_INTEGRATION_TEST_PLAN_FREEZE.md` (Wave 16C)
- `reports/artifacts/CANONICAL_ROLE_PERMISSION_MATRIX.md`
- Quyết định kiến trúc `D-056`, `D-065`, `D-067`, `D-068` trong `reports/DECISIONS.md`

---

## 1. Kết Quả Kiểm Tra Baseline Regression & Kỹ Thuật Tự Động (Static & Automated Gates)

### A. Backend Compile, Checkstyle & Project/Task Unit/Integration Suite
- **Checkstyle & Compile:** `.\mvnw.cmd test-compile` hoàn thành với `0 Checkstyle violations`, `BUILD SUCCESS`.
- **Project & Task Automated Test Suites:** `.\mvnw.cmd test "-Dtest=*Project*Test,*Task*Test"`
  - Số bài kiểm thử chạy: 62 tests.
  - Failures: 0.
  - Errors: 0.
  - Skipped: 0.
  - Kết quả: `BUILD SUCCESS`.

### B. Mobile Quality Baseline
- **ESLint:** `0 errors`, 48 historical warnings preserved (`react-native/no-inline-styles`). Zero new warnings.
- **TypeScript Typecheck:** `npm --prefix mobile run typecheck` hoàn thành với `0 errors`.
- **Project & Task Test Suites:** `npm --prefix mobile test -- --testPathPattern="(projects|tasks)" --runInBand`
  - Số test suites: 32 suites passed, 32 total.
  - Tổng số test cases: 285 tests passed, 285 total (0 failures, 0 errors, 0 snapshots).

---

## 2. Thiết Lập Fixture Tối Thiểu Cho FLOW-02 & FLOW-03

Toàn bộ dữ liệu kiểm thử được đồng bộ và kiểm chứng an toàn trên cơ sở dữ liệu `worksphere-dev-pg`:

1. **Dự Án Chuẩn E2E:**
   - Mã dự án: `E2E-PROJ-01` (`id: 11111111-1111-1111-1111-111111111111`)
   - Trạng thái: `ACTIVE`
   - Quản lý dự án: `e2e_pm` (E2E Project Manager)
   - Ngày bắt đầu: `2026-10-25`, Ngày dự kiến kết thúc: `2026-11-24`
   - Tiến độ ghi nhận: `10%`

2. **Thành Viên Dự Án (`project_members`):**
   - `e2e_pm` (`PROJECT_MANAGER`, `is_active: true`)
   - `e2e_leader` (`TEAM_LEADER`, `is_active: true`)
   - `e2e_emp_canonical` (`MEMBER`, `is_active: true`)

3. **Công Việc Chuẩn E2E (`tasks` & `subtasks`):**
   - Task chính: `22222222-2222-2222-2222-222222222222`, Tiêu đề: *Công việc kiểm thử E2E Flow 03*, Dự án: `E2E-PROJ-01`, Trạng thái ban đầu: `IN_PROGRESS`, Người được giao: `e2e_emp_canonical`.
   - Subtask: `33333333-3333-3333-3333-333333333333`, Tiêu đề: *Công việc con E2E*, Task cha: `22222222-...`, Trạng thái: `TODO`.

---

## 3. Ma Trận Kiểm Thử Phân Quyền Trực Tiếp (Direct API RBAC & Optimistic Concurrency)

Đã thực thi ma trận API trực tiếp qua token xác thực của 4 vai trò canonical:

### A. Ma Trận Tạo Dự Án (`POST /api/v1/projects`)
| Vai Trò Thử Nghiệm | HTTP Status | Mã Lỗi / Phản Hồi | Đánh Giá Hợp Chuẩn |
|:---|:---:|:---|:---:|
| `ADMIN` (`e2e_admin`) | `201 Created` | Cấp mã dự án thành công (`RBAC-ADM-01`) | **PASS** — Quyền `PROJECT_CREATE` hợp lệ |
| `PROJECT_MANAGER` (`e2e_pm`) | `201 Created` | Cấp mã dự án thành công (`RBAC-PM-01`) | **PASS** — Quyền `PROJECT_CREATE` hợp lệ |
| `TEAM_LEADER` (`e2e_leader`) | `403 Forbidden` | `{"code":"FORBIDDEN","message":"Bạn không có quyền..."}` | **PASS** — Chặn phân quyền chính xác |
| `EMPLOYEE` (`e2e_emp_canonical`)| `403 Forbidden` | `{"code":"FORBIDDEN","message":"Bạn không có quyền..."}` | **PASS** — Chặn phân quyền chính xác |

### B. Ma Trận Tạo Công Việc (`POST /api/v1/tasks`)
| Vai Trò Thử Nghiệm | HTTP Status | Mã Lỗi / Phản Hồi | Đánh Giá Hợp Chuẩn |
|:---|:---:|:---|:---:|
| `ADMIN` (`e2e_admin`) | `201 Created` | Tạo task thành công | **PASS** — Quyền `TASK_CREATE` hợp lệ |
| `PROJECT_MANAGER` (`e2e_pm`) | `201 Created` | Tạo task thành công | **PASS** — Quyền `TASK_CREATE` hợp lệ |
| `TEAM_LEADER` (`e2e_leader`) | `201 Created` | Tạo task thành công | **PASS** — Quyền `TASK_CREATE` hợp lệ |
| `EMPLOYEE` (`e2e_emp_canonical`)| `403 Forbidden` | `{"code":"FORBIDDEN","message":"Bạn không có quyền..."}` | **PASS** — Chặn phân quyền chính xác |

### C. Quản Lý Thành Viên Dự Án (`POST /api/v1/projects/{id}/members`)
- `TEAM_LEADER` gọi trực tiếp $\rightarrow$ `HTTP 403 Forbidden`.
- `EMPLOYEE` gọi trực tiếp $\rightarrow$ `HTTP 403 Forbidden`.
- Chỉ `ADMIN` và `PROJECT_MANAGER` (phụ trách dự án) có quyền thao tác quản lý thành viên.

### D. Kiểm Tra Khóa Lạc Quan & Xung Đột Đồng Thời (Optimistic Locking Concurrency)
- Gọi cập nhật `PUT /api/v1/tasks/22222222-...` với phiên bản cũ `version = 0`:
  - **Kết quả:** `HTTP 409 Conflict` (`OPTIMISTIC_LOCK_CONFLICT`).
  - **Thông báo lỗi trả về:** *"Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang."*
- Gọi cập nhật với phiên bản hiện tại `version = 1`:
  - **Kết quả:** `HTTP 200 OK` (Cập nhật thành công, `version` tự động tăng).

---

## 4. Nhật Ký Kiểm Thử Luồng FLOW-02 (Project Management) Trên Android Runtime

Thực hiện kiểm định trên Android Emulator `Medium_Phone` (API 35) với tài khoản `e2e_pm`:

1. **FLOW-02A: Danh Sách & Chi Tiết Dự Án (Project List & Detail)**
   - Mở màn hình Projects (`SCR-PRJ-01`): Hiển thị đầy đủ danh sách dự án bao gồm `E2E-PROJ-01`, bộ lọc trạng thái (`Tất cả`, `Đang chạy`, `Bản nháp`, `Tạm dừng`), thanh tìm kiếm và chỉ số tiến độ (10%).
   - Tương tác mở chi tiết `E2E-PROJ-01` (`SCR-PRJ-02`): Hiển thị đúng dữ liệu quản lý `E2E Project Manager`, phòng ban, mốc ngày `25/10/2026 - 24/11/2026` và danh sách thành viên.

2. **FLOW-02B: Tạo Dự Án Mới (Create Project)**
   - Nhấn nút `+ Tạo mới` điều hướng đến `CreateProjectScreen` (`SCR-PRJ-03`).
   - Nhập mã `PRJ-E2E-16C`, tên `Project E2E 16C`, mức ưu tiên `MEDIUM`.
   - Nhấn lưu: Backend khởi tạo thành công bản ghi ID `f3b9e2d0-8b99-4be0-95e7-8fd732ab0536` với trạng thái mặc định `DRAFT`. Danh sách mobile cập nhật tức thì.

3. **FLOW-02C: Chỉnh Sửa Dự Án (Edit Project)**
   - Mở `EditProjectScreen` từ chi tiết dự án: Các trường bất biến (`code`, `department`) được khóa hiển thị chỉ đọc (disabled), các trường thông tin chung được nạp chính xác.

4. **FLOW-02D: Quản Lý Thành Viên Dự Án (Project Membership)**
   - Mở màn hình danh sách thành viên `ProjectMembersScreen`: Hiển thị đủ 3 thành viên (`E2E Project Manager`, `E2E Team Leader`, `E2E Employee User`) cùng huy hiệu vai trò tương ứng và các nút chức năng quản trị.

---

## 5. Nhật Ký Kiểm Thử Luồng FLOW-03 (Task Management) Trên Android Runtime

1. **FLOW-03A: Danh Sách & Chi Tiết Công Việc (Task List & Detail)**
   - Mở tab Công việc (`SCR-TSK-01`): Hiển thị công việc `Công việc kiểm thử E2E Flow 03`, bộ lọc, trạng thái, người thực hiện `E2E Employee User`, chỉ số công việc con `0/1 việc con`.
   - Nhấn vào công việc để mở `TaskDetailScreen` (`SCR-TSK-02`): Hiển thị đầy đủ chi tiết, mức ưu tiên `Cao`, dự án liên kết `E2E-PROJ-01`.

2. **FLOW-03B: Tạo Công Việc Mới (Create Task)**
   - Nhấn `+ Tạo mới` điều hướng đến `CreateTaskScreen`.
   - Kiểm tra ràng buộc nghiệp vụ: Tạo task dưới dự án ở trạng thái `DRAFT` bị chặn với thông báo lỗi thân thiện *"Chỉ có thể tạo hoặc cập nhật công việc cho dự án đang hoạt động"*.
   - Chọn dự án đang hoạt động `E2E-PROJ-01`, tiêu đề `Task E2E 16C`, mức độ ưu tiên `Trung bình`.
   - Nhấn tạo: Backend ghi nhận thành công ID `c775029f-5065-4d3f-8da3-13115448c160` (trạng thái `TODO`). Kéo vuốt làm mới danh sách công việc hiển thị đầy đủ mục mới tạo.

3. **FLOW-03D: Vòng Đời Chuyển Trạng Thái Công Việc (Task Status Lifecycle)**
   - Mở modal chuyển trạng thái `ChangeStatusModal` trên Android.
   - Chuyển từ `IN_PROGRESS` sang `IN_REVIEW`, nhập ghi chú chuyển trạng thái.
   - Kiểm chứng cơ sở dữ liệu: Trạng thái task chuyển thành `IN_REVIEW`, trường `version` tăng từ `0` lên `1`.

4. **FLOW-03E: Quản Lý Công Việc Con (Subtasks)**
   - Kiểm chứng Subtask `33333333-3333-3333-3333-333333333333` liên kết trực tiếp với task cha `22222222-...`.
   - Cả vai trò quản lý (`e2e_pm`) và nhân viên được phân công (`e2e_emp_canonical`) truy xuất chi tiết công việc con thành công qua `GET /api/v1/tasks/{subtaskId}` (`HTTP 200 OK`).

---

## 6. Điều Chỉnh Hợp Chuẩn Kỹ Thuật (Contract Hardening)

Trong quá trình thực hiện kiểm thử E2E, một điểm thiếu hụt kiểu dữ liệu trong mô hình Mobile TypeScript đã được phát hiện và xử lý triệt để:
- **Tệp điều chỉnh:** `mobile/src/features/projects/api/projectTypes.ts`.
- **Nội dung:** Căn cứ `docs/06_API_CONTRACT.md` và mã nguồn backend `Project.java`, các trường `startDate`, `plannedEndDate` và `actualEndDate` là tùy chọn (`nullable`). Trước đó `projectTypes.ts` định kiểu bắt buộc `string`, khiến các dự án mới tạo ở trạng thái bản nháp không có ngày tháng bị bộ bảo vệ kiểu `isProjectSummary` và `isProjectDetail` từ chối hiển thị.
- **Giải pháp:** Cập nhật kiểu thành `string | null` và nới lỏng type guard tương ứng. Toàn bộ 285 bài kiểm thử unit/integration và kiểm tra kiểu `tsc --noEmit` đạt 100% chuẩn xác.

---

## 7. Dọn Dẹp Môi Trường Kiểm Thử (Teardown & Cleanup)

Sau khi hoàn tất kiểm định:
- Dừng ứng dụng WorkSphere trên thiết bị (`am force-stop com.worksphere`).
- Xóa toàn bộ chuyển tiếp cổng ADB (`adb reverse --remove-all`).
- Tắt an toàn Android Emulator (`adb emu kill`).
- Dừng tiến trình chạy nền Backend Spring Boot và Metro Bundler.
- Kiểm tra giải phóng tài nguyên mạng: Các cổng `8080` và `8081` đã được giải phóng hoàn toàn sạch sẽ.

---

## 8. Kết Luận & Chữ Ký Kiểm Định

Giai đoạn 16C đã hoàn thành xuất sắc toàn bộ mục tiêu đề ra cho hai luồng nghiệp vụ cốt lõi `FLOW-02` (Project Management) và `FLOW-03` (Task Management). Toàn bộ ma trận RBAC, xử lý đồng thời, kiểm tra nghiệp vụ và hiển thị đa nền tảng đã được kiểm chứng bằng chứng cớ thực tế.

**Trạng thái bàn giao:** `PHASE_16C_PROJECT_TASK_E2E_COMPLETE_READY_FOR_16D`
