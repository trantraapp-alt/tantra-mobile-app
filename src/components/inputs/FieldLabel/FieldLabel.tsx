// A field label with an optional red asterisk marking a required field. Shared
// by the form inputs so required fields read consistently across every form.
import type { StyleProp, TextStyle } from 'react-native';

import { Text, type TextProps } from '@/components/ui';

// Props for the FieldLabel component.
export interface FieldLabelProps {
  // Label text.
  label: string;
  // Whether to append a red "required" asterisk.
  required?: boolean;
  // Typography variant (defaults to the small 'label' style).
  variant?: TextProps['variant'];
  // Semantic color for the label text (the asterisk is always danger red).
  color?: TextProps['color'];
  // Optional style override.
  style?: StyleProp<TextStyle>;
}

// Renders a field label, appending a red asterisk when the field is required.
export function FieldLabel({
  label,
  required = false,
  variant = 'label',
  color = 'textSecondary',
  style,
}: FieldLabelProps) {
  return (
    <Text variant={variant} color={color} style={style}>
      {label}
      {required ? (
        <Text variant={variant} color="danger">
          {' *'}
        </Text>
      ) : null}
    </Text>
  );
}
