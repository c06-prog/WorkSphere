# Báo Cáo Thực Thi Kiểm Thử E2E — Wave 16[X]: [Tên Luồng / Phân Hệ]

**Mã Luồng (Flow ID):** `FLOW-0[X]`  
**Vai Trò Thử Nghiệm (Actor Role):** `[ADMIN / PROJECT_MANAGER / TEAM_LEADER / EMPLOYEE]`  
**Starting Checkpoint Git:** `[Commit SHA]`  
**Ngày Thực Hiện:** YYYY-MM-DD  
**Người / Agent Thực Hiện:** Antigravity  

---

## 1. Trạng Thái Môi Trường & Fixture Sẵn Sàng (Environment & Fixture Readiness)

- **Backend Health:** `http://localhost:8080/actuator/health` $\rightarrow$ `UP`
- **Database Status:** PostgreSQL `worksphere-dev-pg` (Port 5432) active, Flyway migrations `V001`–`V017` áp dụng đầy đủ.
- **Android Runtime:** Serial `emulator-5554`, `sys.boot_completed == 1`, port reverse 8080/8081 verified.
- **Fixture Manifest:**
  - Recipient / Actor ID: `[UUID]`
  - Logical Fixture Marker: `[E2E-PROJ-01 / SR-E2E-2026-001 / E2E-ASSET-001 / ...]`
  - Created / Reused State: `[REUSED / PROVISIONED_NEW]`

---

## 2. Nhật Ký Các Bước Thực Thi Giao Diện & Nghiệp Vụ (Execution Steps)

| Bước | Màn Hình (Screen ID) | Hành Động Người Dùng | Dữ Liệu Đầu Vào (Redacted) | Phản Hồi Mong Đợi | Trạng Thái Thực Tế |
|:---:|:---|:---|:---|:---|:---:|
| 1 | `SCR-AUTH-02` | Nhập tài khoản và nhấn Đăng nhập | `user: e2e_actor`, `pass: [REDACTED]` | Chuyển sang Dashboard Screen | PASS / FAIL |
| 2 | `SCR-DASH-01` | Kiểm tra badge / menu hiển thị | - | Menu và số đếm hiển thị đúng role | PASS / FAIL |
| 3 | `[Screen]` | Thực hiện hành động nghiệp vụ chính | `[Form inputs]` | Dữ liệu lưu thành công, UI cập nhật | PASS / FAIL |
| 4 | `[Screen]` | Thử nghiệm thao tác trái quyền (RBAC Deny) | `[Action]` | Báo lỗi `403` hoặc nút thao tác bị ẩn | PASS / FAIL |
| 5 | `SCR-ACC-04` | Nhấn Đăng xuất và xác nhận | - | Xóa token, quay lại LoginScreen | PASS / FAIL |

---

## 3. Bằng Chứng Kỹ Thuật (Technical Evidence)

### A. API & HTTP Status Codes
```http
POST /api/v1/auth/login -> HTTP 200 OK (JWT issued)
GET /api/v1/users/me -> HTTP 200 OK (Roles: [ACTOR_ROLE])
[Action Endpoint] -> HTTP 200 / 201 Created
[RBAC Deny Endpoint] -> HTTP 403 Forbidden
POST /api/v1/auth/logout -> HTTP 200 OK
```

### B. Trích Đoạn Logcat (Filtered Logcat Extract)
```text
[Timestamp] I/ReactNativeJS: [Auth] Login successful for user role: [ACTOR_ROLE]
[Timestamp] I/ReactNativeJS: [Navigation] Navigating to: [TargetScreen]
[Timestamp] I/ReactNativeJS: [Mutation] Action completed successfully with ID: [UUID]
```

### C. Ảnh Chụp Màn Hình Minh Chứng (Screenshots)
- Màn hình 1 (Đầu luồng): `reports/screenshots/wave16[X]_[flow]_step1.png`
- Màn hình 2 (Điểm mấu chốt): `reports/screenshots/wave16[X]_[flow]_step2.png`
- Màn hình 3 (Hoàn thành luồng): `reports/screenshots/wave16[X]_[flow]_step3.png`

---

## 4. Nhật Ký Khuyết Tật & Lỗi Phát Hiện (Defect Log)

| Mã Khuyết Tật | Mức Độ (P0-P3) | Mô Tả Hiện Tượng | Nguyên Nhân Gốc Rễ | Phương Án Khắc Phục | Trạng Thái |
|:---:|:---:|:---|:---|:---|:---:|
| *Không có* | - | - | - | - | RESOLVED / OPEN |

---

## 5. Thu Dọn Tài Nguyên & Kết Luận (Post-Execution Clean-up & Verdict)

- **Thu dọn tài nguyên:** 
  - Đã đóng app (`am force-stop`), tắt emulator (`emu kill`), dừng Metro và Backend.
  - Ports 8080 và 8081 đã được giải phóng sạch sẽ.
  - Các biến môi trường tạm thời đã được xóa.
- **Trạng thái Git:** Clean.

**KẾT LUẬN CUỐI CÙNG:** `[PASS / FAIL]`  
**SẴN SÀNG CHUYỂN TIẾP WAVE TIẾP THEO:** `[CÓ / KHÔNG]`
