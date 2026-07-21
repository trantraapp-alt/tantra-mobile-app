// Presentational listing card: thumbnail, status badge, title, optional
// subtitle and price. Purely visual — the caller supplies an optional `footer`
// (e.g. seller actions). Reusable across My Listings, category browse, search.
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { memo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, type BadgeTone, Card, PriceTag, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createListingCardStyles } from './ListingCard.styles';

// Props for the ListingCard component.
export interface ListingCardProps {
  // Display title.
  title: string;
  // Absolute image URI (already resolved); a placeholder shows when absent.
  imageUri?: string;
  // Secondary line under the title (e.g. category or quantity).
  subtitle?: string;
  // Asking price.
  offeredPrice?: number | null;
  // Original price, struck through when higher than the asking price.
  actualPrice?: number | null;
  // Discount percentage badge.
  discountPct?: number | null;
  // Currency ISO code.
  currency?: string;
  // Status pill label.
  statusLabel?: string;
  // Status pill tone.
  statusTone?: BadgeTone;
  // Called when the card body is pressed.
  onPress?: () => void;
  // Optional actions rendered in a footer below the content.
  footer?: ReactNode;
}

// Renders a single listing card.
function ListingCardComponent({
  title,
  imageUri,
  subtitle,
  offeredPrice,
  actualPrice,
  discountPct,
  currency = appConstants.currencyCode,
  statusLabel,
  statusTone = 'neutral',
  onPress,
  footer,
}: ListingCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingCardStyles);

  return (
    <Card padded={false} radius="lg">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        disabled={!onPress}
        style={styles.content}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={theme.animation.normal}
            accessibilityLabel={title}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <ImageOff
              size={theme.sizing.iconLg}
              color={theme.colors.textTertiary}
            />
          </View>
        )}

        <View style={styles.body}>
          {statusLabel ? (
            <View style={styles.headerRow}>
              <Badge label={statusLabel} tone={statusTone} />
            </View>
          ) : null}
          <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {offeredPrice != null ? (
            <PriceTag
              price={offeredPrice}
              compareAtPrice={actualPrice ?? undefined}
              discountPercentage={discountPct ?? undefined}
              currency={currency}
            />
          ) : null}
        </View>
      </Pressable>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

// Memoized presentational listing card.
export const ListingCard = memo(ListingCardComponent);
