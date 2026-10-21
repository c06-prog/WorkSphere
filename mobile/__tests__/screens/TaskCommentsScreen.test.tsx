/**
 * Phase 15F: TaskCommentsScreen Component Tests (SCR-TSK-06)
 *
 * Verifies:
 * 1. Initial loading indicator rendered.
 * 2. Error state with retry action rendered on initial fetch failure.
 * 3. Header back button navigates back.
 * 4. Comments list rendered with author, timestamp, content, and (đã chỉnh sửa) label.
 * 5. Empty state rendered when comments list is empty.
 * 6. Non-blocking refresh error banner rendered.
 * 7. Permission gating for edit: author only.
 * 8. Permission gating for delete: author OR admin.
 * 9. Permission gating for add: input bar when canAddComment=true; notice when canAddComment=false.
 * 10. Add comment flow: calls taskApi.createComment, calls addComment, clears input.
 * 11. Edit comment flow: opens modal, calls taskApi.updateComment, calls updateCommentInList, closes modal.
 * 12. Delete comment flow: opens confirmation dialog, calls taskApi.deleteComment, calls removeCommentFromList, closes dialog.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { TaskCommentsScreen } from '../../src/features/tasks/screens/TaskCommentsScreen';
import { useTaskComments } from '../../src/features/tasks/hooks/useTaskComments';
import { taskApi } from '../../src/features/tasks/api/taskApi';
import { AppProviders } from '../../src/app/providers';
import { TaskComment } from '../../src/features/tasks/api/taskTypes';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

let mockRouteParams: {
  taskId: string;
  canAddComment?: boolean;
} = {
  taskId: 'task-100',
  canAddComment: true,
};

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      params: mockRouteParams,
    }),
  };
});

let mockCurrentUser: {
  id: string;
  fullName: string;
  roles: string[];
} | null = {
  id: 'user-author-1',
  fullName: 'Nguyễn Văn Tác Giả',
  roles: ['EMPLOYEE'],
};

jest.mock('../../src/app/auth', () => {
  const actual = jest.requireActual('../../src/app/auth');
  return {
    ...actual,
    useAuth: () => ({
      currentUser: mockCurrentUser,
      isAuthenticated: !!mockCurrentUser,
      isLoading: false,
    }),
  };
});

jest.mock('../../src/features/tasks/hooks/useTaskComments');
jest.mock('../../src/features/tasks/api/taskApi', () => ({
  taskApi: {
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

const mockCommentAuthor: TaskComment = {
  id: 'comment-1',
  taskId: 'task-100',
  author: {
    id: 'user-author-1',
    fullName: 'Nguyễn Văn Tác Giả',
  },
  content: 'Đây là bình luận của tác giả.',
  isEdited: false,
  createdAt: '2026-10-21T08:00:00Z',
};

const mockCommentOther: TaskComment = {
  id: 'comment-2',
  taskId: 'task-100',
  author: {
    id: 'user-other-2',
    fullName: 'Trần Thị Đồng Nghiệp',
  },
  content: 'Bình luận từ đồng nghiệp đã được cập nhật.',
  isEdited: true,
  createdAt: '2026-10-21T08:30:00Z',
};

const defaultHookReturn = {
  comments: [mockCommentAuthor, mockCommentOther],
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  refreshError: null,
  load: jest.fn(),
  refresh: jest.fn(),
  loadMore: jest.fn(),
  addComment: jest.fn(),
  updateCommentInList: jest.fn(),
  removeCommentFromList: jest.fn(),
};

describe('Phase 15F: TaskCommentsScreen (SCR-TSK-06)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      taskId: 'task-100',
      canAddComment: true,
    };
    mockCurrentUser = {
      id: 'user-author-1',
      fullName: 'Nguyễn Văn Tác Giả',
      roles: ['EMPLOYEE'],
    };
    (useTaskComments as jest.Mock).mockReturnValue({ ...defaultHookReturn });
  });

  test('renders loading indicator when comments are loading', async () => {
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
      comments: [],
    });

    const { getByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    expect(getByTestId('comments-loading')).toBeTruthy();
  });

  test('renders error state and retry invokes load() on failure', async () => {
    const mockLoad = jest.fn();
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      loading: false,
      error: { code: 'TASK_ERROR', message: 'Không thể kết nối máy chủ.' },
      load: mockLoad,
    });

    const { getByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    expect(getByTestId('comments-error')).toBeTruthy();
    expect(getByTestId('comments-error-state')).toBeTruthy();

    const retryBtn = getByTestId('comments-error-state-retry-btn');
    fireEvent.press(retryBtn);
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  test('header back button navigates back', async () => {
    const { getByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    const backBtn = getByTestId('btn-comments-back');
    fireEvent.press(backBtn);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  test('renders comments list with author name, time, content, and (đã chỉnh sửa) indicator', async () => {
    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // First comment (not edited)
    expect(getByTestId('comment-item-comment-1')).toBeTruthy();
    expect(getByTestId('comment-author-comment-1').props.children).toBe('Nguyễn Văn Tác Giả');
    expect(getByTestId('comment-content-comment-1').props.children).toBe('Đây là bình luận của tác giả.');
    expect(queryByTestId('comment-edited-label-comment-1')).toBeNull();

    // Second comment (edited)
    expect(getByTestId('comment-item-comment-2')).toBeTruthy();
    expect(getByTestId('comment-author-comment-2').props.children).toBe('Trần Thị Đồng Nghiệp');
    expect(getByTestId('comment-content-comment-2').props.children).toBe('Bình luận từ đồng nghiệp đã được cập nhật.');
    expect(getByTestId('comment-edited-label-comment-2')).toBeTruthy();
  });

  test('renders empty state when comments list is empty', async () => {
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      comments: [],
    });

    const { getByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    expect(getByTestId('comments-empty')).toBeTruthy();
  });

  test('renders non-blocking refresh error banner when refresh fails', async () => {
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      refreshError: 'Lỗi cập nhật bình luận mới nhất.',
    });

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    expect(getByTestId('comments-refresh-error')).toBeTruthy();
    expect(getByText('Lỗi cập nhật bình luận mới nhất.')).toBeTruthy();
  });

  test('permission gating: author can edit own comment; cannot edit others', async () => {
    // Current user is user-author-1
    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // Can edit comment-1 (author)
    expect(getByTestId('btn-edit-comment-comment-1')).toBeTruthy();

    // Cannot edit comment-2 (not author)
    expect(queryByTestId('btn-edit-comment-comment-2')).toBeNull();
  });

  test('permission gating: author and admin can delete; normal user cannot delete others', async () => {
    // Regular user author
    const { getByTestId, queryByTestId, rerender } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // Can delete comment-1 (author)
    expect(getByTestId('btn-delete-comment-comment-1')).toBeTruthy();
    // Cannot delete comment-2 (not author, not admin)
    expect(queryByTestId('btn-delete-comment-comment-2')).toBeNull();

    // Switch to ADMIN user who is not author of comment-2
    mockCurrentUser = {
      id: 'admin-user-99',
      fullName: 'Quản Trị Viên',
      roles: ['ADMIN'],
    };

    await rerender(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // Admin can delete comment-2 even though not author
    expect(getByTestId('btn-delete-comment-comment-2')).toBeTruthy();
    // Admin CANNOT edit comment-2 (editing is author-only)
    expect(queryByTestId('btn-edit-comment-comment-2')).toBeNull();
  });

  test('permission gating: renders disabled notice when canAddComment=false', async () => {
    mockRouteParams = {
      taskId: 'task-100',
      canAddComment: false,
    };

    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    expect(getByTestId('comments-add-disabled-notice')).toBeTruthy();
    expect(queryByTestId('input-comment-content')).toBeNull();
    expect(queryByTestId('btn-send-comment')).toBeNull();
  });

  test('add comment flow calls taskApi.createComment and addComment hook method', async () => {
    const mockAddCommentHook = jest.fn();
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      addComment: mockAddCommentHook,
    });

    const newCommentRes: TaskComment = {
      id: 'comment-created-99',
      taskId: 'task-100',
      author: {
        id: 'user-author-1',
        fullName: 'Nguyễn Văn Tác Giả',
      },
      content: 'Bình luận mới thêm vào.',
      isEdited: false,
      createdAt: '2026-10-21T09:00:00Z',
    };
    (taskApi.createComment as jest.Mock).mockResolvedValue(newCommentRes);

    const { getByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    const input = getByTestId('input-comment-content');

    await act(async () => {
      fireEvent.changeText(input, 'Bình luận mới thêm vào.');
    });

    const sendBtn = getByTestId('btn-send-comment');
    await act(async () => {
      fireEvent.press(sendBtn);
    });

    await waitFor(() => {
      expect(taskApi.createComment).toHaveBeenCalledWith('task-100', {
        content: 'Bình luận mới thêm vào.',
      });
      expect(mockAddCommentHook).toHaveBeenCalledWith(newCommentRes);
    });

    // Input cleared
    expect(input.props.value).toBe('');
  });

  test('edit comment flow opens modal, updates content, and closes modal', async () => {
    const mockUpdateCommentHook = jest.fn();
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      updateCommentInList: mockUpdateCommentHook,
    });

    const updatedCommentRes: TaskComment = {
      ...mockCommentAuthor,
      content: 'Nội dung bình luận sau chỉnh sửa.',
      isEdited: true,
      editedAt: '2026-10-21T09:05:00Z',
    };
    (taskApi.updateComment as jest.Mock).mockResolvedValue(updatedCommentRes);

    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // Open edit modal
    const editBtn = getByTestId('btn-edit-comment-comment-1');
    await act(async () => {
      fireEvent.press(editBtn);
    });

    expect(getByTestId('edit-comment-modal')).toBeTruthy();
    const editInput = getByTestId('input-edit-comment-content');
    expect(editInput.props.value).toBe(mockCommentAuthor.content);

    // Change text and save
    await act(async () => {
      fireEvent.changeText(editInput, 'Nội dung bình luận sau chỉnh sửa.');
    });

    const saveBtn = getByTestId('btn-save-edit-comment');
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    await waitFor(() => {
      expect(taskApi.updateComment).toHaveBeenCalledWith(
        'task-100',
        'comment-1',
        { content: 'Nội dung bình luận sau chỉnh sửa.' }
      );
      expect(mockUpdateCommentHook).toHaveBeenCalledWith('comment-1', updatedCommentRes);
    });

    // Modal closed
    await waitFor(() => {
      expect(queryByTestId('btn-save-edit-comment')).toBeNull();
    });
  });

  test('delete comment flow opens confirmation dialog and calls taskApi.deleteComment', async () => {
    const mockRemoveCommentHook = jest.fn();
    (useTaskComments as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      removeCommentFromList: mockRemoveCommentHook,
    });
    (taskApi.deleteComment as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskCommentsScreen />
      </AppProviders>
    );

    // Open delete confirmation
    const deleteBtn = getByTestId('btn-delete-comment-comment-1');
    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    expect(getByTestId('dialog-delete-comment')).toBeTruthy();

    // Confirm deletion
    const confirmBtn = getByTestId('dialog-delete-comment-confirm-btn');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    await waitFor(() => {
      expect(taskApi.deleteComment).toHaveBeenCalledWith('task-100', 'comment-1');
      expect(mockRemoveCommentHook).toHaveBeenCalledWith('comment-1');
    });

    // Dialog closed
    await waitFor(() => {
      expect(queryByTestId('dialog-delete-comment-confirm-btn')).toBeNull();
    });
  });
});
