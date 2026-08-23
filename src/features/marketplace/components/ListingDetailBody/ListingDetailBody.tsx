// The listing card stack, shared by BOTH detail screens so a seller previewing
// their own listing sees exactly what a buyer sees:
//
//   hero gallery → price card (name · quantity · price · tags · location)
//   → Quality Assured card → About · Product Details · Seller · Location
//
// It is presentational and scroll-less: each screen owns its own ScrollView,
// header and footer, and may append its own cards through `children` (the
// seller preview adds its listing-record card there). Everything it renders is
// derived from the listing plus its category's form schema — see `listingSpecs`
// for the rules that decide what a value reads as, and when a field becomes
// "NA".
import {
  BadgeCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Home,
  type LucideIcon,
  MapPin,
  Navigation,
  Package,
  ShieldCheck,
  Timer,
  Truck,
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
  type LayoutChangeEvent,
  Linking,
  type StyleProp,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ImageCarousel, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { appConstants } from '@/constants';
import {
  type FeedListing,
  feedLocationLabel,
  hasDelivery,
  resolveFeedTitle,
} from '@/features/home';
import { type ListingForm, localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';
import { formatCurrency, formatDate } from '@/utils';

import type { SellerInfo } from '../../types';
import {
  buildListingSpecs,
  deriveListingName,
  listingDescription,
  listingQuantityLabel,
  type ListingSpecRow,
} from '../../utils/listingSpecs';
import { createListingDetailBodyStyles } from './ListingDetailBody.styles';

// Picks the "Quality Assured" blurb that fits the listing's category. The stock
// produce wording ("100% natural") reads as nonsense on a tractor or a vet
// visit, so the category name is keyword-matched the same way categoryVisuals
// resolves icons. Order matters: services are checked before the nouns they
// mention, so "tractor repair service" lands on service, not equipment.
const QUALITY_DESC_RULES: { match: RegExp; key: TranslationKey }[] = [
  {
    match:
      /service|labour|labor|seva|repair|mainten|maramat|vet|veterin|clinic|rental|hire/,
    key: 'detail.qualityDesc.service',
  },
  {
    match: /equip|tractor|machine|tool|implement|pump|harvest|thresh/,
    key: 'detail.qualityDesc.equipment',
  },
  {
    match:
      /cattle|livestock|animal|cow|buffalo|goat|sheep|poultry|hen|chicken|fish|pashu|dairy/,
    key: 'detail.qualityDesc.livestock',
  },
  { match: /seed|beej|nursery|sapling/, key: 'detail.qualityDesc.seed' },
  {
    match: /fertil|pestic|spray|chemical|manure|khad|nutrient/,
    key: 'detail.qualityDesc.input',
  },
  {
    match:
      /crop|grain|cereal|wheat|rice|veget|sabzi|sabji|fruit|dal|pulse|spice|produce/,
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

// Minutes in an hour / a day, named so the last-login thresholds read as time
// rather than as magic numbers.
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

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
  const styles = useThemedStyles(createListingDetailBodyStyles);

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

// ── Body ──────────────────────────────────────────────────────────────────────

// Props for the ListingDetailBody component.
export interface ListingDetailBodyProps {
  // The listing being read. The seller preview adapts its own model to this
  // shape, so both screens render from one contract.
  listing: FeedListing;
  // The category's form schema — every label, option label and section comes
  // from it. Null degrades to raw attribute keys rather than an empty page.
  form: ListingForm | null;
  // The public seller card for this listing's owner, when loaded. Null renders
  // the tiles as em dashes rather than inventing a seller.
  sellerInfo?: SellerInfo | null;
  // Whether to render the Seller Information card. Off on the seller's own
  // preview: a card describing the viewer to themselves says nothing.
  showSeller?: boolean;
  // Overlaid on the hero gallery — the seller preview puts its status badge here.
  heroOverlay?: ReactNode;
  // Extra cards appended after the Location card.
  children?: ReactNode;
}

// Renders the shared listing card stack.
export function ListingDetailBody({
  listing,
  form,
  sellerInfo,
  showSeller = true,
  heroOverlay,
  children,
}: ListingDetailBodyProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailBodyStyles);
  const { t, language } = useTranslation();

  // Every section starts open — the detail page is a reference the reader goes
  // through top to bottom, so hiding it behind four taps costs more than the
  // scroll. Collapsing still works; the accordion just no longer starts closed.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['description', 'details', 'seller', 'location']),
  );

  // Description text is truncated at 3 lines until the reader taps "Read more".
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
      (listing.images ?? [])
        .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
        .map((s) => fileUrl(s)),
    [listing.images],
  );

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
  const delivers = hasDelivery(listing);
  // "50 Quintal" — read under the name. The unit is resolved through the form's
  // option labels, so a stored "QUINTAL" reads the way the seller chose it.
  const quantityLabel = listingQuantityLabel(specSource);
  // Category label drives the Quality Assured wording. `categoryName` may be a
  // plain string or a bilingual pair depending on the endpoint, so normalise
  // both shapes before keyword-matching.
  const categoryLabel =
    typeof listing.categoryName === 'string'
      ? listing.categoryName
      : localize(listing.categoryName, language);
  const discount =
    listing.discountPct != null && listing.discountPct > 0
      ? Math.round(listing.discountPct)
      : undefined;

  // Verification is the seller's own state, so /seller-info is the authority;
  // the listing's copy is only a fallback for a card rendered before it lands.
  const verified = sellerInfo?.verifiedSeller ?? isVerified;
  const sellerName = sellerInfo?.name?.trim() || null;
  const sellerLocation = sellerInfo?.location?.trim() || null;

  // "Jan 2024" from the account's creation date.
  const memberSince = sellerInfo?.memberSince
    ? formatDate(sellerInfo.memberSince, 'MMM YYYY')
    : null;

  // "12 min ago" / "3 hr ago" / "Yesterday" / "5 days ago" — the thresholds the
  // API contract specifies. An absent or unparseable timestamp reads as a dash.
  const lastLogin = (() => {
    const raw = sellerInfo?.lastLoginAt;
    if (!raw) {
      return null;
    }
    const diffMs = Date.now() - new Date(raw).getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) {
      return null;
    }
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) {
      return t('detail.justNow');
    }
    if (minutes < MINUTES_PER_HOUR) {
      return t('detail.minAgo', { value: minutes });
    }
    if (minutes < MINUTES_PER_DAY) {
      return t('detail.hrAgo', {
        value: Math.floor(minutes / MINUTES_PER_HOUR),
      });
    }
    if (minutes < MINUTES_PER_DAY * 2) {
      return t('detail.yesterday');
    }
    return t('detail.daysAgo', {
      value: Math.floor(minutes / MINUTES_PER_DAY),
    });
  })();

  // The four seller tiles. Three read the seller (/seller-info); Delivery reads
  // the LISTING — the same seller may deliver on one listing and not another.
  const sellerBadges: {
    icon: LucideIcon;
    label: string;
    value: string;
    tone?: 'success' | 'textSecondary';
  }[] = [
    {
      icon: verified ? BadgeCheck : ShieldCheck,
      label: t('detail.statusLabel'),
      value: verified ? t('detail.verifiedLabel') : t('detail.regularSeller'),
      tone: verified ? 'success' : 'textSecondary',
    },
    {
      icon: Calendar,
      label: t('detail.memberSince'),
      value: memberSince ?? '—',
    },
    {
      icon: Timer,
      label: t('detail.lastLogin'),
      value: lastLogin ?? '—',
    },
    {
      icon: Truck,
      label: t('detail.delivery'),
      value: delivers ? t('detail.deliveryYes') : t('detail.deliveryNo'),
      tone: delivers ? 'success' : 'textSecondary',
    },
  ];

  const onViewOnMap = () => {
    const query = locality || addressParts.join(', ');
    if (query) {
      Linking.openURL(
        `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      );
    }
  };

  return (
    <>
      {/* ── Hero image ──────────────────────────────── */}
      <View style={styles.heroWrap}>
        <ImageCarousel
          images={heroImages}
          aspectRatio={4 / 3}
          contentFit="cover"
        />
        {heroOverlay}
      </View>

      {/* ── Price card ───────────────────────────────── */}
      <View style={styles.priceCard}>
        {/* ① Name of the thing being sold */}
        <View style={styles.titleRow}>
          <Text variant="h2" numberOfLines={2} style={styles.titleText}>
            {title}
          </Text>
        </View>

        {/* ② Quantity + unit, directly under the name. Always shown: "how much
            is on offer" is the reader's next question, and an unanswered one is
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
          {/* Delivery — only when the seller actually offers it. "No delivery"
            is the norm here, so a pill for it would be noise on every card. */}
          {delivers ? (
            <View style={[styles.tag, styles.tagDelivery]}>
              <Truck size={theme.sizing.iconXs} color={theme.colors.success} />
              <Text variant="overline" style={{ color: theme.colors.success }}>
                {t('detail.deliveryAvailable')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ⑤ Meta — one row: 📍 City, State   ⏰ time ago */}
        {shortLocality || ago ? (
          <View style={styles.metaRow}>
            {shortLocality ? (
              <View style={styles.metaItem}>
                <MapPin
                  size={theme.sizing.iconXs}
                  color={theme.colors.danger}
                />
                <Text variant="body" color="textSecondary" numberOfLines={1}>
                  {shortLocality}
                </Text>
              </View>
            ) : null}
            {ago ? (
              <View style={styles.metaItem}>
                <Clock
                  size={theme.sizing.iconXs}
                  color={theme.colors.secondary}
                />
                <Text variant="body" color="textSecondary">
                  {ago}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* ── Quality Assured card ─────────────────────── */}
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
            still gets a row, showing "NA", so the reader can tell "not given"
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
      {showSeller ? (
        <AccordionSection
          icon={Home}
          iconColor={theme.colors.warning}
          title={t('detail.seller')}
          expanded={expanded.has('seller')}
          sectionKey="seller"
          onToggle={toggleSection}
          style={styles.card}
        >
          {/* Who the seller is. Both values come from /seller-info, and the
              locality is null until they have a listing to derive it from — so
              each falls back to a dash rather than to a generic word. */}
          <View style={styles.sellerIdentity}>
            <Text variant="h4" numberOfLines={1}>
              {sellerName ?? '—'}
            </Text>
            <View style={styles.sellerLocationRow}>
              <MapPin size={theme.sizing.iconXs} color={theme.colors.danger} />
              <Text variant="body" color="textSecondary" numberOfLines={1}>
                {sellerLocation ?? '—'}
              </Text>
            </View>
          </View>

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
      ) : null}

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
              <Navigation
                size={theme.sizing.iconXs}
                color={theme.colors.primary}
              />
              <Text variant="label" style={{ color: theme.colors.primary }}>
                {t('detail.viewOnMap')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </AccordionSection>

      {children}
    </>
  );
}
