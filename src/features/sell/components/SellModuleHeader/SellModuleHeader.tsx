// Screen header for a marketplace module: the brand gradient bar filling the
// status bar, carrying a round back button, the module name over a one-line
// description of what it covers, and the module's mark on the trailing side.
//
// It shares the app's branded header treatment (the same backdrop the listing
// screens use) so the sell flow arrives looking like the rest of Tantra. The
// app's shared `Header` centres a single line of text between two side slots;
// this screen leads with what the module is *for*, which needs a left-aligned
// two-line title block — hence a feature-local header over the shared backdrop.
//
// The two round controls are plain pressables rather than `IconButton`: the
// design pairs them as matching 38pt discs, and IconButton sizes its own
// surface from a preset. Hit slop keeps the touch target honest.
import { ChevronLeft } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeaderBackdrop } from '@/components/shared';
import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createSellModuleHeaderStyles } from './SellModuleHeader.styles';

// Props for the SellModuleHeader component.
export interface SellModuleHeaderProps {
  // Main title (the module name, or the open category once drilled in).
  title: string;
  // Optional supporting line shown under the title.
  subtitle?: string;
  // Optional glyph marking the module, shown in the trailing circle.
  emoji?: string;
  // Called when the back button is pressed.
  onBack: () => void;
}

// Renders the module screen's header.
function SellModuleHeaderComponent({
  title,
  subtitle,
  emoji,
  onBack,
}: SellModuleHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellModuleHeaderStyles);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView edges={['top']} style={styles.safeWrap}>
      <BrandHeaderBackdrop width={width} />

      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sell.back')}
          onPress={onBack}
          hitSlop={theme.sizing.hitSlop}
        >
          {({ pressed }) => (
            // Styling lives on this inner View (a static array), not the
            // Pressable's function `style`, which NativeWind's cssInterop would
            // drop along with the disc's background and shadow.
            <View style={[styles.disc, pressed ? styles.pressed : null]}>
              <ChevronLeft
                size={theme.sizing.iconMd}
                color={theme.colors.textPrimary}
              />
            </View>
          )}
        </Pressable>

        <View style={styles.titles}>
          <Text variant="h2" color="onPrimary" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              variant="caption"
              color="onPrimary"
              numberOfLines={2}
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {emoji ? (
          <View style={styles.disc}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// Memoized module screen header.
export const SellModuleHeader = memo(SellModuleHeaderComponent);
