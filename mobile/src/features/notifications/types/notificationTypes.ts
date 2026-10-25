/**
 * Phase 18A: Canonical Domain Enums, Types, and DTOs for Mobile Notification System
 * Source: 05_DATABASE_DESIGN.md section 8.8, 06_API_CONTRACT.md section 15, and Decision D-067.
 */

import { PagedData } from '../../../shared/api';

// ==========================================
// 1. Core Domain Enums & Constants
// ==========================================

export type NotificationType =
  | 'PROJECT_MEMBER_ADDED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'SERVICE_REQUEST_UPDATED'
  | 'COMMENT_ADDED'
  | 'ASSET_ASSIGNED';

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  'PROJECT_MEMBER_ADDED',
  'TASK_ASSIGNED',
  'TASK_STATUS_CHANGED',
  'TASK_DUE_SOON',
  'TASK_OVERDUE',
  'SERVICE_REQUEST_UPDATED',
  'COMMENT_ADDED',
  'ASSET_ASSIGNED',
] as const;

export type NotificationReferenceType =
  | 'PROJECT'
  | 'TASK'
  | 'SERVICE_REQUEST'
  | 'ASSET';

export const NOTIFICATION_REFERENCE_TYPES: readonly NotificationReferenceType[] = [
  'PROJECT',
  'TASK',
  'SERVICE_REQUEST',
  'ASSET',
] as const;

export const NOTIFICATION_SORT_PROPERTIES = [
  'createdAt',
] as const;

export type NotificationSortProperty = (typeof NOTIFICATION_SORT_PROPERTIES)[number];

// ==========================================
// 2. Query Parameters
// ==========================================

export interface NotificationListQuery {
  page?: number;
  size?: number;
  read?: boolean;
  type?: NotificationType;
  sort?: string;
}

// ==========================================
// 3. Response DTOs
// ==========================================

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: NotificationReferenceType | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface ReadAllNotificationsResponse {
  updatedCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export type NotificationPage = PagedData<NotificationResponse>;

// ==========================================
// 4. Runtime Type Guards
// ==========================================

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export function isNotificationReferenceType(value: unknown): value is NotificationReferenceType {
  return typeof value === 'string' && (NOTIFICATION_REFERENCE_TYPES as readonly string[]).includes(value);
}

export function isNotificationResponse(value: unknown): value is NotificationResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    return false;
  }

  if (!isNotificationType(obj.type)) {
    return false;
  }

  if (typeof obj.title !== 'string') {
    return false;
  }

  if (typeof obj.message !== 'string') {
    return false;
  }

  if (obj.referenceType !== null && obj.referenceType !== undefined && !isNotificationReferenceType(obj.referenceType)) {
    return false;
  }

  if (obj.referenceId !== null && obj.referenceId !== undefined && typeof obj.referenceId !== 'string') {
    return false;
  }

  if (typeof obj.read !== 'boolean') {
    return false;
  }

  if (typeof obj.createdAt !== 'string' || obj.createdAt.trim().length === 0) {
    return false;
  }

  return true;
}

export function isNotificationPage(value: unknown): value is NotificationPage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (
    typeof obj.page !== 'number' ||
    typeof obj.size !== 'number' ||
    typeof obj.totalItems !== 'number' ||
    typeof obj.totalPages !== 'number' ||
    typeof obj.hasNext !== 'boolean' ||
    typeof obj.hasPrevious !== 'boolean' ||
    !Array.isArray(obj.items)
  ) {
    return false;
  }

  return obj.items.every(isNotificationResponse);
}

export function isReadAllNotificationsResponse(value: unknown): value is ReadAllNotificationsResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj.updatedCount === 'number' && obj.updatedCount >= 0;
}

export function isUnreadCountResponse(value: unknown): value is UnreadCountResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj.count === 'number' && obj.count >= 0;
}
