# BIỂU MẪU KỊCH BẢN KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (UAT SCENARIO TEMPLATE)

---

## 1. THÔNG TIN CHUNG (SCENARIO METADATA)

- **Mã Kịch Bản (Scenario ID):** `UAT-XX`
- **Tên Kịch Bản (Title):** [Tên kịch bản nghiệp vụ]
- **Luồng Tích Hợp Kế Thừa (Integration Flow Mapping):** `FLOW-0X`
- **Mức Độ Ưu Tiên (Priority):** `P0 (Critical)` / `P1 (High)` / `P2 (Medium)`
- **Vai Trò Thực Hiện (Actor Role):** `EMPLOYEE` / `TEAM_LEADER` / `PROJECT_MANAGER` / `ADMIN`
- **Môi Trường Kiểm Thử (Environment):** Local Android Emulator / Android Device / Staging
- **Bản Build Kiểm Thử (Build Checkpoint):** `[Git Commit SHA]`
- **Người Thực Hiện (Tester):** [Họ tên chuyên viên kiểm thử]
- **Ngày Thực Hiện (Execution Date):** YYYY-MM-DD

---

## 2. MỤC TIÊU & ĐIỀU KIỆN TIÊN QUYẾT (GOAL & PRECONDITIONS)

- **Mục Tiêu Nghiệp Vụ (Business Goal):**  
  [Mô tả mục tiêu doanh nghiệp mà kịch bản cần xác nhận]

- **Điều Kiện Tiên Quyết (Preconditions):**  
  1. [Điều kiện về trạng thái hệ thống]  
  2. [Điều kiện về tài khoản đăng nhập và phân quyền]  
  3. [Điều kiện về kết nối mạng và backend]

- **Dữ Liệu Kiểm Thử Chuẩn Bị (Test Data Requirements):**  
  - Tên đăng nhập / Mật khẩu: `[Tài khoản canonical đại diện]`  
  - Mã thực thể (Tiền tố `UAT-`): `[Mã dự án / Mã công việc / Mã tài sản]`  
  - Thuộc tính nghiệp vụ: `[Tên, phòng ban, mức ưu tiên, mô tả]`

---

## 3. CÁC BƯỚC THỰC HIỆN CHI TIẾT (TEST EXECUTION STEPS)

| Bước | Thao Tác Của Người Dùng (User Action) | Dữ Liệu Nhập Vào (Input Data) | Kết Quả Mong Đợi (Expected Business Result) | Trạng Thái Thực Tế (Actual Result) | Đánh Giá (Pass/Fail) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | [Mô tả thao tác bước 1] | [Dữ liệu nhập nếu có] | [Kết quả màn hình/dữ liệu hiển thị] | [Ghi nhận thực tế] | PASS / FAIL |
| **2** | [Mô tả thao tác bước 2] | [Dữ liệu nhập nếu có] | [Kết quả màn hình/dữ liệu hiển thị] | [Ghi nhận thực tế] | PASS / FAIL |
| **3** | [Mô tả thao tác bước 3] | [Dữ liệu nhập nếu có] | [Kết quả màn hình/dữ liệu hiển thị] | [Ghi nhận thực tế] | PASS / FAIL |
| **4** | [Mô tả thao tác bước 4] | [Dữ liệu nhập nếu có] | [Kết quả màn hình/dữ liệu hiển thị] | [Ghi nhận thực tế] | PASS / FAIL |
| **5** | [Mô tả thao tác bước 5] | [Dữ liệu nhập nếu có] | [Kết quả màn hình/dữ liệu hiển thị] | [Ghi nhận thực tế] | PASS / FAIL |

---

## 4. TIÊU CHÍ CHẤP NHẬN & PHÂN QUYỀN (ACCEPTANCE & RBAC CRITERIA)

- **Kiểm Tra Phân Quyền (RBAC Verification):**  
  - [ ] Nút thao tác hiển thị chính xác theo quyền của vai trò thực hiện.  
  - [ ] Người dùng không có quyền bị ẩn nút hoặc nhận phản hồi 403 Forbidden.  
  - [ ] Không có hiện tượng rò rỉ dữ liệu của phòng ban/dự án khác.
- **Tính Toàn Vẹn Dữ Liệu (Data Integrity):**  
  - [ ] Dữ liệu lưu vào database có version tăng chính xác.  
  - [ ] Không xuất hiện lỗi khóa lạc quan không xử lý được.  
  - [ ] Dữ liệu hiển thị đầy đủ, không bị format sai lệch số liệu.
- **Trải Nghiệm & Ổn Định (UX & Stability):**  
  - [ ] Phím cứng Android Back quay về đúng màn hình trước đó trong lịch sử.  
  - [ ] Không có hiện tượng giật lag, đơ màn hình (ANR) hoặc màn hình đỏ.

---

## 5. BẰNG CHỨNG KIỂM THỬ (TEST EVIDENCE)

- **Ảnh Chụp Màn Hình (Screenshots):**  
  - `Ảnh 1: [Mô tả bước thực hiện]` (Lưu tại thư mục quy định, che mờ thông tin nhạy cảm)  
  - `Ảnh 2: [Mô tả kết quả màn hình thành công]`
- **Ghi Chú Nhật Ký (Audit Notes):**  
  [Ghi chú thêm về mã phản hồi HTTP hoặc phản hồi đặc thù nếu có]

---

## 6. KẾT LUẬN & KÝ DUYỆT (VERDICT & SIGN-OFF)

- **Đánh Giá Cuối Cùng (Final Verdict):** `PASS` / `FAIL` / `BLOCKED` / `NOT RUN`
- **Liên Kết Lỗi Nếu Có (Defect Link):** `[Mã Defect DEF-UAT-XX nếu FAIL]`
- **Chữ Ký Chuyên Viên Kiểm Thử (Tester Sign-Off):**  
  *Người kiểm thử xác nhận:* ____________________  
  *Ngày ký duyệt:* ____________________
