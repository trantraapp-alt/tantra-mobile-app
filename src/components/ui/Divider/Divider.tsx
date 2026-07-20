// Thin themed separator line for vertical or horizontal layouts.
import { memo } from 'react';
import { View } from 'react-native';

import { useThemedStyles } from '@/hooks';

import { createDividerStyles } from './Divider.styles';

// Props for the Divider component.
export interface DividerProps {
  // Orientation of the divider.
  orientation?: 'horizontal' | 'vertical';
  // Whether to apply vertical spacing around a horizontal divider.
  spaced?: boolean;
}

// Renders a hairline separator.
function DividerComponent({
  orientation = 'horizontal',
  spaced = false,
}: DividerProps) {
  const styles = useThemedStyles(createDividerStyles);

  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        spaced && orientation === 'horizontal' && styles.spaced,
      ]}
    />
  );
}

// Memoized themed divider.
export const Divider = memo(DividerComponent);
