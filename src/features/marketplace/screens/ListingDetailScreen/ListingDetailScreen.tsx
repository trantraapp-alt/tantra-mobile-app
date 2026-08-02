// Buyer-facing listing detail: photo gallery, engagement stats, price, tags,
// location, dynamic attributes, seller card and a similar-listings rail, over a
// sticky "View Contact" CTA that runs the OLX-style contact reveal.
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BadgeCheck,
  Clock,
  Eye,
  MapPin,
  Package,
  Store,
  Users,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/buttons';
import { ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Badge, type BadgeTone, ImageCarousel, PriceTag, Screen, Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { ListingRow } from '@/features/home';
import { feedLocationLabel, resolveFeedTitle } from '@/features/home/utils/feedListing';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';

import { marketplaceApi } from '../../api';
import { ContactModal } from '../../components';
import { useListingDetail } from '../../hooks';
import type { ContactRevealResult } from '../../types';
import { createListingDetailStyles } from './ListingDetailScreen.styles';

// A short relative-time label from an ISO timestamp ('now' is a sentinel the
// caller localizes).
function relativeTime(iso: string | undefined): string {
  if (!iso) {
    return '';
  }
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) {
    return '';
  }
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) {
    return 'now';
  }
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

// Renders the buyer listing-detail screen.
export function MarketplaceListingDetailScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createListingDetailStyles);
  const { t, language } = useTranslation();
  const router = useRouter();
  const { showError } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const listingId = params.id?.trim() ?? '';

  const { listing, similar, isLoading, isError, reload } =
    useListingDetail(listingId);

  const [contact, setContact] = useState<ContactRevealResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [revealing, setRevealing] = useState(false);

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
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  const onViewContact = useCallback(async () => {
    if (!listingId) {
      return;
    }
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

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }
    if (isError || !listing) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={reload} retryLabel={t('common.retry')} />
        </View>
      );
    }

    const title =
      listing.listingTitle?.trim() ||
      resolveFeedTitle(listing, language, t('home.listingFallback'));
    const locality = feedLocationLabel(listing.address);
    const agoRaw = relativeTime(listing.createdAt);
    const ago = agoRaw === 'now' ? t('detail.justNow') : agoRaw;
    const type = String(listing.listingType ?? '').toUpperCase();
    const typeTone: BadgeTone = type === 'RENT' ? 'warning' : 'success';
    const discount =
      listing.discountPct != null && listing.discountPct > 0
        ? Math.round(listing.discountPct)
        : undefined;
    const quantityLabel =
      listing.quantity != null
        ? `${listing.quantity} ${listing.unit ?? ''}`.trim()
        : '—';
    const attrs = Object.entries(listing.attributes ?? {})
      .filter(([, v]) => v != null && typeof v !== 'object' && String(v) !== '')
      .slice(0, 12);
    const contactHidden = listing.showContact === false;

    return (
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ImageCarousel images={heroImages} aspectRatio={4 / 3} />

          {/* Engagement stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Eye size={theme.sizing.iconXs} color={theme.colors.primary} />
              <Text variant="caption" color="textSecondary">
                {listing.viewCount ?? 0} {t('detail.views')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Users size={theme.sizing.iconXs} color={theme.colors.primary} />
              <Text variant="caption" color="textSecondary">
                {listing.contactRevealCount ?? 0} {t('detail.contacts')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Package
                size={theme.sizing.iconXs}
                color={theme.colors.primary}
              />
              <Text variant="caption" color="textSecondary">
                {quantityLabel}
              </Text>
            </View>
          </View>

          {/* Price + title + tags + meta */}
          <View style={styles.section}>
            <View style={styles.priceRow}>
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
            </View>

            <View style={styles.titleRow}>
              <Text variant="h4" numberOfLines={2} style={styles.title}>
                {title}
              </Text>
              {listing.sellerVerified ? (
                <BadgeCheck
                  size={theme.sizing.iconSm}
                  color={theme.colors.info}
                />
              ) : null}
            </View>

            <View style={styles.tagsRow}>
              {type ? <Badge tone={typeTone} label={type} /> : null}
              {listing.isNegotiable ? (
                <Badge tone="neutral" label={t('home.tagNegotiable')} />
              ) : null}
            </View>

            <View style={styles.metaRow}>
              {locality ? (
                <View style={styles.metaItem}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text variant="caption" color="textSecondary">
                    {locality}
                  </Text>
                </View>
              ) : null}
              {ago ? (
                <View style={styles.metaItem}>
                  <Clock
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text variant="caption" color="textSecondary">
                    {ago}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Attributes */}
          {attrs.length > 0 ? (
            <View style={[styles.section, styles.sectionBordered]}>
              <Text
                variant="overline"
                color="textSecondary"
                style={styles.sectionTitle}
              >
                {t('detail.details')}
              </Text>
              <View style={styles.attrsGrid}>
                {attrs.map(([key, value]) => (
                  <View key={key} style={styles.attrItem}>
                    <Text variant="overline" color="textTertiary">
                      {key}
                    </Text>
                    <Text variant="label" numberOfLines={2}>
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Seller */}
          <View style={[styles.section, styles.sectionBordered]}>
            <Text
              variant="overline"
              color="textSecondary"
              style={styles.sectionTitle}
            >
              {t('detail.seller')}
            </Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Store
                  size={theme.sizing.iconMd}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.sellerInfo}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {listing.sellerName?.trim() || t('detail.sellerFallback')}
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
          </View>

          {/* Similar */}
          {similar.length > 0 ? (
            <View style={styles.sectionBordered}>
              <ListingRow
                title={t('detail.similar')}
                listings={similar}
                onListingPress={openListing}
              />
            </View>
          ) : null}
        </ScrollView>

        {/* Sticky contact CTA */}
        <View style={styles.cta}>
          <View style={styles.ctaContact}>
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
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Header
        title={t('detail.title')}
        showBack
        onBack={() => router.back()}
      />
      {renderBody()}
      <ContactModal
        visible={modalVisible}
        contact={contact}
        onClose={() => setModalVisible(false)}
      />
    </Screen>
  );
}
