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
//   │  👁12  👥0  📦20  🛡Quality  (stats card)   │
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
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  type LucideIcon,
  MapPin,
  Navigation,
  Package,
  Phone,
  Share2,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react-native';
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Linking,
  ScrollView,
  Share,
  type StyleProp,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { BrandHeaderBackdrop } from '@/components/shared';
import { ImageCarousel, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { appConstants, routes } from '@/constants';
import {
  type FeedListing,
  feedLocationLabel,
  resolveFeedTitle,
} from '@/features/home';
import { localize } from '@/features/sell';
import { useSavedListing } from '@/features/wishlist/hooks/useSavedListing';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { logger, toApiError } from '@/lib';
import { useTheme, useToast } from '@/providers';
import { formatCurrency } from '@/utils';

import { marketplaceApi } from '../../api';
import { ContactModal, SimilarListings } from '../../components';
import { useListingDetail } from '../../hooks';
import type { ContactRevealResult } from '../../types';
import {
  buildListingSpecs,
  deriveListingName,
  listingDescription,
  listingQuantityLabel,
  type ListingSpecRow,
} from '../../utils/listingSpecs';
import { createListingDetailStyles } from './ListingDetailScreen.styles';

// Picks the "Quality Assured" blurb that fits the listing's category. The stock
// produce wording ("100% natural") reads as nonsense on a tractor or a vet
// visit, so the category name is keyword-matched the same way categoryVisuals
// resolves icons. Order matters: services are checked before the nouns they
// mention, so "tractor repair service" lands on service, not equipment.
const QUALITY_DESC_RULES: { match: RegExp; key: TranslationKey }[] = [
  {
    match: /service|labour|labor|seva|repair|mainten|maramat|vet|veterin|clinic|rental|hire/,
    key: 'detail.qualityDesc.service',
  },
  {
    match: /equip|tractor|machine|tool|implement|pump|harvest|thresh/,
    key: 'detail.qualityDesc.equipment',
  },
  {
    match: /cattle|livestock|animal|cow|buffalo|goat|sheep|poultry|hen|chicken|fish|pashu|dairy/,
    key: 'detail.qualityDesc.livestock',
  },
  { match: /seed|beej|nursery|sapling/, key: 'detail.qualityDesc.seed' },
  {
    match: /fertil|pestic|spray|chemical|manure|khad|nutrient/,
    key: 'detail.qualityDesc.input',
  },
  {
    match: /crop|grain|cereal|wheat|rice|veget|sabzi|sabji|fruit|dal|pulse|spice|produce/,
    key: 'detail.qualityDesc.produce',
  },
];

// Resolves the blurb key for a category label, falling back to wording that is
// true of every listing when the category is unknown or missing.
function qualityDescKey(category: string): TranslationKey {
  const key = category.trim().toLowerCase();
  if (!key) {
    return 'detail.qualityDesc.default';
  }
  return (
    QUALITY_DESC_RULES.find((rule) => rule.match.test(key))?.key ??
    'detail.qualityDesc.default'
  );
}

// A description longer than this is clipped to three lines behind "Read more".
const DESC_CLAMP_LENGTH = 140;

// Short relative-time label from an ISO timestamp.
function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return '';
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// One spec row placed into the two-column grid.
interface SpecCell {
  row: ListingSpecRow;
  // Long / free-text answers take the whole line — half a row is unreadable.
  full: boolean;
  // Whether this cell gets the alternate (tinted) background.
  alt: boolean;
}

// Lays a section's rows out as grid cells. Only half-width cells advance the
// zebra counter, and a full-width row resets it, so the tint keeps tracking the
// right-hand column instead of drifting after every long answer.
function toSpecCells(rows: ListingSpecRow[]): SpecCell[] {
  let column = 0;
  return rows.map((row) => {
    if (row.stacked) {
      column = 0;
      return { row, full: true, alt: false };
    }
    const alt = column % 2 === 1;
    column += 1;
    return { row, full: false, alt };
  });
}

// ── Accordion section ─────────────────────────────────────────────────────────

interface AccordionSectionProps {
  icon: LucideIcon;
  /** Icon colour — defaults to primary. Pass a theme color to distinguish sections. */
  iconColor?: string;
  title: string;
  expanded: boolean;
  /** Identifies this section to the parent's toggle handler. */
  sectionKey: string;
  /** Stable handler — receives `sectionKey`, so no inline closure is needed. */
  onToggle: (key: string) => void;
  children: ReactNode;
  /** Wrapper style applied to the root View — use styles.card to make a card. */
  style?: StyleProp<ViewStyle>;
}

// Tappable header row that reveals its children with a smooth height animation.
//
// Both the body height and the chevron rotation are driven by ONE shared value
// (`progress`, 0 = collapsed → 1 = expanded) animated with Reanimated, so the
// whole transition runs on the UI thread and never touches the JS bridge
// mid-gesture.
//
// Three things make this cheap:
//   1. Children stay MOUNTED across toggles — collapsing clips them to height 0
//      instead of unmounting, so reopening costs no remount/re-layout.
//   2. The measuring wrapper is absolutely positioned, so its height never
//      feeds back into the animated container (no measure → animate → measure
//      loop) and `onLayout` fires only when the content itself changes.
//   3. The component is memoized and takes a stable `onToggle`, so tapping one
//      section does not re-render the other three.
function AccordionSectionComponent({
  icon: Icon,
  iconColor,
  title,
  expanded,
  sectionKey,
  onToggle,
  children,
  style,
}: AccordionSectionProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);

  // 0 = fully collapsed, 1 = fully expanded. Drives height, opacity and chevron.
  const progress = useSharedValue(expanded ? 1 : 0);
  // Natural height of the body content, measured once by the inner wrapper.
  const contentHeight = useSharedValue(0);

  // Animate whenever the parent flips `expanded`. Keeping the animation here
  // (rather than in the press handler) means the section stays correct even if
  // something else toggles it.
  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: theme.animation.normal,
      easing: theme.easing.standard,
    });
  }, [expanded, progress, theme.animation.normal, theme.easing.standard]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: progress.value,
  }));

  // -90° = pointing right (collapsed ▶), 0° = pointing down (expanded ∨).
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-90 + progress.value * 90}deg` }],
  }));

  const onContentLayout = useCallback(
    (e: LayoutChangeEvent) => {
      contentHeight.value = e.nativeEvent.layout.height;
    },
    [contentHeight],
  );

  const handleToggle = useCallback(() => {
    onToggle(sectionKey);
  }, [onToggle, sectionKey]);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Icon
          size={theme.sizing.iconSm}
          color={iconColor ?? theme.colors.primary}
        />
        <Text variant="h4" style={styles.sectionTitleText}>
          {title}
        </Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown
            size={theme.sizing.iconSm}
            color={theme.colors.textTertiary}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Clipping window — its height is animated; content never unmounts. */}
      <Animated.View style={[styles.accordionClip, bodyStyle]}>
        {/* Absolute so this wrapper's height does not drive the parent's. */}
        <View style={styles.accordionMeasure} onLayout={onContentLayout}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

// Memoized so toggling one section doesn't re-render its siblings.
const AccordionSection = memo(AccordionSectionComponent);

// ── Screen ────────────────────────────────────────────────────────────────────

// Renders the buyer listing-detail screen.
export function MarketplaceListingDetailScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  const { t, language } = useTranslation();
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

  const { listing, form, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  // Wishlist state for the header heart. Backed by the shared `saved` slice, so
  // a listing hearted on a card already reads as saved here (and vice versa) —
  // nothing needs to be threaded through navigation params.
  const { saved, toggle: toggleSaved } = useSavedListing(listingId);

  // A non-null contact opens the sheet; clearing it on dismiss lets the next
  // reveal open it again.
  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [revealing, setRevealing] = useState(false);

  // Every section starts open — the detail page is a reference the buyer reads
  // top to bottom, so hiding it behind four taps costs more than the scroll.
  // Collapsing still works; the accordion just no longer starts closed.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['description', 'details', 'seller', 'location']),
  );

  // Description text is truncated at 3 lines until the user taps "Read more".
  const [descExpanded, setDescExpanded] = useState(false);

  const toggleSection = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const heroImages = useMemo(
    () =>
      (listing?.images ?? [])
        .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
        .map((s) => fileUrl(s)),
    [listing],
  );

  const openListing = useCallback(
    (item: FeedListing) => {
      const id = item.listingId ? String(item.listingId) : '';
      if (id) router.push(routes.marketListing(id));
    },
    [router],
  );

  // Clearing the contact on dismiss is what lets a second tap re-open the sheet.
  const clearContact = useCallback(() => setContact(null), []);

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

  // ── Derive display values ────────────────────────────────────────────
  // Everything below reads the listing THROUGH its category's form schema, so a
  // stored value ("wheat") reads as the label the seller picked ("Wheat") and
  // every question the form asked can be listed back, answered or not.
  const specSource = { listing, form, language };

  // The heading is the thing being sold — the crop / breed / model the seller
  // named on the form. The API's listingTitle is only the category ("Crop")
  // for most listings, so the schema-derived name wins whenever there is one.
  const title =
    deriveListingName(specSource) ||
    listing.listingTitle?.trim() ||
    resolveFeedTitle(listing, language, t('home.listingFallback'));

  const addressParts = listing.address
    ? [
        listing.address.village,
        listing.address.district,
        listing.address.state,
        listing.address.pincode,
      ]
        .map((p) => (p ?? '').trim())
        .filter(Boolean)
    : [];
  const locality =
    addressParts.join(', ') || feedLocationLabel(listing.address);

  // Compact label for the price-card meta row: only the most specific part
  // (village → district) plus the state, e.g. "Jabalpur, Madhya Pradesh".
  // The full `locality` above is still used for the map search and seller row.
  const shortLocality = (() => {
    const state = (listing.address?.state ?? '').trim();
    const first = [listing.address?.village, listing.address?.district]
      .map((p) => (p ?? '').trim())
      .find(Boolean);
    if (first && state && first !== state) {
      return `${first}, ${state}`;
    }
    return first || state || feedLocationLabel(listing.address);
  })();

  const agoRaw = relativeTime(listing.createdAt);
  const ago = agoRaw === 'now' ? t('detail.justNow') : agoRaw;

  const type = String(listing.listingType ?? '').toUpperCase();
  const typeLabel =
    type === 'RENT'
      ? t('market.type.rent')
      : type === 'SELL'
        ? t('market.type.sell')
        : type;

  // The About card's paragraph, and the field key it came from so the same text
  // is not repeated as a cramped row inside the spec grid below it.
  const description = listingDescription(specSource);
  // Every field on the listing form, in the form's own order, with "NA" standing
  // in for each one the seller left blank.
  const specs = buildListingSpecs({
    ...specSource,
    labels: {
      na: t('common.na'),
      yes: t('common.yes'),
      no: t('common.no'),
      other: t('detail.otherDetails'),
    },
    skipKeys: description ? new Set([description.key]) : undefined,
  });
  const isVerified = listing.sellerVerified === true;
  const isNegotiable = listing.isNegotiable === true;
  // "50 Quintal" — read under the name. The unit is resolved through the form's
  // option labels, so a stored "QUINTAL" reads the way the seller chose it.
  const quantityLabel = listingQuantityLabel(specSource);
  // Category label drives the Quality Assured wording. `categoryName` may be a
  // plain string or a bilingual pair depending on the endpoint, so normalise
  // both shapes before keyword-matching.
  const categoryLabel =
    typeof listing.categoryName === "string"
      ? listing.categoryName
      : localize(listing.categoryName, language);
  const discount =
    listing.discountPct != null && listing.discountPct > 0
      ? Math.round(listing.discountPct)
      : undefined;

  const sellerName = listing.sellerName?.trim() || t('detail.sellerFallback');
  const hasPlan =
    listing.sellerPlanKey &&
    String(listing.sellerPlanKey).toUpperCase() !== 'BASIC';
  const planLabel = hasPlan ? String(listing.sellerPlanKey) : null;

  // The four seller badges from the HTML design. Only Status and Plan come from
  // the API today — Response Rate and Delivery have no backing field yet, so
  // they render an em dash rather than an invented number.
  //
  // NOTE: plain values, not useMemo/useCallback — everything below this point
  // runs after the `isLoading` / `isError` guards above, so a hook here would
  // change the hook count between renders ("Rendered more hooks than during the
  // previous render"). Both are cheap enough that memoizing buys nothing.
  const sellerBadges: {
    icon: LucideIcon;
    label: string;
    value: string;
    tone?: 'success' | 'textSecondary';
  }[] = [
    {
      icon: ShieldCheck,
      label: t('detail.statusLabel'),
      value: isVerified
        ? t('detail.verifiedLabel')
        : t('detail.unverifiedLabel'),
      tone: isVerified ? 'success' : 'textSecondary',
    },
    {
      icon: Calendar,
      label: t('detail.memberSince'),
      value: planLabel ?? '—',
    },
    {
      icon: Activity,
      label: t('detail.responseRate'),
      value: '—',
    },
    {
      icon: Truck,
      label: t('detail.delivery'),
      value: '—',
    },
  ];

  const openSellerProfile = () => {
    if (!listing.userId) {
      return;
    }
    router.push(
      routes.seller(String(listing.userId), listing.sellerName ?? undefined),
    );
  };

  const onViewOnMap = () => {
    const query = locality || addressParts.join(', ');
    if (query) {
      Linking.openURL(
        `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      );
    }
  };

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── White header ─────────────────────────────── */}
      {headerBar}

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero image ──────────────────────────────── */}
        <View style={styles.heroWrap}>
          <ImageCarousel
            images={heroImages}
            aspectRatio={4 / 3}
            contentFit="cover"
          />
        </View>

        {/* ── Price card (matches HTML reference design) ───── */}
        <View style={styles.priceCard}>

          {/* ① Name of the thing being sold */}
          <View style={styles.titleRow}>
            <Text variant="h2" numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
          </View>

          {/* ② Quantity + unit, directly under the name. Always shown: "how much
              is on offer" is the buyer's next question, and an unanswered one is
              itself worth knowing. */}
          <View style={styles.quantityRow}>
            <Package
              size={theme.sizing.iconXs}
              color={theme.colors.textSecondary}
            />
            <Text
              variant="bodyMedium"
              color={quantityLabel ? 'textSecondary' : 'textTertiary'}
            >
              {quantityLabel ?? `${t('listing.quantity')}: ${t('common.na')}`}
            </Text>
          </View>

          {/* ③ Price row — large bold price · strikethrough · amber pill */}
          <View style={styles.priceRow}>
            {listing.offeredPrice != null ? (
              <Text variant="h3" style={styles.priceMain}>
                {formatCurrency(listing.offeredPrice, appConstants.currencyCode)}
              </Text>
            ) : (
              <Text variant="h3" color="textTertiary" style={styles.priceMain}>
                {t('home.askPrice')}
              </Text>
            )}
            {listing.actualPrice != null &&
            listing.offeredPrice != null &&
            listing.actualPrice > listing.offeredPrice ? (
              <Text
                variant="body"
                color="textTertiary"
                style={styles.priceStrike}
              >
                {formatCurrency(listing.actualPrice, appConstants.currencyCode)}
              </Text>
            ) : null}
            {discount ? (
              <View style={styles.discountBadge}>
                <Text variant="overline" style={styles.discountText}>
                  {discount}% OFF
                </Text>
              </View>
            ) : null}
          </View>

          {/* ④ Tags — same pill treatment as the listing cards */}
          <View style={styles.tagsRow}>
            {/* Listing type — SELL = filled green, RENT = violet tint */}
            {type ? (
              <View
                style={[
                  styles.tag,
                  type === 'RENT' ? styles.tagRent : styles.tagSell,
                ]}
              >
                <Text
                  variant="overline"
                  color={type === 'RENT' ? 'primary' : 'onPrimary'}
                >
                  {typeLabel}
                </Text>
              </View>
            ) : null}
            {/* Negotiable = filled green, Not Negotiable = filled amber */}
            {isNegotiable ? (
              <View style={[styles.tag, styles.tagNegotiable]}>
                <Text variant="overline" color="onPrimary">
                  {t('home.tagNegotiable')}
                </Text>
              </View>
            ) : (
              <View style={[styles.tag, styles.tagNotNegotiable]}>
                <Text variant="overline" color="onPrimary">
                  {t('home.tagNotNegotiable')}
                </Text>
              </View>
            )}
          </View>

          {/* ⑤ Meta — one row: 📍 City, State   ⏰ time ago */}
          {shortLocality || ago ? (
            <View style={styles.metaRow}>
              {shortLocality ? (
                <View style={styles.metaItem}>
                  <MapPin size={theme.sizing.iconXs} color={theme.colors.danger} />
                  <Text variant="body" color="textSecondary" numberOfLines={1}>
                    {shortLocality}
                  </Text>
                </View>
              ) : null}
              {ago ? (
                <View style={styles.metaItem}>
                  <Clock size={theme.sizing.iconXs} color={theme.colors.secondary} />
                  <Text variant="body" color="textSecondary">{ago}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        {/* ── Stats card: 3 columns — 20px muted icons, 15px bold values ─── */}
        <View style={styles.statsCard}>

          {/* Col 1: Views */}
          <View style={styles.statItem}>
            <Eye size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
            <Text variant="h4" color="textPrimary" style={styles.statValue}>
              {listing.viewCount ?? 0}
            </Text>
            <Text variant="label" color="textSecondary" align="center">
              {t('detail.views')}
            </Text>
          </View>

          {/* Col 2: Contacts */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Users size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
            <Text variant="h4" color="textPrimary" style={styles.statValue}>
              {listing.contactRevealCount ?? 0}
            </Text>
            <Text variant="label" color="textSecondary" align="center">
              {t('detail.contacts')}
            </Text>
          </View>
          {/* Col 3: Quality Assured — word value, green when verified */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <ShieldCheck
              size={theme.sizing.iconXs}
              color={
                isVerified ? theme.colors.success : theme.colors.textSecondary
              }
            />
            <Text
              variant="bodyMedium"
              style={[
                styles.statValueQuality,
                isVerified ? { color: theme.colors.success } : undefined,
              ]}
              color={isVerified ? undefined : 'textTertiary'}
            >
              {t('detail.quality')}
            </Text>
            <Text variant="label" color="textSecondary" align="center">
              {t('detail.assured')}
            </Text>
          </View>
        </View>

        {/* ── Quality Assured clickable card ──────────── */}
        {isVerified ? (
          <TouchableOpacity
            style={styles.qualityCard}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <View style={styles.qualityIconCircle}>
              <ShieldCheck
                size={theme.sizing.iconMd}
                color={theme.colors.success}
              />
            </View>
            <View style={styles.qualityTexts}>
              <Text variant="h4" style={{ color: theme.colors.success }}>
                {t('detail.qualityAssured')}
              </Text>
              <Text variant="body" color="textSecondary">
                {t(qualityDescKey(categoryLabel ?? ''))}
              </Text>
            </View>
            <ChevronRight
              size={theme.sizing.iconSm}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        ) : null}

        {/* ── About this product (accordion card) ─────── */}
        <AccordionSection
          icon={FileText}
          iconColor={theme.colors.info}
          title={t('detail.description')}
          expanded={expanded.has('description')}
          sectionKey="description"
          onToggle={toggleSection}
          style={styles.card}
        >
          <Text
            variant="body"
            color={description ? 'textSecondary' : 'textTertiary'}
            numberOfLines={descExpanded ? undefined : 3}
          >
            {description?.text ?? t('common.na')}
          </Text>
          {/* Only a paragraph long enough to be clipped needs the toggle. */}
          {description && description.text.length > DESC_CLAMP_LENGTH ? (
            <TouchableOpacity
              style={styles.readMore}
              onPress={() => setDescExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Text variant="label" style={{ color: theme.colors.primary }}>
                {descExpanded ? t('detail.readLess') : t('detail.readMore')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </AccordionSection>

        {/* ── Product Details — every field the listing form asked for,
              grouped by the form's own sections. A field the seller left blank
              still gets a row, showing "NA", so the buyer can tell "not given"
              from "not asked". ─────────────────────────────────────────────── */}
        <AccordionSection
          icon={Package}
          iconColor={theme.colors.secondary}
          title={t('detail.details')}
          expanded={expanded.has('details')}
          sectionKey="details"
          onToggle={toggleSection}
          style={styles.card}
        >
          {specs.length > 0 ? (
            <View style={styles.specStack}>
              {specs.map((section) => (
                <View key={section.key} style={styles.specSection}>
                  {section.title ? (
                    <Text
                      variant="overline"
                      color="textTertiary"
                      style={styles.specSectionTitle}
                    >
                      {section.title}
                    </Text>
                  ) : null}
                  <View style={styles.detailsGrid}>
                    {toSpecCells(section.rows).map((cell) => (
                      <View
                        key={cell.row.key}
                        style={[
                          styles.detailCell,
                          cell.full && styles.detailCellFull,
                          cell.alt && styles.detailCellAlt,
                        ]}
                      >
                        <Text
                          variant="caption"
                          color="textTertiary"
                          style={styles.detailLabel}
                        >
                          {cell.row.label}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          color={cell.row.empty ? 'textTertiary' : 'textPrimary'}
                        >
                          {cell.row.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="body" color="textTertiary">
              {t('listing.noDetails')}
            </Text>
          )}
        </AccordionSection>

        {/* ── Seller Information (accordion card) ─────── */}
        <AccordionSection
          icon={Home}
          iconColor={theme.colors.warning}
          title={t('detail.seller')}
          expanded={expanded.has('seller')}
          sectionKey="seller"
          onToggle={toggleSection}
          style={styles.card}
        >
          {/* Header row: avatar · name + subtitle · profile chevron */}
          <TouchableOpacity
            style={styles.sellerHeaderRow}
            activeOpacity={listing.userId ? 0.7 : 1}
            disabled={!listing.userId}
            onPress={openSellerProfile}
            accessibilityRole={listing.userId ? 'button' : undefined}
          >
            <View style={styles.sellerInfoRow}>
              <View style={styles.sellerAvatar}>
                <Home size={26} color={theme.colors.primary} />
              </View>
              <View style={styles.sellerInfo}>
                {/* No tick beside the name — the badge grid below states the
                    seller's verification status in words. */}
                <View style={styles.sellerNameRow}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {sellerName}
                  </Text>
                </View>
                <Text variant="caption" color="textSecondary" numberOfLines={1}>
                  {planLabel
                    ? `${planLabel} · ${shortLocality || t('detail.seller')}`
                    : shortLocality || t('detail.seller')}
                </Text>
              </View>
            </View>
            {listing.userId ? (
              <ChevronRight
                size={theme.sizing.iconSm}
                color={theme.colors.textSecondary}
              />
            ) : null}
          </TouchableOpacity>

          <View style={styles.sellerDivider} />

          {/* Badge grid — 2×2. Values the API doesn't expose render as "—". */}
          <View style={styles.sellerBadgeGrid}>
            {sellerBadges.map((badge) => (
              <View key={badge.label} style={styles.sellerBadge}>
                <badge.icon
                  size={theme.sizing.iconSm}
                  color={theme.colors.primary}
                />
                <View style={styles.sellerBadgeTexts}>
                  <Text
                    variant="overline"
                    color="textSecondary"
                    style={styles.sellerBadgeLabel}
                    numberOfLines={1}
                  >
                    {badge.label}
                  </Text>
                  <Text
                    variant="caption"
                    color={badge.tone ?? 'textPrimary'}
                    style={styles.sellerBadgeValue}
                    numberOfLines={1}
                  >
                    {badge.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </AccordionSection>

        {/* ── Location (accordion card) ────────────────── */}
        <AccordionSection
          icon={MapPin}
          iconColor={theme.colors.danger}
          title={t('listing.location')}
          expanded={expanded.has('location')}
          sectionKey="location"
          onToggle={toggleSection}
          style={styles.card}
        >
          <View style={styles.locationContent}>
            <Text
              variant="body"
              color={addressParts.length > 0 ? 'textSecondary' : 'textTertiary'}
              style={styles.locationText}
            >
              {addressParts.length > 0 ? addressParts.join(', ') : t('common.na')}
            </Text>
            {/* Nothing to search for without an address — the button would open
                an empty map. */}
            {addressParts.length > 0 ? (
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={onViewOnMap}
                activeOpacity={0.8}
              >
                <Navigation size={theme.sizing.iconXs} color={theme.colors.primary} />
                <Text variant="label" style={{ color: theme.colors.primary }}>
                  {t('detail.viewOnMap')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </AccordionSection>

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

      <ContactModal contact={contact} onClose={clearContact} />
    </View>
  );
}
