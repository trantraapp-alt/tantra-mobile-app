// Style factory for BusinessProfileView — the read-only profile body shared by
// the owner detail screen and the admin review screen. Sections use the same
// "fieldset legend" language as the create/edit form (an outlined card with
// its title straddling the top border), so a profile reads as the read-only
// mirror of the form that built it, not an unrelated plain list.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileViewStyles(theme: AppTheme) {
  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    // Positioning context for the gallery and its status badge overlay. Pulled
    // back out to full width since scrollContent now carries side padding.
    hero: {
      position: 'relative',
      marginHorizontal: -theme.spacing.lg,
    },
    heroBadge: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.md,
    },
    block: {
      paddingTop: theme.spacing.md,
    },
    identity: {
      gap: theme.spacing.xxs,
    },
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    blockTitle: {
      marginBottom: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
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
    verifiedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    // Reason notice (rejected/blocked) — a left-accented, tone-tinted card so
    // it reads as a flagged notice rather than another plain field row.
    reasonBox: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      padding: theme.spacing.md,
    },
    reasonBoxText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // A titled group of fields, drawn as an outlined card with its title
    // sitting on the top-left border — mirrors DynamicListingForm's section.
    sectionCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    // Section title chip straddling the card's top-left border.
    sectionLegend: {
      position: 'absolute',
      top: -theme.spacing.md,
      left: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    // Two-column label/value row.
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    rowLabelGroup: {
      flex: 42,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    rowLabel: {
      flex: 1,
    },
    rowValue: {
      flex: 58,
    },
    stackedRow: {
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    booleanValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    tag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
    },
    descriptionGroup: {
      gap: theme.spacing.lg,
    },
    addressLines: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    coordinates: {
      marginTop: theme.spacing.sm,
    },
  });
}
