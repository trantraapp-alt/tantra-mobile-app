// Business Profile detail: renders the shared BusinessProfileView body plus a
// sticky Edit / Edit & Resubmit footer. Owners see it for any status; others
// only if the profile is APPROVED + visible. Any edit resubmits the profile
// for admin approval (BLOCKED profiles cannot be edited).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SquarePen } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { BusinessProfileView } from '../../components/BusinessProfileView';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessProfileForm } from '../../hooks/useBusinessProfileForm';
import { buildBusinessProfileDetailModel } from '../../utils/businessProfileDetailFields';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createBPDetailScreenStyles } from './BusinessProfileDetailScreen.styles';

export function BusinessProfileDetailScreen() {
  const styles = useThemedStyles(createBPDetailScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const { profile, isLoading, isError, refetch } = useBusinessProfile(
    profileId ?? '',
  );
  const { form, profileTypes } = useBusinessProfileForm(profile?.profileType);

  const model = useMemo(
    () =>
      profile ? buildBusinessProfileDetailModel(form, profile, language) : null,
    [form, profile, language],
  );

  const goToEdit = () => {
    if (profileId) {
      router.push(routes.businessProfile.edit(profileId));
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    if (isError || !profile || !model) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={refetch} retryLabel={t('common.retry')} />
        </View>
      );
    }

    const profileTypeLabel = getProfileTypeLabel(
      profile.profileType,
      profileTypes,
      language,
    );

    return (
      <>
        <BusinessProfileView
          profile={profile}
          model={model}
          profileTypeLabel={profileTypeLabel}
        />

        <View style={styles.footer}>
          {profile.status === 'BLOCKED' ? (
            <Text variant="caption" color="textSecondary" style={styles.footerHint}>
              {t('businessProfile.blockedEditHint')}
            </Text>
          ) : (
            <>
              <Button
                label={
                  profile.status === 'REJECTED'
                    ? t('businessProfile.editResubmit')
                    : t('businessProfile.editProfile')
                }
                size="lg"
                leftIcon={
                  <SquarePen size={theme.sizing.iconMd} color={theme.colors.onPrimary} />
                }
                onPress={goToEdit}
              />
              <Text variant="caption" color="textTertiary" style={styles.footerHint}>
                {t('businessProfile.editHint')}
              </Text>
            </>
          )}
        </View>
      </>
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
