// Style factory for the FilterSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds FilterSheet styles from the active theme.
export function createFilterSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Breathing room between filter sections (grouped by spacing, not dividers).
    content: {
      gap: theme.spacing.md,
    },
    // Title above a chip group (listing type, seller, attribute groups).
    rowLabel: {
      marginBottom: theme.spacing.sm,
    },
    // Header row for a slider section: title on the left, live value pill right.
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    // Primary-tinted pill showing the live price range / distance read-out.
    valueBadge: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Min / max end labels beneath a slider track.
    sliderScale: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xxs,
    },
    // Wrapping row of selectable pills.
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Sticky footer action row (Reset / Apply).
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
    },
    // Wraps the category attribute groups: keeps the section spacing between
    // groups and adds a little breathing room below the last one (Crop Type)
    // so it does not sit flush against the sticky footer.
    attrSection: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    // Spacer shown in place of the attribute section on screens without a Crop
    // Type group, so the last row (Posted Within) keeps some room above the
    // sticky footer instead of sitting flush against it.
    tailSpacing: {
      height: theme.spacing.sm,
    },
    // Centered spinner while a category's attribute filters load.
    attrLoading: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
  });
}
