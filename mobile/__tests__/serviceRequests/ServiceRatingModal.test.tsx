/**
 * Phase 16F: ServiceRatingModal and Rating Flow Unit Tests
 * Testing score validation, comment bounds, duplicate submit lock,
 * and duplicate rating conflict error mapping.
 */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ServiceRatingModal } from '../../src/features/serviceRequests/components/ServiceRatingModal';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { ServiceRatingResponse, ServiceRequestDetailResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi', () => ({
  serviceRequestApi: {
    rateServiceRequest: jest.fn(),
  },
}));

describe('ServiceRatingModal Component', () => {
  const mockRequest: ServiceRequestDetailResponse = {
    id: 'req-rate-test-id',
    requestNumber: 'SR-2026-0099',
    title: 'Hỏng máy in tầng 3',
    description: 'Chi tiết hỏng máy in',
    category: { id: 'cat-1', code: 'IT', name: 'IT Support' },
    priority: 'HIGH',
    status: 'CLOSED',
    requester: { id: 'user-requester', fullName: 'Nguyen Van Requester', email: 'requester@worksphere.com' },
    assignee: null,
    asset: null,
    resolvedAt: '2026-10-24T11:00:00Z',
    closedAt: '2026-10-24T12:00:00Z',
    cancelledAt: null,
    rating: null,
    allowedActions: ['RATE'],
    version: 4,
    histories: [],
    comments: [],
    attachments: [],
    createdAt: '2026-10-24T08:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
  };

  const mockRatingResponse: ServiceRatingResponse = {
    id: 'rating-new-id',
    requestId: 'req-rate-test-id',
    ratedBy: 'user-requester',
    ratedByName: 'Nguyen Van Requester',
    score: 5,
    comment: 'Rất hài lòng với hỗ trợ nhiệt tình',
    createdAt: '2026-10-24T12:05:00Z',
  };

  const defaultProps = {
    visible: true,
    request: mockRequest,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. validates that score is required before submit button enables', async () => {
    const { getByTestId } = await render(
      <ThemeProvider>
        <ServiceRatingModal {...defaultProps} />
      </ThemeProvider>
    );

    expect(getByTestId('modal-service-rating')).toBeTruthy();
    expect(getByTestId('btn-submit-rating').props.accessibilityState.disabled).toBe(true);

    // Select 4 stars
    await act(async () => {
      fireEvent.press(getByTestId('btn-rating-star-4'));
    });

    expect(getByTestId('btn-submit-rating').props.accessibilityState.disabled).toBe(false);
  });

  it('2. submits rating with exact payload (unversioned) and calls onSuccess', async () => {
    (serviceRequestApi.rateServiceRequest as jest.Mock).mockResolvedValueOnce(mockRatingResponse);

    const { getByTestId } = await render(
      <ThemeProvider>
        <ServiceRatingModal {...defaultProps} />
      </ThemeProvider>
    );

    // Select 5 stars
    await act(async () => {
      fireEvent.press(getByTestId('btn-rating-star-5'));
    });

    // Enter comment
    await act(async () => {
      fireEvent.changeText(
        getByTestId('input-rating-comment'),
        'Rất hài lòng với hỗ trợ nhiệt tình'
      );
    });

    // Submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-rating'));
    });

    await waitFor(() => {
      expect(serviceRequestApi.rateServiceRequest).toHaveBeenCalledWith('req-rate-test-id', {
        score: 5,
        comment: 'Rất hài lòng với hỗ trợ nhiệt tình',
      });
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockRatingResponse);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('3. enforces synchronous submit lock preventing double submissions', async () => {
    let resolveRate!: (val: ServiceRatingResponse) => void;
    const ratePromise = new Promise<ServiceRatingResponse>(res => {
      resolveRate = res;
    });
    (serviceRequestApi.rateServiceRequest as jest.Mock).mockReturnValueOnce(ratePromise);

    const { getByTestId } = await render(
      <ThemeProvider>
        <ServiceRatingModal {...defaultProps} />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-rating-star-5'));
    });

    // Double press submit
    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-rating'));
      fireEvent.press(getByTestId('btn-submit-rating'));
    });

    resolveRate(mockRatingResponse);
    await act(async () => {});

    expect(serviceRequestApi.rateServiceRequest).toHaveBeenCalledTimes(1);
  });

  it('4. displays mapped error when already rated (SERVICE_RATING_ALREADY_EXISTS)', async () => {
    (serviceRequestApi.rateServiceRequest as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          code: 'SERVICE_RATING_ALREADY_EXISTS',
          message: 'Yêu cầu dịch vụ này đã được đánh giá trước đó',
          timestamp: '2026-10-24T15:00:00Z',
        },
      },
    });

    const { getByTestId } = await render(
      <ThemeProvider>
        <ServiceRatingModal {...defaultProps} />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-rating-star-5'));
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-submit-rating'));
    });

    await waitFor(() => {
      expect(getByTestId('rating-error-message')).toBeTruthy();
      expect(getByTestId('rating-error-message').props.children).toContain(
        'Yêu cầu này đã được đánh giá trước đó'
      );
    });
  });
});
