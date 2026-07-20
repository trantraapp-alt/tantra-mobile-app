// Decorative violet-to-orange wave rendered at the bottom of the splash.
import { memo } from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { useTheme } from '@/providers';

// Props for the SplashWave component.
export interface SplashWaveProps {
  // Width of the wave (typically the screen width).
  width: number;
  // Height of the wave band.
  height: number;
}

// Renders the layered brand-gradient wave.
function SplashWaveComponent({ width, height }: SplashWaveProps) {
  const theme = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="violetWave" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} />
          <Stop offset="1" stopColor={theme.colors.primaryDark} />
        </LinearGradient>
        <LinearGradient id="orangeWave" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={theme.colors.secondary} />
          <Stop offset="1" stopColor={theme.colors.warning} />
        </LinearGradient>
      </Defs>

      {/* Back violet wave. */}
      <Path
        d="M0,42 C22,14 40,58 62,44 C80,32 92,50 100,46 L100,100 L0,100 Z"
        fill="url(#violetWave)"
        opacity={theme.opacity.muted}
      />
      {/* Front orange wave. */}
      <Path
        d="M0,72 C26,52 52,86 74,66 C88,54 96,70 100,66 L100,100 L0,100 Z"
        fill="url(#orangeWave)"
      />
    </Svg>
  );
}

// Memoized splash wave.
export const SplashWave = memo(SplashWaveComponent);
