package com.worksphere.notification.dev;

import com.worksphere.identity.domain.User;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import com.worksphere.notification.infrastructure.persistence.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevNotificationFixtureProvisionerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("1. When disabled, provisioner performs no repository or database operations")
    void shouldDoNothingWhenDisabled() {
        DevNotificationFixtureProvisioner provisioner = new DevNotificationFixtureProvisioner(
                userRepository, notificationRepository, jdbcTemplate, false, "e2e_user"
        );

        provisioner.run(new DefaultApplicationArguments());

        verifyNoInteractions(userRepository, notificationRepository, jdbcTemplate);
    }

    @Test
    @DisplayName("2. When enabled but recipient cannot be resolved, skips execution safely")
    void shouldSkipWhenRecipientNotFound() {
        when(userRepository.findActiveByUsernameOrEmail("e2e_user")).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        DevNotificationFixtureProvisioner provisioner = new DevNotificationFixtureProvisioner(
                userRepository, notificationRepository, jdbcTemplate, true, "e2e_user"
        );

        provisioner.run(new DefaultApplicationArguments());

        verifyNoInteractions(notificationRepository);
    }

    @Test
    @DisplayName("3. When enabled with valid recipient, ensures target entities exist and inserts notifications")
    void shouldProvisionEntitiesAndNotificationsWhenEnabled() {
        UUID recipientId = UUID.randomUUID();
        User recipient = mock(User.class);
        when(recipient.getId()).thenReturn(recipientId);
        when(userRepository.findActiveByUsernameOrEmail("e2e_user")).thenReturn(Optional.of(recipient));

        // Mock counts for target entities
        when(jdbcTemplate.queryForObject(contains("projects"), eq(Integer.class), any())).thenReturn(1);
        when(jdbcTemplate.queryForObject(contains("tasks"), eq(Integer.class), any())).thenReturn(1);
        when(jdbcTemplate.queryForObject(contains("service_categories"), eq(Integer.class), any())).thenReturn(1);
        when(jdbcTemplate.queryForObject(contains("service_requests"), eq(Integer.class), any())).thenReturn(1);
        when(jdbcTemplate.queryForList(contains("assets"))).thenReturn(Collections.emptyList());

        DevNotificationFixtureProvisioner provisioner = new DevNotificationFixtureProvisioner(
                userRepository, notificationRepository, jdbcTemplate, true, "e2e_user"
        );

        provisioner.run(new DefaultApplicationArguments());

        // Verify 6 notifications inserted via insertIdempotent
        verify(notificationRepository, times(6)).insertIdempotent(
                any(), eq(recipientId), any(), any(), any(), any(), any(), any(), any()
        );

        // Verify read notification status updated
        verify(jdbcTemplate).update(contains("is_read = TRUE"), any(), eq(DevNotificationFixtureProvisioner.FIXTURE_NOTIF_READ_ID), eq(recipientId));
    }
}
