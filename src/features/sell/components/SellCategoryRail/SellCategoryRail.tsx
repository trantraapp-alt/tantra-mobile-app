// Horizontal strip of selectable module categories shown at the top of the
// screen. Selecting an entry drives which listing form shows below.
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import {
  getCategoryImageSource,
  getCategoryName,
  getCategoryVisual,
} from '../../utils';
import { createSellCategoryRailStyles } from './SellCategoryRail.styles';

// Props for the SellCategoryRail component.
export interface SellCategoryRailProps {
  // Categories to list.
  categories: ModuleCategory[];
  // Currently selected category id, if any.
  selectedId: number | null;
  // Active app language controlling labels.
  language: PreferredLanguage;
  // Called with the category when an entry is selected.
  onSelect: (category: ModuleCategory) => void;
}

// Renders the vertical, selectable category rail.
function SellCategoryRailComponent({
  categories,
  selectedId,
  language,
  onSelect,
}: SellCategoryRailProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryRailStyles);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const selected = category.id === selectedId;
        const name = getCategoryName(category, language);
        // Prefer a registered local image; fall back to the mapped icon.
        const imageSource = getCategoryImageSource(category.categoryKey);
        const visual = getCategoryVisual(category.categoryKey);
        const Icon = visual.icon;

        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={name}
            onPress={() => onSelect(category)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.icon}
                  contentFit="contain"
                  transition={theme.animation.normal}
                  accessibilityLabel={name}
                />
              ) : (
                <Icon
                  size={theme.sizing.iconLg}
                  color={theme.colors[visual.accent]}
                />
              )}
            </View>
            <Text
              variant="caption"
              align="center"
              numberOfLines={2}
              color={selected ? 'primary' : 'textSecondary'}
              style={styles.label}
            >
              {name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Memoized category rail.
export const SellCategoryRail = memo(SellCategoryRailComponent);
