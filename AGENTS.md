# WorkSphere Agent Rules

## Repository

- Root: D:\WorkSphere
- Main branch: main
- Remote: origin
- Java target: 21
- Backend: Spring Boot Modular Monolith
- Database: PostgreSQL
- Migration: Flyway
- Mobile: React Native and TypeScript

## Canonical Sources

Only these ten documents are authoritative:

1. docs/01_PROJECT_SCOPE.md
2. docs/02_USER_ROLES_AND_WORKFLOWS.md
3. docs/03_MOBILE_SCREEN_MAP.md
4. docs/04_SYSTEM_ARCHITECTURE.md
5. docs/05_DATABASE_DESIGN.md
6. docs/06_API_CONTRACT.md
7. docs/07_FOUR_COURSE_MATRIX.md
8. docs/08_DEVELOPMENT_ROADMAP.md
9. docs/09_CODING_STANDARDS.md
10. docs/10_AI_AGENT_INSTRUCTIONS.md

Do not modify canonical documents unless the task explicitly requires a documentation change.

## Mandatory Startup

Every model and every new session must:

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Run git status --short.
6. Run git log --oneline --decorate -5.
7. Read only the canonical document sections relevant to the current task.
8. Verify all remembered facts against Git and files.
9. Never rely only on prior model chat memory.

## Safety

- Do not force push.
- Do not run git reset --hard.
- Do not run git clean -fd.
- Do not rebase main.
- Do not change origin.
- Do not commit real .env files.
- Do not commit passwords, tokens, API keys, secrets, or private keys.
- Do not rewrite executed Flyway migrations.
- Do not add roles, permissions, user statuses, tables, columns, or endpoints outside canonical documents.
- Do not move to another roadmap phase without a scoped task.
- Do not claim PASS without real command output, exit code 0, and BUILD SUCCESS.
- Do not commit or push if canonical documents changed outside task scope.
- Do not assume a command succeeded without checking its output.

## Work Method

- Build a task graph.
- Independent read-only tasks may run in parallel.
- Only one task may write a file at a time.
- Before commit: run build, tests, secret scan, and Git diff checks.
- After push: verify HEAD equals origin/main and working tree is clean.
- When provider or model changes, reread persistent project memory.
- If model output conflicts with Git or canonical documents, Git and canonical documents win.

## Runtime Tool Authorization

Agent được phép sử dụng trong nhiệm vụ WorkSphere khi cần:

- PowerShell và Terminal.
- Git.
- Maven Wrapper.
- Java 21.
- Docker CLI và Docker Desktop Engine.
- Testcontainers.
- PostgreSQL container.
- Node.js và npm khi mobile bắt đầu.
- Android SDK.
- ADB.
- Android Emulator.
- Gradle Wrapper.
- Logcat.
- Android screenshot và screen recording.
- Microsoft Edge và headless browser (`--headless=new`).
- Browser automation tích hợp cho prototype local, web UI, tài liệu và Jenkins.
- Edge WebDriver tải từ nguồn chính thức Microsoft khi nhiệm vụ thực sự cần.
- Local HTTP server kiểm thử chỉ bind localhost (127.0.0.1).
- Kiểm tra port và health endpoint.

Agent được phép tự động:

- Kiểm tra Docker Engine.
- Khởi động worksphere-dev-pg khi task cần database dev.
- Khởi động backend bằng profile đúng.
- Kiểm tra backend health.
- Kiểm tra adb devices.
- Chọn emulator-5554 khi đây là thiết bị duy nhất ở trạng thái device.
- Build Android Debug khi source mobile tồn tại.
- Cài debug APK.
- Mở và dừng ứng dụng WorkSphere.
- Chạy test.
- Thu logcat có lọc.
- Phát hiện trình duyệt, executable path và version (ưu tiên Microsoft Edge có sẵn trên Windows).
- Mở trình duyệt bằng headless mode (`--headless=new`) hoặc browser automation có sẵn trong Antigravity.
- Khởi chạy local HTTP server (127.0.0.1) phục vụ prototype hoặc kiểm thử web.
- Điều hướng, tương tác DOM, kiểm tra responsive viewport, kiểm tra accessibility, thu console log và HTTP status.
- Sử dụng profile kiểm thử riêng biệt tại `D:\AI\Profiles\Edge\WorkSphere`.
- Chụp screenshot phục vụ kiểm thử và báo cáo (ảnh tạm lưu tại `design/prototype/review-output/`, ảnh báo cáo lưu tại `reports/screenshots/`).
- Quay video ngắn phục vụ kiểm thử.
- Dừng tiến trình do Agent tự khởi chạy (backend, server test, emulator, browser process/profile của Agent).
- Xóa container tạm do Testcontainers tạo.

Agent không được:

- Xóa hoặc sửa jenkins-lts.
- Xóa Docker image, volume hoặc dữ liệu Docker.
- Xóa worksphere-dev-pg.
- Factory reset Android Emulator.
- Xóa AVD.
- Xóa Android SDK.
- Điều khiển thiết bị khác ngoài serial đã xác minh.
- Truy cập, sử dụng, sao chép hoặc can thiệp profile Edge cá nhân của người dùng (cookie, password, history, extension, tài khoản).
- Đóng cửa sổ trình duyệt cá nhân của người dùng.
- Tải browser, WebDriver, browser profile hoặc cache vào repository `D:\WorkSphere` (phải lưu tại `D:\AI\Tools\EdgeWebDriver\<version>`, `D:\AI\Profiles\Edge\WorkSphere`, `D:\AI\Cache\Edge`, `D:\AI\Temp\Edge`).
- Bind server 0.0.0.0 nếu task không yêu cầu.
- Mở port public ra Internet.
- Tắt firewall hoặc tự xác nhận Firewall prompt.
- Gửi dữ liệu WorkSphere tới website hoặc dịch vụ bên ngoài không được phép.
- Commit APK, AAB, keystore, logcat thô, video lớn, browser installer, browser binary, WebDriver executable (`msedgedriver.exe`), browser profile, cookie, cache hoặc HAR chứa token.
- Chụp hoặc commit secret, token, mật khẩu, Authorization header, API key hoặc dữ liệu cá nhân nhạy cảm.
- Tự xử lý hộp thoại tài khoản, thanh toán hoặc điều khoản pháp lý.
- Click mù khi gặp Windows UAC hoặc Android permission không rõ.

Nếu cần thao tác thủ công:

- Báo BLOCKED_FOR_USER_ACTION.
- Nêu chính xác hộp thoại và thao tác người dùng cần thực hiện.
- Không lặp vô hạn.

Nguyên tắc mạng và trình duyệt:

- localhost trong emulator là chính emulator.
- 10.0.2.2 là máy Windows host khi emulator truy cập.
- localhost / 127.0.0.1 là máy Windows host khi trình duyệt trên host truy cập.
- Không dùng IP emulator làm backend host.
- Không hard-code backend URL production vào source.

## Tool Discovery, Installation and Evidence Policy

Mục đích của chính sách này là mở rộng khả năng thực thi và tính tự chủ của Agent, không phải giới hạn khả năng đang có. Trong mọi nhiệm vụ WorkSphere tiếp theo, Agent được chủ động:

- Tìm kiếm, phát hiện ứng dụng và công cụ có sẵn bằng các lệnh chỉ đọc (Get-Command, where.exe, winget list/search, docker ps, adb version, java/node/npm version).
- Tìm executable, CLI, shortcut, service và đường dẫn dữ liệu.
- Mở ứng dụng hoặc service khi nhiệm vụ cần (ưu tiên mở công cụ có sẵn hơn là cài mới công cụ trùng lặp).
- Cài công cụ còn thiếu từ nguồn chính thức khi cần để hoàn thành nhiệm vụ và không có công cụ tương đương trên máy (verified publisher, license tương thích, ưu tiên winget).
- Cấu hình tích hợp công cụ với WorkSphere và cập nhật reports/ENVIRONMENT_TOOL_REGISTRY.md khi phát hiện, cài đặt, nâng cấp hoặc thay đổi vị trí công cụ.
- Điều khiển ứng dụng bằng CLI, ADB, browser automation, extension API hoặc UI/accessibility automation có kiểm soát (xác minh cửa sổ/tiến trình mục tiêu, không click theo tọa độ mù).
- Chạy build, test, emulator, container và trình duyệt.
- Thu thập log, test result, health status, screenshot và screen recording phục vụ kiểm thử và báo cáo (không chụp dữ liệu nhạy cảm; ảnh tạm lưu tại design/prototype/review-output/, ảnh báo cáo lưu tại reports/screenshots/).
- Dừng tiến trình do Agent tự khởi động sau khi hoàn tất nhiệm vụ.
- Dữ liệu lớn (SDK, images, cache, virtual devices, build artifacts) ưu tiên đặt tại ổ D:.

Agent không cần xin xác nhận riêng cho các thao tác không đặc quyền, có thể đảo ngược và chỉ ảnh hưởng môi trường WorkSphere.

Agent chỉ báo BLOCKED_FOR_USER_ACTION khi hệ điều hành hoặc ứng dụng thực sự yêu cầu người dùng xử lý:
- Windows UAC hoặc yêu cầu quyền Administrator.
- Đăng nhập tài khoản.
- CAPTCHA.
- Điều khoản pháp lý / EULA.
- Thanh toán hoặc nhập license key.
- Windows Firewall prompt.
- Quyền Android nhạy cảm.
- Hộp thoại không thể xử lý an toàn bằng CLI/API.

Tuyệt đối không truy cập, đọc hoặc lưu trữ dữ liệu cá nhân, mật khẩu, token, secret hoặc tài nguyên ngoài phạm vi WorkSphere.