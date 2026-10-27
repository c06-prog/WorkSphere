# BIỂU MẪU BÁO CÁO LỖI NGHIỆM THU DOANH NGHIỆP (UAT DEFECT TEMPLATE)

---

## 1. THÔNG TIN ĐỊNH DANH SỰ CỐ (DEFECT HEADER)

- **Mã Sự Cố (Defect ID):** `DEF-UAT-XXXX`
- **Tiêu Đề Lỗi (Title):** [Tóm tắt ngắn gọn và rõ ràng lỗi phát sinh]
- **Kịch Bản Phát Hiện (Found in Scenario):** `UAT-XX`
- **Thời Gian Phát Hiện (Found Date):** YYYY-MM-DD HH:MM
- **Người Báo Cáo (Reporter):** [Họ tên chuyên viên kiểm thử / Stakeholder]
- **Người Phụ Trách (Assignee / Owner):** [Trưởng nhóm phát triển / Module Lead]
- **Trạng Thái Hiện Tại (Status):** `NEW` / `IN_ANALYSIS` / `IN_PROGRESS` / `RESOLVED` / `RETEST_PASSED` / `REOPENED` / `WONT_FIX`

---

## 2. PHÂN LOẠI MỨC ĐỘ & PHẠM VI ẢNH HƯỞNG (SEVERITY & IMPACT)

- **Mức Độ Nghiêm Trọng (Severity):**
  - [ ] **Severity 1 (P0 - Blocker):** Rò rỉ an ninh, sai lệch dữ liệu tài sản, lỗi crash ứng dụng, chặn hoàn toàn luồng chính của UAT.
  - [ ] **Severity 2 (P1 - Critical):** Sai lệch nghiệp vụ cốt lõi, vi phạm phân quyền RBAC, máy trạng thái chuyển đổi sai.
  - [ ] **Severity 3 (P2 - Major):** Lỗi giao diện hoặc logic phụ nhưng có phương án thay thế tạm thời (workaround).
  - [ ] **Severity 4 (P3 - Minor):** Lỗi hiển thị thẩm mỹ nhỏ, lỗi chính tả.
- **Phân Hệ Bị Ảnh Hưởng (Affected Module):**
  - [ ] `AUTH`: Đăng nhập, Phiên, RBAC, Đăng xuất
  - [ ] `PROJECT`: Dự án, Thành viên, Mốc tiến độ
  - [ ] `TASK`: Công việc, Phân công, Công việc con, Trạng thái
  - [ ] `SERVICE_REQUEST`: Yêu cầu dịch vụ, Giải quyết, Đánh giá
  - [ ] `ASSET`: Danh mục tài sản, Cấp phát, Thu hồi, Lịch sử sửa chữa
  - [ ] `NOTIFICATION`: Thông báo, Huy hiệu, Điều hướng ngữ cảnh

---

## 3. MÔI TRƯỜNG & ĐIỀU KIỆN TÁI HIỆN (ENVIRONMENT & CONTEXT)

- **Bản Build Kiểm Thử (App Build / Git Checkpoint):** `[Git Commit SHA]`
- **Thiết Bị & Hệ Điều Hành (Device & OS):** Android Emulator `Medium_Phone` (API 35) / Thiết bị thật
- **Phiên Bản Backend:** Spring Boot 3 Modular Monolith (Profile `dev`/`staging`)
- **Vai Trò Người Dùng (Actor Role):** `EMPLOYEE` / `TEAM_LEADER` / `PROJECT_MANAGER` / `ADMIN`
- **Dữ Liệu Đang Thao Tác (Test Data in Use):** `[Mã entity có tiền tố UAT-]`

---

## 4. CÁC BƯỚC TÁI HIỆN CHI TIẾT (STEPS TO REPRODUCE)

1. [Bước 1: Bắt đầu từ màn hình nào, đăng nhập bằng tài khoản gì]
2. [Bước 2: Thao tác bấm nút hoặc nhập liệu gì]
3. [Bước 3: Nhập dữ liệu cụ thể nào]
4. [Bước 4: Bấm nút xác nhận / gửi yêu cầu]

---

## 5. KẾT QUẢ THỰC TẾ & KẾT QUẢ MONG ĐỢI (ACTUAL VS EXPECTED)

- **Kết Quả Mong Đợi (Expected Result):**  
  [Mô tả chính xác hành vi hệ thống và phản hồi nghiệp vụ đúng theo tài liệu]

- **Kết Quả Thực Tế (Actual Result):**  
  [Mô tả chính xác những gì đã xảy ra trên giao diện hoặc phản hồi từ máy chủ]

- **Tỷ Lệ Tái Hiện (Reproducibility):**  
  `100% (Luôn xảy ra)` / `Thỉnh thoảng (> 50%)` / `Hiếm khi (< 10%)`

---

## 6. BẰNG CHỨNG LỖI (DEFECT EVIDENCE)

- **Ảnh chụp màn hình lỗi (Screenshot):** `[Đường dẫn ảnh đã che mờ thông tin bí mật]`
- **Thông điệp lỗi trên UI (Error Banner Text):** `[Nội dung hiển thị trên banner]`
- **Mã lỗi Backend / Logcat trích xuất (Error Log snippet):**  
  ```text
  [Trích xuất tối đa 10 dòng lỗi liên quan trực tiếp, không chứa token hay password]
  ```

---

## 7. QUY TRÌNH SỬA CHỮA & KIỂM TRA LẠI (RESOLUTION & RETEST)

- **Nguyên Nhân Gốc Rễ (Root Cause):**  
  [Lập trình viên phụ trách điền sau khi phân tích mã nguồn]
- **Mã Commit Bản Vá (Fix Commit SHA):** `[Git Commit SHA của bản vá]`
- **Kiểm Thử Hồi Quy Bổ Sung (Regression Suite Re-run):**  
  [Xác nhận kết quả chạy lại test suite tự động liên quan]
- **Kết Quả Kiểm Tra Lại Trên Thiết Bị (Retest on Device):**  
  - Ngày kiểm tra lại: YYYY-MM-DD  
  - Người kiểm tra lại: ____________________  
  - Kết quả kiểm tra lại: `PASS (Đóng lỗi)` / `FAIL (Mở lại lỗi)`
