"""
Generator script for Deck 3: IT Project Management (Quản Lý Dự Án Công Nghệ Thông Tin)
12 slides as PROJECT_DEFENSE_RECOMMENDED (Instructor template aligned 8-12 slides).
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
    total_slides = 12
    course_name = "Quản Lý Dự Án Công Nghệ Thông Tin"
    course_tag = "IT PROJECT MANAGEMENT"
    
    team_members = [
        {"name": "Nguyễn Minh Hiếu", "id": "BIT247729", "role": "Nhóm trưởng (Project Charter, Schedule, CPM, Lead)"},
        {"name": "Nguyễn Văn Cường", "id": "BIT240048", "role": "Thành viên (Scope Management, WBS, WBS Dictionary)"},
        {"name": "Vũ Thị Thu Hướng", "id": "BIT240113", "role": "Thành viên (Quality Management, Testing Plan, Acceptance)"},
        {"name": "Hoàng Bảo Long", "id": "BIT240142", "role": "Thành viên (Human Resources, RACI Matrix, Workload Leveling)"}
    ]

    # --------------------------------------------------------------------------
    # SLIDE 1: COVER
    # --------------------------------------------------------------------------
    add_cover_slide(
        prs,
        title="KẾ HOẠCH QUẢN LÝ DỰ ÁN PHẦN MỀM WORKSPHERE\nTHEO CHUẨN MỰC PMBOK & MÔ HÌNH THỰC NGHIỆM",
        subtitle="Hồ sơ Lập Kế Hoạch, Phân Bổ Tiến Độ, Tối Ưu Nguồn Lực và Quản Trị Rủi Ro",
        course_name=course_name,
        team_members=team_members,
        notes_dict={
            "objective": "Giới thiệu đề tài học phần Quản lý dự án CNTT, cơ cấu nhóm 4 thành viên.",
            "narration": "Kính thưa quý Thầy Cô trong Hội đồng chấm đồ án, hôm nay nhóm 4 sinh viên chúng em xin đại diện báo cáo hồ sơ kế hoạch quản lý dự án công nghệ thông tin cho nền tảng WorkSphere theo tiêu chuẩn quản trị dự án chuyên nghiệp.",
            "duration": "1 phút",
            "speaker": "Nguyễn Minh Hiếu (BIT247729)",
            "evidence": "reports/stage20/it-project-management/BAO_CAO_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pdf",
            "question": "Dữ liệu trình bày trong hồ sơ này là dữ liệu thực tế hay mô hình?",
            "answer": "Dữ liệu tiến độ và công nhật được xây dựng theo mô hình kế hoạch dự án chuẩn (PROJECT_PLAN_MODEL) để đối soát phương pháp luận, không phải là bảng chấm công thực tế lịch sử.",
            "transition": "Trước hết, em xin trình bày về Điều lệ dự án và mục tiêu chiến lược."
        }
    )

    blank_layout = prs.slide_layouts[6]

    # --------------------------------------------------------------------------
    # SLIDE 2: PROJECT CHARTER & OBJECTIVES
    # --------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Điều Lệ Dự Án (Project Charter) & Mục Tiêu Chiến Lược", "Khởi Tạo Dự Án", course_tag)
    add_footer(s2, course_name, 2, total_slides)

    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Thông Tin Điều Lệ Dự Án",
             items=[
                 "Tên dự án: Hệ thống quản trị công việc và tài sản số WorkSphere.",
                 "Nhà tài trợ (Sponsor): Ban Giám hiệu & Khoa CNTT & TT — Trường Đại học CMC.",
                 "Giám đốc dự án (Project Manager): Nguyễn Minh Hiếu (BIT247729).",
                 "Thời gian thực hiện kế hoạch: 51 ngày làm việc (tương đương ~11 tuần làm việc).",
                 "Ranh giới ngân sách: Giới hạn trong khuôn khổ học thuật và hạ tầng phát triển cục bộ."
             ])

    add_card(s2, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Mục Tiêu SMART Của Dự Án",
             items=[
                 "Specific (Cụ thể): Xây dựng hoàn chỉnh nền tảng quản trị hợp nhất gồm 4 phân hệ chính: Dự án, Công việc, Yêu cầu và Tài sản.",
                 "Measurable (Đo lường được): 100% vượt qua 351 test backend, 1,144 test mobile, 0 lỗi checkstyle.",
                 "Achievable (Khả thi): Khai thác năng lực cốt lõi của 4 thành viên theo đúng chuyên môn kỹ thuật.",
                 "Relevant (Thực tiễn): Giải quyết triệt để bài toán phân mảnh thông tin vận hành doanh nghiệp.",
                 "Time-bound (Thời hạn rõ ràng): Bàn giao toàn bộ sản phẩm và tài liệu đúng mốc học kỳ Fall 2026."
             ], border_color=C_TEAL)

    set_speaker_notes(s2, {
        "objective": "Làm rõ Điều lệ dự án và các mục tiêu định lượng theo nguyên tắc SMART.",
        "narration": "Một dự án thành công bắt đầu từ một Project Charter rõ ràng. WorkSphere thiết lập các mục tiêu đo lường được cụ thể: không chỉ bàn giao phần mềm chạy được mà còn phải vượt qua toàn bộ các cổng kiểm soát chất lượng tự động trong thời hạn 51 ngày làm việc.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 1 Báo cáo Quản lý dự án CNTT",
        "question": "Ai là người phê duyệt Điều lệ dự án này?",
        "answer": "Project Charter được đề xuất bởi nhóm sinh viên và được bảo vệ, phê duyệt bởi Giảng viên phụ trách học phần Quản lý dự án CNTT.",
        "transition": "Tiếp theo, em xin giới thiệu cơ cấu các bên liên quan và vòng đời dự án."
    })

    # --------------------------------------------------------------------------
    # SLIDE 3: STAKEHOLDERS & LIFECYCLE
    # --------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Quản Trị Các Bên Liên Quan & Vòng Đời Dự Án", "Các Bên Liên Quan & Vòng Đời", course_tag)
    add_footer(s3, course_name, 3, total_slides)

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ma Trận Các Bên Liên Quan (Stakeholders)",
             items=[
                 "Nhóm Quyền hạn cao / Quan tâm cao (Manage Closely): Giảng viên hướng dẫn, Hội đồng chấm thi — Cần báo cáo tiến độ định kỳ hàng tuần.",
                 "Nhóm Quyền hạn thấp / Quan tâm cao (Keep Informed): Cán bộ nhân viên, người dùng thử nghiệm — Cung cấp hướng dẫn sử dụng và ghi nhận phản hồi.",
                 "Nhóm Quyền hạn cao / Quan tâm thấp (Keep Satisfied): Khoa CNTT, Phòng Đào tạo — Đảm bảo tuân thủ đầy đủ các quy chế và tiến độ học phần.",
                 "Nhóm Quyền hạn thấp / Quan tâm thấp (Monitor): Các bên cung cấp hạ tầng công nghệ mở."
             ])

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Vòng Đời Phát Triển Lai (Hybrid Lifecycle)",
             items=[
                 "Giai đoạn 1 - Khởi tạo & Kế hoạch (Predictive / Waterfall): Khóa chặt tài liệu đặc tả yêu cầu (SRS) và thiết kế cơ sở dữ liệu để bảo đảm tính toàn vẹn kiến trúc.",
                 "Giai đoạn 2 - Phát triển & Kiểm thử (Iterative / Agile): Triển khai mã nguồn theo từng Sprint 2 tuần, tích hợp liên tục trên GitHub Actions.",
                 "Giai đoạn 3 - Đóng gói & Nghiệm thu (Controlled Gate): Diễn tập phục hồi dữ liệu, kiểm thẩm tài liệu trước khi bảo vệ trước Hội đồng."
             ], border_color=C_BLUE)

    set_speaker_notes(s3, {
        "objective": "Trình bày chiến lược quản lý các bên liên quan và mô hình vòng đời phát triển lai phù hợp.",
        "narration": "WorkSphere áp dụng mô hình vòng đời phát triển lai (Hybrid Lifecycle): Nhóm sử dụng phương pháp quản lý kế hoạch chặt chẽ ở khâu thiết kế kiến trúc và CSDL, nhưng chuyển sang mô hình Agile lặp nhanh khi phát triển tính năng và kiểm thử tự động.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "Chương 1.2 Báo cáo Quản lý dự án CNTT",
        "question": "Tại sao không áp dụng thuần túy Agile Scrum từ đầu đến cuối?",
        "answer": "Đối với hệ thống doanh nghiệp phức tạp có ràng buộc CSDL lớn, việc thay đổi cấu trúc bảng liên tục sẽ phá vỡ tính toàn vẹn; do đó việc chốt kiến trúc trước (Predictive) giúp giảm thiểu tối đa chi phí làm lại (Rework).",
        "transition": "Tiếp theo, bạn Nguyễn Văn Cường sẽ trình bày về quản trị phạm vi và cấu trúc WBS."
    })

    # --------------------------------------------------------------------------
    # SLIDE 4: SCOPE MANAGEMENT & SOW
    # --------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Quản Trị Phạm Vi Dự Án (Scope Management & SOW)", "Ranh Giới Phạm Vi", course_tag)
    add_footer(s4, course_name, 4, total_slides)

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Tuyên Bố Phạm Vi Công Việc (SOW)",
             items=[
                 "Phân hệ Quản trị người dùng & Phân quyền (Identity & Access Control): Đăng nhập, phân quyền 4 vai trò, kiểm soát phiên JWT.",
                 "Phân hệ Quản lý Dự án & Cột mốc (Project Management): Lập dự án, theo dõi tiến độ, quản lý thành viên và cột mốc.",
                 "Phân hệ Quản trị Công việc (Task Management): Giao việc, chuyển đổi máy trạng thái, lọc công việc cá nhân.",
                 "Phân hệ Phiếu dịch vụ (Service Request): Tạo yêu cầu, phê duyệt đa cấp và truy vết xử lý.",
                 "Phân hệ Quản lý Tài sản (Asset Management): Quản lý vòng đời tài sản và cấp phát nội bộ."
             ])

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ranh Giới Loại Trừ (Out of Scope)",
             items=[
                 "Tích hợp cổng thanh toán trực tuyến: Không thuộc phạm vi phần mềm điều hành nội bộ.",
                 "Triển khai hạ tầng đám mây công cộng (AWS/GCP): Chỉ tập trung đóng gói container chạy cục bộ.",
                 "Hỗ trợ hệ điều hành iOS native: Giới hạn kiểm nghiệm thực tế trên môi trường Android Emulator.",
                 "Triển khai cụm Kubernetes thực tế: Giữ nguyên ở mức phân tích lý thuyết kiến trúc.",
                 "Nguyên tắc: Quản trị phạm vi nghiêm ngặt giúp dự án không bị phình to (Scope Creep) và bảo đảm tiến độ bàn giao."
             ], border_color=C_RED)

    set_speaker_notes(s4, {
        "objective": "Khẳng định ranh giới phạm vi rõ ràng, minh bạch những phần trong và ngoài dự án.",
        "narration": "Một nguyên nhân phổ biến khiến các dự án CNTT thất bại là hiện tượng phình phạm vi (Scope Creep). Nhóm đã thiết lập bản Tuyên bố phạm vi SOW rõ ràng: tập trung giải quyết xuất sắc 5 phân hệ cốt lõi và loại trừ dứt khoát các yếu tố không bắt buộc như cổng thanh toán hay cụm máy chủ đám mây đắt đỏ.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "Chương 2.1 Báo cáo Quản lý dự án CNTT",
        "question": "Làm thế nào để xử lý nếu có yêu cầu phát sinh thêm tính năng từ giảng viên?",
        "answer": "Nhóm áp dụng quy trình kiểm soát thay đổi (Change Control Process): đánh giá tác động tới tiến độ và nguồn lực trước khi đưa vào backlog giai đoạn sau.",
        "transition": "Từ phạm vi trên, nhóm đã phân rã thành cây công việc WBS như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 5: WBS HIERARCHY
    # --------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Cấu Trúc Phân Rã Công Việc (Work Breakdown Structure - WBS)", "Phân Rã Công Việc", course_tag)
    add_footer(s5, course_name, 5, total_slides)

    img_path = "reports/stage20/it-project-management/diagrams/fig_wbs_hierarchy.png"
    if os.path.exists(img_path):
        s5.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(7.0), Inches(4.8))

    add_card(s5, Inches(8.0), Inches(1.8), Inches(4.5), Inches(4.8), 
             title="Quy Chuẩn Phân Rã WBS",
             items=[
                 "Quy tắc 100%: Toàn bộ sản phẩm bàn giao của dự án được bao phủ trọn vẹn trong 14 gói công việc.",
                 "3 Cấp độ phân cấp: Cấp 1 (Dự án WorkSphere), Cấp 2 (Giai đoạn vòng đời), Cấp 3 (Gói công việc cụ thể).",
                 "WBS Dictionary: Mỗi gói công việc đều có từ điển định nghĩa rõ đầu vào, đầu ra và tiêu chí hoàn thành.",
                 "Tính độc lập: Các gói công việc không bị trùng lặp trách nhiệm hoặc ranh giới kỹ thuật."
             ])

    set_speaker_notes(s5, {
        "objective": "Trình bày cấu trúc phân rã công việc 3 cấp độ chuẩn mực PMBOK.",
        "narration": "Sơ đồ WBS trên thể hiện sự phân rã có hệ thống từ cấp độ dự án tổng thể xuống 14 gói công việc cụ thể ở cấp 3. Mỗi gói công việc đều được định nghĩa rõ ràng trong Từ điển WBS với các sản phẩm bàn giao định lượng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Văn Cường (BIT240048)",
        "evidence": "reports/stage20/it-project-management/diagrams/fig_wbs_hierarchy.png",
        "question": "Thế nào là nguyên tắc 100% trong WBS?",
        "answer": "Nguyên tắc 100% khẳng định WBS bao gồm 100% phạm vi công việc đã cam kết trong dự án, không thiếu sót bất kỳ phần nào và cũng không chứa công việc ngoài phạm vi.",
        "transition": "Tiếp theo, nhóm trưởng Nguyễn Minh Hiếu sẽ trình bày mô hình ước lượng thời gian PERT và tiến độ CPM."
    })

    # --------------------------------------------------------------------------
    # SLIDE 6: SCHEDULE, PERT & CPM
    # --------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Ước Lượng Tiến Độ PERT & Sơ Đồ Mạng PDM / CPM", "Mô Hình Tiến Độ", course_tag)
    add_footer(s6, course_name, 6, total_slides)

    img_path = "reports/stage20/it-project-management/diagrams/fig_pdm_cpm_network.png"
    if os.path.exists(img_path):
        s6.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))

    add_card(s6, Inches(7.8), Inches(1.8), Inches(4.7), Inches(4.8), 
             title="Công Thức Ước Lượng & CPM",
             items=[
                 "Ước lượng 3 điểm PERT: `Te = (O + 4M + P) / 6`, giảm thiểu sai số chủ quan của con người.",
                 "Phương pháp sơ đồ tiền độ (PDM): Xác định các mối quan hệ Finish-to-Start (FS) giữa 14 hoạt động.",
                 "Đường găng (Critical Path): Chuỗi công việc có tổng thời gian dự trữ bằng 0 (`Float = 0`).",
                 "Thời lượng đường găng: Đúng 51 ngày làm việc mô hình.",
                 "Ý nghĩa quản trị: Bất kỳ sự chậm trễ nào trên đường găng (màu đỏ) đều sẽ làm chậm tiến độ toàn bộ dự án."
             ])

    set_speaker_notes(s6, {
        "objective": "Trình bày phương pháp luận ước lượng PERT và xác định đường găng Critical Path 51 ngày.",
        "narration": "Để lập kế hoạch tiến độ khoa học, nhóm áp dụng công thức ước lượng 3 điểm PERT với các kịch bản Lạc quan, Khả dĩ nhất và Bi quan. Thông qua giải thuật CPM, nhóm đã tìm ra Đường găng gồm chuỗi công việc từ Điều lệ, SRS đến Backend và Nghiệm thu với tổng độ dài 51 ngày làm việc.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/it-project-management/diagrams/fig_pdm_cpm_network.png",
        "question": "Thời gian dự trữ (Total Float) là gì và các công việc không nằm trên đường găng có thời gian dự trữ là bao nhiêu?",
        "answer": "Total Float là khoảng thời gian một công việc có thể bị chậm trễ mà không ảnh hưởng đến ngày kết thúc dự án. Các công việc như Cài đặt hạ tầng hoặc Tài liệu có thời gian dự trữ từ 2 đến 5 ngày.",
        "transition": "Tiến độ này được thể hiện trực quan trên Biểu đồ Gantt như thế nào?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 7: GANTT CHART & CRITICAL PATH
    # --------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Biểu Đồ Tiến Độ Gantt (Gantt Chart & Đường Găng 51 Ngày)", "Theo Dõi Tiến Độ", course_tag)
    add_footer(s7, course_name, 7, total_slides)

    img_path = "reports/stage20/it-project-management/diagrams/fig_gantt_chart.png"
    if os.path.exists(img_path):
        s7.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(7.2), Inches(4.8))

    add_card(s7, Inches(8.2), Inches(1.8), Inches(4.3), Inches(4.8), 
             title="Đặc Tả Tiến Độ Thực Nghiệm",
             items=[
                 "Mô hình tiến độ chuẩn: Thể hiện 14 gói công việc trên trục thời gian tuần tự.",
                 "Các mốc kiểm soát chính (Milestones):",
                 "• M1: Khóa yêu cầu & Thiết kế (Tuần 3).",
                 "• M2: Hoàn thành Backend Core (Tuần 6).",
                 "• M3: Hoàn thành Mobile Client (Tuần 8).",
                 "• M4: Đóng gói tích hợp & CI (Tuần 10).",
                 "• M5: Bàn giao & Nghiệm thu (Tuần 11).",
                 "Công cụ tạo biểu đồ: Sinh tự động từ bảng dữ liệu tính toán Excel chuẩn xác."
             ])

    set_speaker_notes(s7, {
        "objective": "Trình chiếu biểu đồ Gantt Chart trực quan hóa toàn bộ tiến độ 14 gói công việc.",
        "narration": "Biểu đồ Gantt trên màn hình được kết xuất trực tiếp từ mô hình tính toán tiến độ. Các vạch màu đỏ đại diện cho các gói công việc thuộc đường găng, đòi hỏi sự theo dõi sát sao của Quản lý dự án để đảm bảo cán đích đúng hạn.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/it-project-management/diagrams/fig_gantt_chart.png",
        "question": "Nếu Backend Core bị chậm 3 ngày thì Quản lý dự án phải làm gì?",
        "answer": "Vì Backend nằm trên đường găng, nếu bị chậm 3 ngày thì toàn bộ dự án sẽ chậm 3 ngày; Quản lý dự án phải áp dụng kỹ thuật Crashing (bổ sung nhân lực) hoặc Fast-tracking (cho Mobile làm giao diện song song với dữ liệu mock).",
        "transition": "Tiếp theo, bạn Hoàng Bảo Long sẽ trình bày về tổ chức nhân sự và ma trận RACI."
    })

    # --------------------------------------------------------------------------
    # SLIDE 8: TEAM ORGANIZATION & RACI MATRIX
    # --------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Tổ Chức Nhân Sự & Ma Trận Trách Nhiệm RACI", "Quản Trị Nguồn Lực", course_tag)
    add_footer(s8, course_name, 8, total_slides)

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Cơ Cấu Tổ Chức Nhóm 4 Thành Viên",
             items=[
                 "Nguyễn Minh Hiếu (Leader): Quản trị tổng thể dự án, kiến trúc hệ thống, lịch trình CPM và điều phối chất lượng.",
                 "Nguyễn Văn Cường: Kỹ sư Backend chính, phân tích nghiệp vụ, thiết kế RESTful API và đặc tả WBS.",
                 "Vũ Thị Thu Hướng: Kỹ sư CSDL & Đảm bảo chất lượng (QA), quản trị Flyway schema và xây dựng kế hoạch kiểm thử.",
                 "Hoàng Bảo Long: Kỹ sư Bảo mật & Mobile, quản trị xác thực JWT, phân bổ nguồn lực và ma trận RACI."
             ])

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ma Trận Trách Nhiệm RACI Chuẩn",
             items=[
                 "R (Responsible - Người thực hiện): Người trực tiếp bắt tay vào làm ra sản phẩm.",
                 "A (Accountable - Người chịu trách nhiệm cuối cùng): Duy nhất 1 người chịu trách nhiệm phê duyệt kết quả.",
                 "C (Consulted - Người được tham vấn): Chuyên gia đóng góp ý kiến chuyên môn.",
                 "I (Informed - Người được thông báo): Các bên nhận thông tin tiến độ.",
                 "Quy tắc vàng: Mọi hoạt động trong dự án chỉ có DUY NHẤT 1 chữ A để tránh hiện tượng đùn đẩy trách nhiệm."
             ], border_color=C_TEAL)

    set_speaker_notes(s8, {
        "objective": "Trình bày ma trận phân quyền trách nhiệm RACI minh bạch cho 4 thành viên.",
        "narration": "Để nhóm vận hành hiệu quả và không dẫm chân lên nhau, nhóm áp dụng ma trận RACI. Nguyên tắc cốt lõi là trên mỗi gói công việc chỉ có duy nhất một người giữ vai trò Accountable chịu trách nhiệm cao nhất về chất lượng đầu ra.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "Chương 4.1 Báo cáo Quản lý dự án CNTT",
        "question": "Nếu hai người cùng giữ vai trò Accountable cho một công việc thì có sao không?",
        "answer": "Trong lý thuyết quản trị PMBOK, việc có hai chữ A cho một công việc là điều tối kỵ vì sẽ dẫn đến tranh chấp quyền quyết định hoặc đùn đẩy trách nhiệm khi xảy ra sự cố.",
        "transition": "Nguồn lực nhân sự được cân bằng như thế nào để tránh tình trạng quá tải?"
    })

    # --------------------------------------------------------------------------
    # SLIDE 9: WORKLOAD & RESOURCE LEVELING
    # --------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Phân Bổ Tải Nhân Sự & Cân Bằng Nguồn Lực (Resource Leveling)", "Cân Bằng Tải Nhân Lực", course_tag)
    add_footer(s9, course_name, 9, total_slides)

    img_path = "reports/stage20/it-project-management/diagrams/fig_workload_histogram.png"
    if os.path.exists(img_path):
        s9.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(7.0), Inches(4.8))

    add_card(s9, Inches(8.0), Inches(1.8), Inches(4.5), Inches(4.8), 
             title="Phân Tích Cân Bằng Tải",
             items=[
                 "Giới hạn định mức: Định mức tối đa 8 giờ làm việc/ngày cho mỗi thành viên.",
                 "Phát hiện quá tải ban đầu: Ở tuần thứ 5, kỹ sư Backend bị phân công trùng 2 tác vụ dẫn đến tải lên tới 12 giờ/ngày.",
                 "Kỹ thuật cân bằng nguồn lực (Resource Leveling): Tận dụng thời gian dự trữ (Float) của tác vụ Cài đặt môi trường để lùi lại 3 ngày.",
                 "Kết quả sau cân bằng: Tải của toàn bộ 4 thành viên dao động an toàn từ 6 đến 8 giờ/ngày, loại bỏ hoàn toàn nguy cơ kiệt sức (Burnout)."
             ])

    set_speaker_notes(s9, {
        "objective": "Trình bày giải thuật cân bằng nguồn lực bằng biểu đồ phân bổ tải Workload Histogram.",
        "narration": "Biểu đồ phân bổ tải nhân sự chứng minh tính khả thi của kế hoạch. Nhóm đã chủ động phát hiện điểm nghẽn quá tải ở giai đoạn giữa dự án và sử dụng thời gian dự trữ để điều phối lại, bảo đảm không ai phải làm việc quá 8 giờ một ngày.",
        "duration": "1.5 phút",
        "speaker": "Hoàng Bảo Long (BIT240142)",
        "evidence": "reports/stage20/it-project-management/diagrams/fig_workload_histogram.png",
        "question": "Resource Leveling có làm kéo dài thời gian kết thúc của dự án không?",
        "answer": "Nếu chúng ta điều phối các công việc có thời gian dự trữ (Float) thì ngày kết thúc dự án không đổi; chỉ khi điều phối công việc trên đường găng thì dự án mới bị kéo dài.",
        "transition": "Tiếp theo, bạn Vũ Thị Thu Hướng sẽ trình bày về quản trị rủi ro và chất lượng dự án."
    })

    # --------------------------------------------------------------------------
    # SLIDE 10: RISKS, QUALITY & CHANGE CONTROL
    # --------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Quản Trị Rủi Ro, Kế Hoạch Chất Lượng & Kiểm Soát Thay Đổi", "Kiểm Soát Dự Án", course_tag)
    add_footer(s10, course_name, 10, total_slides)

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Ma Trận Rủi Ro (Risk Matrix)",
             items=[
                 "Rủi ro 1: Sai lệch cấu trúc cơ sở dữ liệu khi nhiều người cùng viết migration -> Biện pháp: Khóa cứng Flyway Checksum trên CI.",
                 "Rủi ro 2: Thành viên nghỉ ốm làm chậm tiến độ -> Biện pháp: Áp dụng cặp đôi chéo (Cross-functional pair), mã nguồn có tài liệu rõ ràng.",
                 "Rủi ro 3: Tràn bộ nhớ trên thiết bị di động cũ -> Biện pháp: Tối ưu FlatList và giải phóng bộ nhớ RAM.",
                 "Sổ đăng ký rủi ro (Risk Register): Theo dõi định kỳ hàng tuần để cập nhật mức độ tác động."
             ], border_color=C_RED)

    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Kế Hoạch Quản Lý Chất Lượng",
             items=[
                 "Cổng chất lượng (Quality Gates): 100% commit phải vượt qua kiểm tra Checkstyle 0 lỗi trước khi merge.",
                 "Kiểm thử tự động hồi quy: 351 Backend Tests và 1,144 Mobile Tests đóng vai trò lưới an toàn chất lượng.",
                 "Quy trình kiểm soát thay đổi (Change Control): Mọi yêu cầu thay đổi tính năng đều phải làm phiếu Change Request và được Quản lý dự án phê duyệt trước khi sửa mã nguồn."
             ], border_color=C_BLUE)

    set_speaker_notes(s10, {
        "objective": "Trình bày phương pháp nhận diện rủi ro chủ động và quy trình bảo đảm chất lượng nghiêm ngặt.",
        "narration": "Quản trị dự án chuyên nghiệp đòi hỏi phải dự báo trước rủi ro thay vì bị động chữa cháy. Nhóm đã xây dựng Sổ đăng ký rủi ro và các cổng kiểm soát chất lượng tự động hóa, bảo đảm sản phẩm hoàn thiện với độ ổn định cao nhất.",
        "duration": "1.5 phút",
        "speaker": "Vũ Thị Thu Hướng (BIT240113)",
        "evidence": "Chương 5 Báo cáo Quản lý dự án CNTT",
        "question": "Rủi ro lớn nhất mà nhóm đã thực sự gặp phải trong quá trình làm là gì?",
        "answer": "Rủi ro lớn nhất là xung đột giữa các thay đổi Flyway SQL của các thành viên; nhóm đã giải quyết bằng cách quy định số thứ tự migration tập trung và kiểm tra tự động trên GitHub Actions.",
        "transition": "Tiếp theo, nhóm trưởng Nguyễn Minh Hiếu sẽ tổng kết hiện trạng dự án và công bố thông tin bắt buộc."
    })

    # --------------------------------------------------------------------------
    # SLIDE 11: RESULTS & CURRENT STATUS
    # --------------------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Đánh Giá Kết Quả Dự Án & Công Bố Dữ Liệu Thực Nghiệm", "Đánh Giá Học Thuật", course_tag)
    add_footer(s11, course_name, 11, total_slides)

    add_card(s11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Các Kết Quả Quản Trị Đã Đạt Được",
             items=[
                 "Hoàn thành trọn vẹn bộ hồ sơ quản lý dự án chuyên nghiệp theo định dạng hướng dẫn của Khoa CNTT.",
                 "Xây dựng thành công mô hình WBS 14 gói công việc, bảng ước lượng PERT, sơ đồ mạng PDM/CPM và biểu đồ Gantt Chart.",
                 "Thiết lập ma trận RACI và biểu đồ phân bổ tải nhân sự khoa học, không có hiện tượng quá tải.",
                 "Tạo lập tệp bảng tính tự động hóa: `WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx` với các công thức toán học chuẩn xác."
             ])

    add_card(s11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Công Bố Thông Tin Minh Bạch Bắt Buộc",
             items=[
                 "Dữ liệu mô hình học thuật (Academic Plan Model): Bảng tiến độ và công nhật được xây dựng theo mô hình chuẩn để đối soát phương pháp luận quản lý dự án.",
                 "Biên bản họp nhóm & Nhật ký cá nhân: Đang ở trạng thái biểu mẫu (Templates) chờ các thành viên nhóm hoàn thiện và ký xác nhận.",
                 "Tỷ lệ phần trăm đóng góp: Ở trạng thái đề xuất chờ Người dùng và Giảng viên phê duyệt chính thức.",
                 "Điểm số báo cáo: Do Giảng viên và Hội đồng chấm thi quyết định hoàn toàn; nhóm tuyệt đối không tự chấm điểm."
             ], border_color=C_ORANGE)

    set_speaker_notes(s11, {
        "objective": "Khẳng định thành quả học thuật và công bố thông tin minh bạch theo đúng quy tắc kiểm toán.",
        "narration": "Nhóm xin công bố thông tin minh bạch: Toàn bộ tiến độ và công nhật được xây dựng theo mô hình phương pháp luận PMBOK chuẩn xác. Các biên bản họp nhóm và tỷ lệ đóng góp được giữ nguyên trạng thái đề xuất chờ sự phê duyệt chính thức của Hội đồng.",
        "duration": "1.5 phút",
        "speaker": "Nguyễn Minh Hiếu (BIT247729)",
        "evidence": "reports/stage20/it-project-management/WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx",
        "question": "Tại sao nhóm không đưa biên bản họp đã ký vào slide?",
        "answer": "Để bảo đảm tính trung thực tuyệt đối trong học thuật, nhóm không tự ý giả mạo chữ ký hay bịa đặt nhật ký khi chưa có buổi họp nghiệm thu chính thức với đầy đủ thành viên.",
        "transition": "Cuối cùng, nhóm xin chuyển sang phần hỏi đáp cùng Hội đồng chấm thi."
    })

    # --------------------------------------------------------------------------
    # SLIDE 12: Q&A / TEAM NOTICE
    # --------------------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Hỏi Đáp (Q&A) & Danh Mục Hồ Sơ Dự Án", "Kết Thúc Thuyết Trình", course_tag)
    add_footer(s12, course_name, 12, total_slides)

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Lời Cảm Ơn Từ Nhóm 4 Sinh Viên",
             items=[
                 "Nhóm sinh viên xin trân trọng cảm ơn quý Thầy/Cô trong Hội đồng đã dành thời gian theo dõi bài báo cáo!",
                 "Nhóm đã tiếp thu được rất nhiều kiến thức và kinh nghiệm quản lý dự án quý báu trong suốt quá trình thực hiện đề tài.",
                 "Kính chúc quý Thầy Cô sức khỏe và công tác tốt!"
             ], border_color=C_BLUE)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8), 
             title="Danh Mục Hồ Sơ Sẵn Sàng Đối Soát",
             items=[
                 "Báo cáo chuyên khảo: `reports/stage20/it-project-management/`",
                 "Tệp tính toán Excel gốc: `WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx`",
                 "Các sơ đồ tiến độ độ nét cao: `diagrams/fig_gantt_chart.png`, `fig_workload_histogram.png`",
                 "Nhóm sẵn sàng trả lời các câu hỏi phản biện của Hội đồng!"
             ], border_color=C_TEAL)

    set_speaker_notes(s12, {
        "objective": "Kết thúc bài thuyết trình quản lý dự án chuyên nghiệp và mời Hội đồng đặt câu hỏi.",
        "narration": "Bài báo cáo học phần Quản lý dự án Công nghệ thông tin của nhóm xin được kết thúc tại đây. Nhóm chúng em đã sẵn sàng mở tệp bảng tính Excel và các sơ đồ kỹ thuật để đối soát theo yêu cầu của quý thầy cô.",
        "duration": "1 phút",
        "speaker": "Toàn thể thành viên nhóm",
        "evidence": "Hồ sơ dự án tại reports/stage20/it-project-management/",
        "question": "Hội đồng yêu cầu mở tệp Excel để kiểm tra công thức tính đường găng CPM.",
        "answer": "Dạ vâng, em xin phép mở tệp WORKSPHERE_PROJECT_MANAGEMENT_CALCULATIONS.xlsx để đối soát các công thức tính Early Start, Early Finish và Slack.",
        "transition": "Sẵn sàng trả lời câu hỏi và mở bảng tính."
    })

    out_path = "reports/stage20/presentations/03_QUAN_LY_DU_AN_CNTT_WORKSPHERE.pptx"
    prs.save(out_path)
    print(f"Deck 3 generated successfully: {out_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    build_deck()
