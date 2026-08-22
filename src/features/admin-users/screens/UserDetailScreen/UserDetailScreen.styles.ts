// Style factory for UserDetailScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createUserDetailScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    // Identity hero.
    heroCard: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    heroRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    avatar: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroIdentity: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Blocked-reason notice.
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
    // Sections (Activity / Subscription / Business Profile / Addresses).
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    sectionBordered: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      textTransform: 'uppercase',
    },
    // Activity stat tiles.
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.md,
    },
    lastListing: {
      textAlign: 'center',
    },
    // Subscription / business-profile / address cards.
    infoCard: {
      gap: theme.spacing.xs,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    infoIcon: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoHeaderText: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    grantedBy: {
      marginTop: theme.spacing.xxs,
    },
    addressList: {
      gap: theme.spacing.sm,
    },
  });
}
