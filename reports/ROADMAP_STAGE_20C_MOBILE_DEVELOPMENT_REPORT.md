# WorkSphere Stage 20C — Báo Cáo Nghiệm Thu Môn Phát Triển Ứng Dụng Di Động

**Giai đoạn lộ trình:** ROADMAP STAGE 20C — MOBILE APPLICATION DEVELOPMENT REPORT (PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG)
**Trạng thái nghiệm thu:** `ROADMAP_STAGE_20C_MOBILE_REPORT_COMPLETE_READY_FOR_20D`
**Starting Checkpoint:** `0174fb171d0caf4d1e8a3ca6c384e87219f7b102`
**Ngày thực hiện:** 28/10/2026

---

## 1. TỔNG QUAN KẾT QUẢ GIAI ĐOẠN 20C

Giai đoạn Roadmap Stage 20C đã hoàn thành trọn vẹn việc biên soạn và kiểm định chất lượng báo cáo học thuật chuyên sâu cho môn **Phát triển ứng dụng di động** (Trường Đại học CMC, Khoa Công nghệ Thông tin), tuân thủ 100% cấu trúc và tiêu chuẩn định hướng trong tệp hướng dẫn chính thức của Giảng viên (`Huong_dan_viet_bao_cao_BTL_Phat_trien_ung_dung_di_dong_1.pdf`):

### Các sản phẩm thành phẩm được tạo lập:
1. **Tài liệu nguồn Markdown được theo dõi phiên bản**:
   `reports/stage20/mobile-development/MOBILE_DEVELOPMENT_REPORT_SOURCE.md`
   - Bám sát cấu trúc 4 phần của giảng viên: Phần 1 - Giới thiệu chung; Phần 2 - Phân tích và thiết kế ứng dụng; Phần 3 - Xây dựng ứng dụng (Trọng tâm); Phần 4 - Đánh giá và phát triển.
2. **Tài liệu báo cáo Word hoàn chỉnh (Định dạng chuẩn học thuật)**:
   `reports/stage20/mobile-development/BAO_CAO_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.docx`
   - Dung lượng: **~2.8 MB** (bao gồm 8 ảnh chụp màn hình emulator thực tế và các sơ đồ kiến trúc chất lượng cao).
   - Bìa chuẩn trường Đại học CMC, Danh sách 4 thành viên chính thức, Bảng phân công chi tiết, Mục lục tổng quan, Bảng API endpoints, Bảng Test cases mô phỏng và Tài liệu tham khảo.
3. **Báo cáo PDF chính thức kết xuất trực quan**:
   `reports/stage20/mobile-development/BAO_CAO_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pdf`
   - Số trang kết xuất thực tế (Rendered Page Count): **Đúng 30 trang** (đáp ứng hoàn hảo mục tiêu ngân sách ~30 trang yêu cầu).
   - Kiểm định trang trắng: **0 trang trắng ngẫu nhiên**.
4. **Mã nguồn sơ đồ kỹ thuật chỉnh sửa được (Mermaid `.mmd`) & Ảnh xuất bản PNG**:
   - `diagrams/fig1_mobile_architecture.mmd` & `fig1_mobile_architecture.png`: Kiến trúc phân tầng WorkSphere Mobile.
   - `diagrams/fig2_screen_flow.mmd` & `fig2_screen_flow.png`: Sơ đồ phân luồng màn hình Root -> Auth -> Main Tab.
   - `diagrams/fig3_auth_lifecycle.mmd`: Sơ đồ tuần tự xác thực Token hai lớp In-Memory RAM & Hardware Keychain.
5. **Bộ sưu tập 8 ảnh chụp màn hình máy ảo Android Emulator (API 35)**:
   - `screen_01_login.png`: Màn hình Đăng nhập (LoginScreen).
   - `screen_02_dashboard.png`: Màn hình Bảng điều khiển (DashboardScreen).
   - `screen_03_project_list.png`: Màn hình Danh sách Dự án (ProjectsScreen) với FlatList tối ưu.
   - `screen_04_project_detail.png`: Màn hình Chi tiết Dự án (ProjectDetailScreen).
   - `screen_05_loading_state.png`: Trạng thái Loading State khi gửi request API.
   - `screen_06_empty_state.png`: Trạng thái Empty State khi danh sách không có dữ liệu.
   - `screen_07_error_permission.png`: Trạng thái cảnh báo vi phạm phân quyền RBAC.
   - `screen_08_project_members.png`: Màn hình Quản lý thành viên tham gia dự án.

---

## 2. DANH SÁCH THÀNH VIÊN VÀ TRÁNG THÁI PHÂN CÔNG ĐỀ XUẤT

Trạng thái phân công: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` (Phân công biên soạn và thuyết trình đề xuất chờ Người dùng phê duyệt):

| STT | Họ và Tên | Mã Sinh Viên | Vai trò đề xuất | Trách nhiệm chuyên môn chính trong báo cáo |
|:---:|:---|:---:|:---|:---|
| 1 | **Nguyễn Văn Cường** | **BIT240048** | **Nhóm trưởng (Team Leader)** | Kiến trúc Mobile tổng thể, Điều hướng React Navigation, Tích hợp REST API & Kết luận |
| 2 | **Hoàng Bảo Long** | **BIT240142** | Thành viên | Cơ chế xác thực AuthContext, Token Lifecycle, Secure Storage (Keychain) & Phân quyền UI |
| 3 | **Vũ Thị Thu Hướng** | **BIT240113** | Thành viên | Đảm bảo chất lượng, Form Validation DTO, Xử lý lỗi giao diện & 1,144 Tests tự động Jest |
| 4 | **Lê Anh Tú** | **BIT230423** | Thành viên | Thành phần giao diện (UI Components), Tối ưu danh sách FlatList & Demo kịch bản thực tế |

---

## 3. BẢNG ĐỐI SOÁT CHUẨN MỰC KỸ THUẬT VÀ BẢO TOÀN DỮ LIỆU

- **Công nghệ nền tảng**: React Native 0.88.0, React 19.3.0, TypeScript, Gradle Wrapper 9.4.1.
- **Android SDK Facts**: `compileSdkVersion = 37`, `targetSdkVersion = 36`, `minSdkVersion = 24`.
- **Thiết bị kiểm thử xác minh**: Android Emulator AVD `emulator-5554` (API 35). (Khẳng định rõ: `Physical-device execution: NOT VERIFIED`).
- **Phân tầng lưu trữ an toàn (Storage Truth)**:
  - Access Token: Lưu trữ hoàn toàn trong RAM biến runtime (`IN_MEMORY` qua `accessTokenStore.ts`).
  - Refresh Token: Lưu trữ trong phân vùng phần cứng bảo mật `SECURE_STORAGE` (`react-native-keychain`).
  - Cài đặt không nhạy cảm (Theme sáng/tối): Lưu trong `NON_SENSITIVE_ASYNC_STORAGE` (`AsyncStorage`).
  - Tuyệt đối không lưu Access Token hoặc mật khẩu trong `AsyncStorage`.
- **Kiểm thử tự động**: **129 test suites / 1,144 tests passed 100%** trên Jest.
- **Vai trò chuẩn**: Tuân thủ 4 vai trò canonical `EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN` (loại bỏ hoàn toàn `SUPER_ADMIN` và `MANAGER`).
- **Bảo toàn dữ liệu & Git Hygiene**: Bốn thư mục học liệu gốc được giữ nguyên vẹn, untracked và **KHÔNG commit vào Git** (`LOCAL_ONLY_REFERENCE`).

---

## 4. KẾT LUẬN & SẴN SÀNG CHO STAGE 20D

Báo cáo môn Phát triển ứng dụng di động đã hoàn thành xuất sắc toàn bộ mục tiêu đề ra, đạt đúng 30 trang in chuẩn mực học thuật và sẵn sàng phục vụ Hội đồng bảo vệ.

**Sẵn sàng cho Stage 20D (Báo cáo môn Quản lý dự án CNTT):**
`ROADMAP_STAGE_20C_MOBILE_REPORT_COMPLETE_READY_FOR_20D`
