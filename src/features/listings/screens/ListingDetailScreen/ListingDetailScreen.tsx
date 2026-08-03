// Listing detail / preview: what a buyer would see, so the seller can check it.
//
// Photos lead as a full-bleed swipeable gallery in upload order, then the
// identity block, then a recessed price/quantity strip, then every value the
// seller filled in — grouped by the form's own sections, in the form's own
// order, with dropdown/radio values resolved to localized option labels, the
// address rendered as a readable block, photos excluded from the rows, empty
// values omitted and required blanks flagged. All of those rules live in the
// pure `listingDetailFields` module; this file only renders them.
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

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
  Card,
  Divider,
  ImageCarousel,
  PriceTag,
  Screen,
  Text,
} from '@/components/ui';
import { fileUrl } from '@/config';
import { routes } from '@/constants';
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

// Props for one rendered spec row.
interface SpecRowProps {
  // The formatted row to render.
  row: ListingDetailRow;
  // Label shown when a required field was left empty.
  notProvidedLabel: string;
  // Label for a true boolean value.
  yesLabel: string;
  // Label for a false boolean value.
  noLabel: string;
}

// Renders one label/value pair, inline or stacked depending on its value.
function SpecRow({ row, notProvidedLabel, yesLabel, noLabel }: SpecRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailScreenStyles);
  const { value } = row;

  let body: ReactNode;
  if (value.kind === 'missing') {
    // The only coloured value on the page: a required blank is itself
    // information the seller needs to act on.
    body = (
      <Text variant="bodyMedium" color="warning">
        {notProvidedLabel}
      </Text>
    );
  } else if (value.kind === 'boolean') {
    body = (
      <View style={styles.booleanValue}>
        {value.value ? (
          <Check size={theme.sizing.iconSm} color={theme.colors.success} />
        ) : (
          <X size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
        )}
        <Text variant="bodyMedium">{value.value ? yesLabel : noLabel}</Text>
      </View>
    );
  } else if (value.kind === 'tags') {
    body = (
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
  } else {
    body = <Text variant="bodyMedium">{value.text}</Text>;
  }

  if (row.stacked) {
    return (
      <View style={styles.stackedRow}>
        <Text variant="label" color="textSecondary">
          {row.label}
        </Text>
        {body}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text variant="body" color="textSecondary" style={styles.rowLabel}>
        {row.label}
      </Text>
      <View style={styles.rowValue}>{body}</View>
    </View>
  );
}

// Props for a record row whose value is an arbitrary node.
interface MetaRowProps {
  // Row label.
  label: string;
  // Rendered value.
  children: ReactNode;
}

// Renders a label/value row for the listing-record block.
function MetaRow({ label, children }: MetaRowProps) {
  const styles = useThemedStyles(createListingDetailScreenStyles);
  return (
    <View style={styles.row}>
      <Text variant="body" color="textSecondary" style={styles.rowLabel}>
        {label}
      </Text>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
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
  // Drives the carousel's `paused` prop: expo-router exports `useFocusEffect`
  // (there is no `useIsFocused`), and `@react-navigation/native` is only a
  // transitive dependency, so focus is derived from what is actually declared.
  const [focused, setFocused] = useState(true);
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
      setFocused(true);
      void loadListing(!loadedOnceRef.current);
      loadedOnceRef.current = true;
      return () => setFocused(false);
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

  // Content blocks in page order, so the separator bands can be interleaved
  // between only the blocks that actually rendered — never doubled, never
  // leading a block that was skipped.
  const blocks = useMemo(() => {
    if (!listing) {
      return [] as { key: string; node: ReactNode }[];
    }
    const result: { key: string; node: ReactNode }[] = [];

    if (model.descriptions.length > 0) {
      result.push({
        key: 'description',
        node: (
          <View style={styles.block}>
            <Text variant="h4" style={styles.blockTitle}>
              {t('listing.description')}
            </Text>
            <View style={styles.descriptionGroup}>
              {model.descriptions.map((entry) => (
                <Description
                  key={entry.key}
                  text={entry.text}
                  label={
                    model.descriptions.length > 1 ? entry.label : undefined
                  }
                  moreLabel={t('listing.readMore')}
                  lessLabel={t('listing.readLess')}
                />
              ))}
            </View>
          </View>
        ),
      });
    }

    model.sections.forEach((section) => {
      result.push({
        key: `section-${section.key}`,
        node: (
          <View style={styles.block}>
            <Text
              variant="overline"
              color="textSecondary"
              style={styles.blockTitle}
            >
              {section.title}
            </Text>
            {section.rows.map((row, position) => (
              <Fragment key={row.key}>
                {position > 0 ? <Divider /> : null}
                <SpecRow
                  row={row}
                  notProvidedLabel={t('listing.notProvided')}
                  yesLabel={t('common.yes')}
                  noLabel={t('common.no')}
                />
              </Fragment>
            ))}
          </View>
        ),
      });
    });

    if (model.address) {
      const address = model.address;
      result.push({
        key: 'address',
        node: (
          <View style={styles.block}>
            <View style={styles.titleRow}>
              <MapPin
                size={theme.sizing.iconSm}
                color={theme.colors.textSecondary}
              />
              <Text variant="h4">{t('listing.location')}</Text>
            </View>
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
    if (result.length === 0 && !isFormError && !isFormLoading) {
      result.push({
        key: 'no-details',
        node: (
          <View style={styles.block}>
            <Text variant="body" color="textSecondary">
              {t('listing.noDetails')}
            </Text>
          </View>
        ),
      });
    }

    // The record block needs no schema, so it is also what keeps the page
    // useful when the form fetch fails on a listing that plainly exists.
    result.push({
      key: 'record',
      node: (
        <View style={styles.block}>
          <Text
            variant="overline"
            color="textSecondary"
            style={styles.blockTitle}
          >
            {t('listing.record')}
          </Text>
          <MetaRow label={t('listing.idLabel')}>
            <Text variant="bodyMedium">{`#${getListingId(listing)}`}</Text>
          </MetaRow>
          {categoryLabel ? (
            <>
              <Divider />
              <MetaRow label={t('listing.field.category')}>
                <Text variant="bodyMedium">{categoryLabel}</Text>
              </MetaRow>
            </>
          ) : null}
          <Divider />
          <MetaRow label={t('listing.field.type')}>
            <Text variant="bodyMedium">
              {t(isRent ? 'listing.type.rent' : 'listing.type.sell')}
            </Text>
          </MetaRow>
          <Divider />
          <MetaRow label={t('listing.field.status')}>
            <Badge
              label={t(statusLabelKey(statusValue))}
              tone={statusTone(statusValue)}
            />
          </MetaRow>
          <Divider />
          <MetaRow label={t('listing.field.photos')}>
            <Text variant="bodyMedium">{formatNumber(imageUris.length)}</Text>
          </MetaRow>
          {listing.createdAt ? (
            <>
              <Divider />
              <MetaRow label={t('listing.field.created')}>
                <Text variant="bodyMedium">
                  {formatDate(listing.createdAt)}
                </Text>
              </MetaRow>
            </>
          ) : null}
          {listing.updatedAt ? (
            <>
              <Divider />
              <MetaRow label={t('listing.field.updated')}>
                <Text variant="bodyMedium">
                  {formatRelativeTime(listing.updatedAt)}
                </Text>
              </MetaRow>
            </>
          ) : null}
        </View>
      ),
    });

    return result;
  }, [
    listing,
    model,
    styles,
    theme,
    t,
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
        <Header
          title={t('listing.previewTitle')}
          showBack
          onBack={goBack}
        />
        <View style={styles.center}>
          <ErrorState onRetry={retry} retryLabel={t('common.retry')} />
        </View>
      </Screen>
    );
  }

  if (status === 'loading' || !listing) {
    return (
      <Screen padded={false}>
        <Header
          title={t('listing.previewTitle')}
          showBack
          onBack={goBack}
        />
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* The carousel renders its own themed empty panel (with the shared
            `carousel.empty` string) at the same 4:3 box, so a listing with no
            photos keeps the page rhythm without a hand-rolled placeholder. */}
        <View style={styles.hero}>
          <ImageCarousel
            images={imageUris}
            aspectRatio={4 / 3}
            contentFit="cover"
            autoPlay
            autoPlayBehavior="once"
            paused={!focused}
          />
          <View style={styles.heroBadge} pointerEvents="none">
            <Badge
              label={t(statusLabelKey(statusValue))}
              tone={statusTone(statusValue)}
            />
          </View>
        </View>

        <View style={[styles.block, styles.identity]}>
          {categoryLabel ? (
            <Text variant="overline" color="textTertiary">
              {`${categoryLabel} · ${t(isRent ? 'listing.type.rent' : 'listing.type.sell')}`}
            </Text>
          ) : null}
          <Text variant="h2" numberOfLines={2}>
            {title}
          </Text>
        </View>

        {listing.offeredPrice != null || model.quantityText ? (
          <View style={styles.priceBand}>
            <View style={styles.priceColumn}>
              <Text variant="overline" color="textTertiary">
                {t(isRent ? 'listing.rentPrice' : 'listing.askingPrice')}
              </Text>
              {listing.offeredPrice != null ? (
                <PriceTag
                  price={listing.offeredPrice}
                  compareAtPrice={listing.actualPrice ?? undefined}
                  discountPercentage={listing.discountPct ?? undefined}
                  size="lg"
                />
              ) : (
                <Text variant="body" color="textTertiary">
                  {t('listing.priceNotSet')}
                </Text>
              )}
            </View>
            {model.quantityText ? (
              <View style={styles.quantityColumn}>
                <Text variant="overline" color="textTertiary">
                  {t('listing.quantity')}
                </Text>
                <Text variant="h4" numberOfLines={1}>
                  {model.quantityText}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {isFormError ? (
          <Card radius="lg" style={styles.formErrorCard}>
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
          </Card>
        ) : null}

        {blocks.map((block) => (
          <Fragment key={block.key}>
            <View style={styles.band} />
            {block.node}
          </Fragment>
        ))}
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
