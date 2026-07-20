// Single-select segmented control for choosing one option from a small set.
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import type { SelectOption } from '@/types';

import { createSegmentedControlStyles } from './SegmentedControl.styles';
import { SegmentedControlItem } from './SegmentedControlItem';

// Props for the SegmentedControl component.
export interface SegmentedControlProps<TValue extends string> {
  // Optional field label shown above the control.
  label?: string;
  // Available options.
  options: SelectOption<TValue>[];
  // Currently selected value.
  value: TValue | undefined;
  // Called when a new option is selected.
  onChange: (value: TValue) => void;
  // Error message shown below the control.
  error?: string;
}

// Renders a themed segmented single-select control.
export function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: SegmentedControlProps<TValue>) {
  const styles = useThemedStyles(createSegmentedControlStyles);

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={styles.track}>
        {options.map((option) => (
          <SegmentedControlItem
            key={option.value}
            option={option}
            selected={option.value === value}
            onPress={onChange}
          />
        ))}
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
