// Style factory for the ContactModal bottom sheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// WhatsApp brand green — a fixed brand color, not theme-derived.
export const WHATSAPP_GREEN = '#25D366';

// Builds ContactModal styles from the active theme.
export function createContactModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Extra breathing room between the sheet's stacked number blocks.
    sheet: {
      gap: theme.spacing.lg,
    },
    // One number and its action buttons, on a tinted card.
    numberBlock: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    phone: {
      letterSpacing: 1,
      fontVariant: ['tabular-nums'],
    },
    altNumber: {
      letterSpacing: 0.5,
      fontVariant: ['tabular-nums'],
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignSelf: 'stretch',
      marginTop: theme.spacing.xs,
    },
    // Equal-width press targets so the two buttons split the row.
    actionSlot: {
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
    },
    callButton: {
      backgroundColor: theme.colors.primary,
    },
    waButton: {
      backgroundColor: WHATSAPP_GREEN,
    },
    // Outlined variant used for the alternate number's Copy action.
    outlineButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.card,
    },
    // Full-width copy button under the primary number's action row.
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
