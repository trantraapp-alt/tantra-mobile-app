// Admin profile list: filtered by status from route params. Used by the
// tracker tiles (PENDING queue) and drill-downs (APPROVED / REJECTED / BLOCKED).
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';

import { businessProfileApi } from '../../api/businessProfileApi';
import { useAdminProfiles } from '../../hooks/useAdminProfiles';
import type { BusinessProfile, BusinessProfileStatus, ProfileTypeOption } from '../../types/businessProfile.types';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createAdminProfileListStyles } from './AdminProfileListScreen.styles';

function statusTone(status: BusinessProfileStatus) {
  if (status === 'APPROVED') {
    return 'success' as const;
  }
  if (status === 'PENDING') {
    return 'warning' as const;
  }
  return 'danger' as const;
}

export function AdminProfileListScreen() {
  const styles = useThemedStyles(createAdminProfileListStyles);
  const router = useRouter();
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
    ({ item }: { item: BusinessProfile }) => (
      <Card
        style={styles.card}
        onPress={() => {
          router.push({
            pathname: routes.admin.businessProfileReview(item.profileId),
            params: { profile: JSON.stringify(item) },
          });
        }}
      >
        <View style={styles.cardHeader}>
          <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
            {item.businessName}
          </Text>
          <Badge
            label={item.status}
            tone={statusTone(item.status)}
          />
        </View>
        <Text variant="caption" color="textSecondary">
          {getProfileTypeLabel(item.profileType, profileTypes, language)}
        </Text>
        {item.verifiedAt ? (
          <Text variant="caption" color="textTertiary" style={styles.meta}>
            {t('businessProfile.admin.verifiedAt')}: {item.verifiedAt}
          </Text>
        ) : null}
        {item.verifiedBy ? (
          <Text variant="caption" color="textTertiary">
            {t('businessProfile.admin.verifiedBy')}: {item.verifiedBy}
          </Text>
        ) : null}
      </Card>
    ),
    [router, styles, t, language, profileTypes],
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
    return (
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
    );
  };

  return (
    <Screen padded={false}>
      <Header title={title} showBack onBack={() => router.back()} />
      {renderBody()}
    </Screen>
  );
}
