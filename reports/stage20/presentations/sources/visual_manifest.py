"""
Visual Asset Plan Manifest for WorkSphere Four-Course Presentation Decks
Stage 20F Deliverable
"""

VISUAL_ASSET_MANIFEST = [
    # Deck 1: Advanced Programming
    {
        "deck": "01_KY_NANG_LAP_TRINH_NANG_CAO",
        "slide": 4,
        "purpose": "Minh họa cấu trúc phân rã các module độc lập trong kiến trúc Modular Monolith",
        "type": "Architecture Diagram",
        "source": "reports/stage20/advanced-programming/diagrams/fig1_system_context.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20B",
        "citation": "Báo cáo Kỹ năng lập trình nâng cao (Hình 2.1)"
    },
    {
        "deck": "01_KY_NANG_LAP_TRINH_NANG_CAO",
        "slide": 7,
        "purpose": "Chu trình xử lý HTTP request qua Filter, DispatcherServlet, Controller và Service",
        "type": "Sequence Diagram",
        "source": "reports/stage20/advanced-programming/diagrams/fig2_request_lifecycle.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20B",
        "citation": "Báo cáo Kỹ năng lập trình nâng cao (Hình 5.1)"
    },
    {
        "deck": "01_KY_NANG_LAP_TRINH_NANG_CAO",
        "slide": 11,
        "purpose": "Kiến trúc phân tầng bảo mật Spring Security và chuỗi Filter Chain",
        "type": "Architecture Diagram",
        "source": "reports/stage20/advanced-programming/diagrams/fig3_clean_architecture.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20B",
        "citation": "Báo cáo Kỹ năng lập trình nâng cao (Hình 7.1)"
    },
    {
        "deck": "01_KY_NANG_LAP_TRINH_NANG_CAO",
        "slide": 14,
        "purpose": "Mô hình kim tự tháp kiểm thử phần mềm 351 Backend Tests",
        "type": "Testing Pyramid Diagram",
        "source": "reports/stage20/advanced-programming/diagrams/fig4_testing_pyramid.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20B",
        "citation": "Báo cáo Kỹ năng lập trình nâng cao (Hình 9.1)"
    },

    # Deck 2: Mobile Development
    {
        "deck": "02_PHAT_TRIEN_UNG_DUNG_DI_DONG",
        "slide": 5,
        "purpose": "Kiến trúc ứng dụng React Native phân tầng Features, Shared và Core API",
        "type": "Architecture Diagram",
        "source": "reports/stage20/mobile-development/diagrams/fig1_mobile_architecture.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20C",
        "citation": "Báo cáo Phát triển ứng dụng di động (Hình 2.1)"
    },
    {
        "deck": "02_PHAT_TRIEN_UNG_DUNG_DI_DONG",
        "slide": 6,
        "purpose": "Sơ đồ điều hướng màn hình RootNavigator, AuthNavigator và MainTabNavigator",
        "type": "Flowchart Diagram",
        "source": "reports/stage20/mobile-development/diagrams/fig2_screen_flow.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20C",
        "citation": "Báo cáo Phát triển ứng dụng di động (Hình 2.2)"
    },
    {
        "deck": "02_PHAT_TRIEN_UNG_DUNG_DI_DONG",
        "slide": 10,
        "purpose": "Giao diện màn hình mẫu đại diện: Đăng nhập & Dashboard",
        "type": "UI Screenshot (Prototype)",
        "source": "reports/stage20/mobile-development/screenshots/screen_01_login.png & screen_02_dashboard.png",
        "provenance": "PROTOTYPE_REFERENCE",
        "reuse_status": "REUSED_FROM_STAGE_20C",
        "citation": "Thiết kế giao diện chuẩn UX Android [PROTOTYPE_REFERENCE]"
    },
    {
        "deck": "02_PHAT_TRIEN_UNG_DUNG_DI_DONG",
        "slide": 11,
        "purpose": "Minh chứng 4 trạng thái giao diện: Loading, Empty, Permission Denied",
        "type": "UI Screenshot (Prototype)",
        "source": "reports/stage20/mobile-development/screenshots/screen_05_loading_state.png & screen_06_empty_state.png",
        "provenance": "PROTOTYPE_REFERENCE",
        "reuse_status": "REUSED_FROM_STAGE_20C",
        "citation": "Thiết kế 4 trạng thái giao diện [PROTOTYPE_REFERENCE]"
    },

    # Deck 3: IT Project Management
    {
        "deck": "03_QUAN_LY_DU_AN_CNTT",
        "slide": 5,
        "purpose": "Cấu trúc phân rã công việc WBS 3 cấp độ dự án WorkSphere",
        "type": "WBS Hierarchy Diagram",
        "source": "reports/stage20/it-project-management/diagrams/fig_wbs_hierarchy.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "NEW_RENDERED_FROM_VERIFIED_DATA",
        "citation": "Báo cáo Quản lý dự án CNTT (Chương 2.2)"
    },
    {
        "deck": "03_QUAN_LY_DU_AN_CNTT",
        "slide": 6,
        "purpose": "Sơ đồ mạng tiến độ PDM/CPM và đường găng Critical Path 51 ngày",
        "type": "Network Schedule Diagram",
        "source": "reports/stage20/it-project-management/diagrams/fig_pdm_cpm_network.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "NEW_RENDERED_FROM_VERIFIED_DATA",
        "citation": "Báo cáo Quản lý dự án CNTT (Chương 3.2)"
    },
    {
        "deck": "03_QUAN_LY_DU_AN_CNTT",
        "slide": 7,
        "purpose": "Biểu đồ thanh tiến độ Gantt Chart 14 gói công việc",
        "type": "Gantt Chart",
        "source": "reports/stage20/it-project-management/diagrams/fig_gantt_chart.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20D",
        "citation": "Báo cáo Quản lý dự án CNTT (Hình 3.1)"
    },
    {
        "deck": "03_QUAN_LY_DU_AN_CNTT",
        "slide": 9,
        "purpose": "Biểu đồ phân bổ tải nhân sự Workload Histogram cho 4 thành viên",
        "type": "Resource Histogram",
        "source": "reports/stage20/it-project-management/diagrams/fig_workload_histogram.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20D",
        "citation": "Báo cáo Quản lý dự án CNTT (Hình 4.2)"
    },

    # Deck 4: Software Deployment
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 2,
        "purpose": "Chu trình DevOps khép kín và ranh giới thực thi kỹ thuật",
        "type": "Lifecycle Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig1_devops_lifecycle.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 1.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 5,
        "purpose": "Pipeline CI 5 jobs DAG tự động hóa trên GitHub Actions",
        "type": "DAG Pipeline Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig2_ci_pipeline.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 3.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 8,
        "purpose": "Đóng gói Multi-stage Dockerfile JDK 21 builder sang JRE 21 runner",
        "type": "Container Architecture Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig3_multistage_docker.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 5.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 9,
        "purpose": "Topology mạng bridge Docker Compose và Named Volumes",
        "type": "Orchestration Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig4_compose_topology.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 6.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 12,
        "purpose": "Thu thập số liệu giám sát Prometheus & Spring Boot Actuator",
        "type": "Monitoring Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig5_monitoring_flow.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 8.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 13,
        "purpose": "Quy trình sao lưu và diễn tập phục hồi toàn vẹn SHA-256",
        "type": "Flowchart Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig6_backup_restore_flow.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 9.1)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 15,
        "purpose": "Cây quyết định Rollback ứng phó sự cố triển khai",
        "type": "Decision Tree Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig7_rollback_decision.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 9.2)"
    },
    {
        "deck": "04_TRIEN_KHAI_PHAN_MEM",
        "slide": 17,
        "purpose": "Bảng ánh xạ lý thuyết từ Docker Compose sang Kubernetes (CONCEPT_ONLY)",
        "type": "Conceptual Architecture Diagram",
        "source": "reports/stage20/software-deployment/diagrams/fig8_k8s_conceptual_mapping.png",
        "provenance": "REPORT_DERIVED",
        "reuse_status": "REUSED_FROM_STAGE_20E",
        "citation": "Báo cáo Triển khai phần mềm (Hình 10.1)"
    }
]
