// Single-select radio group for choosing one option from a small set. Its
// `inline` mode puts the label and options on one row, making it far more
// compact than a full-width segmented control.
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import type { SelectOption } from '@/types';

import { createRadioGroupStyles } from './RadioGroup.styles';

// Props for the RadioGroup component.
export interface RadioGroupProps<TValue extends string> {
  // Optional field label.
  label?: string;
  // Available options.
  options: SelectOption<TValue>[];
  // Currently selected value.
  value: TValue | undefined;
  // Called when a new option is selected.
  onChange: (value: TValue) => void;
  // Error message shown below the group.
  error?: string;
  // Places the label on the same row as the options to save vertical space.
  inline?: boolean;
}

// Renders a themed single-select radio group.
export function RadioGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
  inline = false,
}: RadioGroupProps<TValue>) {
  const styles = useThemedStyles(createRadioGroupStyles);

  return (
    <View style={styles.container}>
      <View style={inline ? styles.inlineRow : undefined}>
        {label ? (
          <Text
            variant="label"
            color="textSecondary"
            style={inline ? styles.labelInline : styles.label}
          >
            {label}
          </Text>
        ) : null}

        <View style={styles.options}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => onChange(option.value)}
                style={styles.option}
              >
                <View
                  style={[
                    styles.indicator,
                    selected && styles.indicatorSelected,
                  ]}
                >
                  {selected ? <View style={styles.dot} /> : null}
                </View>
                <Text
                  variant="body"
                  color={selected ? 'textPrimary' : 'textSecondary'}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
