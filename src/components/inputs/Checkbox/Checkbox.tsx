// A single labeled checkbox (distinct from the chip-based CheckboxGroup). Used
// for standalone boolean choices such as "Remember me" or terms acceptance.
import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createCheckboxStyles } from './Checkbox.styles';

// Props for the Checkbox component.
export interface CheckboxProps {
  // Label shown next to the box.
  label: string;
  // Whether the box is checked.
  checked: boolean;
  // Called with the next checked state when toggled.
  onChange: (checked: boolean) => void;
}

// Renders a labeled checkbox.
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createCheckboxStyles);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={theme.sizing.hitSlop}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Check
            size={theme.sizing.iconSm}
            color={theme.colors.onPrimary}
            strokeWidth={3}
          />
        ) : null}
      </View>
      <Text variant="bodyMedium" color="textSecondary">
        {label}
      </Text>
    </Pressable>
  );
}
