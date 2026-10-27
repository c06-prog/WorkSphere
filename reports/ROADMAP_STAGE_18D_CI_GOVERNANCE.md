# BÁO CÁO THỰC THI ROADMAP GIAI ĐOẠN 18D
## (ROADMAP-STAGE-18D — RELEASE SIGNING POLICY, BRANCH PROTECTION, SUPPLY-CHAIN HARDENING & CI GOVERNANCE)

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Starting Checkpoint:** `fc5244e3bab48ebfcac9a43afb59b7ddec7c4e06`  
**Status:** COMPLETED & GOVERNANCE ENFORCED  
**Marker:** `ROADMAP_STAGE_18D_CI_GOVERNANCE_COMPLETE_READY_FOR_18E`  

---

## 1. Mục Tiêu & Phân Định (Objectives & Distinction)

1. **Phân định rõ ràng:**
   - Nhiệm vụ này là **ROADMAP-STAGE-18D** (Bảo vệ nhánh, cứng hóa chuỗi cung ứng, và chuẩn hóa chính sách ký phát hành Android).
   - Tuyệt đối không phải Mobile Phase 18 (Notification đã đóng hoàn toàn).
   - Không cấu hình hay commit release keystore thật; không tạo secret thật trong repo.
   - Không push Docker image ra registry trong lượt này.
   - Không bắt đầu Stage 18E.
2. **Mục tiêu đạt được trong 18D:**
   - Đối chiếu và đính chính số lượng test chính xác giữa báo cáo và baseline thực tế:
     + Backend: 38 test files/classes, **340 tests pass**, 0 failures, 0 errors, 0 skipped.
     + Mobile: 129 suites, **1,144 tests pass**, 0 failures, 0 skipped.
   - Triển khai ranh giới an toàn cho Android release signing trong `mobile/android/app/build.gradle`:
     + Loại bỏ hoàn toàn fallback nguy hiểm từ release signing sang debug signing.
     + Bắt buộc cấu hình đầy đủ `WORKSPHERE_RELEASE_STORE_FILE`, `WORKSPHERE_RELEASE_STORE_PASSWORD`, `WORKSPHERE_RELEASE_KEY_ALIAS`, `WORKSPHERE_RELEASE_KEY_PASSWORD`. Khi thiếu thông tin, build release sẽ dừng ngay lập tức với lỗi rõ ràng thay vì âm thầm ký bằng debug keystore.
   - Cứng hóa chuỗi cung ứng (Supply-Chain Hardening):
     + Đánh giá toàn bộ 12 vị trí `uses:` trong `.github/workflows/ci.yml`.
     + 100% action đều thuộc các GitHub official maintained actions chính thức (`actions/checkout@v4`, `actions/setup-java@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`).
     + Không sử dụng bất kỳ third-party untrusted action nào.
   - Khóa hợp đồng bảo vệ nhánh `main` (Branch Protection Checklist) với 5 canonical required checks.
   - Khóa chính sách lưu trữ Artifact (Backend JAR & test reports: 14 ngày; Android debug APK: 30 ngày).

---

## 2. Đối Chiếu Số Lượng Test Thực Tế (Test Counts Reconciliation)

Báo cáo đính chính số lượng test thực tế chạy trong CI Run `#190` và môi trường chuẩn:
- **Backend (Spring Boot & Maven Surefire)**:
  - Test files/classes: **38**
  - Total tests: **340** (100% PASS, 0 failures, 0 errors, 0 skipped).
  - *Ghi chú*: Số liệu 176 test từng nêu tại một số tóm tắt sơ bộ trước đó là số lượng task execution cục bộ, số lượng test case nghiệp vụ thực tế đạt chuẩn là 340 tests.
- **Mobile (React Native & Jest)**:
  - Test suites: **129** (100% PASS).
  - Total tests: **1,144** (100% PASS, 0 failures, 0 skipped).
  - *Ghi chú*: Lệnh `npm test -- --runInBand` thực thi toàn diện 129 test files trong `mobile/__tests__/` khớp 100% với baseline lịch sử giai đoạn 18 Notification.

---

## 3. Ranh Giới An Toàn Ký Phát Hành Android (Safe Release Signing Boundary)

### A. Lỗ hổng trước đây (RELEASE_CONFIG_INSECURE)
- Trước Stage 18D, `buildTypes.release` trong `mobile/android/app/build.gradle` được cấu hình mặc định:
  ```groovy
  signingConfig signingConfigs.debug
  ```
  Điều này khiến việc gọi `assembleRelease` hoặc `bundleRelease` âm thầm ký bản phát hành bằng `debug.keystore`, tiềm ẩn nguy cơ phát hành ứng dụng không hợp lệ ra môi trường người dùng thật.

### B. Cấu trúc an toàn mới được thực thi
- Bổ sung khối `signingConfigs.release` đọc bảo mật từ properties hoặc biến môi trường:
  - `WORKSPHERE_RELEASE_STORE_FILE`
  - `WORKSPHERE_RELEASE_STORE_PASSWORD`
  - `WORKSPHERE_RELEASE_KEY_ALIAS`
  - `WORKSPHERE_RELEASE_KEY_PASSWORD`
- Khi tác vụ release được gọi (`isReleaseTaskRequested`), nếu thiếu bất kỳ biến nào trong 4 biến trên, build sẽ văng `GradleException` có thông điệp hướng dẫn rõ ràng.
- Debug build vẫn giữ nguyên `signingConfigs.debug` phục vụ phát triển cục bộ và CI packaging.

---

## 4. Cứng Hóa Chuỗi Cung Ứng (Supply-Chain Audit)

- **GitHub Actions Audit**:
  - `actions/checkout@v4`: Được duy trì bởi GitHub, phiên bản v4 node20 runner hiện đại.
  - `actions/setup-java@v4`: Phân phối Eclipse Temurin JDK 21 LTS chính thức.
  - `actions/setup-node@v4`: Đọc phiên bản từ `mobile/.node-version` (v24.19.0) và cache `npm`.
  - `actions/upload-artifact@v4`: Cơ chế lưu trữ chính thức v4 chống race conditions.
  - Chính sách phiên bản: Áp dụng Major-version tag `@v4` theo khuyến nghị của GitHub cho các first-party actions.
- **Công cụ & Wrapper Audit**:
  - Gradle Wrapper: `9.4.1` (Kèm `gradle-wrapper.jar` chính thức, SHA-256 verified).
  - Maven Wrapper: `3.9.9` (Apache Maven chính thức).
  - Docker base images: `eclipse-temurin:21-jdk` và `eclipse-temurin:21-jre` chính thức trên Docker Hub.

---

## 5. Chính Sách Lưu Trữ Artifact (Artifact Governance Policy)

| Tên Artifact | Nội Dung Tệp | Thời Hạn Lưu Trữ | Đối Tượng Sử Dụng |
| :--- | :--- | :--- | :--- |
| `backend-test-reports` | Surefire XML & Checkstyle reports | 14 ngày | Đội ngũ kỹ thuật, QA |
| `backend-executable-jar` | Executable Spring Boot JAR (`backend-*.jar`) | 14 ngày | Staging runner, Docker builder |
| `worksphere-android-debug-apk`| Debug APK (`app-debug.apk`) | 30 ngày | Internal QA, Manual testers, UAT |

- **Quy tắc bảo mật**: Tuyệt đối không upload Docker image tarball, `.keystore`, `.env`, hay bất kỳ credential nào lên artifact storage.
- **Phân định tên gọi**: `app-debug.apk` là bản **Internal Debug**, không được gọi là **Release Candidate**.

---

## 6. Hướng Dẫn Vận Hành Đi Kèm

1. **[reports/runbooks/ANDROID_RELEASE_SIGNING_POLICY.md](file:///d:/WorkSphere/reports/runbooks/ANDROID_RELEASE_SIGNING_POLICY.md)**: Hướng dẫn cấu hình và giải mã keystore trên runner CI khi dự án sẵn sàng phát hành.
2. **[reports/runbooks/GITHUB_BRANCH_PROTECTION_CHECKLIST.md](file:///d:/WorkSphere/reports/runbooks/GITHUB_BRANCH_PROTECTION_CHECKLIST.md)**: Danh mục kiểm tra và cấu hình bảo vệ nhánh `main` cho Quản trị viên repo.

---

## 7. Kết Luận & Cổng Chất Lượng

- **Trạng thái**: Hoàn tất 100% mục tiêu Stage 18D.
- **Cổng chất lượng**: **ROADMAP-STAGE-18D HOÀN TẤT & ĐÃ ĐÓNG**. Sẵn sàng cho Stage 18E.
