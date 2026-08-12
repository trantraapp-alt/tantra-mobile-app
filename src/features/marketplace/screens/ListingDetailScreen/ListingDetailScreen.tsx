// Buyer-facing listing detail — Design 1 (exact match).
//
// Layout from top to bottom:
//   ┌──────────────────────────────────────────┐
//   │  [◀]  (dark-green header)  [♡]  [⬆]    │
//   ├──────────────────────────────────────────┤
//   │  [🌿 Fresh Deal]                         │
//   │           HERO IMAGE                     │
//   │                                 [1/5]    │
//   ├──────────────────────────────────────────┤
//   │  ₹5,500  ~~₹6,000~~  8% OFF             │
//   │  Title · JG-315  ✓                       │
//   │  [Split]  [Premium Quality]              │
//   │  📍 Location  |  🏪 Seller               │
//   │  ┌────────────────────────────────────┐  │
//   │  │ 👁12  👥0  💬20  📦20 Quintal     │  │
//   │  └────────────────────────────────────┘  │
//   │  ┌ Quality Assured ──────────────────┐   │
//   │  │ 🛡  Quality Assured (green)       │   │
//   │  │     100% insured & securely…      │   │
//   │  └───────────────────────────────────┘   │
//   │  📄 About this product            ∨      │
//   │  Description text…                        │
//   │  ─────────────────────────────────────   │
//   │  📦 Product Details               ∨      │
//   │  Crop Type          Pulse                 │
//   │  Variety            JG-315                │
//   │  …                                        │
//   │  ─────────────────────────────────────   │
//   │  🏪 Seller Information            ▶      │
//   ├──────────────────────────────────────────┤
//   │  [💬 Chat]      [📞 View Contact]        │
//   └──────────────────────────────────────────┘
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import {
  Badge,
  type BadgeTone,
  ImageCarousel,
  PriceTag,
  Text,
} from '@/components/ui';
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

// ── Accordion section ────────────────────────────────────────────────────────

interface AccordionSectionProps {
  icon: LucideIcon;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

// A tappable header row that reveals its children when expanded.
// Used for "About this product", "Product Details", "Seller Information".
function AccordionSection({
  icon: Icon,
  title,
  expanded,
  onToggle,
  children,
}: AccordionSectionProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  return (
    <View>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Icon size={theme.sizing.iconSm} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.accordionTitleText}>
          {title}
        </Text>
        {expanded ? (
          <ChevronDown
            size={theme.sizing.iconSm}
            color={theme.colors.textTertiary}
          />
        ) : (
          <ChevronRight
            size={theme.sizing.iconSm}
            color={theme.colors.textTertiary}
          />
        )}
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.accordionBody}>{children}</View>
      ) : null}
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

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

  // Sections start expanded — matching the design reference.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['description', 'details']),
  );

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

  // Dark-green header — shown in every state (loading, error, content).
  const headerBar = (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
      <View style={styles.header}>
        {/* Back: white circle on green */}
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={goBack}
          style={styles.backBtn}
          color={theme.colors.textPrimary}
        />
        <View style={styles.flex} />
        {/* Heart + Share: plain white icons, no background circle */}
        <IconButton
          icon={Heart}
          accessibilityLabel={t('common.save') ?? 'Save'}
          onPress={() => {}}
          color={theme.colors.surface}
        />
        <IconButton
          icon={Share2}
          accessibilityLabel={t('common.share') ?? 'Share'}
          onPress={() => {}}
          color={theme.colors.surface}
        />
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

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── Dark-green header ─────────────────────────── */}
      {headerBar}

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* ── Hero image ────────────────────────────────── */}
        <View style={styles.heroWrap}>
          <ImageCarousel
            images={heroImages}
            aspectRatio={4 / 3}
            contentFit="cover"
          />
          {/* "Fresh Deal" badge — white pill with green border, top-left */}
          <View style={styles.freshDealBadge}>
            <Leaf size={12} color={theme.colors.success} />
            <Text
              variant="label"
              style={{ color: theme.colors.success }}
            >
              {t('detail.freshDeal')}
            </Text>
          </View>
        </View>

        {/* ── White scrollable content ──────────────────── */}
        <View style={styles.content}>

          {/* Price row */}
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

          {/* Title + verified check */}
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

          {/* Listing-type + negotiable badges */}
          {type || isNegotiable ? (
            <View style={styles.tagsRow}>
              {type ? <Badge tone={typeTone} label={typeLabel} /> : null}
              {isNegotiable ? (
                <Badge tone="info" label={t('home.tagNegotiable')} />
              ) : null}
            </View>
          ) : null}

          {/* Meta: 📍 location  |  🏪 seller name */}
          {locality || sellerName ? (
            <View style={styles.metaRow}>
              {locality ? (
                <View style={styles.metaItem}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.danger}
                  />
                  <Text variant="caption" color="textSecondary">
                    {locality}
                  </Text>
                </View>
              ) : null}
              {locality && sellerName ? (
                <View style={styles.metaDivider} />
              ) : null}
              {sellerName ? (
                <View style={styles.metaItem}>
                  <Store
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text variant="caption" color="textSecondary">
                    {sellerName}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Stats box: 4 columns in a bordered card ─── */}
          <View style={styles.statsBox}>
            {/* Views */}
            <View style={styles.statCol}>
              <View style={styles.statNumRow}>
                <Eye
                  size={theme.sizing.iconXs}
                  color={theme.colors.textSecondary}
                />
                <Text variant="h4">{listing.viewCount ?? 0}</Text>
              </View>
              <Text variant="caption" color="textSecondary" align="center">
                {t('detail.views')}
              </Text>
            </View>
            <View style={styles.statColDivider} />

            {/* Farmers */}
            <View style={styles.statCol}>
              <View style={styles.statNumRow}>
                <Users
                  size={theme.sizing.iconXs}
                  color={theme.colors.textSecondary}
                />
                <Text variant="h4">0</Text>
              </View>
              <Text variant="caption" color="textSecondary" align="center">
                {t('detail.farmers')}
              </Text>
            </View>
            <View style={styles.statColDivider} />

            {/* Enquired */}
            <View style={styles.statCol}>
              <View style={styles.statNumRow}>
                <MessageCircle
                  size={theme.sizing.iconXs}
                  color={theme.colors.textSecondary}
                />
                <Text variant="h4">{listing.contactRevealCount ?? 0}</Text>
              </View>
              <Text variant="caption" color="textSecondary" align="center">
                {t('detail.enquired')}
              </Text>
            </View>
            <View style={styles.statColDivider} />

            {/* Quintal / unit */}
            <View style={styles.statCol}>
              <View style={styles.statNumRow}>
                <Package
                  size={theme.sizing.iconXs}
                  color={theme.colors.textSecondary}
                />
                <Text variant="h4">{listing.quantity ?? 0}</Text>
              </View>
              <Text variant="caption" color="textSecondary" align="center">
                {listing.unit?.trim() || t('detail.quintal')}
              </Text>
            </View>
          </View>

          {/* ── Quality Assured banner ─────────────────── */}
          {isVerified ? (
            <View style={styles.qualityBanner}>
              <ShieldCheck
                size={theme.sizing.iconLg}
                color={theme.colors.success}
              />
              <View style={styles.qualityText}>
                {/* "Quality Assured" in green per Design 1 */}
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.success }}
                >
                  {t('detail.qualityAssured')}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {t('detail.qualityAssuredDesc')}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ── About this product ─────────────────────── */}
          {description ? (
            <>
              <View style={styles.sectionDivider} />
              <AccordionSection
                icon={FileText}
                title={t('detail.description')}
                expanded={expanded.has('description')}
                onToggle={() => toggleSection('description')}
              >
                <Text variant="body" color="textSecondary">
                  {description}
                </Text>
              </AccordionSection>
            </>
          ) : null}

          {/* ── Product Details ────────────────────────── */}
          {attrs.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
              <AccordionSection
                icon={Package}
                title={t('detail.details')}
                expanded={expanded.has('details')}
                onToggle={() => toggleSection('details')}
              >
                {attrs.map((attr, i) => (
                  <View
                    key={attr.key}
                    style={[
                      styles.attrRow,
                      i > 0 && styles.attrRowDivider,
                    ]}
                  >
                    <Text
                      variant="caption"
                      color="textSecondary"
                      style={styles.attrLabel}
                    >
                      {attr.label}
                    </Text>
                    <Text
                      variant="label"
                      color="textPrimary"
                      align="right"
                      style={styles.attrValue}
                    >
                      {attr.value}
                    </Text>
                  </View>
                ))}
              </AccordionSection>
            </>
          ) : null}

          {/* ── Seller Information ─────────────────────── */}
          <View style={styles.sectionDivider} />
          <AccordionSection
            icon={Store}
            title={t('detail.seller')}
            expanded={expanded.has('seller')}
            onToggle={() => toggleSection('seller')}
          >
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Store
                  size={theme.sizing.iconMd}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.sellerInfo}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {sellerName}
                </Text>
                {listing.sellerPlanKey &&
                String(listing.sellerPlanKey).toUpperCase() !== 'BASIC' ? (
                  <Badge
                    tone="warning"
                    label={String(listing.sellerPlanKey)}
                  />
                ) : null}
              </View>
              {listing.userId ? (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  label={t('detail.viewSeller')}
                  onPress={() =>
                    router.push(
                      routes.seller(
                        String(listing.userId),
                        listing.sellerName ?? undefined,
                      ),
                    )
                  }
                />
              ) : null}
            </View>
          </AccordionSection>
        </View>

        {/* ── Similar listings rail ──────────────────────── */}
        <SimilarListings
          title={t('detail.similar')}
          listings={similar}
          onListingPress={openListing}
        />

        <View style={styles.scrollPad} />
      </ScrollView>

      {/* ── Sticky footer: Chat + View Contact ────────── */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.footer}>
          <View style={styles.footerBtn}>
            <Button
              variant="outline"
              label={t('contact.chat')}
              size="lg"
              onPress={() => {}}
            />
          </View>
          <View style={styles.footerBtn}>
            <Button
              label={
                contactHidden ? t('contact.hidden') : t('contact.view')
              }
              size="lg"
              loading={revealing}
              disabled={contactHidden}
              onPress={onViewContact}
            />
          </View>
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
