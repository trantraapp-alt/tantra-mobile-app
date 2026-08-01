// Style factory for the BusinessProfileCard component. Mirrors the listing card:
// a bordered tile on the left, a details column on the right.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card horizontal margins matching the listing list rhythm.
    card: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    // Tappable content row: status tile + details column.
    content: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
    },
    // Press feedback; radius matches the card so the fill stays within corners.
    contentPressed: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.cardRadius.lg,
    },
    // Bordered, rounded tile holding the profile photo (or a status icon when
    // there is no photo) — the identity slot, like the listing thumbnail.
    iconWrap: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    // Photo filling the tile.
    iconImage: {
      width: '100%',
      height: '100%',
    },
    // Details column; minWidth 0 stops a long name from shoving the action rail.
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // Name + meta, bound by the tightest gap so they read as one unit.
    identity: {
      gap: theme.spacing.xxs,
    },
    // Name row.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
    },
    // Name takes every pixel the header slot does not.
    title: {
      flex: 1,
      minWidth: 0,
    },
    // Overflow-menu inset so a 32dp control keeps the tight name -> meta bond.
    headerActionSlot: {
      marginTop: -theme.spacing.xs,
      marginBottom: -theme.spacing.xs,
      marginRight: -theme.spacing.sm,
    },
    // Category + status row.
    metaRow: {
      gap: theme.spacing.sm,
    },
    // Solid tone-colored circle behind the status icon — matches the admin
    // screens so status reads the same way everywhere in the feature.
    statusIcon: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Reason notice (rejected/blocked) — a left-accented card so it reads as a
    // flagged notice rather than a plain text block.
    reasonBox: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.sm,
      borderLeftWidth: 3,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      justifyContent: 'space-between',
    },
    blockedHint: {
      marginTop: theme.spacing.xs,
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Category label gives way under width pressure before the status does.
    category: {
      flexShrink: 1,
    },
    // Status dot + label; never shrinks so the status stays whole.
    statusGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      gap: theme.spacing.xs,
    },
    // Small colored status dot.
    statusDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
    },
    // Rejection / block reason line.
    reason: {
      marginTop: theme.spacing.xxs,
    },
    // Action row: actions aligned to the right (edit sits rightmost).
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      minHeight: theme.sizing.buttonHeightSm,
    },
 
  });
}
