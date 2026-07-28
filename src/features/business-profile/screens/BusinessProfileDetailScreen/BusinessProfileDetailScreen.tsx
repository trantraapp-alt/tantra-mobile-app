// Business Profile detail view. Owners see it for any status; others only if
// the profile is APPROVED + visible.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, Screen, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { createBPDetailScreenStyles } from './BusinessProfileDetailScreen.styles';

export function BusinessProfileDetailScreen() {
  const styles = useThemedStyles(createBPDetailScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const { profile, isLoading, isError, refetch } = useBusinessProfile(
    profileId ?? '',
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    if (isError || !profile) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={refetch} retryLabel={t('common.retry')} />
        </View>
      );
    }

    const statusLabel =
      profile.status === 'APPROVED'
        ? t('businessProfile.status.approved')
        : profile.status === 'PENDING'
          ? t('businessProfile.status.pending')
          : profile.status === 'REJECTED'
            ? t('businessProfile.status.rejected')
            : t('businessProfile.status.blocked');

    const statusTone =
      profile.status === 'APPROVED'
        ? ('success' as const)
        : profile.status === 'PENDING'
          ? ('warning' as const)
          : ('danger' as const);

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusRow}>
          <Badge label={statusLabel} tone={statusTone} />
        </View>

        {/* Verified banner */}
        {profile.status === 'APPROVED' && (
          <View style={styles.verifiedBanner}>
            <BadgeCheck size={theme.sizing.iconMd} color={theme.colors.success} />
            <Text variant="bodyMedium" color="success">
              {t('businessProfile.verifiedBadge')}
            </Text>
          </View>
        )}

        {/* Reason boxes */}
        {profile.rejectReason ? (
          <View style={styles.reasonBox}>
            <Text variant="caption" color="textSecondary">
              {t('businessProfile.rejectReason')}
            </Text>
            <Text variant="body">{profile.rejectReason}</Text>
          </View>
        ) : null}
        {profile.blockReason ? (
          <View style={styles.reasonBox}>
            <Text variant="caption" color="textSecondary">
              {t('businessProfile.blockReason')}
            </Text>
            <Text variant="body">{profile.blockReason}</Text>
          </View>
        ) : null}

        {/* Business details */}
        <View style={styles.section}>
          <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
            {t('businessProfile.profileDetails').toUpperCase()}
          </Text>
          <View style={styles.field}>
            <Text variant="caption" color="textSecondary">
              {t('businessProfile.myProfiles')}
            </Text>
            <Text variant="bodyMedium">{profile.businessName}</Text>
          </View>
          <View style={styles.field}>
            <Text variant="caption" color="textSecondary">
              {t('businessProfile.selectType')}
            </Text>
            <Text variant="body">{profile.profileType}</Text>
          </View>

          {/* Attributes */}
          {Object.entries(profile.attributes ?? {}).map(([key, value]) =>
            value != null ? (
              <View key={key} style={styles.field}>
                <Text variant="caption" color="textSecondary">
                  {key}
                </Text>
                <Text variant="body">{String(value)}</Text>
              </View>
            ) : null,
          )}
        </View>

        {/* Address */}
        {profile.address && Object.keys(profile.address).length > 0 && (
          <View style={styles.section}>
            <Text
              variant="overline"
              color="textSecondary"
              style={styles.sectionTitle}
            >
              {t('address.title').toUpperCase()}
            </Text>
            {Object.entries(profile.address).map(([key, value]) =>
              value != null ? (
                <View key={key} style={styles.field}>
                  <Text variant="caption" color="textSecondary">
                    {key}
                  </Text>
                  <Text variant="body">{String(value)}</Text>
                </View>
              ) : null,
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={profile?.businessName ?? t('businessProfile.profileDetails')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}
    </Screen>
  );
}
