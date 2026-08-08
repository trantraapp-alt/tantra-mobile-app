// Style factory for BusinessProfileView — the read-only profile body shared by
// the owner detail screen and the admin review screen. Mirrors the buyer
// marketplace listing-detail screen's pattern (hairline-bordered sections,
// a lavender attribute grid) so a business profile reads as the same kind of
// detail page as a listing, not a bespoke form-mirror layout.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileViewStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    // A padded content block.
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    sectionBordered: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    title: {
      flexShrink: 1,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
    },
    metaRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Reason notice (rejected/blocked) — a left-accented, tone-tinted card so
    // it reads as a flagged notice rather than another plain field row.
    reasonBox: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      padding: theme.spacing.md,
    },
    reasonBoxText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    descriptionGroup: {
      gap: theme.spacing.md,
    },
    blockTitle: {
      marginBottom: theme.spacing.xxs,
    },
    // Attribute key/value grid.
    attrsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    attrItem: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      gap: 1,
    },
    attrItemWide: {
      width: '100%',
    },
    booleanValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Business address card.
    addressCard: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.cardRadius.lg,
      padding: theme.spacing.md,
    },
    // Solid tone-colored circle behind the address pin — the same
    // solid-icon-circle convention used across the feature.
    addressIcon: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addressLines: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    coordinates: {
      marginTop: theme.spacing.xs,
    },
    // Address section content: stacked lines, phones and coordinates.
    addressGroup: {
      gap: theme.spacing.xs,
    },
    // Positioning context for the gallery and its status badge overlay.
    hero: {
      position: 'relative',
    },
    heroBadge: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.md,
    },
  });
}
