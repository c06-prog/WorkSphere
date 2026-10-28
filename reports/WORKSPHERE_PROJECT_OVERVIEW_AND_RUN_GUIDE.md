# WORKSPHERE — PROJECT OVERVIEW & RUN GUIDE

> **Mã định danh tài liệu**: `STAGE_20A_ADDENDUM_PROJECT_OVERVIEW_AND_RUN_GUIDE`
> **Giai đoạn**: Roadmap Stage 20A Addendum — Nguồn chân lý hướng dẫn tổng quan và vận hành
> **Trạng thái**: Hoàn tất, đối soát thực tế mã nguồn (`SOURCE_VERIFIED`, `RUNTIME_VERIFIED`)
> **Đối tượng độc giả**: Thành viên mới gia nhập nhóm, Thành viên chuẩn bị bảo vệ đồ án, Giảng viên chấm thi, Kỹ sư tiếp nhận & bảo trì hệ thống.
> **Tài liệu liên kết**:
> - [STAGE_20_COURSE_CODE_EVIDENCE_MAP.md](STAGE_20_COURSE_CODE_EVIDENCE_MAP.md) (Ma trận minh chứng 4 môn học)
> - [STAGE_20_TEAM_STUDY_AND_DEFENSE_GUIDE.md](STAGE_20_TEAM_STUDY_AND_DEFENSE_GUIDE.md) (Cẩm nang tự học & phản biện nhóm)
> - [DOCKER_LOCAL_OPERATIONS.md](runbooks/DOCKER_LOCAL_OPERATIONS.md) (Sổ tay vận hành Docker cục bộ)
> - [LOGGING_AND_CORRELATION_POLICY.md](runbooks/LOGGING_AND_CORRELATION_POLICY.md) (Chính sách Logging & Correlation ID)
> - [METRICS_AND_MONITORING_POLICY.md](runbooks/METRICS_AND_MONITORING_POLICY.md) (Chính sách Metrics & Giám sát Actuator)
> - [BACKUP_OPERATIONS.md](runbooks/BACKUP_OPERATIONS.md) (Sổ tay sao lưu dữ liệu)
> - [RESTORE_OPERATIONS.md](runbooks/RESTORE_OPERATIONS.md) (Sổ tay phục hồi dữ liệu diễn tập)
> - [ROLLBACK_OPERATIONS.md](runbooks/ROLLBACK_OPERATIONS.md) (Sổ tay rollback ứng dụng)

---

## MỤC LỤC TỔNG QUAN

1. [PART I — TÓM TẮT NHANH (QUICK SUMMARY)](#part-i--tóm-tắt-nhanh-quick-summary)
   - 1. WorkSphere là gì?
   - 2. Trạng thái hiện tại của dự án
   - 3. Bốn vai trò canonical (RBAC)
   - 4. Các module chính
   - 5. Kiến trúc một trang (One-Page Architecture)
   - 6. Quick Start ưu tiên (Chạy ngay với Docker Compose)
2. [PART II — GIẢI THÍCH DỰ ÁN CHI TIẾT (DEEP-DIVE PROJECT EXPLANATION)](#part-ii--giải-thích-dự-án-chi-tiết-deep-dive-project-explanation)
   - 7. Kiến trúc hệ thống & Ranh giới Module
   - 8. Luồng xác thực hai lớp (Authentication & Token Lifecycle)
   - 9. Luồng nghiệp vụ cốt lõi (Core Business Workflows)
   - 10. Kiến trúc Ứng dụng Di động (Mobile Architecture)
   - 11. Kiến trúc Backend Spring Boot (Backend Architecture)
   - 12. Chiến lược kiểm thử & Đảm bảo chất lượng (Testing & QA)
   - 13. Docker & CI/CD Pipeline
   - 14. Vận hành & Giám sát (Operability, Metrics & DR)
3. [PART III — HƯỚNG DẪN CHẠY DỰ ÁN (RUN GUIDE)](#part-iii--hướng-dẫn-chạy-dự-án-run-guide)
   - 15. Yêu cầu hệ thống (System Prerequisites)
   - 16. Chuẩn bị repository & Kiểm tra nhánh
   - 17. Cấu hình môi trường (Environment Configuration `.env`)
   - 18. Chế độ chạy A — Docker Compose (Khuyến nghị chuẩn)
   - 19. Chế độ chạy B — Backend Host + PostgreSQL Docker
   - 20. Chế độ chạy C — Ứng dụng Di động Android
   - 21. Thực thi kiểm thử (Running Tests)
   - 22. Kiểm tra Health & Giám sát Actuator/Prometheus
   - 23. Kiểm tra Logs & Mã định danh yêu cầu (X-Request-ID)
   - 24. Thực thi Sao lưu, Xác minh, Phục hồi và Rollback
   - 25. Dừng hệ thống & Dọn dẹp an toàn (Stop & Cleanup)
4. [PART IV — DEMO, XỬ LÝ SỰ CỐ & THAM KHẢO (DEMO, TROUBLESHOOTING & REFERENCE)](#part-iv--demo-xử-lý-sự-cố--tham-khảo-demo-troubleshooting--reference)
   - 26. Chuẩn bị kịch bản Demo (Pre-demo Checklist)
   - 27. Luồng Demo khuyến nghị (Suggested Demo Flow)
   - 28. Bảng tra cứu & Xử lý sự cố (Troubleshooting Matrix)
   - 29. Giới hạn đã biết của dự án (Known Limitations)
   - 30. Từ điển thuật ngữ kỹ thuật (Learning Glossary)
   - 31. Bảng lệnh tra cứu nhanh (Command Cheat Sheet)
   - 32. Danh mục nguồn chân lý (Source-of-Truth Index)

---

# PART I — TÓM TẮT NHANH (QUICK SUMMARY)

## 1. WorkSphere là gì?

- **Bài toán doanh nghiệp**: Trong các tổ chức vừa và nhỏ, quy trình quản lý vận hành nội bộ (giao việc dự án, theo dõi tiến độ, mượn trả tài sản, báo hỏng thiết bị và hỗ trợ IT) thường bị phân mảnh qua nhiều kênh phi cấu trúc (tin nhắn Zalo/Slack, email, bảng tính Excel). Điều này gây thất thoát tài sản, trễ hạn dự án, mất dấu vết trách nhiệm và thiếu số liệu thống kê thời gian thực.
- **Mục tiêu**: Xây dựng một nền tảng vận hành số hợp nhất (Digital Operations Platform) chuẩn doanh nghiệp, tích hợp liền mạch giữa Backend xử lý nghiệp vụ trung tâm và ứng dụng Di động đa nền tảng.
- **Đối tượng sử dụng**: Toàn bộ cán bộ nhân viên trong tổ chức, từ nhân viên thừa hành, trưởng nhóm kỹ thuật, quản lý dự án cấp cao, đến quản trị viên hệ thống.
- **Phạm vi MVP (Minimum Viable Product)**:
  - 6 phân hệ cốt lõi: Xác thực tập trung (IAM), Quản lý Dự án (Project), Quản lý Công việc (Task), Quản lý Phiếu yêu cầu dịch vụ (Service Request), Vòng đời Tài sản (Asset), và Hệ thống Thông báo (Notification).
  - Không dàn trải các tính năng chưa hoàn thiện; tập trung vào tính toàn vẹn dữ liệu, kiểm soát phân quyền RBAC và kiểm thử tự động hóa cao.

## 2. Trạng thái hiện tại của dự án

- **Mã nguồn & Tính năng**: Hoàn thành 100% phạm vi nghiệp vụ lộ trình từ Stage 0 đến Stage 19. Sẵn sàng cho Stage 20 (Tổng kết học liệu và chuyển giao).
- **Kiểm thử Backend**: **351 tests** (Unit test, Service test, Slice test, Controller test) đạt kết quả 100% **BUILD SUCCESS**, 0 failures, 0 errors, 0 skipped. Quy chuẩn Checkstyle: **0 violations**.
- **Kiểm thử Mobile**: **129 test suites / 1,144 tests** (Jest) pass 100%, TypeScript typecheck clean (0 errors), ESLint clean. Android Debug APK build thành công trên GitHub Actions (`assembleDebug`).
- **Docker & Đóng gói**: Docker Compose chuẩn (`compose.yaml`) gồm `worksphere-backend` (Multi-stage build JDK 21 / JRE alpine siêu nhẹ, chạy dưới user phi đặc quyền UID 10001) và `worksphere-postgres` (PostgreSQL 15-alpine), kèm healthcheck tự động.
- **CI/CD Pipeline**: GitHub Actions 5 jobs chạy song song (`ci.yml`): Secret Audit, Backend Quality, Mobile Quality, Android Debug Build, Docker Image Build. Toàn bộ jobs đạt trạng thái xanh (SUCCESS).
- **Khả năng vận hành (Operability)**:
  - Structured Logging với Correlation ID (`X-Request-ID` / MDC) xuyên suốt mọi request.
  - Hardened Spring Boot Actuator (`health`, `info`, `prometheus`).
  - Sao lưu tự động (PostgreSQL custom format dump + tar.gz uploads với SHA-256 manifests) và diễn tập phục hồi cô lập thành công (Stage 19D / Stage 19F).
- **Ranh giới hiện tại**:
  - `LOCAL_OPERABILITY_READY = TRUE`: Vận hành cục bộ và diễn tập kiểm thử đã sẵn sàng hoàn toàn.
  - `UAT_EXECUTION_READY = PENDING`: Kế hoạch UAT đã khóa (D-069) nhưng chưa chạy nghiệm thu người dùng cuối.
  - `STAGING_READY = FALSE`, `PRODUCTION_READY = FALSE`: Chưa deploy lên môi trường Staging/Production thực tế; chưa phát hành public Docker image.

## 3. Bốn vai trò canonical (RBAC)

Dự án tuân thủ nghiêm ngặt 4 vai trò chuẩn (khởi tạo trong migration `V011__seed_roles_and_permissions.sql` và enum `Role.java`), **tuyệt đối không sử dụng `SUPER_ADMIN` hay `MANAGER`**:

1. **`EMPLOYEE` (Nhân viên)**: Xem dự án tham gia, nhận task được phân công, cập nhật trạng thái task (`TODO` -> `IN_PROGRESS` -> `DONE`), tạo phiếu yêu cầu hỗ trợ (Service Request), yêu cầu mượn tài sản, nhận thông báo cá nhân.
2. **`TEAM_LEADER` (Trưởng nhóm)**: Quản lý thành viên trong nhóm, phân công task cho nhân viên trong dự án, duyệt các phiếu yêu cầu thuộc thẩm quyền, theo dõi tiến độ tổng thể của nhóm.
3. **`PROJECT_MANAGER` (Quản lý dự án)**: Khởi tạo và thiết lập dự án, phân bổ ngân sách/thời hạn, chỉ định Team Leader, phê duyệt điều chỉnh kế hoạch, theo dõi báo cáo phân tích hiệu suất dự án.
4. **`ADMIN` (Quản trị viên hệ thống)**: Quản lý danh mục tài khoản người dùng, phân quyền vai trò, quản lý danh mục tài sản tổ chức (Asset catalog), kiểm tra logs vận hành, giám sát sức khỏe hệ thống.

## 4. Các module chính

1. **Authentication & IAM (`identity`)**: Đăng nhập, cấp phát Access Token ngắn hạn và Refresh Token dài hạn, xoay vòng token (Token Rotation), thu hồi token khi đăng xuất, quản lý vai trò và quyền hạn.
2. **Dashboard**: Màn hình tổng quan hiển thị chỉ số KPI, danh sách công việc khẩn cấp cần làm, biểu đồ phân bổ trạng thái task và thông báo mới nhất.
3. **Organization & User Management**: Quản lý thông tin hồ sơ nhân sự, phòng ban, và danh sách phân quyền trong tổ chức.
4. **Project Management (`project`)**: Vòng đời dự án từ tạo mới, phân công nhân sự, quản lý thời hạn (Milestones), liên kết với các công việc liên quan.
5. **Task Management (`task`)**: Quản lý công việc với máy trạng thái nghiêm ngặt (`TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`), độ ưu tiên, hạn chót và bình luận trao đổi.
6. **Service Request (`service-request`)**: Quy trình tạo và xử lý các yêu cầu nội bộ (hỗ trợ kỹ thuật, cấp quyền, khiếu nại) với luồng phê duyệt đa cấp.
7. **Asset Lifecycle (`asset`)**: Quản lý tài sản thiết bị, trạng thái sẵn sàng (`AVAILABLE`, `IN_USE`, `MAINTENANCE`), lịch sử bàn giao và thu hồi tài sản.
8. **Notification System (`notification`)**: Hệ thống thông báo thời gian thực về thay đổi trạng thái công việc, phân công mới và kết quả phê duyệt.
9. **Profile & Settings**: Quản lý thông tin cá nhân, đổi mật khẩu, cấu hình giao diện (Sáng/Tối) và ngôn ngữ.

## 5. Kiến trúc một trang (One-Page Architecture)

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|  React Native Mobile App (v0.88.0, React 19, TypeScript, Android / iOS)               |
|  - Token Storage: Access Token (In-Memory RAM) | Refresh Token (Hardware Keychain)     |
|  - Navigation: React Navigation (Auth Stack / Main Tab Navigator)                     |
|  - State: Redux Toolkit (Client UI State) | Axios Interceptor (Auto Correlation ID)    |
+---------------------------------------------------------------------------------------+
                                           |  HTTPS / HTTP JSON REST API
                                           |  (Headers: Authorization, X-Request-ID)
                                           v
+---------------------------------------------------------------------------------------+
|                                  APPLICATION TIER                                     |
|  Spring Boot 4.1.1 Modular Monolith (Java 21, UID 10001, Containerized)               |
|                                                                                       |
|  [Security Edge Filter] -> RequestCorrelationFilter -> JwtAuthenticationFilter         |
|                                                                                       |
|  [Modular Business Domains]                                                           |
|  +----------------+  +----------------+  +----------------+  +---------------------+  |
|  |    identity    |  |    project     |  |      task      |  |   service-request   |  |
|  +----------------+  +----------------+  +----------------+  +---------------------+  |
|  +----------------+  +----------------+  +-----------------------------------------+  |
|  |     asset      |  |  notification  |  |   shared (MDC Logging, Global Exceptions)  |  |
|  +----------------+  +----------------+  +-----------------------------------------+  |
|                                                                                       |
|  [Operability & Observability]                                                        |
|  - Spring Boot Actuator (/actuator/health, /actuator/info, /actuator/prometheus)       |
|  - Structured JSON Logging (Logback + MDC requestId)                              |
+---------------------------------------------------------------------------------------+
                     |                                              |
     JDBC / SQL      |                                              | Filesystem I/O
                     v                                              v
+----------------------------------------+     +----------------------------------------+
|             DATABASE TIER              |     |              STORAGE TIER              |
|  PostgreSQL 15-alpine (Port 5432/5433) |     |  Named Volume: worksphere-uploads      |
|  - 17 Flyway Migrations (V001 -> V017) |     |  - User attachments & documents        |
|  - RBAC seed data, relational schema   |     |  - Backed up via tar.gz + SHA-256      |
+----------------------------------------+     +----------------------------------------+
```

## 6. Quick Start ưu tiên (Chạy ngay với Docker Compose)

> **Mục tiêu**: Khởi động toàn bộ Backend và Cơ sở dữ liệu nhanh chóng bằng Docker Compose (thời gian khởi động phụ thuộc vào cache Docker và cấu hình phần cứng).
> **Trạng thái lệnh**: `RUNTIME_VERIFIED`

### Bước 1: Sao chép tệp cấu hình môi trường
Mở PowerShell tại thư mục gốc dự án (`D:\WorkSphere`):
```powershell
Copy-Item .env.example .env
```
*(Mặc định `.env.example` đã điền sẵn cấu hình phát triển an toàn, mật khẩu dev và secret key mẫu. Tuyệt đối không commit file `.env` vào Git).*

### Bước 2: Khởi động hệ thống với Docker Compose
```powershell
docker compose up -d --build
```
*Lệnh này sẽ tải image PostgreSQL 15, kích hoạt multi-stage build cho Backend và chạy ngầm.*

### Bước 3: Kiểm tra trạng thái và sức khỏe hệ thống
```powershell
docker compose ps
curl http://localhost:8080/actuator/health
```
**Kết quả mong đợi**: Cả 2 container `worksphere-postgres` và `worksphere-backend` đều ở trạng thái `Up (healthy)`. Endpoint `/actuator/health` trả về JSON `{"status":"UP"}`.

### Bước 4: Dừng hệ thống an toàn khi kết thúc
```powershell
docker compose down
```
> [!CAUTION]
> **CẢNH BÁO AN TOÀN DỮ LIỆU**: Tuyệt đối **KHÔNG** thêm cờ `-v` (`docker compose down -v`) khi dừng hệ thống định kỳ. Cờ `-v` sẽ xóa vĩnh viễn volume database và uploads của dự án!

# PART II — GIẢI THÍCH DỰ ÁN CHI TIẾT (DEEP-DIVE PROJECT EXPLANATION)

## 7. Kiến trúc hệ thống & Ranh giới Module

WorkSphere áp dụng mô hình kiến trúc **Modular Monolith** kết hợp nguyên lý thiết kế hướng miền (**Domain-Driven Design - DDD**):

- **Tại sao chọn Modular Monolith thay vì Microservices?**
  - Giảm thiểu độ phức tạp vận hành hạ tầng (không cần Service Mesh, API Gateway phân tán, Distributed Tracing phức tạp).
  - Đảm bảo tính toàn vẹn giao dịch (ACID Transactions) khi cần cập nhật dữ liệu đa thực thể.
  - Vẫn duy trì tính phân tách nghiệp vụ cao: Mỗi module sở hữu schema, domain entities, repositories và business services riêng.
- **Ranh giới module (Module Boundaries)**:
  - `identity`: Quản lý người dùng, vai trò, quyền hạn và JWT.
  - `project`: Quản lý thông tin dự án, thành viên tham gia, trạng thái dự án.
  - `task`: Quản lý công việc, phân công, bình luận, tiến độ (phụ thuộc vào `project` và `identity`).
  - `service-request`: Quản lý yêu cầu hỗ trợ nội bộ và quy trình phê duyệt.
  - `asset`: Quản lý danh mục tài sản, kiểm kê, bàn giao.
  - `notification`: Gửi và lưu trữ thông báo (sử dụng Spring Application Events để lắng nghe sự kiện từ các module khác mà không gây phụ thuộc ngược).
  - `shared`: Chứa các tiện ích dùng chung: Base Entities, Global Exception Handling, Security Filters, Correlation ID.
- **Quy tắc giao tiếp giữa các module**:
  - Module A không được gọi trực tiếp Repository của Module B.
  - Mọi trao đổi dữ liệu phải thông qua Public Service Interface của module đó hoặc qua cơ chế sự kiện bất đồng bộ nội bộ (`ApplicationEventPublisher`).

## 8. Luồng xác thực hai lớp (Authentication & Token Lifecycle)

Dự án áp dụng giải pháp bảo mật Stateful Token Rotation kết hợp Stateless Request Authentication:

1. **Đăng nhập (Login)**:
   - Client gửi `POST /api/v1/auth/login` kèm username/password.
   - `AuthenticationService` kiểm tra mật khẩu qua `PasswordEncoder` (BCrypt).
   - Nếu hợp lệ, sinh cặp mã:
     - **Access Token**: Thời hạn ngắn (15 phút), chứa Claims định danh và quyền hạn của người dùng.
     - **Refresh Token**: Thời hạn dài (7 ngày), chuỗi UUID ngẫu nhiên được lưu trữ mã hóa trong bảng `refresh_tokens` của cơ sở dữ liệu.
2. **Cơ chế lưu trữ trên ứng dụng Di động (Mobile Token Storage Model)**:
   - **Access Token**: Lưu trữ hoàn toàn trong bộ nhớ RAM (`IN_MEMORY` - biến runtime của service). Khi tắt ứng dụng, token này bị hủy bỏ ngay lập tức, ngăn ngừa nguy cơ trích xuất từ bộ nhớ lưu trữ vật lý.
   - **Refresh Token**: Lưu trữ an toàn trong phân vùng mã hóa phần cứng của thiết bị di động (`SECURE_STORAGE` thông qua thư viện `react-native-keychain` - Android Keystore / iOS Keychain).
   - **Cài đặt không nhạy cảm (Theme, Onboarding)**: Lưu trong `AsyncStorage` (`NON_SENSITIVE_ASYNC_STORAGE`).
3. **Xoay vòng Token (Token Refresh Rotation)**:
   - Khi Access Token hết hạn (401 Unauthorized), Axios Interceptor trên Mobile tự động chặn lỗi và gọi `POST /api/v1/auth/refresh`.
   - Backend xác thực Refresh Token, thu hồi (revoke) token cũ, và cấp phát một cặp Access Token + Refresh Token mới hoàn toàn.
   - Nếu Refresh Token bị sử dụng lại (dấu hiệu bị tấn công giả mạo), toàn bộ chuỗi token của người dùng đó sẽ bị vô hiệu hóa ngay lập tức.
4. **Đăng xuất (Logout Cleanup)**:
   - Gửi yêu cầu `POST /api/v1/auth/logout`.
   - Backend đánh dấu thu hồi Refresh Token trong cơ sở dữ liệu.
   - Mobile xóa sạch Access Token trong RAM và xóa Refresh Token trong Keychain/Keystore.

## 9. Luồng nghiệp vụ cốt lõi (Core Business Workflows)

### A. Quản lý Dự án và Công việc (Project & Task Lifecycle)
```
[PROJECT_MANAGER] Tạo Dự án -> Phân công [TEAM_LEADER] & [EMPLOYEE]
                                        │
                                        ▼
                  [TEAM_LEADER] Tạo Task & Gán cho [EMPLOYEE]
                                        │
                                        ▼
                  Trạng thái: [TODO]
                         │
                         ▼ (Employee bấm Bắt đầu)
                  Trạng thái: [IN_PROGRESS]
                         │
                         ▼ (Employee nộp kết quả)
                  Trạng thái: [DONE]
```

### B. Phiếu yêu cầu dịch vụ (Service Request Workflow)
- **Bước 1**: `EMPLOYEE` tạo Service Request (ví dụ: xin cấp laptop mới, yêu cầu sửa mạng). Trạng thái khởi tạo: `PENDING`.
- **Bước 2**: Hệ thống phát sự kiện `ServiceRequestCreatedEvent`, tự động gửi Notification đến `TEAM_LEADER` hoặc `ADMIN`.
- **Bước 3**: Người có thẩm quyền phê duyệt chuyển trạng thái sang `APPROVED` hoặc từ chối kèm lý do (`REJECTED`).
- **Bước 4**: Kỹ thuật viên xử lý chuyển sang `IN_PROGRESS` và kết thúc với `RESOLVED`.

### C. Quản lý Vòng đời Tài sản (Asset Lifecycle)
- Tài sản được khởi tạo bởi `ADMIN` ở trạng thái `AVAILABLE`.
- Khi có yêu cầu mượn được duyệt, tài sản chuyển sang `IN_USE` và gán cho người dùng cụ thể.
- Khi báo hỏng, tài sản chuyển sang `MAINTENANCE`. Sau khi sửa xong hoặc thanh lý, cập nhật về `AVAILABLE` hoặc `DISPOSED`.

## 10. Kiến trúc Ứng dụng Di động (Mobile Architecture)

Ứng dụng WorkSphere Mobile được xây dựng trên nền tảng **React Native 0.88.0** kết hợp **TypeScript**:

- **Tổ chức mã nguồn Feature-Driven**: Thư mục `mobile/src/features/` chia theo từng miền nghiệp vụ (`auth`, `projects`, `tasks`, `serviceRequests`, `assets`, `notifications`, `more`). Trong mỗi feature có:
  - `screens/`: Các màn hình giao diện người dùng.
  - `components/`: Các thành phần giao diện tái sử dụng.
  - `services/`: Lớp gọi API đặc thù của feature.
  - `types/`: Định nghĩa kiểu dữ liệu TypeScript.
- **Điều hướng phân tầng (Navigation Architecture)**:
  - `RootNavigator`: Điều phối cấp cao nhất.
  - Nếu chưa đăng nhập: Hiển thị `AuthNavigator` (`LoginScreen`, `ForgotPasswordScreen`).
  - Nếu đã đăng nhập: Hiển thị `AppNavigator` với cấu trúc `BottomTabNavigator` (Dashboard, Projects, Tasks, Requests, More) kết hợp các Stack Navigator chi tiết.
- **Quản lý trạng thái (State Management)**:
  - **Redux Toolkit**: Quản lý trạng thái giao diện toàn cục (thông tin người dùng hiện tại, trạng thái tải, cài đặt giao diện sáng/tối).
  - **Server State & Caching**: Quản lý thông qua các custom hooks bao bọc Axios calls với xử lý phân trang và caching.
- **Xử lý lỗi mạng & Tự động thử lại (Resilience)**:
  - Axios Interceptor tự động chèn header `X-Request-ID` vào mọi request.
  - Cơ chế tự động bắt mã 401 và làm mới phiên làm việc ngầm (Transparent Token Refresh).
  - Skeleton Loading và Pull-to-refresh trên toàn bộ danh sách dữ liệu.

## 11. Kiến trúc Backend Spring Boot (Backend Architecture)

Backend được xây dựng trên **Spring Boot 4.1.1** và **Java 21**:

- **Mô hình phân tầng Clean Architecture (Hexagonal-lite)**:
  - **Inbound Controllers (Web Adapter)**: Tiếp nhận HTTP REST request, kiểm tra định dạng DTO qua `@Valid`, trả về cấu trúc thống nhất `ApiResponse<T>`.
  - **Application Services (Use Cases)**: Hiện thực hóa logic nghiệp vụ, quản lý ranh giới giao dịch `@Transactional`, phát sự kiện domain.
  - **Outbound Repositories (Persistence Adapter)**: Kế thừa `JpaRepository` của Spring Data JPA, thực hiện truy vấn tối ưu hóa với Spring Data Specifications.
- **Xử lý biệt lệ toàn cục (Global Exception Handling)**:
  - Lớp `GlobalExceptionHandler` bắt toàn bộ các ngoại lệ (`ResourceNotFoundException`, `AccessDeniedException`, `ValidationException`).
  - Chuẩn hóa thông điệp lỗi dạng JSON, luôn đi kèm mã `correlationId` để dễ dàng tra cứu trong log hệ thống.
- **Cơ chế di trú cơ sở dữ liệu với Flyway**:
  - Toàn bộ schema cơ sở dữ liệu được phiên bản hóa qua 20 tệp di trú tuần tự từ `V001` đến `V020`.
  - Cam kết không can thiệp hoặc sửa đổi các tệp migration đã được thực thi.
- **Bảo mật Method-Level Security**:
  - Sử dụng `@PreAuthorize("hasRole('ADMIN')")` hoặc `@PreAuthorize("hasPermission(...)")` trên từng phương thức service và endpoint controller để kiểm soát quyền truy cập chặt chẽ.

## 12. Chiến lược kiểm thử & Đảm bảo chất lượng (Testing & QA)

Dự án áp dụng kim tự tháp kiểm thử nghiêm ngặt:

- **Backend Testing (351 tests)**:
  - **Unit Tests**: Kiểm thử các hàm tiện ích, domain logic độc lập không phụ thuộc ngữ cảnh Spring.
  - **Service Tests**: Sử dụng Mockito để cô lập tầng Repository và kiểm tra logic nghiệp vụ phức tạp.
  - **Web Slice Tests**: `@WebMvcTest` kiểm tra Controller, validation DTO, phân quyền bảo mật và định dạng JSON trả về.
  - **Integration Tests**: Kiểm thử tích hợp toàn diện với database Testcontainers PostgreSQL.
  - **Quy chuẩn mã sạch**: Checkstyle tuân thủ 100% quy chuẩn Google Java Style (`checkstyle.xml`), 0 vi phạm.
- **Mobile Testing (129 suites / 1,144 tests)**:
  - Unit tests cho reducers, selectors và helper functions.
  - Component tests sử dụng React Native Testing Library.
  - TypeScript strict typing (100% không có lỗi kiểu dữ liệu).
- **Android Debug Build**:
  - Gradle Wrapper 9.4.1 tự động biên dịch APK kiểm thử trong CI workflow.

## 13. Docker & CI/CD Pipeline

- **Dockerfile tối ưu hóa**:
  - Áp dụng kỹ thuật **Multi-stage Build**:
    - Tầng 1 (`builder`): Sử dụng image JDK 21 đầy đủ để biên dịch mã nguồn và đóng gói JAR bằng Maven Wrapper.
    - Tầng 2 (`runner`): Sử dụng image Eclipse Temurin 21 JRE Alpine siêu nhẹ, chỉ chứa file JAR đã biên dịch.
  - Bảo mật container: Ứng dụng chạy dưới người dùng không đặc quyền (`appuser`, UID 10001), không chạy bằng root.
- **Docker Compose Orchestration**:
  - Khởi tạo mạng nội bộ cô lập `worksphere-network`.
  - Cấu hình named volumes `worksphere-pgdata` và `worksphere-uploads` bảo đảm dữ liệu không bị mất khi container khởi động lại.
  - Healthcheck tự động giám sát trạng thái sẵn sàng của PostgreSQL trước khi khởi động Backend.
- **Đường ống GitHub Actions CI (5 jobs)**:
  1. `Validate Repository & Secret Audit`: Quét mã bí mật, kiểm tra định dạng tệp.
  2. `Backend Quality`: Biên dịch Java 21, kiểm tra Checkstyle, chạy toàn bộ 351 tests.
  3. `Mobile Quality`: Kiểm tra TypeScript, chạy ESLint, chạy 129 Jest test suites.
  4. `Android Debug Build`: Biên dịch Android Debug APK.
  5. `Docker Image Build`: Xác minh Dockerfile build thành công và quét bảo mật container.

## 14. Vận hành & Giám sát (Operability, Metrics & DR)

- **Định danh yêu cầu xuyên suốt (Request Correlation)**:
  - Mỗi request từ Mobile hoặc Client được gán một header `X-Request-ID` (UUID).
  - Tầng `RequestCorrelationFilter` trích xuất ID này và đưa vào **MDC (Mapped Diagnostic Context)** của SLF4J/Logback.
  - Mọi dòng log sinh ra trong quá trình xử lý request đều tự động mang theo Correlation ID này, giúp việc điều tra sự cố diễn ra tức thì.
- **Hardened Spring Boot Actuator**:
  - Chỉ mở 3 endpoints phục vụ giám sát: `/actuator/health` (sức khỏe tổng thể), `/actuator/info` (thông tin phiên bản), `/actuator/prometheus` (chỉ số đo lường).
  - Khóa hoàn toàn các endpoint nhạy cảm (`/actuator/env`, `/beans`, `/heapdump`, `/shutdown`).
- **Sao lưu & Phục hồi Thảm họa (Disaster Recovery)**:
  - Bộ kịch bản PowerShell (`scripts/backup-local.ps1`, `restore-local.ps1`):
    - Sao lưu cơ sở dữ liệu PostgreSQL ở định dạng nén nhị phân (`pg_dump -Fc`).
    - Nén thư mục tệp đính kèm uploads (`tar.gz`).
    - Tự động tính toán mã băm SHA-256 và tạo tệp manifest JSON kiểm tra tính toàn vẹn.
    - Quy trình diễn tập phục hồi đã được thực thi và xác nhận trên môi trường cô lập ở Stage 19D.

# PART III — HƯỚNG DẪN CHẠY DỰ ÁN (RUN GUIDE)

## 15. Yêu cầu hệ thống (System Prerequisites)

Để cài đặt và chạy hoàn chỉnh dự án WorkSphere trên máy phát triển, môi trường cần đáp ứng các thông số kỹ thuật đã được xác minh (`SOURCE_VERIFIED`):

- **Hệ điều hành**: Windows 10/11 64-bit, macOS hoặc Linux.
- **Git**: Phiên bản 2.30+ trở lên.
- **Docker Desktop & Docker Engine**: Khuyến nghị Docker Compose v2 trở lên (đã bật WSL2 trên Windows).
- **Java Development Kit (JDK)**: **Java 21** (Eclipse Temurin 21 hoặc OpenJDK 21). Đã cấu hình biến môi trường `JAVA_HOME`.
- **Node.js & npm**: **Node.js 24.19.0** (xác định tại `mobile/.node-version`) và npm 10+.
- **Android Development** (Cho việc chạy app Mobile Android):
  - Android Studio Iguana / Jellyfish trở lên.
  - Android SDK với `compileSdkVersion = 37`, `targetSdkVersion = 36`.
  - Android Virtual Device (AVD) chạy Android API 34 hoặc 35.
- **PowerShell**: PowerShell 5.1 hoặc PowerShell 7+.
- **Cổng mạng (Ports) khả dụng trên máy host**:
  - `8080`: Cổng mặc định của Backend API.
  - `5433`: Cổng host ánh xạ vào PostgreSQL trong Docker (`5432` bên trong container) để tránh đụng độ với service Postgres cục bộ.
  - `8081`: Cổng mặc định của Metro Bundler (React Native).
- **Khuyến nghị tài nguyên phần cứng (Hardware Recommendation)**:
  - RAM: Tối thiểu 16GB (để chạy đồng thời Docker Backend, Postgres và Android Emulator).
  - Ổ cứng: Tối thiểu 15GB dung lượng trống trên ổ đĩa làm việc.

## 16. Chuẩn bị repository & Kiểm tra nhánh

### Bước 1: Mở kho mã nguồn và kiểm tra nhánh
```powershell
cd D:\WorkSphere
git status --short
git branch --show-current
```
- Nhánh làm việc chính: `main`.
- Trạng thái mong đợi: Sạch sẽ (clean), ngoại trừ 4 thư mục học liệu tham khảo cục bộ có thể hiển thị `??`:
  - `Kỹ năng lập trình nâng cao/`
  - `phát triển ứng dụng di động/`
  - `Quản lý dự án CNTT/`
  - `Triển khai phần mềm/`

> [!WARNING]
> **QUY TẮC AN TOÀN HỌC LIỆU**: Bốn thư mục học liệu trên là tài liệu tham chiếu cục bộ (`LOCAL_ONLY_REFERENCE`), **tuyệt đối không được `git add`, không stage và không commit** vào Git repository.

## 17. Cấu hình môi trường (Environment Configuration `.env`)

Dự án cung cấp tệp mẫu chuẩn `.env.example`. Tạo tệp cấu hình thực tế:
```powershell
Copy-Item .env.example .env
```

### Bảng giải thích chi tiết các biến môi trường:

| Tên biến | Giá trị mẫu / Mặc định | Mục đích & Ý nghĩa |
|:---|:---|:---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Profile hoạt động của Spring Boot (`dev`, `test`, `prod`). |
| `SERVER_PORT` | `8080` | Cổng HTTP mà server lắng nghe bên trong container. |
| `BACKEND_PORT` | `8080` | Cổng trên máy host chuyển tiếp vào cổng Backend. |
| `POSTGRES_HOST_PORT` | `5433` | Cổng trên máy host chuyển tiếp vào PostgreSQL container (`5432`). |
| `POSTGRES_DB` | `worksphere` | Tên cơ sở dữ liệu PostgreSQL. |
| `POSTGRES_USER` | `worksphere_user` | Tên người dùng quản trị cơ sở dữ liệu. |
| `POSTGRES_PASSWORD` | *(Mật khẩu dev an toàn)* | Mật khẩu truy cập PostgreSQL (phải thay thế nếu deploy môi trường bảo mật). |
| `DB_HOST` | `localhost` | Địa chỉ máy chủ DB cho các công cụ chạy từ host kết nối vào. |
| `DB_PORT` | `5433` | Cổng DB cho các công cụ host kết nối vào. |
| `JWT_SECRET_KEY` | *(Chuỗi 32+ ký tự)* | Khóa bí mật dùng để ký và giải mã mã HMAC-SHA256 JWT Token. |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `900` | Thời hạn sống của Access Token (900 giây = 15 phút). |
| `JWT_REFRESH_TOKEN_EXPIRATION`| `2592000` | Thời hạn sống của Refresh Token (2592000 giây = 30 ngày). |
| `WORKSPHERE_STORAGE_PATH` | `/app/uploads` | Thư mục lưu trữ tệp đính kèm bên trong Backend container. |
| `MOBILE_API_BASE_URL` | `http://10.0.2.2:8080/api/v1` | URL gốc API dành cho Android Emulator kết nối vào máy host. |

> [!IMPORTANT]
> **BẢO MẬT TUYỆT ĐỐI**: Tệp `.env` đã được cấu hình trong `.gitignore`. Không bao giờ đưa tệp `.env` chứa mật khẩu hoặc khóa bí mật thật vào Git.

## 18. Chế độ chạy A — Docker Compose (Khuyến nghị chuẩn)

Chế độ chạy toàn diện, đóng gói cô lập, tương thích 100% với môi trường chuẩn:

```powershell
# 1. Xác thực cú pháp cấu hình Compose (RUNTIME_VERIFIED)
docker compose config

# 2. Khởi động PostgreSQL và Backend ngầm kèm build tự động
docker compose up -d --build

# 3. Theo dõi trạng thái tiến trình và healthcheck
docker compose ps

# 4. Xem luồng log theo thời gian thực của Backend
docker compose logs -f backend
```

- **Kiểm tra sức khỏe hệ thống**:
  Truy cập: `http://localhost:8080/actuator/health` -> Nhận JSON `{"status":"UP"}`.
- **Dừng hệ thống an toàn**:
  ```powershell
  docker compose down
  ```
  *(Dữ liệu cơ sở dữ liệu và tệp upload được bảo toàn nguyên vẹn trong Docker named volumes).*

## 19. Chế độ chạy B — Backend Host + PostgreSQL Docker

Dành cho lập trình viên Backend cần debug mã Java từng dòng trên IDE (IntelliJ IDEA / Eclipse / VS Code):

### Bước 1: Khởi động duy nhất PostgreSQL trong Docker
```powershell
docker compose up -d postgres
```
*Đợi khoảng 5 giây để PostgreSQL khởi động và hoàn tất nạp schema.*

### Bước 2: Chạy Backend trực tiếp trên máy host với Maven Wrapper
Mở Terminal tại thư mục `backend/`:
```powershell
cd D:\WorkSphereackend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```
*(Trên Linux/macOS, sử dụng `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`).*

- Backend sẽ tự động kết nối vào PostgreSQL tại `127.0.0.1:5433`, kích hoạt Flyway chạy 17 migration (V001–V017) và lắng nghe tại `http://localhost:8080`.
- **Dừng Backend**: Bấm `Ctrl + C` trên terminal.
- **Dừng Postgres Docker**: `docker compose stop postgres`.

## 20. Chế độ chạy C — Ứng dụng Di động Android

### Bước 1: Cài đặt thư viện dependencies
Mở Terminal tại thư mục `mobile/`:
```powershell
cd D:\WorkSphere\mobile
npm ci
```

### Bước 2: Cấu hình địa chỉ mạng (Networking Context)
- **Trên Android Emulator**: Mặc định Android Emulator coi máy tính Windows host là IP ảo `10.0.2.2`. Kiểm tra tệp `.env` hoặc cấu hình API Client đảm bảo `MOBILE_API_BASE_URL` trỏ tới:
  `http://10.0.2.2:8080/api/v1`
- **Trên thiết bị thật (Physical Device - Guidance Only)**: Thiết bị Android và máy tính host phải kết nối chung một mạng Wi-Fi. Thay thế `10.0.2.2` bằng địa chỉ IPv4 LAN của máy host (ví dụ: `http://192.168.1.15:8080/api/v1`), đồng thời mở cổng firewall 8080.

### Bước 3: Khởi động Metro Bundler
```powershell
npm start
```
*(Giữ cửa sổ terminal này chạy để Metro biên dịch JavaScript bundle).*

### Bước 4: Khởi động Android Emulator & Chạy ứng dụng
Mở thêm một cửa sổ Terminal mới tại `mobile/`:
```powershell
npm run android
```
- Lệnh này sẽ kết nối với emulator đang chạy (`emulator-5554`), build gói debug APK và tự động cài đặt, mở ứng dụng WorkSphere.

## 21. Thực thi kiểm thử (Running Tests)

### Kiểm thử Backend (Maven):
```powershell
cd D:\WorkSphereackend

# 1. Kiểm tra quy chuẩn mã nguồn Checkstyle (RUNTIME_VERIFIED: 0 violations)
.\mvnw.cmd checkstyle:check

# 2. Chạy toàn bộ 351 Backend Tests (RUNTIME_VERIFIED: 351 passed)
.\mvnw.cmd test

# 3. Đóng gói ứng dụng bỏ qua test (khi cần build nhanh JAR)
.\mvnw.cmd clean package -DskipTests
```

### Kiểm thử Mobile (Jest, TypeScript, Lint):
```powershell
cd D:\WorkSphere\mobile

# 1. Kiểm tra kiểu dữ liệu TypeScript (RUNTIME_VERIFIED: 0 errors)
npm run typecheck

# 2. Quét lỗi cú pháp mã nguồn với ESLint (RUNTIME_VERIFIED: clean)
npm run lint

# 3. Chạy toàn bộ 129 test suites / 1,144 tests với Jest (RUNTIME_VERIFIED: 1,144 passed)
npm test -- --watchAll=false
```

### Biên dịch Android Debug APK cục bộ:
```powershell
cd D:\WorkSphere\mobilendroid
.\gradlew.bat assembleDebug
```
*Tệp APK thành phẩm sẽ xuất hiện tại `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.*

## 22. Kiểm tra Health & Giám sát Actuator/Prometheus

Hệ thống cung cấp các endpoint giám sát chuẩn mực OpenMetrics đã qua tinh giản bảo mật (Hardened):

| Endpoint | Giao thức & URL | Mục đích kiểm tra | Kết quả mong đợi |
|:---|:---|:---|:---|
| **Health Check** | `GET http://localhost:8080/actuator/health` | Kiểm tra trạng thái ứng dụng & database | `{"status":"UP"}` |
| **Liveness Probe** | `GET http://localhost:8080/actuator/health/liveness` | Kiểm tra container có đang sống không | `{"status":"UP"}` |
| **Readiness Probe** | `GET http://localhost:8080/actuator/health/readiness` | Kiểm tra app đã sẵn sàng nhận traffic chưa | `{"status":"UP"}` |
| **App Info** | `GET http://localhost:8080/actuator/info` | Thông tin phiên bản & build metadata | JSON thông tin phiên bản |
| **Prometheus Metrics**| `GET http://localhost:8080/actuator/prometheus` | Xuất dữ liệu đo lường hiệu năng JVM/HTTP | Dữ liệu dạng text OpenMetrics |

> [!WARNING]
> **BẢO MẬT ACTUATOR**: Các endpoint nhạy cảm như `/actuator/env`, `/beans`, `/configprops`, `/heapdump` và `/shutdown` đã bị khóa hoàn toàn. Không mở công khai ra Internet các cổng giám sát này.

## 23. Kiểm tra Logs & Mã định danh yêu cầu (X-Request-ID)

- **Cơ chế hoạt động**:
  - Khi một request được gửi đi từ Mobile hoặc cURL, header `X-Request-ID: <UUID>` được gắn kèm.
  - Backend ghi nhận ID này vào MDC. Toàn bộ log phát sinh trong cùng một vòng đời request đều chứa chuỗi định danh duy nhất này.
- **Xem logs trong Docker**:
  ```powershell
  docker compose logs -f --tail=100 backend
  ```
- **Ví dụ một dòng log chuẩn**:
  ```text
  2026-10-28 10:15:32.124 [http-nio-8080-exec-3] INFO  c.w.s.s.RequestCorrelationFilter [requestId=c4a8f921-8b20-4a88-91cd-939e93b1e770] - Inbound request POST /api/v1/auth/login from 127.0.0.1
  ```
- **Chính sách dữ liệu nhạy cảm**: Tuyệt đối không in mật khẩu, refresh token, hoặc số thẻ vào log. Mọi trường nhạy cảm đều được mặt nạ hóa (Masked) tự động.

## 24. Thực thi Sao lưu, Xác minh, Phục hồi và Rollback

Dự án cung cấp bộ công cụ PowerShell tự động hóa cao tại thư mục `scripts/`:

### A. Sao lưu cục bộ (Local Backup)
```powershell
# Chạy sao lưu tự động PostgreSQL và Uploads (RUNTIME_VERIFIED)
powershell -ExecutionPolicy Bypass -File scriptsackup-local.ps1
```
*Tệp sao lưu `.dump` và `.tar.gz` kèm file manifest JSON và mã băm SHA-256 sẽ được tạo an toàn trong thư mục `backups/`.*

### B. Xác minh tệp sao lưu (Verify Backup)
```powershell
powershell -ExecutionPolicy Bypass -File scriptserify-backup.ps1 -BackupDir backups\<tên_thư_mục_backup>
```
*Kiểm tra tính toàn vẹn của mã băm SHA-256 đối chiếu với manifest.*

### C. Phục hồi dữ liệu diễn tập (Rehearsal Restore)
```powershell
# Phục hồi thử nghiệm trên môi trường cô lập, không ảnh hưởng dữ liệu chính
powershell -ExecutionPolicy Bypass -File scripts
estore-local.ps1 -BackupDir backups\<tên_thư_mục_backup> -TargetEnv isolated
```

### D. Rollback phiên bản ứng dụng (Rollback Operations)
```powershell
# Rollback về phiên bản image tag trước đó đã được kiểm định an toàn
powershell -ExecutionPolicy Bypass -File scripts
ollback-local.ps1 -TargetTag <image_tag_trước>
```

## 25. Dừng hệ thống & Dọn dẹp an toàn (Stop & Cleanup)

1. **Dừng Metro Bundler**: Nhấn `Ctrl + C` trên cửa sổ chạy `npm start`.
2. **Dừng Backend**: Nhấn `Ctrl + C` trên cửa sổ chạy `mvnw`.
3. **Dừng Docker Compose**:
   ```powershell
   docker compose down
   ```
4. **Kiểm tra giải phóng cổng mạng**:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080,5433 -ErrorAction SilentlyContinue
   ```
   *(Không còn tiến trình nào chiếm dụng cổng).*
5. **Dọn dẹp môi trường dev (Reset Local - CÓ CẢNH BÁO)**:
   Nếu thực sự muốn đưa môi trường về trạng thái trắng tinh khôi ban đầu (kèm xóa volumes):
   ```powershell
   # CHỈ DÙNG KHI CẦN RESET TOÀN BỘ DỮ LIỆU DEV
   powershell -ExecutionPolicy Bypass -File scripts\docker-reset-local.ps1
   ```

# PART IV — DEMO, XỬ LÝ SỰ CỐ & THAM KHẢO (DEMO, TROUBLESHOOTING & REFERENCE)

## 26. Chuẩn bị kịch bản Demo (Pre-demo Checklist)

Trước khi bắt đầu buổi bảo vệ hoặc trình chiếu thử nghiệm cho giảng viên, hãy thực hiện danh mục kiểm tra sau:

- [ ] **Môi trường Backend**: Đã chạy `docker compose up -d` và nhận `{"status":"UP"}` từ `http://localhost:8080/actuator/health`.
- [ ] **Môi trường Mobile**: Android Emulator đã mở sẵn, Metro bundler đang chạy, ứng dụng WorkSphere đã nạp xong JavaScript bundle.
- [ ] **Cơ sở dữ liệu mẫu**: 17 migrations của Flyway (V001–V017) đã chạy xong; dữ liệu mẫu về các phòng ban, người dùng và quyền hạn đã được nạp sẵn.
- [ ] **Tài khoản kiểm thử mẫu (Placeholder accounts)**:
  - Tài khoản Quản trị: `admin` (Role: `ADMIN`)
  - Tài khoản Quản lý dự án: `pm_user` (Role: `PROJECT_MANAGER`)
  - Tài khoản Trưởng nhóm: `lead_user` (Role: `TEAM_LEADER`)
  - Tài khoản Nhân viên: `emp_user` (Role: `EMPLOYEE`)
  *(Lưu ý: Sử dụng mật khẩu dev chuẩn đã được thiết lập an toàn trong seed data; không công khai mật khẩu môi trường thật).*
- [ ] **Phương án dự phòng (Fallback Evidence)**: Chuẩn bị sẵn các video quay màn hình ngắn hoặc ảnh chụp chứng minh tại `reports/` phòng trường hợp máy tính demo bị gián đoạn mạng hoặc hết RAM.

## 27. Luồng Demo khuyến nghị (Suggested Demo Flow)

### Luồng chuẩn (Recommended 10-15 phút):
1. **Đăng nhập phân quyền (RBAC Login)**:
   - Đăng nhập bằng tài khoản `EMPLOYEE` (`emp_user`). Cho hội đồng xem giao diện Dashboard được tối ưu riêng: chỉ thấy task của mình và nút tạo Service Request.
   - Đăng xuất và đăng nhập lại bằng `PROJECT_MANAGER` (`pm_user`): Giao diện mở thêm chức năng tạo dự án mới và tổng quan tiến độ các team.
2. **Quy trình Quản lý Dự án & Task**:
   - Quản lý tạo Dự án mới: "Triển khai hệ thống mạng nội bộ".
   - Trưởng nhóm tạo Task: "Cấu hình Router tầng 2" và phân công cho `emp_user`.
   - Nhân viên mở app, nhận thông báo, bấm chuyển trạng thái từ `TODO` sang `IN_PROGRESS`, đính kèm ảnh và chuyển sang `DONE`.
3. **Quy trình Phiếu yêu cầu & Mượn tài sản**:
   - Nhân viên tạo phiếu yêu cầu: "Mượn máy đo tín hiệu mạng cáp quang".
   - Quản lý duyệt phiếu yêu cầu trên hệ thống.
   - Tài sản tự động cập nhật trạng thái từ `AVAILABLE` sang `IN_USE`.
4. **Minh chứng Vận hành & Giám sát**:
   - Mở terminal chỉ ra Correlation ID trong log: `X-Request-ID`.
   - Mở trình duyệt xem chỉ số Prometheus tại `http://localhost:8080/actuator/prometheus`.

### Các tính năng nằm ngoài phạm vi demo hiện tại (Unsupported / Out-of-Scope):
- Tự đăng ký tài khoản (Self-registration): Hệ thống là phần mềm doanh nghiệp khép kín, tài khoản do Admin cấp.
- Quản lý phiên đa thiết bị đồng thời (Multi-device concurrent session management).
- Đẩy thông báo Push Firebase (Push Notification): Hiện tại sử dụng In-app Polling Notification.
- Hoạt động ngoại tuyến không mạng (Offline-first / Local Cache Database).

## 28. Bảng tra cứu & Xử lý sự cố (Troubleshooting Matrix)

| Hiện tượng lỗi (Symptom) | Nguyên nhân khả dĩ (Likely Cause) | Bước kiểm tra (Check) | Biện pháp xử lý an toàn (Safe Fix) |
|:---|:---|:---|:---|
| **Lệnh `docker` không nhận diện** | Chưa cài đặt Docker hoặc chưa thêm Docker vào PATH. | Chạy `docker --version`. | Cài đặt Docker Desktop và khởi động lại terminal. |
| **Docker Engine stopped** | Docker Desktop chưa được bật hoặc crash dịch vụ WSL2. | Biểu tượng Docker ở taskbar màu đỏ/cam. | Bật lại Docker Desktop và đợi icon chuyển sang màu xanh. |
| **Cổng 8080 hoặc 5433 bị chiếm** | Có tiến trình khác hoặc service Postgres/Tomcat cũ đang chạy. | `Get-NetTCPConnection -LocalPort 8080,5433`. | Tắt tiến trình chiếm cổng hoặc đổi cổng trong `.env` (`BACKEND_PORT=8081`). |
| **Lỗi mật khẩu Postgres khi khởi động** | Thư mục volume `worksphere-pgdata` cũ chứa mật khẩu khác với `.env`. | Log của container `postgres` báo `password authentication failed`. | Dùng lại mật khẩu cũ trong `.env` hoặc chạy `scripts/docker-reset-local.ps1` để làm mới volume dev. |
| **Backend báo unhealthy** | Kết nối DB thất bại hoặc Flyway migration bị kẹt. | `docker compose logs backend`. | Kiểm tra trạng thái Postgres đã healthy chưa, kiểm tra log lỗi Flyway. |
| **Android app không gọi được API** | Dùng nhầm `localhost` thay vì `10.0.2.2` trên Android Emulator. | Kiểm tra biến `MOBILE_API_BASE_URL` trong cấu hình mobile. | Đổi lại thành `http://10.0.2.2:8080/api/v1`. |
| **Metro Bundler bị cache lỗi** | Bộ nhớ cache JavaScript bundle của React Native bị xung đột. | Lỗi cú pháp đỏ màn hình dù mã nguồn đúng. | Chạy `npm start -- --reset-cache`. |
| **Lỗi Java/Gradle incompatibility** | Sử dụng phiên bản Java không phải Java 21 để chạy Gradle. | `java -version` hiển thị Java 17 hoặc Java 8. | Cài đặt và trỏ `JAVA_HOME` về JDK 21. |
| **Lỗi `npm ci` thất bại** | Thư mục `node_modules` hoặc package-lock bị sửa đổi. | Kiểm tra `git status mobile/package-lock.json`. | Chạy `git checkout mobile/package-lock.json` rồi chạy lại `npm ci`. |
| **Lỗi xác thực Keychain trên Android** | Thiết bị emulator thiếu dịch vụ lưu trữ an toàn hoặc bị crash. | Logcat báo lỗi `react-native-keychain`. | Xóa app trên emulator và chạy lại `npm run android`. |
| **Xác minh Backup thất bại** | Tệp `.dump` bị sửa đổi hoặc thiếu tệp manifest JSON. | Kiểm tra mã SHA-256 đối chiếu với manifest. | Chạy lại lệnh sao lưu mới `scripts/backup-local.ps1`. |

## 29. Giới hạn đã biết của dự án (Known Limitations)

Để duy trì tính minh bạch về mặt kỹ thuật, nhóm ghi nhận rõ các giới hạn hiện tại:
1. **Môi trường triển khai**: Mới sẵn sàng vận hành cục bộ (`LOCAL_OPERABILITY_READY = TRUE`). Chưa triển khai trên môi trường Staging đám mây hay Production thực tế.
2. **Nghiệm thu người dùng (UAT)**: Kế hoạch và kịch bản UAT đã được phê duyệt và đóng băng (Decision D-069) nhưng chưa triển khai đợt đánh giá thực tế với người dùng bên ngoài.
3. **Phát hành ứng dụng**: Chưa ký chứng chỉ phát hành chính thức (Release Keystore) và chưa đưa lên Google Play Store hay Apple App Store (mới dừng ở bản Android Debug APK nội bộ).
4. **Giám sát**: Prometheus metrics hiện chỉ mở nội bộ trong mạng host để phục vụ diễn tập vận hành; chưa tích hợp cụm Grafana Dashboard trên máy chủ tập trung.
5. **Sao lưu**: Kịch bản sao lưu lưu trữ trên ổ đĩa cục bộ, chưa đồng bộ hóa lên kho lưu trữ đám mây ngoài (như AWS S3 hoặc Google Cloud Storage).

## 30. Từ điển thuật ngữ kỹ thuật (Learning Glossary)

- **API (Application Programming Interface)**: Giao diện lập trình ứng dụng, định nghĩa các quy tắc để hai phần mềm trao đổi dữ liệu với nhau.
- **REST (Representational State Transfer)**: Kiểu kiến trúc dịch vụ web sử dụng các phương thức HTTP chuẩn (`GET`, `POST`, `PUT`, `DELETE`) để thao tác tài nguyên qua định dạng JSON.
- **JWT (JSON Web Token)**: Chuỗi mã hóa nhỏ gọn, an toàn dùng để xác thực và truyền tải thông tin định danh giữa client và server mà không cần lưu session phía server.
- **RBAC (Role-Based Access Control)**: Mô hình kiểm soát truy cập phân quyền dựa trên chức vụ/vai trò của người dùng trong tổ chức.
- **IoC & Dependency Injection (DI)**: Nguyên lý lập trình đảo ngược quyền điều khiển; framework (Spring) tự động khởi tạo và inject (tiêm) các thành phần phụ thuộc vào nhau thay vì khởi tạo thủ công bằng từ khóa `new`.
- **ORM & JPA (Object-Relational Mapping & Jakarta Persistence API)**: Kỹ thuật ánh xạ các bảng và dòng trong cơ sở dữ liệu quan hệ thành các đối tượng (Entities) trong ngôn ngữ lập trình hướng đối tượng Java.
- **Flyway**: Công cụ kiểm soát và nâng cấp phiên bản cơ sở dữ liệu theo thời gian thông qua các script SQL được đánh số thứ tự tuần tự.
- **React Native**: Framework mã nguồn mở của Meta cho phép lập trình ứng dụng di động đa nền tảng (Android và iOS) bằng ngôn ngữ JavaScript/TypeScript với trải nghiệm native.
- **Axios Interceptor**: Hàm trung gian tự động can thiệp vào trước khi request được gửi đi (để thêm header token) hoặc sau khi nhận response về (để bắt mã lỗi 401 làm mới token).
- **Docker Image & Container**: Image là bản thiết kế đóng gói tĩnh của ứng dụng; Container là một thực thể sống đang chạy của Image đó trong một môi trường ảo hóa cô lập.
- **CI/CD (Continuous Integration & Continuous Delivery)**: Phương pháp tự động hóa việc kiểm thử mã nguồn, quét lỗi và đóng gói sản phẩm liên tục mỗi khi có thay đổi trong Git.
- **RPO (Recovery Point Objective)**: Mục tiêu điểm phục hồi; khoảng thời gian mất mát dữ liệu tối đa mà hệ thống có thể chấp nhận khi xảy ra sự cố (WorkSphere hướng tới < 24 giờ).
- **RTO (Recovery Time Objective)**: Mục tiêu thời gian phục hồi; tổng thời gian tối đa để khôi phục hệ thống hoạt động trở lại sau thảm họa (WorkSphere đạt < 30 phút trong diễn tập).

## 31. Bảng lệnh tra cứu nhanh (Command Cheat Sheet)

```powershell
# ==============================================================================
# 1. NHÓM LỆNH GIT
# ==============================================================================
git status --short                        # Kiểm tra trạng thái mã nguồn ngắn gọn
git branch --show-current                 # Xem nhánh đang làm việc
git log --oneline -5                      # Xem 5 commit gần nhất

# ==============================================================================
# 2. NHÓM LỆNH DOCKER COMPOSE
# ==============================================================================
docker compose up -d --build             # Khởi động toàn bộ Postgres + Backend
docker compose ps                        # Kiểm tra trạng thái các container
docker compose logs -f backend           # Theo dõi luồng log của Backend
docker compose down                      # Dừng an toàn (BẢO TOÀN DỮ LIỆU)

# ==============================================================================
# 3. NHÓM LỆNH BACKEND (Spring Boot)
# ==============================================================================
cd backend
.\mvnw.cmd checkstyle:check              # Kiểm tra quy chuẩn Checkstyle (0 lỗi)
.\mvnw.cmd test                          # Chạy toàn bộ 351 Backend Tests
.\mvnw.cmd spring-boot:run               # Chạy Backend trực tiếp trên máy host

# ==============================================================================
# 4. NHÓM LỆNH MOBILE (React Native)
# ==============================================================================
cd mobile
npm ci                                   # Cài đặt chính xác thư viện dependencies
npm run typecheck                        # Kiểm tra kiểu TypeScript (0 lỗi)
npm run lint                             # Kiểm tra chuẩn code ESLint
npm test -- --watchAll=false             # Chạy toàn bộ 129 test suites Jest
npm start                                # Khởi động Metro Bundler
npm run android                          # Cài đặt và khởi chạy app trên Android Emulator

# ==============================================================================
# 5. NHÓM LỆNH VẬN HÀNH & GIÁM SÁT
# ==============================================================================
curl http://localhost:8080/actuator/health        # Kiểm tra sức khỏe hệ thống
curl http://localhost:8080/actuator/prometheus    # Xem dữ liệu đo lường Prometheus
powershell -File scriptsackup-local.ps1        # Chạy sao lưu tự động
powershell -File scripts\docker-status.ps1        # Kiểm tra chi tiết trạng thái container
```

## 32. Danh mục nguồn chân lý (Source-of-Truth Index)

Mọi nội dung trong bản hướng dẫn này đều được ánh xạ trực tiếp và kiểm chứng từ các tệp tài liệu và mã nguồn chuẩn tắc của dự án WorkSphere:

1. **Phạm vi & Yêu cầu nghiệp vụ**: `docs/01_PROJECT_SCOPE.md`, `docs/02_USER_ROLES_AND_WORKFLOWS.md`.
2. **Kiến trúc hệ thống & Màn hình**: `docs/04_SYSTEM_ARCHITECTURE.md`, `docs/03_MOBILE_SCREEN_MAP.md`.
3. **Cấu hình Container & Hạ tầng**: `compose.yaml`, `backend/Dockerfile`, `.env.example`.
4. **Mã nguồn Backend & Quản lý Schema**: `backend/pom.xml`, `backend/src/main/resources/db/migration/V001__...` đến `V020__...`.
5. **Mã nguồn Mobile & Gói thư viện**: `mobile/package.json`, `mobile/.node-version`, `mobile/src/shared/api/apiClient.ts`.
6. **Đường ống Tự động hóa CI/CD**: `.github/workflows/ci.yml`.
7. **Sổ tay Vận hành Chuyên sâu**: Thư mục `reports/runbooks/` (`DOCKER_LOCAL_OPERATIONS.md`, `LOGGING_AND_CORRELATION_POLICY.md`, `METRICS_AND_MONITORING_POLICY.md`, `BACKUP_OPERATIONS.md`, `RESTORE_OPERATIONS.md`, `ROLLBACK_OPERATIONS.md`).
8. **Tài liệu Hỗ trợ Học liệu 4 Môn**: `reports/STAGE_20_COURSE_CODE_EVIDENCE_MAP.md` và `reports/STAGE_20_TEAM_STUDY_AND_DEFENSE_GUIDE.md`.

---
*Bản hướng dẫn này là tài liệu chuẩn tắc thống nhất dành cho việc nghiên cứu, vận hành và bảo vệ đồ án dự án WorkSphere.*
