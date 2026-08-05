// Card shown on the Sell sheet for a single marketplace module.
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule, PreferredLanguage } from '@/types';

import { getModuleName, getModuleVisual } from '../../utils';
import { createSellOptionCardStyles } from './SellOptionCard.styles';

// Props for the SellOptionCard component.
export interface SellOptionCardProps {
  // Module to represent.
  module: MarketplaceModule;
  // Active app language controlling the label.
  language: PreferredLanguage;
  // Called with the module when the card is pressed.
  onPress: (module: MarketplaceModule) => void;
}

// Renders a single sell-option module card.
function SellOptionCardComponent({
  module,
  language,
  onPress,
}: SellOptionCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellOptionCardStyles);
  const visual = getModuleVisual(module.moduleKey);

  // Emits the module when the card is pressed.
  const handlePress = useCallback(() => onPress(module), [onPress, module]);

  return (
    <Card
      radius="xl"
      accessibilityLabel={getModuleName(module, language)}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.imageArea}>
        {module.iconUrl ? (
          <Image
            source={{ uri: module.iconUrl }}
            style={styles.image}
            contentFit="contain"
            transition={theme.animation.normal}
            accessibilityLabel={getModuleName(module, language)}
          />
        ) : (
          // Emoji glyph — same visual as the Home "Browse Categories" tiles.
          <Text style={styles.emoji}>{visual.emoji}</Text>
        )}
      </View>
      <Text variant="bodyMedium" align="center" numberOfLines={2}>
        {getModuleName(module, language)}
      </Text>
    </Card>
  );
}

// Memoized sell-option module card.
export const SellOptionCard = memo(SellOptionCardComponent);
