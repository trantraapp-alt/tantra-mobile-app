// Presentational listing card: bordered thumbnail, name, listing-ID reference
// chip, status and price. Seller-only controls arrive through the `headerAction`
// (title row) and `priceAction` (price row) slots, so buyer-facing browse can
// reuse the card with neither slot filled. The card — not the caller — owns
// where those slots land, which is what keeps the right-hand rail quiet.
import { Image } from 'expo-image';
import { Hash, ImageOff } from 'lucide-react-native';
import { memo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { type BadgeTone, Card, PriceTag, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { AppTheme } from '@/theme';
import { formatCurrency } from '@/utils';

import { createListingCardStyles } from './ListingCard.styles';

// Props for the ListingCard component.
export interface ListingCardProps {
  // Display title (derived from form metadata upstream).
  title: string;
  // Listing reference shown directly under the title, exactly as the API
  // returns it. An empty value hides the chip rather than rendering "#".
  listingId?: string | number;
  // Spoken prefix for the id in the card's accessibility label.
  idLabel?: string;
  // Absolute image URI (already resolved); a placeholder shows when absent.
  imageUri?: string;
  // De-emphasises the photo only (never the frame) — e.g. inactive listings.
  dimImage?: boolean;
  // Asking price.
  offeredPrice?: number | null;
  // Original price, struck through when higher than the asking price.
  actualPrice?: number | null;
  // Discount percentage.
  discountPct?: number | null;
  // Currency ISO code.
  currency?: string;
  // Status text (already localized by the caller).
  statusLabel?: string;
  // Status tone; drives the dot and label colour.
  statusTone?: BadgeTone;
  // Called when the card body is pressed.
  onPress?: () => void;
  // Makes the ID chip tappable (copy to clipboard). Omit it and the chip
  // renders as a plain View, so no dead touch zone is created.
  onCopyId?: (id: string) => void;
  // Trailing slot on the title row. Expects one unfilled icon control; the card
  // applies the insets that put its glyph on the action rail.
  headerAction?: ReactNode;
  // Trailing control on the price row — the row's primary action, e.g. an
  // "Edit" button. Never shrinks: under width pressure the price wraps instead.
  priceAction?: ReactNode;
}

// Maps a badge tone to the colour shared by the status dot and its label.
function toneColor(theme: AppTheme, tone: BadgeTone): string {
  switch (tone) {
    case 'success':
      return theme.colors.success;
    case 'primary':
      return theme.colors.primary;
    case 'warning':
      return theme.colors.warning;
    case 'danger':
      return theme.colors.danger;
    default:
      return theme.colors.textSecondary;
  }
}

// Renders a single listing card.
function ListingCardComponent({
  title,
  listingId,
  idLabel,
  imageUri,
  dimImage = false,
  offeredPrice,
  actualPrice,
  discountPct,
  currency = appConstants.currencyCode,
  statusLabel,
  statusTone = 'neutral',
  onPress,
  onCopyId,
  headerAction,
  priceAction,
}: ListingCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingCardStyles);

  // The reference as shown; blank means the payload carried no id at all.
  const idText =
    listingId === undefined || listingId === null ? '' : String(listingId).trim();
  const hasId = idText !== '';
  const statusColor = toneColor(theme, statusTone);

  // One spoken sentence for the whole card, so the ID never needs its own focus.
  const accessibilityLabel = [
    title,
    hasId ? `${idLabel ?? ''} ${idText}`.trim() : null,
    statusLabel,
    offeredPrice != null ? formatCurrency(offeredPrice, currency) : null,
  ]
    .filter(Boolean)
    .join(', ');

  const idContent = (
    <>
      <Hash size={theme.sizing.iconXs} color={theme.colors.textTertiary} />
      <Text
        variant="label"
        color="textSecondary"
        numberOfLines={1}
        style={styles.idValue}
      >
        {idText}
      </Text>
    </>
  );

  return (
    <Card padded={false} radius="lg">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        disabled={!onPress}
      >
        {({ pressed }) => (
          // Visual styling lives on this inner View (a static style array)
          // rather than the Pressable's function `style`: NativeWind's
          // cssInterop wraps a function style into an array React Native never
          // invokes, which would drop the press feedback.
          <View
            style={[
              styles.content,
              pressed && onPress ? styles.contentPressed : null,
            ]}
          >
            <View style={styles.imageWrap}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.image, dimImage ? styles.imageDimmed : null]}
                  contentFit="cover"
                  transition={theme.animation.normal}
                  accessibilityLabel={title}
                />
              ) : (
                <ImageOff
                  size={theme.sizing.iconLg}
                  color={theme.colors.textTertiary}
                />
              )}
            </View>

            {/* Exactly two children — all slack collects in one place. */}
            <View style={styles.body}>
              <View style={styles.identity}>
                <View style={styles.titleRow}>
                  <Text variant="h4" numberOfLines={1} style={styles.title}>
                    {title}
                  </Text>
                  {headerAction ? (
                    <View style={styles.headerActionSlot}>{headerAction}</View>
                  ) : null}
                </View>

                {hasId || statusLabel ? (
                  <View style={styles.metaRow}>
                    {hasId ? (
                      onCopyId ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${idLabel ?? ''} ${idText}`.trim()}
                          onPress={() => onCopyId(idText)}
                          // Asymmetric: zero top slop, so the chip can never
                          // swallow taps aimed at the name just above it.
                          hitSlop={{
                            top: 0,
                            bottom: theme.sizing.hitSlop,
                            left: theme.sizing.hitSlop,
                            right: theme.sizing.hitSlop,
                          }}
                          style={styles.idChip}
                        >
                          {idContent}
                        </Pressable>
                      ) : (
                        <View style={styles.idChip}>{idContent}</View>
                      )
                    ) : null}

                    {statusLabel ? (
                      <View style={styles.statusGroup}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text
                          variant="label"
                          numberOfLines={1}
                          style={{ color: statusColor }}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <View style={styles.valueRow}>
                <View style={styles.priceWrap}>
                  {offeredPrice != null ? (
                    <PriceTag
                      size="sm"
                      price={offeredPrice}
                      compareAtPrice={actualPrice ?? undefined}
                      discountPercentage={discountPct ?? undefined}
                      currency={currency}
                    />
                  ) : (
                    <Text variant="bodyMedium" color="textTertiary">
                      —
                    </Text>
                  )}
                </View>
                {priceAction ? (
                  <View style={styles.priceActionSlot}>{priceAction}</View>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

// Memoized presentational listing card.
export const ListingCard = memo(ListingCardComponent);
