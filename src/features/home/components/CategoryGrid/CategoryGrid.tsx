// Browse-categories card: a titled surface holding a 4-column grid of tinted
// category tiles. Each tile shows a big emoji over an uppercase label and, on
// tap, drills into that category by its lowercase slug. The category set is
// curated client-side (the backend does not send this navigational content).
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createCategoryGridStyles } from './CategoryGrid.styles';

// A single browse-category tile definition.
interface CategoryItem {
  // Lowercase slug emitted to `onSelect`.
  key: string;
  // Emoji glyph rendered as the tile's icon.
  emoji: string;
  // Bilingual tile label.
  label: LocalizedText;
}

// Section heading shown above the grid.
const TITLE: LocalizedText = { en: 'Browse Categories', hi: 'श्रेणियाँ' };

// Curated set of top-level marketplace categories.
const CATEGORIES: CategoryItem[] = [
  { key: 'crops', emoji: '🌿', label: { en: 'Crops', hi: 'फसल' } },
  { key: 'seeds', emoji: '🌱', label: { en: 'Seeds', hi: 'बीज' } },
  { key: 'fertilizers', emoji: '🧪', label: { en: 'Fertilizers', hi: 'खाद' } },
  { key: 'equipment', emoji: '🚜', label: { en: 'Equipment', hi: 'उपकरण' } },
  { key: 'animals', emoji: '🐄', label: { en: 'Animals', hi: 'पशु' } },
  { key: 'vegetables', emoji: '🥬', label: { en: 'Vegetables', hi: 'सब्ज़ी' } },
  { key: 'fishery', emoji: '🐟', label: { en: 'Fishery', hi: 'मत्स्य' } },
  { key: 'poultry', emoji: '🐔', label: { en: 'Poultry', hi: 'मुर्गी' } },
];

// Props for the CategoryGrid component.
export interface CategoryGridProps {
  // Called with the tapped category's lowercase slug.
  onSelect?: (key: string) => void;
}

// Renders the browse-categories card with its tile grid.
function CategoryGridComponent({ onSelect }: CategoryGridProps) {
  const styles = useThemedStyles(createCategoryGridStyles);
  const { language } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="h4">{localize(TITLE, language)}</Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const label = localize(category.label, language);
          return (
            <View key={category.key} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={onSelect ? () => onSelect(category.key) : undefined}
                disabled={!onSelect}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.tile,
                      pressed && onSelect ? styles.pressed : null,
                    ]}
                  >
                    <Text style={styles.emoji}>{category.emoji}</Text>
                    <Text
                      variant="overline"
                      color="primary"
                      align="center"
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Memoized browse-categories grid.
export const CategoryGrid = memo(CategoryGridComponent);
