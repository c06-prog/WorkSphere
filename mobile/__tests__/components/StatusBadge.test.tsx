import React from 'react';
import { StatusBadge } from '../../src/shared/components/StatusBadge';
import { renderWithProviders } from '../test-utils';

describe('StatusBadge Component', () => {
  test('renders canonical active / in_progress status with correct text', async () => {
    const { getByText } = await renderWithProviders(
      <StatusBadge status="ACTIVE" />
    );

    expect(getByText('Đang thực hiện')).toBeTruthy();
  });

  test('renders canonical draft status with info mapping', async () => {
    const { getByText } = await renderWithProviders(
      <StatusBadge status="DRAFT" />
    );

    expect(getByText('Bản nháp')).toBeTruthy();
  });

  test('renders canonical on_hold / waiting status with warning mapping', async () => {
    const { getByText } = await renderWithProviders(
      <StatusBadge status="ON_HOLD" />
    );

    expect(getByText('Tạm dừng')).toBeTruthy();
  });

  test('renders canonical completed and cancelled statuses', async () => {
    const { getByText: getCompleted } = await renderWithProviders(
      <StatusBadge status="COMPLETED" />
    );
    expect(getCompleted('Hoàn thành')).toBeTruthy();

    const { getByText: getCancelled } = await renderWithProviders(
      <StatusBadge status="CANCELLED" />
    );
    expect(getCancelled('Đã hủy')).toBeTruthy();
  });

  test('supports custom label override and unknown status fallback', async () => {
    const { getByText: getCustom } = await renderWithProviders(
      <StatusBadge status="ACTIVE" label="Tùy biến" />
    );
    expect(getCustom('Tùy biến')).toBeTruthy();

    const { getByText: getUnknown } = await renderWithProviders(
      <StatusBadge status="UNKNOWN_STATE" />
    );
    expect(getUnknown('UNKNOWN_STATE')).toBeTruthy();
  });
});
