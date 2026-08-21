// Field motif beside the "Choose a category" heading: a leaf sprig over rolling
// ground, with a farmhouse on the horizon and two furrows below it.
//
// Drawn with react-native-svg — the project carries no illustration assets —
// in the screen's accent, so the motif follows the module it decorates. The
// leaves are filled in the accent's palest shade and outlined in its solid one,
// which is what separates them from the ground behind; everything else is a
// thin, faded stroke so the drawing stays a backdrop to the heading and never
// competes with it.
import { memo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

// Drawing space the paths below are laid out in; the rendered size scales it.
const VIEW_WIDTH = 132;
const VIEW_HEIGHT = 72;

// A leaf pointing up from its origin, ~28pt tall, and the rib inside it.
const LEAF_PATH = 'M0 0 C-9 8 -10 22 0 28 C10 22 9 8 0 0 Z';
const LEAF_RIB_PATH = 'M0 5 L0 25';

// The stem the two leaves sit on, trailing off to the right.
const STEM_PATH = 'M10 34 C20 29 30 26 44 25';

// Two field lines: the far horizon and the near rise the house stands on.
const HILL_FAR_PATH = 'M2 44 C22 28 46 28 64 40 C80 50 102 44 132 37';
const HILL_NEAR_PATH = 'M12 55 C38 43 60 47 84 53 C102 57 118 55 132 51';

// A farmhouse: gable roof, walls, door.
const HOUSE_PATH =
  'M0 13 L11 3 L22 13 M3 13 V27 H19 V13 M9 27 V20 H13 V27';

// Two furrows in the foreground, offset so they read as ploughed ground.
const FURROW_PATH = 'M16 64 L52 64 M64 68 L102 68';

// Props for the SellCategoryDecor component.
export interface SellCategoryDecorProps {
  // Rendered width in points; the height follows the motif's aspect ratio.
  width: number;
  // Outline colour, normally the accent's solid shade.
  color: string;
  // Fill for the leaves, normally the accent's palest shade.
  leafFill: string;
}

// Renders the heading's field motif.
function SellCategoryDecorComponent({
  width,
  color,
  leafFill,
}: SellCategoryDecorProps) {
  const height = (width * VIEW_HEIGHT) / VIEW_WIDTH;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      pointerEvents="none"
    >
      <G
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Ground first, so the sprig reads as standing in front of it. */}
        <G opacity={0.45}>
          <Path d={HILL_FAR_PATH} />
        </G>
        <G opacity={0.3}>
          <Path d={HILL_NEAR_PATH} />
          <Path d={FURROW_PATH} />
        </G>

        <G opacity={0.4} transform="translate(100, 24)">
          <Path d={HOUSE_PATH} />
        </G>

        {/* The sprig: a tall leaf with a smaller one tucked behind it. */}
        <G opacity={0.85}>
          <Path d={STEM_PATH} opacity={0.6} />
          <G transform="translate(26, 2) rotate(-16)">
            <Path d={LEAF_PATH} fill={leafFill} />
            <Path d={LEAF_RIB_PATH} opacity={0.7} />
          </G>
          <G transform="translate(47, 13) rotate(26) scale(0.62)">
            <Path d={LEAF_PATH} fill={leafFill} />
            <Path d={LEAF_RIB_PATH} opacity={0.7} />
          </G>
        </G>
      </G>
    </Svg>
  );
}

// Memoized heading motif.
export const SellCategoryDecor = memo(SellCategoryDecorComponent);
