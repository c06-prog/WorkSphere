# ROADMAP-STAGE-18A: GITHUB ACTIONS CI FOUNDATION & BACKEND QUALITY GATES

## 1. Executive Summary

- **Status**: PASSED
- **Stage**: ROADMAP-STAGE-18A (GitHub Actions CI Foundation & Backend Quality Gates)
- **Starting Checkpoint**: `6c930043b90986c614beb786d9a2dba058ddda9c`
- **Scope**: Tái sử dụng và nâng cấp workflow canonical duy nhất `.github/workflows/ci.yml`, khóa GitHub Actions làm nền tảng CI chính thức của dự án, thiết lập permissions tối thiểu (`contents: read`), nhóm concurrency hủy run trùng lặp, hoàn thiện đầy đủ Backend quality gate (Checkstyle 0 violations, full 340 tests PASS qua Testcontainers, packaging executable JAR), lưu trữ test reports và JAR artifacts (14 ngày), giữ nguyên toàn bộ Mobile quality gates, chạy local-equivalent validation thành công.
- **Result Marker**: `ROADMAP_STAGE_18A_CI_FOUNDATION_COMPLETE_READY_FOR_18B`

---

## 2. Platform Decision & Workflow Reuse Analysis

- **Canonical CI Platform**: GitHub Actions (theo `docs/04_SYSTEM_ARCHITECTURE.md` và `docs/08_DEVELOPMENT_ROADMAP.md`).
- **Tập trung hóa Workflow**: Chỉ cập nhật duy nhất tệp [`.github/workflows/ci.yml`](file:///d:/WorkSphere/.github/workflows/ci.yml). Tuyệt đối không tạo workflow phân mảnh (như `backend-ci.yml`, `mobile-ci.yml`, `build.yml`).
- **Phân loại Job / Step**:
  - `validate-repository` $\rightarrow$ Đổi tên chuẩn hóa thành `repository-validation`: **KEEP & UPDATE** (Thêm timeout 5 phút, giữ kiểm tra 10 tài liệu canonical và quét secret thô).
  - `backend-ci-skeleton` $\rightarrow$ Nâng cấp thành `backend-ci`: **UPDATE & EXPAND** (Bổ sung Checkstyle, full tests, packaging, upload test reports và JAR).
  - `mobile-ci` $\rightarrow$ Đổi tên chuẩn hóa thành `mobile-quality`: **KEEP & UPDATE** (Giữ nguyên `npm ci`, `lint`, `typecheck`, `test`, thêm timeout 15 phút).
  - Android APK build & packaging: **DEFER_18B**.
  - Docker Image build & tag versioning: **DEFER_18C**.
  - Release signing & credentials: **DEFER_18D**.

---

## 3. Workflow Specifications & Contract

```yaml
name: WorkSphere CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- **Triggers**: Lắng nghe `push` và `pull_request` trên nhánh chính `main`, hỗ trợ `workflow_dispatch` kích hoạt thủ công.
- **Permissions**: Tối thiểu an toàn tuyệt đối (`contents: read`), không cấp quyền ghi (write) cho runner.
- **Concurrency**: Hủy run đang chạy khi có commit mới trên cùng PR/nhánh.
- **Timeouts**:
  - `repository-validation`: 5 phút.
  - `backend-ci`: 20 phút (đủ thời lượng kéo image Testcontainers PostgreSQL và chạy 340 tests).
  - `mobile-quality`: 15 phút (đủ cho 1144 tests Jest).

---

## 4. Backend Quality Gate & Artifacts

### 4.1 Chi Tiết Các Bước Triển Khai Trong `backend-ci`
1. **Checkout Code**: `actions/checkout@v4`.
2. **Setup JDK 21**: `actions/setup-java@v4` (distribution `temurin`, bật Maven cache theo `backend/pom.xml`).
3. **Chmod Wrapper**: `chmod +x mvnw`.
4. **Checkstyle Gate**:
   ```bash
   ./mvnw checkstyle:check -Dcheckstyle.config.location=checkstyle.xml -B
   ```
5. **Full Tests (Unit & Testcontainers)**:
   ```bash
   ./mvnw clean test -B
   ```
6. **Package Executable JAR**:
   ```bash
   ./mvnw package -DskipTests -B
   ```
7. **Upload Surefire Test Reports**:
   - Action: `actions/upload-artifact@v4` (điều kiện `if: always()`).
   - Tên: `backend-test-reports`.
   - Đường dẫn: `backend/target/surefire-reports/**`.
   - Lưu trữ: 14 ngày.
8. **Upload Executable JAR**:
   - Action: `actions/upload-artifact@v4`.
   - Tên: `backend-executable-jar`.
   - Đường dẫn: `backend/target/backend-*.jar`.
   - Lưu trữ: 14 ngày.

### 4.2 Local-Equivalent Validation Evidence
- **Checkstyle**:
  - Lệnh: `.\mvnw.cmd "checkstyle:check" "-Dcheckstyle.config.location=checkstyle.xml" -B`
  - Kết quả: `You have 0 Checkstyle violations.` (BUILD SUCCESS, exit code 0).
- **Backend Tests**:
  - Lệnh: `.\mvnw.cmd clean test -B`
  - Kết quả: **Tests run: 340, Failures: 0, Errors: 0, Skipped: 0** (BUILD SUCCESS, exit code 0, thời gian 5m 49s).
  - Testcontainers tự động spin-up PostgreSQL container cục bộ hoàn tất mà không cần cấu hình external database.
- **Backend Package**:
  - Lệnh: `.\mvnw.cmd package -DskipTests -B`
  - Kết quả: Tạo thành công `backend/target/backend-0.0.1-SNAPSHOT.jar` (kích thước `68,285,414` bytes).
  - Tệp `.jar` và thư mục `backend/target` được `.gitignore` bảo vệ, không bị commit vào Git.

---

## 5. Mobile Quality Gates Retained

Toàn bộ các bước kiểm tra chất lượng Mobile được bảo toàn nguyên vẹn:
- Node.js setup qua `actions/setup-node@v4` theo tệp `mobile/.node-version` (v24.19.0) và cache `npm` theo `mobile/package-lock.json`.
- `npm ci`: Cài đặt dependencies sạch.
- `npm run lint`: Kiểm tra tĩnh ESLint.
- `npm run typecheck`: Kiểm tra TypeScript compile (`tsc --noEmit`).
- `npm test -- --runInBand`: Chạy 1144 Jest unit/integration tests.
*(Mobile commands và test suite không thay đổi trong 18A; kế thừa baseline 129 suites / 1144 tests PASS từ Phase 16F)*.

---

## 7. Remote GitHub Actions CI Verification

Push commit `0d920818a16a43f10ab38554a781613e56070951` đã kích hoạt workflow thực tế trên GitHub Actions:
- **Run ID**: `40505688772`
- **Run URL**: [https://github.com/c06-prog/WorkSphere/actions/runs/40505688772](https://github.com/c06-prog/WorkSphere/actions/runs/40505688772)
- **Trạng thái**: `completed` | **Kết luận**: **`success`** (Xanh 100%)

Chi tiết các Jobs trên GitHub Actions:
| Tên Job | Trạng thái | Kết quả | Thời gian / Ghi chú |
| :--- | :--- | :--- | :--- |
| **Validate Repository & Secret Audit** | `completed` | **`success`** | Kiểm tra 10 tài liệu canonical và quét tệp bí mật PASS |
| **Backend Quality (Spring Boot)** | `completed` | **`success`** | Checkstyle 0 violations, 340 tests PASS qua Testcontainers, package JAR thành công |
| **Mobile Quality (React Native)** | `completed` | **`success`** | `npm ci`, ESLint, TypeScript `typecheck`, 1144 Jest tests PASS |

Chi tiết Artifacts sinh ra từ Run:
| Tên Artifact | Kích thước (bytes) | Expired | Mục đích |
| :--- | :--- | :--- | :--- |
| `backend-executable-jar` | 61,538,355 bytes | `False` | Fat JAR Spring Boot sẵn sàng cho containerization |
| `backend-test-reports` | 292,801 bytes | `False` | Surefire XML reports lưu trữ bằng chứng kiểm thử |

