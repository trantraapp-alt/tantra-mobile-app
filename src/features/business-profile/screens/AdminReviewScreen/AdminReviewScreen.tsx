// Admin review screen: read-only profile view + Approve / Reject / Block actions.
// Reject and Block open a bottom sheet to collect the mandatory reason.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { TextField } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import {
  Badge,
  BottomSheet,
  type BottomSheetRef,
  Screen,
  Text,
} from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';

import { businessProfileApi } from '../../api/businessProfileApi';
import type { BusinessProfile, ProfileTypeOption } from '../../types/businessProfile.types';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createAdminReviewStyles } from './AdminReviewScreen.styles';

type ReasonAction = 'reject' | 'block';

export function AdminReviewScreen() {
  const styles = useThemedStyles(createAdminReviewStyles);
  const router = useRouter();
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
    // Only refetch if profile wasn't passed in params
    if (!profileJson) {
      setIsLoading(true);
      setIsError(false);
      try {
        const res = await businessProfileApi.getProfileForReview(profileId);
        setProfile(res);
      } catch (error) {
        logger.warn('[BusinessProfile] Admin failed to load profile', { profileId, error });
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [profileId, profileJson]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [profileTypes, setProfileTypes] = useState<ProfileTypeOption[]>([]);
  const reasonSheetRef = useRef<BottomSheetRef>(null);

  // Fetch profile types for label mapping
  useEffect(() => {
    businessProfileApi
      .getProfileTypes()
      .then(setProfileTypes)
      .catch(() => {
        /* fallback: use keys as labels */
      });
  }, []);

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
      router.back();
    } catch (error) {
      logger.warn('[BusinessProfile] Approve failed', error);
      showError(t('businessProfile.admin.actionError'));
    } finally {
      setSubmitting(false);
    }
  }, [profileId, router, showSuccess, showError, t]);

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
      router.back();
    } catch (error) {
      logger.warn('[BusinessProfile] Review action failed', error);
      showError(t('businessProfile.admin.actionError'));
    } finally {
      setSubmitting(false);
    }
  }, [profileId, reasonAction, reason, router, showSuccess, showError, t]);

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

    const statusTone =
      profile.status === 'APPROVED'
        ? ('success' as const)
        : profile.status === 'PENDING'
          ? ('warning' as const)
          : ('danger' as const);

    const statusLabel =
      profile.status === 'APPROVED'
        ? t('businessProfile.status.approved')
        : profile.status === 'PENDING'
          ? t('businessProfile.status.pending')
          : profile.status === 'REJECTED'
            ? t('businessProfile.status.rejected')
            : t('businessProfile.status.blocked');

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusRow}>
          <Badge label={statusLabel} tone={statusTone} />
        </View>

        {/* Core fields */}
        <View style={styles.section}>
          <Text
            variant="overline"
            color="textSecondary"
            style={styles.sectionTitle}
          >
            {t('businessProfile.profileDetails').toUpperCase()}
          </Text>
          <View style={styles.field}>
            <Text variant="caption" color="textSecondary">
              Business Name
            </Text>
            <Text variant="bodyMedium">{profile.businessName}</Text>
          </View>
          <View style={styles.field}>
            <Text variant="caption" color="textSecondary">
              Profile Type
            </Text>
            <Text variant="body">
              {getProfileTypeLabel(profile.profileType, profileTypes, language)}
            </Text>
          </View>
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

        {/* Admin actions */}
        <View style={styles.actionButtons}>
          <Button
            label={t('businessProfile.admin.approve')}
            size="lg"
            loading={submitting}
            onPress={() => void handleApprove()}
          />
          <Button
            label={t('businessProfile.admin.reject')}
            variant="outline"
            size="lg"
            loading={submitting}
            onPress={() => openReasonSheet('reject')}
          />
          <Button
            label={t('businessProfile.admin.block')}
            variant="outline"
            size="lg"
            loading={submitting}
            onPress={() => openReasonSheet('block')}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={profile?.businessName ?? t('businessProfile.admin.tracker')}
        showBack
        onBack={() => router.back()}
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
            size="lg"
            loading={submitting}
            onPress={() => void handleReasonSubmit()}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
