import {
  assetApi,
  serializeAssetListQuery,
} from '../../src/features/assets/api/assetApi';
import { http } from '../../src/shared/api';
import {
  AssetCategoryResponse,
  AssetDetailResponse,
  AssetAssignmentResponse,
  AssetRepairHistoryResponse,
} from '../../src/features/assets/types/assetTypes';

jest.mock('../../src/shared/api', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('Asset API Transport Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('serializeAssetListQuery', () => {
    it('serializes valid query parameters correctly', () => {
      const query = {
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
        search: '  MacBook  ',
        categoryId: 'cat-uuid-1',
        status: 'AVAILABLE' as const,
      };

      const params = serializeAssetListQuery(query);
      expect(params).toEqual({
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
        search: 'MacBook',
        categoryId: 'cat-uuid-1',
        status: 'AVAILABLE',
      });
    });

    it('omits undefined or invalid query properties', () => {
      const params = serializeAssetListQuery({});
      expect(params).toEqual({});

      const paramsUndefined = serializeAssetListQuery(undefined);
      expect(paramsUndefined).toEqual({});
    });
  });

  describe('API Methods', () => {
    it('listCategories calls GET /asset-categories', async () => {
      const mockCategories: AssetCategoryResponse[] = [
        { id: 'cat-1', code: 'LAPTOP', name: 'Laptop', active: true },
      ];
      (http.get as jest.Mock).mockResolvedValueOnce(mockCategories);

      const result = await assetApi.listCategories();
      expect(http.get).toHaveBeenCalledWith('/asset-categories');
      expect(result).toEqual(mockCategories);
    });

    it('getMyAssets calls GET /assets/my-assets with params', async () => {
      const mockPage = {
        items: [
          {
            id: 'ast-1',
            assetCode: 'LAP-001',
            name: 'ThinkPad',
            category: { id: 'c-1', code: 'LAP', name: 'Laptop' },
            status: 'ASSIGNED',
            version: 1,
          },
        ],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      (http.get as jest.Mock).mockResolvedValueOnce(mockPage);

      const result = await assetApi.getMyAssets({ page: 0, size: 20 });
      expect(http.get).toHaveBeenCalledWith('/assets/my-assets', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockPage);
    });

    it('getAssets calls GET /assets with params', async () => {
      const mockPage = {
        items: [],
        page: 0,
        size: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      (http.get as jest.Mock).mockResolvedValueOnce(mockPage);

      const result = await assetApi.getAssets({ search: 'Dell' });
      expect(http.get).toHaveBeenCalledWith('/assets', {
        params: { search: 'Dell' },
      });
      expect(result).toEqual(mockPage);
    });

    it('getAssetDetail calls GET /assets/{assetId}', async () => {
      const mockDetail: AssetDetailResponse = {
        id: 'ast-101',
        assetCode: 'LAP-001',
        name: 'MacBook',
        status: 'AVAILABLE',
        repairHistories: [],
        relatedServiceRequests: [],
        createdAt: '2026-10-24T10:00:00Z',
        version: 1,
      };
      (http.get as jest.Mock).mockResolvedValueOnce(mockDetail);

      const result = await assetApi.getAssetDetail('ast-101');
      expect(http.get).toHaveBeenCalledWith('/assets/ast-101');
      expect(result).toEqual(mockDetail);
    });

    it('createAsset calls POST /assets', async () => {
      const mockDetail: AssetDetailResponse = {
        id: 'ast-102',
        assetCode: 'MON-001',
        name: 'Dell Monitor',
        status: 'AVAILABLE',
        repairHistories: [],
        relatedServiceRequests: [],
        createdAt: '2026-10-24T10:00:00Z',
        version: 1,
      };
      (http.post as jest.Mock).mockResolvedValueOnce(mockDetail);

      const payload = {
        assetCode: 'MON-001',
        categoryId: 'cat-2',
        name: 'Dell Monitor',
      };
      const result = await assetApi.createAsset(payload);
      expect(http.post).toHaveBeenCalledWith('/assets', payload);
      expect(result).toEqual(mockDetail);
    });

    it('updateAsset calls PUT /assets/{assetId}', async () => {
      const mockDetail: AssetDetailResponse = {
        id: 'ast-102',
        assetCode: 'MON-001',
        name: 'Dell Monitor 27',
        status: 'AVAILABLE',
        repairHistories: [],
        relatedServiceRequests: [],
        createdAt: '2026-10-24T10:00:00Z',
        version: 2,
      };
      (http.put as jest.Mock).mockResolvedValueOnce(mockDetail);

      const payload = {
        name: 'Dell Monitor 27',
        version: 1,
      };
      const result = await assetApi.updateAsset('ast-102', payload);
      expect(http.put).toHaveBeenCalledWith('/assets/ast-102', payload);
      expect(result).toEqual(mockDetail);
    });

    it('assignAsset calls POST /assets/{assetId}/assignments', async () => {
      const mockAssignment: AssetAssignmentResponse = {
        id: 'asg-1',
        assetId: 'ast-101',
        assignedTo: 'user-1',
        assignedBy: 'admin-1',
        assignedAt: '2026-10-24T10:00:00Z',
        status: 'ACTIVE',
        version: 1,
      };
      (http.post as jest.Mock).mockResolvedValueOnce(mockAssignment);

      const payload = { assignedTo: 'user-1' };
      const result = await assetApi.assignAsset('ast-101', payload);
      expect(http.post).toHaveBeenCalledWith('/assets/ast-101/assignments', payload);
      expect(result).toEqual(mockAssignment);
    });

    it('returnAsset calls PUT /assets/{assetId}/assignments/{assignmentId}/return', async () => {
      const mockAssignment: AssetAssignmentResponse = {
        id: 'asg-1',
        assetId: 'ast-101',
        assignedTo: 'user-1',
        assignedBy: 'admin-1',
        assignedAt: '2026-10-24T10:00:00Z',
        returnedAt: '2026-10-24T11:00:00Z',
        status: 'RETURNED',
        version: 2,
      };
      (http.put as jest.Mock).mockResolvedValueOnce(mockAssignment);

      const payload = {
        resultingAssetStatus: 'AVAILABLE' as const,
        version: 1,
      };
      const result = await assetApi.returnAsset('ast-101', 'asg-1', payload);
      expect(http.put).toHaveBeenCalledWith('/assets/ast-101/assignments/asg-1/return', payload);
      expect(result).toEqual(mockAssignment);
    });

    it('getRepairHistories calls GET /assets/{assetId}/repair-histories', async () => {
      const mockRepairs: AssetRepairHistoryResponse[] = [
        {
          id: 'rep-1',
          repairType: 'REPAIR',
          description: 'Thay pin',
          startedAt: '2026-10-20T08:00:00Z',
          createdAt: '2026-10-20T09:00:00Z',
        },
      ];
      (http.get as jest.Mock).mockResolvedValueOnce(mockRepairs);

      const result = await assetApi.getRepairHistories('ast-101');
      expect(http.get).toHaveBeenCalledWith('/assets/ast-101/repair-histories');
      expect(result).toEqual(mockRepairs);
    });

    it('createRepairHistory calls POST /assets/{assetId}/repair-histories', async () => {
      const mockRepair: AssetRepairHistoryResponse = {
        id: 'rep-2',
        repairType: 'UPGRADE',
        description: 'Nâng RAM 32GB',
        startedAt: '2026-10-24T08:00:00Z',
        createdAt: '2026-10-24T08:30:00Z',
      };
      (http.post as jest.Mock).mockResolvedValueOnce(mockRepair);

      const payload = {
        repairType: 'UPGRADE' as const,
        description: 'Nâng RAM 32GB',
        startedAt: '2026-10-24T08:00:00Z',
      };
      const result = await assetApi.createRepairHistory('ast-101', payload);
      expect(http.post).toHaveBeenCalledWith('/assets/ast-101/repair-histories', payload);
      expect(result).toEqual(mockRepair);
    });
  });
});
