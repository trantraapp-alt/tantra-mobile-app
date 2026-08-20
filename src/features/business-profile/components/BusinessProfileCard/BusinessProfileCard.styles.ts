// Style factory for the BusinessProfileCard component: a photo tile + identity
// column up top, an optional tinted reason notice, and a full-width action row
// (delete + edit) along the bottom.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card horizontal margins matching the listing list rhythm.
    card: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    // Tone-tinted gradient wash sitting behind the whole card, clipped to its
    // rounded corners. A separate absolutely-positioned layer (rather than
    // living inside `content`) so its own overflow:hidden clips only the
    // gradient, never the corner badge straddling the card's edge.
    gradientLayer: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.cardRadius.lg,
      overflow: 'hidden',
    },
    // Outer vertical stack: photo+identity row, then an optional reason
    // notice, then the full-width action row. Relative so the status badge
    // can pin to the card's top-right corner.
    content: {
      gap: theme.spacing.sm,
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
    // Photo + identity row.
    topRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
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
    // Details column; minWidth 0 stops a long name from shoving past the card.
    identity: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    // Owner-name line — the first thing the card says (who runs this) — plus
    // the profile's reference-id chip trailing it.
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    ownerName: {
      flexShrink: 1,
    },
    // Outlined, primary-tinted pill showing the profile's reference id (e.g.
    // "BP82920X") — the same code a related notification refers to.
    refIdChip: {
      flexShrink: 0,
      borderWidth: 1,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 1,
    },
    title: {
      marginTop: theme.spacing.xxs,
    },
    category: {
      marginTop: theme.spacing.xxs,
    },
    // Location + submitted-date row.
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Rejection / block reason notice — a tone-tinted card so it reads as a
    // flagged notice rather than another plain text line.
    reasonBox: {
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
    reasonLabel: {
      fontWeight: theme.fontWeight.semibold,
    },
    // Permanently-blocked hint, with a lock icon — replaces the edit button
    // for a BLOCKED profile since none is available.
    blockedHintRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      maxWidth: '85%',
    },
    blockedHintText: {
      flex: 1,
    },
    // Full-width action row: delete sits at the far left, the primary action
    // fills the rest.
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Light danger-tinted circular surface behind the delete icon.
    deleteButton: {
      width: theme.sizing.minTouchTarget,
      height: theme.sizing.minTouchTarget,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      flex: 1,
    },
  });
}
