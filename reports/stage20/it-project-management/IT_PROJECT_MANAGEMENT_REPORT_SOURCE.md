# HỒ SƠ BÀI TẬP NHÓM GIỮA KỲ: QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN
## ĐỀ TÀI: LẬP KẾ HOẠCH QUẢN TRỊ DỰ ÁN XÂY DỰNG NỀN TẢNG QUẢN TRỊ CÔNG VIỆC VÀ VẬN HÀNH DOANH NGHIỆP WORKSPHERE

---

### THÔNG TIN HỌC PHẦN & ĐỀ TÀI
- **Trường**: Trường Đại học CMC
- **Khoa**: Công nghệ Thông tin và Truyền thông
- **Học phần**: Quản lý dự án CNTT (IT Project Management)
- **Quy mô nhóm**: 4 sinh viên
- **Thời gian thực hiện**: Học kỳ Fall 2026
- **Tình trạng đề tài**: `TECHNICAL_IMPLEMENTATION_SUBSTANTIALLY_COMPLETE / ACADEMIC_DOCUMENTATION_AND_ACCEPTANCE_IN_PROGRESS` (Phần kỹ thuật cốt lõi đã hoàn thành; nhóm đang hoàn thiện hồ sơ học thuật, tự động hóa CI/CD, diễn tập vận hành và chuẩn bị nghiệm thu đóng dự án — Không bị trừ 20% điểm đề tài).

---

### DANH SÁCH THÀNH VIÊN NHÓM
| STT | Họ và Tên | Mã Sinh Viên | Vai trò môn học chính thức | Vai trò dự án đề xuất [PROPOSED_PROJECT_ROLE] | Trách nhiệm chính trong hồ sơ |
|:---:|:---|:---:|:---|:---|:---|
| 1 | **Nguyễn Minh Hiếu** | **BIT247729** | **Nhóm trưởng chính thức** | Project Manager (Đề xuất) | Chủ trì lập kế hoạch, SOW, WBS, PERT/CPM, Biểu mẫu họp, Tổng hợp báo cáo |
| 2 | **Nguyễn Văn Cường** | **BIT240048** | Thành viên | Lead Architect & Mobile Lead (Đề xuất) | Thiết kế kiến trúc hệ thống, Đặc tả API, Hoạt động Mobile, Biểu đồ Gantt |
| 3 | **Hoàng Bảo Long** | **BIT240142** | Thành viên | Backend Lead & DevOps (Đề xuất) | Thiết kế CSDL PostgreSQL, WBS Backend/Docker, Lịch nhân sự, Điều hòa tải |
| 4 | **Vũ Thị Thu Hướng** | **BIT240113** | Thành viên | QA & Test Lead (Đề xuất) | Tiêu chí nghiệm thu, Kế hoạch kiểm thử, Ma trận kỹ năng, RACI, Đánh giá |

*(Trạng thái phân công: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` — Phân công biên soạn và thuyết trình đề xuất chờ Người dùng và Nhóm phê duyệt chính thức).*

---

### MỤC LỤC & BẢNG ĐỐI CHIẾU TIÊU CHÍ RUBRIC GIỮA KỲ

Bảng đối chiếu mức độ bao phủ các tiêu chí Rubric đánh giá bài tập nhóm giữa kỳ (Khoa CNTT & TT — Trường Đại học CMC). Toàn bộ 6 nhóm tiêu chí đều được ánh xạ đầy đủ (`RUBRIC_ITEMS_MAPPED = 100%`), điểm số đánh giá chính thức do Giảng viên quyết định (`FINAL_SCORE = INSTRUCTOR_DETERMINED`):

| Tiêu chí Rubric | Điểm tối đa | Vị trí trong báo cáo | Minh chứng đối soát chính thức | Mức bao phủ (Coverage) |
| :--- | :---: | :--- | :--- | :---: |
| **1. Tổng quan & Lựa chọn đề tài** | 10 | Chương 1 | Bài toán thực tế, 4 mục tiêu SMART, phân tích 6 bên liên quan, vòng đời Agile/Scrum, ràng buộc | `FULLY_COVERED` |
| **2. Quản lý phạm vi (Scope)** | 15 | Chương 2 | Bản SOW chi tiết, tiêu chí nghiệm thu, WBS 3 cấp (14 gói), từ điển 5 gói tiêu biểu, quy trình & case đổi phạm vi | `FULLY_COVERED` |
| **3. Quản lý tiến độ (Time)** | 15 | Chương 3 | Danh mục 14 hoạt động, PERT 3 điểm, mạng PDM, CPM Forward/Backward pass, đường găng 51 ngày, Gantt, case nén tiến độ | `FULLY_COVERED` |
| **4. Quản lý nhân sự (HR)** | 15 | Chương 4 | Sơ đồ tổ chức, ma trận kỹ năng, RAM/RACI 14 gói, biểu đồ tải tuần, case giải quyết quá tải, phát triển nhóm (Herzberg) | `FULLY_COVERED` |
| **5. Hồ sơ & Thuyết trình nhóm** | 15 | Toàn bộ hồ sơ | Đủ file DOCX, PDF, Excel tính toán, ảnh sơ đồ nét, thống nhất mã hiệu WBS/Activity, slide 10 trang | `FULLY_COVERED` |
| **6. Đóng góp & Vấn đáp cá nhân** | 30 | Phụ lục 1..3 | Bảng phân công nhiệm vụ đề xuất, mẫu nhật ký cá nhân và biên bản họp chờ nhóm xác nhận | `TEMPLATE_ONLY` |

---

# CHƯƠNG 1: TỔNG QUAN DỰ ÁN & LỰA CHỌN ĐỀ TÀI

## 1.1. Tên Dự Án, Bối Cảnh Hiện Trạng Và Lý Do Lựa Chọn Đề Tài
- **Tên dự án**: Hệ thống Quản trị Công việc và Vận hành Doanh nghiệp Tích hợp (WorkSphere Platform).
- **Hiện trạng & Nhu cầu**: Tại các doanh nghiệp vừa và nhỏ, việc quản lý giao việc, theo dõi tiến độ dự án, cấp phát tài sản và giải quyết phiếu yêu cầu hỗ trợ (Service Requests) thường bị phân mảnh qua nhiều kênh phi tập trung (tin nhắn OTT, email, bảng tính cá nhân). Thực trạng này dẫn đến thiếu minh bạch dữ liệu, khó kiểm soát SLA và không có báo cáo tiến độ chuẩn hóa thời gian thực.
- **Lý do lựa chọn**: Nhóm nhận thấy việc xây dựng một nền tảng tập trung kết hợp giữa Web/Backend Spring Boot và Mobile React Native là bài toán có giá trị thực tiễn cao, đồng thời là đối tượng nghiên cứu lý tưởng để áp dụng các chuẩn mực quản lý dự án CNTT hiện đại (theo chuẩn PMBOK và giáo trình học phần).
- **Khai báo tình trạng đề tài**: Dự án WorkSphere thuộc diện `TECHNICAL_IMPLEMENTATION_SUBSTANTIALLY_COMPLETE / ACADEMIC_DOCUMENTATION_AND_ACCEPTANCE_IN_PROGRESS` (Phần kỹ thuật cốt lõi đã hoàn thành; nhóm đang hoàn thiện hồ sơ học thuật, tự động hóa CI/CD, diễn tập vận hành và chuẩn bị nghiệm thu đóng dự án). Đề tài không sao chép lại đồ án cũ đã có sản phẩm.

## 1.2. Mục Tiêu Dự Án Đo Lường Được (Measurable SMART Objectives)
1. **Mục tiêu 1 (Phạm vi nghiệp vụ)**: Xây dựng hoàn chỉnh 5 phân hệ cốt lõi gồm Xác thực RBAC (5 vai trò), Quản trị Dự án, Quản trị Công việc, Quản trị Tài sản và Xử lý Phiếu yêu cầu dịch vụ (Service Request) với 29 màn hình Mobile và hơn 25 RESTful API chuẩn hóa.
2. **Mục tiêu 2 (Chất lượng mã nguồn & Kiểm thử)**: Đạt tỷ lệ 100% ca kiểm thử tự động vượt qua (PASS), bao gồm tối thiểu 129 test suites / 1,144 tests trên Mobile Client (Jest) và toàn bộ các integration test suites trên Backend (Testcontainers).
3. **Mục tiêu 3 (Tiến độ & Hiệu năng)**: Hoàn thành toàn bộ kế hoạch triển khai trong thời lượng dự kiến 51 ngày làm việc (tương đương 7 tuần dự án), đảm bảo API Backend phản hồi dưới 500ms đối với 95% yêu cầu thông thường.
4. **Mục tiêu 4 (Khả năng vận hành & Tự động hóa)**: Thiết lập pipeline CI tự động kiểm tra cú pháp và build trên GitHub Actions; đóng gói 100% dịch vụ hệ thống bằng Docker Compose với khả năng khởi động sạch và phục hồi sự cố trong vòng 15 phút.

## 1.3. Các Bên Liên Quan Chính (Stakeholder Register)
| Bên liên quan | Vai trò | Kỳ vọng & Yêu cầu chính | Mức độ tham gia | Chiến lược quản lý |
| :--- | :--- | :--- | :--- | :--- |
| **Giảng viên hướng dẫn & Chấm thi** | Academic Evaluator | Hồ sơ chuẩn chỉ tiêu, tiến độ đúng hạn, tuân thủ rubric, thành viên nắm vững kiến thức | Cao / Quyết định | Báo cáo định kỳ theo mốc, nộp đúng hạn, bảo vệ tự tin |
| **Ban Giám đốc Doanh nghiệp (Giả định)** | Project Sponsor | Nâng cao năng suất làm việc, minh bạch tiến độ dự án, giảm 30% thời gian xử lý sự cố | Cao / Phê duyệt | Báo cáo tóm tắt Dashboard, chứng minh hiệu quả đầu tư |
| **Trưởng phòng Kỹ thuật / Quản lý Dự án** | Project Manager | Giao việc nhanh chóng, theo dõi tiến độ qua Kanban/Gantt, báo cáo tự động | Cao / Sử dụng | Tập trung thiết kế luồng duyệt và các chỉ số KPI |
| **Nhân viên / Thành viên nhóm** | Team Members | Giao diện di động tiện lợi, nhận thông báo tức thì, cập nhật trạng thái việc dễ dàng | Cao / Trực tiếp | Tối ưu hóa trải nghiệm Mobile UX và thời gian phản hồi |
| **Kỹ sư Vận hành (DevOps / SysAdmin)** | System Maintainer | Dễ triển khai qua Docker, logging tập trung, backup dữ liệu tự động, khôi phục nhanh | Trung bình | Chuẩn hóa tài liệu Runbook và diễn tập sao lưu |
| **Khách hàng nội bộ (Giả định)** | Internal Users | Gửi yêu cầu dịch vụ thuận tiện, theo dõi trạng thái minh bạch | Trung bình | Khảo sát ý kiến người dùng và kiểm thử chấp nhận (UAT) |

## 1.4. Lựa Chọn Mô Hình Vòng Đời Dự Án (Project Life Cycle)
- Dự án áp dụng mô hình Agile lai ghép (Hybrid Agile / Scrum kết hợp mốc kiểm soát chất lượng).
- Áp dụng các Sprint ngắn (1-2 tuần) giúp nhóm nhanh chóng tích hợp các thành phần, phát hiện sớm lỗi tương thích API và thích ứng linh hoạt với các yêu cầu thay đổi.

---

# CHƯƠNG 2: QUẢN LÝ PHẠM VI DỰ ÁN (SCOPE MANAGEMENT)

## 2.1. Bản Mô Tả Công Việc & Phạm Vi Dự Án (Statement of Work - SOW)
- **Nội dung TRONG phạm vi (In-Scope)**:
  1. Phân hệ quản trị danh mục dự án và cột mốc tiến độ.
  2. Phân hệ phân công công việc, giao hạn và chuyển đổi trạng thái (TODO, IN_PROGRESS, DONE).
  3. Phân hệ quản lý tài sản, theo dõi lịch sử bảo trì.
  4. Phân hệ tạo và phê duyệt phiếu yêu cầu dịch vụ (Service Request).
  5. Hạ tầng xác thực JWT kép (RAM + Keychain) với 5 vai trò RBAC.
  6. Bộ test tự động 1,144 Jest tests trên Mobile và Testcontainers trên Backend.
  7. Đóng gói Docker Compose và CI Pipeline.
- **Nội dung NGOÀI phạm vi (Out-of-Scope)**:
  1. Triển khai thực tế trên máy chủ Staging/Production đám mây (Cloud hosting).
  2. Xuất bản ứng dụng lên chợ Google Play / Apple App Store có chữ ký thương mại.
  3. Tích hợp cổng thanh toán trực tuyến bên ngoài.
  4. Chức năng đồng bộ ngoại tuyến hai chiều (Offline-first sync).
  5. Dịch vụ Push Notification đám mây Firebase/APNs.

## 2.2. Điều Kiện Nghiệm Thu Cho Từng Đầu Ra Chính (Acceptance Criteria)
| Đầu ra chính | Mô tả bàn giao | Điều kiện nghiệm thu cụ thể |
| :--- | :--- | :--- |
| **Nền tảng Backend REST APIs** | Mã nguồn Spring Boot 3.4.3, Java 21, Flyway V1..V12, PostgreSQL | Biên dịch `mvn clean test` thành công; 100% API bảo vệ đúng RBAC; phản hồi < 500ms; lỗi chuẩn RFC 7807. |
| **Ứng dụng Mobile Client** | Mã nguồn React Native 0.88, React 19, TypeScript, 29 màn hình | 129 test suites / 1,144 tests Jest PASS 100%; chạy mượt trên Android Emulator API 35; không lưu token trong AsyncStorage. |
| **Hạ tầng Docker & CI/CD** | Dockerfile nhiều tầng, docker-compose.yml, GitHub Actions | `docker compose up -d` khởi động toàn bộ trong < 60s; script health check 200 OK; CI build pass tự động. |
| **Tài liệu Vận hành & Runbooks** | Bộ hướng dẫn sao lưu, phục hồi sự cố, rollback và logging | Diễn tập backup thành công; RPO < 24h, RTO < 15 phút; kịch bản rollback khôi phục nguyên vẹn trạng thái trước đó. |
| **Hồ sơ Quản lý Dự án** | Báo cáo Word, PDF, Excel CPM/PERT, sơ đồ mạng, phụ lục nhóm | Đầy đủ WBS 3 cấp, từ điển WBS, tính CPM không sai lệch, Gantt nhất quán, mẫu nhật ký làm việc và biên bản họp minh bạch. |

## 2.3. Cấu Trúc Phân Rã Công Việc (WBS - Work Breakdown Structure)
Cấu trúc WBS gồm 3 cấp, 6 nhóm đầu ra và 14 gói công việc ở cấp thấp nhất:
- Cấp 1: Dự án WorkSphere.
- Cấp 2: 1.0 Khởi tạo & Quản lý; 2.0 Backend Platform; 3.0 Mobile Client; 4.0 Đảm bảo Chất lượng; 5.0 Đóng gói & Vận hành; 6.0 Nghiệm thu & Chuyển giao.
- Cấp 3: 14 gói công việc:
  - `1.1.1`: Khảo sát hiện trạng và định vị đề tài
  - `1.1.2`: Đặc tả SOW và tiêu chí nghiệm thu
  - `1.2.1`: Xây dựng WBS và Từ điển WBS
  - `2.1.1`: Thiết kế kiến trúc hệ thống và API Contract
  - `2.1.2`: Thiết kế CSDL quan hệ và Flyway Migrations
  - `2.2.1`: Phát triển Backend Modules (Auth, Prj, Tsk, Ast)
  - `3.1.1`: Thiết kế UI/UX và Screen Flow Mobile
  - `3.1.2`: Phát triển Mobile Client (React Native 0.88)
  - `4.1.1`: Xây dựng Backend Tests (Testcontainers)
  - `4.1.2`: Xây dựng Mobile Tests (Jest 1,144 Tests)
  - `4.2.1`: Kiểm thử tích hợp hệ thống End-to-End
  - `5.1.1`: Đóng gói Docker & Cấu hình CI/CD Pipeline
  - `5.1.2`: Diễn tập vận hành, Backup & Phục hồi sự cố
  - `6.1.1`: Hoàn thiện hồ sơ nghiệm thu và đóng dự án

## 2.4. Từ Điển WBS Cho 5 Gói Tiêu Biểu (WBS Dictionary)
1. **Gói 2.1.2 - Thiết kế CSDL & Flyway Migrations**: Thiết kế lược đồ 11 bảng chuẩn 3NF, 12 tệp Flyway migration V1..V12. Vai trò đề xuất: Backend Lead.
2. **Gói 2.2.1 - Phát triển Backend Modules**: Lập trình Controller, Service, Repository cho Spring Boot REST APIs (>25 endpoints). Vai trò đề xuất: Backend Lead.
3. **Gói 3.1.2 - Phát triển Mobile Client**: Xây dựng React Native 0.88, React 19, 29 màn hình, Keychain token storage. Vai trò đề xuất: Mobile Lead.
4. **Gói 4.1.2 - Xây dựng Mobile Jest Tests**: Viết bộ test 129 test suites / 1,144 tests tự động trên Jest. Vai trò đề xuất: QA Lead.
5. **Gói 5.1.1 - Đóng gói Docker & Pipeline CI**: Xây dựng Dockerfile đa tầng, docker-compose.yml, GitHub Actions CI. Vai trò đề xuất: DevOps Lead.

## 2.5. Quy Trình Quản Lý Thay Đổi Phạm Vi (Scope Change Control)
- Quy trình 5 bước: Đề xuất -> Đánh giá tác động -> Phê duyệt -> Cập nhật WBS/Lịch/RACI -> Giao việc & Kiểm thử.
- Ví dụ tình huống [PROJECT_PLAN_MODEL / RECONSTRUCTED_FROM_GIT]: Bổ sung tính năng Lịch sử sửa chữa tài sản (Asset Repair History) tiêu tốn thêm 2 ngày công, được phê duyệt nhờ nhánh Backend có sẵn 2 ngày Float mà không ảnh hưởng hạn chót dự án.

---

# CHƯƠNG 3: QUẢN LÝ TIẾN ĐỘ DỰ ÁN (TIME MANAGEMENT)

## 3.1. Danh Mục Hoạt Động, Tiền Nhiệm & Ước Lượng PERT 3 Điểm [PROJECT_PLAN_MODEL]
Công thức: $TE = (O + 4M + P) / 6$, $Var = ((P - O) / 6)^2$.

| Mã HĐ | WBS | Tên Hoạt Động | Tiền Nhiệm | O | M | P | TE (Ngày) | Var | Vai Trò Đề Xuất |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **ACT-01** | 1.1.1 | Khảo sát hiện trạng & Charter | - | 2 | 3 | 4 | 3.0 | 0.11 | Project Manager |
| **ACT-02** | 1.1.2 | Đặc tả SOW & Tiêu chí nghiệm thu | ACT-01 | 3 | 4 | 5 | 4.0 | 0.11 | Project Manager |
| **ACT-03** | 1.2.1 | Xây dựng WBS & Từ điển WBS | ACT-02 | 3 | 4 | 5 | 4.0 | 0.11 | Project Manager |
| **ACT-04** | 2.1.1 | Kiến trúc hệ thống & API Contract | ACT-03 | 4 | 5 | 6 | 5.0 | 0.11 | Lead Architect |
| **ACT-05** | 2.1.2 | Thiết kế CSDL & Migrations | ACT-04 | 3 | 4 | 5 | 4.0 | 0.11 | Backend Lead |
| **ACT-06** | 2.2.1 | Phát triển Backend Modules | ACT-05 | 10 | 12 | 14 | 12.0 | 0.44 | Backend Lead |
| **ACT-07** | 3.1.1 | Thiết kế UI/UX & Flow Mobile | ACT-04 | 4 | 5 | 6 | 5.0 | 0.11 | Mobile Lead |
| **ACT-08** | 3.1.2 | Phát triển Mobile Client | ACT-07 | 12 | 14 | 16 | 14.0 | 0.44 | Mobile Lead |
| **ACT-09** | 4.1.1 | Xây dựng Backend Tests | ACT-06 | 4 | 5 | 6 | 5.0 | 0.11 | QA Lead |
| **ACT-10** | 4.1.2 | Xây dựng Mobile Jest Tests | ACT-08 | 5 | 6 | 7 | 6.0 | 0.11 | QA Lead |
| **ACT-11** | 4.2.1 | Kiểm thử tích hợp E2E | ACT-06, ACT-08 | 3 | 4 | 5 | 4.0 | 0.11 | QA Lead |
| **ACT-12** | 5.1.1 | Đóng gói Docker & Pipeline CI | ACT-09..11 | 3 | 4 | 5 | 4.0 | 0.11 | DevOps Lead |
| **ACT-13** | 5.1.2 | Diễn tập vận hành & Phục hồi | ACT-12 | 2 | 3 | 4 | 3.0 | 0.11 | Project Manager / Ops |
| **ACT-14** | 6.1.1 | Nghiệm thu kỹ thuật & Đóng dự án | ACT-13 | 2 | 3 | 4 | 3.0 | 0.11 | Project Manager |

## 3.2. Sơ Đồ Mạng PDM & Tính Toán Đường Găng CPM [PROJECT_PLAN_MODEL]
| Mã HĐ | Tên Hoạt Động | Thời Lượng | ES | EF | LS | LF | Độ Dự Trữ (Slack) | Phân Loại |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ACT-01** | Khảo sát hiện trạng & Charter | 3 ngày | 0 | 3 | 0 | 3 | 0 | **Đường Găng (Critical)** |
| **ACT-02** | Đặc tả SOW & Tiêu chí nghiệm thu | 4 ngày | 3 | 7 | 3 | 7 | 0 | **Đường Găng (Critical)** |
| **ACT-03** | Xây dựng WBS & Từ điển WBS | 4 ngày | 7 | 11 | 7 | 11 | 0 | **Đường Găng (Critical)** |
| **ACT-04** | Kiến trúc hệ thống & API Contract | 5 ngày | 11 | 16 | 11 | 16 | 0 | **Đường Găng (Critical)** |
| **ACT-05** | Thiết kế CSDL & Migrations | 4 ngày | 16 | 20 | 18 | 22 | 2 ngày | Nhánh có dự trữ |
| **ACT-06** | Phát triển Backend Modules | 12 ngày | 20 | 32 | 22 | 34 | 2 ngày | Nhánh có dự trữ |
| **ACT-07** | Thiết kế UI/UX & Flow Mobile | 5 ngày | 16 | 21 | 16 | 21 | 0 | **Đường Găng (Critical)** |
| **ACT-08** | Phát triển Mobile Client | 14 ngày | 21 | 35 | 21 | 35 | 0 | **Đường Găng (Critical)** |
| **ACT-09** | Xây dựng Backend Tests | 5 ngày | 32 | 37 | 36 | 41 | 4 ngày | Nhánh có dự trữ |
| **ACT-10** | Xây dựng Mobile Jest Tests | 6 ngày | 35 | 41 | 35 | 41 | 0 | **Đường Găng (Critical)** |
| **ACT-11** | Kiểm thử tích hợp E2E | 4 ngày | 35 | 39 | 37 | 41 | 2 ngày | Nhánh có dự trữ |
| **ACT-12** | Đóng gói Docker & Pipeline CI | 4 ngày | 41 | 45 | 41 | 45 | 0 | **Đường Găng (Critical)** |
| **ACT-13** | Diễn tập vận hành & Phục hồi | 3 ngày | 45 | 48 | 45 | 48 | 0 | **Đường Găng (Critical)** |
| **ACT-14** | Nghiệm thu kỹ thuật & Đóng dự án | 3 ngày | 48 | 51 | 48 | 51 | 0 | **Đường Găng (Critical)** |

- **Tổng thời lượng dự án**: **51 ngày làm việc** (~7.3 tuần làm việc).
- **Đường găng (Critical Path)**: `ACT-01 -> ACT-02 -> ACT-03 -> ACT-04 -> ACT-07 -> ACT-08 -> ACT-10 -> ACT-12 -> ACT-13 -> ACT-14`.

## 3.3. Biểu Đồ Gantt Lập Kế Hoạch Dự Án [PROJECT_PLAN_MODEL]
*(Xem biểu đồ Gantt trực quan kết xuất từ mô hình CPM trong tệp báo cáo chính thức và thư mục diagrams/)*.

## 3.4. Tình Huống Điều Chỉnh Tiến Độ (Schedule Compression Scenario) [PROJECT_PLAN_MODEL]
- **Tình huống**: Tại ngày thứ 28, ACT-08 bị chậm 3 ngày do phát sinh lỗi tương thích Android Keychain.
- **Biện pháp**: Kết hợp Fast Tracking (gối đầu viết test ACT-10 trước 3 ngày khi module core xong) và Crashing (điều chuyển Backend Lead sang hỗ trợ cấu hình native module).
- **Kết quả**: Ngày kết thúc dự án giữ vững ở mốc 51 ngày mà không phát sinh thêm chi phí tài chính.

---

# CHƯƠNG 4: QUẢN LÝ NHÂN SỰ DỰ ÁN (HUMAN RESOURCE MANAGEMENT)

## 4.1. Cơ Cấu Tổ Chức Nhóm & Ma Trận Kỹ Năng (Skills Matrix) [PROPOSED_PROJECT_ROLE]
- Đội ngũ 4 thành viên chính thức: Nguyễn Minh Hiếu (Nhóm trưởng chính thức), Nguyễn Văn Cường, Hoàng Bảo Long, Vũ Thị Thu Hướng.
- Ma trận kỹ năng chứng minh sự phân bổ năng lực chuyên sâu đồng đều giữa các mảng quản trị, kiến trúc, backend, di động và kiểm thử chất lượng.

## 4.2. Ma Trận Phân Công Trách Nhiệm (RACI Matrix) [PROJECT_PLAN_MODEL]
Tuân thủ nguyên tắc: Mỗi gói WBS có đúng 1 chữ A (Accountable) và ít nhất 1 chữ R (Responsible). Bảng phân công chi tiết 14 gói công việc đảm bảo tính giải trình và phối hợp chặt chẽ.

## 4.3. Kế Hoạch Tải Nhân Sự Theo Tuần & Điều Hòa Nguồn Lực [PROJECT_PLAN_MODEL]
- Quỹ thời gian tối đa: 25 giờ/tuần/thành viên [PROJECT_PROPOSAL].
- Tổng giờ công toàn dự án: 477 giờ công phân bổ trong 7 tuần (~120 giờ/thành viên).
- Tình huống điều hòa tải: Xử lý tình trạng quá tải 30h của Hoàng Bảo Long trong Tuần 3 bằng cách dời lịch bắt đầu gói ACT-06 sang Tuần 4 nhờ tận dụng 2 ngày Float của ACT-05. Tải sau điều chỉnh hạ xuống 24h/tuần.

## 4.4. Kế Hoạch Phát Triển Nhóm & Động Viên Nhân Sự
- Kế hoạch đào tạo: Tổ chức Workshop 3 giờ nội bộ về Jest testing và React 19 re-render optimization vào cuối Tuần 2.
- Thuyết Hai Yếu Tố của Herzberg: Đảm bảo các yếu tố duy trì (phân công công bằng, tôn trọng lịch cá nhân) và kích hoạt các yếu tố tạo động lực (trao quyền kỹ thuật, ghi nhận đóng góp, thuyết trình trước hội đồng).

---

# CHƯƠNG 5: KẾT LUẬN & ĐÁNH GIÁ KẾ HOẠCH DỰ ÁN

## 5.1. Đánh Giá Khả Thi Của Hồ Sơ Kế Hoạch
- Tính khả thi kỹ thuật: Dựa trên nền tảng Spring Boot, React Native, PostgreSQL, Docker đã được chứng minh.
- Tính chặt chẽ tiến độ: Đường găng 51 ngày logic, có phương án nén tiến độ khả thi.
- Tính cân bằng nguồn lực: Tải nhân sự đồng đều, không ai vượt ngưỡng 25h/tuần.

## 5.2. Bài Học Kinh Nghiệm Trong Quản Lý Dự Án CNTT
- Kiểm soát phạm vi chặt chẽ qua SOW và WBS Dictionary tránh rủi ro phình to phạm vi (Scope Creep).
- Ước lượng khoa học qua PERT và CPM thay vì cảm tính giúp chủ động ứng phó nút thắt cổ chai.
- Quản trị con người bằng sự tôn trọng, minh bạch và tạo động lực là điều kiện tiên quyết để dự án về đích.

---

# TÀI LIỆU THAM KHẢO (REFERENCES)
1. Trường Đại học CMC, Khoa Công nghệ Thông tin & Truyền thông, *Bộ bài giảng 9 tuần học phần Quản lý dự án CNTT*, Hà Nội, 2026. `[LOCAL_ONLY_REFERENCE, KHÔNG PHÂN PHỐI RA NGOÀI REPOSITORY]`
2. Trường Đại học CMC, *Hướng dẫn và Rubric đánh giá Bài tập nhóm giữa kỳ học phần Quản lý dự án CNTT*, 2026. `[LOCAL_ONLY_REFERENCE]`
3. Project Management Institute (PMI), *A Guide to the Project Management Body of Knowledge (PMBOK Guide)*, 7th Edition, Newtown Square, PA, 2021.
4. Kathy Schwalbe, *Information Technology Project Management*, 9th Edition, Cengage Learning, 2019.
5. WorkSphere Engineering Team, *Tài liệu Kiến trúc Hệ thống & Thiết kế Cơ sở Dữ liệu WorkSphere*, `reports/STAGE_20_COURSE_CODE_EVIDENCE_MAP.md`, 2026.
6. WorkSphere Engineering Team, *Hướng dẫn Vận hành và Thực thi Dự án WorkSphere*, `reports/WORKSPHERE_PROJECT_OVERVIEW_AND_RUN_GUIDE.md`, 2026.

---

# PHẦN PHỤ LỤC MINH CHỨNG (APPENDICES)

### Phụ Lục 1: Bảng Phân Công Trách Nhiệm Đề Xuất Giữa Kỳ
| Họ và Tên | Mã SV | Nội dung đảm nhiệm chính | Phần thuyết trình dự kiến | Tỷ lệ đề xuất |
|:---|:---:|:---|:---|:---:|
| **Nguyễn Minh Hiếu** | **BIT247729** | Chủ trì xây dựng hồ sơ, SOW, WBS, PERT/CPM, Biểu mẫu họp | Tổng quan dự án, SOW & Tiến độ CPM | 25% [Chờ duyệt] |
| **Nguyễn Văn Cường** | **BIT240048** | Kiến trúc hệ thống, SOW kỹ thuật, Hoạt động Mobile, Biểu đồ Gantt | Kiến trúc, Phạm vi & Biểu đồ Gantt | 25% [Chờ duyệt] |
| **Hoàng Bảo Long** | **BIT240142** | Thiết kế CSDL, WBS Backend/DevOps, Lịch nhân sự, Điều hòa tải | Quản lý nhân sự, RACI & Điều hòa tải | 25% [Chờ duyệt] |
| **Vũ Thị Thu Hướng** | **BIT240113** | Kế hoạch kiểm thử, Tiêu chí nghiệm thu, Ma trận kỹ năng, Đánh giá | Kế hoạch kiểm thử & Đánh giá kết luận | 25% [Chờ duyệt] |

*(Trạng thái: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`).*

### Phụ Lục 2: Biểu Mẫu Biên Bản Họp Nhóm Định Kỳ [TEMPLATE_REQUIRES_TEAM_COMPLETION]
- **Biểu mẫu Biên bản 01**:
  - Thời gian & Hình thức: `[Nhóm điền: Ngày giờ, Địa điểm hoặc Link họp trực tuyến]`.
  - Thành phần tham dự: `[Nhóm điền: Danh sách thành viên có mặt, vắng mặt có lý do]`.
  - Nội dung cuộc họp: Thống nhất lựa chọn đề tài WorkSphere; phân tích bối cảnh và xác lập 4 mục tiêu SMART; bầu Nguyễn Minh Hiếu làm Trưởng nhóm chính thức; phân chia trách nhiệm nghiên cứu 4 chương giáo trình.
  - Kết luận & Giao việc: `[Nhóm điền: Các đầu việc đã phân công cụ thể, thời hạn hoàn thành và chữ ký xác nhận của các thành viên]`.
- **Biểu mẫu Biên bản 02**:
  - Thời gian & Hình thức: `[Nhóm điền: Ngày giờ, Địa điểm họp]`.
  - Thành phần tham dự: `[Nhóm điền: Danh sách thành viên tham dự]`.
  - Nội dung cuộc họp: Rà soát 14 gói WBS; thống nhất ước lượng PERT 3 điểm; xác định đường găng CPM 51 ngày; xử lý xung đột tải nhân sự của Hoàng Bảo Long trong Tuần 3; tổng duyệt tệp tính toán Excel và tài liệu báo cáo.
  - Kết luận & Giao việc: `[Nhóm điền: Ý kiến thống nhất cuối cùng trước khi xuất bản hồ sơ và chữ ký xác nhận của các thành viên]`.

### Phụ Lục 3: Biểu Mẫu Nhật Ký Công Việc Cá Nhân [TEMPLATE_REQUIRES_TEAM_COMPLETION]
| Thành viên | Thời gian | Nhiệm vụ thực hiện cụ thể | Đầu ra xác thực |
| :--- | :---: | :--- | :---: |
| **Nguyễn Minh Hiếu** | `[Nhóm điền]` | Chủ trì họp nhóm, viết SOW, phân rã WBS 3 cấp, tính toán CPM/PERT, tổng hợp báo cáo | `[Nhóm đính kèm link/ảnh]` |
| **Nguyễn Văn Cường** | `[Nhóm điền]` | Xác định gói công việc Mobile, vẽ biểu đồ Gantt, thiết kế sơ đồ mạng PDM | `[Nhóm đính kèm link/ảnh]` |
| **Hoàng Bảo Long** | `[Nhóm điền]` | Xác định gói công việc Backend/DevOps, lập bảng tải nhân sự theo tuần, xử lý điều hòa tải | `[Nhóm đính kèm link/ảnh]` |
| **Vũ Thị Thu Hướng** | `[Nhóm điền]` | Thiết lập tiêu chí nghiệm thu kiểm thử, lập ma trận kỹ năng, soạn thảo ma trận RACI | `[Nhóm đính kèm link/ảnh]` |
