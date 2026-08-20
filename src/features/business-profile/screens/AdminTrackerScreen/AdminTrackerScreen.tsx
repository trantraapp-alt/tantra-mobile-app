// Business Profile Stats Dashboard (Screen 1 of the admin flow): the hero
// total tile, the four status tiles, the time-to-approval card, the success
// rate breakdown and the category breakdown — each tappable section drills
// into the Queue screen (AdminProfileListScreen) pre-filtered the way the
// tapped element implies. Refetches (silently) on focus so every count stays
// correct after an approve/reject/block action taken on the review screen.
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, Clock, Layers, TrendingUp } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Card, InfoBanner, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { HomeHeader } from '@/features/home/components';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';

import { GradientProgressBar } from '../../components/GradientProgressBar';
import { useAdminStats } from '../../hooks/useAdminStats';
import type { BusinessProfileStatus } from '../../types/businessProfile.types';
import { getStatusIcon, getStatusTone } from '../../utils/profileStatus';
import { withAlpha } from '../../utils/withAlpha';
import { createAdminTrackerStyles } from './AdminTrackerScreen.styles';

const TILE_STATUSES: BusinessProfileStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'BLOCKED',
];

// Formats a days value per the dashboard spec, or "N/A" when null.
function formatDays(
  value: number | null,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  labelKey: TranslationKey,
): string {
  if (value == null) {
    return t('businessProfile.admin.notAvailable');
  }
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return t(labelKey, { value: rounded });
}

// Props for AdminTrackerScreen.
export interface AdminTrackerScreenProps {
  // True when mounted as a tab root (the admin's Home tab) rather than pushed
  // from the profile menu — there's nowhere meaningful to go "back" to, so the
  // header's back chevron is hidden instead of bouncing back to itself.
  embedded?: boolean;
}

export function AdminTrackerScreen({ embedded = false }: AdminTrackerScreenProps = {}) {
  const styles = useThemedStyles(createAdminTrackerStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const { stats, isLoading, isError, refetch } = useAdminStats();
  // Hero card's own measured size — the brand gradient SVG needs explicit
  // pixel dimensions (same convention as BrandGradient/TrustBar).
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });
  const handleHeroLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setHeroSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch(true);
    }, [refetch]),
  );

  const goToQueue = useCallback(
    (query: string) => {
      router.push(`${routes.admin.businessProfileList}?${query}`);
    },
    [router],
  );

  const openSearch = useCallback(() => {
    router.push(routes.search);
  }, [router]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    if (isError || !stats) {
      return (
        <View style={styles.center}>
          <ErrorState
            description={t('businessProfile.admin.statsError')}
            onRetry={refetch}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }

    const counts: Record<BusinessProfileStatus, number> = {
      PENDING: stats.pending,
      APPROVED: stats.approved,
      REJECTED: stats.rejected,
      BLOCKED: stats.blocked,
    };
    const labelKeys: Record<BusinessProfileStatus, TranslationKey> = {
      PENDING: 'businessProfile.admin.pending',
      APPROVED: 'businessProfile.admin.approved',
      REJECTED: 'businessProfile.admin.rejected',
      BLOCKED: 'businessProfile.admin.blocked',
    };
    const descKeys: Record<BusinessProfileStatus, TranslationKey> = {
      PENDING: 'businessProfile.admin.pendingTileDesc',
      APPROVED: 'businessProfile.admin.approvedTileDesc',
      REJECTED: 'businessProfile.admin.rejectedTileDesc',
      BLOCKED: 'businessProfile.admin.blockedTileDesc',
    };

    // Section B — max pending days color-coding: healthy (<=7) reads success,
    // aging (>7) amber, stale (>14) red.
    const maxPendingDays = stats.maxPendingDays;
    const maxPendingTone =
      maxPendingDays == null
        ? 'textPrimary'
        : maxPendingDays > 14
          ? 'danger'
          : maxPendingDays > 7
            ? 'warning'
            : 'success';

    // Section C — success rate color-coding.
    const successRate = stats.successRate;
    const successTone =
      successRate >= 70 ? 'success' : successRate >= 50 ? 'warning' : 'danger';
    const reviewedTotal = stats.approved + stats.rejected + stats.blocked;

    
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — total submissions, brand gradient wash. */}
        <View style={styles.heroCard} onLayout={handleHeroLayout}>
          {heroSize.width > 0 ? (
            <Svg
              width={heroSize.width}
              height={heroSize.height}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="dashboardHero" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={theme.colors.primary} />
                  <Stop offset="1" stopColor={theme.colors.secondary} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width={heroSize.width}
                height={heroSize.height}
                fill="url(#dashboardHero)"
              />
            </Svg>
          ) : null}
          <View style={styles.heroIconCircle}>
            <Layers size={theme.sizing.iconLg} color={theme.colors.onPrimary} />
          </View>
          <Text variant="display" style={styles.heroCount}>
            {String(stats.total)}
          </Text>
          <Text variant="label" style={styles.heroLabel}>
            {t('businessProfile.admin.total').toUpperCase()}
          </Text>
          <Text variant="caption" style={styles.heroCaption}>
            {t('businessProfile.admin.heroSubtitle')}
          </Text>
        </View>

        {/* Section A — status tiles. */}
        <Text
          variant="overline"
          color="textSecondary"
          style={styles.sectionLabel}
        >
          {t('businessProfile.admin.statusOverview').toUpperCase()}
        </Text>
        <View style={styles.tilesGrid}>
          {TILE_STATUSES.map((status) => {
            const tone = getStatusTone(status);
            const toneColor = theme.colors[tone];
            const Icon = getStatusIcon(status);
            return (
              <Card
                key={status}
                style={[
                  styles.tile,
                  {
                    backgroundColor: withAlpha(toneColor, theme.opacity.faint),
                    borderColor: withAlpha(toneColor, theme.opacity.subtle),
                  },
                ]}
                onPress={() => goToQueue(`status=${status}`)}
              >
                <View style={styles.tileInner}>
                  <View
                    style={[styles.tileIcon, { backgroundColor: toneColor }]}
                  >
                    <Icon
                      size={theme.sizing.iconSm}
                      color={theme.colors.onPrimary}
                    />
                  </View>
                  <Text
                    variant="display"
                    style={[styles.tileCount, { color: toneColor }]}
                  >
                    {String(counts[status])}
                  </Text>
                  <Text variant="label" style={styles.tileLabel}>
                    {t(labelKeys[status])}
                  </Text>
                  <Text variant="caption" color="textSecondary" align="center">
                    {t(descKeys[status])}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Section B — time to approval. */}
        <Text
          variant="overline"
          color="textSecondary"
          style={styles.sectionLabel}
        >
          {t('businessProfile.admin.timeToApproval').toUpperCase()}
        </Text>
        <Card
          radius="lg"
          onPress={() => goToQueue('status=PENDING&sort=createdAt,asc')}
          style={styles.metricCard}
        >
          <View style={styles.metricRow}>
            <View style={styles.metricCol}>
              <View style={styles.metricIconRow}>
                <Clock
                  size={theme.sizing.iconSm}
                  color={theme.colors.primary}
                />
                <Text variant="caption" color="textSecondary">
                  {t('businessProfile.admin.avgApprovalLabel')}
                </Text>
              </View>
              <Text variant="h3" style={styles.metricValue}>
                {formatDays(
                  stats.avgApprovalDays,
                  t,
                  'businessProfile.admin.avgApprovalValue',
                )}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <View style={styles.metricIconRow}>
                <TrendingUp
                  size={theme.sizing.iconSm}
                  color={theme.colors[maxPendingTone]}
                />
                <Text variant="caption" color="textSecondary">
                  {t('businessProfile.admin.maxPendingLabel')}
                </Text>
              </View>
              <Text
                variant="h3"
                style={[
                  styles.metricValue,
                  { color: theme.colors[maxPendingTone] },
                ]}
              >
                {formatDays(
                  maxPendingDays,
                  t,
                  'businessProfile.admin.maxPendingValue',
                )}
              </Text>
            </View>
          </View>
          {stats.overdueCount > 0 ? (
            <View
              style={[
                styles.overdueChip,
                {
                  backgroundColor: withAlpha(
                    theme.colors.danger,
                    theme.opacity.faint,
                  ),
                  borderColor: withAlpha(
                    theme.colors.danger,
                    theme.opacity.subtle,
                  ),
                },
              ]}
            >
              <AlertTriangle
                size={theme.sizing.iconXs}
                color={theme.colors.danger}
              />
              <Text variant="label" style={{ color: theme.colors.danger }}>
                {t('businessProfile.admin.overdueCount', {
                  value: stats.overdueCount,
                })}
              </Text>
            </View>
          ) : null}
        </Card>
        {stats.overdueCount > 0 ? (
          <InfoBanner
            tone="warning"
            message={t('businessProfile.admin.overdueBanner', {
              value: stats.overdueCount,
            })}
          />
        ) : null}

        {/* Section C — success rate. */}
        <Text
          variant="overline"
          color="textSecondary"
          style={styles.sectionLabel}
        >
          {t('businessProfile.admin.successRate').toUpperCase()}
        </Text>
        <Card radius="lg" style={styles.metricCard}>
          <View style={styles.successHeader}>
            <Text
              variant="display"
              style={[
                styles.successPercent,
                { color: theme.colors[successTone] },
              ]}
            >
              {`${Math.round(successRate)}%`}
            </Text>
            <Text variant="caption" color="textSecondary">
              {reviewedTotal > 0
                ? t('businessProfile.admin.successRateSubtitle', {
                    value: reviewedTotal,
                  })
                : t('businessProfile.admin.noReviewedYet')}
            </Text>
          </View>
          {reviewedTotal > 0 ? (
            <>
              <View style={styles.successBarTrack}>
                {(['APPROVED', 'REJECTED', 'BLOCKED'] as const).map(
                  (status) => {
                    const value = counts[status];
                    if (value === 0) {
                      return null;
                    }
                    const pct = (value / reviewedTotal) * 100;
                    const color =
                      status === 'APPROVED'
                        ? theme.colors.success
                        : status === 'REJECTED'
                          ? theme.colors.danger
                          : theme.colors.textSecondary;
                    return (
                      <View
                        key={status}
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: color,
                        }}
                      />
                    );
                  },
                )}
              </View>
              <View style={styles.legendRow}>
                {(['APPROVED', 'REJECTED', 'BLOCKED'] as const).map(
                  (status) => {
                    const color =
                      status === 'APPROVED'
                        ? theme.colors.success
                        : status === 'REJECTED'
                          ? theme.colors.danger
                          : theme.colors.textSecondary;
                    return (
                      <Card
                        key={status}
                        radius="sm"
                        padded={false}
                        style={styles.legendChip}
                        onPress={() => goToQueue(`status=${status}`)}
                      >
                        <View style={styles.legendChipInner}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: color },
                            ]}
                          />
                          <Text variant="caption" color="textSecondary">
                            {t(labelKeys[status])}
                          </Text>
                          <Text variant="label">{String(counts[status])}</Text>
                        </View>
                      </Card>
                    );
                  },
                )}
              </View>
            </>
          ) : null}
        </Card>

        {/* Section D — category breakdown. */}
        <Text
          variant="overline"
          color="textSecondary"
          style={styles.sectionLabel}
        >
          {t('businessProfile.admin.categoryBreakdown').toUpperCase()}
        </Text>
        {stats?.categoryBreakdown?.length === 0 ? (
          <Card radius="lg" style={styles.metricCard}>
            <Text variant="body" color="textSecondary" align="center">
              {t('businessProfile.admin.noCategoryData')}
            </Text>
          </Card>
        ) : (
          <View style={styles.categoryList}>
            {stats?.categoryBreakdown?.map((item) => (
              <Card
                key={item.profileType}
                radius="lg"
                style={styles.categoryRow}
                onPress={() =>
                  goToQueue(
                    `status=PENDING&profileType=${encodeURIComponent(item.profileType)}`,
                  )
                }
              >
                <View style={styles.categoryLabelRow}>
                  <Text
                    variant="label"
                    numberOfLines={1}
                    style={styles.categoryLabel}
                  >
                    {item.profileType.replace(/_/g, ' ')}
                  </Text>
                  <Text variant="label" color="textSecondary">
                    {String(item.count)}
                  </Text>
                </View>
                <GradientProgressBar
                  percentage={item.percentage}
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  trackColor={theme.colors.surfaceVariant}
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    // HomeHeader owns its own top safe-area inset (it's a colored bar running
    // edge-to-edge), so only `bottom` is needed when embedded; the plain
    // Header doesn't, so the pushed-screen case still needs `top` too.
    <Screen padded={false} edges={embedded ? ['bottom'] : ['top', 'bottom']}>
      {embedded ? (
        <HomeHeader
          onSearchPress={openSearch}
          showSearch={false}
          showLocationBar={false}
        />
      ) : (
        <Header
          title={t('businessProfile.admin.title')}
          showBack={!embedded}
          onBack={goBack}
        />
      )}
      {renderBody()}
    </Screen>
  );
}
