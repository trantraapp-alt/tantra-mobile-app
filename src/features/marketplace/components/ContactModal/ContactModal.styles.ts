// Style factory for the ContactModal.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// WhatsApp brand green — a fixed brand color, not theme-derived.
export const WHATSAPP_GREEN = '#25D366';

// Builds ContactModal styles from the active theme.
export function createContactModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: theme.spacing.xl,
    },
    dialog: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.sm,
      ...theme.shadows.high,
    },
    iconCircle: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.successLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xxs,
    },
    phone: {
      letterSpacing: 1,
      fontVariant: ['tabular-nums'],
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignSelf: 'stretch',
      marginTop: theme.spacing.xs,
    },
    actionButton: {
      flex: 1,
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
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      alignSelf: 'stretch',
      borderRadius: theme.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    closeButton: {
      paddingVertical: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
