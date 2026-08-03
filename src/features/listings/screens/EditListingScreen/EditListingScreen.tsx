// Edit an existing listing. Loads the listing's current values and its category
// form schema, pre-fills the shared DynamicListingForm (with locked fields
// honored), and submits changes via PUT. Reuses the exact create-time renderer.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import {
  type CreateListingPayload,
  DynamicListingForm,
  type ListingValues,
  localize,
} from '@/features/sell';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger, toApiError } from '@/lib';
import { useToast } from '@/providers';

import { listingsApi } from '../../api';
import { listingToFormValues } from '../../forms/listingValues';
import { useCategoryForm } from '../../hooks';
import type { MyListing } from '../../types';
import { createEditListingScreenStyles } from './EditListingScreen.styles';

// Props for the EditListingScreen component.
export interface EditListingScreenProps {
  // Id of the listing being edited.
  listingId: string;
}

// Renders the edit-listing screen.
export function EditListingScreen({ listingId }: EditListingScreenProps) {
  const styles = useThemedStyles(createEditListingScreenStyles);
  const goBack = useGoBack();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [listing, setListing] = useState<MyListing | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  // Concrete reason the load failed, surfaced on screen so a failure names the
  // request that broke instead of a generic "something went wrong".
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    setStatus('loading');
    setErrorDetail(null);
    try {
      const result = await listingsApi.getListingById(listingId);
      setListing(result);
      setStatus('success');
    } catch (error) {
      const apiError = toApiError(error);
      logger.warn('[Listings] Failed to load listing', {
        listingId,
        endpoint: `/listings/${listingId}`,
        status: apiError.status,
        code: apiError.code,
        message: apiError.message,
      });
      setErrorDetail(
        `GET /listings/${listingId} → ${apiError.status ?? apiError.code}: ${apiError.message}`,
      );
      setStatus('error');
    }
  }, [listingId]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  const listingType = listing ? String(listing.listingType) : 'SELL';
  const {
    form,
    isError: isFormError,
    refetch: refetchForm,
  } = useCategoryForm(listing?.categoryId, listingType);

  const initialValues = useMemo<ListingValues | undefined>(
    () => (form && listing ? listingToFormValues(form, listing) : undefined),
    [form, listing],
  );

  // Submits the edited values via PUT and returns to the list on success.
  const handleUpdate = useCallback(
    async (payload: CreateListingPayload) => {
      try {
        const res = await listingsApi.updateListing(listingId, payload);
        showSuccess(
          res.message ? localize(res.message, language) : t('listing.updateSuccess'),
        );
        goBack();
      } catch (error) {
        logger.warn('[Listings] Update failed', error);
        showError(t('listing.updateError'));
      }
    },
    [listingId, showSuccess, showError, language, t, goBack],
  );

  // Chooses the body for the current data state.
  const renderBody = () => {
    if (status === 'error') {
      return (
        <View style={styles.center}>
          <ErrorState
            description={errorDetail ?? undefined}
            onRetry={loadListing}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    if (isFormError) {
      return (
        <View style={styles.center}>
          <ErrorState
            description={`GET /categories/${listing?.categoryId}/form?listingType=${listingType}`}
            onRetry={refetchForm}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }
    if (status === 'loading' || !form || !listing || !initialValues) {
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
        initialValues={initialValues}
        mode="update"
        submitLabel={t('listing.saveChanges')}
        onSubmit={handleUpdate}
      />
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('listing.editTitle')}
        showBack
        onBack={goBack}
      />
      {renderBody()}
    </Screen>
  );
}
