// Wrapper that dismisses an open keyboard when the user taps a non-interactive
// area. React Native's responder system lets the innermost view claim a touch
// first, so inputs, buttons and scrollables keep working — only taps nothing
// else handles fall through to this wrapper. Built into `Screen`, so most
// screens get it for free; use it directly for content outside a `Screen`
// (modals, sheets, standalone overlays).
//
// Note: taps *inside* a ScrollView / FlatList never reach this wrapper — those
// lists handle their own touches. They cover themselves via
// `keyboardShouldPersistTaps` ('never' or 'handled' both dismiss on an
// unhandled tap); pair it with `keyboardDismissMode="on-drag"` so scrolling
// dismisses too.
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

// Props for the DismissKeyboardView container.
export interface DismissKeyboardViewProps extends PropsWithChildren {
  // Style applied to the wrapping view.
  style?: StyleProp<ViewStyle>;
}

// Renders children inside a tap-to-dismiss-keyboard wrapper.
export function DismissKeyboardView({
  children,
  style,
}: DismissKeyboardViewProps) {
  return (
    // `accessible={false}` keeps the wrapper out of the screen-reader tree so
    // it never swallows the focus of the controls it wraps.
    <TouchableWithoutFeedback
      accessible={false}
      onPress={() => Keyboard.dismiss()}
    >
      <View style={style}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
