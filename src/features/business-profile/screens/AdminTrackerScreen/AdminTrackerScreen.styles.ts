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
      paddingBottom: theme.spacing.xxxl,
    },
    sectionLabel: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xxs,
    },

    // --- Hero (total) ---
    heroCard: {
      borderRadius: theme.cardRadius.xl,
      overflow: 'hidden',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      ...theme.shadows.medium,
    },
    heroIconCircle: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.radius.pill,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    heroCount: {
      color: theme.colors.onPrimary,
      marginBottom: 0,
    },
    heroLabel: {
      color: theme.colors.onPrimary,
      opacity: 0.85,
      letterSpacing: 1,
      marginTop: theme.spacing.xxs,
    },
    heroCaption: {
      color: theme.colors.onPrimary,
      opacity: 0.75,
      marginTop: theme.spacing.xxs,
    },

    // --- Section A: status tiles ---
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

    // --- Shared metric card (time-to-approval / success-rate / empty category) ---
    metricCard: {
      marginBottom: theme.spacing.sm,
    },
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricCol: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    metricIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    metricValue: {
      marginBottom: 0,
    },
    metricDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing.md,
    },
    overdueChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xxs,
      borderWidth: 1,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      marginTop: theme.spacing.md,
    },

    // --- Section C: success rate ---
    successHeader: {
      marginBottom: theme.spacing.md,
    },
    successPercent: {
      marginBottom: 0,
    },
    successBarTrack: {
      flexDirection: 'row',
      height: 10,
      borderRadius: theme.radius.pill,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
    },
    legendRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    legendChip: {
      flex: 1,
    },
    legendChipInner: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      gap: theme.spacing.xxs,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: theme.radius.pill,
    },

    // --- Section D: category breakdown ---
    categoryList: {
      gap: theme.spacing.sm,
    },
    categoryRow: {
      gap: theme.spacing.sm,
    },
    categoryLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    categoryLabel: {
      flex: 1,
      textTransform: 'capitalize',
    },
  });
}
