// Style factory for the shared AuthShell layout.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds auth shell styles from the active theme.
export function createAuthShellStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Root fills the viewport with the base background.
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Keyboard avoider fills the root.
    flex: {
      flex: 1,
    },
    // Scroll content grows so the form sheet can stretch to the bottom edge.
    scroll: {
      flexGrow: 1,
    },
    // Gradient hero banner (height + vertical padding applied inline).
    hero: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      overflow: 'hidden',
    },
    // Back affordance floating at the hero's top-left (top applied inline).
    backButton: {
      position: 'absolute',
      left: theme.spacing.sm,
      zIndex: 1,
    },
    // Light tile holding the brand logo (size applied inline).
    logoTile: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.onPrimary,
      ...theme.shadows.high,
    },
    // Brand tagline under the wordmark.
    heroTagline: {
      opacity: theme.opacity.muted,
    },
    // Elevated form sheet overlapping the hero (padding + gap applied inline).
    card: {
      flex: 1,
      marginTop: -theme.radius.xxl,
      borderTopLeftRadius: theme.radius.xxl,
      borderTopRightRadius: theme.radius.xxl,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xl,
      ...theme.shadows.medium,
    },
    // Heading + subtitle block.
    headingBlock: {
      gap: theme.spacing.xs,
    },
  });
}
