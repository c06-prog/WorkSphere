# Sổ Đăng Ký Công Cụ Và Tiện Ích Mở Rộng WorkSphere (Tool & Extension Registry)

Tài liệu quản lý, theo dõi nguồn gốc, chữ ký số, đường dẫn thực thi, quyền hạn và trạng thái kiểm định của toàn bộ công cụ CLI, ứng dụng phát triển, tiện ích mở rộng (Antigravity IDE / VS Code Extensions) và driver được sử dụng trong dự án WorkSphere.

Ngày thiết lập: 18/10/2026.
Cơ chế ban hành: Quyết định **D-057** và các quy định tại `AGENTS.md`.
Liên kết tham chiếu: Kế thừa và đồng bộ hóa với [`reports/ENVIRONMENT_TOOL_REGISTRY.md`](file:///d:/WorkSphere/reports/ENVIRONMENT_TOOL_REGISTRY.md).

---

## 1. Nguyên Tắc Quản Trị Công Cụ và Extension

1. **Phân biệt trạng thái rõ ràng**:
   - `INSTALLED`: Đã cài trên hệ điều hành host hoặc IDE.
   - `ENABLED`: Đang được bật trong môi trường thực thi.
   - `ENABLED_FOR_WORKSPHERE`: Đã kích hoạt cho workspace WorkSphere.
   - `APPROVED`: Đã qua kiểm tra bảo mật, giấy phép và được duyệt sử dụng.
   - `REQUIRED`: Công cụ bắt buộc phải có để thực hiện nhiệm vụ theo canonical docs.
   - `OPTIONAL`: Công cụ bổ trợ, có thể dùng khi cần thiết.
   - `DEPRECATED`: Không còn khuyến khích sử dụng; đang chờ thay thế.
   - `REJECTED`: Bị cấm sử dụng trong WorkSphere do vi phạm chính sách bảo mật/giấy phép.
   - `QUARANTINED`: Đang nằm trong khu cách ly `.external/quarantine/tools/` hoặc `extensions/` để kiểm định.
2. **Quy chuẩn tải và cài đặt**:
   - Ưu tiên công cụ có sẵn trên máy host (`where.exe`, `Get-Command`).
   - Ưu tiên nguồn chính thức: `winget` chính thức, trang chủ verified publisher, Marketplace tích hợp.
   - Cấm tải từ search mirrors, repackaging sites, hoặc trang web phần mềm bên thứ ba không chính thức.
   - Công cụ tải về phải được xác minh mã băm SHA-256 hoặc chữ ký số Authenticode.
   - Tải về trước tiên phải lưu vào `.external/quarantine/tools/` hoặc `.external/quarantine/extensions/`.
   - Không tự động yêu cầu quyền Administrator nếu không có chỉ định nhiệm vụ bắt buộc.
   - Không sửa đổi vĩnh viễn biến môi trường PATH hệ thống nếu chưa có phê duyệt.

---

## 2. Mẫu Hồ Sơ Chuẩn (Tool & Extension Template)

```markdown
### [TOOL-EXT-XXX] <Tên công cụ hoặc Extension>

- **Registry ID**: `TOOL-EXT-XXX`
- **Phân loại (Category)**: `tool` | `application` | `cli` | `extension` | `driver`
- **Tên sản phẩm**: <Tên hiển thị>
- **Extension ID** (nếu là extension): `<publisher>.<name>`
- **Publisher / Nhà phát hành**: <Tên đơn vị>
- **Nguồn tải chính thức**: <URL trang chủ hoặc Marketplace>
- **Phiên bản**: <Version>
- **Hình thức cài đặt**: `portable` | `installer` | `winget` | `marketplace` | `package_manager` | `builtin`
- **Mã băm SHA-256**: <Checksum nếu tải offline>
- **Chữ ký số Authenticode**: `VALID_OFFICIAL` | `UNSIGNED` | `SELF_SIGNED` | `NOT_APPLICABLE`
- **Đường dẫn tệp thực thi / VSIX**: `<Executable or VSIX path>`
- **Đường dẫn dữ liệu (Data Path)**: `<Path>`
- **Đường dẫn bộ đệm (Cache Path)**: `<Path>`
- **Đường dẫn cấu hình (Config Path)**: `<Path>`
- **Đường dẫn nhật ký (Log Path)**: `<Path>`
- **Yêu cầu quyền Administrator**: `Có` | `Không`
- **Tác động biến môi trường PATH**: `Không` | `Bổ sung đường dẫn ...`
- **Dịch vụ chạy ngầm / Background Tasks**: `Không` | `Tên service ...`
- **Điểm cuối mạng (Network Endpoints)**: `Offline-only` | `Localhost only` | `Endpoints ...`
- **Yêu cầu Workspace Trust**: `Có` | `Không`
- **Giấy phép (License)**: `<SPDX identifier>`
- **Trạng thái (Status)**: `INSTALLED` | `ENABLED` | `ENABLED_FOR_WORKSPHERE` | `APPROVED` | `REQUIRED` | `OPTIONAL` | `DEPRECATED` | `REJECTED` | `QUARANTINED`
- **Lệnh kiểm tra (Verification)**: `<Command>`
- **Quy trình gỡ bỏ / Phục hồi**: `<Command or steps>`
- **Mục đích phục vụ WorkSphere**: <Mô tả nghiệp vụ>
- **Ngày xác minh gần nhất**: YYYY-MM-DD
- **Ghi chú**: ...
```

---

## 3. Danh Mục Công Cụ Nền Tảng (Core Platform Tools)

### [TOOL-EXT-001] Git for Windows

- **Registry ID**: `TOOL-EXT-001`
- **Phân loại**: `cli`
- **Tên sản phẩm**: Git for Windows
- **Publisher**: Software Freedom Conservancy
- **Nguồn tải chính thức**: `https://git-scm.com/download/win` / winget (`Git.Git`)
- **Phiên bản**: `2.55.0.windows.3`
- **Hình thức cài đặt**: `installer`
- **Chữ ký số Authenticode**: `VALID_OFFICIAL`
- **Đường dẫn tệp thực thi**: `C:\Program Files\Git\cmd\git.exe`
- **Đường dẫn dữ liệu**: `D:\WorkSphere\.git`
- **Đường dẫn cấu hình**: `C:\Users\dienm\.gitconfig`
- **Yêu cầu quyền Administrator**: Không
- **Tác động biến môi trường PATH**: Đã tích hợp trong User PATH
- **Dịch vụ chạy ngầm**: Không
- **Điểm cuối mạng**: `https://github.com/c06-prog/WorkSphere.git`
- **Giấy phép**: `GPL-2.0-only`
- **Trạng thái**: `REQUIRED`, `APPROVED`, `INSTALLED`
- **Lệnh kiểm tra**: `git --version`, `git status`
- **Quy trình gỡ bỏ**: `winget uninstall Git.Git`
- **Mục đích phục vụ WorkSphere**: Quản lý phiên bản, lịch sử kiểm toán, commit, diff và đồng bộ GitHub.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-002] Java Development Kit 27 (Target Bytecode Java 21)

- **Registry ID**: `TOOL-EXT-002`
- **Phân loại**: `tool`
- **Tên sản phẩm**: Oracle Java Development Kit (JDK) 27
- **Publisher**: Oracle Corporation
- **Nguồn tải chính thức**: `https://www.oracle.com/java/technologies/downloads/`
- **Phiên bản**: `27+35-2325` (Runtime JDK 27, target bytecode Java 21)
- **Hình thức cài đặt**: `installer`
- **Chữ ký số Authenticode**: `VALID_OFFICIAL`
- **Đường dẫn tệp thực thi**: `D:\Java\bin\java.exe`
- **Đường dẫn dữ liệu**: `D:\Java`
- **Yêu cầu quyền Administrator**: Không khi chạy
- **Tác động biến môi trường PATH**: `JAVA_HOME=D:\Java`
- **Giấy phép**: `NFTC` (Oracle No-Fee Terms and Conditions)
- **Trạng thái**: `REQUIRED`, `APPROVED`, `INSTALLED`
- **Lệnh kiểm tra**: `java -version`
- **Quy trình gỡ bỏ**: Windows Settings -> Installed Apps
- **Mục đích phục vụ WorkSphere**: Biên dịch và chạy backend Spring Boot Modular Monolith.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-003] Node.js and NPM

- **Registry ID**: `TOOL-EXT-003`
- **Phân loại**: `tool`
- **Tên sản phẩm**: Node.js JavaScript Runtime & NPM Package Manager
- **Publisher**: OpenJS Foundation
- **Nguồn tải chính thức**: `https://nodejs.org/` / winget (`OpenJS.NodeJS.LTS`)
- **Phiên bản**: Node.js `v20.18.0` / NPM `10.8.2`
- **Hình thức cài đặt**: `installer`
- **Chữ ký số Authenticode**: `VALID_OFFICIAL`
- **Đường dẫn tệp thực thi**: `C:\Program Files\nodejs\node.exe`, `C:\Program Files\nodejs\npm.cmd`
- **Đường dẫn bộ đệm**: `C:\Users\dienm\AppData\Local\npm-cache`
- **Yêu cầu quyền Administrator**: Không khi chạy
- **Tác động biến môi trường PATH**: Đã tích hợp trong System/User PATH
- **Giấy phép**: `MIT`
- **Trạng thái**: `REQUIRED`, `APPROVED`, `INSTALLED`
- **Lệnh kiểm tra**: `node -v`, `npm -v`
- **Quy trình gỡ bỏ**: `winget uninstall OpenJS.NodeJS.LTS`
- **Mục đích phục vụ WorkSphere**: Môi trường Metro Bundler, React Native CLI, Jest, TypeScript compiler và linter cho ứng dụng di động.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-004] Docker Desktop Engine

- **Registry ID**: `TOOL-EXT-004`
- **Phân loại**: `application`
- **Tên sản phẩm**: Docker Desktop Community (Docker Engine, Compose, CLI)
- **Publisher**: Docker Inc.
- **Nguồn tải chính thức**: `https://www.docker.com/products/docker-desktop/`
- **Phiên bản**: Docker Desktop `4.94.0`, Docker Engine `29.8.2`
- **Hình thức cài đặt**: `installer`
- **Chữ ký số Authenticode**: `VALID_OFFICIAL`
- **Đường dẫn tệp thực thi**: `C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe`
- **Đường dẫn dữ liệu**: `D:\DockerData\DockerDesktopWSL`
- **Yêu cầu quyền Administrator**: Khi cài đặt và khởi động service
- **Dịch vụ chạy ngầm**: `com.docker.service`, WSL2 backend
- **Điểm cuối mạng**: `127.0.0.1:5432` (`worksphere-dev-pg`), `127.0.0.1:8088` (`jenkins-lts`)
- **Giấy phép**: `Docker Subscription Service Agreement` (Personal / Academic)
- **Trạng thái**: `REQUIRED`, `APPROVED`, `INSTALLED`
- **Lệnh kiểm tra**: `docker version`, `docker ps`
- **Quy trình gỡ bỏ**: Windows Settings -> Installed Apps
- **Mục đích phục vụ WorkSphere**: Chạy PostgreSQL container phát triển (`worksphere-dev-pg`), Jenkins CI/CD và Testcontainers integration tests.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-005] Android SDK Platform-Tools & Android Emulator

- **Registry ID**: `TOOL-EXT-005`
- **Phân loại**: `tool`
- **Tên sản phẩm**: Android SDK Platform-Tools (ADB) & Emulator
- **Publisher**: Google LLC
- **Nguồn tải chính thức**: Android Studio / Google Android SDK Command-Line Tools
- **Phiên bản**: ADB `1.0.41` (version 35.0.2), Emulator API 35 (Android 15)
- **Hình thức cài đặt**: `portable` / SDK Manager
- **Đường dẫn tệp thực thi**: `D:\AndroidSDK\platform-tools\adb.exe`, `D:\AndroidSDK\emulator\emulator.exe`
- **Đường dẫn dữ liệu**: `D:\AndroidSDK`, `D:\AndroidAVD`
- **Yêu cầu quyền Administrator**: Không khi chạy
- **Tác động biến môi trường PATH**: `ANDROID_HOME=D:\AndroidSDK`
- **Điểm cuối mạng**: `127.0.0.1:5554`, `10.0.2.2` (host bridge từ máy ảo)
- **Giấy phép**: `Android Software Development Kit License`
- **Trạng thái**: `REQUIRED`, `APPROVED`, `INSTALLED`
- **Lệnh kiểm tra**: `adb devices`, `adb version`
- **Mục đích phục vụ WorkSphere**: Cài đặt APK debug, kiểm thử native hardware Keystore/AsyncStorage, thu logcat và kiểm thử UI hồi quy trên Android Emulator.
- **Ngày xác minh gần nhất**: 2026-10-18

---

## 4. Danh Mục Extension Cho Antigravity IDE (Verified IDE Extensions)

### [TOOL-EXT-006] Extension: GitLens — Git supercharged

- **Registry ID**: `TOOL-EXT-006`
- **Phân loại**: `extension`
- **Tên sản phẩm**: GitLens — Git supercharged
- **Extension ID**: `eamodio.gitlens`
- **Publisher**: GitKraken
- **Nguồn tải chính thức**: Visual Studio Code Marketplace (`https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens`)
- **Phiên bản**: `2024.10.1505` (hoặc mới nhất tương thích)
- **Hình thức cài đặt**: `marketplace`
- **Đường dẫn VSIX / Install**: `C:\Users\dienm\.antigravity-ide\extensions\eamodio.gitlens-*`
- **Yêu cầu quyền Administrator**: Không
- **Yêu cầu Workspace Trust**: Không
- **Giấy phép**: `MIT` / Proprietary Cloud Features (Chỉ dùng Local Git Features)
- **Trạng thái**: `APPROVED`, `ENABLED_FOR_WORKSPHERE`, `OPTIONAL`
- **Mục đích phục vụ WorkSphere**: Kiểm toán commit blame từng dòng, kiểm tra lịch sử revision và đối soát tác giả mà không làm thay đổi Git state.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-007] Extension: SQLTools with PostgreSQL Driver

- **Registry ID**: `TOOL-EXT-007`
- **Phân loại**: `extension`
- **Tên sản phẩm**: SQLTools Database Management & PostgreSQL Driver
- **Extension ID**: `mtxr.sqltools`, `mtxr.sqltools-driver-pg`
- **Publisher**: Matheus Teixeira
- **Nguồn tải chính thức**: Visual Studio Code Marketplace
- **Phiên bản**: `0.28.x`
- **Hình thức cài đặt**: `marketplace`
- **Đường dẫn VSIX / Install**: `C:\Users\dienm\.antigravity-ide\extensions\mtxr.sqltools-*`
- **Yêu cầu quyền Administrator**: Không
- **Yêu cầu Workspace Trust**: Có
- **Điểm cuối mạng**: `localhost:5432` (`worksphere-dev-pg`)
- **Giấy phép**: `MIT`
- **Trạng thái**: `APPROVED`, `ENABLED_FOR_WORKSPHERE`, `OPTIONAL`
- **Mục đích phục vụ WorkSphere**: Khảo sát schema PostgreSQL canonical, xác minh bảng và index sinh ra từ Flyway migrations mà không lưu credential vào repository.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-008] Extension: Language Support for Java & Spring Boot Extension Pack

- **Registry ID**: `TOOL-EXT-008`
- **Phân loại**: `extension`
- **Tên sản phẩm**: Language Support for Java (by Red Hat) & Spring Boot Tools
- **Extension ID**: `redhat.java`, `vmware.vscode-spring-boot`
- **Publisher**: Red Hat / VMware Tanzu
- **Nguồn tải chính thức**: Visual Studio Code Marketplace
- **Phiên bản**: Tương thích Java 21
- **Hình thức cài đặt**: `marketplace`
- **Đường dẫn VSIX / Install**: `C:\Users\dienm\.antigravity-ide\extensions\redhat.java-*`
- **Yêu cầu quyền Administrator**: Không
- **Yêu cầu Workspace Trust**: Có
- **Giấy phép**: `EPL-2.0` / `Apache-2.0`
- **Trạng thái**: `APPROVED`, `ENABLED_FOR_WORKSPHERE`, `OPTIONAL`
- **Mục đích phục vụ WorkSphere**: Phân tích cú pháp, language server, hỗ trợ refactor an toàn và nhận diện cấu trúc Spring Boot Modular Monolith.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-009] Extension: ESLint & Prettier for React Native

- **Registry ID**: `TOOL-EXT-009`
- **Phân loại**: `extension`
- **Tên sản phẩm**: ESLint & Prettier Code Formatter
- **Extension ID**: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`
- **Publisher**: Microsoft / Prettier
- **Nguồn tải chính thức**: Visual Studio Code Marketplace
- **Phiên bản**: Latest stable
- **Hình thức cài đặt**: `marketplace`
- **Đường dẫn VSIX / Install**: `C:\Users\dienm\.antigravity-ide\extensions\dbaeumer.vscode-eslint-*`
- **Yêu cầu quyền Administrator**: Không
- **Giấy phép**: `MIT`
- **Trạng thái**: `APPROVED`, `ENABLED_FOR_WORKSPHERE`, `OPTIONAL`
- **Mục đích phục vụ WorkSphere**: Đảm bảo chất lượng mã nguồn TypeScript/JavaScript, kiểm tra lỗi tĩnh trước khi commit theo `npm run lint`.
- **Ngày xác minh gần nhất**: 2026-10-18

---

### [TOOL-EXT-010] Extension: Microsoft Edge Tools for VS Code

- **Registry ID**: `TOOL-EXT-010`
- **Phân loại**: `extension`
- **Tên sản phẩm**: Microsoft Edge Tools for VS Code
- **Extension ID**: `ms-edgedevtools.vscode-edge-devtools`
- **Publisher**: Microsoft Corporation
- **Nguồn tải chính thức**: Visual Studio Code Marketplace
- **Phiên bản**: Latest stable
- **Hình thức cài đặt**: `marketplace`
- **Đường dẫn VSIX / Install**: `C:\Users\dienm\.antigravity-ide\extensions\ms-edgedevtools.vscode-edge-devtools-*`
- **Yêu cầu quyền Administrator**: Không
- **Giấy phép**: `MIT`
- **Trạng thái**: `APPROVED`, `ENABLED_FOR_WORKSPHERE`, `OPTIONAL`
- **Mục đích phục vụ WorkSphere**: Kiểm thử hiển thị, viewport responsive (360x800, 411x914) và accessibility cho prototype HTML5/CSS3.
- **Ngày xác minh gần nhất**: 2026-10-18

---

## 5. Nhật Ký Cập Nhật (Registry Changelog)

| Ngày | Registry ID | Loại | Trạng thái | Đơn vị thực hiện | Quyết định / Căn cứ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-10-18 | `TOOL-EXT-001` .. `TOOL-EXT-005` | Core CLI & Tools | `APPROVED` | WorkSphere Agent | Chuẩn hóa danh mục công cụ nền tảng WorkSphere (D-020, D-057) |
| 2026-10-18 | `TOOL-EXT-006` .. `TOOL-EXT-010` | IDE Extensions | `APPROVED` | WorkSphere Agent | Chuẩn hóa danh mục Extension Antigravity IDE (D-034, D-057) |
