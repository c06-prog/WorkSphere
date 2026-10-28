# WorkSphere Stage 20B — Báo Cáo Nghiệm Thu Môn Kỹ Năng Lập Trình Nâng Cao

**Giai đoạn lộ trình:** ROADMAP STAGE 20B — ADVANCED PROGRAMMING REPORT (KỸ NĂNG LẬP TRÌNH NÂNG CAO)
**Trạng thái nghiệm thu:** `ROADMAP_STAGE_20B_ADVANCED_PROGRAMMING_REPORT_COMPLETE_READY_FOR_20C`
**Starting Checkpoint:** `fbd3a2b6f3e5d5032016e66566330178435fade0`
**Ngày thực hiện:** 28/10/2026

---

## 1. TỔNG QUAN KẾT QUẢ GIAI ĐOẠN 20B

Giai đoạn Roadmap Stage 20B đã hoàn thành việc xây dựng toàn bộ hồ sơ báo cáo học thuật chuyên sâu cho môn học **Kỹ năng lập trình nâng cao** (Trường Đại học CMC, Khoa Công nghệ Thông tin) dựa trên dự án WorkSphere và 9 slide bài giảng chính thức:

### Các sản phẩm thành phẩm được tạo lập:
1. **Tài liệu nguồn Markdown được theo dõi phiên bản**:
   `reports/stage20/advanced-programming/ADVANCED_PROGRAMMING_REPORT_SOURCE.md`
   - Dung lượng: **~68,800 ký tự**, **~12,500 từ**, bao quát 11 chương chính và 2 phần chuyên đề mở rộng sâu.
2. **Tài liệu báo cáo Word hoàn chỉnh (Định dạng học thuật chuẩn)**:
   `reports/stage20/advanced-programming/BAO_CAO_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.docx`
   - Dung lượng: **~608 KB**.
   - Cấu trúc: Trang bìa chuẩn đại học, Trang thông tin thành viên, Bảng phân công chi tiết, Lời mở đầu, Mục lục, Danh mục hình ảnh, Danh mục bảng biểu, Danh mục từ viết tắt, 11 Chương nội dung chính, 2 Phần mở rộng chuyên sâu (SOLID, Design Patterns, Transaction Demarcation, Domain Deep Dive), Kết luận, Tài liệu tham khảo, và Phụ lục A (351 tests) / Phụ lục B (17 Flyway migrations).
   - Trang ước tính thực tế: **~62–65 trang** (đáp ứng trọn vẹn ngân sách 60–70 trang yêu cầu).
   - Định dạng: Font Arial chuẩn, khoảng cách dòng 1.2, bảng biểu kẻ viền phân màu zebra hiện đại, khối mã nguồn (code blocks) thụt lề đóng khung Consolas, đánh số trang tự động ở Footer góc phải.
3. **Thư mục lưu trữ sơ đồ kỹ thuật gốc**:
   `reports/stage20/advanced-programming/diagrams/`
   - `fig1_system_context.png`: Sơ đồ ngữ cảnh hệ thống WorkSphere.
   - `fig2_request_lifecycle.png`: Vòng đời xử lý HTTP Request và Tầng lọc bảo mật.
   - `fig3_clean_architecture.png`: Kiến trúc phân tầng Clean Architecture (Hexagonal-lite).
   - `fig4_testing_pyramid.png`: Kim tự tháp kiểm thử 3 tầng (351 Backend Tests).

---

## 2. DANH SÁCH THÀNH VIÊN VÀ TRẠNG THÁI PHÂN CÔNG

Trạng thái phân công được gắn nhãn minh bạch: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` (Chờ Người dùng phê duyệt chính thức):

| STT | Họ và Tên | Mã Sinh Viên | Vai trò đề xuất | Trách nhiệm chuyên môn chính trong báo cáo |
|:---:|:---|:---:|:---|:---|
| 1 | **Nguyễn Minh Hiếu** | **BIT247729** | **Nhóm trưởng (Team Leader)** | Kiến trúc sư hệ thống, Tổng quan dự án, Kiến trúc Modular Monolith & Kết luận |
| 2 | **Nguyễn Văn Cường** | **BIT240048** | Thành viên | Kỹ sư Backend, Spring MVC, RESTful Web Services & Domain Workflows |
| 3 | **Hoàng Bảo Long** | **BIT240142** | Thành viên | Kỹ sư Bảo mật & Mobile, Spring Security, Stateless JWT & Phân quyền RBAC |
| 4 | **Vũ Thị Thu Hướng** | **BIT240113** | Thành viên | Kỹ sư Cơ sở dữ liệu & QA, Spring Data JPA, Flyway Migrations & Toàn vẹn dữ liệu |
| 5 | **Nguyễn Đức Khiêm** | **BIT240125** | Thành viên | Kỹ sư DevOps & Vận hành, IoC/AOP Proxy, Request Correlation & Testing Strategy |

---

## 3. BẢNG ĐỐI SOÁT CHUẨN MỰC KỸ THUẬT VÀ DỮ KIỆN MÃ NGUỒN

Báo cáo tuân thủ tuyệt đối các ranh giới sự thật đã được kiểm toán:
- **Công nghệ nền tảng**: Java 21 LTS, Spring Boot 4.1.1.
- **Cơ sở dữ liệu & Flyway**: PostgreSQL 15-alpine, đúng **17 migrations (`V001` đến `V017`)**.
- **Kiểm thử tự động**: Đúng **351 tests backend pass 100%**, Checkstyle **0 vi phạm**.
- **Vai trò chuẩn**: Đúng 4 vai trò canonical `EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN` (tuyệt đối không xuất hiện `SUPER_ADMIN` hay `MANAGER`).
- **Request Correlation**: Sử dụng header `X-Request-ID`, MDC key `requestId`, và trường `traceId` trong `ApiResponse<T>`.
- **AOP & Proxy**: Khẳng định trung thực hệ thống không sử dụng custom `@Aspect`, mà sử dụng `RequestCorrelationFilter` (Servlet Filter) cho cross-cutting logging và Spring AOP dynamic proxy cho `@Transactional`.
- **Giám sát & Triển khai**: Actuator Prometheus chỉ mở nội bộ; Staging và Production chưa triển khai; UAT chưa thực thi ngoài đời thực.

---

## 4. BẢO TOÀN DỮ LIỆU & QUY CHUẨN AN TOÀN

- Bốn thư mục học liệu gốc (`Kỹ năng lập trình nâng cao`, `phát triển ứng dụng di động`, `Quản lý dự án CNTT`, `Triển khai phần mềm`) được giữ nguyên vẹn, untracked và **KHÔNG commit vào Git** (`LOCAL_ONLY_REFERENCE`).
- Không có bất kỳ thay đổi nào vào mã nguồn nghiệp vụ của Backend hay Mobile.
- Không chứa mật khẩu thật, JWT secret, token hay đường dẫn cá nhân người dùng Windows.

---

## 5. KẾT LUẬN & SẴN SÀNG CHO STAGE 20C

Stage 20B đã hoàn tất toàn bộ yêu cầu về nội dung, hình thức và chất lượng cho môn Kỹ năng lập trình nâng cao.

**Sẵn sàng cho Stage 20C (Báo cáo môn Phát triển ứng dụng di động):**
`ROADMAP_STAGE_20B_ADVANCED_PROGRAMMING_REPORT_COMPLETE_READY_FOR_20C`
