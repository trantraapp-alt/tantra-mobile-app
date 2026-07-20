// Multi-select chip group: several options can be toggled on at once. Value is
// the array of selected option values.
import { View } from 'react-native';

import { Chip, Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';

import { createCheckboxGroupStyles } from './CheckboxGroup.styles';

// An option in a checkbox group.
export interface CheckboxOption {
  // Stored value.
  value: string;
  // Display label.
  label: string;
}

// Props for the CheckboxGroup component.
export interface CheckboxGroupProps {
  // Optional field label.
  label?: string;
  // Available options.
  options: CheckboxOption[];
  // Currently selected values.
  value: string[];
  // Called with the updated selection.
  onChange: (value: string[]) => void;
  // Error message shown below the options.
  error?: string;
}

// Renders a themed multi-select chip group.
export function CheckboxGroup({
  label,
  options,
  value,
  onChange,
  error,
}: CheckboxGroupProps) {
  const styles = useThemedStyles(createCheckboxGroupStyles);

  // Toggles an option in or out of the selection.
  const toggle = (next: string) => {
    onChange(
      value.includes(next)
        ? value.filter((item) => item !== next)
        : [...value, next],
    );
  };

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
            selected={value.includes(option.value)}
            onPress={() => toggle(option.value)}
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
