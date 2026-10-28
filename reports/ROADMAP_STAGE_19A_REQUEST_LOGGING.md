# BÁO CÁO THỰC THI ROADMAP GIAI ĐOẠN 19A
## (ROADMAP-STAGE-19A — REQUEST CORRELATION, STRUCTURED LOGGING & SENSITIVE-DATA SAFETY)

**Document Version:** 2.0 (Authoritative Closure)
**Date:** 2026-10-28
**Starting Checkpoint:** `e231a792ab2679e5f3a4e72a52362d6ca63d56cf`
**Implementation Checkpoint:** `08d4b8ebc00d126ab61aeccf2686d6e1b3df9f3c`
**Status:** COMPLETED, RUNTIME VERIFIED & CLOSED
**Final Marker:** `ROADMAP_STAGE_19A_REQUEST_LOGGING_COMPLETE_READY_FOR_19B`

---

## 1. Mục Tiêu & Phân Định (Objectives & Distinction)

1. **Phân định ranh giới**:
   - Nhiệm vụ này là **ROADMAP-STAGE-19A** (Logging có cấu trúc, tương quan request và an toàn dữ liệu nhạy cảm).
   - Tuyệt đối không phải Mobile Phase 19.
   - Không bắt đầu phần monitoring/Prometheus của Stage 19B.
   - Không tạo backup/restore scripts của Stage 19C–19D.
   - Không triển khai Staging hay Production.
2. **Mục tiêu hoàn thành trong 19A**:
   - Mỗi HTTP request có Request ID ổn định, hỗ trợ `X-Request-ID` hợp lệ hoặc tự động sinh UUID phiên bản 4.
   - Header validation loại trừ 100% ký tự điều khiển xuống dòng (`\r\n`), phòng chống tấn công Log Injection.
   - Nạp Request ID vào Slf4j `MDC` với khóa `requestId`.
   - Gắn `X-Request-ID` vào HTTP Response Header gửi lại client.
   - Tự động nạp MDC `requestId` vào trường `traceId` của `ApiResponse<T>` chuẩn hóa toàn hệ thống.
   - Ghi nhận completion log với method, path, HTTP status và thời gian xử lý `durationMs`.
   - Cấu hình tệp `logback-spring.xml` chuẩn hóa xuất log có cấu trúc ra stdout container.
   - Ngăn chặn triệt để nguy cơ rò rỉ secret, mật khẩu, JWT token hay Authorization header.

---

## 2. Quyết Định Thiết Kế & Bản Chất Kỹ Thuật (Architecture Decisions)

- **Định dạng Log**:
  - Log xuất ra stdout container là **Structured Key-Value Console Output** (`[requestId=%X{requestId:-none}]` kèm timestamp ISO-8601, log level, thread, logger và completion fields), **chưa phải là raw JSON một dòng**.
  - Giải pháp này tận dụng nền tảng tích hợp sẵn của Spring Boot và Logback, không thêm thư viện ngoài luồng, dễ đọc khi dev local và hoàn toàn tương thích với các log forwarders (Docker log driver, FluentBit, Vector).
- **Ranh giới Phân tán (Distributed Tracing Boundary)**:
  - Trong phạm vi Modular Monolith hiện tại, `requestId` được dùng làm giá trị cho `ApiResponse.traceId`.
  - Hệ thống **chưa triển khai distributed tracing toàn diện hay OpenTelemetry/W3C traceparent** (bảo lưu cho kiến trúc phân tán nếu có trong tương lai).
- **Chính sách Nội dung Thân Request/Response**:
  - Hệ thống **tuyệt đối không log raw request body hay raw response body**, ngăn chặn triệt để nguy cơ rò rỉ dữ liệu cá nhân hay payload lớn.

---

## 3. Ranh Giới An Toàn Dữ Liệu Nhạy Cảm & Vệ Sinh Mã Nguồn

- **Phòng ngừa chủ động (Prevention over regex masking)**:
  - Completion log chỉ ghi nhận: `method`, `path` (request URI chuẩn), `status`, `durationMs`.
  - Không ghi nhận query parameters thô ra completion log.
  - Bộ lọc correlation và toàn bộ hệ thống tuyệt đối không log header `Authorization: Bearer ...`, cookie hoặc token.
  - Bộ lọc `SAFE_REQUEST_ID_PATTERN` (`^[a-zA-Z0-9-_]{1,64}$`) triệt tiêu 100% rủi ro log injection.

---

## 4. Bằng Chứng Xác Minh Runtime Thực Tế (Runtime Verification Evidence)

### A. Authoritative Remote CI Verification (Run #195)
- **Workflow Run ID**: `40613361768` (Run `#195`)
- **Status / Conclusion**: `completed` / `success` (100% PASS trên toàn bộ 5 jobs).
- **Backend Quality Gates**:
  - **Checkstyle**: 0 violations.
  - **Số lượng tests**: **346 tests pass** (Tăng từ baseline 340 tests nhờ bổ sung 6 tests của Stage 19A).
  - **Failures / Errors / Skipped**: **0**.
  - **Artifact**: `backend-executable-jar` và `backend-test-reports` uploaded thành công.

### B. Docker Compose Stdout Runtime Verification (Local Rehearsal PASS)
- **Quá trình thực thi**:
  1. Tạo tệp `.env` tạm (được `.gitignore` bảo vệ).
  2. Khởi chạy `docker compose up -d --build` (biên dịch image `worksphere-backend:stage17-local`).
  3. Cả hai container `worksphere-compose-postgres` và `worksphere-compose-backend` đạt trạng thái `healthy`.
  4. Gửi request thăm dò sức khỏe kèm `X-Request-ID: req-test-synthetic-12345`:
     - Phản hồi HTTP 200, header `X-Request-ID: req-test-synthetic-12345`.
     - Log stdout container ghi nhận chính xác:
       ```text
       2026-10-28T01:30:15.804Z INFO [requestId=req-test-synthetic-12345] --- [nio-8080-exec-6] c.w.s.logging.RequestCorrelationFilter : HTTP request completed: method=GET path=/actuator/health status=200 durationMs=5
       ```
  5. Gửi request được bảo vệ không có token `/api/v1/projects` kèm `X-Request-ID: req-protected-401-audit`:
     - Phản hồi HTTP 401, header `X-Request-ID: req-protected-401-audit`.
     - Thân JSON trả về `ApiResponse` chứa `"traceId":"req-protected-401-audit"`.
     - Log stdout container ghi nhận chính xác ở mức `WARN`:
       ```text
       2026-10-28T01:30:15.878Z WARN [requestId=req-protected-401-audit] --- [nio-8080-exec-7] c.w.s.logging.RequestCorrelationFilter : HTTP request completed: method=GET path=/api/v1/projects status=401 durationMs=71
       ```
  6. **Dọn dẹp môi trường**:
     - Lệnh `docker compose down` dừng và xóa containers/network mà **tuyệt đối không dùng cờ `-v`**, bảo toàn 100% dữ liệu của named volume `worksphere-postgres-data` và `worksphere-uploads`.
     - Xóa hoàn toàn `.env` tạm, kiểm tra các cổng mạng `8080` và `5433` được giải phóng hoàn toàn.

---

## 5. Kết Luận Cổng Chất Lượng Stage 19A

Stage 19A đã hoàn thành xuất sắc toàn bộ tiêu chí kỹ thuật:
- **Baseline kiểm thử mới**: **346 backend tests** pass 100%.
- Request correlation hoạt động hoàn hảo từ tầng mạng đến tầng DTO `ApiResponse.traceId`.
- Log stdout container có cấu trúc rõ ràng, đầy đủ các trường đo lường hiệu năng.
- Không có bất kỳ bí mật hay dữ liệu nhạy cảm nào bị rò rỉ.

**Cổng chất lượng chính thức**: **`ROADMAP_STAGE_19A_REQUEST_LOGGING_COMPLETE_READY_FOR_19B`**.
