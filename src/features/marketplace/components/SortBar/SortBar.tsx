// Horizontal sort selector: a leading "Sort" label followed by selectable pills.
// The caller supplies the option set (Browse/Seller omit relevance & nearest;
// Search includes them), so this stays a dumb, reusable control.
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';

import type { ListingSort } from '../../types';
import { createSortBarStyles } from './SortBar.styles';

// A single sort option.
export interface SortOptionItem {
  value: ListingSort;
  label: string;
}

// Props for the SortBar component.
export interface SortBarProps {
  // Options in display order.
  options: SortOptionItem[];
  // Currently selected sort.
  value: ListingSort;
  // Called with the newly selected sort.
  onChange: (value: ListingSort) => void;
}

// Renders the horizontal sort bar.
function SortBarComponent({ options, value, onChange }: SortBarProps) {
  const styles = useThemedStyles(createSortBarStyles);
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      <Text variant="label" color="textSecondary" style={styles.label}>
        {t('market.sort.label')}
      </Text>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.chip,
                  active ? styles.chipActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  variant="label"
                  color={active ? 'onPrimary' : 'textPrimary'}
                >
                  {option.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Memoized sort bar.
export const SortBar = memo(SortBarComponent);
