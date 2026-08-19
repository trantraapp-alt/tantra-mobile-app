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
      // `background` is pure white in the light scheme — identical to `card`,
      // which makes the cards invisible. `surfaceVariant` is the muted gray
      // that lets each white card read as a distinct block.
      backgroundColor: theme.colors.surfaceVariant,
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
    // Separate padding for the price card (16px vs shared 12px).
    priceCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      ...theme.shadows.low,
    },
    // Row 1: price + strike + discount badge — center-aligned so the badge
    // (a View) lines up with the text correctly.
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Hero price — large, bold, tight letter-spacing.
    priceMain: {
      letterSpacing: -1,
      fontVariant: ['tabular-nums'],
    },
    // Compare-at price — body size, muted, struck through.
    priceStrike: {
      textDecorationLine: 'line-through',
    },
    // Amber tint pill for discount % — light bg, amber text.
    discountBadge: {
      backgroundColor: 'rgba(245,158,11,0.15)',
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
    },
    discountText: {
      color: theme.colors.warning,
      fontWeight: '700',
    },
    // Row 2: title text + filled green verified circle sitting right beside it.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,         // 8px — breathing room between title and tick
      marginTop: theme.spacing.xs,
    },
    // `flexShrink` (not `flex: 1`) so the tick sits next to the text rather
    // than being pushed to the far right of the card.
    titleText: { flexShrink: 1 },
    // Filled success-green circle with white checkmark inside — small, so it
    // reads as a marker beside the title rather than competing with it.
    verifiedCircle: {
      width: 15,
      height: 15,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    // Row 3: type pill + negotiable pill.
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    // Listing type: SELL — filled success green, white text.
    tagSell: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    // Listing type: RENT — filled warning amber, white text.
    tagRent: {
      backgroundColor: theme.colors.warning,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    // Negotiable / Not Negotiable — same treatment as FeedListingCard:
    // filled success green / filled warning amber, both with white text.
    tagNegotiable: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    tagNotNegotiable: {
      backgroundColor: theme.colors.warning,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    // Shared text style for all tag pills — slight letter-spacing like HTML.
    tagText: {
      letterSpacing: 0.4,
    },
    // Row 4: 📍 City, State  and  ⏰ time ago — single row, wraps if tight.
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xl,          // 20px between location and time
      marginTop: theme.spacing.md,
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
    // HTML: padding 14px 6px, gap 4px, centered column.
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    // Left border for all stat columns except the first (HTML uses border-right
    // on all but the last — visually identical).
    statItemBorder: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: theme.colors.border,
    },
    // HTML .stat-value — 15px, weight 700, ink, tabular-nums, line-height 1.
    statValue: {
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    // The 4th column's "Quality" value is a word, not a numeral — HTML renders
    // it smaller and in green rather than the default dark numeral style.
    statValueQuality: {
      fontWeight: '700',
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
    // Animated clipping window. Its height is driven by Reanimated; `hidden`
    // keeps the (still-mounted) content from spilling out while collapsed.
    accordionClip: {
      overflow: 'hidden',
    },
    // Absolutely positioned so the content's natural height is measurable via
    // onLayout without feeding back into the animated parent's height.
    accordionMeasure: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: theme.spacing.md,
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
      backgroundColor: theme.colors.surfaceVariant,
    },

    // ── Seller Information ─────────────────────────────────────────────
    // HTML .seller-header — avatar + info on the left, chevron pinned right.
    sellerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // HTML .seller-info — avatar and the text block travel together.
    sellerInfoRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // HTML .seller-avatar — 48×48 rounded square, tinted fill + 2px border.
    sellerAvatar: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sellerInfo: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // HTML .seller-name — name text with the verified tick right beside it.
    sellerNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    // HTML .divider — hairline rule, 12px of air on each side.
    sellerDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    // HTML .seller-badges — 2-column grid, 8px gutters both axes.
    // RN has no grid, so: wrap row + 48.5% cells leaves a ~3% gutter.
    sellerBadgeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: theme.spacing.sm,
    },
    // HTML .seller-badge-item — tinted tile, 8px radius, 8×10 padding.
    sellerBadge: {
      width: '48.5%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    // Text column shrinks so a long value truncates instead of pushing the icon.
    sellerBadgeTexts: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // HTML .badge-label — uppercase, tracked-out micro label.
    sellerBadgeLabel: {
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    // HTML .badge-val — bold value line.
    sellerBadgeValue: {
      fontWeight: '700',
    },

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
    // `paddingBottom` is applied inline from the safe-area inset — see
    // `footerPadBottom` in the screen.
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
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
    // "View Contact Details" — filled primary (violet), full width (chat hidden).
    contactBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.lg,  // taller than before (lg = 16px)
      gap: theme.spacing.xxs,
    },
    contactBtnInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
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
