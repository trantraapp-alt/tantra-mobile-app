// Create or edit a business profile. Uses the metadata-driven DynamicListingForm
// with a custom onSubmit that builds the business-profile payload. In create mode
// a profile-type picker appears first (skipped when prefilled from route params).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Store } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Card, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { DynamicListingForm } from '@/features/sell/components/DynamicListingForm';
import { localize } from '@/features/sell/forms/listingForm.types';
import type { ListingValues } from '@/features/sell/forms/listingPayload';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';

import { businessProfileApi } from '../../api/businessProfileApi';
import { buildBusinessProfilePayload, profileToFormValues } from '../../forms/businessProfilePayload';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessProfileForm } from '../../hooks/useBusinessProfileForm';
import { useMyProfiles } from '../../hooks/useMyProfiles';
import { getProfileTypeLabel } from '../../utils/profileTypeLabels';
import { createBPFormScreenStyles } from './BusinessProfileFormScreen.styles';


export function BusinessProfileFormScreen() {
  const styles = useThemedStyles(createBPFormScreenStyles);
  const router = useRouter();
  const goBack = useGoBack(routes.businessProfile.list);
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

  // A user can only have one profile per type — fetch their existing profiles
  // (create mode only) so we never auto-select, or silently let through, a
  // type they've already created.
  const { profiles: myProfiles, isLoading: isMyProfilesLoading } = useMyProfiles();
  const usedTypes = useMemo(
    () => new Set(myProfiles.map((p) => p.profileType)),
    [myProfiles],
  );
  const duplicateProfile =
    !isEdit && selectedType
      ? myProfiles.find((p) => p.profileType === selectedType)
      : undefined;
  const allTypesUsed =
    !isEdit &&
    !isMyProfilesLoading &&
    profileTypes.length > 0 &&
    profileTypes.every((option) => usedTypes.has(option.value));

  // In edit mode, fetch the existing profile to pre-fill.
  const { profile, isLoading: isProfileLoading } = useBusinessProfile(
    params.profileId ?? '',
  );

  // Edit mode: once the existing profile loads, adopt its actual type — this
  // drives useBusinessProfileForm above to fetch the matching type-specific
  // form (it was otherwise stuck fetching the generic/default form) and lets
  // the profileType override below stay correct for edit too.
  useEffect(() => {
    if (isEdit && profile && !selectedType) {
      setSelectedType(profile.profileType);
    }
  }, [isEdit, profile, selectedType]);

  const isLoading = isFormLoading || (isEdit && isProfileLoading);

  // Pre-fill values from the existing profile (edit flow). Create mode seeds
  // just the profileType field (if the schema renders one as a DROPDOWN) so
  // it reflects the type already resolved above instead of defaulting to
  // whatever its first option happens to be.
  const initialValues = useMemo<ListingValues | undefined>(() => {
    if (isEdit) {
      if (!profile || !form) {
        return undefined;
      }
      return profileToFormValues(profile, form);
    }
    if (!form || !selectedType) {
      return undefined;
    }
    const hasProfileTypeField = form.sections
      .flatMap((section) => section.fields)
      .some((field) => field.fieldKey === 'profileType');
    return hasProfileTypeField ? { profileType: selectedType } : undefined;
  }, [isEdit, profile, form, selectedType]);

  // The schema can render its own "profileType" DROPDOWN field, letting the
  // user switch it inside the form after already picking one on the screen
  // above — silently defeating the one-per-type rule. Force that field
  // read-only (the shared form renderer shows it as a locked box instead of
  // an editable dropdown) once a type is resolved, so it can only ever be
  // changed by going back to the picker.
  const lockedForm = useMemo(() => {
    if (!form || !selectedType) {
      return form;
    }
    return {
      ...form,
      sections: form.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) =>
          field.fieldKey === 'profileType' ? { ...field, readOnly: true } : field,
        ),
      })),
    };
  }, [form, selectedType]);

  const handleSubmit = useCallback(
    async (
      _payload: unknown,
      values: ListingValues,
    ) => {
      if (!form) {
        return;
      }
      // A user can only have one profile per type. Check the type that
      // actually ended up in the submitted values — not just the type
      // resolved on the picker screen — since the schema's own profileType
      // field (now locked, but checked again here as a hard backstop) is
      // where a duplicate would otherwise slip through.
      const submittedType =
        typeof values.profileType === 'string' && values.profileType
          ? values.profileType
          : selectedType;
      if (!isEdit && submittedType && usedTypes.has(submittedType)) {
        showError(t('businessProfile.duplicateTypeError'));
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
        const payload = await buildBusinessProfilePayload(form, values);
        // Ensure the payload's type matches what was actually validated above.
        if (submittedType) {
          payload.profileType = submittedType;
        }
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
    [form, isEdit, selectedType, usedTypes, params.profileId, router, showSuccess, showError, t],
  );

  const title = isEdit
    ? t('businessProfile.edit')
    : t('businessProfile.create');

  const renderBody = () => {
    if (isLoading || (!isEdit && isMyProfilesLoading)) {
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

    // A profile of this type already exists (arrived pre-filled from a
    // category deep-link) — offer to edit that one instead of creating a
    // duplicate.
    if (duplicateProfile) {
      return (
        <View style={styles.center}>
          <EmptyState
            icon={Store}
            title={t('businessProfile.duplicateTypeTitle')}
            description={t('businessProfile.duplicateTypeDesc', {
              type: getProfileTypeLabel(selectedType, profileTypes, language),
            })}
            actionLabel={t('businessProfile.viewExisting')}
            onAction={() =>
              router.replace(routes.businessProfile.detail(duplicateProfile.profileId))
            }
          />
        </View>
      );
    }

    // Every available profile type already has a profile — nothing left to
    // create.
    if (allTypesUsed) {
      return (
        <View style={styles.center}>
          <EmptyState
            icon={Store}
            title={t('businessProfile.allTypesUsedTitle')}
            description={t('businessProfile.allTypesUsedDesc')}
            actionLabel={t('businessProfile.myProfiles')}
            onAction={() => router.replace(routes.businessProfile.list)}
          />
        </View>
      );
    }

    // Create mode, no type chosen yet: let the user explicitly pick one,
    // listing only types they don't already have. Never auto-pick a type for
    // them — that used to silently substitute a different type on submit
    // instead of actually blocking the one they'd already created.
    if (!isEdit && !selectedType && profileTypes.length > 0) {
      const availableTypes = profileTypes.filter(
        (option) => !usedTypes.has(option.value),
      );
      return (
        <ScrollView contentContainerStyle={styles.typePicker}>
          <Text variant="h4" style={styles.typePickerLabel}>
            {t('businessProfile.pickType')}
          </Text>
          {availableTypes.map((option) => (
            <Card
              key={option.value}
              onPress={() => setSelectedType(option.value)}
              style={styles.typeOption}
            >
              <Text variant="bodyMedium">{localize(option.label, language)}</Text>
            </Card>
          ))}
        </ScrollView>
      );
    }

    if (!form || !lockedForm) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    return (
      <DynamicListingForm
        form={lockedForm}
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
      <Header title={title} showBack onBack={goBack} />
      {renderBody()}
    </Screen>
  );
}
