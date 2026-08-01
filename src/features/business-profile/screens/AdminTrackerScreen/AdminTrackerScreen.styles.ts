import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminTrackerStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.md,
    },
    sectionLabel: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xxs,
    },
    tilesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tile: {
      flex: 1,
      minWidth: '46%',
    },
    tileInner: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    // Solid tone-colored circle behind the status icon, sitting on the
    // tile's own soft tone-tinted wash — the same solid-on-tint convention
    // used across the feature so status reads identically everywhere.
    tileIcon: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xxs,
    },
    tileCount: {
      marginBottom: 0,
    },
    tileLabel: {
      textTransform: 'uppercase',
    },
    reviewedRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    // A tone-tinted chip, mirroring the tile treatment above at a smaller
    // scale — the "reviewed by me" row reads as a family with the tiles
    // instead of a plain, unrelated stats strip.
    reviewedChip: {
      flex: 1,
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
  });
}
