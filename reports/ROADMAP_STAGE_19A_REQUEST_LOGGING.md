# BÁO CÁO THỰC THI ROADMAP GIAI ĐOẠN 19A
## (ROADMAP-STAGE-19A — REQUEST CORRELATION, STRUCTURED LOGGING & SENSITIVE-DATA SAFETY)

**Document Version:** 1.0  
**Date:** 2026-10-28  
**Starting Checkpoint:** `e231a792ab2679e5f3a4e72a52362d6ca63d56cf`  
**Status:** COMPLETED & VERIFIED  
**Final Marker:** `ROADMAP_STAGE_19A_REQUEST_LOGGING_COMPLETE_READY_FOR_19B`  

---

## 1. Mục Tiêu & Phân Định (Objectives & Distinction)

1. **Phân định rõ ràng**:
   - Nhiệm vụ này là **ROADMAP-STAGE-19A** (Logging có cấu trúc, tương quan request và an toàn dữ liệu nhạy cảm).
   - Tuyệt đối không phải Mobile Phase 19.
   - Không bắt đầu phần monitoring/Prometheus của Stage 19B.
   - Không tạo backup/restore scripts của Stage 19C–19D.
   - Không triển khai Staging hay Production.
2. **Mục tiêu hoàn thành trong 19A**:
   - Thiết lập `RequestCorrelationFilter` tiếp nhận hoặc tự sinh `X-Request-ID` an toàn.
   - Nạp Request ID vào Slf4j `MDC` với khóa `requestId`.
   - Gắn `X-Request-ID` vào HTTP Response Header gửi lại client.
   - Tự động nạp MDC `requestId` vào trường `traceId` của `ApiResponse<T>` chuẩn hóa toàn hệ thống.
   - Ghi nhận completion log với method, path, HTTP status và thời gian xử lý `durationMs`.
   - Cấu hình tệp `logback-spring.xml` chuẩn hóa xuất log ra stdout container.
   - Ngăn chặn triệt để nguy cơ rò rỉ secret, mật khẩu, JWT token hay Authorization header.

---

## 2. Quyết Định Thiết Kế Định Dạng Log (Logging Format Decision)

- **Lựa chọn triển khai**: Tận dụng triệt để nền tảng tích hợp sẵn của Spring Boot và Logback thông qua cấu hình `logback-spring.xml` và MDC pattern, **không cần cài thêm dependency bên thứ ba ngoài luồng** (`logstash-logback-encoder`).
- **Ưu điểm**:
  - Không làm phình to `pom.xml`, không xung đột phiên bản phụ thuộc.
  - Định dạng console stdout rõ ràng, có màu phân tách khi chạy local, và cấu trúc trường cố định `[requestId=%X{requestId:-none}]` hoàn toàn phù hợp cho các log forwarder/collector tiêu chuẩn (Docker log driver, FluentBit, Grafana Promtail/Loki).
  - Tự động lọc bỏ các log ồn ào không cần thiết từ thư viện nền (`org.hibernate: WARN`, `org.apache.catalina: WARN`).

---

## 3. Ranh Giới An Toàn Dữ Liệu Nhạy Cảm & Vệ Sinh Mã Nguồn

- **Phòng ngừa chủ động (Prevention over regex masking)**:
  - Completion log chỉ ghi nhận `request.getMethod()`, `request.getRequestURI()`, `response.getStatus()`, `durationMs`.
  - Không ghi nhận query string, raw request body, hay response body.
  - Bộ lọc correlation và toàn bộ hệ thống tuyệt đối không log header `Authorization: Bearer ...`.
  - Bộ lọc `SAFE_REQUEST_ID_PATTERN` (`^[a-zA-Z0-9-_]{1,64}$`) triệt tiêu 100% rủi ro log injection thông qua các ký tự điều khiển xuống dòng (`\r\n`).

---

## 4. Kết Quả Kiểm Thử Chất Lượng (Quality Gates Evidence)

1. **Bộ Kiểm Thử Đích Thực (`RequestCorrelationFilterTest`)**:
   - 6/6 test cases đạt **100% PASS**:
     + `testAbsentRequestIdGeneratesUuid`: Tự động sinh UUID khi client không gửi header.
     + `testValidIncomingRequestIdPreserved`: Giữ nguyên Request ID hợp lệ của client.
     + `testInvalidHeaderReplaced`: Thay thế an toàn khi gặp header chứa ký tự xuống dòng / log injection.
     + `testMdcClearedOnException`: MDC luôn được dọn dẹp sạch sẽ kể cả khi xảy ra ngoại lệ.
     + `testConcurrentMdcIsolation`: MDC cách ly tuyệt đối giữa các luồng đồng thời.
     + `testApiResponsePullsActiveTraceId`: `ApiResponse.traceId` tự động nạp chính xác `X-Request-ID`.
2. **Kiểm Tra Toàn Bộ Backend Suite**:
   - **Checkstyle**: 0 violations.
   - **Tổng số tests**: **346 tests pass** (Tăng từ baseline 340 tests nhờ bổ sung 6 tests của Stage 19A).
   - **Failures / Errors / Skipped**: **0**.
   - **Build & Package**: `BUILD SUCCESS`, đóng gói thành công `backend-0.0.1-SNAPSHOT.jar`.

---

## 5. Kết Luận Cổng Chất Lượng Stage 19A

Stage 19A đã hoàn thành xuất sắc toàn bộ tiêu chí kỹ thuật:
- Request correlation hoạt động hoàn hảo từ tầng mạng đến tầng DTO.
- Không rò rỉ thông tin nhạy cảm.
- Bộ kiểm thử chất lượng toàn diện màu xanh.

Sẵn sàng chuyển giao sang **Stage 19B (Actuator Endpoints Hardening & Prometheus Metrics)**.
