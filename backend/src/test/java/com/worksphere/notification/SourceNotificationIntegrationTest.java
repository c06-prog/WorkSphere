package com.worksphere.notification;

import com.worksphere.asset.api.request.AssignAssetRequest;
import com.worksphere.asset.application.AssetApplicationService;
import com.worksphere.asset.domain.Asset;
import com.worksphere.asset.domain.AssetCategory;
import com.worksphere.asset.infrastructure.persistence.AssetCategoryRepository;
import com.worksphere.asset.infrastructure.persistence.AssetRepository;
import com.worksphere.identity.domain.User;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import com.worksphere.notification.domain.Notification;
import com.worksphere.notification.domain.NotificationType;
import com.worksphere.notification.infrastructure.persistence.NotificationRepository;
import com.worksphere.project.api.request.AddProjectMemberRequest;
import com.worksphere.project.application.ProjectMemberApplicationService;
import com.worksphere.project.domain.Project;
import com.worksphere.project.domain.ProjectMember;
import com.worksphere.project.domain.ProjectRole;
import com.worksphere.project.infrastructure.persistence.ProjectMemberRepository;
import com.worksphere.project.infrastructure.persistence.ProjectRepository;
import com.worksphere.service_request.api.request.AssignServiceRequestRequest;
import com.worksphere.service_request.api.request.CreateServiceCommentRequest;
import com.worksphere.service_request.api.request.UpdateServiceRequestStatusRequest;
import com.worksphere.service_request.application.ServiceRequestApplicationService;
import com.worksphere.service_request.domain.ServiceCategory;
import com.worksphere.service_request.domain.ServicePriority;
import com.worksphere.service_request.domain.ServiceRequest;
import com.worksphere.service_request.domain.ServiceStatus;
import com.worksphere.service_request.infrastructure.persistence.ServiceCategoryRepository;
import com.worksphere.service_request.infrastructure.persistence.ServiceRequestRepository;
import com.worksphere.shared.security.WorkSphereUserPrincipal;
import com.worksphere.task.api.request.AssignTaskRequest;
import com.worksphere.task.api.request.ChangeTaskStatusRequest;
import com.worksphere.task.api.request.CreateTaskCommentRequest;
import com.worksphere.task.application.TaskApplicationService;
import com.worksphere.task.application.TaskCommentApplicationService;
import com.worksphere.task.domain.Task;
import com.worksphere.task.domain.TaskAssignment;
import com.worksphere.task.domain.TaskPriority;
import com.worksphere.task.domain.TaskStatus;
import com.worksphere.task.infrastructure.persistence.TaskAssignmentRepository;
import com.worksphere.task.infrastructure.persistence.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class SourceNotificationIntegrationTest {

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
    }

    @Autowired
    private ProjectMemberApplicationService projectMemberService;

    @Autowired
    private TaskApplicationService taskService;

    @Autowired
    private TaskCommentApplicationService taskCommentService;

    @Autowired
    private ServiceRequestApplicationService serviceRequestService;

    @Autowired
    private AssetApplicationService assetService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentRepository taskAssignmentRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetCategoryRepository assetCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UUID adminId;
    private UUID leaderId;
    private UUID employeeId;
    private WorkSphereUserPrincipal adminPrincipal;
    private WorkSphereUserPrincipal leaderPrincipal;
    private WorkSphereUserPrincipal employeePrincipal;
    private UUID projectId;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM task_comments");
        jdbcTemplate.update("DELETE FROM task_status_histories");
        jdbcTemplate.update("DELETE FROM task_assignments");
        jdbcTemplate.update("UPDATE tasks SET parent_task_id = NULL");
        jdbcTemplate.update("DELETE FROM tasks");
        jdbcTemplate.update("DELETE FROM project_members");
        jdbcTemplate.update("DELETE FROM projects");
        jdbcTemplate.update("DELETE FROM service_assignments");
        jdbcTemplate.update("DELETE FROM service_comments");
        jdbcTemplate.update("DELETE FROM service_requests");
        jdbcTemplate.update("DELETE FROM service_categories");
        jdbcTemplate.update("DELETE FROM asset_repair_histories");
        jdbcTemplate.update("DELETE FROM asset_assignments");
        jdbcTemplate.update("DELETE FROM assets");
        jdbcTemplate.update("DELETE FROM asset_categories");
        jdbcTemplate.update("DELETE FROM notifications");
        jdbcTemplate.update("DELETE FROM notification_preferences");
        jdbcTemplate.update("DELETE FROM user_roles");
        jdbcTemplate.update("DELETE FROM users");

        adminId = UUID.randomUUID();
        leaderId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        createTestUser(adminId, "src_admin", "src_admin@test.com", "ADMIN");
        createTestUser(leaderId, "src_leader", "src_leader@test.com", "TEAM_LEADER");
        createTestUser(employeeId, "src_emp", "src_emp@test.com", "EMPLOYEE");

        adminPrincipal = createPrincipal(adminId, "src_admin", "ADMIN");
        leaderPrincipal = createPrincipal(leaderId, "src_leader", "TEAM_LEADER");
        employeePrincipal = createPrincipal(employeeId, "src_emp", "EMPLOYEE");

        projectId = UUID.randomUUID();
        String prjCode = "PRJ_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Project project = Project.create(
                projectId, prjCode, "Source Integration Project", "Desc", adminId,
                null, null, null, null, adminId
        );
        project.changeStatus(com.worksphere.project.domain.ProjectStatus.ACTIVE, adminId);
        projectRepository.save(project);

        // Add admin, leader and employee to project
        projectMemberRepository.save(ProjectMember.create(UUID.randomUUID(), projectId, adminId, ProjectRole.PROJECT_MANAGER, adminId));
        projectMemberRepository.save(ProjectMember.create(UUID.randomUUID(), projectId, leaderId, ProjectRole.TEAM_LEADER, adminId));
        projectMemberRepository.save(ProjectMember.create(UUID.randomUUID(), projectId, employeeId, ProjectRole.MEMBER, adminId));
    }

    @Test
    @DisplayName("Project: Adding member dispatches PROJECT_MEMBER_ADDED notification")
    void testProjectMemberAddNotification() {
        UUID newMemberId = UUID.randomUUID();
        createTestUser(newMemberId, "src_new_mem", "new_mem@test.com", "EMPLOYEE");

        projectMemberService.addMember(projectId, new AddProjectMemberRequest(newMemberId, ProjectRole.MEMBER), adminId);

        List<Notification> notifs = notificationRepository.findAll().stream()
                .filter(n -> newMemberId.equals(n.getRecipientId()) && n.getType() == NotificationType.PROJECT_MEMBER_ADDED)
                .toList();

        assertThat(notifs).hasSize(1);
        assertThat(notifs.get(0).getTitle()).contains("thêm vào dự án");
        assertThat(notifs.get(0).getEventKey()).startsWith("PROJECT_MEMBER_ADDED:" + projectId);
    }

    @Test
    @DisplayName("Task: Assigning task dispatches TASK_ASSIGNED notification")
    void testTaskAssignNotification() {
        UUID taskId = UUID.randomUUID();
        Task task = Task.create(
                taskId, projectId, null, null, "Integrate Login", "Desc",
                TaskPriority.HIGH, adminId, null, null, 120, adminId
        );
        taskRepository.save(task);

        taskService.assignUsers(taskId, new AssignTaskRequest(List.of(employeeId)), adminPrincipal);

        List<Notification> notifs = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.TASK_ASSIGNED)
                .toList();

        assertThat(notifs).hasSize(1);
        assertThat(notifs.get(0).getTitle()).contains("giao công việc mới");
        assertThat(notifs.get(0).getEventKey()).startsWith("TASK_ASSIGNED:" + taskId);
    }

    @Test
    @DisplayName("Task: Status update dispatches TASK_STATUS_CHANGED to assignee, reporter and PM/TL")
    void testTaskStatusChangeNotification() {
        UUID taskId = UUID.randomUUID();
        Task task = Task.create(
                taskId, projectId, null, null, "Build UI", "Desc",
                TaskPriority.HIGH, adminId, null, null, 120, adminId
        );
        taskRepository.save(task);
        taskAssignmentRepository.save(TaskAssignment.create(UUID.randomUUID(), taskId, employeeId, adminId));

        // Employee changes status to IN_PROGRESS
        taskService.changeStatus(taskId, new ChangeTaskStatusRequest(TaskStatus.IN_PROGRESS, "Started work", 0L), employeePrincipal);

        // Employee is actor -> excluded. Recipients should include Admin (reporter & PM) and Leader (TL).
        List<Notification> adminNotifs = notificationRepository.findAll().stream()
                .filter(n -> adminId.equals(n.getRecipientId()) && n.getType() == NotificationType.TASK_STATUS_CHANGED)
                .toList();
        List<Notification> leaderNotifs = notificationRepository.findAll().stream()
                .filter(n -> leaderId.equals(n.getRecipientId()) && n.getType() == NotificationType.TASK_STATUS_CHANGED)
                .toList();
        List<Notification> empNotifs = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.TASK_STATUS_CHANGED)
                .toList();

        assertThat(adminNotifs).hasSize(1);
        assertThat(leaderNotifs).hasSize(1);
        assertThat(empNotifs).isEmpty(); // Actor excluded!
    }

    @Test
    @DisplayName("Task: Public comment dispatches COMMENT_ADDED notification")
    void testTaskCommentNotification() {
        UUID taskId = UUID.randomUUID();
        Task task = Task.create(
                taskId, projectId, null, null, "Bug Fix", "Desc",
                TaskPriority.HIGH, adminId, null, null, 120, adminId
        );
        taskRepository.save(task);
        taskAssignmentRepository.save(TaskAssignment.create(UUID.randomUUID(), taskId, employeeId, adminId));

        // Employee comments on task
        taskCommentService.createComment(taskId, new CreateTaskCommentRequest("Please review my PR", null, null), employeePrincipal);

        List<Notification> adminNotifs = notificationRepository.findAll().stream()
                .filter(n -> adminId.equals(n.getRecipientId()) && n.getType() == NotificationType.COMMENT_ADDED)
                .toList();
        List<Notification> empNotifs = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.COMMENT_ADDED)
                .toList();

        assertThat(adminNotifs).hasSize(1);
        assertThat(empNotifs).isEmpty(); // Actor excluded!
    }

    @Test
    @DisplayName("Service Request: Assignment and Status update dispatch SERVICE_REQUEST_UPDATED")
    void testServiceRequestNotifications() {
        UUID catId = UUID.randomUUID();
        ServiceCategory cat = ServiceCategory.create(catId, null, "CAT_SR_NOTIF", "SR Cat", "Desc", ServicePriority.MEDIUM, true, Instant.now());
        serviceCategoryRepository.save(cat);

        UUID requestId = UUID.randomUUID();
        ServiceRequest sr = ServiceRequest.create(
                requestId, "SR-2026-888001", catId, employeeId, null, "Printer issue", "Desc",
                ServicePriority.MEDIUM, employeeId, Instant.now()
        );
        serviceRequestRepository.save(sr);

        // 1. Admin assigns request to Leader
        serviceRequestService.assignRequest(requestId, new AssignServiceRequestRequest(leaderId), adminPrincipal);

        List<Notification> leaderNotifs = notificationRepository.findAll().stream()
                .filter(n -> leaderId.equals(n.getRecipientId()) && n.getType() == NotificationType.SERVICE_REQUEST_UPDATED)
                .toList();
        assertThat(leaderNotifs).hasSize(1);
        assertThat(leaderNotifs.get(0).getTitle()).contains("phân công yêu cầu");

        // 2. Leader updates status to IN_PROGRESS (should notify Requester: employee)
        serviceRequestService.updateStatus(requestId, new UpdateServiceRequestStatusRequest(ServiceStatus.IN_PROGRESS, null, 1L), leaderPrincipal);

        List<Notification> requesterNotifs = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.SERVICE_REQUEST_UPDATED)
                .toList();
        assertThat(requesterNotifs).hasSize(1);
        assertThat(requesterNotifs.get(0).getTitle()).contains("Yêu cầu dịch vụ được cập nhật");

        // 3. Leader adds internal note (isInternal = true) -> must NOT notify requester!
        serviceRequestService.createComment(requestId, new CreateServiceCommentRequest("Secret internal note", true, null), leaderPrincipal);

        long requesterComments = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.COMMENT_ADDED)
                .count();
        assertThat(requesterComments).isEqualTo(0L); // Requester NOT notified for internal note!
    }

    @Test
    @DisplayName("Asset: Assignment dispatches ASSET_ASSIGNED notification")
    void testAssetAssignmentNotification() {
        UUID catId = UUID.randomUUID();
        AssetCategory cat = AssetCategory.create(catId, "ASSET_CAT_NOTIF", "Category Notif", "Desc", true, Instant.now());
        assetCategoryRepository.save(cat);

        UUID assetId = UUID.randomUUID();
        Asset asset = Asset.create(
                assetId, "AST-NOTIF-01", catId, "MacBook Pro M3", "Desc",
                "SN-NOTIF-9999", "Apple", "16-inch", null, null, null, "Tech", adminId, Instant.now()
        );
        assetRepository.save(asset);

        assetService.assignAsset(assetId, new AssignAssetRequest(employeeId, null, "Laptop handover"), adminPrincipal);

        List<Notification> empNotifs = notificationRepository.findAll().stream()
                .filter(n -> employeeId.equals(n.getRecipientId()) && n.getType() == NotificationType.ASSET_ASSIGNED)
                .toList();

        assertThat(empNotifs).hasSize(1);
        assertThat(empNotifs.get(0).getTitle()).contains("cấp phát tài sản");
        assertThat(empNotifs.get(0).getMessage()).contains("MacBook Pro M3");
    }

    private void createTestUser(UUID userId, String username, String email, String roleCode) {
        jdbcTemplate.update("""
                INSERT INTO users (id, username, password_hash, full_name, email, status, created_at, updated_at)
                VALUES (?, ?, 'hash', 'Test User', ?, 'ACTIVE', NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
                """, userId, username, email);

        jdbcTemplate.update("""
                INSERT INTO user_roles (user_id, role_id, assigned_at)
                SELECT ?, r.id, NOW() FROM roles r WHERE r.code = ?
                ON CONFLICT DO NOTHING
                """, userId, roleCode);
    }

    private WorkSphereUserPrincipal createPrincipal(UUID userId, String username, String roleCode) {
        User user = new org.springframework.transaction.support.TransactionTemplate(transactionManager).execute(status -> {
            User u = userRepository.findById(userId).orElseThrow();
            org.hibernate.Hibernate.initialize(u.getRoles());
            return u;
        });
        return new WorkSphereUserPrincipal(user);
    }
}
