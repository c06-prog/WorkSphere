# WorkSphere Stage 20 — Cẩm Nang Ôn Tập & Chiến Lược Bảo Vệ 4 Môn Cho Nhóm

**Trạng thái đề xuất phân công:** PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL
**Giai đoạn lộ trình:** Stage 20A — Course-to-Code Evidence Map & Team Study Guide
**Mục đích:** Tài liệu hướng dẫn tự học, nắm vững kiến trúc, đối thoại phản biện và bảo vệ dự án WorkSphere dành cho cả 6 thành viên trong nhóm đối với 4 môn học chuyên ngành.

---

## MỤC LỤC
1. [PHẦN I: TÓM TẮT DỰ ÁN DÀNH CHO BẢO VỆ (QUICK START)](#phần-i-tóm-tắt-dự-án-dành-cho-bảo-vệ-quick-start)
   - [Thang đo 5 phút (Elevator Pitch)](#1-thang-đo-5-phút-elevator-pitch)
   - [Thang đo 15 phút (Deep-Dive Overview)](#2-thang-đo-15-phút-deep-dive-overview)
2. [PHẦN II: LỘ TRÌNH TỰ HỌC 14 BƯỚC CHO THÀNH VIÊN (LEARNING PATH)](#phần-ii-lộ-trình-tự-học-14-bước-cho-thành-viên-learning-path)
   - [Bảng tuần tự 14 bước](#1-bảng-tuần-tự-14-bước)
   - [Từ điển thuật ngữ cốt lõi (Terminology Dictionary)](#2-từ-điển-thuật-ngữ-cốt-lõi-terminology-dictionary)
3. [PHẦN III: CẨM NANG ÔN TẬP THEO 4 MÔN HỌC (PER-COURSE STUDY GUIDE)](#phần-iii-cẩm-nang-ôn-tập-theo-4-môn-học-per-course-study-guide)
   - [Môn 1: Kỹ Năng Lập Trình Nâng Cao](#1-môn-1-kỹ-năng-lập-trình-nâng-cao)
   - [Môn 2: Phát Triển Ứng Dụng Di Động](#2-môn-2-phát-triển-ứng-dụng-di-động)
   - [Môn 3: Quản Lý Dự Án CNTT](#3-môn-3-quản-lý-dự-án-cntt)
   - [Môn 4: Triển Khai Phần Mềm](#4-môn-4-triển-khai-phần-mềm)
4. [PHẦN IV: CẨM NANG CÁ NHÂN HÓA CHO TỪNG THÀNH VIÊN (PER-MEMBER GUIDE)](#phần-iv-cẩm-nang-cá-nhân-hóa-cho-từng-thành-viên-per-member-guide)
   - [Nguyễn Minh Hiếu (Team Leader)](#1-nguyễn-minh-hiếu--nhóm-trưởng)
   - [Nguyễn Văn Cường (Backend & Database Engineer)](#2-nguyễn-văn-cường--backend--database-engineer)
   - [Hoàng Bảo Long (Mobile Lead Developer)](#3-hoàng-bảo-long--mobile-lead-developer)
   - [Vũ Thị Thu Hướng (QA / QC & Verification Engineer)](#4-vũ-thị-thu-hướng--qa--qc--verification-engineer)
   - [Nguyễn Đức Khiêm (DevOps & Deployment Engineer)](#5-nguyễn-đức-khiêm--devops--deployment-engineer)
   - [Lê Anh Tú (Product Manager & Business Analyst)](#6-lê-anh-tú--product-manager--business-analyst)
5. [PHẦN V: CHIẾN LƯỢC DIỄN TẬP VÀ PHẢN BIỆN NHÓM (TEAM REHEARSAL & DEFENSE)](#phần-v-chiến-lược-diễn-tập-và-phản-biện-nhóm-team-rehearsal--defense)
   - [Kịch bản diễn tập nhóm 3 vòng](#1-kịch-bản-diễn-tập-nhóm-3-vòng)
   - [Ma trận phân vai trả lời câu hỏi](#2-ma-trận-phân-vai-trả-lời-câu-hỏi)
   - [Xử lý tình huống khó hoặc câu hỏi ngoài phạm vi](#3-xử-lý-tình-huống-khó-hoặc-câu-hỏi-ngoài-phạm-vi)

# PHẦN I: TÓM TẮT DỰ ÁN DÀNH CHO BẢO VỆ (QUICK START)

## 1. Thang đo 5 phút (Elevator Pitch)

- **Vấn đề giải quyết**: Trong các doanh nghiệp hiện đại, việc quản lý công việc, dự án, tài sản và hỗ trợ nội bộ thường bị phân mảnh qua nhiều kênh (chat, email, bảng tính). Điều này dẫn tới mất dấu vết trách nhiệm, thất thoát tài sản, và thiếu dữ liệu đo lường hiệu suất.
- **Giải pháp WorkSphere**: Hệ sinh thái quản lý vận hành số tích hợp toàn diện gồm:
  1. **Backend Modular Monolith**: Nền tảng Spring Boot 4.1.1 (Java 21) phân tách module nghiêm ngặt qua Maven multi-module (identity, project, 	ask, service-request, sset,
otification, shared).
  2. **Mobile App Đa Nền Tảng**: React Native 0.88 (React 19, TypeScript) hỗ trợ Android và iOS với giao diện hiện đại, xác thực hai lớp an toàn, quản lý trạng thái đồng bộ và trải nghiệm mượt mà.
  3. **DevOps & CI/CD Tự Động Hóa Toàn Diện**: Docker Compose, GitHub Actions 5 luồng song song, Checkstyle, Flyway Database Migrations (20 migrations), sao lưu và phục hồi dữ liệu tự động.
- **Quy mô và chỉ số kỹ thuật**:
  - **4 Role chuẩn doanh nghiệp**: EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN.
  - **6 Module nghiệp vụ lõi**: Identity & IAM, Project Management, Task Management, Service Request, Asset Lifecycle, Notification.
  - **Chất lượng kiểm thử vượt trội**: 351 unit/integration tests trên Backend, 100% test coverage trên các luồng nghiệp vụ trọng yếu, 0 Checkstyle violation, 0 TypeScript error, lint clean.

## 2. Thang đo 15 phút (Deep-Dive Overview)

- **Kiến trúc hệ thống (System Architecture)**:
  - Áp dụng mô hình **Modular Monolith** kết hợp **Domain-Driven Design (DDD)** và **Clean Architecture (Hexagonal-lite)**.
  - Phân tách rõ ràng giữa Domain Models, Application Services, Inbound Adapters (REST Controllers), và Outbound Adapters (Spring Data JPA Repositories).
  - Giao tiếp giữa các module được bảo vệ bằng boundary rules, hạn chế tối đa circular dependency.
- **Cơ sở dữ liệu & Quản lý Schema (Database & Flyway)**:
  - PostgreSQL 15 phân tầng quan hệ rõ ràng với khóa ngoại toàn vẹn, index hiệu năng cao trên các trường truy vấn chính (created_at, ssignee_id, status).
  - Toàn bộ thay đổi cơ sở dữ liệu được phiên bản hóa qua 20 tệp Flyway migration (V001 đến V020), cam kết không sửa đổi migration đã chạy và hỗ trợ audit trail toàn diện.
- **Bảo mật & Quản lý danh tính (Security & IAM)**:
  - Cơ chế Stateless Authentication bằng JWT: Token ngắn hạn (15 phút) lưu hoàn toàn trong bộ nhớ (IN_MEMORY), Refresh Token dài hạn (7 ngày) lưu trong phân vùng bảo mật phần cứng (SECURE_STORAGE qua Keychain/Keystore).
  - RBAC (Role-Based Access Control) chặt chẽ bằng Spring Security Method Security (@PreAuthorize) kết hợp bảng phân quyền cơ sở dữ liệu (
oles_permissions).
- **Trải nghiệm di động (Mobile Architecture)**:
  - Tổ chức code theo Feature-driven (mobile/src/features/*), tách biệt rõ rỗi giữa UI Screens, State Hooks, API Service, và Data Types.
  - Sử dụng Redux Toolkit cho Global Client State và React Query (Axios interceptor) cho Server State, tự động inject correlation ID và refresh token khi phiên hết hạn.
- **Vận hành & Giám sát (Operability & Monitoring)**:
  - Spring Boot Actuator kết hợp Micrometer Prometheus cung cấp metrics chuẩn OpenMetrics (/actuator/prometheus).
  - Structured Logging với Correlation ID (X-Correlation-Id) xuyên suốt từ Mobile -> Gateway -> Backend -> Logs.
  - Bộ công cụ Backup & Restore tự động hóa cao: pg_dump nén tar, SHA-256 checksum, manifest JSON, và kịch bản diễn tập phục hồi cô lập (Stage 19D rehearsal).

# PHẦN II: LỘ TRÌNH TỰ HỌC 14 BƯỚC CHO THÀNH VIÊN (LEARNING PATH)

## 1. Bảng tuần tự 14 bước

| Bước | Tên nội dung | Mục tiêu học tập | Tệp mã nguồn / Tài liệu cần đọc |
|:---:|:---|:---|:---|
| **1** | **Tổng quan dự án & 4 Course Scope** | Nắm mục tiêu, phạm vi và ma trận ánh xạ 4 môn | docs/01_PROJECT_SCOPE.md, docs/07_FOUR_COURSE_MATRIX.md |
| **2** | **Actor & Ma trận phân quyền RBAC** | Hiểu rõ 4 roles chuẩn và workflow phê duyệt | docs/02_USER_ROLES_AND_WORKFLOWS.md, ackend/src/main/java/com/worksphere/identity/domain/Role.java |
| **3** | **Kiến trúc Modular Monolith Backend** | Hiểu cấu trúc multi-module và ranh giới nghiệp vụ | ackend/pom.xml, docs/04_SYSTEM_ARCHITECTURE.md |
| **4** | **Cơ sở dữ liệu & Flyway Migrations** | Nắm cấu trúc bảng và cơ chế versioning Flyway | ackend/src/main/resources/db/migration/V001__... đến V020__... |
| **5** | **Spring Security & JWT Authentication** | Hiểu luồng login, sinh token, filter và xác thực | ackend/src/main/java/com/worksphere/shared/security/JwtAuthenticationFilter.java, JwtService.java |
| **6** | **Nghiệp vụ Project & Task Lifecycle** | Nắm State Machine của Task (TODO -> IN_PROGRESS -> DONE) | ackend/src/main/java/com/worksphere/task/domain/Task.java, TaskService.java |
| **7** | **Nghiệp vụ Service Request & Asset** | Hiểu quy trình mượn tài sản và tạo phiếu yêu cầu | ackend/src/main/java/com/worksphere/asset/domain/Asset.java, ackend/src/main/java/com/worksphere/service_request/... |
| **8** | **Kiến trúc Mobile React Native & Redux** | Nắm cấu trúc thư mục feature, navigation và store | mobile/src/navigation/RootNavigator.tsx, mobile/src/store/index.ts |
| **9** | **Mobile Auth & Storage Model** | Phân biệt lưu trữ In-Memory và Secure Keychain | mobile/src/features/auth/services/authService.ts, mobile/src/services/api/client.ts |
| **10** | **Mobile Screens & UX Workflow** | Duyệt qua 6 luồng màn hình chính trên ứng dụng | mobile/src/features/projects/screens/, 	asks/screens/, v.v. |
| **11** | **Backend Testing Strategy** | Hiểu cấu trúc 351 tests (Unit, Service, Controller) | ackend/src/test/java/com/worksphere/identity/service/AuthenticationServiceTest.java, v.v. |
| **12** | **Docker Compose & Containerization** | Nắm cách chạy Postgres, Backend container cục bộ | compose.yaml, Dockerfile |
| **13** | **CI/CD Pipeline với GitHub Actions** | Hiểu 5 jobs tự động hóa kiểm thử và build Docker | .github/workflows/ci.yml |
| **14** | **Logging, Metrics, Backup & Restore** | Hiểu MDC correlation ID, Actuator Prometheus, Backup tool | ackend/src/main/resources/logback-spring.xml, scripts/backup.ps1 |

## 2. Từ điển thuật ngữ cốt lõi (Terminology Dictionary)

1. **Modular Monolith**: Kiến trúc đóng gói toàn bộ ứng dụng trong một deployment unit duy nhất nhưng bên trong được chia thành các module nghiệp vụ độc lập, có ranh giới rõ ràng.
2. **Flyway Migration**: Công cụ quản lý và kiểm soát phiên bản cơ sở dữ liệu thông qua các tệp script SQL được đánh số thứ tự (V001, V002,...).
3. **Correlation ID (X-Correlation-Id)**: Một chuỗi định danh duy nhất (UUID) được gắn vào mỗi HTTP Request để theo dõi luồng xử lý qua tất cả các tầng log và dịch vụ.
4. **MDC (Mapped Diagnostic Context)**: Cơ chế của SLF4J/Logback cho phép lưu trữ thông tin theo từng luồng xử lý (thread-local), tự động chèn dữ liệu như correlationId vào mọi dòng log.
5. **RBAC (Role-Based Access Control)**: Mô hình kiểm soát truy cập dựa trên vai trò của người dùng (EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN).
6. **In-Memory Token Storage**: Kỹ thuật lưu trữ Access Token chỉ trong RAM của ứng dụng di động; khi tắt app, token biến mất, chống tấn công đánh cắp token từ bộ nhớ flash.
7. **Secure Storage (Keychain / Keystore)**: Vùng lưu trữ phần cứng mã hóa an toàn trên thiết bị di động, dùng để lưu Refresh Token nhạy cảm.
8. **Stateless Authentication**: Cơ chế xác thực không lưu trữ session phía server; mọi thông tin định danh và quyền hạn của người dùng được mã hóa bên trong JWT token.
9. **Optimistic Locking**: Kỹ thuật xử lý tranh chấp dữ liệu đồng thời bằng trường phiên bản (@Version), ngăn chặn tình trạng ghi đè mất mát dữ liệu (lost update).
10. **Actuator & Micrometer**: Framework theo dõi và thu thập chỉ số vận hành ứng dụng Spring Boot, xuất dữ liệu định dạng chuẩn Prometheus để phục vụ giám sát.

# PHẦN III: CẨM NANG ÔN TẬP THEO 4 MÔN HỌC (PER-COURSE STUDY GUIDE)

## 1. Môn 1: Kỹ Năng Lập Trình Nâng Cao

### Chuẩn đầu ra trọng tâm:
- Thiết kế hướng đối tượng nâng cao, tuân thủ nghiêm ngặt 5 nguyên lý SOLID.
- Tái cấu trúc mã nguồn (Refactoring) và áp dụng các mẫu thiết kế chuẩn (Gang of Four): Factory, Strategy, Observer, Repository, Adapter.
- Xử lý đa luồng, bất đồng bộ (`@Async`, `CompletableFuture`), bảo đảm Thread Safety và tính toàn vẹn dữ liệu.
- Xử lý biệt lệ toàn cục (Global Exception Handling) và thiết kế thông điệp lỗi chuẩn doanh nghiệp (RFC 7807 / Standard Problem Details).

### Các bước Demo trực tiếp mã nguồn:
1. Mở `backend/src/main/java/com/worksphere/shared/exception/GlobalExceptionHandler.java`:
   - Chỉ ra cách bắt các ngoại lệ cụ thể (`ResourceNotFoundException`, `AccessDeniedException`, `ValidationException`).
   - Giải thích cách trả về cấu trúc `ApiResponse<T>` thống nhất cho toàn bộ hệ thống.
2. Mở `backend/src/main/java/com/worksphere/shared/security/JwtAuthenticationFilter.java`:
   - Phân tích luồng lọc request, tách bearer token, giải mã claims và thiết lập `SecurityContextHolder`.
3. Mở `backend/src/main/java/com/worksphere/task/service/TaskService.java`:
   - Chỉ ra việc áp dụng nguyên lý Single Responsibility và Dependency Inversion qua Service Interface và JPA Repository.

### Bộ câu hỏi & Đáp án mẫu khi bảo vệ:
- **Câu hỏi 1: Hệ thống của bạn áp dụng nguyên lý SOLID như thế nào? Nêu ví dụ cụ thể trong mã nguồn.**
  - *Đáp án mẫu*: "Hệ thống áp dụng toàn diện 5 nguyên lý:
    - **S (Single Responsibility)**: Mỗi service như `TaskService` chỉ chịu trách nhiệm duy nhất về logic vòng đời công việc, không kiêm nhiệm xác thực hay gửi thông báo.
    - **O (Open/Closed)**: Cơ chế `NotificationService` cho phép mở rộng thêm các kênh gửi mới (Email, Push, In-app) mà không sửa đổi mã nguồn gọi thông báo.
    - **L (Liskov Substitution)**: Các repository kế thừa `JpaRepository` có thể thay thế an toàn bằng các mock repository trong unit tests mà không làm sai lệch hành vi.
    - **I (Interface Segregation)**: Các interface repository và service được phân tách theo từng domain context riêng biệt thay vì tạo một god-interface.
    - **D (Dependency Inversion)**: Các Controller phụ thuộc vào Service abstraction/interface, và các Service phụ thuộc vào Repository interface được Spring IoC Container inject."
- **Câu hỏi 2: Tại sao dự án không sử dụng Custom `@Aspect` cho Cross-cutting concern mà dùng Filter?**
  - *Đáp án mẫu*: "Trong kiến trúc Web của Spring Boot, việc thu thập thông tin định danh request (`X-Correlation-Id`) và thiết lập MDC cần diễn ra ở rìa ngoài cùng của hệ thống trước khi request chạm tới bất kỳ DispatcherServlet hay Controller nào. Sử dụng `RequestCorrelationFilter` kế thừa `OncePerRequestFilter` bảo đảm rằng 100% request (kể cả request lỗi 404 hoặc bị từ chối ở tầng Security) đều được gán Correlation ID chuẩn xác, điều mà `@Aspect` ở tầng Service/Controller không bao quát hết được."

---

## 2. Môn 2: Phát Triển Ứng Dụng Di Động

### Chuẩn đầu ra trọng tâm:
- Kiến trúc ứng dụng di động đa nền tảng React Native (v0.88.0) với TypeScript typed-safety.
- Cơ chế quản lý trạng thái (State Management) kết hợp: Redux Toolkit (Client state) và Axios Interceptor (Server communication).
- Quản lý điều hướng phân tầng (Navigation Architecture): Switch auth/app stack, Modal stacks, và Bottom Tabs.
- Tối ưu hiệu năng rendering: `useCallback`, `useMemo`, `React.memo`, phân trang danh sách (Pagination / Infinite Scroll).
- Bảo mật thiết bị di động: Phân tầng lưu trữ Token (In-Memory + Hardware Keychain), không lưu mật khẩu.

### Các bước Demo trực tiếp mã nguồn:
1. Mở `mobile/src/services/api/client.ts`:
   - Cho hội đồng xem request interceptor tự động chèn `X-Correlation-Id` và header `Authorization: Bearer <token>`.
   - Xem response interceptor tự động bắt mã lỗi 401, gọi API refresh token và retry request bị gián đoạn.
2. Mở `mobile/src/features/auth/services/authService.ts`:
   - Chứng minh Access Token được lưu trong RAM biến bộ nhớ, còn Refresh Token được lưu an toàn qua thư viện `react-native-keychain`.
3. Mở `mobile/src/navigation/RootNavigator.tsx`:
   - Chỉ ra luồng chuyển màn hình mượt mà giữa `AuthNavigator` (chưa đăng nhập) và `MainNavigator` (đã đăng nhập).

### Bộ câu hỏi & Đáp án mẫu khi bảo vệ:
- **Câu hỏi 1: Tại sao nhóm không lưu Access Token trong `AsyncStorage` cho tiện?**
  - *Đáp án mẫu*: "`AsyncStorage` trên thiết bị di động chỉ là tệp lưu trữ plain-text không mã hóa (XML/SQLite trên Android, plist trên iOS). Nếu thiết bị bị root/jailbreak hoặc dính malware, token sẽ dễ dàng bị trích xuất. Do đó, nhóm áp dụng giải pháp bảo mật cấp ngân hàng: Access Token có hạn ngắn (15 phút) lưu hoàn toàn trong bộ nhớ RAM (In-Memory). Refresh Token có hạn dài (7 ngày) được lưu trong phân vùng bảo mật phần cứng được mã hóa (Keystore/Keychain) thông qua `react-native-keychain`."
- **Câu hỏi 2: Ứng dụng xử lý ra sao khi mạng chập chờn hoặc request mất nhiều thời gian?**
  - *Đáp án mẫu*: "Axios client được cấu hình timeout hữu hạn (10-15s). Ứng dụng hiển thị Skeleton loading và hỗ trợ cơ chế Pull-to-refresh trên tất cả các màn hình danh sách (`ProjectListScreen`, `TaskListScreen`). Khi xảy ra lỗi mạng, hệ thống bắt lỗi tại tầng UI thông qua Toast notification thân thiện, ghi log correlation ID tương ứng và cho phép người dùng thử lại."

---

## 3. Môn 3: Quản Lý Dự Án CNTT

### Chuẩn đầu ra trọng tâm:
- Áp dụng phương pháp luận Agile / Scrum: Phân chia Sprint, User Stories, Epic, Acceptance Criteria.
- Quản lý phạm vi và ranh giới dự án (Scope Management): Ngăn chặn Scope Creep thông qua tài liệu kiểm soát nghiêm ngặt (`01_PROJECT_SCOPE.md`).
- Quản lý cấu hình mã nguồn và phân nhánh (Configuration & Branching Strategy): Trunk-based development kết hợp Pull Request, Branch Protection rules.
- Ma trận phân quyền trách nhiệm (RACI Matrix) và quy trình đảm bảo chất lượng (QA/QC).

### Các bước Demo trực tiếp quy trình:
1. Mở `docs/08_DEVELOPMENT_ROADMAP.md` và `docs/02_USER_ROLES_AND_WORKFLOWS.md`:
   - Trình bày 20 Stages của dự án từ thiết lập ban đầu đến kiểm thử và bảo vệ.
2. Mở GitHub Repository:
   - Cho hội đồng xem lịch sử Commit có cấu trúc Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).
   - Xem 5 jobs GitHub Actions kiểm tra tự động trước mỗi commit.

### Bộ câu hỏi & Đáp án mẫu khi bảo vệ:
- **Câu hỏi 1: Nhóm quản lý rủi ro Scope Creep (phình phạm vi) trong dự án như thế nào?**
  - *Đáp án mẫu*: "Nhóm duy trì 10 tài liệu chuẩn tắc (Canonical Sources), trong đó `01_PROJECT_SCOPE.md` định nghĩa rõ danh sách In-Scope và Out-of-Scope. Mọi yêu cầu tính năng mới đều phải đối soát với tài liệu này; nếu không nằm trong thỏa thuận ban đầu, tính năng đó sẽ bị từ chối hoặc đưa vào backlog cho các phiên bản tương lai. Nhờ đó, dự án giữ đúng 4 Role chuẩn và 6 module nghiệp vụ lõi mà không bị phát sinh ngoài tầm kiểm soát."
- **Câu hỏi 2: Quy trình kiểm soát chất lượng (Quality Gate) của nhóm được thực thi ra sao?**
  - *Đáp án mẫu*: "Nhóm áp dụng chính sách 'Zero-tolerance for build failures':
    1. Kiểm tra Checkstyle tự động (0 lỗi vi phạm quy chuẩn code).
    2. Chạy toàn bộ 351 Backend Tests và Mobile TypeScript Checks trước khi merge mã nguồn.
    3. Quét phát hiện lộ lọt mã bí mật (Secret Audit) trên từng commit.
    4. Mọi thành viên phải tuân thủ quy chuẩn commit và branch protection."

---

## 4. Môn 4: Triển Khai Phần Mềm

### Chuẩn đầu ra trọng tâm:
- Đóng gói ứng dụng bằng Docker Container nhiều tầng (Multi-stage Dockerfile) tối ưu kích thước và bảo mật.
- Quản trị cơ sở dữ liệu với Flyway Migration tự động hóa.
- Đường ống tích hợp và phân phối liên tục (CI/CD Pipeline) với GitHub Actions.
- Vận hành, giám sát (Metrics Prometheus, Structured Logging) và kế hoạch sao lưu/phục hồi thảm họa (Disaster Recovery RPO/RTO).

### Các bước Demo trực tiếp môi trường:
1. Mở `compose.yaml` và `backend/Dockerfile`:
   - Phân tích multi-stage build: tầng build bằng JDK 21 Maven, tầng chạy bằng JRE alpine siêu nhẹ và chạy dưới user không đặc quyền (`appuser`).
2. Mở `.github/workflows/ci.yml`:
   - Trình bày 5 jobs kiểm thử song song: Secret Audit, Backend Quality, Mobile Quality, Android Debug Build, Docker Image Build.
3. Chạy demo lệnh kiểm tra health và metrics (hoặc chỉ file cấu hình `compose.yaml` và `application.yml`):
   - Actuator health check `/actuator/health` và Prometheus scrape `/actuator/prometheus`.

### Bộ câu hỏi & Đáp án mẫu khi bảo vệ:
- **Câu hỏi 1: Quy trình Backup và Phục hồi (Restore) của nhóm hoạt động thế nào? RPO và RTO đạt bao nhiêu?**
  - *Đáp án mẫu*: "Nhóm đã tự động hóa quy trình sao lưu qua kịch bản `scripts/backup.ps1`:
    - Dữ liệu PostgreSQL được dump nhị phân nén bằng `pg_dump -Fc`.
    - Thư mục uploads được nén tar có gắn mã băm SHA-256 và tệp metadata manifest JSON.
    - Quy trình Restore đã được diễn tập thành công trên môi trường cô lập hoàn toàn (Stage 19D), bảo đảm không gây ảnh hưởng đến dữ liệu đang hoạt động.
    - **RPO (Recovery Point Objective)** mục tiêu đạt 24 giờ (hoặc 1 giờ nếu bật WAL archiving).
    - **RTO (Recovery Time Objective)** phục hồi toàn bộ hệ thống dưới 30 phút."
- **Câu hỏi 2: Tại sao Actuator endpoints không được mở công khai toàn bộ?**
  - *Đáp án mẫu*: "Để bảo mật theo tiêu chuẩn Hardening của Stage 19B, nhóm chỉ expose đúng 3 endpoint an toàn: `health`, `info`, và `prometheus`. Các endpoint nhạy cảm như `env`, `beans`, `configprops`, `heapdump`, `threaddump` và `shutdown` bị vô hiệu hóa hoàn toàn khỏi mạng ngoài để tránh rò rỉ biến môi trường, mật khẩu hoặc bị tấn công từ chối dịch vụ (DoS)."

# PHẦN IV: CẨM NANG CÁ NHÂN HÓA CHO TỪNG THÀNH VIÊN (PER-MEMBER GUIDE)

*(Ghi chú: Toàn bộ phân công dưới đây là đề xuất chuẩn hóa dựa trên năng lực chuyên môn và cấu trúc nhóm 6 người. Trạng thái: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`)*

---

## 1. Nguyễn Minh Hiếu — Nhóm Trưởng (Team Leader)
- **Vai trò chính**: Nhóm trưởng, Kiến trúc sư hệ thống (System Architect).
- **Môn học phụ trách bảo vệ chính**: **Quản Lý Dự Án CNTT** (đồng phụ trách Kỹ Năng Lập Trình Nâng Cao).
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - Toàn bộ tài liệu chuẩn: `docs/01_PROJECT_SCOPE.md`, `docs/04_SYSTEM_ARCHITECTURE.md`, `docs/07_FOUR_COURSE_MATRIX.md`.
  - Cấu trúc multi-module: `backend/pom.xml`, `mobile/package.json`.
  - Bảo mật danh tính: `backend/src/main/java/com/worksphere/identity/service/AuthenticationService.java`, `Role.java`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Giới thiệu bài toán, tầm nhìn dự án WorkSphere và cấu trúc hệ sinh thái.
  - Trình bày mô hình quản lý dự án Agile/Scrum, cách tổ chức phân công công việc và giải quyết xung đột trong nhóm.
  - Trình bày kiến trúc Modular Monolith và sự phân tách ranh giới giữa 6 module nghiệp vụ.
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Tại sao nhóm chọn kiến trúc Modular Monolith thay vì Microservices ngay từ đầu?*
  2. *Làm thế nào để bảo đảm các thành viên tuân thủ đúng kiến trúc và không làm vỡ ranh giới module?*
  3. *Hệ thống phân quyền RBAC có bao nhiêu vai trò? Hãy giải thích sự khác biệt giữa `PROJECT_MANAGER` và `TEAM_LEADER`.*
  4. *Phương pháp quản lý phạm vi (Scope Management) của nhóm đã ngăn chặn Scope Creep như thế nào?*
  5. *Quy trình Code Review và tích hợp CI/CD đã giúp nhóm phát hiện lỗi sớm ra sao?*

---

## 2. Nguyễn Văn Cường — Backend & Database Engineer
- **Vai trò chính**: Kỹ sư Backend & Cơ sở dữ liệu.
- **Môn học phụ trách bảo vệ chính**: **Kỹ Năng Lập Trình Nâng Cao** (đồng phụ trách Triển Khai Phần Mềm).
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - `backend/src/main/resources/db/migration/` (20 files Flyway từ `V001` đến `V020`).
  - `backend/src/main/java/com/worksphere/project/`, `task/`, `asset/`, `service_request/`.
  - `backend/src/main/java/com/worksphere/shared/exception/GlobalExceptionHandler.java`.
  - 351 Backend Tests trong `backend/src/test/java/`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Trình bày thiết kế cơ sở dữ liệu quan hệ PostgreSQL, ràng buộc toàn vẹn và 20 migration Flyway.
  - Trình bày việc áp dụng nguyên lý SOLID, Clean Architecture và Design Patterns trong tầng Service và Domain.
  - Trình bày cơ chế xử lý lỗi tập trung, giao dịch (`@Transactional`) và kiểm soát concurrency.
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Tại sao không sửa đổi trực tiếp các file Flyway migration cũ khi cần thay đổi cột dữ liệu?*
  2. *Hệ thống giải quyết bài toán xung đột dữ liệu đồng thời (Concurrency / Race Condition) như thế nào?*
  3. *Trình bày luồng xử lý của một Task từ lúc tạo mới (`TODO`) đến khi hoàn thành (`DONE`).*
  4. *Làm thế nào bạn kiểm thử được 351 test cases mà không cần kết nối tới cơ sở dữ liệu thật? (Testcontainers & Mockito)*
  5. *Giải thích cấu trúc và ý nghĩa của các annotations: `@Entity`, `@Table`, `@Enumerated`, `@Transactional`.*

---

## 3. Hoàng Bảo Long — Mobile Lead Developer
- **Vai trò chính**: Lập trình viên chính ứng dụng Di động.
- **Môn học phụ trách bảo vệ chính**: **Phát Triển Ứng Dụng Di Động**.
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - Cấu trúc Navigation: `mobile/src/navigation/RootNavigator.tsx`, `AppNavigator.tsx`, `AuthNavigator.tsx`.
  - Cơ chế Auth & API Client: `mobile/src/services/api/client.ts`, `mobile/src/features/auth/services/authService.ts`.
  - Quản lý trạng thái: `mobile/src/store/index.ts`, `mobile/src/store/slices/*`.
  - Các màn hình chính: `mobile/src/features/projects/screens/`, `tasks/screens/`, `assets/screens/`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Giới thiệu kiến trúc ứng dụng React Native 0.88, tổ chức thư mục feature-based và TypeScript typing.
  - Trình bày cơ chế quản lý xác thực: In-Memory Access Token kết hợp Hardware Keychain cho Refresh Token.
  - Demo trực tiếp các luồng màn hình chính: Đăng nhập, xem danh sách dự án, nhận task, tạo yêu cầu hỗ trợ.
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Làm thế nào ứng dụng tự động refresh token khi nhận mã lỗi HTTP 401 mà người dùng không bị văng ra màn hình đăng nhập?*
  2. *Sự khác nhau cơ bản giữa lưu trữ trong RAM (In-Memory) và lưu trữ bảo mật (Keychain) trên thiết bị di động?*
  3. *Bạn đã tối ưu hiệu năng render danh sách dài (FlatList) như thế nào để không bị giật lag?*
  4. *Trình bày luồng điều hướng (Navigation flow) từ màn hình Login đến Dashboard.*
  5. *Làm thế nào ứng dụng phân quyền hiển thị giao diện theo 4 Roles khác nhau?*

---

## 4. Vũ Thị Thu Hướng — QA / QC & Verification Engineer
- **Vai trò chính**: Kỹ sư Đảm bảo chất lượng & Kiểm thử.
- **Môn học phụ trách bảo vệ chính**: **Quản Lý Dự Án CNTT** (phần Kiểm thử chất lượng) & **Kỹ Năng Lập Trình Nâng Cao** (phần Clean Code & Unit Testing).
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - Báo cáo kiểm thử và chất lượng: `reports/STAGE_18_REGRESSION_EVIDENCE.md`, `reports/TEST_AUDIT.md`.
  - Quy chuẩn mã nguồn: `docs/09_CODING_STANDARDS.md`, `backend/checkstyle.xml`.
  - Test suites: `backend/src/test/java/com/worksphere/*`.
  - Acceptance Criteria cho từng User Story trong `docs/02_USER_ROLES_AND_WORKFLOWS.md`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Trình bày chiến lược kiểm thử đa tầng: Unit Test, Integration Test, và End-to-End API Test.
  - Phân tích chỉ số chất lượng: 351 tests pass 100%, 0 lỗi Checkstyle, độ bao phủ các kịch bản biên (Boundary conditions).
  - Trình bày quy trình kiểm thử chấp nhận người dùng (User Acceptance Testing - UAT) và ma trận truy vết lỗi (Bug Tracking).
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Làm thế nào để đo lường và khẳng định hệ thống đạt chất lượng trước khi release?*
  2. *Quy trình thiết kế test case cho một chức năng phân quyền phức tạp (ví dụ: chỉ Project Manager mới được duyệt task)?*
  3. *Checkstyle đã bắt buộc nhóm tuân thủ những quy tắc lập trình sạch nào?*
  4. *Nếu phát hiện một lỗi nghiêm trọng (Critical Bug) ngay trước ngày phát hành, quy trình xử lý của nhóm như thế nào?*
  5. *Phân biệt sự khác nhau giữa Unit Test và Integration Test trong mã nguồn Backend của dự án.*

---

## 5. Nguyễn Đức Khiêm — DevOps & Deployment Engineer
- **Vai trò chính**: Kỹ sư Vận hành, CI/CD & Hạ tầng.
- **Môn học phụ trách bảo vệ chính**: **Triển Khai Phần Mềm**.
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - Đường ống tự động hóa: `.github/workflows/ci.yml`.
  - Containerization: `Dockerfile`, `compose.yaml`, `.dockerignore`.
  - Giám sát & Logs: `backend/src/main/resources/logback-spring.xml`, `application.yml` (Actuator & Prometheus).
  - Kịch bản sao lưu & phục hồi: `scripts/backup.ps1`, `scripts/restore.ps1`, `scripts/rehearsal-restore.ps1`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Trình bày quy trình CI/CD 5 jobs chạy song song trên GitHub Actions và chính sách Quality Gate.
  - Trình bày thiết kế Multi-stage Dockerfile giúp giảm dung lượng image và nâng cao tính bảo mật.
  - Demo cơ chế Structured Logging với Correlation ID và chỉ số giám sát vận hành qua Micrometer Prometheus.
  - Trình bày giải pháp Backup tự động hóa và kết quả diễn tập phục hồi thảm họa (Disaster Recovery).
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Lợi ích của Multi-stage build trong Dockerfile của dự án là gì? Kích thước image giảm được bao nhiêu?*
  2. *Trình bày luồng hoạt động của 5 jobs trong GitHub Actions. Nếu 1 job thất bại thì chuyện gì xảy ra?*
  3. *Correlation ID (`X-Correlation-Id`) hoạt động thế nào trong việc truy vết sự cố hệ thống?*
  4. *Tại sao nhóm thực hiện sao lưu cả Database và Thư mục uploads riêng biệt? Kế hoạch phục hồi ra sao?*
  5. *Làm thế nào để ứng dụng cập nhật phiên bản mới (Deployment) mà giảm thiểu thời gian gián đoạn dịch vụ?*

---

## 6. Lê Anh Tú — Product Manager & Business Analyst
- **Vai trò chính**: Chuyên viên Phân tích nghiệp vụ & Quản lý sản phẩm.
- **Môn học phụ trách bảo vệ chính**: **Quản Lý Dự Án CNTT** (Phần Yêu cầu nghiệp vụ & Quy trình) & **Phát Triển Ứng Dụng Di Động** (Phần UX/UI Flow).
- **Các module & tệp mã nguồn cần nắm vững nhất**:
  - `docs/01_PROJECT_SCOPE.md` (Phạm vi dự án).
  - `docs/02_USER_ROLES_AND_WORKFLOWS.md` (Workflow 4 Roles và 6 modules).
  - `docs/03_MOBILE_SCREEN_MAP.md` (Sơ đồ điều hướng màn hình di động).
  - Dữ liệu khởi tạo mẫu: `backend/src/main/resources/db/migration/V011__seed_roles_and_permissions.sql`.
- **Nội dung thuyết trình chính (5-7 phút)**:
  - Phân tích bài toán thực tế của doanh nghiệp và lý do ra đời của giải pháp WorkSphere.
  - Trình bày chi tiết luồng nghiệp vụ của 4 Roles (`EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN`) và cách các luồng này tương tác với nhau.
  - Phân tích sơ đồ trải nghiệm người dùng (UX Map) trên ứng dụng di động từ điểm chạm đầu tiên đến khi hoàn thành nghiệp vụ.
- **Top 5 câu hỏi trọng tâm phải trả lời xuất sắc**:
  1. *Hãy trình bày bài toán nghiệp vụ khi một Nhân viên (`EMPLOYEE`) yêu cầu mượn thiết bị và quy trình phê duyệt của Quản lý.*
  2. *Làm thế nào hệ thống phân biệt được quyền hạn giữa `TEAM_LEADER` và `PROJECT_MANAGER` trong quản lý công việc?*
  3. *Tại sao nhóm quyết định không tích hợp tính năng Chấm công GPS phức tạp vào phiên bản hiện tại?*
  4. *Giá trị cốt lõi (Value Proposition) mà WorkSphere mang lại cho doanh nghiệp so với các phần mềm rời rạc là gì?*
  5. *Làm thế nào để khảo sát và thu thập phản hồi của người dùng nhằm cải tiến sản phẩm trong các phiên bản tiếp theo?*

# PHẦN V: CHIẾN LƯỢC DIỄN TẬP VÀ PHẢN BIỆN NHÓM (TEAM REHEARSAL & DEFENSE)

## 1. Kịch bản diễn tập nhóm 3 vòng

Nhóm thực hiện 3 vòng diễn tập trước ngày bảo vệ chính thức:

```
[Vòng 1: Nội bộ nhóm tự soi mã nguồn]
  │   - Từng thành viên trình bày phần việc của mình trước nhóm (10 phút/người).
  │   - Nhóm đóng vai giảng viên khó tính, đặt câu hỏi xoáy vào các điểm yếu và bắt bẻ chi tiết code.
  ▼
[Vòng 2: Diễn tập thời gian thực với Slide và Demo ứng dụng]
  │   - Bấm giờ chính xác theo quy định bảo vệ (ví dụ: 20 phút trình bày + 15 phút trả lời phản biện).
  │   - Diễn tập chuyển giao micro và màn hình demo giữa các thành viên nhịp nhàng, không bị ngắt quãng.
  ▼
[Vòng 3: Tổng duyệt toàn diện kịch bản bảo vệ (Mock Defense)]
      - Mời cố vấn hoặc sinh viên khóa trên đóng vai Hội đồng chấm thi.
      - Mô phỏng các sự cố kỹ thuật bất ngờ (mất mạng, app crash, lỗi port database) để rèn luyện phản xạ xử lý bình tĩnh.
```

## 2. Ma trận phân vai trả lời câu hỏi

Khi Hội đồng đặt câu hỏi, nhóm trưởng (Nguyễn Minh Hiếu) là người điều phối chung, sau đó chuyển quyền trả lời cho thành viên phụ trách chuyên sâu:

| Lĩnh vực câu hỏi của Giảng viên | Thành viên chịu trách nhiệm chính | Thành viên hỗ trợ thứ hai |
|:---|:---|:---|
| **Tổng quan, Scope, Phân công Scrum, Quản lý rủi ro** | **Nguyễn Minh Hiếu** (Team Leader) | **Lê Anh Tú** (BA/PO) |
| **Nghiệp vụ chi tiết, Quy trình phê duyệt, User Story, UX** | **Lê Anh Tú** (BA/PO) | **Hoàng Bảo Long** (Mobile) |
| **Kiến trúc Backend, SOLID, Design Pattern, Exception** | **Nguyễn Văn Cường** (Backend) | **Nguyễn Minh Hiếu** (Leader) |
| **Cơ sở dữ liệu, Flyway, Quan hệ bảng, Concurrency** | **Nguyễn Văn Cường** (Backend) | **Nguyễn Đức Khiêm** (DevOps) |
| **React Native, UI/UX, Quản lý Token In-Memory, Mobile Perf**| **Hoàng Bảo Long** (Mobile) | **Lê Anh Tú** (BA/PO) |
| **Kiểm thử, Unit Tests 351 cases, Checkstyle, Coverage** | **Vũ Thị Thu Hướng** (QA/QC) | **Nguyễn Văn Cường** (Backend) |
| **CI/CD, GitHub Actions, Docker, Multi-stage build** | **Nguyễn Đức Khiêm** (DevOps) | **Nguyễn Văn Cường** (Backend) |
| **Logging Correlation ID, Metrics Prometheus, Backup/Restore**| **Nguyễn Đức Khiêm** (DevOps) | **Nguyễn Minh Hiếu** (Leader) |

## 3. Xử lý tình huống khó hoặc câu hỏi ngoài phạm vi

1. **Nguyên tắc "Thành thật về kỹ thuật & Dẫn chứng bằng thực tế"**:
   - Tuyệt đối không bịa đặt hoặc khẳng định bừa tính năng không có trong mã nguồn.
   - Nếu câu hỏi liên quan đến tính năng nhóm chưa cài đặt (Out-of-scope), bình tĩnh trả lời: *"Dạ thưa Thầy/Cô, trong phạm vi phiên bản hiện tại đã được xác định trong tài liệu Scope chuẩn, tính năng này được định vị ở giai đoạn mở rộng tiếp theo để tập trung nguồn lực tối ưu cho 6 module nghiệp vụ cốt lõi và 4 vai trò chuẩn."*
2. **Khi gặp câu hỏi lý thuyết chuyên sâu chưa nhớ rõ**:
   - Trả lời bằng cách gắn liền với kiến trúc thực tế của WorkSphere: *"Dạ thưa Thầy/Cô, về mặt lý thuyết thuần túy em xin phép được tra cứu thêm, nhưng trong phạm vi dự án WorkSphere, nhóm em đã hiện thực hóa nguyên lý này tại lớp [Tên Class/File] bằng cách [Trình bày giải pháp cụ thể]."*
3. **Khi ứng dụng gặp sự cố trong lúc demo trực tiếp**:
   - Giữ bình tĩnh, mở ngay màn hình Log (`logback` hoặc Terminal console).
   - Chỉ ra mã lỗi và `correlationId`: *"Hệ thống có cơ chế bắt lỗi chi tiết, tại đây console đang báo lỗi kết nối [Mã lỗi/Exception], em xin phép 30 giây để kiểm tra lại service hoặc khởi động lại container."* Điều này biến một sự cố demo thành cơ hội vàng chứng minh năng lực Logging và Debug chuyên nghiệp của nhóm.

---
*Tài liệu này là nguồn chân lý cho toàn bộ hoạt động ôn tập, diễn tập và phân công bảo vệ dự án WorkSphere trong khuôn khổ Roadmap Stage 20.*
