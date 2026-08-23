// Style factory for the ContactModal bottom sheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// WhatsApp brand green — a fixed brand color, not theme-derived.
export const WHATSAPP_GREEN = '#25D366';

// Rounded square carrying the shield beside the number.
const SHIELD_TILE = 64;

// Round icon tiles on the closing cards, and the sheet's close button.
const NOTE_ICON = 36;
const CLOSE = 34;

// Builds ContactModal styles from the active theme.
export function createContactModalStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Breathing room between the sheet's stacked blocks.
    sheet: {
      gap: theme.spacing.md,
    },
    // Avatar, identity block and close button on one row.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // Seller name over the listing this reveal was for.
    headerText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Name and its verification badge.
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    // The name itself, shrinking before the badge does.
    name: {
      flexShrink: 1,
    },
    // Round close button.
    close: {
      width: CLOSE,
      height: CLOSE,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // The number on its tinted card, with the shield tile at the trailing edge.
    numberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.accents.primary.surface,
    },
    // Label, number and note stack, taking the free width.
    numberInfo: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    // "Primary number" beside its pill.
    numberLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Pill marking this as the line the seller prefers.
    preferredPill: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.accents.primary.soft,
    },
    preferredText: {
      color: theme.accents.primary.strong,
    },
    // Tabular figures keep the grouped number from shifting as it renders.
    phone: {
      letterSpacing: 1,
      fontVariant: ['tabular-nums'],
    },
    // "This is a verified seller number".
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    verifiedText: {
      color: theme.colors.primary,
    },
    // Solid brand tile carrying the shield.
    shieldTile: {
      width: SHIELD_TILE,
      height: SHIELD_TILE,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    // Call + WhatsApp share a row.
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignSelf: 'stretch',
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
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.lg,
    },
    callButton: {
      backgroundColor: theme.colors.primary,
    },
    waButton: {
      backgroundColor: WHATSAPP_GREEN,
    },
    // Outlined variant used for the alternate number's Copy action.
    outlineButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    // Full-width copy button under the primary number's action row.
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.lg,
    },
    // The alternate number, kept quieter than the primary card above it.
    altBlock: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    altNumber: {
      letterSpacing: 0.5,
      fontVariant: ['tabular-nums'],
    },
    // Safety note: icon tile beside two lines of copy.
    noteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    // Round tile carrying the lock.
    noteIcon: {
      width: NOTE_ICON,
      height: NOTE_ICON,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accents.success.surface,
    },
    // Title over its supporting line, taking the free width.
    noteText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // The safety title carries the success accent; its body stays muted.
    noteTitle: {
      color: theme.accents.success.strong,
    },
    // Support card: same shape as the note, with a trailing action.
    helpCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    // Round tile carrying the headset.
    helpIcon: {
      width: NOTE_ICON,
      height: NOTE_ICON,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accents.primary.surface,
    },
    // "Contact Support" and its chevron.
    helpAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
