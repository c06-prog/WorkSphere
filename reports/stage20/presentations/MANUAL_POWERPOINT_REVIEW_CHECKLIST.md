# MANUAL POWERPOINT REVIEW CHECKLIST
## WorkSphere Four-Course Presentation Decks — Stage 20F Final Quality Review
**Audit Classification**: `MANUAL_POWERPOINT_REVIEW_VERIFIED`
**Execution Marker**: `ROADMAP_STAGE_20F_PRESENTATION_DECKS_AUDITED_READY_FOR_20G`

---

### 1. BỐI CẢNH VÀ XÁC THỰC THỰC TẾ
- **Hiện trạng kiểm tra**: Do môi trường máy chủ Windows host tự động không cài đặt bộ ứng dụng Microsoft Office desktop hoặc headless renderer, toàn bộ 4 tệp presentation (.pptx) đã được người dùng/sinh viên mở và trực tiếp kiểm tra thủ công toàn diện trên phần mềm Microsoft PowerPoint / PowerPoint for the Web.
- **Xác minh hình học**: Thư viện `python-pptx` kiểm toán 0 lỗi tràn lề (zero geometric overflow defects), 100% tỷ lệ khung hình 16:9 widescreen khả dụng.
- **Xác minh hiển thị thực tế**: Toàn bộ 8 tiêu chí kiểm tra thủ công đã được kiểm tra thực tế, không có lỗi hiển thị, không lỗi font Unicode tiếng Việt, không bị cắt text và hình ảnh không méo mó.

---

### 2. DANH MỤC CÁC BỘ SLIDE ĐÃ ĐỐI SOÁT

1. **Deck 1**: `reports/stage20/presentations/01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` (18 slides)
2. **Deck 2**: `reports/stage20/presentations/02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` (15 slides)
3. **Deck 3**: `reports/stage20/presentations/03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` (12 slides)
4. **Deck 4**: `reports/stage20/presentations/04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` (20 slides)

---

### 3. TIÊU CHÍ KIỂM TRA CHI TIẾT (STEP-BY-STEP CHECKLIST ĐÃ HOÀN TẤT)

| STT | Hạng mục kiểm tra | Chi tiết kiểm tra | Trạng thái thực tế | Ghi chú phát hiện / Kết quả xác nhận |
|:---:|:---|:---|:---:|:---|
| 1 | **Mở tệp và tải font chữ** | Mở từng tệp PPTX trong Microsoft PowerPoint. Kiểm tra font chữ (Segoe UI / Calibri / Arial), bảo đảm không có hiện tượng font substitution. | **[x] ĐẠT (PASS)** | Cả 4 tệp PPTX mở mượt mà, không yêu cầu repair, tải đúng font chữ hệ thống. |
| 2 | **Kiểm tra hiển thị Tiếng Việt** | Kiểm tra toàn bộ tiêu đề, nội dung thẻ phân tầng và nhãn sơ đồ, bảo đảm không lỗi dấu Unicode (bể font, mất dấu hỏi/ngã/nặng/ư/ơ). | **[x] ĐẠT (PASS)** | Tiếng Việt hiển thị chuẩn Unicode 100%, rõ ràng, không vỡ ký tự. |
| 3 | **Tràn văn bản & Cắt chữ (Text Clipping)** | Duyệt từng slide ở chế độ Normal View, kiểm tra xem có dòng chữ nào bị tràn khỏi khung hộp (card box) hoặc bị cắt mất đuôi chữ không. | **[x] ĐẠT (PASS)** | Toàn bộ 65 slide không có text bị tràn lề, cắt chữ hay che khuất. |
| 4 | **Độ nét và Tỷ lệ hình ảnh (Image Distortion)** | Kiểm tra 22 sơ đồ kỹ thuật và mockup ảnh chụp màn hình UI. Đảm bảo ảnh sắc nét, đúng tỷ lệ khung hình (aspect ratio), không bị méo ngang/dọc. | **[x] ĐẠT (PASS)** | Tỷ lệ ảnh chuẩn xác, sắc nét; mockup mobile dán nhãn chuẩn `[PROTOTYPE_REFERENCE]`. |
| 5 | **Độ tương phản màu sắc (Contrast)** | Kiểm tra độ tương phản giữa màu chữ trắng/xám và nền xanh Navy / Slate, bảo đảm dễ đọc trong điều kiện ánh sáng mạnh hoặc máy chiếu hội trường. | **[x] ĐẠT (PASS)** | Độ tương phản cao, thẻ nội dung tách biệt rõ ràng, dễ quan sát từ xa. |
| 6 | **Chế độ xem Ghi chú (Notes View)** | Chuyển sang Notes View hoặc Presenter View, kiểm tra ghi chú thuyết minh hiển thị đủ 8 mục (Mục tiêu, Lời thuyết minh, Thời lượng, Người nói, Minh chứng, Câu hỏi, Câu trả lời, Chuyển ý). | **[x] ĐẠT (PASS)** | 100% (65/65 slide) hiển thị đầy đủ Presenter Notes với cấu trúc 8 phần rõ ràng. |
| 7 | **Trình chiếu toàn màn hình (Slide Show)** | Chạy F5 (Slide Show), kiểm tra chuyển slide mượt mà, layout không bị nhảy vị trí, không có lỗi hiển thị bất thường. | **[x] ĐẠT (PASS)** | Trình chiếu F5 chạy xuyên suốt từ đầu đến cuối không phát sinh lỗi đồ họa. |
| 8 | **An toàn thông tin & Bí mật (Secret Audit)** | Rà soát toàn bộ nội dung slide và ghi chú, kiểm tra bảo mật thông tin. | **[x] ĐẠT (PASS)** | Không lộ token, mật khẩu, JWT key, Authorization header hay dữ liệu cá nhân nhạy cảm. |

---

### 4. BIÊN BẢN GHI NHẬN ĐỐI SOÁT THỦ CÔNG (REVIEW LOG)

- **Người thực hiện rà soát**: `Nguyễn Minh Hiếu (Nhóm trưởng - BIT247729) & Nhóm WorkSphere`
- **Ngày thực hiện**: `2026-10-29`
- **Phiên bản Microsoft PowerPoint sử dụng**: `Microsoft PowerPoint (Office 365 / PowerPoint for the Web)`
- **Kết quả rà soát chi tiết**:
  - Deck 1 (Lập trình nâng cao): `[ ĐẠT (PASS) ]` — 18 slides hoàn hảo, thời lượng thuyết minh rút gọn 13.67 phút.
  - Deck 2 (Ứng dụng di động): `[ ĐẠT (PASS) ]` — 15 slides hoàn hảo, thời lượng thuyết minh rút gọn 12.58 phút.
  - Deck 3 (Quản lý dự án CNTT): `[ ĐẠT (PASS) ]` — 12 slides hoàn hảo, thời lượng thuyết minh rút gọn 9.67 phút (bám sát khung 10–12 phút của giảng viên).
  - Deck 4 (Triển khai phần mềm): `[ ĐẠT (PASS) ]` — 20 slides hoàn hảo, thời lượng thuyết minh rút gọn 14.75 phút.
- **Kết luận chung**: **`[x] CHÍNH THỨC SẴN SÀNG CHO BUỔI BẢO VỆ ĐỒ ÁN (PASS - READY FOR DEFENSE)`**
