/**
 * Relative Timestamp Formatter for WorkSphere Mobile Notifications
 * Formats ISO-8601 UTC Instant strings into localized Vietnamese relative time.
 * Invariants:
 * - Deterministic, pure calculation (supports passing reference now timestamp for testability).
 * - Safe fail-over on invalid strings or impossible dates.
 * - Rules:
 *   + diff < 60s: "Vừa xong"
 *   + diff < 60m: "${minutes} phút trước"
 *   + diff < 24h & same day / yesterday: "${hours} giờ trước"
 *   + yesterday: "Hôm qua lúc HH:mm"
 *   + older: "dd/MM/yyyy HH:mm"
 */

export function formatRelativeTime(
  isoString?: string | null,
  referenceNowMs?: number
): string {
  if (!isoString || typeof isoString !== 'string') {
    return 'Chưa xác định';
  }

  const trimmed = isoString.trim();
  if (trimmed.length === 0) {
    return 'Chưa xác định';
  }

  const targetDate = new Date(trimmed);
  const targetTimeMs = targetDate.getTime();

  if (isNaN(targetTimeMs)) {
    return 'Chưa xác định';
  }

  const nowMs = referenceNowMs !== undefined ? referenceNowMs : Date.now();
  const diffMs = nowMs - targetTimeMs;

  // If in future or less than 60 seconds ago
  if (diffMs < 60 * 1000) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  if (diffDays === 1) {
    return `Hôm qua lúc ${hours}:${minutes}`;
  }

  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = targetDate.getFullYear();

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
