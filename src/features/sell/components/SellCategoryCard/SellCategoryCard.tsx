// Grid card for a module category, using the category's remote icon.
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { ModuleCategory, PreferredLanguage } from '@/types';

import { getCategoryName } from '../../utils';
import { createSellCategoryCardStyles } from './SellCategoryCard.styles';

// Props for the SellCategoryCard component.
export interface SellCategoryCardProps {
  // Category to display.
  category: ModuleCategory;
  // Active app language controlling the label.
  language: PreferredLanguage;
  // Called with the category when pressed.
  onPress: (category: ModuleCategory) => void;
}

// Renders a single category grid card.
function SellCategoryCardComponent({
  category,
  language,
  onPress,
}: SellCategoryCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellCategoryCardStyles);

  // Emits the category when pressed.
  const handlePress = useCallback(
    () => onPress(category),
    [onPress, category],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={getCategoryName(category, language)}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.iconWrapper}>
        <Image
          source={{ uri: category.iconUrl }}
          style={styles.icon}
          contentFit="contain"
          transition={theme.animation.normal}
          accessibilityLabel={getCategoryName(category, language)}
        />
      </View>
      <Text variant="label" align="center" numberOfLines={2}>
        {getCategoryName(category, language)}
      </Text>
    </Pressable>
  );
}

// Memoized category grid card.
export const SellCategoryCard = memo(SellCategoryCardComponent);
