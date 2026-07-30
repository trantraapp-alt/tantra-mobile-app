// Floating action button: a circular, elevated button pinned to the bottom-right
// of a screen (above the safe-area inset). Reusable for any primary "create"
// action — pass an icon and a handler.
import type { LucideIcon } from 'lucide-react-native';
import { memo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';

import { useBottomInset, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createFabStyles } from './Fab.styles';

// Props for the Fab component.
export interface FabProps {
  // Icon rendered in the center of the button.
  icon: LucideIcon;
  // Called when the button is pressed.
  onPress: () => void;
  // Accessibility label describing the action.
  accessibilityLabel: string;
  // Optional style override (e.g. to reposition or restyle).
  style?: StyleProp<ViewStyle>;
}

// Renders a floating action button pinned to the bottom-right of its parent.
function FabComponent({
  icon: Icon,
  onPress,
  accessibilityLabel,
  style,
}: FabProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createFabStyles);
  const bottomInset = useBottomInset();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // A static style array (never a function): NativeWind's cssInterop drops
      // the background and shadow when a Pressable's `style` is a function.
      style={[
        styles.fab,
        { bottom: bottomInset + theme.spacing.xl },
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <Icon size={theme.sizing.iconLg} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

// Memoized floating action button.
export const Fab = memo(FabComponent);
