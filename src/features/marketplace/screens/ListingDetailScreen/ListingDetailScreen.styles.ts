// Style factory for the buyer ListingDetailScreen — HTML reference design.
//
// Structure (top → bottom):
//   white header bar (back · title · heart · share)
//   → full-bleed hero image with solid-green "Fresh Stock" badge
//   → price card (price + title + tags + meta)
//   → stats card  (views · contacts · quintal · quality — gray icons, dark text)
//   → quality-assured card (green tint, clickable)
//   → accordion cards: About · Product Details · Seller · Location
//   → SimilarListings rail
//   → sticky footer (chat outlined | contact filled w/ subtitle)
//
// All dimensions, colours and radii are resolved from the active theme.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createListingDetailStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: { flex: 1 },

    // ── Header (solid primary / violet bar) ───────────────────────────
    headerSafe: {
      backgroundColor: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      // Extra bottom padding balances the status-bar height added by SafeAreaView
      // above, so the buttons sit centred in the visible bar rather than near
      // the bottom edge.
      paddingBottom: theme.spacing.xl,
    },
    // "Listing Details" — white centered title.
    headerTitle: {
      flex: 1,
      textAlign: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    // Back button: white pill so it pops off the violet background.
    backBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
    },

    // ── Hero image area ───────────────────────────────────────────────
    heroWrap: {},
    // "Fresh Stock" — solid filled green pill (not outlined), white text.
    freshBadge: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      backgroundColor: theme.colors.success,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },

    // ── Shared section card ───────────────────────────────────────────
    // Every content block (price, stats, quality, accordions) lives in one of
    // these to give the gray-background gap between sections.
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      ...theme.shadows.low,
    },

    // ── Price card ────────────────────────────────────────────────────
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
    },
    priceStrike: {
      textDecorationLine: 'line-through',
    },
    discountBadge: {
      backgroundColor: theme.colors.warning,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    titleText: { flex: 1 },
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    // Negotiable — OUTLINED green (transparent bg, colored border + text).
    // NOTE: Listing type (Sell / Rent) uses the <Badge> component — no style here.
    tagNegotiable: {
      borderWidth: 1.5,
      borderColor: theme.colors.success,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Not Negotiable — filled amber (same as FeedListingCard).
    tagNotNegotiable: {
      backgroundColor: theme.colors.warning,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Small dot separator between location and time-ago in the meta row.
    metaDot: {
      width: 4,
      height: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.textTertiary,
    },

    // ── Stats card (4 columns, gray icons, dark numerals) ─────────────
    statsCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      overflow: 'hidden',
      ...theme.shadows.low,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    // Left border for all stat columns except the first.
    statItemBorder: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: theme.colors.border,
    },

    // ── Quality Assured card (green-tint, pressable row) ──────────────
    qualityCard: {
      backgroundColor: theme.colors.successLight,
      borderRadius: theme.radius.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // White circle containing the ShieldCheck icon.
    qualityIconCircle: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...theme.shadows.soft,
    },
    qualityTexts: {
      flex: 1,
      gap: theme.spacing.xxs,
    },

    // ── Accordion section header (shared by all accordion cards) ──────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionTitleText: { flex: 1 },
    // Expanded accordion body — top margin only (header gives the visual top gap).
    accordionBody: {
      marginTop: theme.spacing.md,
    },

    // "Read more / Read less" link below the About description.
    readMore: {
      marginTop: theme.spacing.xs,
    },

    // ── Product Details — 2-column grid ───────────────────────────────
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: theme.radius.sm,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    // Each cell is 50% wide. Cells at odd indices get the alt (background) color.
    detailCell: {
      width: '50%',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    detailCellAlt: {
      backgroundColor: theme.colors.background,
    },

    // ── Seller Information ─────────────────────────────────────────────
    sellerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Rounded-square avatar (not a pill) — primary/violet tint bg + primary border.
    sellerAvatar: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sellerInfo: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    sellerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    sellerDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    // Outer container: stacks the two badge rows vertically.
    sellerBadgeGrid: {
      gap: theme.spacing.xs,
    },
    // 2-column grid row for seller badge items.
    sellerBadgeRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    sellerBadge: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.xs,
    },
    sellerBadgeTexts: { gap: theme.spacing.xxs },

    // ── Location card ─────────────────────────────────────────────────
    locationContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    locationText: { flex: 1 },
    // "View on Map" button — primary-tint bg, primary text + nav icon.
    mapBtn: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      flexShrink: 0,
    },

    // ── Sticky footer ─────────────────────────────────────────────────
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
    // "Chat with Seller" — outlined primary (violet), flex 1.
    chatBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      backgroundColor: 'transparent',
    },
    // "View Contact Details" — filled primary (violet), flex 1.6 (wider).
    contactBtn: {
      flex: 1.6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
    contactBtnInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },

    // ── Loading / error ───────────────────────────────────────────────
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      minHeight: 400,
    },
    // Spacer between the last section card and the SimilarListings rail.
    sectionGap: {
      height: theme.spacing.xl,
    },
    scrollPad: {
      height: theme.spacing.xxl * 2,
    },
  });
}
