// Bottom safe-area inset used to pad fixed bottom content (tab bar, sheet
// actions, footer buttons). On iOS this intentionally returns 0 so those
// elements sit close to the screen edge instead of floating above the home
// indicator; Android keeps its real system inset.
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Returns the bottom inset to pad by (0 on iOS, the system inset on Android).
export function useBottomInset(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? 0 : insets.bottom;
}
