/**
 * AssetCategorySelectModal Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AssetCategorySelectModal } from '../../../src/features/assets/components/AssetCategorySelectModal';
import { assetApi } from '../../../src/features/assets/api/assetApi';
import { AssetCategoryResponse } from '../../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../../src/features/assets/api/assetApi');

describe('AssetCategorySelectModal', () => {
  const mockCategories: AssetCategoryResponse[] = [
    {
      id: 'cat-uuid-1',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
      description: 'Dành cho nhân viên',
      active: true,
    },
    {
      id: 'cat-uuid-2',
      code: 'MONITOR',
      name: 'Màn hình ngoài',
      description: 'Màn hình máy tính',
      active: true,
    },
    {
      id: 'cat-uuid-3',
      code: 'OLD_PRINTER',
      name: 'Máy in cũ',
      description: 'Đã ngừng áp dụng',
      active: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders active categories and filters out inactive categories', async () => {
    (assetApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

    const { getByText, queryByText } = await render(
      <ThemeProvider>
        <AssetCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Máy tính xách tay')).toBeTruthy();
      expect(getByText('[LAPTOP]')).toBeTruthy();
      expect(getByText('Màn hình ngoài')).toBeTruthy();
      expect(getByText('[MONITOR]')).toBeTruthy();
    });

    // Inactive category omitted
    expect(queryByText('Máy in cũ')).toBeNull();
    expect(queryByText('[OLD_PRINTER]')).toBeNull();
  });

  it('selects and confirms category selection', async () => {
    (assetApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);
    const mockSelect = jest.fn();
    const mockClose = jest.fn();

    const { getByTestId } = await render(
      <ThemeProvider>
        <AssetCategorySelectModal
          visible={true}
          onSelect={mockSelect}
          onClose={mockClose}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('asset-category-option-cat-uuid-1')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('asset-category-option-cat-uuid-1'));
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-asset-category'));
    });

    expect(mockSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cat-uuid-1', code: 'LAPTOP' })
    );
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('filters categories by search keyword', async () => {
    (assetApi.listCategories as jest.Mock).mockResolvedValueOnce(mockCategories);

    const { getByText, queryByText, getByPlaceholderText } = await render(
      <ThemeProvider>
        <AssetCategorySelectModal
          visible={true}
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Máy tính xách tay')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Tìm kiếm theo mã hoặc tên loại tài sản...');
    await act(async () => {
      fireEvent.changeText(searchInput, 'MONITOR');
    });

    expect(getByText('Màn hình ngoài')).toBeTruthy();
    expect(queryByText('Máy tính xách tay')).toBeNull();
  });
});
