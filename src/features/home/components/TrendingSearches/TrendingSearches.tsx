// Presentational "Trending Searches" section: an uppercase label row followed
// by a horizontal rail of tappable search chips. The trending terms are curated
// on the client (the backend does not send this content); tapping a chip fires
// `onSearch` with the plain term (emoji stripped).
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createTrendingSearchesStyles } from './TrendingSearches.styles';

// Bilingual heading for the section (the emoji renders as plain string content).
const SECTION_LABEL: LocalizedText = {
  en: '🔥 Trending Searches',
  hi: '🔥 ट्रेंडिंग खोज',
};

// A single curated trending term. `label` is what the chip shows (with a leading
// emoji); `term` is the plain query handed to `onSearch`.
interface TrendingTerm {
  // Display label including a leading emoji.
  label: string;
  // Plain search term without emoji.
  term: string;
}

// Curated trending searches shown in the rail.
const TRENDING_TERMS: readonly TrendingTerm[] = [
  { label: '🌾 Wheat', term: 'Wheat' },
  { label: '🐄 Gir Cow', term: 'Gir Cow' },
  { label: '🚜 Rotavator', term: 'Rotavator' },
  { label: '🌿 BT Cotton', term: 'BT Cotton' },
  { label: '🍅 Tomato Seeds', term: 'Tomato Seeds' },
  { label: '🧪 Urea', term: 'Urea' },
  { label: '🐃 Buffalo', term: 'Buffalo' },
  { label: '🫘 Soybean', term: 'Soybean' },
];

// Props for the TrendingSearches component.
export interface TrendingSearchesProps {
  // Called with the plain trending term (no emoji) when a chip is tapped.
  onSearch?: (term: string) => void;
}

// Renders the trending searches label + horizontal chip rail.
function TrendingSearchesComponent({ onSearch }: TrendingSearchesProps) {
  const styles = useThemedStyles(createTrendingSearchesStyles);
  const { language } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="overline" color="textTertiary" style={styles.label}>
          {localize(SECTION_LABEL, language)}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {TRENDING_TERMS.map(({ label, term }) => (
          <Pressable
            key={term}
            accessibilityRole="button"
            accessibilityLabel={term}
            onPress={onSearch ? () => onSearch(term) : undefined}
            disabled={!onSearch}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.chip,
                  pressed && onSearch ? styles.pressed : null,
                ]}
              >
                <Text variant="label" numberOfLines={1}>
                  {label}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// Memoized trending searches section.
export const TrendingSearches = memo(TrendingSearchesComponent);
