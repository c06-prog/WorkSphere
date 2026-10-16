# Kế Hoạch Tiền Kiểm & Vận Hành Di Trú Dữ Liệu Flyway V017

**Mã tài liệu**: `V017_NOTIFICATION_IDEMPOTENCY_PLAN`  
**Đối tượng áp dụng**: Kỹ sư vận hành hệ thống (DevOps / SRE / Database Administrator) và Backend Developers Phase 11  
**Phạm vi áp dụng**: Mọi môi trường cơ sở dữ liệu PostgreSQL (Dev, Staging, Production) trước và trong khi áp dụng bản di trú `V017__add_notification_idempotency_and_query_indexes.sql` trong Phase 11.  

---

## A. Bối cảnh & Mục tiêu

Trong kiến trúc hệ thống WorkSphere ([02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md) Section 8, [05_DATABASE_DESIGN.md](file:///D:/WorkSphere/docs/05_DATABASE_DESIGN.md) Section 11, và [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 15):

1. **Bất biến lũy đẳng thông báo (Notification Idempotency Invariant)**:
   - Một sự kiện nghiệp vụ (Business Event) chỉ được phép tạo tối đa **MỘT** thông báo cho mỗi người nhận (Recipient).
   - Nếu client retry do timeout mạng hoặc người dùng nhấn lặp lại, thao tác tạo thông báo không được phép ghi đúp dữ liệu.
   - Cơ sở dữ liệu PostgreSQL là hàng rào toàn vẹn cuối cùng thông qua ràng buộc duy nhất trên cặp `(recipient_id, event_key)`:
     ```sql
     CREATE UNIQUE INDEX uk_notifications_recipient_event
     ON notifications(recipient_id, event_key);
     ```
2. **Chỉ mục tăng tốc phân trang sắp xếp mới nhất (Query Performance Index)**:
   - Truy vấn danh sách thông báo `GET /notifications` yêu cầu sắp xếp mặc định theo thời gian giảm dần (`sort=createdAt,desc`) và Dashboard Top 5 `recentNotifications`.
   - Để tránh Filesort khi bảng `notifications` đạt khối lượng lớn, cần bổ sung composite index:
     ```sql
     CREATE INDEX idx_notifications_recipient_created_at
     ON notifications(recipient_id, created_at DESC);
     ```
3. **Đánh giá chỉ mục hiện hữu**:
   - `idx_notifications_recipient_id`: Giữ nguyên để phục vụ các truy vấn lọc đơn giản theo recipient.
   - `idx_notifications_recipient_read`: Giữ nguyên để tăng tốc đếm `unread-count` (`WHERE recipient_id = :userId AND is_read = false`).
   - `idx_notifications_created_at`: Giữ nguyên để phục vụ truy vấn theo mốc thời gian hệ thống.
   - Tuyệt đối không drop bất kỳ index cũ nào trong MVP khi chưa đo đạc Execution Plan thực tế.

---

## B. Đánh giá rủi ro & Chính sách Backfill an toàn (Fail-Safe)

1. **Rủi ro khi thêm cột `NOT NULL`**:
   - Nếu bảng `notifications` đã có dữ liệu hiện hữu, câu lệnh `ALTER TABLE notifications ADD COLUMN event_key VARCHAR(255) NOT NULL;` sẽ lập tức thất bại nếu không có default hoặc backfill.
2. **Quy trình di trú an toàn nhiều bước (Multi-Step Safe Migration)**:
   - **Bước 1**: Thêm cột `event_key VARCHAR(255) NULL` (cho phép NULL ban đầu).
   - **Bước 2**: Thực hiện backfill xác định (deterministic backfill) cho các dòng dữ liệu cũ nếu có:
     ```sql
     UPDATE notifications
     SET event_key = 'LEGACY_MIGRATION:' || id::text
     WHERE event_key IS NULL;
     ```
   - **Bước 3**: Ép buộc ràng buộc `NOT NULL`:
     ```sql
     ALTER TABLE notifications ALTER COLUMN event_key SET NOT NULL;
     ```
   - **Bước 4**: Tạo Unique Index `uk_notifications_recipient_event`.
   - **Bước 5**: Tạo Composite Index `idx_notifications_recipient_created_at`.
3. **Cơ chế rollback an toàn của Flyway**:
   - Toàn bộ script migration V017 được thực thi trong một transaction duy nhất. Nếu có lỗi, transaction tự động rollback, bảo đảm dữ liệu hiện tại nguyên vẹn.

---

## C. Truy vấn tiền kiểm chỉ đọc (Read-Only Pre-Flight Queries)

Trước khi chạy Flyway migration V017, DBA/DevOps bắt buộc thực thi các truy vấn sau:

### 1. Tiền kiểm số lượng bản ghi hiện hữu:
```sql
SELECT COUNT(*) AS total_notifications FROM notifications;
```
*(Nếu kết quả = 0: Môi trường hoàn toàn sạch, việc áp dụng migration diễn ra tức thì).*

### 2. Tiền kiểm dữ liệu trùng lặp nếu bảng đã có cột `event_key`:
```sql
SELECT
    recipient_id,
    event_key,
    COUNT(*) AS duplicate_count
FROM notifications
WHERE event_key IS NOT NULL
GROUP BY recipient_id, event_key
HAVING COUNT(*) > 1;
```
*(Nếu có bất kỳ dòng nào trả về: Dừng di trú ngay lập tức - NO-GO).*

### 3. Tiền kiểm trạng thái chỉ mục hiện hữu:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notifications';
```

---

## D. Kịch bản di trú dự kiến (`V017__add_notification_idempotency_and_query_indexes.sql`)

*(Kịch bản này sẽ được tạo thành file migration chính thức trong Phase 11 implementation task)*:

```sql
-- Step 1: Add nullable event_key column
ALTER TABLE notifications
ADD COLUMN event_key VARCHAR(255);

-- Step 2: Backfill existing rows with deterministic legacy keys
UPDATE notifications
SET event_key = 'LEGACY_MIGRATION:' || id::text
WHERE event_key IS NULL;

-- Step 3: Enforce NOT NULL constraint
ALTER TABLE notifications
ALTER COLUMN event_key SET NOT NULL;

-- Step 4: Create Unique Index for Idempotency
CREATE UNIQUE INDEX uk_notifications_recipient_event
ON notifications(recipient_id, event_key);

-- Step 5: Create Composite Index for Paginated Query Performance
CREATE INDEX idx_notifications_recipient_created_at
ON notifications(recipient_id, created_at DESC);
```

---

## E. Tiêu chuẩn nghiệm thu & Quyết định triển khai (Go / No-Go)

- **GO**:
  1. Tiền kiểm xác nhận không có trùng lặp `(recipient_id, event_key)`.
  2. Bảng `notifications` áp dụng thành công V017 trong transaction của Flyway.
  3. `uk_notifications_recipient_event` và `idx_notifications_recipient_created_at` hiển thị đầy đủ trong `pg_indexes`.
  4. Test suite backend vượt qua 100%.
- **NO-GO**:
  1. Tiền kiểm phát hiện trùng lặp dữ liệu không thể backfill tự động.
  2. Giao dịch migration thất bại và rollback.
  3. Khi gặp tình trạng NO-GO, giữ nguyên hiện trạng CSDL và báo cáo ngay cho Tech Lead.
