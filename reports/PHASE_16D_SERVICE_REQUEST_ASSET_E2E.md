# BÁO CÁO GIAI ĐOẠN 16D — FLOW-04 SERVICE REQUEST MANAGEMENT & FLOW-05 ASSET MANAGEMENT END-TO-END WAVE

**Ngày thực hiện:** 26/10/2026  
**Starting checkpoint:** `bc7810e` (`docs(test): confirm phase 16c project task completeness`)  
**Tình trạng:** **HOÀN THÀNH TOÀN DIỆN (FULL PASS)**  
**Trạng thái hệ thống:** Clean working tree, production invariants intact, dev processes stopped.

---

## 1. MỤC TIÊU & PHẠM VI KIỂM ĐỊNH

Giai đoạn 16D tập trung kiểm định tích hợp hệ thống đa tầng và xuyên suốt hai luồng nghiệp vụ canonical:
1. **FLOW-04 — Service Request Management**: Chu trình sống hoàn chỉnh của yêu cầu dịch vụ từ tạo mới, phân công điều phối, chuyển trạng thái thực hiện, trao đổi bình luận (comments), giải quyết (resolve), và đóng yêu cầu (close).
2. **FLOW-05 — Asset Management & Repair History**: Quản lý tài sản công ty, danh mục, cấp phát cho nhân viên (assignment), kiểm tra danh sách tài sản cá nhân (`my-assets`), ghi nhận lịch sử sửa chữa/bảo dưỡng (repair history), và thu hồi tài sản (return).
3. **Liên kết module chéo (Cross-Module Integration)**:
   - Từ màn hình chi tiết tài sản đã cấp phát (`AssetDetailScreen`), kích hoạt luồng **Báo hỏng / Yêu cầu dịch vụ** (`Report Fault`), tự động điều hướng sang màn hình tạo yêu cầu dịch vụ (`CreateServiceRequestScreen`) kèm ngữ cảnh định danh tài sản (`assetId`).
   - Ghi nhận lịch sử sửa chữa tài sản gắn trực tiếp với mã yêu cầu dịch vụ đã xử lý (`serviceRequestId`).
4. **Kiểm định Optimistic Locking & Xử lý xung đột (Concurrency Control)**:
   - Ngăn chặn cập nhật trạng thái hoặc phân công yêu cầu dịch vụ với phiên bản lỗi thời (`version mismatch`), trả về lỗi xung đột giao dịch `OPTIMISTIC_LOCK_CONFLICT` (HTTP 409).
   - Kiểm định phiên bản và trạng thái hợp lệ trên chu trình cấp phát và hoàn trả tài sản.
5. **Mobile Permission Gating & Trải nghiệm thực tế trên Android Emulator (API 35)**:
   - Vai trò `EMPLOYEE` (`e2e_emp_canonical`): Xem yêu cầu cá nhân, tạo yêu cầu hỗ trợ, xem tài sản được cấp phát tại tab "Của tôi", báo hỏng thiết bị trực tiếp từ chi tiết tài sản.
   - Vai trò `TEAM_LEADER` (`e2e_leader`): Tiếp nhận xử lý yêu cầu dịch vụ, cập nhật tiến độ `IN_PROGRESS`, ghi nhận bình luận kỹ thuật, cập nhật `RESOLVED`.
   - Vai trò `ADMIN` (`e2e_admin`): Phân công yêu cầu, phê duyệt đóng yêu cầu `CLOSED`, tạo mới tài sản, cấp phát tài sản, ghi nhận lịch sử sửa chữa, thu hồi tài sản.

---

## 2. KẾT QUẢ THỰC THI KIỂM THỬ TÍCH HỢP (E2E EVIDENCE)

### 2.1. Backend API & Domain Lifecycle Verification

Đã xác minh toàn bộ luồng REST API tuân thủ nghiêm ngặt [06_API_CONTRACT.md](file:///d:/WorkSphere/docs/06_API_CONTRACT.md):

| Bước | Thao tác / Endpoint | Caller | Kết quả / Mã HTTP | Bằng chứng Domain & State |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST /api/v1/auth/login` | Multiple | `200 OK` | Lấy access token cho `e2e_admin`, `e2e_emp_canonical`, `e2e_leader` |
| 2 | `GET /api/v1/service-categories`<br>`GET /api/v1/asset-categories` | Admin | `200 OK` | Danh mục CNTT E2E (`33333333-...`) và danh mục tài sản (`1301f1df-...`) |
| 3 | `POST /api/v1/assets` | Admin | `201 Created` | Tạo tài sản mới: `assetCode: AST-CNC-...`, `status: AVAILABLE`, `version: 0` |
| 4 | `POST /api/v1/assets/{id}/assignments` | Admin | `200 OK` | Cấp phát tài sản cho `e2e_emp_canonical`, gán `status: ASSIGNED` |
| 5 | `GET /api/v1/assets/my-assets` | Employee | `200 OK` | Danh sách tài sản cá nhân hiển thị chính xác tài sản vừa được bàn giao |
| 6 | `POST /api/v1/service-requests` | Employee | `201 Created` | Tạo yêu cầu dịch vụ gắn kèm `assetId`, khởi tạo trạng thái `OPEN` |
| 7 | `POST /api/v1/service-requests/{id}/assignments` *(Stale)* | Admin | `409 Conflict` | Thử phân công với `version: 999` $\rightarrow$ chặn lỗi xung đột `OPTIMISTIC_LOCK_CONFLICT` |
| 8 | `POST /api/v1/service-requests/{id}/assignments` *(Valid)* | Admin | `200 OK` | Phân công cho `e2e_leader`, chuyển trạng thái `ASSIGNED`, tăng `version: 1` |
| 9 | `PUT /api/v1/service-requests/{id}/status` *(Stale)* | Leader | `409 Conflict` | Thử cập nhật trạng thái với stale version $\rightarrow$ chặn `OPTIMISTIC_LOCK_CONFLICT` |
| 10 | `PUT /api/v1/service-requests/{id}/status` *(In Progress)* | Leader | `200 OK` | Leader bắt đầu xử lý `status: IN_PROGRESS`, tăng `version: 2` |
| 11 | `POST /api/v1/service-requests/{id}/comments` | Leader | `201 Created` | Ghi nhận nội dung bình luận tiến độ xử lý kỹ thuật |
| 12 | `POST /api/v1/assets/{id}/repair-histories` | Admin | `201 Created` | Ghi nhận lịch sử sửa chữa tài sản gắn mã `serviceRequestId` |
| 13 | `PUT /api/v1/service-requests/{id}/status` *(Resolved)* | Leader | `200 OK` | Leader hoàn tất khắc phục sự cố: `status: RESOLVED`, tăng `version: 3` |
| 14 | `PUT /api/v1/service-requests/{id}/status` *(Closed)* | Admin | `200 OK` | Admin xác nhận đóng yêu cầu: `status: CLOSED`, tăng `version: 4` |
| 15 | `PUT /api/v1/assets/{id}/assignments/{aid}/return` | Admin | `200 OK` | Thu hồi tài sản, trả trạng thái tài sản về `AVAILABLE`, assignment `RETURNED` |

---

### 2.2. Android Native Emulator Runtime Evidence (API 35)

Kiểm thử trực tiếp trên thiết bị ảo `Medium_Phone` (Android 15 / API 35) qua ADB và React Native:

1. **Đăng nhập và phân quyền hiển thị trên Mobile:**
   - Ứng dụng khởi động ổn định (`com.workspheremobile.MainActivity`).
   - Đăng nhập thành công với tài khoản nhân viên `e2e_emp_canonical`.
   - Màn hình Dashboard hiển thị đầy đủ tổng quan công việc, dự án tham gia và số lượng yêu cầu dịch vụ hiện tại.
2. **Khám phá và truy cập danh sách Yêu cầu dịch vụ:**
   - Chuyển tab bottom navigation sang **Yêu cầu** (`Tab 4: Yêu cầu`).
   - Màn hình danh sách (`SCR-SRV-01`) tải đầy đủ bộ lọc (Trạng thái, Mức độ ưu tiên, Danh mục) và các thẻ yêu cầu dịch vụ thực tế.
   - Nút **+ Tạo mới** (`service-requests-create-button`) hiển thị sẵn sàng cho nhân viên tạo yêu cầu hỗ trợ.
3. **Màn hình tạo Yêu cầu dịch vụ (`SCR-SRV-02`):**
   - Mở màn hình tạo yêu cầu dịch vụ với đầy đủ các trường: Danh mục bắt buộc, Tiêu đề, Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp), và Mô tả chi tiết.
4. **Quản lý tài sản & Tab "Của tôi" (`SCR-AST-01`):**
   - Từ tab **Thêm** (`SCR-MAIN-03`), điều hướng vào **Quản lý tài sản** (`btn-navigate-assets`).
   - Tab mặc định **Của tôi** hiển thị danh sách các tài sản đang được cấp phát cho `e2e_emp_canonical`, bao gồm các thông số mã tài sản (`assetCode`), phân loại, trạng thái `Đang cấp phát`, và vị trí.
5. **Chi tiết tài sản & Liên kết chéo Báo hỏng (`Cross-Module Link`):**
   - Mở màn hình chi tiết tài sản (`AssetDetailScreen`), cuộn xuống phần hành động.
   - Kích hoạt nút **Báo hỏng / Yêu cầu dịch vụ**: Ứng dụng điều hướng ngay lập tức sang màn hình **Tạo yêu cầu dịch vụ** với thông báo ngữ cảnh:
     > *"Yêu cầu này được gắn với tài sản được chỉ định từ ngữ cảnh trước."*
   - Khẳng định tính toàn vẹn và thông suốt của luồng tích hợp liên module giữa Asset Management và Service Request Management trên thiết bị di động.

---

## 3. TOÀN BỘ REGRESSION SUITES

Cả hai bộ kiểm thử toàn diện của hệ thống đều vượt qua với tỷ lệ thành công 100%:

### 3.1. Mobile Full Regression
- **Lệnh thực thi:** `npm --prefix mobile test -- --runInBand`
- **Kết quả:**
  - **Test Suites:** **129 passed**, 129 total
  - **Tests:** **1142 passed**, 1142 total
  - **Snapshots:** 0 total
  - **Thời gian:** 44.439 s
  - **Exit Code:** `0`

### 3.2. Backend Full Regression
- **Lệnh thực thi:** `cd backend; .\mvnw.cmd test`
- **Kết quả:**
  - **Checkstyle:** `0 Checkstyle violations`
  - **Compilation:** `BUILD SUCCESS`
  - **Surefire Test Execution:**
    - **Tests run:** **340**, Failures: 0, Errors: 0, Skipped: 0
  - **Build Result:** `BUILD SUCCESS`
  - **Exit Code:** `0`

---

## 4. DỌN DẸP MÔI TRƯỜNG & AN NINH DỮ LIỆU

1. Đã đóng an toàn ứng dụng trên thiết bị Android: `am force-stop com.workspheremobile`.
2. Đã dỡ bỏ toàn bộ cổng chuyển tiếp mạng: `adb reverse --remove-all`.
3. Đã tắt an toàn thiết bị giả lập: `adb emu kill`.
4. Đã dừng toàn bộ các tác vụ nền dev backend (`spring-boot:run`) và Metro bundler (`npm start`).
5. Thư mục `scratch/` đã được dọn sạch hoàn toàn; không có mật khẩu, token, API key hay thông tin bí mật nào bị lưu trữ hay commit vào kho mã.
6. Cây làm việc Git sạch sẽ (`working tree clean`).

---

## 5. KẾT LUẬN & BÀN GIAO

Giai đoạn **16D — FLOW-04 Service Request & FLOW-05 Asset Management E2E Wave** đã hoàn thành đạt chuẩn tuyệt đối, và được bổ sung toàn diện bằng chứng runtime và kiểm định concurrency/security qua **PHASE 16D-RUNTIME-CORRECTIVE** (`reports/PHASE_16D_RUNTIME_CORRECTIVE_SERVICE_ASSET.md`), sẵn sàng chuyển tiếp sang **Giai đoạn 16E — FLOW-06 Notification Management End-to-End Wave**.

**Marker chính thức:**  
`PHASE_16D_SERVICE_REQUEST_ASSET_E2E_CONFIRMED_READY_FOR_16E`
