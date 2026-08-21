// The wash of colour behind a module screen's header: a soft radial bloom in
// the module's accent, anchored to the top-right corner and fading out before
// it reaches the content.
//
// It is what stops the screen reading as a plain white page — the header, the
// tabs and the first row of cards all sit inside it. Drawn with
// react-native-svg because the project carries no gradient dependency, and
// kept to the accent's palest shade so text over it never loses contrast.
import { memo } from 'react';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/providers';

import { type AccentKey, getAccentColors } from '../../utils';

// Props for the SellModuleGlow component.
export interface SellModuleGlowProps {
  // Width to draw, normally a fraction of the window.
  width: number;
  // Height to draw.
  height: number;
  // Accent the bloom takes (the owning module's colour).
  accent?: AccentKey;
}

// Renders the header's accent bloom.
function SellModuleGlowComponent({
  width,
  height,
  accent = 'primary',
}: SellModuleGlowProps) {
  const theme = useTheme();
  const colors = getAccentColors(theme, accent);

  return (
    <Svg
      width={width}
      height={height}
      pointerEvents="none"
    >
      <Defs>
        {/* Centred on the top-right corner, gone by 70% of the radius — the
            same falloff the design uses, so the bloom never reaches the
            cards and flattens their own tints. */}
        <RadialGradient id="moduleGlow" cx="100%" cy="0%" r="100%">
          <Stop offset="0" stopColor={colors.surface} stopOpacity={1} />
          <Stop offset="0.7" stopColor={colors.surface} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#moduleGlow)"
      />
    </Svg>
  );
}

// Memoized header bloom.
export const SellModuleGlow = memo(SellModuleGlowComponent);
