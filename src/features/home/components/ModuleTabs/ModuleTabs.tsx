// Horizontal strip of marketplace modules rendered as circular icon tiles with
// a centered label — the home screen's primary category entry points. The
// modules API returns no icon, so each tile's glyph + accent come from the
// shared module-visual map.
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { getModuleVisual } from '@/features/sell/utils/moduleVisuals';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { MarketplaceModule } from '@/types';

import { createModuleTabsStyles } from './ModuleTabs.styles';

// Props for the ModuleTabs component.
export interface ModuleTabsProps {
  // Modules to render, in display order.
  modules: MarketplaceModule[];
  // Called with the tapped module.
  onModulePress?: (module: MarketplaceModule) => void;
}

// Renders the horizontal module strip.
function ModuleTabsComponent({ modules, onModulePress }: ModuleTabsProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createModuleTabsStyles);
  const { language } = useTranslation();

  if (modules.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {modules.map((module) => {
        const visual = getModuleVisual(module.moduleKey);
        const Icon = visual.icon;
        const label =
          language === 'HI' ? module.moduleNameHi : module.moduleNameEn;
        return (
          <Pressable
            key={module.id}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onModulePress ? () => onModulePress(module) : undefined}
            disabled={!onModulePress}
          >
            {({ pressed }) => (
              // Styling lives on this inner View (a static array), not the
              // Pressable's function `style`, which NativeWind's cssInterop
              // would drop along with the layout and press feedback.
              <View
                style={[
                  styles.item,
                  pressed && onModulePress ? styles.pressed : null,
                ]}
              >
                <View style={styles.circle}>
                  <Icon
                    size={theme.sizing.iconLg}
                    color={theme.colors[visual.accent]}
                  />
                </View>
                <Text variant="label" numberOfLines={1} style={styles.label}>
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

// Memoized module strip.
export const ModuleTabs = memo(ModuleTabsComponent);
