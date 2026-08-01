// Create or edit a business profile. Uses the metadata-driven DynamicListingForm
// with a custom onSubmit that builds the business-profile payload. In create mode
// a profile-type picker appears first (skipped when prefilled from route params).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { routes } from '@/constants';
import { DynamicListingForm } from '@/features/sell/components/DynamicListingForm';
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

  // Skip the "what kind of business" picker entirely — auto-select the first
  // available profile type so the create flow opens the form directly.
  useEffect(() => {
    if (isEdit || selectedType) {
      return;
    }
    const first = profileTypes[0];
    if (first) {
      setSelectedType(first.value);
    }
  }, [isEdit, selectedType, profileTypes]);

  // In edit mode, fetch the existing profile to pre-fill.
  const { profile, isLoading: isProfileLoading } = useBusinessProfile(
    params.profileId ?? '',
  );

  const isLoading = isFormLoading || (isEdit && isProfileLoading);

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
      // A business profile must always carry at least one photo — enforced
      // here regardless of whether the backend's schema marks the IMAGE field
      // `required`, since a profile admins can't visually verify shouldn't be
      // submittable.
      const photosField = form.sections
        .flatMap((section) => section.fields)
        .find((field) => field.type === 'IMAGE');
      if (photosField) {
        const photos = values[photosField.fieldKey];
        if (!Array.isArray(photos) || photos.length === 0) {
          showError(t('businessProfile.photosRequired'));
          return;
        }
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

    // Create mode: while profile types exist but none is selected yet, show a
    // brief loader — the first type is auto-selected above, opening the form
    // directly (no "select business type" dropdown). If the backend sends no
    // type list, fall through to the default form.
    if (!isEdit && !selectedType && profileTypes.length > 0) {
      return (
        <View style={styles.center}>
          <Spinner />
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
