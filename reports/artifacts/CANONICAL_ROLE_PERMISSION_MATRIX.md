# WorkSphere Canonical Role-Permission Matrix Artifact

**Mục đích:** Tài liệu kỹ thuật định chuẩn ma trận phân quyền phục vụ thiết kế, thực thi và tự động hóa kiểm định End-to-End (E2E) trong Giai đoạn 16 (System Integration & E2E Testing).  
**Căn cứ pháp lý & kỹ thuật tối cao:**
- `docs/02_USER_ROLES_AND_WORKFLOWS.md` (Mục 2.6 "Ma trận phân quyền chi tiết")
- Database Flyway Migrations:
  - `V011__seed_roles_and_permissions.sql`
  - `V014__seed_role_permissions.sql`
  - `V015__correct_project_read_permissions_and_validate_role_matrix.sql`
- Architecture Decisions: `D-065`, `D-067`, `D-068` trong `reports/DECISIONS.md`
- Trạng thái kiểm chứng: **Xác thực 100% khớp thực tế PostgreSQL Dev Database (`worksphere-dev-pg`)**.

---

## 1. Kết Luận Chuẩn Hóa Danh Sách Vai Trò (Canonical Role Set)

Hệ thống WorkSphere có đúng **4 vai trò người dùng chuẩn (canonical roles)**:
1. `ADMIN` (Quản trị viên toàn hệ thống) — Sở hữu toàn bộ 29/29 quyền.
2. `PROJECT_MANAGER` (Quản lý dự án) — Sở hữu 19/29 quyền.
3. `TEAM_LEADER` (Trưởng nhóm / Điều phối viên kỹ thuật) — Sở hữu 15/29 quyền.
4. `EMPLOYEE` (Nhân viên / Thành viên dự án) — Sở hữu 13/29 quyền.

> [!IMPORTANT]
> **Xác minh về các vai trò lịch sử / ngoại vi (như `FACILITY_MANAGER`):**
> - Vai trò `FACILITY_MANAGER` **HOÀN TOÀN KHÔNG TỒN TẠI** trong bất kỳ Flyway migration nào (`V001`–`V017`) và không có trong bảng `roles` của database.
> - Quyền quản lý tài sản (`ASSET_MANAGE`, `ASSET_CATEGORY_MANAGE`) được tập trung giao cho `ADMIN`.
> - Quyền điều phối dịch vụ (`SERVICE_REQUEST_ASSIGN`, `SERVICE_CATEGORY_MANAGE`) được tập trung giao cho `ADMIN`.
> - Tổng số bản ghi liên kết `role_permissions` trong hệ thống là **76 bản ghi**.

---

## 2. Bảng Đối Chiếu Chi Tiết 29 Quyền Hạn Cho 4 Vai Trò

Dưới đây là bảng phân rã chi tiết 29 quyền trên 8 module, chỉ rõ hành vi API mong đợi và mức độ hiển thị trên ứng dụng Mobile:

| STT | Phân Hệ (Module) | Mã Quyền (Permission Code) | ADMIN | PROJECT_MANAGER | TEAM_LEADER | EMPLOYEE | Hành Vi API Khi Bị Từ Chối | Hiển Thị Giao Diện Mobile (UI Visibility) |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|:---|
| 1 | **IDENTITY** | `PROFILE_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `401 Unauthorized` nếu thiếu token | Cho phép mở màn hình Hồ sơ cá nhân (`SCR-ACC-01`) |
| 2 | **IDENTITY** | `PROFILE_UPDATE` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Nút "Chỉnh sửa hồ sơ" hiển thị cho mọi vai trò |
| 3 | **IDENTITY** | `USER_READ` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Danh sách thành viên tổ chức chỉ mở cho Admin |
| 4 | **IDENTITY** | `USER_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Tạo/Sửa/Khóa tài khoản chỉ có trên Web Admin |
| 5 | **IDENTITY** | `ROLE_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Gán vai trò chỉ có trên Web Admin |
| 6 | **ORGANIZATION** | `DEPARTMENT_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Quản lý phòng ban chỉ có trên Web Admin |
| 7 | **AUDIT** | `AUDIT_READ` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Xem audit log chỉ có trên Web Admin |
| 8 | **REPORTING** | `REPORT_READ` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Xem báo cáo phân tích tổng thể chỉ có trên Web Admin |
| 9 | **PROJECT** | `PROJECT_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Tab "Dự án" hiển thị cho mọi vai trò |
| 10 | **PROJECT** | `PROJECT_CREATE` |  ALLOW |  ALLOW |  DENY |  DENY | `403 Forbidden` | Nút FAB "+" / "Tạo dự án mới" chỉ hiện với Admin/PM |
| 11 | **PROJECT** | `PROJECT_UPDATE` |  ALLOW |  ALLOW |  DENY |  DENY | `403 Forbidden` | Nút "Sửa dự án" trong ProjectDetail chỉ hiện với Admin/PM |
| 12 | **PROJECT** | `PROJECT_MEMBER_MANAGE` |  ALLOW |  ALLOW |  DENY |  DENY | `403 Forbidden` | Nút "Thêm thành viên" / đổi role chỉ hiện với Admin/PM |
| 13 | **TASK** | `TASK_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Tab "Công việc" và TaskList hiển thị cho mọi vai trò |
| 14 | **TASK** | `TASK_CREATE` |  ALLOW |  ALLOW |  ALLOW |  DENY | `403 Forbidden` | Nút "+" tạo task chỉ hiển thị cho Admin, PM, Team Lead |
| 15 | **TASK** | `TASK_UPDATE` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Cho phép sửa tiêu đề/mô tả theo phạm vi được giao |
| 16 | **TASK** | `TASK_DELETE` |  ALLOW |  ALLOW |  DENY |  DENY | `403 Forbidden` | Nút "Xóa công việc" chỉ có với Admin và PM |
| 17 | **TASK** | `TASK_ASSIGN` |  ALLOW |  ALLOW |  ALLOW |  DENY | `403 Forbidden` | Picker chọn người thực thi ẩn với Employee |
| 18 | **TASK** | `TASK_UPDATE_STATUS` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Nút chuyển trạng thái (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`) |
| 19 | **SERVICE_REQUEST** | `SERVICE_REQUEST_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Mục "Yêu cầu dịch vụ" trong More hiển thị cho mọi vai trò |
| 20 | **SERVICE_REQUEST** | `SERVICE_REQUEST_CREATE` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Nút "Gửi yêu cầu mới" hiển thị cho mọi nhân viên |
| 21 | **SERVICE_REQUEST** | `SERVICE_REQUEST_UPDATE` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Cho phép cập nhật thông tin yêu cầu của chính mình |
| 22 | **SERVICE_REQUEST** | `SERVICE_REQUEST_ASSIGN` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Phân công chuyên viên xử lý chỉ dành cho Admin |
| 23 | **SERVICE_REQUEST** | `SERVICE_REQUEST_UPDATE_STATUS`|  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Cập nhật tiến độ xử lý hoặc đóng yêu cầu |
| 24 | **SERVICE_REQUEST** | `SERVICE_CATEGORY_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Cấu hình danh mục dịch vụ chỉ có trên Web Admin |
| 25 | **ASSET** | `ASSET_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Mục "Tài sản" trong More hiển thị cho mọi vai trò |
| 26 | **ASSET** | `ASSET_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Nút "Thêm tài sản", "Ghi nhận sửa chữa" chỉ mở cho Admin |
| 27 | **ASSET** | `ASSET_CATEGORY_MANAGE` |  ALLOW |  DENY |  DENY |  DENY | `403 Forbidden` | Cấu hình danh mục tài sản chỉ dành cho Admin |
| 28 | **NOTIFICATION** | `NOTIFICATION_READ` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Bell icon Dashboard & Notification Center mở cho mọi người |
| 29 | **NOTIFICATION** | `NOTIFICATION_UPDATE` |  ALLOW |  ALLOW |  ALLOW |  ALLOW | `403 Forbidden` | Đánh dấu đọc / Đọc tất cả cho phép trên notification của mình |

---

## 3. Tổng Hợp Số Lượng Quyền

$$\begin{aligned}
\text{ADMIN} &= 29 \text{ quyền} \\
\text{PROJECT\_MANAGER} &= 19 \text{ quyền} \\
\text{TEAM\_LEADER} &= 15 \text{ quyền} \\
\text{EMPLOYEE} &= 13 \text{ quyền} \\
\text{Tổng số role-permission mappings} &= 29 + 19 + 15 + 13 = 76 \text{ bản ghi}
\end{aligned}$$

---

## 4. Ứng Dụng Trong Kiểm Định Waves 16B – 16F

1. **Wave 16B (FLOW-01 Auth & RBAC Matrix Verification):**
   - Đăng nhập lần lượt bằng 4 tài khoản ứng với 4 vai trò.
   - Thử nghiệm các thao tác vượt quyền: Employee gọi `POST /api/v1/projects` (kỳ vọng `403`), Team Leader gọi `DELETE /api/v1/tasks/{id}` (kỳ vọng `403`).
2. **Wave 16C (FLOW-02 Project & FLOW-03 Task):**
   - PM tạo dự án và gán Team Leader làm thành viên quản lý kỹ thuật, Employee làm thành viên thực thi.
   - Employee cập nhật trạng thái Task nhưng không thể gán lại Task cho người khác.
3. **Wave 16D (FLOW-04 Service Request & FLOW-05 Asset):**
   - Employee tạo Service Request báo hỏng tài sản.
   - Admin phân công xử lý yêu cầu và thực hiện ghi nhận sửa chữa tài sản.
4. **Wave 16E (FLOW-06 Notifications):**
   - Đảm bảo thông báo chỉ phát sinh và hiển thị đúng cho cá nhân người dùng có liên quan (User Isolation).
