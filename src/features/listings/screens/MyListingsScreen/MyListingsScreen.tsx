// My Listings: the seller's own listings in a 2-column grid using the shared
// buyer FeedListingCard (identical to Browse), each with Edit / Action footer
// buttons; SELL/RENT + status filters, quick-edit, full edit, status changes and
// delete. Data + mutations come from useMyListings; actions open a shared
// ActionSheet.
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  PackageOpen,
  Pencil,
  SquarePen,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
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
import { type FeedListing, FeedListingCard } from '@/features/home';
import { localize } from '@/features/sell';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';
import { commonStyles } from '@/utils';

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
  getListingId,
  imageToUrl,
} from '../../utils/listingDisplay';
import { createMyListingsScreenStyles } from './MyListingsScreen.styles';

// Renders the My Listings screen.
export function MyListingsScreen() {
  const styles = useThemedStyles(createMyListingsScreenStyles);
  const router = useRouter();
  const goBack = useGoBack();
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
    ({ item }: { item: MyListing }) => {
      // Adapt the owner's listing onto the shared buyer card shape so My
      // Listings looks identical to Browse; the owner Edit / Action buttons are
      // passed as the card's footer slot.
      const feedListing: FeedListing = {
        listingId: getListingId(item),
        listingType: item.listingType,
        status: item.status,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        title: deriveListingTitle(
          item,
          formsByCategory[item.categoryId],
          language,
          t('listing.untitled'),
        ),
        offeredPrice: item.offeredPrice,
        actualPrice: item.actualPrice,
        discountPct: item.discountPct,
        images: (item.images ?? []).map(imageToUrl),
        address: (item.address ?? undefined) as FeedListing['address'],
        attributes: item.attributes,
        isNegotiable: item.isNegotiable === true,
      };
      const status = String(item.status).toUpperCase();
      return (
        <View style={styles.cell}>
          <FeedListingCard
            listing={feedListing}
            onPress={() => goToDetail(item)}
            statusBadge={
              status === 'ACTIVE' || status === 'INACTIVE'
                ? {
                    tone: status === 'INACTIVE' ? 'danger' : 'success',
                    label:
                      status === 'INACTIVE'
                        ? t('listing.status.inactive')
                        : t('listing.status.active'),
                  }
                : undefined
            }
            footer={
              <>
                <View style={styles.footerButton}>
                  <Button
                    label={t('listing.edit')}
                    variant="outline"
                    size="sm"
                    onPress={() => goToEdit(item)}
                  />
                </View>
                <View style={styles.footerButton}>
                  <Button
                    label={t('listing.actions')}
                    size="sm"
                    onPress={() => openMenu(item)}
                  />
                </View>
              </>
            }
          />
        </View>
      );
    },
    [styles, language, t, goToEdit, goToDetail, openMenu, formsByCategory],
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
    // The flex wrapper bounds the list between the filter bar and the bottom of
    // the screen, so FlashList scrolls internally instead of growing to its
    // content height and pushing its own tail out of reach.
    return (
      <View style={commonStyles.flexOne}>
        <FlashList
          data={listings}
          numColumns={2}
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
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('listing.myListingsTitle')}
        showBack
        onBack={goBack}
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
