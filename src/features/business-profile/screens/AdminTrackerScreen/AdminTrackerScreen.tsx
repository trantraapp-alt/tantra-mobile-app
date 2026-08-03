// Admin Approval Tracker: count tiles for PENDING/APPROVED/REJECTED/BLOCKED,
// plus the "reviewed by me" tally. Each tile navigates to the filtered list.
// Refetches (silently) on focus so counts reflect an approve/reject/block
// action taken on the review screen without a manual pull-to-refresh.
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Card, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';

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

const REVIEWED_STATUSES: BusinessProfileStatus[] = ['APPROVED', 'REJECTED', 'BLOCKED'];

export function AdminTrackerScreen() {
  const styles = useThemedStyles(createAdminTrackerStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const { stats, isLoading, isError, refetch } = useAdminStats();

  useFocusEffect(
    useCallback(() => {
      void refetch(true);
    }, [refetch]),
  );

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
    const reviewedCounts: Record<string, number> = {
      APPROVED: stats.reviewedByMe.approved,
      REJECTED: stats.reviewedByMe.rejected,
      BLOCKED: stats.reviewedByMe.blocked,
    };

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>
          {t('businessProfile.admin.tracker').toUpperCase()}
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
                onPress={() =>
                  router.push(
                    `${routes.admin.businessProfileList}?status=${status}`,
                  )
                }
              >
                <View style={styles.tileInner}>
                  <View style={[styles.tileIcon, { backgroundColor: toneColor }]}>
                    <Icon size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
                  </View>
                  <Text variant="display" style={[styles.tileCount, { color: toneColor }]}>
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

        <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>
          {t('businessProfile.admin.reviewedByMe').toUpperCase()}
        </Text>
        <View style={styles.reviewedRow}>
          {REVIEWED_STATUSES.map((status) => {
            const tone = getStatusTone(status);
            const toneColor = theme.colors[tone];
            const Icon = getStatusIcon(status);
            return (
              <View
                key={status}
                style={[
                  styles.reviewedChip,
                  {
                    backgroundColor: withAlpha(toneColor, theme.opacity.faint),
                    borderColor: withAlpha(toneColor, theme.opacity.subtle),
                  },
                ]}
              >
                <Icon size={theme.sizing.iconSm} color={toneColor} />
                <Text variant="h4" style={{ color: toneColor }}>
                  {String(reviewedCounts[status])}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {t(labelKeys[status])}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('businessProfile.admin.title')}
        showBack
        onBack={goBack}
      />
      {renderBody()}
    </Screen>
  );
}
