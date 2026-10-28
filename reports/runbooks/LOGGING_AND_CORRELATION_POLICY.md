# HƯỚNG DẪN VẬN HÀNH: CHÍNH SÁCH LOGGING & CORRELATION
## (LOGGING & CORRELATION POLICY RUNBOOK)

**Document Version:** 1.0  
**Date:** 2026-10-28  
**Module:** Backend (`backend`)  
**Status:** CANONICAL GOVERNANCE ENFORCED  

---

## 1. Hợp Đồng Định Danh Request (Request ID & Correlation Contract)

1. **Canonical Header**:
   - Khóa chuẩn định danh: `X-Request-ID`.
2. **Quy Tắc Tiếp Nhận & Tự Động Sinh**:
   - Nếu client gửi `X-Request-ID` hợp lệ (độ dài 1–64 ký tự, chỉ bao gồm chữ cái tiếng Anh, số, gạch ngang `-`, gạch dưới `_`), hệ thống bảo lưu nguyên vẹn giá trị này.
   - Nếu client không gửi hoặc gửi giá trị không an toàn (chứa ký tự điều khiển xuống dòng `\r`, `\n`, tab hoặc ký tự đặc biệt có nguy cơ log injection): hệ thống tự động sinh một mã `UUID` phiên bản 4 mới thay thế an toàn.
3. **MDC Injection & Response Propagation**:
   - Request ID được nạp vào Slf4j MDC với khóa `requestId` ngay từ đầu vòng đời xử lý request (`@Order(Ordered.HIGHEST_PRECEDENCE)`).
   - `X-Request-ID` luôn được gắn vào HTTP Response Header gửi lại client.
   - Trường `traceId` trong JSON `ApiResponse<T>` tự động nạp giá trị từ MDC `requestId` hiện hành.
   - Khóa `requestId` được dọn dẹp sạch sẽ khỏi MDC trong khối `finally` ngay sau khi hoàn tất request để tránh rò rỉ ngữ cảnh giữa các luồng tái sử dụng (ThreadLocal pool).

---

## 2. Định Dạng Cấu Trúc Log (Structured Log Pattern)

Hệ thống sử dụng tệp cấu hình canonical `backend/src/main/resources/logback-spring.xml` xuất log ra `stdout` tiêu chuẩn của container với định dạng:

```text
%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX} %5p [requestId=%X{requestId:-none}] --- [%15.15t] %-40.40logger{39} : %m%n%wEx
```

### Các Trường Thông Tin Bắt Buộc:
- `timestamp`: Định dạng chuẩn ISO-8601 (`yyyy-MM-dd'T'HH:mm:ss.SSSXXX`).
- `level`: Mức độ log (`INFO`, `WARN`, `ERROR`).
- `requestId`: Định danh correlation nạp từ MDC (nếu ngoài ngữ cảnh web request thì mặc định là `none`).
- `thread`: Tên luồng thực thi (`[%15.15t]`).
- `logger`: Tên lớp phát sinh log (`%-40.40logger{39}`).
- `message`: Nội dung log có cấu trúc.

---

## 3. Chính Sách Ghi Nhận Sự Kiện Hoàn Tất Request (Completion Event Policy)

Mỗi HTTP request khi hoàn thành chuỗi filter được ghi nhận duy nhất một dòng log tóm tắt:

```text
HTTP request completed: method={METHOD} path={PATH} status={STATUS} durationMs={DURATION}
```

- **HTTP 2xx / 3xx**: Ghi nhận ở mức `INFO`.
- **HTTP 4xx**: Ghi nhận ở mức `WARN` (tránh spam lỗi hệ thống đối với các request sai lệch từ client).
- **HTTP 5xx**: Ghi nhận ở mức `ERROR`.
- **Đo lường thời gian**: Sử dụng đồng hồ đơn điệu `System.nanoTime()` đo chính xác thời gian xử lý `durationMs`.

---

## 4. Chính Sách Bảo Mật Dữ Liệu Nhạy Cảm (Sensitive Data Protection)

### Nguyên Tắc Bất Di Bất Dịch:
1. **Tuyệt Đối Cấm Log**:
   - Header `Authorization` (Bearer JWT access token, basic auth credentials).
   - Cookie `Set-Cookie` hoặc session tokens.
   - Mật khẩu người dùng (`password`, `currentPassword`, `newPassword`).
   - Mã khôi phục / Reset tokens (`resetToken`, `token`).
   - Khóa bí mật cơ sở dữ liệu hoặc JWT secret.
   - Nội dung thô của tệp tải lên (file upload streams, binary content).
   - Toàn bộ raw JSON body của request hoặc response.
2. **Quy Chuẩn URL**:
   - Chỉ log URI đường dẫn chuẩn (`request.getRequestURI()`).
   - Không in query parameters thô ra completion log nhằm phòng chống rò rỉ token hoặc dữ liệu cá nhân nằm trên URL query string.
