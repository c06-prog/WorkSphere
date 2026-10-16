package com.worksphere.notification.application;

import com.worksphere.notification.domain.NotificationReferenceType;
import com.worksphere.notification.domain.NotificationType;
import com.worksphere.task.domain.Task;
import com.worksphere.task.domain.TaskAssignment;
import com.worksphere.task.domain.TaskStatus;
import com.worksphere.task.infrastructure.persistence.TaskAssignmentRepository;
import com.worksphere.task.infrastructure.persistence.TaskRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Scheduled scanner for task deadline notifications (TASK_DUE_SOON and TASK_OVERDUE).
 * Coordinates multi-instance scanning using PostgreSQL transaction advisory lock (module key 1101).
 * Per 02_USER_ROLES_AND_WORKFLOWS.md Section 8.5 and reports/DECISIONS.md D-050.
 */
@Service
public class TaskDeadlineScanner {

    private static final Logger log = LoggerFactory.getLogger(TaskDeadlineScanner.class);
    private static final Duration DUE_SOON_WINDOW = Duration.ofHours(72);
    private static final int ADVISORY_LOCK_KEY = 1101;

    @PersistenceContext
    private EntityManager entityManager;

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final NotificationApplicationService notificationService;
    private final Clock clock;

    @Value("${worksphere.notification.task-deadline-batch-size:100}")
    private int batchSize = 100;

    public TaskDeadlineScanner(
            TaskRepository taskRepository,
            TaskAssignmentRepository taskAssignmentRepository,
            NotificationApplicationService notificationService,
            Clock clock
    ) {
        this.taskRepository = taskRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.notificationService = notificationService;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${worksphere.notification.task-deadline-scan-delay:PT15M}")
    @ConditionalOnProperty(name = "worksphere.notification.scheduling.enabled", havingValue = "true", matchIfMissing = true)
    public void scheduledScan() {
        scanDeadlines();
    }

    /**
     * Executes one scan iteration with advisory locking and batching.
     * Returns the count of evaluated tasks.
     */
    @Transactional
    public int scanDeadlines() {
        Boolean acquired = (Boolean) entityManager
                .createNativeQuery("SELECT pg_try_advisory_xact_lock(:key, 1)")
                .setParameter("key", ADVISORY_LOCK_KEY)
                .getSingleResult();

        if (!Boolean.TRUE.equals(acquired)) {
            log.info("Advisory lock ({}, 1) could not be acquired, skipping task deadline scan", ADVISORY_LOCK_KEY);
            return 0;
        }

        Instant now = clock.instant();
        Instant dueSoonThreshold = now.plus(DUE_SOON_WINDOW);

        String jpql = """
                SELECT t FROM Task t
                WHERE t.deleted = false
                  AND t.status NOT IN (:completed, :cancelled)
                  AND t.dueDate IS NOT NULL
                  AND EXISTS (
                      SELECT 1 FROM TaskAssignment ta
                      WHERE ta.taskId = t.id AND ta.active = true
                  )
                ORDER BY t.dueDate ASC, t.id ASC
                """;

        TypedQuery<Task> query = entityManager.createQuery(jpql, Task.class)
                .setParameter("completed", TaskStatus.COMPLETED)
                .setParameter("cancelled", TaskStatus.CANCELLED)
                .setMaxResults(Math.max(1, batchSize));

        List<Task> tasks = query.getResultList();
        int processedCount = 0;

        for (Task task : tasks) {
            Instant dueDate = task.getDueDate();
            if (dueDate == null) {
                continue;
            }

            long dueAtEpochMilli = dueDate.toEpochMilli();
            List<TaskAssignment> activeAssignments = taskAssignmentRepository.findByTaskIdAndActiveTrue(task.getId());
            if (activeAssignments.isEmpty()) {
                continue;
            }

            if (dueDate.isBefore(now)) {
                // TASK_OVERDUE
                String eventKey = "TASK_OVERDUE:" + task.getId() + ":" + dueAtEpochMilli;
                String title = "Công việc quá hạn";
                String message = "Công việc " + task.getTitle() + " đã quá hạn hoàn thành";

                for (TaskAssignment assignment : activeAssignments) {
                    notificationService.deliverInAppNotification(
                            assignment.getAssigneeId(),
                            NotificationType.TASK_OVERDUE,
                            title,
                            message,
                            NotificationReferenceType.TASK,
                            task.getId(),
                            eventKey
                    );
                }
                processedCount++;
            } else if (!dueDate.isAfter(dueSoonThreshold)) {
                // TASK_DUE_SOON (now <= dueDate < now + 72 hours)
                String eventKey = "TASK_DUE_SOON:" + task.getId() + ":" + dueAtEpochMilli;
                String title = "Công việc sắp đến hạn";
                String message = "Công việc " + task.getTitle() + " sẽ đến hạn vào " + dueDate;

                for (TaskAssignment assignment : activeAssignments) {
                    notificationService.deliverInAppNotification(
                            assignment.getAssigneeId(),
                            NotificationType.TASK_DUE_SOON,
                            title,
                            message,
                            NotificationReferenceType.TASK,
                            task.getId(),
                            eventKey
                    );
                }
                processedCount++;
            }
        }

        log.info("Task deadline scan completed. Evaluated {} tasks at {}", processedCount, now);
        return processedCount;
    }
}
