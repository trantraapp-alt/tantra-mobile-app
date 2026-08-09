// Style factory for AdminProfileListScreen. Deliberately mirrors
// BusinessProfileCard's identity block (photo/status tile, owner name →
// business name → category + status) so the admin list and the owner's My
// Profiles list read as the same design system.
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
    // Relative so the status badge can pin to the card's top-right corner.
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
    // Owner-name line — the first thing the card says, matching the owner's
    // own card.
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    cardTitle: {
      marginTop: theme.spacing.xxs,
    },
    category: {
      flexShrink: 1,
      marginTop: theme.spacing.xxs,
    },
    reasonPreview: {
      fontStyle: 'italic',
      marginTop: theme.spacing.xs,
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
