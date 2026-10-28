# BÁO CÁO NGHIỆM THU: ROADMAP STAGE 20F
## FOUR-COURSE PRESENTATION DECKS, SPEAKER NOTES & DEFENSE NARRATIVES

---

### THÔNG TIN TỔNG QUAN
- **Dự án**: Nền tảng Quản trị Doanh nghiệp WorkSphere (Enterprise Operations Platform)
- **Học phần thực hiện**: Cả 4 môn học chuyên ngành thuộc Khoa CNTT & TT — Trường Đại học CMC:
  1. Kỹ năng lập trình nâng cao (Advanced Programming Skills)
  2. Phát triển ứng dụng di động (Mobile Application Development)
  3. Quản lý dự án Công nghệ thông tin (IT Project Management)
  4. Triển khai phần mềm (Software Deployment & DevOps)
- **Trạng thái nghiệm thu**: `ROADMAP_STAGE_20F_PRESENTATION_DECKS_COMPLETE_READY_FOR_20G`
- **Starting Checkpoint**: `8a8a7ae9f57097827a4c65eb00bdb0d2ff031376`
- **Quy chuẩn thiết kế**: 16:9 Widescreen, Tiếng Việt có dấu chuẩn Unicode, hệ màu xanh Navy / Royal Blue chuyên nghiệp, thẻ nội dung có viền phân tầng, trực quan hóa cao với sơ đồ kỹ thuật và ảnh prototype đã kiểm toán.
- **Hợp đồng Speaker Notes**: 100% (65/65 slides) đều có đầy đủ 8 trường thông tin bắt buộc phục vụ bảo vệ đồ án.

---

### 1. DANH MỤC CÁC BỘ SLIDE THUYẾT TRÌNH BÀN GIAO (DELIVERABLES)

| STT | Tên tệp PPTX | Môn học / Học phần | Số lượng Slide | Trọng tâm học thuật & Cấu trúc thuyết trình | Trưởng nhóm đề xuất |
|:---:|:---|:---|:---:|:---|:---|
| 1 | `01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx` | Kỹ năng lập trình nâng cao | **18 slides** | Kiến trúc Modular Monolith, Spring IoC/DI, Spring MVC, REST API Validation, Spring Data JPA, Flyway (V001–V017), Khóa lạc quan `@Version`, Spring Security 6, Stateless JWT, 4 Roles RBAC, Filter vs AOP Proxy, 351 Backend Tests, Actuator/Prometheus. | Nguyễn Minh Hiếu (BIT247729) |
| 2 | `02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx` | Phát triển ứng dụng di động | **15 slides** | Phạm vi 29 màn hình, React Native 0.88, React 19, TypeScript, Kiến trúc Feature-First, React Navigation 7, Quản lý State qua Custom Hooks, Tối ưu FlatList, Vòng đời Token 2 lớp (RAM & Keychain), Axios Interceptors 401 refresh, 4 trạng thái giao diện UI, 129 Test Suites (1,144 Jest Tests), Android Debug APK trên Emulator API 35. | Nguyễn Văn Cường (BIT240048) |
| 3 | `03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx` | Quản lý dự án CNTT | **12 slides** | Chuẩn mẫu giảng viên (8–12 slides): Điều lệ dự án SMART, Phân tích bên liên quan, Vòng đời lai Hybrid, Quản trị phạm vi SOW, Cấu trúc phân rã WBS 3 cấp độ, Ước lượng 3 điểm PERT, Sơ đồ mạng PDM/CPM đường găng Critical Path 51 ngày, Gantt Chart 14 gói công việc, Ma trận RACI, Cân bằng tải Workload Histogram, Quản trị rủi ro & Cổng chất lượng, Công bố dữ liệu mô hình thực nghiệm. | Nguyễn Minh Hiếu (BIT247729) |
| 4 | `04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx` | Triển khai phần mềm | **20 slides** | Ma trận trưởng thành DevOps, Quản trị Git SCM & Commit SHA bất biến, Chính sách phân quyền CI, Pipeline GitHub Actions 5 jobs DAG, Cổng chất lượng Backend & Mobile, Đóng gói Android Debug APK, Multi-stage Dockerfile JRE 21 non-root UID 10001, Docker Compose v2 mạng bridge, Quản trị biến môi trường Twelve-Factor App & Fail-Fast Secret, MDC `X-Request-ID`, Actuator/Prometheus, Tự động hóa sao lưu & Checksum SHA-256, Diễn tập phục hồi cô lập, Cây quyết định Rollback, Ranh giới Continuous Delivery, Bảng ánh xạ Kubernetes `CONCEPT_ONLY`, Khoảng trống trước khi lên Cloud. | Nguyễn Minh Hiếu (BIT247729) |

---

### 2. KẾ HOẠCH NGUỒN TÀI NGUYÊN HÌNH ẢNH (VISUAL ASSET PLAN)
Toàn bộ sơ đồ và hình ảnh sử dụng trên các slide đều có nguồn gốc và nhãn phân loại minh bạch, được định nghĩa trong tệp `reports/stage20/presentations/sources/visual_manifest.py`:
- **Deck 1**: Tái sử dụng 4 sơ đồ kiến trúc độ nét cao từ Stage 20B (`fig1_system_context.png`, `fig2_request_lifecycle.png`, `fig3_clean_architecture.png`, `fig4_testing_pyramid.png`).
- **Deck 2**: Tái sử dụng 2 sơ đồ kiến trúc (`fig1_mobile_architecture.png`, `fig2_screen_flow.png`) và 4 ảnh chụp giao diện được dán nhãn chuẩn xác `[PROTOTYPE_REFERENCE]` từ Stage 20C (`screen_01_login.png`, `screen_02_dashboard.png`, `screen_05_loading_state.png`, `screen_06_empty_state.png`).
- **Deck 3**: Sử dụng 2 sơ đồ tiến độ từ Stage 20D (`fig_gantt_chart.png`, `fig_workload_histogram.png`) kết hợp 2 sơ đồ mới được sinh từ dữ liệu toán học chuẩn xác (`fig_wbs_hierarchy.png`, `fig_pdm_cpm_network.png`).
- **Deck 4**: Tái sử dụng trọn vẹn 8 sơ đồ kỹ thuật đã được kiểm toán từ Stage 20E (`fig1_devops_lifecycle.png`, `fig2_ci_pipeline.png`, `fig3_multistage_docker.png`, `fig4_compose_topology.png`, `fig5_monitoring_flow.png`, `fig6_backup_restore_flow.png`, `fig7_rollback_decision.png`, `fig8_k8s_conceptual_mapping.png`).

---

### 3. HỢP ĐỒNG NỘI DUNG SPEAKER NOTES (SPEAKER NOTES CONTRACT)
Toàn bộ 65 slides của cả 4 bộ slide đều được trang bị phần ghi chú thuyết trình (Speaker Notes) chi tiết theo đúng cấu trúc tiêu chuẩn 8 phần:
1. **Mục tiêu slide**: Định hướng thông điệp cốt lõi cần truyền tải.
2. **Lời thuyết minh gợi ý**: Bài nói mẫu bằng tiếng Việt tự nhiên, ngắn gọn, súc tích, giải thích "tại sao" thay vì chỉ đọc lại chữ trên slide.
3. **Thời lượng dự kiến**: Đánh dấu nhãn `PROJECT_PROPOSAL` (từ 1 đến 2 phút/slide, bảo đảm bài thuyết trình vừa vặn khung thời gian 15–20 phút của buổi bảo vệ).
4. **Người thuyết trình**: Đánh dấu nhãn `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`, phân bổ đều đặn cho tất cả các thành viên trong nhóm.
5. **Căn cứ minh chứng**: Trích dẫn chính xác đường dẫn tệp mã nguồn hoặc tài liệu đối soát trong repository WorkSphere.
6. **Câu hỏi Hội đồng dự kiến**: Dự báo các câu hỏi hóc búa của giảng viên phản biện.
7. **Câu trả lời an toàn**: Cung cấp câu trả lời có căn cứ kỹ thuật vững chắc, không nói quá năng lực hệ thống.
8. **Gợi ý chuyển slide / Demo cue**: Lời dẫn chuyển mạch mượt mà sang slide tiếp theo hoặc gợi ý thao tác demo mã nguồn thực tế.

---

### 4. MA TRẬN ĐỐI SOÁT TÍNH NHẤT QUÁN TOÀN HỆ THỐNG (CROSS-DECK CONSISTENCY)

| Tiêu chí / Thông số kỹ thuật | Deck 1 (Advanced Prog) | Deck 2 (Mobile Dev) | Deck 3 (IT Project Mgmt) | Deck 4 (Software Deploy) | Đánh giá |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Tên nền tảng** | WorkSphere | WorkSphere | WorkSphere | WorkSphere | **Đồng nhất** |
| **Công nghệ Backend** | Spring Boot 4.1.1, Java 21 | REST API Backend | Backend Modular Monolith | Spring Boot 4.1.1, Java 21 | **Đồng nhất** |
| **Công nghệ Mobile** | React Native Client | React Native 0.88, React 19 | Mobile React Native App | Android Debug APK | **Đồng nhất** |
| **Số ca kiểm thử Backend** | 351 Tests (Pass 100%) | Không đề cập | 351 Backend Tests | 351 Backend Tests | **Đồng nhất** |
| **Số ca kiểm thử Mobile** | Không đề cập | 129 Suites / 1,144 Tests | 1,144 Mobile Tests | 129 Suites / 1,144 Tests | **Đồng nhất** |
| **Flyway Schema Migrations** | 17 tệp (V001–V017) | Không đề cập | 17 tệp Migration CSDL | 17 tệp Flyway Checksum | **Đồng nhất** |
| **4 Vai trò doanh nghiệp** | EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN | EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN | EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN | EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER, ADMIN | **Đồng nhất** |
| **Khóa lạc quan** | `@Version Long version` | Không đề cập | Quản lý đồng thời CSDL | Không đề cập | **Đồng nhất** |
| **Khẳng định Spring AOP** | Không dùng Custom `@Aspect` | Không đề cập | Không đề cập | Không đề cập | **Đồng nhất** |
| **Truy vết Request ID** | Filter gán `X-Request-ID` | Header `X-Request-ID` | Không đề cập | `RequestCorrelationFilter` | **Đồng nhất** |
| **Phân tầng lưu trữ Token** | Stateless JWT | RAM (Access) & Keychain (Refresh) | Bảo mật phiên đăng nhập | Không lưu token trong code | **Đồng nhất** |
| **Ranh giới Kubernetes & Cloud**| Không đề cập | Không đề cập | Không triển khai cloud | `CONCEPT_ONLY` (Chưa deploy) | **Đồng nhất** |
| **Ranh giới Continuous Deploy** | Không đề cập | Không đề cập | Không đề cập | Continuous Delivery: Có; CD: Không | **Đồng nhất** |
| **Trạng thái phân công nhóm** | `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` | `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` | `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` | `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` | **Đồng nhất** |

---

### 5. RANH GIỚI BẢO MẬT VÀ BẢN QUYỀN
- **Tuyệt đối không lộ lọt bí mật**: Không có bất kỳ mật khẩu thật, JWT secret key, API token hay thông tin định danh cá nhân nào xuất hiện trên slide hay ghi chú.
- **Tôn trọng bản quyền học liệu**: Toàn bộ nội dung bài giảng của giảng viên được tóm tắt dưới dạng tri thức tổng hợp và trích dẫn học thuật; 4 thư mục học liệu gốc tiếp tục được bảo vệ ở trạng thái `LOCAL_ONLY_REFERENCE` (untracked, unstaged, uncommitted).
- **Trạng thái phân công học thuật**: Tất cả bảng phân công sinh viên đều được dán nhãn `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` chờ sự phê duyệt chính thức từ người dùng.

---

### KẾT LUẬN NGHIỆM THU
Giai đoạn Roadmap Stage 20F đã hoàn thành xuất sắc toàn bộ 4 bộ slide thuyết trình PPTX chuyên nghiệp, đồng bộ và đầy đủ ghi chú bảo vệ đồ án, sẵn sàng cho công tác chuẩn bị bảo vệ và chuyển tiếp sang giai đoạn kế tiếp.
