// Admin profile list: filtered by status from route params. Used by the
// tracker tiles (PENDING queue) and drill-downs (APPROVED / REJECTED / BLOCKED).
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, ClipboardList, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { commonStyles, formatDate } from '@/utils';

import { businessProfileApi } from '../../api/businessProfileApi';
import { useAdminProfiles } from '../../hooks/useAdminProfiles';
import type { BusinessProfile, ProfileTypeOption } from '../../types/businessProfile.types';
import { getStatusIcon, getStatusLabelKey, getStatusTone } from '../../utils/profileStatus';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { withAlpha } from '../../utils/withAlpha';
import { createAdminProfileListStyles } from './AdminProfileListScreen.styles';

export function AdminProfileListScreen() {
  const styles = useThemedStyles(createAdminProfileListStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack(routes.admin.businessProfile);
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ status?: string }>();
  const [profileTypes, setProfileTypes] = useState<ProfileTypeOption[]>([]);

  // Fetch profile types once for label mapping
  useEffect(() => {
    businessProfileApi
      .getProfileTypes()
      .then(setProfileTypes)
      .catch(() => {
        /* fallback: use keys as labels */
      });
  }, []);

  const status = params.status;
  const useHistory = !status || status === 'ALL';

  const {
    profiles,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isError,
    isEmpty,
    loadMore,
    refresh,
  } = useAdminProfiles({
    status: useHistory ? undefined : status,
    sort: status !== 'PENDING' ? 'verifiedAt,desc' : undefined,
    useHistory,
  });

  // Refresh whenever this list regains focus — e.g. returning from the review
  // screen after an approve/reject/block action — so it never shows a stale
  // status or a just-actioned row still sitting in the PENDING queue.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const title =
    status === 'PENDING'
      ? t('businessProfile.admin.queue')
      : status === 'APPROVED'
        ? t('businessProfile.admin.approved')
        : status === 'REJECTED'
          ? t('businessProfile.admin.rejected')
          : status === 'BLOCKED'
            ? t('businessProfile.admin.blocked')
            : t('businessProfile.admin.history');

  const emptyTitle =
    status === 'PENDING'
      ? t('businessProfile.admin.emptyQueue')
      : t('businessProfile.admin.emptyHistory');

  const emptyDesc =
    status === 'PENDING'
      ? t('businessProfile.admin.emptyQueueDesc')
      : t('businessProfile.admin.emptyHistory');

  const renderItem = useCallback(
    ({ item }: { item: BusinessProfile }) => {
      const tone = getStatusTone(item.status);
      const toneColor = theme.colors[tone];
      const StatusIcon = getStatusIcon(item.status);
      const reason =
        item.status === 'REJECTED'
          ? item.rejectReason
          : item.status === 'BLOCKED'
            ? item.blockReason
            : null;
      return (
        <Card
          style={[
            styles.card,
            {
              backgroundColor: withAlpha(toneColor, theme.opacity.faint),
              borderColor: withAlpha(toneColor, theme.opacity.subtle),
            },
          ]}
          onPress={() => {
            router.push({
              pathname: routes.admin.businessProfileReview(item.profileId),
              params: { profile: JSON.stringify(item) },
            });
          }}
        >
          <View style={styles.cardRow}>
            <View style={[styles.statusIcon, { backgroundColor: toneColor }]}>
              <StatusIcon size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text variant="bodyMedium" numberOfLines={1} style={styles.cardTitle}>
                  {item.businessName}
                </Text>
                <Badge label={t(getStatusLabelKey(item.status))} tone={tone} />
              </View>
              <Text variant="caption" color="textSecondary">
                {getProfileTypeLabel(item.profileType, profileTypes, language)}
              </Text>
              {reason ? (
                <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.reasonPreview}>
                  {reason}
                </Text>
              ) : null}
              {item.verifiedAt || item.verifiedBy ? (
                <View style={styles.metaRow}>
                  {item.verifiedBy ? (
                    <View style={styles.metaItem}>
                      <User size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                      <Text variant="caption" color="textTertiary">
                        {item.verifiedBy}
                      </Text>
                    </View>
                  ) : null}
                  {item.verifiedAt ? (
                    <Text variant="caption" color="textTertiary">
                      {formatDate(item.verifiedAt)}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <ChevronRight size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
          </View>
        </Card>
      );
    },
    [router, styles, t, theme, language, profileTypes],
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={refresh} retryLabel={t('common.retry')} />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDesc}
        />
      );
    }
    // The flex wrapper bounds the list below the header, so FlashList scrolls
    // internally instead of growing to its content height and pushing its own
    // tail out of reach.
    return (
      <View style={commonStyles.flexOne}>
        <FlashList
          data={profiles}
          keyExtractor={(item) => item.profileId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshing={isRefreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <Spinner />
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header title={title} showBack onBack={goBack} />
      {renderBody()}
    </Screen>
  );
}
