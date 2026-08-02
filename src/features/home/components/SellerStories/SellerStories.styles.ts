// Style factory for the SellerStories rail.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Fixed geometry for the story avatars (dimensions, not colors — the palette all
// comes from theme tokens below).
// Outer gradient-feel ring diameter.
const RING_SIZE = 58;
// Padding between the ring edge and the inner avatar, revealing the primary fill.
const RING_PADDING = 2.5;
// Surface-colored band around the avatar, separating it from the ring.
const AVATAR_BORDER = 2.5;
// Cap on the name/sublabel width so long names ellipsize instead of stretching
// the rail item.
const LABEL_MAX_WIDTH = 64;

// Builds SellerStories styles from the active theme.
export function createSellerStoriesStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Section wrapper: stacks the heading above the story rail.
    section: {
      gap: theme.spacing.sm,
    },
    // Heading row owns its horizontal padding so the section runs edge-to-edge.
    header: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Horizontal rail padding + inter-story spacing.
    rail: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // A single story: avatar stacked over name + sublabel, centered.
    item: {
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Gradient-feel ring: violet fill with an orange edge, framing the avatar.
    ring: {
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.secondary,
      padding: RING_PADDING,
    },
    // Inner avatar circle carrying the emoji, ringed by a surface-colored band.
    avatar: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: AVATAR_BORDER,
      borderColor: theme.colors.surface,
    },
    // Seller name: single line, capped width.
    name: {
      maxWidth: LABEL_MAX_WIDTH,
    },
    // Listings-count sublabel: single line, capped width.
    sublabel: {
      maxWidth: LABEL_MAX_WIDTH,
    },
    // Pressed feedback applied to the whole story item.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
