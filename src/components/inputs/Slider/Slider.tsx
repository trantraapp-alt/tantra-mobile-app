// A themed single-thumb slider built on rn-range-slider in single mode
// (`disableRange`). It shares RangeSlider's rail/thumb visuals so the distance
// and price sliders look identical. Pure JS (Animated + PanResponder) — no native
// module, so it ships over-the-air.
import { useCallback } from 'react';
import { View } from 'react-native';

import { useThemedStyles } from '@/hooks';
import RangeSliderNative from '@/vendor/rangeSlider';

import { createRangeSliderStyles } from '../RangeSlider/RangeSlider.styles';

// Props for the Slider component.
export interface SliderProps {
  // Inclusive bounds of the track.
  min: number;
  max: number;
  // Snap increment (defaults to 1).
  step?: number;
  // Current (controlled) value.
  value: number;
  // Called with the new value while the user drags.
  onValueChange: (value: number) => void;
  // Called when the user starts / ends dragging (e.g. to lock a parent scroll).
  onSlidingStart?: () => void;
  onSlidingEnd?: () => void;
}

// Renders a themed single-thumb slider.
export function Slider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  onSlidingStart,
  onSlidingEnd,
}: SliderProps) {
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
    (low: number, _high: number, byUser: boolean) => {
      // Only user drags update the value; programmatic fires (from the
      // controlled prop changing) would loop.
      if (byUser) {
        onValueChange(low);
      }
    },
    [onValueChange],
  );

  return (
    <RangeSliderNative
      style={styles.slider}
      disableRange
      min={min}
      max={max}
      step={step}
      low={value}
      high={max}
      renderThumb={renderThumb}
      renderRail={renderRail}
      renderRailSelected={renderRailSelected}
      onValueChanged={handleChange}
      onSliderTouchStart={onSlidingStart}
      onSliderTouchEnd={onSlidingEnd}
    />
  );
}
