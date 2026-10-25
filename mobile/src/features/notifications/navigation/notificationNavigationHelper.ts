/**
 * Phase 18A: Pure Notification Context Navigation Helper Contract
 * Maps notification referenceType and referenceId to target screen and route parameters.
 * Source: Decision D-067 and 06_API_CONTRACT.md Section 15.
 */

import { NotificationReferenceType } from '../types/notificationTypes';

export type NotificationNavigationTarget =
  | { screen: 'TaskDetail'; params: { taskId: string } }
  | { screen: 'ProjectDetail'; params: { projectId: string } }
  | { screen: 'ServiceRequestDetail'; params: { requestId: string } }
  | { screen: 'AssetDetail'; params: { assetId: string } };

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Validates whether a string is a standard RFC 4122 UUID.
 */
export function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Pure mapping helper that determines target navigation destination from reference metadata.
 * Returns null if referenceType is missing, unrecognized, or referenceId is empty/invalid UUID.
 * Does NOT invoke navigation directly; does NOT parse title/message strings.
 */
export function getNotificationNavigationTarget(
  referenceType: NotificationReferenceType | string | null | undefined,
  referenceId: string | null | undefined
): NotificationNavigationTarget | null {
  if (!referenceType || !referenceId) {
    return null;
  }

  const trimmedId = referenceId.trim();
  if (!isValidUuid(trimmedId)) {
    return null;
  }

  switch (referenceType) {
    case 'TASK':
      return {
        screen: 'TaskDetail',
        params: { taskId: trimmedId },
      };

    case 'PROJECT':
      return {
        screen: 'ProjectDetail',
        params: { projectId: trimmedId },
      };

    case 'SERVICE_REQUEST':
      return {
        screen: 'ServiceRequestDetail',
        params: { requestId: trimmedId },
      };

    case 'ASSET':
      return {
        screen: 'AssetDetail',
        params: { assetId: trimmedId },
      };

    default:
      return null;
  }
}
