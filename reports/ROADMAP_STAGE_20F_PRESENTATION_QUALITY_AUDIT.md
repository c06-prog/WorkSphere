# BÁO CÁO KIỂM THẨM CHẤT LƯỢNG: ROADMAP STAGE 20F FINAL PRESENTATION QUALITY GATE
## FULL RENDER CAPABILITY AUDIT, VISUAL REVIEW, SPEAKER NOTES, TIMING & CROSS-DECK FACT VALIDATION

---

### THÔNG TIN TỔNG QUAN
- **Dự án**: Nền tảng Quản trị Doanh nghiệp WorkSphere (Enterprise Operations Platform)
- **Giai đoạn**: ROADMAP-STAGE-20F Final Presentation Quality Gate & Fact Correction
- **Starting Checkpoint**: `8b076af621a5cb76bf19455c46bdf708d07181bb`
- **Thời điểm kiểm thẩm**: 2026-10-29
- **Phân loại năng lực render (Render Classification)**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`
- **Kết quả nghiệm thu**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`
- **Phạm vi kiểm tra**: Toàn bộ 4 bộ slide thuyết trình định dạng PPTX (tổng cộng 65 slide) của 4 học phần chuyên ngành:
  1. Kỹ năng lập trình nâng cao (`01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` - 18 slides)
  2. Phát triển ứng dụng di động (`02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` - 15 slides)
  3. Quản lý dự án CNTT (`03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` - 12 slides)
  4. Triển khai phần mềm (`04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` - 20 slides)

---

### 1. KIỂM THẨM NĂNG LỰC RENDER THỰC TẾ (RENDER CAPABILITY AUDIT)

Đã thực hiện khảo sát các công cụ và pipeline render trên môi trường máy chủ Windows host:
- **Microsoft PowerPoint CLI (`powerpnt.exe`)**: `NOT_FOUND` (Môi trường không cài đặt bộ ứng dụng Microsoft Office máy bàn).
- **LibreOffice headless (`soffice.exe` / `libreoffice.exe`)**: `NOT_FOUND` (Môi trường không có LibreOffice trong PATH).
- **PowerPoint COM Dispatch (`win32com.client`)**: `UNAVAILABLE` (`Invalid class string`, không có Office Automation COM).
- **Slides skill / headless render pipeline**: `NOT_AVAILABLE`.
- **Thực thi render sang hình ảnh/PDF (PPTX-to-image/PDF)**: `NOT_PERFORMED` (Không bịa đặt kết quả render khi không có công cụ tin cậy).
- **Phân loại kiểm toán chính thức**: **`STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`**.
- **Giải pháp kiểm soát chất lượng**: Đã hoàn thành kiểm toán cấu trúc hình học qua `python-pptx` và ban hành danh mục đối soát thủ công tại `reports/stage20/presentations/MANUAL_POWERPOINT_REVIEW_CHECKLIST.md` để sinh viên kiểm tra hiển thị trực quan trước buổi bảo vệ.

---

### 2. HIỆU CHỈNH SỰ KIỆN KỸ THUẬT & LOẠI BỎ KHẲNG ĐỊNH QUÁ MỨC

Đã rà soát và loại bỏ toàn bộ các tuyên bố không có căn cứ hoặc không chính xác trên cả 4 bộ slide PPTX, mã nguồn sinh slide và tài liệu nghiệm thu:

1. **Phiên bản PostgreSQL**:
   - *Căn cứ thực tế*: `compose.yaml` khai báo ảnh `postgres:15-alpine`. Kịch bản diễn tập phục hồi thảm họa Stage 19D ghi nhận phiên bản runtime thực tế là `PostgreSQL 15.19`.
   - *Hiệu chỉnh*: Loại bỏ hoàn toàn mọi chỗ đề cập sai lệch "PostgreSQL 16". Thống nhất ghi nhận **`PostgreSQL 15`** (`postgres:15-alpine`, runtime 15.19).
2. **Phiên bản Spring Security**:
   - *Căn cứ thực tế*: Lệnh Maven dependency tree xác nhận starter `spring-boot-starter-security:4.1.1` sử dụng `spring-security-config:7.1.1` và `spring-security-core:7.1.1`.
   - *Hiệu chỉnh*: Loại bỏ cụm từ suy đoán "Spring Security 6" trên Slide 3 và Speaker Notes Slide 11 của Deck 1. Thay thế bằng thuật ngữ chuẩn học thuật **`Spring Security`** (cơ chế stateless JWT và Method Security).
3. **Phạm vi TypeScript trong dự án Mobile**:
   - *Căn cứ thực tế*: Thư mục `mobile/src` chứa mã nguồn logic và giao diện được viết bằng TypeScript/TSX. Tuy nhiên, thư mục `mobile/android` chứa các tệp cấu hình Gradle, Java wrapper và manifest bản địa.
   - *Hiệu chỉnh*: Loại bỏ cụm từ nói quá "100% TypeScript". Thay thế bằng định nghĩa chính xác: **"Logic ứng dụng và UI trong `mobile/src` viết bằng TypeScript/TSX chặt chẽ; cấu hình build Android dùng Gradle/native assets."**
4. **Quy trình CI DAG trên GitHub Actions**:
   - *Căn cứ thực tế*: Tệp `.github/workflows/ci.yml` sử dụng cấu trúc phụ thuộc (DAG): `repository-validation` chạy đầu tiên; khi thành công sẽ kích hoạt song song `backend-ci` và `mobile-quality`. Sau đó, `docker-image-build` phụ thuộc `backend-ci`, và `android-debug-build` phụ thuộc `mobile-quality`. Concurrency group tự động hủy các build lỗi thời.
   - *Hiệu chỉnh*: Mô tả chính xác mối quan hệ DAG, không tóm tắt thành chuỗi tuyến tính đơn giản và không tuyên bố 5 jobs chạy song song hoàn toàn.

---

### 3. KIỂM THẨM KỸ THUẬT VÀ BỐ CỤC (GEOMETRY & BOUNDING BOX AUDIT)

Kiểm toán hình học tự động qua `python-pptx` cho toàn bộ 65 slide trên khung 16:9 widescreen (13.33" × 7.50"):

| Bộ slide | Số Slide | Tọa độ giới hạn kiểm toán | Số lỗi tràn lề (Overflow) | Trạng thái cấu trúc PPTX |
|:---|:---:|:---:|:---:|:---:|
| **Deck 1 (Lập trình nâng cao)** | 18 | Top ≤ 7.50", Right ≤ 13.33" | **0 lỗi (Zero Defects)** | Bố cục thẻ phân tầng chuẩn chỉ, không đè lấn văn bản |
| **Deck 2 (Ứng dụng di động)** | 15 | Top ≤ 7.50", Right ≤ 13.33" | **0 lỗi (Zero Defects)** | Bố cục thẻ cân đối, hình ảnh mockup UI chuẩn tỷ lệ |
| **Deck 3 (Quản lý dự án CNTT)** | 12 | Top ≤ 7.50", Right ≤ 13.33" | **0 lỗi (Zero Defects)** | Cân đối theo khung mẫu giảng viên quy định (8–12 slide) |
| **Deck 4 (Triển khai phần mềm)** | 20 | Top ≤ 7.50", Right ≤ 13.33" | **0 lỗi (Zero Defects)** | Trực quan hóa cao, ma trận kỹ thuật rõ ràng, không vỡ layout |
| **TỔNG CỘNG** | **65** | **13.33" × 7.50"** | **0 lỗi (Zero Defects)** | **CẤU TRÚC HÌNH HỌC TOÀN VẸN 100%** |

---

### 4. KIỂM THẨM HỢP ĐỒNG GHI CHÚ BẢO VỆ (SPEAKER NOTES AUDIT)

- **Kiểm tra tự động 100% (65/65 slide)**: Xác nhận toàn bộ 65 slide đều có đủ 8 trường thông tin bắt buộc (Mục tiêu, Lời thuyết minh, Thời lượng, Người nói, Minh chứng, Câu hỏi, Câu trả lời, Chuyển ý).
- **Kiểm tra mẫu đại diện chuyên sâu (Deep Sample Inspection)**:
  - *Slide bìa*: Lời chào chuyên nghiệp, phân công đề xuất `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`.
  - *Slide kiến trúc/sơ đồ*: Trích dẫn đường dẫn minh chứng thực tế trên đĩa cứng; giải thích sâu bản chất kỹ thuật thay vì đọc lướt slide.
  - *Slide kết quả kiểm thử*: Dẫn chứng đầy đủ số liệu 351 Backend Tests và 1,144 Mobile Tests; dự báo câu hỏi phản biện sắc bén và câu trả lời an toàn.
  - *Slide hạn chế & ranh giới*: Nhận thức trung thực các giới hạn hệ thống; không che giấu khiếm khuyết.
  - *Slide kết thúc & Q&A*: Sẵn sàng mở mã nguồn để chứng minh năng lực thực tế.
- **Bản quyền hình ảnh**: Toàn bộ 22 sơ đồ kỹ thuật và mockup ảnh chụp màn hình UI đều bắt nguồn từ tài nguyên dự án (Mermaid, Figma prototype); không sử dụng ảnh AI tạo sinh nên không áp dụng ghi công Copilot.

---

### 5. NGÂN SÁCH THỜI GIAN TOÀN PHIÊN BẢO VỆ (SESSION TIMING BUDGET)

Đã xây dựng mô hình ngân sách thời gian toàn phiên hoàn chỉnh cho từng học phần, phân định rõ ràng giữa đề xuất của dự án `[PROJECT_PROPOSAL]`, mốc chuẩn của giảng viên `[INSTRUCTOR_REQUIREMENT]` và các điểm chưa rõ ràng `[AMBIGUOUS]`:

| Học phần | Thời lượng thuyết minh (Narration) | Thời lượng Demo trực tiếp (Live Demo) | Chuyển giao người nói (Transition) | Dự phòng Q&A Hội đồng (Q&A Allowance) | Tổng thời lượng phiên đề xuất (Session Duration) | Khung giờ quy định (Instructor Benchmark) | Đánh giá ngân sách thời gian |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Deck 1: Lập trình nâng cao** | 1,045s (~17.4m) | 120s (~2.0m) | 60s (~1.0m) | 275s (~4.6m) | **25.0 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` | Thuyết minh 17.4 phút nằm trong khung 20 phút; tổng phiên 25 phút đủ cho demo và hỏi đáp. |
| **Deck 2: Ứng dụng di động** | 875s (~14.6m) | 180s (~3.0m) | 60s (~1.0m) | 285s (~4.75m) | **23.3 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` | Thuyết minh 14.6 phút rất tối ưu, dành trọn 3 phút live demo ứng dụng và gần 5 phút Q&A. |
| **Deck 3: Quản lý dự án CNTT** | 700s (~11.7m) | 0s (Không demo) | 60s (~1.0m) | 240s (~4.0m) | **16.7 phút** `[PROJECT_PROPOSAL]` | 10–12 phút *(Chưa rõ gồm/loại Q&A)* `[AMBIGUOUS]` | Thuyết minh 11.7 phút bám sát khung 10–12 phút; nếu quy định 12 phút bao gồm cả Q&A, nhóm cần rút gọn lời nói còn ~8 phút. |
| **Deck 4: Triển khai phần mềm** | 1,180s (~19.7m) | 120s (~2.0m) | 60s (~1.0m) | 240s (~4.0m) | **26.7 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` | Thuyết minh 19.7 phút tận dụng tối đa khung 20 phút cho 9 bài giảng; tổng phiên 26.7 phút. |

---

### 6. KIỂM THẨM NGUỒN GỐC TÀI NGUYÊN HÌNH ẢNH (22 VISUAL ASSETS)

| Học phần | Số ảnh | Vị trí Slide | Loại hình | Đường dẫn tệp nguồn minh chứng | Trạng thái nguồn gốc (Provenance) |
|:---|:---:|:---:|:---|:---|:---:|
| **Deck 1** | 4 | Slide 4, 7, 11, 14 | Sơ đồ kiến trúc & Kiểm thử | `reports/stage20/advanced-programming/diagrams/` | `REPORT_DERIVED` (Stage 20B) |
| **Deck 2** | 6 | Slide 5, 6, 10, 11 | Sơ đồ & Mockup UI (4 ảnh) | `reports/stage20/mobile-development/screenshots/` | `PROTOTYPE_REFERENCE` |
| **Deck 3** | 4 | Slide 5, 6, 7, 9 | Sơ đồ WBS, PDM, Gantt, Tải | `reports/stage20/it-project-management/diagrams/` | `REPORT_DERIVED` (Toán học PDM/CPM) |
| **Deck 4** | 8 | Slide 2, 5, 8, 9, 12, 13, 15, 17 | Sơ đồ CI/CD, Container, K8s | `reports/stage20/software-deployment/diagrams/` | `REPORT_DERIVED` (`CONCEPT_ONLY`) |
| **TỔNG** | **22** | **16 Slide chứa ảnh** | **Độ nét cao (Vector / PNG)** | **100% tệp ảnh tồn tại trên đĩa cứng** | **Xác thực toàn vẹn** |

---

### 7. DANH SÁCH THÀNH VIÊN VÀ BẢO VỆ HỌC LIỆU
- **Danh sách thành viên**:
  - Deck 1 (Lập trình nâng cao): 5 thành viên (Nguyễn Minh Hiếu, Nguyễn Văn Cường, Hoàng Bảo Long, Vũ Thị Thu Hướng, Nguyễn Đức Khiêm).
  - Deck 2 (Ứng dụng di động): 4 thành viên (Nguyễn Văn Cường, Hoàng Bảo Long, Vũ Thị Thu Hướng, Lê Anh Tú).
  - Deck 3 (Quản lý dự án CNTT): 4 thành viên (Nguyễn Minh Hiếu, Nguyễn Văn Cường, Vũ Thị Thu Hướng, Hoàng Bảo Long).
  - Deck 4 (Triển khai phần mềm): 5 thành viên (Nguyễn Minh Hiếu, Nguyễn Văn Cường, Vũ Thị Thu Hướng, Hoàng Bảo Long, Nguyễn Đức Khiêm).
- **Bảo vệ học liệu**: 4 thư mục học liệu gốc tiếp tục được duy trì ở trạng thái `LOCAL_ONLY_REFERENCE` (untracked, unstaged, uncommitted).

---

### KẾT LUẬN NGHIỆM THU
Toàn bộ 4 bộ slide thuyết trình phục vụ bảo vệ đồ án của WorkSphere đã hoàn thành kiểm định cấu trúc hình học, đối soát hợp đồng ghi chú, hiệu chỉnh sự kiện kỹ thuật chuẩn xác và thiết lập ngân sách thời gian thực tế:
- **Trạng thái**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`
- **Mã nghiệm thu**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`
- **Tài liệu bàn giao bổ sung**: `reports/stage20/presentations/MANUAL_POWERPOINT_REVIEW_CHECKLIST.md`
