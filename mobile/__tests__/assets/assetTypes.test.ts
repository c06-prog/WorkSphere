import {
  AssetStatus,
  AssetAssignmentStatus,
  AssetRepairType,
  isAssetStatus,
  isAssetAssignmentStatus,
  isAssetRepairType,
  isAssetCategoryResponse,
  isAssetCategoryList,
  isAssetSummaryResponse,
  isAssetSummaryPage,
  isAssetDetailResponse,
  isAssetAssignmentResponse,
  isAssetRepairHistoryResponse,
  isAssetRepairHistoryList,
  AssetCategoryResponse,
  AssetSummaryResponse,
  AssetDetailResponse,
  AssetAssignmentResponse,
  AssetRepairHistoryResponse,
} from '../../src/features/assets/types/assetTypes';

describe('Asset Types & Type Guards', () => {
  describe('Enum Guards', () => {
    it('validates AssetStatus correctly', () => {
      const validStatuses: AssetStatus[] = [
        'AVAILABLE',
        'ASSIGNED',
        'MAINTENANCE',
        'BROKEN',
        'RETIRED',
      ];
      validStatuses.forEach((status) => {
        expect(isAssetStatus(status)).toBe(true);
      });

      expect(isAssetStatus('UNKNOWN')).toBe(false);
      expect(isAssetStatus(null)).toBe(false);
      expect(isAssetStatus(123)).toBe(false);
      expect(isAssetStatus('')).toBe(false);
    });

    it('validates AssetAssignmentStatus correctly', () => {
      const validStatuses: AssetAssignmentStatus[] = [
        'ACTIVE',
        'RETURNED',
        'LOST',
        'DAMAGED',
      ];
      validStatuses.forEach((status) => {
        expect(isAssetAssignmentStatus(status)).toBe(true);
      });

      expect(isAssetAssignmentStatus('PENDING')).toBe(false);
      expect(isAssetAssignmentStatus(undefined)).toBe(false);
    });

    it('validates AssetRepairType correctly', () => {
      const validTypes: AssetRepairType[] = [
        'MAINTENANCE',
        'REPAIR',
        'INSPECTION',
        'UPGRADE',
      ];
      validTypes.forEach((type) => {
        expect(isAssetRepairType(type)).toBe(true);
      });

      expect(isAssetRepairType('REPLACE')).toBe(false);
    });
  });

  describe('Category Guards', () => {
    it('validates AssetCategoryResponse structure', () => {
      const validCategory: AssetCategoryResponse = {
        id: 'cat-uuid-1',
        code: 'LAPTOP',
        name: 'Máy tính xách tay',
        description: 'Thiết bị văn phòng',
        active: true,
      };

      expect(isAssetCategoryResponse(validCategory)).toBe(true);
      expect(isAssetCategoryList([validCategory])).toBe(true);

      expect(isAssetCategoryResponse({ id: 'cat-1', code: 'LAPTOP' })).toBe(false);
      expect(isAssetCategoryResponse(null)).toBe(false);
      expect(isAssetCategoryList([validCategory, { invalid: true }])).toBe(false);
    });
  });

  describe('Asset Summary & Detail Guards', () => {
    const validSummary: AssetSummaryResponse = {
      id: 'asset-uuid-101',
      assetCode: 'LAP-2026-001',
      name: 'MacBook Pro M3',
      category: {
        id: 'cat-uuid-1',
        code: 'LAPTOP',
        name: 'Máy tính xách tay',
      },
      serialNumber: 'SN-998877',
      manufacturer: 'Apple',
      model: 'MBP 14',
      status: 'AVAILABLE',
      location: 'Kho tầng 3',
      warrantyEndDate: '2027-12-31',
      currentAssignee: null,
      assignedAt: null,
      version: 1,
    };

    it('validates AssetSummaryResponse', () => {
      expect(isAssetSummaryResponse(validSummary)).toBe(true);
      expect(isAssetSummaryResponse({ ...validSummary, status: 'INVALID' })).toBe(false);
      expect(isAssetSummaryResponse({ ...validSummary, version: '1' })).toBe(false);
    });

    it('validates PagedData<AssetSummaryResponse>', () => {
      const validPage = {
        items: [validSummary],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      expect(isAssetSummaryPage(validPage)).toBe(true);
      expect(isAssetSummaryPage({ ...validPage, items: [{ invalid: true }] })).toBe(false);
      expect(isAssetSummaryPage(null)).toBe(false);
    });

    it('validates AssetDetailResponse', () => {
      const validRepair: AssetRepairHistoryResponse = {
        id: 'rep-1',
        repairType: 'MAINTENANCE',
        description: 'Vệ sinh định kỳ',
        startedAt: '2026-10-01T08:00:00Z',
        createdAt: '2026-10-01T08:30:00Z',
      };

      const validDetail: AssetDetailResponse = {
        id: 'asset-uuid-101',
        assetCode: 'LAP-2026-001',
        name: 'MacBook Pro M3',
        status: 'AVAILABLE',
        repairHistories: [validRepair],
        relatedServiceRequests: [
          {
            id: 'req-1',
            requestNumber: 'SR-20261024-0001',
            title: 'Bảo dưỡng máy',
            status: 'CLOSED',
          },
        ],
        createdAt: '2026-01-15T10:00:00Z',
        version: 2,
      };

      expect(isAssetDetailResponse(validDetail)).toBe(true);
      expect(isAssetRepairHistoryResponse(validRepair)).toBe(true);
      expect(isAssetRepairHistoryList([validRepair])).toBe(true);
      expect(isAssetDetailResponse({ ...validDetail, status: 'NOT_A_STATUS' })).toBe(false);
    });

    it('validates AssetAssignmentResponse', () => {
      const validAssignment: AssetAssignmentResponse = {
        id: 'assign-uuid-55',
        assetId: 'asset-uuid-101',
        assignedTo: 'user-uuid-12',
        assignedBy: 'admin-uuid-1',
        assignedAt: '2026-10-20T09:00:00Z',
        status: 'ACTIVE',
        version: 1,
      };

      expect(isAssetAssignmentResponse(validAssignment)).toBe(true);
      expect(isAssetAssignmentResponse({ ...validAssignment, status: 'INVALID' })).toBe(false);
      expect(isAssetAssignmentResponse({ ...validAssignment, version: '1' })).toBe(false);
    });
  });
});
