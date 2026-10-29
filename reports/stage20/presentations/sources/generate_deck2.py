"""
Generator script for Deck 2: Mobile Application Development (Phát Triển Ứng Dụng Di Động)
15 slides as PROJECT_DEFENSE_RECOMMENDED.
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
    total_slides = 15
    course_name = "Phát Triển Ứng Dụng Di Động"
    course_tag = "MOBILE APPLICATION DEVELOPMENT"
    
    team_members = [
        {"name": "Nguyễn Văn Cường", "id": "BIT240048", "role": "Nhóm trưởng (Architecture, Navigation, State, Lead)"},
        {"name": "Hoàng Bảo Long", "id": "BIT240142", "role": "Thành viên (Authentication, JWT Token, Keychain Storage)"},
        {"name": "Vũ Thị Thu Hướng", "id": "BIT240113", "role": "Thành viên (Testing, 129 Jest Suites, 1144 Tests)"},
        {"name": "Lê Anh Tú", "id": "BIT230423", "role": "Thành viên (Feature Screens, UI States, FlatList Optimization)"}
    ]

    # --------------------------------------------------------------------------
    # SLIDE 1: COVER
    # --------------------------------------------------------------------------
    add_cover_slide(
        prs,
        title="XÂY DỰNG ỨNG DỤNG QUẢN TRỊ DOANH NGHIỆP WORKSPHERE\nBẰNG REACT NATIVE VÀ TYPESCRIPT",
        subtitle="Ứng dụng Di động Đa Nền tảng Cho Nhân Sự và Quản lý Doanh nghiệp",
        course_name=course_name,
        team_members=team_members,
        notes_dict={
            "objective": "Giới thiệu đề tài học phần Phát triển ứng dụng di động, cơ cấu nhóm 4 thành viên.",
            "narration": "Kính thưa quý Thầy Cô trong Hội đồng chấm đồ án, hôm nay nhóm 4 sinh viên chúng em xin đại diện báo cáo kết quả hiện thực hóa đề tài: Xây dựng ứng dụng quản trị công việc và tài sản doanh nghiệp WorkSphere bằng React Native và TypeScript thuộc học phần Phát triển ứng dụng di động.",
            "duration": "1 phút",
            "speaker": "Nguyễn Văn Cường (BIT240048)",
            "evidence": "reports/stage20/mobile-development/BAO_CAO_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pdf",
            "question": "Ứng dụng di động này đóng vai trò gì trong hệ sinh thái WorkSphere?",
            "answer": "WorkSphere Mobile đóng vai trò là client di động tiện ích cho nhân sự và cấp quản lý thao tác công việc nhanh chóng mọi lúc mọi nơi trên thiết bị Android/iOS.",
            "transition": "Mở đầu, em xin trình bày bài toán thực tế và phạm vi của ứng dụng di động."
        }
    )

    blank_layout = prs.slide_layouts[6]

    # --------------------------------------------------------------------------
    # SLIDE 2: PROBLEM & MOBILE SCOPE
    # --------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Bài Toán Thực Tế & Phạm Vi Ứng Dụng Di Động", "Bối Cảnh & Động Lực", course_tag)
    add_footer(s2, course_name, 2, total_slides)

    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Nhu Cầu Thực Tế Của Doanh Nghiệp",
             items=[
                 "Nhân sự thường xuyên di chuyển tại văn phòng, kho bãi hoặc công tác bên ngoài, không thể luôn mở máy tính xách tay.",
                 "Nhu cầu cập nhật tiến độ công việc, gửi báo cáo sự cố hoặc phê duyệt yêu cầu nội bộ tức thì.",
                 "Yêu cầu trải nghiệm di động mượt mà, khởi động nhanh, giao diện thân thiện chuẩn UX di động.",
                 "Đảm bảo an toàn thông tin: Token truy cập không bị đánh cắp nếu thiết bị thất lạc."
             ])

    add_card(s2, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Phạm Vi Hệ Thống (Mobile Scope)",
             items=[
                 "Tổng quy mô hệ thống: 29 Màn hình chức năng được tổ chức theo module chặt chẽ.",
                 "4 Phân hệ cốt lõi hoàn chỉnh: Xác thực người dùng (Auth), Bảng điều khiển (Dashboard), Quản lý Dự án (Projects), Quản lý Công việc (Tasks).",
                 "Các phân hệ mở rộng: Phiếu yêu cầu dịch vụ (Service Request), Quản lý Tài sản (Assets), Thông báo (Notifications) và Hồ sơ cá nhân (Profile).",
                 "Đối tượng người dùng: Toàn bộ cán bộ nhân viên và lãnh đạo quản lý trong tổ chức."
             ])

    set_speaker_notes(s2, {
        "objective": "Làm rõ vai trò của mobile client và phạm vi 29 màn hình chức năng.",
        "narration": "Trong môi trường làm việc hiện đại, tính cơ động là yếu tố quyết định hiệu suất. WorkSphere Mobile giải quyết triệt để nhu cầu tương tác tức thời của nhân sự thông qua 29 màn hình chức năng, bao phủ từ giao việc, nhận việc đến phê duyệt yêu cầu.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "docs/03_MOBILE_SCREEN_MAP.md",
        "question": "29 màn hình có quá nhiều cho một bài tập lớn không?",
        "answer": "29 màn hình bao gồm các trạng thái chi tiết (danh sách, chi tiết, tạo mới, chỉnh sửa, đổi mật khẩu) được thiết kế module hóa tái sử dụng cao, không gây phân mảnh mã nguồn.",
        "transition": "Tiếp theo, bạn Hoàng Bảo Long sẽ trình bày về luồng người dùng và vai trò."
    })

    # --------------------------------------------------------------------------
    # SLIDE 3: USER ROLES & WORKFLOWS
    # --------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Vai Trò Người Dùng & Các Luồng Nghiệp Vụ Chính", "Luồng Tác Vụ Người Dùng", course_tag)
    add_footer(s3, course_name, 3, total_slides)

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="4 Vai Trò & Phân Quyền Trên Mobile",
             items=[
                 "`EMPLOYEE`: Xem bảng điều khiển cá nhân, cập nhật trạng thái Task được giao, tạo phiếu yêu cầu dịch vụ, theo dõi tài sản bàn giao.",
                 "`TEAM_LEADER`: Xem tiến độ công việc của nhóm, phân công việc cho thành viên, phê duyệt bước đầu phiếu yêu cầu.",
                 "`PROJECT_MANAGER`: Quản lý danh sách dự án, cập nhật cột mốc (Milestones), thêm/bớt nhân sự dự án, theo dõi ngân sách.",
                 "`ADMIN`: Quản trị tài khoản, kiểm soát quyền truy cập hệ thống."
             ])

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Máy Trạng Thái Công Việc (Task State Machine)",
             items=[
                 "Chu trình trạng thái: `TODO` -> `IN_PROGRESS` -> `REVIEW` -> `DONE` (hoặc `CANCELLED`).",
                 "Ràng buộc vai trò chuyển trạng thái: Chỉ người được giao việc (`assignee`) hoặc Quản lý dự án mới được chuyển từ `TODO` sang `IN_PROGRESS`.",
                 "Kiểm soát hoàn thành: Trạng thái `DONE` đòi hỏi sự xác nhận của Trưởng nhóm hoặc Người tạo việc.",
                 "Xử lý ngoại lệ phân quyền: Giao diện hiển thị banner cảnh báo và khóa nút bấm nếu người dùng không đủ quyền hạn."
             ], border_color=C_TEAL)

    set_speaker_notes(s3, {
        "objective": "Trình bày ma trận phân quyền và máy trạng thái công việc trên ứng dụng di động.",
        "narration": "Ứng dụng phản ánh trung thực phân quyền doanh nghiệp: nhân viên chỉ được thao tác trên công việc của mình, trong khi cấp quản lý có thêm các hành động phê duyệt. Máy trạng thái công việc được kiểm soát chặt chẽ để ngăn chặn việc nhảy trạng thái sai quy trình.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "docs/02_USER_ROLES_AND_WORKFLOWS.md",
        "question": "Nếu nhân viên cố tình gọi API chuyển trạng thái không được phép thì sao?",
        "answer": "Giao diện di động tự động ẩn nút hoặc hiển thị trạng thái Permission Denied, đồng thời Backend sẽ chặn lại với mã lỗi 403 Forbidden.",
        "transition": "Để hiện thực hóa các luồng này, nhóm đã sử dụng ngăn xếp công nghệ di động nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 4: TECHNOLOGY STACK
    # --------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Ngăn Xếp Công Nghệ Mobile Hiện Đại (Tech Stack)", "Nền Tảng Công Nghệ", course_tag)
    add_footer(s4, course_name, 4, total_slides)

    add_card(s4, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Framework & Ngôn Ngữ",
             items=[
                 "React Native 0.88.0: Phiên bản kiến trúc mới hiện đại, tối ưu hóa hiệu năng render native.",
                 "React 19.3.0: Tận dụng các hooks cải tiến (`useActionState`, `useOptimistic`).",
                 "TypeScript 5.x: 100% mã nguồn có định kiểu nghiêm ngặt (Strict Type Safety), loại trừ lỗi runtime `undefined`.",
                 "Node.js 24.19.0: Ghim cố định phiên bản môi trường qua `.node-version`."
             ])

    add_card(s4, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Điều Hướng & Giao Tiếp",
             items=[
                 "React Navigation 7: Bộ định tuyến phân cấp mạnh mẽ (`Root`, `Auth`, `MainTabs`).",
                 "Axios Client: Cấu hình interceptors tự động gắn JWT và xử lý làm mới token (Token Refresh).",
                 "React Native Safe Area Context: Đảm bảo giao diện hiển thị chuẩn xác trên thiết bị có tai thỏ (Notch / Dynamic Island).",
                 "Vector Icons: Bộ biểu tượng chuẩn hóa, đồng bộ phong cách thiết kế."
             ])

    add_card(s4, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             title="Bảo Mật & Kiểm Thử",
             items=[
                 "React Native Keychain: Lưu trữ Refresh Token vào vùng nhớ mã hóa phần cứng an toàn.",
                 "AsyncStorage: Chỉ lưu trữ các cài đặt giao diện không nhạy cảm (Theme, Ngôn ngữ).",
                 "Jest 29 & React Native Testing Library: 129 test suites bảo đảm chất lượng toàn diện.",
                 "Android SDK: compileSdk 37, targetSdk 36, minSdk 24 (Hỗ trợ Android 7.0 đến Android 15/16)."
             ])

    set_speaker_notes(s4, {
        "objective": "Khẳng định nền tảng công nghệ mobile tiên tiến, đồng bộ và tuân thủ chuẩn công nghiệp.",
        "narration": "WorkSphere Mobile được xây dựng trên React Native 0.88 và React 19 mới nhất, kết hợp TypeScript (mobile/src). Nhóm sử dụng React Navigation 7 để điều phối màn hình và phân định rạch ròi cơ chế lưu trữ bảo mật bằng Keychain cho token nhạy cảm.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "mobile/package.json, mobile/android/build.gradle",
        "question": "Tại sao nhóm chọn React Native thay vì Flutter?",
        "answer": "React Native cho phép tận dụng hệ sinh thái TypeScript/JavaScript đồng nhất với web, khả năng tái sử dụng tư duy component và mô hình bảo mật mạnh mẽ của cộng đồng React.",
        "transition": "Tiếp theo, em xin giới thiệu kiến trúc phân tầng của ứng dụng di động."
    })

    # --------------------------------------------------------------------------
    # SLIDE 5: MOBILE FEATURE ARCHITECTURE
    # --------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Kiến Trúc Ứng Dụng Di Động: Phân Tầng Tính Năng (Feature-First)", "Kiến Trúc Mã Nguồn", course_tag)
    add_footer(s5, course_name, 5, total_slides)

    img_path = "reports/stage20/mobile-development/diagrams/fig1_mobile_architecture.png"
    if os.path.exists(img_path):
        s5.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s5, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Cấu Trúc Thư Mục Feature-First",
             items=[
                 "`mobile/src/features/`: Chia theo từng miền nghiệp vụ riêng biệt (`auth`, `dashboard`, `projects`, `tasks`, `assets`, `requests`).",
                 "Mỗi Feature bao gồm: `screens/`, `components/`, `hooks/`, `types/`, `api/` độc lập.",
                 "`mobile/src/shared/`: Chứa các thành phần dùng chung toàn ứng dụng (Buttons, Inputs, Cards, Dialogs, Modals, Formatters).",
                 "`mobile/src/core/`: Chứa cấu hình nền tảng: Axios client, AuthContext, Storage, Navigation Containers.",
                 "Lợi ích: Dễ mở rộng tính năng mới mà không sợ ảnh hưởng đến các màn hình đang chạy ổn định."
             ])

    set_speaker_notes(s5, {
        "objective": "Trình bày cấu trúc tổ chức mã nguồn theo hướng Feature-First chuyên nghiệp.",
        "narration": "Thay vì gom tất cả màn hình vào một thư mục screens khổng lồ, nhóm tổ chức theo mô hình Feature-First. Mỗi tính năng như Projects hay Tasks là một module khép kín chứa đầy đủ giao diện, logic hooks và API client riêng, giúp việc bảo trì vô cùng thuận tiện.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "reports/stage20/mobile-development/diagrams/fig1_mobile_architecture.png",
        "question": "Làm thế nào để hai features chia sẻ dữ liệu với nhau?",
        "answer": "Các features chia sẻ dữ liệu thông qua React Context tập trung ở tầng core (như AuthContext) hoặc thông qua params khi điều hướng qua React Navigation.",
        "transition": "Tiếp theo, bạn Lê Anh Tú sẽ trình bày về cây điều hướng màn hình."
    })

    # --------------------------------------------------------------------------
    # SLIDE 6: NAVIGATION FLOW
    # --------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Sơ Đồ Điều Hướng Phân Cấp (React Navigation 7)", "Cây Điều Hướng Màn Hình", course_tag)
    add_footer(s6, course_name, 6, total_slides)

    img_path = "reports/stage20/mobile-development/diagrams/fig2_screen_flow.png"
    if os.path.exists(img_path):
        s6.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s6, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Cấu Trúc Điều Hướng 3 Cấp",
             items=[
                 "Cấp 1 - RootNavigator: Bộ điều hướng gốc kiểm tra trạng thái xác thực `isAuthenticated` từ `AuthContext`.",
                 "Cấp 2 - AuthNavigator (Stack): Khi chưa đăng nhập, chỉ mở các màn hình: `LoginScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`.",
                 "Cấp 2 - MainTabNavigator (Bottom Tabs): Khi đã đăng nhập, mở thanh điều hướng dưới gồm 4 tab chính: `Dashboard`, `Projects`, `Tasks`, `More`.",
                 "Cấp 3 - Feature Stacks: Mỗi tab chứa một Stack Navigator riêng để điều hướng vào chi tiết (ví dụ: `ProjectDetailScreen`, `CreateTaskScreen`)."
             ])

    set_speaker_notes(s6, {
        "objective": "Mô tả cơ chế bảo vệ chuyển hướng tự động giữa trạng thái Auth và Non-Auth.",
        "narration": "Sơ đồ trên thể hiện cấu trúc điều hướng phân cấp. Điểm mấu chốt là RootNavigator liên tục lắng nghe trạng thái đăng nhập. Nếu token hết hạn hoặc người dùng bấm Đăng xuất, ứng dụng tự động hủy phiên và quay về LoginScreen, chặn đứng mọi thao tác truy cập trái phép.",
        "duration": "1.5 phút",
        "speaker": "Lê Anh Tú (BIT230423)",
        "evidence": "mobile/src/core/navigation/RootNavigator.tsx, fig2_screen_flow.png",
        "question": "Tại sao không dùng điều hướng có điều kiện if-else bên trong từng màn hình?",
        "answer": "Sử dụng RootNavigator quản lý Auth flow ở cấp cao nhất là Best Practice của React Navigation, giúp giải phóng hoàn toàn bộ nhớ của các màn hình nghiệp vụ khi đăng xuất và chống lỗi rò rỉ trạng thái.",
        "transition": "Tiếp theo, em xin làm rõ mô hình quản lý Component và Custom Hooks trong ứng dụng."
    })

    # --------------------------------------------------------------------------
    # SLIDE 7: COMPONENT & STATE MODEL
    # --------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Mô Hình Component & Quản Lý Trạng Thái (Custom Hooks)", "Quản Trị State & UI", course_tag)
    add_footer(s7, course_name, 7, total_slides)

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Tách Biệt UI & Business Logic",
             items=[
                 "Nguyên tắc Presentational & Container Components: Màn hình UI chỉ tập trung hiển thị giao diện và nhận tương tác, toàn bộ logic lấy dữ liệu được đóng gói trong Custom Hooks.",
                 "Custom Hook `useProjects`: Quản lý danh sách dự án, lọc theo trạng thái, tìm kiếm, phân trang và cơ chế kéo để làm mới (Pull-to-refresh).",
                 "Custom Hook `useTasks`: Quản lý tác vụ, cập nhật trạng thái lạc quan (Optimistic UI update) mang lại trải nghiệm phản hồi tức thì.",
                 "Tối ưu hóa re-render: Sử dụng `useCallback` và `useMemo` cho các hàm xử lý sự kiện và danh sách lọc phức tạp."
             ])

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Tối Ưu Hóa Danh Sách Với FlatList",
             items=[
                 "Sử dụng `FlatList` thay cho `ScrollView` đối với toàn bộ danh sách dữ liệu có khả năng mở rộng.",
                 "Thuộc tính `keyExtractor`: Luôn sử dụng mã định danh UUID duy nhất của phần tử (`item.id`).",
                 "Thuộc tính `initialNumToRender={10}`: Chỉ render đủ số lượng phần tử lấp đầy màn hình đầu tiên, rút ngắn thời gian mở màn hình.",
                 "`maxToRenderPerBatch={10}` & `windowSize={5}`: Giảm thiểu dung lượng chiếm dụng bộ nhớ RAM của thiết bị di động.",
                 "Hỗ trợ `RefreshControl`: Kéo vuốt để tải dữ liệu mới nhất một cách mượt mà."
             ])

    set_speaker_notes(s7, {
        "objective": "Làm rõ cách thức ứng dụng đạt được hiệu năng cao nhờ tách logic qua Hooks và tối ưu FlatList.",
        "narration": "Một thách thức lớn trong lập trình React Native là hiện tượng giật lag khi cuộn danh sách dài. Nhóm đã giải quyết triệt để bài toán này bằng cách tối ưu hóa các tham số FlatList và đóng gói toàn bộ logic gọi API vào các Custom Hooks chuyên biệt.",
        "duration": "1.5 phút",
        "speaker": "Lê Anh Tú (BIT230423)",
        "evidence": "mobile/src/features/projects/hooks/useProjects.ts",
        "question": "Tại sao không dùng Redux để quản lý toàn bộ trạng thái ứng dụng?",
        "answer": "Với quy mô của WorkSphere, việc lạm dụng Redux sẽ tạo ra rất nhiều mã boilerplate thừa. Sự kết hợp giữa React Context cho trạng thái toàn cục (Auth) và Custom Hooks cho trạng thái cục bộ là giải pháp gọn nhẹ, hiệu quả và dễ kiểm thử hơn.",
        "transition": "Tiếp theo, bạn Hoàng Bảo Long sẽ trình bày về chu trình xác thực và bảo mật phiên làm việc."
    })

    # --------------------------------------------------------------------------
    # SLIDE 8: AUTHENTICATION & TOKEN LIFECYCLE
    # --------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Xác Thực Bảo Mật & Vòng Đời Token Hai Lớp (Two-Tier Tokens)", "An Toàn Phiên Làm Việc", course_tag)
    add_footer(s8, course_name, 8, total_slides)

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cơ Chế Hai Loại Token (Two-Tier Tokens)",
             items=[
                 "Access Token (Ngắn hạn - 15 phút): Sử dụng để ký thực thi các request API thông thường qua Header `Authorization: Bearer <token>`.",
                 "Refresh Token (Dài hạn - 7 ngày): Sử dụng duy nhất cho mục đích cấp phát lại Access Token mới khi Access Token cũ hết hạn.",
                 "Nguyên tắc phân tầng lưu trữ bảo mật (Storage Fact):",
                 "• Access Token: Lưu trữ DUY NHẤT trong biến bộ nhớ RAM (`accessTokenStore`), tuyệt đối KHÔNG ghi xuống đĩa.",
                 "• Refresh Token: Lưu trữ trong React Native Keychain (Mã hóa phần cứng an toàn).",
                 "• AsyncStorage: Chỉ dùng lưu cài đặt giao diện không nhạy cảm."
             ], border_color=C_BLUE)

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Lợi Ích Bảo Mật Vượt Trội",
             items=[
                 "Chống tấn công đánh cắp dữ liệu lưu trữ (Storage Extraction): Ngay cả khi thiết bị Android bị root hoặc bị trích xuất dữ liệu, kẻ tấn công cũng không thể lấy được Access Token vì nó nằm trong RAM.",
                 "Giới hạn vùng ảnh hưởng (Blast Radius): Nếu Access Token vô tình bị lộ trong đường truyền mạng, nó sẽ tự động vô giá trị sau tối đa 15 phút.",
                 "Thu hồi quyền tức thì (Revocation): Quản trị viên có thể hủy Refresh Token trên máy chủ để chấm dứt ngay phiên làm việc của nhân sự nghỉ việc."
             ], border_color=C_TEAL)

    set_speaker_notes(s8, {
        "objective": "Trình bày kiến trúc bảo mật lưu trữ token đạt chuẩn enterprise trên thiết bị di động.",
        "narration": "Bảo mật lưu trữ là điểm nhấn quan trọng nhất của WorkSphere Mobile: Access Token chỉ nằm trong RAM của ứng dụng. Khi tắt app, Access Token tự động biến mất. Refresh Token dài hạn được mã hóa bằng phần cứng trong Keychain.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "mobile/src/core/auth/tokenStorage.ts, mobile/src/core/auth/accessTokenStore.ts",
        "question": "Nếu thiết bị bị mất thì người khác có trích xuất được token từ AsyncStorage không?",
        "answer": "Hoàn toàn không, vì nhóm tuyệt đối không lưu token vào AsyncStorage. AsyncStorage chỉ chứa các giá trị như dark/light mode hoặc ngôn ngữ.",
        "transition": "Khi Access Token hết hạn, quá trình làm mới token tự động diễn ra như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 9: API INTEGRATION & REFRESH FLOW
    # --------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Giao Tiếp API & Cơ Chế Tự Động Làm Mới Token (Axios Interceptors)", "Tích Hợp Mạng & Tự Động Hóa", course_tag)
    add_footer(s9, course_name, 9, total_slides)

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cấu Hình Axios Interceptor Hai Chiều",
             items=[
                 "Request Interceptor: Tự động kiểm tra bộ nhớ RAM và đính kèm `Authorization: Bearer <token>` vào mọi yêu cầu gửi đi.",
                 "Response Interceptor: Lắng nghe phản hồi từ máy chủ; khi gặp lỗi HTTP 401 Unauthorized, tự động kích hoạt luồng khôi phục.",
                 "Hàng đợi yêu cầu (Request Queue): Khi đang gọi API refresh, các request gửi đi đồng thời sẽ được đưa vào hàng đợi chờ, không gây bùng nổ nhiều yêu cầu refresh trùng lặp.",
                 "Trong suốt với người dùng (Transparent UX): Người dùng không hề nhận biết Access Token vừa hết hạn; thao tác vẫn diễn ra liền mạch."
             ])

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Chu Trình Xử Lý Sự Cố 401",
             items=[
                 "1. API trả về mã lỗi 401 Unauthorized do token hết hạn.",
                 "2. Interceptor giữ lại request lỗi ban đầu (Failed Request).",
                 "3. Đọc Refresh Token từ Keychain và gọi `/api/v1/auth/refresh`.",
                 "4. Nhận Access Token mới và lưu vào RAM `accessTokenStore`.",
                 "5. Thực hiện lại request ban đầu với token mới (Retry Request).",
                 "6. Trường hợp ngoại lệ: Nếu Refresh Token cũng hết hạn (7 ngày), tự động xóa sạch dữ liệu và chuyển về `LoginScreen`."
             ], border_color=C_BLUE)

    set_speaker_notes(s9, {
        "objective": "Mô tả giải thuật xử lý lỗi 401 và hàng đợi token refresh tự động bằng Axios Interceptor.",
        "narration": "Nhờ Axios Interceptors, quá trình làm mới Access Token diễn ra hoàn toàn tự động và trong suốt với người dùng. Thuật toán hàng đợi request queue đảm bảo khi 5 API cùng gửi đi một lúc mà token hết hạn, chỉ có đúng 1 yêu cầu refresh được gửi lên máy chủ.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "mobile/src/core/api/apiClient.ts",
        "question": "Nếu mạng bị mất trong lúc đang gọi API refresh thì sao?",
        "answer": "Axios Interceptor sẽ bắt lỗi mạng, giải phóng hàng đợi với lỗi Network Error và thông báo cho người dùng kiểm tra kết nối Internet.",
        "transition": "Tiếp theo, bạn Lê Anh Tú sẽ giới thiệu giao diện các màn hình tiêu biểu của ứng dụng."
    })

    # --------------------------------------------------------------------------
    # SLIDE 10: REPRESENTATIVE FEATURE SCREENS
    # --------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Giao Diện Màn Hình Mẫu Đại Diện (Screenshots & Prototype)", "Minh Họa Giao Diện", course_tag)
    add_footer(s10, course_name, 10, total_slides)

    # Insert images screen_01 and screen_02
    p1 = "reports/stage20/mobile-development/screenshots/screen_01_login.png"
    p2 = "reports/stage20/mobile-development/screenshots/screen_02_dashboard.png"
    if os.path.exists(p1):
        s10.shapes.add_picture(p1, Inches(0.8), Inches(1.8), Inches(2.5), Inches(4.8))
    if os.path.exists(p2):
        s10.shapes.add_picture(p2, Inches(3.6), Inches(1.8), Inches(2.5), Inches(4.8))

    add_card(s10, Inches(6.5), Inches(1.8), Inches(6.0), Inches(4.8), 
             title="Đặc Tả Thiết Kế Giao Diện Chuẩn UX",
             items=[
                 "Minh chứng hình ảnh: Bản mẫu thiết kế giao diện chuẩn UX Android Phone [PROTOTYPE_REFERENCE].",
                 "Màn hình Đăng nhập (LoginScreen): Hỗ trợ kiểm tra hợp lệ dữ liệu trực tiếp khi nhập (Form Validation), ẩn/hiện mật khẩu an toàn và hiển thị trạng thái loading spinner.",
                 "Màn hình Bảng điều khiển (DashboardScreen): Hiển thị lời chào cá nhân hóa, tóm tắt các chỉ số công việc trọng tâm trong ngày và danh sách các thông báo công việc khẩn.",
                 "Thiết kế đáp ứng (Responsive Layout): Tự động co giãn theo các kích thước màn hình Android khác nhau từ 5.5 inch đến 6.7 inch."
             ])

    set_speaker_notes(s10, {
        "objective": "Trình chiếu các giao diện cốt lõi của ứng dụng với nhãn minh chứng chuẩn xác PROTOTYPE_REFERENCE.",
        "narration": "Trên màn hình là hình ảnh thiết kế giao diện của LoginScreen và DashboardScreen. Nhóm lưu ý rằng các ảnh chụp này được ghi nhận với nhãn PROTOTYPE_REFERENCE, phản ánh đúng bố cục và trải nghiệm người dùng chuẩn mực trên thiết bị Android.",
        "duration": "1.5 phút",
        "speaker": "Lê Anh Tú (BIT230423)",
        "evidence": "reports/stage20/mobile-development/screenshots/screen_01_login.png",
        "question": "Ứng dụng có hỗ trợ chế độ màn hình tối (Dark Mode) không?",
        "answer": "Hiện tại hệ thống hỗ trợ bảng màu chuẩn Light Mode tối ưu cho môi trường văn phòng, kiến trúc màu sắc đã được trừu tượng hóa trong theme provider để sẵn sàng mở rộng Dark Mode.",
        "transition": "Để bảo đảm ứng dụng hoạt động tin cậy trong mọi tình huống mạng, nhóm đã cài đặt 4 trạng thái giao diện như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 11: FOUR UI STATES
    # --------------------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Kiểm Soát 4 Trạng Thái Giao Diện (States of UI)", "Trải Nghiệm Người Dùng", course_tag)
    add_footer(s11, course_name, 11, total_slides)

    # Insert images screen_05 and screen_06
    p5 = "reports/stage20/mobile-development/screenshots/screen_05_loading_state.png"
    p6 = "reports/stage20/mobile-development/screenshots/screen_06_empty_state.png"
    if os.path.exists(p5):
        s11.shapes.add_picture(p5, Inches(0.8), Inches(1.8), Inches(2.5), Inches(4.8))
    if os.path.exists(p6):
        s11.shapes.add_picture(p6, Inches(3.6), Inches(1.8), Inches(2.5), Inches(4.8))

    add_card(s11, Inches(6.5), Inches(1.8), Inches(6.0), Inches(4.8), 
             title="4 Trạng Thái Giao Diện Bắt Buộc",
             items=[
                 "1. Trạng thái Đang tải (Loading State): Hiển thị vòng xoay ActivityIndicator hoặc Skeleton Placeholder khi đang gửi yêu cầu mạng, khóa tương tác chống bấm đúp.",
                 "2. Trạng thái Có dữ liệu (Success / Content State): Hiển thị danh sách công việc hoặc chi tiết dự án mượt mà bằng `FlatList`.",
                 "3. Trạng thái Danh sách rỗng (Empty State): Hiển thị hình minh họa và thông điệp hướng dẫn rõ ràng (ví dụ: 'Chưa có dự án nào được giao. Hãy tạo dự án mới!').",
                 "4. Trạng thái Lỗi & Phân quyền (Error / Permission State): Hiển thị Banner cảnh báo lỗi kết nối mạng kèm nút 'Thử lại' (Retry), hoặc cảnh báo 403 Forbidden an toàn."
             ])

    set_speaker_notes(s11, {
        "objective": "Chứng minh sự hoàn thiện trong thiết kế trải nghiệm người dùng qua 4 trạng thái giao diện chuẩn mực.",
        "narration": "Một ứng dụng di động chuyên nghiệp không bao giờ để màn hình trắng khi tải hoặc khi gặp lỗi. WorkSphere Mobile bao phủ đầy đủ 4 trạng thái: Loading, Success, Empty và Error, giúp người dùng luôn nắm bắt được trạng thái của hệ thống.",
        "duration": "1.5 phút",
        "speaker": "Lê Anh Tú (BIT230423)",
        "evidence": "mobile/src/shared/components/LoadingIndicator.tsx, EmptyState.tsx, ErrorBanner.tsx",
        "question": "Làm thế nào để người dùng thử lại khi mạng bị rớt giữa chừng?",
        "answer": "ErrorBanner luôn đi kèm một nút bấm Thử lại (Retry Button), khi bấm sẽ kích hoạt lại hàm fetchData của Custom Hook mà không cần thoát màn hình.",
        "transition": "Tiếp theo, bạn Vũ Thị Thu Hướng sẽ trình bày về hệ thống kiểm thử tự động của ứng dụng."
    })

    # --------------------------------------------------------------------------
    # SLIDE 12: TESTING (129 SUITES / 1144 TESTS)
    # --------------------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Hệ Thống Kiểm Thử Tự Động Mobile (129 Suites / 1,144 Tests)", "Chất Lượng Mã Nguồn", course_tag)
    add_footer(s12, course_name, 12, total_slides)

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Quy Mô Kiểm Thử Đồ Sộ",
             items=[
                 "Tổng số Test Suites: 129 Suites độc lập (100% Pass, 0 Failure).",
                 "Tổng số Ca Kiểm Thử: 1,144 Tests tự động bao phủ toàn bộ chức năng.",
                 "Thời gian thực thi: ~45–60 giây trên môi trường kiểm thử Jest cục bộ.",
                 "Công cụ kiểm thử: Jest Runner kết hợp React Native Testing Library.",
                 "Chốt chặn tự động trên CI: Job `mobile-quality` trên GitHub Actions tự động chạy linter, typecheck và kiểm thử Jest."
             ], border_color=C_BLUE)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Phân Cấp Kiểm Thử Chi Tiết",
             items=[
                 "Unit Tests Reducers & State (38 Suites / 362 Tests): Kiểm tra toàn diện các máy trạng thái `authReducer`, `taskReducer`.",
                 "API Interceptor & Storage Tests (24 Suites / 218 Tests): Kiểm tra an toàn mã hóa Keychain, cơ chế nạp RAM và xử lý lỗi 401 refresh.",
                 "Component & Custom Hook Tests (52 Suites / 454 Tests): Kiểm tra render giao diện, sự kiện bấm nút và tính toán logic của `useProjects`.",
                 "Navigation Guard Tests (15 Suites / 110 Tests): Đảm bảo chuyển hướng và chặn người dùng trái phép chính xác 100%."
             ], border_color=C_TEAL)

    set_speaker_notes(s12, {
        "objective": "Trưng dẫn bằng chứng thực nghiệm mạnh mẽ về độ tin cậy của mã nguồn di động qua 1,144 ca kiểm thử.",
        "narration": "Toàn bộ mã nguồn di động được kiểm soát chất lượng bởi 129 test suites với 1,144 ca kiểm thử tự động. Nhóm kiểm thử từ các hàm tiện ích nhỏ nhất đến các luồng tương tác component phức tạp và luồng làm mới token của Axios Interceptor.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "mobile package test scripts, 129 test suites pass",
        "question": "1,144 bài test này có chạy trên điện thoại thật không?",
        "answer": "Dạ không, đây là các bài kiểm thử tự động ở cấp độ Component và Unit Test chạy trên Node.js với môi trường mô phỏng DOM của Jest, giúp kiểm tra logic cực kỳ nhanh chóng và chính xác.",
        "transition": "Vậy ứng dụng đã được biên dịch và kiểm chứng trên máy ảo Android như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 13: ANDROID BUILD & EMULATOR EVIDENCE
    # --------------------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Biên Dịch Android Debug APK & Minh Chứng Thực Nghiệm", "Đóng Gói & Thực Nghiệm", course_tag)
    add_footer(s13, course_name, 13, total_slides)

    add_card(s13, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Quy Trình Biên Dịch Android Chuẩn Hóa",
             items=[
                 "Công cụ đóng gói: Gradle Wrapper (`./gradlew assembleDebug`) bảo đảm tính nhất quán phiên bản build.",
                 "Thông số SDK mục tiêu: compileSdk 37, targetSdk 36, minSdk 24 (Hỗ trợ từ Android 7.0 đến Android 15/16 mới nhất).",
                 "Sản phẩm đóng gói (Artifact): Tệp `app-debug.apk` được sinh tự động trên máy trạm và lưu trữ tạm thời trên GitHub Actions Artifacts.",
                 "Thời gian build trung bình: ~3-5 phút trên môi trường phát triển cục bộ."
             ])

    add_card(s13, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ranh Giới Xác Thực Môi Trường Chạy",
             items=[
                 "Thiết bị mô phỏng xác thực: Đã chạy thực nghiệm thành công trên Android Emulator (AVD `emulator-5554`, Android API 35).",
                 "Xác thực mạng nội bộ: Cấu hình URL kết nối máy chủ backend qua địa chỉ loopback `10.0.2.2:8080` đặc thù của máy ảo Android.",
                 "Khẳng định ranh giới trung thực:",
                 "• Máy ảo Android Emulator: ĐÃ XÁC THỰC (VERIFIED).",
                 "• Thiết bị vật lý thật (Physical Device): CHƯA XÁC THỰC (NOT VERIFIED).",
                 "• Chữ ký phát hành Production (Release Signing): CHƯA KÝ (CHỈ DÙNG DEBUG KEYSTORE)."
             ], border_color=C_ORANGE)

    set_speaker_notes(s13, {
        "objective": "Trình bày năng lực biên dịch APK và khẳng định trung thực ranh giới chạy trên Android Emulator.",
        "narration": "Ứng dụng được biên dịch tự động qua Gradle Wrapper tạo ra tệp app-debug.apk. Nhóm đã cài đặt và chạy thử nghiệm thành công trên Android Emulator API 35. Nhóm khẳng định rõ: ứng dụng chưa được kiểm chứng trên thiết bị vật lý thật và chỉ dùng debug keystore phục vụ đồ án.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "mobile/android/app/build.gradle, ci.yml android-debug-build",
        "question": "Tại sao máy ảo Android phải kết nối qua IP 10.0.2.2 thay vì localhost?",
        "answer": "Trong Android Emulator, localhost đại diện cho chính máy ảo; địa chỉ 10.0.2.2 là địa chỉ IP ảo được Google thiết kế riêng để máy ảo trỏ về máy tính host chạy backend.",
        "transition": "Tiếp theo, em xin đánh giá các hạn chế và hướng phát triển tiếp theo của ứng dụng."
    })

    # --------------------------------------------------------------------------
    # SLIDE 14: LIMITATIONS & FUTURE WORK
    # --------------------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Hạn Chế Của Ứng Dụng & Hướng Phát Triển Tiếp Theo", "Đánh Giá Khách Quan", course_tag)
    add_footer(s14, course_name, 14, total_slides)

    add_card(s14, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Những Hạn Chế Kỹ Thuật Hiện Tại",
             items=[
                 "Chưa hỗ trợ chế độ hoạt động ngoại tuyến hoàn toàn (Full Offline Mode với cơ chế đồng bộ cơ sở dữ liệu WatermelonDB / SQLite).",
                 "Chưa cấu hình chứng chỉ ký phát hành chính thức (Release Keystore) để đưa lên Google Play Store.",
                 "Chưa tích hợp dịch vụ đẩy thông báo thời gian thực qua Firebase Cloud Messaging (FCM).",
                 "Chưa kiểm thử thực tế trên hệ điều hành iOS (do thiếu hạ tầng máy chủ macOS và tài khoản Apple Developer)."
             ], border_color=C_ORANGE)

    add_card(s14, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Định Hướng Phát Triển Tương Lai",
             items=[
                 "Giai đoạn 1: Tích hợp thư viện WatermelonDB hoặc Realm để lưu trữ dữ liệu offline, tự động đồng bộ khi có mạng.",
                 "Giai đoạn 2: Tích hợp Firebase Cloud Messaging (FCM) để nhận thông báo tức thì khi có công việc mới.",
                 "Giai đoạn 3: Thiết lập pipeline CI/CD tự động đóng gói tệp Android App Bundle (AAB) và đẩy lên kênh Google Play Internal Testing.",
                 "Giai đoạn 4: Mở rộng kiểm thử và biên dịch trên hệ điều hành iOS."
             ])

    set_speaker_notes(s14, {
        "objective": "Thể hiện góc nhìn khoa học, nhận thức rõ các giới hạn cần bổ sung trong môi trường sản xuất.",
        "narration": "Dù đã hoàn thành xuất sắc các yêu cầu của môn học, ứng dụng vẫn còn những hạn chế như chưa có đồng bộ dữ liệu ngoại tuyến hoàn toàn và chưa tích hợp Firebase Cloud Messaging. Nhóm đã vạch ra lộ trình nâng cấp 4 giai đoạn cụ thể để phát triển ứng dụng thành sản phẩm thương mại.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "Chương 4 Báo cáo Phát triển ứng dụng di động",
        "question": "Nếu ứng dụng bị mất kết nối mạng đột ngột thì dữ liệu người dùng đang nhập có bị mất không?",
        "answer": "Hiện tại biểu mẫu vẫn giữ nguyên trạng thái trên RAM của màn hình, người dùng chỉ cần bật lại kết nối và bấm gửi lại mà không bị mất dữ liệu đã nhập.",
        "transition": "Cuối cùng, nhóm xin chuyển sang phần demo ứng dụng và hỏi đáp cùng Hội đồng."
    })

    # --------------------------------------------------------------------------
    # SLIDE 15: DEMO / Q&A
    # --------------------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "Thực Nghiệm Demo Ứng Dụng & Hỏi Đáp (Q&A)", "Kết Thúc Thuyết Trình", course_tag)
    add_footer(s15, course_name, 15, total_slides)

    add_card(s15, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Kịch Bản Demo Trực Tiếp Trên Emulator",
             items=[
                 "Kịch bản 1: Đăng nhập với tài khoản `EMPLOYEE` và trải nghiệm Bảng điều khiển (Dashboard).",
                 "Kịch bản 2: Duyệt danh sách dự án với hiệu ứng cuộn `FlatList` và kéo để làm mới (Pull-to-refresh).",
                 "Kịch bản 3: Mở chi tiết công việc, thực hiện chuyển trạng thái từ `TODO` sang `IN_PROGRESS`.",
                 "Kịch bản 4: Mô phỏng hành động vượt thẩm quyền để minh chứng cơ chế phòng vệ phân quyền RBAC.",
                 "Kịch bản dự phòng (Fallback): Sẵn sàng hiển thị album ảnh chụp màn hình kiểm thử đã xác minh nếu máy ảo gặp sự cố kết nối."
             ], border_color=C_BLUE)

    add_card(s15, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Danh Mục Minh Chứng Sẵn Sàng Đối Soát",
             items=[
                 "Mã nguồn Mobile: `d:\\WorkSphere\\mobile\\`",
                 "1,144 Tests tự động: Lệnh chạy trực tiếp `npm test`",
                 "Báo cáo môn học: `reports/stage20/mobile-development/`",
                 "Bộ cài đặt Android: Tệp `app-debug.apk` sẵn có trên máy",
                 "Đặc tả màn hình: `docs/03_MOBILE_SCREEN_MAP.md`",
                 "Nhóm xin chân thành cảm ơn quý Thầy/Cô trong Hội đồng!"
             ], border_color=C_TEAL)

    set_speaker_notes(s15, {
        "objective": "Kết thúc bài thuyết trình học phần di động, mời Hội đồng theo dõi demo và đặt câu hỏi phản biện.",
        "narration": "Bài thuyết trình học phần Phát triển ứng dụng di động của nhóm xin được khép lại. Nhóm chúng em đã sẵn sàng khởi động Android Emulator để thực hiện các kịch bản demo và trả lời câu hỏi của quý thầy cô.",
        "duration": "1 phút",
        "speaker": "Toàn thể thành viên nhóm",
        "evidence": "Kho mã nguồn D:\\WorkSphere\\mobile",
        "question": "Hội đồng yêu cầu chạy trực tiếp lệnh npm test trên terminal để đối soát kết quả 1,144 test.",
        "answer": "Dạ vâng, em xin phép mở terminal tại thư mục mobile và chạy lệnh npm test để Hội đồng kiểm tra trực tiếp.",
        "transition": "Chuyển sang phần thao tác thực nghiệm trên máy tính."
    })

    out_path = "reports/stage20/presentations/02_PHAT_TRIEN_UNG_DUNG_DI_DONG_WORKSPHERE.pptx"
    prs.save(out_path)
    print(f"Deck 2 generated successfully: {out_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    build_deck()
