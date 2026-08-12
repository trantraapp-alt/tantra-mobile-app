// Style factory for the buyer ListingDetailScreen — Design 1.
// Structure (top → bottom):
//   dark-green header  →  full-bleed hero image with Fresh Deal badge
//   →  white content area (price / title / tags / meta / stats box /
//      quality banner / accordion sections)
//   →  sticky dual-CTA footer
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingDetailScreen styles from the active theme.
export function createListingDetailStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: { flex: 1 },

    // ── Header (solid primary-green bar) ──────────────────────────────
    headerSafe: {
      backgroundColor: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    // Back button gets a white-circle background; heart/share are plain icons.
    backBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
    },

    // ── Hero image area ───────────────────────────────────────────────
    heroWrap: {
      // Relative by default — absolute badge is positioned inside this.
    },
    // "Fresh Deal" white pill with green border — top-left of the image.
    freshDealBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.success,
    },
    freshDealText: {
      // Color is applied inline via theme.colors.success
    },

    // ── White content area ────────────────────────────────────────────
    // Scrollable section that follows the image; full-width, no card border.
    content: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
      gap: theme.spacing.md,
    },

    // Price row: large price + strikethrough + OFF badge from PriceTag.
    // (PriceTag component handles its own layout.)

    // Title text + optional verified check.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    titleText: { flex: 1 },

    // Listing-type + negotiable badge pills.
    tagsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
    },

    // Location pin + vertical divider + store/seller name.
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    metaDivider: {
      width: StyleSheet.hairlineWidth,
      height: theme.sizing.iconSm,
      backgroundColor: theme.colors.border,
    },

    // ── Stats box (bordered 4-column card) ───────────────────────────
    statsBox: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
    },
    // Each column: icon+number row on top, label below — centered.
    statCol: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    statNumRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    statColDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.border,
    },

    // ── Quality Assured banner ────────────────────────────────────────
    qualityBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.successLight,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.success,
    },
    qualityTitle: {
      // green text — set via theme.colors.success inline
    },
    qualityText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },

    // ── Thin separator between content sections ──────────────────────
    sectionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },

    // ── Accordion section header row ─────────────────────────────────
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    accordionTitleText: { flex: 1 },
    // Expanded body area — padding only at the bottom (header has top space).
    accordionBody: {
      paddingBottom: theme.spacing.md,
    },

    // ── Attribute table rows (Product Details) ───────────────────────
    attrRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.md,
    },
    attrRowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    attrLabel: { flex: 1 },
    attrValue: { flexShrink: 1 },

    // ── Seller row (Seller Information accordion) ────────────────────
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    sellerAvatar: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerInfo: {
      flex: 1,
      gap: theme.spacing.xxs,
    },

    // ── Sticky dual-CTA footer ────────────────────────────────────────
    footerSafe: {
      backgroundColor: theme.colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    footerBtn: { flex: 1 },

    // ── Loading / error ───────────────────────────────────────────────
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      minHeight: 400,
    },
    scrollPad: {
      height: theme.spacing.xl,
    },
  });
}
