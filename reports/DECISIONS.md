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

- Má»—i Project pháº£i luÃ´n cÃ³ Ã­t nháº¥t má»™t active PROJECT_MANAGER.
- KhÃ´ng Ä‘Æ°á»£c xÃ³a active Project Manager cuá»‘i cÃ¹ng.
- KhÃ´ng Ä‘Æ°á»£c Ä‘á»•i role cá»§a active Project Manager cuá»‘i cÃ¹ng sang role khÃ¡c.
- Giá»¯ nguyÃªn role PROJECT_MANAGER Ä‘Æ°á»£c phÃ©p.
- GiÃ¡ng cáº¥p khi cÃ²n Project Manager khÃ¡c Ä‘Æ°á»£c phÃ©p.

## D-014 Mobile Design Before Implementation

- KhÃ´ng triá»ƒn khai React Native screen trÆ°á»›c khi cÃ³ UI/UX baseline.
- UI/UX baseline pháº£i gá»“m:
  - User Flow
  - Screen Inventory
  - Wireframe
  - Design System
  - Component Inventory
  - UI State Matrix
  - Navigation Map
  - API-Screen Mapping
  - Accessibility Checklist
- Thiáº¿t káº¿ khÃ´ng Ä‘Æ°á»£c táº¡o chá»©c nÄƒng ngoÃ i canonical docs.
- File Figma chá»‰ Ä‘Æ°á»£c tuyÃªn bá»‘ tá»“n táº¡i náº¿u thá»±c sá»± Ä‘Ã£ táº¡o.

## D-015 Runtime Automation Authorization

- Agent Ä‘Æ°á»£c dÃ¹ng Docker, Maven, Gradle, ADB vÃ  emulator theo pháº¡m vi AGENTS.md.
- Agent chá»‰ thao tÃ¡c tÃ i nguyÃªn cá»§a WorkSphere.
- Jenkins vÃ  Docker volumes Ä‘Æ°á»£c báº£o vá»‡.
- Há»™p thoáº¡i nháº¡y cáº£m pháº£i chuyá»ƒn cho ngÆ°á»i dÃ¹ng.

## D-016 Visual Prototype Gate

- Äáº·c táº£ Markdown chÆ°a Ä‘Æ°á»£c coi lÃ  visual mockup.
- TrÆ°á»›c khi code React Native pháº£i cÃ³ visual prototype cho cÃ¡c mÃ n hÃ¬nh lÃµi.
- Prototype pháº£i Ä‘Æ°á»£c review trÆ°á»›c implementation.
- KhÃ´ng tuyÃªn bá»‘ cÃ³ Figma náº¿u chÆ°a táº¡o file Figma tháº­t.

## D-017 Visual Prototype Baseline

- Commit `b58d5d8` lÃ  baseline trá»±c quan cho mobile.
- Prototype HTML/CSS/JavaScript lÃ  tÃ i liá»‡u thiáº¿t káº¿ tÆ°Æ¡ng tÃ¡c, khÃ´ng pháº£i source production.
- React Native pháº£i bÃ¡m Screen ID, token, component vÃ  UI state tá»« baseline.
- Prototype khÃ´ng Ä‘Æ°á»£c dÃ¹ng lÃ m production web application.
- Má»i thay Ä‘á»•i UI lá»›n sau baseline pháº£i Ä‘Æ°á»£c review trÆ°á»›c khi Ä‘Æ°a vÃ o React Native.

## D-018 Review Screenshot Policy

- áº¢nh tá»± Ä‘á»™ng trong `design/prototype/review-output/` lÃ  artifact kiá»ƒm thá»­ local.
- KhÃ´ng commit máº·c Ä‘á»‹nh.
- Chá»‰ áº£nh Ä‘Æ°á»£c chá»n cho bÃ¡o cÃ¡o hoáº·c release evidence má»›i Ä‘Æ°á»£c sao chÃ©p vÃ o `reports/screenshots/`.
- áº¢nh chá»©a secret, token hoáº·c dá»¯ liá»‡u tháº­t bá»‹ cáº¥m commit.

## D-019 Tool Discovery and Installation

- TrÆ°á»›c khi cÃ i Ä‘áº·t má»›i hoáº·c tá»± code láº¡i, Agent pháº£i kiá»ƒm tra vÃ  Æ°u tiÃªn cÃ´ng cá»¥, framework hoáº·c package chÃ­nh thá»©c cÃ³ sáºµn.
- Chá»‰ cÃ i Ä‘áº·t cÃ´ng cá»¥ khi nhiá»‡m vá»¥ thá»±c sá»± cáº§n, cÃ³ nguá»“n chÃ­nh thá»©c, verified publisher, license tÆ°Æ¡ng thÃ­ch, Æ°u tiÃªn winget.
- Má»i cÃ´ng cá»¥, á»©ng dá»¥ng má»›i hoáº·c mÃ´i trÆ°á»ng thá»±c thi pháº£i Ä‘Æ°á»£c ghi nháº­n Ä‘áº§y Ä‘á»§ vÃ o `reports/ENVIRONMENT_TOOL_REGISTRY.md`.
- Dá»¯ liá»‡u lá»›n (SDK, images, cache, virtual devices, build artifacts) Æ°u tiÃªn cáº¥u hÃ¬nh lÆ°u trá»¯ táº¡i á»• D:.
- Khi gáº·p UAC, Ä‘Äƒng nháº­p tÃ i khoáº£n, thanh toÃ¡n, Ä‘iá»u khoáº£n phÃ¡p lÃ½ hoáº·c quyá»n há»‡ Ä‘iá»u hÃ nh nháº¡y cáº£m: Agent dá»«ng thao tÃ¡c vÃ  bÃ¡o `BLOCKED_FOR_USER_ACTION`.

## D-020 Automated Application Control and Evidence

- Agent Ä‘Æ°á»£c phÃ©p má»Ÿ, Ä‘Ã³ng vÃ  Ä‘iá»u khiá»ƒn cÃ¡c á»©ng dá»¥ng phá»¥c vá»¥ WorkSphere (CLI, Docker, Android Studio, Android Emulator, Browser prototype).
- Agent Ä‘Æ°á»£c phÃ©p sá»­ dá»¥ng CLI, ADB, browser automation, chá»¥p screenshot vÃ  video ngáº¯n phá»¥c vá»¥ kiá»ƒm thá»­ vÃ  bÃ¡o cÃ¡o.
- NghiÃªm cáº¥m thu tháº­p, ghi log hoáº·c chá»¥p áº£nh chá»©a thÃ´ng tin cÃ¡ nhÃ¢n, máº­t kháº©u, token, API key hoáº·c bÃ­ máº­t.
- áº¢nh chá»¥p táº¡m thá»i trong `design/prototype/review-output/` khÃ´ng Ä‘Æ°á»£c commit máº·c Ä‘á»‹nh; chá»‰ áº£nh Ä‘Ã£ duyá»‡t má»›i Ä‘Æ°á»£c Ä‘Æ°a vÃ o `reports/screenshots/`.

## D-021 Proactive Execution Scope and Autonomy

- Tool Discovery and Installation Policy nháº±m má»Ÿ rá»™ng kháº£ nÄƒng thá»±c thi vÃ  tÃ­nh tá»± chá»§ lÃ¢u dÃ i cá»§a Agent, khÃ´ng háº¡n cháº¿ cÃ¡c nÄƒng lá»±c sáºµn cÃ³.
- Trong má»i nhiá»‡m vá»¥ tiáº¿p theo, Agent Ä‘Æ°á»£c chá»§ Ä‘á»™ng: phÃ¡t hiá»‡n á»©ng dá»¥ng/service; tÃ¬m CLI/shortcut/data path; má»Ÿ service cáº§n thiáº¿t; cÃ i Ä‘áº·t cÃ´ng cá»¥ chÃ­nh thá»©c cÃ²n thiáº¿u khi cáº§n; cáº¥u hÃ¬nh tÃ­ch há»£p; Ä‘iá»u khiá»ƒn qua CLI/ADB/automation; cháº¡y build/test/emulator/container; thu tháº­p telemetry/logs/screenshots; dá»«ng tiáº¿n trÃ¬nh tá»± khá»Ÿi cháº¡y; vÃ  cáº­p nháº­t registry.
- KhÃ´ng cáº§n xin xÃ¡c nháº­n riÃªng cho cÃ¡c thao tÃ¡c khÃ´ng Ä‘áº·c quyá»n, cÃ³ thá»ƒ Ä‘áº£o ngÆ°á»£c vÃ  chá»‰ áº£nh hÆ°á»Ÿng mÃ´i trÆ°á»ng WorkSphere.
- Chá»‰ bÃ¡o `BLOCKED_FOR_USER_ACTION` khi thá»±c sá»± cÃ³ yÃªu cáº§u can thiá»‡p tá»« ngÆ°á»i dÃ¹ng (UAC, login, captcha, Ä‘iá»u khoáº£n EULA, payment, firewall, quyá»n Android nháº¡y cáº£m).
- Náº¿u á»©ng dá»¥ng khÃ´ng cÃ³ CLI nhÆ°ng cáº§n kiá»ƒm thá»­ giao diá»‡n: Ä‘Æ°á»£c phÃ©p dÃ¹ng UI/accessibility automation cÃ³ kiá»ƒm soÃ¡t vá»›i tiáº¿n trÃ¬nh má»¥c tiÃªu Ä‘Ã£ xÃ¡c minh, khÃ´ng click tá»a Ä‘á»™ mÃ¹, khÃ´ng truy cáº­p dá»¯ liá»‡u cÃ¡ nhÃ¢n.

## D-022 Active Task Assignment Uniqueness

- Má»—i cáº·p `task_id` + `assignee_id` chá»‰ cÃ³ tá»‘i Ä‘a má»™t báº£n ghi phÃ¢n cÃ´ng Ä‘ang hoáº¡t Ä‘á»™ng (`is_active = TRUE`).
- PostgreSQL partial unique index `uk_task_assignments_active` (migration `V012`) lÃ  hÃ ng rÃ o toÃ n váº¹n dá»¯ liá»‡u cuá»‘i cÃ¹ng á»Ÿ má»©c database engine.
- Kiá»ƒm tra `existsByTaskIdAndAssigneeIdAndActiveTrue` á»Ÿ táº§ng application service chá»‰ Ä‘Ã³ng vai trÃ² fail-fast.
- Báº£n ghi phÃ¢n cÃ´ng Ä‘Ã£ háº¿t hiá»‡u lá»±c (`is_active = FALSE`) khÃ´ng cáº£n trá»Ÿ viá»‡c tÃ¡i phÃ¢n cÃ´ng (reassign) thÃ nh viÃªn Ä‘Ã³ trong tÆ°Æ¡ng lai.
- TrÆ°á»›c khi deploy migration V012 lÃªn báº¥t ká»³ mÃ´i trÆ°á»ng nÃ o cÃ³ dá»¯ liá»‡u lá»‹ch sá»­, báº¯t buá»™c thá»±c hiá»‡n theo Ä‘Ãºng Runbook tiá»n kiá»ƒm táº¡i `reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md`.
- Tuyá»‡t Ä‘á»‘i khÃ´ng tá»± Ä‘á»™ng xÃ³a hoáº·c deactivate dá»¯ liá»‡u trÃ¹ng láº·p trÃªn mÃ´i trÆ°á»ng production khi chÆ°a cÃ³ phÃª duyá»‡t chÃ­nh thá»©c tá»« ngÆ°á»i cÃ³ tháº©m quyá»n nghiá»‡p vá»¥.

## D-023 Task Comment Ownership and Scope

- Chá»‰ tÃ¡c giáº£ bÃ¬nh luáº­n (`author_id`) hoáº·c Quáº£n trá»‹ viÃªn há»‡ thá»‘ng chuáº©n má»±c (`ADMIN`) má»›i cÃ³ quyá»n chá»‰nh sá»­a hoáº·c xÃ³a bÃ¬nh luáº­n.
- Vai trÃ² `PROJECT_MANAGER` khÃ´ng tá»± Ä‘á»™ng cÃ³ quyá»n sá»­a hoáº·c xÃ³a bÃ¬nh luáº­n cá»§a ngÆ°á»i khÃ¡c náº¿u khÃ´ng pháº£i lÃ  tÃ¡c giáº£ vÃ  khÃ´ng mang quyá»n System Admin.
- BÃ¬nh luáº­n pháº£n há»“i (parent comment) báº¯t buá»™c pháº£i thuá»™c cÃ¹ng Task vÃ  chÆ°a bá»‹ xÃ³a má»m (`is_deleted = FALSE`).

## D-024 Task Hierarchy Cycle Detection Policy

- Chu trÃ¬nh phÃ¢n cáº¥p cÃ´ng viá»‡c Ä‘Æ°á»£c phÃ¡t hiá»‡n chÃ­nh xÃ¡c báº±ng táº­p há»£p Ä‘á»‹nh danh tá»• tiÃªn Ä‘Ã£ duyá»‡t (`Set<UUID> visited`).
- KhÃ´ng Ã¡p dá»¥ng giá»›i háº¡n nghiá»‡p vá»¥ tÃ¹y tiá»‡n 50 cáº¥p; chuá»—i phÃ¢n cáº¥p há»£p lá»‡ sÃ¢u hÆ¡n 50 cáº¥p khÃ´ng bá»‹ xem lÃ  chu trÃ¬nh lá»—i.
- CÃ´ng viá»‡c cha báº¯t buá»™c pháº£i tá»“n táº¡i, khÃ´ng bá»‹ xÃ³a má»m (`is_deleted = FALSE`) vÃ  pháº£i thuá»™c cÃ¹ng dá»± Ã¡n (`project_id`).

## D-025 Java 21 Validation Evidence and Test Matrix

- Dá»± Ã¡n WorkSphere giá»¯ nguyÃªn má»¥c tiÃªu biÃªn dá»‹ch bytecode chuáº©n lÃ  Java 21 (`<java.version>21</java.version>`, tÆ°Æ¡ng Ä‘Æ°Æ¡ng `javac -release 21`).
- MÃ´i trÆ°á»ng Windows host hiá»‡n sá»­ dá»¥ng JDK 27 Ä‘á»ƒ thá»±c thi full regression integration suite (100/100 tests PASS vá»›i Testcontainers PostgreSQL).
- Image Docker chÃ­nh thá»©c `eclipse-temurin:21-jdk` Ä‘Ã³ng vai trÃ² mÃ´i trÆ°á»ng Ä‘á»‘i chuáº©n Java 21 cÃ³ thá»ƒ tÃ¡i láº­p Ä‘á»™c láº­p (Compile PASS, Checkstyle 0 violations, Unit tests 16/16 PASS, H2 context 1/1 PASS).
- KhÃ´ng tuyÃªn bá»‘ full Java 21 integration PASS náº¿u Testcontainers chÆ°a cháº¡y trong mÃ´i trÆ°á»ng Java 21 (do Docker socket cÃ³ chá»§ Ä‘Ã­ch khÃ´ng Ä‘Æ°á»£c mount vÃ o container táº¡m Ä‘á»ƒ báº£o vá»‡ an toÃ n há»‡ thá»‘ng).
- Jenkins pipeline hoáº·c mÃ´i trÆ°á»ng CI/CD chuyÃªn dá»¥ng vá»›i Docker socket an toÃ n lÃ  kÃªnh mong muá»‘n Ä‘á»ƒ thá»±c thi toÃ n bá»™ integration test matrix trÃªn Java 21.

## D-026 Web Runtime and Browser Automation Authorization

- Má»Ÿ rá»™ng nÄƒng lá»±c thá»±c thi cho Agent khi WorkSphere cÃ³ giao diá»‡n web, prototype web, trang quáº£n trá»‹, tÃ i liá»‡u web, Jenkins UI hoáº·c cáº§n kiá»ƒm thá»­ qua trÃ¬nh duyá»‡t. Quyá»n nÃ y cÃ³ hiá»‡u lá»±c lÃ¢u dÃ i cho má»i nhiá»‡m vá»¥ WorkSphere tiáº¿p theo.
- Agent Ä‘Æ°á»£c chá»§ Ä‘á»™ng: phÃ¡t hiá»‡n trÃ¬nh duyá»‡t Ä‘Ã£ cÃ i; xÃ¡c Ä‘á»‹nh executable path vÃ  version; má»Ÿ trÃ¬nh duyá»‡t khi task cáº§n; dÃ¹ng headless browser (`--headless=new`); dÃ¹ng profile táº¡m riÃªng cho WorkSphere; cháº¡y local HTTP server chá»‰ bind localhost (`127.0.0.1`); Ä‘iá»u hÆ°á»›ng, nháº­p dá»¯ liá»‡u test, báº¥m nÃºt, kiá»ƒm tra DOM; thu tháº­p console log, network status vÃ  HTTP response; chá»¥p screenshot; quay video kiá»ƒm thá»­ ngáº¯n; kiá»ƒm tra responsive viewport; kiá»ƒm tra accessibility; kiá»ƒm thá»­ website/prototype WorkSphere; kiá»ƒm tra Jenkins UI; vÃ  dá»«ng browser/server do Agent tá»± khá»Ÿi cháº¡y.
- Agent khÃ´ng cáº§n xin phÃ©p riÃªng cho thao tÃ¡c khÃ´ng Ä‘áº·c quyá»n, cÃ³ thá»ƒ Ä‘áº£o ngÆ°á»£c vÃ  chá»‰ áº£nh hÆ°á»Ÿng mÃ´i trÆ°á»ng WorkSphere.

## D-027 Browser Tool Hierarchy, Storage Isolation, and Security

- Thá»© tá»± Æ°u tiÃªn cÃ´ng cá»¥ trÆ°á»›c khi cÃ i má»›i:
  1. Microsoft Edge Ä‘Ã£ cÃ i trÃªn Windows host.
  2. Kháº£ nÄƒng headless cÃ³ sáºµn cá»§a Edge (`msedge.exe --headless=new`).
  3. Browser automation Ä‘ang cÃ³ trong Antigravity.
  4. Microsoft Edge WebDriver chÃ­nh thá»©c tá»« Microsoft phÃ¹ há»£p phiÃªn báº£n Edge (lÆ°u ngoÃ i repository táº¡i `D:\AI\Tools\EdgeWebDriver\<version>`).
  5. Selenium hoáº·c Playwright chá»‰ khi task thá»±c sá»± cáº§n. KhÃ´ng cÃ i nhiá»u framework trÃ¹ng chá»©c nÄƒng.
- PhÃ¢n bá»• lÆ°u trá»¯ vÃ  cÃ¡ch ly tuyá»‡t Ä‘á»‘i ngoÃ i repository `D:\WorkSphere`:
  - `D:\AI\Tools\EdgeWebDriver\<version>`
  - `D:\AI\Profiles\Edge\WorkSphere` (profile test riÃªng biá»‡t, cáº¥m truy cáº­p profile Edge cÃ¡ nhÃ¢n cá»§a ngÆ°á»i dÃ¹ng)
  - `D:\AI\Cache\Edge`
  - `D:\AI\Temp\Edge`
- An toÃ n dá»¯ liá»‡u vÃ  báº±ng chá»©ng kiá»ƒm thá»­:
  - áº¢nh táº¡m: `design/prototype/review-output/` (khÃ´ng commit máº·c Ä‘á»‹nh).
  - áº¢nh bÃ¡o cÃ¡o: `reports/screenshots/` (chá»‰ commit khi Ä‘Ã£ kiá»ƒm tra khÃ´ng chá»©a secret, token, máº­t kháº©u, Authorization header, API key, hay dá»¯ liá»‡u cÃ¡ nhÃ¢n tháº­t).
  - NghiÃªm cáº¥m commit: browser installer, browser binary, WebDriver executable (`msedgedriver.exe`), browser profile, cookie, cache, downloads táº¡m, hoáº·c file HAR chá»©a token.
- Máº¡ng vÃ  Web Frontend tÆ°Æ¡ng lai:
  - Local server chá»‰ bind `127.0.0.1`. Cáº¥m bind `0.0.0.0`, cáº¥m má»Ÿ port public ra Internet, cáº¥m táº¯t firewall.
  - KhÃ´ng tá»± táº¡o Web Frontend náº¿u Roadmap khÃ´ng yÃªu cáº§u; tuÃ¢n thá»§ nghiÃªm ngáº·t license khi tÃ¡i sá»­ dá»¥ng mÃ£ nguá»“n.

## D-028 Phase 8 Local Storage Baseline

- MÃ´i trÆ°á»ng Development vÃ  Test sá»­ dá»¥ng nhÃ  cung cáº¥p lÆ°u trá»¯ cá»¥c bá»™ (`LocalFileSystemStorageService`).
- ThÆ° má»¥c gá»‘c lÆ°u trá»¯ Ä‘Æ°á»£c cáº¥u hÃ¬nh qua biáº¿n mÃ´i trÆ°á»ng `WORKSPHERE_STORAGE_PATH` (hoáº·c thuá»™c tÃ­nh `worksphere.storage.path`), máº·c Ä‘á»‹nh `D:/WorkSphereData/uploads` trÃªn Windows vÃ  cÃ³ thá»ƒ ghi Ä‘Ã¨ linh hoáº¡t trÃªn Linux/container.
- ÄÆ°á»ng dáº«n váº­t lÃ½ tuyá»‡t Ä‘á»‘i cá»§a file trÃªn filesystem mÃ¡y chá»§ tuyá»‡t Ä‘á»‘i khÃ´ng xuáº¥t hiá»‡n trong API response, headers, body hoáº·c log tráº£ vá» cho client.
- Äá»‹nh danh lÆ°u trá»¯ (`storagePath`) lÃ  relative server-generated key cÃ³ Ä‘á»‹nh dáº¡ng `<purpose>/<yyyy>/<MM>/<fileId>.<extension>`, Ä‘Æ°á»£c sinh ngáº«u nhiÃªn báº±ng UUID trÃªn mÃ¡y chá»§ vÃ  chá»‰ quáº£n lÃ½ ná»™i bá»™.
- TÃªn tá»‡p gá»‘c tá»« phÃ­a client (`originalFilename`) chá»‰ Ä‘Æ°á»£c lÆ°u dÆ°á»›i dáº¡ng metadata vÃ  phá»¥c vá»¥ viá»‡c xÃ¢y dá»±ng header `Content-Disposition` tuÃ¢n thá»§ chuáº©n RFC 5987 (UTF-8).
- NhÃ  cung cáº¥p lÆ°u trá»¯ cho mÃ´i trÆ°á»ng Production (Amazon S3, MinIO, Azure Blob Storage) tiáº¿p tá»¥c Ä‘Æ°á»£c hoÃ£n quyáº¿t Ä‘á»‹nh cho Ä‘áº¿n cÃ¡c giai Ä‘oáº¡n triá»ƒn khai háº¡ táº§ng Ä‘Ã¡m mÃ¢y.

## D-029 File Type and Archive Security

- Tuyá»‡t Ä‘á»‘i khÃ´ng tin cáº­y header `Content-Type` hoáº·c pháº§n má»Ÿ rá»™ng (`extension`) do phÃ­a client gá»­i lÃªn.
- CÃ¡c Ä‘á»‹nh dáº¡ng tá»‡p áº£nh vÃ  PDF (JPEG, PNG, WEBP, PDF) báº¯t buá»™c pháº£i Ä‘Æ°á»£c xÃ¡c thá»±c báº±ng magic bytes / signature nhá»‹ phÃ¢n thá»±c táº¿ cá»§a tá»‡p.
- CÃ¡c Ä‘á»‹nh dáº¡ng tÃ i liá»‡u Office OpenXML (DOCX, XLSX) báº¯t buá»™c pháº£i Ä‘Æ°á»£c xÃ¡c thá»±c cáº¥u trÃºc ná»™i dung ZIP bÃªn trong luá»“ng bá»™ nhá»› mÃ  khÃ´ng Ä‘Æ°á»£c giáº£i nÃ©n ra há»‡ thá»‘ng tá»‡p Ä‘Ä©a.
- Kiá»ƒm tra an toÃ n tá»‡p nÃ©n (ZIP safety) báº¯t buá»™c pháº£i thá»±c thi cÃ¡c giá»›i háº¡n tÃ i nguyÃªn nghiÃªm ngáº·t:
  - Sá»‘ lÆ°á»£ng entry tá»‘i Ä‘a: `MAX_ZIP_ENTRIES = 200`.
  - Dung lÆ°á»£ng giáº£i nÃ©n tá»‘i Ä‘a cho má»—i entry: `MAX_ENTRY_UNCOMPRESSED_SIZE = 50 MB`.
  - Tá»•ng dung lÆ°á»£ng giáº£i nÃ©n tÃ­ch lÅ©y tá»‘i Ä‘a: `MAX_TOTAL_UNCOMPRESSED_SIZE = 100 MB`.
  - Tá»· lá»‡ nÃ©n tá»‘i Ä‘a: `MAX_COMPRESSION_RATIO = 100.0` (kiá»ƒm tra cáº£ tá»· lá»‡ khai bÃ¡o trong metadata header vÃ  tá»· lá»‡ thá»±c táº¿ theo dÃµi luá»“ng thá»i gian thá»±c qua `CountingInputStream`).
  - NghiÃªm cáº¥m má»i dáº¡ng path traversal (`..`), dáº¥u gáº¡ch chÃ©o ngÆ°á»£c (`\`), Ä‘Æ°á»ng dáº«n tuyá»‡t Ä‘á»‘i (`/`), hoáº·c kÃ½ hiá»‡u á»• Ä‘Ä©a (`C:`) trong tÃªn entry cá»§a tá»‡p nÃ©n.

## D-030 File Access Follows Business Linkage

- Quyá»n táº£i xuá»‘ng vÃ  truy cáº­p tá»‡p tuÃ¢n thá»§ cháº·t cháº½ liÃªn káº¿t nghiá»‡p vá»¥ thá»±c táº¿, khÃ´ng cho phÃ©p truy cáº­p chá»‰ báº±ng viá»‡c Ä‘oÃ¡n Ä‘á»‹nh danh `fileId`:
  - Tá»‡p chÆ°a liÃªn káº¿t (`unlinked`): chá»‰ ngÆ°á»i táº£i lÃªn ban Ä‘áº§u (`uploaded_by`) hoáº·c Quáº£n trá»‹ viÃªn há»‡ thá»‘ng (`ADMIN`) má»›i Ä‘Æ°á»£c phÃ©p truy cáº­p.
  - Tá»‡p Ä‘Ã£ gáº¯n káº¿t vá»›i cÃ´ng viá»‡c (`task_attachments`): quyá»n táº£i xuá»‘ng káº¿ thá»«a tráº¡ng thÃ¡i thÃ nh viÃªn hoáº¡t Ä‘á»™ng (`active`) cá»§a dá»± Ã¡n chá»©a cÃ´ng viá»‡c Ä‘Ã³. ThÃ nh viÃªn khÃ´ng thuá»™c dá»± Ã¡n hoáº·c thÃ nh viÃªn Ä‘Ã£ bá»‹ há»§y kÃ­ch hoáº¡t (`INACTIVE`) bá»‹ tá»« chá»‘i truy cáº­p (HTTP 403 `FILE_ACCESS_DENIED`).
  - Tá»‡p Ä‘Ã£ gáº¯n káº¿t vá»›i yÃªu cáº§u dá»‹ch vá»¥ (`service_attachments`): quyá»n táº£i xuá»‘ng thuá»™c vá» ngÆ°á»i táº¡o yÃªu cáº§u, ká»¹ thuáº­t viÃªn Ä‘Æ°á»£c phÃ¢n cÃ´ng, hoáº·c Quáº£n trá»‹ viÃªn.
- Tá»‡p Ä‘ang Ä‘Æ°á»£c liÃªn káº¿t vá»›i cÃ´ng viá»‡c hoáº·c yÃªu cáº§u dá»‹ch vá»¥ tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘Æ°á»£c phÃ©p xÃ³a thÃ´ng qua File API (HTTP 422 `FILE_ALREADY_LINKED`), nháº±m Ä‘áº£m báº£o tÃ­nh toÃ n váº¹n cá»§a lá»‹ch sá»­ nghiá»‡p vá»¥.

## D-031 Task Attachment Transaction

- Danh sÃ¡ch Ä‘á»‹nh danh tá»‡p Ä‘Ã­nh kÃ¨m (`attachmentFileIds`) Ä‘Æ°á»£c xá»­ lÃ½ vÃ  gáº¯n káº¿t nguyÃªn tá»­ trong cÃ¹ng transaction lÆ°u trá»¯ bÃ¬nh luáº­n cÃ´ng viá»‡c (`TaskComment`).
- Táº¥t cáº£ cÃ¡c tá»‡p Ä‘Ã­nh kÃ¨m pháº£i Ä‘Æ°á»£c kiá»ƒm tra há»£p lá»‡ trÆ°á»›c khi thá»±c hiá»‡n ghi dá»¯ liá»‡u: pháº£i tá»“n táº¡i, cÃ³ tráº¡ng thÃ¡i `ACTIVE`, má»¥c Ä‘Ã­ch `TASK_ATTACHMENT`, vÃ  ngÆ°á»i thá»±c hiá»‡n pháº£i lÃ  ngÆ°á»i táº£i lÃªn tá»‡p (hoáº·c Quáº£n trá»‹ viÃªn há»‡ thá»‘ng).
- Náº¿u báº¥t ká»³ má»™t tá»‡p Ä‘Ã­nh kÃ¨m nÃ o khÃ´ng há»£p lá»‡, toÃ n bá»™ transaction cá»§a bÃ¬nh luáº­n vÃ  Ä‘Ã­nh kÃ¨m pháº£i bá»‹ rollback, khÃ´ng táº¡o tráº¡ng thÃ¡i dá»¯ liá»‡u dá»Ÿ dang.
- Sá»‘ lÆ°á»£ng tá»‡p Ä‘Ã­nh kÃ¨m (`attachmentCount`) hiá»ƒn thá»‹ trÃªn Task Detail vÃ  Task List Ä‘Æ°á»£c tÃ­nh toÃ¡n thÃ´ng qua truy váº¥n gom nhÃ³m theo máº» (`countByTaskIdIn`), loáº¡i bá» hoÃ n toÃ n nguy cÆ¡ N+1 queries.

## D-032 Filesystem Security Validation

- Há»‡ thá»‘ng tá»‡p lÆ°u trá»¯ cá»¥c bá»™ pháº£i chá»§ Ä‘á»™ng ngÄƒn cháº·n viá»‡c thoÃ¡t khá»i thÆ° má»¥c gá»‘c thÃ´ng qua symbolic link hoáº·c NTFS junction/reparse point báº±ng cÃ¡ch kiá»ƒm tra toÃ n bá»™ cÃ¢y thÆ° má»¥c tá»• tiÃªn vá»›i `LinkOption.NOFOLLOW_LINKS` vÃ  Ä‘á»‘i chiáº¿u vá»›i Ä‘Æ°á»ng dáº«n thá»±c `rootLocation.toRealPath()`.
- NÄƒng lá»±c phÃ²ng vá»‡ symlink escape Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c minh thÃ nh cÃ´ng trÃªn há»‡ thá»‘ng tá»‡p Linux thá»±c táº¿ thÃ´ng qua Docker container Java 21 (`TESTED_ON_LINUX_CONTAINER`), chá»©ng minh cáº£ ba thao tÃ¡c `store`, `load`, vÃ  `delete` Ä‘i qua symlink Ä‘á»u bá»‹ tá»« chá»‘i vÃ  tá»‡p ngoÃ i thÆ° má»¥c lÆ°u trá»¯ Ä‘Æ°á»£c báº£o vá»‡ tuyá»‡t Ä‘á»‘i.
- Thao tÃ¡c di chuyá»ƒn tá»‡p Ä‘Ã­ch cuá»‘i cÃ¹ng cáº¥m sá»­ dá»¥ng `StandardCopyOption.REPLACE_EXISTING`, kiá»ƒm tra sá»± tá»“n táº¡i cá»§a tá»‡p Ä‘Ã­ch trÆ°á»›c khi di chuyá»ƒn Ä‘á»ƒ chá»‘ng ghi Ä‘Ã¨ dá»¯ liá»‡u tá»‡p lÆ°u trá»¯.
- TrÃªn mÃ´i trÆ°á»ng production, thÆ° má»¥c lÆ°u trá»¯ pháº£i Ä‘Æ°á»£c báº£o vá»‡ báº±ng phÃ¢n quyá»n ngÆ°á»i dÃ¹ng cáº¥p há»‡ Ä‘iá»u hÃ nh; há»‡ thá»‘ng thá»«a nháº­n technical debt vá» máº·t lÃ½ thuyáº¿t ráº±ng Java NIO portable API khÃ´ng thá»ƒ loáº¡i bá» tuyá»‡t Ä‘á»‘i TOCTOU trÆ°á»›c ngÆ°á»i dÃ¹ng Ä‘Ã£ cÃ³ quyá»n can thiá»‡p trá»±c tiáº¿p filesystem mÃ¡y chá»§.

## D-033 IDE Extension Discovery, Installation and Automation Policy

- Má»Ÿ rá»™ng nÄƒng lá»±c thá»±c thi cá»§a Agent trong Antigravity IDE, khÃ´ng giá»›i háº¡n cÃ¡c quyá»n Ä‘ang cÃ³, hiá»‡u lá»±c lÃ¢u dÃ i cho má»i nhiá»‡m vá»¥ tiáº¿p theo.
- Agent Ä‘Æ°á»£c chá»§ Ä‘á»™ng: phÃ¡t hiá»‡n extension Ä‘Ã£ cÃ i; kiá»ƒm tra enabled/disabled, version, publisher, location; sá»­ dá»¥ng command, view, task, debugger, language server, API cá»§a extension; enable extension khi cáº§n; disable táº¡m extension xung Ä‘á»™t; cÃ i extension cÃ²n thiáº¿u tá»« nguá»“n chÃ­nh thá»©c; nÃ¢ng cáº¥p extension; reload window khi cáº§n; cáº­p nháº­t reports/ENVIRONMENT_TOOL_REGISTRY.md.
- NguyÃªn táº¯c Æ°u tiÃªn:
  1. TÃ­nh nÄƒng cÃ³ sáºµn trong Antigravity.
  2. Extension Ä‘Ã£ cÃ i nhÆ°ng chÆ°a enable.
  3. Kháº£ nÄƒng hoÃ n thÃ nh nhiá»‡m vá»¥ cá»§a extension hiá»‡n cÃ³.
  4. Chá»‰ cÃ i má»›i khi khÃ´ng cÃ³ giáº£i phÃ¡p tÆ°Æ¡ng Ä‘Æ°Æ¡ng, tá»« publisher chÃ­nh thá»©c/uy tÃ­n, tÆ°Æ¡ng thÃ­ch license/báº£o máº­t.
  5. TrÃ¡nh cÃ i extension trÃ¹ng láº·p chá»©c nÄƒng. GitLens Ä‘Æ°á»£c Æ°u tiÃªn hÆ¡n Git History khi Ä‘Ã£ bao quÃ¡t Ä‘á»§ lá»‹ch sá»­/blame/diff. Microsoft Edge Tools Æ°u tiÃªn cho web/prototype debug. Docker extension bá»• trá»£ Docker CLI nhÆ°ng khÃ´ng thay tháº¿ lá»‡nh CLI báº¯t buá»™c. Markdownlint dÃ¹ng phÃ¡t hiá»‡n lá»—i cÃº phÃ¡p Markdown nhÆ°ng khÃ´ng tá»± sá»­a ná»™i dung canonical ngoÃ i pháº¡m vi task.
- KhÃ´ng cáº§n xin phÃ©p riÃªng cho thao tÃ¡c khÃ´ng Ä‘áº·c quyá»n, cÃ³ thá»ƒ Ä‘áº£o ngÆ°á»£c vÃ  chá»‰ áº£nh hÆ°á»Ÿng mÃ´i trÆ°á»ng WorkSphere.
- Chá»‰ bÃ¡o `BLOCKED_FOR_USER_ACTION` khi gáº·p: Ä‘Äƒng nháº­p Marketplace/Microsoft/GitHub/Google; xÃ¡c nháº­n publisher khÃ´ng tin cáº­y; EULA/license thÆ°Æ¡ng máº¡i; Windows UAC/Admin; hoáº·c extension Ä‘Ã²i gá»­i source WorkSphere ra ngoÃ i.

## D-034 Database Extension and Development Safety Policy

- WorkSphere sá»­ dá»¥ng PostgreSQL lÃ  database canonical vÃ  máº·c Ä‘á»‹nh. Agent Æ°u tiÃªn: PostgreSQL CLI/psql, Testcontainers PostgreSQL, SQLTools vá»›i PostgreSQL driver phÃ¹ há»£p.
- SQL Server (mssql) Ä‘Ã£ cÃ i vÃ  Ä‘Æ°á»£c phÃ©p sá»­ dá»¥ng khi má»™t nhiá»‡m vá»¥ WorkSphere cá»¥ thá»ƒ chá»©ng minh cáº§n thiáº¿t. "KhÃ´ng Æ°u tiÃªn" khÃ´ng Ä‘á»“ng nghÄ©a vá»›i "cáº¥m sá»­ dá»¥ng".
- Tuyá»‡t Ä‘á»‘i khÃ´ng tá»± chuyá»ƒn schema, Flyway migration hoáº·c runtime database sang SQL Server; khÃ´ng sá»­a migration PostgreSQL chá»‰ Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch mssql.
- Tuyá»‡t Ä‘á»‘i khÃ´ng lÆ°u database password/credentials vÃ o repository, workspace settings Ä‘Æ°á»£c Git theo dÃµi, screenshot, raw logs hay extension connection export.
- Workspace settings (`.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/tasks.json`): chá»‰ táº¡o/sá»­a khi Ä‘Æ°á»£c phÃ©p, cáº¥m chá»©a machine-specific path hoáº·c secret.
- Cáº¥m commit: extension binaries, VSIX, cache, token, profile, cookie, settings cÃ¡ nhÃ¢n, credentials.

## D-035 Service Attachment Response Projection (IMPLEMENTATION_RESPONSE_PROJECTION)

- Canonical `06_API_CONTRACT.md` Section 13.4 chá»‰ Ä‘á»‹nh "Tá»‡p Ä‘Ã­nh kÃ¨m" trong response chi tiáº¿t yÃªu cáº§u dá»‹ch vá»¥ mÃ  khÃ´ng Ä‘á»‹nh nghÄ©a cáº¥u trÃºc JSON schema chi tiáº¿t.
- Chuáº©n hÃ³a cáº¥u trÃºc chiáº¿u triá»ƒn khai (nhÃ£n: `IMPLEMENTATION_RESPONSE_PROJECTION`, khÃ´ng gá»i lÃ  canonical schema) `ServiceAttachmentResponse` gá»“m 7 trÆ°á»ng:
  - `fileId` (UUID): ID tá»‡p lÆ°u trá»¯ trong `stored_files`.
  - `originalName` (String): TÃªn tá»‡p gá»‘c tá»« phÃ­a client.
  - `mimeType` (String): Äá»‹nh dáº¡ng MIME Ä‘Ã£ xÃ¡c thá»±c.
  - `sizeBytes` (Long): Dung lÆ°á»£ng tá»‡p tÃ­nh báº±ng byte (thá»‘ng nháº¥t tuyá»‡t Ä‘á»‘i theo naming convention thá»±c táº¿ cá»§a `FileUploadResponse` vÃ  `StoredFile`, khÃ´ng dÃ¹ng `fileSize`).
  - `downloadUrl` (String): ÄÆ°á»ng dáº«n táº£i tá»‡p `/api/v1/files/{fileId}/download`.
  - `uploadedBy` (UUID): ID ngÆ°á»i táº£i tá»‡p lÃªn.
  - `createdAt` (Instant): Thá»i Ä‘iá»ƒm Ä‘Ã­nh kÃ¨m tá»‡p vÃ o yÃªu cáº§u dá»‹ch vá»¥ (láº¥y tá»« trÆ°á»ng `service_attachments.created_at`, phÃ¢n biá»‡t rÃµ rÃ ng vá»›i `StoredFile.createdAt` lÃ  thá»i Ä‘iá»ƒm tá»‡p váº­t lÃ½ Ä‘Æ°á»£c táº£i lÃªn há»‡ thá»‘ng).
- Cáº¥u trÃºc nÃ y khá»›p 100% vá»›i naming convention thá»±c táº¿ cá»§a `FileUploadResponse` vÃ  `StoredFile` tá»« Phase 8.
- ÄÃ¢y lÃ  implementation response projection nhÃºng trong `ServiceRequestDetailResponse.attachments`, khÃ´ng má»Ÿ thÃªm endpoint REST má»›i, khÃ´ng lÃ m thay Ä‘á»•i há»£p Ä‘á»“ng canonical.

## D-036 Service Request Single Active Assignment and Database Invariants

- **Cardinality**: Má»—i Service Request táº¡i má»™t thá»i Ä‘iá»ƒm chá»‰ cÃ³ tá»‘i Ä‘a **Má»˜T** ká»¹ thuáº­t viÃªn/ngÆ°á»i xá»­ lÃ½ Ä‘ang hoáº¡t Ä‘á»™ng (`active cardinality = 0..1`), cÄƒn cá»© `02_USER_ROLES_AND_WORKFLOWS.md` Section 6.3, `05_DATABASE_DESIGN.md` Section 9.3, vÃ  `06_API_CONTRACT.md` Section 13.4/13.6 ("NgÆ°á»i xá»­ lÃ½" - sá»‘ Ã­t; payload phÃ¢n cÃ´ng chá»‰ chá»©a `assigneeId` Ä‘Æ¡n).
- **HÃ ng rÃ o Database & Khoáº£ng trá»‘ng Schema**:
  - Viá»‡c chá»‰ dá»±a vÃ o kiá»ƒm tra á»Ÿ táº§ng Application Service khÃ´ng thá»ƒ báº£o vá»‡ há»‡ thá»‘ng trÆ°á»›c hai transaction phÃ¢n cÃ´ng Ä‘á»“ng thá»i (race condition).
  - Ghi nháº­n: `SERVICE_ASSIGNMENT_CONCURRENCY_SCHEMA_GAP`.
  - Database PostgreSQL báº¯t buá»™c pháº£i lÃ  hÃ ng rÃ o toÃ n váº¹n cuá»‘i cÃ¹ng thÃ´ng qua partial unique index:
    ```sql
    CREATE UNIQUE INDEX uk_service_assignments_one_active
    ON service_assignments(request_id)
    WHERE is_active = TRUE;
    ```
  - Tuyá»‡t Ä‘á»‘i khÃ´ng dÃ¹ng `(request_id, assignee_id) WHERE is_active = TRUE` vÃ¬ index theo cáº·p váº«n cho phÃ©p hai ká»¹ thuáº­t viÃªn khÃ¡c nhau (User A vÃ  User B) cÃ¹ng á»Ÿ tráº¡ng thÃ¡i active trÃªn cÃ¹ng má»™t request.
- **Káº¿ hoáº¡ch Migration Phase 9**:
  - Táº¡o migration `V013__add_service_request_assignment_invariants.sql` khi báº¯t Ä‘áº§u triá»ƒn khai Phase 9 (khÃ´ng táº¡o trong Ä‘á»£t decision nÃ y).
  - Tuyá»‡t Ä‘á»‘i khÃ´ng sá»­a `V001`-`V012`.
  - KhÃ´ng Ã¢m tháº§m xÃ³a hoáº·c deactivate dá»¯ liá»‡u cÅ©; báº¯t buá»™c cháº¡y preflight query kiá»ƒm tra vi pháº¡m theo Runbook `reports/runbooks/V013_SERVICE_ASSIGNMENT_UNIQUENESS_PLAN.md`.
- **Giao thá»©c KhÃ³a vÃ  Reassignment Transaction**:
  1. **Row coordination lock**: KhÃ³a báº£n ghi `ServiceRequest` báº±ng `ServiceRequestRepository.findByIdForUpdate(UUID id)` vá»›i `@Lock(LockModeType.PESSIMISTIC_WRITE)` vÃ  timeout 5000ms (`jakarta.persistence.lock.timeout` = 5000) hoáº·c native `SELECT ... FOR UPDATE`. KhÃ´ng dá»±a vÃ o khÃ³a row `service_assignments` vÃ¬ báº£n ghi assignment cÃ³ thá»ƒ chÆ°a tá»“n táº¡i khi yÃªu cáº§u má»›i Ä‘Æ°á»£c táº¡o.
  2. **Thá»© tá»± giao dá»‹ch (Transaction Ordering)**: LuÃ´n khÃ³a `ServiceRequest` trÆ°á»›c, sau Ä‘Ã³ má»›i truy váº¥n / ghi `service_assignments` Ä‘á»ƒ loáº¡i bá» nguy cÆ¡ deadlock chÃ©o báº£ng.
  3. **NguyÃªn táº¯c giá»¯ lock**: Tuyá»‡t Ä‘á»‘i khÃ´ng giá»¯ lock trong cÃ¡c thao tÃ¡c File I/O, gá»­i email, push notification hay gá»i network bÃªn ngoÃ i. CÃ¡c tÃ¡c vá»¥ nÃ y pháº£i thá»±c hiá»‡n báº¥t Ä‘á»“ng bá»™ sau khi transaction Ä‘Ã£ commit.
  4. **Kiá»ƒm tra quyá»n actor**: XÃ¡c thá»±c actor cÃ³ quyá»n `SERVICE_REQUEST_ASSIGN`.
  5. **XÃ¡c thá»±c assignee má»›i**: Kiá»ƒm tra user tá»“n táº¡i, Ä‘ang hoáº¡t Ä‘á»™ng (`ACTIVE`), khÃ´ng bá»‹ xÃ³a má»m.
  6. **TÃ¬m active assignment hiá»‡n táº¡i**: `findActiveByRequestId(requestId)`.
  7. **Idempotency**: Náº¿u `assigneeId` má»›i trÃ¹ng vá»›i `assigneeId` hiá»‡n táº¡i Ä‘ang active, tráº£ vá» káº¿t quáº£ hiá»‡n táº¡i mÃ  khÃ´ng táº¡o row trÃ¹ng láº·p.
  8. **Cáº­p nháº­t & ChÃ¨n má»›i**:
     - Náº¿u khÃ¡c `assigneeId`: Set `old.is_active = FALSE`, `old.unassigned_at = server Clock time`.
     - Thá»±c hiá»‡n flush (`saveAndFlush`) Ä‘á»ƒ giáº£i phÃ³ng slot active trong partial index.
     - Táº¡o báº£n ghi má»›i: `id = UUID.randomUUID()`, `requestId`, `assigneeId = newAssigneeId`, `assignedBy = principal.userId()`, `assignedAt = server Clock time`, `isActive = TRUE`.
  9. Cam káº¿t toÃ n bá»™ trong cÃ¹ng `@Transactional`. `assigned_by` láº¥y tá»« Security Principal, khÃ´ng tin cáº­y dá»¯ liá»‡u client gá»­i lÃªn.
  10. Trong mÃ´i trÆ°á»ng Ä‘á»“ng thá»i, chá»‰ má»™t transaction thÃ nh cÃ´ng; transaction kia bá»‹ cháº·n bá»Ÿi partial unique index.
- **Error Mapping & Khoáº£ng trá»‘ng mÃ£ lá»—i**:
  - Khi partial unique index `uk_service_assignments_one_active` bá»‹ vi pháº¡m: Duyá»‡t qua `SQLException` cause chain, báº¯t buá»™c SQLState pháº£i lÃ  `23505`, vÃ  tÃªn constraint pháº£i khá»›p chÃ­nh xÃ¡c `uk_service_assignments_one_active`. KhÃ´ng sá»­ dá»¥ng `message.contains("service_assignments")` lÃ m fallback rá»™ng. KhÃ´ng map cÃ¡c lá»—i Foreign Key (23503) hay Not Null (23502) thÃ nh xung Ä‘á»™t phÃ¢n cÃ´ng. ToÃ n bá»™ transaction pháº£i rollback.
  - **Äá» xuáº¥t thiáº¿t káº¿ mÃ£ lá»—i**: `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict, Message: "YÃªu cáº§u dá»‹ch vá»¥ Ä‘ang Ä‘Æ°á»£c phÃ¢n cÃ´ng Ä‘á»“ng thá»i hoáº·c tráº¡ng thÃ¡i phÃ¢n cÃ´ng Ä‘Ã£ thay Ä‘á»•i. Vui lÃ²ng táº£i láº¡i dá»¯ liá»‡u vÃ  thá»­ láº¡i.").
    - KhÃ¡c biá»‡t vá»›i validation error (400 `VALIDATION_ERROR`): Äá»‹nh dáº¡ng UUID vÃ  thÃ´ng tin assignee há»£p lá»‡ vá» máº·t cÃº phÃ¡p.
    - KhÃ¡c biá»‡t vá»›i optimistic lock (409 `OPTIMISTIC_LOCK_CONFLICT`): Bá»‹ kÃ­ch hoáº¡t bá»Ÿi partial unique index trÃªn `service_assignments`, khÃ´ng pháº£i do lá»‡ch `@Version` trÃªn `service_requests`.
    - KhÃ¡c biá»‡t vá»›i assignee inactive/not found: Tráº£ vá» `USER_NOT_FOUND` hoáº·c `USER_INACTIVE`.
  - **Quy táº¯c Governance & Káº¿t quáº£ vÃ¡ Canonical**: MÃ£ lá»—i `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict, Message: "YÃªu cáº§u dá»‹ch vá»¥ Ä‘ang Ä‘Æ°á»£c phÃ¢n cÃ´ng Ä‘á»“ng thá»i hoáº·c tráº¡ng thÃ¡i phÃ¢n cÃ´ng Ä‘Ã£ thay Ä‘á»•i. Vui lÃ²ng táº£i láº¡i dá»¯ liá»‡u vÃ  thá»­ láº¡i.") Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t chÃ­nh thá»©c vÃ o [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 13.6 vÃ  20.6. `SERVICE_ASSIGNMENT_ERROR_CODE_GAP` Ä‘Ã£ Ä‘Æ°á»£c giáº£i quyáº¿t triá»‡t Ä‘á»ƒ.

## D-037 Request Number Concurrency, Two-Key Advisory Lock, and Non-Gapless Sequence

- Format canonical lÃ  `SR-YYYY-NNNNNN` (vÃ­ dá»¥: `SR-2026-000001`).
- Ãp dá»¥ng phÆ°Æ¡ng Ã¡n **PostgreSQL Two-Key Transactional Advisory Lock**:
  ```sql
  SELECT pg_advisory_xact_lock(1301, :year);
  ```
  1. `1301` lÃ  integer constant Ä‘áº¡i diá»‡n cho module Service Request numbering, loáº¡i bá» hoÃ n toÃ n nguy cÆ¡ Ä‘á»¥ng Ä‘á»™ chuá»—i bÄƒm (hash collision) cá»§a 64-bit `hashtext`.
  2. `:year` láº¥y tá»« `java.time.Clock` Ä‘Æ°á»£c inject káº¿t há»£p business ZoneId (`ZoneId.of("Asia/Ho_Chi_Minh")`), khÃ´ng láº¥y year tá»« client.
  3. Truy váº¥n sequence sau khÃ³a trong cÃ¹ng transaction:
     ```sql
     SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS INTEGER)), 0) + 1
     FROM service_requests
     WHERE request_number LIKE 'SR-' || :year || '-%';
     ```
  4. ÄÃ£ kiá»ƒm chá»©ng thá»±c táº¿ trÃªn PostgreSQL 15: `SUBSTRING('SR-2026-000001' FROM 9)` tráº£ vá» chuá»—i `000001` vÃ  `CAST(... AS INTEGER)` tráº£ vá» `1`.
  5. KhÃ³a giao dá»‹ch tá»± Ä‘á»™ng giáº£i phÃ³ng khi commit hoáº·c rollback.
  6. RÃ ng buá»™c `uk_service_requests_request_number` (táº¡o tá»« `V010`) lÃ  hÃ ng rÃ o duy nháº¥t cuá»‘i cÃ¹ng á»Ÿ má»©c database.
  7. Kiá»ƒm thá»­ Ä‘á»“ng thá»i (concurrent create test) báº¯t buá»™c cháº¡y Ä‘a luá»“ng thá»±c táº¿ vá»›i cÃ¡c transaction vÃ  EntityManager Ä‘á»™c láº­p, khÃ´ng dÃ¹ng chung context luá»“ng.
  8. Kiá»ƒm thá»­ ká»‹ch báº£n chuyá»ƒn giao nÄƒm (year rollover) vÃ  kiá»ƒm thá»­ transaction rollback.
  9. **TÃ­nh cháº¥t Non-Gapless vÃ  TÃ¡i sá»­ dá»¥ng sá»‘**:
     - MAX + 1 trong cÃ¹ng transactional advisory lock thÆ°á»ng cÃ³ thá»ƒ tÃ¡i sá»­ dá»¥ng sá»‘ sau rollback vÃ¬ row chÆ°a commit ra khá»i transaction.
     - Há»‡ thá»‘ng khÃ´ng tuyÃªn bá»‘ chuá»—i sá»‘ lÃ  "gapless tuyá»‡t Ä‘á»‘i" vÃ  khÃ´ng coi rollback luÃ´n lÃ m máº¥t sá»‘ thá»© tá»±.
  10. Náº¿u advisory lock query gáº·p database timeout: Sá»­ dá»¥ng infrastructure error mapping hiá»‡n cÃ³, khÃ´ng phÃ¡t minh mÃ£ lá»—i nghiá»‡p vá»¥ má»›i.

## D-038 Service Category Hierarchy and Cycle Prevention

- `parentId` trá» tá»›i danh má»¥c cha trong `service_categories`.
- Äiá»u kiá»‡n há»£p lá»‡ khi gÃ¡n `parentId`: Danh má»¥c cha pháº£i tá»“n táº¡i, Ä‘ang hoáº¡t Ä‘á»™ng (`is_active = TRUE`), chÆ°a bá»‹ xÃ³a má»m (`is_deleted = FALSE`), vÃ  khÃ´ng Ä‘Æ°á»£c lÃ  chÃ­nh nÃ³ (`parentId != id`).
- NgÄƒn ngá»«a chu trÃ¬nh (cycle detection): Duyá»‡t chuá»—i tá»• tiÃªn báº±ng `Set<UUID> visited`. Náº¿u gáº·p ID cá»§a chÃ­nh danh má»¥c Ä‘ang cáº­p nháº­t thÃ¬ tá»« chá»‘i ngay. KhÃ´ng Ã¡p Ä‘áº·t giá»›i háº¡n depth tÃ¹y tiá»‡n.

## D-039 File Delete Memory Inaccuracy Correction

- XÃ¡c nháº­n chÃ­nh thá»©c ráº±ng mÃ£ nguá»“n `FileController.java` vÃ  test suite `FileMockMvcTest.java` hiá»‡n thá»±c endpoint `DELETE /api/v1/files/{fileId}` tráº£ vá» **HTTP 200 OK** kÃ¨m body `ApiResponse<Void>` (chá»©a `success: true`).
- ÄÃ­nh chÃ­nh cÃ¡c ghi chÃº trong bÃ¡o cÃ¡o bá»™ nhá»› trÆ°á»›c Ä‘Ã¢y tá»«ng ghi nháº§m lÃ  `204 No Content`. KhÃ´ng sá»­a `FileController` hay `PHASE_08_REPORT.md`.

## D-040 Service Category Canonical Error Codes

- XÃ¡c minh Ä‘á»‘i chiáº¿u vá»›i [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 20.6:
  1. `SERVICE_CATEGORY_NOT_FOUND` (HTTP 404): CÃ³ trong canonical contract (YES). DÃ¹ng cho `GET/PUT/PATCH /admin/service-categories/{id}` vÃ  `POST /service-requests` khi categoryId khÃ´ng tá»“n táº¡i.
  2. `SERVICE_CATEGORY_CODE_ALREADY_EXISTS` (HTTP 409): CÃ³ trong canonical contract (YES). Thay tháº¿ cho tÃªn ad-hoc `SERVICE_CATEGORY_CODE_DUPLICATE`.
  3. `SERVICE_CATEGORY_PARENT_INVALID` (HTTP 400): CÃ³ trong canonical contract (YES). DÃ¹ng khi danh má»¥c cha khÃ´ng tá»“n táº¡i hoáº·c khÃ´ng há»£p lá»‡, thay tháº¿ tÃªn ad-hoc `PARENT_CATEGORY_NOT_FOUND`.
  4. `SERVICE_CATEGORY_CYCLE_DETECTED` (HTTP 400): CÃ³ trong canonical contract (YES). DÃ¹ng khi phÃ¡t hiá»‡n chu trÃ¬nh danh má»¥c, thay tháº¿ tÃªn ad-hoc `CATEGORY_CYCLE_DETECTED`.
  5. `SERVICE_CATEGORY_ALREADY_INACTIVE` (HTTP 400): CÃ³ trong canonical contract (YES). DÃ¹ng khi deactivate danh má»¥c Ä‘Ã£ ngÆ°ng hoáº¡t Ä‘á»™ng.
  6. `SERVICE_CATEGORY_ALREADY_ACTIVE` (HTTP 400): CÃ³ trong canonical contract (YES). DÃ¹ng khi activate danh má»¥c Ä‘ang hoáº¡t Ä‘á»™ng.
  7. `SERVICE_CATEGORY_IN_USE` (HTTP 400): CÃ³ trong canonical contract (YES). DÃ¹ng khi thao tÃ¡c vi pháº¡m rÃ ng buá»™c danh má»¥c Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng.
- **Káº¿t luáº­n**: Táº¥t cáº£ cÃ¡c mÃ£ lá»—i cáº§n thiáº¿t cho Service Category Ä‘á»u Ä‘Ã£ cÃ³ sáºµn trong canonical contract dÆ°á»›i tÃªn chuáº©n `SERVICE_CATEGORY_*`. KhÃ´ng tá»“n táº¡i `SERVICE_CATEGORY_ERROR_CODE_GAP` náº¿u implementation tuÃ¢n thá»§ Ä‘Ãºng tÃªn canonical.

## D-041 Authorization Role-Permission Audit, Migration Decoupling, and Blockers

- **Káº¿t quáº£ kiá»ƒm toÃ¡n cÆ¡ sá»Ÿ dá»¯ liá»‡u vÃ  mÃ£ nguá»“n**:
  - `ROLE_PERMISSION_SEED_GAP_CONFIRMED`: Báº£n di trÃº `V011__seed_roles_and_permissions.sql` chá»‰ seed báº£ng `roles` (4 dÃ²ng) vÃ  `permissions` (29 dÃ²ng); báº£ng `role_permissions` cÃ³ **0 dÃ²ng**.
  - `TEST_AUTHORITY_FIXTURE_MASKS_SEED_GAP`: CÃ¡c test suite integration/MockMvc hiá»‡n táº¡i (`AdminUserMockMvcTest`, `DepartmentMockMvcTest`, `ProjectMockMvcTest`, `TaskMockMvcTest`, `TaskAttachmentMockMvcTest`) Ä‘á»u tá»± Ä‘á»™ng cháº¡y lá»‡nh `INSERT INTO role_permissions` trong `@BeforeEach`, che giáº¥u khoáº£ng trá»‘ng dá»¯ liá»‡u seed cá»§a mÃ´i trÆ°á»ng production.
  - `ROLE_PERMISSION_CANONICAL_MATRIX_GAP`: ÄÃ£ Ä‘Æ°á»£c giáº£i quyáº¿t báº±ng viá»‡c thiáº¿t láº­p báº£ng ma tráº­n chÃ­nh thá»©c trong `02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6.
  - `SERVICE_AUTHORIZATION_MAPPING_GAP`: ÄÃ£ giáº£i quyáº¿t báº±ng viá»‡c cáº¥p `SERVICE_REQUEST_ASSIGN` chÃ­nh thá»©c cho `ADMIN` trong MVP.
- **Quy táº¯c phÃ¢n quyá»n vÃ  Admin Bypass**:
  - Endpoint báº£o vá»‡ bá»Ÿi `@PreAuthorize("hasAuthority('...')")`. Khi `role_permissions` trá»‘ng, `authorities` chá»‰ cÃ³ `ROLE_<ROLE_CODE>`, khÃ´ng cÃ³ permission nÃ o.
  - Há»‡ thá»‘ng khÃ´ng cÃ³ cÆ¡ cháº¿ bypass cho Admin; do Ä‘Ã³ trÃªn production, má»i user (ká»ƒ cáº£ Admin) sáº½ bá»‹ HTTP 403 Forbidden náº¿u khÃ´ng cÃ³ dá»¯ liá»‡u trong `role_permissions`.
  - Vai trÃ² `TEAM_LEADER` chá»‰ quáº£n lÃ½ cÃ´ng viá»‡c dá»± Ã¡n/nhÃ³m (`TASK_ASSIGN`), khÃ´ng cÃ³ tháº©m quyá»n phÃ¢n cÃ´ng yÃªu cáº§u dá»‹ch vá»¥ (`SERVICE_REQUEST_ASSIGN`). Tuyá»‡t Ä‘á»‘i khÃ´ng suy diá»…n cáº¥p quyá»n chá»‰ vÃ¬ tÃªn chá»©c danh.
- **Káº¿ hoáº¡ch Migration Phase 9**:
  - TÃ¡ch biá»‡t hai báº£n migration (PhÆ°Æ¡ng Ã¡n B):
    1. `V013__add_service_request_assignment_invariants.sql`: Chá»‰ táº¡o partial unique index `uk_service_assignments_one_active` trong domain Service Request.
    2. `V014__seed_role_permissions.sql`: Seed dá»¯ liá»‡u liÃªn káº¿t vai trÃ² - quyá»n háº¡n sau khi tÃ i liá»‡u canonical hoÃ n táº¥t phÃª duyá»‡t ma tráº­n phÃ¢n quyá»n chÃ­nh thá»©c.
  - Sá»­ dá»¥ng cÃº phÃ¡p idempotent `INSERT INTO role_permissions ... ON CONFLICT (role_id, permission_id) DO NOTHING`.

## D-042 Canonical Role-Permission Matrix Resolution and Foundation Authorization Remediation

- **Ma tráº­n phÃ¢n quyá»n Canonical chÃ­nh thá»©c**:
  - ÄÃ£ bá»• sung Section 2.6 vÃ o [02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md).
  - PhÃ¢n bá»• 29 permissions cho 4 System Roles:
    - `ADMIN`: 29 permissions (toÃ n bá»™ quyá»n há»‡ thá»‘ng).
    - `PROJECT_MANAGER`: 19 permissions (cÃ¡c quyá»n tá»± phá»¥c vá»¥, quáº£n lÃ½ dá»± Ã¡n phá»¥ trÃ¡ch vÃ  quáº£n lÃ½ cÃ´ng viá»‡c).
    - `TEAM_LEADER`: 14 permissions (káº¿ thá»«a tá»± phá»¥c vá»¥ cá»§a nhÃ¢n viÃªn, bá»• sung `TASK_CREATE`, `TASK_ASSIGN`, `TASK_UPDATE_STATUS`).
    - `EMPLOYEE`: 12 permissions (chá»‰ gá»“m cÃ¡c quyá»n tá»± phá»¥c vá»¥ cÃ¡ nhÃ¢n, cáº­p nháº­t cÃ´ng viá»‡c Ä‘Æ°á»£c giao vÃ  cÃ¡c yÃªu cáº§u dá»‹ch vá»¥ cá»§a chÃ­nh mÃ¬nh).
  - Báº£ng quyá»n háº¡n há»‡ thá»‘ng chá»‰ Ä‘Ã³ng vai trÃ² lÃ  "cá»•ng kiá»ƒm tra toÃ n cá»¥c" (`hasAuthority(...)`); cÃ¡c Application Service báº¯t buá»™c tiáº¿p tá»¥c kiá»ƒm tra cÃ¡c rÃ ng buá»™c quan há»‡ nghiá»‡p vá»¥ cá»¥c bá»™ (`project membership`, `requester`, `active assignee`, `resource ownership`).
- **Hiá»‡n thá»±c di trÃº CSDL**:
  - `V013__add_service_request_assignment_invariants.sql`: Táº¡o thÃ nh cÃ´ng partial unique index `uk_service_assignments_one_active` trÃªn `service_assignments(request_id) WHERE is_active = TRUE`.
  - `V014__seed_role_permissions.sql`: Seed 74 báº£n ghi liÃªn káº¿t quyá»n háº¡n chÃ­nh thá»©c vÃ o `role_permissions` vá»›i cÆ¡ cháº¿ idempotent `ON CONFLICT (role_id, permission_id) DO NOTHING`.
- **Kiá»ƒm thá»­ xÃ¡c thá»±c sáº¡ch (Clean-Migration Auth Test)**:
  - Bá»• sung `RolePermissionSeedIntegrationTest.java` cháº¡y trÃªn PostgreSQL Testcontainers sáº¡ch.
  - Kiá»ƒm thá»­ Ä‘Äƒng nháº­p tháº­t qua `/api/v1/auth/login`, nháº­n JWT tháº­t vÃ  gá»­i request tá»›i cÃ¡c endpoint báº£o vá»‡ báº±ng `@PreAuthorize`.
  - Tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ báº¥t ká»³ cÃ¢u lá»‡nh chÃ¨n fixture thá»§ cÃ´ng nÃ o vÃ o `role_permissions` trong test nÃ y. ToÃ n bá»™ quyá»n háº¡n Ä‘Æ°á»£c náº¡p 100% tá»« migration `V014`.
  - Kiá»ƒm tra Ä‘á»™c láº­p quyá»n `SERVICE_REQUEST_ASSIGN`: Admin Ä‘Æ°á»£c phÃ©p, Team Leader / PM / Employee bá»‹ tá»« chá»‘i vá»›i HTTP 403 Forbidden.
  - ToÃ n bá»™ 177/177 bÃ i kiá»ƒm thá»­ cá»§a repository vÃ  0 lá»—i Checkstyle Ä‘á»u PASS vá»›i exit code 0.

## D-043 Project Member Access Remediation, Canonical Matrix Hardening, and V015 Migration

- **Bá»‘i cáº£nh**:
  - Kiá»ƒm toÃ¡n Ä‘á»™c láº­p phÃ¡t hiá»‡n `PROJECT_READ_PERMISSION_MATRIX_RISK`: `ProjectController` báº£o vá»‡ endpoint `GET /projects/{projectId}`, `GET /projects/{projectId}/members`, `GET /projects/{projectId}/milestones` báº±ng `@PreAuthorize("hasAuthority('PROJECT_READ')")`.
  - Trong ma tráº­n V014 trÆ°á»›c Ä‘Ã¢y, `PROJECT_READ` chá»‰ Ä‘Æ°á»£c cáº¥p cho `ADMIN` vÃ  `PROJECT_MANAGER`. Do Ä‘Ã³, nhÃ¢n viÃªn (`EMPLOYEE`) vÃ  trÆ°á»Ÿng nhÃ³m (`TEAM_LEADER`) dÃ¹ lÃ  thÃ nh viÃªn dá»± Ã¡n Ä‘ang hoáº¡t Ä‘á»™ng (`active project member`) cÅ©ng bá»‹ cháº·n bá»Ÿi cá»•ng báº£o vá»‡ Spring Security vá»›i HTTP 403 Forbidden trÆ°á»›c khi request Ä‘áº¿n Ä‘Æ°á»£c táº§ng nghiá»‡p vá»¥.
  - Kiá»ƒm toÃ¡n cÅ©ng phÃ¡t hiá»‡n `ROLE_PERMISSION_SEED_SILENT_OMISSION_RISK` do cÃ¢u lá»‡nh `INSERT ... SELECT WHERE p.code IN (...)` cÃ³ thá»ƒ im láº·ng bá» sÃ³t dÃ²ng náº¿u cÃ³ lá»—i chÃ­nh táº£, vÃ  `ROLE_PERMISSION_MATRIX_EVIDENCE_GAP` do lá»‡ch sá»‘ section tham chiáº¿u trong cá»™t rationale cá»§a tÃ i liá»‡u canonical.
- **Quyáº¿t Ä‘á»‹nh Ä‘iá»u chá»‰nh Ma tráº­n Canonical**:
  - `PROJECT_READ` Ä‘Æ°á»£c chÃ­nh thá»©c cáº¥p (`GRANTED`) cho toÃ n bá»™ 4 System Roles (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`).
  - Äiá»u kiá»‡n quan há»‡ nghiá»‡p vá»¥ báº¯t buá»™c (`Business relation required`): ThÃ nh viÃªn dá»± Ã¡n Ä‘ang hoáº¡t Ä‘á»™ng (`Active Project Member`) hoáº·c pháº¡m vi quáº£n trá»‹ canonical cá»§a `ADMIN`.
  - Quyá»n `PROJECT_READ` toÃ n cá»¥c Ä‘Ã³ng vai trÃ² cá»•ng xÃ¡c thá»±c; táº§ng Application Service/Repository báº¯t buá»™c tiáº¿p tá»¥c kiá»ƒm tra quyá»n thÃ nh viÃªn vÃ  phÃ¢n quyá»n dá»¯ liá»‡u.
  - Hiá»‡u chá»‰nh toÃ n bá»™ cÃ¡c tham chiáº¿u sá»‘ section bá»‹ lá»‡ch trong cá»™t rationale cá»§a `docs/02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6 (trá» Ä‘Ãºng Section 11 cho Project, Section 12 cho Task, Section 17 cho Admin/User/Department, Section 18 cho Audit).
- **Di trÃº CSDL V015 (Báº¥t biáº¿n V014)**:
  - Giá»¯ nguyÃªn V001â€“V014 Ä‘á»ƒ báº£o toÃ n checksum Flyway.
  - Táº¡o má»›i `V015__correct_project_read_permissions_and_validate_role_matrix.sql`:
    1. Cáº¥p bá»• sung `PROJECT_READ` cho `TEAM_LEADER` vÃ  `EMPLOYEE`.
    2. Bá»• sung `DO $$ ... END $$;` block thá»±c hiá»‡n strict validation guard, fail-fast náº¿u sai sá»‘ lÆ°á»£ng mapping:
       - roles = 4, permissions = 29.
       - ADMIN = 29, PROJECT_MANAGER = 19, TEAM_LEADER = 15, EMPLOYEE = 13.
       - Tá»•ng mapping = 76.
       - `PROJECT_READ` cÃ³ Ä‘á»§ trÃªn cáº£ 4 vai trÃ².
       - `SERVICE_REQUEST_ASSIGN` vÃ  `SERVICE_CATEGORY_MANAGE` chá»‰ duy nháº¥t thuá»™c vá» `ADMIN`.
- **Kiá»ƒm thá»­ vÃ  xÃ¡c minh**:
  - Cáº­p nháº­t `RolePermissionSeedIntegrationTest.java` vá»›i ká»‹ch báº£n kiá»ƒm tra exact set comparison (`EXPECTED EXCEPT ACTUAL = empty` vÃ  `ACTUAL EXCEPT EXPECTED = empty`).
  - Bá»• sung ká»‹ch báº£n kiá»ƒm thá»­ tÃ­ch há»£p truy cáº­p chi tiáº¿t dá»± Ã¡n (`GET /api/v1/projects/{projectId}`) cho `EMPLOYEE` vÃ  `TEAM_LEADER` lÃ  active project member, xÃ¡c nháº­n tráº£ vá» HTTP 200 OK thÃ nh cÃ´ng báº±ng JWT tháº­t.
  - Cáº­p nháº­t `ProjectMockMvcTest.java` Ä‘á»ƒ kiá»ƒm thá»­ kiá»ƒm tra quyá»n truy cáº­p dá»± Ã¡n báº±ng token khÃ´ng cÃ³ quyá»n (`unprivilegedToken`) thay cho `employeeToken`.

## D-044 Project Read Member-Scoped Access Control and Query-Level Enforcement

- **Bá»‘i cáº£nh & PhÃ¡t hiá»‡n Kiá»ƒm toÃ¡n**:
  - Kiá»ƒm toÃ¡n mÃ£ nguá»“n phÃ¡t hiá»‡n dá»¯ liá»‡u dá»± Ã¡n bá»‹ rÃ² rá»‰ (data leak):
    - `GET /api/v1/projects`: TrÆ°á»›c Ä‘Ã¢y khÃ´ng truyá»n thÃ´ng tin ngÆ°á»i dÃ¹ng xÃ¡c thá»±c xuá»‘ng Application Service/Repository; cÃ¢u lá»‡nh query tráº£ vá» toÃ n bá»™ dá»± Ã¡n trong cÆ¡ sá»Ÿ dá»¯ liá»‡u mÃ  khÃ´ng lá»c theo quan há»‡ thÃ nh viÃªn.
    - `GET /api/v1/projects/{projectId}`, `GET /api/v1/projects/{projectId}/members`, `GET /api/v1/projects/{projectId}/milestones`: KhÃ´ng kiá»ƒm tra xem ngÆ°á»i gá»i cÃ³ pháº£i lÃ  active project member hoáº·c Admin khÃ´ng; ngÆ°á»i dÃ¹ng unrelated hoáº·c inactive member chá»‰ cáº§n cÃ³ global `PROJECT_READ` lÃ  Ä‘á»c Ä‘Æ°á»£c toÃ n bá»™ chi tiáº¿t, thÃ nh viÃªn vÃ  má»‘c tiáº¿n Ä‘á»™ cá»§a dá»± Ã¡n.
- **Quy táº¯c PhÃ¢n quyá»n Äá»c Dá»± Ã¡n theo Canonical**:
  - `ADMIN`: CÃ³ pháº¡m vi quáº£n trá»‹ toÃ n há»‡ thá»‘ng theo canonical; Ä‘Æ°á»£c quyá»n xem toÃ n bá»™ dá»± Ã¡n, danh sÃ¡ch thÃ nh viÃªn vÃ  má»‘c tiáº¿n Ä‘á»™ mÃ  khÃ´ng yÃªu cáº§u pháº£i lÃ  thÃ nh viÃªn trong báº£ng `project_members`.
  - `EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`: Báº¯t buá»™c pháº£i lÃ  thÃ nh viÃªn Ä‘ang hoáº¡t Ä‘á»™ng (`is_active = TRUE`) trong `project_members` cá»§a dá»± Ã¡n Ä‘Ã³ má»›i Ä‘Æ°á»£c truy cáº­p (`GET /projects/{projectId}`, `GET /projects/{projectId}/members`, `GET /projects/{projectId}/milestones`). Náº¿u khÃ´ng pháº£i active member, tráº£ vá» HTTP 403 Forbidden (`FORBIDDEN`).
  - PhÃ¢n vÃ¹ng truy váº¥n danh sÃ¡ch (`GET /api/v1/projects`):
    - Thá»±c thi hoÃ n toÃ n táº¡i táº§ng CSDL thÃ´ng qua cÃ¢u lá»‡nh SQL JPQL:
      `AND (:memberUserId IS NULL OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :memberUserId AND pm.active = true))`
    - Tuyá»‡t Ä‘á»‘i khÃ´ng táº£i toÃ n bá»™ vÃ o Java rá»“i lá»c in-memory sau phÃ¢n trang.
    - Cáº£ truy váº¥n dá»¯ liá»‡u vÃ  truy váº¥n Ä‘áº¿m (`countQuery`) Ä‘á»u Ã¡p dá»¥ng cÃ¹ng Ä‘iá»u kiá»‡n scope, Ä‘áº£m báº£o metadata phÃ¢n trang (`totalElements`, `totalPages`) hoÃ n toÃ n chÃ­nh xÃ¡c.
    - CÃ¡c tham sá»‘ tÃ¬m kiáº¿m (`search`), bá»™ lá»c (`status`, `priority`, `managerId`, `departmentId`) vÃ  sáº¯p xáº¿p (`sort`) Ä‘Æ°á»£c káº¿t há»£p báº±ng `AND`, Ä‘áº£m báº£o khÃ´ng bao giá» bá»‹ máº¥t pháº¡m vi (scope loss).
- **Hiá»‡n thá»±c & Kiá»ƒm thá»­**:
  - Cáº­p nháº­t `ProjectRepository.java`, `ProjectApplicationService.java`, `ProjectMemberApplicationService.java`, `MilestoneApplicationService.java`, `ProjectController.java`.
  - ThÃªm 5 ká»‹ch báº£n kiá»ƒm thá»­ tÃ­ch há»£p toÃ n diá»‡n trong `RolePermissionSeedIntegrationTest.java` (Test 9, 10, 11, 12, 13) sá»­ dá»¥ng login tháº­t vÃ  JWT tháº­t tá»« V015 trÃªn PostgreSQL Testcontainers sáº¡ch:
    - Test 9: Active Employee & Team Leader Ä‘á»c thÃ nh cÃ´ng detail, members, milestones vÃ  list (HTTP 200).
    - Test 10: Unrelated Employee bá»‹ tá»« chá»‘i 403 Forbidden trÃªn detail, members, milestones; dá»± Ã¡n khÃ´ng xuáº¥t hiá»‡n trong list (`totalItems = 0`).
    - Test 11: Inactive Member (`is_active = false`) bá»‹ tá»« chá»‘i 403 Forbidden trÃªn detail, members, milestones; dá»± Ã¡n khÃ´ng xuáº¥t hiá»‡n trong list.
    - Test 12: Multi-project database scoping (A=active, B=unrelated, C=inactive) chá»‰ tráº£ vá» Project A vá»›i totalElements=1; search vÃ  sort báº£o toÃ n scope.
    - Test 13: Admin truy cáº­p toÃ n cá»¥c; Project Manager chá»‰ truy cáº­p Ä‘Æ°á»£c dá»± Ã¡n mÃ¬nh tham gia, bá»‹ tá»« chá»‘i 403 á»Ÿ dá»± Ã¡n khÃ´ng liÃªn quan.
  - ToÃ n bá»™ suite 183/183 PASS vÃ  0 lá»—i Checkstyle.

## D-045 Service Request Module Implementation (Phase 9)

- **Bá»‘i cáº£nh**:
  - Triá»ƒn khai Phase 9 - Service Request Module theo cÃ¡c tÃ i liá»‡u canonical vÃ  quyáº¿t Ä‘á»‹nh D-035 Ä‘áº¿n D-044.
  - CSDL Ä‘Ã£ cÃ³ Ä‘áº§y Ä‘á»§ schema tá»« V007, V010, V013 vÃ  authorization foundation tá»« V014, V015 (khÃ´ng cáº§n táº¡o V016).
- **Quyáº¿t Ä‘á»‹nh Thiáº¿t káº¿ & Hiá»‡n thá»±c**:
  1. **Service Category**:
     - Há»— trá»£ phÃ¢n cáº¥p cÃ¢y danh má»¥c vá»›i Ä‘á»™ sÃ¢u tÃ¹y Ã½ (> 50 cáº¥p Ä‘Æ°á»£c kiá»ƒm chá»©ng há»£p lá»‡).
     - Thuáº­t toÃ¡n phÃ¡t hiá»‡n chu trÃ¬nh (cycle detection) báº±ng `Set<UUID>` trong má»™t lÆ°á»£t duyá»‡t tá»« node cha lÃªn gá»‘c (`SERVICE_CATEGORY_CYCLE_DETECTED`).
     - Chuáº©n hÃ³a mÃ£ Ä‘á»‹nh danh (`code`) theo regex `^[A-Z0-9_]{2,50}$` vÃ  Ä‘áº£m báº£o duy nháº¥t (`SERVICE_CATEGORY_CODE_ALREADY_EXISTS`, 409).
     - RÃ ng buá»™c cha pháº£i tá»“n táº¡i, Ä‘ang hoáº¡t Ä‘á»™ng (`is_active = true`) vÃ  chÆ°a bá»‹ xoÃ¡ má»m (`SERVICE_CATEGORY_PARENT_INVALID`).
     - Cháº·n vÃ´ hiá»‡u hÃ³a danh má»¥c Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi cÃ¡c service request chÆ°a káº¿t thÃºc (`SERVICE_CATEGORY_IN_USE`, 400).
  2. **Request Number Generation**:
     - Äá»‹nh dáº¡ng: `SR-YYYY-NNNNNN` sinh tuáº§n tá»± dá»±a trÃªn nÄƒm há»‡ thá»‘ng tá»« injected `Clock` (Asia/Ho_Chi_Minh).
     - Sá»­ dá»¥ng PostgreSQL advisory lock 2 khÃ³a: `SELECT pg_advisory_xact_lock(1301, :year)`.
     - Phá»¥c há»“i vÃ  reset tuáº§n tá»± vá» 000001 an toÃ n khi sang nÄƒm dÆ°Æ¡ng lá»‹ch má»›i.
  3. **Service Assignment Lifecycle & Invariants**:
     - Äáº£m báº£o báº¥t biáº¿n tá»‘i Ä‘a 1 ngÆ°á»i xá»­ lÃ½ hoáº¡t Ä‘á»™ng (`0..1`) trÃªn má»—i request.
     - Sá»­ dá»¥ng pessimistic write lock (`PESSIMISTIC_WRITE` vá»›i lock timeout) trÃªn `ServiceRequest` trÆ°á»›c khi phÃ¢n cÃ´ng.
     - PhÃ¢n cÃ´ng láº¡i cÃ¹ng ngÆ°á»i xá»­ lÃ½ lÃ  idempotent (HTTP 200 OK, khÃ´ng táº¡o báº£n ghi trÃ¹ng láº·p).
     - TÃ¡i phÃ¢n cÃ´ng cho ngÆ°á»i khÃ¡c: ÄÃ³ng báº£n ghi cÅ© (`is_active = FALSE`, `unassigned_at = Clock.instant()`) vÃ  thÃªm báº£n ghi má»›i trong cÃ¹ng transaction.
     - Database final guard: Partial unique index `uk_service_assignments_one_active` (tá»« V013) Ä‘Æ°á»£c map chÃ­nh xÃ¡c qua SQLException SQLState 23505 sang `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict).
  4. **Status Workflow & History**:
     - 7 tráº¡ng thÃ¡i chuáº©n: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
     - Chuyá»ƒn sang `RESOLVED` báº¯t buá»™c cÃ³ ghi chÃº/giáº£i phÃ¡p (`comment`).
     - Tráº¡ng thÃ¡i káº¿t thÃºc: `CLOSED` (ghi nháº­n `closed_at`), `CANCELLED` (ghi nháº­n `cancelled_at`).
     - Má»i bÆ°á»›c chuyá»ƒn tráº¡ng thÃ¡i há»£p lá»‡ Ä‘á»u ghi nháº­n lá»‹ch sá»­ vÃ o `service_status_histories` trong cÃ¹ng transaction vá»›i `changedBy` tá»« principal vÃ  `changedAt` tá»« injected `Clock`.
  5. **Reject Resolution Endpoint**:
     - Endpoint chuyÃªn biá»‡t: `POST /service-requests/{requestId}/reject-resolution`.
     - RÃ ng buá»™c quyá»n sá»Ÿ há»¯u: Chá»‰ ngÆ°á»i táº¡o yÃªu cáº§u (`requester`) má»›i Ä‘Æ°á»£c gá»i; ngÆ°á»i khÃ¡c bá»‹ cháº·n 403 Forbidden.
     - Chá»‰ cho phÃ©p khi yÃªu cáº§u Ä‘ang á»Ÿ `RESOLVED`, chuyá»ƒn vá» `IN_PROGRESS`, giá»¯ nguyÃªn ngÆ°á»i xá»­ lÃ½ Ä‘ang hoáº¡t Ä‘á»™ng vÃ  ghi lÃ½ do vÃ o lá»‹ch sá»­.
  6. **Comments & Internal Notes**:
     - PhÃ¢n loáº¡i rÃµ bÃ¬nh luáº­n cÃ´ng khai vÃ  ghi chÃº ná»™i bá»™ (`is_internal = true`).
     - NgÆ°á»i táº¡o yÃªu cáº§u khÃ´ng Ä‘Æ°á»£c phÃ©p táº¡o hoáº·c xem ghi chÃº ná»™i bá»™ (lá»c triá»‡t Ä‘á»ƒ á»Ÿ táº§ng query database).
  7. **Attachments & File Integration**:
     - TÃ¡i sá»­ dá»¥ng File Module Phase 8; tá»‡p pháº£i upload trÆ°á»›c vá»›i má»¥c Ä‘Ã­ch `SERVICE_ATTACHMENT` vÃ  tráº¡ng thÃ¡i `ACTIVE`.
     - Kiá»ƒm tra quyá»n sá»Ÿ há»¯u tá»‡p (ngÆ°á»i táº£i lÃªn hoáº·c Admin) vÃ  cáº¥m tÃ¡i sá»­ dá»¥ng chÃ©o giá»¯a cÃ¡c service request khÃ¡c nhau.
     - Download authorization thá»«a káº¿ quyá»n truy cáº­p service request (requester, active assignee, admin); ngÆ°á»i khÃ´ng liÃªn quan bá»‹ 403 Forbidden.
     - Chiáº¿u response theo chuáº©n D-035: khÃ´ng Ä‘á»ƒ lá»™ thÃ´ng tin Ä‘Æ°á»ng dáº«n lÆ°u trá»¯ ná»™i bá»™.
  8. **Service Rating**:
     - Chá»‰ ngÆ°á»i táº¡o yÃªu cáº§u Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡ khi yÃªu cáº§u Ä‘Ã£ á»Ÿ tráº¡ng thÃ¡i `CLOSED`.
     - Äiá»ƒm sá»‘ tá»« 1 Ä‘áº¿n 5; tá»‘i Ä‘a 1 Ä‘Ã¡nh giÃ¡ cho má»—i yÃªu cáº§u, báº£o vá»‡ bá»Ÿi unique constraint `service_ratings.request_id` (`SERVICE_RATING_ALREADY_EXISTS`, 409).
  9. **Query-Level Scoping**:
     - Sá»­ dá»¥ng Spring Data JPA `Specification<ServiceRequest>` Ä‘á»ƒ lá»c hoÃ n toÃ n táº¡i cÃ¢u lá»‡nh SQL trong database (Admin xem táº¥t cáº£; ngÆ°á»i khÃ¡c chá»‰ xem yÃªu cáº§u do mÃ¬nh táº¡o hoáº·c Ä‘Æ°á»£c phÃ¢n cÃ´ng).
     - Metadata phÃ¢n trang vÃ  Ä‘áº¿m dÃ²ng báº£o toÃ n scope tuyá»‡t Ä‘á»‘i.
  10. **Deferred Side Effects**:
      - Ghi nháº­n `NOTIFICATION_SIDE_EFFECT_DEFERRED` vÃ o nháº­t kÃ½ há»‡ thá»‘ng; khÃ´ng táº¡o module notification hoáº·c phá»¥ thuá»™c giáº£ láº­p.
