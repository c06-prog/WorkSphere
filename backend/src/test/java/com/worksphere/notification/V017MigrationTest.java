package com.worksphere.notification;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Migration tests for V017__add_notification_idempotency_and_query_indexes.sql.
 * Validates preflight, backfill, idempotency unique index, and query index.
 * Per reports/runbooks/V017_NOTIFICATION_IDEMPOTENCY_PLAN.md and D-049, D-050.
 */
@Testcontainers
class V017MigrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    private static Connection connection;
    private static UUID legacyUser1Id = UUID.randomUUID();
    private static UUID legacyUser2Id = UUID.randomUUID();
    private static UUID legacyNotif1Id = UUID.randomUUID();
    private static UUID legacyNotif2Id = UUID.randomUUID();

    @BeforeAll
    static void setUp() throws SQLException {
        // 1. Run migrations up to V016
        Flyway flywayV16 = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .locations("classpath:db/migration")
                .target("016")
                .load();
        flywayV16.migrate();

        connection = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()
        );

        // 2. Insert legacy users and notifications prior to V017
        insertUser(legacyUser1Id, "legacy_user1", "legacy1@test.com");
        insertUser(legacyUser2Id, "legacy_user2", "legacy2@test.com");

        insertLegacyNotification(legacyNotif1Id, legacyUser1Id, "TASK_ASSIGNED", "Task Assigned 1");
        insertLegacyNotification(legacyNotif2Id, legacyUser2Id, "TASK_ASSIGNED", "Task Assigned 2");

        // 3. Migrate V017
        Flyway flywayV17 = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .locations("classpath:db/migration")
                .target("017")
                .load();
        flywayV17.migrate();
    }

    @AfterAll
    static void tearDown() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }

    @Test
    @Order(1)
    @DisplayName("Verify V017 indexes and existing indexes exist")
    void testIndexesExist() throws SQLException {
        String query = """
                SELECT indexname FROM pg_indexes
                WHERE tablename = 'notifications'
                """;
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            Set<String> indexNames = new HashSet<>();
            while (rs.next()) {
                indexNames.add(rs.getString("indexname"));
            }
            assertThat(indexNames).contains(
                    "uk_notifications_recipient_event",
                    "idx_notifications_recipient_created_at",
                    "idx_notifications_recipient_id",
                    "idx_notifications_recipient_read",
                    "idx_notifications_created_at"
            );
        }
    }

    @Test
    @Order(2)
    @DisplayName("Verify legacy notifications deterministic backfill and no NULL event_keys")
    void testLegacyBackfill() throws SQLException {
        // Preflight & postflight validation
        String nullCheckSql = "SELECT COUNT(*) FROM notifications WHERE event_key IS NULL";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(nullCheckSql)) {
            assertThat(rs.next()).isTrue();
            assertThat(rs.getLong(1)).isEqualTo(0L);
        }

        // Verify deterministic legacy keys
        String checkKeySql = "SELECT id, event_key FROM notifications WHERE id IN (?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(checkKeySql)) {
            ps.setObject(1, legacyNotif1Id);
            ps.setObject(2, legacyNotif2Id);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    UUID id = (UUID) rs.getObject("id");
                    String eventKey = rs.getString("event_key");
                    assertThat(eventKey).isEqualTo("LEGACY_MIGRATION:" + id);
                }
            }
        }
    }

    @Test
    @Order(3)
    @DisplayName("Verify duplicate (recipient_id, event_key) is blocked with unique constraint violation")
    void testDuplicateRecipientEventKeyBlocked() throws SQLException {
        UUID newNotif1Id = UUID.randomUUID();
        UUID newNotif2Id = UUID.randomUUID();
        String eventKey = "TASK_ASSIGNED:test-task:assign-1";

        insertNotificationWithKey(newNotif1Id, legacyUser1Id, "TASK_ASSIGNED", "Title 1", eventKey);

        assertThatThrownBy(() ->
                insertNotificationWithKey(newNotif2Id, legacyUser1Id, "TASK_ASSIGNED", "Title 2", eventKey)
        ).isInstanceOf(SQLException.class)
                .hasMessageContaining("uk_notifications_recipient_event");
    }

    @Test
    @Order(4)
    @DisplayName("Verify two different recipients can have the same event_key")
    void testDifferentRecipientsSameEventKeyAllowed() throws SQLException {
        UUID notifUser1 = UUID.randomUUID();
        UUID notifUser2 = UUID.randomUUID();
        String sharedEventKey = "TASK_STATUS_CHANGED:shared-task:history-1";

        insertNotificationWithKey(notifUser1, legacyUser1Id, "TASK_STATUS_CHANGED", "Title A", sharedEventKey);
        insertNotificationWithKey(notifUser2, legacyUser2Id, "TASK_STATUS_CHANGED", "Title B", sharedEventKey);

        // Both rows must exist successfully
        String query = "SELECT COUNT(*) FROM notifications WHERE event_key = ?";
        try (PreparedStatement ps = connection.prepareStatement(query)) {
            ps.setString(1, sharedEventKey);
            try (ResultSet rs = ps.executeQuery()) {
                assertThat(rs.next()).isTrue();
                assertThat(rs.getLong(1)).isEqualTo(2L);
            }
        }
    }

    private static void insertUser(UUID userId, String username, String email) throws SQLException {
        String sql = """
                INSERT INTO users (id, username, password_hash, full_name, email, status, created_at, updated_at)
                VALUES (?, ?, 'hash', 'User ' || ?, ?, 'ACTIVE', NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
                """;
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setObject(1, userId);
            ps.setString(2, username);
            ps.setString(3, username);
            ps.setString(4, email);
            ps.executeUpdate();
        }
    }

    private static void insertLegacyNotification(UUID id, UUID recipientId, String type, String title) throws SQLException {
        String sql = """
                INSERT INTO notifications (id, recipient_id, type, title, message, is_read, created_at)
                VALUES (?, ?, ?, ?, 'Message', FALSE, NOW())
                """;
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setObject(1, id);
            ps.setObject(2, recipientId);
            ps.setString(3, type);
            ps.setString(4, title);
            ps.executeUpdate();
        }
    }

    private static void insertNotificationWithKey(UUID id, UUID recipientId, String type, String title, String eventKey) throws SQLException {
        String sql = """
                INSERT INTO notifications (id, recipient_id, type, title, message, event_key, is_read, created_at)
                VALUES (?, ?, ?, ?, 'Message', ?, FALSE, NOW())
                """;
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setObject(1, id);
            ps.setObject(2, recipientId);
            ps.setString(3, type);
            ps.setString(4, title);
            ps.setString(5, eventKey);
            ps.executeUpdate();
        }
    }
}
