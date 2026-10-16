package com.worksphere.identity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worksphere.identity.api.request.LoginRequest;
import com.worksphere.identity.infrastructure.persistence.LoginSessionRepository;
import com.worksphere.identity.infrastructure.persistence.RefreshTokenRepository;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Clean integration tests validating V013 and V014 migrations and canonical role permissions.
 * Tests run against clean PostgreSQL Testcontainers.
 * Absolutely NO manual insertion into role_permissions in this test.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Import(RolePermissionSeedIntegrationTest.TestSecurityEndpointConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RolePermissionSeedIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

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
    }

    @TestConfiguration
    static class TestSecurityEndpointConfig {
        @RestController
        @RequestMapping("/api/v1/test-auth")
        static class TestSecurityController {
            @PostMapping("/service-request-assign")
            @PreAuthorize("hasAuthority('SERVICE_REQUEST_ASSIGN')")
            public ResponseEntity<Map<String, String>> checkServiceRequestAssign() {
                return ResponseEntity.ok(Collections.singletonMap("status", "ALLOWED"));
            }
        }
    }

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired(required = false)
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginSessionRepository loginSessionRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String pmToken;
    private String leaderToken;
    private String employeeToken;

    @BeforeEach
    void setUp() throws Exception {
        if (objectMapper == null) {
            objectMapper = new ObjectMapper().findAndRegisterModules();
        }

        OpenEntityManagerInViewFilter osivFilter = new OpenEntityManagerInViewFilter();
        osivFilter.setServletContext(context.getServletContext());

        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(osivFilter)
                .apply(springSecurity())
                .build();

        loginSessionRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        jdbcTemplate.update("DELETE FROM user_roles");
        userRepository.deleteAll();

        String rawPassword = "Password123!";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // 1. Create ADMIN user
        UUID adminId = UUID.randomUUID();
        insertUser(adminId, "admin_seed", "admin_seed@test.com", encodedPassword);
        assignRole(adminId, "ADMIN");
        adminToken = loginAndGetToken("admin_seed", rawPassword);

        // 2. Create PROJECT_MANAGER user
        UUID pmId = UUID.randomUUID();
        insertUser(pmId, "pm_seed", "pm_seed@test.com", encodedPassword);
        assignRole(pmId, "PROJECT_MANAGER");
        pmToken = loginAndGetToken("pm_seed", rawPassword);

        // 3. Create TEAM_LEADER user
        UUID leaderId = UUID.randomUUID();
        insertUser(leaderId, "leader_seed", "leader_seed@test.com", encodedPassword);
        assignRole(leaderId, "TEAM_LEADER");
        leaderToken = loginAndGetToken("leader_seed", rawPassword);

        // 4. Create EMPLOYEE user
        UUID employeeId = UUID.randomUUID();
        insertUser(employeeId, "emp_seed", "emp_seed@test.com", encodedPassword);
        assignRole(employeeId, "EMPLOYEE");
        employeeToken = loginAndGetToken("emp_seed", rawPassword);
    }

    private void insertUser(UUID id, String username, String email, String passwordHash) {
        jdbcTemplate.update(
                "INSERT INTO users (id, username, email, password_hash, full_name, status, is_deleted, created_at, updated_at, version) "
                        + "VALUES (?, ?, ?, ?, ?, 'ACTIVE', false, now(), now(), 0)",
                id, username, email, passwordHash, username + " Full Name"
        );
    }

    private void assignRole(UUID userId, String roleCode) {
        UUID roleId = jdbcTemplate.queryForObject(
                "SELECT id FROM roles WHERE code = ?", UUID.class, roleCode);
        assertThat(roleId).isNotNull();
        jdbcTemplate.update(
                "INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, now())",
                userId, roleId
        );
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        LoginRequest req = new LoginRequest(username, password, "TestDevice");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("data").get("accessToken").asText();
    }

    // =========================================================================
    // 1. DATABASE SEED AND INVARIANT VALIDATION
    // =========================================================================

    @Test
    @Order(1)
    @DisplayName("V013 migration: uk_service_assignments_one_active partial unique index must exist")
    void v013_shouldHaveActiveServiceAssignmentUniqueIndex() {
        Integer indexCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'service_assignments' "
                        + "AND indexname = 'uk_service_assignments_one_active'",
                Integer.class
        );
        assertThat(indexCount).isEqualTo(1);
    }

    @Test
    @Order(2)
    @DisplayName("V014 migration: roles, permissions, and role_permissions exact counts")
    void v014_shouldHaveExactCanonicalCounts() {
        Integer roleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles", Integer.class);
        Integer permissionCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM permissions", Integer.class);
        Integer mappingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_permissions", Integer.class);

        assertThat(roleCount).isEqualTo(4);
        assertThat(permissionCount).isEqualTo(29);
        // ADMIN(29) + PM(19) + LEADER(14) + EMP(12) = 74
        assertThat(mappingCount).isEqualTo(74);

        Integer adminPermissions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code = 'ADMIN'",
                Integer.class);
        Integer pmPermissions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code = 'PROJECT_MANAGER'",
                Integer.class);
        Integer leaderPermissions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code = 'TEAM_LEADER'",
                Integer.class);
        Integer empPermissions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE r.code = 'EMPLOYEE'",
                Integer.class);

        assertThat(adminPermissions).isEqualTo(29);
        assertThat(pmPermissions).isEqualTo(19);
        assertThat(leaderPermissions).isEqualTo(14);
        assertThat(empPermissions).isEqualTo(12);
    }

    // =========================================================================
    // 2. ADMIN AUTHENTICATION AND AUTHORIZATION
    // =========================================================================

    @Test
    @Order(3)
    @DisplayName("ADMIN: Can access identity admin and project/task protected endpoints")
    void admin_shouldAccessIdentityAndProjectsAndTasks() throws Exception {
        // Identity admin endpoint (@PreAuthorize("hasAuthority('USER_READ')"))
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Project read endpoint (@PreAuthorize("hasAuthority('PROJECT_READ')"))
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Task read endpoint (@PreAuthorize("hasAuthority('TASK_READ')"))
        mockMvc.perform(get("/api/v1/tasks")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Service request assign endpoint (@PreAuthorize("hasAuthority('SERVICE_REQUEST_ASSIGN')"))
        mockMvc.perform(post("/api/v1/test-auth/service-request-assign")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ALLOWED"));
    }

    // =========================================================================
    // 3. EMPLOYEE AUTHENTICATION AND AUTHORIZATION
    // =========================================================================

    @Test
    @Order(4)
    @DisplayName("EMPLOYEE: Allowed self-service profile and task read, forbidden from admin endpoints")
    void employee_shouldAccessSelfService_andBeForbiddenFromAdmin() throws Exception {
        // Self-service profile endpoint
        mockMvc.perform(get("/api/v1/me")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Task read endpoint (@PreAuthorize("hasAuthority('TASK_READ')"))
        mockMvc.perform(get("/api/v1/tasks")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Forbidden on admin identity endpoint (@PreAuthorize("hasAuthority('USER_READ')"))
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on project read endpoint (@PreAuthorize("hasAuthority('PROJECT_READ')"))
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on project create endpoint (@PreAuthorize("hasAuthority('PROJECT_CREATE')"))
        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"PRJ-E\",\"name\":\"Project E\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on SERVICE_REQUEST_ASSIGN
        mockMvc.perform(post("/api/v1/test-auth/service-request-assign")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    // =========================================================================
    // 4. TEAM_LEADER AUTHENTICATION AND AUTHORIZATION
    // =========================================================================

    @Test
    @Order(5)
    @DisplayName("TEAM_LEADER: Has task read, forbidden from admin users and SERVICE_REQUEST_ASSIGN")
    void teamLeader_shouldHaveTaskPermissions_andBeForbiddenFromServiceRequestAssign() throws Exception {
        // Task read endpoint (@PreAuthorize("hasAuthority('TASK_READ')"))
        mockMvc.perform(get("/api/v1/tasks")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Forbidden on admin identity endpoint (@PreAuthorize("hasAuthority('USER_READ')"))
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on project read endpoint (@PreAuthorize("hasAuthority('PROJECT_READ')"))
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on project create endpoint (@PreAuthorize("hasAuthority('PROJECT_CREATE')"))
        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + leaderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"PRJ-L\",\"name\":\"Project L\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on SERVICE_REQUEST_ASSIGN
        mockMvc.perform(post("/api/v1/test-auth/service-request-assign")
                        .header("Authorization", "Bearer " + leaderToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    // =========================================================================
    // 5. PROJECT_MANAGER AUTHENTICATION AND AUTHORIZATION
    // =========================================================================

    @Test
    @Order(6)
    @DisplayName("PROJECT_MANAGER: Has project read, forbidden from admin users and SERVICE_REQUEST_ASSIGN")
    void projectManager_shouldHaveProjectPermissions_andBeForbiddenFromServiceRequestAssign() throws Exception {
        // Project read endpoint (@PreAuthorize("hasAuthority('PROJECT_READ')"))
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Task read endpoint (@PreAuthorize("hasAuthority('TASK_READ')"))
        mockMvc.perform(get("/api/v1/tasks")
                        .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Forbidden on admin identity endpoint (@PreAuthorize("hasAuthority('USER_READ')"))
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Forbidden on SERVICE_REQUEST_ASSIGN
        mockMvc.perform(post("/api/v1/test-auth/service-request-assign")
                        .header("Authorization", "Bearer " + pmToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @Order(7)
    @DisplayName("Verify specific permissions in database match canonical expectations exactly")
    void databaseMappings_shouldMatchCanonicalMatrix() {
        List<String> adminCodes = jdbcTemplate.queryForList(
                "SELECT p.code FROM role_permissions rp "
                        + "JOIN roles r ON r.id = rp.role_id "
                        + "JOIN permissions p ON p.id = rp.permission_id "
                        + "WHERE r.code = 'ADMIN' ORDER BY p.code",
                String.class
        );
        assertThat(adminCodes).hasSize(29);
        assertThat(adminCodes).contains("SERVICE_REQUEST_ASSIGN", "SERVICE_CATEGORY_MANAGE", "USER_MANAGE");

        List<String> leaderCodes = jdbcTemplate.queryForList(
                "SELECT p.code FROM role_permissions rp "
                        + "JOIN roles r ON r.id = rp.role_id "
                        + "JOIN permissions p ON p.id = rp.permission_id "
                        + "WHERE r.code = 'TEAM_LEADER' ORDER BY p.code",
                String.class
        );
        assertThat(leaderCodes).hasSize(14);
        assertThat(leaderCodes).contains("TASK_CREATE", "TASK_ASSIGN", "TASK_UPDATE_STATUS");
        assertThat(leaderCodes).doesNotContain("SERVICE_REQUEST_ASSIGN", "PROJECT_READ", "PROJECT_CREATE", "USER_READ");

        List<String> pmCodes = jdbcTemplate.queryForList(
                "SELECT p.code FROM role_permissions rp "
                        + "JOIN roles r ON r.id = rp.role_id "
                        + "JOIN permissions p ON p.id = rp.permission_id "
                        + "WHERE r.code = 'PROJECT_MANAGER' ORDER BY p.code",
                String.class
        );
        assertThat(pmCodes).hasSize(19);
        assertThat(pmCodes).contains("PROJECT_READ", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_MEMBER_MANAGE", "TASK_DELETE");
        assertThat(pmCodes).doesNotContain("SERVICE_REQUEST_ASSIGN", "SERVICE_CATEGORY_MANAGE", "USER_READ");

        List<String> empCodes = jdbcTemplate.queryForList(
                "SELECT p.code FROM role_permissions rp "
                        + "JOIN roles r ON r.id = rp.role_id "
                        + "JOIN permissions p ON p.id = rp.permission_id "
                        + "WHERE r.code = 'EMPLOYEE' ORDER BY p.code",
                String.class
        );
        assertThat(empCodes).hasSize(12);
        assertThat(empCodes).contains("PROFILE_READ", "PROFILE_UPDATE", "TASK_READ", "TASK_UPDATE",
                "TASK_UPDATE_STATUS", "SERVICE_REQUEST_READ", "SERVICE_REQUEST_CREATE", "SERVICE_REQUEST_UPDATE",
                "SERVICE_REQUEST_UPDATE_STATUS", "ASSET_READ", "NOTIFICATION_READ", "NOTIFICATION_UPDATE");
        assertThat(empCodes).doesNotContain("TASK_CREATE", "TASK_ASSIGN", "TASK_DELETE", "PROJECT_READ", "PROJECT_CREATE",
                "SERVICE_REQUEST_ASSIGN", "USER_READ");
    }
}
