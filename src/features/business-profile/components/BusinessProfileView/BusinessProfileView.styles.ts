// Style factory for BusinessProfileView — the read-only profile body shared by
// the owner detail screen and the admin review screen, so both read as the
// same kind of page (full-bleed hero, identity block, banded sections).
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBusinessProfileViewStyles(theme: AppTheme) {
  return StyleSheet.create({
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
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
    // A full-bleed content block on the page background.
    block: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    // Full-bleed separator band between blocks.
    band: {
      height: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Identity block: profile-type eyebrow + business name.
    identity: {
      gap: theme.spacing.xs,
    },
    blockTitle: {
      marginBottom: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    verifiedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    // Reason notice (rejected/blocked) — a left-accented card so it reads as a
    // flagged notice rather than another plain field row.
    reasonBox: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    reasonBoxText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Two-column label/value row.
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    rowLabel: {
      flex: 42,
    },
    rowValue: {
      flex: 58,
    },
    stackedRow: {
      paddingVertical: theme.spacing.md,
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
