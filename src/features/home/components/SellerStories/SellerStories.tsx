// Presentational "Top Sellers" section: an h4 heading followed by a horizontal
// rail of Instagram-style "story" avatars. Each story is a gradient-feel ring
// (violet fill + orange edge) around an emoji avatar, with the seller's name and
// a listings count beneath it. The sellers are curated on the client (the
// backend does not send this content); tapping a story fires `onPress` with the
// localized seller name.
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createSellerStoriesStyles } from './SellerStories.styles';

// Bilingual heading for the section (the emoji renders as plain string content).
const SECTION_TITLE: LocalizedText = {
  en: '🏆 Top Sellers',
  hi: '🏆 शीर्ष विक्रेता',
};

// Trailing noun after the count in the sublabel (e.g. "45 listings").
const LISTINGS_LABEL: LocalizedText = {
  en: 'listings',
  hi: 'लिस्टिंग',
};

// A single curated top seller shown in the rail.
interface Seller {
  // Stable key for the list.
  id: string;
  // Bilingual seller name shown under the avatar.
  name: LocalizedText;
  // Emoji rendered large inside the avatar circle.
  emoji: string;
  // Number of active listings, rendered in the sublabel.
  listings: number;
}

// Curated top sellers. Static content, so it lives inline rather than coming
// from the API.
const SELLERS: readonly Seller[] = [
  {
    id: 'krishnamurthy',
    name: { en: 'Krishnamurthy', hi: 'कृष्णमूर्ति' },
    emoji: '🌱',
    listings: 45,
  },
  {
    id: 'satish-dairy',
    name: { en: 'Satish Dairy', hi: 'सतीश डेयरी' },
    emoji: '🐄',
    listings: 28,
  },
  {
    id: 'shree-agro',
    name: { en: 'Shree Agro', hi: 'श्री एग्रो' },
    emoji: '🌿',
    listings: 18,
  },
  {
    id: 'kisan-equip',
    name: { en: 'Kisan Equip.', hi: 'किसान इक्विप.' },
    emoji: '🚜',
    listings: 12,
  },
  {
    id: 'ramesh-patil',
    name: { en: 'Ramesh Patil', hi: 'रमेश पाटील' },
    emoji: '👨‍🌾',
    listings: 12,
  },
  {
    id: 'nashik-poultry',
    name: { en: 'Nashik Poultry', hi: 'नाशिक पोल्ट्री' },
    emoji: '🐔',
    listings: 8,
  },
];

// Props for the SellerStories component.
export interface SellerStoriesProps {
  // Called with the localized seller name when a story is tapped.
  onPress?: (name: string) => void;
}

// Renders the top-sellers heading + horizontal story rail.
function SellerStoriesComponent({ onPress }: SellerStoriesProps) {
  const styles = useThemedStyles(createSellerStoriesStyles);
  const { language } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="h4">{localize(SECTION_TITLE, language)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {SELLERS.map((seller) => {
          const name = localize(seller.name, language);
          const sublabel = `${seller.listings} ${localize(
            LISTINGS_LABEL,
            language,
          )}`;
          return (
            <Pressable
              key={seller.id}
              accessibilityRole="button"
              accessibilityLabel={name}
              onPress={onPress ? () => onPress(name) : undefined}
              disabled={!onPress}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.item,
                    pressed && onPress ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.ring}>
                    <View style={styles.avatar}>
                      <Text variant="h2" align="center">
                        {seller.emoji}
                      </Text>
                    </View>
                  </View>
                  <Text
                    variant="label"
                    align="center"
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {name}
                  </Text>
                  <Text
                    variant="caption"
                    color="textTertiary"
                    align="center"
                    numberOfLines={1}
                    style={styles.sublabel}
                  >
                    {sublabel}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Memoized top-sellers story rail.
export const SellerStories = memo(SellerStoriesComponent);
