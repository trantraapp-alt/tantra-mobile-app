// Context published by a KeyboardAwareScrollView so descendant inputs can ask to
// be lifted above the keyboard the moment they gain focus — which covers moving
// focus from one field to a lower one while the keyboard is already open (no
// `keyboardDidShow` fires in that case). Null when an input is rendered outside
// any KeyboardAwareScrollView, in which case the ping is simply a no-op.
import { createContext, useContext } from 'react';

// The controller a focused input talks to.
export interface KeyboardAwareContextValue {
  // Called by a descendant input when it receives focus.
  onInputFocus: () => void;
}

// Nearest keyboard-aware controller, or null when there is none.
export const KeyboardAwareContext =
  createContext<KeyboardAwareContextValue | null>(null);

// Returns the nearest keyboard-aware controller (null outside one).
export function useKeyboardAware(): KeyboardAwareContextValue | null {
  return useContext(KeyboardAwareContext);
}
