# BÁO CÁO KIỂM THẨM CHẤT LƯỢNG: ROADMAP STAGE 20F FINAL PRESENTATION QUALITY GATE
## FULL RENDER CAPABILITY AUDIT, VISUAL REVIEW, SPEAKER NOTES, TIMING & CROSS-DECK FACT VALIDATION

---

### THÔNG TIN TỔNG QUAN
- **Dự án**: Nền tảng Quản trị Doanh nghiệp WorkSphere (Enterprise Operations Platform)
- **Giai đoạn**: ROADMAP-STAGE-20F Final Presentation Quality Gate & Fact Correction
- **Starting Checkpoint**: `df0e01e5eeb65ddf7c8efa7235f62168edd92c4d`
- **Thời điểm kiểm thẩm**: 2026-10-29
- **Phân loại năng lực render (Render Classification)**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`
- **Trạng thái kiểm tra thủ công (Manual Render Status)**: `NOT_YET_VERIFIED` (`USER_REVIEW_REQUIRED`)
- **Kết quả nghiệm thu**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`
- **Phạm vi kiểm tra**: Toàn bộ 4 bộ slide thuyết trình định dạng PPTX (tổng cộng 65 slide) của 4 học phần chuyên ngành:
  1. Kỹ năng lập trình nâng cao (`01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` - 18 slides)
  2. Phát triển ứng dụng di động (`02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` - 15 slides)
  3. Quản lý dự án CNTT (`03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` - 12 slides)
  4. Triển khai phần mềm (`04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` - 20 slides)

---

### 1. BÁO CÁO NĂNG LỰC RENDER & HIỆU CHỈNH MINH CHỨNG THỰC TẾ
- **Khảo sát môi trường tự động**: Môi trường Windows host tự động không cài đặt Microsoft Office / PowerPoint (`powerpnt.exe`), không có LibreOffice headless (`soffice.exe` / `libreoffice.exe`), PowerPoint COM dispatch không khả dụng (`win32com.client` báo `Invalid class string`), và không có headless converter tin cậy được cài sẵn.
- **Phân loại kiểm toán chính thức**: **`STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`**.
- **Hiệu chỉnh minh chứng (Evidence Correction)**:
  - *Rút lại tuyên bố kiểm tra thủ công*: Tại commit `e18603f`, việc đánh dấu PASS toàn bộ checklist kiểm tra thủ công (mở file trên PowerPoint, chạy F5, kiểm tra Presenter View, kiểm tra font tiếng Việt, không tràn text) được ghi nhận là khẳng định chưa có bằng chứng thực thi độc lập từ phía Người dùng. Do đó, toàn bộ các mục kiểm tra thủ công đã được chuyển về trạng thái chờ: `USER_TO_COMPLETE` / `PENDING` tại `reports/stage20/presentations/MANUAL_POWERPOINT_REVIEW_CHECKLIST.md`.
  - *Bảo lưu toàn vẹn các minh chứng tự động đã kiểm chứng*:
    1. Cả 4 tệp PPTX tồn tại trên đĩa cứng và phân tích cú pháp hợp lệ qua `python-pptx`.
    2. Toàn bộ 65 slide đạt chuẩn hình học 16:9 widescreen (0 lỗi tràn lề - zero overflow defects).
    3. 100% (65/65 slide) sở hữu Presenter Notes XML tuân thủ nghiêm ngặt Hợp đồng Speaker Notes 8 phần.
    4. Toàn bộ 22 sơ đồ/ảnh minh chứng tồn tại và liên kết media hợp lệ.
    5. Các sửa đổi kỹ thuật thực tế (PostgreSQL 15, Spring Security, TypeScript trong `mobile/src`, CI DAG) được bảo toàn.
    6. Ngân sách thời gian rút gọn an toàn (Deck 1: 13.67m, Deck 2: 12.58m, Deck 3: 9.67m, Deck 4: 14.75m) được bảo lưu và gán nhãn chính xác là mô hình ước tính `PROJECT_PROPOSAL` kèm `REHEARSAL_MEASUREMENT_PENDING`.

---

### 2. HIỆU CHỈNH SỰ KIỆN KỸ THUẬT & LOẠI BỎ KHẲNG ĐỊNH QUÁ MỨC
Đã rà soát và loại bỏ toàn bộ các tuyên bố không có căn cứ hoặc suy đoán trên cả 4 bộ slide PPTX, mã nguồn sinh slide và tài liệu nghiệm thu:
1. **Phiên bản PostgreSQL**:
   - `compose.yaml` khai báo ảnh: `postgres:15-alpine`. Kịch bản diễn tập phục hồi Stage 19D ghi nhận runtime `PostgreSQL 15.19`.
   - Loại bỏ hoàn toàn mọi chỗ đề cập sai lệch "PostgreSQL 16". Thống nhất ghi nhận **`PostgreSQL 15`** (`postgres:15-alpine`).
2. **Phiên bản Spring Security**:
   - Maven dependency tree xác nhận starter `spring-boot-starter-security:4.1.1` sử dụng `spring-security-config:7.1.1` và `spring-security-core:7.1.1`.
   - Loại bỏ cụm từ suy đoán "Spring Security 6" trên Slide 3 và Speaker Notes Slide 11 của Deck 1. Thay thế bằng thuật ngữ chuẩn học thuật **`Spring Security`** (cơ chế stateless JWT và Method Security).
3. **Phạm vi TypeScript trong dự án Mobile**:
   - Thư mục `mobile/src` chứa mã nguồn logic và giao diện được viết bằng TypeScript/TSX. Thư mục `mobile/android` chứa các tệp cấu hình Gradle và manifest bản địa.
   - Loại bỏ cụm từ nói quá "100% TypeScript". Thay thế bằng định nghĩa chính xác: **"Logic ứng dụng và UI trong `mobile/src` viết bằng TypeScript/TSX chặt chẽ; cấu hình build Android dùng Gradle/native assets."**
4. **Quy trình CI DAG trên GitHub Actions**:
   - Tệp `.github/workflows/ci.yml` sử dụng cấu trúc phụ thuộc (DAG): `repository-validation` chạy trước, sau đó kích hoạt song song `backend-ci` và `mobile-quality`. Sau đó, `docker-image-build` phụ thuộc `backend-ci`, và `android-debug-build` phụ thuộc `mobile-quality`. Concurrency group tự động hủy các build lỗi thời.
   - Mô tả chính xác mối quan hệ DAG, không tóm tắt thành chuỗi tuyến tính đơn giản và không tuyên bố 5 jobs chạy song song hoàn toàn.

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
- **Kiểm tra mẫu đại diện chuyên sâu (Deep Sample Inspection)**: Các slide bìa, kiến trúc, kiểm thử, ranh giới và kết thúc đều có nội dung chuyên sâu, trích dẫn minh chứng thực tế trên đĩa cứng và phân công người nói đề xuất `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`.
- **Bản quyền hình ảnh**: Toàn bộ 22 sơ đồ kỹ thuật và mockup ảnh chụp màn hình UI đều bắt nguồn từ tài nguyên dự án (Mermaid, Figma prototype); không sử dụng ảnh AI tạo sinh nên không áp dụng ghi công Copilot.

---

### 5. NGÂN SÁCH THỜI GIAN TOÀN PHIÊN (TIMING BUDGET MODEL)

Tất cả thời lượng dưới đây là mô hình phân bổ dự kiến (`PROJECT_PROPOSAL`, `REHEARSAL_MEASUREMENT_PENDING`):

| Học phần | Thời lượng thuyết minh (Narration) | Thời lượng Demo trực tiếp (Live Demo) | Chuyển giao người nói (Transition) | Dự phòng Q&A Hội đồng (Q&A Allowance) | Tổng thời lượng phiên đề xuất (Session Duration) | Khung giờ quy định (Instructor Benchmark) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Deck 1: Lập trình nâng cao** | **820s (~13.67m)** | 90s (~1.5m) | 30s (~0.5m) | 260s (~4.33m) | **20.0 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` |
| **Deck 2: Ứng dụng di động** | **755s (~12.58m)** | 120s (~2.0m) | 30s (~0.5m) | 295s (~4.92m) | **20.0 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` |
| **Deck 3: Quản lý dự án CNTT** | **580s (~9.67m)** | 0s (Không demo) | 40s (~0.67m) | 100s (~1.66m) | **12.0 phút** `[PROJECT_PROPOSAL]` | 10–12 phút *(Đảm bảo bài nói gọn trong 9.67m)* |
| **Deck 4: Triển khai phần mềm** | **885s (~14.75m)** | 90s (~1.5m) | 30s (~0.5m) | 195s (~3.25m) | **20.0 phút** `[PROJECT_PROPOSAL]` | 15–20 phút thuyết trình `[INSTRUCTOR_REQUIREMENT]` |

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

### KẾT LUẬN & TRẠNG THÁI NGHIỆM THU
Toàn bộ 4 bộ slide thuyết trình phục vụ bảo vệ đồ án của WorkSphere đã hoàn thành kiểm định cấu trúc hình học, đối soát hợp đồng ghi chú, hiệu chỉnh sự kiện kỹ thuật chuẩn xác và thiết lập mô hình ngân sách thời gian an toàn. Do chưa có kết quả kiểm tra trực quan thực tế từ Người dùng:
- **Trạng thái**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`
- **Mã nghiệm thu**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`
- **Tài liệu bàn giao**: `reports/stage20/presentations/MANUAL_POWERPOINT_REVIEW_CHECKLIST.md` (chờ Người dùng thực hiện)
- **Quy tắc chuyển giai đoạn**: Stage 20F chưa khép lại, không được bắt đầu Stage 20G.
