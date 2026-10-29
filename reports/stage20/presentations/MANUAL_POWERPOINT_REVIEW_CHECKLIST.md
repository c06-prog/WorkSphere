# MANUAL POWERPOINT REVIEW CHECKLIST
## WorkSphere Four-Course Presentation Decks — Stage 20F Final Quality Review
**Audit Classification**: `STRUCTURAL_AND_GEOMETRY_VALIDATED_ONLY`  
**Execution Marker**: `ROADMAP_STAGE_20F_MANUAL_RENDER_REVIEW_REQUIRED`

---

### 1. BỐI CẢNH VÀ LÝ DO CẦN ĐỐI SOÁT THỦ CÔNG
- **Hiện trạng môi trường**: Môi trường Windows host hiện tại không cài đặt Microsoft Office / PowerPoint (`powerpnt.exe`) hoặc LibreOffice (`soffice.exe`), và không có headless converter tin cậy được cài sẵn.
- **Xác minh kỹ thuật**: Thư viện `python-pptx` đã hoàn thành kiểm toán cấu trúc hình học, tọa độ khung hình chữ nhật (0 lỗi tràn lề), và đối soát 100% hợp đồng Speaker Notes trên tất cả 65 slide.
- **Yêu cầu đối soát thực tế**: Để đảm bảo trải nghiệm bảo vệ trực quan hoàn hảo nhất trên máy chiếu của Hội đồng, sinh viên / nhóm thực hiện cần mở trực tiếp 4 tệp PPTX bằng phần mềm Microsoft PowerPoint và thực hiện theo danh mục kiểm tra thủ công dưới đây trước buổi bảo vệ.

---

### 2. DANH MỤC CÁC BỘ SLIDE CẦN ĐỐI SOÁT

1. **Deck 1**: `reports/stage20/presentations/01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` (18 slides)
2. **Deck 2**: `reports/stage20/presentations/02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` (15 slides)
3. **Deck 3**: `reports/stage20/presentations/03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` (12 slides)
4. **Deck 4**: `reports/stage20/presentations/04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` (20 slides)

---

### 3. TIÊU CHÍ KIỂM TRA CHI TIẾT (STEP-BY-STEP CHECKLIST)

| STT | Hạng mục kiểm tra | Chi tiết kiểm tra | Trạng thái (Chờ sinh viên đánh dấu) | Ghi chú phát hiện / Điều chỉnh |
|:---:|:---|:---|:---:|:---|
| 1 | **Mở tệp và tải font chữ** | Mở từng tệp PPTX trong Microsoft PowerPoint chính thức. Kiểm tra font chữ (Segoe UI / Calibri / Arial), bảo đảm không có hiện tượng font substitution (thay thế font lạ). | [ ] Chờ kiểm tra | |
| 2 | **Kiểm tra hiển thị Tiếng Việt** | Kiểm tra toàn bộ tiêu đề, nội dung thẻ phân tầng và nhãn sơ đồ, bảo đảm không lỗi dấu Unicode (bể font, mất dấu hỏi/ngã/nặng/ư/ơ). | [ ] Chờ kiểm tra | |
| 3 | **Tràn văn bản & Cắt chữ (Text Clipping)** | Duyệt từng slide ở chế độ Normal View, kiểm tra xem có dòng chữ nào bị tràn khỏi khung hộp (card box) hoặc bị cắt mất đuôi chữ không. | [ ] Chờ kiểm tra | |
| 4 | **Độ nét và Tỷ lệ hình ảnh (Image Distortion)** | Kiểm tra 22 sơ đồ kỹ thuật và mockup ảnh chụp màn hình UI. Đảm bảo ảnh sắc nét, đúng tỷ lệ khung hình (aspect ratio), không bị méo ngang/dọc. | [ ] Chờ kiểm tra | |
| 5 | **Độ tương phản màu sắc (Contrast)** | Kiểm tra độ tương phản giữa màu chữ trắng/xám và nền xanh Navy / Slate, bảo đảm dễ đọc trong điều kiện ánh sáng mạnh hoặc máy chiếu hội trường. | [ ] Chờ kiểm tra | |
| 6 | **Chế độ xem Ghi chú (Notes View)** | Chuyển sang Notes View hoặc Presenter View, kiểm tra ghi chú thuyết minh hiển thị đủ 8 mục (Mục tiêu, Lời thuyết minh, Thời lượng, Người nói, Minh chứng, Câu hỏi, Câu trả lời, Chuyển ý). | [ ] Chờ kiểm tra | |
| 7 | **Trình chiếu toàn màn hình (Slide Show)** | Chạy F5 (Slide Show), kiểm tra chuyển slide mượt mà, layout không bị nhảy vị trí, không có lỗi hiển thị bất thường. | [ ] Chờ kiểm tra | |
| 8 | **Đọc thử trên màn hình phụ / Máy chiếu** | Chiếu thử lên màn hình ngoài hoặc máy chiếu với độ phân giải Full HD (1920×1080) để kiểm tra khả năng đọc được của chữ cỡ nhỏ nhất (từ 12pt trở lên). | [ ] Chờ kiểm tra | |

---

### 4. BIÊN BẢN GHI NHẬN ĐỐI SOÁT THỦ CÔNG (REVIEW LOG)

> *(Sinh viên / Nhóm thực hiện điền thông tin sau khi mở và rà soát thực tế trên PowerPoint)*

- **Người thực hiện rà soát**: `[Họ và tên sinh viên / Mã SV]`
- **Ngày thực hiện**: `[YYYY-MM-DD]`
- **Phiên bản Microsoft PowerPoint sử dụng**: `[PowerPoint 2021 / Office 365 / Khác]`
- **Kết quả rà soát chi tiết**:
  - Deck 1 (Lập trình nâng cao): `[ ĐẠT / CẦN CHỈNH SỬA ]`
  - Deck 2 (Ứng dụng di động): `[ ĐẠT / CẦN CHỈNH SỬA ]`
  - Deck 3 (Quản lý dự án CNTT): `[ ĐẠT / CẦN CHỈNH SỬA ]`
  - Deck 4 (Triển khai phần mềm): `[ ĐẠT / CẦN CHỈNH SỬA ]`
- **Kết luận chung**: `[ ] CHÍNH THỨC SẴN SÀNG CHO BUỔI BẢO VỆ ĐỒ ÁN`
