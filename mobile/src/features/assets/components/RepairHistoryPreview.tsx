/**
 * Phase 17C & 17F-CORRECTIVE: RepairHistoryPreview Component
 * Displays a list or preview of repair and maintenance histories for an asset.
 * Can consume histories directly from AssetDetailResponse.repairHistories,
 * or fetch independently via assetApi.getRepairHistories(assetId).
 * Supports external refresh triggers via refreshKey.
 *
 * Invariants:
 * - Read-only display of repair audit records.
 * - Local loading, error, and retry states that fail closed without crashing the host screen.
 * - Formats cost in Vietnamese Đồng (VND), formats ISO timestamps safely.
 * - No raw internal database UUIDs rendered.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { assetApi } from '../api/assetApi';
import { AssetRepairHistoryResponse } from '../types/assetTypes';

export interface RepairHistoryPreviewProps {
  assetId: string;
  initialHistories?: AssetRepairHistoryResponse[];
  refreshKey?: number;
  testID?: string;
}

export function RepairHistoryPreview({
  assetId,
  initialHistories,
  refreshKey,
  testID = 'repair-history-preview',
}: RepairHistoryPreviewProps) {
  const theme = useAppTheme();
  const [histories, setHistories] = useState<AssetRepairHistoryResponse[]>(
    initialHistories ?? []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevRefreshKeyRef = useRef(refreshKey);

  useEffect(() => {
    if (initialHistories) {
      setHistories(initialHistories);
    }
  }, [initialHistories]);

  const loadHistories = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await assetApi.getRepairHistories(assetId);
      setHistories(data);
    } catch {
      setError('Không thể tải lịch sử sửa chữa');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    if (
      refreshKey !== undefined &&
      prevRefreshKeyRef.current !== undefined &&
      refreshKey !== prevRefreshKeyRef.current
    ) {
      loadHistories();
    }
    prevRefreshKeyRef.current = refreshKey;
  }, [refreshKey, loadHistories]);

  const formatCurrency = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return 'Không có';
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
  };

  const formatDate = (isoString?: string | null): string => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return isoString;
    }
  };

  const getRepairTypeLabel = (type: string): string => {
    switch (type) {
      case 'MAINTENANCE':
        return 'Bảo dưỡng';
      case 'REPAIR':
        return 'Sửa chữa';
      case 'INSPECTION':
        return 'Kiểm định';
      case 'UPGRADE':
        return 'Nâng cấp';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={[theme.typography.heading3, { color: theme.colors.textPrimary }]}>
          Lịch sử sửa chữa & bảo dưỡng
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingBox} testID={`${testID}-loading`}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[theme.typography.caption, styles.loadingText, { color: theme.colors.textSecondary }]}>
            Đang tải lịch sử...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error },
          ]}
          testID={`${testID}-error`}
        >
          <Text style={[theme.typography.caption, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Pressable
            onPress={loadHistories}
            style={[styles.retryBtn, { borderColor: theme.colors.error }]}
            testID={`${testID}-retry`}
          >
            <Text style={[theme.typography.caption, styles.retryText, { color: theme.colors.error }]}>
              Thử lại
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && histories.length === 0 && (
        <View
          style={[styles.emptyBox, { backgroundColor: theme.colors.surfaceVariant }]}
          testID={`${testID}-empty`}
        >
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            Chưa có lịch sử sửa chữa hoặc bảo dưỡng nào.
          </Text>
        </View>
      )}

      {!loading && histories.length > 0 && (
        <View style={styles.list}>
          {histories.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              testID={`${testID}-item-${index}`}
            >
              <View style={styles.itemHeader}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.badgeText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {getRepairTypeLabel(item.repairType)}
                  </Text>
                </View>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  {formatDate(item.startedAt)}
                </Text>
              </View>

              <Text
                style={[
                  theme.typography.bodyMedium,
                  styles.descText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {item.description}
              </Text>

              <View style={styles.itemMetaRow}>
                {item.vendorName ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Đơn vị: {item.vendorName}
                  </Text>
                ) : null}
                {item.cost !== undefined && item.cost !== null ? (
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.costText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Chi phí: {formatCurrency(item.cost)}
                  </Text>
                ) : null}
              </View>

              {item.result ? (
                <Text
                  style={[
                    theme.typography.caption,
                    styles.resultText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Kết quả: {item.result}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingBox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  emptyBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  list: {
    gap: 10,
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 6,
  },
  retryText: {
    fontWeight: '600',
  },
  badgeText: {
    fontWeight: '600',
  },
  descText: {
    marginTop: 8,
  },
  costText: {
    fontWeight: '600',
  },
  resultText: {
    marginTop: 4,
  },
});
