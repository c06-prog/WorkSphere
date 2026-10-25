import { formatRelativeTime } from '../../src/features/notifications/utils/notificationDate';

describe('formatRelativeTime', () => {
  // Reference now: 2026-10-25T19:00:00.000Z
  const FIXED_NOW = new Date('2026-10-25T19:00:00.000Z').getTime();

  it('returns "Chưa xác định" for undefined, null, or empty string', () => {
    expect(formatRelativeTime(undefined, FIXED_NOW)).toBe('Chưa xác định');
    expect(formatRelativeTime(null, FIXED_NOW)).toBe('Chưa xác định');
    expect(formatRelativeTime('', FIXED_NOW)).toBe('Chưa xác định');
    expect(formatRelativeTime('   ', FIXED_NOW)).toBe('Chưa xác định');
    expect(formatRelativeTime('invalid-date', FIXED_NOW)).toBe('Chưa xác định');
  });

  it('returns "Vừa xong" for timestamps less than 60 seconds ago or future timestamps', () => {
    const thirtySecondsAgo = new Date(FIXED_NOW - 30 * 1000).toISOString();
    expect(formatRelativeTime(thirtySecondsAgo, FIXED_NOW)).toBe('Vừa xong');

    const futureTime = new Date(FIXED_NOW + 10 * 1000).toISOString();
    expect(formatRelativeTime(futureTime, FIXED_NOW)).toBe('Vừa xong');
  });

  it('returns "${minutes} phút trước" for timestamps between 1 and 59 minutes ago', () => {
    const fiveMinutesAgo = new Date(FIXED_NOW - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo, FIXED_NOW)).toBe('5 phút trước');

    const fiftyNineMinutesAgo = new Date(FIXED_NOW - 59 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiftyNineMinutesAgo, FIXED_NOW)).toBe('59 phút trước');
  });

  it('returns "${hours} giờ trước" for timestamps between 1 and 23 hours ago', () => {
    const twoHoursAgo = new Date(FIXED_NOW - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo, FIXED_NOW)).toBe('2 giờ trước');

    const twentyHoursAgo = new Date(FIXED_NOW - 20 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twentyHoursAgo, FIXED_NOW)).toBe('20 giờ trước');
  });

  it('returns "Hôm qua lúc HH:mm" for timestamps exactly 1 day ago', () => {
    const yesterdayDate = new Date(FIXED_NOW - 26 * 60 * 60 * 1000);
    const yesterdayIso = yesterdayDate.toISOString();
    const hours = String(yesterdayDate.getHours()).padStart(2, '0');
    const minutes = String(yesterdayDate.getMinutes()).padStart(2, '0');

    expect(formatRelativeTime(yesterdayIso, FIXED_NOW)).toBe(`Hôm qua lúc ${hours}:${minutes}`);
  });

  it('returns "dd/MM/yyyy HH:mm" for older dates', () => {
    const oldDate = new Date(FIXED_NOW - 5 * 24 * 60 * 60 * 1000);
    const oldIso = oldDate.toISOString();
    const day = String(oldDate.getDate()).padStart(2, '0');
    const month = String(oldDate.getMonth() + 1).padStart(2, '0');
    const year = oldDate.getFullYear();
    const hours = String(oldDate.getHours()).padStart(2, '0');
    const minutes = String(oldDate.getMinutes()).padStart(2, '0');

    expect(formatRelativeTime(oldIso, FIXED_NOW)).toBe(`${day}/${month}/${year} ${hours}:${minutes}`);
  });
});
