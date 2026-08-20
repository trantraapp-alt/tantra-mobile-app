// Style factory for AdminProfileListScreen. Deliberately mirrors
// BusinessProfileCard's layout (photo tile + identity column, ref-id chip,
// location/submitted-date meta row, a tinted reason notice) so the admin list
// and the owner's My Profiles list read as the same design system — just
// without the owner's action row, since a tap here always goes to the full
// review screen instead.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminProfileListStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },
    card: {
      marginBottom: theme.spacing.sm,
    },
    // Tone-tinted gradient wash sitting behind the whole card, clipped to its
    // rounded corners. A separate absolutely-positioned layer (rather than
    // living inside `cardRow`) so its own overflow:hidden clips only the
    // gradient, never the corner badge straddling the card's edge.
    gradientLayer: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.cardRadius.lg,
      overflow: 'hidden',
    },
    // Photo + identity row, plus the trailing chevron. Relative so the status
    // badge can pin to the card's top-right corner.
    cardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      position: 'relative',
    },
    // Status badge, pinned to the top-right corner of the card.
    cornerBadge: {
      position: 'absolute',
      top: -theme.spacing.sm,
      right: theme.spacing.sm,
      zIndex: 1,
    },
    // Bordered, rounded tile holding the profile photo (or a status icon when
    // there is no photo) — identical to the owner card's identity slot.
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
    iconImage: {
      width: '100%',
      height: '100%',
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    // Owner-name line — the first thing the card says — plus the profile's
    // reference-id chip trailing it, matching the owner's own card.
    ownerRow: {
      flex:1,
      width:'100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    cardTitle: {
      marginTop: theme.spacing.xxs,
    },
    category: {
      flexShrink: 1,
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
      marginTop: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    reasonLabel: {
      fontWeight: theme.fontWeight.semibold,
    },
    // Reviewer name + review date — admin-only context the owner's own card
    // has no need for.
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
    },
    chevron: {
      alignSelf: 'center',
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
