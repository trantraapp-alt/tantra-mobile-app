// Admin review screen: renders the shared BusinessProfileView body (photo
// gallery, formatted fields, address) plus Approve / Reject / Block actions.
// Reject and Block open a bottom sheet to collect the mandatory reason.
import { useLocalSearchParams } from 'expo-router';
import { Ban, Check, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { TextField } from '@/components/inputs';
import { Skeleton } from '@/components/loaders';
import { Header } from '@/components/shared';
import { BottomSheet, type BottomSheetRef, Screen, Text } from '@/components/ui';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { businessProfileApi } from '../../api/businessProfileApi';
import { BusinessProfileView } from '../../components/BusinessProfileView';
import { useBusinessProfileForm } from '../../hooks/useBusinessProfileForm';
import type { BusinessProfile } from '../../types/businessProfile.types';
import { buildBusinessProfileDetailModel } from '../../utils/businessProfileDetailFields';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createAdminReviewStyles } from './AdminReviewScreen.styles';

type ReasonAction = 'reject' | 'block';

// Shimmer placeholder mimicking BusinessProfileView's shape (hero photo,
// identity block, a couple of field sections) — shown while a profile opened
// with nothing cached (e.g. from the user-detail screen) is still fetching,
// so it reads as "still loading" rather than a blank, wrong-looking screen.
function ReviewSkeleton() {
  const theme = useTheme();
  const styles = useThemedStyles(createAdminReviewStyles);
  return (
    <View>
      <Skeleton width="100%" height={280} radius={0} />
      <View style={styles.skeletonBlock}>
        <Skeleton width="35%" height={theme.spacing.md} />
        <Skeleton width="70%" height={theme.spacing.xl} />
        <Skeleton width="30%" height={theme.spacing.lg} radius={theme.radius.pill} />
        <Skeleton width="100%" height={80} style={styles.skeletonSection} />
        <Skeleton width="100%" height={120} />
      </View>
    </View>
  );
}

export function AdminReviewScreen() {
  const styles = useThemedStyles(createAdminReviewStyles);
  const theme = useTheme();
  const goBack = useGoBack();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { profileId, profile: profileJson } = useLocalSearchParams<{ profileId: string; profile?: string }>();

  // Profile is passed from the admin list screen (already has all data)
  const [profile, setProfile] = useState<BusinessProfile | null>(() => {
    if (profileJson) {
      try {
        return JSON.parse(profileJson);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!profileJson);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(async () => {
    if (!profileId) {
      return;
    }
    // The profile passed via nav params comes from the admin list, which can
    // be a leaner projection than the full record (missing address/attributes
    // sometimes) — render that instantly, but always attempt the authoritative
    // fetch in the background and upgrade to it silently. Only show the
    // loading/error UI when there's no cached data to fall back on.
    const hasCached = Boolean(profileJson);
    if (!hasCached) {
      setIsLoading(true);
      setIsError(false);
    }
    try {
      const res = await businessProfileApi.getProfileForReview(profileId);
      setProfile(res);
      setIsError(false);
    } catch (error) {
      logger.warn('[BusinessProfile] Admin failed to load full profile', { profileId, error });
      if (!hasCached) {
        setIsError(true);
      }
    } finally {
      if (!hasCached) {
        setIsLoading(false);
      }
    }
  }, [profileId, profileJson]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const { form, profileTypes } = useBusinessProfileForm(profile?.profileType);

  const model = useMemo(
    () =>
      profile
        ? buildBusinessProfileDetailModel(
            form,
            profile,
            language,
            t('businessProfile.additionalDetails'),
          )
        : null,
    [form, profile, language, t],
  );

  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const reasonSheetRef = useRef<BottomSheetRef>(null);

  const openReasonSheet = useCallback((action: ReasonAction) => {
    setReason('');
    setReasonAction(action);
    reasonSheetRef.current?.present();
  }, []);

  const handleApprove = useCallback(async () => {
    if (!profileId) {
      return;
    }
    setSubmitting(true);
    try {
      await businessProfileApi.approve(profileId);
      showSuccess(t('businessProfile.admin.approveSuccess'));
      goBack();
    } catch (error) {
      logger.warn('[BusinessProfile] Approve failed', error);
      showError(t('businessProfile.admin.actionError'));
    } finally {
      setSubmitting(false);
    }
  }, [profileId, goBack, showSuccess, showError, t]);

  const handleReasonSubmit = useCallback(async () => {
    if (!profileId || !reasonAction) {
      return;
    }
    if (!reason.trim()) {
      showError(t('businessProfile.admin.reasonRequired'));
      return;
    }
    setSubmitting(true);
    reasonSheetRef.current?.dismiss();
    try {
      if (reasonAction === 'reject') {
        await businessProfileApi.reject(profileId, reason.trim());
        showSuccess(t('businessProfile.admin.rejectSuccess'));
      } else {
        await businessProfileApi.block(profileId, reason.trim());
        showSuccess(t('businessProfile.admin.blockSuccess'));
      }
      goBack();
    } catch (error) {
      logger.warn('[BusinessProfile] Review action failed', error);
      showError(t('businessProfile.admin.actionError'));
    } finally {
      setSubmitting(false);
    }
  }, [profileId, reasonAction, reason, goBack, showSuccess, showError, t]);

  const renderBody = () => {
    if (isLoading) {
      return <ReviewSkeleton />;
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

        {profile.status === 'PENDING' || profile.status === 'APPROVED' ? (
          <View style={styles.actionButtons}>
            {profile.status === 'PENDING' ? (
              <Button
                label={t('businessProfile.admin.approve')}
                size="md"
                loading={submitting}
                leftIcon={<Check size={theme.sizing.iconSm} color={theme.colors.onPrimary} />}
                onPress={() => void handleApprove()}
              />
            ) : null}
            <View style={styles.secondaryRow}>
              <Button
                label={t('businessProfile.admin.reject')}
                variant="outline"
                size="md"
                fullWidth={false}
                style={styles.secondaryButton}
                loading={submitting}
                leftIcon={<X size={theme.sizing.iconSm} color={theme.colors.primary} />}
                onPress={() => openReasonSheet('reject')}
              />
              <Button
                label={t('businessProfile.admin.block')}
                variant="danger"
                size="md"
                fullWidth={false}
                style={styles.secondaryButton}
                loading={submitting}
                leftIcon={<Ban size={theme.sizing.iconSm} color={theme.colors.onPrimary} />}
                onPress={() => openReasonSheet('block')}
              />
            </View>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Text variant="caption" color="textSecondary" style={styles.statusHint}>
              {profile.status === 'REJECTED'
                ? t('businessProfile.admin.awaitingResubmitHint')
                : t('businessProfile.admin.blockedHint')}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={profile?.businessName ?? t('businessProfile.admin.reviewLoadingTitle')}
        showBack
        onBack={goBack}
      />
      {renderBody()}

      {/* Reason bottom sheet for reject / block */}
      <BottomSheet
        ref={reasonSheetRef}
        title={
          reasonAction === 'reject'
            ? t('businessProfile.admin.rejectTitle')
            : t('businessProfile.admin.blockTitle')
        }
      >
        <View style={styles.reasonSheet}>
          <TextField
            label={t('businessProfile.admin.enterReason')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            size="sm"
          />
          <Button
            label={
              reasonAction === 'reject'
                ? t('businessProfile.admin.confirmReject')
                : t('businessProfile.admin.confirmBlock')
            }
            size="md"
            loading={submitting}
            onPress={() => void handleReasonSubmit()}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
