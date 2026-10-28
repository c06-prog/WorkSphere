# BÁO CÁO KIỂM TOÁN CHẤT LƯỢNG VÀ BẰNG CHỨNG HỒ SƠ STAGE 20D
## HỌC PHẦN: QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (IT PROJECT MANAGEMENT) — DỰ ÁN WORKSPHERE

- **Mã kiểm toán**: `ROADMAP_STAGE_20D_FINAL_QUALITY_AND_EVIDENCE_AUDIT`
- **Mốc bắt đầu (Starting Checkpoint)**: `41ef03ebac26207e9a1f8ef3ad97aa7311dc9db4`
- **Thời điểm hoàn thành kiểm toán**: 2026-10-28T19:51:30+07:00
- **Trạng thái đóng cổng**: `ROADMAP_STAGE_20D_IT_PROJECT_MANAGEMENT_REPORT_AUDITED_READY_FOR_20E`

---

## 1. Bảng Đối Soát Mức Độ Bao Phủ Rubric (Rubric Coverage Matrix)

Tuân thủ nghiêm ngặt nguyên tắc: **Chỉ công bố mức độ bao phủ rubric (`RUBRIC_ITEMS_MAPPED = 100%`), không tự chấm điểm số tối đa (`FINAL_SCORE = INSTRUCTOR_DETERMINED`)**:

| Tiêu chí Rubric | Điểm tối đa | Vị trí trong hồ sơ | Bằng chứng đối soát chính thức | Mức bao phủ (Coverage) | Phần còn cần nhóm hoàn thiện (Missing Input) | Đánh giá (Verdict) |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **1. Tổng quan & Lựa chọn đề tài** | 10 | Chương 1 (Trang 3-4) | Bài toán thực tế, 4 mục tiêu SMART, phân tích 6 bên liên quan, vòng đời Agile/Scrum, ràng buộc | `FULLY_COVERED` | Không có | **PASSED** |
| **2. Quản lý phạm vi (Scope)** | 15 | Chương 2 (Trang 5-7) | Bản SOW chi tiết In-scope/Out-of-scope, tiêu chí nghiệm thu 5 đầu ra, WBS 3 cấp (14 gói), từ điển 5 gói tiêu biểu, quy trình & case đổi phạm vi | `FULLY_COVERED` | Không có | **PASSED** |
| **3. Quản lý tiến độ (Time)** | 15 | Chương 3 (Trang 8-10) | Danh mục 14 hoạt động, PERT 3 điểm, mạng PDM, CPM Forward/Backward pass, đường găng 51 ngày, Gantt, case nén tiến độ (Fast Tracking & Crashing) | `FULLY_COVERED` | Không có | **PASSED** |
| **4. Quản lý nhân sự (HR)** | 15 | Chương 4 (Trang 11-13) | Sơ đồ tổ chức 4 vai trò đề xuất, ma trận kỹ năng, RACI 14 gói đúng chuẩn (mỗi gói 1 A), biểu đồ tải tuần (ngưỡng 25h), case điều hòa tải Tuần 3, phát triển nhóm theo Herzberg | `FULLY_COVERED` | Không có | **PASSED** |
| **5. Hồ sơ & Thuyết trình nhóm** | 15 | Toàn bộ hồ sơ | Đủ file DOCX, PDF (15 trang), Excel tính toán có công thức thực, ảnh sơ đồ nét, thống nhất mã hiệu WBS/Activity, đề cương slide 10 trang | `FULLY_COVERED` | Slide thuyết trình trình chiếu thực tế | **PASSED** |
| **6. Đóng góp & Vấn đáp cá nhân** | 30 | Phụ lục 1..3 | Bảng phân công nhiệm vụ đề xuất, biểu mẫu biên bản họp và nhật ký cá nhân | `TEMPLATE_ONLY` | Nhóm cần điền ngày giờ họp thực tế, chữ ký xác nhận và nhật ký cá nhân minh bạch | **PASSED_AS_TEMPLATE** |

---

## 2. Kiểm Toán Phân Loại Bằng Chứng Lịch Sử (Historical Evidence Classification)

Toàn bộ các dữ kiện trong hồ sơ đã được rà soát và gán nhãn phân loại chính xác, tuyệt đối không để dữ liệu mô hình hóa bị trình bày như lịch sử có thật:

| Hạng mục dữ liệu | Phân loại bằng chứng (Classification) | Căn cứ xác minh & Ghi chú |
| :--- | :--- | :--- |
| **Hiện trạng kỹ thuật sản phẩm (Màn hình Mobile, Tests, API, Docker)** | `HISTORICAL_EVIDENCE` / `RECONSTRUCTED_FROM_GIT` | Khớp 100% với Git history (29 màn hình Mobile, 129 test suites / 1,144 Jest tests, PostgreSQL Flyway V1..V12). |
| **Tình trạng dự án khai báo** | `TECHNICAL_IMPLEMENTATION_SUBSTANTIALLY_COMPLETE / ACADEMIC_DOCUMENTATION_AND_ACCEPTANCE_IN_PROGRESS` | Khai báo trung thực: phần kỹ thuật đã hoàn thành cơ bản, đang làm hồ sơ học thuật và hoàn tất nghiệm thu; không bị trừ 20% điểm. |
| **Ước lượng PERT 3 điểm (O, M, P, TE, Variance)** | `PROJECT_PLAN_MODEL` | Mô hình lập kế hoạch học thuật, không tự bịa rằng nhóm đã ghi chép O/M/P trong quá khứ. |
| **Mạng PDM, Tính toán CPM & Đường găng 51 ngày** | `PROJECT_PLAN_MODEL` | Mô hình tính toán tiến độ chuẩn xác, liên kết chặt chẽ với các gói WBS. |
| **Biểu đồ Gantt & Ngày làm việc** | `PROJECT_PLAN_MODEL` | Ngày làm việc mô hình hóa (work days 0..51), không tự tạo ngày lịch giả xung đột với Git. |
| **Bảng tải nhân sự tuần & Ngưỡng 25h/tuần** | `PROJECT_PLAN_MODEL` / `PROJECT_PROPOSAL` | Kế hoạch phân bổ tải học thuật, không mạo nhận là bảng chấm công timesheet thực tế. |
| **Cơ cấu tổ chức & Vai trò chuyên môn** | `PROPOSED_PROJECT_ROLE` | Đề xuất vai trò dự án cho 4 thành viên; nhóm trưởng chính thức của học phần là Nguyễn Minh Hiếu (BIT247729). |
| **Tỷ lệ phần trăm đóng góp làm bài giữa kỳ** | `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` | Tỷ lệ đề xuất 25% mỗi thành viên mang tính định hướng, chờ Người dùng và Nhóm phê duyệt chính thức. |
| **Biên bản họp nhóm định kỳ (Biên bản 01, 02)** | `TEMPLATE_REQUIRES_TEAM_COMPLETION` | Đã chuyển đổi thành Biểu mẫu chuẩn hóa (có placeholder `[Nhóm điền]`), không tự bịa biên bản họp hay chữ ký giả. |
| **Nhật ký công việc cá nhân** | `TEMPLATE_REQUIRES_TEAM_COMPLETION` | Đã chuyển đổi thành Biểu mẫu chuẩn hóa, sẵn sàng để từng sinh viên tự điền minh chứng thực tế. |

---

## 3. Kiểm Toán Tính Nhất Quán Trong Tính Toán (Calculation Consistency Audit)

Đã thực hiện kiểm tra chéo độc lập giữa tệp bảng tính Excel [`WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx`](file:///d:/WorkSphere/reports/stage20/it-project-management/WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx), mã nguồn Python, tài liệu Markdown, báo cáo DOCX và sơ đồ mạng:

1. **Công thức PERT**:
   - Cột H trong Excel: công thức thực `=(E{r}+4*F{r}+G{r})/6`.
   - Cột I trong Excel: công thức thực `=((G{r}-E{r})/6)^2`.
   - Toàn bộ 14 hoạt động thỏa mãn $O \le M \le P$, đơn vị tính nhất quán là ngày làm việc (work days).
2. **Tính toán đường găng CPM**:
   - Forward Pass (ES, EF): Tính từ $ES=0$, kết thúc tại $EF=51$.
   - Backward Pass (LS, LF): Tính từ $LF=51$, lùi về $LS=0$.
   - Độ dự trữ (Slack): Các hoạt động găng có $Slack = LF - EF = 0$.
   - **Đường găng xác lập**: `ACT-01 -> ACT-02 -> ACT-03 -> ACT-04 -> ACT-07 -> ACT-08 -> ACT-10 -> ACT-12 -> ACT-13 -> ACT-14`.
   - Độ dài đường găng: **Chính xác 51 ngày làm việc** (khớp 100% giữa Excel, Python, DOCX, Mermaid và Gantt chart).
3. **Cân đối tải nhân sự (Weekly Workload)**:
   - Cột Tổng giờ trong Excel: công thức thực `=SUM(D{r}:J{r})`.
   - Hàng Tổng cộng cả nhóm: công thức thực `=SUM(col2:col5)`.
   - Tổng giờ công toàn dự án: **477 giờ công** phân bổ trong 7 tuần, không có thành viên nào vượt ngưỡng 25h/tuần sau khi áp dụng điều hòa nguồn lực.

---

## 4. Kiểm Định Bố Cục Trang Báo Cáo (Page Review)

- **Quy mô trang kết xuất PDF**: **Đúng 15 trang** (xác nhận trực tiếp bằng `pypdf`).
- Phân bổ số trang:
  - Trang bìa và thông tin nhóm: Trang 1.
  - Mục lục và Bảng đối chiếu Rubric: Trang 2.
  - Nội dung chính (Chương 1 đến Chương 5): Trang 3–14 (Đúng 12 trang nội dung chính, nằm hoàn hảo trong khung 12–20 trang theo quy định của Giảng viên).
  - Phụ lục minh chứng & Biểu mẫu: Trang 15.
- Không có trang trắng thừa, bảng biểu căn lề đẹp mắt, biểu đồ Gantt và Histogram hiển thị sắc nét.

---

## 5. Kết Luận Kiểm Định Cổng Chất Lượng

Hồ sơ báo cáo Quản lý dự án CNTT WorkSphere đã vượt qua toàn bộ các tiêu chí kiểm toán chất lượng và bằng chứng. Hồ sơ minh bạch về nguồn gốc dữ liệu, công thức tính toán chuẩn xác, đồng bộ 100% giữa các định dạng (DOCX, PDF, XLSX, MD, MMD) và sẵn sàng chuyển giao sang **Stage 20E**.

**Trạng thái đóng cổng**: `ROADMAP_STAGE_20D_IT_PROJECT_MANAGEMENT_REPORT_AUDITED_READY_FOR_20E`
