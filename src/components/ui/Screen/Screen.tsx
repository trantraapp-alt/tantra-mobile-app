// Safe-area aware screen container providing consistent themed padding.
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/hooks';

import { createScreenStyles } from './Screen.styles';

// Props for the Screen container.
export interface ScreenProps extends PropsWithChildren {
  // Whether to apply default horizontal padding.
  padded?: boolean;
  // Safe-area edges to inset against.
  edges?: Edge[];
  // Optional style override for the content container.
  style?: ViewStyle;
  // Whether to use the surface background instead of the base background.
  variant?: 'background' | 'surface';
}

// Renders a themed, safe-area constrained screen wrapper.
export function Screen({
  children,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  variant = 'background',
}: ScreenProps) {
  const styles = useThemedStyles(createScreenStyles);
  // iOS keeps fixed bottom content (footer buttons, CTAs) close to the screen
  // edge, so drop the bottom safe-area inset there; Android keeps its inset.
  const resolvedEdges =
    Platform.OS === 'ios' ? edges.filter((edge) => edge !== 'bottom') : edges;

  return (
    <SafeAreaView
      edges={resolvedEdges}
      style={[
        styles.safeArea,
        variant === 'surface' ? styles.surface : styles.background,
      ]}
    >
      <View style={[styles.content, padded && styles.padded, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
