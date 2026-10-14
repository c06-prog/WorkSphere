package com.worksphere.project.application;

import com.worksphere.project.api.request.CreateMilestoneRequest;
import com.worksphere.project.api.response.MilestoneResponse;
import com.worksphere.project.domain.Milestone;
import com.worksphere.project.domain.Project;
import com.worksphere.project.domain.ProjectStatus;
import com.worksphere.project.infrastructure.persistence.MilestoneRepository;
import com.worksphere.project.infrastructure.persistence.ProjectRepository;
import com.worksphere.shared.exception.BusinessRuleException;
import com.worksphere.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Application service managing project milestones.
 */
@Service
public class MilestoneApplicationService {

    private static final Logger log = LoggerFactory.getLogger(MilestoneApplicationService.class);

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;

    public MilestoneApplicationService(
            ProjectRepository projectRepository,
            MilestoneRepository milestoneRepository
    ) {
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
    }

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestones(UUID projectId) {
        Project project = projectRepository.findActiveById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("PROJECT_NOT_FOUND", "Dự án không tồn tại"));

        return milestoneRepository.findAllByProjectIdOrderByDueDateAsc(project.getId())
                .stream()
                .map(MilestoneResponse::from)
                .toList();
    }

    @Transactional
    public MilestoneResponse createMilestone(UUID projectId, CreateMilestoneRequest request, UUID currentUserId) {
        Project project = projectRepository.findActiveById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("PROJECT_NOT_FOUND", "Dự án không tồn tại"));

        if (project.getStatus() == ProjectStatus.COMPLETED || project.getStatus() == ProjectStatus.CANCELLED) {
            throw new BusinessRuleException("PROJECT_NOT_ACTIVE", "Không thể tạo milestone cho dự án đã hoàn thành hoặc bị huỷ");
        }

        Milestone milestone = Milestone.create(
                UUID.randomUUID(),
                project.getId(),
                request.name(),
                request.description(),
                request.dueDate(),
                currentUserId
        );

        Milestone saved = milestoneRepository.save(milestone);
        log.info("Milestone created. id={}, projectId={}, name={}", saved.getId(), projectId, saved.getName());
        return MilestoneResponse.from(saved);
    }
}
