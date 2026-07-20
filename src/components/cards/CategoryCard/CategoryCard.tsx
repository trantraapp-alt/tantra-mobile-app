// Presentational category card showing image and name.
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { Category } from '@/types';

import { createCategoryCardStyles } from './CategoryCard.styles';

// Props for the CategoryCard component.
export interface CategoryCardProps {
  // Category information to display.
  category: Category;
  // Called when the card is pressed.
  onPress: (category: Category) => void;
}

// Renders a single category card.
function CategoryCardComponent({ category, onPress }: CategoryCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createCategoryCardStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={() => onPress(category)}
      style={styles.container}
    >
      <Image
        source={{ uri: category.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={theme.animation.normal}
        accessibilityLabel={category.name}
      />
      <Text variant="label" numberOfLines={1} align="center" style={styles.label}>
        {category.name}
      </Text>
    </Pressable>
  );
}

// Memoized presentational category card.
export const CategoryCard = memo(CategoryCardComponent);
