/**
 * Phase 16F: ServiceRequestCommentsScreen Integration Tests (SCR-SRV-05)
 * Testing direct route navigation, independent Detail capability loading,
 * fail-closed authorization, internal comment toggle, and comment submission.
 */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ServiceRequestCommentsScreen } from '../../src/features/serviceRequests/screens/ServiceRequestCommentsScreen';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import {
  ServiceCommentResponse,
  ServiceRequestDetailResponse,
} from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { PagedData } from '../../src/shared/api';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: { requestId: 'req-screen-test-id' },
    }),
  };
});

let mockCurrentUser: any = {
  id: 'user-requester',
  username: 'requester',
  roles: ['EMPLOYEE'],
  permissions: ['SERVICE_REQUEST_READ'],
};

jest.mock('../../src/app/auth/AuthProvider', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}));

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi', () => ({
  serviceRequestApi: {
    getServiceRequestDetail: jest.fn(),
    getComments: jest.fn(),
    createComment: jest.fn(),
  },
}));

describe('ServiceRequestCommentsScreen Component', () => {
  const mockDetail: ServiceRequestDetailResponse = {
    id: 'req-screen-test-id',
    requestNumber: 'SR-2026-0100',
    title: 'Hỏng điều hòa phòng họp',
    description: 'Điều hòa không mát',
    category: { id: 'cat-fac', code: 'FACILITIES', name: 'Facilities' },
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    requester: { id: 'user-requester', fullName: 'Nguyen Van Requester', email: 'requester@worksphere.com' },
    assignee: { assignmentId: 'asg-tech', id: 'user-tech', fullName: 'Tran Van Tech', email: 'technician@worksphere.com', assignedAt: '2026-10-24T09:00:00Z' },
    asset: null,
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    rating: null,
    allowedActions: ['COMMENT'],
    version: 2,
    histories: [],
    comments: [],
    attachments: [],
    createdAt: '2026-10-24T08:00:00Z',
    updatedAt: '2026-10-24T09:00:00Z',
  };

  const mockCommentItem: ServiceCommentResponse = {
    id: 'comment-101',
    requestId: 'req-screen-test-id',
    authorId: 'user-tech',
    authorName: 'Tran Van Tech',
    content: 'Đã tiếp nhận và đang kiểm tra gas điều hòa.',
    isInternal: false,
    isEdited: false,
    editedAt: null,
    createdAt: '2026-10-24T09:30:00Z',
    updatedAt: '2026-10-24T09:30:00Z',
  };

  const mockCommentPage: PagedData<ServiceCommentResponse> = {
    items: [mockCommentItem],
    page: 0,
    size: 20,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = {
      id: 'user-requester',
      username: 'requester',
      roles: ['EMPLOYEE'],
      permissions: ['SERVICE_REQUEST_READ'],
    };
  });

  it('1. independently loads Detail capability and comments on mount', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetail);
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockCommentPage);

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <ServiceRequestCommentsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('screen-service-request-comments')).toBeTruthy();
      expect(getByText('SR-2026-0100 • Hỏng điều hòa phòng họp')).toBeTruthy();
      expect(getByText('Tran Van Tech')).toBeTruthy();
      expect(getByText('Đã tiếp nhận và đang kiểm tra gas điều hòa.')).toBeTruthy();
    });

    expect(serviceRequestApi.getServiceRequestDetail).toHaveBeenCalledWith('req-screen-test-id');
    expect(serviceRequestApi.getComments).toHaveBeenCalledWith('req-screen-test-id', {
      page: 0,
      size: 20,
      sort: 'createdAt,asc',
    });
  });

  it('2. fails closed: hides bottom Add Comment section when allowedActions lacks COMMENT', async () => {
    const detailWithoutComment = {
      ...mockDetail,
      allowedActions: [],
    };
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(detailWithoutComment);
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockCommentPage);

    const { queryByTestId } = await render(
      <ThemeProvider>
        <ServiceRequestCommentsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(queryByTestId(`comment-item-${mockCommentItem.id}`)).toBeTruthy();
    });

    // Add comment input is hidden!
    expect(queryByTestId('input-service-comment-content')).toBeNull();
    expect(queryByTestId('btn-submit-service-comment')).toBeNull();
  });

  it('3. hides internal note toggle for standard requester', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetail);
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockCommentPage);

    const { getByTestId, queryByTestId } = await render(
      <ThemeProvider>
        <ServiceRequestCommentsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('input-service-comment-content')).toBeTruthy();
    });

    // Standard requester cannot see internal switch
    expect(queryByTestId('switch-internal-comment')).toBeNull();
  });

  it('4. shows internal note toggle when caller is active assignee', async () => {
    mockCurrentUser = {
      id: 'user-tech',
      username: 'technician',
      roles: ['EMPLOYEE'],
      permissions: ['SERVICE_REQUEST_READ'],
    };

    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetail);
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockCommentPage);

    const { getByTestId } = await render(
      <ThemeProvider>
        <ServiceRequestCommentsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('input-service-comment-content')).toBeTruthy();
      expect(getByTestId('switch-internal-comment')).toBeTruthy();
    });
  });

  it('5. submits a new comment and appends it to the list', async () => {
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValueOnce(mockDetail);
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockCommentPage);

    const createdComment: ServiceCommentResponse = {
      id: 'comment-102',
      requestId: 'req-screen-test-id',
      authorId: 'user-requester',
      authorName: 'Nguyen Van Requester',
      content: 'Cảm ơn anh kỹ thuật viên!',
      isInternal: false,
      isEdited: false,
      editedAt: null,
      createdAt: '2026-10-24T10:00:00Z',
      updatedAt: '2026-10-24T10:00:00Z',
    };
    (serviceRequestApi.createComment as jest.Mock).mockResolvedValueOnce(createdComment);

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <ServiceRequestCommentsScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('input-service-comment-content')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(
        getByTestId('input-service-comment-content'),
        'Cảm ơn anh kỹ thuật viên!'
      );
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-service-comment'));
    });

    await waitFor(() => {
      expect(serviceRequestApi.createComment).toHaveBeenCalledWith('req-screen-test-id', {
        content: 'Cảm ơn anh kỹ thuật viên!',
        isInternal: false,
      });
      expect(getByText('Cảm ơn anh kỹ thuật viên!')).toBeTruthy();
    });
  });
});
