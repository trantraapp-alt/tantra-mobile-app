// Clean type surface for rn-range-slider (see rangeSlider.js for why this shim
// exists). Declares only the props we use.
import type { ComponentType, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface RangeSliderNativeProps {
  style?: StyleProp<ViewStyle>;
  min: number;
  max: number;
  step?: number;
  low?: number;
  high?: number;
  disableRange?: boolean;
  disabled?: boolean;
  floatingLabel?: boolean;
  renderThumb: (name: 'high' | 'low') => ReactNode;
  renderRail: () => ReactNode;
  renderRailSelected: () => ReactNode;
  renderLabel?: (value: number) => ReactNode;
  renderNotch?: () => ReactNode;
  onValueChanged?: (low: number, high: number, byUser: boolean) => void;
  onSliderTouchStart?: (low: number, high: number) => void;
  onSliderTouchEnd?: (low: number, high: number) => void;
}

declare const RangeSliderNative: ComponentType<RangeSliderNativeProps>;
export default RangeSliderNative;
