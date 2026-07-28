// Create or edit a business profile. Uses the metadata-driven DynamicListingForm
// with a custom onSubmit that builds the business-profile payload. In create mode
// a profile-type picker appears first (skipped when prefilled from route params).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Select, type SelectItem } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { DynamicListingForm } from '@/features/sell/components/DynamicListingForm';
import { localize } from '@/features/sell/forms/listingForm.types';
import type { ListingValues } from '@/features/sell/forms/listingPayload';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';

import { businessProfileApi } from '../../api/businessProfileApi';
import { buildBusinessProfilePayload, profileToFormValues } from '../../forms/businessProfilePayload';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessProfileForm } from '../../hooks/useBusinessProfileForm';
import { createBPFormScreenStyles } from './BusinessProfileFormScreen.styles';


export function BusinessProfileFormScreen() {
  const styles = useThemedStyles(createBPFormScreenStyles);
  const router = useRouter();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();
  const params = useLocalSearchParams<{ profileType?: string; profileId?: string }>();

  const isEdit = Boolean(params.profileId);

  // Selected profile type drives the form schema fetch.
  const [selectedType, setSelectedType] = useState<string>(
    params.profileType ?? '',
  );

  // Fetch the form schema for the selected type.
  const { form, profileTypes, isLoading: isFormLoading, isError: isFormError, refetch } =
    useBusinessProfileForm(selectedType || undefined);

  // In edit mode, fetch the existing profile to pre-fill.
  const { profile, isLoading: isProfileLoading } = useBusinessProfile(
    params.profileId ?? '',
  );

  const isLoading = isFormLoading || (isEdit && isProfileLoading);

  // Convert profile type options to Select items.
  const typeItems = useMemo<SelectItem[]>(
    () =>
      profileTypes.map((opt) => ({
        value: opt.value,
        label: localize(opt.label, language),
      })),
    [profileTypes, language],
  );

  // Pre-fill values from the existing profile (edit flow).
  const initialValues = useMemo<ListingValues | undefined>(() => {
    if (!isEdit || !profile || !form) {
      return undefined;
    }
    return profileToFormValues(profile, form);
  }, [isEdit, profile, form]);

  const handleSubmit = useCallback(
    async (
      _payload: unknown,
      values: ListingValues,
    ) => {
      if (!form) {
        return;
      }
      try {
        const payload = buildBusinessProfilePayload(form, values);
        if (isEdit && params.profileId) {
          await businessProfileApi.update(params.profileId, payload);
          showSuccess(t('businessProfile.editSuccess'));
        } else {
          await businessProfileApi.create(payload);
          showSuccess(t('businessProfile.createSuccess'));
        }
        // Navigate back to My Profiles list.
        router.replace(routes.businessProfile.list);
      } catch (error) {
        logger.warn('[BusinessProfile] Submit failed', error);
        showError(t('businessProfile.submitError'));
      }
    },
    [form, isEdit, params.profileId, router, showSuccess, showError, t],
  );

  const title = isEdit
    ? t('businessProfile.edit')
    : t('businessProfile.create');

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    if (isFormError) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={refetch} retryLabel={t('common.retry')} />
        </View>
      );
    }

    // Show type picker in create mode when no type is selected yet.
    if (!isEdit && !selectedType) {
      return (
        <View style={styles.typePicker}>
          <Text variant="h4" style={styles.typePickerLabel}>
            {t('businessProfile.pickType')}
          </Text>
          <Select
            label={t('businessProfile.selectType')}
            options={typeItems}
            value={selectedType}
            onChange={setSelectedType}
          /> 
        </View>
      );
    }

    if (!form) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    return (
      <DynamicListingForm
        form={form}
        language={language}
        mode={isEdit ? 'update' : 'create'}
        initialValues={initialValues}
        submitLabel={
          isEdit ? t('businessProfile.edit') : t('businessProfile.create')
        }
        onSubmit={handleSubmit}
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
