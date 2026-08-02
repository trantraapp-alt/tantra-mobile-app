// A drop-in ScrollView that keeps the focused input visible above the on-screen
// keyboard. It exists because Android's default (`adjustResize`) only shrinks
// the window — it never scrolls a bottom field out from behind the keyboard —
// so a field tapped near the bottom stays hidden.
//
// On Android this component:
//   • listens for `keyboardDidShow`, then measures the focused input and scrolls
//     it up so its bottom clears the keyboard by a small gap;
//   • pads the content by the keyboard height so even the last field has room to
//     scroll up; and
//   • publishes a context the shared inputs ping on focus, so moving between
//     fields while the keyboard stays open re-lifts the new field too.
// On iOS it defers to the platform's native `automaticallyAdjustKeyboardInsets`,
// which already handles both cases, so the manual work is skipped entirely.
//
// Being pure JS (no native module), it ships over the air like any other change.
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  ScrollView,
  type ScrollViewProps,
  TextInput,
} from 'react-native';

import { KeyboardAwareContext } from './KeyboardAwareContext';

const IS_IOS = Platform.OS === 'ios';
// Breathing room kept between the focused field and the top of the keyboard.
const FOCUS_GAP = 24;

// A focused native input exposes `measureInWindow`; RN's types don't surface the
// return shape of `currentlyFocusedInput()`, so we describe just what we use.
interface MeasurableInput {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
}

// Reads the currently focused native text input, if any.
function currentlyFocusedInput(): MeasurableInput | null {
  const state = TextInput.State as unknown as {
    currentlyFocusedInput?: () => MeasurableInput | null;
  };
  return state.currentlyFocusedInput?.() ?? null;
}

// Props mirror ScrollView exactly — this is a transparent replacement.
export type KeyboardAwareScrollViewProps = ScrollViewProps;

// Renders a keyboard-aware ScrollView.
export const KeyboardAwareScrollView = forwardRef<
  ScrollView,
  KeyboardAwareScrollViewProps
>(function KeyboardAwareScrollView(
  {
    children,
    contentContainerStyle,
    onScroll,
    scrollEventThrottle,
    keyboardShouldPersistTaps,
    keyboardDismissMode,
    automaticallyAdjustKeyboardInsets,
    ...rest
  },
  ref,
) {
  const scrollRef = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => scrollRef.current as ScrollView, []);

  // Live scroll offset, so a lift is applied relative to the current position.
  const offsetRef = useRef(0);
  // Latest keyboard height (ref for callbacks, state for the padding style).
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Scrolls the focused input up until its bottom clears the keyboard.
  const liftFocusedInput = useCallback(() => {
    if (IS_IOS) {
      return;
    }
    const height = keyboardHeightRef.current;
    const focused = currentlyFocusedInput();
    const scroll = scrollRef.current;
    if (height <= 0 || !focused?.measureInWindow || !scroll) {
      return;
    }
    const screenHeight = Dimensions.get('window').height;
    // One frame of slack so the resize-driven layout has settled before we read
    // the input's position; measuring too early yields its pre-resize location.
    requestAnimationFrame(() => {
      focused.measureInWindow?.((_x, y, _width, inputHeight) => {
        const keyboardTop = screenHeight - height;
        const overlap = y + inputHeight - keyboardTop + FOCUS_GAP;
        if (overlap > 0) {
          scroll.scrollTo({ y: offsetRef.current + overlap, animated: true });
        }
      });
    });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = event.nativeEvent.contentOffset.y;
      onScroll?.(event);
    },
    [onScroll],
  );

  useEffect(() => {
    if (IS_IOS) {
      return;
    }
    const onShow = (event: KeyboardEvent) => {
      const height = event.endCoordinates?.height ?? 0;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
      liftFocusedInput();
    };
    const onHide = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    };
    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [liftFocusedInput]);

  const contextValue = useMemo(
    () => ({ onInputFocus: liftFocusedInput }),
    [liftFocusedInput],
  );

  return (
    <KeyboardAwareContext.Provider value={contextValue}>
      <ScrollView
        {...rest}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle ?? 16}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps ?? 'handled'}
        keyboardDismissMode={
          keyboardDismissMode ?? (IS_IOS ? 'interactive' : 'on-drag')
        }
        automaticallyAdjustKeyboardInsets={
          automaticallyAdjustKeyboardInsets ?? IS_IOS
        }
        contentContainerStyle={[
          contentContainerStyle,
          !IS_IOS && keyboardHeight > 0
            ? { paddingBottom: keyboardHeight + FOCUS_GAP }
            : null,
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAwareContext.Provider>
  );
});
