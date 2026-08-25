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
    // Extra bottom room so the last section clears the sticky action footer.
    content: {
      paddingBottom: theme.spacing.xxxl,
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
    // Grant/Change-plan/Revoke row under the subscription card.
    sectionActions: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
    },
    // flexBasis is explicitly zeroed rather than using the `flex: 1` shorthand
    // — React Native (unlike web CSS) keeps a content-based basis under that
    // shorthand, so "Change Plan" (longer label) was claiming more width than
    // "Revoke" instead of splitting the row 50/50.
    sectionActionButton: {
      flex:1,
      flexShrink: 1,
      flexBasis: 0,
    },
    // Sticky Block/Unblock footer, pinned under the scroll content.
    actionFooter: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
  });
}
