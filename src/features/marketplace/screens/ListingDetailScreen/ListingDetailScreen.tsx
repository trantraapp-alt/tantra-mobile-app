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
  BadgeCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Monitor,
  Navigation,
  Package,
  Phone,
  Share2,
  Shield,
  ShieldCheck,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Badge, type BadgeTone, ImageCarousel, PriceTag, Text } from '@/components/ui';
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
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

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
  onToggle: () => void;
  children: ReactNode;
  /** Wrapper style applied to the root View — use styles.card to make a card. */
  style?: StyleProp<ViewStyle>;
}

// Tappable header row that reveals its children with smooth animation.
// Height change → LayoutAnimation (platform-native, no measurement needed).
// Chevron rotation → Reanimated withTiming (JS-driven, frame-perfect).
function AccordionSection({
  icon: Icon,
  iconColor,
  title,
  expanded,
  onToggle,
  children,
  style,
}: AccordionSectionProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);

  // Chevron: 0° = pointing down (expanded ∨), -90° = pointing right (collapsed ▶).
  const chevronAngle = useSharedValue(expanded ? 0 : -90);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronAngle.value}deg` }],
  }));

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: theme.animation.normal,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    chevronAngle.value = withTiming(expanded ? -90 : 0, {
      duration: theme.animation.normal,
      easing: theme.easing.decelerate,
    });
    onToggle();
  }, [expanded, onToggle, chevronAngle, theme]);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
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
      {expanded ? (
        <View style={styles.accordionBody}>{children}</View>
      ) : null}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

// Renders the buyer listing-detail screen.
export function MarketplaceListingDetailScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  const { t, language } = useTranslation();
  const router = useRouter();
  const goBack = useGoBack();
  const { showError } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id?.trim() ?? '';

  const { listing, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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

  const onViewContact = useCallback(async () => {
    if (!listingId) return;
    setRevealing(true);
    try {
      const res = await marketplaceApi.revealContact(listingId);
      setContact(res);
      setModalVisible(true);
    } catch (error) {
      logger.warn('[Contact] reveal failed', error);
      showError(t('contact.error'));
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

  const agoRaw = relativeTime(listing.createdAt);
  const ago = agoRaw === 'now' ? t('detail.justNow') : agoRaw;

  const type = String(listing.listingType ?? '').toUpperCase();
  const typeTone: BadgeTone = type === 'RENT' ? 'warning' : 'success';
  const typeLabel =
    type === 'RENT'
      ? t('market.type.rent')
      : type === 'SELL'
        ? t('market.type.sell')
        : type;

  const description = feedDescription(listing);
  const attrs = listingAttributeEntries(listing).slice(0, 12);
  const contactHidden = listing.showContact === false;
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

        {/* ── Price card ──────────────────────────────── */}
        <View style={styles.card}>

          {/* Price row — PriceTag handles formatting & currency */}
          {listing.offeredPrice != null ? (
            <PriceTag
              size="lg"
              price={listing.offeredPrice}
              compareAtPrice={listing.actualPrice ?? undefined}
              discountPercentage={discount}
              currency={appConstants.currencyCode}
            />
          ) : (
            <Text variant="h3" color="textTertiary">
              {t('home.askPrice')}
            </Text>
          )}

          {/* Title + verified checkmark */}
          <View style={styles.titleRow}>
            <Text variant="h3" numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
            {isVerified ? (
              <BadgeCheck
                size={theme.sizing.iconSm}
                color={theme.colors.success}
              />
            ) : null}
          </View>

          {/* Tags: type Badge (component-managed tone) + negotiable pill */}
          <View style={styles.tagsRow}>
            {type ? (
              <Badge tone={typeTone} label={typeLabel} />
            ) : null}
            {isNegotiable ? (
              <View style={styles.tagNegotiable}>
                {/* Outlined — text gets the green color directly */}
                <Text
                  variant="overline"
                  style={{ color: theme.colors.success }}
                >
                  {t('home.tagNegotiable')}
                </Text>
              </View>
            ) : (
              <View style={styles.tagNotNegotiable}>
                <Text variant="overline" color="onPrimary">
                  {t('home.tagNotNegotiable')}
                </Text>
              </View>
            )}
          </View>

          {/* Meta: 📍 location  ●  ⏰ time ago */}
          {locality || ago ? (
            <View style={styles.metaRow}>
              {locality ? (
                <View style={styles.metaItem}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.danger}
                  />
                  <Text variant="body" color="textSecondary">
                    {locality}
                  </Text>
                </View>
              ) : null}
              {locality && ago ? <View style={styles.metaDot} /> : null}
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

        {/* ── Stats card: 4 columns — gray icons, dark numerals ─── */}
        <View style={styles.statsCard}>

          {/* Col 1: Views */}
          <View style={styles.statItem}>
            <Eye size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
            <Text variant="h4" color="textPrimary">
              {listing.viewCount ?? 0}
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              {t('detail.views')}
            </Text>
          </View>

          {/* Col 2: Contacts */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Users
              size={theme.sizing.iconXs}
              color={theme.colors.textTertiary}
            />
            <Text variant="h4" color="textPrimary">
              {listing.contactRevealCount ?? 0}
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              {t('detail.contacts')}
            </Text>
          </View>

          {/* Col 3: Quintal / unit */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Monitor
              size={theme.sizing.iconXs}
              color={theme.colors.textTertiary}
            />
            <Text variant="h4" color="textPrimary">
              {listing.quantity ?? 0}
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              {listing.unit?.trim() || t('detail.quintal')}
            </Text>
          </View>

          {/* Col 4: Quality Assured — special visual (green when verified) */}
          <View style={[styles.statItem, styles.statItemBorder]}>
            <ShieldCheck
              size={theme.sizing.iconXs}
              color={
                isVerified ? theme.colors.success : theme.colors.textTertiary
              }
            />
            <Text
              variant="label"
              style={
                isVerified ? { color: theme.colors.success } : undefined
              }
              color={isVerified ? undefined : 'textTertiary'}
            >
              {t('detail.quality')}
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
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
            onToggle={() => toggleSection('description')}
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
            onToggle={() => toggleSection('details')}
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
          onToggle={() => toggleSection('seller')}
          style={styles.card}
        >
          {/* Seller header row: avatar · name+subtitle · profile arrow */}
          <View style={styles.sellerHeaderRow}>
            <View style={styles.sellerAvatar}>
              <Home size={theme.sizing.iconMd} color={theme.colors.primary} />
            </View>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text variant="h4" numberOfLines={1}>
                  {sellerName}
                </Text>
                {isVerified ? (
                  <BadgeCheck
                    size={theme.sizing.iconXs}
                    color={theme.colors.success}
                  />
                ) : null}
              </View>
              <Text variant="caption" color="textSecondary">
                {planLabel
                  ? `${planLabel} · ${locality || t('detail.seller')}`
                  : locality || t('detail.seller')}
              </Text>
            </View>
            {listing.userId ? (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    routes.seller(
                      String(listing.userId),
                      listing.sellerName ?? undefined,
                    ),
                  )
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRight
                  size={theme.sizing.iconSm}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.sellerDivider} />

          {/* Seller badges — 2×2 grid matching HTML design */}
          <View style={styles.sellerBadgeGrid}>
            {/* Row 1 */}
            <View style={styles.sellerBadgeRow}>
              {/* Status */}
              <View style={styles.sellerBadge}>
                <ShieldCheck
                  size={theme.sizing.iconXs}
                  color={
                    isVerified
                      ? theme.colors.success
                      : theme.colors.textTertiary
                  }
                />
                <View style={styles.sellerBadgeTexts}>
                  <Text variant="caption" color="textTertiary">
                    {t('detail.statusLabel')}
                  </Text>
                  <Text
                    variant="label"
                    style={{
                      color: isVerified
                        ? theme.colors.success
                        : theme.colors.textSecondary,
                    }}
                  >
                    {isVerified
                      ? t('detail.verifiedLabel')
                      : t('detail.unverifiedLabel')}
                  </Text>
                </View>
              </View>
              {/* Member Since */}
              <View style={styles.sellerBadge}>
                <Calendar
                  size={theme.sizing.iconXs}
                  color={theme.colors.primary}
                />
                <View style={styles.sellerBadgeTexts}>
                  <Text variant="caption" color="textTertiary">
                    {t('detail.memberSince')}
                  </Text>
                  <Text variant="label" color="textPrimary">
                    {planLabel ?? '—'}
                  </Text>
                </View>
              </View>
            </View>
            {/* Row 2 */}
            <View style={styles.sellerBadgeRow}>
              {/* Response Rate */}
              <View style={styles.sellerBadge}>
                <Activity
                  size={theme.sizing.iconXs}
                  color={theme.colors.info}
                />
                <View style={styles.sellerBadgeTexts}>
                  <Text variant="caption" color="textTertiary">
                    {t('detail.responseRate')}
                  </Text>
                  <Text variant="label" color="textPrimary">
                    —
                  </Text>
                </View>
              </View>
              {/* Delivery */}
              <View style={styles.sellerBadge}>
                <Truck
                  size={theme.sizing.iconXs}
                  color={theme.colors.secondary}
                />
                <View style={styles.sellerBadgeTexts}>
                  <Text variant="caption" color="textTertiary">
                    {t('detail.delivery')}
                  </Text>
                  <Text variant="label" color="textPrimary">
                    —
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </AccordionSection>

        {/* ── Location (accordion card) ────────────────── */}
        {addressParts.length > 0 ? (
          <AccordionSection
            icon={MapPin}
            iconColor={theme.colors.danger}
            title={t('listing.location')}
            expanded={expanded.has('location')}
            onToggle={() => toggleSection('location')}
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
      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.footer}>

          {/* Chat with Seller — outlined primary (violet) */}
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
          </TouchableOpacity>

          {/* View Contact Details — filled green with subtitle */}
          <TouchableOpacity
            style={[
              styles.contactBtn,
              (contactHidden || revealing) && { opacity: 0.6 },
            ]}
            activeOpacity={0.8}
            onPress={onViewContact}
            disabled={contactHidden || revealing}
            accessibilityRole="button"
            accessibilityLabel={
              contactHidden ? t('contact.hidden') : t('contact.view')
            }
          >
            {revealing ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <View style={styles.contactBtnInner}>
                  <Phone
                    size={theme.sizing.iconSm}
                    color={theme.colors.onPrimary}
                  />
                  <Text variant="button" color="onPrimary">
                    {contactHidden ? t('contact.hidden') : t('contact.view')}
                  </Text>
                </View>
                {!contactHidden ? (
                  <Text
                    variant="caption"
                    color="onPrimary"
                    style={{ opacity: 0.8 }}
                  >
                    {t('contact.viewHint')}
                  </Text>
                ) : null}
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ContactModal
        visible={modalVisible}
        contact={contact}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
