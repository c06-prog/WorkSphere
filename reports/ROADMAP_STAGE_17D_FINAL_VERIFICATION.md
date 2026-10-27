# ROADMAP-STAGE-17D: FINAL DOCKER LOCAL VERIFICATION & RUNBOOK REHEARSAL

## 1. Executive Summary

- **Status**: PASSED
- **Stage**: ROADMAP-STAGE-17D (Final Docker Local Verification, Runbook Rehearsal & Memory Checkpoint)
- **Starting Checkpoint**: `79fa5b961eb2114f40eff359d6813835ceebde1e`
- **Scope**: Rehearsal toàn diện quy trình Docker local theo Runbook, khắc phục lỗi ignore SQL migration tiềm ẩn, xác minh startup/healthcheck phụ thuộc, Flyway migration history, non-root user isolation, persistence qua restart, kiểm tra runbook scripts, dọn dẹp an toàn và lập memory checkpoint đóng Giai đoạn 17.
- **Result Marker**: `ROADMAP_STAGE_17_DOCKER_LOCAL_COMPLETE_READY_FOR_STAGE_18`

---

## 2. Khắc Phục Nguy Cơ Ignore SQL Migration ([.gitignore](file:///d:/WorkSphere/.gitignore))

- **Phát hiện**: Quy tắc `*.sql` toàn cục được thêm ở Stage 17C làm lệnh `git check-ignore` bắt nhầm cả các migration tương lai của Flyway (ví dụ: `backend/src/main/resources/db/migration/V999__ignore_probe.sql`).
- **Khắc phục**: Thu hẹp phạm vi ignore thành `backups/**/*.sql` và `backups/**/*.dump`.
- **Kiểm chứng xác nhận (Finite Ignore Probe)**:
  - `backend/src/main/resources/db/migration/V999__ignore_probe.sql` $\rightarrow$ **NOT IGNORED** (Hợp lệ cho Git tracking).
  - `backups/test_probe.sql` $\rightarrow$ **IGNORED** (Được bảo vệ an toàn khỏi commit).
  - Tệp probe tạm thời đã được xóa hoàn toàn.

---

## 3. Kết Quả Rehearsal Thực Tế (Clean Workspace Rehearsal)

| Hạng mục kiểm thử | Lệnh thực thi | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Negative Fail-Fast** | `docker compose --env-file .\empty.env config` | Báo lỗi thiếu `POSTGRES_PASSWORD` và `JWT_SECRET_KEY`, Exit code 1 | **PASS** |
| **Compose Config Validation** | `docker compose config --services / --volumes / --networks` | Services: `postgres`, `backend`. Volumes: `worksphere-postgres-data`, `worksphere-uploads`. Network: `worksphere-network` | **PASS** |
| **Build Rehearsal** | `docker compose build backend` | Image `worksphere-backend:stage17-local` biên dịch thành công từ cache multi-stage, Exit code 0 | **PASS** |
| **Startup Ordering** | `docker compose up -d` | `worksphere-compose-postgres` khởi động và đạt `healthy` trước; sau đó `worksphere-compose-backend` khởi động | **PASS** |
| **Actuator Health** | `Invoke-RestMethod http://localhost:8080/actuator/health` | Trả về HTTP 200 `{"status":"UP", "groups":["liveness","readiness"]}` | **PASS** |
| **Flyway Schema History** | Query `flyway_schema_history` qua `psql` | Có đúng 17 bản ghi migrations từ `001` đến `017` đều `success = t` | **PASS** |
| **API Contract & Security** | `GET http://localhost:8080/api/v1/me` (không auth) | Trả về HTTP 401 Unauthorized (không lỗi 500) | **PASS** |
| **Non-Root Runtime** | `docker exec backend id` | `uid=10001(worksphere) gid=10001(worksphere)` | **PASS** |
| **Image Isolation** | `docker exec backend ls /workspace /root/.m2` | Không tồn tại mã nguồn hoặc cache Maven trong runtime image | **PASS** |
| **Restart & Persistence** | `docker compose restart backend` | Khởi động lại thành công, marker file `/app/uploads/stage17d_marker.tmp` tồn tại nguyên vẹn qua restart | **PASS** |
| **Status Script** | `powershell .\scripts\docker-status.ps1 -EnvFile .env` | Báo cáo chính xác daemon, services healthy, ports 8080/5433, named volumes, bảo vệ legacy | **PASS** |
| **Reset Script Dry-Run** | `powershell .\scripts\docker-reset-local.ps1 -DryRun` | Hiển thị đúng 2 volumes xóa, bảo vệ tuyệt đối legacy container/volume | **PASS** |
| **pg_dump Sanity** | `docker exec postgres pg_dump` | Xuất file dump SQL hợp lệ 168,214 bytes, sau đó dọn dẹp sạch sẽ | **PASS** |
| **Clean Shutdown** | `docker compose down` | Dừng và gỡ bỏ containers + network; bảo toàn named volumes; giải phóng ports 8080 và 5433 | **PASS** |

---

## 4. Bảo Toàn Dữ Liệu & Tài Nguyên Legacy

- **Legacy Container `worksphere-dev-pg`**: Hiện diện nguyên vẹn (`Exited (255) 5 hours ago`), không bị start hay can thiệp.
- **Legacy Volume `1a273309...`**: Hiện diện nguyên vẹn.
- **Compose Named Volumes**: `worksphere-postgres-data` và `worksphere-uploads` được giữ an toàn trên Docker host.
- **Dọn dẹp môi trường**: File `.env` tạm thời, marker test và dump test đều đã được xóa bỏ hoàn toàn.
