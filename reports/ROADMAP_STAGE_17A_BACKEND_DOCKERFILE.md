# BÁO CÁO THỰC THI ROADMAP GIAI ĐOẠN 17A
## (ROADMAP-STAGE-17A — BACKEND MULTI-STAGE DOCKERFILE FOUNDATION)

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Starting Checkpoint:** `c71ed1cfea0038ff45880502c201ee32629e52a9`  
**Status:** IMPLEMENTED & VERIFIED  
**Marker:** `ROADMAP_STAGE_17A_BACKEND_IMAGE_COMPLETE_READY_FOR_17B`  

---

## 1. MỤC TIÊU & PHÂN ĐỊNH (OBJECTIVES & DISTINCTION)

1. **Phân định rõ đánh số:**
   - Nhiệm vụ này là **ROADMAP-STAGE-17A** (Docker hóa Backend trong Roadmap Canonical).
   - Tuyệt đối không phải Mobile Phase 17 (Asset Management đã đóng tại `PHASE_17_MEMORY_CHECKPOINT.md`).
   - Tuyệt đối không can thiệp hay sửa đổi mã nguồn nghiệp vụ của Backend hay Mobile.
2. **Mục tiêu đạt được trong 17A:**
   - Thiết lập `backend/.dockerignore` tối ưu, bảo mật và loại bỏ toàn bộ file rác, logs, target và credentials.
   - Xây dựng `backend/Dockerfile` đa tầng (multi-stage build) cho Java 21 LTS Spring Boot 3.
   - Chạy container bằng tài khoản non-root (`worksphere`, UID/GID 10001).
   - Cấu hình thư mục upload bền vững `/app/uploads` thuộc quyền sở hữu của non-root user.
   - Tích hợp cơ chế kiểm tra sức khỏe `HEALTHCHECK` thăm dò `/actuator/health`.
   - Biên dịch thành công Docker image `worksphere-backend:stage17a-local` với Maven Checkstyle 0 violations.
   - Đảm bảo an toàn dữ liệu: Không khởi động container chạy nền, không chạm vào container `worksphere-dev-pg` và anonymous volume cũ.

---

## 2. QUYẾT ĐỊNH CHỌN BASE IMAGE (BASE IMAGE DECISION)

- **Builder Stage:** `eclipse-temurin:21-jdk` (Ubuntu 26.04 LTS / JDK 21.0.12.1 LTS).
  + Cung cấp đầy đủ JDK 21 để chạy Maven Wrapper và biên dịch 219 file Java mã nguồn cùng Checkstyle validation.
- **Runner Stage:** `eclipse-temurin:21-jre` (Ubuntu 26.04 LTS / JRE 21.0.12.1 LTS).
  + Cung cấp JRE 21 runtime tối ưu, đã có sẵn tiện ích `curl` cho health probe, loại bỏ hoàn toàn trình biên dịch javac, header C và công cụ phát triển thừa thãi.
- **Tính tương thích:** Cùng họ phân phối Ubuntu/Temurin giúp bảo đảm tính tương thích nhị phân 100% giữa hai stage.

---

## 3. THIẾT KẾ DOCKERFILE & .DOCKERIGNORE

### A. Tệp `backend/.dockerignore`
- Loại bỏ toàn bộ: `.git`, `.gitignore`, `target/`, `*.log`, `.env`, `.env.*`, `.idea/`, `.vscode/`, `tmp/`, `coverage/`.
- Cho phép build context `backend/` nạp đúng các tệp cần thiết: `pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/`, `checkstyle.xml`, `src/`.

### B. Tệp `backend/Dockerfile` Đa Tầng
- **Stage 1 (Builder):**
  + `WORKDIR /workspace`
  + Copy `mvnw`, `.mvn/`, `pom.xml`, `checkstyle.xml` trước.
  + Chuẩn hóa kết thúc dòng (CRLF $\rightarrow$ LF) và phân quyền thực thi cho `mvnw`.
  + Tải trước dependency offline: `./mvnw dependency:go-offline -B` (tận dụng Docker caching layer).
  + Copy thư mục `src/` và thực thi: `./mvnw clean package -DskipTests -B`.
  + Kết quả: Tạo file `backend-0.0.1-SNAPSHOT.jar` executable Spring Boot archive (68,285,088 bytes). Checkstyle kiểm tra đạt `0 Checkstyle violations`.
- **Stage 2 (Runner):**
  + Tạo group và user non-root: `groupadd -g 10001 worksphere && useradd -u 10001 -g worksphere -s /bin/false -m -d /app worksphere`.
  + `WORKDIR /app`
  + Tạo thư mục `/app/uploads` và gán quyền sở hữu `chown -R worksphere:worksphere /app`.
  + Copy file JAR duy nhất từ builder: `COPY --from=builder --chown=worksphere:worksphere /workspace/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar`.
  + Chuyển người dùng: `USER worksphere`.
  + Cổng công bố: `EXPOSE 8080`.
  + Cấu hình JVM tối ưu container: `JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"`.
  + Khai báo Healthcheck: `HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://127.0.0.1:8080/actuator/health || exit 1`.
  + Entrypoint: `ENTRYPOINT ["java", "-jar", "/app/app.jar"]`.

---

## 4. BẰNG CHỨNG XÂY DỰNG & KIỂM ĐỊNH IMAGE (BUILD EVIDENCE & INSPECTION)

### A. Kết Quả Docker Build
- **Lệnh thực thi:**
  ```powershell
  docker build --file backend/Dockerfile --tag worksphere-backend:stage17a-local backend
  ```
- **Exit Code:** `0` (BUILD SUCCESS).
- **Image Tag:** `worksphere-backend:stage17a-local`.
- **Image ID:** `sha256:c5e0fc61febbd95ca88c884e698e1a1e196030d5ca710fd2e1c0147f3f472560`.
- **Image Size:** 586 MB (Bao gồm hệ điều hành Ubuntu JRE 21 gốc + Java runtime + 68MB Spring Boot fat JAR).

### B. Kiểm Tra Metadata & Cấu Hình Image
- **User Configured:** `worksphere` (`uid=10001(worksphere) gid=10001(worksphere)`).
- **Exposed Ports:** `map[8080/tcp:{}]`.
- **Entrypoint:** `[java -jar /app/app.jar]`.
- **Healthcheck:** `{[CMD-SHELL curl -f http://127.0.0.1:8080/actuator/health || exit 1] 15s 5s 30s 0s 3}`.
- **Java Version Verification:**
  ```text
  Picked up JAVA_TOOL_OPTIONS: -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom
  openjdk version "21.0.12.1" 2026-08-18 LTS
  OpenJDK Runtime Environment Temurin-21.0.12.1+1 (build 21.0.12.1+1-LTS)
  ```
- **Thư Mục Ứng Dụng `/app`:**
  ```text
  -rw-r--r-- 1 worksphere worksphere 68285088 Oct 27 09:44 app.jar
  drwxr-xr-x 2 worksphere worksphere     4096 Oct 27 09:40 uploads
  ```

### C. Quét Lịch Sử & Kiểm Tra An Ninh Image (Security Scan)
- Lệnh: `docker history --no-trunc worksphere-backend:stage17a-local`.
- Kết quả:
  + Không chứa bất kỳ secret, API key hay DB password nào trong các image layers.
  + Không copy tệp cấu hình môi trường `.env` vào image.
  + Thư mục mã nguồn `src/` và cache Maven `.m2/` nằm hoàn toàn ở Stage Builder bị loại bỏ, không xuất hiện trong Runtime image.
  + Image chạy bằng tài khoản non-root UID 10001.

---

## 5. BẢO TOÀN DỮ LIỆU & HẠ TẦNG HIỆN HỮU (DATA PRESERVATION)

- Container PostgreSQL `worksphere-dev-pg`: Duy trì trạng thái an toàn `Exited (255)`, không bị can thiệp hay xóa bỏ.
- Anonymous Volume `1a27330904630b9ecb15483cea9cee4d194a9db395d9a598dd649f459ae49a75`: Bảo toàn nguyên vẹn.
- Không khởi chạy container backend nào ở chế độ daemon trong Giai đoạn 17A.

---

## 6. KẾ HOẠCH BƯỚC TIẾP THEO (NEXT CANONICAL STEP)

Sau khi Giai đoạn 17A hoàn tất và được xác nhận:
- Chuyển sang **Roadmap Stage 17B (Compose Orchestration)**:
  + Tạo `docker-compose.yml` liên kết service `backend` (từ `worksphere-backend:stage17a-local` hoặc build context) với service `postgres` (image `postgres:15-alpine`).
  + Cấu hình named volume `worksphere-postgres-data` và `worksphere-uploads`.
  + Cấu hình network cô lập `worksphere-net`.
  + Thiết lập ràng buộc `depends_on: condition: service_healthy`.

---

## 7. KẾT LUẬN

ROADMAP_STAGE_17A_BACKEND_IMAGE_COMPLETE_READY_FOR_17B
