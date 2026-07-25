// Style factory for the ListingCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds listing card styles from the active theme.
export function createListingCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tappable content area. alignItems is deliberately NOT set: the default
    // cross-axis 'stretch' is what makes `body` inherit the thumbnail's height,
    // which drives the whole vertical rhythm.
    content: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
    },
    // Press feedback. The radius matches the card so the fill cannot poke past
    // the corners; no overflow:'hidden' on the Card itself (it would clip the
    // soft shadow on iOS).
    contentPressed: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.cardRadius.lg,
    },

    // Bordered, rounded frame around the thumbnail. The border keeps photos
    // shot on a white background from bleeding into the light-mode card.
    // radius.sm (8) nests inside the card's cardRadius.lg (12) — step two of
    // the 12 -> 8 -> 4 radius ladder.
    imageWrap: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    // Thumbnail image filling its frame.
    image: {
      width: '100%',
      height: '100%',
    },
    // De-emphasised photo. Applied to the IMAGE, never the frame, so the 1px
    // border and its rounded corners stay crisp.
    imageDimmed: {
      opacity: theme.opacity.muted,
    },

    // Details column. Exactly two children, so all vertical slack collects in
    // ONE gap — between "which listing is this" and "what is it worth".
    // minWidth 0 stops a long unbroken token from overflowing flex on Android
    // and shoving the action rail off the card.
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'space-between',
    },

    // Name + ID, bound by the tightest gap on the card so they read as one unit.
    identity: {
      gap: theme.spacing.xxs,
    },
    // Name row. flex-start keeps the name's cap height on the photo's top edge.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
    },
    // Name takes every pixel the header slot does not.
    title: {
      flex: 1,
      minWidth: 0,
    },
    // Header slot inset. The vertical -4s make a 32dp control contribute only
    // 24dp of layout height, preserving the tight name -> ID bond. The -8 right
    // aligns the control's glyph (which sits inside its box) with the filled
    // price-row disc, whose ink reaches its box edge — the rail is aligned on
    // ink, not on boxes.
    headerActionSlot: {
      marginTop: -theme.spacing.xs,
      marginBottom: -theme.spacing.xs,
      marginRight: -theme.spacing.sm,
    },

    // ID + status, left-aligned. Never space-between: content owns the left
    // axis, chrome owns the right axis.
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Reference chip. Outlined rather than filled: outline reads as "reference",
    // fill is reserved for state and actions. The hairline is the same border
    // token used by the card and the thumbnail, and radius.xs (4) is the last
    // step of the 12 -> 8 -> 4 ladder.
    idChip: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      gap: theme.spacing.xs,
      paddingLeft: theme.spacing.xs,
      paddingRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.transparent,
    },
    // Tabular figures so IDs stack into a true column down the scroll.
    idValue: {
      fontVariant: ['tabular-nums'],
    },

    // Status dot + label. flexShrink 1 against the chip's 0: under width
    // pressure the status word gives, the reference code never does.
    statusGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      gap: theme.spacing.xs,
    },
    // Small dot instead of a solid Badge pill: avoids a wall of colour down an
    // all-active list, and avoids 11px letter-spaced type on Devanagari.
    statusDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
    },

    // Price + primary action. minHeight holds the row even when no priceAction
    // is supplied, so card height is identical on buyer-facing surfaces.
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: theme.sizing.iconXl,
    },
    // Price wrapper; collapses to an em-dash placeholder when unpriced.
    priceWrap: {
      flex: 1,
      minWidth: 0,
    },
    // Primary action on the price row. flexShrink 0 against priceWrap's flex 1
    // means a long label (Hindi "संपादित करें") wraps the price rather than
    // squashing or clipping the button.
    priceActionSlot: {
      flexShrink: 0,
    },
  });
}
