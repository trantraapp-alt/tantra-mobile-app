// Safe-area aware screen container providing consistent themed padding. Also
// dismisses an open keyboard on a tap outside any input (see `DismissKeyboardView`).
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/hooks';

import { DismissKeyboardView } from '../DismissKeyboardView';
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
  // Whether a tap on a non-interactive area dismisses the keyboard. On by
  // default; opt out only for screens that manage keyboard focus themselves.
  dismissKeyboardOnTap?: boolean;
}

// Renders a themed, safe-area constrained screen wrapper.
export function Screen({
  children,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  variant = 'background',
  dismissKeyboardOnTap = true,
}: ScreenProps) {
  const styles = useThemedStyles(createScreenStyles);
  // iOS keeps fixed bottom content (footer buttons, CTAs) close to the screen
  // edge, so drop the bottom safe-area inset there; Android keeps its inset.
  const resolvedEdges =
    Platform.OS === 'ios' ? edges.filter((edge) => edge !== 'bottom') : edges;

  // The dismiss wrapper replaces the content view rather than nesting inside
  // it, so enabling it adds no extra layout node.
  const contentStyle = [styles.content, padded && styles.padded, style];

  return (
    <SafeAreaView
      edges={resolvedEdges}
      style={[
        styles.safeArea,
        variant === 'surface' ? styles.surface : styles.background,
      ]}
    >
      {dismissKeyboardOnTap ? (
        <DismissKeyboardView style={contentStyle}>
          {children}
        </DismissKeyboardView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}
