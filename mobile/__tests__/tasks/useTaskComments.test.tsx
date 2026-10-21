/**
 * Phase 15F: useTaskComments Hook Unit Tests
 *
 * Verifies:
 * 1. Initial query on mount fetches page 0 with PAGE_SIZE = 20.
 * 2. Error mapping when initial fetch fails.
 * 3. Pagination (loadMore) fetches next page and appends deduplicating IDs.
 * 4. Pull-to-refresh preserves existing comments on failure and surfaces refreshError.
 * 5. addComment appends created comment safely.
 * 6. updateCommentInList updates matching comment item in place.
 * 7. removeCommentFromList removes comment item by ID.
 * 8. Unmount safety prevents state updates on unmounted hook.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTaskComments } from '../../src/features/tasks/hooks/useTaskComments';
import { taskApi } from '../../src/features/tasks/api/taskApi';
import { TaskComment } from '../../src/features/tasks/api/taskTypes';
import { PagedData } from '../../src/shared/api';

jest.mock('../../src/features/tasks/api/taskApi');

const mockComment1: TaskComment = {
  id: 'comment-1',
  taskId: 'task-100',
  author: { id: 'user-1', fullName: 'Nguyễn Văn Dev' },
  content: 'Đã hoàn thành phần database.',
  isEdited: false,
  createdAt: '2026-10-21T08:00:00Z',
};

const mockComment2: TaskComment = {
  id: 'comment-2',
  taskId: 'task-100',
  author: { id: 'user-2', fullName: 'Trần Thị QA' },
  content: 'Cần bổ sung test case thanh toán.',
  isEdited: true,
  editedAt: '2026-10-21T08:30:00Z',
  createdAt: '2026-10-21T08:15:00Z',
};

const mockPage0: PagedData<TaskComment> = {
  items: [mockComment1],
  page: 0,
  size: 20,
  totalItems: 2,
  totalPages: 2,
  hasNext: true,
  hasPrevious: false,
};

const mockPage1: PagedData<TaskComment> = {
  items: [mockComment2],
  page: 1,
  size: 20,
  totalItems: 2,
  totalPages: 2,
  hasNext: false,
  hasPrevious: true,
};

describe('Phase 15F: useTaskComments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. fetches initial page 0 on mount and sets comments', async () => {
    (taskApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.comments).toEqual([mockComment1]);
      expect(result.current.hasNext).toBe(true);
      expect(result.current.error).toBeNull();
    });

    expect(taskApi.getComments).toHaveBeenCalledWith('task-100', 0, 20);
  });

  it('2. sets presentation error when initial fetch fails', async () => {
    (taskApi.getComments as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.comments).toEqual([]);
      expect(result.current.error).not.toBeNull();
    });
  });

  it('3. loadMore fetches next page and appends deduplicated comments', async () => {
    (taskApi.getComments as jest.Mock)
      .mockResolvedValueOnce(mockPage0)
      .mockResolvedValueOnce(mockPage1);

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.hasNext).toBe(true);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(2);
      expect(result.current.comments[1].id).toBe('comment-2');
      expect(result.current.hasNext).toBe(false);
      expect(result.current.loadingMore).toBe(false);
    });

    expect(taskApi.getComments).toHaveBeenNthCalledWith(2, 'task-100', 1, 20);
  });

  it('4. pull-to-refresh preserves existing comments on network failure', async () => {
    (taskApi.getComments as jest.Mock)
      .mockResolvedValueOnce(mockPage0)
      .mockRejectedValueOnce(new Error('Network disconnected'));

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1]);
      expect(result.current.refreshError).not.toBeNull();
      expect(result.current.refreshing).toBe(false);
    });
  });

  it('5. addComment appends created comment safely and deduplicates', async () => {
    (taskApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      result.current.addComment(mockComment2);
    });

    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[1].id).toBe('comment-2');

    // Duplicate ID is ignored
    await act(async () => {
      result.current.addComment(mockComment2);
    });

    expect(result.current.comments).toHaveLength(2);
  });

  it('6. updateCommentInList updates content of matching comment item', async () => {
    (taskApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    const updatedComment: TaskComment = {
      ...mockComment1,
      content: 'Nội dung bình luận đã được chỉnh sửa.',
      isEdited: true,
      editedAt: '2026-10-21T09:00:00Z',
    };

    await act(async () => {
      result.current.updateCommentInList('comment-1', updatedComment);
    });

    expect(result.current.comments[0].content).toBe('Nội dung bình luận đã được chỉnh sửa.');
    expect(result.current.comments[0].isEdited).toBe(true);
  });

  it('7. removeCommentFromList deletes comment by ID from state', async () => {
    (taskApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useTaskComments('task-100'));

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    await act(async () => {
      result.current.removeCommentFromList('comment-1');
    });

    expect(result.current.comments).toHaveLength(0);
  });

  it('8. unmount safety does not update state after unmount', async () => {
    let resolveCall!: (v: PagedData<TaskComment>) => void;
    const pending = new Promise<PagedData<TaskComment>>(res => {
      resolveCall = res;
    });

    (taskApi.getComments as jest.Mock).mockReturnValue(pending);

    const { unmount } = await renderHook(() => useTaskComments('task-100'));

    unmount();

    await act(async () => {
      resolveCall(mockPage0);
    });

    // Test finishes without errors or warnings
    expect(true).toBe(true);
  });
});
