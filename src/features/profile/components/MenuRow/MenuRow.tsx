// Tappable settings/navigation row with a leading icon and chevron.
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createMenuRowStyles } from './MenuRow.styles';

// Props for the MenuRow component.
export interface MenuRowProps {
  // Leading icon.
  icon: LucideIcon;
  // Row label.
  label: string;
  // Press handler.
  onPress: () => void;
  // Whether to render the label and icon in a destructive tone.
  destructive?: boolean;
}

// Renders a single navigational menu row.
function MenuRowComponent({
  icon: Icon,
  label,
  onPress,
  destructive = false,
}: MenuRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createMenuRowStyles);
  const tint = destructive ? theme.colors.danger : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.iconWrapper}>
        <Icon size={theme.sizing.iconMd} color={tint} />
      </View>
      <Text
        variant="bodyMedium"
        color={destructive ? 'danger' : 'textPrimary'}
        style={styles.label}
      >
        {label}
      </Text>
      {!destructive ? (
        <ChevronRight
          size={theme.sizing.iconMd}
          color={theme.colors.textTertiary}
        />
      ) : null}
    </Pressable>
  );
}

// Memoized menu row.
export const MenuRow = memo(MenuRowComponent);
