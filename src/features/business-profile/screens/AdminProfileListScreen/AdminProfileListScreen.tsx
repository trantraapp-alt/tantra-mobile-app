// Admin profile list: filtered by status from route params. Used by the
// tracker tiles (PENDING queue) and drill-downs (APPROVED / REJECTED / BLOCKED).
// Cards intentionally mirror the owner's My Profiles card (photo tile,
// owner name + ref-id chip → business name → category → location/submitted
// date, a tinted reason notice) — pure display, no action row, since a tap
// always goes to the full review screen instead.
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardList, MapPin, User } from 'lucide-react-native';
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
import { CardToneGradient } from '../../components/CardToneGradient';
import { useAdminProfiles } from '../../hooks/useAdminProfiles';
import type {
  BusinessProfile,
  ProfileTypeOption,
} from '../../types/businessProfile.types';
import { firstImageUrl } from '../../utils/profileImage';
import { cardLocality } from '../../utils/profileLocality';
import { getCardTone, getStatusIcon, getStatusLabelKey } from '../../utils/profileStatus';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { withAlpha } from '../../utils/withAlpha';
import { createAdminProfileListStyles } from './AdminProfileListScreen.styles';

export function AdminProfileListScreen() {
  const styles = useThemedStyles(createAdminProfileListStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack(routes.admin.businessProfile);
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{
    status?: string;
    profileType?: string;
    sort?: string;
  }>();
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
  const profileType = params.profileType;
  const useHistory = !status || status === 'ALL';
  // The dashboard's Time-to-Approval tile passes an explicit `sort` (oldest
  // pending first); every other tap relies on this screen's own default.
  const sort =
    params.sort ?? (status !== 'PENDING' ? 'verifiedAt,desc' : undefined);

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
    profileType,
    sort,
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

  const baseTitle =
    status === 'PENDING'
      ? t('businessProfile.admin.queue')
      : status === 'APPROVED'
        ? t('businessProfile.admin.approved')
        : status === 'REJECTED'
          ? t('businessProfile.admin.rejected')
          : status === 'BLOCKED'
            ? t('businessProfile.admin.blocked')
            : t('businessProfile.admin.history');

  // The dashboard's category row tap adds a `profileType` filter — surface it
  // in the header so the active filter is never silently invisible.
  const title = profileType
    ? `${baseTitle} · ${getProfileTypeLabel(profileType, profileTypes, language)}`
    : baseTitle;

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
      const tone = getCardTone(item.status);
      const toneColor = theme.colors[tone];
      const StatusIcon = getStatusIcon(item.status);
      const imageUri = firstImageUrl(item.attributes);
      const ownerName =
        typeof item.attributes?.ownerName === 'string' &&
        item.attributes.ownerName.trim() !== ''
          ? item.attributes.ownerName
          : null;
      const locality = cardLocality(item.address);
      const submittedOn = item.createdAt ? formatDate(item.createdAt) : null;
      return (
        <Card
          style={styles.card}
          radius="lg"
          onPress={() => {
            router.push({
              pathname: routes.admin.businessProfileReview(item.profileId),
              params: { profile: JSON.stringify(item) },
            });
          }}
        >
          <View style={styles.gradientLayer} pointerEvents="none">
            <CardToneGradient color={toneColor} />
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cornerBadge} pointerEvents="none">
              <Badge label={t(getStatusLabelKey(item.status))} tone={tone} />
            </View>
            <View style={styles.iconWrap}>
              <CardToneGradient
                color={toneColor}
                intensity={theme.opacity.subtle}
              />
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.iconImage}
                  contentFit="cover"
                  transition={theme.animation.normal}
                  accessibilityLabel={item.businessName}
                />
              ) : (
                <StatusIcon size={theme.sizing.iconXl} color={toneColor} />
              )}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.ownerRow}>
                {ownerName ? (
                  <>
                    <User
                      size={theme.sizing.iconXs}
                      color={theme.colors.textSecondary}
                    />
                    <Text
                      variant="label"
                      color="textSecondary"
                      numberOfLines={1}
                      style={styles.ownerName}
                    >
                      {ownerName}
                    </Text>
                  </>
                ) : <></>}
                <View
                  style={[
                    styles.refIdChip,
                    {
                      borderColor: withAlpha(theme.colors.primary, theme.opacity.subtle),
                      backgroundColor: withAlpha(theme.colors.primary, theme.opacity.faint),
                    },
                  ]}
                >
                  <Text variant="overline" color="primary">
                    {item.profileId}
                  </Text>
                </View>
              </View>
              <Text variant="h3" numberOfLines={1} style={styles.cardTitle}>
                {item.businessName}
              </Text>
              <Text
                variant="caption"
                color="textSecondary"
                style={styles.category}
              >
                {getProfileTypeLabel(item.profileType, profileTypes, language)}
              </Text>
              {locality || submittedOn ? (
                <View style={styles.metaRow}>
                  {locality ? (
                    <View style={styles.metaItem}>
                      <MapPin size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
                      <Text variant="caption" color="textSecondary">
                        {locality}
                      </Text>
                    </View>
                  ) : null}
                  {submittedOn ? (
                    <View style={styles.metaItem}>
                      <Text variant="caption" color="textTertiary">
                        {t('businessProfile.submittedOn', { value: submittedOn })}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              {item.verifiedAt || item.verifiedBy ? (
                <View style={styles.verifiedRow}>
                  {item.verifiedBy ? (
                    <Text variant="caption" color="textTertiary">
                      {t('businessProfile.admin.verifiedBy')}: {item.verifiedBy}
                    </Text>
                  ) : null}
                  {item.verifiedAt ? (
                    <Text variant="caption" color="textTertiary">
                      {formatDate(item.verifiedAt)}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          
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
