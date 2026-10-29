# MANUAL POWERPOINT REVIEW CHECKLIST
## WorkSphere Four-Course Presentation Decks — Stage 20F Final Quality Review
**Audit Classification**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`
**Manual Render Status**: `NOT_YET_VERIFIED`
**Execution Marker**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`

---

### 1. BỐI CẢNH VÀ LÝ DO CẦN ĐỐI SOÁT THỦ CÔNG
- **Hiện trạng môi trường**: Môi trường Windows host tự động không cài đặt Microsoft Office / PowerPoint (`powerpnt.exe`) hoặc LibreOffice (`soffice.exe`), và không có headless converter tin cậy được cài sẵn. PowerPoint COM dispatch không khả dụng.
- **Xác minh kỹ thuật tự động đã thực hiện**:
  - 4 tệp presentation (.pptx) tồn tại hợp lệ trên đĩa.
  - Toàn bộ 65 slides được thư viện `python-pptx` phân tích cấu trúc thành công.
  - Kiểm toán hình học đạt chuẩn 16:9 widescreen (0 lỗi tràn lề - zero overflow defects).
  - Quan hệ liên kết hình ảnh (media relationships) phân giải toàn vẹn (22 sơ đồ/ảnh minh chứng tồn tại).
  - 100% (65/65 slide) sở hữu Presenter Notes XML với đầy đủ 8 trường hợp đồng.
  - Các sửa đổi sự kiện kỹ thuật (PostgreSQL 15, Spring Security, TypeScript trong `mobile/src`, CI DAG) đã được áp dụng.
  - Thời lượng thuyết minh đã được tính toán lại theo mô hình diễn ngôn an toàn (`PROJECT_PROPOSAL`, `REHEARSAL_MEASUREMENT_PENDING`).
- **Yêu cầu đối soát thực tế từ Người dùng (User Review Required)**: Để đảm bảo trải nghiệm bảo vệ trực quan hoàn hảo nhất trên máy chiếu của Hội đồng, người dùng / sinh viên cần mở trực tiếp 4 tệp PPTX bằng phần mềm Microsoft PowerPoint hoặc PowerPoint for the Web và thực hiện theo danh mục kiểm tra thủ công dưới đây trước buổi bảo vệ.

---

### 2. DANH MỤC CÁC BỘ SLIDE CẦN ĐỐI SOÁT

1. **Deck 1**: `reports/stage20/presentations/01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` (18 slides)
2. **Deck 2**: `reports/stage20/presentations/02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` (15 slides)
3. **Deck 3**: `reports/stage20/presentations/03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` (12 slides)
4. **Deck 4**: `reports/stage20/presentations/04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` (20 slides)

---

### 3. TIÊU CHÍ KIỂM TRA CHI TIẾT (STEP-BY-STEP CHECKLIST — CHỜ NGƯỜI DÙNG XÁC NHẬN)

| STT | Hạng mục kiểm tra | Chi tiết kiểm tra | Trạng thái đối soát | Ghi chú phát hiện / Kết quả thực tế |
|:---:|:---|:---|:---:|:---|
| 1 | **Mở tệp và tải font chữ** | Mở từng tệp PPTX trong Microsoft PowerPoint. Kiểm tra font chữ (Segoe UI / Calibri / Arial), bảo đảm không có hiện tượng font substitution. | [ ] USER_TO_COMPLETE | |
| 2 | **Kiểm tra hiển thị Tiếng Việt** | Kiểm tra toàn bộ tiêu đề, nội dung thẻ phân tầng và nhãn sơ đồ, bảo đảm không lỗi dấu Unicode (bể font, mất dấu hỏi/ngã/nặng/ư/ơ). | [ ] USER_TO_COMPLETE | |
| 3 | **Tràn văn bản & Cắt chữ (Text Clipping)** | Duyệt từng slide ở chế độ Normal View, kiểm tra xem có dòng chữ nào bị tràn khỏi khung hộp (card box) hoặc bị cắt mất đuôi chữ không. | [ ] USER_TO_COMPLETE | |
| 4 | **Độ nét và Tỷ lệ hình ảnh (Image Distortion)** | Kiểm tra 22 sơ đồ kỹ thuật và mockup ảnh chụp màn hình UI. Đảm bảo ảnh sắc nét, đúng tỷ lệ khung hình (aspect ratio), không bị méo ngang/dọc. | [ ] USER_TO_COMPLETE | |
| 5 | **Độ tương phản màu sắc (Contrast)** | Kiểm tra độ tương phản giữa màu chữ trắng/xám và nền xanh Navy / Slate, bảo đảm dễ đọc trong điều kiện ánh sáng mạnh hoặc máy chiếu hội trường. | [ ] USER_TO_COMPLETE | |
| 6 | **Chế độ xem Ghi chú (Notes View)** | Chuyển sang Notes View hoặc Presenter View, kiểm tra ghi chú thuyết minh hiển thị đủ 8 mục (Mục tiêu, Lời thuyết minh, Thời lượng, Người nói, Minh chứng, Câu hỏi, Câu trả lời, Chuyển ý). | [ ] USER_TO_COMPLETE | |
| 7 | **Trình chiếu toàn màn hình (Slide Show)** | Chạy F5 (Slide Show), kiểm tra chuyển slide mượt mà, layout không bị nhảy vị trí, không có lỗi hiển thị bất thường. | [ ] USER_TO_COMPLETE | |
| 8 | **Đọc thử trên màn hình phụ / Máy chiếu** | Chiếu thử lên màn hình ngoài hoặc máy chiếu với độ phân giải Full HD (1920×1080) để kiểm tra khả năng đọc được của chữ cỡ nhỏ nhất (từ 12pt trở lên). | [ ] USER_TO_COMPLETE | |

---

### 4. BIÊN BẢN GHI NHẬN ĐỐI SOÁT THỦ CÔNG (REVIEW LOG)

> *(Người dùng / Sinh viên điền thông tin sau khi mở và rà soát thực tế trên PowerPoint)*

- **Người thực hiện rà soát (Reviewer)**: `USER_TO_COMPLETE`
- **Ngày thực hiện (Review date)**: `USER_TO_COMPLETE`
- **Công cụ rà soát (Review tool)**: `USER_TO_COMPLETE`
- **Kết quả rà soát chi tiết**:
  - Deck 1 (Lập trình nâng cao): `[ PENDING ]`
  - Deck 2 (Ứng dụng di động): `[ PENDING ]`
  - Deck 3 (Quản lý dự án CNTT): `[ PENDING ]`
  - Deck 4 (Triển khai phần mềm): `[ PENDING ]`
- **Kết luận chung (Overall result)**: `PENDING`
