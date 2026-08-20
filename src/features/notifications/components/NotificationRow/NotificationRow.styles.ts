// Style factory for the NotificationRow component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds notification row styles from the active theme.
export function createNotificationRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tappable row.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    // Unread background tint.
    unread: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Leading unread dot column (fixed width so text aligns read/unread).
    dotColumn: {
      width: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
    },
    // The unread dot.
    dot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    // Tone-tinted circle behind the notification-type icon.
    iconWrap: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Text column.
    body: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Timestamp spacing.
    time: {
      marginTop: theme.spacing.xxs,
    },
  });
}
