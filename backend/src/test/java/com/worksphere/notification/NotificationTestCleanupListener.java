package com.worksphere.notification;

import java.sql.Connection;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.support.AbstractTestExecutionListener;

public class NotificationTestCleanupListener extends AbstractTestExecutionListener {

    @Override
    public int getOrder() {
        return Integer.MIN_VALUE + 50;
    }

    @Override
    public void beforeTestMethod(TestContext testContext) {
        cleanup(testContext);
    }

    @Override
    public void afterTestMethod(TestContext testContext) {
        cleanup(testContext);
    }

    private void cleanup(TestContext testContext) {
        try {
            if (testContext.getApplicationContext().containsBean("dataSource")) {
                DataSource ds = testContext.getApplicationContext().getBean(DataSource.class);
                try (Connection conn = ds.getConnection();
                     Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("DELETE FROM notifications");
                    stmt.executeUpdate("DELETE FROM notification_preferences");
                }
            }
        } catch (Throwable ignored) {
            // Ignored if table does not exist or context not ready
        }
    }
}
