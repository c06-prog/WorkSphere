package com.worksphere.file;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worksphere.file.domain.FilePurpose;
import com.worksphere.file.domain.StoredFile;
import com.worksphere.file.infrastructure.persistence.StoredFileRepository;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import com.worksphere.shared.security.JwtService;
import com.worksphere.task.domain.TaskAttachment;
import com.worksphere.task.infrastructure.persistence.TaskAttachmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class FileMockMvcTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @TempDir
    static Path tempDir;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("worksphere.jwt.secret",
                () -> "worksphere-integration-test-secret-key-at-least-32-chars");
        registry.add("worksphere.jwt.access-token-expiry-seconds", () -> "900");
        registry.add("worksphere.storage.path", () -> tempDir.toAbsolutePath().toString());
    }

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired(required = false)
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StoredFileRepository storedFileRepository;

    @Autowired
    private TaskAttachmentRepository taskAttachmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private UUID adminUserId;
    private UUID uploaderUserId;
    private UUID otherUserId;

    private String adminToken;
    private String uploaderToken;
    private String otherToken;

    // Standard valid file contents
    private static final byte[] VALID_PNG = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01
    };

    private static final byte[] VALID_JPEG = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
            0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    };

    private static final byte[] VALID_PDF = "%PDF-1.4\n%WorkSphere Test PDF content\n%%EOF".getBytes(StandardCharsets.US_ASCII);

    @BeforeEach
    void setUp() {
        if (objectMapper == null) {
            objectMapper = new ObjectMapper().findAndRegisterModules();
        }

        OpenEntityManagerInViewFilter osivFilter = new OpenEntityManagerInViewFilter();
        osivFilter.setServletContext(context.getServletContext());

        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(osivFilter)
                .apply(springSecurity())
                .build();

        // Clean tables
        jdbcTemplate.update("DELETE FROM task_attachments");
        jdbcTemplate.update("DELETE FROM tasks");
        jdbcTemplate.update("DELETE FROM project_members");
        jdbcTemplate.update("DELETE FROM projects");
        jdbcTemplate.update("DELETE FROM departments");
        jdbcTemplate.update("DELETE FROM stored_files");
        jdbcTemplate.update("DELETE FROM user_roles");
        jdbcTemplate.update("DELETE FROM users");

        // Seed users
        adminUserId = UUID.randomUUID();
        insertUser(adminUserId, "admin_file", "admin_file@test.com", passwordEncoder.encode("Password123!"));
        UUID adminRoleId = jdbcTemplate.queryForObject("SELECT id FROM roles WHERE code = 'ADMIN'", UUID.class);
        if (adminRoleId != null) {
            jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, now())",
                    adminUserId, adminRoleId);
        }
        adminToken = jwtService.generateAccessToken(adminUserId, UUID.randomUUID());

        uploaderUserId = UUID.randomUUID();
        insertUser(uploaderUserId, "uploader_file", "uploader_file@test.com", passwordEncoder.encode("Password123!"));
        uploaderToken = jwtService.generateAccessToken(uploaderUserId, UUID.randomUUID());

        otherUserId = UUID.randomUUID();
        insertUser(otherUserId, "other_file", "other_file@test.com", passwordEncoder.encode("Password123!"));
        otherToken = jwtService.generateAccessToken(otherUserId, UUID.randomUUID());
    }

    private void insertUser(UUID id, String username, String email, String passwordHash) {
        jdbcTemplate.update(
                "INSERT INTO users (id, username, email, password_hash, full_name, status, is_deleted, created_at, updated_at, version) "
                        + "VALUES (?, ?, ?, ?, ?, 'ACTIVE', false, now(), now(), 0)",
                id, username, email, passwordHash, username
        );
    }

    @Test
    @DisplayName("Upload file unauthenticated returns 401 Unauthorized")
    void uploadUnauthenticatedShouldReturn401() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", VALID_PNG);

        mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Upload valid PNG file returns 201 Created and persists metadata")
    void uploadValidPngShouldReturn201() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "screenshot.png", "image/png", VALID_PNG);

        MvcResult result = mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT")
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.originalName", is("screenshot.png")))
                .andExpect(jsonPath("$.data.mimeType", is("image/png")))
                .andExpect(jsonPath("$.data.sizeBytes", is(VALID_PNG.length)))
                .andExpect(jsonPath("$.data.downloadUrl", containsString("/download")))
                .andReturn();

        Map<?, ?> resp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        Map<?, ?> data = (Map<?, ?>) resp.get("data");
        UUID fileId = UUID.fromString(data.get("id").toString());

        StoredFile storedFile = storedFileRepository.findById(fileId).orElse(null);
        assertThat(storedFile).isNotNull();
        assertThat(storedFile.getOriginalName()).isEqualTo("screenshot.png");
        assertThat(storedFile.getUploadedBy()).isEqualTo(uploaderUserId);
        assertThat(storedFile.getChecksumSha256()).hasSize(64);
        assertThat(storedFile.getStoragePath()).startsWith("TASK_ATTACHMENT/");
    }

    @Test
    @DisplayName("Upload with path traversal in filename sanitizes original filename")
    void uploadWithFilenameTraversalShouldSanitize() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "../../evil_test.png", "image/png", VALID_PNG);

        mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT")
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.originalName", is("evil_test.png")));
    }

    @Test
    @DisplayName("Upload empty file returns 400 Bad Request with FILE_EMPTY")
    void uploadEmptyFileShouldReturn400() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT")
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("FILE_EMPTY")));
    }

    @Test
    @DisplayName("Upload disallowed extension (.exe) returns 400 Bad Request with FILE_EXTENSION_NOT_ALLOWED")
    void uploadDisallowedExtensionShouldReturn400() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "malicious.exe", "application/octet-stream", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT")
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("FILE_EXTENSION_NOT_ALLOWED")));
    }

    @Test
    @DisplayName("Upload spoofed MIME type returns 415 Unsupported Media Type with FILE_TYPE_NOT_ALLOWED")
    void uploadSpoofedMimeShouldReturn415() throws Exception {
        byte[] fakeJpeg = "This is not a real jpeg file".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile("file", "fake.jpg", "image/jpeg", fakeJpeg);

        mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", "TASK_ATTACHMENT")
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code", is("FILE_TYPE_NOT_ALLOWED")));
    }

    @Test
    @DisplayName("Uploader downloads unlinked file returns 200 OK with correct headers")
    void uploaderDownloadUnlinkedFileShouldReturn200() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "document.pdf", "application/pdf", VALID_PDF, "PROJECT_DOCUMENT");

        mockMvc.perform(get("/api/v1/files/{fileId}/download", fileId)
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Length", String.valueOf(VALID_PDF.length)))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Disposition", containsString("document.pdf")));
    }

    @Test
    @DisplayName("Non-uploader downloading unlinked file returns 403 Forbidden with FILE_ACCESS_DENIED")
    void nonUploaderDownloadUnlinkedFileShouldReturn403() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "private.pdf", "application/pdf", VALID_PDF, "TASK_ATTACHMENT");

        mockMvc.perform(get("/api/v1/files/{fileId}/download", fileId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FILE_ACCESS_DENIED")));
    }

    @Test
    @DisplayName("Admin downloads unlinked file returns 200 OK")
    void adminDownloadUnlinkedFileShouldReturn200() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "private.pdf", "application/pdf", VALID_PDF, "TASK_ATTACHMENT");

        mockMvc.perform(get("/api/v1/files/{fileId}/download", fileId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));
    }

    @Test
    @DisplayName("Downloading non-existent file returns 404 Not Found with FILE_NOT_FOUND")
    void downloadMissingFileShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/files/{fileId}/download", UUID.randomUUID())
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code", is("FILE_NOT_FOUND")));
    }

    @Test
    @DisplayName("Uploader deletes unlinked file returns 200 OK and marks as DELETED")
    void uploaderDeleteUnlinkedFileShouldSucceed() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "to_delete.png", "image/png", VALID_PNG, "TASK_ATTACHMENT");

        mockMvc.perform(delete("/api/v1/files/{fileId}", fileId)
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Attempting to download now should return 404
        mockMvc.perform(get("/api/v1/files/{fileId}/download", fileId)
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code", is("FILE_NOT_FOUND")));
    }

    @Test
    @DisplayName("Non-uploader cannot delete unlinked file returns 403 Forbidden")
    void nonUploaderDeleteUnlinkedFileShouldReturn403() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "not_yours.png", "image/png", VALID_PNG, "TASK_ATTACHMENT");

        mockMvc.perform(delete("/api/v1/files/{fileId}", fileId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FILE_ACCESS_DENIED")));
    }

    @Test
    @DisplayName("Deleting linked file returns 422 Unprocessable Entity with FILE_ALREADY_LINKED")
    void deleteLinkedFileShouldReturn422() throws Exception {
        UUID fileId = uploadTestFile(uploaderToken, "linked.png", "image/png", VALID_PNG, "TASK_ATTACHMENT");

        // Create department, project, task, and link
        UUID deptId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO departments (id, code, name, is_active, is_deleted, created_at, updated_at, version) "
                        + "VALUES (?, 'DEP-LINK', 'Link Dept', true, false, now(), now(), 0)",
                deptId
        );
        UUID projId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO projects (id, code, name, description, manager_id, department_id, status, priority, start_date, planned_end_date, created_by, is_deleted, created_at, updated_at, version) "
                        + "VALUES (?, 'PRJ-LINK', 'Link Proj', 'Desc', ?, ?, 'ACTIVE', 'MEDIUM', now(), now() + interval '30 days', ?, false, now(), now(), 0)",
                projId, uploaderUserId, deptId, uploaderUserId
        );
        UUID taskId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO tasks (id, project_id, title, status, priority, reporter_id, created_by, is_deleted, created_at, updated_at, version) "
                        + "VALUES (?, ?, 'Link Task', 'TODO', 'MEDIUM', ?, ?, false, now(), now(), 0)",
                taskId, projId, uploaderUserId, uploaderUserId
        );

        taskAttachmentRepository.save(TaskAttachment.create(UUID.randomUUID(), taskId, fileId, uploaderUserId));

        mockMvc.perform(delete("/api/v1/files/{fileId}", fileId)
                        .header("Authorization", "Bearer " + uploaderToken))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("FILE_ALREADY_LINKED")));
    }

    private UUID uploadTestFile(String token, String filename, String mimeType, byte[] content, String purpose) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, mimeType, content);

        MvcResult result = mockMvc.perform(multipart("/api/v1/files")
                        .file(file)
                        .param("purpose", purpose)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> resp = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        Map<?, ?> data = (Map<?, ?>) resp.get("data");
        return UUID.fromString(data.get("id").toString());
    }
}
