# WorkSphere Phase 16 System Integration Test Plan & Execution Freeze

**Tài liệu chuẩn hóa:** Hệ thống Kiểm thử Tích hợp & End-to-End (E2E) WorkSphere  
**Căn cứ pháp lý & quy chuẩn:**
- `docs/08_DEVELOPMENT_ROADMAP.md` (Mục 3 "Lộ trình tổng thể" & Mục 20 "Giai đoạn 16: Tích hợp và kiểm thử hệ thống")
- `docs/07_FOUR_COURSE_MATRIX.md`
- `docs/02_USER_ROLES_AND_WORKFLOWS.md`
- `docs/04_SYSTEM_ARCHITECTURE.md`
- `docs/05_DATABASE_DESIGN.md`
- `docs/06_API_CONTRACT.md`
- `reports/DECISIONS.md` (Quyết định kiến trúc `D-068`)
- `reports/PRE_PHASE_16_SYSTEM_INTEGRATION_AUDIT.md`

**Trạng thái:** `FROZEN`  
**Ngày phê duyệt:** 2026-10-25  

---

## 1. Mục Đích & Nguyên Tắc Cốt Lõi

1. **Khóa phạm vi kiểm thử hệ thống:** Đảm bảo toàn bộ 6 luồng nghiệp vụ canonical (`FLOW-01` đến `FLOW-06`), 4 vai trò người dùng chuẩn (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`), và 4 tầng kiểm thử (L1 Component, L2 Navigator, L3 Integration, L4 Android E2E Runtime) được thiết kế chi tiết, có thể kiểm chứng độc lập mà không dựa trên phỏng đoán.
2. **Tuân thủ ranh giới Roadmap Phase 16:** 
   - Tên canonical của giai đoạn là: **Giai đoạn 16: Tích hợp và kiểm thử hệ thống (System Integration & End-to-End Testing)**.
   - Không sáng tạo "Phase 19" hay làm sai lệch lộ trình.
   - Không thay đổi source code production, không tự ý sửa database schema hoặc Flyway migrations.
3. **Phân rã thành các Wave có thể xác thực:** Chia Giai đoạn 16 thành 6 Subphase/Wave tuần tự (`16A` đến `16F`) với tiêu chí đầu vào/đầu ra rõ ràng, đảm bảo dừng sạch mọi background services sau mỗi phiên kiểm thử.

---

## 2. Ma Trận Truy Vết Nghiệp Vụ (Traceability Matrix: 6 Canonical Flows)

| Mã Luồng | Tên Luồng Canonical | Mô Tả Trình Tự Nghiệp Vụ | Tác Nhân Hợp Lệ | Khởi Tạo Dữ Liệu | API Endpoints Trọng Tâm | Kỳ Vọng UI & DB State |
|:---|:---|:---|:---|:---|:---|:---|
| **FLOW-01** | **Xác thực, Phiên & Đăng xuất** | Khởi động $\rightarrow$ Login với mật khẩu $\rightarrow$ Trích xuất Claims & Permissions $\rightarrow$ Load Dashboard $\rightarrow$ Refresh Token chủ động/tự động $\rightarrow$ Đăng xuất an toàn | Mọi vai trò (`ADMIN`, `PM`, `LEAD`, `EMPLOYEE`) | Tài khoản hoạt động trong DB Seed / Fixture | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/refresh`<br>`POST /api/v1/auth/logout`<br>`GET /api/v1/users/me` | JWT token cấp phát hợp lệ; SecureStore lưu access/refresh token; UI hiển thị đúng dashboard theo quyền; logout dọn sạch token cục bộ |
| **FLOW-02** | **Quản Lý Dự Án & Thành Viên** | Tạo dự án mới $\rightarrow$ Thêm/gán thành viên & vai trò trong dự án $\rightarrow$ Tạo milestone $\rightarrow$ Tra cứu & xem Project Dashboard $\rightarrow$ Cập nhật trạng thái dự án | `ADMIN`, `PROJECT_MANAGER` | Tổ chức, phòng ban, user đã kích hoạt | `POST /api/v1/projects`<br>`POST /api/v1/projects/{id}/members`<br>`POST /api/v1/projects/{id}/milestones`<br>`GET /api/v1/projects/{id}` | Bản ghi `projects`, `project_members`, `project_milestones` được tạo trong DB; Project List Screen hiển thị dự án mới; Project Detail Screen hiển thị đúng danh sách thành viên |
| **FLOW-03** | **Vòng Đời Công Việc (Task Lifecycle)** | Tạo task gắn với Project $\rightarrow$ Phân công người thực hiện $\rightarrow$ Chuyển trạng thái `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ Nộp phê duyệt (`IN_REVIEW`) $\rightarrow$ Phê duyệt & `DONE` | `PROJECT_MANAGER`, `TEAM_LEADER` (Giao việc/Duyệt); `EMPLOYEE` (Thực thi) | Project hợp lệ, User thành viên dự án | `POST /api/v1/tasks`<br>`PATCH /api/v1/tasks/{id}/status`<br>`PATCH /api/v1/tasks/{id}/assign`<br>`GET /api/v1/tasks/{id}` | Task status cập nhật tuần tự; task history lưu đầy đủ vết chuyển trạng thái; UI hiển thị tiến độ và badge trạng thái chuẩn |
| **FLOW-04** | **Vòng Đời Yêu Cầu Dịch Vụ (Service Request)** | Người dùng tạo yêu cầu dịch vụ $\rightarrow$ Điều phối viên/Lead gán người xử lý $\rightarrow$ Chuyển `IN_PROGRESS` $\rightarrow$ Xử lý & `RESOLVED` $\rightarrow$ Người tạo đóng `CLOSED` $\rightarrow$ Đánh giá hài lòng | Người tạo: Mọi vai trò;<br>Xử lý/Gán: `ADMIN`, `TEAM_LEADER` | Danh mục dịch vụ (`service_catalogs`), Tài sản (tùy chọn) | `POST /api/v1/service-requests`<br>`PATCH /api/v1/service-requests/{id}/status`<br>`PATCH /api/v1/service-requests/{id}/assign`<br>`POST /api/v1/service-requests/{id}/rating` | Bản ghi `service_requests`, `service_request_status_history` cập nhật; UI ServiceRequestList/Detail hiển thị đúng timeline và trạng thái |
| **FLOW-05** | **Vòng Đời Tài Sản & Lịch Sử Sửa Chữa** | Đăng ký tài sản mới $\rightarrow$ Cấp phát cho nhân viên $\rightarrow$ Xem chi tiết tài sản $\rightarrow$ Báo hỏng (tạo Service Request liên kết) $\rightarrow$ Hoàn thành sửa chữa $\rightarrow$ Tra cứu Lịch sử sửa chữa | Quản lý: `ADMIN`, `PM`;<br>Sử dụng: `EMPLOYEE` | Danh mục tài sản (`asset_categories`), User tiếp nhận | `POST /api/v1/assets`<br>`POST /api/v1/assets/{id}/assignments`<br>`GET /api/v1/assets/{id}`<br>`GET /api/v1/assets/{id}/repair-history` | Trạng thái tài sản chuyển `IN_USE` / `MAINTENANCE` / `AVAILABLE`; bản ghi `asset_assignments` và liên kết service request hiển thị chuẩn |
| **FLOW-06** | **Trung Tâm Thông Báo & Điều Hướng Ngữ Cảnh** | Phát sinh sự kiện hệ thống (Task/Request/Asset) $\rightarrow$ Backend tạo bản ghi `notifications` $\rightarrow$ Mobile poll & cập nhật shared unread badge $\rightarrow$ Mở Notification Center $\rightarrow$ Đọc & Điều hướng context | Mọi vai trò (nhận thông báo cá nhân) | Sự kiện từ FLOW-02/03/04/05 | `GET /api/v1/notifications`<br>`GET /api/v1/notifications/unread-count`<br>`PUT /api/v1/notifications/{id}/read`<br>`PUT /api/v1/notifications/read-all` | Bell badge Dashboard & More hiển thị số chưa đọc; Click notification đánh dấu đã đọc và điều hướng type-safe tới đúng Target Entity |

---

## 3. Ma Trận Phân Quyền Truy Cập (Authoritative RBAC Matrix)

Dựa trên cấu hình chuẩn Flyway (`V011`, `V014`, `V015`), hệ thống WorkSphere có đúng **4 vai trò** và 29 định danh quyền hạn:

| Module / Tính Năng | Thao Tác (Action) | ADMIN (29 quyền) | PROJECT_MANAGER (20 quyền) | TEAM_LEADER (14 quyền) | EMPLOYEE (13 quyền) | Kỳ Vọng Phản Hồi Khi Vi Phạm |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **Identity & Users** | View Users / Read Profile | ALLOW (`USER_READ`) | ALLOW (`USER_READ`) | ALLOW (`USER_READ`) | ALLOW (`USER_READ`) | - |
| | Create / Edit / Delete User | ALLOW (`USER_CREATE`, `USER_UPDATE`, `USER_DELETE`) | DENY | DENY | DENY | HTTP `403 Forbidden` / Ẩn nút trên UI |
| **Role & Permissions** | Manage Role Assignments | ALLOW (`ROLE_ASSIGN`, `ROLE_READ`) | DENY | DENY | DENY | HTTP `403 Forbidden` |
| **Projects** | Create / Update / Delete Project | ALLOW (`PROJECT_CREATE`, `PROJECT_UPDATE`, `PROJECT_DELETE`) | ALLOW (`PROJECT_CREATE`, `PROJECT_UPDATE`)<br>DENY (`PROJECT_DELETE`) | DENY | DENY | HTTP `403 Forbidden` / Ẩn nút Create |
| | View Projects & Members | ALLOW (`PROJECT_READ`) | ALLOW (`PROJECT_READ`) | ALLOW (`PROJECT_READ`) | ALLOW (`PROJECT_READ`) | - |
| **Tasks** | Create & Assign Tasks | ALLOW (`TASK_CREATE`, `TASK_ASSIGN`) | ALLOW (`TASK_CREATE`, `TASK_ASSIGN`) | ALLOW (`TASK_CREATE`, `TASK_ASSIGN`) | DENY | HTTP `403 Forbidden` |
| | Update Task Status | ALLOW (`TASK_UPDATE`) | ALLOW (`TASK_UPDATE`) | ALLOW (`TASK_UPDATE`) | ALLOW (`TASK_UPDATE`) | Cập nhật chỉ cho phép trên task được phân công |
| | Delete Task | ALLOW (`TASK_DELETE`) | ALLOW (`TASK_DELETE`) | DENY | DENY | HTTP `403 Forbidden` |
| **Service Requests** | Create Request | ALLOW (`SERVICE_REQUEST_CREATE`) | ALLOW (`SERVICE_REQUEST_CREATE`) | ALLOW (`SERVICE_REQUEST_CREATE`) | ALLOW (`SERVICE_REQUEST_CREATE`) | - |
| | Assign Specialist | ALLOW (`SERVICE_REQUEST_ASSIGN`) | ALLOW (`SERVICE_REQUEST_ASSIGN`) | ALLOW (`SERVICE_REQUEST_ASSIGN`) | DENY | HTTP `403 Forbidden` / Ẩn picker phân công |
| | Resolve / Close Request | ALLOW (`SERVICE_REQUEST_RESOLVE`, `SERVICE_REQUEST_CLOSE`) | ALLOW (`SERVICE_REQUEST_RESOLVE`, `SERVICE_REQUEST_CLOSE`) | ALLOW (`SERVICE_REQUEST_RESOLVE`, `SERVICE_REQUEST_CLOSE`) | Đóng yêu cầu của chính mình | HTTP `403 Forbidden` nếu đóng yêu cầu người khác |
| **Assets** | Create / Update Asset | ALLOW (`ASSET_CREATE`, `ASSET_UPDATE`) | ALLOW (`ASSET_CREATE`, `ASSET_UPDATE`) | DENY | DENY | HTTP `403 Forbidden` |
| | Assign Asset | ALLOW (`ASSET_ASSIGN`) | ALLOW (`ASSET_ASSIGN`) | DENY | DENY | HTTP `403 Forbidden` |
| | View Asset & Repair History | ALLOW (`ASSET_READ`) | ALLOW (`ASSET_READ`) | ALLOW (`ASSET_READ`) | ALLOW (`ASSET_READ`) | - |
| **Notifications** | View Unread Count & List | ALLOW | ALLOW | ALLOW | ALLOW | Chỉ xem thông báo của chính mình |
| | Mark Read / Mark All Read | ALLOW | ALLOW | ALLOW | ALLOW | Cách ly tuyệt đối theo `user_id` |

---

## 4. Kế Hoạch Kiểm Thử Tích Hợp Đa Tầng (4 Testing Layers)

```
+-------------------------------------------------------------------+
| L4: Android Native Runtime E2E (Emulator 5554 / ADB / Logcat)     |
|     - Hoàn thành đầy đủ 6 luồng thực tế qua UI React Native        |
|     - Bằng chứng screenshot, logcat, network capture              |
+-------------------------------------------------------------------+
                                  ^
                                  |
+-------------------------------------------------------------------+
| L3: Backend Spring Boot & PostgreSQL Integration Testing         |
|     - Kiểm tra toàn bộ API Controller, Service, Repository        |
|     - Testcontainers PG 16, JWT filter, RBAC security, Flyway     |
+-------------------------------------------------------------------+
                                  ^
                                  |
+-------------------------------------------------------------------+
| L2: Mobile Navigation & Flow Integration Testing (Jest / RNTL)    |
|     - Navigation Root/Tab/Stack transition, Deep-linking, Route   |
|     - State isolation, Context providers, Session lifecycle       |
+-------------------------------------------------------------------+
                                  ^
                                  |
+-------------------------------------------------------------------+
| L1: Unit & Component Contract Testing (JUnit 5 / Jest)            |
|     - Domain entities, DTO serialization, Error mappers           |
|     - Pure UI components, Form validation, Date/badge helpers     |
+-------------------------------------------------------------------+
```

---

## 5. Kịch Bản Kiểm Thử Biên, Tiêu Cực & Ngoại Lệ (Negative & Boundary Matrix)

| Nhóm Kiểm Thử | Trường Hợp Thử Nghiệm (Test Scenario) | Tác Nhân & Đầu Vào | Phản Hồi Mong Đợi Backend | Hành Vi Mong Đợi Frontend |
|:---|:---|:---|:---|:---|
| **Xác thực & Phiên** | Đăng nhập sai mật khẩu 5 lần | User hợp lệ, mật khẩu sai | HTTP `401 Unauthorized` | Hiển thị cảnh báo lỗi, không crash app |
| | Refresh token hết hạn hoặc bị thu hồi | Refresh token cũ / rác | HTTP `401 Unauthorized` | Tự động clear session và quay về LoginScreen |
| | Token bị sửa đổi / giả mạo | Fake Bearer token | HTTP `401 Unauthorized` | Chặn truy cập ngay tại Gateway/Filter |
| **Phân quyền (RBAC)** | `EMPLOYEE` cố gắng tạo Dự án | Request `POST /api/v1/projects` | HTTP `403 Forbidden` | UI không hiển thị nút; nếu gọi API báo lỗi thông báo quyền hạn |
| | `TEAM_LEADER` cố gắng xóa Task | Request `DELETE /api/v1/tasks/{id}` | HTTP `403 Forbidden` | Thông báo từ chối truy cập |
| | User A đánh dấu đọc thông báo của User B | `PUT /api/v1/notifications/{userB_notif_id}/read` | HTTP `404 Not Found` hoặc `403` | Không gây ảnh hưởng dữ liệu của User B |
| **Dữ liệu & Concurrency** | Cập nhật cùng Task từ 2 phiên (Optimistic Lock) | Cùng lúc PATCH status với version cũ | HTTP `409 Conflict` | Hiển thị thông báo xung đột và reload dữ liệu mới nhất |
| | Phân công tài sản đang sửa chữa | Assign asset có status `MAINTENANCE` | HTTP `400 Bad Request` | Form báo lỗi nghiệp vụ rõ ràng |
| **Mạng & Ngoại Lệ** | Mất kết nối mạng khi nộp form | Ngắt mạng (Airplane mode) | Network Error / Timeout | Banner offline/retry; không mất dữ liệu đang nhập dở |
| | Backend sập / Gateway 502 / 503 | Server timeout > 10s | HTTP `503 Service Unavailable` | State Error chuẩn với nút "Thử lại" |

---

## 6. Chiến Lược Dữ Liệu Kiểm Thử (Fixture Strategy & Environment Contract)

1. **Bộ Dữ Liệu Kiểm Thử Chuẩn (Canonical Multi-Role Test Fixture):**
   - Cần đảm bảo có đủ 4 tài khoản cố định tương ứng với 4 vai trò canonical trong môi trường test/dev:
     - `admin@worksphere.com` / `Role: ADMIN`
     - `pm@worksphere.com` / `Role: PROJECT_MANAGER`
     - `lead@worksphere.com` / `Role: TEAM_LEADER`
     - `employee@worksphere.com` / `Role: EMPLOYEE`
   - Dữ liệu dự án, công việc, yêu cầu dịch vụ và tài sản mẫu được quản lý tập trung và cô lập, có thể tái tạo nhanh chóng (re-seed) mà không làm ô nhiễm môi trường.
2. **Quy Định Môi Trường Kiểm Thử (Environment Contract):**
   - **Database:** PostgreSQL container chuyên biệt (`worksphere-dev-pg` trên port `5432` hoặc Testcontainers độc lập).
   - **Backend Host:** Spring Boot profile `dev` hoặc `test`, bind tại port `8080`.
   - **Mobile Host:** Metro bundler bind tại port `8081`. Host URL cho Android Emulator là `http://10.0.2.2:8080`.
   - **Android Device:** Android Emulator `emulator-5554` (API 34, Android 14.0 Google APIs x86_64).
   - **Thu Dọn Tài Nguyên:** Mọi tiến trình nền (Metro, Backend, adb reverse, test server) phải được dừng sạch sẽ sau khi kết thúc đợt kiểm thử.

---

## 7. Phân Rã Lộ Trình Thực Thi: Các Đợt Sóng Kiểm Thử (Execution Waves)

Để đảm bảo an toàn tuyệt đối và tính khả thi, Giai đoạn 16 được tổ chức thành 6 Subphase/Wave tuần tự:

```
[Wave 16A: Nền Tảng Môi Trường & Fixture Đa Vai Trò]
                         |
                         v
[Wave 16B: E2E FLOW-01 Xác Thực, Phiên & Ma Trận RBAC]
                         |
                         v
[Wave 16C: E2E FLOW-02 Quản Lý Dự Án & FLOW-03 Vòng Đời Task]
                         |
                         v
[Wave 16D: E2E FLOW-04 Yêu Cầu Dịch Vụ & FLOW-05 Quản Lý Tài Sản]
                         |
                         v
[Wave 16E: E2E FLOW-06 Thông Báo, Điều Hướng Ngữ Cảnh & Hồi Quy]
                         |
                         v
[Wave 16F: Tổng Kiểm Tra Toàn Diện, Hardening & Đóng Giai Đoạn 16]
```

### Chi Tiết Từng Wave:

- **Phase 16A — Test Infrastructure & Multi-Role Fixture Foundation:**
  - Chuẩn bị script khởi tạo fixture đa vai trò (`ADMIN`, `PM`, `LEAD`, `EMPLOYEE`).
  - Kiểm định toàn diện hạ tầng Backend, Database, Metro, Android Emulator.
  - Thiết lập công cụ ghi nhận bằng chứng tự động (screenshot, logcat, network metrics).
- **Phase 16B — FLOW-01 Authentication, Session & RBAC E2E Wave:**
  - Thực thi E2E cho luồng đăng nhập, refresh token, thu hồi phiên, đăng xuất.
  - Kiểm chứng ma trận phân quyền RBAC cho cả 4 vai trò trên API và UI.
- **Phase 16C — FLOW-02 Project & FLOW-03 Task Management E2E Wave:**
  - Thực thi E2E luồng tạo dự án, phân công thành viên, tạo milestone.
  - Thực thi trọn vẹn vòng đời task từ `TODO` đến `DONE` giữa PM, Team Leader và Employee.
- **Phase 16D — FLOW-04 Service Request & FLOW-05 Asset Management E2E Wave:**
  - Thực thi E2E luồng tạo yêu cầu dịch vụ, phân công kỹ thuật viên, xử lý và đóng yêu cầu.
  - Thực thi luồng cấp phát tài sản, báo hỏng liên kết service request, và tra cứu lịch sử sửa chữa.
- **Phase 16E — FLOW-06 Notification, Cross-Module Context Navigation & Regression Wave:**
  - Kích hoạt sự kiện từ các module trên để sinh thông báo.
  - Kiểm tra đồng bộ unread badge, Notification Center, và điều hướng ngữ cảnh chéo module.
- **Phase 16F — Full System Regression, Android Native Verification & Release Hardening:**
  - Chạy full regression suite (L1, L2, L3, L4).
  - Thu thập bộ bằng chứng hoàn chỉnh (Logcat, Screenshots, Performance Audit).
  - Đóng chính thức Giai đoạn 16 và bàn giao sang các giai đoạn tiếp theo của Roadmap.

---

## 8. Phân Loại Mức Độ Khuyết Tật & Tiêu Chí Nghiệm Thu (Defect Severity & Exit Criteria)

### Phân Loại Mức Độ Lỗi (Defect Classification):
- **P0 (Blocker / Critical):** Crash ứng dụng, rò rỉ bảo mật/token, sai lệch dữ liệu tài chính/tài sản, bypass phân quyền RBAC, không thể hoàn thành luồng nghiệp vụ chính. *Bắt buộc phải sửa và kiểm thử lại ngay lập tức.*
- **P1 (Major):** Một tính năng con hoặc một màn hình không hoạt động, lỗi điều hướng context navigation sai thực thể, lỗi phân trang hoặc filter trả dữ liệu sai. *Bắt buộc phải sửa trước khi kết thúc wave tương ứng.*
- **P2 (Minor):** Lỗi hiển thị giao diện nhẹ, sai lệch định dạng ngày tháng/timestamp, badge unread chậm cập nhật nhưng tự sửa khi refresh. *Có thể ghi nhận và sửa trong wave hardening (16F).*
- **P3 (Trivial):** Lỗi chính tả tiếng Việt trong nhãn giao diện, căn chỉnh lề nhẹ.

### Tiêu Chí Nghiệm Thu Tổng Thể Giai Đoạn 16 (Exit Criteria):
1. 100% 6 luồng canonical (`FLOW-01` đến `FLOW-06`) chạy thành công trên môi trường Android Runtime thật (Emulator).
2. 0 lỗi P0 và 0 lỗi P1 tồn đọng.
3. 100% các ca kiểm thử RBAC (cho phép / từ chối) khớp đúng ma trận chuẩn.
4. Mọi bằng chứng runtime (Screenshots, Logcat, Network logs) được lưu trữ đầy đủ trong thư mục `reports/`.
5. Mọi background process và container phục vụ kiểm thử được dọn sạch hoàn toàn, bảo đảm an toàn hệ thống.

---

## 9. Mẫu Báo Cáo Kết Quả Thực Thi Wave (Wave Execution Report Template)

Khi thực hiện từng subphase/wave, Agent bắt buộc phải lập báo cáo theo mẫu chuẩn sau:

```markdown
# Phase 16[X] Execution Report — [Tên Wave]

## 1. Pre-Flight Check & Environment Status
- Git Checkpoint: <Commit SHA>
- Backend Status: <Health Check & Version>
- Database Status: <PostgreSQL Active / Migrations up-to-date>
- Android Runtime: <Emulator serial & Boot status>

## 2. Test Execution Details
- Scenarios Executed: <Danh sách test cases>
- Pass / Fail Count: <Số lượng Pass / Fail>
- RBAC Boundary Assertions: <Kết quả kiểm tra phân quyền>

## 3. Runtime Evidence
- Screenshots: <Đường dẫn ảnh trong reports/screenshots/>
- Logcat Extract: <Trích đoạn log xác thực hành động>
- Network / API Verification: <Status codes và response times>

## 4. Defect Log & Resolutions
- Log các lỗi phát hiện (nếu có) và biện pháp khắc phục.

## 5. Post-Execution Clean-up & Verdict
- Clean-up status: <Dừng dịch vụ nền>
- Final Verdict: <PASS / FAIL>
```

---

*Tài liệu này chính thức được đóng băng và là cơ sở duy nhất để bắt đầu thực thi **Phase 16A**.*
