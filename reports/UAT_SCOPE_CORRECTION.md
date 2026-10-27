# UAT SCOPE CORRECTION REPORT
# SOURCE-ALIGNED BUSINESS ACCEPTANCE RECONCILIATION

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Starting Checkpoint:** `733a1e2327f395716f2f8d9923c73717b76a5719`  
**Audit Verdict Addressed:** `UAT_SCOPE_AND_ENVIRONMENT_ACTION_REQUIRED`  
**Execution State:** `UAT_PLAN_CORRECTED` | `UAT_ENVIRONMENT_NOT_READY` | `UAT_EXECUTION_NOT_STARTED`

---

## 1. MỤC TIÊU HIỆU CHỈNH (CORRECTION OBJECTIVE)

Bản báo cáo ghi nhận việc đối soát và hiệu chỉnh hẹp toàn diện kế hoạch UAT (`reports/UAT_PLAN_FREEZE.md`) và Quyết định kiến trúc (`D-069`) để 100% kịch bản kiểm thử chấp nhận người dùng (UAT-01 đến UAT-10) phản ánh chính xác các năng lực thực tế tồn tại trong mã nguồn Backend (Spring Boot 3), ứng dụng Mobile (React Native), API Contract và tài liệu chuẩn Canonical.

Không có mã nguồn production (`backend/`, `mobile/`) nào bị thay đổi. Toàn bộ các phát hiện từ đợt kiểm toán đọc độc lập được tích hợp minh bạch mà không xóa bỏ dấu vết kiểm toán lịch sử.

---

## 2. CHI TIẾT HIỆU CHỈNH 6 KỊCH BẢN CÓ ĐỘ LỆCH (NARROW SCENARIO CORRECTIONS)

### A. UAT-01: Đăng nhập, Khôi phục Phiên, Đăng xuất và Phân định Vai trò
- **Kênh thực thi:** `MOBILE_UI`
- **Nội dung hiệu chỉnh:** Loại bỏ hoàn toàn phạm vi "Đăng ký" (Self-registration) và `RegistrationScreen`.
- **Năng lực mã nguồn xác nhận:**
  + Đăng nhập (`POST /api/v1/auth/login`), ẩn/hiện mật khẩu, bắt lỗi sai thông tin đăng nhập.
  + Khôi phục phiên tự động bằng Refresh Token lưu an toàn trong Keychain (`POST /api/v1/auth/refresh`).
  + Đăng xuất hiện tại xóa sạch session (`POST /api/v1/auth/logout`) và dọn dẹp in-memory storage.
  + Phân định giao diện Dashboard và các tab chức năng theo đúng vai trò canonical (`EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN`).
  + Khóa ngăn xếp Android Back sau khi đăng xuất (chống back về Dashboard).
- **Phạm vi loại trừ rõ ràng:** Không có trang đăng ký người dùng tự do; người dùng mới do Quản trị viên khởi tạo qua Admin API (`UAT-08`). Không dùng fixture test provisioner làm tính năng sản phẩm.

### B. UAT-02: Đổi Mật khẩu và Bảo vệ Phiên Xác thực
- **Kênh thực thi:** `MOBILE_UI`
- **Nội dung hiệu chỉnh:** Điều chỉnh từ "Thu hồi phiên đa thiết bị" thành "Bảo vệ phiên xác thực và thu hồi token xoay vòng".
- **Năng lực mã nguồn xác nhận:**
  + Đổi mật khẩu cá nhân qua màn hình Mobile `ChangePasswordScreen` (`PUT /api/v1/me/password`).
  + Kiểm tra tính hợp lệ của mật khẩu mới theo chuẩn an ninh.
  + Đăng xuất hủy phiên làm việc hiện tại.
  + Cơ chế xoay vòng token (Refresh Token Rotation) từ chối token cũ khi đã bị thay thế.
- **Phạm vi loại trừ rõ ràng:** Loại trừ bảng điều khiển danh sách thiết bị/phiên làm việc (Session Dashboard) và nút thu hồi từng thiết bị trên Mobile do hệ thống không thiết kế màn hình này.

### C. UAT-07: Quản lý Tài sản và Liên kết Yêu cầu Dịch vụ
- **Kênh thực thi:** `MOBILE_UI`
- **Nội dung hiệu chỉnh:** Làm rõ phạm vi quản lý danh mục tài sản trên Mobile.
- **Năng lực mã nguồn xác nhận:**
  + Tạo tài sản mới trên Mobile bằng cách chọn danh mục đang hoạt động có sẵn qua `AssetCategorySelectModal` (`GET /api/v1/asset-categories`).
  + Cấp phát tài sản cho nhân viên, kiểm tra trạng thái `ASSIGNED`.
  + Nhân viên xem tài sản được bàn giao với huy hiệu "Tài sản của tôi".
  + Thao tác "Báo hỏng" từ chi tiết tài sản tự động điều hướng sang màn hình Tạo Yêu cầu Dịch vụ với `assetId` gắn sẵn.
  + Ghi nhận lịch sử sửa chữa thiết bị.
- **Phạm vi loại trừ rõ ràng:** Tuyệt đối loại trừ thao tác Thêm/Sửa/Xóa/Kích hoạt Danh mục tài sản (Asset Category CRUD) trên Mobile. Quản lý danh mục tài sản thuộc phạm vi API Quản trị Backend.

### D. UAT-08: Quản trị Người dùng qua Admin API và Kiểm chứng RBAC trên Mobile
- **Kênh thực thi:** `MOBILE_UI_PLUS_ADMIN_API`
- **Nội dung hiệu chỉnh:** Phân định rõ hai phần thực thi: Admin API và kiểm chứng trên Mobile UI.
- **Năng lực mã nguồn xác nhận:**
  + **Phần A (Admin API):** Sử dụng REST Client với quyền `USER_MANAGE` để tìm kiếm user (`GET /api/v1/admin/users`), tạo user mới (`POST /api/v1/admin/users`), cập nhật user (`PUT /api/v1/admin/users/{userId}`), khóa tài khoản (`PUT /api/v1/admin/users/{userId}/lock`), mở khóa tài khoản (`PUT /api/v1/admin/users/{userId}/unlock`).
  + **Phần B (Mobile UI Verification):** Đăng nhập bằng user vừa tạo trên Mobile thành công; sau khi Admin khóa tài khoản, Mobile từ chối đăng nhập và hiển thị thông báo khóa; sau khi mở khóa, Mobile cho phép đăng nhập lại bình thường; phân quyền UI phản ánh đúng role gán.
- **Phạm vi loại trừ rõ ràng:** Không có màn hình Quản trị Người dùng trên ứng dụng Mobile. Không hỗ trợ xóa cứng người dùng (hard delete).

### E. UAT-09: Trung tâm Thông báo Trong Ứng dụng và Điều hướng Ngữ cảnh
- **Kênh thực thi:** `MOBILE_UI`
- **Nội dung hiệu chỉnh:** Loại bỏ cụm từ gây hiểu lầm "Đa kênh" (Multi-channel).
- **Năng lực mã nguồn xác nhận:**
  + Trung tâm thông báo trong ứng dụng qua REST polling/refresh (`GET /api/v1/notifications`).
  + Hiển thị huy hiệu đếm chưa đọc trên App Header và More Tab.
  + Đánh dấu đã đọc một thông báo và Đọc tất cả (`PUT /api/v1/notifications/read-all`).
  + Điều hướng ngữ cảnh chính xác tới `ProjectDetail`, `TaskDetail`, `ServiceRequestDetail`, `AssetDetail`.
  + Khả năng xử lý an toàn khi thực thể tham chiếu bị xóa/không tồn tại (banner cảnh báo, không gây crash).
  + Ngăn xếp Back Stack quay lại đúng danh sách thông báo.
- **Phạm vi loại trừ rõ ràng:** Tuân thủ Kiến trúc Quyết định D-067 và Canonical Docs: Loại trừ hoàn toàn Push notification ngoài (FCM, APNs), khay thông báo Android, Email, SMS, WebSocket, SSE.

### F. UAT-10: Cô lập Dữ liệu Người dùng, Gián đoạn Mạng và Retry An toàn
- **Kênh thực thi:** `MOBILE_UI`
- **Nội dung hiệu chỉnh:** Điều chỉnh từ "Tính nhất quán ngoại tuyến" thành "Cô lập dữ liệu, gián đoạn mạng và retry an toàn".
- **Năng lực mã nguồn xác nhận:**
  + Cô lập dữ liệu tuyệt đối giữa các phiên đăng nhập (User A đăng xuất -> User B đăng nhập không thấy rò rỉ dữ liệu hay badge của User A).
  + Xử lý lỗi ngắt kết nối mạng hoặc timeout: hiển thị banner/thông báo thân thiện, giữ nguyên view hiện tại, không crash ứng dụng.
  + Thao tác "Thử lại" (Retry) khi có mạng trở lại tải lại dữ liệu an toàn, không gửi đột biến trùng lặp.
- **Phạm vi loại trừ rõ ràng:** WorkSphere là ứng dụng phụ thuộc mạng trực tuyến (`NETWORK_ERROR_RETRY`). Loại trừ hoàn toàn cơ sở dữ liệu ngoại tuyến (SQLite, Realm, WatermelonDB), hàng đợi đột biến ngoại tuyến, đồng bộ nền hai chiều và giải quyết xung đột khi online.

---

## 3. BẢNG TRUY VẾT 10 KỊCH BẢN UAT SAU HIỆU CHỈNH (RECONCILED TRACEABILITY)

| Kịch Bản | Tiêu Đề Đã Chuẩn Hóa Khớp Nguồn | Kênh Thực Thi | Vai Trò (Actor) | Năng Lực Backend | Màn Hình / Route Mobile | Trạng Thái Chấp Nhận |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **UAT-01** | Đăng nhập, Khôi phục Phiên, Đăng xuất và Phân định Vai trò | `MOBILE_UI` | `EMPLOYEE` | `/auth/login`, `/auth/refresh`, `/auth/logout` | `LoginScreen`, `MainTabNavigator` | **READY_FOR_UAT** |
| **UAT-02** | Đổi Mật khẩu và Bảo vệ Phiên Xác thực | `MOBILE_UI` | `EMPLOYEE` | `/me/password`, `/auth/refresh` | `ChangePasswordScreen`, `ProfileScreen` | **READY_FOR_UAT** |
| **UAT-03** | Vòng đời Dự án, Phân bổ Thành viên & Mốc Tiến độ | `MOBILE_UI` | `PROJECT_MANAGER` | `/projects`, `/projects/{id}/members`, `/milestones` | `ProjectListScreen`, `ProjectDetailScreen`, `CreateProjectModal` | **READY_FOR_UAT** |
| **UAT-04** | Phân rã Công việc, Giao Task, Cập nhật Tiến độ & Báo cáo | `MOBILE_UI` | `TEAM_LEADER` / `EMPLOYEE` | `/tasks`, `/tasks/{id}`, `/tasks/{id}/comments` | `TaskListScreen`, `TaskDetailScreen`, `CreateTaskModal` | **READY_FOR_UAT** |
| **UAT-05** | Phê duyệt & Đánh giá Chất lượng Nhiệm vụ theo Phân cấp | `MOBILE_UI` | `TEAM_LEADER` / `PROJECT_MANAGER` | `/tasks/{id}/review`, `/tasks/{id}/status` | `TaskDetailScreen` action buttons | **READY_FOR_UAT** |
| **UAT-06** | Tạo, Tiếp nhận, Xử lý & Đánh giá Yêu cầu Dịch vụ Nội bộ | `MOBILE_UI` | `EMPLOYEE` / `ADMIN` | `/service-requests`, status transitions, rating | `ServiceRequestListScreen`, `ServiceRequestDetailScreen`, `ServiceRatingModal` | **READY_FOR_UAT** |
| **UAT-07** | Quản lý Tài sản và Liên kết Yêu cầu Dịch vụ | `MOBILE_UI` | `ADMIN` / `EMPLOYEE` | `/assets`, `/asset-categories` (read) | `AssetListScreen`, `AssetDetailScreen`, `CreateAssetScreen`, `AssetCategorySelectModal` | **READY_FOR_UAT** |
| **UAT-08** | Quản trị Người dùng qua Admin API và Kiểm chứng RBAC trên Mobile | `MOBILE_UI_PLUS_ADMIN_API` | `ADMIN` (API) & 4 Vai trò (Mobile) | `/admin/users`, `/admin/users/{id}/lock` | `LoginScreen`, `ProfileScreen` (Kiểm chứng kết quả) | **READY_FOR_UAT** |
| **UAT-09** | Trung tâm Thông báo Trong Ứng dụng và Điều hướng Ngữ cảnh | `MOBILE_UI` | `EMPLOYEE` | `/notifications`, `/notifications/{id}/read`, `/notifications/read-all` | `NotificationListScreen`, Header Badge | **READY_FOR_UAT** |
| **UAT-10** | Cô lập Dữ liệu Người dùng, Gián đoạn Mạng và Retry An toàn | `MOBILE_UI` | Cả 4 vai trò | Spring Security RBAC + 401 interceptor | Toàn bộ ứng dụng & Error Banners | **READY_FOR_UAT** |

---

## 4. TỔNG HỢP CÁC YẾU TỐ CHẶN MÔI TRƯỜNG THỰC THI (ENVIRONMENT BLOCKERS)

Mặc dù kế hoạch kiểm thử đã được điều chỉnh hoàn toàn khớp với mã nguồn (`UAT_PLAN_CORRECTED`), việc thực thi UAT chưa thể tiến hành ngay do còn các điều kiện tiên quyết về môi trường và hạ tầng (`UAT_ENVIRONMENT_NOT_READY`, `UAT_EXECUTION_NOT_STARTED`):

1. **Staging Backend Host:** Chưa có máy chủ Staging độc lập triển khai backend containerized.
2. **Chứng chỉ TLS / Domain HTTPS:** Chưa có endpoint bảo mật staging với chứng chỉ TLS hợp lệ.
3. **Staging PostgreSQL Database:** Chưa có cơ sở dữ liệu riêng biệt chạy migrations V001–V017 phục vụ UAT.
4. **Bản Build Release Ký số (Signed Release APK/AAB):** Ứng dụng hiện tại mới chỉ đóng gói debug APK; chưa qua pipeline ký số release và bật R8 minification.
5. **Kênh Phân Phối Ứng Dụng:** Chưa thiết lập Firebase App Distribution hoặc Google Play Internal Track.
6. **Tài Khoản & Dữ Liệu UAT Khởi Tạo:** Cần nạp dữ liệu UAT tổng hợp độc lập có tiền tố `UAT-`.
7. **Nhân Sự Ký Duyệt Nghiệm Thu:** Chưa phân công chính thức các cá nhân đại diện Business Sponsor, Product Owner, QA Lead, Tech Lead.

---

## 5. HÀNH ĐỘNG ROADMAP TIẾP THEO (NEXT ROADMAP STAGE)

Căn cứ tài liệu chuẩn [docs/08_DEVELOPMENT_ROADMAP.md](file:///d:/WorkSphere/docs/08_DEVELOPMENT_ROADMAP.md#L1166):
- **Tên giai đoạn canonical tiếp theo:** **GIAI ĐOẠN 17: DOCKER VÀ MÔI TRƯỜNG LOCAL**
- **Mục tiêu canonical:** Cho phép chạy backend và database bằng Docker Compose (`docker compose up`), kết nối database, chạy migration tự động, trả health check UP, mở API mà không chứa secret trong image và không dùng cấu hình production giả.
- **Phạm vi:**
  + Tạo `Dockerfile` backend đa tầng (multi-stage build).
  + Tạo `docker-compose.yml` (backend service + postgres service + volumes + network + health checks).
  + Tạo `.env.example` và quy chế tách secret.
  + Tạo tài liệu khởi động, dừng và reset local database.
- **Ranh giới:** Không gộp chung Giai đoạn 18 (CI/CD) trong cùng lượt triển khai Giai đoạn 17.

### Dự thảo Prompt cho lượt tiếp theo (Draft Next Prompt):
```text
THỰC HIỆN:
GIAI ĐOẠN 17 — DOCKER VÀ MÔI TRƯỜNG LOCAL (BACKEND MULTI-STAGE DOCKERFILE, DOCKER COMPOSE & DATABASE HEALTH CHECK)

Starting checkpoint: [Current Commit SHA]

MỤC TIÊU:
1. Xây dựng Dockerfile cho backend WorkSphere sử dụng multi-stage build an toàn.
2. Thiết lập docker-compose.yml khởi chạy đồng bộ backend và postgres database.
3. Cấu hình volume, network cô lập và health check tự động.
4. Cung cấp file .env.example và runbook hướng dẫn khởi động, dừng, reset database.
5. Xác minh docker compose up khởi động thành công, migration hoàn tất và /actuator/health trả UP.
```

---

## 6. KẾT LUẬN

Kế hoạch UAT và Hợp đồng Nghiệm thu Nghiệp vụ chính thức được **KHÓA CHUẨN XÁC VỚI NĂNG LỰC MÃ NGUỒN**. Trạng thái sẵn sàng nghiệm thu được ghi nhận là:
`UAT_SCOPE_CORRECTED_ENVIRONMENT_PREPARATION_REQUIRED`.
