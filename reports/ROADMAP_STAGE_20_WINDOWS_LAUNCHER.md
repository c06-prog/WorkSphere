# ROADMAP-STAGE-20 — WINDOWS LAUNCHER REPORT

- **Mã giai đoạn**: ROADMAP-STAGE-20-WINDOWS-LAUNCHER
- **Tệp khởi chạy**: `D:\WorkSphere\run-worksphere.bat`
- **Trạng thái thực thi**: HOÀN THÀNH (RUNTIME_VERIFIED)
- **Hệ điều hành**: Windows 10/11 x64

---

## 1. Mục tiêu và Bối cảnh

Để hỗ trợ các thành viên trong nhóm dự án, giảng viên hướng dẫn hoặc hội đồng đánh giá có thể khởi chạy và kiểm tra toàn bộ hệ sinh thái WorkSphere trên môi trường Windows mà không cần nhớ hoặc gõ thủ công từng câu lệnh CLI phức tạp, dự án đã xây dựng tệp kịch bản khởi chạy tự động:
`D:\WorkSphere\run-worksphere.bat`.

Tệp khởi chạy này đáp ứng đầy đủ các yêu cầu kỹ thuật:
- Tự động phát hiện công cụ đã cài đặt trên máy người dùng (Docker CLI, Java, Node.js, npm, adb, emulator).
- Khởi động theo thứ tự phụ thuộc chính xác: PostgreSQL -> Backend (Spring Boot) -> Metro Bundler (React Native) -> Android Emulator -> Android Mobile App.
- Hoạt động an toàn, idempotent (lũy tiến): không tạo tiến trình trùng lặp nếu dịch vụ đã chạy.
- Hỗ trợ cả giao diện menu tương tác (interactive menu) lẫn chế độ tham số dòng lệnh (CLI arguments) phục vụ tự động hóa và CI/CD local.

---

## 2. Giao diện Menu và Chế độ hoạt động

### 2.1 Menu tương tác (Interactive CLI Menu)
Khi người dùng chạy `run-worksphere.bat` không kèm tham số:
```text
===============================================
       WORKSPHERE LOCAL DEVELOPMENT LAUNCHER
===============================================
  1. Khoi dong PostgreSQL (Docker Container)
  2. Khoi dong Backend Service (Port 8080)
  3. Khoi dong Metro Bundler (Port 8081)
  4. Khoi dong Android Emulator (emulator-5554)
  5. Cai dat & Khoi chay WorkSphere Mobile App
  6. Kiem tra trang thai toan bo he thong (Status)
  7. Khoi dong TOAN BO he thong (All-in-one)
  8. Huong dan dung he thong an toan (Safe Stop)
  9. Mo tai lieu huong dan & demo accounts
  0. Thoat
===============================================
```

### 2.2 Các tham số CLI trực tiếp (Non-interactive Mode)
Phục vụ chạy script tự động và kiểm tra nhanh từ terminal:
- `run-worksphere.bat status`: Kiểm tra công cụ, port, container, Actuator health và emulator.
- `run-worksphere.bat postgres`: Kiểm tra và khởi động container `worksphere-dev-pg`.
- `run-worksphere.bat backend`: Khởi động Backend JAR trong cửa sổ riêng (port 8080).
- `run-worksphere.bat metro`: Khởi động Metro Bundler trong cửa sổ riêng (port 8081).
- `run-worksphere.bat emulator`: Khởi động Android Emulator `emulator-5554`.
- `run-worksphere.bat app`: Cài đặt và mở ứng dụng WorkSphere trên emulator.
- `run-worksphere.bat all`: Khởi chạy tuần tự toàn bộ hệ thống.
- `run-worksphere.bat stop`: Hướng dẫn dừng an toàn các tiến trình.
- `run-worksphere.bat docs`: Mở tài liệu tổng quan và hướng dẫn chạy dự án.

---

## 3. Cơ chế Tự động Tìm kiếm Công cụ (Tool Discovery)

Kịch bản được thiết kế để tìm kiếm linh hoạt trên Windows mà không phụ thuộc tuyệt đối vào biến môi trường PATH:
1. **Docker CLI**:
   - Kiểm tra lệnh `docker` trong PATH.
   - Quét đường dẫn cài đặt Docker Desktop mặc định: `%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe` và `%ProgramFiles%\Docker\Docker\resources\bin\docker.exe`.
2. **Java / JDK**:
   - Kiểm tra lệnh `java` trong PATH.
   - Kiểm tra `%JAVA_HOME%\bin\java.exe`.
   - Quét Android Studio JetBrains Runtime: `D:\Android\jbr\bin\java.exe`, `%LOCALAPPDATA%\Android\Sdk\jbr\bin\java.exe`.
   - Quét JDK cài đặt tại `D:\Java\bin\java.exe` và `C:\Program Files\Java\...`.
3. **Node.js & npm**:
   - Kiểm tra lệnh `node` và `npm` trong PATH.
   - Quét `%ProgramFiles%\nodejs\node.exe` và `%LOCALAPPDATA%\Programs\node\node.exe`.
4. **Android SDK (adb & emulator)**:
   - Kiểm tra biến môi trường `%ANDROID_HOME%` hoặc `%ANDROID_SDK_ROOT%`.
   - Quét `D:\AndroidSDK\platform-tools\adb.exe` và `D:\AndroidSDK\emulator\emulator.exe`.
   - Quét `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe` và `emulator.exe`.

---

## 4. Thứ tự Khởi động và Xác thực Trạng thái (Startup Sequence & Health Gates)

Thứ tự thực thi khi chọn **Option 7 (All-in-one)**:
1. **PostgreSQL**:
   - Kiểm tra port 5432. Nếu đã mở, kiểm tra lệnh `pg_isready` qua container `worksphere-dev-pg`.
   - Nếu chưa chạy, thực thi `docker start worksphere-dev-pg` (hoặc `docker compose up -d postgres`).
   - Đợi cổng 5432 sẵn sàng.
2. **Backend Service**:
   - Kiểm tra port 8080.
   - Nếu chưa chạy, gọi `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar` trong cửa sổ command riêng với tiêu đề `WorkSphere Backend (Port 8080)`.
   - Polling kiểm tra endpoint `http://localhost:8080/actuator/health` đến khi trả về status `UP`.
3. **Metro Bundler**:
   - Kiểm tra port 8081.
   - Nếu chưa chạy, mở cửa sổ riêng tại thư mục `mobile` chạy `npm start` với tiêu đề `WorkSphere Metro Bundler (Port 8081)`.
4. **Android Emulator**:
   - Kiểm tra lệnh `adb devices` xem đã có thiết bị online chưa.
   - Nếu chưa, khởi chạy `emulator -avd <avd_name>` trong background và chờ thiết bị boot hoàn tất (`sys.boot_completed == 1`).
5. **WorkSphere Mobile App**:
   - Kiểm tra package `com.workspheremobile` đã cài đặt trên thiết bị chưa.
   - Nếu chưa, chạy `npm run android` hoặc cài đặt debug APK.
   - Mở ứng dụng qua ADB intent `monkey -p com.workspheremobile -c android.intent.category.LAUNCHER 1`.

---

## 5. Ranh giới An toàn và Bảo mật (Safety Boundaries)

- **Không nhúng bí mật**: Tệp `run-worksphere.bat` tuyệt đối không chứa tài khoản demo, mật khẩu, JWT secret hay DB credentials trong source.
- **Không phá hủy dữ liệu (Zero Data Loss)**: Tuyệt đối không chạy `docker compose down -v` hoặc lệnh xóa Docker volume của database.
- **Không dừng tiến trình bừa bãi (Safe Stop)**: Không thực thi `taskkill /IM java.exe /F` hay `taskkill /IM node.exe /F` vì có thể làm tắt các tiến trình IDE, Gradle daemon hoặc công cụ khác của người dùng. Tùy chọn 8 cung cấp hướng dẫn dừng an toàn bằng `Ctrl+C` trên từng cửa sổ riêng biệt hoặc `docker stop worksphere-dev-pg`.
- **Thư mục dữ liệu tạm**: Thư mục tạm `.local-run/` được bổ sung vào `.gitignore` để bảo đảm không commit file rác phát sinh khi chạy launcher.

---

## 6. Kết quả Kiểm thử Thực tế (Verification Evidence)

Đã kiểm tra trực tiếp qua CLI:
- `run-worksphere.bat status`:
  - Docker CLI: TÌM THẤY (`C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe`)
  - Java: TÌM THẤY (`D:\Android\jbr\bin\java.exe`)
  - Node.js & npm: TÌM THẤY
  - adb & emulator: TÌM THẤY (`D:\AndroidSDK\platform-tools\adb.exe`, `D:\AndroidSDK\emulator\emulator.exe`)
  - Container `worksphere-dev-pg`: RUNNING
  - Database `pg_isready`: READY [Port 5432]
  - Backend Port 8080: LISTENING, Actuator Health: UP
  - Metro Port 8081: LISTENING
  - Emulator: `emulator-5554 device`
  - Package `com.workspheremobile`: ĐÃ CÀI ĐẶT
- Trạng thái thoát: Exit code 0, không có lỗi cú pháp cmd batch.
