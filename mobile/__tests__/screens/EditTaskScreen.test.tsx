/**
 * Phase 15D: EditTaskScreen Component Tests (SCR-TSK-04)
 * Verifies:
 * - Authoritative initial load on mount via taskApi.getTaskDetail
 * - Prefills fields accurately (title, description, priority, dates)
 * - Version is captured internally and never visible in user-facing UI
 * - Submits exact UpdateTaskRequest payload (with version, without status/progress/assignees)
 * - Synchronous submit lock prevents duplicate requests
 * - On success, calls navigation.goBack()
 * - On HTTP 409 conflict, displays conflict dialog with "Tải lại dữ liệu" action
 * - Reloads latest version on conflict confirm
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EditTaskScreen } from '../../src/features/tasks/screens/EditTaskScreen';
import { taskApi } from '../../src/features/tasks/api/taskApi';
import { TaskDetail } from '../../src/features/tasks/api/taskTypes';
import { AppProviders } from '../../src/app/providers';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/tasks/api/taskApi');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      params: { taskId: 'task-uuid-1' },
    }),
  };
});

describe('EditTaskScreen (SCR-TSK-04)', () => {
  const mockTask: TaskDetail = {
    id: 'task-uuid-1',
    project: { id: 'proj-1', code: 'WS-CORE', name: 'WorkSphere Platform' },
    title: 'Xây dựng module nhiệm vụ',
    description: 'Chi tiết mô tả nhiệm vụ',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    progressPercent: 50,
    startDate: '2026-10-01',
    dueDate: '2026-10-25T00:00:00Z',
    estimatedMinutes: 240,
    reporter: { id: 'user-rep', fullName: 'Người giao việc', avatarUrl: null },
    assignees: [],
    subtasks: [],
    recentComments: [],
    attachments: [],
    statusHistory: [],
    allowedActions: ['UPDATE'],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
    version: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. performs authoritative load on mount and prefills form fields without exposing version', async () => {
    (taskApi.getTaskDetail as jest.Mock).mockResolvedValueOnce(mockTask);

    const { getByTestId, getByText, queryByText } = await render(
      <AppProviders>
        <EditTaskScreen />
      </AppProviders>
    );

    await waitFor(() => {
      expect(taskApi.getTaskDetail).toHaveBeenCalledWith('task-uuid-1');
      expect(getByTestId('input-edit-task-title').props.value).toBe('Xây dựng module nhiệm vụ');
      expect(getByTestId('input-edit-task-description').props.value).toBe('Chi tiết mô tả nhiệm vụ');
      expect(getByTestId('input-edit-task-start-date').props.value).toBe('2026-10-01');
      expect(getByTestId('input-edit-task-due-date').props.value).toBe('2026-10-25');
      expect(getByTestId('input-edit-task-estimated-minutes').props.value).toBe('240');
      expect(getByText('Dự án: WorkSphere Platform')).toBeTruthy();
    });

    // Strictly ZERO version numbers exposed in text
    expect(queryByText('version')).toBeNull();
    expect(queryByText('Version: 3')).toBeNull();
  });

  it('2. submits exact UpdateTaskRequest payload with internal version and calls goBack on success', async () => {
    (taskApi.getTaskDetail as jest.Mock).mockResolvedValueOnce(mockTask);
    (taskApi.updateTask as jest.Mock).mockResolvedValueOnce({
      ...mockTask,
      title: 'Xây dựng module nhiệm vụ (Đã sửa)',
      version: 4,
    });

    const { getByTestId } = await render(
      <AppProviders>
        <EditTaskScreen />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByTestId('input-edit-task-title').props.value).toBe('Xây dựng module nhiệm vụ');
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('input-edit-task-title'), 'Xây dựng module nhiệm vụ (Đã sửa)');
    });

    // Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-edit-task'));
    });

    await waitFor(() => {
      expect(taskApi.updateTask).toHaveBeenCalledTimes(1);
      expect(taskApi.updateTask).toHaveBeenCalledWith('task-uuid-1', {
        title: 'Xây dựng module nhiệm vụ (Đã sửa)',
        description: 'Chi tiết mô tả nhiệm vụ',
        priority: 'HIGH',
        startDate: '2026-10-01',
        dueDate: '2026-10-25',
        estimatedMinutes: 240,
        version: 3,
      });
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  it('3. enforces synchronous submit lock on rapid double-press (only 1 PUT call)', async () => {
    (taskApi.getTaskDetail as jest.Mock).mockResolvedValueOnce(mockTask);

    let resolveUpdate!: (val: TaskDetail) => void;
    const pendingPromise = new Promise<TaskDetail>(res => {
      resolveUpdate = res;
    });
    (taskApi.updateTask as jest.Mock).mockReturnValue(pendingPromise);

    const { getByTestId } = await render(
      <AppProviders>
        <EditTaskScreen />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByTestId('input-edit-task-title').props.value).toBe('Xây dựng module nhiệm vụ');
    });

    const submitBtn = getByTestId('btn-submit-edit-task');
    await act(async () => {
      fireEvent.press(submitBtn);
      fireEvent.press(submitBtn);
    });

    expect(taskApi.updateTask).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveUpdate({ ...mockTask, version: 4 });
      await pendingPromise;
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('4. displays conflict dialog on HTTP 409 and reloads latest authoritative data on confirm', async () => {
    (taskApi.getTaskDetail as jest.Mock).mockResolvedValueOnce(mockTask);
    (taskApi.updateTask as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          code: 'OPTIMISTIC_LOCK_CONFLICT',
          message: 'Dữ liệu đã bị thay đổi bởi người khác.',
        },
      },
    });

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <EditTaskScreen />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByTestId('input-edit-task-title').props.value).toBe('Xây dựng module nhiệm vụ');
    });

    // Press save -> triggers 409 conflict
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-edit-task'));
    });

    await waitFor(() => {
      expect(getByText('Xung đột dữ liệu')).toBeTruthy();
      expect(
        getByText(
          'Dữ liệu công việc đã được thay đổi bởi người dùng khác trong khi bạn đang chỉnh sửa. Bạn có muốn tải lại dữ liệu mới nhất không?'
        )
      ).toBeTruthy();
    });

    // Confirm reload latest
    const updatedTask: TaskDetail = {
      ...mockTask,
      title: 'Tiêu đề mới nhất từ máy chủ',
      version: 4,
    };
    (taskApi.getTaskDetail as jest.Mock).mockResolvedValueOnce(updatedTask);

    await act(async () => {
      fireEvent.press(getByText('Tải lại dữ liệu'));
    });

    await waitFor(() => {
      expect(taskApi.getTaskDetail).toHaveBeenCalledTimes(2);
      expect(getByTestId('input-edit-task-title').props.value).toBe('Tiêu đề mới nhất từ máy chủ');
    });
  });
});
