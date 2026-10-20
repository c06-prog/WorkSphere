/**
 * Phase 15C: TaskDetailScreen Component Tests
 *
 * Verifies:
 * - Loading indicator during initial load
 * - Canonical field rendering (title, project, description, status, priority, progress, dates, reporter, assignees)
 * - Hierarchy (parent task) and Milestone rendering
 * - Status history rendering
 * - Read-only subtask and comment summaries
 * - Strictly zero raw IDs, versions, or raw allowedActions strings exposed
 * - Unknown future allowedActions handled gracefully
 * - 404 Not Found error state (friendly message, back button, no retry loop)
 * - 403 Forbidden error state (safe permission message, back button)
 * - Network error with retryable action
 * - Non-blocking refresh error banner
 * - Back button triggers navigation.goBack()
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskDetailScreen } from '../../src/features/tasks/screens/TaskDetailScreen';
import { useTaskDetail } from '../../src/features/tasks/hooks/useTaskDetail';
import { AppProviders } from '../../src/app/providers';
import { TaskDetail } from '../../src/features/tasks/api/taskTypes';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockAddListener = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
      addListener: mockAddListener,
    }),
    useRoute: () => ({
      params: { taskId: 'task-123' },
    }),
  };
});

jest.mock('../../src/features/tasks/hooks/useTaskDetail');

describe('Phase 15C: TaskDetailScreen', () => {
  const mockTask: TaskDetail = {
    id: 'task-uuid-123',
    project: {
      id: 'proj-uuid-1',
      name: 'Hệ thống Quản lý Doanh nghiệp',
      code: 'ERP-CORE',
    },
    parentTaskId: 'parent-task-uuid',
    parentTask: {
      id: 'parent-task-uuid',
      title: 'Xây dựng phân hệ Tài chính',
    },
    milestoneId: 'ms-uuid-1',
    milestone: {
      id: 'ms-uuid-1',
      name: 'Giai đoạn 1: Khởi động',
    },
    title: 'Phát triển API thanh toán trực tuyến',
    description: 'Tích hợp cổng thanh toán VNPay và MoMo vào luồng checkout.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    progressPercent: 75,
    startDate: '2026-10-01T00:00:00Z',
    dueDate: '2026-10-25T00:00:00Z',
    completedAt: null,
    estimatedMinutes: 600,
    actualMinutes: 450,
    reporter: {
      id: 'user-reporter',
      fullName: 'Hoàng Văn Quản Lý',
      avatarUrl: null,
    },
    assignees: [
      {
        assignmentId: 'assign-1',
        id: 'user-dev-1',
        fullName: 'Lê Văn Lập Trình',
        avatarUrl: null,
        assignedAt: '2026-10-02T08:00:00Z',
      },
    ],
    subtasks: [
      {
        id: 'subtask-1',
        project: { id: 'proj-uuid-1', name: 'ERP-CORE', code: 'ERP-CORE' },
        title: 'Cấu hình webhook VNPay',
        status: 'COMPLETED',
        priority: 'HIGH',
        progressPercent: 100,
        assignees: [],
        overdue: false,
        subtaskCount: 0,
        completedSubtaskCount: 0,
        commentCount: 0,
        attachmentCount: 0,
        updatedAt: '2026-10-10T00:00:00Z',
      },
    ],
    recentComments: [
      {
        id: 'comment-1',
        taskId: 'task-uuid-123',
        author: {
          id: 'user-dev-1',
          fullName: 'Lê Văn Lập Trình',
          avatarUrl: null,
        },
        content: 'Đã hoàn tất kiểm thử sandbox VNPay.',
        isEdited: false,
        createdAt: '2026-10-15T10:00:00Z',
      },
    ],
    attachments: [],
    statusHistory: [
      {
        id: 'history-1',
        taskId: 'task-uuid-123',
        fromStatus: 'TODO',
        toStatus: 'IN_PROGRESS',
        comment: 'Bắt đầu tích hợp code sandbox',
        changedBy: {
          id: 'user-dev-1',
          fullName: 'Lê Văn Lập Trình',
          avatarUrl: null,
        },
        changedAt: '2026-10-02T08:30:00Z',
      },
    ],
    allowedActions: ['UPDATE', 'UPDATE_STATUS', 'UNKNOWN_FUTURE_ACTION'],
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
    version: 3,
  };

  const defaultHookReturn = {
    task: mockTask,
    initialLoading: false,
    refreshing: false,
    error: null,
    refreshError: null,
    load: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTaskDetail as jest.Mock).mockReturnValue({ ...defaultHookReturn });
  });

  it('1. renders loading indicator during initial load', async () => {
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: null,
      initialLoading: true,
    });

    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-loading')).toBeTruthy();
    expect(queryByTestId('screen-task-detail')).toBeNull();
  });

  it('2. renders canonical task details, badges, and progress', async () => {
    const { getByTestId, getByText, getAllByText, queryByText } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('screen-task-detail')).toBeTruthy();
    expect(getByTestId('task-detail-project-name').props.children).toBe(
      'Hệ thống Quản lý Doanh nghiệp'
    );
    expect(getByTestId('task-detail-title').props.children).toBe(
      'Phát triển API thanh toán trực tuyến'
    );
    expect(getByText('75%')).toBeTruthy();
    expect(getByTestId('task-detail-start-date').props.children).toBe('01/10/2026');
    expect(getByTestId('task-detail-due-date').props.children).toBe('25/10/2026');

    // Badges
    expect(getByText('Khẩn cấp')).toBeTruthy();
    expect(getAllByText('Đang làm').length).toBeGreaterThanOrEqual(1);

    // Description
    expect(getByTestId('task-detail-description').props.children).toBe(
      'Tích hợp cổng thanh toán VNPay và MoMo vào luồng checkout.'
    );

    // Parent task & Milestone
    expect(getByTestId('task-detail-parent-task').props.children).toBe(
      'Xây dựng phân hệ Tài chính'
    );
    expect(getByTestId('task-detail-milestone').props.children).toBe('Giai đoạn 1: Khởi động');

    // Personnel: Reporter & Assignees
    expect(getByTestId('task-detail-reporter').props.children).toBe('Hoàng Văn Quản Lý');
    expect(getByText('• Lê Văn Lập Trình')).toBeTruthy();

    // Summaries
    expect(getByText('1 công việc con')).toBeTruthy();
    expect(getByText('1 bình luận')).toBeTruthy();

    // Status History
    expect(getByTestId('task-detail-status-history')).toBeTruthy();
    expect(getByText('"Bắt đầu tích hợp code sandbox"')).toBeTruthy();

    // Strictly ZERO raw IDs or version numbers in rendered output
    expect(queryByText('task-uuid-123')).toBeNull();
    expect(queryByText('proj-uuid-1')).toBeNull();
    expect(queryByText('parent-task-uuid')).toBeNull();
    expect(queryByText('ms-uuid-1')).toBeNull();
    expect(queryByText('user-dev-1')).toBeNull();
    expect(queryByText('assign-1')).toBeNull();
    expect(queryByText('UNKNOWN_FUTURE_ACTION')).toBeNull();
  });

  it('3. renders fallback when assignees, parentTask, and milestone are null', async () => {
    const taskWithoutOptionals: TaskDetail = {
      ...mockTask,
      parentTaskId: null,
      parentTask: null,
      milestoneId: null,
      milestone: null,
      assignees: [],
      description: null,
    };

    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: taskWithoutOptionals,
    });

    const { getByTestId, queryByTestId } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-no-assignees')).toBeTruthy();
    expect(getByTestId('task-detail-description').props.children).toBe(
      'Chưa có mô tả cho công việc này.'
    );
    expect(queryByTestId('task-detail-parent-task')).toBeNull();
    expect(queryByTestId('task-detail-milestone')).toBeNull();
  });

  it('4. renders 404 Not Found error state without automatic retry', async () => {
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: null,
      error: {
        message: 'Công việc không tồn tại hoặc đã bị xóa.',
        isNotFound: true,
        isForbidden: false,
        retryable: false,
      },
    });

    const { getByTestId, getByText, queryByText } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-error')).toBeTruthy();
    expect(getByText('Không tìm thấy công việc')).toBeTruthy();
    expect(getByText('Công việc không tồn tại hoặc đã bị xóa.')).toBeTruthy();

    // No retry button on 404
    expect(queryByText('Thử lại')).toBeNull();

    // Back button works
    const backBtn = getByTestId('btn-back-from-error');
    fireEvent.press(backBtn);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('5. renders 403 Forbidden error state', async () => {
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: null,
      error: {
        message: 'Bạn không có quyền truy cập.',
        isNotFound: false,
        isForbidden: true,
        retryable: false,
      },
    });

    const { getByTestId, getByText, queryByText } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-error')).toBeTruthy();
    expect(getByText('Không có quyền truy cập')).toBeTruthy();
    expect(queryByText('Thử lại')).toBeNull();

    const backBtn = getByTestId('btn-back-from-error');
    fireEvent.press(backBtn);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('6. renders retryable error and triggers load on retry button press', async () => {
    const mockLoad = jest.fn();
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: null,
      error: {
        message: 'Lỗi kết nối máy chủ.',
        isNotFound: false,
        isForbidden: false,
        retryable: true,
      },
      load: mockLoad,
    });

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-error')).toBeTruthy();
    expect(getByText('Không thể tải công việc')).toBeTruthy();

    // Press retry
    const retryBtn = getByText('Thử lại');
    fireEvent.press(retryBtn);
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('7. renders refresh error banner when pull-to-refresh fails', async () => {
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      refreshError: 'Không thể làm mới dữ liệu. Vui lòng thử lại sau.',
    });

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(getByTestId('task-detail-refresh-error')).toBeTruthy();
    expect(getByText('Không thể làm mới dữ liệu. Vui lòng thử lại sau.')).toBeTruthy();
  });

  it('8. triggers navigation.goBack() when back button is pressed', async () => {
    const { getByTestId } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    const backButton = getByTestId('btn-task-detail-back');
    fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('9. renders Edit button when allowedActions includes UPDATE and navigates to EditTask', async () => {
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: {
        ...mockTask,
        allowedActions: ['UPDATE', 'CHANGE_STATUS'],
      },
    });

    const { getByTestId } = await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    const editBtn = getByTestId('btn-edit-task');
    expect(editBtn).toBeTruthy();

    fireEvent.press(editBtn);
    expect(mockNavigate).toHaveBeenCalledWith('EditTask', { taskId: 'task-uuid-123' });
  });

  it('10. focus listener refreshes authoritative detail on return focus without duplicate initial load', async () => {
    let focusCallback!: () => void;
    mockAddListener.mockImplementation((event: string, cb: () => void) => {
      if (event === 'focus') {
        focusCallback = cb;
      }
      return jest.fn();
    });

    const mockRefresh = jest.fn();
    (useTaskDetail as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      task: mockTask,
      refresh: mockRefresh,
    });

    await render(
      <AppProviders>
        <TaskDetailScreen />
      </AppProviders>
    );

    expect(mockAddListener).toHaveBeenCalledWith('focus', expect.any(Function));

    // First focus is initial mount: should NOT trigger duplicate refresh
    focusCallback();
    expect(mockRefresh).not.toHaveBeenCalled();

    // Second focus (returning from EditTask): MUST trigger authoritative refresh
    focusCallback();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
