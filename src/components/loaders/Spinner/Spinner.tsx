// Centered activity indicator for inline and full-screen loading states.
import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createSpinnerStyles } from './Spinner.styles';

// Props for the Spinner component.
export interface SpinnerProps {
  // Spinner size preset.
  size?: 'small' | 'large';
  // Whether to fill and center within the available space.
  fullScreen?: boolean;
}

// Renders a themed activity indicator.
function SpinnerComponent({ size = 'large', fullScreen = true }: SpinnerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSpinnerStyles);

  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
}

// Memoized themed spinner.
export const Spinner = memo(SpinnerComponent);
