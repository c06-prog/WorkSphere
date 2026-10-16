# Kế Hoạch Tiền Kiểm & Vận Hành Di Trú Dữ Liệu Flyway V013

**Mã tài liệu**: `V013_SERVICE_ASSIGNMENT_UNIQUENESS_PLAN`
**Đối tượng áp dụng**: Kỹ sư vận hành hệ thống (DevOps / SRE / Database Administrator) và Backend Developers Phase 9
**Phạm vi áp dụng**: Mọi môi trường cơ sở dữ liệu PostgreSQL (Dev, Staging, Production) trước và trong khi áp dụng bản di trú `V013__add_service_request_assignment_invariants.sql` trong Phase 9.

---

## A. Bối cảnh & Mục tiêu

Trong thiết kế hệ thống WorkSphere ([02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md) Section 6.3, [05_DATABASE_DESIGN.md](file:///D:/WorkSphere/docs/05_DATABASE_DESIGN.md) Section 9.3, và [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 13.4/13.6):
- Mỗi yêu cầu dịch vụ (Service Request) tại một thời điểm chỉ có tối đa **MỘT** kỹ thuật viên/người xử lý đang hoạt động (`cardinality = 0..1`).
- Nếu chỉ kiểm tra ở tầng Application Service, race condition giữa hai giao dịch đồng thời có thể dẫn đến việc cùng chèn 2 bản ghi `is_active = TRUE` vào bảng `service_assignments`.
- Để ngăn ngừa race condition, cơ sở dữ liệu PostgreSQL bắt buộc phải là hàng rào toàn vẹn cuối cùng.

Bản di trú `V013` (dự kiến triển khai trong Phase 9) sẽ tạo partial unique index:

```sql
CREATE UNIQUE INDEX uk_service_assignments_one_active
ON service_assignments(request_id)
WHERE is_active = TRUE;
```

> [!IMPORTANT]
> **Điểm khác biệt cốt lõi so với V012 (Task Assignment)**:
> - Trong Task Module, công việc cho phép nhiều người cùng thực hiện nên partial unique index là `(task_id, assignee_id) WHERE is_active = TRUE`.
> - Trong Service Request Module, mỗi yêu cầu chỉ có duy nhất 1 người xử lý tại một thời điểm. Nếu đặt index theo cặp `(request_id, assignee_id)` thì hai kỹ thuật viên khác nhau (User A và User B) vẫn có thể cùng active đồng thời trên cùng một request. Do đó, index bắt buộc phải chỉ đặt trên `request_id` với điều kiện `WHERE is_active = TRUE`.

---

## B. Đánh giá rủi ro & Cơ chế an toàn (Fail-Safe)

- **Rủi ro dừng di trú**: Nếu cơ sở dữ liệu đích đã tồn tại bất kỳ `request_id` nào có từ hai bản ghi `is_active = TRUE` trở lên, câu lệnh tạo unique index của PostgreSQL sẽ thất bại ngay lập tức với mã lỗi `23505` (`duplicate key value violates unique constraint`).
- **Cơ chế an toàn (Fail-Safe)**:
  - Bản di trú `V013` tuyệt đối **không** tự động xóa (`DELETE`), không tự động cập nhật (`UPDATE`), và không tự ý tắt (`is_active = false`) các bản ghi phân công hiện hữu.
  - Khi gặp vi phạm trùng lặp, Flyway tự động rollback toàn bộ giao dịch của migration V013. Dữ liệu cơ sở dữ liệu được bảo toàn nguyên vẹn 100%.

---

## C. Truy vấn tiền kiểm chỉ đọc (Read-Only Pre-Flight Query)

Trước khi chạy Flyway migration V013 trên môi trường staging hoặc production, DBA/DevOps **bắt buộc** thực thi truy vấn tiền kiểm sau:

```sql
SELECT
    request_id,
    COUNT(*) AS active_count,
    ARRAY_AGG(id ORDER BY assigned_at, id) AS assignment_ids,
    ARRAY_AGG(assignee_id ORDER BY assigned_at, id) AS assignee_ids
FROM service_assignments
WHERE is_active = TRUE
GROUP BY request_id
HAVING COUNT(*) > 1
ORDER BY active_count DESC, request_id;
```

---

## D. Điều kiện tiếp tục triển khai (Go / No-Go Decision Gate)

- **Kịch bản A (GO - Đủ điều kiện)**:
  - Kết quả preflight trả về **`0` dòng** (`0 rows`).
  - Hệ thống an toàn để áp dụng `V013__add_service_request_assignment_invariants.sql`.
- **Kịch bản B (NO-GO - Dừng triển khai ngay lập tức)**:
  - Kết quả preflight trả về **từ `1` dòng trở lên**.
  - **Hành động bắt buộc**:
    1. Dừng ngay tiến trình deployment/migration.
    2. Xuất danh sách `request_id`, `assignment_ids`, `assignee_ids` gửi cho người có thẩm quyền nghiệp vụ (Business Owner / Lead).
    3. Tuyệt đối không tự ý quyết định giữ lại assignee nào.
    4. Chỉ thực hiện điều chỉnh dữ liệu bằng script có chữ ký phê duyệt của Business Owner trước khi chạy lại preflight.

---

## E. Giao thức Reassignment tại tầng Application Service

Để bảo đảm không gây xung đột với partial unique index khi chuyển giao người xử lý:

1. **Khóa transaction**: Lock bản ghi `ServiceRequest` hoặc active assignment bằng transaction phù hợp (`@Transactional`).
2. **Kiểm tra idempotent**: Nếu `newAssigneeId` trùng với active assignee hiện tại, trả về kết quả hiện tại mà không tạo thêm bản ghi.
3. **Deactivate phân công cũ**:
   - `oldAssignment.setActive(false);`
   - `oldAssignment.setUnassignedAt(serverClock.instant());`
   - Gọi `saveAndFlush(oldAssignment);` để cập nhật trạng thái xuống DB và giải phóng slot active trong partial index.
4. **Tạo phân công mới**:
   - Khởi tạo `ServiceAssignment` mới với `is_active = true`, `assigned_at = serverClock.instant()`, `assigned_by = principal.userId()`.
   - Lưu qua repository: `saveAndFlush(newAssignment);`.
5. **Ủy thác xử lý lỗi**: Bắt cụ thể `DataIntegrityViolationException`, kiểm tra SQLState `23505` và tên constraint `uk_service_assignments_one_active`.

---

## F. Ghi nhận khoảng trống mã lỗi (Error Code Gap)

- Tài liệu [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 13.6 và 20.6 hiện chưa định nghĩa mã lỗi nghiệp vụ chuẩn cho trường hợp tranh chấp phân công đồng thời (như `SERVICE_ALREADY_ASSIGNED` hoặc `SERVICE_ASSIGNMENT_CONFLICT`).
- Ghi nhận: **`SERVICE_ASSIGNMENT_ERROR_CODE_GAP`**.
- Đề xuất bổ sung vào API Contract trong đợt cập nhật tài liệu tiếp theo để thống nhất mã lỗi trả về (HTTP 409 Conflict).
