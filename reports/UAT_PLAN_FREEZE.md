# UAT PLAN FREEZE & BUSINESS ACCEPTANCE CONTRACT
# WORKSPHERE SYSTEM ACCEPTANCE SPECIFICATION

**Document Version:** 1.0  
**Freeze Date:** 2026-10-27  
**Starting Checkpoint:** `07225b4c07688f10d3d8fcb3c351733bb95c1a5c`  
**Status:** FROZEN & RATIFIED (ARCHITECTURAL DECISION D-069)

---

## 1. MỤC ĐÍCH & PHẠM VI (PURPOSE & SCOPE)

Kế hoạch Kiểm thử Chấp nhận Người dùng (User Acceptance Test Plan - UAT) nhằm xác nhận toàn diện khả năng đáp ứng yêu cầu nghiệp vụ thực tế của WorkSphere trên nền tảng di động (React Native Android) và Backend Modular Monolith (Spring Boot 3 / PostgreSQL 15).

### Phạm vi bao gồm:
1. Xác thực người dùng, bảo mật phiên và phân quyền RBAC đa vai trò (4 roles).
2. Khởi tạo dự án, thiết lập thành viên, vai trò dự án và mốc tiến độ (Milestones).
3. Vòng đời giao việc, tạo công việc con, cập nhật tiến độ và xét duyệt công việc.
4. Tiếp nhận, điều phối, xử lý, xác nhận và đánh giá yêu cầu dịch vụ văn phòng/kỹ thuật.
5. Quản lý danh mục tài sản, cấp phát, thu hồi và ghi nhận lịch sử sửa chữa.
6. Hệ thống chuông thông báo, đồng bộ huy hiệu chưa đọc và điều hướng ngữ cảnh chéo.

### Phạm vi loại trừ (Strict Exclusions):
- Không kiểm thử các tính năng ngoài Roadmap (như xóa vĩnh viễn task, upload tài liệu đính kèm nhị phân ngoài Task Attachment spec, push notifications native ngoài in-app center).
- Không thực thi UAT trên môi trường Production thật khi chưa qua cổng Release Candidate.

---

## 2. MA TRẬN 10 KỊCH BẢN UAT DOANH NGHIỆP (BUSINESS UAT SCENARIOS)

| Mã Kịch Bản | Tên Kịch Bản Nghiệp Vụ | Vai Trò Thực Hiện (Actor) | Trọng Yếu | Mục Tiêu Chấp Nhận | Tiêu Chí Đạt (Acceptance Criteria) |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **UAT-01** | Đăng nhập, duy trì phiên và Đăng xuất | `EMPLOYEE` | **P0** | Người dùng đăng nhập đúng tài khoản, truy cập Dashboard, duy trì phiên an toàn và đăng xuất xóa sạch token. | Đăng nhập thành công với 200 OK, lưu token an toàn trong Keychain, không lộ mật khẩu; Đăng xuất dọn sạch session. |
| **UAT-02** | Khởi tạo Dự án & Phân bổ Thành viên | `PROJECT_MANAGER` | **P0** | Tạo dự án mới, gán thành viên phòng ban, phân công Project Role (`TEAM_LEADER`, `MEMBER`, `OBSERVER`), tạo Milestone. | Dự án hiển thị đúng phòng ban; phân quyền dự án phân định rõ quyền tạo task; không trùng mã dự án; hỗ trợ version locking. |
| **UAT-03** | Giao việc, Phân bổ Subtask & Xét duyệt | `TEAM_LEADER` | **P0** | Trưởng nhóm tạo công việc, gán nhân viên, tạo subtasks, nhân viên cập nhật tiến độ, nộp xét duyệt và hoàn thành. | Trạng thái chuyển đổi tuần tự: `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `DONE`; chống submit trùng lặp; ghi nhận lịch sử trạng thái. |
| **UAT-04** | Nhân viên Gửi Yêu Cầu Dịch Vụ & Theo Dõi | `EMPLOYEE` | **P0** | Nhân viên gửi báo cáo sự cố cơ sở vật chất, theo dõi tiến độ xử lý và gửi đánh giá hài lòng sau khi hoàn thành. | Yêu cầu sinh mã `SR-YYYY-XXXXXX`; hiển thị danh mục hoạt động; nhận thông báo cập nhật; thực hiện đánh giá sao khi `RESOLVED`. |
| **UAT-05** | Tiếp nhận, Phân công & Giải quyết Sự Cố | `ADMIN` | **P0** | Quản trị viên tiếp nhận yêu cầu, phân công kỹ thuật viên phụ trách, bắt đầu xử lý, điền giải pháp và đóng yêu cầu. | Chuyển đổi trạng thái máy nghiệp vụ chính xác; chặn kỹ thuật viên tự gán khi không đủ thẩm quyền; ghi nhận giải pháp xử lý. |
| **UAT-06** | Tạo Tài Sản, Cấp Phát & Thu Hồi Thiết Bị | `ADMIN` | **P0** | Quản trị viên nhập tài sản mới, cấp phát cho nhân viên sử dụng, và thu hồi tài sản khi hoàn trả thiết bị. | Mã tài sản duy nhất; không cho phép cấp phát kép tài sản đang có người dùng; chặn thu hồi tài sản đang không hoạt động. |
| **UAT-07** | Nhân Viên Xem Tài Sản Cấp & Báo Hỏng | `EMPLOYEE` | **P1** | Nhân viên vào "Quản lý tài sản", kiểm tra thiết bị đang mượn và thực hiện "Báo hỏng" liên kết trực tiếp sang Yêu cầu dịch vụ. | Màn hình lọc đúng tài sản của người dùng hiện tại; điều hướng mở sẵn form tạo Yêu cầu với thông tin thiết bị đã điền sẵn. |
| **UAT-08** | Quản Trị Viên Ghi Nhận Lịch Sử Sửa Chữa | `ADMIN` | **P1** | Sau khi sửa chữa xong, Quản trị viên thêm bản ghi lịch sử sửa chữa (ngày, chi phí, đơn vị sửa chữa, giải pháp). | Bản ghi lưu vết kiểm toán; chi phí và đơn vị sửa chữa hợp lệ; hiển thị tức thì trong danh sách timeline lịch sử thiết bị. |
| **UAT-09** | Nhận Thông Báo & Điều Hướng Ngữ Cảnh Chéo | `EMPLOYEE` | **P0** | Nhận thông báo sự kiện, xem huy hiệu chưa đọc trên Dashboard/More, bấm mở đúng màn hình chi tiết, bấm Back quay về danh sách. | Huy hiệu cập nhật tức thì; bấm item mở đúng màn hình chi tiết tương ứng (`Project`, `Task`, `ServiceRequest`, `Asset`); bấm Back không bị văng ra Dashboard. |
| **UAT-10** | Chuyển Đổi Phiên, Cô Lập RBAC & Bảo Mật | Cả 4 vai trò | **P0** | Đăng nhập lần lượt 4 vai trò, kiểm tra tính cô lập dữ liệu, chặn truy cập tài nguyên trái phép và chặn back stack sau đăng xuất. | Nhân viên không thấy nút tạo dự án/tài sản; không rò rỉ dữ liệu giữa các phiên; không thể can thiệp dữ liệu người dùng khác (403/404). |

---

## 3. CHI TIẾT 10 KỊCH BẢN NGHIỆP VỤ (SCENARIOS SPECIFICATION)

### KỊCH BẢN UAT-01: Đăng nhập, duy trì phiên và Đăng xuất
- **Mục tiêu:** Kiểm tra khả năng xác thực an toàn, duy trì phiên và xóa sạch phiên làm việc trên thiết bị.
- **Tiền điều kiện:** Ứng dụng WorkSphere đã cài đặt trên Android. Tài khoản `e2e_employee` đang ở trạng thái `ACTIVE`.
- **Dữ liệu kiểm thử:** Username: `e2e_employee`, Mật khẩu chuẩn phiên.
- **Các bước thực hiện:**
  1. Mở ứng dụng WorkSphere từ màn hình chính Android.
  2. Tại màn hình Đăng nhập (`SCR-AUTH-02`), nhập Tên đăng nhập `e2e_employee`.
  3. Nhập Mật khẩu, bấm nút "Hiện" để kiểm tra tính năng ẩn/hiện mật khẩu.
  4. Bấm nút "Đăng nhập".
  5. Kiểm tra ứng dụng chuyển sang màn hình Bảng điều khiển (`SCR-MAIN-01`).
  6. Chuyển sang Tab 5 (Thêm), chọn "Cài đặt ứng dụng".
  7. Cuộn xuống và bấm "Đăng xuất tài khoản khỏi thiết bị", bấm xác nhận "Đăng xuất" trên hộp thoại.
- **Kết quả kỳ vọng:** Đăng nhập thành công trong vòng dưới 2 giây; token lưu an toàn; sau khi đăng xuất ứng dụng quay về màn hình Đăng nhập; bấm phím Back của Android không thể mở lại màn hình Dashboard.

---

### KỊCH BẢN UAT-02: Khởi tạo Dự án & Phân bổ Thành viên
- **Mục tiêu:** Quản lý dự án khởi tạo dự án mới, gán thành viên và thiết lập mốc tiến độ.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_pm` (System Role `PROJECT_MANAGER`).
- **Dữ liệu kiểm thử:** Mã dự án: `UAT-PRJ-01`, Tên: "Triển khai Hệ thống Văn phòng Số", Phòng ban: "Công nghệ thông tin".
- **Các bước thực hiện:**
  1. Từ thanh điều hướng dưới, bấm chọn Tab 2 "Dự án".
  2. Bấm nút "+ Tạo mới" ở góc trên bên phải.
  3. Nhập Mã dự án `UAT-PRJ-01`, Tên dự án, chọn Phòng ban và mức ưu tiên "Cao".
  4. Bấm "Tạo dự án", kiểm tra dự án xuất hiện trong danh sách.
  5. Mở chi tiết dự án `UAT-PRJ-01`, bấm thẻ "Thành viên dự án".
  6. Bấm "+ Thêm thành viên", chọn nhân viên từ danh bạ công ty, phân công vai trò `MEMBER`.
  7. Quay lại chi tiết dự án, bấm thẻ "Mốc tiến độ", bấm "+ Thêm mốc", nhập tên mốc "Giai đoạn 1: Khảo sát".
- **Kết quả kỳ vọng:** Dự án được tạo với version = 1; thành viên mới hiển thị đúng vai trò; mốc tiến độ hiển thị đúng thời hạn; người dùng ngoài dự án không thể chỉnh sửa.

---

### KỊCH BẢN UAT-03: Giao việc, Phân bổ Subtask & Xét duyệt
- **Mục tiêu:** Trưởng nhóm phân công công việc, nhân viên cập nhật tiến độ và xét duyệt hoàn tất.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_leader` (System Role `TEAM_LEADER`).
- **Dữ liệu kiểm thử:** Dự án `UAT-PRJ-01`, Tiêu đề công việc: "Cài đặt máy trạm làm việc", Người thực hiện: `e2e_employee`.
- **Các bước thực hiện:**
  1. Mở Tab 3 "Công việc", bấm "+ Tạo mới".
  2. Chọn Dự án `UAT-PRJ-01`, nhập tiêu đề, chọn người thực hiện là `e2e_employee`, đặt độ ưu tiên "Trung bình".
  3. Bấm "Tạo công việc".
  4. Mở chi tiết công việc vừa tạo, vào mục "Công việc con", tạo subtask: "Cài đặt hệ điều hành".
  5. Đăng xuất `e2e_leader` và đăng nhập bằng `e2e_employee`.
  6. Mở công việc được giao, bấm nút chuyển trạng thái sang "Bắt đầu làm" (`IN_PROGRESS`).
  7. Cập nhật thanh tiến độ lên 100%, nhập ghi chú bình luận.
  8. Bấm nút "Gửi kiểm tra" (`IN_REVIEW`).
  9. Đăng nhập lại `e2e_leader`, mở công việc và bấm "Xác nhận hoàn thành" (`DONE`).
- **Kết quả kỳ vọng:** Công việc chuyển trạng thái tuần tự và chính xác; lịch sử trạng thái ghi nhận đầy đủ người thay đổi; các trường số nguyên/thập phân không bị sai lệch; cấm người không có quyền tự duyệt hoàn thành.

---

### KỊCH BẢN UAT-04: Nhân viên Gửi Yêu Cầu Dịch Vụ & Theo Dõi
- **Mục tiêu:** Nhân viên gửi yêu cầu hỗ trợ văn phòng/IT và đánh giá chất lượng phục vụ sau khi sự cố được khắc phục.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_employee`.
- **Dữ liệu kiểm thử:** Tiêu đề: "Điều hòa phòng họp tầng 3 không mát", Danh mục: "Cơ sở vật chất", Mức ưu tiên: "Cao".
- **Các bước thực hiện:**
  1. Mở Tab 4 "Yêu cầu", bấm nút "+ Tạo yêu cầu".
  2. Chọn danh mục "Cơ sở vật chất", nhập tiêu đề sự cố và mô tả chi tiết vị trí xảy ra sự cố.
  3. Chọn mức độ ưu tiên "Cao", bấm "Gửi yêu cầu".
  4. Xác nhận yêu cầu xuất hiện trong danh sách với trạng thái ban đầu "Mới" (`NEW`) và có mã hiệu `SR-...`.
  5. Đợi Quản trị viên xử lý và chuyển trạng thái sang "Đã xử lý" (`RESOLVED`).
  6. Nhân viên mở chi tiết yêu cầu, bấm "Xác nhận & Đánh giá".
  7. Chọn 5 sao và nhập nội dung đánh giá: "Hỗ trợ rất nhanh và nhiệt tình".
  8. Bấm "Gửi đánh giá".
- **Kết quả kỳ vọng:** Yêu cầu được tiếp nhận đầy đủ; sau khi đánh giá, trạng thái chuyển sang "Đóng" (`CLOSED`); đánh giá và phản hồi được lưu vết vĩnh viễn.

---

### KỊCH BẢN UAT-05: Tiếp nhận, Phân công & Giải quyết Sự Cố
- **Mục tiêu:** Quản trị viên tiếp nhận yêu cầu, phân công người xử lý và ghi nhận giải pháp kỹ thuật.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_admin` (System Role `ADMIN`).
- **Dữ liệu kiểm thử:** Yêu cầu dịch vụ đang ở trạng thái `NEW` từ Kịch bản UAT-04.
- **Các bước thực hiện:**
  1. Mở Tab 4 "Yêu cầu", tìm yêu cầu sự cố điều hòa phòng họp.
  2. Bấm nút "Phân công", chọn nhân sự phụ trách kỹ thuật từ danh bạ.
  3. Bấm "Bắt đầu xử lý" (`IN_PROGRESS`).
  4. Sau khi hoàn thành kiểm tra thực địa, bấm nút "Giải quyết" (`RESOLVED`).
  5. Tại bảng biểu giải pháp, nhập nội dung khắc phục: "Đã nạp gas và vệ sinh lưới lọc điều hòa".
  6. Bấm "Xác nhận giải quyết".
- **Kết quả kỳ vọng:** Yêu cầu chuyển trạng thái sang `RESOLVED`; giải pháp khắc phục hiển thị công khai cho người gửi yêu cầu xem; hệ thống ghi log kiểm toán.

---

### KỊCH BẢN UAT-06: Tạo Tài Sản, Cấp Phát & Thu Hồi Thiết Bị
- **Mục tiêu:** Quản trị viên nhập mới thiết bị, bàn giao cho nhân viên và thu hồi khi hết nhu cầu.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_admin`.
- **Dữ liệu kiểm thử:** Mã tài sản: `UAT-AST-01`, Tên: "Dell Latitude 5540", Danh mục: "Thiết bị CNTT", Người nhận: `e2e_employee`.
- **Các bước thực hiện:**
  1. Mở Tab 5 (Thêm), chọn mục "Quản lý tài sản".
  2. Bấm nút "+ Tạo mới" ở góc trên.
  3. Nhập Mã tài sản `UAT-AST-01`, tên thiết bị, số serial, chọn danh mục và bấm "Lưu tài sản".
  4. Mở chi tiết tài sản vừa tạo, bấm nút "Cấp phát tài sản".
  5. Chọn người nhận là `e2e_employee`, nhập ngày bàn giao và bấm "Xác nhận cấp phát".
  6. Kiểm tra trạng thái tài sản chuyển sang "Đang sử dụng" (`ASSIGNED`).
  7. Bấm nút "Thu hồi tài sản", nhập ghi chú tình trạng thiết bị khi thu hồi và bấm xác nhận.
- **Kết quả kỳ vọng:** Tài sản được cấp phát đúng người; hệ thống từ chối cấp phát tiếp nếu tài sản đang có người giữ; sau khi thu hồi tài sản quay về trạng thái "Sẵn sàng" (`AVAILABLE`).

---

### KỊCH BẢN UAT-07: Nhân Viên Xem Tài Sản Cấp & Báo Hỏng
- **Mục tiêu:** Nhân viên kiểm tra danh sách thiết bị được giao và báo hỏng nhanh qua ứng dụng.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_employee`, tài sản `UAT-AST-01` đang được cấp phát cho nhân viên này.
- **Các bước thực hiện:**
  1. Mở Tab 5 (Thêm), chọn "Quản lý tài sản".
  2. Xác nhận danh sách hiển thị đúng tài sản "Dell Latitude 5540" với huy hiệu "Tài sản của tôi".
  3. Bấm vào chi tiết tài sản, bấm nút "Báo hỏng thiết bị".
  4. Ứng dụng tự động điều hướng sang màn hình Tạo Yêu Cầu Dịch Vụ với thông tin thiết bị đã được gắn sẵn.
  5. Nhập mô tả lỗi: "Máy bị sọc màn hình khi khởi động", chọn mức ưu tiên "Khẩn cấp".
  6. Bấm "Gửi yêu cầu".
- **Kết quả kỳ vọng:** Màn hình tài sản chỉ hiển thị thiết bị của người dùng; liên kết báo hỏng tự động ánh xạ chính xác `assetId` vào yêu cầu dịch vụ mà không cần người dùng nhập tay.

---

### KỊCH BẢN UAT-08: Quản Trị Viên Ghi Nhận Lịch Sử Sửa Chữa
- **Mục tiêu:** Quản trị viên lưu vết chi phí, đơn vị sửa chữa và giải pháp bảo dưỡng thiết bị.
- **Tiền điều kiện:** Đăng nhập tài khoản `e2e_admin`, tài sản `UAT-AST-01`.
- **Dữ liệu kiểm thử:** Đơn vị sửa chữa: "Trung tâm bảo hành Dell", Chi phí: "1.500.000 VNĐ", Nội dung: "Thay cáp màn hình LCD".
- **Các bước thực hiện:**
  1. Mở Tab 5 (Thêm) $\rightarrow$ "Quản lý tài sản", tìm tài sản `UAT-AST-01`.
  2. Bấm vào chi tiết tài sản, cuộn xuống phần "Lịch sử sửa chữa".
  3. Bấm nút "+ Thêm sửa chữa".
  4. Nhập ngày sửa chữa, đơn vị thực hiện, chi phí và nội dung khắc phục.
  5. Bấm "Lưu lịch sử sửa chữa".
- **Kết quả kỳ vọng:** Bản ghi xuất hiện ngay lập tức trong dòng thời gian lịch sử sửa chữa; chi phí hiển thị định dạng tiền tệ chuẩn; dữ liệu được bảo toàn nguyên vẹn sau khi reload.

---

### KỊCH BẢN UAT-09: Nhận Thông Báo & Điều Hướng Ngữ Cảnh Chéo
- **Mục tiêu:** Kiểm tra hệ thống nhận thông báo sự kiện, cập nhật huy hiệu và điều hướng ngữ cảnh chéo.
- **Tiền điều kiện:** Phát sinh sự kiện hệ thống (ví dụ: giao việc hoặc cập nhật trạng thái yêu cầu cho `e2e_employee`).
- **Các bước thực hiện:**
  1. Đăng nhập tài khoản `e2e_employee`, kiểm tra chuông thông báo trên Dashboard hiển thị huy hiệu đếm chưa đọc.
  2. Bấm vào chuông thông báo để mở Danh sách thông báo.
  3. Bấm vào một thông báo giao việc mới.
  4. Kiểm tra ứng dụng tự động mở đúng màn hình Chi tiết công việc tương ứng.
  5. Bấm phím Back của Android hoặc nút "Quay lại" trên thanh tiêu đề.
  6. Kiểm tra ứng dụng quay lại đúng màn hình Danh sách thông báo (không văng về Dashboard).
  7. Bấm nút "Đọc tất cả" trên góc phải.
- **Kết quả kỳ vọng:** Điều hướng mở chính xác thực thể; ngăn xếp Back hoạt động hoàn hảo; số lượng chưa đọc trở về 0 ngay lập tức và đồng bộ sang huy hiệu ngoài Dashboard/More.

---

### KỊCH BẢN UAT-10: Chuyển Đổi Phiên, Cô Lập RBAC & Bảo Mật
- **Mục tiêu:** Kiểm tra tính toàn vẹn bảo mật, cô lập dữ liệu liên người dùng và phản hồi phân quyền.
- **Tiền điều kiện:** Chuẩn bị 4 tài khoản ứng với 4 vai trò.
- **Các bước thực hiện:**
  1. Đăng nhập `e2e_employee`: kiểm tra giao diện Tab 2 (Dự án) và Tab 5 (Thêm), xác nhận **không có nút Tạo dự án, không có nút Quản trị tài sản**.
  2. Đăng xuất, đăng nhập `e2e_pm`: xác nhận **có nút Tạo dự án**, nhưng **không có quyền quản lý tài sản toàn hệ thống**.
  3. Đăng xuất, đăng nhập `e2e_leader`: xác nhận **có quyền tạo công việc và quản lý nhóm**, nhưng **không tạo được dự án cấp cao**.
  4. Đăng xuất, đăng nhập `e2e_admin`: xác nhận **có đầy đủ quyền quản trị danh mục và tài sản doanh nghiệp**.
  5. Thử truy cập trực tiếp các thao tác trái quyền thông qua API.
- **Kết quả kỳ vọng:** Giao diện ẩn/hiện chính xác theo vai trò; Backend trả về mã lỗi HTTP 403 Forbidden hoặc 404 Not Found khi truy cập tài nguyên ngoài phạm vi; không có hiện tượng rò rỉ bộ nhớ đệm hay token giữa các lần chuyển đổi tài khoản.

---

## 4. CHIẾN LƯỢC DỮ LIỆU UAT (UAT DATA STRATEGY)

Để đảm bảo tính lặp lại, cô lập và an toàn dữ liệu, chiến lược dữ liệu UAT được quy chuẩn như sau:

1. **Quy tắc Tiền tố Dữ liệu (Prefix Convention):**
   - Mọi bản ghi tạo mới trong quá trình UAT phải mang tiền tố nhận diện rõ ràng: `UAT-` (Ví dụ: `UAT-PRJ-01`, `UAT-TSK-101`, `UAT-SR-2026-01`, `UAT-AST-901`).
2. **Tài Khoản Đại Diện Canonical:**
   - Sử dụng 4 tài khoản chuẩn hóa đã được kiểm chứng an ninh:
     + `e2e_employee` (System Role: `EMPLOYEE`)
     + `e2e_leader` (System Role: `TEAM_LEADER`)
     + `e2e_pm` (System Role: `PROJECT_MANAGER`)
     + `e2e_admin` (System Role: `ADMIN`)
3. **Tuyệt Đối Không Sử Dụng Dữ Liệu Sản Xuất:**
   - Cấm sao chép, import dữ liệu cá nhân thật, số điện thoại thật, email khách hàng thật vào môi trường kiểm thử.
   - Mọi thông tin danh bạ và tài sản là dữ liệu giả lập (synthetic data).
4. **Không Thay Đổi Mật Khẩu Bằng SQL Thô:**
   - Nghiêm cấm can thiệp lệnh `UPDATE users SET password_hash = ...` trực tiếp trong database. Mọi mật khẩu được khởi tạo thông qua `PasswordEncoder` chuẩn mực của Spring Security.
5. **Chính Sách Dọn Dẹp Sau UAT:**
   - Dữ liệu có tiền tố `UAT-` được bảo toàn phục vụ biên bản nghiệm thu trước khi chạy lệnh reset môi trường có kiểm soát.

---

## 5. MÔI TRƯỜNG & ĐIỀU KIỆN TIÊN QUYẾT (ENVIRONMENT & PREREQUISITES)

### A. Môi Trường Kiểm Thử Nội Bộ (Internal Engineering UAT):
- **Thiết bị:** Android Emulator `Medium_Phone` (API 35, độ phân giải 1080x2400) hoặc thiết bị Android thật (Android 12+).
- **Backend:** Spring Boot Modular Monolith chạy profile `dev` trên cổng `8080`.
- **Cơ sở dữ liệu:** PostgreSQL 15 Container (`worksphere-dev-pg`) trên cổng `5432`.
- **Bản Build:** `app-debug.apk` được biên dịch trực tiếp từ checkpoint `4adc723`.

### B. Môi Trường Nghiệm Thu Doanh Nghiệp Chính Thức (Formal External UAT - Prerequisites):
Để chuyển từ kiểm thử kỹ thuật nội bộ sang nghiệm thu doanh nghiệp chính thức với đối tác bên ngoài, hệ thống bắt buộc phải hoàn thành các bước hạ tầng:
1. **Staging Host:** Triển khai Backend trên máy chủ Staging có kết nối mạng ổn định, hỗ trợ tên miền bảo mật HTTPS/TLS.
2. **Signed Build:** Đóng gói bản build Release có chữ ký điện tử hợp lệ (Release Keystore), kích hoạt tối ưu hóa mã nguồn và bảo vệ bảo mật (R8/ProGuard).
3. **Kênh Phân Phối:** Cung cấp ứng dụng qua kênh phân phối nội bộ an toàn (Google Play Internal Sharing hoặc Firebase App Distribution).
4. **Giám Sát Lỗi:** Bật hệ thống giám sát và cảnh báo sự cố tập trung.

---

## 6. QUY TRÌNH QUẢN LÝ LỖI (DEFECT WORKFLOW & SEVERITY)

Mọi sai lệch phát hiện trong quá trình UAT được phân loại nghiêm ngặt theo 4 mức độ:

| Mức Độ (Severity) | Phân Loại Lỗi (Classification) | Tiêu Chí Xác Định | Hành Động Yêu Cầu |
| :---: | :---: | :--- | :--- |
| **Severity 1** | **P0 (Blocker)** | Lỗi bảo mật, rò rỉ dữ liệu, lỗi crash/ANR làm gián đoạn luồng chính, ứng dụng không thể đăng nhập hoặc làm sai lệch dữ liệu tài chính/tài sản. | **Dừng UAT ngay lập tức.** Bắt buộc sửa chữa, commit patch, chạy lại full regression và kiểm thử lại kịch bản. Chặn cổng Release Candidate. |
| **Severity 2** | **P1 (Critical)** | Nghiệp vụ chính bị gián đoạn, sai quyền hạn RBAC, dữ liệu lưu không đúng quy chuẩn máy trạng thái, điều hướng bị kẹt không thể hoàn thành luồng. | **Chặn nghiệm thu.** Bắt buộc sửa chữa trước khi đóng đợt kiểm thử. Không cấp phép bàn giao UAT. |
| **Severity 3** | **P2 (Major)** | Có lỗi về giao diện hoặc logic phụ nhưng có giải pháp thay thế tạm thời (workaround), câu từ hiển thị chưa chuẩn, thao tác chưa tối ưu. | Ghi nhận vào biên bản nợ kỹ thuật (Accepted Technical Debt), khắc phục trong đợt phát hành bảo trì tiếp theo. |
| **Severity 4** | **P3 (Minor)** | Lỗi thẩm mỹ nhỏ, khoảng cách lề (padding/margin), lỗi chính tả không ảnh hưởng ý nghĩa nghiệp vụ. | Ghi nhận tài liệu và xem xét khắc phục khi thuận tiện. |

---

## 7. TIÊU CHÍ HOÀN THÀNH & ĐIỀU KIỆN KÝ DUYỆT (SIGN-OFF & EXIT CRITERIA)

Một đợt UAT chỉ được công nhận là **HOÀN THÀNH VÀ SẴN SÀNG CHO RELEASE CANDIDATE** khi thỏa mãn đầy đủ các điều kiện tiên quyết sau:

1. **Tỷ Lệ Đạt Nghiệp Vụ:** 100% các kịch bản mức độ **P0** (UAT-01 đến UAT-06, UAT-09, UAT-10) và **P1** (UAT-07, UAT-08) phải ở trạng thái **PASS**.
2. **Không Còn Lỗi Tồn Đọng Nghiêm Trọng:** Tuyệt đối **0 lỗi Severity 1 (P0)** và **0 lỗi Severity 2 (P1)** còn mở.
3. **Bảo Mật & Phân Quyền Tuyệt Đối:** Không có bất kỳ vi phạm nào về cô lập dữ liệu liên người dùng, lộ token, lộ mật khẩu hoặc vượt quyền RBAC.
4. **Không Có Dữ Liệu Rác:** Toàn bộ dữ liệu sinh ra trong quá trình UAT phải được ghi nhận rõ ràng, không làm ảnh hưởng tính toàn vẹn cấu trúc database.
5. **Biên Bản Ký Duyệt Nghiệm Thu:** Đại diện các bên (Business Owner, Product Owner, QA Lead) ký xác nhận hoàn thành đợt nghiệm thu dựa trên tài liệu bằng chứng.

---

## 8. PHÂN ĐỢT SÓNG THỰC THI UAT (UAT EXECUTION WAVES)

Quy trình thực thi UAT được chia thành 5 đợt sóng tuần tự có thể kiểm soát:

```text
[ UAT-W1: Xác Thực & Nền Tảng (UAT-01, UAT-10) ]
                      │
                      ▼
[ UAT-W2: Quản Trị Dự Án & Công Việc (UAT-02, UAT-03) ]
                      │
                      ▼
[ UAT-W3: Yêu Cầu Dịch Vụ Doanh Nghiệp (UAT-04, UAT-05) ]
                      │
                      ▼
[ UAT-W4: Quản Trị Tài Sản & Bảo Dưỡng (UAT-06, UAT-07, UAT-08) ]
                      │
                      ▼
[ UAT-W5: Thông Báo, Điều Hướng & Ký Duyệt (UAT-09, Tổng Hợp & Đóng UAT) ]
```

---

## 9. QUY CHUẨN THU THẬP BẰNG CHỨNG (EVIDENCE POLICY)

- **Bằng chứng hợp lệ được chấp nhận:**
  + Bảng ma trận kết quả kịch bản ghi rõ: Trạng thái (PASS/FAIL), Mã commit kiểm thử, Thời gian thực hiện, Tên người kiểm thử.
  + Ảnh chụp màn hình kết quả tại các bước nghiệp vụ quan trọng (đã che mờ/loại bỏ token và mật khẩu).
  + Nhật ký kiểm toán Backend và trạng thái phản hồi HTTP (mã phản hồi và JSON envelope).
- **Tuyệt đối cấm commit vào Git:**
  + Mật khẩu dạng rõ hoặc chuỗi hash mật khẩu.
  + Chuỗi JWT Token, Refresh Token hoặc Authorization headers.
  + Tệp logcat thô kích thước lớn, file XML dump giao diện.
  + Dữ liệu định danh cá nhân nhạy cảm.

---

## 10. KẾT LUẬN & PHÊ DUYỆT

Kế hoạch UAT và Hợp đồng Nghiệm thu Nghiệp vụ WorkSphere chính thức được **KHÓA TOÀN BỘ NỘI DUNG**. Toàn bộ các bên liên quan tuân thủ nghiêm ngặt quy chuẩn này khi tiến hành các phiên kiểm thử chấp nhận tiếp theo.
