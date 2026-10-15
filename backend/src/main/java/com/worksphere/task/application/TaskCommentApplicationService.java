package com.worksphere.task.application;

import com.worksphere.identity.domain.User;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import com.worksphere.project.infrastructure.persistence.ProjectMemberRepository;
import com.worksphere.shared.exception.BusinessRuleException;
import com.worksphere.shared.exception.ResourceNotFoundException;
import com.worksphere.shared.response.PagedData;
import com.worksphere.shared.security.WorkSphereUserPrincipal;
import com.worksphere.task.api.request.CreateTaskCommentRequest;
import com.worksphere.task.api.request.UpdateTaskCommentRequest;
import com.worksphere.task.api.response.TaskCommentResponse;
import com.worksphere.task.domain.Task;
import com.worksphere.task.domain.TaskComment;
import com.worksphere.task.infrastructure.persistence.TaskCommentRepository;
import com.worksphere.task.infrastructure.persistence.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Application service managing Task comments.
 * Per 06_API_CONTRACT.md section 12.12-12.15.
 */
@Service
public class TaskCommentApplicationService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public TaskCommentApplicationService(
            TaskCommentRepository commentRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository
    ) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedData<TaskCommentResponse> getComments(UUID taskId, Pageable pageable, WorkSphereUserPrincipal principal) {
        Task task = findTaskOrThrow(taskId);
        verifyProjectAccess(task.getProjectId(), principal);

        Page<TaskComment> commentPage = commentRepository.findByTaskIdAndDeletedFalse(taskId, pageable);
        if (commentPage.isEmpty()) {
            return PagedData.from(commentPage, Collections.emptyList());
        }

        Set<UUID> authorIds = commentPage.getContent().stream()
                .map(TaskComment::getAuthorId)
                .collect(Collectors.toSet());
        Map<UUID, User> userMap = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<TaskCommentResponse> responses = commentPage.getContent().stream()
                .map(c -> toCommentResponse(c, userMap.get(c.getAuthorId())))
                .toList();

        return PagedData.from(commentPage, responses);
    }

    @Transactional
    public TaskCommentResponse createComment(UUID taskId, CreateTaskCommentRequest request, WorkSphereUserPrincipal principal) {
        Task task = findTaskOrThrow(taskId);
        verifyProjectAccess(task.getProjectId(), principal);

        if (request.parentCommentId() != null) {
            TaskComment parent = commentRepository.findByIdAndTaskIdAndDeletedFalse(request.parentCommentId(), taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("COMMENT_NOT_FOUND",
                            "Bình luận cha không tồn tại hoặc không thuộc công việc này"));
        }

        TaskComment comment = TaskComment.create(
                UUID.randomUUID(),
                taskId,
                principal.userId(),
                request.content(),
                request.parentCommentId()
        );

        TaskComment saved = commentRepository.save(comment);
        User author = userRepository.findById(principal.userId()).orElse(null);
        return toCommentResponse(saved, author);
    }

    @Transactional
    public TaskCommentResponse updateComment(UUID taskId, UUID commentId, UpdateTaskCommentRequest request, WorkSphereUserPrincipal principal) {
        Task task = findTaskOrThrow(taskId);
        TaskComment comment = commentRepository.findByIdAndTaskIdAndDeletedFalse(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("COMMENT_NOT_FOUND", "Bình luận không tồn tại"));

        boolean isAuthor = comment.getAuthorId().equals(principal.userId());
        boolean isAdmin = hasSystemAdminRole(principal);
        if (!isAuthor && !isAdmin) {
            throw new BusinessRuleException("FORBIDDEN", "Chỉ tác giả hoặc quản trị viên mới có thể chỉnh sửa bình luận");
        }

        comment.editContent(request.content());
        TaskComment saved = commentRepository.save(comment);
        User author = userRepository.findById(saved.getAuthorId()).orElse(null);
        return toCommentResponse(saved, author);
    }

    @Transactional
    public void deleteComment(UUID taskId, UUID commentId, WorkSphereUserPrincipal principal) {
        Task task = findTaskOrThrow(taskId);
        TaskComment comment = commentRepository.findByIdAndTaskIdAndDeletedFalse(commentId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("COMMENT_NOT_FOUND", "Bình luận không tồn tại"));

        boolean isAuthor = comment.getAuthorId().equals(principal.userId());
        boolean isAdmin = hasSystemAdminRole(principal);
        if (!isAuthor && !isAdmin) {
            throw new BusinessRuleException("FORBIDDEN", "Chỉ tác giả hoặc quản trị viên mới có thể xóa bình luận");
        }

        comment.softDelete();
        commentRepository.save(comment);
    }

    private Task findTaskOrThrow(UUID taskId) {
        return taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("TASK_NOT_FOUND", "Công việc không tồn tại"));
    }

    private void verifyProjectAccess(UUID projectId, WorkSphereUserPrincipal principal) {
        if (principal == null) {
            throw new BusinessRuleException("FORBIDDEN", "Yêu cầu xác thực người dùng");
        }
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(projectId, principal.userId());
        if (!isMember && !hasSystemAdminRole(principal)) {
            throw new BusinessRuleException("FORBIDDEN", "Người dùng không có quyền truy cập dự án này");
        }
    }

    private boolean hasSystemAdminRole(WorkSphereUserPrincipal principal) {
        if (principal == null || principal.user() == null || principal.user().getRoles() == null) {
            return false;
        }
        return principal.user().getRoles().stream()
                .anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getCode()));
    }

    private TaskCommentResponse toCommentResponse(TaskComment comment, User author) {
        TaskCommentResponse.AuthorInfo authorInfo = null;
        if (author != null) {
            authorInfo = new TaskCommentResponse.AuthorInfo(
                    author.getId(),
                    author.getFullName(),
                    null
            );
        } else {
            authorInfo = new TaskCommentResponse.AuthorInfo(
                    comment.getAuthorId(),
                    "Unknown User",
                    null
            );
        }

        return new TaskCommentResponse(
                comment.getId(),
                comment.getTaskId(),
                authorInfo,
                comment.getContent(),
                comment.getParentId(),
                comment.isEdited(),
                comment.getEditedAt(),
                comment.getCreatedAt()
        );
    }
}
