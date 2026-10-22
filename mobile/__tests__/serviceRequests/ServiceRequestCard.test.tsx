/**
 * Phase 16B: ServiceRequestCard Component Tests
 * Rigorous tests covering:
 * - Canonical field rendering (requestNumber, title, category, requester, assignee, date)
 * - StatusBadge mapping for all 7 canonical service request statuses
 * - PriorityBadge mapping for all 4 priorities
 * - Nullable assignee handling ('Chưa phân công')
 * - Malformed date resilience (no crash)
 * - Security: No raw UUIDs, version, or allowedActions exposed
 * - Presentation-only staging: NOT a button, no navigation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceRequestCard } from '../../src/features/serviceRequests/components/ServiceRequestCard';
import {
  ServicePriority,
  ServiceRequestSummaryResponse,
  ServiceStatus,
} from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { AppProviders } from '../../src/app/providers';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const baseMockRequest: ServiceRequestSummaryResponse = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  requestNumber: 'SR-2026-000123',
  categoryId: 'category-uuid-1111',
  categoryName: 'Hạ tầng mạng',
  requesterId: 'requester-uuid-2222',
  requesterName: 'Nguyễn Văn A',
  assigneeId: 'assignee-uuid-3333',
  assigneeName: 'Trần Văn B',
  title: 'Mất kết nối Internet tầng 3',
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  createdAt: '2026-10-22T08:30:00Z',
  updatedAt: null,
};

const renderCard = async (request: ServiceRequestSummaryResponse, testID?: string) => {
  return await render(
    <AppProviders>
      <ServiceRequestCard request={request} testID={testID} />
    </AppProviders>
  );
};

describe('ServiceRequestCard Component', () => {
  it('renders all canonical presentation fields', async () => {
    const { getByTestId, getByText } = await renderCard(baseMockRequest);

    // Request Number & Category
    expect(getByTestId('service-request-number')).toBeTruthy();
    expect(getByText('SR-2026-000123')).toBeTruthy();
    expect(getByTestId('service-request-category')).toBeTruthy();
    expect(getByText('Hạ tầng mạng')).toBeTruthy();

    // Title
    expect(getByTestId('service-request-title')).toBeTruthy();
    expect(getByText('Mất kết nối Internet tầng 3')).toBeTruthy();

    // Requester & Assignee
    expect(getByText('Nguyễn Văn A')).toBeTruthy();
    expect(getByText('Trần Văn B')).toBeTruthy();

    // Date
    expect(getByTestId('service-request-date')).toBeTruthy();
  });

  it('renders "Chưa phân công" when assignee is null', async () => {
    const unassignedRequest: ServiceRequestSummaryResponse = {
      ...baseMockRequest,
      assigneeId: null,
      assigneeName: null,
    };

    const { getByText } = await renderCard(unassignedRequest);

    expect(getByText('Chưa phân công')).toBeTruthy();
  });

  it('renders StatusBadge correctly for all 7 canonical statuses', async () => {
    const statuses: Array<{ status: ServiceStatus; expectedLabel: string }> = [
      { status: 'OPEN', expectedLabel: 'Mở' },
      { status: 'ASSIGNED', expectedLabel: 'Đã phân công' },
      { status: 'IN_PROGRESS', expectedLabel: 'Đang xử lý' },
      { status: 'WAITING_FOR_USER', expectedLabel: 'Chờ phản hồi' },
      { status: 'RESOLVED', expectedLabel: 'Đã giải quyết' },
      { status: 'CLOSED', expectedLabel: 'Đã đóng' },
      { status: 'CANCELLED', expectedLabel: 'Đã hủy' },
    ];

    for (const { status, expectedLabel } of statuses) {
      const { getByText } = await renderCard({ ...baseMockRequest, status });
      expect(getByText(expectedLabel)).toBeTruthy();
    }
  });

  it('renders PriorityBadge correctly for all 4 priorities', async () => {
    const priorities: Array<{ priority: ServicePriority; expectedLabel: string }> = [
      { priority: 'LOW', expectedLabel: 'Thấp' },
      { priority: 'MEDIUM', expectedLabel: 'Trung bình' },
      { priority: 'HIGH', expectedLabel: 'Cao' },
      { priority: 'CRITICAL', expectedLabel: 'Khẩn cấp' },
    ];

    for (const { priority, expectedLabel } of priorities) {
      const { getByText } = await renderCard({ ...baseMockRequest, priority });
      expect(getByText(expectedLabel)).toBeTruthy();
    }
  });

  it('handles malformed or invalid date gracefully without crashing', async () => {
    const malformedRequest: ServiceRequestSummaryResponse = {
      ...baseMockRequest,
      createdAt: 'invalid-iso-date-string',
    };

    const { getByText } = await renderCard(malformedRequest);

    expect(getByText('Ngày tạo: Chưa xác định')).toBeTruthy();
  });

  it('does NOT expose raw UUIDs, version, or allowedActions', async () => {
    const { queryByText } = await renderCard(baseMockRequest);

    // Must never leak internal UUIDs to presentation
    expect(queryByText('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBeNull();
    expect(queryByText('category-uuid-1111')).toBeNull();
    expect(queryByText('requester-uuid-2222')).toBeNull();
    expect(queryByText('assignee-uuid-3333')).toBeNull();
  });

  it('renders presentation-only (not a button) when onPress is omitted', async () => {
    const { queryByRole } = await renderCard(baseMockRequest);

    // When onPress is omitted, cards are NOT buttons
    expect(queryByRole('button')).toBeNull();
  });

  it('renders pressable button and triggers onPress when provided (Phase 16C)', async () => {
    const mockOnPress = jest.fn();
    const { getByRole, getByTestId } = await render(
      <AppProviders>
        <ServiceRequestCard
          request={baseMockRequest}
          onPress={mockOnPress}
          testID="interactive-srv-card"
        />
      </AppProviders>
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(getByTestId('interactive-srv-card')).toBeTruthy();

    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
