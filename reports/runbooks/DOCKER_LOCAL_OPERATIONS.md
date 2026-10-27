# WorkSphere Docker Local Operations Runbook

> **Mục đích**: Hướng dẫn chuẩn hóa và an toàn cho kỹ sư phát triển khi chạy, kiểm tra, dừng, khởi động lại, sao lưu và đặt lại môi trường Docker Compose cục bộ của WorkSphere.

---

## A. Prerequisites (Điều kiện tiên quyết)

1. **Docker Desktop & Engine**:
   - Docker Engine phiên bản $\ge 24.0$ (Đã kiểm chứng trên Docker Desktop 4.94.0 / Engine 29.8.2).
   - Docker Compose V2 tích hợp (`docker compose version`).
2. **Không yêu cầu Java / Maven trên Host**:
   - Backend được biên dịch qua multi-stage Dockerfile nội bộ container.
3. **Cổng mạng (Ports)**:
   - Port `8080` (Backend API).
   - Port `5433` (PostgreSQL host binding dành cho DB client ngoài container).
   - Đảm bảo các port này không bị chiếm dụng trước khi chạy (`.\scripts\docker-status.ps1`).
4. **Cấu hình `.env`**:
   - Sao chép từ mẫu `.env.example`:
     ```powershell
     Copy-Item .env.example .env
     ```

---

## B. First Start (Khởi chạy lần đầu)

1. **Cập nhật các giá trị bí mật (Secrets) trong `.env`**:
   - `POSTGRES_PASSWORD`: Mật khẩu cơ sở dữ liệu mạnh (tối thiểu 16 ký tự).
   - `JWT_SECRET_KEY`: Khóa bí mật ký JWT HMAC-SHA256 (bắt buộc tối thiểu 32 ký tự).
2. **Xác thực cấu hình Fail-Fast**:
   ```powershell
   docker compose config
   ```
   *Nếu thiếu `POSTGRES_PASSWORD` hoặc `JWT_SECRET_KEY`, lệnh sẽ báo lỗi dừng ngay lập tức (fail-fast).*
3. **Build image và khởi chạy detached**:
   ```powershell
   docker compose up -d --build
   ```

---

## C. Readiness (Kiểm tra trạng thái sẵn sàng)

1. **Kiểm tra trạng thái container và healthcheck**:
   ```powershell
   docker compose ps
   ```
   *Cả hai container `worksphere-compose-postgres` và `worksphere-compose-backend` phải hiển thị trạng thái `healthy`.*
2. **Kiểm tra Actuator Health của Backend**:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get
   ```
   *Kỳ vọng: HTTP 200 `{"status":"UP"}`.*
3. **Xác nhận Flyway Migrations**:
   ```powershell
   docker logs worksphere-compose-backend | Select-String "Successfully applied"
   ```
   *Kỳ vọng: Áp dụng toàn bộ 17 migrations đến phiên bản `v017`.*

---

## D. Logs (Thu thập và đọc nhật ký)

1. **Theo dõi nhật ký Backend**:
   ```powershell
   docker logs -f --tail 100 worksphere-compose-backend
   ```
2. **Theo dõi nhật ký PostgreSQL**:
   ```powershell
   docker logs -f --tail 100 worksphere-compose-postgres
   ```
3. **Lưu ý bảo mật (Redaction Guidance)**:
   - Tuyệt đối không sao chép chuỗi kết nối chứa mật khẩu hoặc JWT token vào báo cáo công khai hay issue tracker.

---

## E. Stop (Dừng dịch vụ an toàn)

1. **Dừng toàn bộ hệ thống (Bảo toàn dữ liệu)**:
   ```powershell
   docker compose down
   ```
   - Lệnh này dừng và gỡ bỏ containers, mạng `worksphere-network`.
   - **Dữ liệu được bảo toàn nguyên vẹn** trong named volumes `worksphere-postgres-data` và `worksphere-uploads`.
   - **CẢNH BÁO**: Tuyệt đối **KHÔNG** dùng flag `-v` (`docker compose down -v`) vì sẽ xóa sạch dữ liệu cơ sở dữ liệu và tệp tải lên.

---

## F. Restart (Khởi động lại)

1. **Khởi động lại riêng Backend (ví dụ sau khi sửa cấu hình)**:
   ```powershell
   docker compose restart backend
   ```
2. **Khởi động lại toàn bộ stack**:
   ```powershell
   docker compose restart
   ```

---

## G. Status (Kiểm tra tài nguyên & Cổng)

Sử dụng tiện ích PowerShell chuẩn hóa có sẵn trong repo:
```powershell
.\scripts\docker-status.ps1
```
Script sẽ kiểm tra:
- Trạng thái Docker Engine daemon.
- Container Compose đang chạy và cổng mapped.
- Trạng thái các cổng 8080, 5433, 5432 trên Host.
- Sự tồn tại của các named volumes `worksphere-postgres-data` và `worksphere-uploads`.
- Xác nhận container legacy `worksphere-dev-pg` được cô lập an toàn.

---

## H. Safe Reset (Quy trình đặt lại môi trường an toàn)

> [!CAUTION]
> Thao tác reset sẽ xóa toàn bộ dữ liệu trong các named volumes cục bộ của Docker Compose. Thao tác này KHÔNG THỂ HOÀN TÁC.

1. **Nguyên tắc an toàn**:
   - Chỉ reset các volume mới của Compose (`worksphere-postgres-data`, `worksphere-uploads`).
   - Tuyệt đối không chạm đến container legacy `worksphere-dev-pg` và anonymous volume `1a273309...`.
2. **Thực hiện Dry-Run (Xem trước hành động)**:
   ```powershell
   .\scripts\docker-reset-local.ps1 -DryRun
   ```
3. **Thực thi Reset có xác nhận**:
   Bắt buộc cung cấp mã token xác nhận `RESET_WORKSPHERE_LOCAL`:
   ```powershell
   .\scripts\docker-reset-local.ps1 -ConfirmToken RESET_WORKSPHERE_LOCAL
   ```

---

## I. Backup Before Reset (Sao lưu cơ sở dữ liệu cục bộ)

Trước khi thực hiện reset hoặc nâng cấp schema, nên tạo bản dump cơ sở dữ liệu:
1. **Tạo bản sao lưu bằng `pg_dump`**:
   ```powershell
   New-Item -ItemType Directory -Force -Path .\backups | Out-Null
   docker exec worksphere-compose-postgres pg_dump -U worksphere_user -d worksphere -F p > .\backups\local_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
   ```
2. **Kiểm tra file dump**:
   - Thư mục `backups/` và các định dạng `*.sql`, `*.dump` đã được `.gitignore` bảo vệ, không bao giờ bị commit lên Git.
   - Xác nhận kích thước file $> 0$ bytes.

---

## J. Restore (Phục hồi dữ liệu cục bộ)

> [!NOTE]
> Quy trình này dành riêng cho phục hồi môi trường phát triển cục bộ. Quy trình backup/restore sản xuất có bảo mật nâng cao thuộc Giai đoạn 19 Roadmap.

1. Khởi động PostgreSQL container:
   ```powershell
   docker compose up -d postgres
   ```
2. Phục hồi từ file SQL dump:
   ```powershell
   Get-Content .\backups\your_backup_file.sql | docker exec -i worksphere-compose-postgres psql -U worksphere_user -d worksphere
   ```

---

## K. Port Conflict & Stale Container Handling (Xử lý xung đột cổng)

1. **Xung đột cổng `8080`**:
   - Kiểm tra tiến trình đang chiếm cổng:
     ```powershell
     Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,State,OwningProcess
     ```
   - Nếu là tiến trình Java backend cục bộ ngoài Docker đang chạy dở: tắt tiến trình đó trước khi khởi động Docker Compose.
2. **Xung đột cổng `5433`**:
   - Mặc định Compose map cổng 5433 trên host để tránh xung đột với PostgreSQL mặc định (5432).
   - Nếu 5433 bị chiếm, có thể thay đổi biến `POSTGRES_HOST_PORT` trong file `.env` (ví dụ `5434`).
3. **Stale Containers**:
   - Nếu container bị lỗi treo:
     ```powershell
     docker compose down --remove-orphans
     ```

---

## L. Troubleshooting (Xử lý sự cố thường gặp)

| Hiện tượng | Nguyên nhân | Biện pháp xử lý |
| :--- | :--- | :--- |
| `docker compose config` báo `variable is missing a value` | Chưa thiết lập `POSTGRES_PASSWORD` hoặc `JWT_SECRET_KEY` | Tạo `.env` từ `.env.example` và nhập đủ các biến bắt buộc |
| Backend container trạng thái `unhealthy` | Backend khởi động quá 30s hoặc không kết nối được DB | Xem log: `docker logs worksphere-compose-backend`. Kiểm tra xem Postgres container đã healthy chưa |
| Flyway Migration Error | Schema cơ sở dữ liệu bị xung đột hoặc migration hỏng | Kiểm tra log chi tiết; nếu ở môi trường dev local, thực hiện Safe Reset qua `docker-reset-local.ps1` |
| Lỗi ghi file `/app/uploads` | Phân quyền thư mục trong container | Image đã gán quyền cho non-root UID 10001; kiểm tra mount volume `worksphere-uploads` |

---

## M. Legacy Environment Coexistence Policy (Chính sách chung sống)

1. Container `worksphere-dev-pg` (Port 5432) đại diện cho môi trường phát triển ban đầu của dự án.
2. Hai môi trường **hoạt động độc lập hoàn toàn**:
   - Compose PostgreSQL bind port `5433` trên Host và chạy trên mạng `worksphere-network`.
   - `worksphere-dev-pg` bind port `5432` trên Host.
3. Không bao giờ chạy lệnh `docker rm worksphere-dev-pg` hoặc xóa anonymous volume `1a273309...`.
4. Không bao giờ chạy đồng thời hai môi trường nếu cấu hình cùng trỏ chung host port.

---

## N. Cleanup & Security Checklist (Dọn dẹp & Bảo mật)

- [x] Không bao giờ commit file `.env` chứa mật khẩu thật vào Git.
- [x] Không commit các file database dump (`*.sql`, `*.dump`) vào repository.
- [x] Trước khi commit bất kỳ thay đổi nào, luôn chạy `git status --short` để đảm bảo không có file secret hoặc artifact tạm thời.
