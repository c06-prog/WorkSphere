# BÁO CÁO NGHIỆM THU: ROADMAP STAGE 20E
## SOFTWARE DEPLOYMENT & DEVOPS TECHNICAL HANDBOOK (TRIỂN KHAI PHẦN MỀM)

---

### THÔNG TIN TỔNG QUAN
- **Dự án**: Nền tảng Quản trị Doanh nghiệp WorkSphere (Enterprise Operations Platform)
- **Học phần**: Triển khai phần mềm (Software Deployment)
- **Khoa**: Công nghệ Thông tin & Truyền thông — Trường Đại học CMC
- **Trạng thái nghiệm thu**: `ROADMAP_STAGE_20E_SOFTWARE_DEPLOYMENT_REPORT_COMPLETE_READY_FOR_20F`
- **Starting Checkpoint**: `37c4d7e8e5e0874d234b30e2db94746b153fead5`
- **Mô hình tài liệu**: Sổ tay Kỹ thuật & Báo cáo Học thuật (Technical Handbook & Academic Report)
- **Hình thức định dạng**: `PROJECT_DEFINED_FORMAT` (do Giảng viên không ban hành mẫu báo cáo)
- **Quy mô trang đề xuất (Project Proposal)**: 25–35 trang (Đạt 22 trang thực tế trong bản render PDF)

---

### DANH SÁCH THÀNH VIÊN NHÓM VÀ PHÂN CÔNG ĐỀ XUẤT
Trạng thái phân công: `PROPOSED_ASSIGNMENT_PENDING_USER_APPROVAL` (Đề xuất phân công trách nhiệm học thuật chờ phê duyệt chính thức):

| STT | Họ và Tên | Mã Sinh Viên | Vai trò đề xuất | Trách nhiệm chuyên môn chính |
|:---:|:---|:---:|:---|:---|
| 1 | **Nguyễn Minh Hiếu** | **BIT247729** | **Nhóm trưởng (Team Leader)** | Kiến trúc chu trình DevOps, quản trị Git SCM, điều phối phát hành & an toàn chuỗi cung ứng |
| 2 | **Nguyễn Văn Cường** | **BIT240048** | Thành viên | Xây dựng pipeline CI với GitHub Actions, tự động hóa build & kiểm thử Backend |
| 3 | **Vũ Thị Thu Hướng** | **BIT240113** | Thành viên | Đóng gói Docker đa tầng (Multi-stage), cấu hình non-root UID 10001 & Healthcheck |
| 4 | **Hoàng Bảo Long** | **BIT240142** | Thành viên | Thiết kế kiến trúc điều phối Docker Compose, mạng bridge & quản trị dữ liệu bền vững |
| 5 | **Nguyễn Đức Khiêm** | **BIT240125** | Thành viên | Giám sát hệ thống Prometheus, Spring Actuator, phân tích Cloud/K8s & Backup/Restore |

---

### MA TRẬN ĐỐI SOÁT 9 BÀI GIẢNG HỌC PHẦN & TÍNH TRUNG THỰC KỸ THUẬT

| STT | Bài giảng học phần | Khái niệm học thuật | Hiện trạng kỹ thuật WorkSphere | Phân loại & Ranh giới khẳng định |
|:---:|:---|:---|:---|:---|
| 1 | **Bài 1: Giới thiệu DevOps** | Văn hóa phối hợp, tự động hóa, phản hồi nhanh | Áp dụng văn hóa DevOps khép kín, wrappers (`mvnw`, `gradlew`), ghim Node runtime, scripts | `IMPLEMENTED_PARTIALLY` |
| 2 | **Bài 2: Cloud Computing** | Mô hình IaaS, PaaS, SaaS, Public/Hybrid Cloud | Phân tích lý thuyết kịch bản triển khai đám mây (AWS/GCP) trong tương lai; không có cloud host thực tế | `CONCEPT_ONLY` |
| 3 | **Bài 3: SCM & Git** | Kiểm soát phiên bản, commit, branch, merge, tag | Quản lý Git chuẩn hóa, nhánh `main`, commit SHA bất biến 40 ký tự, cấu hình `.gitignore` bảo vệ học liệu | `IMPLEMENTED` |
| 4 | **Bài 4: Continuous Integration** | Tự động hóa build, test, secret scan, gate | GitHub Actions 5 jobs song song (351 backend tests, 1,144 Jest mobile tests, Checkstyle 0 lỗi) | `IMPLEMENTED` |
| 5 | **Bài 5: Continuous Delivery** | Đóng gói phát hành, phân định CD vs Deployment | Tự động build artifact APK debug và Docker image; hệ thống chưa tự động deploy production | `PARTIAL` (Continuous Delivery: Có; Continuous Deployment: Không) |
| 6 | **Bài 6: Infrastructure as Code** | Khai báo hạ tầng dạng mã, tính tái lặp | Dockerfile đa tầng, `compose.yaml`, `prometheus.yml`, kịch bản PowerShell; chưa áp dụng Terraform | `PARTIAL` |
| 7 | **Bài 7: Docker Container** | Image, Container, Multi-stage, Non-root, Health | Multi-stage JDK 21 -> JRE 21, user phi đặc quyền UID 10001, curl healthcheck, image size tối ưu | `IMPLEMENTED` |
| 8 | **Bài 8: Kubernetes** | Pod, Deployment, Service, PVC, Ingress, Scaling | Thiết lập bảng ánh xạ lý thuyết từ Docker Compose sang tài nguyên Kubernetes chuẩn Cloud Native | `CONCEPT_ONLY` |
| 9 | **Bài 9: Monitoring & Logging** | Metrics, Log correlation, Health, Prometheus | Spring Boot Actuator, Prometheus scrape định kỳ 15s, gắn nhãn MDC `X-Request-ID`; Grafana chưa bật | `IMPLEMENTED_LOCAL_INTERNAL` |

---

### RANH GIỚI KHẲNG ĐỊNH KỸ THUẬT NGHIÊM NGẶT (CLAIM BOUNDARIES)
1. **Kubernetes (`CONCEPT_ONLY`)**: Toàn bộ nội dung Kubernetes được trình bày dưới góc độ phân tích kiến trúc chuyển đổi từ Docker Compose sang Pod/Deployment/StatefulSet/PVC nhằm phục vụ học thuật. Không tự nhận đã chạy Kubernetes cluster trên thực tế.
2. **Cloud Computing (`CONCEPT_ONLY`)**: Phân tích so sánh IaaS vs PaaS vs SaaS và thiết kế mô hình Staging/Production giả định. Không bịa đặt tài khoản AWS/GCP hoặc máy chủ đám mây đã thuê.
3. **Continuous Deployment (`NOT_IMPLEMENTED`)**: Phân định rạch ròi giữa Continuous Delivery (tự động đóng gói APK và Docker image) và Continuous Deployment (tự động đưa lên production mà không cần phê duyệt). Dự án chỉ dừng ở mức Continuous Delivery.
4. **Monitoring & Alerting (`IMPLEMENTED_LOCAL_INTERNAL`)**: Thu thập số liệu qua Actuator endpoint `/actuator/prometheus` với máy chủ Prometheus local. Grafana Dashboard và Alertmanager được ghi nhận là `NOT_IMPLEMENTED` để tránh thổi phồng kết quả.
5. **Sao lưu & Phục hồi (`VERIFIED_LOCAL_ONLY`)**: Kịch bản `backup-local.ps1`, `verify-backup.ps1`, `restore-local.ps1`, `rollback-local.ps1` đã được kiểm thử tính toàn vẹn trên môi trường cục bộ; các chỉ số RPO/RTO cấp doanh nghiệp được dán nhãn `DECISION_REQUIRED` và kiểm thử khôi phục thảm họa Staging được đánh dấu `FALSE`.

---

### DANH MỤC CÁC TỆP BÀN GIAO STAGE 20E
1. `reports/stage20/software-deployment/SOFTWARE_DEPLOYMENT_REPORT_SOURCE.md`: Toàn văn nội dung báo cáo kỹ thuật 12 chương, ma trận môn học, trích xuất mã nguồn, sơ đồ và phụ lục.
2. `reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.docx`: Tài liệu Word chuẩn định dạng đại học, có thể chỉnh sửa, nhúng đầy đủ bảng biểu và 8 sơ đồ kỹ thuật.
3. `reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pdf`: Bản xuất PDF chính thức phục vụ in ấn và nộp báo cáo (quy mô chuẩn 22 trang, nằm hoàn hảo trong khung 25–35 trang).
4. `reports/stage20/software-deployment/diagrams/`: 8 sơ đồ kiến trúc nguồn Mermaid (`.mmd`) và ảnh render độ phân giải cao (`.png`):
   - `fig1_devops_lifecycle.mmd` / `.png`
   - `fig2_ci_pipeline.mmd` / `.png`
   - `fig3_multistage_docker.mmd` / `.png`
   - `fig4_compose_topology.mmd` / `.png`
   - `fig5_monitoring_flow.mmd` / `.png`
   - `fig6_backup_restore_flow.mmd` / `.png`
   - `fig7_rollback_decision.mmd` / `.png`
   - `fig8_k8s_conceptual_mapping.mmd` / `.png`
5. `reports/ROADMAP_STAGE_20E_SOFTWARE_DEPLOYMENT_REPORT.md`: Báo cáo nghiệm thu và ma trận phân công trách nhiệm nhóm.
