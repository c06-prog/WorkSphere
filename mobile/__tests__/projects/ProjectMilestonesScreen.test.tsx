import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { ProjectMilestonesScreen } from '../../src/features/projects/screens/ProjectMilestonesScreen';
import { projectApi } from '../../src/features/projects/api/projectApi';
import { renderWithProviders } from '../test-utils';
import { MilestoneItem } from '../../src/features/projects/api/projectTypes';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: { projectId: 'project-1' },
    }),
  };
});

jest.mock('../../src/features/projects/api/projectApi');

describe('ProjectMilestonesScreen (SCR-PRJ-08 & SCR-PRJ-09)', () => {
  const mockMilestone1: MilestoneItem = {
    id: 'm-1',
    projectId: 'project-1',
    name: 'Khảo sát và thiết kế',
    description: 'Hoàn thành tài liệu phân tích nghiệp vụ',
    dueDate: '2026-10-15',
    completedAt: '2026-10-14T10:00:00Z',
    status: 'COMPLETED',
    createdBy: 'user-1',
    createdAt: '2026-09-01T00:00:00Z',
    version: 1,
  };

  const mockMilestone2: MilestoneItem = {
    id: 'm-2',
    projectId: 'project-1',
    name: 'Phát hành bản thử nghiệm MVP',
    description: 'Chạy thử nghiệm nội bộ',
    dueDate: '2026-11-30',
    completedAt: null,
    status: 'IN_PROGRESS',
    createdBy: 'user-1',
    createdAt: '2026-09-01T00:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (projectApi.listMilestones as jest.Mock).mockResolvedValue([
      mockMilestone1,
      mockMilestone2,
    ]);
  });

  const renderScreen = async () => {
    return await renderWithProviders(<ProjectMilestonesScreen />);
  };

  it('1. loads and renders milestones list', async () => {
    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByTestId('screen-project-milestones')).toBeTruthy();
      expect(getByText('Mốc tiến độ (2)')).toBeTruthy();
    });

    expect(getByTestId('milestone-item-m-1')).toBeTruthy();
    expect(getByText('Khảo sát và thiết kế')).toBeTruthy();
    expect(getByText('15/10/2026')).toBeTruthy();

    expect(getByTestId('milestone-item-m-2')).toBeTruthy();
    expect(getByText('Phát hành bản thử nghiệm MVP')).toBeTruthy();
    expect(getByText('30/11/2026')).toBeTruthy();
  });

  it('2. filters milestones by status chip', async () => {
    const { getByTestId, queryByTestId } = await renderScreen();

    await waitFor(() => {
      expect(getByTestId('screen-project-milestones')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('filter-milestone-completed'));
    });

    expect(getByTestId('milestone-item-m-1')).toBeTruthy();
    expect(queryByTestId('milestone-item-m-2')).toBeNull();
  });

  it('3. creates new milestone and prepends to list', async () => {
    const mockNewMilestone: MilestoneItem = {
      id: 'm-3',
      projectId: 'project-1',
      name: 'Nghiệm thu dự án',
      description: 'Nghiệm thu toàn diện',
      dueDate: '2026-12-25',
      completedAt: null,
      status: 'PLANNED',
      createdBy: 'user-1',
      createdAt: '2026-09-01T00:00:00Z',
      version: 1,
    };
    (projectApi.createMilestone as jest.Mock).mockResolvedValueOnce(mockNewMilestone);

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByTestId('screen-project-milestones')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-create-milestone'));
    });

    await waitFor(() => {
      expect(getByTestId('modal-create-milestone')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('create-milestone-name-input'), 'Nghiệm thu dự án');
      fireEvent.changeText(getByTestId('create-milestone-due-date-input'), '2026-12-25');
      fireEvent.changeText(getByTestId('create-milestone-description-input'), 'Nghiệm thu toàn diện');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-create-milestone'));
    });

    await waitFor(() => {
      expect(projectApi.createMilestone).toHaveBeenCalledWith('project-1', {
        name: 'Nghiệm thu dự án',
        description: 'Nghiệm thu toàn diện',
        dueDate: '2026-12-25',
      });
      expect(getByTestId('milestone-item-m-3')).toBeTruthy();
      expect(getByText('Nghiệm thu dự án')).toBeTruthy();
    });
  });

  it('4. navigates back when header back button is pressed', async () => {
    const { getByTestId } = await renderScreen();

    await waitFor(() => {
      expect(getByTestId('screen-project-milestones')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-milestones-back'));
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
