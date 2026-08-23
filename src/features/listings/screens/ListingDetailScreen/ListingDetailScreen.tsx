// Listing detail / preview: literally what a buyer sees, so the seller can check
// it. The card stack is the SHARED ListingDetailBody the buyer page renders —
// same schema-driven fields, same "NA" for the blanks, same order — so the two
// pages cannot drift apart. This file owns only what belongs to the owner: the
// status badge over the hero, the listing-record card, the edit footer, and the
// manage actions (quick edit, mark sold/active/inactive, delete).
//
// The seller card is deliberately off: a card describing the reader to
// themselves says nothing.
import { useFocusEffect, useRouter } from 'expo-router';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  MoreVertical,
  Pencil,
  SquarePen,
  Trash2,
} from 'lucide-react-native';
import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/feedback';
import { Skeleton } from '@/components/loaders';
import { Header } from '@/components/shared';
import {
  ActionSheet,
  type ActionSheetAction,
  type ActionSheetRef,
  Badge,
  Screen,
  Text,
} from '@/components/ui';
import { routes } from '@/constants';
import { ListingDetailBody } from '@/features/marketplace';
import { localize } from '@/features/sell';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';
import { formatDate, formatNumber, formatRelativeTime } from '@/utils';

import { listingsApi } from '../../api';
import type { QuickEditSheetRef } from '../../components';
import { QuickEditSheet } from '../../components';
import { useCategoryForm } from '../../hooks';
import type { ListingStatus, MyListing } from '../../types';
import {
  deriveListingTitle,
  getListingId,
  statusTone,
} from '../../utils/listingDisplay';
import { listingToFeed } from '../../utils/listingToFeed';
import { createListingDetailScreenStyles } from './ListingDetailScreen.styles';


// Maps a listing status to its i18n label key.
function statusLabelKey(status: string): TranslationKey {
  if (status === 'SOLD') {
    return 'listing.status.sold';
  }
  if (status === 'INACTIVE') {
    return 'listing.status.inactive';
  }
  return 'listing.status.active';
}

// Props for the ListingDetailScreen component.
export interface ListingDetailScreenProps {
  // Id of the listing being previewed.
  listingId: string;
}

// Renders the listing detail / preview screen.
export function ListingDetailScreen({ listingId }: ListingDetailScreenProps) {
  const styles = useThemedStyles(createListingDetailScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const goBack = useGoBack(routes.listings);
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [listing, setListing] = useState<MyListing | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const loadedOnceRef = useRef(false);

  const actionSheetRef = useRef<ActionSheetRef>(null);
  const quickEditRef = useRef<QuickEditSheetRef>(null);

  // Reference shown under the name in the overflow sheet. Resolved from the
  // loaded listing (not the route param) so this sheet and the one on the My
  // Listings card render the same value from the same source.
  const sheetReference = listing ? getListingId(listing) : '';

  const loadListing = useCallback(
    async (showLoader: boolean) => {
      // A bad deep link must never reach the API as `/listings/undefined`.
      // The id is an opaque reference (e.g. "TN7805BEIZ"), so the only invalid
      // case is an empty one.
      if (listingId.trim() === '') {
        setStatus('error');
        return;
      }
      if (showLoader) {
        setStatus('loading');
      }
      try {
        const result = await listingsApi.getListingById(listingId);
        setListing(result);
        setStatus('success');
      } catch (error) {
        logger.warn('[Listings] Failed to load listing', { listingId, error });
        setStatus('error');
      }
    },
    [listingId],
  );

  // Re-fetch on focus so returning from the edit form shows the saved values —
  // without the loader flash on anything but the first visit.
  useFocusEffect(
    useCallback(() => {
      void loadListing(!loadedOnceRef.current);
      loadedOnceRef.current = true;
    }, [loadListing]),
  );

  const retry = useCallback(() => {
    void loadListing(true);
  }, [loadListing]);

  const listingType = listing ? String(listing.listingType) : 'SELL';
  const {
    form,
    isLoading: isFormLoading,
    isError: isFormError,
    refetch: refetchForm,
  } = useCategoryForm(listing?.categoryId, listingType);

  // Photo count for the record card. The body resolves the images itself.
  const imageCount = listing?.images?.length ?? 0;

  const title = listing
    ? deriveListingTitle(
        listing,
        form ?? undefined,
        language,
        t('listing.untitled'),
      )
    : '';
  const statusValue = listing ? String(listing.status) : 'ACTIVE';
  const isRent = listingType === 'RENT';
  const categoryLabel = listing?.categoryName
    ? typeof listing.categoryName === 'string'
      ? listing.categoryName
      : localize(listing.categoryName, language)
    : form
      ? localize(form.title, language)
      : '';

  const goToEdit = useCallback(() => {
    router.push(routes.editListing(listingId));
  }, [router, listingId]);

  // Applies a status change and reflects it on this screen immediately.
  const changeStatus = useCallback(
    async (next: ListingStatus) => {
      try {
        const res = await listingsApi.patchListing(listingId, { status: next });
        setListing((prev) => (prev ? { ...prev, status: next } : prev));
        showSuccess(
          res.message
            ? localize(res.message, language)
            : t('listing.statusUpdated'),
        );
      } catch (error) {
        logger.warn('[Listings] Status update failed', error);
        showError(t('listing.updateError'));
      }
    },
    [listingId, showSuccess, showError, language, t],
  );

  // Deletes the listing and leaves the screen — a detail page for a deleted
  // listing must not stay on the stack.
  const performDelete = useCallback(async () => {
    try {
      const res = await listingsApi.deleteListing(listingId);
      showSuccess(
        res.message
          ? localize(res.message, language)
          : t('listing.deleteSuccess'),
      );
      goBack();
    } catch (error) {
      logger.warn('[Listings] Delete failed', error);
      showError(t('listing.deleteError'));
    }
  }, [listingId, showSuccess, showError, language, t, goBack]);

  // Delete-confirmation dialog visibility, and whether the delete is in flight.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Opens the delete-confirmation dialog for the current listing.
  const confirmDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  // Runs the delete once confirmed (the screen leaves on success).
  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    await performDelete();
    setDeleting(false);
    setShowDeleteConfirm(false);
  }, [performDelete]);

  // Overflow menu, mirroring the vocabulary My Listings already uses. Edit is
  // omitted here because it is the pinned footer button.
  const menuActions = useMemo<ActionSheetAction[]>(() => {
    if (!listing) {
      return [];
    }
    const actions: ActionSheetAction[] = [
      {
        key: 'quick',
        label: t('listing.quickEdit'),
        icon: Pencil,
        onPress: () =>
          requestAnimationFrame(() => quickEditRef.current?.present()),
      },
    ];
    if (statusValue !== 'SOLD') {
      actions.push({
        key: 'sold',
        label: t('listing.markSold'),
        icon: CheckCircle2,
        onPress: () => void changeStatus('SOLD'),
      });
    }
    if (statusValue !== 'ACTIVE') {
      actions.push({
        key: 'activate',
        label: t('listing.markActive'),
        icon: Eye,
        onPress: () => void changeStatus('ACTIVE'),
      });
    }
    if (statusValue !== 'INACTIVE') {
      actions.push({
        key: 'inactivate',
        label: t('listing.markInactive'),
        icon: EyeOff,
        onPress: () => void changeStatus('INACTIVE'),
      });
    }
    actions.push({
      key: 'delete',
      label: t('listing.delete'),
      icon: Trash2,
      destructive: true,
      onPress: confirmDelete,
    });
    return actions;
  }, [listing, statusValue, t, changeStatus, confirmDelete]);

  const onQuickSaved = useCallback(
    (_id: string, updated: Partial<MyListing>) => {
      setListing((prev) => (prev ? { ...prev, ...updated } : prev));
    },
    [],
  );

  // The listing as the shared body reads it: the same contract the buyer
  // page renders, so the preview cannot drift from the real thing.
  const feedListing = useMemo(
    () => (listing ? listingToFeed(listing) : null),
    [listing],
  );

  // Owner-only facts about the record itself — id, category, type, status,
  // photo count and timestamps. None of it comes from the form schema.
  const recordRows = useMemo<
    { key: string; label: string; value: string | ReactNode }[]
  >(() => {
    if (!listing) {
      return [];
    }
    const rows: { key: string; label: string; value: string | ReactNode }[] =
      [
        {
          key: 'id',
          label: t('listing.idLabel'),
          value: `#${getListingId(listing)}`,
        },
      ];
    if (categoryLabel) {
      rows.push({
        key: 'category',
        label: t('listing.field.category'),
        value: categoryLabel,
      });
    }
    rows.push({
      key: 'type',
      label: t('listing.field.type'),
      value: t(isRent ? 'listing.type.rent' : 'listing.type.sell'),
    });
    rows.push({
      key: 'status',
      label: t('listing.field.status'),
      value: (
        <Badge
          label={t(statusLabelKey(statusValue))}
          tone={statusTone(statusValue)}
        />
      ),
    });
    rows.push({
      key: 'photos',
      label: t('listing.field.photos'),
      value: formatNumber(imageCount),
    });
    if (listing.createdAt) {
      rows.push({
        key: 'created',
        label: t('listing.field.created'),
        value: formatDate(listing.createdAt),
      });
    }
    if (listing.updatedAt) {
      rows.push({
        key: 'updated',
        label: t('listing.field.updated'),
        value: formatRelativeTime(listing.updatedAt),
      });
    }
    return rows;
  }, [listing, t, categoryLabel, isRent, statusValue, imageCount]);

  if (status === 'error') {
    return (
      <Screen padded={false}>
        <Header title={t('listing.previewTitle')} showBack onBack={goBack} />
        <View style={styles.center}>
          <ErrorState onRetry={retry} retryLabel={t('common.retry')} />
        </View>
      </Screen>
    );
  }

  if (status === 'loading' || !listing) {
    return (
      <Screen padded={false}>
        <Header title={t('listing.previewTitle')} showBack onBack={goBack} />
        <View style={styles.skeletonHero}>
          <Skeleton width="100%" height="100%" radius={theme.radius.none} />
        </View>
        <View style={styles.skeletonBlock}>
          <Skeleton width="40%" height={theme.spacing.md} />
          <Skeleton width="85%" height={theme.spacing.xxl} />
          <Skeleton width="55%" height={theme.spacing.xl} />
          <Skeleton width="100%" height={theme.sizing.bannerHeight} />
        </View>
      </Screen>
    );
  }


  const feed = feedListing ?? listingToFeed(listing);

  return (
    <Screen padded={false}>
      <Header
        title={t('listing.previewTitle')}
        showBack
        onBack={goBack}
        rightAction={
          <IconButton
            icon={MoreVertical}
            color={theme.colors.textSecondary}
            accessibilityLabel={t('listing.moreActions')}
            onPress={() => actionSheetRef.current?.present()}
          />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* The buyer-facing card stack, verbatim. The seller card is off:
            this listing belongs to the person reading it. */}
        <ListingDetailBody
          listing={feed}
          form={form}
          showSeller={false}
          heroOverlay={
            <View style={styles.heroBadge}>
              <Badge
                label={t(statusLabelKey(statusValue))}
                tone={statusTone(statusValue)}
              />
            </View>
          }
        >
          {/* Owner-only: the record behind the listing. It needs no schema,
              so it is also what keeps the page useful when the form fetch
              fails on a listing that plainly exists. */}
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Hash
                size={theme.sizing.iconSm}
                color={theme.colors.textSecondary}
              />
              <Text variant="h4">{t('listing.record')}</Text>
            </View>
            {recordRows.map((row) => (
              <View key={row.key} style={styles.row}>
                <Text
                  variant="caption"
                  color="textSecondary"
                  style={styles.rowLabel}
                >
                  {row.label}
                </Text>
                {typeof row.value === 'string' ? (
                  <Text variant="bodyMedium" style={styles.rowValue}>
                    {row.value}
                  </Text>
                ) : (
                  row.value
                )}
              </View>
            ))}
          </View>

          {isFormError ? (
            <View style={styles.formErrorCard}>
              <Text variant="body" color="textSecondary">
                {t('listing.detailsUnavailable')}
              </Text>
              <Button
                label={t('common.retry')}
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={refetchForm}
              />
            </View>
          ) : null}
        </ListingDetailBody>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('listing.editListingCta')}
          size="lg"
          leftIcon={
            <SquarePen
              size={theme.sizing.iconMd}
              color={theme.colors.onPrimary}
            />
          }
          onPress={goToEdit}
        />
      </View>

      <ActionSheet
        ref={actionSheetRef}
        title={title}
        subtitle={sheetReference === '' ? undefined : `#${sheetReference}`}
        actions={menuActions}
        cancelLabel={t('common.cancel')}
      />
      <QuickEditSheet
        ref={quickEditRef}
        listing={listing}
        form={form}
        loading={isFormLoading}
        language={language}
        onSaved={onQuickSaved}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        tone="danger"
        icon={Trash2}
        title={t('listing.deleteTitle')}
        message={t('listing.deleteMessage')}
        confirmLabel={t('listing.delete')}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Screen>
  );
}
