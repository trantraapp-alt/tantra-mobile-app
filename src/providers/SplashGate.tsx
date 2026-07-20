// Overlays the animated launch splash above the app until its animation ends.
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { View } from 'react-native';

import { AnimatedSplash } from '@/components/loaders';
import { commonStyles } from '@/utils';

// Renders children with the animated splash layered on top until it finishes.
export function SplashGate({ children }: PropsWithChildren) {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <View style={commonStyles.flexOne}>
      {children}
      {isSplashVisible ? (
        <AnimatedSplash onFinish={() => setIsSplashVisible(false)} />
      ) : null}
    </View>
  );
}
