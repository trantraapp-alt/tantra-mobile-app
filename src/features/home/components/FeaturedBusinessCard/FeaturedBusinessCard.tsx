// Compact card for a featured business profile: a wide cover photo (or a
// tinted fallback header) with an optional premium ribbon, then the business
// name with a verified check, its profile-type label and locality.
import { Image } from 'expo-image';
import { BadgeCheck, Star, Store } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { FeaturedBusiness } from '../../types';
import {
  businessImage,
  businessLocationLabel,
  highlightColorOf,
  sellerBadgeText,
} from '../../utils/feedListing';
import { createFeaturedBusinessCardStyles } from './FeaturedBusinessCard.styles';

// Props for the FeaturedBusinessCard component.
export interface FeaturedBusinessCardProps {
  // The business profile to render.
  business: FeaturedBusiness;
  // Fixed card width (points) for a horizontal row.
  width?: number;
  // Called with the business when the card is pressed.
  onPress?: (business: FeaturedBusiness) => void;
}

// Renders a single featured-business card.
function FeaturedBusinessCardComponent({
  business,
  width,
  onPress,
}: FeaturedBusinessCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFeaturedBusinessCardStyles);
  const { t, language } = useTranslation();

  const cover = businessImage(business);
  const name = business.businessName?.trim() || t('home.business.fallback');
  const typeLabel =
    business.profileTypeLabel == null
      ? ''
      : typeof business.profileTypeLabel === 'string'
        ? business.profileTypeLabel
        : localize(business.profileTypeLabel, language);
  const location = businessLocationLabel(business, language);
  const premiumColor = highlightColorOf(business);
  const badge = sellerBadgeText(business.badge, language);
  const verified = Boolean(premiumColor || business.planKey);

  return (
    <Card
      padded={false}
      radius="lg"
      style={[
        styles.clip,
        width != null ? { width } : null,
        premiumColor ? { borderColor: premiumColor, borderWidth: 1.5 } : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[name, badge, location].filter(Boolean).join(', ')}
        onPress={onPress ? () => onPress(business) : undefined}
        disabled={!onPress}
      >
        {({ pressed }) => (
          <View style={pressed && onPress ? styles.pressed : null}>
            <View style={styles.cover}>
              {cover ? (
                <Image
                  source={{ uri: cover }}
                  style={styles.coverImage}
                  contentFit="cover"
                  transition={theme.animation.normal}
                  accessibilityLabel={name}
                />
              ) : (
                <Store size={theme.sizing.iconXl} color={theme.colors.primary} />
              )}
              {premiumColor && badge ? (
                <View
                  style={[
                    styles.premiumRibbon,
                    { backgroundColor: premiumColor },
                  ]}
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
            </View>

            <View style={styles.body}>
              <View style={styles.nameRow}>
                <Text variant="h4" numberOfLines={1} style={styles.name}>
                  {name}
                </Text>
                {verified ? (
                  <BadgeCheck
                    size={theme.sizing.iconSm}
                    color={theme.colors.primary}
                  />
                ) : null}
              </View>
              {typeLabel ? (
                <Text variant="caption" color="textSecondary" numberOfLines={1}>
                  {typeLabel}
                </Text>
              ) : null}
              {location ? (
                <View style={styles.locationRow}>
                  <Store
                    size={theme.sizing.iconXs}
                    color={theme.colors.textTertiary}
                  />
                  <Text
                    variant="caption"
                    color="textSecondary"
                    numberOfLines={1}
                    style={styles.locationText}
                  >
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </Pressable>
    </Card>
  );
}

// Memoized featured-business card.
export const FeaturedBusinessCard = memo(FeaturedBusinessCardComponent);
