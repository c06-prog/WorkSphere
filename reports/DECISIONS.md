# WorkSphere Decisions

## D-001 Architecture

WorkSphere uses a Modular Monolith.

Do not split WorkSphere into microservices unless canonical documents are explicitly updated by a dedicated design task.

## D-002 Database

PostgreSQL is the production-equivalent database.

H2 may be used for fast tests but cannot replace PostgreSQL integration validation.

## D-003 Java

The project target is Java 21.

A newer local JDK does not change the project target.

CI and future runtime images should align with Java 21 unless canonical documents explicitly change this decision.

## D-004 Flyway

Flyway migrations V001 through V011 are versioned history.

Do not rewrite migration history.

If a migration defect is discovered after it has been shared, add a corrective migration or corrective commit according to project rules.

## D-005 Persistent Project Memory

Project memory is stored in:

- AGENTS.md
- reports/PROJECT_STATE.md
- reports/DECISIONS.md
- reports/HANDOFF.md
- Git history
- Build and test outputs

Model chat history is not a source of truth.

## D-006 Model Failover

FCM Smart Router may change models when a provider returns:

- HTTP 429
- HTTP 5xx
- Timeout
- Empty or invalid content

A replacement model must:

- Read persistent project memory.
- Verify Git state.
- Continue only within the current task scope.
- Never assume earlier tool calls succeeded without evidence.

## D-007 Storage

Heavy AI data uses:

- D:\AI

Docker disk data uses:

- D:\DockerData\DockerDesktopWSL

WorkSphere source uses:

- D:\WorkSphere

Large AI packages, cache, model data, and router data must not be intentionally stored on drive C.

## D-008 Model Trust

A large context window does not guarantee correctness.

A model must pass shell, Git, file-read, and no-write tests before receiving repository write permission.

Only validated work may be committed and pushed.

## D-009 Current Model Selection

FCM automatic routing is disabled until at least two authenticated
providers are available and verified.

Current operating mode:

- Use FCM dashboard to select a model manually.
- Use OpenCode for small, bounded tasks.
- Persistent project memory remains independent of the selected model.
- Antigravity remains the primary agent for major roadmap phases.
- Do not enable automatic failover solely from public health pings.

## D-010 Phase 5 Scope

- "Organization Module" is the business module name; there is no `Organization` entity, no `organizations` table, and no `organization_id`.
- WorkSphere serves a single organization internally (strictly single-tenant).
- Phase 5 includes Department, Team, Team Member, and User Management.
- Project entities, milestones, workflows, and tasks belong to Phase 6 and beyond, strictly excluded from Phase 5.

## D-011 Temporary Password Flow

- Admin creates User with status `PENDING` and a secure temporary random password hashed via BCrypt.
- Plaintext password is never returned in API responses and never logged.
- Activation email, activation token, and first-time password setup workflow are currently absent from canonical documentation (`TEMPORARY_PASSWORD_FLOW_GAP`).
- Do not invent custom activation endpoints or token flows without explicit canonical requirement or a dedicated approved task.
- Phase 6 must not modify this flow outside its Project Module scope.

## D-012 Team API Contract Gap

- Team and Team Member have database schema and domain/application layer implementations.
- No REST Controllers are created for Team or Team Member because endpoints are not defined in `06_API_CONTRACT.md`.
- Exposure of Team endpoints is deferred until canonical API extensions are defined.

## D-013 Project Manager Invariant

- Mỗi Project phải luôn có ít nhất một active PROJECT_MANAGER.
- Không được xóa active Project Manager cuối cùng.
- Không được đổi role của active Project Manager cuối cùng sang role khác.
- Giữ nguyên role PROJECT_MANAGER được phép.
- Giáng cấp khi còn Project Manager khác được phép.

## D-014 Mobile Design Before Implementation

- Không triển khai React Native screen trước khi có UI/UX baseline.
- UI/UX baseline phải gồm:
  - User Flow
  - Screen Inventory
  - Wireframe
  - Design System
  - Component Inventory
  - UI State Matrix
  - Navigation Map
  - API-Screen Mapping
  - Accessibility Checklist
- Thiết kế không được tạo chức năng ngoài canonical docs.
- File Figma chỉ được tuyên bố tồn tại nếu thực sự đã tạo.

## D-015 Runtime Automation Authorization

- Agent được dùng Docker, Maven, Gradle, ADB và emulator theo phạm vi AGENTS.md.
- Agent chỉ thao tác tài nguyên của WorkSphere.
- Jenkins và Docker volumes được bảo vệ.
- Hộp thoại nhạy cảm phải chuyển cho người dùng.

## D-016 Visual Prototype Gate

- Đặc tả Markdown chưa được coi là visual mockup.
- Trước khi code React Native phải có visual prototype cho các màn hình lõi.
- Prototype phải được review trước implementation.
- Không tuyên bố có Figma nếu chưa tạo file Figma thật.

## D-017 Visual Prototype Baseline

- Commit `b58d5d8` là baseline trực quan cho mobile.
- Prototype HTML/CSS/JavaScript là tài liệu thiết kế tương tác, không phải source production.
- React Native phải bám Screen ID, token, component và UI state từ baseline.
- Prototype không được dùng làm production web application.
- Mọi thay đổi UI lớn sau baseline phải được review trước khi đưa vào React Native.

## D-018 Review Screenshot Policy

- Ảnh tự động trong `design/prototype/review-output/` là artifact kiểm thử local.
- Không commit mặc định.
- Chỉ ảnh được chọn cho báo cáo hoặc release evidence mới được sao chép vào `reports/screenshots/`.
- Ảnh chứa secret, token hoặc dữ liệu thật bị cấm commit.

## D-019 Tool Discovery and Installation

- Trước khi cài đặt mới hoặc tự code lại, Agent phải kiểm tra và ưu tiên công cụ, framework hoặc package chính thức có sẵn.
- Chỉ cài đặt công cụ khi nhiệm vụ thực sự cần, có nguồn chính thức, verified publisher, license tương thích, ưu tiên winget.
- Mọi công cụ, ứng dụng mới hoặc môi trường thực thi phải được ghi nhận đầy đủ vào `reports/ENVIRONMENT_TOOL_REGISTRY.md`.
- Dữ liệu lớn (SDK, images, cache, virtual devices, build artifacts) ưu tiên cấu hình lưu trữ tại ổ D:.
- Khi gặp UAC, đăng nhập tài khoản, thanh toán, điều khoản pháp lý hoặc quyền hệ điều hành nhạy cảm: Agent dừng thao tác và báo `BLOCKED_FOR_USER_ACTION`.

## D-020 Automated Application Control and Evidence

- Agent được phép mở, đóng và điều khiển các ứng dụng phục vụ WorkSphere (CLI, Docker, Android Studio, Android Emulator, Browser prototype).
- Agent được phép sử dụng CLI, ADB, browser automation, chụp screenshot và video ngắn phục vụ kiểm thử và báo cáo.
- Nghiêm cấm thu thập, ghi log hoặc chụp ảnh chứa thông tin cá nhân, mật khẩu, token, API key hoặc bí mật.
- Ảnh chụp tạm thời trong `design/prototype/review-output/` không được commit mặc định; chỉ ảnh đã duyệt mới được đưa vào `reports/screenshots/`.

## D-021 Proactive Execution Scope and Autonomy

- Tool Discovery and Installation Policy nhằm mở rộng khả năng thực thi và tính tự chủ lâu dài của Agent, không hạn chế các năng lực sẵn có.
- Trong mọi nhiệm vụ tiếp theo, Agent được chủ động: phát hiện ứng dụng/service; tìm CLI/shortcut/data path; mở service cần thiết; cài đặt công cụ chính thức còn thiếu khi cần; cấu hình tích hợp; điều khiển qua CLI/ADB/automation; chạy build/test/emulator/container; thu thập telemetry/logs/screenshots; dừng tiến trình tự khởi chạy; và cập nhật registry.
- Không cần xin xác nhận riêng cho các thao tác không đặc quyền, có thể đảo ngược và chỉ ảnh hưởng môi trường WorkSphere.
- Chỉ báo `BLOCKED_FOR_USER_ACTION` khi thực sự có yêu cầu can thiệp từ người dùng (UAC, login, captcha, điều khoản EULA, payment, firewall, quyền Android nhạy cảm).
- Nếu ứng dụng không có CLI nhưng cần kiểm thử giao diện: được phép dùng UI/accessibility automation có kiểm soát với tiến trình mục tiêu đã xác minh, không click tọa độ mù, không truy cập dữ liệu cá nhân.

## D-022 Active Task Assignment Uniqueness

- Mỗi cặp `task_id` + `assignee_id` chỉ có tối đa một bản ghi phân công đang hoạt động (`is_active = TRUE`).
- PostgreSQL partial unique index `uk_task_assignments_active` (migration `V012`) là hàng rào toàn vẹn dữ liệu cuối cùng ở mức database engine.
- Kiểm tra `existsByTaskIdAndAssigneeIdAndActiveTrue` ở tầng application service chỉ đóng vai trò fail-fast.
- Bản ghi phân công đã hết hiệu lực (`is_active = FALSE`) không cản trở việc tái phân công (reassign) thành viên đó trong tương lai.
- Trước khi deploy migration V012 lên bất kỳ môi trường nào có dữ liệu lịch sử, bắt buộc thực hiện theo đúng Runbook tiền kiểm tại `reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md`.
- Tuyệt đối không tự động xóa hoặc deactivate dữ liệu trùng lặp trên môi trường production khi chưa có phê duyệt chính thức từ người có thẩm quyền nghiệp vụ.

## D-023 Task Comment Ownership and Scope

- Chỉ tác giả bình luận (`author_id`) hoặc Quản trị viên hệ thống chuẩn mực (`ADMIN`) mới có quyền chỉnh sửa hoặc xóa bình luận.
- Vai trò `PROJECT_MANAGER` không tự động có quyền sửa hoặc xóa bình luận của người khác nếu không phải là tác giả và không mang quyền System Admin.
- Bình luận phản hồi (parent comment) bắt buộc phải thuộc cùng Task và chưa bị xóa mềm (`is_deleted = FALSE`).

## D-024 Task Hierarchy Cycle Detection Policy

- Chu trình phân cấp công việc được phát hiện chính xác bằng tập hợp định danh tổ tiên đã duyệt (`Set<UUID> visited`).
- Không áp dụng giới hạn nghiệp vụ tùy tiện 50 cấp; chuỗi phân cấp hợp lệ sâu hơn 50 cấp không bị xem là chu trình lỗi.
- Công việc cha bắt buộc phải tồn tại, không bị xóa mềm (`is_deleted = FALSE`) và phải thuộc cùng dự án (`project_id`).

## D-025 Java 21 Validation Evidence and Test Matrix

- Dự án WorkSphere giữ nguyên mục tiêu biên dịch bytecode chuẩn là Java 21 (`<java.version>21</java.version>`, tương đương `javac -release 21`).
- Môi trường Windows host hiện sử dụng JDK 27 để thực thi full regression integration suite (100/100 tests PASS với Testcontainers PostgreSQL).
- Image Docker chính thức `eclipse-temurin:21-jdk` đóng vai trò môi trường đối chuẩn Java 21 có thể tái lập độc lập (Compile PASS, Checkstyle 0 violations, Unit tests 16/16 PASS, H2 context 1/1 PASS).
- Không tuyên bố full Java 21 integration PASS nếu Testcontainers chưa chạy trong môi trường Java 21 (do Docker socket có chủ đích không được mount vào container tạm để bảo vệ an toàn hệ thống).
- Jenkins pipeline hoặc môi trường CI/CD chuyên dụng với Docker socket an toàn là kênh mong muốn để thực thi toàn bộ integration test matrix trên Java 21.

## D-026 Web Runtime and Browser Automation Authorization

- Mở rộng năng lực thực thi cho Agent khi WorkSphere có giao diện web, prototype web, trang quản trị, tài liệu web, Jenkins UI hoặc cần kiểm thử qua trình duyệt. Quyền này có hiệu lực lâu dài cho mọi nhiệm vụ WorkSphere tiếp theo.
- Agent được chủ động: phát hiện trình duyệt đã cài; xác định executable path và version; mở trình duyệt khi task cần; dùng headless browser (`--headless=new`); dùng profile tạm riêng cho WorkSphere; chạy local HTTP server chỉ bind localhost (`127.0.0.1`); điều hướng, nhập dữ liệu test, bấm nút, kiểm tra DOM; thu thập console log, network status và HTTP response; chụp screenshot; quay video kiểm thử ngắn; kiểm tra responsive viewport; kiểm tra accessibility; kiểm thử website/prototype WorkSphere; kiểm tra Jenkins UI; và dừng browser/server do Agent tự khởi chạy.
- Agent không cần xin phép riêng cho thao tác không đặc quyền, có thể đảo ngược và chỉ ảnh hưởng môi trường WorkSphere.

## D-027 Browser Tool Hierarchy, Storage Isolation, and Security

- Thứ tự ưu tiên công cụ trước khi cài mới:
  1. Microsoft Edge đã cài trên Windows host.
  2. Khả năng headless có sẵn của Edge (`msedge.exe --headless=new`).
  3. Browser automation đang có trong Antigravity.
  4. Microsoft Edge WebDriver chính thức từ Microsoft phù hợp phiên bản Edge (lưu ngoài repository tại `D:\AI\Tools\EdgeWebDriver\<version>`).
  5. Selenium hoặc Playwright chỉ khi task thực sự cần. Không cài nhiều framework trùng chức năng.
- Phân bổ lưu trữ và cách ly tuyệt đối ngoài repository `D:\WorkSphere`:
  - `D:\AI\Tools\EdgeWebDriver\<version>`
  - `D:\AI\Profiles\Edge\WorkSphere` (profile test riêng biệt, cấm truy cập profile Edge cá nhân của người dùng)
  - `D:\AI\Cache\Edge`
  - `D:\AI\Temp\Edge`
- An toàn dữ liệu và bằng chứng kiểm thử:
  - Ảnh tạm: `design/prototype/review-output/` (không commit mặc định).
  - Ảnh báo cáo: `reports/screenshots/` (chỉ commit khi đã kiểm tra không chứa secret, token, mật khẩu, Authorization header, API key, hay dữ liệu cá nhân thật).
  - Nghiêm cấm commit: browser installer, browser binary, WebDriver executable (`msedgedriver.exe`), browser profile, cookie, cache, downloads tạm, hoặc file HAR chứa token.
- Mạng và Web Frontend tương lai:
  - Local server chỉ bind `127.0.0.1`. Cấm bind `0.0.0.0`, cấm mở port public ra Internet, cấm tắt firewall.
  - Không tự tạo Web Frontend nếu Roadmap không yêu cầu; tuân thủ nghiêm ngặt license khi tái sử dụng mã nguồn.
