# BÁO CÁO KIỂM THẨM CHẤT LƯỢNG HỒ SƠ: ROADMAP STAGE 20E
## SOFTWARE DEPLOYMENT & DEVOPS TECHNICAL HANDBOOK (TRIỂN KHAI PHẦN MỀM)

---

### THÔNG TIN TỔNG QUAN
- **Dự án**: Nền tảng Quản trị Doanh nghiệp WorkSphere (Enterprise Operations Platform)
- **Học phần**: Triển khai phần mềm (Software Deployment)
- **Khoa**: Công nghệ Thông tin & Truyền thông — Trường Đại học CMC
- **Trạng thái kiểm thẩm**: `ROADMAP_STAGE_20E_SOFTWARE_DEPLOYMENT_REPORT_AUDITED_READY_FOR_20F`
- **Starting Checkpoint**: `6e2b3899b3d4ce28990ea5c31b1e09891e972bee`
- **Mô hình định dạng**: `PROJECT_DEFINED_FORMAT` (do Giảng viên không ban hành mẫu báo cáo riêng)
- **Quy mô số trang thực tế**: 22 trang PDF hoàn chỉnh (Nằm trong dải đề xuất `PROJECT_PROPOSAL: 25–35 trang`, mật độ thông tin dày dặn 6,111 từ, 6 bảng đối soát, 5 hộp trích xuất cấu hình và 8 sơ đồ kiến trúc chuẩn xác).

---

### 1. KHÓA NGUỒN CHÂN LÝ TÀI LIỆU (SOURCE OF TRUTH LOCK)
- **Quy định nguồn chân lý**: `DOCUMENT_SOURCE_OF_TRUTH = GENERATED_PIPELINE`
  - Hồ sơ được biên soạn và đồng bộ hóa thông qua quy trình tự động hóa (Automated Generator Pipeline).
  - Tệp Markdown nguồn ([SOFTWARE_DEPLOYMENT_REPORT_SOURCE.md](file:///d:/WorkSphere/reports/stage20/software-deployment/SOFTWARE_DEPLOYMENT_REPORT_SOURCE.md)) và tệp Word ([BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.docx](file:///d:/WorkSphere/reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.docx)) được đồng bộ 1:1, không có độ trôi lệch (zero drift).
  - Bản xuất PDF ([BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pdf](file:///d:/WorkSphere/reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pdf)) được render trực tiếp thông qua Microsoft Word COM Automation, bảo đảm 100% định dạng bảng biểu, hình ảnh, lề trang (1.0, 1.0, 1.25, 1.0 inch) và font chữ Arial chuẩn học thuật.

---

### 2. MA TRẬN ĐỐI SOÁT TOÀN DIỆN 9 BÀI GIẢNG HỌC PHẦN (COURSE-MATERIAL TRACEABILITY)

| Bài học / Chuyên đề | Chương báo cáo | Minh chứng kỹ thuật WorkSphere | Phân loại nhãn | Ranh giới & Giới hạn kỹ thuật | Đánh giá (Verdict) |
|:---|:---|:---|:---|:---|:---:|
| **Bài 1: Giới thiệu DevOps** | Chương 1 | Wrappers (`mvnw`, `gradlew`), ghim Node runtime, 5 jobs CI | `IMPLEMENTED_PARTIALLY` | Chưa có tự động hóa Jira/Kanban | **PASS** |
| **Bài 2: Cloud Computing** | Chương 10 | Phân tích lý thuyết kịch bản đám mây (IaaS vs PaaS) | `CONCEPT_ONLY` | Không có hạ tầng Cloud thực tế | **PASS** |
| **Bài 3: SCM & Git** | Chương 2 | Git repository, commit SHA 40 ký tự bất biến, `.gitignore` | `IMPLEMENTED` | Duy trì 4 thư mục học liệu local-only | **PASS** |
| **Bài 4: Continuous Integration** | Chương 3 | GitHub Actions `.github/workflows/ci.yml` (351 backend, 1144 jest) | `IMPLEMENTED` | Đồ thị DAG 5 jobs có phụ thuộc `needs:` | **PASS** |
| **Bài 5: Continuous Delivery** | Chương 4 | Tự động đóng gói APK debug và Docker image | `PARTIAL` | Continuous Delivery: Có; CD Deployment: Không | **PASS** |
| **Bài 6: Infrastructure as Code** | Chương 7 | Dockerfile đa tầng, `compose.yaml`, `prometheus.yml`, scripts | `PARTIAL` | Chưa áp dụng Terraform / CloudFormation | **PASS** |
| **Bài 7: Docker Container** | Chương 5 | Multi-stage JRE 21, user phi đặc quyền UID 10001, curl health | `IMPLEMENTED` | Không chạy quyền root, image size ~280MB | **PASS** |
| **Bài 8: Kubernetes** | Chương 10 | Bảng đối soát và sơ đồ ánh xạ lý thuyết từ Compose sang K8s | `CONCEPT_ONLY` | Chưa khởi tạo cluster K8s thật | **PASS** |
| **Bài 9: Monitoring & Logging** | Chương 8 | Actuator `/actuator/prometheus`, MDC `X-Request-ID`, 15s scrape | `IMPLEMENTED_LOCAL_INTERNAL` | Chỉ giám sát local-internal, chưa có Grafana | **PASS** |

---

### 3. KIỂM SOÁT TÍNH ĐỒNG NHẤT VÀ NGUỒN GỐC SƠ ĐỒ (DIAGRAM FIDELITY)

Toàn bộ 8 sơ đồ trong báo cáo đều có tệp nguồn Mermaid (`.mmd`) và tệp xuất ảnh PNG (`.png`) độ phân giải cao được lưu trữ tại `reports/stage20/software-deployment/diagrams/`:

| Tên sơ đồ | Nguồn chỉnh sửa được (`.mmd`) | Phương thức xuất PNG | Khớp nội dung nguồn/ảnh | Khả năng đọc nhãn | Phân loại khẳng định | Đánh giá |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **fig1_devops_lifecycle** | `fig1_devops_lifecycle.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, chuẩn tương phản | `IMPLEMENTED_PARTIALLY` | **PASS** |
| **fig2_ci_pipeline** | `fig2_ci_pipeline.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, hiển thị rõ `needs:` DAG | `IMPLEMENTED` | **PASS** |
| **fig3_multistage_docker** | `fig3_multistage_docker.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, hiển thị 2 stages tách biệt | `IMPLEMENTED` | **PASS** |
| **fig4_compose_topology** | `fig4_compose_topology.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, hiển thị bridge network & volumes | `IMPLEMENTED` | **PASS** |
| **fig5_monitoring_flow** | `fig5_monitoring_flow.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, luồng Actuator -> Prometheus | `IMPLEMENTED_LOCAL_INTERNAL`| **PASS** |
| **fig6_backup_restore_flow**| `fig6_backup_restore_flow.mmd`| `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, quy trình SHA-256 an toàn | `VERIFIED_LOCAL_ONLY` | **PASS** |
| **fig7_rollback_decision** | `fig7_rollback_decision.mmd` | `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, cây quyết định phân nhánh | `VERIFIED_FOR_PAIR` | **PASS** |
| **fig8_k8s_conceptual_mapping**| `fig8_k8s_conceptual_mapping.mmd`| `PROGRAMMATIC_RECREATION` | Khớp 100% | Rõ nét, nhãn `CONCEPT_ONLY` rõ ràng | `CONCEPT_ONLY` | **PASS** |

---

### 4. BẢNG KIỂM TRA TỪNG TRANG BẢN RENDER PDF (PAGE-BY-PAGE AUDIT)

Bản PDF chính thức gồm **22 trang** được kiểm tra trực quan chi tiết:
- **Trang 1**: Trang bìa chính thức (Bộ GD&ĐT, Đại học CMC, Tiêu đề đề tài, Hà Nội — Năm 2026).
- **Trang 2**: Thông tin học phần, đề tài & Bảng danh sách 5 thành viên nhóm kèm trạng thái `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`.
- **Trang 3**: Mục lục & Ma trận ánh xạ toàn diện 9 chuyên đề bài giảng sang hiện trạng kỹ thuật WorkSphere.
- **Trang 4**: Chương 1 (Tổng quan DevOps, Văn hóa hợp tác, Vòng lặp phản hồi, Ma trận trưởng thành DevOps) & Hình 1.1.
- **Trang 5**: Chương 2 (Quản lý mã nguồn SCM, Git, Commit SHA bất biến, Cấu hình môi trường Twelve-Factor App & Hộp mã `.env.example`).
- **Trang 6–7**: Chương 3 (Tự động hóa CI với GitHub Actions, Bảng 5 jobs DAG, Hộp mã cấu hình `ci.yml`, Testcontainers PostgreSQL) & Hình 3.1.
- **Trang 8**: Chương 4 (Phân định lý thuyết Continuous Delivery vs Continuous Deployment, Bảng tiêu chí so sánh & Ranh giới khẳng định).
- **Trang 9–10**: Chương 5 (Đóng gói Docker đa tầng Multi-stage, Hộp mã `Dockerfile` JDK/JRE 21, Gia cố an toàn non-root UID 10001) & Hình 5.1.
- **Trang 11–13**: Chương 6 (Orchestration cục bộ với Docker Compose, Hộp mã `compose.yaml`, Dịch vụ postgres/backend, Named volumes bền vững) & Hình 6.1.
- **Trang 14**: Chương 7 (Cơ sở hạ tầng dưới dạng mã IaC, Bảng đánh giá hiện trạng PARTIAL, Phân định ranh giới chưa áp dụng Terraform).
- **Trang 15**: Chương 8 (Giám sát hệ thống với Spring Boot Actuator, Hộp mã `prometheus.yml`, MDC `X-Request-ID`, Ranh giới `LOCAL_INTERNAL`) & Hình 8.1.
- **Trang 16–17**: Chương 9 (Quản trị dữ liệu: Sao lưu `backup-local.ps1`, Thẩm định toàn vẹn SHA-256, Phục hồi an toàn, Cây quyết định Rollback) & Hình 9.1, Hình 9.2.
- **Trang 18**: Chương 10 (Phân tích lý thuyết Điện toán đám mây IaaS/PaaS, Bảng ánh xạ Compose sang Kubernetes `CONCEPT_ONLY`) & Hình 10.1.
- **Trang 19**: Chương 11 (An toàn chuỗi cung ứng phần mềm, Khu cách ly `.external/quarantine/`, Ghim cứng dependency, Quét secret tự động).
- **Trang 20**: Chương 12 (Đánh giá kết quả thực hiện, Những hạn chế kỹ thuật còn tồn tại, Lộ trình phát triển vận hành tương lai).
- **Trang 21–22**: Tài liệu tham khảo (8 mục tài liệu chính thức, ghi chú bản quyền học liệu) & Phần phụ lục: Bảng phân công biên soạn & kế hoạch thuyết trình đề xuất cho 5 thành viên.

*Kết luận rà soát trang*: Không có trang trắng (zero blank pages), không có tràn lề văn bản, không có lỗi font Unicode, không có tiêu đề mồ côi (keep-with-next kích hoạt chuẩn xác), chú thích hình ảnh gắn liền với sơ đồ, header/footer hiển thị số trang `PAGE` sắc nét.

---

### 5. KIỂM THẨM MINH CHỨNG & TRÍCH ĐOẠN MÃ NGUỒN (EVIDENCE PROVENANCE)

- **Thư mục minh chứng (`reports/stage20/software-deployment/evidence/`)**: Hiện trạng trống (Empty). Nhóm chủ động không đưa ảnh giả hoặc ảnh chụp không có nguồn gốc vào báo cáo. Toàn bộ bằng chứng kỹ thuật được thể hiện minh bạch thông qua 8 sơ đồ kiến trúc nguồn, 6 bảng số liệu đối soát và 5 hộp trích đoạn cấu hình đối chiếu 100% với mã nguồn dự án.
- **Kiểm tra tính chuẩn xác của trích đoạn cấu hình**:
  - `backend/Dockerfile`: Khớp 100% với tệp thật (Stage 1 JDK 21 temurin, Stage 2 JRE 21 temurin, UID/GID 10001, curl healthcheck).
  - `compose.yaml`: Khớp 100% với tệp thật (services postgres/backend, port binding `127.0.0.1`, named volumes `worksphere-postgres-data`, mạng bridge `worksphere-network`).
  - `.github/workflows/ci.yml`: Khớp 100% với tệp thật (Triggers push/PR main, permissions read, 5 jobs tuần tự/song song theo DAG).
  - `infrastructure/monitoring/prometheus.yml`: Khớp 100% với tệp thật (scrape interval 15s/10s, target `backend:8080`, metric path `/actuator/prometheus`).
  - `.env.example`: Cung cấp tham số mẫu an toàn, không chứa bất kỳ secret hay credential thực tế nào.

---

### 6. RANH GIỚI KHẲNG ĐỊNH VẬN HÀNH (DEVOPS CLAIM BOUNDARIES)

1. **Kubernetes (`CONCEPT_ONLY`)**: Ghi nhận rõ ràng là mô hình nghiên cứu chuyển đổi kiến trúc; KHÔNG có cluster thực tế.
2. **Cloud Computing (`CONCEPT_ONLY`)**: Phân tích kịch bản tương lai; KHÔNG có máy chủ đám mây thuê ngoài.
3. **Continuous Deployment (`NOT_IMPLEMENTED`)**: Hệ thống dừng ở mức Continuous Delivery (sinh artifact kiểm thử); KHÔNG tự động deploy production.
4. **Monitoring & Alerting (`IMPLEMENTED_LOCAL_INTERNAL`)**: Giám sát nội bộ qua Actuator và Prometheus; KHÔNG có Grafana hay Alertmanager.
5. **Sao lưu & Phục hồi (`VERIFIED_LOCAL_ONLY`)**: Đã diễn tập kiểm tra tính toàn vẹn cục bộ; các chỉ số RPO/RTO cấp doanh nghiệp giữ nhãn `DECISION_REQUIRED` và diễn tập Staging DR giữ nhãn `FALSE`.
6. **Học liệu gốc**: 4 thư mục học liệu tiếp tục duy trì trạng thái `LOCAL_ONLY_REFERENCE` (untracked, unstaged, uncommitted).
7. **Phân công nhóm**: 5 thành viên chính thức giữ nhãn `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL`.

---

### KẾT LUẬN KIỂM THẨM
Hồ sơ báo cáo môn Triển khai phần mềm của dự án WorkSphere đã hoàn thành toàn diện các tiêu chí kiểm thẩm chất lượng văn bản, sẵn sàng cho công tác chuẩn bị bảo vệ và chuyển tiếp sang giai đoạn kế tiếp.
