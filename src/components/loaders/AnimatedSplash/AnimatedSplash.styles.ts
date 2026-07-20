// Style factory for the AnimatedSplash screen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds animated splash styles from the active theme.
export function createAnimatedSplashStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-screen container above the app while animating.
    container: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    // Centered brand content stack.
    content: {
      alignItems: 'center',
      gap: theme.spacing.xl,
    },
    // Rounded logo tile. No elevation/shadow: the logo PNG is transparent, and
    // Android would otherwise cast its elevation as a gray rectangular box.
    logo: {
      width: theme.sizing.avatarXl + theme.spacing.xxxl,
      height: theme.sizing.avatarXl + theme.spacing.xxxl,
      borderRadius: theme.radius.xxl,
    },
    // Wordmark row.
    wordmark: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Tagline row with flanking gradient lines.
    taglineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Left tagline accent line.
    lineLeft: {
      width: theme.spacing.xxl,
      height: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    // Right tagline accent line.
    lineRight: {
      width: theme.spacing.xxl,
      height: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
    },
    // Bottom wave anchor.
    wave: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
}
