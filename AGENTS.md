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
- Browser automation cho prototype local.
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
- Chụp screenshot phục vụ kiểm thử và báo cáo.
- Quay video ngắn phục vụ kiểm thử.
- Dừng tiến trình do Agent tự khởi chạy.
- Xóa container tạm do Testcontainers tạo.

Agent không được:

- Xóa hoặc sửa jenkins-lts.
- Xóa Docker image, volume hoặc dữ liệu Docker.
- Xóa worksphere-dev-pg.
- Factory reset Android Emulator.
- Xóa AVD.
- Xóa Android SDK.
- Điều khiển thiết bị khác ngoài serial đã xác minh.
- Mở port public.
- Tắt firewall.
- Commit APK, AAB, keystore, logcat thô hoặc video lớn.
- Chụp hoặc commit secret, token hoặc dữ liệu nhạy cảm.
- Tự xử lý hộp thoại tài khoản, thanh toán hoặc điều khoản pháp lý.
- Click mù khi gặp Windows UAC hoặc Android permission không rõ.

Nếu cần thao tác thủ công:

- Báo BLOCKED_FOR_USER_ACTION.
- Nêu chính xác hộp thoại và thao tác người dùng cần thực hiện.
- Không lặp vô hạn.

Nguyên tắc mạng Android Emulator:

- localhost trong emulator là chính emulator.
- 10.0.2.2 là máy Windows host.
- Không dùng IP emulator làm backend host.
- Không hard-code backend URL production vào source.

## Tool Discovery, Installation and Evidence Policy

- Agent được phép tìm kiếm công cụ có sẵn bằng các lệnh chỉ đọc (Get-Command, where.exe, winget list/search, docker ps, adb version, java/node/npm version).
- Agent phải ưu tiên giải pháp chính thức, reusable và có sẵn trước khi tự viết lại mã.
- Agent được cài công cụ khi nhiệm vụ WorkSphere thực sự cần, có nguồn chính thức, verified publisher, license tương thích, ưu tiên winget.
- Mọi công cụ và ứng dụng sử dụng trong WorkSphere phải được cập nhật vào reports/ENVIRONMENT_TOOL_REGISTRY.md.
- Ứng dụng mới cài đặt phải có đầy đủ thông tin: tên, nguồn, publisher, version, license, executable path và data path.
- Dữ liệu lớn (SDK, images, cache, virtual devices, build artifacts) ưu tiên đặt tại ổ D:.
- Khi gặp Windows UAC, màn hình đăng nhập tài khoản, thanh toán, điều khoản pháp lý hoặc quyền hệ điều hành nhạy cảm: Agent phải dừng và báo BLOCKED_FOR_USER_ACTION kèm hướng dẫn chi tiết cho người dùng, không được click mù hay tự động chấp nhận.
- Agent được phép mở, đóng và điều khiển các ứng dụng, CLI, emulator, browser prototype phục vụ cho nhiệm vụ WorkSphere trong phạm vi an toàn.
- Agent được phép chụp screenshot và video kiểm thử không chứa dữ liệu nhạy cảm; ảnh tạm lưu tại design/prototype/review-output/, ảnh báo cáo lưu tại reports/screenshots/.
- Tuyệt đối không truy cập, đọc hoặc lưu trữ dữ liệu cá nhân, mật khẩu, token, secret hoặc tài nguyên ngoài phạm vi WorkSphere.