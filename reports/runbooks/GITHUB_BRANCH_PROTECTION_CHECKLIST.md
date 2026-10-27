# QUY TRÌNH & TIÊU CHUẨN: BẢO VỆ NHÁNH CHÍNH (BRANCH PROTECTION)
## (GITHUB BRANCH PROTECTION & MERGE GOVERNANCE CHECKLIST)

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Branch:** `main`  
**Classification:** CONFIGURATION_PENDING (Yêu cầu quyền Admin Repository trên GitHub UI/API)  

---

## 1. Danh Mục Các Kiểm Tra Bắt Buộc (Authoritative Required Status Checks)

Để đảm bảo không có mã nguồn lỗi hoặc vi phạm quy chuẩn được hòa nhập vào nhánh `main`, 5 job canonical sau trong `.github/workflows/ci.yml` phải được cấu hình làm **Required Status Checks**:

1. `Validate Repository & Secret Audit`
2. `Backend Quality (Spring Boot)`
3. `Mobile Quality (React Native)`
4. `Android Debug Build (React Native)`
5. `Docker Image Build (Backend)`

---

## 2. Tiêu Chuẩn Thiết Lập Nhánh `main` (Branch Protection Settings)

Cần cấu hình các thuộc tính bảo vệ nhánh tại mục `Settings > Branches > Branch protection rules` cho nhánh `main`:

| Thiết lập | Giá trị Khuyến nghị | Mục đích / Tác động |
| :--- | :--- | :--- |
| **Require a pull request before merging** | **BẬT (Enabled)** | Ngăn chặn commit trực tiếp lên `main`, yêu cầu mọi thay đổi đi qua PR |
| **Require approvals** | **1 approval** | Yêu cầu ít nhất 1 thành viên review và phê duyệt code trước khi merge |
| **Dismiss stale pull request approvals when new commits are pushed** | **BẬT (Enabled)** | Hủy bỏ phê duyệt cũ nếu PR có commit mới được bổ sung |
| **Require status checks to pass before merging** | **BẬT (Enabled)** | Chỉ merge khi 5 checks phía trên đạt trạng thái `success` |
| **Require branches to be up to date before merging** | **BẬT (Enabled)** | Bắt buộc branch feature phải rebase/merge mới nhất từ `main` trước khi hòa nhập |
| **Do not allow bypassing the above settings** | **BẬT (Enabled)** | Ngăn chặn quyền ghi đè (bypass) của tài khoản Quản trị viên (Admin) |
| **Block force pushes** | **BẬT (Enabled)** | Cấm hoàn toàn `git push --force` lên nhánh `main` (Bảo vệ lịch sử Git) |
| **Block deletions** | **BẬT (Enabled)** | Cấm hoàn toàn thao tác xóa nhánh `main` |

---

## 3. Trạng Thái Hiện Tại & Quy Trình Áp Dụng Thủ Công

- **Trạng thái**: Do tác vụ CI và Antigravity Agent hoạt động với quyền truy cập mã nguồn tiêu chuẩn và không có quyền `Administrator` trên GitHub Repository Settings, chính sách này được ghi nhận dưới trạng thái **CONFIGURATION_PENDING**.
- **Hướng dẫn cho Quản trị viên**:
  1. Truy cập: `https://github.com/c06-prog/WorkSphere/settings/branches`.
  2. Bấm **Add branch protection rule** và đặt `Branch name pattern` là `main`.
  3. Tích chọn các mục theo đúng bảng tiêu chuẩn tại Mục 2.
  4. Trong ô tìm kiếm status checks, gõ và chọn đầy đủ 5 job names đã nêu tại Mục 1.
  5. Bấm **Save changes** để kích hoạt bảo vệ.
