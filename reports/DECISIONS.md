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

- WorkSphere sử dụng PostgreSQL là database canonical và mặc định. Agent ưu tiên: PostgreSQL CLI/psql, Testcontainers PostgreSQL, SQLTools với PostgreSQL driver phù hợp.
- SQL Server (mssql) đã cài và được phép sử dụng khi một nhiệm vụ WorkSphere cụ thể chứng minh cần thiết. "Không ưu tiên" không đồng nghĩa với "cấm sử dụng".
- Tuyệt đối không tự chuyển schema, Flyway migration hoặc runtime database sang SQL Server; không sửa migration PostgreSQL chỉ để tương thích mssql.
- Tuyệt đối không lưu database password/credentials vào repository, workspace settings được Git theo dõi, screenshot, raw logs hay extension connection export.
- Workspace settings (`.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/tasks.json`): chỉ tạo/sửa khi được phép, cấm chứa machine-specific path hoặc secret.
- Cấm commit: extension binaries, VSIX, cache, token, profile, cookie, settings cá nhân, credentials.

## D-035 Service Attachment Response Projection (IMPLEMENTATION_RESPONSE_PROJECTION)

- Canonical `06_API_CONTRACT.md` Section 13.4 chỉ định "Tệp đính kèm" trong response chi tiết yêu cầu dịch vụ mà không định nghĩa cấu trúc JSON schema chi tiết.
- Chuẩn hóa cấu trúc chiếu triển khai (nhãn: `IMPLEMENTATION_RESPONSE_PROJECTION`, không gọi là canonical schema) `ServiceAttachmentResponse` gồm 7 trường:
  - `fileId` (UUID): ID tệp lưu trữ trong `stored_files`.
  - `originalName` (String): Tên tệp gốc từ phía client.
  - `mimeType` (String): Định dạng MIME đã xác thực.
  - `sizeBytes` (Long): Dung lượng tệp tính bằng byte (thống nhất tuyệt đối theo naming convention thực tế của `FileUploadResponse` và `StoredFile`, không dùng `fileSize`).
  - `downloadUrl` (String): Đường dẫn tải tệp `/api/v1/files/{fileId}/download`.
  - `uploadedBy` (UUID): ID người tải tệp lên.
  - `createdAt` (Instant): Thời điểm đính kèm tệp vào yêu cầu dịch vụ (lấy từ trường `service_attachments.created_at`, phân biệt rõ ràng với `StoredFile.createdAt` là thời điểm tệp vật lý được tải lên hệ thống).
- Cấu trúc này khớp 100% với naming convention thực tế của `FileUploadResponse` và `StoredFile` từ Phase 8.
- Đây là implementation response projection nhúng trong `ServiceRequestDetailResponse.attachments`, không mở thêm endpoint REST mới, không làm thay đổi hợp đồng canonical.

## D-036 Service Request Single Active Assignment and Database Invariants

- **Cardinality**: Mỗi Service Request tại một thời điểm chỉ có tối đa **MỘT** kỹ thuật viên/người xử lý đang hoạt động (`active cardinality = 0..1`), căn cứ `02_USER_ROLES_AND_WORKFLOWS.md` Section 6.3, `05_DATABASE_DESIGN.md` Section 9.3, và `06_API_CONTRACT.md` Section 13.4/13.6 ("Người xử lý" - số ít; payload phân công chỉ chứa `assigneeId` đơn).
- **Hàng rào Database & Khoảng trống Schema**:
  - Việc chỉ dựa vào kiểm tra ở tầng Application Service không thể bảo vệ hệ thống trước hai transaction phân công đồng thời (race condition).
  - Ghi nhận: `SERVICE_ASSIGNMENT_CONCURRENCY_SCHEMA_GAP`.
  - Database PostgreSQL bắt buộc phải là hàng rào toàn vẹn cuối cùng thông qua partial unique index:
    ```sql
    CREATE UNIQUE INDEX uk_service_assignments_one_active
    ON service_assignments(request_id)
    WHERE is_active = TRUE;
    ```
  - Tuyệt đối không dùng `(request_id, assignee_id) WHERE is_active = TRUE` vì index theo cặp vẫn cho phép hai kỹ thuật viên khác nhau (User A và User B) cùng ở trạng thái active trên cùng một request.
- **Kế hoạch Migration Phase 9**:
  - Tạo migration `V013__add_service_request_assignment_invariants.sql` khi bắt đầu triển khai Phase 9 (không tạo trong đợt decision này).
  - Tuyệt đối không sửa `V001`-`V012`.
  - Không âm thầm xóa hoặc deactivate dữ liệu cũ; bắt buộc chạy preflight query kiểm tra vi phạm theo Runbook `reports/runbooks/V013_SERVICE_ASSIGNMENT_UNIQUENESS_PLAN.md`.
- **Giao thức Khóa và Reassignment Transaction**:
  1. **Row coordination lock**: Khóa bản ghi `ServiceRequest` bằng `ServiceRequestRepository.findByIdForUpdate(UUID id)` với `@Lock(LockModeType.PESSIMISTIC_WRITE)` và timeout 5000ms (`jakarta.persistence.lock.timeout` = 5000) hoặc native `SELECT ... FOR UPDATE`. Không dựa vào khóa row `service_assignments` vì bản ghi assignment có thể chưa tồn tại khi yêu cầu mới được tạo.
  2. **Thứ tự giao dịch (Transaction Ordering)**: Luôn khóa `ServiceRequest` trước, sau đó mới truy vấn / ghi `service_assignments` để loại bỏ nguy cơ deadlock chéo bảng.
  3. **Nguyên tắc giữ lock**: Tuyệt đối không giữ lock trong các thao tác File I/O, gửi email, push notification hay gọi network bên ngoài. Các tác vụ này phải thực hiện bất đồng bộ sau khi transaction đã commit.
  4. **Kiểm tra quyền actor**: Xác thực actor có quyền `SERVICE_REQUEST_ASSIGN`.
  5. **Xác thực assignee mới**: Kiểm tra user tồn tại, đang hoạt động (`ACTIVE`), không bị xóa mềm.
  6. **Tìm active assignment hiện tại**: `findActiveByRequestId(requestId)`.
  7. **Idempotency**: Nếu `assigneeId` mới trùng với `assigneeId` hiện tại đang active, trả về kết quả hiện tại mà không tạo row trùng lặp.
  8. **Cập nhật & Chèn mới**:
     - Nếu khác `assigneeId`: Set `old.is_active = FALSE`, `old.unassigned_at = server Clock time`.
     - Thực hiện flush (`saveAndFlush`) để giải phóng slot active trong partial index.
     - Tạo bản ghi mới: `id = UUID.randomUUID()`, `requestId`, `assigneeId = newAssigneeId`, `assignedBy = principal.userId()`, `assignedAt = server Clock time`, `isActive = TRUE`.
  9. Cam kết toàn bộ trong cùng `@Transactional`. `assigned_by` lấy từ Security Principal, không tin cậy dữ liệu client gửi lên.
  10. Trong môi trường đồng thời, chỉ một transaction thành công; transaction kia bị chặn bởi partial unique index.
- **Error Mapping & Khoảng trống mã lỗi**:
  - Khi partial unique index `uk_service_assignments_one_active` bị vi phạm: Duyệt qua `SQLException` cause chain, bắt buộc SQLState phải là `23505`, và tên constraint phải khớp chính xác `uk_service_assignments_one_active`. Không sử dụng `message.contains("service_assignments")` làm fallback rộng. Không map các lỗi Foreign Key (23503) hay Not Null (23502) thành xung đột phân công. Toàn bộ transaction phải rollback.
  - **Đề xuất thiết kế mã lỗi**: `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict, Message: "Yêu cầu dịch vụ đang được phân công đồng thời hoặc trạng thái phân công đã thay đổi. Vui lòng tải lại dữ liệu và thử lại.").
    - Khác biệt với validation error (400 `VALIDATION_ERROR`): Định dạng UUID và thông tin assignee hợp lệ về mặt cú pháp.
    - Khác biệt với optimistic lock (409 `OPTIMISTIC_LOCK_CONFLICT`): Bị kích hoạt bởi partial unique index trên `service_assignments`, không phải do lệch `@Version` trên `service_requests`.
    - Khác biệt với assignee inactive/not found: Trả về `USER_NOT_FOUND` hoặc `USER_INACTIVE`.
  - **Quy tắc Governance & Kết quả vá Canonical**: Mã lỗi `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict, Message: "Yêu cầu dịch vụ đang được phân công đồng thời hoặc trạng thái phân công đã thay đổi. Vui lòng tải lại dữ liệu và thử lại.") đã được cập nhật chính thức vào [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 13.6 và 20.6. `SERVICE_ASSIGNMENT_ERROR_CODE_GAP` đã được giải quyết triệt để.

## D-037 Request Number Concurrency, Two-Key Advisory Lock, and Non-Gapless Sequence

- Format canonical là `SR-YYYY-NNNNNN` (ví dụ: `SR-2026-000001`).
- Áp dụng phương án **PostgreSQL Two-Key Transactional Advisory Lock**:
  ```sql
  SELECT pg_advisory_xact_lock(1301, :year);
  ```
  1. `1301` là integer constant đại diện cho module Service Request numbering, loại bỏ hoàn toàn nguy cơ đụng độ chuỗi băm (hash collision) của 64-bit `hashtext`.
  2. `:year` lấy từ `java.time.Clock` được inject kết hợp business ZoneId (`ZoneId.of("Asia/Ho_Chi_Minh")`), không lấy year từ client.
  3. Truy vấn sequence sau khóa trong cùng transaction:
     ```sql
     SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS INTEGER)), 0) + 1
     FROM service_requests
     WHERE request_number LIKE 'SR-' || :year || '-%';
     ```
  4. Đã kiểm chứng thực tế trên PostgreSQL 15: `SUBSTRING('SR-2026-000001' FROM 9)` trả về chuỗi `000001` và `CAST(... AS INTEGER)` trả về `1`.
  5. Khóa giao dịch tự động giải phóng khi commit hoặc rollback.
  6. Ràng buộc `uk_service_requests_request_number` (tạo từ `V010`) là hàng rào duy nhất cuối cùng ở mức database.
  7. Kiểm thử đồng thời (concurrent create test) bắt buộc chạy đa luồng thực tế với các transaction và EntityManager độc lập, không dùng chung context luồng.
  8. Kiểm thử kịch bản chuyển giao năm (year rollover) và kiểm thử transaction rollback.
  9. **Tính chất Non-Gapless và Tái sử dụng số**:
     - MAX + 1 trong cùng transactional advisory lock thường có thể tái sử dụng số sau rollback vì row chưa commit ra khỏi transaction.
     - Hệ thống không tuyên bố chuỗi số là "gapless tuyệt đối" và không coi rollback luôn làm mất số thứ tự.
  10. Nếu advisory lock query gặp database timeout: Sử dụng infrastructure error mapping hiện có, không phát minh mã lỗi nghiệp vụ mới.

## D-038 Service Category Hierarchy and Cycle Prevention

- `parentId` trỏ tới danh mục cha trong `service_categories`.
- Điều kiện hợp lệ khi gán `parentId`: Danh mục cha phải tồn tại, đang hoạt động (`is_active = TRUE`), chưa bị xóa mềm (`is_deleted = FALSE`), và không được là chính nó (`parentId != id`).
- Ngăn ngừa chu trình (cycle detection): Duyệt chuỗi tổ tiên bằng `Set<UUID> visited`. Nếu gặp ID của chính danh mục đang cập nhật thì từ chối ngay. Không áp đặt giới hạn depth tùy tiện.

## D-039 File Delete Memory Inaccuracy Correction

- Xác nhận chính thức rằng mã nguồn `FileController.java` và test suite `FileMockMvcTest.java` hiện thực endpoint `DELETE /api/v1/files/{fileId}` trả về **HTTP 200 OK** kèm body `ApiResponse<Void>` (chứa `success: true`).
- Đính chính các ghi chú trong báo cáo bộ nhớ trước đây từng ghi nhầm là `204 No Content`. Không sửa `FileController` hay `PHASE_08_REPORT.md`.

## D-040 Service Category Canonical Error Codes

- Xác minh đối chiếu với [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 20.6:
  1. `SERVICE_CATEGORY_NOT_FOUND` (HTTP 404): Có trong canonical contract (YES). Dùng cho `GET/PUT/PATCH /admin/service-categories/{id}` và `POST /service-requests` khi categoryId không tồn tại.
  2. `SERVICE_CATEGORY_CODE_ALREADY_EXISTS` (HTTP 409): Có trong canonical contract (YES). Thay thế cho tên ad-hoc `SERVICE_CATEGORY_CODE_DUPLICATE`.
  3. `SERVICE_CATEGORY_PARENT_INVALID` (HTTP 400): Có trong canonical contract (YES). Dùng khi danh mục cha không tồn tại hoặc không hợp lệ, thay thế tên ad-hoc `PARENT_CATEGORY_NOT_FOUND`.
  4. `SERVICE_CATEGORY_CYCLE_DETECTED` (HTTP 400): Có trong canonical contract (YES). Dùng khi phát hiện chu trình danh mục, thay thế tên ad-hoc `CATEGORY_CYCLE_DETECTED`.
  5. `SERVICE_CATEGORY_ALREADY_INACTIVE` (HTTP 400): Có trong canonical contract (YES). Dùng khi deactivate danh mục đã ngưng hoạt động.
  6. `SERVICE_CATEGORY_ALREADY_ACTIVE` (HTTP 400): Có trong canonical contract (YES). Dùng khi activate danh mục đang hoạt động.
  7. `SERVICE_CATEGORY_IN_USE` (HTTP 400): Có trong canonical contract (YES). Dùng khi thao tác vi phạm ràng buộc danh mục đang được sử dụng.
- **Kết luận**: Tất cả các mã lỗi cần thiết cho Service Category đều đã có sẵn trong canonical contract dưới tên chuẩn `SERVICE_CATEGORY_*`. Không tồn tại `SERVICE_CATEGORY_ERROR_CODE_GAP` nếu implementation tuân thủ đúng tên canonical.

## D-041 Authorization Role-Permission Audit, Migration Decoupling, and Blockers

- **Kết quả kiểm toán cơ sở dữ liệu và mã nguồn**:
  - `ROLE_PERMISSION_SEED_GAP_CONFIRMED`: Bản di trú `V011__seed_roles_and_permissions.sql` chỉ seed bảng `roles` (4 dòng) và `permissions` (29 dòng); bảng `role_permissions` có **0 dòng**.
  - `TEST_AUTHORITY_FIXTURE_MASKS_SEED_GAP`: Các test suite integration/MockMvc hiện tại (`AdminUserMockMvcTest`, `DepartmentMockMvcTest`, `ProjectMockMvcTest`, `TaskMockMvcTest`, `TaskAttachmentMockMvcTest`) đều tự động chạy lệnh `INSERT INTO role_permissions` trong `@BeforeEach`, che giấu khoảng trống dữ liệu seed của môi trường production.
  - `ROLE_PERMISSION_CANONICAL_MATRIX_GAP`: Đã được giải quyết bằng việc thiết lập bảng ma trận chính thức trong `02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6.
  - `SERVICE_AUTHORIZATION_MAPPING_GAP`: Đã giải quyết bằng việc cấp `SERVICE_REQUEST_ASSIGN` chính thức cho `ADMIN` trong MVP.
- **Quy tắc phân quyền và Admin Bypass**:
  - Endpoint bảo vệ bởi `@PreAuthorize("hasAuthority('...')")`. Khi `role_permissions` trống, `authorities` chỉ có `ROLE_<ROLE_CODE>`, không có permission nào.
  - Hệ thống không có cơ chế bypass cho Admin; do đó trên production, mọi user (kể cả Admin) sẽ bị HTTP 403 Forbidden nếu không có dữ liệu trong `role_permissions`.
  - Vai trò `TEAM_LEADER` chỉ quản lý công việc dự án/nhóm (`TASK_ASSIGN`), không có thẩm quyền phân công yêu cầu dịch vụ (`SERVICE_REQUEST_ASSIGN`). Tuyệt đối không suy diễn cấp quyền chỉ vì tên chức danh.
- **Kế hoạch Migration Phase 9**:
  - Tách biệt hai bản migration (Phương án B):
    1. `V013__add_service_request_assignment_invariants.sql`: Chỉ tạo partial unique index `uk_service_assignments_one_active` trong domain Service Request.
    2. `V014__seed_role_permissions.sql`: Seed dữ liệu liên kết vai trò - quyền hạn sau khi tài liệu canonical hoàn tất phê duyệt ma trận phân quyền chính thức.
  - Sử dụng cú pháp idempotent `INSERT INTO role_permissions ... ON CONFLICT (role_id, permission_id) DO NOTHING`.

## D-042 Canonical Role-Permission Matrix Resolution and Foundation Authorization Remediation

- **Ma trận phân quyền Canonical chính thức**:
  - Đã bổ sung Section 2.6 vào [02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md).
  - Phân bổ 29 permissions cho 4 System Roles:
    - `ADMIN`: 29 permissions (toàn bộ quyền hệ thống).
    - `PROJECT_MANAGER`: 19 permissions (các quyền tự phục vụ, quản lý dự án phụ trách và quản lý công việc).
    - `TEAM_LEADER`: 14 permissions (kế thừa tự phục vụ của nhân viên, bổ sung `TASK_CREATE`, `TASK_ASSIGN`, `TASK_UPDATE_STATUS`).
    - `EMPLOYEE`: 12 permissions (chỉ gồm các quyền tự phục vụ cá nhân, cập nhật công việc được giao và các yêu cầu dịch vụ của chính mình).
  - Bảng quyền hạn hệ thống chỉ đóng vai trò là "cổng kiểm tra toàn cục" (`hasAuthority(...)`); các Application Service bắt buộc tiếp tục kiểm tra các ràng buộc quan hệ nghiệp vụ cục bộ (`project membership`, `requester`, `active assignee`, `resource ownership`).
- **Hiện thực di trú CSDL**:
  - `V013__add_service_request_assignment_invariants.sql`: Tạo thành công partial unique index `uk_service_assignments_one_active` trên `service_assignments(request_id) WHERE is_active = TRUE`.
  - `V014__seed_role_permissions.sql`: Seed 74 bản ghi liên kết quyền hạn chính thức vào `role_permissions` với cơ chế idempotent `ON CONFLICT (role_id, permission_id) DO NOTHING`.
- **Kiểm thử xác thực sạch (Clean-Migration Auth Test)**:
  - Bổ sung `RolePermissionSeedIntegrationTest.java` chạy trên PostgreSQL Testcontainers sạch.
  - Kiểm thử đăng nhập thật qua `/api/v1/auth/login`, nhận JWT thật và gửi request tới các endpoint bảo vệ bằng `@PreAuthorize`.
  - Tuyệt đối không có bất kỳ câu lệnh chèn fixture thủ công nào vào `role_permissions` trong test này. Toàn bộ quyền hạn được nạp 100% từ migration `V014`.
  - Kiểm tra độc lập quyền `SERVICE_REQUEST_ASSIGN`: Admin được phép, Team Leader / PM / Employee bị từ chối với HTTP 403 Forbidden.
  - Toàn bộ 177/177 bài kiểm thử của repository và 0 lỗi Checkstyle đều PASS với exit code 0.

## D-043 Project Member Access Remediation, Canonical Matrix Hardening, and V015 Migration

- **Bối cảnh**:
  - Kiểm toán độc lập phát hiện `PROJECT_READ_PERMISSION_MATRIX_RISK`: `ProjectController` bảo vệ endpoint `GET /projects/{projectId}`, `GET /projects/{projectId}/members`, `GET /projects/{projectId}/milestones` bằng `@PreAuthorize("hasAuthority('PROJECT_READ')")`.
  - Trong ma trận V014 trước đây, `PROJECT_READ` chỉ được cấp cho `ADMIN` và `PROJECT_MANAGER`. Do đó, nhân viên (`EMPLOYEE`) và trưởng nhóm (`TEAM_LEADER`) dù là thành viên dự án đang hoạt động (`active project member`) cũng bị chặn bởi cổng bảo vệ Spring Security với HTTP 403 Forbidden trước khi request đến được tầng nghiệp vụ.
  - Kiểm toán cũng phát hiện `ROLE_PERMISSION_SEED_SILENT_OMISSION_RISK` do câu lệnh `INSERT ... SELECT WHERE p.code IN (...)` có thể im lặng bỏ sót dòng nếu có lỗi chính tả, và `ROLE_PERMISSION_MATRIX_EVIDENCE_GAP` do lệch số section tham chiếu trong cột rationale của tài liệu canonical.
- **Quyết định điều chỉnh Ma trận Canonical**:
  - `PROJECT_READ` được chính thức cấp (`GRANTED`) cho toàn bộ 4 System Roles (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`).
  - Điều kiện quan hệ nghiệp vụ bắt buộc (`Business relation required`): Thành viên dự án đang hoạt động (`Active Project Member`) hoặc phạm vi quản trị canonical của `ADMIN`.
  - Quyền `PROJECT_READ` toàn cục đóng vai trò cổng xác thực; tầng Application Service/Repository bắt buộc tiếp tục kiểm tra quyền thành viên và phân quyền dữ liệu.
  - Hiệu chỉnh toàn bộ các tham chiếu số section bị lệch trong cột rationale của `docs/02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6 (trỏ đúng Section 11 cho Project, Section 12 cho Task, Section 17 cho Admin/User/Department, Section 18 cho Audit).
- **Di trú CSDL V015 (Bất biến V014)**:
  - Giữ nguyên V001–V014 để bảo toàn checksum Flyway.
  - Tạo mới `V015__correct_project_read_permissions_and_validate_role_matrix.sql`:
    1. Cấp bổ sung `PROJECT_READ` cho `TEAM_LEADER` và `EMPLOYEE`.
    2. Bổ sung `DO $$ ... END $$;` block thực hiện strict validation guard, fail-fast nếu sai số lượng mapping:
       - roles = 4, permissions = 29.
       - ADMIN = 29, PROJECT_MANAGER = 19, TEAM_LEADER = 15, EMPLOYEE = 13.
       - Tổng mapping = 76.
       - `PROJECT_READ` có đủ trên cả 4 vai trò.
       - `SERVICE_REQUEST_ASSIGN` và `SERVICE_CATEGORY_MANAGE` chỉ duy nhất thuộc về `ADMIN`.
- **Kiểm thử và xác minh**:
  - Cập nhật `RolePermissionSeedIntegrationTest.java` với kịch bản kiểm tra exact set comparison (`EXPECTED EXCEPT ACTUAL = empty` và `ACTUAL EXCEPT EXPECTED = empty`).
  - Bổ sung kịch bản kiểm thử tích hợp truy cập chi tiết dự án (`GET /api/v1/projects/{projectId}`) cho `EMPLOYEE` và `TEAM_LEADER` là active project member, xác nhận trả về HTTP 200 OK thành công bằng JWT thật.
  - Cập nhật `ProjectMockMvcTest.java` để kiểm thử kiểm tra quyền truy cập dự án bằng token không có quyền (`unprivilegedToken`) thay cho `employeeToken`.

## D-044 Project Read Member-Scoped Access Control and Query-Level Enforcement

- **Bối cảnh & Phát hiện Kiểm toán**:
  - Kiểm toán mã nguồn phát hiện dữ liệu dự án bị rò rỉ (data leak):
    - `GET /api/v1/projects`: Trước đây không truyền thông tin người dùng xác thực xuống Application Service/Repository; câu lệnh query trả về toàn bộ dự án trong cơ sở dữ liệu mà không lọc theo quan hệ thành viên.
    - `GET /api/v1/projects/{projectId}`, `GET /api/v1/projects/{projectId}/members`, `GET /api/v1/projects/{projectId}/milestones`: Không kiểm tra xem người gọi có phải là active project member hoặc Admin không; người dùng unrelated hoặc inactive member chỉ cần có global `PROJECT_READ` là đọc được toàn bộ chi tiết, thành viên và mốc tiến độ của dự án.
- **Quy tắc Phân quyền Đọc Dự án theo Canonical**:
  - `ADMIN`: Có phạm vi quản trị toàn hệ thống theo canonical; được quyền xem toàn bộ dự án, danh sách thành viên và mốc tiến độ mà không yêu cầu phải là thành viên trong bảng `project_members`.
  - `EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`: Bắt buộc phải là thành viên đang hoạt động (`is_active = TRUE`) trong `project_members` của dự án đó mới được truy cập (`GET /projects/{projectId}`, `GET /projects/{projectId}/members`, `GET /projects/{projectId}/milestones`). Nếu không phải active member, trả về HTTP 403 Forbidden (`FORBIDDEN`).
  - Phân vùng truy vấn danh sách (`GET /api/v1/projects`):
    - Thực thi hoàn toàn tại tầng CSDL thông qua câu lệnh SQL JPQL:
      `AND (:memberUserId IS NULL OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :memberUserId AND pm.active = true))`
    - Tuyệt đối không tải toàn bộ vào Java rồi lọc in-memory sau phân trang.
    - Cả truy vấn dữ liệu và truy vấn đếm (`countQuery`) đều áp dụng cùng điều kiện scope, đảm bảo metadata phân trang (`totalElements`, `totalPages`) hoàn toàn chính xác.
    - Các tham số tìm kiếm (`search`), bộ lọc (`status`, `priority`, `managerId`, `departmentId`) và sắp xếp (`sort`) được kết hợp bằng `AND`, đảm bảo không bao giờ bị mất phạm vi (scope loss).
- **Hiện thực & Kiểm thử**:
  - Cập nhật `ProjectRepository.java`, `ProjectApplicationService.java`, `ProjectMemberApplicationService.java`, `MilestoneApplicationService.java`, `ProjectController.java`.
  - Thêm 5 kịch bản kiểm thử tích hợp toàn diện trong `RolePermissionSeedIntegrationTest.java` (Test 9, 10, 11, 12, 13) sử dụng login thật và JWT thật từ V015 trên PostgreSQL Testcontainers sạch:
    - Test 9: Active Employee & Team Leader đọc thành công detail, members, milestones và list (HTTP 200).
    - Test 10: Unrelated Employee bị từ chối 403 Forbidden trên detail, members, milestones; dự án không xuất hiện trong list (`totalItems = 0`).
    - Test 11: Inactive Member (`is_active = false`) bị từ chối 403 Forbidden trên detail, members, milestones; dự án không xuất hiện trong list.
    - Test 12: Multi-project database scoping (A=active, B=unrelated, C=inactive) chỉ trả về Project A với totalElements=1; search và sort bảo toàn scope.
    - Test 13: Admin truy cập toàn cục; Project Manager chỉ truy cập được dự án mình tham gia, bị từ chối 403 ở dự án không liên quan.
  - Toàn bộ suite 183/183 PASS và 0 lỗi Checkstyle.



