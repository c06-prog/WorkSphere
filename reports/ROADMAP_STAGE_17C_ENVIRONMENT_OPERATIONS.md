# ROADMAP-STAGE-17C: ENVIRONMENT CONTRACT, SAFE OPERATIONS RUNBOOK & RESET POLICY

## 1. Executive Summary

- **Status**: PASSED
- **Stage**: ROADMAP-STAGE-17C (Environment Contract, Safe Operations Runbook & Reset Policy)
- **Starting Checkpoint**: `944b67cb5996b8d1977b39a32b10d04f22012767`
- **Scope**: Khóa hợp đồng biến môi trường Docker Compose local, áp dụng cơ chế fail-fast cho các secret bắt buộc, xây dựng Safe Operations Runbook, xây dựng kịch bản kiểm tra trạng thái và reset an toàn, kiểm chứng sao lưu cục bộ bằng `pg_dump`, bảo toàn toàn vẹn dữ liệu và container legacy.
- **Result Marker**: `ROADMAP_STAGE_17C_ENVIRONMENT_OPERATIONS_COMPLETE_READY_FOR_17C`

---

## 2. Environment Variable Contract & Fail-Fast Audit

Toàn bộ các biến môi trường cấu hình Docker Compose được đối chiếu chính xác với các thuộc tính Spring Boot của backend và PostgreSQL container:

| Biến Môi Trường (Compose) | Người Dùng Compose | Thuộc Tính Spring Boot Backend | Phân Loại | Bắt Buộc? | Secret? | Chính Sách Giá Trị Mặc Định / Fail-Fast |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POSTGRES_PASSWORD` | `postgres`, `backend` | `spring.datasource.password` | `REQUIRED_SECRET` | Có | **CÓ** | `${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}` (Fail-fast, cấm fallback) |
| `JWT_SECRET_KEY` | `backend` | `worksphere.jwt.secret` | `REQUIRED_SECRET` | Có | **CÓ** | `${JWT_SECRET_KEY:?JWT_SECRET_KEY is required}` (Fail-fast, cấm fallback) |
| `POSTGRES_DB` | `postgres`, `backend` | URL database trong `spring.datasource.url` | `REQUIRED_NON_SECRET` | Không | Không | Mặc định an toàn: `worksphere` |
| `POSTGRES_USER` | `postgres`, `backend` | `spring.datasource.username` | `REQUIRED_NON_SECRET` | Không | Không | Mặc định an toàn: `worksphere_user` |
| `SPRING_PROFILES_ACTIVE` | `backend` | `spring.profiles.active` | `OPTIONAL_WITH_SAFE_DEFAULT` | Không | Không | Mặc định: `dev` |
| `BACKEND_PORT` | `backend` | Host port map tới container port 8080 | `OPTIONAL_WITH_SAFE_DEFAULT` | Không | Không | Mặc định: `8080` (bind `127.0.0.1:8080`) |
| `POSTGRES_HOST_PORT` | `postgres` | Host port map tới container port 5432 | `OPTIONAL_WITH_SAFE_DEFAULT` | Không | Không | Mặc định: `5433` (bind `127.0.0.1:5433`, tránh xung đột cổng 5432) |
| `WORKSPHERE_STORAGE_PATH` | `backend` | `worksphere.storage.path` | `OPTIONAL_WITH_SAFE_DEFAULT` | Không | Không | Mặc định: `/app/uploads` (mount volume `worksphere-uploads`) |
| `COMPOSE_PROJECT_NAME` | Compose Engine | Scope container/network naming | `OPTIONAL_WITH_SAFE_DEFAULT` | Không | Không | Mặc định: `worksphere` |

### 2.1 Bằng Chứng Fail-Fast (Negative Validation)
Khi không truyền các biến `POSTGRES_PASSWORD` hoặc `JWT_SECRET_KEY`:
```text
error while interpolating services.backend.environment.SPRING_DATASOURCE_PASSWORD: required variable POSTGRES_PASSWORD is missing a value: POSTGRES_PASSWORD is required
error while interpolating services.backend.environment.WORKSPHERE_JWT_SECRET: required variable JWT_SECRET_KEY is missing a value: JWT_SECRET_KEY is required
error while interpolating services.postgres.environment.POSTGRES_PASSWORD: required variable POSTGRES_PASSWORD is missing a value: POSTGRES_PASSWORD is required
```
*Lệnh thoát ngay lập tức với exit code 1, ngăn chặn hoàn toàn việc khởi chạy với mật khẩu mặc định yếu.*

---

## 3. Safe Operations Runbook & Automation Scripts

### 3.1 Operations Runbook ([reports/runbooks/DOCKER_LOCAL_OPERATIONS.md](file:///d:/WorkSphere/reports/runbooks/DOCKER_LOCAL_OPERATIONS.md))
Đã hoàn thành tài liệu hướng dẫn vận hành chi tiết bao gồm 14 phần (A–N) chuẩn hóa:
- Điều kiện tiên quyết và hướng dẫn cấu hình `.env` không chứa secret thật.
- Các lệnh `start`, `readiness`, `logs`, `stop`, `restart`, `status`.
- Hướng dẫn chi tiết Safe Reset và sao lưu `pg_dump`.
- Hướng dẫn xử lý xung đột port 8080/5433 và chính sách bảo vệ tài nguyên legacy.

### 3.2 Automation Helper Scripts
1. **[scripts/docker-status.ps1](file:///d:/WorkSphere/scripts/docker-status.ps1)**:
   - PowerShell strict mode.
   - Báo cáo trạng thái Docker daemon, containers, các cổng mạng (8080, 5433, 5432), named volumes, và kiểm tra tình trạng bảo vệ của `worksphere-dev-pg`.
2. **[scripts/docker-reset-local.ps1](file:///d:/WorkSphere/scripts/docker-reset-local.ps1)**:
   - Hỗ trợ chế độ `-DryRun` xem trước tác vụ mà không thực thi.
   - Bắt buộc token xác nhận `-ConfirmToken RESET_WORKSPHERE_LOCAL` để tránh gõ nhầm.
   - Chỉ xóa 2 named volumes của Compose (`worksphere-postgres-data`, `worksphere-uploads`).
   - Tuyệt đối từ chối và bảo vệ container `worksphere-dev-pg` cùng anonymous volume legacy `1a273309...`.

---

## 4. Kiểm Chứng Sao Lưu Dữ Liệu Cục Bộ (pg_dump Demonstration)

Đã khởi chạy dịch vụ `postgres` của Compose và kiểm chứng thành công trích xuất backup schema & data:
```powershell
docker exec worksphere-compose-postgres pg_dump -U worksphere_user -d worksphere -F p > .\backups\test_stage17c.sql
```
- Kết quả: File SQL dump hợp lệ được sinh ra với kích thước `168,214` bytes chứa đầy đủ schema DDL và 17 migrations của Flyway.
- Dọn dẹp: File dump tạm đã được dọn dẹp sạch sẽ sau kiểm thử. Thư mục `backups/` và các định dạng `*.sql`, `*.dump` đã được đưa vào [.gitignore](file:///d:/WorkSphere/.gitignore).

---

## 5. Kiểm Tra Bảo Toàn Dữ Liệu (Data Preservation Audit)

- **Legacy Container `worksphere-dev-pg`**: Hiện diện nguyên vẹn (`Exited (255)`).
- **Legacy Volume `1a273309...`**: Hiện diện nguyên vẹn.
- **Stage 17 Named Volumes**: `worksphere-postgres-data` và `worksphere-uploads` được bảo toàn an toàn.
- **Port State**: Cả 2 cổng 8080 và 5433 hoàn toàn sạch và tự do sau khi dừng Compose.

---

## 6. Danh Mục Thay Đổi Tệp Tin

1. **[compose.yaml](file:///d:/WorkSphere/compose.yaml)**: Cập nhật fail-fast bắt buộc `${JWT_SECRET_KEY:?JWT_SECRET_KEY is required}` và `${WORKSPHERE_STORAGE_PATH:-/app/uploads}`.
2. **[.env.example](file:///d:/WorkSphere/.env.example)**: Bổ sung tài liệu phân loại biến, hướng dẫn định dạng mạnh và giải thích phân định cổng/host tools.
3. **[.gitignore](file:///d:/WorkSphere/.gitignore)**: Bổ sung quy tắc ignore cho thư mục `backups/`, `*.sql`, `*.dump`, `*.tar.gz`.
4. **[scripts/docker-status.ps1](file:///d:/WorkSphere/scripts/docker-status.ps1)**: Script kiểm tra trạng thái toàn diện.
5. **[scripts/docker-reset-local.ps1](file:///d:/WorkSphere/scripts/docker-reset-local.ps1)**: Script reset an toàn có bảo vệ token.
6. **[reports/runbooks/DOCKER_LOCAL_OPERATIONS.md](file:///d:/WorkSphere/reports/runbooks/DOCKER_LOCAL_OPERATIONS.md)**: Sổ tay hướng dẫn vận hành chi tiết.
7. **[reports/ROADMAP_STAGE_17C_ENVIRONMENT_OPERATIONS.md](file:///d:/WorkSphere/reports/ROADMAP_STAGE_17C_ENVIRONMENT_OPERATIONS.md)**: Báo cáo kỹ thuật Stage 17C.
8. **[reports/PROJECT_STATE.md](file:///d:/WorkSphere/reports/PROJECT_STATE.md)** & **[reports/HANDOFF.md](file:///d:/WorkSphere/reports/HANDOFF.md)**: Cập nhật trạng thái dự án.
