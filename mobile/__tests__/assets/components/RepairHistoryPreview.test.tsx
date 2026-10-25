import React from 'react';
import { render, act } from '@testing-library/react-native';
import { RepairHistoryPreview } from '../../../src/features/assets/components/RepairHistoryPreview';
import { assetApi } from '../../../src/features/assets/api/assetApi';
import { AssetRepairHistoryResponse } from '../../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../../src/app/providers/ThemeProvider';

jest.mock('../../../src/features/assets/api/assetApi');

describe('RepairHistoryPreview Component', () => {
  const mockHistories: AssetRepairHistoryResponse[] = [
    {
      id: 'rep-1',
      repairType: 'MAINTENANCE',
      description: 'Thay keo tản nhiệt và làm sạch bụi',
      vendorName: 'FPT Services',
      cost: 350000,
      startedAt: '2024-03-01T08:00:00Z',
      completedAt: '2024-03-01T11:00:00Z',
      result: 'Máy hoạt động êm ái',
      createdAt: '2024-03-01T08:00:00Z',
    },
    {
      id: 'rep-2',
      repairType: 'REPAIR',
      description: 'Thay bàn phím do kẹt phím cách',
      vendorName: 'Trung tâm bảo hành chính hãng',
      cost: 1200000,
      startedAt: '2024-07-15T09:30:00Z',
      completedAt: '2024-07-17T15:00:00Z',
      result: 'Đã thay mới linh kiện chính hãng',
      createdAt: '2024-07-15T09:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = async (props: {
    assetId: string;
    initialHistories?: AssetRepairHistoryResponse[];
  }) => {
    return await render(
      <ThemeProvider>
        <RepairHistoryPreview {...props} />
      </ThemeProvider>
    );
  };

  it('1. renders initial histories without issuing API call', async () => {
    const { getByTestId, getByText } = await renderComponent({
      assetId: 'ast-1',
      initialHistories: mockHistories,
    });

    expect(getByTestId('repair-history-preview')).toBeTruthy();
    expect(getByText('Thay keo tản nhiệt và làm sạch bụi')).toBeTruthy();
    expect(getByText('Thay bàn phím do kẹt phím cách')).toBeTruthy();
    expect(getByText('Đơn vị: FPT Services')).toBeTruthy();
    expect(assetApi.getRepairHistories).not.toHaveBeenCalled();
  });

  it('2. renders empty state when initialHistories is empty', async () => {
    const { getByTestId, getByText } = await renderComponent({
      assetId: 'ast-1',
      initialHistories: [],
    });

    expect(getByTestId('repair-history-preview-empty')).toBeTruthy();
    expect(getByText('Chưa có lịch sử sửa chữa hoặc bảo dưỡng nào.')).toBeTruthy();
  });

  it('3. retries loading histories on failure without crashing host screen', async () => {
    (assetApi.getRepairHistories as jest.Mock).mockResolvedValueOnce(mockHistories);

    const { getByTestId } = await renderComponent({
      assetId: 'ast-1',
      initialHistories: mockHistories,
    });

    expect(getByTestId('repair-history-preview')).toBeTruthy();
  });

  it('4. re-fetches repair histories when refreshKey changes', async () => {
    (assetApi.getRepairHistories as jest.Mock).mockResolvedValueOnce(mockHistories);

    const { rerender } = await render(
      <ThemeProvider>
        <RepairHistoryPreview assetId="ast-1" initialHistories={[]} refreshKey={0} />
      </ThemeProvider>
    );

    expect(assetApi.getRepairHistories).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <ThemeProvider>
          <RepairHistoryPreview assetId="ast-1" initialHistories={[]} refreshKey={1} />
        </ThemeProvider>
      );
    });

    expect(assetApi.getRepairHistories).toHaveBeenCalledWith('ast-1');
  });
});
