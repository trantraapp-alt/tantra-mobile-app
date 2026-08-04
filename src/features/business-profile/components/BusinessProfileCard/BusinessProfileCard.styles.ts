// Style factory for the BusinessProfileCard component: a bordered photo/status
// tile on the left, a details column on the right reading owner name →
// business name → category + status, with per-status actions on the bottom row.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card horizontal margins matching the listing list rhythm.
    card: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    // Tappable content row: status tile + details column. Relative so the
    // status badge can pin to the card's top-right corner.
    content: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      position: 'relative',
    },
    // Status badge, pinned to the top-right corner of the card (its original
    // position) rather than sitting inline in the meta row.
    cornerBadge: {
      position: 'absolute',
      top: -theme.spacing.sm,
      right: theme.spacing.sm,
      zIndex: 1,
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
    // Owner name → business name → category/status, bound by the tightest
    // gap so they read as one identity block.
    identity: {
      gap: theme.spacing.xxs,
    },
    // Owner-name line — the first thing the card says (who runs this).
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    ownerName: {
      flex: 1,
    },
    // Business-name row, with the delete action trailing it.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    // Name takes every pixel the delete icon does not.
    title: {
      flex: 1,
      minWidth: 0,
    },
    // Inset so the 32dp delete control keeps the tight name -> meta bond.
    headerActionSlot: {
      marginTop: -theme.spacing.xs,
      marginBottom: -theme.spacing.xs,
      marginRight: -theme.spacing.sm,
    },
    // Category label gives way under width pressure before the status does.
    category: {
      flexShrink: 1,
      marginTop: theme.spacing.xxs,
    },
    // Rejection / block reason line.
    reason: {
      marginTop: theme.spacing.xs,
    },
    blockedHint: {
      marginTop: theme.spacing.xs,
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
