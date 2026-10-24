/**
 * Phase 17A: Mobile Asset API Transport Adapter
 * Connects mobile Asset feature to backend Spring Boot REST endpoints.
 * Implements 10 canonical methods matching Decision D-066 & 06_API_CONTRACT.md section 14.
 */

import { http, PagedData } from '../../../shared/api';
import {
  ASSET_SORT_PROPERTIES,
  AssetAssignmentResponse,
  AssetCategoryResponse,
  AssetDetailResponse,
  AssetListQuery,
  AssetRepairHistoryResponse,
  AssetSortProperty,
  AssetSummaryResponse,
  AssignAssetRequest,
  CreateAssetRepairHistoryRequest,
  CreateAssetRequest,
  isAssetAssignmentResponse,
  isAssetCategoryList,
  isAssetDetailResponse,
  isAssetRepairHistoryList,
  isAssetRepairHistoryResponse,
  isAssetStatus,
  isAssetSummaryPage,
  ReturnAssetRequest,
  UpdateAssetRequest,
} from '../types/assetTypes';

function isAssetSortProperty(property: string): property is AssetSortProperty {
  return (ASSET_SORT_PROPERTIES as readonly string[]).includes(property);
}

/**
 * Serializes AssetListQuery parameters deterministically.
 */
export function serializeAssetListQuery(
  query?: AssetListQuery
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (!query) {
    return params;
  }

  if (typeof query.page === 'number' && query.page >= 0) {
    params.page = query.page;
  }

  if (typeof query.size === 'number' && query.size > 0) {
    params.size = query.size;
  }

  if (query.sort && typeof query.sort === 'string') {
    const trimmed = query.sort.trim();
    if (trimmed.length > 0) {
      const [field] = trimmed.split(',');
      if (isAssetSortProperty(field.trim())) {
        params.sort = trimmed;
      }
    }
  }

  if (query.search && typeof query.search === 'string') {
    const trimmed = query.search.trim();
    if (trimmed.length > 0) {
      params.search = trimmed;
    }
  }

  if (query.categoryId && typeof query.categoryId === 'string') {
    const trimmed = query.categoryId.trim();
    if (trimmed.length > 0) {
      params.categoryId = trimmed;
    }
  }

  if (query.status && isAssetStatus(query.status)) {
    params.status = query.status;
  }

  return params;
}

export const assetApi = {
  /**
   * 1. Danh sách loại tài sản đang hoạt động
   * GET /asset-categories
   */
  async listCategories(): Promise<AssetCategoryResponse[]> {
    const data = await http.get<AssetCategoryResponse[]>('/asset-categories');

    if (!isAssetCategoryList(data)) {
      throw new Error('Dữ liệu danh mục tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 2. Danh sách tài sản được cấp phát cho người dùng hiện tại
   * GET /assets/my-assets
   */
  async getMyAssets(query?: AssetListQuery): Promise<PagedData<AssetSummaryResponse>> {
    const params = serializeAssetListQuery(query);
    const data = await http.get<PagedData<AssetSummaryResponse>>('/assets/my-assets', {
      params,
    });

    if (!isAssetSummaryPage(data)) {
      throw new Error('Dữ liệu danh sách tài sản cá nhân máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 3. Danh sách tài sản toàn công ty (Yêu cầu quyền ASSET_READ)
   * GET /assets
   */
  async getAssets(query?: AssetListQuery): Promise<PagedData<AssetSummaryResponse>> {
    const params = serializeAssetListQuery(query);
    const data = await http.get<PagedData<AssetSummaryResponse>>('/assets', {
      params,
    });

    if (!isAssetSummaryPage(data)) {
      throw new Error('Dữ liệu danh sách tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 4. Chi tiết tài sản
   * GET /assets/{assetId}
   */
  async getAssetDetail(assetId: string): Promise<AssetDetailResponse> {
    const data = await http.get<AssetDetailResponse>(
      `/assets/${encodeURIComponent(assetId)}`
    );

    if (!isAssetDetailResponse(data)) {
      throw new Error('Dữ liệu chi tiết tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 5. Tạo mới tài sản (Yêu cầu quyền ASSET_MANAGE)
   * POST /assets
   */
  async createAsset(request: CreateAssetRequest): Promise<AssetDetailResponse> {
    const data = await http.post<CreateAssetRequest, AssetDetailResponse>(
      '/assets',
      request
    );

    if (!isAssetDetailResponse(data)) {
      throw new Error('Dữ liệu phản hồi tạo tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 6. Cập nhật thông tin tài sản (Yêu cầu quyền ASSET_MANAGE)
   * PUT /assets/{assetId}
   */
  async updateAsset(
    assetId: string,
    request: UpdateAssetRequest
  ): Promise<AssetDetailResponse> {
    const data = await http.put<UpdateAssetRequest, AssetDetailResponse>(
      `/assets/${encodeURIComponent(assetId)}`,
      request
    );

    if (!isAssetDetailResponse(data)) {
      throw new Error('Dữ liệu phản hồi cập nhật tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 7. Cấp phát tài sản cho nhân viên (Yêu cầu quyền ASSET_MANAGE)
   * POST /assets/{assetId}/assignments
   */
  async assignAsset(
    assetId: string,
    request: AssignAssetRequest
  ): Promise<AssetAssignmentResponse> {
    const data = await http.post<AssignAssetRequest, AssetAssignmentResponse>(
      `/assets/${encodeURIComponent(assetId)}/assignments`,
      request
    );

    if (!isAssetAssignmentResponse(data)) {
      throw new Error('Dữ liệu phản hồi cấp phát tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 8. Thu hồi tài sản (Yêu cầu quyền ASSET_MANAGE)
   * PUT /assets/{assetId}/assignments/{assignmentId}/return
   */
  async returnAsset(
    assetId: string,
    assignmentId: string,
    request: ReturnAssetRequest
  ): Promise<AssetAssignmentResponse> {
    const data = await http.put<ReturnAssetRequest, AssetAssignmentResponse>(
      `/assets/${encodeURIComponent(assetId)}/assignments/${encodeURIComponent(assignmentId)}/return`,
      request
    );

    if (!isAssetAssignmentResponse(data)) {
      throw new Error('Dữ liệu phản hồi thu hồi tài sản máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 9. Xem lịch sử sửa chữa / bảo dưỡng
   * GET /assets/{assetId}/repair-histories
   */
  async getRepairHistories(assetId: string): Promise<AssetRepairHistoryResponse[]> {
    const data = await http.get<AssetRepairHistoryResponse[]>(
      `/assets/${encodeURIComponent(assetId)}/repair-histories`
    );

    if (!isAssetRepairHistoryList(data)) {
      throw new Error('Dữ liệu lịch sử sửa chữa máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 10. Ghi nhận lịch sử sửa chữa / bảo dưỡng (Yêu cầu quyền ASSET_MANAGE)
   * POST /assets/{assetId}/repair-histories
   */
  async createRepairHistory(
    assetId: string,
    request: CreateAssetRepairHistoryRequest
  ): Promise<AssetRepairHistoryResponse> {
    const data = await http.post<CreateAssetRepairHistoryRequest, AssetRepairHistoryResponse>(
      `/assets/${encodeURIComponent(assetId)}/repair-histories`,
      request
    );

    if (!isAssetRepairHistoryResponse(data)) {
      throw new Error('Dữ liệu phản hồi tạo lịch sử sửa chữa máy chủ trả về không hợp lệ');
    }

    return data;
  },
};
