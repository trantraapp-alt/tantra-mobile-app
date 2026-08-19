// Decorative backdrop for the listing-detail header: the Tantra logo's two
// brand colours swept into one gradient, with faint agricultural motifs.
//
// Colour path. The palette is documented as being lifted off the logo — violet
// for the cart "T", warm orange for the cart wing. Interpolating violet
// straight into orange passes through a plum/rose midpoint, which is why the
// sweep reads as a sunset rather than as mud; the mid stop pins that plum in
// place so the blend cannot drift grey on devices that interpolate differently.
//
// The sweep runs corner to corner across the whole bar. An earlier version
// confined the orange to the last stretch of the diagonal and layered a
// separate orange disc on top — at that scale the orange read as a stain with a
// visible rim rather than as part of the gradient. Spanning the full width is
// what makes it read as intentional.
//
// Contrast. Orange is the weakest partner for white text, so it is placed at
// the start of the sweep, where only the white back pill sits over it. The
// centred title and the action icons land on plum and violet, which carry
// white comfortably.
//
// Everything is drawn with react-native-svg: the project carries no gradient
// dependency, and BrandGradient already sets this precedent.
//
// The SVG is taller than any header it backs and is clipped by the parent's
// `overflow: hidden`, which avoids measuring the header just to size a
// decoration.
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { useTheme } from '@/providers';

// Drawn height. Comfortably exceeds the header (status bar + ~56pt bar) so the
// gradient never stops short on tall-notch devices; the excess is clipped.
const BACKDROP_HEIGHT = 220;

// A leaf pointing up from its origin, ~26pt tall. Positioned and rotated by the
// wrapping <G transform>.
const LEAF_PATH =
  'M13 0 C4 8 3 20 13 26 C23 20 22 8 13 0 Z M13 4 L13 24';

// A three-grain wheat head on a short stalk, ~28pt tall.
const WHEAT_PATH =
  'M10 28 L10 12 M10 12 C4 10 3 4 10 2 C17 4 16 10 10 12 Z M10 18 C5 16 4 11 10 9 M10 18 C15 16 16 11 10 9';

// Props for the ListingHeaderBackdrop component.
export interface ListingHeaderBackdropProps {
  // Width to draw, normally the window width.
  width: number;
}

// Renders the gradient + motif backdrop behind the listing-detail header.
function ListingHeaderBackdropComponent({
  width,
}: ListingHeaderBackdropProps) {
  const theme = useTheme();
  const ink = theme.colors.onPrimary;

  return (
    <Svg
      width={width}
      height={BACKDROP_HEIGHT}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        {/* Brand orange → plum → brand violet → deep violet, corner to corner.
            The plum at 0.34 is the orange/violet blend held explicitly so the
            transition stays a sunset instead of graduating through grey. */}
        <LinearGradient id="listingHeaderFill" x1="0" y1="0" x2="1" y2="0.75">
          <Stop offset="0" stopColor={theme.colors.secondary} />
          <Stop offset="0.34" stopColor={theme.colors.plum} />
          <Stop offset="0.7" stopColor={theme.colors.primary} />
          <Stop offset="1" stopColor={theme.colors.primaryDark} />
        </LinearGradient>

        {/* A touch of light on the warm end. Kept low — orange washes out to a
            pale peach long before violet would. */}
        <LinearGradient id="listingHeaderLift" x1="0" y1="0" x2="1" y2="0.75">
          <Stop offset="0" stopColor={ink} stopOpacity={0.12} />
          <Stop offset="0.45" stopColor={ink} stopOpacity={0.04} />
          <Stop offset="1" stopColor={ink} stopOpacity={0} />
        </LinearGradient>

        {/* Ink deepens the violet end so the sweep lands on a rich base rather
            than a flat one. The themed violet-tinted charcoal keeps the dark
            end in the brand hue instead of greying it out. */}
        <LinearGradient id="listingHeaderShade" x1="0" y1="0" x2="1" y2="0.75">
          <Stop
            offset="0"
            stopColor={theme.colors.textPrimary}
            stopOpacity={0}
          />
          <Stop
            offset="0.6"
            stopColor={theme.colors.textPrimary}
            stopOpacity={0.05}
          />
          <Stop
            offset="1"
            stopColor={theme.colors.textPrimary}
            stopOpacity={0.3}
          />
        </LinearGradient>
      </Defs>

      {/* Three stacked sweeps on one diagonal: brand colours, light, shade. */}
      <Rect
        x="0"
        y="0"
        width={width}
        height={BACKDROP_HEIGHT}
        fill="url(#listingHeaderFill)"
      />
      <Rect
        x="0"
        y="0"
        width={width}
        height={BACKDROP_HEIGHT}
        fill="url(#listingHeaderLift)"
      />
      <Rect
        x="0"
        y="0"
        width={width}
        height={BACKDROP_HEIGHT}
        fill="url(#listingHeaderShade)"
      />

      {/* Two motifs only — enough to say "agriculture", few enough to stay
          quiet behind the title. Stroked outlines, not solid shapes: at this
          opacity a fill reads as a smudge, an outline still reads as a leaf. */}
      <G
        stroke={ink}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Leaf, top right, tipped away from the heart and share icons. */}
        <G
          opacity={0.16}
          transform={`translate(${width - 52}, 54) rotate(26) scale(1.6)`}
        >
          <Path d={LEAF_PATH} />
        </G>

        {/* Wheat head low on the left, below the back button. */}
        <G opacity={0.12} transform="translate(22, 104) rotate(-12) scale(1.15)">
          <Path d={WHEAT_PATH} />
        </G>
      </G>

      {/* Two grain specks for a little rhythm in the empty middle band. */}
      <G fill={ink}>
        <Circle cx={width * 0.36} cy={38} r={2.5} fillOpacity={0.14} />
        <Circle cx={width * 0.66} cy={96} r={2} fillOpacity={0.1} />
      </G>
    </Svg>
  );
}

// Memoized decorative header backdrop.
export const ListingHeaderBackdrop = memo(ListingHeaderBackdropComponent);
