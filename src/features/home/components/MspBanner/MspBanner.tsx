// A single tappable Government MSP (Minimum Support Price) info banner for the
// home screen. Purely presentational — the curated MSP copy below is not sent
// by the backend.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createMspBannerStyles } from './MspBanner.styles';

// Props for the MspBanner component.
export interface MspBannerProps {
  // Called when the banner is tapped.
  onPress?: () => void;
}

// Bilingual headline announcing the current MSP figure (mock data — the backend
// does not send this content).
const MSP_TITLE: LocalizedText = {
  en: 'Govt MSP for Wheat: ₹2,275/q',
  hi: 'गेहूँ का MSP: ₹2,275/क्विंटल',
};

// Bilingual supporting line describing the scheme and the tap affordance.
const MSP_DESC: LocalizedText = {
  en: 'Minimum Support Price 2025-26 · Tap to view all crops',
  hi: 'न्यूनतम समर्थन मूल्य 2025-26 · सभी फसलें देखने के लिए टैप करें',
};

// Landmark emoji marking the government scheme.
const MSP_EMOJI = '🏛️';

// Chevron affordance hinting the banner drills into a full crop list.
const CHEVRON = '›';

// Renders the government MSP info banner.
function MspBannerComponent({ onPress }: MspBannerProps) {
  const styles = useThemedStyles(createMspBannerStyles);
  const { language } = useTranslation();

  const title = localize(MSP_TITLE, language);
  const desc = localize(MSP_DESC, language);

  return (
    <Pressable
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
      onPress={onPress}
      disabled={!onPress}
    >
      {({ pressed }) => (
        <View
          style={[styles.banner, pressed && onPress ? styles.pressed : null]}
        >
          <Text style={styles.emoji}>{MSP_EMOJI}</Text>
          <View style={styles.content}>
            <Text variant="bodyMedium" color="primary" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" color="textSecondary" numberOfLines={2}>
              {desc}
            </Text>
          </View>
          <Text color="secondary" style={styles.chevron}>
            {CHEVRON}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Memoized government MSP info banner.
export const MspBanner = memo(MspBannerComponent);
