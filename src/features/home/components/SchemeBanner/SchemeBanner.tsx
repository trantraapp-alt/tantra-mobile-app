// A single tappable promotional banner surfacing a government scheme (PM-KISAN).
// Presentational only: the curated copy below is not sent by the backend.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createSchemeBannerStyles } from './SchemeBanner.styles';

// Bilingual headline for the scheme banner.
const TITLE: LocalizedText = {
  en: 'PM-KISAN — ₹6,000/year direct to your account',
  hi: 'पीएम-किसान — ₹6,000/वर्ष सीधे आपके खाते में',
};

// Bilingual supporting line for the scheme banner.
const DESC: LocalizedText = {
  en: 'Check eligibility · Apply online · Instant status',
  hi: 'पात्रता जांचें · ऑनलाइन आवेदन करें · तुरंत स्थिति देखें',
};

// Props for the SchemeBanner component.
export interface SchemeBannerProps {
  // Called when the banner is tapped.
  onPress?: () => void;
}

// Renders the tappable government-scheme banner.
function SchemeBannerComponent({ onPress }: SchemeBannerProps) {
  const styles = useThemedStyles(createSchemeBannerStyles);
  const { language } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={localize(TITLE, language)}
      onPress={onPress}
      disabled={!onPress}
    >
      {({ pressed }) => (
        <View style={[styles.banner, pressed && onPress ? styles.pressed : null]}>
          <Text style={styles.emoji}>🇮🇳</Text>
          <View style={styles.body}>
            <Text
              variant="bodyMedium"
              color="onPrimary"
              style={styles.title}
              numberOfLines={2}
            >
              {localize(TITLE, language)}
            </Text>
            <Text
              variant="caption"
              color="onPrimary"
              style={styles.desc}
              numberOfLines={2}
            >
              {localize(DESC, language)}
            </Text>
          </View>
          <Text variant="h2" color="onPrimary" style={styles.chevron}>
            ›
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Memoized scheme banner.
export const SchemeBanner = memo(SchemeBannerComponent);
