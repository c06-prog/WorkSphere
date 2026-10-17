import React from 'react';
import { PriorityBadge } from '../../src/shared/components/PriorityBadge';
import { renderWithProviders } from '../test-utils';

describe('PriorityBadge Component', () => {
  test('maps LOW priority to Vietnamese label "Thấp"', async () => {
    const { getByText } = await renderWithProviders(
      <PriorityBadge priority="LOW" />
    );

    expect(getByText('Thấp')).toBeTruthy();
  });

  test('maps MEDIUM priority to Vietnamese label "Trung bình"', async () => {
    const { getByText } = await renderWithProviders(
      <PriorityBadge priority="MEDIUM" />
    );

    expect(getByText('Trung bình')).toBeTruthy();
  });

  test('maps HIGH priority to Vietnamese label "Cao"', async () => {
    const { getByText } = await renderWithProviders(
      <PriorityBadge priority="HIGH" />
    );

    expect(getByText('Cao')).toBeTruthy();
  });

  test('maps CRITICAL and URGENT priorities to Vietnamese label "Khẩn cấp"', async () => {
    const { getByText: getCritical } = await renderWithProviders(
      <PriorityBadge priority="CRITICAL" />
    );
    expect(getCritical('Khẩn cấp')).toBeTruthy();

    const { getByText: getUrgent } = await renderWithProviders(
      <PriorityBadge priority="URGENT" />
    );
    expect(getUrgent('Khẩn cấp')).toBeTruthy();
  });

  test('handles unknown priority fallback safely', async () => {
    const { getByText } = await renderWithProviders(
      <PriorityBadge priority="CUSTOM_PRIORITY" />
    );

    expect(getByText('CUSTOM_PRIORITY')).toBeTruthy();
  });
});
