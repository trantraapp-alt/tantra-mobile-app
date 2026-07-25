// Style factory for the ImageCarousel gallery frame and its overlay chrome.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds carousel styles from the active theme.
export function createImageCarouselStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Clipping frame that owns the measured page width and the corner radius.
    // The neutral fill means an unloaded page reads as an empty panel rather
    // than a white/black flash in either color scheme.
    container: {
      width: '100%',
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Horizontal pager filling the frame.
    scroll: {
      flex: 1,
    },
    // One full-width page. Concrete width AND height are injected per render
    // from the measured frame: a percentage height would resolve against the
    // horizontal scroller's content-derived cross axis and can collapse to 0.
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // The photo itself, filling its page.
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Centered layer carrying the loading spinner or the broken-image glyph.
    slideOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Panel replacing the whole gallery when the listing has no photos.
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Transparent row holding the two edge arrows; passes its own touches
    // through to the pager underneath.
    arrowLayer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
    },
    // Circular scrim behind an arrow glyph, legible over any photo in both
    // color schemes.
    arrow: {
      width: theme.sizing.buttonHeightSm,
      height: theme.sizing.buttonHeightSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlay,
    },
    // Counter pill ("3 / 7") pinned to the top-right corner.
    counter: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.overlay,
    },
    // Counter text: white in both schemes because it sits on the scrim.
    counterText: {
      color: theme.colors.onPrimary,
    },
    // Full-width layer that centers the dot pill along the bottom edge.
    dotsLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: theme.spacing.md,
      alignItems: 'center',
    },
    // Scrim pill wrapping the dot row.
    dotsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.overlay,
    },
    // A single pagination dot; width and opacity animate with scroll position.
    dot: {
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.onPrimary,
    },
  });
}
