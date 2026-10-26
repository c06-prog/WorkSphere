# PHASE 16E — FLOW-06 NOTIFICATION LIFECYCLE, CROSS-MODULE CONTEXT NAVIGATION & REGRESSION REPORT

- **Mã giai đoạn**: GIAI ĐOẠN 16E (FLOW-06 NOTIFICATION LIFECYCLE & CROSS-MODULE NAVIGATION)
- **Starting Checkpoint**: `1f175a9`
- **Thời gian hoàn thành**: 26/10/2026
- **Trạng thái**: **COMPLETED — ALL TESTS & RUNTIME GATES PASS**
- **Canonical Flows**: FLOW-06 (Notification Lifecycle & Cross-Module Context Navigation)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU ĐÃ ĐẠT

Giai đoạn 16E kiểm định toàn diện vòng đời Notification trong bối cảnh tích hợp liên module giữa Backend, Database, Mobile Application và Android Runtime thực tế trên Android API 35 (1080x2400):

1. **Mutation phát sinh Notification thật**:
   - `PROJECT_MEMBER_ADDED`: Phát sinh khi Admin thêm thành viên vào dự án.
   - `TASK_ASSIGNED`: Phát sinh khi Admin tạo/gán task cho nhân viên.
   - `COMMENT_ADDED`: Phát sinh khi có bình luận mới trên task.
   - `SERVICE_REQUEST_UPDATED`: Phát sinh khi trạng thái yêu cầu dịch vụ thay đổi (`WAITING_FOR_USER`).
   - `ASSET_ASSIGNED`: Phát sinh khi tài sản được cấp phát cho nhân viên.
2. **Segregation & Isolation đa người dùng**:
   - Số lượng unread count và danh sách thông báo hoàn toàn cô lập theo từng user token/principal.
   - Thử nghiệm truy cập chéo (Cross-User Mark Read): Employee cố tình gọi API đánh dấu đọc notification của Admin $\rightarrow$ Hệ thống phản hồi an toàn `404 NOTIFICATION_NOT_FOUND` (`{"code":"NOTIFICATION_NOT_FOUND","message":"Thông báo không tồn tại"}`), tuyệt đối không rò rỉ metadata hay sự tồn tại của notification khác.
3. **Android Runtime Verification (Medium_Phone / API 35)**:
   - **Dashboard Bell & Badge**: Hiển thị chính xác badge số lượng chưa đọc đồng bộ từ backend (`count: 28`).
   - **Notification List Screen**: Render danh sách thẻ thông báo đầy đủ timestamp tương đối, tiêu đề, nội dung và trạng thái unread indicator.
   - **Context Navigation**:
     - Chạm vào thẻ `PROJECT_MEMBER_ADDED` $\rightarrow$ Tự động mark-as-read, giảm unread count, điều hướng chính xác vào `ProjectDetailScreen` (`PRJ-16E-270063545`). Nút Back quay về Dashboard, badge cập nhật `27`.
     - Chạm vào thẻ `TASK_ASSIGNED` $\rightarrow$ Tự động mark-as-read, điều hướng chính xác vào `TaskDetailScreen` ("Cong Viec Kiem Dinh 16E Notification"). Nút Back quay về, badge cập nhật `26`.
     - Chạm vào thẻ `SERVICE_REQUEST_UPDATED` $\rightarrow$ Tự động mark-as-read, điều hướng chính xác vào `ServiceRequestDetailScreen` (`SR-2026-000011`, trạng thái "Chờ phản hồi"). Nút Back quay về, badge cập nhật `25`.
     - Chạm vào thẻ `ASSET_ASSIGNED` $\rightarrow$ Tự động mark-as-read, điều hướng chính xác vào `AssetDetailScreen` (`AST-TRUE-39533`, trạng thái "Đang cấp phát"). Nút Back quay về danh sách.
   - **Null / Missing Reference Handling**:
     - Thêm thông báo không có `referenceType`/`referenceId`.
     - Chạm vào thẻ $\rightarrow$ Đánh dấu đã đọc thành công trong database, hiển thị banner phản hồi người dùng: *"Thông báo này không có nội dung liên kết để mở."*, màn hình giữ nguyên không bị crash hoặc navigation lỗi.
   - **Đọc tất cả (Mark-All-As-Read)**:
     - Nhấn nút "Đọc tất cả" trên header $\rightarrow$ Hiển thị popup xác nhận $\rightarrow$ Nhấn "Xác nhận".
     - Backend API `PUT /api/v1/notifications/read-all` thực thi thành công, unread count trong database về `0`.
     - Tab "Chưa đọc" hiển thị empty state: *"Không có thông báo chưa đọc - Bạn đã đọc tất cả thông báo hiện có."*
     - Dashboard bell badge ẩn hoàn toàn (content description: *"Thông báo, không có thông báo chưa đọc"*).
   - **Context Navigation từ More Menu**:
     - Điều hướng từ menu "Thêm" $\rightarrow$ chọn "Thông báo" $\rightarrow$ mở `NotificationListScreen` $\rightarrow$ nút Back quay về chính xác màn hình "Thêm".
   - **User Switching & Zero State Leakage**:
     - Đăng xuất Employee $\rightarrow$ Đăng nhập Admin (`e2e_admin`).
     - Badge thông báo của Admin trên Dashboard hiển thị độc lập (`1`), mở danh sách thông báo chỉ chứa đúng 1 thông báo thuộc về Admin, hoàn toàn không bị rò rỉ state/count từ phiên làm việc trước đó của Employee.

---

## 2. BẰNG CHỨNG KIỂM THỬ TÍCH HỢP & REGRESSION

### 2.1. Mobile Full Regression
- **Command**: `npm --prefix mobile test -- --runInBand`
- **Kết quả**:
  - **129 passed, 129 total test suites**
  - **1142 passed, 1142 total tests**
  - **Exit Code**: 0

### 2.2. Backend Full Regression
- **Command**: `cd backend; .\mvnw.cmd test`
- **Kết quả**:
  - **Checkstyle violations**: 0
  - **Tests run**: **340, Failures: 0, Errors: 0, Skipped: 0**
  - **BUILD SUCCESS**
  - **Exit Code**: 0

### 2.3. TaskDeadlineScanner & Idempotency
- `TaskDeadlineScanner` hoàn thành chu kỳ quét định kỳ với log rõ ràng, không lặp thông báo hay phát sinh lỗi trùng lặp khi chạy đồng thời.

---

## 3. CLEAN TEARDOWN & RECOVERY
- Dừng ứng dụng mobile trên emulator: `adb shell am force-stop com.workspheremobile`.
- Gỡ bỏ reverse ports: `adb reverse --remove-all`.
- Tắt an toàn Android Emulator: `adb emu kill`.
- Hủy các background task dev server (Backend port 8080, Metro port 8081).
- Kiểm tra giải phóng port TCP: Cả hai port 8080 và 8081 đã được giải phóng hoàn toàn khỏi trạng thái Listening.
- Dọn dẹp toàn bộ file dump UI tạm (`ui_*.xml`).

---

## 4. KẾT LUẬN & SẴN SÀNG CHO GIAI ĐOẠN 16F
Toàn bộ các tiêu chí nghiệm thu của Giai đoạn 16E đã hoàn tất và được xác thực đầy đủ bằng runtime evidence. Hệ thống sẵn sàng chuyển sang:
**GIAI ĐOẠN 16F — CROSS-MODULE INTEGRATION & FINAL END-TO-END ACCEPTANCE WAVE**.
