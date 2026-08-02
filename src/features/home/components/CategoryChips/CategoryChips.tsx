// Horizontal rail of category pills for a module section. Each chip shows the
// category's remote icon (when present) and its localized name, and drills into
// that category on tap.
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { ModuleCategory } from '@/types';

import { createCategoryChipsStyles } from './CategoryChips.styles';

// Props for the CategoryChips component.
export interface CategoryChipsProps {
  // Categories to render as chips.
  categories: ModuleCategory[];
  // Called with the tapped category.
  onCategoryPress?: (category: ModuleCategory) => void;
}

// Renders a horizontal rail of category chips.
function CategoryChipsComponent({
  categories,
  onCategoryPress,
}: CategoryChipsProps) {
  const styles = useThemedStyles(createCategoryChipsStyles);
  const { language } = useTranslation();

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {categories.map((category) => {
        const label =
          language === 'HI'
            ? category.categoryNameHi
            : category.categoryNameEn;
        const iconUri =
          category.iconUrl && category.iconUrl.trim() !== ''
            ? fileUrl(category.iconUrl)
            : undefined;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={
              onCategoryPress ? () => onCategoryPress(category) : undefined
            }
            disabled={!onCategoryPress}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.chip,
                  iconUri ? null : styles.chipNoIcon,
                  pressed && onCategoryPress ? styles.pressed : null,
                ]}
              >
                {iconUri ? (
                  <Image
                    source={{ uri: iconUri }}
                    style={styles.icon}
                    contentFit="cover"
                    accessibilityLabel={label}
                  />
                ) : null}
                <Text variant="label" numberOfLines={1}>
                  {label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Memoized category chip rail.
export const CategoryChips = memo(CategoryChipsComponent);
