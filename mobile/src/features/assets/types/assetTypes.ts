/**
 * Phase 17A: Canonical Domain Enums and Type Definitions for Mobile Asset Management
 * Source: 05_DATABASE_DESIGN.md section 10, 06_API_CONTRACT.md section 14, and Decision D-066.
 */

import { PagedData } from '../../../shared/api';

// ==========================================
// 1. Core Domain Enums & Constants
// ==========================================

export type AssetStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'MAINTENANCE'
  | 'BROKEN'
  | 'RETIRED';

export const ASSET_STATUSES: readonly AssetStatus[] = [
  'AVAILABLE',
  'ASSIGNED',
  'MAINTENANCE',
  'BROKEN',
  'RETIRED',
] as const;

export type AssetAssignmentStatus =
  | 'ACTIVE'
  | 'RETURNED'
  | 'LOST'
  | 'DAMAGED';

export const ASSET_ASSIGNMENT_STATUSES: readonly AssetAssignmentStatus[] = [
  'ACTIVE',
  'RETURNED',
  'LOST',
  'DAMAGED',
] as const;

export type AssetRepairType =
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'INSPECTION'
  | 'UPGRADE';

export const ASSET_REPAIR_TYPES: readonly AssetRepairType[] = [
  'MAINTENANCE',
  'REPAIR',
  'INSPECTION',
  'UPGRADE',
] as const;

export const ASSET_SORT_PROPERTIES = [
  'createdAt',
  'name',
  'assetCode',
  'purchasePrice',
  'purchaseDate',
  'warrantyEndDate',
] as const;

export type AssetSortProperty = (typeof ASSET_SORT_PROPERTIES)[number];

// ==========================================
// 2. Query Parameters
// ==========================================

export interface AssetListQuery {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  categoryId?: string;
  status?: AssetStatus;
}

// ==========================================
// 3. Response DTOs
// ==========================================

export interface AssetCategoryResponse {
  id: string; // UUID
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export interface AssetSummaryResponse {
  id: string; // UUID (assetId)
  assetCode: string;
  name: string;
  category: {
    id: string;
    code: string;
    name: string;
  };
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  status: AssetStatus;
  location?: string | null;
  warrantyEndDate?: string | null; // ISO YYYY-MM-DD
  currentAssignee?: {
    id: string; // UUID
    fullName: string;
  } | null;
  assignedAt?: string | null; // ISO 8601 UTC Instant
  version: number;
}

export interface AssetDetailAssignmentBrief {
  id: string; // UUID (assignmentId)
  assignedTo: {
    id: string;
    fullName: string;
  };
  assignedBy?: {
    id: string;
    fullName: string;
  } | null;
  assignedAt: string; // ISO 8601 UTC Instant
  expectedReturnAt?: string | null; // ISO 8601 UTC Instant
  notes?: string | null;
}

export interface AssetRepairHistoryResponse {
  id: string; // UUID
  serviceRequestId?: string | null;
  repairType: AssetRepairType;
  description: string;
  vendorName?: string | null;
  cost?: number | null;
  startedAt: string; // ISO 8601 UTC Instant
  completedAt?: string | null; // ISO 8601 UTC Instant
  result?: string | null;
  createdAt: string; // ISO 8601 UTC Instant
}

export interface AssetServiceRequestBrief {
  id: string; // UUID (serviceRequestId)
  requestNumber: string;
  title: string;
  status: string;
}

export interface AssetDetailResponse {
  id: string; // UUID (assetId)
  assetCode: string;
  name: string;
  category?: {
    id: string;
    code: string;
    name: string;
  } | null;
  description?: string | null;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  purchaseDate?: string | null; // ISO YYYY-MM-DD
  purchasePrice?: number | null;
  status: AssetStatus;
  location?: string | null;
  warrantyEndDate?: string | null; // ISO YYYY-MM-DD
  currentAssignment?: AssetDetailAssignmentBrief | null;
  repairHistories: AssetRepairHistoryResponse[];
  relatedServiceRequests: AssetServiceRequestBrief[];
  createdAt: string; // ISO 8601 UTC Instant
  updatedAt?: string | null; // ISO 8601 UTC Instant
  version: number;
}

export interface AssetAssignmentResponse {
  id: string; // UUID (assignmentId)
  assetId: string; // UUID
  assignedTo: string; // UUID
  assignedBy: string; // UUID
  assignedAt: string; // ISO 8601 UTC Instant
  expectedReturnAt?: string | null;
  returnedAt?: string | null;
  status: AssetAssignmentStatus;
  notes?: string | null;
  returnCondition?: string | null;
  version: number; // AssetAssignment.version
}

// ==========================================
// 4. Request DTOs
// ==========================================

export interface CreateAssetRequest {
  assetCode: string;
  categoryId: string; // UUID
  name: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string; // YYYY-MM-DD
  purchasePrice?: number;
  warrantyEndDate?: string; // YYYY-MM-DD
  location?: string;
}

export interface UpdateAssetRequest {
  categoryId?: string;
  name: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string; // YYYY-MM-DD
  purchasePrice?: number;
  warrantyEndDate?: string; // YYYY-MM-DD
  status?: AssetStatus;
  location?: string;
  version: number; // Asset.version
}

export interface AssignAssetRequest {
  assignedTo: string; // User UUID
  expectedReturnAt?: string; // ISO 8601 UTC Instant
  notes?: string;
}

export interface ReturnAssetRequest {
  returnCondition?: string;
  resultingAssetStatus: AssetStatus;
  version: number; // AssetAssignment.version
}

export interface CreateAssetRepairHistoryRequest {
  serviceRequestId?: string;
  repairType: AssetRepairType;
  description: string;
  vendorName?: string;
  cost?: number;
  startedAt: string; // ISO 8601 UTC Instant
  completedAt?: string; // ISO 8601 UTC Instant
  result?: string;
}

// ==========================================
// 5. Runtime Type Guards
// ==========================================

export function isAssetStatus(value: unknown): value is AssetStatus {
  return typeof value === 'string' && (ASSET_STATUSES as readonly string[]).includes(value);
}

export function isAssetAssignmentStatus(value: unknown): value is AssetAssignmentStatus {
  return typeof value === 'string' && (ASSET_ASSIGNMENT_STATUSES as readonly string[]).includes(value);
}

export function isAssetRepairType(value: unknown): value is AssetRepairType {
  return typeof value === 'string' && (ASSET_REPAIR_TYPES as readonly string[]).includes(value);
}

export function isAssetCategoryResponse(value: unknown): value is AssetCategoryResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.code === 'string' &&
    typeof v.name === 'string' &&
    typeof v.active === 'boolean'
  );
}

export function isAssetCategoryList(value: unknown): value is AssetCategoryResponse[] {
  return Array.isArray(value) && value.every(isAssetCategoryResponse);
}

export function isAssetSummaryResponse(value: unknown): value is AssetSummaryResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== 'string' ||
    typeof v.assetCode !== 'string' ||
    typeof v.name !== 'string' ||
    !v.category ||
    typeof v.category !== 'object' ||
    !isAssetStatus(v.status) ||
    typeof v.version !== 'number'
  ) {
    return false;
  }
  const cat = v.category as Record<string, unknown>;
  return (
    typeof cat.id === 'string' &&
    typeof cat.code === 'string' &&
    typeof cat.name === 'string'
  );
}

export function isAssetSummaryPage(value: unknown): value is PagedData<AssetSummaryResponse> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  if (
    typeof v.page !== 'number' ||
    typeof v.size !== 'number' ||
    typeof v.totalItems !== 'number' ||
    typeof v.totalPages !== 'number' ||
    typeof v.hasNext !== 'boolean' ||
    typeof v.hasPrevious !== 'boolean' ||
    !Array.isArray(v.items)
  ) {
    return false;
  }

  return v.items.every(isAssetSummaryResponse);
}

export function isAssetRepairHistoryResponse(value: unknown): value is AssetRepairHistoryResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    isAssetRepairType(v.repairType) &&
    typeof v.description === 'string' &&
    typeof v.startedAt === 'string' &&
    typeof v.createdAt === 'string'
  );
}

export function isAssetRepairHistoryList(value: unknown): value is AssetRepairHistoryResponse[] {
  return Array.isArray(value) && value.every(isAssetRepairHistoryResponse);
}

export function isAssetAssignmentResponse(value: unknown): value is AssetAssignmentResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.assetId === 'string' &&
    typeof v.assignedTo === 'string' &&
    typeof v.assignedBy === 'string' &&
    typeof v.assignedAt === 'string' &&
    isAssetAssignmentStatus(v.status) &&
    typeof v.version === 'number'
  );
}

export function isAssetDetailResponse(value: unknown): value is AssetDetailResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === 'string' &&
    typeof v.assetCode === 'string' &&
    typeof v.name === 'string' &&
    isAssetStatus(v.status) &&
    Array.isArray(v.repairHistories) &&
    v.repairHistories.every(isAssetRepairHistoryResponse) &&
    Array.isArray(v.relatedServiceRequests) &&
    typeof v.createdAt === 'string' &&
    typeof v.version === 'number'
  );
}
