# Runbook: Môi Trường Kiểm Thử Tích Hợp Hệ Thống Giai Đoạn 16 (System E2E Environment Runbook)

**Tài liệu chuẩn hóa:** Quy trình điều khiển môi trường kiểm thử End-to-End WorkSphere cho các Wave 16B–16F  
**Áp dụng:** Giai đoạn 16 (Roadmap Section 20)  
**Nguyên tắc cốt lõi:**
- Tuyệt đối an toàn dữ liệu, không xóa Docker volume hay toàn bộ database.
- Không kill tiến trình mù quáng (`kill -9 node.exe`, `kill -9 java.exe`).
- Không hardcode mật khẩu hay ghi credential vào mã nguồn hoặc log.
- Thu dọn sạch sẽ toàn bộ background services sau khi kết thúc đợt kiểm thử.

---

## 1. Kiểm Tra Điều Kiện Tiên Quyết (Pre-Flight Checks)

Trước khi khởi động bất kỳ thành phần nào, thực hiện kiểm tra trạng thái máy chủ:

```powershell
# 1. Kiểm tra Git trạng thái sạch
git status --short
# Kỳ vọng: Không có tệp staged/unstaged ngoài ý muốn

# 2. Kiểm tra port 8080 (Backend) và 8081 (Metro) có đang bị chiếm dụng không
Get-NetTCPConnection -LocalPort 8080,8081 -ErrorAction SilentlyContinue | Select-Object LocalPort,OwningProcess,State
# Kỳ vọng: Không có process nào đang lắng nghe

# 3. Kiểm tra container PostgreSQL đang chạy
& "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe" ps --filter "name=worksphere-dev-pg"
# Kỳ vọng: Status "Up" và port 5432->5432/tcp

# 4. Kiểm tra Android Emulator
adb devices
# Kỳ vọng: Nếu chưa khởi động, danh sách rỗng
```

---

## 2. Thứ Tự Khởi Động Chuẩn (Startup Sequence)

### Bước 1: Khởi động Database (nếu chưa chạy)
```powershell
# Chỉ khởi động nếu container bị dừng
& "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe" start worksphere-dev-pg
```

### Bước 2: Khởi động Backend Spring Boot với Ephemeral Test Environment
Khởi động Backend trên profile `dev` với biến môi trường tạm thời cho phiên thực thi (không dùng `setx` vĩnh viễn):

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:WORKSPHERE_DEV_E2E_USER_ENABLED = "true"
$env:WORKSPHERE_E2E_ROLE = "EMPLOYEE"        # hoặc "ADMIN", "PROJECT_MANAGER", "TEAM_LEADER" theo wave
$env:WORKSPHERE_E2E_LOGIN = "e2e_employee"
$env:WORKSPHERE_E2E_PASSWORD = "<SecretSessionPassword>"
$env:WORKSPHERE_DEV_E2E_ASSET_FIXTURE_ENABLED = "true"
$env:WORKSPHERE_DEV_E2E_NOTIFICATION_FIXTURE_ENABLED = "true"

cd D:\WorkSphere\backend
# Khởi động Backend qua Maven Wrapper ở chế độ background task
.\mvnw.cmd spring-boot:run
```

### Bước 3: Kiểm tra Backend Health & Fixture Readiness
```powershell
# Gọi Actuator health endpoint
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get
# Kỳ vọng: status == "UP"
```

### Bước 4: Khởi động Android Emulator & Chờ Boot Hoàn Tất
```powershell
# Khởi động emulator ở chế độ background
emulator -avd Pixel_8_Pro -no-snapshot-load -no-audio
# Hoặc thiết bị AVD mặc định: emulator-5554

# Kiểm tra boot status cho đến khi trả về 1
adb wait-for-device
while ((adb shell getprop sys.boot_completed).Trim() -ne "1") { Start-Sleep -Seconds 2 }
```

### Bước 5: Thiết lập Cầu Nối Mạng (ADB Reverse) & Khởi động Metro
```powershell
# Cấu hình reverse port cho host
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081

# Khởi động Metro Bundler (chế độ background)
cd D:\WorkSphere\mobile
npm start -- --reset-cache
```

### Bước 6: Cài Đặt & Mở Ứng Dụng WorkSphere
```powershell
# Mở ứng dụng WorkSphere trên Emulator
adb shell monkey -p com.worksphere -c android.intent.category.LAUNCHER 1
```

---

## 3. Quy Trình Thu Dọn Sạch Sẽ (Cleanup Sequence)

Sau khi hoàn thành đợt kiểm thử hoặc khi gặp lỗi cần dừng:

```powershell
# 1. Tắt ứng dụng trên emulator
adb shell am force-stop com.worksphere

# 2. Xóa cấu hình reverse port
adb reverse --remove-all

# 3. Tắt emulator an toàn
adb emu kill

# 4. Dừng tiến trình Metro và Backend theo đúng PID đã ghi nhận (hoặc giải phóng port 8080/8081)
Get-NetTCPConnection -LocalPort 8080,8081 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# 5. Xóa các biến môi trường nhạy cảm trong phiên làm việc
Remove-Item Env:\WORKSPHERE_E2E_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\WORKSPHERE_E2E_LOGIN -ErrorAction SilentlyContinue
Remove-Item Env:\WORKSPHERE_DEV_E2E_USER_ENABLED -ErrorAction SilentlyContinue

# 6. Kiểm tra lại trạng thái Git
git status --short
```
