# WorkSphere Stage 20A — Biên Bản Hoàn Tất Hợp Đồng Nội Dung & Ánh Xạ Học Liệu

**Giai đoạn:** ROADMAP STAGE 20A — COURSE-TO-CODE EVIDENCE MAP, TEAM STUDY GUIDE & CONTENT CONTRACT FREEZE
**Mã trạng thái hoàn tất:** `ROADMAP_STAGE_20A_CONTENT_CONTRACT_COMPLETE_READY_FOR_20B`
**Starting checkpoint:** `fba6400dddb8a281e77967c68f0d8e63ffff2b5c`
**Ngày thực hiện:** 28/10/2026

---

## 1. TỔNG QUAN VÀ MỤC TIÊU HOÀN THÀNH

Roadmap Stage 20A đã thiết lập nguồn chân lý vững chắc bằng Markdown cho toàn bộ báo cáo, slide, phân công học tập và chiến lược bảo vệ của 4 môn học chuyên ngành đối chiếu trực tiếp với mã nguồn và bằng chứng vận hành thực tế của dự án WorkSphere.

### Các tài liệu tạo mới trong Stage 20A:
1. `reports/STAGE_20_COURSE_CODE_EVIDENCE_MAP.md`:
   - Bảng ánh xạ toàn diện từ chuẩn đầu ra môn học sang tệp mã nguồn cụ thể, class, method, test suites và bằng chứng vận hành.
   - Bao quát 4 môn: *Kỹ năng lập trình nâng cao*, *Phát triển ứng dụng di động*, *Quản lý dự án CNTT*, *Triển khai phần mềm*.
   - Đề xuất phân công viết báo cáo và slide cho 6 thành viên gắn nhãn rõ ràng: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`.
2. `reports/STAGE_20_TEAM_STUDY_AND_DEFENSE_GUIDE.md`:
   - Tóm tắt dự án dành cho bảo vệ theo 2 thang đo: 5 phút (Elevator pitch) và 15 phút (Deep-dive).
   - Lộ trình tự học 14 bước tuần tự kèm từ điển thuật ngữ cốt lõi (10 thuật ngữ nền tảng).
   - Cẩm nang ôn tập theo 4 môn học với chuẩn đầu ra, hướng dẫn demo trực tiếp code, và bộ câu hỏi phản biện kèm đáp án mẫu.
   - Cẩm nang cá nhân hóa cho từng thành viên (Nguyễn Minh Hiếu, Nguyễn Văn Cường, Hoàng Bảo Long, Vũ Thị Thu Hướng, Nguyễn Đức Khiêm, Lê Anh Tú) với vai trò, module trọng tâm, bài thuyết trình 5-7 phút và Top 5 câu hỏi trọng tâm.
   - Chiến lược diễn tập nhóm 3 vòng và ma trận phân vai trả lời câu hỏi.
3. `reports/WORKSPHERE_PROJECT_OVERVIEW_AND_RUN_GUIDE.md`:
   - Cẩm nang tổng quan dự án dễ hiểu và hướng dẫn cài đặt, cấu hình, chạy, kiểm thử, giám sát và xử lý sự cố.
4. `reports/ROADMAP_STAGE_20A_CONTENT_CONTRACT.md` (Tài liệu này): Biên bản hoàn tất Stage 20A.

---

## 2. KẾT QUẢ ĐỐI SOÁT VÀ XÁC MINH NGUYÊN TẮC (POLICY AUDIT)

1. **Trạng thái Mẫu báo cáo (Template Status)**:
   - *Kỹ năng lập trình nâng cao*: `NOT_PROVIDED_BY_INSTRUCTOR` (Giảng viên không cấp mẫu báo cáo; nhóm tuân thủ cấu trúc học thuật chuẩn mực).
   - *Triển khai phần mềm*: `NOT_PROVIDED_BY_INSTRUCTOR` (Giảng viên không cấp mẫu báo cáo; nhóm tuân thủ cấu trúc học thuật chuẩn mực).
   - *Phát triển ứng dụng di động*: `PROVIDED_BY_INSTRUCTOR` (`mau_bao_cao.doc`).
   - *Quản lý dự án CNTT*: `PROVIDED_BY_INSTRUCTOR` (`Bao_cao_mau.doc`).
2. **Chuẩn hóa Toolchain thực tế trong mã nguồn**:
   - `mobile/.node-version`: Node.js `24.19.0` (Khớp hoàn toàn với GitHub Actions CI workflow).
   - Java: OpenJDK `21` (Temurin 21).
   - Spring Boot: `4.1.1` (`backend/pom.xml`).
   - React Native: `0.88.0` (`mobile/package.json`).
   - React: `19.3.0`.
   - Gradle Wrapper: `9.4.1` (`mobile/android/gradle/wrapper/gradle-wrapper.properties`).
   - Android SDK: `compileSdkVersion = 37`, `targetSdkVersion = 36` (`mobile/android/build.gradle`).
   - PostgreSQL: `15-alpine` (`compose.yaml`).
3. **Audit RBAC Roles**:
   - Chỉ có đúng 4 roles canonical được định nghĩa trong `V011__seed_roles_and_permissions.sql` và `backend/src/main/java/com/worksphere/identity/domain/Role.java`:
     - `EMPLOYEE`
     - `TEAM_LEADER`
     - `PROJECT_MANAGER`
     - `ADMIN`
   - Không tồn tại `SUPER_ADMIN` hay `MANAGER` trong mã nguồn.
4. **Audit Mobile Token & State Storage**:
   - Access Token: `IN_MEMORY` (chỉ lưu trong RAM qua biến runtime).
   - Refresh Token: `SECURE_STORAGE` (lưu trong Keychain/Keystore qua `react-native-keychain`).
   - Profile: `IN_MEMORY` (lưu trong Redux slice).
   - Theme / Onboarding: `NON_SENSITIVE_ASYNC_STORAGE` (lưu qua `@react-native-async-storage/async-storage`).
5. **Audit Cross-cutting Concern**:
   - Không có custom `@Aspect` class nào trong mã nguồn.
   - Cross-cutting Logging & MDC requestId được xử lý ở rìa web bằng `RequestCorrelationFilter` (`OncePerRequestFilter`).
   - Transaction boundary được quản lý bởi Spring AOP qua `@Transactional`.
6. **Audit Đường dẫn mã nguồn (Source Paths)**:
   - 100% đường dẫn tệp được kiểm tra tồn tại thực tế trên ổ đĩa.
   - Các màn hình Mobile nằm trong các thư mục số nhiều: `mobile/src/features/{projects,tasks,serviceRequests,assets,notifications,more}/screens/`.
   - Các domain entity Backend nằm trong package: `com.worksphere.<module>.domain.<Entity>.java`.

---

## 3. BẢO TOÀN DỮ LIỆU VÀ RANH GIỚI BẢO MẬT (SAFETY CHECK)

- Bốn thư mục học liệu gốc (`Kỹ năng lập trình nâng cao`, `phát triển ứng dụng di động`, `Quản lý dự án CNTT`, `Triển khai phần mềm`) được giữ nguyên vẹn, không chỉnh sửa và **KHÔNG commit vào Git repository** (chỉ sử dụng làm tham chiếu nội bộ cục bộ).
- Không có bất kỳ thay đổi nào vào mã nguồn nghiệp vụ của Backend, Mobile, Docker hay CI/CD.
- Chưa tạo bất kỳ file DOCX/PDF báo cáo hay slide PPTX nào (thuộc phạm vi các Stage sau từ 20B đến 20G).
- Trạng thái phân công thành viên được giữ nguyên nhãn `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` để chờ User phê duyệt hoặc điều chỉnh.

---

## 4. KẾT LUẬN & SẴN SÀNG CHO STAGE 20B

Stage 20A đã hoàn thành xuất sắc toàn bộ mục tiêu đề ra, thiết lập nền tảng văn bản hóa vững chắc và minh bạch.

**Sẵn sàng cho Stage 20B:**
`ROADMAP_STAGE_20_READY_FOR_STAGE_20B`
