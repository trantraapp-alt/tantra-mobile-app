// The module's top-level categories as a row of selectable cards — the first
// choice on a module screen ("Agriculture Marketplace" vs "Agriculture
// Services" vs "Repair & Maintenance"). The selected card takes the module's
// accent and an underline, so the row reads as tabs driving the content below.
//
// The row fits its cards to the screen while it can. That bounded width is
// what lets a two-word category name wrap onto a second line instead of being
// truncated: inside a horizontal scroll the cards would size to their longest
// line and run off the edge. Past the fitting limit the cards take a fixed
// width and the row scrolls, since squeezing more than a few makes the labels
// unreadable.
//
// Each card is marked with the category's emoji glyph (see `categoryVisuals`),
// which is what the design calls for; a category with a registered local image
// uses that instead.
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import {
  type AccentKey,
  getAccentColors,
  getCategoryImageSource,
  getCategoryName,
  getCategoryVisual,
} from '../../utils';
import { createSellModuleTabsStyles } from './SellModuleTabs.styles';

// How many cards share the row's width before it starts scrolling instead.
const FITTED_LIMIT = 3;

// Props for the SellModuleTabs component.
export interface SellModuleTabsProps {
  // Top-level categories to offer, in display order.
  categories: ModuleCategory[];
  // Currently selected category id, if any.
  selectedId: number | null;
  // Active app language controlling labels.
  language: PreferredLanguage;
  // Accent used for the selected card (the owning module's colour).
  accent?: AccentKey;
  // Called with the category when a card is selected.
  onSelect: (category: ModuleCategory) => void;
}

// Renders the selectable top-category card row.
function SellModuleTabsComponent({
  categories,
  selectedId,
  language,
  accent = 'primary',
  onSelect,
}: SellModuleTabsProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellModuleTabsStyles);
  const colors = getAccentColors(theme, accent);
  const fitted = categories.length <= FITTED_LIMIT;

  const cards = categories.map((category) => {
    const selected = category.id === selectedId;
    const name = getCategoryName(category, language);
    const imageSource = getCategoryImageSource(category.categoryKey);
    const visual = getCategoryVisual(category.categoryKey);

    return (
      <Pressable
        key={category.id}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={name}
        onPress={() => onSelect(category)}
        style={fitted ? styles.slot : styles.slotFixed}
      >
        {({ pressed }) => (
          // Styling lives on this inner View (a static array), not the
          // Pressable's function `style`, which NativeWind's cssInterop
          // would drop along with the card's background and border.
          <View
            style={[
              styles.card,
              selected
                ? { backgroundColor: colors.surface, borderColor: colors.soft }
                : null,
              pressed ? styles.pressed : null,
            ]}
          >
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.image}
                contentFit="contain"
                transition={theme.animation.normal}
                accessibilityLabel={name}
              />
            ) : (
              <Text style={styles.emoji}>{visual.emoji}</Text>
            )}

            <Text
              variant="label"
              align="center"
              numberOfLines={2}
              color={selected ? 'textPrimary' : 'textSecondary'}
              style={selected ? { color: colors.strong } : undefined}
            >
              {name}
            </Text>

            {/* Underline marking the active card, in the module accent. */}
            {selected ? (
              <View
                style={[styles.underline, { backgroundColor: colors.strong }]}
              />
            ) : null}
          </View>
        )}
      </Pressable>
    );
  });

  if (fitted) {
    return <View style={styles.row}>{cards}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollRow}
    >
      {cards}
    </ScrollView>
  );
}

// Memoized top-category card row.
export const SellModuleTabs = memo(SellModuleTabsComponent);
