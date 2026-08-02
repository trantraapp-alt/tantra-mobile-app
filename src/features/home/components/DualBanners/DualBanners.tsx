// Two side-by-side promotional mini banners for the home screen: a primary
// "seeds sale" banner and a secondary "rent a tractor" banner. Purely
// presentational — the curated copy below is not sent by the backend.
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createDualBannersStyles } from './DualBanners.styles';

// Which banner a press originated from.
type BannerSide = 'left' | 'right';

// Props for the DualBanners component.
export interface DualBannersProps {
  // Called with the tapped banner's side.
  onPress?: (which: BannerSide) => void;
}

// A single curated banner's content.
interface BannerData {
  // Side identifier reported back on press.
  side: BannerSide;
  // Bilingual headline.
  title: LocalizedText;
  // Bilingual supporting line.
  subtitle: LocalizedText;
}

// Curated banner copy (mock data — the backend does not send this content).
const BANNERS: readonly BannerData[] = [
  {
    side: 'left',
    title: { en: '🌱 Kharif Seeds Sale', hi: '🌱 खरीफ बीज सेल' },
    subtitle: {
      en: 'Upto 20% off · Limited stock',
      hi: '20% तक की छूट · सीमित स्टॉक',
    },
  },
  {
    side: 'right',
    title: { en: '🚜 Rent a Tractor', hi: '🚜 ट्रैक्टर किराए पर लें' },
    subtitle: {
      en: 'Starting ₹800/day · Near you',
      hi: '₹800/दिन से शुरू · आपके पास',
    },
  },
];

// Renders the two-up promotional banner row.
function DualBannersComponent({ onPress }: DualBannersProps) {
  const styles = useThemedStyles(createDualBannersStyles);
  const { language } = useTranslation();

  return (
    <View style={styles.row}>
      {BANNERS.map((banner) => {
        const title = localize(banner.title, language);
        const subtitle = localize(banner.subtitle, language);
        const fill =
          banner.side === 'left' ? styles.bannerLeft : styles.bannerRight;
        return (
          <Pressable
            key={banner.side}
            style={styles.pressable}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${subtitle}`}
            onPress={onPress ? () => onPress(banner.side) : undefined}
            disabled={!onPress}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.banner,
                  fill,
                  pressed && onPress ? styles.pressed : null,
                ]}
              >
                <View style={styles.circle} />
                <View style={styles.content}>
                  <Text variant="bodyMedium" color="onPrimary" numberOfLines={1}>
                    {title}
                  </Text>
                  <Text variant="caption" color="onPrimary" numberOfLines={1}>
                    {subtitle}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Memoized dual promotional banners.
export const DualBanners = memo(DualBannersComponent);
