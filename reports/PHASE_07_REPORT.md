# BÁO CÁO TRIỂN KHAI PHASE 7: TASK MANAGEMENT BACKEND

## 1. Checkpoint khởi tạo

- **Base commit**: `c9702acc1e2b74fb04eb3a29f6e527d158dcd6af`
- **Commit message**: `docs(agent): checkpoint visual prototype`
- **Branch**: `main`
- **HEAD equals origin/main**: Xác nhận đúng trước khi triển khai
- **Working tree**: Clean trước khi triển khai

---

## 2. Phạm vi chuẩn mực (Canonical Scope)

Căn cứ theo:
- `docs/01_PROJECT_SCOPE.md` (Section 3.4)
- `docs/02_USER_ROLES_AND_WORKFLOWS.md` (Section 5)
- `docs/04_SYSTEM_ARCHITECTURE.md` (Section 4 & 5)
- `docs/05_DATABASE_DESIGN.md` (Section 8)
- `docs/06_API_CONTRACT.md` (Section 12)
- `docs/07_FOUR_COURSE_MATRIX.md` (Section 3)
- `docs/08_DEVELOPMENT_ROADMAP.md` (Section 11)
- `docs/09_CODING_STANDARDS.md`
- `docs/10_AI_AGENT_INSTRUCTIONS.md` (Section 10.8)

---

## 3. Quyết định phạm vi Task Comment

- **Căn cứ Roadmap**: `docs/08_DEVELOPMENT_ROADMAP.md` Section 11.2, 11.3 và 11.5 xác nhận Task Comments thuộc phạm vi công việc của Phase 7.
- **Căn cứ API Contract**: `docs/06_API_CONTRACT.md` Section 12.12 - 12.15 định nghĩa đầy đủ 4 endpoints cho bình luận công việc.
- **Căn cứ Database**: Bảng `task_comments` đã có sẵn từ migration `V005__create_task_tables.sql`.
- **Kết luận**: Task Comments được triển khai hoàn chỉnh trong Phase 7 (Entity, Repository, ApplicationService, Controller, Unit & Integration Tests).

---

## 4. Ngoài phạm vi (Out-of-Scope)

- **Task Attachments**: Bảng `task_attachments` giữ nguyên trong DB; không triển khai Entity/Service/API do bị phụ thuộc vào File Module (`stored_files`) được xếp lịch ở Phase 8 (`TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08`).
- **React Native / Mobile UI**: Không can thiệp code mobile.
- **Service Request / Asset / Notification / Team API / Dashboard Aggregator**: Giữ nguyên ranh giới đóng của phase.

---

## 5. Ánh xạ cơ sở dữ liệu (Database Mapping)

Mọi entity JPA ánh xạ chính xác 100% cột trong Flyway migrations `V005` và `V010`:

1. **`Task`** (`tasks`):
   - `id`: UUID (PK)
   - `project_id`: UUID (FK `projects.id`)
   - `parent_task_id`: UUID (FK `tasks.id`)
   - `milestone_id`: UUID (FK `milestones.id`)
   - `title`: VARCHAR(255)
   - `description`: TEXT
   - `status`: VARCHAR(30)
   - `priority`: VARCHAR(20)
   - `reporter_id`: UUID (FK `users.id`)
   - `start_date`: DATE
   - `due_date`: TIMESTAMP WITH TIME ZONE
   - `completed_at`: TIMESTAMP WITH TIME ZONE
   - `progress_percent`: NUMERIC(5,2)
   - `estimated_minutes`: INTEGER
   - `actual_minutes`: INTEGER
   - `is_deleted`: BOOLEAN
   - `deleted_at`, `deleted_by`: Audit soft delete
   - `created_by`, `updated_by`, `created_at`, `updated_at`: Audit fields
   - `version`: BIGINT (Optimistic Locking)

2. **`TaskAssignment`** (`task_assignments`):
   - `id`: UUID (PK)
   - `task_id`: UUID (FK `tasks.id`)
   - `assignee_id`: UUID (FK `users.id`)
   - `assigned_by`: UUID (FK `users.id`)
   - `assigned_at`: TIMESTAMP WITH TIME ZONE
   - `unassigned_at`: TIMESTAMP WITH TIME ZONE
   - `is_active`: BOOLEAN

3. **`TaskStatusHistory`** (`task_status_histories`):
   - `id`: UUID (PK)
   - `task_id`: UUID (FK `tasks.id`)
   - `from_status`: VARCHAR(30) nullable
   - `to_status`: VARCHAR(30) required
   - `comment`: VARCHAR(1000)
   - `changed_by`: UUID (FK `users.id`)
   - `changed_at`: TIMESTAMP WITH TIME ZONE

4. **`TaskComment`** (`task_comments`):
   - `id`: UUID (PK)
   - `task_id`: UUID (FK `tasks.id`)
   - `author_id`: UUID (FK `users.id`)
   - `content`: TEXT
   - `parent_id`: UUID (FK `task_comments.id`)
   - `is_edited`: BOOLEAN
   - `edited_at`: TIMESTAMP WITH TIME ZONE
   - `is_deleted`: BOOLEAN (Soft delete nội dung)
   - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

---

## 6. Trạng thái Migration

- **V001 đến V011**: Không sửa đổi bất kỳ byte nào.
- **V012**: Không tạo mới vì schema hiện tại hoàn toàn đầy đủ và tương thích.
- **Schema gap**: Không có (`NO_SCHEMA_GAP`).

---

## 7. Triển khai Task Core

- **Domain Model**: Đóng gói các bất biến nghiệp vụ trong `Task.java`:
  - `create(...)`: Khởi tạo mặc định `TODO`, tiến độ `0%`, kiểm tra ngày bắt đầu không sau hạn chót (`TASK_DATE_RANGE_INVALID`), thời gian ước tính không âm, chặn self-parent.
  - `updateDetails(...)`: Kiểm tra phiên bản dữ liệu (Optimistic Locking), chặn cập nhật khi ở trạng thái kết thúc (`TASK_TERMINAL_STATE`).
  - `changeStatus(...)`: Kiểm tra ma trận chuyển trạng thái hợp lệ, cập nhật tự động `progressPercent = 100%` và `completedAt = now()` khi `COMPLETED`.
  - `updateProgress(...)`: Chặn cập nhật khi `CANCELLED` hoặc `COMPLETED` (`TASK_TERMINAL_STATE`), giới hạn `[0.0, 100.0]` (`TASK_INVALID_PROGRESS`).
  - `softDelete(...)`: Đánh dấu `deleted = true`, ghi nhận người xóa và thời điểm xóa.
- **Phân trang & Tìm kiếm**: `TaskApplicationService.getTasks` hỗ trợ tìm kiếm full-text theo tiêu đề/mô tả, lọc theo `projectId`, `parentTaskId`, `assigneeId` (dùng JPA criteria subquery), `reporterId`, `status`, `priority`, `overdue`, `dueFrom`, `dueTo`.
- **Sorting Whitelist**: Giới hạn nghiêm ngặt các trường sắp xếp được phép: `createdAt`, `updatedAt`, `dueDate`, `startDate`, `title`, `priority`, `status`, `progressPercent`. Từ chối các trường ngoài danh sách bằng `VALIDATION_ERROR`.

---

## 8. Triển khai Subtask & Cycle Detection

- **Quan hệ Subtask**: Tạo subtask với cùng `projectId` của công việc cha; kế thừa dự án từ cha.
- **Kiểm tra tương thích**: Từ chối cha con khác dự án (`TASK_PARENT_PROJECT_MISMATCH`).
- **Phát hiện chu trình (Cycle Detection)**:
  - Chặn self-parent trực tiếp (`taskId == parentTaskId`).
  - Đệ quy kiểm tra cây tổ tiên ngược lên tối đa 50 cấp; nếu gặp lại `taskId` thì từ chối ngay với mã `TASK_PARENT_CYCLE_DETECTED`.
  - Chặn liên kết tới công việc cha đã bị soft-delete (`TASK_NOT_FOUND`).

---

## 9. Triển khai Task Assignment

- **Phân công (`assignUsers`)**:
  - Assignee phải là người dùng đang hoạt động (`ACTIVE`, `is_deleted = false`).
  - Assignee phải là thành viên hoạt động (`active = true`) trong dự án của công việc (`TASK_ASSIGNEE_NOT_PROJECT_MEMBER`).
  - Chặn phân công trùng lặp đang có hiệu lực (`TASK_ALREADY_ASSIGNED`).
  - Ghi nhận `assignedBy` từ `principal.userId()`, `assignedAt = Instant.now()`.
- **Gỡ phân công (`unassignUser`)**:
  - Ghi nhận `unassignedAt = Instant.now()`, cập nhật `is_active = false`.
  - Kiểm tra đúng cặp `taskId` và `assignmentId`.

---

## 10. Triển khai Status History

- **Giao dịch nguyên khối (`@Transactional`)**: Mọi thao tác cập nhật trạng thái công việc đều ghi nhận bản ghi vào `task_status_histories` trong cùng một transaction.
- **Dữ liệu lịch sử**: `fromStatus`, `toStatus`, `comment`, `changedBy` (từ authenticated principal), `changedAt` (server time).
- **Quy tắc xóa an toàn**: Không cho phép xóa mềm công việc đã có lịch sử thay đổi trạng thái (`TASK_CANNOT_DELETE_HAS_HISTORY`); yêu cầu chuyển sang `CANCELLED`.

---

## 11. Triển khai Task Comment

- **Tạo bình luận (`createComment`)**: Kiểm tra quyền truy cập dự án, kiểm tra bình luận cha (nếu có phản hồi) phải cùng thuộc công việc và chưa bị xóa.
- **Sửa bình luận (`updateComment`)**: Chỉ tác giả hoặc Quản trị viên/Quản lý dự án mới có quyền chỉnh sửa (`FORBIDDEN`). Cập nhật cờ `is_edited = true` và `edited_at = now()`.
- **Xóa bình luận (`deleteComment`)**: Chỉ tác giả hoặc Quản trị viên/Quản lý dự án mới có quyền xóa (`FORBIDDEN`). Thực hiện soft-delete `is_deleted = true`.
- **Ẩn bình luận đã xóa**: Danh sách bình luận chỉ trả về các bình luận `deleted = false`.

---

## 12. Ma trận Workflow (Task Workflow Matrix)

| Trạng thái hiện tại | Trạng thái đích | Hợp lệ? | Điều kiện & Vai trò |
|---|---|---|---|
| TODO | IN_PROGRESS | Hợp lệ | Assignee, PM, TL, Admin |
| IN_PROGRESS | IN_REVIEW | Hợp lệ | Assignee, PM, TL, Admin |
| IN_REVIEW | COMPLETED | Hợp lệ | **Chỉ PM, TL, Admin** (Assignee tự duyệt bị chặn `FORBIDDEN`). Tiến độ tự chuyển 100%, completedAt được ghi |
| IN_REVIEW | IN_PROGRESS | Hợp lệ | **Chỉ PM, TL, Admin**. Bắt buộc nhập `comment` lý do từ chối (`VALIDATION_ERROR`) |
| TODO | CANCELLED | Hợp lệ | PM, TL, Admin |
| IN_PROGRESS | CANCELLED | Hợp lệ | PM, TL, Admin |
| TODO | COMPLETED | **Bị chặn** | Bỏ qua bước kiểm tra (`TASK_INVALID_STATUS_TRANSITION`) |
| IN_PROGRESS | COMPLETED | **Bị chặn** | Bỏ qua bước kiểm tra (`TASK_INVALID_STATUS_TRANSITION`) |
| COMPLETED | * (bất kỳ) | **Bị chặn** | Trạng thái kết thúc (`TASK_TERMINAL_STATE`) |
| CANCELLED | * (bất kỳ) | **Bị chặn** | Trạng thái kết thúc (`TASK_TERMINAL_STATE`) |

---

## 13. Phân quyền và Kiểm tra bảo mật (Authorization)

1. **Global Permissions** (Kiểm tra bằng `@PreAuthorize` tại Controller theo Seed `V011`):
   - `TASK_READ`: Xem danh sách, chi tiết task, subtask, bình luận.
   - `TASK_CREATE`: Tạo task, tạo subtask.
   - `TASK_UPDATE`: Cập nhật chi tiết task, cập nhật tiến độ.
   - `TASK_UPDATE_STATUS`: Cập nhật trạng thái task.
   - `TASK_ASSIGN`: Phân công hoặc gỡ phân công người thực hiện.
   - `TASK_DELETE`: Xóa mềm task.
2. **Business Context Rules** (Kiểm tra tại Service layer):
   - Người gọi thao tác phải là thành viên đang hoạt động của dự án chứa công việc (hoặc có vai trò Admin hệ thống).
   - Identity an toàn: Toàn bộ `actorId` được trích xuất từ `principal.userId()`, tuyệt đối không tin cậy dữ liệu do client gửi lên.

---

## 14. Danh sách API Endpoints (Section 12 API Contract)

| Phương thức | Đường dẫn | Quyền yêu cầu | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | `TASK_READ` | Danh sách công việc có lọc, tìm kiếm, phân trang |
| `POST` | `/api/v1/tasks` | `TASK_CREATE` | Tạo công việc mới (HTTP 201) |
| `GET` | `/api/v1/tasks/{taskId}` | `TASK_READ` | Chi tiết công việc và allowedActions |
| `PUT` | `/api/v1/tasks/{taskId}` | `TASK_UPDATE` | Cập nhật thông tin công việc (Optimistic Lock) |
| `PUT` | `/api/v1/tasks/{taskId}/status` | `TASK_UPDATE_STATUS` | Chuyển trạng thái công việc và ghi lịch sử |
| `PUT` | `/api/v1/tasks/{taskId}/progress` | `TASK_UPDATE` | Cập nhật tiến độ hoàn thành (0% - 100%) |
| `DELETE` | `/api/v1/tasks/{taskId}` | `TASK_DELETE` | Xóa mềm công việc (chặn khi có lịch sử) |
| `POST` | `/api/v1/tasks/{taskId}/assignments` | `TASK_ASSIGN` | Phân công người thực hiện |
| `DELETE` | `/api/v1/tasks/{taskId}/assignments/{assignmentId}` | `TASK_ASSIGN` | Gỡ phân công người thực hiện |
| `GET` | `/api/v1/tasks/{taskId}/subtasks` | `TASK_READ` | Danh sách công việc con |
| `POST` | `/api/v1/tasks/{taskId}/subtasks` | `TASK_CREATE` | Tạo công việc con (HTTP 201) |
| `GET` | `/api/v1/tasks/{taskId}/comments` | `TASK_READ` | Danh sách bình luận công việc |
| `POST` | `/api/v1/tasks/{taskId}/comments` | `TASK_READ` | Thêm bình luận (HTTP 201) |
| `PUT` | `/api/v1/tasks/{taskId}/comments/{commentId}` | `TASK_READ` | Chỉnh sửa bình luận (Tác giả/Admin) |
| `DELETE` | `/api/v1/tasks/{taskId}/comments/{commentId}` | `TASK_READ` | Xóa mềm bình luận (Tác giả/Admin) |

---

## 15. Kết quả kiểm thử (Test Coverage)

### A. Kiểm thử đơn vị (Unit Tests)
- `com.worksphere.task.TaskTest`: 6 tests **PASS**
  - Khởi tạo hợp lệ với TODO và 0% tiến độ.
  - Từ chối tiêu đề trống (`VALIDATION_ERROR`).
  - Từ chối ngày bắt đầu sau hạn chót (`TASK_DATE_RANGE_INVALID`).
  - Từ chối thời gian ước tính âm (`VALIDATION_ERROR`).
  - Từ chối self-parent (`TASK_PARENT_CYCLE_DETECTED`).
  - Xóa mềm thiết lập cờ `is_deleted = true`.
- `com.worksphere.task.TaskWorkflowTest`: 10 tests **PASS**
  - Chuyển trạng thái hợp lệ: `TODO -> IN_PROGRESS -> IN_REVIEW -> COMPLETED`.
  - Cập nhật tiến độ 100% và thời điểm hoàn thành khi `COMPLETED`.
  - Từ chối duyệt `IN_REVIEW -> IN_PROGRESS` (quay về sửa).
  - Hủy công việc từ `TODO` và từ `IN_PROGRESS`.
  - Chặn chuyển trực tiếp `TODO -> COMPLETED`.
  - Chặn chuyển trực tiếp `IN_PROGRESS -> COMPLETED`.
  - Chặn thao tác khi đã `COMPLETED` (terminal state).
  - Chặn thao tác khi đã `CANCELLED` (terminal state).
  - Chặn cập nhật tiến độ khi `CANCELLED`.
  - Chặn cập nhật tiến độ khi `COMPLETED`.
  - Chặn tiến độ ngoài khoảng `[0, 100]`.

### B. Kiểm thử tích hợp (PostgreSQL Testcontainers Integration Tests)
- `com.worksphere.task.TaskMockMvcTest`: 15 tests **PASS**
  - Tạo công việc thành công (HTTP 201).
  - Chặn tạo công việc trên dự án không ACTIVE (`TASK_PROJECT_NOT_ACTIVE`).
  - Chặn phân công người không thuộc dự án (`TASK_ASSIGNEE_NOT_PROJECT_MEMBER`).
  - Chặn khoảng thời gian không hợp lệ (`TASK_DATE_RANGE_INVALID`).
  - Lấy danh sách công việc với bộ lọc và phân trang.
  - Lấy chi tiết công việc với allowedActions.
  - Cập nhật công việc và kiểm soát xung đột phiên bản (`OPTIMISTIC_LOCK_CONFLICT`).
  - Toàn bộ vòng đời workflow và ghi nhận status history.
  - Assignee không được tự duyệt hoàn thành (`FORBIDDEN`).
  - Từ chối kiểm tra bắt buộc nhập lý do (`VALIDATION_ERROR`).
  - Chặn chuyển tắt sang hoàn thành (`TASK_INVALID_STATUS_TRANSITION`).
  - Phân công thành viên và chặn phân công trùng lặp (`TASK_ALREADY_ASSIGNED`).
  - Tạo và liệt kê công việc con, kiểm tra phân cấp.
  - Bình luận: tạo, sửa, phân quyền tác giả, xóa mềm và ẩn bình luận đã xóa.
  - Ràng buộc xóa công việc: chặn khi có lịch sử (`TASK_CANNOT_DELETE_HAS_HISTORY`), cho phép khi chưa có lịch sử.
  - Bảo mật: từ chối 401 khi không có token, 403 khi thiếu quyền.

---

## 16. Tổng hợp kiểm thử toàn bộ hệ thống (Regression Suite)

- **Tổng số tests**: **90/90 PASS**
  - Tests Phase 0 - 6: 59 tests PASS
  - Tests Phase 7 mới: 31 tests PASS
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Build Status**: **BUILD SUCCESS**
- **Maven execution time**: 01:25 min

---

## 17. Kiểm tra tuân thủ Checkstyle & Secret Scan

- **Checkstyle**: 0 violations (`checkstyle:check` exit code 0).
- **Secret scan**: 0 secret, token, mật khẩu, private key hay file `.env` thật nào bị commit.
- **Tài liệu chuẩn mực**: `docs/` 100% không bị sửa đổi.
- **Migrations cơ sở dữ liệu**: `V001` - `V011` 100% không bị sửa đổi.
- **Visual Prototype & Mobile**: 100% không bị sửa đổi.

---

## 18. Danh sách tệp tạo mới trong Phase 7

1. `backend/src/main/java/com/worksphere/task/domain/Task.java`
2. `backend/src/main/java/com/worksphere/task/domain/TaskStatus.java`
3. `backend/src/main/java/com/worksphere/task/domain/TaskPriority.java`
4. `backend/src/main/java/com/worksphere/task/domain/TaskAssignment.java`
5. `backend/src/main/java/com/worksphere/task/domain/TaskStatusHistory.java`
6. `backend/src/main/java/com/worksphere/task/domain/TaskComment.java`
7. `backend/src/main/java/com/worksphere/task/infrastructure/persistence/TaskRepository.java`
8. `backend/src/main/java/com/worksphere/task/infrastructure/persistence/TaskAssignmentRepository.java`
9. `backend/src/main/java/com/worksphere/task/infrastructure/persistence/TaskStatusHistoryRepository.java`
10. `backend/src/main/java/com/worksphere/task/infrastructure/persistence/TaskCommentRepository.java`
11. `backend/src/main/java/com/worksphere/task/api/request/CreateTaskRequest.java`
12. `backend/src/main/java/com/worksphere/task/api/request/UpdateTaskRequest.java`
13. `backend/src/main/java/com/worksphere/task/api/request/ChangeTaskStatusRequest.java`
14. `backend/src/main/java/com/worksphere/task/api/request/UpdateTaskProgressRequest.java`
15. `backend/src/main/java/com/worksphere/task/api/request/AssignTaskRequest.java`
16. `backend/src/main/java/com/worksphere/task/api/request/CreateSubtaskRequest.java`
17. `backend/src/main/java/com/worksphere/task/api/request/CreateTaskCommentRequest.java`
18. `backend/src/main/java/com/worksphere/task/api/request/UpdateTaskCommentRequest.java`
19. `backend/src/main/java/com/worksphere/task/api/response/TaskSummaryResponse.java`
20. `backend/src/main/java/com/worksphere/task/api/response/TaskDetailResponse.java`
21. `backend/src/main/java/com/worksphere/task/api/response/TaskStatusHistoryResponse.java`
22. `backend/src/main/java/com/worksphere/task/api/response/TaskCommentResponse.java`
23. `backend/src/main/java/com/worksphere/task/application/TaskApplicationService.java`
24. `backend/src/main/java/com/worksphere/task/application/TaskCommentApplicationService.java`
25. `backend/src/main/java/com/worksphere/task/web/TaskController.java`
26. `backend/src/test/java/com/worksphere/task/TaskTest.java`
27. `backend/src/test/java/com/worksphere/task/TaskWorkflowTest.java`
28. `backend/src/test/java/com/worksphere/task/TaskMockMvcTest.java`
29. `reports/PHASE_07_REPORT.md`

---

## 19. Các khoảng trống tồn đọng đã ghi nhận (Deferred Gaps)

- `TEMPORARY_PASSWORD_FLOW_GAP`: Chưa có flow kích hoạt mật khẩu tạm (deferred).
- `TEAM_API_CONTRACT_GAP`: API Team chưa xuất hiện trong Section 12 (deferred).
- `DASHBOARD_AGGREGATED_API_GAP`: API Dashboard tổng hợp (deferred).
- `TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08`: Đính kèm tệp cho task chờ module File / `stored_files` ở Phase 8.

---

## 20. Kết luận

**PHASE_07_PASS_PUSHED**
