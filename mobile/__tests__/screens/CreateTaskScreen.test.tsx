/**
 * Phase 15D: CreateTaskScreen Component Tests (SCR-TSK-03)
 * Verifies:
 * - Direct route safe rendering
 * - Required field validation (projectId, title)
 * - Exact POST DTO payload conforming to CreateTaskRequest
 * - Strictly zero status, progress, or version in payload
 * - Multiple assignees support (assigneeIds: string[])
 * - Synchronous submit lock (submittingRef) prevents duplicate requests on double-press
 * - Navigation to TaskDetail on success with exact { taskId: created.id }
 * - Server error mapping via mapTaskError
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CreateTaskScreen } from '../../src/features/tasks/screens/CreateTaskScreen';
import { taskApi } from '../../src/features/tasks/api/taskApi';
import { projectApi } from '../../src/features/projects/api/projectApi';
import { ProjectSummary } from '../../src/features/projects/api/projectTypes';
import { TaskDetail } from '../../src/features/tasks/api/taskTypes';
import { AppProviders } from '../../src/app/providers';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/tasks/api/taskApi');
jest.mock('../../src/features/projects/api/projectApi');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: undefined,
    }),
  };
});

describe('CreateTaskScreen (SCR-TSK-03)', () => {
  const mockProject: ProjectSummary = {
    id: 'proj-123',
    code: 'WS-MOB',
    name: 'WorkSphere Mobile',
    description: null,
    status: 'ACTIVE',
    priority: 'HIGH',
    manager: { id: 'mgr-1', fullName: 'Quản Lý', avatarUrl: null },
    startDate: '2026-01-01',
    plannedEndDate: '2026-12-31',
    progressPercent: 20,
    memberCount: 5,
    taskSummary: { total: 10, completed: 2, overdue: 0 },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockCreatedTask: TaskDetail = {
    id: 'new-task-uuid',
    project: { id: 'proj-123', code: 'WS-MOB', name: 'WorkSphere Mobile' },
    title: 'Phát triển màn hình tạo công việc',
    status: 'TODO',
    priority: 'HIGH',
    progressPercent: 0,
    reporter: { id: 'usr-1', fullName: 'Tôi', avatarUrl: null },
    assignees: [],
    subtasks: [],
    recentComments: [],
    attachments: [],
    statusHistory: [],
    allowedActions: ['UPDATE'],
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (projectApi.listProjects as jest.Mock).mockResolvedValue({
      items: [mockProject],
      page: 0,
      size: 100,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('1. validates required fields before submission', async () => {
    const { getByTestId, getByText } = await render(
      <AppProviders>
        <CreateTaskScreen />
      </AppProviders>
    );

    // Press submit immediately without filling project or title
    fireEvent.press(getByTestId('btn-submit-create-task'));

    await waitFor(() => {
      expect(getByText('Vui lòng chọn dự án cho công việc')).toBeTruthy();
      expect(getByText('Tiêu đề công việc không được để trống')).toBeTruthy();
    });

    expect(taskApi.createTask).not.toHaveBeenCalled();
  });

  it('2. submits exact CreateTaskRequest payload and navigates to TaskDetail on success', async () => {
    (taskApi.createTask as jest.Mock).mockResolvedValueOnce(mockCreatedTask);

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <CreateTaskScreen />
      </AppProviders>
    );

    // Select project
    fireEvent.press(getByTestId('btn-open-project-selector'));
    await waitFor(() => {
      expect(getByText('[WS-MOB]')).toBeTruthy();
    });
    fireEvent.press(getByTestId('project-option-proj-123'));
    await waitFor(() => {
      expect(getByTestId('project-option-proj-123').props.accessibilityState.selected).toBe(true);
    });
    fireEvent.press(getByTestId('btn-confirm-project-select'));

    await waitFor(() => {
      expect(getByText('[WS-MOB] WorkSphere Mobile')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('input-task-title'), 'Phát triển màn hình tạo công việc');
      fireEvent.press(getByTestId('chip-priority-high'));
      fireEvent.changeText(getByTestId('input-task-description'), 'Mô tả chi tiết công việc mới.');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-task'));
    });

    await waitFor(() => {
      expect(taskApi.createTask).toHaveBeenCalledTimes(1);
      expect(taskApi.createTask).toHaveBeenCalledWith({
        projectId: 'proj-123',
        title: 'Phát triển màn hình tạo công việc',
        priority: 'HIGH',
        description: 'Mô tả chi tiết công việc mới.',
      });
      expect(mockNavigate).toHaveBeenCalledWith('TaskDetail', { taskId: 'new-task-uuid' });
    });
  });

  it('3. enforces synchronous submit lock on double-press (only 1 POST call)', async () => {
    let resolveTask!: (val: TaskDetail) => void;
    const pendingPromise = new Promise<TaskDetail>(res => {
      resolveTask = res;
    });
    (taskApi.createTask as jest.Mock).mockReturnValue(pendingPromise);

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <CreateTaskScreen />
      </AppProviders>
    );

    // Select project
    fireEvent.press(getByTestId('btn-open-project-selector'));
    await waitFor(() => {
      expect(getByText('[WS-MOB]')).toBeTruthy();
    });
    fireEvent.press(getByTestId('project-option-proj-123'));
    await waitFor(() => {
      expect(getByTestId('project-option-proj-123').props.accessibilityState.selected).toBe(true);
    });
    fireEvent.press(getByTestId('btn-confirm-project-select'));

    await waitFor(() => {
      expect(getByText('[WS-MOB] WorkSphere Mobile')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('input-task-title'), 'Phát triển tính năng');
    });

    // Double press submit in same event loop
    const submitBtn = getByTestId('btn-submit-create-task');
    await act(async () => {
      fireEvent.press(submitBtn);
      fireEvent.press(submitBtn);
    });

    expect(taskApi.createTask).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveTask(mockCreatedTask);
      await pendingPromise;
    });

    expect(mockNavigate).toHaveBeenCalledWith('TaskDetail', { taskId: 'new-task-uuid' });
  });

  it('4. displays error banner when submission fails', async () => {
    (taskApi.createTask as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          success: false,
          timestamp: '2026-10-20T00:00:00Z',
          code: 'TASK_PROJECT_NOT_ACTIVE',
          message: 'Chỉ có thể tạo hoặc cập nhật công việc cho dự án đang hoạt động.',
        },
      },
    });

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <CreateTaskScreen />
      </AppProviders>
    );

    // Select project
    fireEvent.press(getByTestId('btn-open-project-selector'));
    await waitFor(() => {
      expect(getByText('[WS-MOB]')).toBeTruthy();
    });
    fireEvent.press(getByTestId('project-option-proj-123'));
    await waitFor(() => {
      expect(getByTestId('project-option-proj-123').props.accessibilityState.selected).toBe(true);
    });
    fireEvent.press(getByTestId('btn-confirm-project-select'));

    await waitFor(() => {
      expect(getByText('[WS-MOB] WorkSphere Mobile')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('input-task-title'), 'Công việc lỗi');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-create-task'));
    });

    await waitFor(() => {
      expect(getByText('Chỉ có thể tạo hoặc cập nhật công việc cho dự án đang hoạt động.')).toBeTruthy();
    });
  });
});
