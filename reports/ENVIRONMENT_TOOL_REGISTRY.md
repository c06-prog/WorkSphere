# Hồ Sơ Công Cụ Và Môi Trường WorkSphere (Environment Tool Registry)

Tài liệu kiểm kê, theo dõi và quản lý công cụ, ứng dụng, môi trường thực thi và quyền hạn trong hệ thống WorkSphere.
Ngày xác minh: 15/10/2026.

---

## 1. Nguyên Tắc Quản Lý Công Cụ

1. **Ưu tiên giải pháp có sẵn**: Trước khi cài đặt mới hoặc tự viết thêm, Agent phải kiểm tra theo thứ tự:
   - WorkSphere đã có script hoặc công cụ tương đương chưa.
   - Hệ điều hành đã có ứng dụng chuẩn phù hợp chưa.
   - Framework/stack hiện tại (Spring Boot, React Native, Testcontainers) có tính năng chính thức chưa.
   - Tài liệu kỹ thuật chính thức có quy trình chuẩn chưa.
   - Có thư viện/package chính thức, được duy trì tốt với license tương thích không.
   - Chỉ tự phát triển thành phần chưa có giải pháp phù hợp.
2. **Kênh cài đặt ưu tiên**:
   - Ưu tiên 1: `winget` với Package ID chính thức.
   - Ưu tiên 2: Bộ cài từ website chính thức của nhà phát hành (Verified Publisher).
   - Ưu tiên 3: Package manager dự án (`mvnw`, `npm`, `gradlew`, Android SDK Manager).
   - Cấm: Website phần mềm bên thứ ba không chính thức, link rút gọn, torrent, repack, crack, keygen, hoặc lệnh `Invoke-Expression` (IEX) tải trực tiếp từ internet.
3. **Phân bổ lưu trữ**:
   - Ưu tiên lưu trữ dữ liệu nặng trên ổ `D:`:
     - `D:\AI\Tools`, `D:\AI\SDK`, `D:\AI\Installers`, `D:\AI\Cache`, `D:\AI\Temp`, `D:\AI\Logs`, `D:\AI\Profiles`
     - Android SDK: `D:\AndroidSDK`
     - Android AVD: `D:\AndroidAVD` (hoặc `C:\Users\dienm\.android\avd`)
     - Docker Data: `D:\DockerData\DockerDesktopWSL`
     - Mã nguồn WorkSphere: `D:\WorkSphere`
   - Phần lõi nhỏ của ứng dụng bắt buộc nằm trên ổ `C:` được chấp nhận, nhưng cache/SDK/images phải trỏ sang `D:` nếu công cụ hỗ trợ.
4. **Xử lý can thiệp của người dùng (User Action Safeguards)**:
   - Agent không tự vượt qua UAC, màn hình đăng nhập tài khoản, thanh toán, điều khoản pháp lý, hay prompt cấp quyền nhạy cảm của hệ điều hành.
   - Khi gặp các tình huống trên, Agent báo trạng thái `BLOCKED_FOR_USER_ACTION`, nêu rõ: Tên ứng dụng, Nhà phát hành, Nguồn tải, Lý do cần, và Thao tác chính xác người dùng cần thực hiện.
5. **Thu thập bằng chứng và bảo mật**:
   - Ảnh chụp kiểm thử tạm thời lưu tại `design/prototype/review-output/` (không commit mặc định).
   - Ảnh chụp được duyệt cho báo cáo lưu tại `reports/screenshots/` với định dạng: `<figure-id>_<screen-id>_<state>_<yyyyMMdd-HHmmss>.png`.
   - Tuyệt đối cấm chụp hoặc ghi lại mật khẩu, token, private key, thông tin cá nhân hoặc ứng dụng ngoài phạm vi WorkSphere.

---

## 2. Danh Mục Kiểm Kê Công Cụ (Tool Registry)

### 2.1. Git
- **Mục đích**: Quản lý mã nguồn phân tán (VCS) cho toàn bộ repository WorkSphere.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `2.55.0.windows.3`
- **Publisher**: Software Freedom Conservancy / Git for Windows
- **Nguồn cài đặt**: winget (`Git.Git`) / Official Installer
- **License**: GNU General Public License v2 (GPLv2)
- **Executable path**: `C:\Program Files\Git\cmd\git.exe`
- **Data path**: `D:\WorkSphere\.git`
- **Cache path**: N/A
- **Config path**: `C:\Users\dienm\.gitconfig`
- **Log path**: `git log` / terminal stdout
- **Cách mở**: CLI Terminal (`git`)
- **Lệnh kiểm tra**: `git --version`, `git status`
- **Quyền Administrator**: Không cần trong thao tác hằng ngày
- **Tích hợp WorkSphere**: Quản lý commit, branch, diff, remote origin, và lịch sử kiểm toán
- **Ghi chú an toàn**: Cấm force push, cấm `git reset --hard`, cấm `git clean -fd`, cấm rebase `main`
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe git`, `winget list --id Git.Git`

---

### 2.2. Java Development Kit (JDK 27)
- **Mục đích**: Môi trường phát triển và thực thi ứng dụng backend Spring Boot.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `27+35-2325` (Oracle Java SE Runtime Environment 27)
- **Publisher**: Oracle Corporation
- **Nguồn cài đặt**: Official Oracle JDK Installer
- **License**: Oracle No-Fee Terms and Conditions (NFTC) / Commercial
- **Executable path**: `D:\Java\bin\java.exe`
- **Data path**: `D:\Java`
- **Cache path**: N/A
- **Config path**: `D:\Java\conf`
- **Log path**: Terminal stdout/stderr
- **Cách mở**: CLI Terminal (`java`)
- **Lệnh kiểm tra**: `java -version`
- **Quyền Administrator**: Không cần khi chạy
- **Tích hợp WorkSphere**: Biên dịch và chạy backend WorkSphere với mục tiêu bytecode Java 21
- **Ghi chú an toàn**: Giữ nguyên mục tiêu Java 21 trong `pom.xml`, không nâng target ngoài tài liệu chuẩn
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe java`, `$env:JAVA_HOME`

---

### 2.3. Maven Wrapper
- **Mục đích**: Công cụ quản lý dependency, build, test và checkstyle tự động cho backend.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `Apache Maven 3.9.16`
- **Publisher**: Apache Software Foundation
- **Nguồn cài đặt**: Maven Wrapper script trong repository
- **License**: Apache License 2.0
- **Executable path**: `D:\WorkSphere\backend\mvnw.cmd`
- **Data path**: `D:\WorkSphere\backend`
- **Cache path**: `C:\Users\dienm\.m2\repository`, `C:\Users\dienm\.m2\wrapper\dists`
- **Config path**: `D:\WorkSphere\backend\.mvn\wrapper\maven-wrapper.properties`
- **Log path**: `D:\WorkSphere\backend\target\`
- **Cách mở**: `.\mvnw.cmd <goals>` trong thư mục `D:\WorkSphere\backend`
- **Lệnh kiểm tra**: `.\mvnw.cmd -v`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Quản lý vòng đời build, thực thi 90 bài test và kiểm tra quy tắc Checkstyle
- **Ghi chú an toàn**: Không sửa đổi `pom.xml` ngoài phạm vi nhiệm vụ được phân công
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: Kiểm tra `mvnw.cmd` tại `D:\WorkSphere\backend`

---

### 2.4. Node.js
- **Mục đích**: Runtime JavaScript cho môi trường frontend prototype và phát triển React Native mobile.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `v24.19.0` (LTS)
- **Publisher**: OpenJS Foundation
- **Nguồn cài đặt**: winget (`OpenJS.NodeJS.LTS`)
- **License**: MIT License
- **Executable path**: `C:\Program Files\nodejs\node.exe`
- **Data path**: `C:\Program Files\nodejs`
- **Cache path**: `C:\Users\dienm\AppData\Local\npm-cache`
- **Config path**: `C:\Users\dienm\.npmrc`
- **Log path**: Terminal stdout/stderr
- **Cách mở**: CLI Terminal (`node`)
- **Lệnh kiểm tra**: `node -v`
- **Quyền Administrator**: Không cần cho ứng dụng local
- **Tích hợp WorkSphere**: Khởi chạy local server cho prototype và chuẩn bị công cụ cho mobile module
- **Ghi chú an toàn**: Chỉ bind local IP `127.0.0.1`, không mở port public ra ngoài
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe node`, `winget list --id OpenJS.NodeJS.LTS`

---

### 2.5. npm
- **Mục đích**: Trình quản lý package cho Node.js.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `11.17.0`
- **Publisher**: npm, Inc. / GitHub
- **Nguồn cài đặt**: Tích hợp kèm theo Node.js
- **License**: Artistic License 2.0
- **Executable path**: `C:\Program Files\nodejs\npm.cmd`
- **Data path**: `C:\Users\dienm\AppData\Roaming\npm`
- **Cache path**: `C:\Users\dienm\AppData\Local\npm-cache`
- **Config path**: `C:\Users\dienm\.npmrc`
- **Log path**: `C:\Users\dienm\AppData\Local\npm-cache\_logs`
- **Cách mở**: CLI Terminal (`npm`)
- **Lệnh kiểm tra**: `npm -v`
- **Quyền Administrator**: Cần khi cài đặt global package (`-g`), không cần khi cài đặt trong dự án
- **Tích hợp WorkSphere**: Quản lý package phụ trợ cho UI prototype và React Native
- **Ghi chú an toàn**: Luôn kiểm tra bảo mật (npm audit) và tính tương thích của package trước khi đưa vào
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe npm`

---

### 2.6. Python
- **Mục đích**: Runtime cho các script phân tích hoặc tiện ích mở rộng nếu cần.
- **Trạng thái**: `NOT_INSTALLED` (Hiện chỉ có Windows Execution Alias stub)
- **Phiên bản**: N/A
- **Publisher**: Python Software Foundation
- **Nguồn cài đặt**: winget (`Python.Python.3.12`) nếu có nhiệm vụ yêu cầu
- **License**: Python Software Foundation License
- **Executable path**: N/A (`C:\Users\dienm\AppData\Local\Microsoft\WindowsApps\python.exe` là shortcut stub)
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: N/A
- **Log path**: N/A
- **Cách mở**: N/A
- **Lệnh kiểm tra**: `python --version` (chưa cấu hình bộ cài thực)
- **Quyền Administrator**: Tùy chọn cài đặt
- **Tích hợp WorkSphere**: Chưa tích hợp vào luồng chính
- **Ghi chú an toàn**: Không tự cài đặt nếu chưa có nhiệm vụ được phân công
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe python`

---

### 2.7. Docker Desktop
- **Mục đích**: Quản lý ảo hóa container, chạy Testcontainers, PostgreSQL dev và Jenkins.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `4.94.0` (Docker Engine 29.8.2)
- **Publisher**: Docker, Inc.
- **Nguồn cài đặt**: Microsoft Store (`XP8CBJ40XLBWKX`) / Official Installer
- **License**: Docker Subscription Service Agreement
- **Executable path**: `C:\Program Files\Docker\Docker\Docker Desktop.exe`
- **Data path**: `D:\DockerData\DockerDesktopWSL` (Đã cấu hình trên ổ D)
- **Cache path**: `C:\Users\dienm\AppData\Local\Docker`
- **Config path**: `C:\Users\dienm\AppData\Roaming\Docker\settings.json`
- **Log path**: `C:\Users\dienm\AppData\Local\Docker\log`
- **Cách mở**: Start Menu hoặc ứng dụng nền
- **Lệnh kiểm tra**: `docker info`, `docker --version`
- **Quyền Administrator**: Cần thiết khi cài đặt hoặc cấu hình dịch vụ WSL2/Hyper-V
- **Tích hợp WorkSphere**: Nền tảng chạy Testcontainers cho kiểm thử integration và các dịch vụ dev
- **Ghi chú an toàn**: Tuyệt đối không xóa Docker volumes, image và dữ liệu container không thuộc về WorkSphere
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `Get-Item "C:\Program Files\Docker\Docker\Docker Desktop.exe"`

---

### 2.8. Docker CLI
- **Mục đích**: Giao diện dòng lệnh tương tác với Docker Engine.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `29.8.2, build 7fc2dff`
- **Publisher**: Docker, Inc.
- **Nguồn cài đặt**: Đi kèm Docker Desktop
- **License**: Apache License 2.0
- **Executable path**: `C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe`
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: `C:\Users\dienm\.docker\config.json`
- **Log path**: Terminal stdout/stderr
- **Cách mở**: CLI Terminal (`docker`)
- **Lệnh kiểm tra**: `docker --version`, `docker ps`
- **Quyền Administrator**: Không cần khi user thuộc nhóm `docker-users`
- **Tích hợp WorkSphere**: Kiểm tra trạng thái container, khởi động container dev
- **Ghi chú an toàn**: Chỉ điều khiển các container liên quan trực tiếp đến WorkSphere
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe docker`

---

### 2.9. PostgreSQL Container (`worksphere-dev-pg`)
- **Mục đích**: Cơ sở dữ liệu PostgreSQL phát triển local cho backend WorkSphere.
- **Trạng thái**: `INSTALLED` (Container đang ở trạng thái `Exited`, sẵn sàng khởi động khi cần)
- **Phiên bản**: `PostgreSQL 15` (Image: `postgres:15-alpine`)
- **Publisher**: PostgreSQL Global Development Group / Docker Official
- **Nguồn cài đặt**: Docker Hub
- **License**: PostgreSQL License
- **Executable path**: Docker Container runtime
- **Data path**: Docker container volume
- **Cache path**: N/A
- **Config path**: Thiết lập tham số khi chạy container / `postgresql.conf`
- **Log path**: `docker logs worksphere-dev-pg`
- **Cách mở**: `docker start worksphere-dev-pg`
- **Lệnh kiểm tra**: `docker ps -a --filter "name=worksphere-dev-pg"`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Cung cấp cổng kết nối 5432 cho backend dev
- **Ghi chú an toàn**: Không xóa container và volume của `worksphere-dev-pg`
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `docker ps -a`

---

### 2.10. Jenkins Container (`jenkins-lts`)
- **Mục đích**: Máy chủ tự động hóa tích hợp liên tục (CI/CD).
- **Trạng thái**: `INSTALLED` (Container đang chạy liên tục - `Up`)
- **Phiên bản**: Jenkins LTS (Image: `jenkins/jenkins:lts-jdk21`)
- **Publisher**: Jenkins Project
- **Nguồn cài đặt**: Docker Hub
- **License**: MIT License
- **Executable path**: Docker Container runtime
- **Data path**: Docker volume container
- **Cache path**: N/A
- **Config path**: Jenkins Home bên trong container
- **Log path**: `docker logs jenkins-lts`
- **Cách mở**: Truy cập trình duyệt tại `http://localhost:8080`
- **Lệnh kiểm tra**: `docker ps --filter "name=jenkins-lts"`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Máy chủ quản trị CI/CD
- **Ghi chú an toàn**: Cấm tuyệt đối: Không xóa, không sửa, không dừng container `jenkins-lts`
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `docker ps`

---

### 2.11. Android Studio
- **Mục đích**: Môi trường phát triển tích hợp (IDE) chính thức cho ứng dụng Android và quản lý SDK.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `2026.2`
- **Publisher**: Google LLC
- **Nguồn cài đặt**: winget (`Google.AndroidStudio`) / Official Installer
- **License**: Apache License 2.0 / Android SDK License
- **Executable path**: `D:\Android\bin\studio64.exe`
- **Data path**: `D:\Android`
- **Cache path**: `C:\Users\dienm\AppData\Local\Google\AndroidStudio2026.2`
- **Config path**: `C:\Users\dienm\AppData\Roaming\Google\AndroidStudio2026.2`
- **Log path**: `C:\Users\dienm\AppData\Local\Google\AndroidStudio2026.2\log`
- **Cách mở**: `Start-Process "D:\Android\bin\studio64.exe"` hoặc Start Menu
- **Lệnh kiểm tra**: `Test-Path "D:\Android\bin\studio64.exe"`
- **Quyền Administrator**: Không cần khi chạy
- **Tích hợp WorkSphere**: Mở dự án mobile Android, quản lý SDK và Emulator
- **Ghi chú an toàn**: Không sửa đổi cấu hình lõi IDE ngoài phạm vi dự án
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe /r D:\Android studio64.exe`

---

### 2.12. Android SDK
- **Mục đích**: Bộ công cụ phát triển phần mềm cho hệ điều hành Android.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: Android 15 (API 35), Build-tools, Command-line Tools latest
- **Publisher**: Google LLC
- **Nguồn cài đặt**: Android SDK Manager
- **License**: Android Software Development Kit License
- **Executable path**: `D:\AndroidSDK\cmdline-tools\latest\bin\sdkmanager.bat`
- **Data path**: `D:\AndroidSDK` (Được gán biến môi trường `$env:ANDROID_HOME`)
- **Cache path**: `D:\AndroidSDK\.temp`
- **Config path**: `C:\Users\dienm\.android`
- **Log path**: N/A
- **Cách mở**: Quản lý qua `sdkmanager` CLI hoặc Android Studio SDK Manager
- **Lệnh kiểm tra**: `Get-ChildItem "D:\AndroidSDK"`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Biên dịch và đóng gói ứng dụng React Native cho nền tảng Android
- **Ghi chú an toàn**: Cấm xóa hoặc di chuyển thư mục `D:\AndroidSDK`
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `$env:ANDROID_HOME`, `D:\AndroidSDK`

---

### 2.13. ADB (Android Debug Bridge)
- **Mục đích**: Cầu nối giao tiếp, cài đặt và gỡ lỗi thiết bị/máy ảo Android.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `1.0.41` (Platform tools 37.0.1-15733141)
- **Publisher**: Google LLC
- **Nguồn cài đặt**: Android SDK Platform-Tools
- **License**: Apache License 2.0
- **Executable path**: `D:\AndroidSDK\platform-tools\adb.exe`
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: N/A
- **Log path**: `adb logcat` output
- **Cách mở**: CLI Terminal (`adb`)
- **Lệnh kiểm tra**: `D:\AndroidSDK\platform-tools\adb.exe version`, `adb devices`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Tương tác với emulator `emulator-5554`, cài APK, thu logcat, chụp ảnh màn hình
- **Ghi chú an toàn**: Chỉ điều khiển thiết bị serial đã xác minh (`emulator-5554`), cấm can thiệp thiết bị lạ
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe adb`, `D:\AndroidSDK\platform-tools\adb.exe`

---

### 2.14. Android Emulator
- **Mục đích**: Máy ảo Android phục vụ kiểm thử giao diện và hành vi ứng dụng mobile.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `37.2.12.0` (build_id 16428233)
- **Publisher**: Google LLC / Android Open Source Project
- **Nguồn cài đặt**: Android SDK Emulator
- **License**: GPLv2 / Android SDK License
- **Executable path**: `D:\AndroidSDK\emulator\emulator.exe`
- **Data path**: `D:\AndroidAVD` (và `C:\Users\dienm\.android\avd`)
- **Cache path**: `C:\Users\dienm\.android\cache`
- **Config path**: `C:\Users\dienm\.android\avd\*.avd\config.ini`
- **Log path**: `D:\AndroidSDK\emulator\emulator.log`
- **Cách mở**: `D:\AndroidSDK\emulator\emulator.exe -avd <name>`
- **Lệnh kiểm tra**: `D:\AndroidSDK\emulator\emulator.exe -version`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Chạy thiết bị ảo `emulator-5554` (Android 15, API 35) để kiểm thử
- **Ghi chú an toàn**: Cấm xóa AVD, cấm factory-reset máy ảo
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `Get-Item "D:\AndroidSDK\emulator\emulator.exe"`

---

### 2.15. Gradle
- **Mục đích**: Hệ thống tự động hóa build cho các dự án Android/Java.
- **Trạng thái**: `AVAILABLE_NOT_CONFIGURED` (Không cài đặt Gradle global; các dự án sử dụng Gradle Wrapper `gradlew.bat` cục bộ)
- **Phiên bản**: Theo từng phiên bản Wrapper của dự án
- **Publisher**: Gradle Inc.
- **Nguồn cài đặt**: Gradle Wrapper đi kèm project
- **License**: Apache License 2.0
- **Executable path**: `gradlew.bat` trong thư mục project
- **Data path**: `C:\Users\dienm\.gradle`
- **Cache path**: `C:\Users\dienm\.gradle\caches`
- **Config path**: `C:\Users\dienm\.gradle\gradle.properties`
- **Log path**: Build logs trong `build/reports`
- **Cách mở**: `.\gradlew.bat <tasks>`
- **Lệnh kiểm tra**: `where.exe gradle`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Sẽ sử dụng để build ứng dụng React Native Android khi module mobile khởi chạy
- **Ghi chú an toàn**: Ưu tiên dùng Gradle Wrapper của dự án thay vì cài đặt global
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe gradle`

---

### 2.16. Microsoft Edge
- **Mục đích**: Trình duyệt web desktop dùng để xác minh trực quan Prototype và tài liệu UI/UX.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `155.0.4283.45`
- **Publisher**: Microsoft Corporation
- **Nguồn cài đặt**: Thành phần mặc định của Windows
- **License**: Microsoft Software License Terms
- **Executable path**: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- **Data path**: `C:\Users\dienm\AppData\Local\Microsoft\Edge\User Data`
- **Cache path**: `C:\Users\dienm\AppData\Local\Microsoft\Edge\User Data\Default\Cache`
- **Config path**: Edge Settings
- **Log path**: Edge Crashpad logs
- **Cách mở**: Chạy browser automation với profile tạm riêng (`--user-data-dir`)
- **Lệnh kiểm tra**: `(Get-Item "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe").VersionInfo.ProductVersion`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Kiểm thử layout responsive, DOM, console errors của prototype mobile trên các viewport thực tế
- **Ghi chú an toàn**: Tuyệt đối không đọc cookie, lịch sử, profile cá nhân; luôn dùng profile tạm thời
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: Registry `HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe`

---

### 2.17. PowerShell Environment
- **Mục đích**: Môi trường shell và script thực thi lệnh tự động trên Windows.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: Windows PowerShell 5.1 / PowerShell Engine
- **Publisher**: Microsoft Corporation
- **Nguồn cài đặt**: Tích hợp sẵn trong Windows
- **License**: Microsoft Windows EULA
- **Executable path**: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
- **Data path**: `D:\WorkSphere`
- **Cache path**: N/A
- **Config path**: `$PROFILE`
- **Log path**: Windows Event Log
- **Cách mở**: CLI Terminal
- **Lệnh kiểm tra**: `$PSVersionTable.PSVersion`
- **Quyền Administrator**: Không dùng trừ khi có yêu cầu đặc thù và được phê duyệt
- **Tích hợp WorkSphere**: Thực thi các lệnh build, kiểm thử, quản lý tiến trình, Git và Docker
- **Ghi chú an toàn**: Cấm chạy các lệnh tải script trực tiếp từ web không xác thực
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe powershell`

---

### 2.18. Antigravity IDE
- **Mục đích**: Môi trường phát triển Agentic AI Pair-Programming cho dự án WorkSphere.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: 2.0 (Google Antigravity Agentic IDE)
- **Publisher**: Google DeepMind
- **Nguồn cài đặt**: Google internal installation
- **License**: Proprietary
- **Executable path**: IDE application binary
- **Data path**: `C:\Users\dienm\.gemini\antigravity-ide`
- **Cache path**: `C:\Users\dienm\.gemini\antigravity-ide\brain`
- **Config path**: `C:\Users\dienm\.gemini\config`
- **Log path**: `C:\Users\dienm\.gemini\antigravity-ide\conversations`
- **Cách mở**: Mở ứng dụng Antigravity IDE
- **Lệnh kiểm tra**: Kiểm tra đường dẫn thư mục `C:\Users\dienm\.gemini\antigravity-ide`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Nền tảng điều phối, phân tích, tạo diff, và hỗ trợ phát triển dự án
- **Ghi chú an toàn**: Tuân thủ tuyệt đối quy tắc bảo mật repository và tài liệu chuẩn mực
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: App Data Directory `C:\Users\dienm\.gemini\antigravity-ide`

---

### 2.19. Gemini Account Status
- **Mục đích**: Trạng thái kết nối tài khoản trí tuệ nhân tạo phục vụ hỗ trợ lập trình.
- **Trạng thái**: `ENABLED`
- **Phiên bản**: N/A
- **Publisher**: Google LLC
- **Nguồn cài đặt**: Google Cloud / AI Authentication
- **License**: Google Cloud Terms of Service
- **Executable path**: N/A
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: `C:\Users\dienm\.gemini`
- **Log path**: N/A
- **Cách mở**: Tự động thông qua IDE session
- **Lệnh kiểm tra**: Kiểm tra trạng thái session IDE (chỉ ghi nhận trạng thái hoạt động)
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Phân tích ngữ cảnh, kiểm tra mã nguồn, đối chiếu tài liệu canonical
- **Ghi chú an toàn**: Tuyệt đối không ghi nhận credential, email cá nhân, token hay API key vào hồ sơ
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: Quản lý phiên trong Antigravity IDE

---

### 2.20. Visual Studio Code (VS Code)
- **Mục đích**: Trình soạn thảo mã nguồn phụ trợ trên máy trạm.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `1.141.0` (x64)
- **Publisher**: Microsoft Corporation
- **Nguồn cài đặt**: Standalone / Custom installation tại `D:\VSCode`
- **License**: Microsoft Software License
- **Executable path**: `D:\VSCode\bin\code.cmd` (Core binary: `D:\VSCode\Code.exe`)
- **Data path**: `D:\VSCode`
- **Cache path**: `C:\Users\dienm\AppData\Roaming\Code\Cache`
- **Config path**: `C:\Users\dienm\AppData\Roaming\Code\User\settings.json`
- **Log path**: `C:\Users\dienm\AppData\Roaming\Code\logs`
- **Cách mở**: `D:\VSCode\bin\code.cmd` hoặc `code .`
- **Lệnh kiểm tra**: `D:\VSCode\bin\code.cmd --version`
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: Soạn thảo và tra cứu mã nguồn nhanh
- **Ghi chú an toàn**: Không tự thay đổi extension hay cài extension lạ ngoài danh mục được duyệt
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe code`, `D:\VSCode\bin\code.cmd`

---

### 2.21. winget (Windows Package Manager)
- **Mục đích**: Trình quản lý gói phần mềm chính thức của Windows.
- **Trạng thái**: `INSTALLED`
- **Phiên bản**: `v1.29.380`
- **Publisher**: Microsoft Corporation
- **Nguồn cài đặt**: Windows App Installer
- **License**: MIT License
- **Executable path**: `C:\Users\dienm\AppData\Local\Microsoft\WindowsApps\winget.exe`
- **Data path**: `C:\Users\dienm\AppData\Local\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe`
- **Cache path**: `C:\Users\dienm\AppData\Local\Temp\WinGet`
- **Config path**: `C:\Users\dienm\AppData\Local\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\LocalState\settings.json`
- **Log path**: `C:\Users\dienm\AppData\Local\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\LocalState\DiagOutputDir`
- **Cách mở**: CLI Terminal (`winget`)
- **Lệnh kiểm tra**: `winget --version`
- **Quyền Administrator**: Cần khi cài đặt ứng dụng phạm vi toàn máy (Machine Scope)
- **Tích hợp WorkSphere**: Kênh cài đặt công cụ ưu tiên số 1 khi có nhu cầu được phê duyệt
- **Ghi chú an toàn**: Phải kiểm tra chính xác Package ID và Publisher trước khi gọi `winget install`
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe winget`

---

### 2.22. Chocolatey
- **Mục đích**: Trình quản lý gói phần mềm bên thứ ba cho Windows.
- **Trạng thái**: `NOT_INSTALLED`
- **Phiên bản**: N/A
- **Publisher**: Chocolatey Software, Inc.
- **Nguồn cài đặt**: N/A
- **License**: Apache License 2.0
- **Executable path**: N/A
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: N/A
- **Log path**: N/A
- **Cách mở**: N/A
- **Lệnh kiểm tra**: `where.exe choco` (không tìm thấy)
- **Quyền Administrator**: Cần khi cài đặt
- **Tích hợp WorkSphere**: N/A (Được winget thay thế hoàn toàn)
- **Ghi chú an toàn**: Ưu tiên sử dụng winget chính thức; không tự động cài Chocolatey nếu chưa có nhu cầu bắt buộc
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe choco`

---

### 2.23. Scoop
- **Mục đích**: Trình cài đặt dòng lệnh cấp người dùng cho Windows.
- **Trạng thái**: `NOT_INSTALLED`
- **Phiên bản**: N/A
- **Publisher**: Scoop Community
- **Nguồn cài đặt**: N/A
- **License**: MIT License
- **Executable path**: N/A
- **Data path**: N/A
- **Cache path**: N/A
- **Config path**: N/A
- **Log path**: N/A
- **Cách mở**: N/A
- **Lệnh kiểm tra**: `where.exe scoop` (không tìm thấy)
- **Quyền Administrator**: Không cần
- **Tích hợp WorkSphere**: N/A
- **Ghi chú an toàn**: Không tự cài đặt nếu chưa có nhiệm vụ yêu cầu
- **Ngày xác minh**: 15/10/2026
- **Cách tìm lại**: `where.exe scoop`
