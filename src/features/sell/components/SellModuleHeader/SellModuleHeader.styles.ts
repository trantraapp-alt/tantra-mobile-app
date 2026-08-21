// Style factory for the SellModuleHeader component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Diameter of the two round controls flanking the title.
const CONTROL = 38;

// Builds module header styles from the active theme.
export function createSellModuleHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Safe-area wrapper carrying the brand gradient behind the status bar. The
    // flat `primary` fill stays as paint-behind so the bar never flashes white
    // while the SVG mounts, and `overflow: hidden` clips the deliberately
    // over-tall backdrop to the header's real height.
    safeWrap: {
      backgroundColor: theme.colors.primary,
      overflow: 'hidden',
    },
    // Back button, title block and mark on one row. Top-aligned so the two
    // discs stay level with the title when the subtitle wraps.
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    // Shared round disc: the back control and the module mark are the same
    // white circle, which is what keeps them legible against the gradient.
    disc: {
      width: CONTROL,
      height: CONTROL,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      ...theme.shadows.medium,
    },
    // Pressed feedback on the back disc.
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Module glyph inside that circle.
    emoji: {
      fontSize: 18,
      lineHeight: 24,
    },
    // Title over subtitle, taking the space between the two discs.
    titles: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // The description sits under the title in the same white, dimmed so the
    // title still leads. A grey would muddy against the gradient.
    subtitle: {
      opacity: theme.opacity.muted,
    },
  });
}
