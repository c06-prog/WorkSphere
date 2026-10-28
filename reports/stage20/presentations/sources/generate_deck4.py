"""
Generator script for Deck 4: Software Deployment (Triển Khai Phần Mềm)
20 slides as PROJECT_DEFENSE_RECOMMENDED.
"""
import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from deck_builder import (
    create_presentation, add_header, add_footer, set_speaker_notes,
    add_card, add_cover_slide, C_NAVY, C_BLUE, C_TEAL, C_DARK, C_BG_CARD, C_BORDER, C_RED, C_ORANGE
)

def build_deck():
    prs = create_presentation()
    total_slides = 20
    course_name = "Triển Khai Phần Mềm"
    course_tag = "SOFTWARE DEPLOYMENT & DEVOPS"
    
    team_members = [
        {"name": "Nguyễn Minh Hiếu", "id": "BIT247729", "role": "Nhóm trưởng (DevOps Architecture, Git SCM, Lead)"},
        {"name": "Nguyễn Văn Cường", "id": "BIT240048", "role": "Thành viên (GitHub Actions CI, Testing Gates)"},
        {"name": "Vũ Thị Thu Hướng", "id": "BIT240113", "role": "Thành viên (Docker Multi-stage, Non-root UID 10001)"},
        {"name": "Hoàng Bảo Long", "id": "BIT240142", "role": "Thành viên (Docker Compose, Bridge Network, Volumes)"},
        {"name": "Nguyễn Đức Khiêm", "id": "BIT240125", "role": "Thành viên (Actuator, Prometheus, Backup & Rollback)"}
    ]

    # --------------------------------------------------------------------------
    # SLIDE 1: COVER
    # --------------------------------------------------------------------------
    add_cover_slide(
        prs,
        title="SỔ TAY KỸ THUẬT DEVOPS & TRIỂN KHAI HỆ THỐNG WORKSPHERE\nCONTAINER HÓA, TỰ ĐỘNG HÓA CI VÀ VẬN HÀNH AN TOÀN",
        subtitle="Hiện Thực Hóa Chu Trình CI/CD, Điều Phối Docker Compose và Giám Sát Prometheus",
        course_name=course_name,
        team_members=team_members,
        notes_dict={
            "objective": "Giới thiệu đề tài học phần Triển khai phần mềm, cơ cấu nhóm 5 thành viên.",
            "narration": "Kính thưa quý Thầy Cô trong Hội đồng chấm đồ án, hôm nay nhóm 5 sinh viên chúng em xin đại diện báo cáo kết quả hiện thực hóa đề tài: Sổ tay kỹ thuật DevOps và Triển khai hệ thống WorkSphere thuộc học phần Triển khai phần mềm.",
            "duration": "1 phút",
            "speaker": "Nguyễn Minh Hiếu (BIT247729)",
            "evidence": "reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pdf",
            "question": "Quy mô triển khai thực tế của dự án WorkSphere hiện đạt tới mức độ nào?",
            "answer": "WorkSphere đã tự động hóa 100% quy trình CI trên GitHub Actions, container hóa an toàn với Docker Compose cục bộ; các khía cạnh Cloud và Kubernetes được nghiên cứu ở mức CONCEPT_ONLY.",
            "transition": "Trước hết, em xin trình bày về phạm vi DevOps và ma trận trưởng thành của hệ thống."
        }
    )

    blank_layout = prs.slide_layouts[6]

    # --------------------------------------------------------------------------
    # SLIDE 2: DEVOPS SCOPE & MATURITY MAP
    # --------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Phạm Vi DevOps & Ma Trận Trưởng Thành Vận Hành", "Tổng Quan DevOps", course_tag)
    add_footer(s2, course_name, 2, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig1_devops_lifecycle.png"
    if os.path.exists(img_path):
        s2.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s2, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Ma Trận Trưởng Thành DevOps",
             items=[
                 "Plan (Lập kế hoạch): `DOCUMENTED` — Đặc tả kỹ thuật đầy đủ.",
                 "Code / SCM (Quản lý mã): `IMPLEMENTED` — Git bất biến SHA.",
                 "Build / Test (Đóng gói & Test): `IMPLEMENTED` — Tự động 100%.",
                 "Package (Container hóa): `IMPLEMENTED` — Multi-stage Docker.",
                 "Release (Chuyển giao): `PARTIAL` — Sinh APK & Docker Image.",
                 "Deploy (Triển khai): `NOT_IMPLEMENTED` — Chưa có auto-deploy cloud.",
                 "Operate (Vận hành): `LOCAL_ONLY` — Chạy Docker Compose máy trạm.",
                 "Monitor (Giám sát): `LOCAL_INTERNAL_ONLY` — Actuator / Prometheus."
             ])

    set_speaker_notes(s2, {
        "objective": "Trình bày chu trình DevOps và phân định ranh giới trưởng thành trung thực tuyệt đối.",
        "narration": "Nhóm xây dựng ma trận trưởng thành DevOps với sự minh bạch học thuật cao nhất. Các khâu Build, Test, Package đều đạt mức IMPLEMENTED tự động hoàn toàn; tuy nhiên khâu Deploy lên máy chủ đám mây được ghi nhận rõ ràng là NOT_IMPLEMENTED do giới hạn hạ tầng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 1 Báo cáo Triển khai phần mềm",
        "question": "Tại sao nhóm không gọi đây là Closed-loop DevOps hoàn chỉnh?",
        "answer": "Bởi vì một vòng lặp closed-loop hoàn chỉnh đòi hỏi phản hồi tự động từ môi trường production thực tế và tự động co giãn; trong khi dự án hiện tại chỉ dừng ở môi trường cục bộ và bán tự động.",
        "transition": "Tiếp theo, em xin trình bày về giải pháp Quản lý mã nguồn với Git."
    })

    # --------------------------------------------------------------------------
    # SLIDE 3: SOURCE CODE MANAGEMENT (SCM)
    # --------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Quản Lý Mã Nguồn (SCM) & Nguyên Tắc Bất Biến (Immutable SHA)", "Quản Trị Phiên Bản", course_tag)
    add_footer(s3, course_name, 3, total_slides)

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Chiến Lược Git & Checkpoints",
             items=[
                 "Nhánh `main` tập trung: Mọi tích hợp đều được kiểm thử trên nhánh chính.",
                 "Mã băm commit SHA 40 ký tự bất biến: Mọi mốc nghiệm thu kỹ thuật (Checkpoints) đều được ghim cứng (ví dụ: `8a8a7ae...`), không sửa đổi lịch sử.",
                 "Tính xác định tuyệt đối (Determinism): Wrappers `mvnw` và `gradlew` bảo đảm mã nguồn biên dịch ra cùng một kết quả ở mọi nơi.",
                 "Chính sách bảo vệ tài liệu gốc: 4 thư mục học liệu được giữ nguyên trạng thái `LOCAL_ONLY_REFERENCE`."
             ])

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Vệ Sinh Kho Mã (.gitignore Hygiene)",
             items=[
                 "Loại trừ 100% tệp nhạy cảm: Tệp `.env` chứa mật khẩu thật, private keys, certificates.",
                 "Loại trừ tệp rác biên dịch: `target/`, `build/`, `node_modules/`, `.gradle/`.",
                 "Chống lộ lọt tự động: Job `repository-validation` trên CI tự động quét grep tìm kiếm các chuỗi khóa bí mật trước khi cho phép chạy tiếp.",
                 "Mẫu cấu hình an toàn `.env.example`: Cung cấp danh mục biến môi trường kèm giá trị giả lập an toàn."
             ], border_color=C_TEAL)

    set_speaker_notes(s3, {
        "objective": "Trình bày quy chuẩn quản lý mã nguồn SCM nghiêm ngặt và chính sách bảo vệ secret.",
        "narration": "Quản trị mã nguồn là nền tảng của DevOps. WorkSphere duy trì tính bất biến của các mốc bàn giao bằng commit SHA 40 ký tự. Tệp .gitignore được cấu hình nghiêm ngặt để bảo đảm không một byte dữ liệu nhạy cảm hay học liệu bản quyền nào bị đưa lên Git.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "backend/.gitignore, mobile/.gitignore, .github/workflows/ci.yml",
        "question": "Nếu vô tình commit một tệp .env có chứa secret thì nhóm xử lý thế nào?",
        "answer": "Job CI đầu tiên sẽ fail ngay lập tức do cơ chế quét grep; sau đó kỹ sư phải xoay vòng (rotate) lại secret ngay lập tức và dùng git commit --amend hoặc xóa an toàn khỏi lịch sử.",
        "transition": "Tiếp theo, bạn Nguyễn Văn Cường sẽ trình bày về pipeline CI trên GitHub Actions."
    })

    # --------------------------------------------------------------------------
    # SLIDE 4: CI TRIGGERS & GOVERNANCE
    # --------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Quy Tắc Kích Hoạt CI & Chính Sách Phân Quyền (Governance)", "Chính Sách CI", course_tag)
    add_footer(s4, course_name, 4, total_slides)

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cơ Chế Kích Hoạt (Triggers)",
             items=[
                 "Sự kiện `push`: Tự động kích hoạt khi có commit mới đẩy lên nhánh `main`.",
                 "Sự kiện `pull_request`: Tự động chạy toàn bộ bài kiểm tra trước khi phê duyệt sáp nhập vào `main`.",
                 "Kích hoạt thủ công `workflow_dispatch`: Cho phép kỹ sư vận hành chạy lại pipeline theo yêu cầu kiểm toán.",
                 "Chính sách hủy job thừa (Concurrency): `cancel-in-progress: true` tự động hủy lượt build cũ nếu có commit mới được đẩy lên liên tiếp, tiết kiệm tài nguyên máy chủ."
             ])

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Phân Quyền Tối Thiểu (Least Privilege)",
             items=[
                 "Giới hạn quyền hạn `permissions: contents: read`: Runner chỉ có quyền đọc mã nguồn, tuyệt đối không có quyền ghi hay tạo release trái phép.",
                 "Thời gian chờ tối đa (Timeouts): Mỗi job đều được ghim giới hạn thời gian (5–25 phút) để chống treo vô hạn khi mạng gặp sự cố.",
                 "Môi trường thực thi tiêu chuẩn: Khởi chạy trên máy chủ ảo sạch `ubuntu-latest` của GitHub.",
                 "Không lưu trữ bí mật: Pipeline không lưu các biến token nhạy cảm trong repository secret."
             ], border_color=C_BLUE)

    set_speaker_notes(s4, {
        "objective": "Làm rõ chính sách quản trị CI an toàn, bảo đảm nguyên tắc đặc quyền tối thiểu.",
        "narration": "Pipeline CI của WorkSphere được thiết kế theo nguyên tắc Least Privilege: runner chỉ có quyền đọc nội dung kho mã. Tính năng concurrency giúp tự động hủy các build cũ khi có commit dồn, tối ưu hóa thời gian phản hồi cho lập trình viên.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": ".github/workflows/ci.yml (permissions & concurrency blocks)",
        "question": "Tại sao phải cấu hình timeout-minutes cho từng job?",
        "answer": "Để ngăn chặn tình trạng một tiến trình bị treo vĩnh viễn (như chờ tải dependency hoặc deadlock) gây lãng phí định mức phút chạy miễn phí của GitHub Actions.",
        "transition": "Pipeline này bao gồm những jobs cụ thể nào? Em xin giới thiệu đồ thị DAG 5 jobs."
    })

    # --------------------------------------------------------------------------
    # SLIDE 5: FIVE-JOB GITHUB ACTIONS PIPELINE
    # --------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Pipeline Tích Hợp Liên Tục 5 Jobs (Đồ Thị DAG)", "Quy Trình Tự Động Hóa CI", course_tag)
    add_footer(s5, course_name, 5, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig2_ci_pipeline.png"
    if os.path.exists(img_path):
        s5.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s5, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Cấu Trúc Đồ Thị DAG",
             items=[
                 "1. `repository-validation`: Quét bí mật, kiểm tra 10 tài liệu chuẩn tắc (5 phút).",
                 "2. `backend-ci`: Checkstyle, 351 tests với Testcontainers, đóng gói JAR (20 phút). Phụ thuộc: Job 1.",
                 "3. `mobile-quality`: ESLint, Typecheck, 1,144 Jest tests (15 phút). Phụ thuộc: Job 1 (Chạy song song Job 2).",
                 "4. `android-debug-build`: Gradle assemble debug APK (25 phút). Phụ thuộc: Job 3.",
                 "5. `docker-image-build`: Đóng gói Docker image Backend (20 phút). Phụ thuộc: Job 2."
             ])

    set_speaker_notes(s5, {
        "objective": "Trình bày cấu trúc pipeline DAG 5 jobs và khả năng chạy song song tối ưu thời gian.",
        "narration": "Sơ đồ trên thể hiện cấu trúc 5 jobs có phụ thuộc DAG chặt chẽ. Sau khi Job 1 xác thực kho mã xong, Job Backend-CI và Job Mobile-Quality sẽ được kích hoạt chạy song song trên hai runner độc lập, giúp rút ngắn thời gian toàn bộ pipeline xuống chỉ còn khoảng 12-15 phút.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "reports/stage20/software-deployment/diagrams/fig2_ci_pipeline.png",
        "question": "Nếu Job 2 bị lỗi test thì Job 5 có chạy không?",
        "answer": "Do Job 5 có cấu hình needs: backend-ci, nếu Job 2 thất bại thì Job 5 sẽ tự động bị bỏ qua (Skipped) ngay lập tức, không sinh Docker image lỗi.",
        "transition": "Tiếp theo, em xin đi sâu vào các cổng kiểm soát chất lượng Backend và Mobile."
    })

    # --------------------------------------------------------------------------
    # SLIDE 6: QUALITY GATES (BACKEND & MOBILE)
    # --------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Các Cổng Kiểm Soát Chất Lượng Mã Nguồn (Quality Gates)", "Kiểm Soát Tự Động", course_tag)
    add_footer(s6, course_name, 6, total_slides)

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cổng Kiểm Soát Backend",
             items=[
                 "Checkstyle Gate: Thực thi `./mvnw checkstyle:check` đối chiếu quy chuẩn `checkstyle.xml`, bắt buộc 0 lỗi vi phạm.",
                 "351 Backend Tests: Bao phủ toàn bộ unit tests nghiệp vụ và integration tests.",
                 "Testcontainers PostgreSQL 15: Khởi tạo database container thật ngay trên runner, không dùng H2 giả lập.",
                 "Đóng gói JAR thực thi: Sản phẩm `backend-0.0.1-SNAPSHOT.jar` được lưu trữ tạm thời trên GitHub Artifacts."
             ])

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cổng Kiểm Soát Mobile",
             items=[
                 "ESLint Code Linting: Kiểm tra cú pháp và các mẫu viết mã React Native chuẩn.",
                 "TypeScript Typecheck: Thực thi `tsc --noEmit`, kiểm tra tính toàn vẹn 100% của hệ thống kiểu dữ liệu.",
                 "1,144 Jest Unit Tests: Kiểm tra toàn diện 129 suites từ Reducers đến Interceptors.",
                 "Fail-fast: Bất kỳ một lỗi cảnh báo nghiêm trọng nào cũng sẽ làm gãy pipeline ngay lập tức."
             ], border_color=C_TEAL)

    set_speaker_notes(s6, {
        "objective": "Khẳng định các tiêu chuẩn kỹ thuật khắt khe mà mã nguồn phải vượt qua trên CI.",
        "narration": "Chất lượng phần mềm không thể dựa vào cảm tính mà phải lượng hóa qua các Quality Gates. Để một dòng mã được chấp nhận vào nhánh main, nó phải vượt qua đồng thời 0 lỗi Checkstyle, 351 test backend và 1,144 test mobile có định kiểu TypeScript chặt chẽ.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "ci.yml backend-ci and mobile-quality step outputs",
        "question": "Nếu Checkstyle chỉ có cảnh báo (warning) nhỏ thì CI có cho qua không?",
        "answer": "Quy tắc Checkstyle của dự án được cấu hình failsOnError = true, mọi vi phạm dù là khoảng trắng hay quy ước đặt tên biến đều sẽ làm dừng build ngay lập tức.",
        "transition": "Sản phẩm đầu ra của nhánh Mobile trên CI là gì? Em xin trình bày về Android Debug Artifact."
    })

    # --------------------------------------------------------------------------
    # SLIDE 7: ANDROID DEBUG ARTIFACT
    # --------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Đóng Gói Bộ Cài Đặt Android Debug (APK Artifact)", "Sản Phẩm Di Động", course_tag)
    add_footer(s7, course_name, 7, total_slides)

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Quy Trình Tự Động Build APK",
             items=[
                 "Job thực thi: `android-debug-build` trên runner Ubuntu.",
                 "Thiết lập môi trường: Cài đặt tự động JDK 21 và Node.js 24.19.0.",
                 "Cài đặt phụ thuộc: Chạy `npm ci` trong thư mục mobile để đồng bộ tệp `package-lock.json`.",
                 "Lệnh biên dịch: `./gradlew assembleDebug --no-daemon --stacktrace`.",
                 "Thẩm định đầu ra: Bước kiểm tra `Verify APK Exists` bảo đảm tệp `app-debug.apk` đã được sinh ra thực sự tại thư mục outputs."
             ])

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Lưu Trữ & Ranh Giới Chữ Ký Phát Hành",
             items=[
                 "Lưu trữ Artifacts: Tải tệp `worksphere-android-debug-apk` lên GitHub Actions Artifacts với thời hạn lưu trữ (retention) 7 ngày.",
                 "Phục vụ kiểm thử: Thành viên nhóm hoặc Tester có thể tải trực tiếp tệp APK từ trang tổng quan CI về để cài đặt lên thiết bị kiểm thử.",
                 "Ranh giới phát hành trung thực:",
                 "• Bản Debug APK: ĐÃ TRIỂN KHAI VÀ TỰ ĐỘNG HÓA.",
                 "• Bản Release ký số Production: CHƯA TRIỂN KHAI (Chưa có chữ ký số Keystore thương mại)."
             ], border_color=C_ORANGE)

    set_speaker_notes(s7, {
        "objective": "Trình bày năng lực đóng gói tự động bộ cài APK và ranh giới bản Debug phục vụ kiểm thử.",
        "narration": "Pipeline CI tự động biên dịch mã nguồn React Native thành bộ cài app-debug.apk và lưu trữ trên GitHub Artifacts. Nhóm khẳng định rõ đây là bản debug phục vụ kiểm nghiệm học thuật, chưa ký chữ ký số phát hành chính thức lên Google Play Store.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": ".github/workflows/ci.yml (android-debug-build job)",
        "question": "Tại sao không build bản Release AAB luôn trên CI?",
        "answer": "Để build bản Release đòi hỏi phải lưu chứng chỉ ký (Keystore) và mật khẩu bí mật trong GitHub Secrets; việc sử dụng bản Debug là an toàn và phù hợp nhất cho khuôn khổ đồ án sinh viên.",
        "transition": "Tiếp theo, bạn Vũ Thị Thu Hướng sẽ trình bày về công nghệ đóng gói container Docker."
    })

    # --------------------------------------------------------------------------
    # SLIDE 8: MULTI-STAGE DOCKER IMAGE
    # --------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Đóng Gói Docker Image Đa Tầng (Multi-Stage Build)", "Container Hóa Backend", course_tag)
    add_footer(s8, course_name, 8, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig3_multistage_docker.png"
    if os.path.exists(img_path):
        s8.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s8, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Tối Ưu Hóa Multi-Stage Build",
             items=[
                 "Stage 1 - Builder (`eclipse-temurin:21-jdk`): Biên dịch mã nguồn Java, chạy offline dependencies, đóng gói tệp thực thi `app.jar`.",
                 "Stage 2 - Runner (`eclipse-temurin:21-jre`): Chỉ sao chép duy nhất tệp JAR hoàn chỉnh, loại bỏ toàn bộ trình biên dịch `javac` và Maven nặng nề.",
                 "Giảm kích thước vượt bậc: Dung lượng image giảm từ >850 MB xuống chỉ còn ~280 MB.",
                 "Gia cố bảo mật Non-root: Thiết lập user `worksphere` với UID 10001 / GID 10001, tuyệt đối không chạy quyền root."
             ])

    set_speaker_notes(s8, {
        "objective": "Trình bày kỹ thuật đóng gói Multi-stage Dockerfile giúp tối ưu kích thước và bảo mật.",
        "narration": "Hình 5.1 minh họa kiến trúc Dockerfile đa tầng của WorkSphere. Bằng cách tách biệt môi trường build JDK và môi trường chạy JRE, nhóm đã giảm hơn 65% dung lượng image và loại trừ hoàn toàn các công cụ biên dịch nguy hiểm khỏi môi trường runtime.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "backend/Dockerfile, fig3_multistage_docker.png",
        "question": "Chạy non-root mang lại lợi ích an ninh mạng gì cho container?",
        "answer": "Nếu ứng dụng có lỗ hổng bảo mật bị kẻ tấn công khai thác thực thi mã từ xa, họ chỉ có quyền hạn của user 10001 bị cô lập, không thể can thiệp vào kernel máy chủ host (ngăn chặn Container Breakout).",
        "transition": "Container này được điều phối hoạt động ra sao? Bạn Hoàng Bảo Long sẽ trình bày về Docker Compose."
    })

    # --------------------------------------------------------------------------
    # SLIDE 9: DOCKER COMPOSE TOPOLOGY
    # --------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Điều Phối Môi Trường Cục Bộ Với Docker Compose v2", "Điều Phối Container", course_tag)
    add_footer(s9, course_name, 9, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig4_compose_topology.png"
    if os.path.exists(img_path):
        s9.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s9, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Topology Mạng & Dịch Vụ",
             items=[
                 "Dịch vụ `postgres` (`postgres:15-alpine`): Cổng host `127.0.0.1:5433`, healthcheck lệnh `pg_isready`.",
                 "Dịch vụ `backend` (`worksphere-backend:stage17-local`): Cổng host `127.0.0.1:8080`, healthcheck lệnh `curl /actuator/health`.",
                 "Khởi động tuần tự có điều kiện: `depends_on: postgres: condition: service_healthy` bảo đảm CSDL sẵn sàng trước khi backend chạy.",
                 "Mạng nội bộ (`worksphere-network`): Driver bridge cô lập, giao tiếp an toàn qua DNS service name."
             ])

    set_speaker_notes(s9, {
        "objective": "Mô tả kiến trúc mạng bridge, hai container và cơ chế khởi động tuần tự của Docker Compose.",
        "narration": "Tệp compose.yaml thiết lập một môi trường vận hành khép kín hoàn chỉnh. Điểm nổi bật là cơ chế condition: service_healthy giúp backend chỉ được khởi động sau khi container PostgreSQL đã vượt qua bài kiểm tra pg_isready thành công, loại trừ lỗi crash do chưa kết nối được CSDL.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "compose.yaml, fig4_compose_topology.png",
        "question": "Tại sao lại ánh xạ cổng PostgreSQL máy host là 5433 thay vì 5432?",
        "answer": "Để tránh xung đột cổng nếu trên máy tính của nhà phát triển đã cài đặt sẵn một dịch vụ PostgreSQL cục bộ chạy cổng mặc định 5432.",
        "transition": "Dữ liệu và các tham số bí mật trong môi trường này được bảo vệ như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 10: ENVIRONMENT & SECRET POLICY
    # --------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Quản Trị Biến Môi Trường & Cơ Chế Fail-Fast Secret", "An Toàn Cấu Hình", course_tag)
    add_footer(s10, course_name, 10, total_slides)

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cấu Hình Twelve-Factor App",
             items=[
                 "Tách biệt hoàn toàn mã nguồn và cấu hình: Không hardcode bất kỳ mật khẩu hoặc URL máy chủ nào trong source code.",
                 "Tệp mẫu an toàn `.env.example`: Cung cấp cấu trúc tham số chuẩn, giá trị giả lập rõ ràng.",
                 "Nạp biến tự động: Docker Compose tự động đọc các giá trị thực tế từ tệp `.env` cục bộ.",
                 "Bảo vệ dữ liệu bền vững (Named Volumes):",
                 "• `worksphere-postgres-data`: Bảo tồn dữ liệu bảng và Flyway khi khởi động lại container.",
                 "• `worksphere-uploads`: Lưu trữ tài liệu đính kèm của phân hệ Request và Asset."
             ])

    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cơ Chế Bắt Lỗi Sớm (Fail-Fast Secrets)",
             items=[
                 "Khai báo cú pháp bắt buộc trong compose.yaml:",
                 "`POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Required}`",
                 "`WORKSPHERE_JWT_SECRET: ${JWT_SECRET_KEY:?Required}`",
                 "Cơ chế bảo vệ: Nếu kỹ sư quên thiết lập mật khẩu trong tệp `.env`, lệnh `docker compose up` sẽ báo lỗi cú pháp và dừng lại ngay lập tức (Fail-fast).",
                 "Ngăn chặn thảm họa an ninh: Tuyệt đối không cho phép container khởi chạy với mật khẩu mặc định rỗng hoặc giá trị không an toàn."
             ], border_color=C_RED)

    set_speaker_notes(s10, {
        "objective": "Trình bày cơ chế bảo vệ bí mật Twelve-Factor App và cú pháp Fail-Fast trong Compose.",
        "narration": "WorkSphere áp dụng cú pháp chấm hỏi chấm than trong compose.yaml. Đây là cơ chế Fail-fast cực kỳ an toàn: nếu thiếu JWT Secret Key hoặc Postgres Password, hệ thống từ chối khởi chạy ngay lập tức, ngăn ngừa rủi ro chạy dịch vụ với mật khẩu rỗng.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "compose.yaml lines with :? syntax",
        "question": "Named Volume trong Docker Compose khác gì với Bind Mount thông thường?",
        "answer": "Named Volume được Docker Engine quản lý hoàn toàn độc lập với hệ thống tệp của máy host, có hiệu năng I/O cao hơn và tránh được các lỗi về xung đột quyền truy cập tệp giữa Windows và Linux container.",
        "transition": "Tiếp theo, bạn Nguyễn Đức Khiêm sẽ trình bày về giải pháp nhật ký và giám sát hệ thống."
    })

    # --------------------------------------------------------------------------
    # SLIDE 11: LOGGING & REQUEST ID CORRELATION
    # --------------------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Tương Quan Nhật Ký Hệ Thống Với MDC & X-Request-ID", "Truy Vết Sự Cố", course_tag)
    add_footer(s11, course_name, 11, total_slides)

    add_card(s11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cơ Chế Gán Nhãn X-Request-ID",
             items=[
                 "Bộ lọc `RequestCorrelationFilter`: Đứng ở vị trí ưu tiên cao nhất trong chuỗi Filter Chain của Spring Boot.",
                 "Tiếp nhận hoặc sinh mới: Nếu client gửi kèm header `X-Request-ID`, bộ lọc sẽ kiểm tra tính an toàn; nếu không, tự động sinh mã UUID v4.",
                 "Nạp vào Mapped Diagnostic Context (MDC): Đưa mã Request ID vào luồng xử lý hiện tại của Logback.",
                 "Đính kèm Header phản hồi: Luôn trả về `X-Request-ID` cho Mobile Client trong HTTP Response Header để phục vụ tra cứu."
             ])

    add_card(s11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Giá Trị Trong Phân Tích Sự Cố (Root Cause Analysis)",
             items=[
                 "Nhật ký cấu trúc đồng nhất: Mọi dòng log phát sinh từ Controller, Service đến SQL truy vấn đều tự động mang theo mã Request ID.",
                 "Ví dụ dòng log: `2026-10-28 14:05:12 [INFO] [req-e4a1] Task status updated to IN_PROGRESS by user_01`.",
                 "Truy vết tức thời: Khi người dùng báo lỗi, kỹ sư vận hành chỉ cần lấy mã Request ID trên màn hình lỗi của app và grep trong file log để tái hiện 100% đường đi của request.",
                 "Loại bỏ tìm kiếm mù quáng trong hàng triệu dòng log."
             ], border_color=C_TEAL)

    set_speaker_notes(s11, {
        "objective": "Trình bày giải pháp tương quan nhật ký qua MDC X-Request-ID phục vụ phân tích lỗi nhanh chóng.",
        "narration": "Trong hệ thống đa luồng phục vụ nhiều người dùng cùng lúc, các dòng log xen kẽ nhau rất khó theo dõi. Nhờ RequestCorrelationFilter và MDC, mọi thao tác xử lý trong một request đều được gắn một mã UUID chung, giúp việc truy vết nguyên nhân gốc rễ chỉ mất vài giây.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "backend/src/main/java/com/worksphere/shared/logging/RequestCorrelationFilter.java",
        "question": "MDC lưu trữ dữ liệu theo cơ chế nào và có an toàn đa luồng không?",
        "answer": "MDC sử dụng ThreadLocal nội bộ để lưu trữ dữ liệu riêng biệt cho từng luồng xử lý; khi kết thúc request, bộ lọc luôn có khối finally để xóa sạch (MDC.clear()), đảm bảo an toàn tuyệt đối khi luồng được tái sử dụng trong Thread Pool.",
        "transition": "Tiếp theo, em xin giới thiệu hệ thống thu thập số liệu giám sát Prometheus."
    })

    # --------------------------------------------------------------------------
    # SLIDE 12: ACTUATOR & PROMETHEUS MONITORING
    # --------------------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Thu Thập Số Liệu Giám Sát Với Actuator & Prometheus", "Giám Sát Vận Hành", course_tag)
    add_footer(s12, course_name, 12, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig5_monitoring_flow.png"
    if os.path.exists(img_path):
        s12.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s12, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Cấu Hình & Ranh Giới Giám Sát",
             items=[
                 "Cấu hình Prometheus: Scrape định kỳ 10s–15s từ endpoint `/actuator/prometheus` của backend.",
                 "Nhóm số liệu cốt lõi: JVM Memory (Heap/Non-heap), CPU usage, Garbage Collection, HikariCP Active Connections, HTTP Response Time.",
                 "Ranh giới kỹ thuật trung thực:",
                 "• `IMPLEMENTED_LOCAL_INTERNAL`: Chỉ thu thập số liệu trên mạng Docker nội bộ.",
                 "• Grafana Dashboard: `NOT_IMPLEMENTED`.",
                 "• Alertmanager: `NOT_IMPLEMENTED`.",
                 "• Không phơi lộ cổng Prometheus ra Internet."
             ])

    set_speaker_notes(s12, {
        "objective": "Trình bày luồng giám sát số liệu chuẩn OpenMetrics và ranh giới hệ thống nội bộ.",
        "narration": "Sơ đồ trên thể hiện luồng giám sát từ Spring Boot Actuator sang Prometheus. Nhóm khẳng định rõ ranh giới kỹ thuật: hệ thống hiện thu thập số liệu nội bộ phục vụ theo dõi hiệu năng; nhóm chưa tích hợp giao diện Grafana và hệ thống gửi cảnh báo Alertmanager.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "infrastructure/monitoring/prometheus.yml, fig5_monitoring_flow.png",
        "question": "Tại sao không mở cổng Prometheus ra Internet để theo dõi từ xa?",
        "answer": "Prometheus bản mặc định không có lớp xác thực người dùng mạnh mẽ; việc bind vào localhost và mạng Docker nội bộ là nguyên tắc bảo vệ an ninh hạ tầng bắt buộc.",
        "transition": "Tiếp theo, em xin trình bày quy trình bảo đảm an toàn dữ liệu: Sao lưu và Phục hồi."
    })

    # --------------------------------------------------------------------------
    # SLIDE 13: BACKUP AUTOMATION & CHECKSUM
    # --------------------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Tự Động Hóa Sao Lưu & Thẩm Định Toàn Vẹn SHA-256", "An Toàn Dữ Liệu", course_tag)
    add_footer(s13, course_name, 13, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig6_backup_restore_flow.png"
    if os.path.exists(img_path):
        s13.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s13, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Quy Chuẩn Kịch Bản Sao Lưu",
             items=[
                 "Kịch bản `backup-local.ps1`: Tự động tương tác với PostgreSQL container xuất bản sao lưu nhị phân nén chuẩn (`pg_dump -Fc`).",
                 "Sao lưu kép (Database + Uploads): Đồng thời đóng gói thư mục tệp đính kèm `/app/uploads` vào tệp nén riêng biệt.",
                 "Kịch bản `verify-backup.ps1`: Tự động kiểm tra tính khả đọc của bản sao lưu bằng lệnh `pg_restore --list`.",
                 "Tính toán mã băm SHA-256: Lưu trữ mã băm vào tệp manifest để chống can thiệp hoặc sửa đổi dữ liệu trái phép.",
                 "Chính sách lưu trữ (Retention): Tự động dọn dẹp các bản sao lưu cũ quá thời hạn cấu hình."
             ])

    set_speaker_notes(s13, {
        "objective": "Trình bày quy trình sao lưu dữ liệu tự động và kiểm tra tính toàn vẹn bằng SHA-256.",
        "narration": "Sao lưu mà không kiểm tra tính toàn vẹn là một rủi ro lớn. Kịch bản của WorkSphere không chỉ gọi pg_dump mà còn ngay lập tức chạy verify-backup.ps1 để kiểm tra bảng mục lục bên trong tệp nén và sinh mã băm SHA-256 đối soát.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "scripts/backup-local.ps1, scripts/verify-backup.ps1",
        "question": "Tại sao lại chọn định dạng pg_dump -Fc (Custom Format)?",
        "answer": "Định dạng Custom Format vừa nén dữ liệu giúp tiết kiệm dung lượng đĩa, vừa cho phép phục hồi linh hoạt có chọn lọc từng bảng hoặc chạy phục hồi song song nhiều luồng qua pg_restore.",
        "transition": "Sau khi có bản sao lưu an toàn, quy trình phục hồi diễn ra như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 14: ISOLATED RESTORE REHEARSAL
    # --------------------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Diễn Tập Phục Hồi Dữ Liệu Trên Môi Trường Cô Lập", "Khôi Phục Thảm Họa", course_tag)
    add_footer(s14, course_name, 14, total_slides)

    add_card(s14, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Kịch Bản restore-local.ps1",
             items=[
                 "Khởi chạy môi trường kiểm thử cô lập (Sandbox Container): Không phục hồi trực tiếp lên database đang chạy để tránh rủi ro mất mát.",
                 "Xác minh mã băm Checksum SHA-256: Bản sao lưu phải trùng khớp 100% mã băm đã lưu trước đó.",
                 "Thực thi khôi phục cấu trúc & dữ liệu: Sử dụng lệnh `pg_restore --clean --if-exists`.",
                 "Kiểm tra tính toàn vẹn nghiệp vụ: Tự động đếm số lượng bản ghi của các bảng trọng yếu (Users, Projects, Tasks) để bảo đảm không bị mất dữ liệu."
             ])

    add_card(s14, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ranh Giới Vận Hành Thực Nghiệm",
             items=[
                 "`BACKUP_CREATED_LOCALLY`: ĐÃ XÁC MINH.",
                 "`RESTORE_VERIFIED_LOCALLY`: ĐÃ DIỄN TẬP THÀNH CÔNG.",
                 "Ranh giới công bố minh bạch:",
                 "• `STAGING_DR_NOT_READY`: Chưa có môi trường khôi phục thảm họa Staging.",
                 "• `PRODUCTION_DR_NOT_READY`: Chưa triển khai máy chủ dự phòng Production.",
                 "• Chỉ số cam kết `RPO` & `RTO`: Giữ nhãn `DECISION_REQUIRED` (Chờ quyết định chính thức của ban lãnh đạo doanh nghiệp)."
             ], border_color=C_ORANGE)

    set_speaker_notes(s14, {
        "objective": "Trình bày kết quả diễn tập phục hồi dữ liệu thành công và công bố giới hạn DR trung thực.",
        "narration": "Nhóm đã thực hiện diễn tập phục hồi thành công trên môi trường cô lập, đối soát chính xác 100% số lượng bản ghi. Nhóm công bố minh bạch rằng các chỉ số RPO và RTO cấp doanh nghiệp vẫn ở trạng thái DECISION_REQUIRED do chưa có hạ tầng sao lưu đa vùng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "scripts/restore-local.ps1, Stage 19D Restore Rehearsal Report",
        "question": "RPO và RTO là gì trong quản trị vận hành phần mềm?",
        "answer": "RPO là khoảng thời gian mất mát dữ liệu tối đa chấp nhận được (tính từ lần backup gần nhất), còn RTO là thời gian tối đa để khôi phục hệ thống hoạt động trở lại sau sự cố.",
        "transition": "Nếu phiên bản mới triển khai gặp lỗi, hệ thống Rollback như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 15: APPLICATION ROLLBACK
    # --------------------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "Cây Quyết Định Lùi Phiên Bản (Application Rollback)", "Ứng Phó Sự Cố Triển Khai", course_tag)
    add_footer(s15, course_name, 15, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig7_rollback_decision.png"
    if os.path.exists(img_path):
        s15.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s15, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Cây Quyết Định & Nguyên Tắc Rollback",
             items=[
                 "Nhánh 1 - Sự cố chỉ do mã nguồn ứng dụng (Code-only issue): Chỉ cần dừng container và lùi tag Docker image về phiên bản ổn định trước đó (`IMAGE_TAG_PREVIOUS`).",
                 "Nhánh 2 - Sự cố do thay đổi cấu trúc CSDL (Flyway Migration issue): Bắt buộc phải khôi phục cơ sở dữ liệu từ bản backup hợp lệ trước triển khai, kết hợp lùi image.",
                 "Ranh giới khẳng định: Nhóm khẳng định an toàn rollback chỉ được chứng minh cho cặp phiên bản cụ thể đã diễn tập (`ROLLBACK_VERIFIED_FOR_SPECIFIC_PAIR`); không khái quát hóa cho mọi phiên bản tương lai."
             ])

    set_speaker_notes(s15, {
        "objective": "Mô tả cây quyết định Rollback và khẳng định tính an toàn phụ thuộc vào bản chất sự cố.",
        "narration": "Hình 9.2 thể hiện cây quyết định rollback. Nếu chỉ là lỗi code logic, việc lùi image diễn ra trong vài giây. Nhưng nếu đã chạy migration làm biến đổi bảng, bắt buộc phải restore lại CSDL trước khi lùi phiên bản backend để tránh sai lệch dữ liệu.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "scripts/rollback-local.ps1, fig7_rollback_decision.png",
        "question": "Tại sao không thể áp dụng rollback tự động khi có migration cơ sở dữ liệu?",
        "answer": "Bởi vì các câu lệnh DDL xóa cột hoặc đổi kiểu dữ liệu có thể làm mất dữ liệu vĩnh viễn; việc rollback cơ sở dữ liệu đòi hỏi sự đánh giá cẩn trọng của DBA để tránh ghi đè dữ liệu phát sinh mới.",
        "transition": "Tiếp theo, nhóm trưởng Nguyễn Minh Hiếu sẽ làm rõ ranh giới Continuous Delivery của dự án."
    })

    # --------------------------------------------------------------------------
    # SLIDE 16: CONTINUOUS DELIVERY BOUNDARY
    # --------------------------------------------------------------------------
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, "Phân Định Ranh Giới: Continuous Delivery vs Deployment", "Ranh Giới Phát Hành", course_tag)
    add_footer(s16, course_name, 16, total_slides)

    add_card(s16, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Continuous Delivery (ĐÃ TRIỂN KHAI MỘT PHẦN)",
             items=[
                 "Tự động hóa toàn bộ quá trình biên dịch và kiểm thử trên CI.",
                 "Đóng gói tự động các sản phẩm bàn giao (Artifacts): Tệp `app-debug.apk` và Docker image.",
                 "Lưu trữ sẵn sàng trên máy chủ CI để tải về khi cần nghiệm thu.",
                 "Quyết định phát hành phụ thuộc vào sự phê duyệt của con người (Manual Approval Gate)."
             ], border_color=C_BLUE)

    add_card(s16, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Continuous Deployment (CHƯA TRIỂN KHAI)",
             items=[
                 "Tự động đẩy (Push) image lên kho chứa công cộng Docker Hub hoặc GitHub Container Registry: `NOT_IMPLEMENTED`.",
                 "Tự động kích hoạt Webhook cập nhật máy chủ Staging/Production: `NOT_IMPLEMENTED`.",
                 "Tự động triển khai không cần con người can thiệp: `NOT_IMPLEMENTED`.",
                 "Lý do: Đảm bảo kiểm soát rủi ro an toàn và phù hợp với quy mô một dự án đồ án học thuật."
             ], border_color=C_RED)

    set_speaker_notes(s16, {
        "objective": "Làm rõ sự khác biệt giữa Continuous Delivery và Deployment theo đúng chuẩn mực học phần.",
        "narration": "Nhóm phân định rạch ròi: dự án WorkSphere đã hoàn thành Continuous Delivery ở mức sinh ra các release artifacts sẵn sàng sử dụng. Tuy nhiên nhóm chủ động không triển khai Continuous Deployment tự động đẩy lên server để tránh các rủi ro vận hành ngoài tầm kiểm soát.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 4 Báo cáo Triển khai phần mềm",
        "question": "Muốn nâng cấp từ Continuous Delivery lên Continuous Deployment thì cần thêm gì?",
        "answer": "Cần cấu hình tài khoản Docker Registry, tạo môi trường Staging đám mây có kiểm thử E2E tự động, và thiết lập chiến lược triển khai Blue-Green hoặc Canary Deployment kèm công cụ tự động rollback.",
        "transition": "Tiếp theo, em xin trình bày về mô hình ánh xạ lý thuyết sang Kubernetes."
    })

    # --------------------------------------------------------------------------
    # SLIDE 17: KUBERNETES CONCEPTUAL MAPPING (CONCEPT_ONLY)
    # --------------------------------------------------------------------------
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, "Mô Hình Ánh Xạ Lý Thuyết Sang Kubernetes (CONCEPT_ONLY)", "Nghiên Cứu Cloud Native", course_tag)
    add_footer(s17, course_name, 17, total_slides)

    img_path = "reports/stage20/software-deployment/diagrams/fig8_k8s_conceptual_mapping.png"
    if os.path.exists(img_path):
        s17.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s17, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Bảng Đối Soát Khái Niệm Tương Đương",
             items=[
                 "Service `backend` -> `Deployment` (Quản lý Pods, Replicas >= 2, tự động co giãn).",
                 "Service `postgres` -> `StatefulSet` (Định danh mạng cố định, lưu trữ bền vững).",
                 "Named Volume -> `PersistentVolumeClaim` (PVC) gắn kết đĩa mạng đám mây.",
                 "Bridge Network -> `ClusterIP` & `Ingress Controller` (Định tuyến lưu lượng HTTPS).",
                 "Tệp `.env` -> `ConfigMap` (cấu hình thường) & `Secret` (mật khẩu mã hóa).",
                 "Khẳng định rõ: Hoàn toàn ở mức `CONCEPT_ONLY`, CHƯA khởi tạo cụm K8s thực tế."
             ], border_color=C_ORANGE)

    set_speaker_notes(s17, {
        "objective": "Trình bày bài tập lớn nghiên cứu Bài 8 (Kubernetes) và dán nhãn CONCEPT_ONLY trung thực.",
        "narration": "Hình 8.1 thể hiện bảng ánh xạ từ Compose sang Kubernetes. Đây là sản phẩm nghiên cứu lý thuyết phục vụ chuyên đề bài học Cloud Native của học phần; nhóm khẳng định rõ dự án chưa khởi tạo cụm Kubernetes thật để không gây ngộ nhận cho Hội đồng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/software-deployment/diagrams/fig8_k8s_conceptual_mapping.png",
        "question": "Tại sao cơ sở dữ liệu trong Kubernetes lại dùng StatefulSet mà không dùng Deployment?",
        "answer": "Bởi vì cơ sở dữ liệu có trạng thái (Stateful), đòi hỏi tên Pod cố định theo thứ tự (pod-0, pod-1) và mỗi Pod gắn với một ổ đĩa PVC riêng biệt; Deployment chỉ phù hợp cho các ứng dụng stateless.",
        "transition": "Tiếp theo, em xin tóm tắt các khoảng trống kỹ thuật cần hoàn thiện trước khi đưa lên Production."
    })

    # --------------------------------------------------------------------------
    # SLIDE 18: GAPS BEFORE STAGING / PRODUCTION
    # --------------------------------------------------------------------------
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, "Khoảng Trống Kỹ Thuật Trước Khi Lên Staging / Production", "Đánh Giá Khoảng Trống", course_tag)
    add_footer(s18, course_name, 18, total_slides)

    add_card(s18, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Các Khoảng Trống Hạ Tầng Cốt Lõi",
             items=[
                 "Chưa có hạ tầng đám mây công cộng: Hiện chạy 100% trên môi trường cục bộ (Single-host Docker Compose).",
                 "Chưa có chứng chỉ số TLS/HTTPS chính thức: Giao tiếp mạng nội bộ đang dùng giao thức HTTP thô.",
                 "Chưa có tường lửa ứng dụng (WAF) & Cân bằng tải (Load Balancer) để chống tấn công DDoS.",
                 "Chưa cấu hình sao lưu ngoài máy chủ (Offsite Backup lưu trữ sang Amazon S3 / Google Cloud Storage)."
             ], border_color=C_ORANGE)

    add_card(s18, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Các Khoảng Trống Giám Sát & Vận Hành",
             items=[
                 "Chưa có giao diện trực quan hóa dữ liệu Grafana Dashboard.",
                 "Chưa có hệ thống tự động bắn cảnh báo sự cố (Alertmanager qua Telegram / Slack / PagerDuty).",
                 "Chưa có hệ thống thu thập log tập trung (ELK Stack / Loki) cho môi trường phân tán.",
                 "Kế hoạch khắc phục: Đã được nhóm lập kế hoạch chi tiết trong lộ trình nâng cấp sau đồ án."
             ], border_color=C_RED)

    set_speaker_notes(s18, {
        "objective": "Thể hiện tư duy vận hành trưởng thành, nhận biết chính xác các điều kiện cần để lên Production.",
        "narration": "Một kỹ sư DevOps giỏi không chỉ biết những gì đã làm được mà còn phải thấy rõ những khoảng trống cần hoàn thiện. Để đưa WorkSphere lên môi trường sản xuất thật, hệ thống cần bổ sung chứng chỉ HTTPS, dịch vụ lưu trữ sao lưu offsite trên đám mây và hệ thống cảnh báo Alertmanager.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 12 Báo cáo Triển khai phần mềm",
        "question": "Nếu hệ thống bị tấn công DDoS thì hiện tại sẽ bị ảnh hưởng như thế nào?",
        "answer": "Do hiện chạy trên host đơn không có WAF hoặc CDN cân bằng tải, máy chủ sẽ bị cạn kiệt tài nguyên CPU/RAM dẫn đến gián đoạn dịch vụ; đây là điểm bắt buộc phải bổ sung khi lên đám mây.",
        "transition": "Tiếp theo, em xin tổng kết các bài học kinh nghiệm và kết quả đạt được."
    })

    # --------------------------------------------------------------------------
    # SLIDE 19: LESSONS LEARNED & TECHNICAL OUTCOMES
    # --------------------------------------------------------------------------
    s19 = prs.slides.add_slide(blank_layout)
    add_header(s19, "Bài Học Kinh Nghiệm & Kết Quả Đạt Được Của Dự Án", "Tổng Kết Học Thuật", course_tag)
    add_footer(s19, course_name, 19, total_slides)

    add_card(s19, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Bài Học Vận Hành Đúc Rút Được",
             items=[
                 "Văn hóa Shift-Left: Tích hợp kiểm tra bảo mật và chất lượng mã nguồn ngay từ đầu giúp tiết kiệm hàng tuần sửa lỗi vào cuối dự án.",
                 "Tính xác định của môi trường: Việc khóa cứng phiên bản công cụ qua Wrappers loại bỏ hoàn toàn các lỗi 'chạy được trên máy em'.",
                 "Không có sao lưu an toàn nếu không diễn tập: Việc viết script phục hồi và kiểm tra checksum quan trọng tương đương việc viết script backup.",
                 "Quy trình tự động hóa giúp giải phóng sức lao động, nâng cao năng suất nhóm."
             ])

    add_card(s19, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Thành Tựu Kỹ Thuật Đã Bàn Giao",
             items=[
                 "Xây dựng thành công pipeline GitHub Actions 5 jobs vận hành ổn định và tin cậy.",
                 "Đóng gói container đa tầng JRE 21 tối ưu hóa dung lượng ~280 MB và bảo mật non-root UID 10001.",
                 "Điều phối hệ thống hoàn chỉnh với Docker Compose v2 kết nối an toàn cơ sở dữ liệu PostgreSQL.",
                 "Bộ kịch bản PowerShell tự động hóa sao lưu, thẩm định toàn vẹn và diễn tập khôi phục cục bộ.",
                 "Báo cáo học thuật 22 trang PDF đối soát trọn vẹn 9 bài giảng học phần."
             ], border_color=C_BLUE)

    set_speaker_notes(s19, {
        "objective": "Khẳng định các giá trị tri thức và sản phẩm kỹ thuật thực chất mà nhóm đã làm chủ.",
        "narration": "Qua học phần Triển khai phần mềm, nhóm đã tích lũy được những kinh nghiệm thực chiến vô cùng quý báu về văn hóa DevOps, tự động hóa CI/CD và an toàn dữ liệu. Toàn bộ các công cụ từ GitHub Actions, Dockerfile, Compose đến script backup đều được nhóm làm chủ và bàn giao đầy đủ.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/software-deployment/BAO_CAO_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pdf",
        "question": "Kinh nghiệm nào nhóm thấy tâm đắc nhất trong học phần này?",
        "answer": "Đó là kinh nghiệm thiết lập cổng tự động hóa Fail-fast: mọi sai sót dù là nhỏ nhất về cú pháp hay secret đều bị chặn lại ngay từ commit đầu tiên, giúp kho mã luôn ở trạng thái sẵn sàng phát hành.",
        "transition": "Cuối cùng, nhóm xin chuyển sang phần hỏi đáp cùng Hội đồng chấm thi."
    })

    # --------------------------------------------------------------------------
    # SLIDE 20: Q&A / REPOSITORY EVIDENCE
    # --------------------------------------------------------------------------
    s20 = prs.slides.add_slide(blank_layout)
    add_header(s20, "Hỏi Đáp (Q&A) & Minh Chứng Vận Hành Khả Dụng", "Kết Thúc Thuyết Trình", course_tag)
    add_footer(s20, course_name, 20, total_slides)

    add_card(s20, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Lời Cảm Ơn Từ Nhóm 5 Sinh Viên",
             items=[
                 "Nhóm sinh viên xin trân trọng cảm ơn quý Thầy/Cô trong Hội đồng đã dành thời gian theo dõi bài báo cáo!",
                 "Nhóm rất mong nhận được những góp ý chuyên môn từ Thầy/Cô để tiếp tục hoàn thiện năng lực DevOps trong tương lai.",
                 "Kính chúc quý Thầy Cô sức khỏe và thành công!"
             ], border_color=C_BLUE)

    add_card(s20, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Danh Mục Bằng Chứng Sẵn Sàng Đối Soát",
             items=[
                 "Pipeline CI thực tế: `.github/workflows/ci.yml` trên GitHub Actions.",
                 "Container hóa: `backend/Dockerfile` & `compose.yaml`.",
                 "Cấu hình giám sát: `infrastructure/monitoring/prometheus.yml`.",
                 "Kịch bản vận hành: `scripts/backup-local.ps1`, `restore-local.ps1`.",
                 "Báo cáo học thuật: `reports/stage20/software-deployment/`.",
                 "Nhóm sẵn sàng khởi chạy demo trực tiếp theo yêu cầu của Hội đồng!"
             ], border_color=C_TEAL)

    set_speaker_notes(s20, {
        "objective": "Kết thúc bài thuyết trình Triển khai phần mềm chuyên nghiệp, mời Hội đồng đặt câu hỏi và theo dõi demo.",
        "narration": "Bài báo cáo học phần Triển khai phần mềm của nhóm xin được kết thúc tại đây. Nhóm chúng em đã sẵn sàng mở Docker Desktop, kích hoạt các kịch bản PowerShell hoặc đối soát mã nguồn trên GitHub Actions theo yêu cầu của Hội đồng.",
        "duration": "1 phút",
        "speaker": "Toàn thể thành viên nhóm",
        "evidence": "Kho mã nguồn và kịch bản vận hành D:\\WorkSphere",
        "question": "Hội đồng yêu cầu chạy lệnh docker compose up -d và kiểm tra trạng thái healthcheck của backend.",
        "answer": "Dạ vâng, em xin phép mở terminal và chạy lệnh docker compose up -d, sau đó dùng lệnh docker ps để Hội đồng thấy trạng thái (healthy) của cả hai container postgres và backend.",
        "transition": "Sẵn sàng trả lời câu hỏi và thao tác lệnh trên terminal."
    })

    out_path = "reports/stage20/presentations/04_TRIEN_KHAI_PHAN_MEM_WORKSPHERE.pptx"
    prs.save(out_path)
    print(f"Deck 4 generated successfully: {out_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    build_deck()
