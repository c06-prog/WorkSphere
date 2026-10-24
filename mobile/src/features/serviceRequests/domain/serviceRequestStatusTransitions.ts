/**
 * Phase 16E: Service Request Status Transition Domain Logic
 * Aligned with backend ServiceStatus.java, ServiceRequestApplicationService.java,
 * and 06_API_CONTRACT.md section 13.7 / 13.7.1.
 *
 * State Machine Matrix (ServiceStatus.java):
 * - OPEN -> ASSIGNED, CANCELLED
 * - ASSIGNED -> IN_PROGRESS
 * - IN_PROGRESS -> WAITING_FOR_USER, RESOLVED
 * - WAITING_FOR_USER -> IN_PROGRESS
 * - RESOLVED -> CLOSED, IN_PROGRESS (via reject-resolution endpoint)
 * - CLOSED -> (terminal, cannot transition)
 * - CANCELLED -> (terminal, cannot transition)
 */

import { ServiceStatus } from '../types/serviceRequestTypes';

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  OPEN: 'Mới mở',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang xử lý',
  WAITING_FOR_USER: 'Chờ phản hồi',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
};

const ALLOWED_SERVICE_STATUS_TRANSITIONS: Record<ServiceStatus, readonly ServiceStatus[]> = {
  OPEN: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_USER', 'RESOLVED'],
  WAITING_FOR_USER: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};

/**
 * Returns valid target statuses from the given current status per ServiceStatus.canTransitionTo.
 */
export function getValidServiceStatusTransitions(currentStatus: ServiceStatus): ServiceStatus[] {
  return [...(ALLOWED_SERVICE_STATUS_TRANSITIONS[currentStatus] ?? [])];
}

/**
 * Checks whether transitioning from currentStatus to targetStatus is permitted by the backend domain model.
 */
export function canTransitionServiceStatus(
  currentStatus: ServiceStatus,
  targetStatus: ServiceStatus
): boolean {
  if (!targetStatus || currentStatus === targetStatus) {
    return false;
  }
  const targets = ALLOWED_SERVICE_STATUS_TRANSITIONS[currentStatus];
  if (!targets) {
    return false;
  }
  return targets.includes(targetStatus);
}

/**
 * Determines whether a status is a terminal state (CLOSED or CANCELLED).
 */
export function isTerminalServiceStatus(status: ServiceStatus): boolean {
  return status === 'CLOSED' || status === 'CANCELLED';
}

/**
 * Human-readable Vietnamese label for service status.
 */
export function getServiceStatusLabel(status: ServiceStatus): string {
  return SERVICE_STATUS_LABELS[status] ?? status;
}

/**
 * Per ServiceRequestApplicationService.java:
 * Transition to RESOLVED strictly requires a non-blank solution comment.
 */
export function isResolutionCommentRequired(targetStatus: ServiceStatus): boolean {
  return targetStatus === 'RESOLVED';
}
