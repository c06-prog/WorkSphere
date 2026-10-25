package com.worksphere.identity.infrastructure.persistence;

import com.worksphere.identity.domain.Permission;
import com.worksphere.identity.domain.Role;
import com.worksphere.identity.domain.User;
import com.worksphere.identity.domain.UserRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PostgreSQL Testcontainers integration test for {@link UserRepository#findActiveWithRolesById(UUID)}.
 * Validates distinct semantics, eager fetching of roles and permissions without duplicate user rows,
 * and filtering of soft-deleted records.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Transactional
class UserRepositoryIntegrationTest {

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
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("1. findActiveWithRolesById loads active user with roles and permissions without duplicates")
    void shouldFindActiveWithRolesByIdEagerlyWithoutDuplicates() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId, "test_repo_user", "repo_user@worksphere.local", "hash123", "Repo Test User");
        user.lock();
        user.unlock(); // ACTIVE
        userRepository.save(user);

        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Seeded role ADMIN must exist"));

        UserRole userRole = new UserRole(userId, adminRole.getId(), Instant.now(), null);
        userRoleRepository.save(userRole);

        entityManager.flush();
        entityManager.clear();

        Optional<User> result = userRepository.findActiveWithRolesById(userId);

        assertThat(result).isPresent();
        User loadedUser = result.get();
        assertThat(loadedUser.getId()).isEqualTo(userId);
        assertThat(loadedUser.getUsername()).isEqualTo("test_repo_user");
        assertThat(loadedUser.getRoles()).isNotEmpty();

        Role loadedRole = loadedUser.getRoles().stream()
                .filter(r -> "ADMIN".equals(r.getCode()))
                .findFirst()
                .orElse(null);

        assertThat(loadedRole).isNotNull();
        assertThat(loadedRole.getPermissions()).isNotEmpty();
        Set<Permission> permissions = loadedRole.getPermissions();
        assertThat(permissions.size()).isGreaterThanOrEqualTo(20);
    }

    @Test
    @DisplayName("2. findActiveWithRolesById excludes deleted user")
    void shouldExcludeDeletedUser() {
        UUID userId = UUID.randomUUID();
        User user = User.create(userId, "deleted_repo_user", "deleted_repo@worksphere.local", "hash123", "Deleted Repo User");
        user.lock();
        user.unlock();
        userRepository.save(user);

        entityManager.flush();

        // Mark deleted via jdbcTemplate directly to simulate soft delete state
        jdbcTemplate.update("UPDATE users SET is_deleted = true WHERE id = ?", userId);

        entityManager.clear();

        Optional<User> result = userRepository.findActiveWithRolesById(userId);
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("3. findActiveWithRolesById returns empty for unknown UUID")
    void shouldReturnEmptyForUnknownId() {
        Optional<User> result = userRepository.findActiveWithRolesById(UUID.randomUUID());
        assertThat(result).isEmpty();
    }
}
