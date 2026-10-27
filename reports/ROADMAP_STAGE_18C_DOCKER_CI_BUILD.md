# BÁO CÁO THỰC THI ROADMAP GIAI ĐOẠN 18C
## (ROADMAP-STAGE-18C — DOCKER IMAGE CI BUILD & COMMIT-SHA TAGGING)

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Starting Checkpoint:** `1556c7fd6842065359adcfb5761b47066bb456e3`  
**Workflow Commit Checkpoint:** `191d733a4ae20b746e0a781bc290bffef20ddd0a`  
**Status:** COMPLETED & CLOSED  
**Marker:** `ROADMAP_STAGE_18C_DOCKER_CI_COMPLETE_READY_FOR_18D`  

---

## 1. Mục Tiêu & Phân Định (Objectives & Distinction)

1. **Phân định rõ ràng:**
   - Nhiệm vụ này là **ROADMAP-STAGE-18C** (Docker Image CI Build & Tagging trong GitHub Actions).
   - Tuyệt đối không phải Mobile Phase 18 (Notification đã đóng).
   - Không làm lại cấu hình Docker Compose hay runbook Stage 17.
   - Không cấu hình release signing, không push Docker image lên external registry, và không triển khai staging/production.
2. **Mục tiêu đạt được trong 18C:**
   - Bổ sung job `docker-image-build` vào `.github/workflows/ci.yml`.
   - Tái sử dụng nguyên vẹn `backend/Dockerfile` và `backend/.dockerignore` đa tầng từ Stage 17A.
   - Tag image bằng hai tag tất định: `worksphere-backend:ci` và `worksphere-backend:sha-<short-sha>`.
   - Ghi nhận đầy đủ OCI labels: `org.opencontainers.image.revision` và `org.opencontainers.image.source`.
   - Kiểm tra metadata image, cấu hình non-root user (UID/GID 10001), cổng exposed 8080/tcp, `HEALTHCHECK` probe `/actuator/health`, và runtime Java 21 LTS.
   - Quét an toàn và vệ sinh layer: loại trừ mọi pattern rò rỉ secret hoặc credentials.
   - Giữ nguyên các job hiện có (`repository-validation`, `backend-ci`, `mobile-quality`, `android-debug-build`).
   - Xác minh thành công trên remote GitHub Actions run thật.

---

## 2. Thiết Kế Job & Phụ Thuộc (Job Design & Dependencies)

- **Job Name**: `Docker Image Build (Backend)` (`docker-image-build`).
- **Runner**: `ubuntu-latest`.
- **Timeout**: `timeout-minutes: 20` (hữu hạn, chống treo).
- **Quyền hạn (Permissions)**: Giữ nguyên `contents: read`. Không thêm quyền ghi packages hay id-token.
- **Quan hệ phụ thuộc (DAG)**:
  ```mermaid
  graph TD
    repo_val["repository-validation"] --> backend_ci["backend-ci (Spring Boot)"]
    repo_val --> mobile_quality["mobile-quality (React Native)"]
    mobile_quality --> android_build["android-debug-build (app-debug.apk)"]
    backend_ci --> docker_build["docker-image-build (worksphere-backend)"]
  ```
  Job `docker-image-build` chỉ cần `repository-validation` và `backend-ci` (nơi 176 backend unit/integration tests đã pass), chạy độc lập song song với nhánh Mobile/Android debug packaging.

---

## 3. Quy Chuẩn Tagging & OCI Labels

- **Short SHA Computation**: Sinh tất định từ `${GITHUB_SHA::7}` qua biến output `steps.vars.outputs.short_sha`.
- **Image Tags**:
  - `worksphere-backend:ci`
  - `worksphere-backend:sha-${SHORT_SHA}`
- **OCI Labels**:
  - `org.opencontainers.image.revision`: Gắn đầy đủ commit SHA 40 ký tự (`github.sha`).
  - `org.opencontainers.image.source`: Gắn repository URL (`github.server_url/github.repository`).

---

## 4. Kiểm Định Metadata, Non-root Runtime & Vệ Sinh Bảo Mật

Tất cả các kiểm tra tự động đã chạy thành công trong CI pipeline:
1. **Đồng nhất Image ID**: Xác minh cả 2 tags `worksphere-backend:ci` và `worksphere-backend:sha-<short-sha>` đều trỏ tới cùng một Image ID duy nhất.
2. **Cấu hình Người dùng**: Image cấu hình chạy bằng user `worksphere` (UID 10001).
3. **Cổng mạng**: Cổng `8080/tcp` được expose chính xác.
4. **Healthcheck Probe**: Metadata chứa kiểm tra `HEALTHCHECK` thăm dò `curl -f http://127.0.0.1:8080/actuator/health || exit 1`.
5. **Entrypoint**: `["java", "-jar", "/app/app.jar"]`.
6. **Runtime UID/GID Execution**: Container khởi chạy với `id` trả về chính xác:
   ```text
   uid=10001(worksphere) gid=10001(worksphere) groups=10001(worksphere)
   ```
7. **Java Runtime Verification**: Kiểm tra `java -version` trong container trả về `openjdk version "21.0.12.1"`.
8. **Layer & Secret Hygiene Audit**: Quét toàn bộ environment variables và metadata history loại trừ 100% các chuỗi nhạy cảm (`PASSWORD=`, `SECRET=`, `KEY=`, `TOKEN=`, `PRIVATE KEY`).

---

## 5. Chính Sách Artifact & Phân Định Ranh Giới

- **Image Scope**: Image chỉ được build và kiểm thử bên trong môi trường runner Ubuntu của GitHub Actions.
- **Không Export Tarball**: Không lưu trữ Docker image tarball thành artifact CI nhằm tiết kiệm băng thông và tuân thủ ranh giới Stage 18C.
- **Không Publish Registry**: Không cấu hình push image lên Docker Hub, GitHub Packages (GHCR), AWS ECR hay bất kỳ registry nào.
- **Chính sách bàn giao**: Registry publication, release packaging, signing keys và supply-chain attestation được bảo lưu và **DEFERRED HOÀN TOÀN SANG STAGE 18D / 18E**.

---

## 6. Authoritative Remote Verification Evidence

- **Authoritative Remote Run**:
  - **Run ID**: `40535347747`
  - **Run Number**: `#190`
  - **Workflow Commit Checkpoint**: `191d733a4ae20b746e0a781bc290bffef20ddd0a`
  - **HTML URL**: `https://github.com/c06-prog/WorkSphere/actions/runs/40535347747`
  - **Status / Conclusion**: `completed` / `success`
- **Chi Tiết Trạng Thái Từng Job (Run #190)**:
  - `Validate Repository & Secret Audit`: SUCCESS
  - `Backend Quality (Spring Boot)`: SUCCESS (340 tests pass across 38 classes, Checkstyle 0 violations, executable JAR uploaded)
  - `Mobile Quality (React Native)`: SUCCESS (Lint, TypeScript, 1,144 unit tests pass across 129 suites)
  - `Android Debug Build (React Native)`: SUCCESS (`worksphere-android-debug-apk` uploaded)
  - `Docker Image Build (Backend)`: SUCCESS (Multi-stage build, deterministic tagging, non-root UID 10001 pass)
- **Kết Luận**: Toàn bộ 5/5 jobs đều đạt màu xanh hoàn hảo.

---

## 7. Trạng Thái Kho Mã & Kế Hoạch Tiếp Theo

- **Production Source Diff**: Hoàn toàn không sửa đổi (`backend/src` và `mobile/src` giữ nguyên vẹn 100%).
- **Trạng thái Git**: Working tree sạch sẽ, không có secret, key, binary hay image tarball bị track.
- **Cổng chất lượng**: **ROADMAP-STAGE-18C HOÀN TẤT & ĐÃ ĐÓNG**. Sẵn sàng cho Stage 18D.
