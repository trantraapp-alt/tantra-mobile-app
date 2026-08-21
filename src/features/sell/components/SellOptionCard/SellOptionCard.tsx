// A module card on the Sell sheet: the module's picture on a round tile and its
// name, in the module's own accent.
//
// Two of these share a sheet row, which leaves ~170pt per card on a phone —
// room for a mark and a name, and little else. Everything a seller needs in
// order to choose between two modules is in the name, so the card carries
// nothing more; the module screen behind it is where the detail belongs. The
// blurb still rides along as the accessibility hint, where it costs no space.
//
// The name and the arrow share a row rather than stacking, so the arrow costs
// the card no height at all.
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule, PreferredLanguage } from '@/types';

import {
  getAccentColors,
  getModuleBlurbKey,
  getModuleName,
  getModuleVisual,
} from '../../utils';
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
  const { t } = useTranslation();

  const name = getModuleName(module, language);
  const visual = getModuleVisual(module.moduleKey);
  const colors = getAccentColors(theme, visual.accent);
  const blurb = t(getModuleBlurbKey(module.moduleKey));
  const icon = module.iconUrl?.trim();

  // Emits the module when the card is pressed.
  const handlePress = useCallback(() => onPress(module), [onPress, module]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityHint={blurb}
      onPress={handlePress}
      style={styles.slot}
    >
      {({ pressed }) => (
        // Styling lives on this inner View (a static array), not the
        // Pressable's function `style`, which NativeWind's cssInterop would
        // drop along with the card's tint and border.
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.soft },
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.pictureTile}>
            {icon ? (
              <Image
                source={{ uri: fileUrl(icon) }}
                style={styles.picture}
                contentFit="contain"
                transition={theme.animation.normal}
                accessibilityLabel={name}
              />
            ) : (
              // Emoji glyph — the same stand-in the category cards use.
              <Text style={styles.emoji}>{visual.emoji}</Text>
            )}
          </View>

          <View style={styles.row}>
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={[styles.name, { color: colors.strong }]}
            >
              {name}
            </Text>

            <View style={[styles.arrow, { backgroundColor: colors.soft }]}>
              <ArrowRight size={theme.sizing.iconSm} color={colors.strong} />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// Memoized sell-option module card.
export const SellOptionCard = memo(SellOptionCardComponent);
