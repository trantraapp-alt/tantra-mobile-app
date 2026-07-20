// Selectable pill-shaped chip used for filters and quick options.
import { memo } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';

import { createChipStyles } from './Chip.styles';

// Props for the Chip component.
export interface ChipProps {
  // Chip label text.
  label: string;
  // Whether the chip is currently selected.
  selected?: boolean;
  // Press handler toggling or selecting the chip.
  onPress: () => void;
}

// Renders a selectable filter chip.
function ChipComponent({ label, selected = false, onPress }: ChipProps) {
  const styles = useThemedStyles(createChipStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      <Text
        variant="label"
        color={selected ? 'onPrimary' : 'textSecondary'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Memoized themed chip.
export const Chip = memo(ChipComponent);
