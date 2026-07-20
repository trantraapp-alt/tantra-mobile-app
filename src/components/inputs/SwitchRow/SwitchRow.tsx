// Labeled boolean toggle row built on the native Switch.
import { Switch, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createSwitchRowStyles } from './SwitchRow.styles';

// Props for the SwitchRow component.
export interface SwitchRowProps {
  // Row label.
  label: string;
  // Optional helper text below the label.
  help?: string;
  // Current on/off value.
  value: boolean;
  // Called when toggled.
  onValueChange: (value: boolean) => void;
}

// Renders a labeled switch row.
export function SwitchRow({ label, help, value, onValueChange }: SwitchRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSwitchRowStyles);

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="bodyMedium">{label}</Text>
        {help ? (
          <Text variant="caption" color="textSecondary">
            {help}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor={theme.colors.onPrimary}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}
