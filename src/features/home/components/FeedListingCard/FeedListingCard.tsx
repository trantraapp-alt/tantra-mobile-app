// Flipkart / OLX-style grid tile for the marketplace feed: a square photo with a
// discount pill, a premium ribbon and a SOLD stamp layered over it, then a hero
// price, title, a short description, a locality + distance line, and small Rent /
// Negotiable tags. Two per row in a grid (omit `width`) or fixed-width in a
// horizontal rail (pass `width`). Presentational — every value comes from data.
import { Image } from 'expo-image';
import { ImageOff, MapPin, Star } from 'lucide-react-native';
import { memo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Card, PriceTag, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { FeedListing } from '../../types';
import {
  feedDescription,
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
  // Optional action row rendered at the bottom of the card (e.g. the owner
  // Edit / Action buttons on My Listings). It sits outside the card's pressable
  // so its own buttons handle taps.
  footer?: ReactNode;
  // Optional status pill shown at the top-right of the photo (the owner's
  // Active / Inactive status on My Listings). Rendered as a corner pill that
  // mirrors the top-left discount pill so the two align. Buyer feed passes none.
  statusBadge?: { label: string; tone: 'success' | 'danger' };
}

// Renders a single home-feed listing tile.
function FeedListingCardComponent({
  listing,
  width,
  onPress,
  footer,
  statusBadge,
}: FeedListingCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFeedListingCardStyles);
  const { t, language } = useTranslation();

  const imageUri = firstFeedImage(listing);
  const title = resolveFeedTitle(listing, language, t('home.listingFallback'));
  const description = feedDescription(listing);
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
  // Distance now sits under the price; the meta row shows only the locality.
  const metaText = locality;

  const widthStyle = width != null ? { width } : styles.flex;

  return (
    <Card
      padded={false}
      radius="lg"
      style={[
        styles.card,
        widthStyle,
        premiumColor ? { borderColor: premiumColor, borderWidth: 1.5 } : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[title, badge, distance].filter(Boolean).join(', ')}
        onPress={onPress ? () => onPress(listing) : undefined}
        disabled={!onPress}
      >
        {({ pressed }) => (
          // Visual styling lives on this inner View (a static style), not the
          // Pressable's function `style` — NativeWind's cssInterop would
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

              {statusBadge ? (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusBadge.tone === 'success'
                          ? theme.colors.success
                          : theme.colors.danger,
                    },
                  ]}
                >
                  <Text variant="overline" color="onPrimary">
                    {statusBadge.label}
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
              {listing.offeredPrice != null ? (
                <PriceTag
                  size="md"
                  price={listing.offeredPrice}
                  compareAtPrice={listing.actualPrice ?? undefined}
                  currency={appConstants.currencyCode}
                />
              ) : (
                <Text variant="bodyMedium" color="textTertiary">
                  {t('home.askPrice')}
                </Text>
              )}

              {distance ? (
                <View style={styles.distancePill}>
                  <MapPin
                    size={theme.sizing.iconXxs}
                    color={theme.colors.danger}
                  />
                  <Text variant="overline" color="textSecondary">
                    {distance}
                  </Text>
                </View>
              ) : null}

              <Text variant="bodyMedium" numberOfLines={1} style={styles.title}>
                {title}
              </Text>

              <Text
                variant="caption"
                color="textSecondary"
                numberOfLines={2}
                style={styles.description}
              >
                {description ?? ''}
              </Text>

              {metaText ? (
                <View style={styles.metaRow}>
                  <MapPin
                    size={theme.sizing.iconXs}
                    color={theme.colors.danger}
                  />
                  <Text
                    variant="caption"
                    color="textTertiary"
                    numberOfLines={1}
                    style={styles.metaText}
                  >
                    {metaText}
                  </Text>
                </View>
              ) : null}

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
            </View>
          </View>
        )}
      </Pressable>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

// Memoized home-feed listing card.
export const FeedListingCard = memo(FeedListingCardComponent);
