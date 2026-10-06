package com.worksphere;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class MigrationIntegrationTest {

    @Test
    void testFlywayMigration() {
        // This test ensures that the application context loads successfully,
        // which implies that Flyway migrations have been executed successfully
        // without any syntax errors or issues against the configured database.
    }
}
