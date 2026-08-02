// Poster-style marketplace card for the home feed: a square photo with a
// discount pill, a premium ribbon, a distance chip and a SOLD stamp layered
// over it, then price, title, locality and small Rent / Negotiable tags. Works
// both in a fixed-width horizontal row (pass `width`) and in a flexing grid
// cell (omit it). Presentational — every value is derived by the caller's data.
import { Image } from 'expo-image';
import { ImageOff, MapPin, Star } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Card, PriceTag, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { FeedListing } from '../../types';
import {
  feedLocationLabel,
  firstFeedImage,
  formatDistanceKm,
  highlightColorOf,
  isSold,
  resolveFeedTitle,
  sellerBadgeText,
} from '../../utils/feedListing';
import { createFeedListingCardStyles } from './FeedListingCard.styles';

// Props for the FeedListingCard component.
export interface FeedListingCardProps {
  // The listing to render.
  listing: FeedListing;
  // Fixed card width (points) for a horizontal row. Omit to flex in a grid.
  width?: number;
  // Called with the listing when the card is pressed.
  onPress?: (listing: FeedListing) => void;
}

// Renders a single home-feed listing tile.
function FeedListingCardComponent({
  listing,
  width,
  onPress,
}: FeedListingCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFeedListingCardStyles);
  const { t, language } = useTranslation();

  const imageUri = firstFeedImage(listing);
  const title = resolveFeedTitle(listing, language, t('home.listingFallback'));
  const locality = feedLocationLabel(listing.address);
  const distance = formatDistanceKm(listing.distanceKm);
  const premiumColor = highlightColorOf(listing);
  const badge = sellerBadgeText(listing.sellerBadge, language);
  const sold = isSold(listing);
  const discount =
    listing.discountPct != null && listing.discountPct > 0
      ? Math.round(listing.discountPct)
      : null;

  const type = String(listing.listingType ?? '').toUpperCase();
  const isRent = type === 'RENT' || type === 'BOTH';
  const quantityLabel =
    listing.quantity != null && listing.unit
      ? `${listing.quantity} ${listing.unit}`
      : null;

  const widthStyle = width != null ? { width } : styles.flex;

  return (
    <Card
      padded={false}
      radius="lg"
      style={[
        styles.clip,
        widthStyle,
        premiumColor
          ? { borderColor: premiumColor, borderWidth: 1.5 }
          : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[title, badge, distance].filter(Boolean).join(', ')}
        onPress={onPress ? () => onPress(listing) : undefined}
        disabled={!onPress}
      >
        {({ pressed }) => (
          // Visual styling lives on this inner View (a static style array), not
          // the Pressable's function `style` — NativeWind's cssInterop would
          // otherwise drop it, taking the press feedback with it.
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

              {discount != null ? (
                <View style={styles.discountBadge}>
                  <Text variant="overline" color="onPrimary">
                    {t('common.percentOff', { value: discount })}
                  </Text>
                </View>
              ) : null}

              {premiumColor && badge ? (
                <View
                  style={[styles.premiumRibbon, { backgroundColor: premiumColor }]}
                >
                  <Star
                    size={theme.sizing.iconXxs}
                    color={theme.colors.onPrimary}
                    fill={theme.colors.onPrimary}
                  />
                  <Text variant="overline" color="onPrimary" numberOfLines={1}>
                    {badge}
                  </Text>
                </View>
              ) : null}

              {distance && !sold ? (
                <View style={styles.distanceChip}>
                  <MapPin
                    size={theme.sizing.iconXxs}
                    color={theme.colors.onPrimary}
                  />
                  <Text variant="overline" color="onPrimary">
                    {distance}
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
              <View style={styles.priceRow}>
                {listing.offeredPrice != null ? (
                  <PriceTag
                    size="sm"
                    price={listing.offeredPrice}
                    compareAtPrice={listing.actualPrice ?? undefined}
                    discountPercentage={discount ?? undefined}
                    currency={appConstants.currencyCode}
                  />
                ) : (
                  <Text variant="bodyMedium" color="textTertiary">
                    {t('home.askPrice')}
                  </Text>
                )}
                {quantityLabel ? (
                  <Text
                    variant="caption"
                    color="textTertiary"
                    style={styles.quantity}
                    numberOfLines={1}
                  >
                    {quantityLabel}
                  </Text>
                ) : null}
              </View>

              <Text variant="bodyMedium" numberOfLines={1}>
                {title}
              </Text>

              {locality ? (
                <View style={styles.locationRow}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text
                    variant="caption"
                    color="textSecondary"
                    numberOfLines={1}
                    style={styles.locationText}
                  >
                    {locality}
                  </Text>
                </View>
              ) : null}

              {isRent || listing.isNegotiable ? (
                <View style={styles.tagsRow}>
                  {isRent ? (
                    <View style={[styles.tag, styles.tagRent]}>
                      <Text variant="overline" color="primary">
                        {t('home.tagRent')}
                      </Text>
                    </View>
                  ) : null}
                  {listing.isNegotiable ? (
                    <View style={[styles.tag, styles.tagNegotiable]}>
                      <Text variant="overline" color="textSecondary">
                        {t('home.tagNegotiable')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

// Memoized home-feed listing card.
export const FeedListingCard = memo(FeedListingCardComponent);
