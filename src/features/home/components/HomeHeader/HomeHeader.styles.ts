// Style factory for the HomeHeader.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// The search field is a fixed white pill on the colored header, so its ink is
// fixed (theme-independent) to stay legible in both light and dark.
const FIELD_BG = '#FFFFFF';
const FIELD_INK = '#1B1630';
const FIELD_PLACEHOLDER = '#7A748C';
// Translucent "glass" surfaces layered on the primary header.
const GLASS = 'rgba(255,255,255,0.14)';
const GLASS_BORDER = 'rgba(255,255,255,0.24)';
const GLASS_SOFT = 'rgba(255,255,255,0.10)';
// Orange (secondary) tint for the radius pill.
const SECONDARY_TINT = 'rgba(249,115,22,0.22)';

export { FIELD_INK, FIELD_PLACEHOLDER };

// Builds HomeHeader styles from the active theme.
export function createHomeHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Colored header shell; the top inset is applied inline so the color fills
    // the status-bar area.
    container: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.medium,
      zIndex: 10,
    },
    // Logo + actions row.
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    // Second row: full-width search field.
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // White search field (full-width on its own row).
    searchField: {
      flex: 1,
      height: 40,
      backgroundColor: FIELD_BG,
      borderRadius: theme.radius.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    searchText: {
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    glassIcon: {
      width: 30,
      height: 30,
      borderRadius: theme.radius.pill,
      backgroundColor: GLASS,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifDot: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 8,
      height: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.danger,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    langPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: GLASS,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Second row: location + radius + weather + state.
    locBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    // The location field sizes to its content (not full width) and shrinks to
    // make room for the radius + weather pills when space is tight.
    locPressable: {
      flexShrink: 1,
      minWidth: 0,
    },
    // Location rendered as a tappable, bordered field on the violet header.
    locRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      height: 34,
      backgroundColor: GLASS,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: GLASS_BORDER,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
    },
    locContent: {
      flexShrink: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    locValue: {
      flexShrink: 1,
    },
    // Radius + weather share the field's height so all three items align.
    radiusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      height: 34,
      backgroundColor: SECONDARY_TINT,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    weatherPill: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 34,
      backgroundColor: GLASS_SOFT,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
