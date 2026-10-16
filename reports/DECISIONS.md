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

## D-028 Phase 8 Local Storage Baseline

- Môi trường Development và Test sử dụng nhà cung cấp lưu trữ cục bộ (`LocalFileSystemStorageService`).
- Thư mục gốc lưu trữ được cấu hình qua biến môi trường `WORKSPHERE_STORAGE_PATH` (hoặc thuộc tính `worksphere.storage.path`), mặc định `D:/WorkSphereData/uploads` trên Windows và có thể ghi đè linh hoạt trên Linux/container.
- Đường dẫn vật lý tuyệt đối của file trên filesystem máy chủ tuyệt đối không xuất hiện trong API response, headers, body hoặc log trả về cho client.
- Định danh lưu trữ (`storagePath`) là relative server-generated key có định dạng `<purpose>/<yyyy>/<MM>/<fileId>.<extension>`, được sinh ngẫu nhiên bằng UUID trên máy chủ và chỉ quản lý nội bộ.
- Tên tệp gốc từ phía client (`originalFilename`) chỉ được lưu dưới dạng metadata và phục vụ việc xây dựng header `Content-Disposition` tuân thủ chuẩn RFC 5987 (UTF-8).
- Nhà cung cấp lưu trữ cho môi trường Production (Amazon S3, MinIO, Azure Blob Storage) tiếp tục được hoãn quyết định cho đến các giai đoạn triển khai hạ tầng đám mây.

## D-029 File Type and Archive Security

- Tuyệt đối không tin cậy header `Content-Type` hoặc phần mở rộng (`extension`) do phía client gửi lên.
- Các định dạng tệp ảnh và PDF (JPEG, PNG, WEBP, PDF) bắt buộc phải được xác thực bằng magic bytes / signature nhị phân thực tế của tệp.
- Các định dạng tài liệu Office OpenXML (DOCX, XLSX) bắt buộc phải được xác thực cấu trúc nội dung ZIP bên trong luồng bộ nhớ mà không được giải nén ra hệ thống tệp đĩa.
- Kiểm tra an toàn tệp nén (ZIP safety) bắt buộc phải thực thi các giới hạn tài nguyên nghiêm ngặt:
  - Số lượng entry tối đa: `MAX_ZIP_ENTRIES = 200`.
  - Dung lượng giải nén tối đa cho mỗi entry: `MAX_ENTRY_UNCOMPRESSED_SIZE = 50 MB`.
  - Tổng dung lượng giải nén tích lũy tối đa: `MAX_TOTAL_UNCOMPRESSED_SIZE = 100 MB`.
  - Tỷ lệ nén tối đa: `MAX_COMPRESSION_RATIO = 100.0` (kiểm tra cả tỷ lệ khai báo trong metadata header và tỷ lệ thực tế theo dõi luồng thời gian thực qua `CountingInputStream`).
  - Nghiêm cấm mọi dạng path traversal (`..`), dấu gạch chéo ngược (`\`), đường dẫn tuyệt đối (`/`), hoặc ký hiệu ổ đĩa (`C:`) trong tên entry của tệp nén.

## D-030 File Access Follows Business Linkage

- Quyền tải xuống và truy cập tệp tuân thủ chặt chẽ liên kết nghiệp vụ thực tế, không cho phép truy cập chỉ bằng việc đoán định danh `fileId`:
  - Tệp chưa liên kết (`unlinked`): chỉ người tải lên ban đầu (`uploaded_by`) hoặc Quản trị viên hệ thống (`ADMIN`) mới được phép truy cập.
  - Tệp đã gắn kết với công việc (`task_attachments`): quyền tải xuống kế thừa trạng thái thành viên hoạt động (`active`) của dự án chứa công việc đó. Thành viên không thuộc dự án hoặc thành viên đã bị hủy kích hoạt (`INACTIVE`) bị từ chối truy cập (HTTP 403 `FILE_ACCESS_DENIED`).
  - Tệp đã gắn kết với yêu cầu dịch vụ (`service_attachments`): quyền tải xuống thuộc về người tạo yêu cầu, kỹ thuật viên được phân công, hoặc Quản trị viên.
- Tệp đang được liên kết với công việc hoặc yêu cầu dịch vụ tuyệt đối không được phép xóa thông qua File API (HTTP 422 `FILE_ALREADY_LINKED`), nhằm đảm bảo tính toàn vẹn của lịch sử nghiệp vụ.

## D-031 Task Attachment Transaction

- Danh sách định danh tệp đính kèm (`attachmentFileIds`) được xử lý và gắn kết nguyên tử trong cùng transaction lưu trữ bình luận công việc (`TaskComment`).
- Tất cả các tệp đính kèm phải được kiểm tra hợp lệ trước khi thực hiện ghi dữ liệu: phải tồn tại, có trạng thái `ACTIVE`, mục đích `TASK_ATTACHMENT`, và người thực hiện phải là người tải lên tệp (hoặc Quản trị viên hệ thống).
- Nếu bất kỳ một tệp đính kèm nào không hợp lệ, toàn bộ transaction của bình luận và đính kèm phải bị rollback, không tạo trạng thái dữ liệu dở dang.
- Số lượng tệp đính kèm (`attachmentCount`) hiển thị trên Task Detail và Task List được tính toán thông qua truy vấn gom nhóm theo mẻ (`countByTaskIdIn`), loại bỏ hoàn toàn nguy cơ N+1 queries.

## D-032 Filesystem Security Validation

- Hệ thống tệp lưu trữ cục bộ phải chủ động ngăn chặn việc thoát khỏi thư mục gốc thông qua symbolic link hoặc NTFS junction/reparse point bằng cách kiểm tra toàn bộ cây thư mục tổ tiên với `LinkOption.NOFOLLOW_LINKS` và đối chiếu với đường dẫn thực `rootLocation.toRealPath()`.
- Năng lực phòng vệ symlink escape đã được xác minh thành công trên hệ thống tệp Linux thực tế thông qua Docker container Java 21 (`TESTED_ON_LINUX_CONTAINER`), chứng minh cả ba thao tác `store`, `load`, và `delete` đi qua symlink đều bị từ chối và tệp ngoài thư mục lưu trữ được bảo vệ tuyệt đối.
- Thao tác di chuyển tệp đích cuối cùng cấm sử dụng `StandardCopyOption.REPLACE_EXISTING`, kiểm tra sự tồn tại của tệp đích trước khi di chuyển để chống ghi đè dữ liệu tệp lưu trữ.
- Trên môi trường production, thư mục lưu trữ phải được bảo vệ bằng phân quyền người dùng cấp hệ điều hành; hệ thống thừa nhận technical debt về mặt lý thuyết rằng Java NIO portable API không thể loại bỏ tuyệt đối TOCTOU trước người dùng đã có quyền can thiệp trực tiếp filesystem máy chủ.

## D-033 IDE Extension Discovery, Installation and Automation Policy

- Mở rộng năng lực thực thi của Agent trong Antigravity IDE, không giới hạn các quyền đang có, hiệu lực lâu dài cho mọi nhiệm vụ tiếp theo.
- Agent được chủ động: phát hiện extension đã cài; kiểm tra enabled/disabled, version, publisher, location; sử dụng command, view, task, debugger, language server, API của extension; enable extension khi cần; disable tạm extension xung đột; cài extension còn thiếu từ nguồn chính thức; nâng cấp extension; reload window khi cần; cập nhật reports/ENVIRONMENT_TOOL_REGISTRY.md.
- Nguyên tắc ưu tiên:
  1. Tính năng có sẵn trong Antigravity.
  2. Extension đã cài nhưng chưa enable.
  3. Khả năng hoàn thành nhiệm vụ của extension hiện có.
  4. Chỉ cài mới khi không có giải pháp tương đương, từ publisher chính thức/uy tín, tương thích license/bảo mật.
  5. Tránh cài extension trùng lặp chức năng. GitLens được ưu tiên hơn Git History khi đã bao quát đủ lịch sử/blame/diff. Microsoft Edge Tools ưu tiên cho web/prototype debug. Docker extension bổ trợ Docker CLI nhưng không thay thế lệnh CLI bắt buộc. Markdownlint dùng phát hiện lỗi cú pháp Markdown nhưng không tự sửa nội dung canonical ngoài phạm vi task.
- Không cần xin phép riêng cho thao tác không đặc quyền, có thể đảo ngược và chỉ ảnh hưởng môi trường WorkSphere.
- Chỉ báo `BLOCKED_FOR_USER_ACTION` khi gặp: đăng nhập Marketplace/Microsoft/GitHub/Google; xác nhận publisher không tin cậy; EULA/license thương mại; Windows UAC/Admin; hoặc extension đòi gửi source WorkSphere ra ngoài.

## D-034 Database Extension and Development Safety Policy

- WorkSphere sử dụng PostgreSQL. Agent ưu tiên: PostgreSQL CLI/psql, Testcontainers PostgreSQL, SQLTools với PostgreSQL driver phù hợp.
- SQL Server (mssql) có thể giữ nếu phục vụ dự án khác, nhưng cấm dùng làm công cụ chính cho WorkSphere, cấm tạo connection SQL Server cho WorkSphere, cấm đổi schema hoặc sửa migration PostgreSQL để tương thích mssql.
- Tuyệt đối không lưu database password/credentials vào repository, workspace settings được Git theo dõi, screenshot, raw logs hay extension connection export.
- Workspace settings (`.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/tasks.json`): chỉ tạo/sửa khi được phép, cấm chứa machine-specific path hoặc secret.
- Cấm commit: extension binaries, VSIX, cache, token, profile, cookie, settings cá nhân, credentials.

