import React from 'react';
import { render } from '@testing-library/react-native';
import { AssetCard } from '../../src/features/assets/components/AssetCard';
import { AssetSummaryResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockAsset: AssetSummaryResponse = {
  id: 'ast-uuid-12345',
  assetCode: 'LAP-2026-001',
  name: 'ThinkPad T14 Gen 4',
  category: {
    id: 'cat-uuid-001',
    code: 'LAPTOP',
    name: 'Máy tính xách tay',
  },
  serialNumber: 'SN-LENOVO-001',
  model: 'T14 Gen 4',
  status: 'AVAILABLE',
  location: 'Kho thiết bị Tầng 2',
  version: 1,
};

describe('AssetCard', () => {
  it('renders all canonical asset attributes and status badge', async () => {
    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <AssetCard asset={mockAsset} />
      </ThemeProvider>
    );

    expect(getByTestId('asset-card-code')).toBeTruthy();
    expect(getByText('LAP-2026-001')).toBeTruthy();
    expect(getByText('ThinkPad T14 Gen 4')).toBeTruthy();
    expect(getByText('Máy tính xách tay')).toBeTruthy();
    expect(getByTestId('asset-card-model')).toBeTruthy();
    expect(getByText('T14 Gen 4')).toBeTruthy();
    expect(getByTestId('asset-card-serial')).toBeTruthy();
    expect(getByText('SN-LENOVO-001')).toBeTruthy();
    expect(getByTestId('asset-card-location')).toBeTruthy();
    expect(getByText('Kho thiết bị Tầng 2')).toBeTruthy();
    expect(getByText('Chưa cấp phát')).toBeTruthy();
    expect(getByText('Sẵn sàng')).toBeTruthy();
  });

  it('renders assignee name when asset is assigned', async () => {
    const assignedAsset: AssetSummaryResponse = {
      ...mockAsset,
      status: 'ASSIGNED',
      currentAssignee: {
        id: 'user-uuid-999',
        fullName: 'Trần Thị B',
      },
    };

    const { getByText } = await render(
      <ThemeProvider>
        <AssetCard asset={assignedAsset} />
      </ThemeProvider>
    );

    expect(getByText('Trần Thị B')).toBeTruthy();
    expect(getByText('Đang cấp phát')).toBeTruthy();
  });
});
