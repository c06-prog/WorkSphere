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
