/**
 * Phase 16B: Service Request Card Component
 * Presentation-only card rendering a canonical service request item for SCR-SRV-01.
 *
 * Staging Invariant (16B):
 * - ServiceRequestDetail (SCR-SRV-02) is not implemented until Phase 16C.
 * - This component is strictly presentation-only: NO Pressable, NO onPress, NO accessibilityRole="button",
 *   and NO navigation to ServiceRequestDetail.
 * - Presentation-only staging intentionally mirrors Phase 15B TaskCard before TaskDetail existed.
 *
 * Canonical Fields:
 * - requestNumber (Human-readable business identifier: SR-YYYY-NNNNNN)
 * - title
 * - categoryName
 * - requesterName
 * - assigneeName (nullable; displays 'Chưa phân công' when null)
 * - status (via StatusBadge type="serviceRequest")
 * - priority (via PriorityBadge)
 * - createdAt (localized Vietnamese date/time)
 *
 * Security & Presentation Invariants:
 * - Never renders raw UUIDs (id, categoryId, requesterId, assigneeId, assetId).
 * - Never renders version, permissions, or allowedActions.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { PriorityBadge, StatusBadge } from '../../../shared/components';
import { ServiceRequestSummaryResponse } from '../types/serviceRequestTypes';

export interface ServiceRequestCardProps {
  request: ServiceRequestSummaryResponse;
  testID?: string;
}

/**
 * Defensive Vietnamese date-time formatter.
 * Handles ISO-8601 strings safely without crashing on malformed inputs.
 */
function formatDateTime(isoString?: string | null): string {
  if (!isoString || typeof isoString !== 'string') {
    return 'Chưa xác định';
  }

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'Chưa xác định';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return 'Chưa xác định';
  }
}

export function ServiceRequestCard({ request, testID }: ServiceRequestCardProps) {
  const theme = useAppTheme();

  const assigneeText = request.assigneeName ? request.assigneeName : 'Chưa phân công';
  const formattedCreatedAt = formatDateTime(request.createdAt);

  const accessibleLabel = [
    `Yêu cầu: ${request.title}`,
    `Mã: ${request.requestNumber}`,
    `Danh mục: ${request.categoryName}`,
    `Trạng thái: ${request.status}`,
    `Độ ưu tiên: ${request.priority}`,
    `Người tạo: ${request.requesterName}`,
    `Người xử lý: ${assigneeText}`,
    `Ngày tạo: ${formattedCreatedAt}`,
  ].join(', ');

  return (
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
      accessible={true}
      accessibilityLabel={accessibleLabel}
      testID={testID ?? `service-request-card-${request.id}`}
    >
      {/* Top Row: Request Number & Category Badge / Category Name */}
      <View style={styles.headerRow}>
        <View style={styles.numberCategoryContainer}>
          <Text
            style={[
              theme.typography.caption,
              styles.requestNumberText,
              { color: theme.colors.primary },
            ]}
            numberOfLines={1}
            testID="service-request-number"
          >
            {request.requestNumber}
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
            testID="service-request-category"
          >
            {request.categoryName}
          </Text>
        </View>

        {/* Badges: Priority + Status */}
        <View style={styles.badgeRow}>
          <PriorityBadge priority={request.priority} />
          <View style={styles.badgeSpacer} />
          <StatusBadge type="serviceRequest" status={request.status} />
        </View>
      </View>

      {/* Title */}
      <Text
        style={[
          theme.typography.heading3,
          styles.titleText,
          { color: theme.colors.textPrimary, marginTop: theme.spacing.xs },
        ]}
        numberOfLines={2}
        testID="service-request-title"
      >
        {request.title}
      </Text>

      {/* Meta Footer */}
      <View style={[styles.metaFooter, { marginTop: theme.spacing.sm }]}>
        <View style={styles.metaRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
            testID="service-request-requester"
          >
            Người tạo: <Text style={{ color: theme.colors.textPrimary }}>{request.requesterName}</Text>
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
            testID="service-request-assignee"
          >
            Người xử lý: <Text style={{ color: theme.colors.textPrimary }}>{assigneeText}</Text>
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary }]}
            testID="service-request-date"
          >
            Ngày tạo: {formattedCreatedAt}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  requestNumberText: {
    fontWeight: '700',
  },
  separatorText: {
    marginHorizontal: 6,
  },
  categoryText: {
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacer: {
    width: 6,
  },
  titleText: {
    fontWeight: '600',
  },
  metaFooter: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
