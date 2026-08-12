// Marketplace listing card matching the product design: a photo with a discount
// pill and a wishlist heart, a wave (traced in the module accent color) curving
// the photo into the body, then the title + distance badge, a short description,
// the hero price, the address, a quantity + negotiability row, and a seller
// trust row. Presentational — every value comes from the listing data.
import { Image } from 'expo-image';
import {
  Heart,
  ImageOff,
  MapPin,
  Package,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Card, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import type { FeedListing } from '@/features/home/types';
import {
  feedDescription,
  firstFeedImage,
  formatDistanceKm,
  isSold,
  resolveFeedTitle,
} from '@/features/home/utils/feedListing';
import { getCategoryVisual, localize, type LocalizedText } from '@/features/sell';
import { useSavedListing } from '@/features/wishlist/hooks/useSavedListing';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { formatCurrency } from '@/utils';

import { useUserGeo } from '../../hooks';
import {
  createListingCardStyles,
  LISTING_CARD_WAVE_HEIGHT,
} from './ListingCard.styles';

// Feature-local strings kept out of the global i18n catalog.
const NO_DESCRIPTION: LocalizedText = {
  en: 'Description - NA',
  hi: 'विवरण नहीं है',
};
const VERIFIED: LocalizedText = { en: 'Verified Seller', hi: 'सत्यापित विक्रेता' };
const UNVERIFIED: LocalizedText = {
  en: 'Not Verified',
  hi: 'सत्यापित नहीं',
};

// Parses a stored coordinate (string or number) to a finite number, or null.
function parseCoord(value: string | number | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// Great-circle distance (km) between two lat/lng points (haversine).
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Props for the ListingCard component.
export interface ListingCardProps {
  // The listing to render.
  listing: FeedListing;
  // Fixed width (points) for a horizontal rail (e.g. similar listings). Omit to
  // flex to the grid cell's width.
  width?: number;
  // Called with the listing when the card is pressed.
  onPress?: (listing: FeedListing) => void;
}

// Renders a single marketplace listing card.
function ListingCardComponent({ listing, width, onPress }: ListingCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingCardStyles);
  const { t, language } = useTranslation();
  const geo = useUserGeo();
  const { saved, toggle: toggleSaved } = useSavedListing(listing.listingId);

  const currency = appConstants.currencyCode;
  const imageUri = firstFeedImage(listing);
  const title = resolveFeedTitle(listing, language, t('home.listingFallback'));
  const description = feedDescription(listing);
  const sold = isSold(listing);

  // Module / category accent color (crop = green, seed = blue, equipment =
  // violet…) so each listing carries its module's color instead of a flat
  // orange.
  const categoryKey =
    typeof listing.categoryName === 'string'
      ? listing.categoryName
      : listing.categoryName
        ? localize(listing.categoryName, language)
        : '';
  const accentColor =
    theme.colors[getCategoryVisual(categoryKey || title).accent];
  // The wave always carries Tantra's brand gradient (violet → orange), stable
  // across cards; a per-listing id avoids gradient id collisions in the grid.
  const waveGradientId = `lc-wave-${listing.listingId || 'x'}`;

  const discount =
    listing.discountPct != null && listing.discountPct > 0
      ? Math.round(listing.discountPct)
      : null;

  // Price context.
  const hasPrice = listing.offeredPrice != null;
  const hasCompare =
    listing.offeredPrice != null &&
    listing.actualPrice != null &&
    listing.actualPrice > listing.offeredPrice;

  // Distance shown below the description: prefer the server value, else compute
  // it from the address coordinates and the user's location (haversine).
  const listingLat = parseCoord(listing.address?.latitude);
  const listingLng = parseCoord(listing.address?.longitude);
  const distanceKm =
    listing.distanceKm != null
      ? listing.distanceKm
      : geo && listingLat != null && listingLng != null
        ? haversineKm(geo.lat, geo.lng, listingLat, listingLng)
        : null;
  const distance = formatDistanceKm(distanceKm);

  // Attribute chips: quantity, then organic / a labelled attribute.
  const quantityLabel =
    listing.quantity != null
      ? `${listing.quantity}${listing.unit ? ` ${listing.unit}` : ''}`
      : null;

  // Negotiability + seller trust.
  const negotiable = listing.isNegotiable === true;
  const sellerName = listing.sellerName?.trim();
  const verified = listing.sellerVerified === true;
  const sellerLabel =
    sellerName && sellerName !== ''
      ? sellerName
      : localize(verified ? VERIFIED : UNVERIFIED, language);
  const ShieldIcon = verified ? ShieldCheck : ShieldAlert;

  return (
    <Card
      padded={false}
      radius="xl"
      style={[styles.card, width != null ? { width } : null]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[title, distance].filter(Boolean).join(', ')}
        onPress={onPress ? () => onPress(listing) : undefined}
        disabled={!onPress}
      >
        {({ pressed }) => (
          <View style={pressed && onPress ? styles.pressed : null}>
            <View style={styles.imageWrap}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                  transition={theme.animation.normal}
                  accessibilityLabel={title}
                />
              ) : (
                <ImageOff
                  size={theme.sizing.iconXl}
                  color={theme.colors.textTertiary}
                />
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('tab.wishlist')}
                onPress={toggleSaved}
                style={styles.heartButton}
              >
                <Heart
                  size={18}
                  color={saved ? theme.colors.danger : theme.colors.textPrimary}
                  fill={saved ? theme.colors.danger : 'none'}
                />
              </Pressable>

              {/* White wave bridging the photo into the body, traced with an
                  orange line along its crest. */}
              <Svg
                width="100%"
                height={LISTING_CARD_WAVE_HEIGHT}
                viewBox="0 0 400 40"
                preserveAspectRatio="none"
                style={styles.wave}
              >
                <Defs>
                  <LinearGradient
                    id={waveGradientId}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <Stop offset="0" stopColor={theme.colors.primary} />
                    <Stop offset="1" stopColor={theme.colors.secondary} />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M0 16 C 60 0 130 0 200 14 C 270 28 340 32 400 12 L 400 40 L 0 40 Z"
                  fill={theme.colors.card}
                />
                <Path
                  d="M0 16 C 60 0 130 0 200 14 C 270 28 340 32 400 12 L 400 13.5 C 340 33.5 270 31 200 18 C 130 4 60 5 0 22 Z"
                  fill={`url(#${waveGradientId})`}
                />
              </Svg>

              {discount != null ? (
                <View style={styles.discountBadge}>
                  <Text variant="overline" color="onPrimary">
                    {t('common.percentOff', { value: discount }).toUpperCase()}
                  </Text>
                </View>
              ) : null}

              {sold ? (
                <View style={styles.soldOverlay}>
                  <View style={styles.soldStamp}>
                    <Text variant="h4" color="onPrimary">
                      {t('home.sold')}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.body}>
              <Text variant="h4" numberOfLines={1}>
                {title}
              </Text>

              <Text
                variant="caption"
                color="textSecondary"
                numberOfLines={1}
                style={styles.description}
              >
                {description ?? localize(NO_DESCRIPTION, language)}
              </Text>

              <View style={styles.metaRow}>
                {distance ? (
                  <>
                    <MapPin size={theme.sizing.iconXs} color={accentColor} />
                    <Text
                      variant="caption"
                      color="textSecondary"
                      numberOfLines={1}
                      style={styles.metaText}
                    >
                      {distance}
                    </Text>
                  </>
                ) : null}
              </View>

              <View style={styles.priceRow}>
                {hasPrice ? (
                  <>
                    <Text variant="h4" color="success">
                      {formatCurrency(listing.offeredPrice ?? 0, currency)}
                    </Text>
                    {hasCompare ? (
                      <Text
                        variant="bodyMedium"
                        color="textTertiary"
                        style={styles.compareAt}
                      >
                        {formatCurrency(listing.actualPrice ?? 0, currency)}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text variant="bodyMedium" color="textTertiary">
                    {t('home.askPrice')}
                  </Text>
                )}
              </View>

              <View style={styles.chipsRow}>
                {quantityLabel ? (
                  <View style={styles.chip}>
                    <Package size={theme.sizing.iconXs} color={accentColor} />
                    <Text variant="label" color="textPrimary" numberOfLines={1}>
                      {quantityLabel}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.negotiablePill,
                    {
                      backgroundColor: negotiable
                        ? theme.colors.success
                        : theme.colors.danger,
                    },
                  ]}
                >
                  <Text
                    variant="overline"
                    color="onPrimary"
                    numberOfLines={1}
                    style={styles.negotiablePillText}
                  >
                    {negotiable
                      ? t('home.tagNegotiable')
                      : t('home.tagNotNegotiable')}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.sellerRow}>
                <View style={styles.avatar}>
                  <UserRound size={16} color={theme.colors.textTertiary} />
                </View>
                <Text
                  variant="caption"
                  color="textSecondary"
                  numberOfLines={1}
                  style={styles.sellerName}
                >
                  {sellerLabel}
                </Text>
                <ShieldIcon
                  size={18}
                  color={
                    verified ? theme.colors.success : theme.colors.danger
                  }
                />
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

// Memoized full-width listing card.
export const ListingCard = memo(ListingCardComponent);
