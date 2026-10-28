"""
Generator script for Deck 1: Advanced Programming (Kỹ Năng Lập Trình Nâng Cao)
18 slides as PROJECT_DEFENSE_RECOMMENDED.
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
    total_slides = 18
    course_name = "Kỹ Năng Lập Trình Nâng Cao"
    course_tag = "ADVANCED PROGRAMMING"
    
    team_members = [
        {"name": "Nguyễn Minh Hiếu", "id": "BIT247729", "role": "Nhóm trưởng (Architecture, Modular Monolith, Lead)"},
        {"name": "Nguyễn Văn Cường", "id": "BIT240048", "role": "Thành viên (Spring MVC, REST APIs, Validation)"},
        {"name": "Hoàng Bảo Long", "id": "BIT240142", "role": "Thành viên (Spring Security, JWT, 4 Roles RBAC)"},
        {"name": "Vũ Thị Thu Hướng", "id": "BIT240113", "role": "Thành viên (Spring Data JPA, Flyway, Testing)"},
        {"name": "Nguyễn Đức Khiêm", "id": "BIT240125", "role": "Thành viên (IoC/AOP Proxy, Actuator, Logging)"}
    ]

    # --------------------------------------------------------------------------
    # SLIDE 1: COVER
    # --------------------------------------------------------------------------
    add_cover_slide(
        prs,
        title="THIẾT KẾ & PHÁT TRIỂN NỀN TẢNG WORKSPHERE\nDỰA TRÊN SPRING BOOT VÀ JAVA 21 LTS",
        subtitle="Hệ thống Quản trị Vận hành Doanh nghiệp theo Kiến trúc Modular Monolith",
        course_name=course_name,
        team_members=team_members,
        notes_dict={
            "objective": "Giới thiệu đề tài, giảng viên hướng dẫn, cấu trúc nhóm và học phần bảo vệ.",
            "narration": "Kính thưa quý thầy cô trong Hội đồng chấm đồ án, hôm nay nhóm chúng em xin đại diện báo cáo kết quả nghiên cứu và hiện thực hóa đề tài: Thiết kế và phát triển nền tảng quản trị vận hành doanh nghiệp WorkSphere dựa trên Spring Boot và Java 21 LTS thuộc học phần Kỹ năng lập trình nâng cao.",
            "duration": "1 phút",
            "speaker": "Nguyễn Minh Hiếu (BIT247729)",
            "evidence": "reports/stage20/advanced-programming/BAO_CAO_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pdf",
            "question": "Quy mô và mục tiêu chính của dự án WorkSphere là gì?",
            "answer": "WorkSphere là giải pháp quản trị điều hành tập trung cho doanh nghiệp vừa và nhỏ, bao gồm 4 phân hệ chính: Quản lý dự án, Công việc, Yêu cầu dịch vụ nội bộ và Quản trị tài sản số.",
            "transition": "Tiếp theo, em xin trình bày bối cảnh bài toán và lý do nhóm lựa chọn đề tài này."
        }
    )

    # --------------------------------------------------------------------------
    # SLIDE 2: BUSINESS PROBLEM & WORKSPHERE GOAL
    # --------------------------------------------------------------------------
    blank_layout = prs.slide_layouts[6]
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Bài Toán Nghiệp Vụ & Mục Tiêu Dự Án WorkSphere", "Bối Cảnh & Động Lực", course_tag)
    add_footer(s2, course_name, 2, total_slides)

    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Thực Trạng Vận Hành Doanh Nghiệp",
             items=[
                 "Dữ liệu công việc bị phân mảnh trên nhiều ứng dụng rời rạc (Chat, Email, File Excel).",
                 "Thiếu liên kết nghiệp vụ: Phiếu yêu cầu IT (Service Request) không gắn kết với Tài sản máy móc (Asset) hoặc Công việc cụ thể (Task).",
                 "Rủi ro thất thoát thông tin và khó khăn trong truy vết trách nhiệm nhân sự.",
                 "Không có cơ chế kiểm soát tranh chấp dữ liệu khi nhiều người cùng sửa đổi đồng thời."
             ], border_color=C_RED)

    add_card(s2, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Mục Tiêu & Giải Pháp WorkSphere",
             items=[
                 "Xây dựng nền tảng quản trị hợp nhất: Kết nối liền mạch Dự án, Công việc, Phiếu dịch vụ và Tài sản.",
                 "Kiến trúc Backend chuẩn mực: Ứng dụng triệt để nguyên lý SOLID và Design Patterns hiện đại trên Java 21 LTS.",
                 "Kiểm soát toàn vẹn dữ liệu: Sử dụng Khóa lạc quan (Optimistic Locking) và 17 tệp di trú Flyway.",
                 "Bảo mật đa tầng: Xác thực Stateless JWT với 4 vai trò phân quyền RBAC nghiêm ngặt."
             ], border_color=C_BLUE)

    set_speaker_notes(s2, {
        "objective": "Làm rõ vấn đề thực tiễn của doanh nghiệp và giá trị cốt lõi WorkSphere giải quyết.",
        "narration": "Trong thực tế điều hành doanh nghiệp, tình trạng phân mảnh thông tin giữa các bộ phận dẫn đến chậm trễ và sai lệch dữ liệu. WorkSphere ra đời nhằm hợp nhất toàn bộ luồng công việc nội bộ vào một nền tảng duy nhất, đảm bảo tính nhất quán cao và hiệu năng vượt trội.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "docs/01_PROJECT_SCOPE.md",
        "question": "Tại sao không dùng các phần mềm SaaS có sẵn trên thị trường?",
        "answer": "Các phần mềm hiện hữu thường giải quyết đơn lẻ từng khâu hoặc chi phí triển khai quá lớn; WorkSphere được tối ưu hóa đặc thù cho mô hình vận hành liên phòng ban với chi phí làm chủ mã nguồn 100%.",
        "transition": "Để giải quyết bài toán trên, nhóm đã lựa chọn ngăn xếp công nghệ tiên tiến nhất hiện nay."
    })

    # --------------------------------------------------------------------------
    # SLIDE 3: TECHNOLOGY STACK
    # --------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Ngăn Xếp Công Nghệ Backend Hiện Đại (Tech Stack)", "Nền Tảng Công Nghệ", course_tag)
    add_footer(s3, course_name, 3, total_slides)

    add_card(s3, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Nền Tảng Cốt Lõi",
             items=[
                 "Java 21 LTS: Hưởng lợi từ Virtual Threads, Pattern Matching và Records hiện đại.",
                 "Spring Boot 4.1.1: Hệ sinh thái enterprise vững chắc, cấu hình tự động thông minh.",
                 "Spring Security 6: Cơ chế lọc stateless, phân quyền RBAC dựa trên Method Security.",
                 "Maven Wrapper (mvnw): Bảo đảm tính xác định khi biên dịch trên mọi môi trường."
             ])

    add_card(s3, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Dữ Liệu & Toàn Vẹn",
             items=[
                 "PostgreSQL 15: Hệ quản trị CSDL quan hệ chuẩn ACID, độ tin cậy cao.",
                 "Spring Data JPA / Hibernate: Ánh xạ ORM mạnh mẽ, tối ưu hóa câu lệnh truy vấn.",
                 "Flyway Migration: 17 tệp migration bất biến (V001–V017) kiểm soát vòng đời schema.",
                 "HikariCP: Connection pool hiệu năng cao tích hợp sẵn giám sát độ trễ."
             ])

    add_card(s3, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Kiểm Thử & Vận Hành",
             items=[
                 "JUnit 5 & AssertJ: Bộ khung kiểm thử đơn vị biểu cảm cao.",
                 "Testcontainers Java: Khởi chạy PostgreSQL container thật trong lúc chạy kiểm thử tích hợp.",
                 "Spring Boot Actuator & Micrometer: Trích xuất chỉ số vận hành chuẩn OpenMetrics.",
                 "Checkstyle: Kiểm soát 0 lỗi cú pháp và chuẩn mực code Java."
             ])

    set_speaker_notes(s3, {
        "objective": "Chứng minh sự lựa chọn công nghệ có cơ sở khoa học và đón đầu xu hướng công nghiệp.",
        "narration": "Dự án kiên định sử dụng Java 21 LTS kết hợp Spring Boot 4.1.1. Toàn bộ tầng dữ liệu được quản lý bởi Spring Data JPA và Flyway Migration. Khác biệt lớn nhất là nhóm sử dụng Testcontainers để chạy kiểm thử với cơ sở dữ liệu thật thay vì giả lập H2.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "backend/pom.xml",
        "question": "Tại sao nhóm chọn Java 21 thay vì Java 17 hoặc 11?",
        "answer": "Java 21 là phiên bản Long Term Support mới nhất, cung cấp Virtual Threads giúp cải thiện năng lực xử lý I/O đồng thời và tối ưu hóa bộ nhớ tốt hơn đáng kể.",
        "transition": "Trên nền tảng công nghệ này, nhóm đã xây dựng kiến trúc Modular Monolith như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 4: MODULAR MONOLITH OVERVIEW
    # --------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Kiến Trúc Modular Monolith & Ranh Giới Module", "Kiến Trúc Hệ Thống", course_tag)
    add_footer(s4, course_name, 4, total_slides)

    # Insert diagram fig1
    img_path = "reports/stage20/advanced-programming/diagrams/fig1_system_context.png"
    if os.path.exists(img_path):
        s4.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s4, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8),
             title="Đặc Trưng Kiến Trúc",
             items=[
                 "Tổ chức đơn repo (Single Repository): Triển khai như một khối duy nhất nhưng chia tách module nội bộ nghiêm ngặt.",
                 "5 Modules Nghiệp Vụ Chính: Identity, Project, Task, Service Request, Asset Management.",
                 "Ranh giới đóng gói gói Java (Package Boundaries): Giao tiếp liên module thông qua Service Interface, không gọi chéo Repository trực tiếp.",
                 "Đánh giá học thuật: Hạn chế tối đa chi phí vận hành mạng và giao dịch phân tán của Microservices, đồng thời loại bỏ mã nguồn 'mì ăn liền' (Spaghetti Code)."
             ])

    set_speaker_notes(s4, {
        "objective": "Trình bày cấu trúc Modular Monolith và lý do kỹ thuật không chọn Microservices.",
        "narration": "Thay vì lao vào Microservices phức tạp với chi phí mạng và phân tán giao dịch cao, nhóm lựa chọn kiến trúc Modular Monolith. Mỗi module nghiệp vụ như Task hay Asset đều độc lập về mặt logic nghiệp vụ, giao tiếp qua Service Contract rõ ràng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "docs/04_SYSTEM_ARCHITECTURE.md, fig1_system_context.png",
        "question": "Làm sao đảm bảo các module không bị phụ thuộc vòng (circular dependency)?",
        "answer": "Nhóm tuân thủ nguyên tắc Dependency Inversion: các module tầng cao phụ thuộc vào interface của tầng thấp hơn, sử dụng shared DTO và các service contract tập trung.",
        "transition": "Tiếp theo, bạn Nguyễn Đức Khiêm sẽ trình bày về cơ chế quản trị Bean và IoC trong Spring."
    })

    # --------------------------------------------------------------------------
    # SLIDE 5: SPRING IOC & DEPENDENCY INJECTION
    # --------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Spring IoC Container, Bean Management & Dependency Injection", "Hạt Nhân Spring Core", course_tag)
    add_footer(s5, course_name, 5, total_slides)

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Nguyên Lý & Quản Trị Bean",
             items=[
                 "Đảo ngược điều khiển (IoC): Toàn bộ vòng đời đối tượng (khởi tạo, cấu hình, hủy bỏ) do Spring ApplicationContext quản lý.",
                 "Constructor Injection độc tôn: 100% services sử dụng tiêm phụ thuộc qua Constructor, loại bỏ hoàn toàn `@Autowired` trên thuộc tính (Field Injection).",
                 "Bất biến (Immutability): Mọi dependency đều được khai báo `private final`, bảo đảm an toàn đa luồng và hỗ trợ viết Unit Test dễ dàng bằng cách truyền mock object qua hàm khởi tạo.",
                 "Bean Scopes: Chủ yếu sử dụng Singleton Scope mặc định cho các Service Stateless."
             ])

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Trích Đoạn Mã Nguồn Thực Tế",
             items=[
                 "@Service",
                 "public class TaskServiceImpl implements TaskService {",
                 "    private final TaskRepository taskRepository;",
                 "    private final ProjectRepository projectRepository;",
                 "    private final TaskEventPublisher eventPublisher;",
                 "",
                 "    public TaskServiceImpl(TaskRepository taskRepository, ...){",
                 "        this.taskRepository = taskRepository;",
                 "        ... // Constructor DI chuẩn xác",
                 "    }",
                 "}",
                 "Lợi ích: Phát hiện thiếu phụ thuộc ngay tại thời điểm biên dịch."
             ], border_color=C_TEAL)

    set_speaker_notes(s5, {
        "objective": "Làm rõ việc tuân thủ triệt để nguyên lý DI và loại bỏ hoàn toàn Field Injection.",
        "narration": "Trong toàn bộ mã nguồn backend WorkSphere, quý thầy cô sẽ không tìm thấy bất kỳ chú thích @Autowired nào trên thuộc tính. Nhóm áp dụng 100% Constructor Injection với từ khóa final, đảm bảo tính bất biến và dễ dàng khởi tạo trong unit test mà không cần Spring context.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "backend/src/main/java/com/worksphere/task/service/impl/TaskServiceImpl.java",
        "question": "Field Injection có tác hại gì mà nhóm phải loại bỏ hoàn toàn?",
        "answer": "Field Injection gây phụ thuộc chặt vào Spring container, che giấu các mối phụ thuộc lỏng lẻo, dễ dẫn đến vi phạm Single Responsibility Principle và gây khó khăn khi viết unit test.",
        "transition": "Song hành với IoC là cơ chế Auto-configuration thông minh của Spring Boot."
    })

    # --------------------------------------------------------------------------
    # SLIDE 6: SPRING BOOT AUTO-CONFIGURATION
    # --------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Spring Boot & Cơ Chế Auto-Configuration", "Tối Ưu Hóa Cấu Hình", course_tag)
    add_footer(s6, course_name, 6, total_slides)

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Bản Chất Auto-Configuration",
             items=[
                 "Chú thích `@SpringBootApplication`: Kết hợp của `@Configuration`, `@EnableAutoConfiguration` và `@ComponentScan`.",
                 "Cơ chế điều kiện `@ConditionalOnClass` & `@ConditionalOnProperty`: Spring Boot tự động kích hoạt DataSource HikariCP và Flyway chỉ khi có thư viện trong classpath.",
                 "Externalized Configuration: Tách bạch cấu hình qua `application.yml` và biến môi trường Twelve-Factor App.",
                 "Profile-driven Development: Phân định rõ ràng profile `dev`, `test` và `prod`."
             ])

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Starters & Quản Lý Phụ Thuộc",
             items=[
                 "`spring-boot-starter-web`: Tích hợp máy chủ nhúng Tomcat và bộ chuyển đổi Jackson JSON.",
                 "`spring-boot-starter-data-jpa`: Tự động nạp Hibernate, EntityManagerFactory và quản lý giao dịch.",
                 "`spring-boot-starter-security`: Thiết lập bộ lọc mặc định trước khi được tùy biến bởi SecurityConfig.",
                 "`spring-boot-starter-validation`: Kích hoạt Hibernate Validator cho DTOs.",
                 "`spring-boot-starter-actuator`: Kích hoạt giám sát sức khỏe runtime."
             ])

    set_speaker_notes(s6, {
        "objective": "Trình bày cách Spring Boot tối ưu hóa cấu hình và giảm thiểu mã cấu hình thừa (boilerplate).",
        "narration": "Spring Boot mang lại khả năng cấu hình quy ước (Convention over Configuration). Thay vì hàng trăm dòng XML phức tạp, WorkSphere chỉ định nghĩa các starter trong pom.xml và tinh chỉnh tham số cần thiết qua tệp YAML.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "backend/src/main/resources/application.yml",
        "question": "Làm thế nào để ghi đè một cấu hình mặc định của Spring Boot?",
        "answer": "Chúng ta có thể định nghĩa một Bean có cùng kiểu trong class @Configuration hoặc cấu hình thuộc tính tương ứng trong application.yml.",
        "transition": "Tiếp theo, bạn Nguyễn Văn Cường sẽ trình bày chu trình xử lý request trong Spring MVC."
    })

    # --------------------------------------------------------------------------
    # SLIDE 7: SPRING MVC REQUEST LIFECYCLE
    # --------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Chu Trình Xử Lý HTTP Request Trong Spring MVC", "Tầng Web & Điều Phối", course_tag)
    add_footer(s7, course_name, 7, total_slides)

    img_path = "reports/stage20/advanced-programming/diagrams/fig2_request_lifecycle.png"
    if os.path.exists(img_path):
        s7.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(7.0), Inches(4.8))

    add_card(s7, Inches(8.0), Inches(1.8), Inches(4.5), Inches(4.8),
             title="Các Bước Chu Trình",
             items=[
                 "1. Filter Chain: Gán `X-Request-ID` (MDC) và giải mã JWT token.",
                 "2. DispatcherServlet: Trung tâm tiếp nhận và tra cứu `HandlerMapping`.",
                 "3. HandlerAdapter: Gọi phương thức Controller tương ứng.",
                 "4. Controller: Nhận DTO, kích hoạt validation dữ liệu.",
                 "5. Service Layer: Thực thi nghiệp vụ bên trong giao dịch `@Transactional`.",
                 "6. Global Exception Handler: Bắt lỗi tập trung `@RestControllerAdvice`."
             ])

    set_speaker_notes(s7, {
        "objective": "Mô tả đường đi chi tiết của một HTTP request từ khi vào hệ thống đến khi trả lời.",
        "narration": "Sơ đồ trên thể hiện chu trình request lifecycle khép kín. Bắt đầu từ RequestCorrelationFilter gán UUID truy vết, qua JwtAuthenticationFilter xác thực, đến DispatcherServlet phân phối vào Controller và Service xử lý giao dịch dữ liệu.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "reports/stage20/advanced-programming/diagrams/fig2_request_lifecycle.png",
        "question": "DispatcherServlet hoạt động theo Design Pattern nào?",
        "answer": "DispatcherServlet là hiện thân của Front Controller Pattern, đóng vai trò đầu mối điều phối tập trung cho toàn bộ ứng dụng web.",
        "transition": "Để bảo đảm an toàn dữ liệu đầu vào, hệ thống thực hiện validation như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 8: REST API & VALIDATION
    # --------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Thiết Kế RESTful Web Services & Kiểm Tra Hợp Lệ Dữ Liệu", "Chuẩn Hóa Giao Tiếp", course_tag)
    add_footer(s8, course_name, 8, total_slides)

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Quy Chuẩn RESTful API",
             items=[
                 "Định dạng đường dẫn chuẩn hóa: `/api/v1/{resources}` phản ánh rõ ranh giới danh từ số nhiều.",
                 "Mã trạng thái HTTP chính xác: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict.",
                 "Cấu trúc phản hồi đồng nhất: Toàn bộ phản hồi bọc trong đối tượng `ApiResponse<T>` gồm timestamp, status, message và data.",
                 "Tài liệu hóa tự động: Tích hợp OpenAPI 3.0 / Swagger UI phục vụ kiểm thử tương tác trực tiếp."
             ])

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Bean Validation & Xử Lý Lỗi Tập Trung",
             items=[
                 "Validation khai báo trên DTO: Sử dụng `@NotBlank`, `@Size`, `@Email`, `@NotNull` trên các trường dữ liệu.",
                 "Kích hoạt kiểm tra tại Controller: Sử dụng `@Valid` trước `@RequestBody`.",
                 "Bắt lỗi tập trung `@RestControllerAdvice`: Lớp `GlobalExceptionHandler` bắt ngoại lệ `MethodArgumentNotValidException`.",
                 "Phản hồi chi tiết từng trường lỗi: Trả về danh sách `errors` dạng `field: message`, giúp phía Mobile Client dễ dàng hiển thị lỗi tương ứng."
             ])

    set_speaker_notes(s8, {
        "objective": "Chứng minh sự nhất quán trong thiết kế API và xử lý lỗi chuyên nghiệp.",
        "narration": "Toàn bộ API của WorkSphere đều tuân thủ nghiêm ngặt chuẩn RESTful cấp độ 2 và cấu trúc JSON đồng nhất. Khi người dùng nhập sai dữ liệu, GlobalExceptionHandler tự động chuyển đổi thành mã lỗi 400 kèm danh sách chi tiết các trường vi phạm.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "backend/src/main/java/com/worksphere/shared/exception/GlobalExceptionHandler.java",
        "question": "Nếu xảy ra lỗi không lường trước (500), hệ thống xử lý ra sao?",
        "answer": "GlobalExceptionHandler bắt Exception chung, ghi log chi tiết kèm Request ID nhưng chỉ trả về thông báo lỗi an toàn cho người dùng, tuyệt đối không để lộ stack trace ra ngoài.",
        "transition": "Tiếp theo, bạn Vũ Thị Thu Hướng sẽ trình bày về tầng dữ liệu Spring Data JPA và Flyway."
    })

    # --------------------------------------------------------------------------
    # SLIDE 9: SPRING DATA JPA & FLYWAY
    # --------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Spring Data JPA, Hibernate & Quản Lý Di Trú Flyway", "Tầng Dữ Liệu Bền Vững", course_tag)
    add_footer(s9, course_name, 9, total_slides)

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Spring Data JPA & ORM",
             items=[
                 "Repository Pattern: Kế thừa `JpaRepository<T, ID>` cung cấp sẵn các thao tác CRUD mà không cần viết mã cài đặt.",
                 "Custom Queries an toàn: Sử dụng Derived Query Methods và JPQL với tham số liên kết (Bound Parameters), chống hoàn toàn tấn công SQL Injection.",
                 "Kiểm soát tải dữ liệu (Lazy Loading): Sử dụng quan hệ `@ManyToOne(fetch = FetchType.LAZY)` nhằm tránh vấn đề truy vấn N+1 làm suy giảm hiệu năng.",
                 "Auditing tự động: Tự động ghi nhận `createdAt`, `updatedAt`, `createdBy` qua Spring Data Auditing."
             ])

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Quản Lý Schema Với Flyway (V001–V017)",
             items=[
                 "Kiểm soát phiên bản CSDL dạng mã: 17 tệp SQL di trú bất biến được lưu trữ trong Git (`backend/src/main/resources/db/migration/`).",
                 "Cơ chế khóa bảng `flyway_schema_history`: Kiểm tra mã băm Checksum của từng tệp di trú, ngăn chặn hoàn toàn việc sửa đổi lịch sử SQL.",
                 "Toàn vẹn khóa ngoại (Foreign Keys): Ràng buộc toàn vẹn giữa Users, Projects, Tasks, Requests và Assets ở cấp độ cơ sở dữ liệu.",
                 "Loại bỏ `ddl-auto=update`: Nghiêm cấm Hibernate tự sửa đổi cấu trúc bảng, bảo đảm tính xác định tuyệt đối giữa các môi trường."
             ])

    set_speaker_notes(s9, {
        "objective": "Trình bày giải pháp quản trị cơ sở dữ liệu an toàn, bất biến với Flyway.",
        "narration": "Một điểm mạnh kỹ thuật của WorkSphere là loại bỏ hoàn toàn cơ chế tự sinh bảng ddl-auto của Hibernate. Toàn bộ 17 phiên bản cấu trúc dữ liệu được kiểm soát bằng Flyway Migration, bảo đảm schema trên máy trạm dev giống hệt môi trường CI.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "backend/src/main/resources/db/migration/V001__init.sql ... V017",
        "question": "Nếu một file migration đã chạy bị sửa đổi nội dung thì sao?",
        "answer": "Khi khởi động, Flyway sẽ phát hiện Checksum trong bảng flyway_schema_history không khớp với tệp mới và dừng ứng dụng ngay lập tức (Fail-fast).",
        "transition": "Để giải quyết xung đột khi nhiều người cùng sửa một bản ghi, hệ thống sử dụng cơ chế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 10: OPTIMISTIC LOCKING & INTEGRITY
    # --------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Kiểm Soát Tranh Chấp Dữ Liệu Với Khóa Lạc Quan (@Version)", "Toàn Vẹn Dữ Liệu Đồng Thời", course_tag)
    add_footer(s10, course_name, 10, total_slides)

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Cơ Chế Khóa Lạc Quan (Optimistic Locking)",
             items=[
                 "Bản chất: Không chiếm dụng khóa vật lý trên hàng của cơ sở dữ liệu, tối ưu hóa cho ứng dụng có tỷ lệ đọc cao hơn ghi.",
                 "Trường `@Version Long version`: Mỗi bảng nghiệp vụ chính (Task, Project, Asset) đều sở hữu một cột `version` tự tăng.",
                 "Nguyên lý cập nhật: Câu lệnh SQL tự động sinh thêm mệnh đề kiểm tra: `WHERE id = ? AND version = ?`.",
                 "Phát hiện xung đột: Nếu phiên bản hiện tại khác với phiên bản người dùng nắm giữ, Hibernate ném ngoại lệ `OptimisticLockException`.",
                 "Mã lỗi 409 Conflict: Hệ thống thông báo rõ ràng cho người dùng biết dữ liệu đã bị người khác thay đổi."
             ])

    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Giao Dịch ACID Với @Transactional",
             items=[
                 "Tính nguyên tử (Atomicity): Toàn bộ các thao tác nghiệp vụ phức tạp (như tạo Task kèm lịch sử và trừ tài sản) được gom trong một giao dịch duy nhất.",
                 "Quản lý Rollback tự động: Tự động hoàn tác dữ liệu khi có ngoại lệ unchecked (`RuntimeException`).",
                 "Thiết lập `readOnly = true` cho truy vấn đọc: Giúp Hibernate tối ưu bộ nhớ đệm Session Flush và cải thiện tốc độ phản hồi.",
                 "Tránh giữ giao dịch lâu: Tách các tác vụ I/O chậm (như gửi email, upload file) ra ngoài khối `@Transactional`."
             ])

    set_speaker_notes(s10, {
        "objective": "Làm rõ giải pháp kỹ thuật phòng chống xung đột cập nhật dữ liệu (Lost Update Problem).",
        "narration": "Trong hệ thống quản trị công việc, việc hai người cùng mở một nhiệm vụ và bấm cập nhật trạng thái đồng thời rất dễ gây mất dữ liệu. WorkSphere sử dụng chú thích @Version của JPA. Khi phát hiện xung đột, hệ thống trả về mã 409 Conflict để người dùng tải lại dữ liệu mới nhất.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "backend/src/main/java/com/worksphere/task/domain/Task.java",
        "question": "Tại sao không dùng Pessimistic Locking (Khóa bi quan)?",
        "answer": "Khóa bi quan gây khóa hàng ở cấp database, dễ dẫn đến hiện tượng nghẽn cổ chai (Deadlock) và làm giảm nghiêm trọng thông lượng hệ thống trong môi trường web đa người dùng.",
        "transition": "Tiếp theo, bạn Hoàng Bảo Long sẽ trình bày về kiến trúc bảo mật Spring Security và JWT."
    })

    # --------------------------------------------------------------------------
    # SLIDE 11: SPRING SECURITY ARCHITECTURE
    # --------------------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Kiến Trúc Bảo Mật Spring Security & Stateless JWT", "Bảo Mật Hệ Thống", course_tag)
    add_footer(s11, course_name, 11, total_slides)

    img_path = "reports/stage20/advanced-programming/diagrams/fig3_clean_architecture.png"
    if os.path.exists(img_path):
        s11.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s11, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8),
             title="Cấu Hình Security Chuyên Sâu",
             items=[
                 "Stateless Session: Thiết lập `SessionCreationPolicy.STATELESS`, máy chủ không lưu Session trong bộ nhớ RAM.",
                 "Bộ lọc `JwtAuthenticationFilter`: Đứng trước `UsernamePasswordAuthenticationFilter`, kiểm tra `Authorization: Bearer <token>`.",
                 "Mã hóa mật khẩu chuẩn BCrypt: Sử dụng thuật toán băm chậm `BCryptPasswordEncoder` với salt ngẫu nhiên.",
                 "Bảo vệ CSRF & CORS: Vô hiệu hóa CSRF an toàn vì dùng JWT stateless; cấu hình CORS chặt chẽ chỉ cho phép nguồn gốc đã xác minh."
             ])

    set_speaker_notes(s11, {
        "objective": "Trình bày kiến trúc bảo mật phân tầng hiện đại dựa trên Spring Security 6.",
        "narration": "Hệ thống bảo mật của WorkSphere hoạt động hoàn toàn ở chế độ Stateless Session. Khi người dùng gửi request, JwtAuthenticationFilter sẽ trích xuất token, thẩm định chữ ký HMAC-SHA256 và nạp thông tin quyền hạn vào SecurityContextHolder.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "backend/src/main/java/com/worksphere/shared/config/SecurityConfig.java",
        "question": "Tại sao hệ thống tắt CSRF (Cross-Site Request Forgery)?",
        "answer": "CSRF tấn công dựa trên cookie tự động đính kèm của trình duyệt. Do WorkSphere sử dụng token JWT truyền qua HTTP header Authorization, ứng dụng hoàn toàn miễn nhiễm với tấn công CSRF truyền thống.",
        "transition": "Hệ thống phân quyền cụ thể cho các vai trò người dùng như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 12: JWT & FOUR-ROLE RBAC
    # --------------------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Mô Hình Phân Quyền Dựa Trên Vai Trò (4 Roles RBAC)", "Kiểm Soát Quyền Hạn", course_tag)
    add_footer(s12, course_name, 12, total_slides)

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="4 Vai Trò Doanh Nghiệp Chuẩn Hóa",
             items=[
                 "`EMPLOYEE` (Nhân viên): Xem dự án tham gia, thực thi công việc được giao, tạo phiếu yêu cầu dịch vụ cá nhân.",
                 "`TEAM_LEADER` (Trưởng nhóm): Quản lý công việc của nhóm, phê duyệt phiếu yêu cầu sơ bộ.",
                 "`PROJECT_MANAGER` (Quản lý dự án): Toàn quyền lập kế hoạch dự án, phân công nhân sự, quản lý cột mốc và tài sản dự án.",
                 "`ADMIN` (Quản trị hệ thống): Quản lý người dùng, phân quyền vai trò, cấu hình hệ thống và kiểm toán toàn vẹn."
             ])

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Bảo Vệ Đa Tầng (Layered Security)",
             items=[
                 "Tầng URL Security: Khai báo `requestMatchers()` phân định các endpoint công khai (Login, Swagger, Actuator) và endpoint yêu cầu xác thực.",
                 "Tầng Method Security: Kích hoạt `@EnableMethodSecurity`, sử dụng chú thích `@PreAuthorize(\"hasRole('ADMIN')\")` ngay trên phương thức Service.",
                 "Kiểm soát sở hữu dữ liệu (Data Ownership): Ngăn chặn việc nhân viên xem hoặc sửa đổi phiếu yêu cầu của người khác thông qua kiểm tra logic tại Service Layer."
             ])

    set_speaker_notes(s12, {
        "objective": "Khẳng định mô hình phân quyền 4 vai trò rõ ràng và cơ chế bảo vệ kép (URL + Method).",
        "narration": "WorkSphere định nghĩa chính xác 4 vai trò người dùng trong hệ thống. Bên cạnh việc phân luồng endpoint tại SecurityConfig, nhóm cài đặt kiểm soát sâu tại tầng Service bằng chú thích @PreAuthorize, bảo đảm ngay cả khi lọt qua tầng web thì người dùng cũng không thể thực hiện thao tác vượt quyền.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "docs/02_USER_ROLES_AND_WORKFLOWS.md",
        "question": "Làm thế nào để chặn lỗi Leo thang đặc quyền (Privilege Escalation)?",
        "answer": "Tất cả các API nhạy cảm như cập nhật trạng thái dự án hoặc phân bổ tài sản đều kiểm tra SecurityContext để xác minh quyền của người dùng hiện tại trước khi thực hiện truy vấn.",
        "transition": "Tiếp theo, bạn Nguyễn Đức Khiêm sẽ làm rõ ranh giới giữa Filter và Spring AOP trong dự án."
    })

    # --------------------------------------------------------------------------
    # SLIDE 13: CROSS-CUTTING CONCERNS
    # --------------------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Xử Lý Mối Quan Tâm Xuyên Suốt: Filter vs Spring AOP Proxy", "Ranh Giới Kiến Trúc", course_tag)
    add_footer(s13, course_name, 13, total_slides)

    add_card(s13, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Servlet Filter (Tầng Web Ngoài Cùng)",
             items=[
                 "`RequestCorrelationFilter`: Là một Servlet Filter chuẩn (`OncePerRequestFilter`), đứng ở vị trí ưu tiên cao nhất (`HIGHEST_PRECEDENCE`).",
                 "Trách nhiệm: Nhận diện hoặc sinh mã `X-Request-ID` (UUID), nạp vào MDC Logback và gán vào HTTP Header trả về.",
                 "Lưu ý học thuật: Filter nằm ngoài vòng đời của Spring Context, hoạt động ở cấp độ Servlet Container (Tomcat)."
             ])

    add_card(s13, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Spring AOP Proxy (Tầng Nghiệp Vụ Bên Trong)",
             items=[
                 "Spring AOP Proxy: Sử dụng Dynamic Proxy / CGLIB để bọc các Service Beans.",
                 "Khẳng định trung thực: Dự án KHÔNG viết các `@Aspect` tùy biến tự tạo (No Custom Aspect Claim).",
                 "Khai thác AOP tích hợp sẵn: Sử dụng proxy sẵn có của Spring Framework cho giao dịch `@Transactional`, phân quyền `@PreAuthorize` và kiểm tra hợp lệ `@Validated`.",
                 "Lợi ích: Tận dụng cơ chế chuẩn của framework, tránh phát sinh lỗi phức tạp do can thiệp bytecode tùy tiện."
             ], border_color=C_ORANGE)

    set_speaker_notes(s13, {
        "objective": "Làm rõ ranh giới kỹ thuật trung thực: RequestCorrelationFilter là Filter, dự án không dùng custom AOP.",
        "narration": "Đây là điểm nhấn học thuật rất quan trọng: Nhóm khẳng định trung thực rằng RequestCorrelationFilter hoạt động ở tầng Servlet Filter. Đối với AOP, nhóm không tạo các @Aspect tùy biến mà khai thác triệt để hạ tầng AOP Proxy tích hợp sẵn của Spring cho Transaction và Security.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "backend/src/main/java/com/worksphere/shared/logging/RequestCorrelationFilter.java",
        "question": "Tại sao không dùng Spring AOP để gán Request ID?",
        "answer": "AOP chỉ can thiệp được khi request đã vào bên trong Spring Beans, trong khi việc gắn Request ID cần thực hiện sớm nhất có thể ngay từ tầng HTTP Filter để theo dõi toàn bộ quá trình xác thực và định tuyến.",
        "transition": "Để bảo đảm toàn bộ hệ sinh thái hoạt động ổn định, nhóm đã xây dựng hệ thống kiểm thử tự động như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 14: AUTOMATED TESTING (351 TESTS)
    # --------------------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Hệ Thống Kiểm Thử Tự Động & Đảm Bảo Chất Lượng (351 Tests)", "Chất Lượng Mã Nguồn", course_tag)
    add_footer(s14, course_name, 14, total_slides)

    img_path = "reports/stage20/advanced-programming/diagrams/fig4_testing_pyramid.png"
    if os.path.exists(img_path):
        s14.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s14, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8),
             title="Chỉ Số Đo Lường Thực Tế",
             items=[
                 "Tổng số kiểm thử Backend: 351 Tests (100% Pass, 0 Failure, 0 Error).",
                 "Checkstyle Quality Gate: Tuân thủ nghiêm ngặt quy tắc mã nguồn, đạt 0 lỗi Checkstyle.",
                 "Unit Tests: Kiểm thử độc lập logic nghiệp vụ Service Layer sử dụng Mockito.",
                 "Integration Tests: Sử dụng Testcontainers khởi chạy PostgreSQL container thật để kiểm thử toàn diện Repository và Flyway.",
                 "Chốt chặn tự động trên CI: Toàn bộ kiểm thử tự động chạy trên GitHub Actions trước khi sáp nhập mã nguồn."
             ])

    set_speaker_notes(s14, {
        "objective": "Trưng dẫn bằng chứng thực nghiệm về độ tin cậy của phần mềm qua 351 ca kiểm thử.",
        "narration": "Chất lượng mã nguồn của WorkSphere được bảo chứng qua 351 ca kiểm thử tự động. Mô hình kim tự tháp kiểm thử bảo đảm từ các hàm tính toán logic đơn vị đến các câu lệnh truy vấn phức tạp kết nối với PostgreSQL thật đều đạt kết quả tuyệt đối.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "backend surefire-reports, 351 tests pass",
        "question": "Tại sao không dùng H2 cho Integration Test để chạy nhanh hơn?",
        "answer": "H2 có sự khác biệt về cú pháp hàm, kiểu dữ liệu UUID và JSONB so với PostgreSQL. Việc kiểm thử trên Testcontainers PostgreSQL bảo đảm không có lỗi ngầm phát sinh khi triển khai thật.",
        "transition": "Tiếp theo, bạn Nguyễn Đức Khiêm sẽ trình bày về giải pháp giám sát và nhật ký vận hành."
    })

    # --------------------------------------------------------------------------
    # SLIDE 15: LOGGING, ACTUATOR & PROMETHEUS
    # --------------------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "Giám Sát Vận Hành: Spring Boot Actuator & Prometheus", "Sẵn Sàng Vận Hành", course_tag)
    add_footer(s15, course_name, 15, total_slides)

    add_card(s15, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Giám Sát Chuẩn OpenMetrics",
             items=[
                 "Endpoint `/actuator/health`: Cung cấp thông tin sống còn (Liveness/Readiness probes) phục vụ Container Healthcheck.",
                 "Endpoint `/actuator/prometheus`: Trích xuất số liệu chuẩn định dạng cho máy chủ Prometheus thu thập định kỳ 15s.",
                 "Chỉ số giám sát phong phú: Bộ nhớ JVM (Heap/Non-heap), Tần suất dọn rác GC, Số luồng HTTP xử lý, Trạng thái kết nối HikariCP Pool.",
                 "Gia cố bảo mật: Vô hiệu hóa toàn bộ các endpoint nguy hiểm (`/env`, `/beans`, `/heapdump`) để chống rò rỉ secret."
             ])

    add_card(s15, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Cấu Trúc Nhật Ký Có Ngữ Cảnh (MDC)",
             items=[
                 "Định dạng JSON cấu trúc: Nhật ký hệ thống in ra kèm dấu thời gian ISO 8601, log level và thread name.",
                 "Traceability với `X-Request-ID`: Mọi câu lệnh log trong cùng một phiên xử lý request đều gắn mã UUID thống nhất.",
                 "Ví dụ thực tế: `[INFO] [req-8f2a] Task 105 status updated to IN_PROGRESS by user_02`.",
                 "Ranh giới hiện thực: Hệ thống giám sát cục bộ nội bộ (LOCAL_INTERNAL_ONLY); chưa cấu hình Grafana Dashboard."
             ])

    set_speaker_notes(s15, {
        "objective": "Trình bày năng lực giám sát hiệu năng và giải pháp truy vết sự cố qua nhật ký.",
        "narration": "Để sẵn sàng vận hành môi trường doanh nghiệp, WorkSphere kích hoạt Actuator và Micrometer Prometheus. Nhờ cơ chế MDC X-Request-ID, khi xảy ra sự cố, kỹ sư vận hành có thể lọc toàn bộ dấu vết của request đó chỉ bằng một mã định danh duy nhất.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Đức Khiêm (BIT240125)",
        "evidence": "infrastructure/monitoring/prometheus.yml, application.yml",
        "question": "Prometheus thu thập dữ liệu theo cơ chế Push hay Pull?",
        "answer": "Prometheus sử dụng cơ chế Pull model, định kỳ gửi HTTP GET request đến endpoint /actuator/prometheus của backend để cào số liệu.",
        "transition": "Sau đây, nhóm trưởng Nguyễn Minh Hiếu sẽ tổng kết kết quả đạt được của đề tài."
    })

    # --------------------------------------------------------------------------
    # SLIDE 16: RESULTS & TECHNICAL STRENGTHS
    # --------------------------------------------------------------------------
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, "Tổng Kết Kết Quả Đạt Được & Điểm Mạnh Kỹ Thuật", "Đánh Giá Học Thuật", course_tag)
    add_footer(s16, course_name, 16, total_slides)

    add_card(s16, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Các Mục Tiêu Đã Hoàn Thành Xuất Sắc",
             items=[
                 "Xây dựng thành công Backend Modular Monolith trên nền Java 21 LTS và Spring Boot 4.1.1 vững chắc.",
                 "Hiện thực hóa đầy đủ 4 phân hệ cốt lõi: Quản trị Dự án, Công việc, Phiếu dịch vụ và Quản lý Tài sản.",
                 "17 tệp di trú Flyway bảo đảm toàn vẹn cấu trúc dữ liệu không có sai lệch.",
                 "351 ca kiểm thử tự động vượt qua 100% kèm cổng kiểm soát Checkstyle 0 lỗi.",
                 "Đóng gói Docker đa tầng an toàn non-root (UID 10001) và điều phối cục bộ bằng Docker Compose v2."
             ])

    add_card(s16, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Điểm Mạnh Kỹ Thuật Nổi Bật",
             items=[
                 "Tính xác định cao (Determinism): Sử dụng wrappers cho build tool, không phụ thuộc môi trường máy trạm.",
                 "Bảo mật đa tầng: Kết hợp Stateless JWT, Method Security RBAC và mã hóa mật khẩu BCrypt.",
                 "Toàn vẹn đồng thời: Sử dụng khóa lạc quan `@Version` loại trừ triệt để nguy cơ mất mát dữ liệu do xung đột.",
                 "Đầy đủ tài liệu & minh chứng thật: 100% nội dung báo cáo đều trích xuất trực tiếp từ mã nguồn thực tế."
             ])

    set_speaker_notes(s16, {
        "objective": "Khẳng định các kết quả đạt được và những giá trị kỹ thuật thực chất của dự án.",
        "narration": "Nhìn lại toàn bộ quá trình phát triển, nhóm đã hoàn thành trọn vẹn các yêu cầu học thuật của môn Kỹ năng lập trình nâng cao. Hệ thống WorkSphere Backend không chỉ chạy đúng nghiệp vụ mà còn đạt chuẩn mực cao về cấu trúc mã nguồn, tính bảo mật và khả năng kiểm thử tự động.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/advanced-programming/BAO_CAO_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pdf",
        "question": "Điểm nào trong dự án mà nhóm cảm thấy tự hào nhất về mặt kỹ thuật?",
        "answer": "Đó là tính xác định và độ tin cậy của mã nguồn: 351 ca test chạy với database thật, 0 lỗi checkstyle và kiến trúc modular monolith rõ ràng.",
        "transition": "Bên cạnh các kết quả đạt được, nhóm cũng thẳng thắn nhìn nhận những hạn chế cần hoàn thiện."
    })

    # --------------------------------------------------------------------------
    # SLIDE 17: LIMITATIONS & FUTURE WORK
    # --------------------------------------------------------------------------
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, "Hạn Chế Của Hệ Thống & Hướng Phát Triển Tiếp Theo", "Đánh Giá Khách Quan", course_tag)
    add_footer(s17, course_name, 17, total_slides)

    add_card(s17, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Những Hạn Chế Kỹ Thuật Hiện Tại",
             items=[
                 "Chưa triển khai giao diện trực quan hóa Grafana Dashboard (mới dừng ở Prometheus cào dữ liệu thô).",
                 "Chưa tích hợp hệ thống đẩy thông báo thời gian thực WebSocket (đang dùng REST API polling).",
                 "Chưa triển khai môi trường máy chủ đám mây thực tế (AWS/GCP), hệ thống đang chạy cục bộ.",
                 "Kiểm thử chấp nhận người dùng (UAT) thực tế chưa được tổ chức trên quy mô doanh nghiệp thật."
             ], border_color=C_ORANGE)

    add_card(s17, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Định Hướng Phát Triển Tương Lai",
             items=[
                 "Giai đoạn 1: Triển khai WebSocket / STOMP để cập nhật trạng thái công việc và thông báo tức thì.",
                 "Giai đoạn 2: Bổ sung bộ đệm Redis để tối ưu hóa tốc độ tra cứu danh mục dùng chung và quản lý phiên làm việc.",
                 "Giai đoạn 3: Xây dựng Dashboard Grafana trực quan hóa chỉ số CPU, RAM và số lượng request.",
                 "Giai đoạn 4: Chuyển đổi kiến trúc sang Kubernetes dựa trên bảng ánh xạ lý thuyết đã thiết kế."
             ])

    set_speaker_notes(s17, {
        "objective": "Thể hiện tư duy phản biện khoa học, trung thực và có định hướng phát triển bài bản.",
        "narration": "Nhóm thẳng thắn nhìn nhận các giới hạn: hệ thống chưa có giao diện Grafana và chưa tích hợp WebSocket đẩy thông báo thời gian thực. Trong giai đoạn tiếp theo, nhóm định hướng bổ sung Redis cache và nâng cấp lên Kubernetes khi quy mô doanh nghiệp mở rộng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 11 Báo cáo Kỹ năng lập trình nâng cao",
        "question": "Nếu mở rộng hệ thống lên 100,000 người dùng, điểm nghẽn đầu tiên sẽ nằm ở đâu?",
        "answer": "Điểm nghẽn đầu tiên sẽ nằm ở tầng Cơ sở dữ liệu PostgreSQL; khi đó giải pháp là bổ sung Redis caching và cấu hình cụm Read-Replicas để chia tải đọc.",
        "transition": "Cuối cùng, nhóm xin chuyển sang phần hỏi đáp cùng Hội đồng chấm thi."
    })

    # --------------------------------------------------------------------------
    # SLIDE 18: Q&A / SOURCE EVIDENCE
    # --------------------------------------------------------------------------
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, "Hỏi Đáp (Q&A) & Danh Mục Minh Chứng Mã Nguồn", "Kết Thúc Thuyết Trình", course_tag)
    add_footer(s18, course_name, 18, total_slides)

    add_card(s18, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Lời Cảm Ơn & Tiếp Nhận Ý Kiến",
             items=[
                 "Nhóm sinh viên xin trân trọng cảm ơn quý Thầy/Cô trong Hội đồng đã lắng nghe bài thuyết trình!",
                 "Nhóm rất mong nhận được những nhận xét, góp ý quý báu của Thầy/Cô để tiếp tục hoàn thiện đề tài.",
                 "Nhóm đã chuẩn bị sẵn sàng môi trường mã nguồn và kiểm thử để thực hiện Demo trực tiếp theo yêu cầu của Hội đồng."
             ], border_color=C_BLUE)

    add_card(s18, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             title="Danh Mục Bằng Chứng Sẵn Sàng Đối Soát",
             items=[
                 "Mã nguồn Backend: `d:\\WorkSphere\\backend\\`",
                 "Báo cáo chuyên khảo: `reports/stage20/advanced-programming/`",
                 "351 Backend Tests: Lệnh chạy trực tiếp `./mvnw test`",
                 "Cấu hình bảo mật: `SecurityConfig.java` & `JwtAuthenticationFilter.java`",
                 "17 tệp SQL Flyway: `src/main/resources/db/migration/`",
                 "Tài liệu đặc tả: Canonical Documents `docs/01_PROJECT_SCOPE.md` đến `docs/10`"
             ], border_color=C_TEAL)

    set_speaker_notes(s18, {
        "objective": "Kết thúc bài thuyết trình chuyên nghiệp, mời Hội đồng đặt câu hỏi và sẵn sàng demo.",
        "narration": "Bài thuyết trình của nhóm về học phần Kỹ năng lập trình nâng cao xin được kết thúc tại đây. Nhóm chúng em đã sẵn sàng tiếp nhận các câu hỏi phản biện của quý thầy cô và thực hiện demo mã nguồn trực tiếp.",
        "duration": "1 phút",
        "speaker": "Toàn thể thành viên nhóm",
        "evidence": "Kho mã nguồn D:\\WorkSphere",
        "question": "Hội đồng yêu cầu mở mã nguồn class SecurityConfig và chạy thử 1 test case tích hợp.",
        "answer": "Dạ vâng, em xin phép mở file SecurityConfig.java và chạy lệnh ./mvnw test -Dtest=TaskIntegrationTest trên terminal.",
        "transition": "Sẵn sàng chuyển sang phần demo thực nghiệm."
    })

    out_path = "reports/stage20/presentations/01_KY_NANG_LAP_TRINH_NANG_CAO_WORKSPHERE.pptx"
    prs.save(out_path)
    print(f"Deck 1 generated successfully: {out_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    build_deck()
