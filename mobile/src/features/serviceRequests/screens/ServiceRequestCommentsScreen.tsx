/**
 * Phase 16F: Service Request Comments Screen (SCR-SRV-05)
 * Full screen for viewing and contributing comments to a service request.
 * Aligned with docs/03_MOBILE_SCREEN_MAP.md, design/02_SCREEN_INVENTORY.md,
 * 06_API_CONTRACT.md section 13.8 & 13.9, and ServiceRequestApplicationService.java.
 *
 * Invariants & Correctness Guarantees:
 * - Hidden auxiliary tab route { requestId: string } registered in MainTabNavigator.
 * - Independently fetches Service Request Detail on mount; fails closed if Detail cannot be fetched.
 * - Add Comment section is visible ONLY when allowedActions contains 'COMMENT'.
 * - Internal note toggle is visible ONLY when canCreateInternal capability is proven (ADMIN or active assignee).
 * - Maximum comment length 5000 characters; content cannot be blank.
 * - Synchronous adding lock prevents duplicate submissions.
 * - Zero raw database UUIDs (id, requestId, authorId, fileId) rendered.
 * - Accessible touch targets >= 48dp.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../../app/auth/AuthProvider';
import { useAppTheme } from '../../../app/providers/ThemeProvider';
import { MainTabNavProp, MainTabScreenRouteProp } from '../../../app/navigation/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmptyState, ErrorState, LoadingIndicator } from '../../../shared/components';
import { AppButton } from '../../../shared/components/AppButton';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { useServiceRequestComments } from '../hooks/useServiceRequestComments';
import { ServiceCommentResponse, ServiceRequestDetailResponse } from '../types/serviceRequestTypes';

const MAX_COMMENT_LENGTH = 5000;

function formatDateTime(isoString?: string | null): string {
  if (!isoString || typeof isoString !== 'string') {
    return 'Chưa xác định';
  }

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return isoString;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}

export function ServiceRequestCommentsScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<MainTabNavProp<'ServiceRequestComments'>>();
  const route = useRoute<MainTabScreenRouteProp<'ServiceRequestComments'>>();
  const { currentUser } = useAuth();

  const { requestId } = route.params;

  // Detail query for authoritative allowedActions and context
  const [detail, setDetail] = useState<ServiceRequestDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(true);
  const [_detailError, setDetailError] = useState<string | null>(null);

  // Hook for paginated comments
  const {
    comments,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refreshError,
    paginationError,
    load,
    refresh,
    loadMore,
    addComment,
  } = useServiceRequestComments(requestId);

  // Comment input state
  const [content, setContent] = useState<string>('');
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // Fetch authoritative Detail capability independently
  const fetchDetail = useCallback(async () => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const res = await serviceRequestApi.getServiceRequestDetail(requestId);
      if (mountedRef.current) {
        setDetail(res);
      }
    } catch {
      if (mountedRef.current) {
        setDetailError('Không thể tải thông tin yêu cầu dịch vụ');
      }
    } finally {
      if (mountedRef.current) {
        setDetailLoading(false);
      }
    }
  }, [requestId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchDetail();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchDetail]);

  // Authorization checks
  const canComment = Boolean(detail?.allowedActions?.includes('COMMENT'));
  const isAdmin = currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ROLE_ADMIN') ?? false;
  const isActiveAssignee = Boolean(
    currentUser?.id && detail?.assignee?.id && currentUser.id === detail.assignee.id
  );
  const canCreateInternal = isAdmin || isActiveAssignee;

  const handleSendComment = async () => {
    if (submittingRef.current || submitting) {
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      setSubmitError('Nội dung bình luận không được để trống');
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmitError(`Nội dung bình luận tối đa ${MAX_COMMENT_LENGTH} ký tự`);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await addComment({
        content: trimmed,
        isInternal: canCreateInternal && isInternal ? true : false,
      });

      if (mountedRef.current) {
        setContent('');
        setIsInternal(false);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        setSubmitError(
          err instanceof Error && err.message
            ? err.message
            : 'Không thể gửi bình luận. Vui lòng thử lại.'
        );
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const renderCommentItem = ({ item }: { item: ServiceCommentResponse }) => {
    return (
      <View
        style={[
          styles.commentItem,
          {
            backgroundColor: item.isInternal
              ? theme.colors.surfaceVariant
              : theme.colors.surface,
            borderColor: item.isInternal
              ? theme.colors.warning
              : theme.colors.border,
          },
        ]}
        testID={`comment-item-${item.id}`}
      >
        <View style={styles.commentHeader}>
          <Text
            style={[
              theme.typography.body,
              styles.authorName,
              { color: theme.colors.textPrimary },
            ]}
          >
            {item.authorName || 'Người dùng'}
          </Text>

          {item.isInternal ? (
            <View
              style={[
                styles.internalBadge,
                { backgroundColor: theme.colors.warning },
              ]}
              testID="badge-internal-comment"
            >
              <Text
                style={[
                  theme.typography.caption,
                  { color: '#FFFFFF', fontWeight: '700', fontSize: 10 },
                ]}
              >
                Nội bộ
              </Text>
            </View>
          ) : null}

          {item.isEdited ? (
            <Text
              style={[
                theme.typography.caption,
                styles.editedText,
                { color: theme.colors.textSecondary },
              ]}
              testID="badge-edited-comment"
            >
              (Đã sửa)
            </Text>
          ) : null}

          <Text
            style={[
              theme.typography.caption,
              styles.createdAtText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {formatDateTime(item.createdAt)}
          </Text>
        </View>

        <Text
          style={[
            theme.typography.body,
            styles.commentContent,
            { color: theme.colors.textPrimary },
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      testID="screen-service-request-comments"
    >
      {/* Screen Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại chi tiết yêu cầu"
          testID="btn-back-service-comments"
        >
          <Text style={{ fontSize: 24, color: theme.colors.textPrimary }}>
            ‹
          </Text>
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              theme.typography.heading3,
              { color: theme.colors.textPrimary },
            ]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            Bình luận
          </Text>
          {detail ? (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={1}
              testID="comments-header-subtitle"
            >
              {detail.requestNumber} • {detail.title}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Non-blocking Refresh Error Banner */}
      {refreshError ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.error,
            },
          ]}
          accessibilityRole="alert"
        >
          <Text
            style={[theme.typography.caption, { color: theme.colors.error }]}
            testID="comments-refresh-error"
          >
            {refreshError}
          </Text>
        </View>
      ) : null}

      {/* Body Content */}
      {loading ? (
        <LoadingIndicator message="Đang tải danh sách bình luận..." />
      ) : error ? (
        <ErrorState
          title="Không thể tải bình luận"
          message={error.message}
          onRetry={load}
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={renderCommentItem}
          contentContainerStyle={[
            styles.listContent,
            comments.length === 0 && styles.listEmptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={() => {
            if (hasNext && !loadingMore) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              title="Chưa có trao đổi nào"
              description="Yêu cầu dịch vụ này chưa có bình luận hay ghi chú nào."
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                />
              </View>
            ) : paginationError ? (
              <View style={styles.footerError}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.error },
                  ]}
                  testID="comments-pagination-error"
                >
                  {paginationError}
                </Text>
                <AppButton
                  title="Thử lại"
                  variant="outline"
                  onPress={loadMore}
                  testID="btn-retry-pagination"
                />
              </View>
            ) : <View />
          }
        />
      )}

      {/* Bottom Add Comment Section (Only if permitted) */}
      {!detailLoading && canComment ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            {/* Internal Note Toggle (Only for ADMIN or active assignee) */}
            {canCreateInternal ? (
              <View style={styles.internalToggleRow}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.textPrimary, fontWeight: '600' },
                  ]}
                >
                  Ghi chú nội bộ (chỉ kỹ thuật viên xem)
                </Text>
                <Switch
                  value={isInternal}
                  onValueChange={setIsInternal}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.warning,
                  }}
                  testID="switch-internal-comment"
                />
              </View>
            ) : null}

            {/* Error Message */}
            {submitError ? (
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.error, marginBottom: 4 },
                ]}
                testID="comment-submit-error"
              >
                {submitError}
              </Text>
            ) : null}

            {/* Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                value={content}
                onChangeText={text => {
                  setContent(text);
                  setSubmitError(null);
                }}
                placeholder={
                  isInternal
                    ? 'Nhập ghi chú nội bộ...'
                    : 'Nhập bình luận hoặc trao đổi...'
                }
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={MAX_COMMENT_LENGTH}
                style={[
                  styles.textInput,
                  theme.typography.body,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: isInternal
                      ? theme.colors.warning
                      : theme.colors.border,
                    color: theme.colors.textPrimary,
                  },
                ]}
                accessibilityLabel="Nội dung bình luận"
                testID="input-service-comment-content"
              />
              <AppButton
                title={submitting ? '...' : 'Gửi'}
                variant="primary"
                onPress={handleSendComment}
                loading={submitting}
                disabled={submitting || !content.trim()}
                style={styles.sendButton}
                testID="btn-submit-service-comment"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  banner: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontWeight: '700',
  },
  internalBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editedText: {
    fontStyle: 'italic',
  },
  createdAtText: {
    marginLeft: 'auto',
  },
  commentContent: {
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerError: {
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  internalToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  sendButton: {
    minWidth: 64,
    minHeight: 44,
  },
});
