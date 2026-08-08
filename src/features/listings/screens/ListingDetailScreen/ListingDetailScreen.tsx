// Listing detail / preview: what a buyer would see, so the seller can check it.
// It maps the listing + its resolved form model onto the shared ListingDetailView
// (same UI as the buyer detail) — every value the seller filled in, grouped by
// the form's own sections in the form's own order, with dropdown/radio values
// resolved to localized labels, the address rendered as a block, empty values
// omitted and required blanks flagged. All of those rules live in the pure
// `listingDetailFields` module; this file only maps them onto the shared view.
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Info,
  MapPin,
  MoreVertical,
  Package,
  Pencil,
  Phone,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

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
import { fileUrl } from '@/config';
import { routes } from '@/constants';
import {
  type DetailRow,
  type DetailSection,
  type DetailStat,
  ListingDetailView,
} from '@/features/marketplace';
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
  buildListingDetailModel,
  type ListingDetailModel,
  type ListingDetailRow,
} from '../../utils/listingDetailFields';
import {
  deriveListingTitle,
  getListingId,
  imageToUrl,
  statusTone,
} from '../../utils/listingDisplay';
import { createListingDetailScreenStyles } from './ListingDetailScreen.styles';

// Lines of a description shown before the "Read more" toggle appears.
const DESCRIPTION_LINE_CLAMP = 6;

// Model used before the listing has loaded, so the render path never branches
// on `listing` being null halfway down.
const EMPTY_MODEL: ListingDetailModel = {
  sections: [],
  descriptions: [],
  address: null,
  quantityText: null,
  titleFieldKey: null,
};

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

// Props for the resolved value of one spec row.
interface SpecValueProps {
  // The formatted row whose value to render.
  row: ListingDetailRow;
  // Label shown when a required field was left empty.
  notProvidedLabel: string;
  // Label for a true boolean value.
  yesLabel: string;
  // Label for a false boolean value.
  noLabel: string;
}

// Renders just the value of one spec row (booleans, tags, missing or text). The
// label + layout are owned by the shared ListingDetailView.
function SpecValue({ row, notProvidedLabel, yesLabel, noLabel }: SpecValueProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailScreenStyles);
  const { value } = row;

  if (value.kind === 'missing') {
    // The only coloured value on the page: a required blank is itself
    // information the seller needs to act on.
    return (
      <Text variant="bodyMedium" color="warning">
        {notProvidedLabel}
      </Text>
    );
  }
  if (value.kind === 'boolean') {
    return (
      <View style={styles.booleanValue}>
        {value.value ? (
          <Check size={theme.sizing.iconSm} color={theme.colors.success} />
        ) : (
          <X size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
        )}
        <Text variant="bodyMedium">{value.value ? yesLabel : noLabel}</Text>
      </View>
    );
  }
  if (value.kind === 'tags') {
    return (
      <View style={styles.tagWrap}>
        {value.items.map((item, position) => (
          <View key={`${row.key}-${position}-${item}`} style={styles.tag}>
            <Text variant="caption" color="textSecondary">
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  }
  return <Text variant="bodyMedium">{value.text}</Text>;
}

// Props for a collapsible description paragraph.
interface DescriptionProps {
  // Paragraph text.
  text: string;
  // Optional field label shown above the paragraph.
  label?: string;
  // "Read more" toggle label.
  moreLabel: string;
  // "Show less" toggle label.
  lessLabel: string;
}

// Renders a paragraph clamped to a few lines with an expander.
function Description({ text, label, moreLabel, lessLabel }: DescriptionProps) {
  const styles = useThemedStyles(createListingDetailScreenStyles);
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Only offer the toggle when the collapsed paragraph actually overflowed.
  const handleTextLayout = useCallback(
    (event: { nativeEvent: { lines: unknown[] } }) => {
      if (
        !expanded &&
        event.nativeEvent.lines.length > DESCRIPTION_LINE_CLAMP
      ) {
        setOverflows(true);
      }
    },
    [expanded],
  );

  return (
    <View>
      {label ? (
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      ) : null}
      <Text
        variant="body"
        color="textSecondary"
        numberOfLines={expanded ? undefined : DESCRIPTION_LINE_CLAMP}
        onTextLayout={handleTextLayout}
      >
        {text}
      </Text>
      {overflows ? (
        <Pressable
          hitSlop={theme.sizing.hitSlop}
          accessibilityRole="button"
          onPress={() => setExpanded((prev) => !prev)}
          style={styles.readMore}
        >
          <Text variant="label" color="primary">
            {expanded ? lessLabel : moreLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
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

  // Absolute URIs in upload order. The filter sits BETWEEN the maps: a malformed
  // image row would otherwise reach `fileUrl(undefined)` and crash the screen.
  const imageUris = useMemo(
    () =>
      (listing?.images ?? [])
        .map(imageToUrl)
        .filter(
          (uri): uri is string => typeof uri === 'string' && uri.trim() !== '',
        )
        .map(fileUrl),
    [listing?.images],
  );

  const model = useMemo<ListingDetailModel>(
    () =>
      listing
        ? buildListingDetailModel({ form, listing, language })
        : EMPTY_MODEL,
    [form, listing, language],
  );

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

  // Card sections in page order, mapped onto the shared view. The rich values
  // (booleans, tag pills, required blanks) render through `SpecValue`, so nothing
  // the seller filled in is lost.
  const sections = useMemo<DetailSection[]>(() => {
    if (!listing) {
      return [];
    }
    const result: DetailSection[] = [];

    if (isFormError) {
      result.push({
        key: 'form-error',
        content: (
          <View style={styles.formErrorInline}>
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
        ),
      });
    }

    if (model.descriptions.length > 0) {
      result.push({
        key: 'description',
        title: t('listing.description'),
        icon: FileText,
        content: (
          <View style={styles.descriptionGroup}>
            {model.descriptions.map((entry) => (
              <Description
                key={entry.key}
                text={entry.text}
                label={model.descriptions.length > 1 ? entry.label : undefined}
                moreLabel={t('listing.readMore')}
                lessLabel={t('listing.readLess')}
              />
            ))}
          </View>
        ),
      });
    }

    model.sections.forEach((section) => {
      result.push({
        key: `section-${section.key}`,
        title: section.title,
        icon: Info,
        rows: section.rows.map((row) => ({
          key: row.key,
          label: row.label,
          stacked: row.stacked,
          value: (
            <SpecValue
              row={row}
              notProvidedLabel={t('listing.notProvided')}
              yesLabel={t('common.yes')}
              noLabel={t('common.no')}
            />
          ),
        })),
      });
    });

    if (model.address) {
      const address = model.address;
      result.push({
        key: 'address',
        title: t('listing.location'),
        icon: MapPin,
        content: (
          <View style={styles.addressGroup}>
            <View style={styles.addressLines}>
              {address.lines.map((line, position) => (
                <Text key={`address-${position}`} variant="body">
                  {line}
                </Text>
              ))}
            </View>
            {address.phones.map((phone) => (
              <View key={phone} style={styles.contactRow}>
                <Phone
                  size={theme.sizing.iconSm}
                  color={theme.colors.textSecondary}
                />
                <Text variant="bodyMedium">{phone}</Text>
              </View>
            ))}
            {address.coordinates ? (
              <Text
                variant="caption"
                color="textTertiary"
                style={styles.coordinates}
              >
                {address.coordinates}
              </Text>
            ) : null}
          </View>
        ),
      });
    }

    // A listing whose schema yielded nothing must not end in dead space above
    // the sticky bar; the record block below still carries real information.
    const hasContent =
      model.descriptions.length > 0 ||
      model.sections.length > 0 ||
      model.address !== null;
    if (!hasContent && !isFormError && !isFormLoading) {
      result.push({
        key: 'no-details',
        content: (
          <Text variant="body" color="textSecondary">
            {t('listing.noDetails')}
          </Text>
        ),
      });
    }

    // The record block needs no schema, so it is also what keeps the page useful
    // when the form fetch fails on a listing that plainly exists.
    const recordRows: DetailRow[] = [
      {
        key: 'id',
        label: t('listing.idLabel'),
        value: `#${getListingId(listing)}`,
      },
    ];
    if (categoryLabel) {
      recordRows.push({
        key: 'category',
        label: t('listing.field.category'),
        value: categoryLabel,
      });
    }
    recordRows.push({
      key: 'type',
      label: t('listing.field.type'),
      value: t(isRent ? 'listing.type.rent' : 'listing.type.sell'),
    });
    recordRows.push({
      key: 'status',
      label: t('listing.field.status'),
      value: (
        <Badge
          label={t(statusLabelKey(statusValue))}
          tone={statusTone(statusValue)}
        />
      ),
    });
    recordRows.push({
      key: 'photos',
      label: t('listing.field.photos'),
      value: formatNumber(imageUris.length),
    });
    if (listing.createdAt) {
      recordRows.push({
        key: 'created',
        label: t('listing.field.created'),
        value: formatDate(listing.createdAt),
      });
    }
    if (listing.updatedAt) {
      recordRows.push({
        key: 'updated',
        label: t('listing.field.updated'),
        value: formatRelativeTime(listing.updatedAt),
      });
    }
    result.push({
      key: 'record',
      title: t('listing.record'),
      icon: Hash,
      rows: recordRows,
    });

    return result;
  }, [
    listing,
    model,
    styles,
    theme,
    t,
    refetchForm,
    categoryLabel,
    isRent,
    statusValue,
    imageUris.length,
    isFormError,
    isFormLoading,
  ]);

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

  const stats: DetailStat[] = model.quantityText
    ? [{ key: 'quantity', icon: Package, text: model.quantityText }]
    : [];

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

      <ListingDetailView
        images={imageUris}
        statusBadge={
          <Badge
            label={t(statusLabelKey(statusValue))}
            tone={statusTone(statusValue)}
          />
        }
        overline={
          categoryLabel
            ? `${categoryLabel} · ${t(isRent ? 'listing.type.rent' : 'listing.type.sell')}`
            : undefined
        }
        priceLabel={t(isRent ? 'listing.rentPrice' : 'listing.askingPrice')}
        price={listing.offeredPrice}
        compareAtPrice={listing.actualPrice}
        discountPct={listing.discountPct}
        priceFallback={t('listing.priceNotSet')}
        title={title}
        stats={stats}
        sections={sections}
        footer={
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
        }
      />

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
