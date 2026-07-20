// Single-select chip group for choosing one option from a small set. Chips wrap
// onto multiple rows, so it handles more options than a segmented control while
// staying compact and tappable.
import { View } from 'react-native';

import { Chip, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import type { SelectOption } from '@/types';

import { createChipSelectStyles } from './ChipSelect.styles';

// Props for the ChipSelect component.
export interface ChipSelectProps<TValue extends string> {
  // Optional field label.
  label?: string;
  // Available options.
  options: SelectOption<TValue>[];
  // Currently selected value.
  value: TValue | undefined;
  // Called when an option is selected.
  onChange: (value: TValue) => void;
  // Error message shown below the chips.
  error?: string;
}

// Renders a themed single-select chip group.
export function ChipSelect<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: ChipSelectProps<TValue>) {
  const styles = useThemedStyles(createChipSelectStyles);

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
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
