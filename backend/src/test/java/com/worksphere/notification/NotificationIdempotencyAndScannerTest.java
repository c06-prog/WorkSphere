package com.worksphere.notification;

import com.worksphere.notification.application.NotificationApplicationService;
import com.worksphere.notification.application.TaskDeadlineScanner;
import com.worksphere.notification.domain.NotificationReferenceType;
import com.worksphere.notification.domain.NotificationType;
import com.worksphere.notification.infrastructure.persistence.NotificationPreferenceRepository;
import com.worksphere.notification.infrastructure.persistence.NotificationRepository;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class NotificationIdempotencyAndScannerTest {

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

    private static final Instant FIXED_NOW = Instant.parse("2026-10-16T12:00:00Z");

    @TestConfiguration
    static class FixedClockConfig {
        @Bean
        @Primary
        public Clock fixedClock() {
            return Clock.fixed(FIXED_NOW, ZoneOffset.UTC);
        }
    }

    @Autowired
    private NotificationApplicationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentRepository taskAssignmentRepository;

    @Autowired
    private TaskDeadlineScanner scanner;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UUID userId1;
    private UUID userId2;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        userId1 = UUID.randomUUID();
        userId2 = UUID.randomUUID();
        projectId = UUID.randomUUID();

        createTestUser(userId1, "scan_u1", "scan_u1@test.com");
        createTestUser(userId2, "scan_u2", "scan_u2@test.com");
        createTestProject(projectId, "Scanner Project", userId1);
    }

    @Test
    @DisplayName("Idempotency: Native insert ON CONFLICT DO NOTHING preserves single row on duplicate eventKey")
    void testNativeInsertIdempotency() {
        String eventKey = "TASK_ASSIGNED:test-task-1:assign-1";

        boolean first = notificationService.deliverInAppNotification(
                userId1, NotificationType.TASK_ASSIGNED,
                "Title", "Message", NotificationReferenceType.TASK, UUID.randomUUID(), eventKey
        );
        assertThat(first).isTrue();

        boolean second = notificationService.deliverInAppNotification(
                userId1, NotificationType.TASK_ASSIGNED,
                "Title", "Message", NotificationReferenceType.TASK, UUID.randomUUID(), eventKey
        );
        assertThat(second).isFalse();

        long count = notificationRepository.findAll().stream()
                .filter(n -> eventKey.equals(n.getEventKey()) && userId1.equals(n.getRecipientId()))
                .count();
        assertThat(count).isEqualTo(1L);
    }

    @Test
    @DisplayName("Idempotency: Two recipients with same eventKey each receive exactly one notification")
    void testMultiRecipientDelivery() {
        String sharedKey = "TASK_STATUS_CHANGED:shared-task-1:hist-1";

        boolean res1 = notificationService.deliverInAppNotification(
                userId1, NotificationType.TASK_STATUS_CHANGED,
                "Status changed", "Msg", NotificationReferenceType.TASK, UUID.randomUUID(), sharedKey
        );
        boolean res2 = notificationService.deliverInAppNotification(
                userId2, NotificationType.TASK_STATUS_CHANGED,
                "Status changed", "Msg", NotificationReferenceType.TASK, UUID.randomUUID(), sharedKey
        );

        assertThat(res1).isTrue();
        assertThat(res2).isTrue();

        long count = notificationRepository.findAll().stream()
                .filter(n -> sharedKey.equals(n.getEventKey()))
                .count();
        assertThat(count).isEqualTo(2L);
    }

    @Test
    @DisplayName("Preference: Disabled inApp preference skips notification insertion")
    void testPreferenceDisabledSkipsInsert() {
        // Disable inApp for TASK_ASSIGNED for user 1
        jdbcTemplate.update("""
                INSERT INTO notification_preferences (id, user_id, notification_type, in_app_enabled, push_enabled, email_enabled, updated_at)
                VALUES (?, ?, 'TASK_ASSIGNED', FALSE, TRUE, FALSE, NOW())
                ON CONFLICT (user_id, notification_type) DO UPDATE SET in_app_enabled = FALSE
                """, UUID.randomUUID(), userId1);

        String eventKey = "TASK_ASSIGNED:task-pref-test:assign-1";
        boolean created = notificationService.deliverInAppNotification(
                userId1, NotificationType.TASK_ASSIGNED,
                "Title", "Msg", NotificationReferenceType.TASK, UUID.randomUUID(), eventKey
        );

        assertThat(created).isFalse();
        long count = notificationRepository.findAll().stream()
                .filter(n -> eventKey.equals(n.getEventKey()))
                .count();
        assertThat(count).isEqualTo(0L);
    }

    @Test
    @DisplayName("Scanner: Detects OVERDUE and DUE_SOON tasks with fixed Clock and delivers idempotently")
    void testTaskDeadlineScanner() {
        // Task 1: Overdue (now - 2 hours)
        UUID task1Id = UUID.randomUUID();
        Instant task1Due = FIXED_NOW.minusSeconds(7200);
        createTaskWithAssignment(task1Id, "Overdue Task", TaskStatus.IN_PROGRESS, task1Due, userId1);

        // Task 2: Due Soon (now + 24 hours <= 72h)
        UUID task2Id = UUID.randomUUID();
        Instant task2Due = FIXED_NOW.plusSeconds(86400);
        createTaskWithAssignment(task2Id, "Due Soon Task", TaskStatus.TODO, task2Due, userId1);

        // Task 3: Far future (now + 100 hours > 72h)
        UUID task3Id = UUID.randomUUID();
        Instant task3Due = FIXED_NOW.plusSeconds(360000);
        createTaskWithAssignment(task3Id, "Far Future Task", TaskStatus.TODO, task3Due, userId1);

        // Task 4: Terminal completed (should be excluded)
        UUID task4Id = UUID.randomUUID();
        Instant task4Due = FIXED_NOW.minusSeconds(7200);
        createTaskWithAssignment(task4Id, "Completed Task", TaskStatus.COMPLETED, task4Due, userId1);

        // Execute scan 1
        int processed1 = scanner.scanDeadlines();
        assertThat(processed1).isEqualTo(2);

        // Verify Task 1 OVERDUE notification
        String task1Key = "TASK_OVERDUE:" + task1Id + ":" + task1Due.toEpochMilli();
        long task1Notifs = notificationRepository.findAll().stream()
                .filter(n -> task1Key.equals(n.getEventKey()) && userId1.equals(n.getRecipientId()))
                .count();
        assertThat(task1Notifs).isEqualTo(1L);

        // Verify Task 2 DUE_SOON notification
        String task2Key = "TASK_DUE_SOON:" + task2Id + ":" + task2Due.toEpochMilli();
        long task2Notifs = notificationRepository.findAll().stream()
                .filter(n -> task2Key.equals(n.getEventKey()) && userId1.equals(n.getRecipientId()))
                .count();
        assertThat(task2Notifs).isEqualTo(1L);

        // Execute scan 2 (should be idempotent: 0 new rows)
        int processed2 = scanner.scanDeadlines();
        assertThat(processed2).isEqualTo(2);

        long totalUserNotifs = notificationRepository.findAll().stream()
                .filter(n -> userId1.equals(n.getRecipientId()))
                .count();
        assertThat(totalUserNotifs).isEqualTo(2L);
    }

    private void createTestUser(UUID userId, String username, String email) {
        jdbcTemplate.update("""
                INSERT INTO users (id, username, password_hash, full_name, email, status, created_at, updated_at)
                VALUES (?, ?, 'hash', 'Test User', ?, 'ACTIVE', NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
                """, userId, username, email);
    }

    private void createTestProject(UUID projId, String name, UUID ownerId) {
        jdbcTemplate.update("""
                INSERT INTO projects (id, code, name, status, priority, manager_id, created_by, is_deleted, created_at, updated_at)
                VALUES (?, 'PRJ_' || SUBSTR(?, 1, 8), ?, 'ACTIVE', 'MEDIUM', ?, ?, FALSE, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
                """, projId, projId.toString(), name, ownerId, ownerId);
    }

    private void createTaskWithAssignment(UUID taskId, String title, TaskStatus status, Instant dueDate, UUID assigneeId) {
        Task task = Task.create(
                taskId, projectId, null, null, title, "Desc",
                TaskPriority.MEDIUM, assigneeId, null, dueDate, 60, assigneeId
        );
        if (status == TaskStatus.IN_PROGRESS) {
            task.changeStatus(TaskStatus.IN_PROGRESS, "start", assigneeId);
        } else if (status == TaskStatus.COMPLETED) {
            task.changeStatus(TaskStatus.IN_PROGRESS, "start", assigneeId);
            task.changeStatus(TaskStatus.IN_REVIEW, "review", assigneeId);
            task.changeStatus(TaskStatus.COMPLETED, "done", assigneeId);
        }
        taskRepository.save(task);

        TaskAssignment assignment = TaskAssignment.create(UUID.randomUUID(), taskId, assigneeId, assigneeId);
        taskAssignmentRepository.save(assignment);
    }
}
