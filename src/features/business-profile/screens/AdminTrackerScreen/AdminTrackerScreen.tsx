// Admin Approval Tracker: count tiles for PENDING/APPROVED/REJECTED/BLOCKED,
// plus the "reviewed by me" tally. Each tile navigates to the filtered list.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Card, Divider, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';

import { useAdminStats } from '../../hooks/useAdminStats';
import { createAdminTrackerStyles } from './AdminTrackerScreen.styles';

export function AdminTrackerScreen() {
  const styles = useThemedStyles(createAdminTrackerStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { stats, isLoading, isError, refetch } = useAdminStats();

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

    const tiles = [
      {
        key: 'PENDING',
        label: t('businessProfile.admin.pending'),
        count: stats.pending,
        tone: 'warning' as const,
      },
      {
        key: 'APPROVED',
        label: t('businessProfile.admin.approved'),
        count: stats.approved,
        tone: 'success' as const,
      },
      {
        key: 'REJECTED',
        label: t('businessProfile.admin.rejected'),
        count: stats.rejected,
        tone: 'danger' as const,
      },
      {
        key: 'BLOCKED',
        label: t('businessProfile.admin.blocked'),
        count: stats.blocked,
        tone: 'danger' as const,
      },
    ];

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tilesGrid}>
          {tiles.map((tile) => (
            <Card
              key={tile.key}
              style={styles.tile}
              onPress={() =>
                router.push(
                  `${routes.admin.businessProfileList}?status=${tile.key}`,
                )
              }
            >
              <View style={styles.tileInner}>
                <Text variant="display" style={styles.tileCount}>
                  {String(tile.count)}
                </Text>
                <Text variant="caption" color="textSecondary" align="center">
                  {tile.label}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Divider spaced />

        <View style={styles.reviewedByMe}>
          <Text variant="overline" color="textSecondary">
            {t('businessProfile.admin.reviewedByMe').toUpperCase()}
          </Text>
          <View style={styles.reviewedRow}>
            <View style={styles.reviewedItem}>
              <Text variant="h3">{String(stats.reviewedByMe.approved)}</Text>
              <Text variant="caption" color="textSecondary">
                {t('businessProfile.admin.approved')}
              </Text>
            </View>
            <View style={styles.reviewedItem}>
              <Text variant="h3">{String(stats.reviewedByMe.rejected)}</Text>
              <Text variant="caption" color="textSecondary">
                {t('businessProfile.admin.rejected')}
              </Text>
            </View>
            <View style={styles.reviewedItem}>
              <Text variant="h3">{String(stats.reviewedByMe.blocked)}</Text>
              <Text variant="caption" color="textSecondary">
                {t('businessProfile.admin.blocked')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('businessProfile.admin.tracker')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}
    </Screen>
  );
}
