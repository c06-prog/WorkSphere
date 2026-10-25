package com.worksphere.notification.dev;

import com.worksphere.identity.domain.User;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import com.worksphere.notification.infrastructure.persistence.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Development-only provisioner for canonical E2E Notification fixtures.
 *
 * Operational & Security Invariants:
 * - Strictly guarded by @Profile("dev") and @ConditionalOnProperty("worksphere.dev.e2e-notification-fixture.enabled").
 * - Disabled by default.
 * - Idempotent execution (keyed by stable (recipient_id, event_key)).
 * - Targets the active E2E recipient user provisioned in dev environment.
 * - Seeds genuine target entities (Project, Task, Service Request, Asset) if absent, ensuring
 *   deep-link context navigation resolves safely against genuine database rows.
 * - Zero hardcoded credentials or tokens.
 * - Never active in production.
 */
@Component
@Profile("dev")
@Order(100) // Runs after E2eUserProvisioner and DevAssetFixtureProvisioner
@ConditionalOnProperty(name = "worksphere.dev.e2e-notification-fixture.enabled", havingValue = "true", matchIfMissing = false)
public class DevNotificationFixtureProvisioner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevNotificationFixtureProvisioner.class);

    // Stable deterministic UUIDs for dev fixtures
    public static final UUID FIXTURE_PROJECT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    public static final UUID FIXTURE_TASK_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    public static final UUID FIXTURE_SERVICE_CATEGORY_ID = UUID.fromString("33333333-3333-3333-3333-333333333331");
    public static final UUID FIXTURE_SERVICE_REQUEST_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    public static final UUID FIXTURE_ASSET_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");

    // Notification IDs
    public static final UUID FIXTURE_NOTIF_TASK_ID = UUID.fromString("55555555-5555-5555-5555-555555555551");
    public static final UUID FIXTURE_NOTIF_PROJECT_ID = UUID.fromString("55555555-5555-5555-5555-555555555552");
    public static final UUID FIXTURE_NOTIF_SR_ID = UUID.fromString("55555555-5555-5555-5555-555555555553");
    public static final UUID FIXTURE_NOTIF_ASSET_ID = UUID.fromString("55555555-5555-5555-5555-555555555554");
    public static final UUID FIXTURE_NOTIF_READ_ID = UUID.fromString("55555555-5555-5555-5555-555555555555");
    public static final UUID FIXTURE_NOTIF_NULL_REF_ID = UUID.fromString("55555555-5555-5555-5555-555555555556");

    // Event keys
    public static final String EVENT_TASK = "dev-fixture-task-assigned-01";
    public static final String EVENT_PROJECT = "dev-fixture-project-member-01";
    public static final String EVENT_SR = "dev-fixture-sr-updated-01";
    public static final String EVENT_ASSET = "dev-fixture-asset-assigned-01";
    public static final String EVENT_READ = "dev-fixture-comment-read-01";
    public static final String EVENT_NULL_REF = "dev-fixture-system-announcement-01";

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final JdbcTemplate jdbcTemplate;
    private final boolean enabled;
    private final String recipientLogin;

    public DevNotificationFixtureProvisioner(
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            JdbcTemplate jdbcTemplate,
            @Value("${worksphere.dev.e2e-notification-fixture.enabled:false}") boolean enabled,
            @Value("${worksphere.dev.e2e-user.login:}") String recipientLogin
    ) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.enabled = enabled;
        this.recipientLogin = recipientLogin != null ? recipientLogin.trim() : "";
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("E2E notification fixture disabled.");
            return;
        }

        User recipient = resolveRecipient();
        if (recipient == null) {
            log.warn("E2E notification fixture enabled, but no recipient user could be resolved. Skipping.");
            return;
        }

        UUID recipientId = recipient.getId();
        log.info("Provisioning E2E notification fixtures for recipient ID: {}", recipientId);

        // 1. Ensure target entities exist
        ensureTargetEntitiesExist(recipientId);

        // 2. Ensure notifications exist (idempotent insert)
        provisionNotifications(recipientId);

        log.info("E2E notification fixtures successfully verified and provisioned.");
    }

    private User resolveRecipient() {
        if (!recipientLogin.isEmpty()) {
            Optional<User> byLogin = userRepository.findActiveByUsernameOrEmail(recipientLogin);
            if (byLogin.isPresent()) {
                return byLogin.get();
            }
        }
        // Fallback: pick any active user
        List<User> users = userRepository.findAll();
        return users.stream().filter(u -> !u.isDeleted()).findFirst().orElse(null);
    }

    private void ensureTargetEntitiesExist(UUID userId) {
        Instant now = Instant.now();
        Timestamp nowTs = Timestamp.from(now);
        LocalDate today = LocalDate.now();

        // 1. Project
        Integer projectCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM projects WHERE id = ?", Integer.class, FIXTURE_PROJECT_ID);
        if (projectCount == null || projectCount == 0) {
            jdbcTemplate.update("""
                    INSERT INTO projects (
                        id, code, name, description, manager_id, status, priority,
                        start_date, planned_end_date, progress_percent, is_deleted,
                        created_by, created_at, updated_at, version
                    ) VALUES (
                        ?, 'E2E-PROJ-01', 'Dự án Kiểm định E2E', 'Dự án mẫu phục vụ kiểm định Notification E2E',
                        ?, 'IN_PROGRESS', 'HIGH',
                        ?, ?, 10.0, FALSE,
                        ?, ?, ?, 0
                    ) ON CONFLICT (id) DO NOTHING
                    """,
                    FIXTURE_PROJECT_ID, userId, today, today.plusDays(30), userId, nowTs, nowTs);

            // Add manager as PROJECT_MANAGER in project_members for consistent membership query
            jdbcTemplate.update("""
                    INSERT INTO project_members (
                        id, project_id, user_id, project_role, joined_at, is_active,
                        created_by, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), ?, ?, 'PROJECT_MANAGER', ?, TRUE,
                        ?, ?, ?
                    ) ON CONFLICT (project_id, user_id) DO NOTHING
                    """,
                    FIXTURE_PROJECT_ID, userId, nowTs, userId, nowTs, nowTs);
        }

        // 2. Task
        Integer taskCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tasks WHERE id = ?", Integer.class, FIXTURE_TASK_ID);
        if (taskCount == null || taskCount == 0) {
            jdbcTemplate.update("""
                    INSERT INTO tasks (
                        id, project_id, title, description, priority, status,
                        reporter_id, progress_percent, is_deleted,
                        created_by, created_at, updated_at, version
                    ) VALUES (
                        ?, ?, 'Công việc kiểm thử Notification', 'Mô tả chi tiết công việc kiểm định E2E',
                        'HIGH', 'IN_PROGRESS',
                        ?, 0.0, FALSE,
                        ?, ?, ?, 0
                    ) ON CONFLICT (id) DO NOTHING
                    """,
                    FIXTURE_TASK_ID, FIXTURE_PROJECT_ID, userId, userId, nowTs, nowTs);
        }

        // 3. Service Category & Service Request
        Integer catCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM service_categories WHERE id = ?", Integer.class, FIXTURE_SERVICE_CATEGORY_ID);
        if (catCount == null || catCount == 0) {
            jdbcTemplate.update("""
                    INSERT INTO service_categories (
                        id, code, name, description, default_priority, is_active, is_deleted,
                        created_at, updated_at, version
                    ) VALUES (
                        ?, 'E2E_SR_CAT', 'Hỗ trợ CNTT E2E', 'Danh mục hỗ trợ kiểm định E2E',
                        'MEDIUM', TRUE, FALSE,
                        ?, ?, 0
                    ) ON CONFLICT (id) DO NOTHING
                    """,
                    FIXTURE_SERVICE_CATEGORY_ID, nowTs, nowTs);
        }

        Integer srCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM service_requests WHERE id = ?", Integer.class, FIXTURE_SERVICE_REQUEST_ID);
        if (srCount == null || srCount == 0) {
            jdbcTemplate.update("""
                    INSERT INTO service_requests (
                        id, request_number, category_id, requester_id, title, description,
                        priority, status, is_deleted, created_by, created_at, updated_at, version
                    ) VALUES (
                        ?, 'SR-E2E-2026-001', ?, ?, 'Yêu cầu hỗ trợ thiết bị E2E', 'Cần kiểm tra thiết bị kiểm định',
                        'HIGH', 'IN_PROGRESS', FALSE, ?, ?, ?, 0
                    ) ON CONFLICT (id) DO NOTHING
                    """,
                    FIXTURE_SERVICE_REQUEST_ID, FIXTURE_SERVICE_CATEGORY_ID, userId, userId, nowTs, nowTs);
        }

        // 4. Asset (check existing asset or create fixture)
        List<Map<String, Object>> existingAssets = jdbcTemplate.queryForList(
                "SELECT id FROM assets WHERE is_deleted = false LIMIT 1");
        UUID targetAssetId = FIXTURE_ASSET_ID;
        if (!existingAssets.isEmpty()) {
            targetAssetId = (UUID) existingAssets.get(0).get("id");
        } else {
            // Need an asset category
            List<Map<String, Object>> existingCat = jdbcTemplate.queryForList(
                    "SELECT id FROM asset_categories WHERE is_deleted = false LIMIT 1");
            UUID catId;
            if (existingCat.isEmpty()) {
                catId = UUID.fromString("44444444-4444-4444-4444-444444444441");
                jdbcTemplate.update("""
                        INSERT INTO asset_categories (
                            id, code, name, description, is_active, is_deleted, created_at, updated_at, version
                        ) VALUES (
                            ?, 'E2E_ASSET_CAT_DEFAULT', 'Danh mục thiết bị E2E', 'Danh mục mặc định',
                            TRUE, FALSE, ?, ?, 0
                        ) ON CONFLICT (id) DO NOTHING
                        """, catId, nowTs, nowTs);
            } else {
                catId = (UUID) existingCat.get(0).get("id");
            }

            jdbcTemplate.update("""
                    INSERT INTO assets (
                        id, asset_code, category_id, name, description, status, is_deleted,
                        created_by, created_at, updated_at, version
                    ) VALUES (
                        ?, 'E2E-ASSET-001', ?, 'Máy tính kiểm định E2E', 'Thiết bị văn phòng kiểm định',
                        'AVAILABLE', FALSE, ?, ?, ?, 0
                    ) ON CONFLICT (id) DO NOTHING
                    """, targetAssetId, catId, userId, nowTs, nowTs);
        }
    }

    private void provisionNotifications(UUID recipientId) {
        Instant now = Instant.now();

        // 1. TASK notification (UNREAD)
        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_TASK_ID,
                recipientId,
                "TASK_ASSIGNED",
                "Bạn được giao công việc mới",
                "Bạn đã được chỉ định vào công việc: Công việc kiểm thử Notification",
                "TASK",
                FIXTURE_TASK_ID,
                EVENT_TASK,
                now.minus(10, ChronoUnit.MINUTES)
        );

        // 2. PROJECT notification (UNREAD)
        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_PROJECT_ID,
                recipientId,
                "PROJECT_MEMBER_ADDED",
                "Bạn đã được thêm vào dự án",
                "Bạn vừa được thêm vào thành viên của dự án: Dự án Kiểm định E2E",
                "PROJECT",
                FIXTURE_PROJECT_ID,
                EVENT_PROJECT,
                now.minus(20, ChronoUnit.MINUTES)
        );

        // 3. SERVICE_REQUEST notification (UNREAD)
        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_SR_ID,
                recipientId,
                "SERVICE_REQUEST_UPDATED",
                "Cập nhật yêu cầu dịch vụ",
                "Yêu cầu dịch vụ SR-E2E-2026-001 của bạn đã được cập nhật trạng thái",
                "SERVICE_REQUEST",
                FIXTURE_SERVICE_REQUEST_ID,
                EVENT_SR,
                now.minus(30, ChronoUnit.MINUTES)
        );

        // 4. ASSET notification (UNREAD)
        List<Map<String, Object>> existingAssets = jdbcTemplate.queryForList(
                "SELECT id FROM assets WHERE is_deleted = false LIMIT 1");
        UUID targetAssetId = existingAssets.isEmpty() ? FIXTURE_ASSET_ID : (UUID) existingAssets.get(0).get("id");

        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_ASSET_ID,
                recipientId,
                "ASSET_ASSIGNED",
                "Bàn giao tài sản",
                "Bạn vừa được bàn giao một thiết bị văn phòng phục vụ công tác",
                "ASSET",
                targetAssetId,
                EVENT_ASSET,
                now.minus(40, ChronoUnit.MINUTES)
        );

        // 5. NULL REFERENCE notification (UNREAD)
        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_NULL_REF_ID,
                recipientId,
                "COMMENT_ADDED",
                "Thông báo bảo trì hệ thống",
                "Hệ thống WorkSphere sẽ bảo trì định kỳ vào cuối tuần. Chúc bạn làm việc hiệu quả!",
                null,
                null,
                EVENT_NULL_REF,
                now.minus(50, ChronoUnit.MINUTES)
        );

        // 6. READ notification (Already read)
        notificationRepository.insertIdempotent(
                FIXTURE_NOTIF_READ_ID,
                recipientId,
                "COMMENT_ADDED",
                "Bình luận mới đã đọc",
                "Quản trị viên đã phản hồi bình luận của bạn.",
                null,
                null,
                EVENT_READ,
                now.minus(2, ChronoUnit.HOURS)
        );

        // Ensure READ notification has is_read = TRUE
        jdbcTemplate.update(
                "UPDATE notifications SET is_read = TRUE, read_at = ? WHERE id = ? AND recipient_id = ?",
                Timestamp.from(now.minus(1, ChronoUnit.HOURS)), FIXTURE_NOTIF_READ_ID, recipientId
        );
    }
}
