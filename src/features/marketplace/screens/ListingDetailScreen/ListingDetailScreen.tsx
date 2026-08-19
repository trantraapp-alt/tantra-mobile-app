// Buyer-facing listing detail — HTML reference design.
//
// Layout from top to bottom:
//   ┌──────────────────────────────────────────────┐
//   │ [◀]  Listing Details  [♡]  [⬆]  (white bar) │
//   ├──────────────────────────────────────────────┤
//   │  [🌿 Fresh Stock — solid green badge]        │
//   │            HERO IMAGE                        │
//   ├──────────────────────────────────────────────┤
//   │  ₹5,500  ~~₹6,000~~  8% OFF                 │  ← price card
//   │  Title · JG-315  ✓                           │
//   │  [Sell]  [Negotiable◯]                       │
//   │  📍 Location  ●  ⏰ time ago                 │
//   ├──────────────────────────────────────────────┤
//   │  👁12  👥0  📦20  🛡Quality  (stats card)   │
//   ├──────────────────────────────────────────────┤
//   │  🛡  Quality Assured  (green-tint card) ›    │
//   ├──────────────────────────────────────────────┤
//   │  ℹ️  About this product             ∨  ▸    │  ← accordion cards
//   │  📦  Product Details (2-col grid)   ▸        │
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
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  type LucideIcon,
  MapPin,
  Monitor,
  Navigation,
  Package,
  Phone,
  Share2,
  Shield,
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { ImageCarousel, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import {
  feedDescription,
  feedLocationLabel,
  listingAttributeEntries,
  resolveFeedTitle,
} from '@/features/home/utils/feedListing';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { logger, toApiError } from '@/lib';
import { useTheme, useToast } from '@/providers';
import { formatCurrency } from '@/utils';

import { marketplaceApi } from '../../api';
import { ContactModal, SimilarListings } from '../../components';
import { useListingDetail } from '../../hooks';
import type { ContactRevealResult } from '../../types';
import { createListingDetailStyles } from './ListingDetailScreen.styles';

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
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id?.trim() ?? '';

  // Footer bottom padding. `SafeAreaView edges={['bottom']}` would add the full
  // home-indicator inset (~34pt) on top of the footer's own padding, leaving a
  // visibly large dead zone under the button on iOS. Trimming a step off the
  // inset keeps the button clear of the indicator without the extra air, and
  // the floor keeps Android (inset 0) off the screen edge.
  const footerPadBottom = Math.max(insets.bottom - theme.spacing.sm, theme.spacing.sm);

  const { listing, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  // A non-null contact opens the sheet; clearing it on dismiss lets the next
  // reveal open it again.
  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [revealing, setRevealing] = useState(false);

  // "About this product" starts open; all others start collapsed.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['description']),
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

  // Violet primary header — shared between all states (loading, error, content).
  const headerBar = (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
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
        {/* Heart + Share: plain white icons on the violet bar — no circle */}
        <View style={styles.headerActions}>
          <IconButton
            icon={Heart}
            accessibilityLabel="Save"
            onPress={() => {}}
            color={theme.colors.onPrimary}
          />
          <IconButton
            icon={Share2}
            accessibilityLabel="Share"
            onPress={() => {}}
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
  const title =
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

  const description = feedDescription(listing);
  const attrs = listingAttributeEntries(listing).slice(0, 12);
  const isVerified = listing.sellerVerified === true;
  const isNegotiable = listing.isNegotiable === true;
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
          {/* Solid-green "Fresh Stock" badge (filled, white text) */}
          <View style={styles.freshBadge}>
            <Shield size={theme.sizing.iconXs} color={theme.colors.onPrimary} />
            <Text variant="label" color="onPrimary">
              {t('detail.freshStock')}
            </Text>
          </View>
        </View>

        {/* ── Price card (matches HTML reference design) ───── */}
        <View style={styles.priceCard}>

          {/* ① Price row — large bold price · strikethrough · amber pill */}
          <View style={styles.priceRow}>
            {listing.offeredPrice != null ? (
              <Text variant="h2" style={styles.priceMain}>
                {formatCurrency(listing.offeredPrice, appConstants.currencyCode)}
              </Text>
            ) : (
              <Text variant="h2" color="textTertiary">
                {t('home.askPrice')}
              </Text>
            )}
            {listing.actualPrice != null &&
              listing.offeredPrice != null &&
              listing.actualPrice > listing.offeredPrice ? (
              <Text variant="body" color="textTertiary" style={styles.priceStrike}>
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

          {/* ② Title + filled-circle verified badge */}
          <View style={styles.titleRow}>
            <Text variant="h3" numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
            {isVerified ? (
              <View style={styles.verifiedCircle}>
                <Check
                  size={10}
                  color={theme.colors.onPrimary}
                  strokeWidth={3.5}
                />
              </View>
            ) : null}
          </View>

          {/* ③ Tags: type pill + negotiable pill */}
          <View style={styles.tagsRow}>
            {/* Listing type — SELL = green filled, RENT = amber filled */}
            {type ? (
              <View style={type === 'RENT' ? styles.tagRent : styles.tagSell}>
                <Text variant="overline" color="onPrimary" style={styles.tagText}>
                  {typeLabel}
                </Text>
              </View>
            ) : null}
            {/* Negotiable = outlined green; Not Negotiable = filled amber */}
            {isNegotiable ? (
              <View style={styles.tagNegotiable}>
                <Text variant="overline" color="onPrimary" style={styles.tagText}>
                  {t('home.tagNegotiable')}
                </Text>
              </View>
            ) : (
              <View style={styles.tagNotNegotiable}>
                <Text variant="overline" color="onPrimary" style={styles.tagText}>
                  {t('home.tagNotNegotiable')}
                </Text>
              </View>
            )}
          </View>

          {/* ④ Meta — one row: 📍 City, State   ⏰ time ago */}
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

        {/* ── Stats card: 4 columns — 20px muted icons, 15px bold values ─── */}
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

          {/* Col 3: Quintal / unit */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Monitor size={theme.sizing.iconXs} color={theme.colors.textSecondary} />
            <Text variant="h4" color="textPrimary" style={styles.statValue}>
              {listing.quantity ?? 0}
            </Text>
            <Text variant="label" color="textSecondary" align="center">
              {listing.unit?.trim() || t('detail.quintal')}
            </Text>
          </View>

          {/* Col 4: Quality Assured — word value, green when verified */}
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
                {t('detail.qualityAssuredDesc')}
              </Text>
            </View>
            <ChevronRight
              size={theme.sizing.iconSm}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        ) : null}

        {/* ── About this product (accordion card) ─────── */}
        {description ? (
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
              color="textSecondary"
              numberOfLines={descExpanded ? undefined : 3}
            >
              {description}
            </Text>
            <TouchableOpacity
              style={styles.readMore}
              onPress={() => setDescExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Text variant="label" style={{ color: theme.colors.primary }}>
                {descExpanded ? t('detail.readLess') : t('detail.readMore')}
              </Text>
            </TouchableOpacity>
          </AccordionSection>
        ) : null}

        {/* ── Product Details — 2-column grid (accordion card) ─── */}
        {attrs.length > 0 ? (
          <AccordionSection
            icon={Package}
            iconColor={theme.colors.secondary}
            title={t('detail.details')}
            expanded={expanded.has('details')}
            sectionKey="details"
            onToggle={toggleSection}
            style={styles.card}
          >
            <View style={styles.detailsGrid}>
              {attrs.map((attr, i) => (
                <View
                  key={attr.key}
                  style={[
                    styles.detailCell,
                    i % 2 === 1 && styles.detailCellAlt,
                  ]}
                >
                  <Text
                    variant="caption"
                    color="textTertiary"
                    style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                  >
                    {attr.label}
                  </Text>
                  <Text variant="bodyMedium" color="textPrimary">
                    {attr.value}
                  </Text>
                </View>
              ))}
            </View>
          </AccordionSection>
        ) : null}

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
                <View style={styles.sellerNameRow}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {sellerName}
                  </Text>
                  {isVerified ? (
                    <View style={styles.verifiedCircle}>
                      <Check
                        size={10}
                        color={theme.colors.onPrimary}
                        strokeWidth={3.5}
                      />
                    </View>
                  ) : null}
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
        {addressParts.length > 0 ? (
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
                color="textSecondary"
                style={styles.locationText}
              >
                {addressParts.join(', ')}
              </Text>
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
            </View>
          </AccordionSection>
        ) : null}

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
