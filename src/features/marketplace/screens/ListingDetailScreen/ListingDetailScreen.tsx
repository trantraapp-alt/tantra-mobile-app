// Buyer-facing listing detail — HTML reference design.
//
// Layout from top to bottom:
//   ┌──────────────────────────────────────────────┐
//   │ [◀]  Listing Details  [♡]  [⬆]  (white bar) │
//   ├──────────────────────────────────────────────┤
//   │  [🌿 Fresh Stock — solid green badge]        │
//   │            HERO IMAGE                        │
//   ├──────────────────────────────────────────────┤
//   │  Wheat (the crop, not the category)          │  ← price card
//   │  📦 50 Quintal                               │
//   │  ₹5,500  ~~₹6,000~~  8% OFF                  │
//   │  [Sell]  [Negotiable◯]                       │
//   │  📍 Location  ●  ⏰ time ago                 │
//   ├──────────────────────────────────────────────┤
//   │  🛡  Quality Assured  (green-tint card) ›    │
//   ├──────────────────────────────────────────────┤
//   │  ℹ️  About this product             ∨  ▸    │  ← accordion cards
//   │  📦  Product Details — every form field,     │
//   │      "NA" where the seller left a blank  ▸   │
//   │  🏠  Seller Information             ▸        │
//   │  📍  Location                       ▸        │
//   ├──────────────────────────────────────────────┤
//   │  [💬 Chat with Seller]  [📞 View Contact]   │
//   └──────────────────────────────────────────────┘
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Phone, Share2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { BrandHeaderBackdrop } from '@/components/shared';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { useSavedListing } from '@/features/wishlist/hooks/useSavedListing';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger, toApiError } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { marketplaceApi } from '../../api';
import {
  ContactModal,
  ListingDetailBody,
  SimilarListings,
} from '../../components';
import { useListingDetail } from '../../hooks';
import type { ContactRevealResult } from '../../types';
import { createListingDetailStyles } from './ListingDetailScreen.styles';

// ── Screen ────────────────────────────────────────────────────────────────────

// Renders the buyer listing-detail screen.
export function MarketplaceListingDetailScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const goBack = useGoBack();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id?.trim() ?? '';

  // Footer bottom padding. `SafeAreaView edges={['bottom']}` would add the full
  // home-indicator inset (~34pt) on top of the footer's own padding, leaving a
  // visibly large dead zone under the button on iOS. Trimming a step off the
  // inset keeps the button clear of the indicator without the extra air, and
  // the floor keeps Android (inset 0) off the screen edge.
  const footerPadBottom = Math.max(insets.bottom - theme.spacing.sm, theme.spacing.sm);

  const { listing, form, sellerInfo, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  // Wishlist state for the header heart. Backed by the shared `saved` slice, so
  // a listing hearted on a card already reads as saved here (and vice versa) —
  // nothing needs to be threaded through navigation params.
  const { saved, toggle: toggleSaved } = useSavedListing(listingId);

  // A non-null contact opens the sheet; clearing it on dismiss lets the next
  // reveal open it again.
  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [revealing, setRevealing] = useState(false);

  const openListing = useCallback(
    (item: FeedListing) => {
      const id = item.listingId ? String(item.listingId) : '';
      if (id) router.push(routes.marketListing(id));
    },
    [router],
  );

  // Clearing the contact on dismiss is what lets a second tap re-open the sheet.
  const clearContact = useCallback(() => setContact(null), []);

  // The contact sheet's support hand-off: it dismisses itself first, so this
  // only has to open the app's messaging surface.
  const openSupport = useCallback(() => {
    router.push(routes.tabs.chat);
  }, [router]);

  // Shares the listing. There is no public web URL for a listing yet, so the
  // message carries the app deep link (`tantra://…`), which opens the same
  // screen for anyone who already has the app.
  const onShare = useCallback(async () => {
    if (!listingId) {
      return;
    }
    const name = listing?.listingTitle?.trim() || t('home.listingFallback');
    try {
      await Share.share({
        title: name,
        message: `${name}\n${t('detail.shareVia')}\ntantra:/${routes.marketListing(listingId)}`,
      });
    } catch (error) {
      // A user cancelling the share sheet also lands here on some platforms —
      // log it, never surface a toast for what may be a deliberate dismissal.
      logger.warn('[Share] listing share failed', error);
    }
  }, [listingId, listing?.listingTitle, t]);

  // Revealing is deliberately on-tap only — never on page load, since each
  // reveal is recorded against the buyer (deduped server-side for 24h).
  const onViewContact = useCallback(async () => {
    if (!listingId) return;
    setRevealing(true);
    try {
      const res = await marketplaceApi.revealContact(listingId);
      // Setting the contact is what opens the sheet — see ContactModal.
      setContact(res);
    } catch (error) {
      logger.warn('[Contact] reveal failed', error);
      const apiError = toApiError(error);
      // A 401 already ended the session and routed to login in the HTTP layer,
      // so the only thing left to do here is stay quiet.
      if (apiError.status !== 401) {
        showError(
          apiError.status === 404
            ? t('contact.notFound')
            : apiError.status === 400
              ? t('contact.inactive')
              : apiError.message || t('contact.error'),
        );
      }
    } finally {
      setRevealing(false);
    }
  }, [listingId, showError, t]);

  // Violet gradient header — shared between all states (loading, error, content).
  const headerBar = (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
      <BrandHeaderBackdrop width={windowWidth} />
      <View style={styles.header}>
        {/* Back: white pill so it reads clearly on the violet bar */}
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={goBack}
          style={styles.backBtn}
          color={theme.colors.textPrimary}
        />
        {/* Centred white title */}
        <Text variant="h4" color="onPrimary" style={styles.headerTitle}>
          {t('detail.listingDetails')}
        </Text>
        {/* Heart + Share: plain white icons on the violet bar — no circle.
            Saved state is a solid red heart, same as the listing cards. */}
        <View style={styles.headerActions}>
          <IconButton
            icon={Heart}
            accessibilityLabel={t('tab.wishlist')}
            onPress={toggleSaved}
            color={saved ? theme.colors.danger : theme.colors.onPrimary}
            fill={saved ? theme.colors.danger : undefined}
          />
          <IconButton
            icon={Share2}
            accessibilityLabel={t('detail.share')}
            onPress={onShare}
            color={theme.colors.onPrimary}
          />
        </View>
      </View>
    </SafeAreaView>
  );

  // ── Loading / error ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.root}>
        {headerBar}
        <View style={styles.center}>
          <Spinner />
        </View>
      </View>
    );
  }
  if (isError || !listing) {
    return (
      <View style={styles.root}>
        {headerBar}
        <View style={styles.center}>
          <ErrorState onRetry={reload} retryLabel={t('common.retry')} />
        </View>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── White header ─────────────────────────────── */}
      {headerBar}

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Shared card stack (same on the seller preview) ─── */}
        <ListingDetailBody
          listing={listing}
          form={form}
          sellerInfo={sellerInfo}
        />

        {/* Gap below the last card before Similar listings */}
        <View style={styles.sectionGap} />

        {/* ── Similar listings rail ────────────────────── */}
        <SimilarListings
          title={t('detail.similar')}
          listings={similar}
          onListingPress={openListing}
        />

        <View style={styles.scrollPad} />
      </ScrollView>

      {/* ── Sticky footer: Chat + View Contact ──────── */}
      <View style={styles.footerSafe}>
        <View style={[styles.footer, { paddingBottom: footerPadBottom }]}>

          {/* Chat with Seller — hidden for now, do not delete.
              To restore: re-import `MessageCircle` from lucide-react-native.
              <TouchableOpacity
                style={styles.chatBtn}
                activeOpacity={0.8}
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel={t('contact.chat')}
              >
                <MessageCircle size={theme.sizing.iconSm} color={theme.colors.primary} />
                <Text variant="button" style={{ color: theme.colors.primary }}>
                  {t('contact.chat')}
                </Text>
              </TouchableOpacity> */}

          {/* Reveal CTA — icon + label only */}
          <TouchableOpacity
            style={[
              styles.contactBtn,
              revealing && { opacity: 0.6 },
            ]}
            activeOpacity={0.8}
            onPress={onViewContact}
            disabled={revealing}
            accessibilityRole="button"
            accessibilityLabel={t('contact.view')}
          >
            {revealing ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <View style={styles.contactBtnInner}>
                <Phone
                  size={theme.sizing.iconSm}
                  color={theme.colors.onPrimary}
                />
                <Text variant="button" color="onPrimary">
                  {t('contact.view')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ContactModal
        contact={contact}
        sellerName={sellerInfo?.name ?? listing?.sellerName}
        sellerVerified={sellerInfo?.verifiedSeller ?? listing?.sellerVerified}
        onClose={clearContact}
        onSupport={openSupport}
      />
    </View>
  );
}
