/**
 * Phase 17B: Asset Card Component
 * Presentation card rendering a single asset item for SCR-AST-01 (AssetListScreen).
 *
 * Invariants:
 * - Displays assetCode, name, category name, serialNumber, model, location, currentAssignee (if present).
 * - Renders StatusBadge type="asset" with canonical AssetStatus.
 * - On press, invokes onPress handler with assetId (strictly UUID, NEVER assetCode).
 * - Touch targets >= 48dp, accessible label, zero raw stack/DB/auth leaks.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { AssetSummaryResponse } from '../types/assetTypes';

export interface AssetCardProps {
  asset: AssetSummaryResponse;
  onPress?: (assetId: string) => void;
  testID?: string;
}

export function AssetCard({ asset, onPress, testID }: AssetCardProps) {
  const theme = useAppTheme();

  const assigneeText = asset.currentAssignee?.fullName
    ? asset.currentAssignee.fullName
    : 'Chưa cấp phát';

  const accessibleLabel = [
    `Tài sản: ${asset.name}`,
    `Mã: ${asset.assetCode}`,
    `Loại: ${asset.category.name}`,
    `Trạng thái: ${asset.status}`,
    asset.serialNumber ? `Số sê-ri: ${asset.serialNumber}` : '',
    asset.location ? `Vị trí: ${asset.location}` : '',
    `Người sử dụng: ${assigneeText}`,
  ]
    .filter(Boolean)
    .join(', ');

  const handlePress = () => {
    if (onPress) {
      onPress(asset.id);
    }
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.medium,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
      ]}
    >
      {/* Header: Asset Code & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.codeCategoryContainer}>
          <Text
            style={[
              theme.typography.caption,
              styles.assetCodeText,
              { color: theme.colors.primary },
            ]}
            numberOfLines={1}
            testID="asset-card-code"
          >
            {asset.assetCode}
          </Text>
          <Text style={[theme.typography.caption, styles.separatorText, { color: theme.colors.textSecondary }]}>
            •
          </Text>
          <Text
            style={[
              theme.typography.caption,
              styles.categoryText,
              { color: theme.colors.textSecondary },
            ]}
            numberOfLines={1}
            testID="asset-card-category"
          >
            {asset.category.name}
          </Text>
        </View>

        <StatusBadge type="asset" status={asset.status} />
      </View>

      {/* Asset Name */}
      <Text
        style={[
          theme.typography.heading3,
          styles.nameText,
          { color: theme.colors.textPrimary, marginTop: theme.spacing.xs },
        ]}
        numberOfLines={2}
        testID="asset-card-name"
      >
        {asset.name}
      </Text>

      {/* Details: Model / Serial */}
      {(asset.model || asset.serialNumber) && (
        <View style={[styles.detailRow, { marginTop: theme.spacing.xs }]}>
          {asset.model && (
            <Text
              style={[theme.typography.caption, { color: theme.colors.textSecondary, marginRight: theme.spacing.md }]}
              numberOfLines={1}
              testID="asset-card-model"
            >
              Model: <Text style={{ color: theme.colors.textPrimary }}>{asset.model}</Text>
            </Text>
          )}
          {asset.serialNumber && (
            <Text
              style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
              testID="asset-card-serial"
            >
              S/N: <Text style={{ color: theme.colors.textPrimary }}>{asset.serialNumber}</Text>
            </Text>
          )}
        </View>
      )}

      {/* Footer: Assignee & Location */}
      <View style={[styles.footerRow, { marginTop: theme.spacing.sm }]}>
        <View style={styles.footerItem}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
            testID="asset-card-assignee"
          >
            Người dùng: <Text style={{ color: theme.colors.textPrimary }}>{assigneeText}</Text>
          </Text>
        </View>

        {asset.location && (
          <View style={styles.footerItemRight}>
            <Text
              style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
              testID="asset-card-location"
            >
              Vị trí: <Text style={{ color: theme.colors.textPrimary }}>{asset.location}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibleLabel}
        testID={testID ?? `asset-card-${asset.id}`}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View
      accessible={true}
      accessibilityLabel={accessibleLabel}
      testID={testID ?? `asset-card-${asset.id}`}
    >
      {cardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 48,
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  assetCodeText: {
    fontWeight: '700',
  },
  separatorText: {
    marginHorizontal: 6,
  },
  categoryText: {
    flexShrink: 1,
  },
  nameText: {
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
    marginRight: 8,
  },
  footerItemRight: {
    flexShrink: 0,
  },
});
