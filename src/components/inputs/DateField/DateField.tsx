// A date input: a labeled, bordered control that opens the native date picker
// and stores the chosen date as an ISO 'YYYY-MM-DD' string.
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { FieldLabel } from '../FieldLabel';
import { createDateFieldStyles } from './DateField.styles';

// Props for the DateField component.
export interface DateFieldProps {
  // Field label shown above the control.
  label?: string;
  // Marks the label with a red asterisk.
  required?: boolean;
  // Current value as an ISO 'YYYY-MM-DD' string (empty when unset).
  value: string;
  // Called with the newly picked ISO date string.
  onChange: (value: string) => void;
  // Placeholder shown when no date is selected.
  placeholder?: string;
  // Helper text shown below the control.
  helperText?: string;
  // Error message shown below the control.
  error?: string;
  // Earliest selectable date.
  minimumDate?: Date;
  // Latest selectable date.
  maximumDate?: Date;
}

// Parses an ISO date string into a Date, or undefined when blank/invalid.
function parseIso(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

// Formats a Date to an ISO 'YYYY-MM-DD' string in local time.
function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Renders a labeled date field backed by the native picker.
export function DateField({
  label,
  required,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createDateFieldStyles);
  const [show, setShow] = useState(false);
  const selected = parseIso(value);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      // Android's dialog dismisses itself after one interaction; iOS stays.
      if (Platform.OS !== 'ios') {
        setShow(false);
      }
      if (event.type === 'dismissed') {
        return;
      }
      if (date) {
        onChange(toIso(date));
      }
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      {label ? <FieldLabel label={label} required={required} /> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setShow((prev) => !prev)}
        style={[styles.box, error ? styles.boxError : null]}
      >
        <Text variant="body" color={selected ? 'textPrimary' : 'textTertiary'}>
          {selected ? value : (placeholder ?? '')}
        </Text>
        <Calendar size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
      </Pressable>

      {show ? (
        <DateTimePicker
          value={selected ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="textSecondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
