# HƯỚNG DẪN VẬN HÀNH: CHÍNH SÁCH KÝ PHÁT HÀNH ANDROID
## (ANDROID RELEASE SIGNING & PACKAGING POLICY RUNBOOK)

**Document Version:** 1.0  
**Date:** 2026-10-27  
**Module:** Mobile Android (`mobile/android`)  
**Status:** CANONICAL GOVERNANCE ENFORCED  

---

## 1. Ranh Giới Kỹ Thuật Giữa Debug & Release

1. **Bản Debug (`app-debug.apk`)**:
   - Được xây dựng tự động trong CI pipeline cho mọi commit và pull request trên nhánh `main`.
   - Sử dụng Android debug keystore mặc định (`mobile/android/app/debug.keystore`).
   - Phục vụ kiểm thử nội bộ, manual QA và UAT.
   - **Tuyệt đối không sử dụng làm Release Candidate hay tải lên Google Play Console / MDM doanh nghiệp**.
2. **Bản Release (`app-release.apk` / `app-release.aab`)**:
   - Chỉ được kích hoạt thủ công (`workflow_dispatch`) hoặc thông qua tag phiên bản được bảo vệ (`refs/tags/v*`).
   - Yêu cầu bắt buộc phải có chứng chỉ ký bảo mật phát hành (Production Release Keystore).
   - **Bảo mật tuyệt đối**: Cấm hoàn toàn hành vi fallback sang debug keystore khi cấu hình release bị thiếu. Khi thiếu cấu hình, tác vụ `assembleRelease` hoặc `bundleRelease` phải thất bại ngay lập tức (`GradleException`).

---

## 2. Hợp Đồng Biến Môi Trường Ký Phát Hành

Hệ thống build Gradle của WorkSphere (`mobile/android/app/build.gradle`) đọc thông tin chứng chỉ qua Gradle properties hoặc biến môi trường hệ thống:

| Tên Biến | Ý Nghĩa / Mục Đích | Định Dạng Hợp Lệ |
| :--- | :--- | :--- |
| `WORKSPHERE_RELEASE_STORE_FILE` | Đường dẫn tới tệp keystore ký phát hành | File path trên máy host hoặc runner tạm thời |
| `WORKSPHERE_RELEASE_STORE_PASSWORD` | Mật khẩu bảo vệ kho khóa (Keystore password) | Chuỗi ký tự bảo mật |
| `WORKSPHERE_RELEASE_KEY_ALIAS` | Tên định danh bí danh khóa (Key alias) | Tên alias đã khai báo khi sinh keystore |
| `WORKSPHERE_RELEASE_KEY_PASSWORD` | Mật khẩu bảo vệ bí danh khóa (Key password) | Chuỗi ký tự bảo mật |
| `WORKSPHERE_API_BASE_URL` | Địa chỉ backend API sản xuất | Bắt buộc giao thức `https://` và kết thúc với `/api/v1` |

---

## 3. Quy Trình Quản Lý & Tái Tạo Bí Mật Trên GitHub Actions (GitHub Secrets)

Để hỗ trợ phát hành tự động trong tương lai (Stage 18E hoặc Release Workflow riêng biệt), các secret sau cần được cấu hình trong **GitHub Repository Secrets**:

- `ANDROID_RELEASE_KEYSTORE_BASE64`: Nội dung tệp `.jks` hoặc `.keystore` được mã hóa Base64 (`base64 -w 0 release.keystore`).
- `ANDROID_RELEASE_STORE_PASSWORD`: Mật khẩu kho khóa.
- `ANDROID_RELEASE_KEY_ALIAS`: Bí danh khóa phát hành.
- `ANDROID_RELEASE_KEY_PASSWORD`: Mật khẩu bí danh khóa.
- `PROD_API_BASE_URL`: Địa chỉ API production chuẩn HTTPS (ví dụ: `https://api.worksphere.io/api/v1`).

### Quy Trình Tái Tạo An Toàn Trên Runner Tạm:
```yaml
- name: Decode Release Keystore
  run: |
    echo "${{ secrets.ANDROID_RELEASE_KEYSTORE_BASE64 }}" | base64 --decode > /tmp/worksphere-release.keystore
    chmod 600 /tmp/worksphere-release.keystore

- name: Build Signed Android Release APK/AAB
  working-directory: mobile/android
  env:
    WORKSPHERE_RELEASE_STORE_FILE: /tmp/worksphere-release.keystore
    WORKSPHERE_RELEASE_STORE_PASSWORD: ${{ secrets.ANDROID_RELEASE_STORE_PASSWORD }}
    WORKSPHERE_RELEASE_KEY_ALIAS: ${{ secrets.ANDROID_RELEASE_KEY_ALIAS }}
    WORKSPHERE_RELEASE_KEY_PASSWORD: ${{ secrets.ANDROID_RELEASE_KEY_PASSWORD }}
    WORKSPHERE_API_BASE_URL: ${{ secrets.PROD_API_BASE_URL }}
  run: ./gradlew assembleRelease --no-daemon

- name: Secure Cleanup Keystore
  if: always()
  run: rm -f /tmp/worksphere-release.keystore
```

---

## 4. Danh Mục Điều Cấm (Security Non-Negotiables)

1. **Tuyệt đối cấm commit**: Tệp `.keystore`, `.jks`, `.p12`, `key.properties`, mật khẩu kho khóa, hoặc Base64 keystore vào Git repository.
2. **Tuyệt đối cấm in (echo/print)**: Mật khẩu hoặc token bí mật ra console output hay log của CI runner.
3. **Tuyệt đối cấm upload**: Tệp keystore lên GitHub Actions artifacts.
4. **Không chạy tự động**: Tác vụ build release không chạy tự động trên push thông thường khi chưa có sự kiểm soát thủ công hoặc tag phát hành.
