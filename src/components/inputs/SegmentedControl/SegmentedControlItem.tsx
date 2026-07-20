// A single selectable segment within a SegmentedControl.
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import type { SelectOption } from '@/types';

import { createSegmentedControlStyles } from './SegmentedControl.styles';

// Props for the SegmentedControlItem component.
export interface SegmentedControlItemProps<TValue extends string> {
  // Option represented by this segment.
  option: SelectOption<TValue>;
  // Whether this segment is selected.
  selected: boolean;
  // Called with the option value when pressed.
  onPress: (value: TValue) => void;
}

// Renders a single segment.
function SegmentedControlItemComponent<TValue extends string>({
  option,
  selected,
  onPress,
}: SegmentedControlItemProps<TValue>) {
  const styles = useThemedStyles(createSegmentedControlStyles);

  // Emits the option value when the segment is pressed.
  const handlePress = useCallback(
    () => onPress(option.value),
    [onPress, option.value],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={[styles.segment, selected && styles.segmentSelected]}
    >
      <Text
        variant="label"
        color={selected ? 'onPrimary' : 'textSecondary'}
        align="center"
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

// Memoized segment. Cast preserves the generic signature through React.memo.
export const SegmentedControlItem = memo(
  SegmentedControlItemComponent,
) as typeof SegmentedControlItemComponent;
