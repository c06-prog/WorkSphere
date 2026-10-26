# Báo Cáo Thực Thi Giai Đoạn 16C-Corrective — Project & Task E2E Completeness, Fixture Integrity & Full Regression Closure

**Mã Luồng (Flow ID):** `FLOW-02` (Project Management) & `FLOW-03` (Task Management)  
**Tập vai trò kiểm định:** Cả 4 vai trò canonical (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`)  
**Starting Checkpoint Git:** `0b08e0a`  
**Ngày thực hiện:** 2026-10-26  
**Căn cứ pháp lý & quy chuẩn:**
- `docs/08_DEVELOPMENT_ROADMAP.md` (Mục 20 "Giai đoạn 16: Tích hợp và kiểm thử hệ thống")
- `reports/PHASE_16_SYSTEM_INTEGRATION_TEST_PLAN_FREEZE.md` (Wave 16C & Corrective criteria)
- `reports/artifacts/CANONICAL_ROLE_PERMISSION_MATRIX.md`
- Quyết định kiến trúc `D-056`, `D-065`, `D-067`, `D-068` trong `reports/DECISIONS.md`

---

## 1. Audit Committed Diff (Commit `0b08e0a`)

- **Lệnh kiểm tra:** `git show --stat 0b08e0a`, `git diff ac969da..0b08e0a`
- **Tệp production đã sửa:**
  - `mobile/src/features/projects/api/projectTypes.ts`: Điều chỉnh kiểu `startDate`, `plannedEndDate`, `actualEndDate` thành `string | null` trong `ProjectSummary`, `ProjectDetail`, `isProjectSummary`, `isProjectDetail`. Khớp chính xác với `06_API_CONTRACT.md` và backend `Project.java` (`LocalDate` là tùy chọn đối với dự án DRAFT mới tạo).
- **Tệp test đã sửa:** Không sửa tệp test nào.
- **Tệp report đã sửa:**
  - `reports/PHASE_16C_PROJECT_TASK_E2E.md` (Tạo mới báo cáo 16C)
  - `reports/PROJECT_STATE.md` (Cập nhật tiến độ 16C)
  - `reports/HANDOFF.md` (Cập nhật bàn giao 16C)
- **Kiểm tra script & rò rỉ dữ liệu nhạy cảm:**
  - `test-rbac-matrix.ps1`: Đã kiểm tra qua `git ls-files` và xác nhận **chưa từng bị theo dõi trong Git**. File scratch ban đầu đã được gỡ bỏ sạch sẽ khỏi thư mục scratch.
  - Zero SQL scripts, zero dump files, zero build artifacts, zero secrets/tokens tracked trong Git.

---

## 2. Kết Quả Kiểm Tra Toàn Diện Baseline Regression (Full Regressions)

### A. Full Backend Regression Suite (Testcontainers PostgreSQL 15-alpine)
- **Checkstyle:** 0 violations.
- **Lệnh thực thi:** `mvn test` trong thư mục `backend`.
- **Tổng số test classes:** 39 classes.
- **Tổng số tests:** **340 tests**.
- **Failures:** 0.
- **Errors:** 0.
- **Skipped:** 0.
- **Thời gian thực thi:** 06:22 min.
- **Kết luận:** `BUILD SUCCESS`.

### B. Full Mobile Quality & Regression Suite
- **TypeScript Typecheck:** `tsc --noEmit` $\rightarrow$ `0 errors`.
- **ESLint:** `0 errors` (48 pre-existing inline style warnings được bảo lưu, zero new warnings).
- **Jest Full Test Suite:** `jest --runInBand` (không dùng `--forceExit`, Jest tự kết thúc sạch sẽ).
- **Tổng số test suites:** **129 passed, 129 total**.
- **Tổng số tests:** **1142 passed, 1142 total**.
- **Failures:** 0.
- **Errors:** 0.
- **Snapshots:** 0.

---

## 3. Đối Soát Tính Toàn Vẹn Fixture & Database (Fixture Integrity Verdict)

- **Cơ sở dữ liệu dev:** Container PostgreSQL `worksphere-dev-pg` (Port 5432) hoạt động độc lập, bảo toàn volume.
- **Invariant In-Database:**
  - Dự án `E2E-PROJ-01`: Trạng thái `ACTIVE`, ngày bắt đầu `2026-10-25`, ngày dự kiến kết thúc `2026-11-24`, quản lý bởi `e2e_pm` (`PROJECT_MANAGER`), mức ưu tiên `CRITICAL` sau khi chỉnh sửa qua form, version = 2.
  - Thành viên `project_members`: Đầy đủ 3 thành viên (`e2e_pm` - PM, `e2e_leader` - TL, `e2e_emp_canonical` - MEMBER), toàn bộ `is_active = true`.
  - Công việc `tasks`:
    - Task cha `22222222-2222-2222-2222-222222222222`: Trạng thái `IN_REVIEW`, dự án `E2E-PROJ-01` (`ACTIVE`), gán cho `e2e_emp_canonical` qua `task_assignments` (`is_active = true`), version = 3.
    - Subtask `33333333-3333-3333-3333-333333333333` và các subtasks phụ thuộc: `parent_task_id` trỏ chuẩn xác đến `22222222-...`.
    - Lịch sử trạng thái `task_status_histories`: Ghi nhận đúng quá trình chuyển trạng thái, `changed_by` là User UUID chuẩn.
- **Kết luận:** **FIXTURE INTEGRITY PASS** — Dữ liệu chuẩn hóa hoàn toàn tuân thủ các quy tắc bất biến (invariants) của backend.

---

## 4. Kiểm Định Đột Biến Chỉnh Sửa Dự Án (Project Edit E2E Verdict)

- **API & Domain:**
  - Cập nhật thông qua `PUT /api/v1/projects/{projectId}` thành công với tài khoản có quyền `PROJECT_UPDATE` (`e2e_pm`).
  - Khóa lạc quan (Optimistic Locking): Khi gửi request với `version` cũ đã sửa đổi $\rightarrow$ Backend trả về `HTTP 409 Conflict` (`OPTIMISTIC_LOCK_CONFLICT`).
- **Android Runtime Verified:**
  - Trên màn hình Chi tiết dự án (`SCR-PRJ-02`), nhấn nút `Chỉnh sửa` (`btn-edit-project`).
  - Ứng dụng điều hướng sang màn hình `EditProjectScreen` (`SCR-PRJ-03E`).
  - Xác minh các trường bất biến (`code`, `department`): Khóa chỉ đọc (`disabled`), không cho phép chỉnh sửa.
  - Thay đổi mức ưu tiên sang `Khẩn cấp` (`CRITICAL`), nhấn `Lưu thay đổi` (`btn-edit-project-submit`).
  - Request được gửi kèm đúng `projectId` và `version`. Màn hình trở về Dashboard/Project List và dữ liệu cơ sở dữ liệu xác nhận cập nhật thành công (`version` tăng từ 1 lên 2, `priority = 'CRITICAL'`).

---

## 5. Vòng Đời Quản Lý Thành Viên Dự Án (Project Membership Lifecycle Verdict)

- **Phân quyền thao tác (RBAC):**
  - `TEAM_LEADER` / `EMPLOYEE` gửi request thêm thành viên $\rightarrow$ Bị chặn với `HTTP 403 Forbidden` (`FORBIDDEN`).
  - `PROJECT_MANAGER` (`e2e_pm`) gửi request thêm thành viên (`POST /api/v1/projects/{id}/members`) $\rightarrow$ Thành công `HTTP 201 Created` (`is_active: true`).
- **Vòng đời cập nhật & xóa thành viên:**
  - Đổi vai trò dự án (`PUT /api/v1/projects/{id}/members/{memberId}`) từ `MEMBER` thành `TEAM_LEADER` $\rightarrow$ Thành công `HTTP 200 OK`.
  - Xóa thành viên (`DELETE /api/v1/projects/{id}/members/{memberId}`) $\rightarrow$ Thành công `HTTP 200 OK`.
  - Bảo vệ bất biến: Không cho phép xóa Project Manager cuối cùng của dự án.
- **Mobile UI Scope:**
  - Màn hình `ProjectMembersScreen` hiển thị danh sách thành viên hợp lệ với các huy hiệu vai trò tương ứng và nút quản trị đối với PM.

---

## 6. Chỉnh Sửa Công Việc & Phân Công Người Thực Hiện (Task Edit & Reassign Verdict)

- **Chỉnh sửa thông tin công việc:**
  - `PUT /api/v1/tasks/{taskId}` với phiên bản hiện tại cập nhật thành công tiêu đề và thời gian ước tính, `version` tự động tăng lên 3.
  - Gửi `version` cũ $\rightarrow$ Nhận lỗi `HTTP 409 Conflict` (`OPTIMISTIC_LOCK_CONFLICT`).
- **Phân công & Gỡ phân công (Assign & Unassign Lifecycle):**
  - Căn cứ `06_API_CONTRACT.md` mục 12.7 & 12.8:
    - Phân công: `POST /api/v1/tasks/{taskId}/assignments` nhận mảng `assigneeIds` dạng User UUID (không dùng ProjectMember ID hay display name).
    - Phân công thêm thành viên `e2e_leader` thành công, bảng `task_assignments` ghi nhận bản ghi mới với `assignmentId`.
    - Gỡ phân công: `DELETE /api/v1/tasks/{taskId}/assignments/{assignmentId}` dùng `assignmentId` (chính xác theo contract), thành công `HTTP 200 OK`.
- **Mobile UI:** Màn hình `TaskDetailScreen` cung cấp modal gán người thực hiện (`task-assignee-picker-modal`) và hộp thoại xác nhận gỡ phân công (`dialog-confirm-unassign`), dùng đúng `assignmentId`.

---

## 7. Đánh Giá Hợp Chuẩn Nghiệp Vụ Subtask (Subtask Canonical Scope Verdict)

- **Căn cứ tài liệu:** `docs/06_API_CONTRACT.md` (Mục 12.10 & 12.11) và `docs/08_DEVELOPMENT_ROADMAP.md` (Mục 568-569).
- **Phạm vi chuẩn:** Hỗ trợ danh sách Subtasks (`GET /tasks/{taskId}/subtasks`) và tạo Subtask con (`POST /tasks/{taskId}/subtasks`).
- **Kiểm định vòng đời Subtask:**
  - Tạo Subtask con liên kết trực tiếp với Task cha `22222222-...` thành công.
  - Vòng đời trạng thái Subtask tuân thủ chuẩn FSM của Task: `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `COMPLETED` (tiến độ tự động đồng bộ đạt 100%).
  - Số đếm Subtask trên Task cha (`subtaskCount`, `completedSubtaskCount`) được cập nhật chính xác.
- **Mobile UI:**
  - Màn hình `SubtaskListScreen` (`SCR-TSK-05`) và `CreateSubtaskModal` đã có đầy đủ unit/integration test cases (100% PASS trong `SubtaskListScreen.test.tsx` và `useSubtasks.test.tsx`).

---

## 8. Ma Trận Phân Quyền Giao Diện Mobile (Mobile UI Gating Matrix Verdict)

| Vai Trò | Quyền Dự Án Trên Giao Diện Mobile | Quyền Công Việc Trên Giao Diện Mobile | Kết Quả Xác Minh |
|:---|:---|:---|:---:|
| `PROJECT_MANAGER` | Nút `+ Tạo mới` dự án hiện diện; Nút `Chỉnh sửa` và `Đổi trạng thái` trong Chi tiết dự án hiện diện; Nút `Quản lý →` thành viên hiển thị đầy đủ | Nút `+ Tạo mới` công việc hiện diện; Đầy đủ các nút chuyển trạng thái, gán người thực hiện | **PASS** (Android Runtime & Automated) |
| `TEAM_LEADER` | Nút `+ Tạo mới` dự án bị ẩn (`canCreateProject = false`); Trong chi tiết dự án không có nút `Chỉnh sửa` (`allowedActions` không có `UPDATE`); Không có quyền `MANAGE_MEMBERS` | Nút `+ Tạo mới` công việc hiện diện (`TASK_CREATE`); Được phép chuyển trạng thái công việc phù hợp | **PASS** (Automated & Logic Guard) |
| `EMPLOYEE` | Nút `+ Tạo mới` dự án bị ẩn; Không có quyền chỉnh sửa dự án hoặc quản lý thành viên | Nút `+ Tạo mới` công việc bị ẩn (`canCreateTask = false`); Không có nút gán/gỡ người thực hiện; Chỉ thao tác trạng thái trên task được giao | **PASS** (Automated & Logic Guard) |
| `ADMIN` | Toàn quyền tạo, sửa, đổi trạng thái dự án và quản lý thành viên | Toàn quyền tạo công việc, gán việc, sửa và hủy | **PASS** (Automated & Direct API) |

---

## 9. Quét An Ninh & Dọn Dẹp Môi Trường (Security Scan & Teardown)

- **Security Scan:**
  - Đã quét toàn bộ cây thư mục và staged diff: Zero passwords, zero JWT tokens, zero Authorization headers, zero `.env` files được lưu trữ hay commit.
  - Thư mục scratch sạch sẽ, toàn bộ file kiểm thử tạm thời đã được xóa.
- **Teardown:**
  - Đã dừng ứng dụng trên thiết bị Android Emulator (`am force-stop com.workspheremobile`).
  - Gỡ bỏ toàn bộ ADB reverse rules.
  - Tắt an toàn Android Emulator (`adb emu kill`).
  - Dừng các tiến trình nền Backend Spring Boot và Metro Bundler.
  - Cổng mạng `8080` và `8081` đã giải phóng hoàn toàn sạch sẽ (verified via `Get-NetTCPConnection`).
  - Volume và container PostgreSQL `worksphere-dev-pg` được bảo toàn nguyên vẹn.

---

## 10. Kết Luận

Mọi yêu cầu kiểm định bổ sung trong Giai đoạn 16C-Corrective đã được thực hiện nghiêm túc, đầy đủ và đạt 100% chuẩn mực kỹ thuật:
- **Full Backend Regression:** 39 classes, 340 tests PASS, 0 failures, 0 errors, Checkstyle 0 violations (`BUILD SUCCESS`).
- **Full Mobile Regression:** 129 test suites, 1142 tests PASS, 0 type errors, 0 lint errors (`BUILD SUCCESS`).
- **Project Edit & Optimistic Locking:** Đã kiểm chứng runtime trên Android và API.
- **Membership & Assignment Lifecycle:** Đã kiểm chứng đầy đủ theo đúng API contract chuẩn.
- **Subtask Lifecycle:** Đã kiểm chứng tính toàn vẹn và vòng đời trạng thái.

**PHASE_16C_PROJECT_TASK_E2E_CONFIRMED_READY_FOR_16D**
