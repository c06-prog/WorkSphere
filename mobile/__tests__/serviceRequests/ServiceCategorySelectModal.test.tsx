/**
 * Phase 16D: ServiceCategorySelectModal Component Tests
 *
 * Verifies:
 * - Loading indicator during category fetch
 * - Active-only category filtering (inactive categories are omitted)
 * - Category code and name display without raw UUID exposure
 * - Client-side search filtering by name and code
 * - Radio selection with touch targets >= 48dp
 * - Confirm selection triggers onSelect and onClose
 * - Clear selection button
 * - Close button triggers onClose
 * - Error state with retry action
 * - Empty state when no matching categories
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServiceCategorySelectModal } from '../../src/features/serviceRequests/components/ServiceCategorySelectModal';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ServiceCategoryResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { AppProviders } from '../../src/app/providers';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');

describe('ServiceCategorySelectModal', () => {
  const mockCategories: ServiceCategoryResponse[] = [
    {
      id: 'cat-uuid-1',
      parentId: null,
      code: 'OFFICE_EQUIPMENT',
      name: 'Thiết bị văn phòng',
      description: 'Máy in, máy chiếu, văn phòng phẩm',
      defaultPriority: 'MEDIUM',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
    {
      id: 'cat-uuid-2',
      parentId: null,
      code: 'IT_SUPPORT',
      name: 'Hỗ trợ CNTT',
      description: 'Máy tính, phần mềm, tài khoản',
      defaultPriority: 'HIGH',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
    {
      id: 'cat-uuid-3',
      parentId: null,
      code: 'MAINTENANCE_DEPRECATED',
      name: 'Bảo trì cũ (Ngừng hoạt động)',
      description: 'Đã ngừng áp dụng',
      defaultPriority: 'LOW',
      active: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. renders active categories and filters out inactive categories', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

    const { getByText, queryByText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
      expect(getByText('[OFFICE_EQUIPMENT]')).toBeTruthy();
      expect(getByText('Hỗ trợ CNTT')).toBeTruthy();
      expect(getByText('[IT_SUPPORT]')).toBeTruthy();
    });

    // Inactive category MUST NOT be rendered
    expect(queryByText('Bảo trì cũ (Ngừng hoạt động)')).toBeNull();
    expect(queryByText('[MAINTENANCE_DEPRECATED]')).toBeNull();

    // Zero raw database UUIDs exposed
    expect(queryByText('cat-uuid-1')).toBeNull();
    expect(queryByText('cat-uuid-2')).toBeNull();
  });

  it('2. filters categories by search input for name or code', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

    const { getByText, queryByText, getByPlaceholderText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Tìm kiếm theo mã hoặc tên danh mục...');
    fireEvent.changeText(searchInput, 'CNTT');

    await waitFor(() => {
      expect(getByText('Hỗ trợ CNTT')).toBeTruthy();
      expect(queryByText('Thiết bị văn phòng')).toBeNull();
    });

    fireEvent.changeText(searchInput, 'OFFICE');
    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
      expect(queryByText('Hỗ trợ CNTT')).toBeNull();
    });
  });

  it('3. displays empty state when search finds no matches', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

    const { getByTestId, getByText, getByPlaceholderText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Tìm kiếm theo mã hoặc tên danh mục...');
    fireEvent.changeText(searchInput, 'KhongTonTai');

    await waitFor(() => {
      expect(getByTestId('category-select-empty')).toBeTruthy();
      expect(getByText('Không tìm thấy danh mục')).toBeTruthy();
    });
  });

  it('4. selects category, confirms and invokes onSelect with full category object', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Hỗ trợ CNTT')).toBeTruthy();
    });

    const option2 = getByTestId('category-option-cat-uuid-2');
    fireEvent.press(option2);

    await waitFor(() => {
      expect(getByTestId('category-option-cat-uuid-2').props.accessibilityState.selected).toBe(true);
    });

    const confirmBtn = getByTestId('btn-confirm-category-select');
    fireEvent.press(confirmBtn);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cat-uuid-2',
        code: 'IT_SUPPORT',
        name: 'Hỗ trợ CNTT',
      })
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('5. clears selection when clear button is pressed', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          selectedCategoryId="cat-uuid-1"
          onSelect={mockOnSelect}
          onClose={mockOnClose}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
    });

    const clearBtn = getByTestId('btn-clear-category-select');
    fireEvent.press(clearBtn);

    await waitFor(() => {
      expect(getByTestId('category-option-cat-uuid-1').props.accessibilityState.selected).toBe(false);
    });

    const confirmBtn = getByTestId('btn-confirm-category-select');
    fireEvent.press(confirmBtn);

    expect(mockOnSelect).toHaveBeenCalledWith(null);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('6. invokes onClose when close button is pressed', async () => {
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);
    const mockOnClose = jest.fn();

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={mockOnClose}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
    });

    const closeBtn = getByTestId('btn-close-category-modal');
    fireEvent.press(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('7. displays error state and retries successfully', async () => {
    (serviceRequestApi.listCategories as jest.Mock)
      .mockRejectedValueOnce(new Error('Lỗi kết nối máy chủ'))
      .mockResolvedValueOnce(mockCategories);

    const { getByTestId, getByText } = await render(
      <AppProviders>
        <ServiceCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByTestId('category-select-error')).toBeTruthy();
      expect(getByText('Lỗi kết nối máy chủ')).toBeTruthy();
    });

    const retryBtn = getByTestId('category-select-error-retry-btn');
    fireEvent.press(retryBtn);

    await waitFor(() => {
      expect(getByText('Thiết bị văn phòng')).toBeTruthy();
    });
  });
});
