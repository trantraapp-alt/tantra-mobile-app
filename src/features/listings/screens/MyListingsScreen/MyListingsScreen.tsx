// My Listings: the seller's own listings as a scrollable list of cards with
// SELL/RENT + status filters, inline quick-edit, full edit, status changes and
// delete. Data and mutations come from useMyListings; the card visual is the
// shared ListingCard; per-card actions open a shared ActionSheet.
import { FlashList } from '@shopify/flash-list';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  MoreVertical,
  PackageOpen,
  Pencil,
  SquarePen,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import { ListingCard } from '@/components/cards';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/feedback';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import {
  ActionSheet,
  type ActionSheetAction,
  type ActionSheetRef,
  Screen,
} from '@/components/ui';
import { routes } from '@/constants';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { listingsApi } from '../../api';
import type { QuickEditSheetRef } from '../../components';
import { MyListingsFilters, QuickEditSheet } from '../../components';
import { useCategoryForm, useCategoryForms, useMyListings } from '../../hooks';
import type {
  ListingStatus,
  ListingStatusFilter,
  ListingType,
  MyListing,
} from '../../types';
import {
  deriveListingTitle,
  firstImageUri,
  getListingId,
  statusTone,
} from '../../utils/listingDisplay';
import { createMyListingsScreenStyles } from './MyListingsScreen.styles';

// Maps a status to its i18n label key.
function statusLabelKey(status: string): TranslationKey {
  if (status === 'SOLD') {
    return 'listing.status.sold';
  }
  if (status === 'INACTIVE') {
    return 'listing.status.inactive';
  }
  return 'listing.status.active';
}

// Renders the My Listings screen.
export function MyListingsScreen() {
  const styles = useThemedStyles(createMyListingsScreenStyles);
  const theme = useTheme();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [listingType, setListingType] = useState<ListingType>('SELL');
  const [statusFilter, setStatusFilter] = useState<ListingStatusFilter>('ALL');
  const [active, setActive] = useState<MyListing | null>(null);
  // Listing pending delete-confirmation, and whether the delete is in flight.
  const [pendingDelete, setPendingDelete] = useState<MyListing | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    listings,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isError,
    isEmpty,
    loadMore,
    refresh,
    patchLocal,
    removeLocal,
  } = useMyListings({
    listingType,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const activeListingType = active ? String(active.listingType) : 'SELL';
  const { form: activeForm, isLoading: isFormLoading } = useCategoryForm(
    active?.categoryId,
    activeListingType,
  );

  // Form schemas for every category on screen, so each card can resolve its
  // stored attribute values into a readable name.
  const categoryIds = useMemo(
    () => listings.map((item) => item.categoryId),
    [listings],
  );
  const formsByCategory = useCategoryForms(categoryIds, listingType);

  const actionSheetRef = useRef<ActionSheetRef>(null);
  const quickEditRef = useRef<QuickEditSheetRef>(null);

  // Reference of the listing whose menu is open, shown under its name in the
  // action sheet so the sheet names the exact listing being acted on.
  const activeId = active ? getListingId(active) : '';

  const goToEdit = useCallback(
    (listing: MyListing) => {
      router.push(routes.editListing(getListingId(listing)));
    },
    [router],
  );

  // Tapping the card body opens the read-only preview; the card's own edit
  // button and the overflow menu still go straight to the form.
  const goToDetail = useCallback(
    (listing: MyListing) => {
      router.push(routes.listingDetail(getListingId(listing)));
    },
    [router],
  );

  const openMenu = useCallback((listing: MyListing) => {
    setActive(listing);
    actionSheetRef.current?.present();
  }, []);

  // Copies a listing id — the reference a seller quotes to a buyer — so the ID
  // chip is a tool rather than a label.
  const copyId = useCallback(
    async (id: string) => {
      await Clipboard.setStringAsync(String(id));
      void Haptics.selectionAsync();
      showSuccess(t('listing.idCopied'));
    },
    [showSuccess, t],
  );

  // Applies a status change (Mark as sold / active / inactive).
  const changeStatus = useCallback(
    async (listing: MyListing, next: ListingStatus) => {
      const id = getListingId(listing);
      try {
        const res = await listingsApi.patchListing(id, { status: next });
        // Drop it from the list when it no longer matches the active filter.
        if (statusFilter === 'ALL') {
          patchLocal(id, { status: next });
        } else {
          removeLocal(id);
        }
        showSuccess(
          res.message ? localize(res.message, language) : t('listing.statusUpdated'),
        );
      } catch (error) {
        logger.warn('[Listings] Status update failed', error);
        showError(t('listing.updateError'));
      }
    },
    [statusFilter, patchLocal, removeLocal, showSuccess, showError, language, t],
  );

  // Deletes a listing after confirmation.
  const performDelete = useCallback(
    async (listing: MyListing) => {
      const id = getListingId(listing);
      try {
        const res = await listingsApi.deleteListing(id);
        removeLocal(id);
        showSuccess(
          res.message ? localize(res.message, language) : t('listing.deleteSuccess'),
        );
      } catch (error) {
        logger.warn('[Listings] Delete failed', error);
        showError(t('listing.deleteError'));
      }
    },
    [removeLocal, showSuccess, showError, language, t],
  );

  // Opens the delete-confirmation dialog for a listing.
  const confirmDelete = useCallback((listing: MyListing) => {
    setPendingDelete(listing);
  }, []);

  // Runs the delete once confirmed, then closes the dialog.
  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    await performDelete(pendingDelete);
    setDeleting(false);
    setPendingDelete(null);
  }, [pendingDelete, performDelete]);

  // Builds the per-listing action menu from the active listing's status.
  const menuActions = useMemo<ActionSheetAction[]>(() => {
    if (!active) {
      return [];
    }
    const status = String(active.status);
    const actions: ActionSheetAction[] = [
      {
        key: 'quick',
        label: t('listing.quickEdit'),
        icon: Pencil,
        onPress: () =>
          requestAnimationFrame(() => quickEditRef.current?.present()),
      },
      {
        key: 'edit',
        label: t('listing.edit'),
        icon: SquarePen,
        onPress: () => goToEdit(active),
      },
    ];
    if (status !== 'SOLD') {
      actions.push({
        key: 'sold',
        label: t('listing.markSold'),
        icon: CheckCircle2,
        onPress: () => void changeStatus(active, 'SOLD'),
      });
    }
    if (status !== 'ACTIVE') {
      actions.push({
        key: 'activate',
        label: t('listing.markActive'),
        icon: Eye,
        onPress: () => void changeStatus(active, 'ACTIVE'),
      });
    }
    if (status !== 'INACTIVE') {
      actions.push({
        key: 'inactivate',
        label: t('listing.markInactive'),
        icon: EyeOff,
        onPress: () => void changeStatus(active, 'INACTIVE'),
      });
    }
    actions.push({
      key: 'delete',
      label: t('listing.delete'),
      icon: Trash2,
      destructive: true,
      onPress: () => confirmDelete(active),
    });
    return actions;
  }, [active, t, goToEdit, changeStatus, confirmDelete]);

  const onQuickSaved = useCallback(
    (id: string, updated: Partial<MyListing>) => {
      patchLocal(id, updated);
    },
    [patchLocal],
  );

  const renderItem = useCallback(
    ({ item }: { item: MyListing }) => (
      <View style={styles.cell}>
        <ListingCard
          title={deriveListingTitle(
            item,
            formsByCategory[item.categoryId],
            language,
            t('listing.untitled'),
          )}
          listingId={getListingId(item)}
          idLabel={t('listing.idLabel')}
          imageUri={firstImageUri(item)}
          dimImage={String(item.status) === 'INACTIVE'}
          offeredPrice={item.offeredPrice ?? undefined}
          actualPrice={item.actualPrice ?? undefined}
          discountPct={item.discountPct ?? undefined}
          statusLabel={t(statusLabelKey(String(item.status)))}
          statusTone={statusTone(String(item.status))}
          onPress={() => goToDetail(item)}
          onCopyId={copyId}
          headerAction={
            <IconButton
              icon={MoreVertical}
              size="sm"
              color={theme.colors.textSecondary}
              accessibilityLabel={t('listing.moreActions')}
              onPress={() => openMenu(item)}
            />
          }
          priceAction={
            <Button
              label={t('listing.edit')}
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={() => goToEdit(item)}
            />
          }
        />
      </View>
    ),
    [
      styles,
      theme,
      language,
      t,
      goToEdit,
      goToDetail,
      openMenu,
      copyId,
      formsByCategory,
    ],
  );

  // Chooses the body for the current data state.
  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={refresh} retryLabel={t('common.retry')} />
        </View>
      );
    }
    if (isEmpty) {
      return (
        <EmptyState
          icon={PackageOpen}
          title={t('listing.emptyTitle')}
          description={t('listing.emptyDesc')}
        />
      );
    }
    return (
      <FlashList
        data={listings}
        keyExtractor={(item) => String(getListingId(item))}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={isRefreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <Spinner />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('listing.myListingsTitle')}
        showBack
        onBack={() => router.back()}
      />
      <MyListingsFilters
        listingType={listingType}
        onListingTypeChange={setListingType}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />
      {renderBody()}

      <ActionSheet
        ref={actionSheetRef}
        title={
          active
            ? deriveListingTitle(
                active,
                activeForm ?? formsByCategory[active.categoryId],
                language,
                t('listing.untitled'),
              )
            : undefined
        }
        subtitle={activeId === '' ? undefined : `#${activeId}`}
        actions={menuActions}
        cancelLabel={t('common.cancel')}
      />
      <QuickEditSheet
        ref={quickEditRef}
        listing={active}
        form={activeForm}
        loading={isFormLoading}
        language={language}
        onSaved={onQuickSaved}
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        tone="danger"
        icon={Trash2}
        title={t('listing.deleteTitle')}
        message={t('listing.deleteMessage')}
        confirmLabel={t('listing.delete')}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
