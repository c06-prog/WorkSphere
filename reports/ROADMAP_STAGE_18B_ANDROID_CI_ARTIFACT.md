# ROADMAP-STAGE-18B: ANDROID DEBUG BUILD & CI ARTIFACT PACKAGING

## 1. Executive Summary

- **Status**: PASSED
- **Stage**: ROADMAP-STAGE-18B (Android Debug Build & CI Artifact Packaging)
- **Starting Checkpoint**: `c6cc650f6da86ff4274a4e03131c4d38194129e0`
- **Scope**: Tích hợp job `android-debug-build` vào tệp workflow canonical `.github/workflows/ci.yml`, biên dịch tự động bản build `app-debug.apk` trên GitHub-hosted runner, lưu trữ artifact `worksphere-android-debug-apk` (30 ngày), bảo toàn đầy đủ các jobs kiểm tra chất lượng Backend và Mobile, không sử dụng signing secret hoặc release keystore, kiểm chứng local-equivalent và remote GitHub Actions run thực tế.
- **Result Marker**: `ROADMAP_STAGE_18B_ANDROID_ARTIFACT_COMPLETE_READY_FOR_18C`

---

## 2. Android CI Job Architecture ([.github/workflows/ci.yml](file:///d:/WorkSphere/.github/workflows/ci.yml))

Job mới `android-debug-build` được bổ sung trực tiếp vào workflow duy nhất:
```yaml
  android-debug-build:
    name: Android Debug Build (React Native)
    runs-on: ubuntu-latest
    timeout-minutes: 25
    needs:
      - repository-validation
      - mobile-quality
```

- **Thứ tự phụ thuộc (Dependencies)**:
  - Phụ thuộc vào `repository-validation` và `mobile-quality`.
  - Chạy song song với `backend-ci` (Spring Boot), tối ưu hóa thời gian chạy tổng thể của pipeline.
  - Không chạy lại lặp các bước lint, typecheck hay Jest tests vì `mobile-quality` đã đảm nhận gating.
- **Môi trường & Toolchain**:
  - Runner: `ubuntu-latest`.
  - Java: JDK 21 (Temurin).
  - Node.js: Theo file `mobile/.node-version` (v24.19.0) và cache `npm` theo `mobile/package-lock.json`.
  - Android SDK: Sử dụng Android SDK có sẵn trên GitHub-hosted runner (hỗ trợ compileSdk 37, targetSdk 36, NDK 27.1.12297006).
  - Gradle Wrapper: Gradle v9.4.1 (với `chmod +x gradlew`).

---

## 3. Lệnh Build & Artifact Policy

- **Lệnh thực thi**:
  ```bash
  cd mobile/android
  ./gradlew assembleDebug --no-daemon --stacktrace
  ```
- **Xác minh file APK sinh ra**:
  ```bash
  test -f mobile/android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Lưu trữ Artifact (`actions/upload-artifact@v4`)**:
  - Tên artifact: `worksphere-android-debug-apk`
  - Đường dẫn: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
  - Thời gian lưu trữ: 30 ngày.
  - Chính sách lỗi: `if-no-files-found: error` (Thất bại ngay nếu không có file APK).

> [!NOTE]
> **Ranh giới kỹ thuật**:
> Bản build APK được đóng gói là **DEBUG ONLY** (sử dụng Android debug keystore mặc định), phục vụ kiểm thử nội bộ và UAT. Hoàn toàn **KHÔNG PHẢI LÀ BẢN PRODUCTION SIGNED** hay **RELEASE CANDIDATE**. Cấu hình release signing và secret store được bảo lưu cho Stage 18D.

---

## 4. Local-Equivalent Validation Evidence

- **Lệnh thực thi**: `cd mobile/android; .\gradlew.bat assembleDebug --no-daemon`
- **Kết quả biên dịch**: `BUILD SUCCESSFUL in 1m 28s` (203 actionable tasks: 16 executed, 187 up-to-date).
- **Tệp APK sinh ra**: `mobile/android/app/build/outputs/apk/debug/app-debug.apk` (kích thước `157,662,829` bytes).
- **Git Status**: Tệp APK và thư mục `build/` được `.gitignore` bảo vệ tuyệt đối, không bị theo dõi hay commit lên repository.

---

## 5. Security & Supply-Chain Scan

- Quét mã nguồn và git diff: **0 secrets, 0 private keys, 0 keystores rò rỉ**.
- Không tạo hoặc commit bất kỳ file `*.jks`, `*.keystore` hay `key.properties` nào.
- Container `jenkins-lts` và `worksphere-dev-pg` được bảo toàn nguyên vẹn 100%.


---

## 6. Wrapper Jar Tracking & Remote Single-Patch Resolution

- **Root Cause Phân Tích**: GitHub Actions Run #40513111941 thất bại tại step Build Android Debug APK với lỗi:
  Error: Unable to access jarfile /home/runner/work/WorkSphere/WorkSphere/mobile/android/gradle/wrapper/gradle-wrapper.jar
  Nguyên nhân gốc rễ là tệp .gitignore chứa quy tắc bao quát *.jar chặn việc theo dõi gradle-wrapper.jar.
- **Giải Pháp Thực Hiện (Single-Patch)**:
  1. Thêm ngoại lệ chính xác !mobile/android/gradle/wrapper/gradle-wrapper.jar vào .gitignore.
  2. Xác minh tệp cục bộ (mobile/android/gradle/wrapper/gradle-wrapper.jar, 48,966 bytes) và kiểm tra tính toàn vẹn qua ./gradlew.bat --version (Gradle 9.4.1 verified).
  3. Dọn dẹp các lệnh echo chẩn đoán tạm thời trong .github/workflows/ci.yml.
  4. Track mobile/android/gradle/wrapper/gradle-wrapper.jar vào Git và commit 954b84c: ix(ci): include Gradle wrapper jar for Android build.
  5. Push lên origin/main và kích hoạt remote workflow run #40531250648.


---

## 7. Authoritative Remote Verification & Closure Evidence

- **Authoritative Remote Run**:
  - **Run ID**: 40531452855
  - **Run Number**: #188
  - **Commit Checkpoint**: dce8a91ce3be6ae169fa885147c6fc7ab3187e03 (Fix commit: 954b84c)
  - **HTML URL**: https://github.com/c06-prog/WorkSphere/actions/runs/40531452855
  - **Status / Conclusion**: completed / success
- **Lịch sử Runs**:
  - Run #186 (40513111941): Thất bại do thiếu gradle-wrapper.jar (bị ignore bởi *.jar).
  - Run #187 (40531250648): Bị cancel bởi cơ chế concurrency khi commit tài liệu mới dce8a91 được đẩy lên.
  - Run #188 (40531452855): **Thành công 100%** trên toàn bộ jobs.
- **Job Status Breakdown (Run #188)**:
  - Validate Repository & Secret Audit: SUCCESS
  - Backend Quality: SUCCESS
  - Mobile Quality: SUCCESS
  - Android Debug Build: SUCCESS
  - Verify APK Exists: SUCCESS
  - Upload Android Debug APK: SUCCESS
- **Artifact Verification**:
  - worksphere-android-debug-apk: Đã upload thành công, kích thước compressed 51,314,502 bytes (> 0 bytes).
  - ackend-executable-jar: 61,538,77 bytes.
  - ackend-test-reports: 301,664 bytes.
- **Phân định ranh giới phát hành**:
  - Artifact pp-debug.apk là bản **DEBUG ONLY**, phục vụ kiểm thử nội bộ và UAT.
  - Release signing, production keystores và release artifacts được **DEFERRED HOÀN TOÀN SANG STAGE 18D**.
- **Kết luận Cổng Chất Lượng**: **ROADMAP-STAGE-18B ĐÃ ĐÓNG THÀNH CÔNG**.
