// A themed two-thumb range slider backed by rn-range-slider (a pure-JS library —
// Animated + PanResponder, no native module — so it ships over-the-air). Wrapped
// so callers get a small API — min/max/step + low/high + onValueChange — with the
// rail/thumb visuals coming from the theme.
import { useCallback } from 'react';
import { View } from 'react-native';

import { useThemedStyles } from '@/hooks';
import RangeSliderNative from '@/vendor/rangeSlider';

import { createRangeSliderStyles } from './RangeSlider.styles';

// Props for the RangeSlider component.
export interface RangeSliderProps {
  // Inclusive bounds of the track.
  min: number;
  max: number;
  // Snap increment (defaults to 1).
  step?: number;
  // Current low / high thumb values.
  low: number;
  high: number;
  // Called with the new low / high while dragging.
  onValueChange: (low: number, high: number) => void;
  // Called when the user starts / ends dragging (e.g. to lock a parent scroll).
  onSlidingStart?: () => void;
  onSlidingEnd?: () => void;
}

// Renders a themed two-thumb range slider.
export function RangeSlider({
  min,
  max,
  step = 1,
  low,
  high,
  onValueChange,
  onSlidingStart,
  onSlidingEnd,
}: RangeSliderProps) {
  const styles = useThemedStyles(createRangeSliderStyles);

  const renderThumb = useCallback(
    () => <View style={styles.thumb} />,
    [styles.thumb],
  );
  const renderRail = useCallback(
    () => <View style={styles.rail} />,
    [styles.rail],
  );
  const renderRailSelected = useCallback(
    () => <View style={styles.railSelected} />,
    [styles.railSelected],
  );
  const handleChange = useCallback(
    (lowValue: number, highValue: number, byUser: boolean) => {
      // Only user drags should report a value. This slider also fires when its
      // controlled low/high props change; forwarding those would ping-pong the
      // value back and forth in an infinite loop.
      if (byUser) {
        onValueChange(lowValue, highValue);
      }
    },
    [onValueChange],
  );

  return (
    <RangeSliderNative
      style={styles.slider}
      min={min}
      max={max}
      step={step}
      low={low}
      high={high}
      renderThumb={renderThumb}
      renderRail={renderRail}
      renderRailSelected={renderRailSelected}
      onValueChanged={handleChange}
      onSliderTouchStart={onSlidingStart}
      onSliderTouchEnd={onSlidingEnd}
    />
  );
}
