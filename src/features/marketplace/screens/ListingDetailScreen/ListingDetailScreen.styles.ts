// Style factory for the buyer ListingDetailScreen — HTML reference design.
//
// Structure (top → bottom):
//   white header bar (back · title · heart · share)
//   → full-bleed hero image with solid-green "Fresh Stock" badge
//   → price card (name + quantity + price + tags + meta)
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

    // ── Header (violet gradient bar w/ agri motifs) ───────────────────
    // The flat `primary` fill stays as the paint-behind while the SVG backdrop
    // mounts, so the bar never flashes white. `overflow: hidden` clips the
    // deliberately over-tall backdrop to the header's real height.
    headerSafe: {
      backgroundColor: theme.colors.primary,
      overflow: 'hidden',
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
