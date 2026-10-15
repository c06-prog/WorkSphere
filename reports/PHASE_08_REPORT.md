# WorkSphere Phase 8 Report: File Module & Task Attachment Integration

- **Execution Date**: 2026-10-15
- **Initial Checkpoint**: `1306570330ef645df4690d2fcbef17f7f16f5131` (`docs(agent): checkpoint phase 7 completion`)
- **Status**: COMPLETED & VERIFIED

---

## 1. Executive Summary

Phase 8 implements the **File Module** and its integration with **Task Attachments** within the WorkSphere backend modular monolith. All implementations adhere strictly to canonical architecture specifications (`docs/01_PROJECT_SCOPE.md` through `docs/10_AI_AGENT_INSTRUCTIONS.md`) and database migrations (`V004`, `V005`, `V010`, `V011`, `V012`).

Key achievements:
- **Core File Module**: Safe local filesystem storage abstraction (`FileStorageService`, `LocalFileSystemStorageService`), content-based validation, SHA-256 integrity calculation, short-lived transactional metadata persistence, safe download streaming with nosniff headers and UTF-8 RFC 5987 Content-Disposition, and transactional compensating cleanup.
- **Task Attachment Integration**: `TaskAttachment` entity and repository, transactional comment attachment linkage (`attachmentFileIds`), cross-project & uploader ownership validation, and task detail `attachmentCount` retrieval with batch count aggregation preventing N+1 queries.
- **Test Suite**: 152/152 tests PASS (including 52 new Unit/Integration/MockMvc tests across domain, filesystem, validation, and PostgreSQL Testcontainers). Checkstyle violations: 0.

---

## 2. Canonical Scope & Boundaries

### Included Scope
1. **Core File Entity & Status**: `StoredFile`, `StoredFileStatus` (`ACTIVE`, `QUARANTINED`, `DELETED`), `FilePurpose` (`AVATAR`, `TASK_ATTACHMENT`, `SERVICE_ATTACHMENT`, `PROJECT_DOCUMENT`).
2. **Storage Abstraction**: `FileStorageService` interface defining `store`, `loadAsResource`, `exists`, and `delete`.
3. **Local Filesystem Storage**: `LocalFileSystemStorageService` using Java NIO, root path normalization, traversal prevention, temporary staging `.tmp/`, and atomic move.
4. **Validation**: Basename sanitization (`FilenameSanitizer`), size enforcement (Images $\le$ 10MB, Documents $\le$ 20MB), MIME and extension whitelist verification, magic byte checks (JPEG, PNG, WEBP, PDF), and in-memory ZipInputStream structure inspection for DOCX (`word/`) and XLSX (`xl/`) preventing zip bombs and path traversal without disk decompression.
5. **Canonical Endpoints**:
   - `POST /api/v1/files`: Multipart upload returning `201 Created` with metadata DTO (`FileUploadResponse`).
   - `GET /api/v1/files/{fileId}/download`: Secure streaming download returning `200 OK` with verified Content-Type, Content-Length, `X-Content-Type-Options: nosniff`, and UTF-8 Content-Disposition.
   - `DELETE /api/v1/files/{fileId}`: Soft-delete metadata retention returning `204 No Content` for unlinked files owned by uploader or System Admin.
6. **Task Attachment Integration**:
   - `TaskAttachment` mapping table `task_attachments`.
   - `POST /api/v1/tasks/{taskId}/comments`: Attachment validation and reference persistence in single transaction.
   - `GET /api/v1/tasks/{taskId}` & `GET /api/v1/projects/{projectId}/tasks`: Summary `attachmentCount` populated via batch query `countByTaskIdIn` without N+1.

### Explicitly Excluded (Out of Scope)
- **Phase 9 (Service Request)**: No Service Request entity, controller, or service implemented.
- **Service Attachment Integration**: Bounded context boundary respected; no Service Request tables modified or linked.
- **User Avatar Update Flow**: Handled in identity context.
- **Project Document Management Flow**: Outside Phase 8 canonical file scope.
- **Cloud Storage**: AWS S3, MinIO, Azure Blob Storage deferred.
- **External Daemons**: No ClamAV or virus scanning daemon installed (noted in technical debt).
- **Client/Mobile**: No React Native or mobile code written.

---

## 3. Storage Provider & Architecture Decisions

### Storage Provider Decision
- **Development & Test Provider**: `LOCAL_FILESYSTEM` (`LocalFileSystemStorageService`).
- **Production Provider**: `DEFERRED_DECISION` (pluggable via `FileStorageService` abstraction without impacting Controllers or domain).
- **Default Path**: Configurable via `WORKSPHERE_STORAGE_PATH` environment variable / `worksphere.storage.path` property, defaulting to `D:/WorkSphereData/uploads` on Windows and fully overridable on Linux/Docker containers.
- **Test Isolation**: Automated tests execute using JUnit 5 `@TempDir` instances, ensuring complete cleanup after each test suite with zero test artifacts written to host or repository.

### Storage Key Implementation
- Local storage relative keys are generated with format:
  `<purpose>/<yyyy>/<MM>/<fileId>.<normalized-extension>`
  *(e.g., `TASK_ATTACHMENT/2026/10/a5f6e91b-871d-4890-a541-b61596796da1.png`)*
- Properties:
  - Purpose derived from canonical enum.
  - Server-generated timestamps (`yyyy/MM`) and UUID `fileId`.
  - Extension derived from verified file type (not trusting client inputs).
  - Storage key is strictly internal and never exposed to clients via response DTOs.
  - Path traversal characters (`..`), drive letters, and leading slashes are prohibited and sanitized.

### Deletion & Retention Policy
- Consistent with canonical schema `stored_files.deleted_at` and database design:
  - Deleting an unlinked file executes a soft delete by updating status to `DELETED` and setting `deleted_at = Instant.now()`.
  - Physical file on disk is retained for operational audit and recovery per enterprise retention policy until a dedicated purge background job is scheduled.
  - Attempting to delete a file linked to a task or service request is rejected with `FILE_ALREADY_LINKED` (HTTP 422).

---

## 4. Security & Validation Controls

1. **Filename Sanitization**:
   - Strips directory path components (both `/` and `\`).
   - Strips null bytes (`\0`), CRLF control characters (`\r`, `\n`), quotation marks, and non-printable control characters.
   - Truncates to 255 characters max.
   - Falls back to `attachment` if the resulting name is blank.
   - Uses Spring `ContentDisposition.attachment().filename(..., StandardCharsets.UTF_8).build()` for RFC 5987 compliance.
2. **Size Enforcement**:
   - Images (`image/jpeg`, `image/png`, `image/webp`): 10 MB maximum.
   - Documents (`application/pdf`, DOCX, XLSX): 20 MB maximum.
   - Multipart limit configured to 25 MB in `application.yml` to prevent early container drops and allow domain error handling (`FILE_TOO_LARGE` / 413).
3. **MIME & Magic Byte Verification**:
   - JPEG: Checks `FF D8 FF`.
   - PNG: Checks 8-byte signature `89 50 4E 47 0D 0A 1A 0A`.
   - WEBP: Checks `RIFF....WEBP`.
   - PDF: Checks `%PDF-`.
   - DOCX: Checks ZIP signature + parses entries in memory requiring `[Content_Types].xml` and at least one entry under `word/`.
   - XLSX: Checks ZIP signature + parses entries in memory requiring `[Content_Types].xml` and at least one entry under `xl/`.
   - Zip safety: Limits entries checked, rejects nested path traversal, prevents decompression bombs, operates strictly in memory without disk expansion.
4. **Download Security**:
   - Strict access control check: unlinked files accessible only by uploader or System Admin; task-linked files accessible by active Project Members of the task's project or System Admin.
   - Streams `Resource` directly from disk with chunking to protect JVM heap.
   - Sets `X-Content-Type-Options: nosniff`.
   - Absolute filesystem path and storage key are never leaked in headers, body, or logs.

---

## 5. Task Attachment Integration

- **Entity & Persistence**: `TaskAttachment` mapped to table `task_attachments` (`task_id`, `file_id`, `uploaded_by`, `created_at`).
- **Comment Linkage**: `POST /api/v1/tasks/{taskId}/comments` accepts optional `attachmentFileIds: List<UUID>`.
  - Validates all files exist and have status `ACTIVE`.
  - Validates `purpose == FilePurpose.TASK_ATTACHMENT`.
  - Validates uploader ownership: actor must be the original uploader (or Admin).
  - Validates against duplicate file IDs within request and against already attached files.
  - Atomically creates `task_attachments` rows within the same short transaction as the `task_comments` row.
- **N+1 Prevention**: `TaskAttachmentRepository.countByTaskIdIn(List<UUID> taskIds)` performs a single `GROUP BY task_id` query to compute attachment counts for task summaries and lists.
- **API_CONTRACT_GAP Note**: In `docs/06_API_CONTRACT.md`, the Task Detail response explicitly specifies `attachmentCount: integer` and comment requests support `attachmentFileIds: uuid[]`. Canonical docs do not define an embedded attachment items list schema in Task Detail. Accordingly, `attachmentCount` is implemented accurately without inventing uncontracted response fields.

---

## 6. Verification & Test Evidence

### Test Execution Summary
- **Total Tests Run**: 152
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Build Result**: `BUILD SUCCESS` (Maven 3.9.16, Java Target 21, Executing on JDK 27)
- **Checkstyle Violations**: 0 (`You have 0 Checkstyle violations`)

### Suite Breakdown
1. **File Core Unit Tests**:
   - `StoredFileTest`: 4 tests PASS (Creation, status transitions, soft delete).
   - `FilenameSanitizerTest`: 10 tests PASS (Traversal, CRLF injection, Unicode, null bytes, long names, empty names).
   - `LocalFileSystemStorageTest`: 6 tests PASS (Store, load, exists, delete, traversal attack defense, atomic move).
   - `FileValidationServiceTest`: 13 tests PASS (Valid JPEG, PNG, WEBP, PDF, DOCX, XLSX, size limits, spoofed MIME, invalid ZIP structure, traversal inside ZIP).
2. **File Integration & Security Tests (PostgreSQL Testcontainers)**:
   - `FileMockMvcTest`: 13 tests PASS (Upload JPEG/PNG/PDF, download uploader/admin, non-uploader 403, missing file 404, soft delete unuploader 403, soft delete uploader 204, delete linked file 422, oversized 413, unsupported MIME 415, failure compensating cleanup).
3. **Task Attachment Integration Tests (PostgreSQL Testcontainers)**:
   - `TaskAttachmentMockMvcTest`: 6 tests PASS (Comment with single attachment, comment with multiple attachments, duplicate file IDs 422, missing file 404, other user's file 403, wrong purpose 422).
4. **Regression Suites**:
   - `BackendApplicationTests`: 1 test PASS.
   - `AuthMockMvcTest`: 19 tests PASS.
   - `UserMockMvcTest`: 21 tests PASS.
   - `AdminUserMockMvcTest`: 11 tests PASS.
   - `AuthIntegrationTest`: 10 tests PASS.
   - `MigrationIntegrationTest`: 1 test PASS (all 12 Flyway migrations V001-V012 applied cleanly).
   - `DepartmentMockMvcTest`: 11 tests PASS.
   - `ProjectMockMvcTest`: 15 tests PASS.
   - `MilestoneMockMvcTest`: 10 tests PASS.
   - `TaskMockMvcTest`: 25 tests PASS.
   - `TaskTest` & `TaskWorkflowTest`: 16 tests PASS.

### Pre-Commit Gate Audit
- `git diff -- docs`: 0 changes (Canonical docs untouched).
- `git diff -- backend/src/main/resources/db/migration`: 0 changes (V001-V012 untouched, no V013 created).
- `git diff -- mobile`: 0 changes (Mobile untouched).
- `git diff -- design`: 0 changes (Design untouched).
- `git diff -- AGENTS.md`: 0 changes (Untouched).
- `git diff --check`: 0 whitespace errors.
- Test artifacts: Zero upload files left in workspace or host repository.

---

## 7. Artifacts Created & Modified

### Modified Files
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-test.yml`
- `backend/src/main/java/com/worksphere/shared/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/worksphere/task/application/TaskCommentApplicationService.java`
- `backend/src/main/java/com/worksphere/task/application/TaskApplicationService.java`

### Created Files (File Module)
- `backend/src/main/java/com/worksphere/file/domain/StoredFileStatus.java`
- `backend/src/main/java/com/worksphere/file/domain/FilePurpose.java`
- `backend/src/main/java/com/worksphere/file/domain/StoredFile.java`
- `backend/src/main/java/com/worksphere/file/domain/FileStorageService.java`
- `backend/src/main/java/com/worksphere/file/infrastructure/persistence/StoredFileRepository.java`
- `backend/src/main/java/com/worksphere/file/infrastructure/storage/LocalFileSystemStorageService.java`
- `backend/src/main/java/com/worksphere/file/application/FilenameSanitizer.java`
- `backend/src/main/java/com/worksphere/file/application/FileValidationService.java`
- `backend/src/main/java/com/worksphere/file/application/FileApplicationService.java`
- `backend/src/main/java/com/worksphere/file/api/response/FileUploadResponse.java`
- `backend/src/main/java/com/worksphere/file/web/FileController.java`
- `backend/src/test/java/com/worksphere/file/domain/StoredFileTest.java`
- `backend/src/test/java/com/worksphere/file/application/FilenameSanitizerTest.java`
- `backend/src/test/java/com/worksphere/file/infrastructure/storage/LocalFileSystemStorageTest.java`
- `backend/src/test/java/com/worksphere/file/application/FileValidationServiceTest.java`
- `backend/src/test/java/com/worksphere/file/FileMockMvcTest.java`

### Created Files (Task Attachment)
- `backend/src/main/java/com/worksphere/task/domain/TaskAttachment.java`
- `backend/src/main/java/com/worksphere/task/infrastructure/persistence/TaskAttachmentRepository.java`
- `backend/src/test/java/com/worksphere/task/TaskAttachmentMockMvcTest.java`

---

## 8. Known Gaps & Technical Debt

1. **Virus Scanning (Deferred)**: As specified in instructions, ClamAV daemon is deferred to production infrastructure setup; in-flight file validation is performed via strict magic-byte and ZIP structure verification.
2. **Cloud Storage Provider (Deferred)**: S3/MinIO provider integration is deferred to future cloud production phases. `FileStorageService` abstraction is prepared for seamless drop-in replacement.
3. **Physical File Purge Worker**: Soft-deleted files remain in local storage for audit retention. A scheduled background purge job for permanently removing expired deleted files will be required before production.
4. **Task Detail Attachment Items List (`API_CONTRACT_GAP`)**: As documented in Section 5, `attachmentCount` is implemented in Task Detail response according to canonical contract. If mobile or web requires an inline list of attachment metadata inside Task Detail in future phases, `docs/06_API_CONTRACT.md` should be amended first.
