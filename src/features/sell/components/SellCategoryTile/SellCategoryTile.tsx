// A category card in the module's "Choose a category" grid: the category's
// emoji mark on a white disc, its name in the category's own accent, a one
// line blurb, and a round arrow affording the tap.
//
// Two shapes, one card. `wide` spans the full grid width and lays the mark,
// text and arrow out on a single row — used for the odd category left over
// when the grid can't pair it, so the grid never ends on a ragged half row.
// The wide card's arrow is a soft tinted chip rather than the stacked card's
// solid one, which would shout at that size.
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import {
  getAccentColors,
  getCategoryBlurbKey,
  getCategoryImageSource,
  getCategoryName,
  getCategoryVisual,
} from '../../utils';
import { createSellCategoryTileStyles } from './SellCategoryTile.styles';

// Props for the SellCategoryTile component.
export interface SellCategoryTileProps {
  // Category to display.
  category: ModuleCategory;
  // Active app language controlling the label.
  language: PreferredLanguage;
  // Whether the card spans the full grid width (single-row layout).
  wide?: boolean;
  // Called with the category when the card is pressed.
  onPress: (category: ModuleCategory) => void;
}

// Renders one category card.
function SellCategoryTileComponent({
  category,
  language,
  wide = false,
  onPress,
}: SellCategoryTileProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryTileStyles);
  const { t } = useTranslation();

  const name = getCategoryName(category, language);
  const visual = getCategoryVisual(category.categoryKey);
  const colors = getAccentColors(theme, visual.accent);
  const imageSource = getCategoryImageSource(category.categoryKey);
  const blurb = t(getCategoryBlurbKey(category.categoryKey));

  // Emits the category when pressed.
  const handlePress = useCallback(
    () => onPress(category),
    [onPress, category],
  );

  // The category's mark on its white disc.
  const mark = (
    <View style={styles.markDisc}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.markImage}
          contentFit="contain"
          transition={theme.animation.normal}
          accessibilityLabel={name}
        />
      ) : (
        <Text style={styles.markEmoji}>{visual.emoji}</Text>
      )}
    </View>
  );

  // The name in the category's accent over its blurb.
  const label = (
    <View style={styles.labels}>
      <Text variant="h4" numberOfLines={1} style={{ color: colors.strong }}>
        {name}
      </Text>
      {/* The blurbs carry their own line break (see the sell blurb strings),
          so the third line is only a safety valve for a longer translation. */}
      <Text variant="caption" color="textSecondary" numberOfLines={3}>
        {blurb}
      </Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityHint={blurb}
      onPress={handlePress}
      style={wide ? styles.slotWide : styles.slot}
    >
      {({ pressed }) => (
        // Styling lives on this inner View (a static array), not the
        // Pressable's function `style`, which NativeWind's cssInterop would
        // drop along with the card's tint.
        <View
          style={[
            styles.card,
            wide ? styles.cardWide : null,
            { backgroundColor: colors.surface },
            pressed ? styles.pressed : null,
          ]}
        >
          {mark}
          {label}
          {wide ? (
            <View style={[styles.arrowWide, { backgroundColor: colors.soft }]}>
              <ArrowRight size={theme.sizing.iconSm} color={colors.strong} />
            </View>
          ) : (
            <View style={[styles.arrow, { backgroundColor: colors.solid }]}>
              <ArrowRight
                size={theme.sizing.iconSm}
                color={theme.colors.onPrimary}
              />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// Memoized category card.
export const SellCategoryTile = memo(SellCategoryTileComponent);
