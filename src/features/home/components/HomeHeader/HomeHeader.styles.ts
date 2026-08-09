// Style factory for the HomeHeader — a hero header: a violet→light gradient (with
// an optional farmer illustration) carrying the brand, a greeting, a search bar
// with a mic, and a white location / radius / weather bar.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// White pills sit on the colored header, so their ink is fixed (theme-independent)
// to stay legible regardless of the active scheme.
const FIELD_BG = '#FFFFFF';
const INK = '#1B1630';
const INK_SOFT = '#6B6577';
// Translucent "glass" surfaces layered on the header for the top-row actions.
const GLASS = 'rgba(255,255,255,0.16)';
const GLASS_BORDER = 'rgba(255,255,255,0.30)';
// Hairline divider between the segments of the white location bar.
const DIVIDER = 'rgba(20,10,40,0.08)';
// Soft shadow lifting the white bars off the colored header.
const CARD_SHADOW = {
  shadowColor: '#2E1065',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  elevation: 4,
};

export { INK, INK_SOFT };

// Builds HomeHeader styles from the active theme.
export function createHomeHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Header shell; the top inset is applied inline so the gradient fills the
    // status-bar area. Clips the gradient + hero illustration.
    container: {
      backgroundColor: theme.colors.primary,
      overflow: 'hidden',
      zIndex: 10,
    },
    // Brand + actions row.
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Round translucent action (notification bell).
    glassIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: GLASS,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: GLASS_BORDER,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Unread notification dot.
    notifDot: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 9,
      height: 9,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.danger,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    // Language pill.
    langPill: {
      minWidth: 44,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GLASS,
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: GLASS_BORDER,
      paddingHorizontal: theme.spacing.md,
    },
    // Greeting block.
    greeting: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    greetingSub: {
      marginTop: theme.spacing.xxs,
      opacity: 0.9,
    },
    // Search row.
    searchRow: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    // White search pill with a trailing mic button.
    searchField: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      backgroundColor: FIELD_BG,
      borderRadius: theme.radius.pill,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.xxs,
      ...CARD_SHADOW,
    },
    // The tap-to-search area (icon + placeholder) fills the pill.
    searchTap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      height: '100%',
    },
    searchText: {
      flex: 1,
    },
    // Violet mic circle at the pill's trailing edge.
    mic: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // White location / radius / weather bar.
    locBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      backgroundColor: FIELD_BG,
      borderRadius: theme.cardRadius.lg,
      paddingHorizontal: theme.spacing.xs,
      ...CARD_SHADOW,
    },
    // Location segment grows to take the free width; the others size to content.
    locSeg: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.sm,
      height: '100%',
    },
    locValue: {
      flexShrink: 1,
    },
    // Radius / weather segments size to their content.
    seg: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.sm,
      height: '100%',
    },
    // Thin vertical divider between segments.
    divider: {
      width: StyleSheet.hairlineWidth,
      height: 26,
      backgroundColor: DIVIDER,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
