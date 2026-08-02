// The scrolling header above a listing grid: a Filters button, an optional
// result count, the sort bar, and the active-filter chip row. Placed inside a
// ListingResults `ListHeaderComponent`, so it scrolls with the results.
import { SlidersHorizontal } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ListingFilters, ListingSort } from '../../types';
import { ActiveFilterChips } from '../ActiveFilterChips';
import { SortBar, type SortOptionItem } from '../SortBar';
import { createResultsHeaderStyles } from './ResultsHeader.styles';

// Props for the ResultsHeader component.
export interface ResultsHeaderProps {
  // Applied filters (drives the sort bar selection and active chips).
  filters: ListingFilters;
  // Called with the next filter set (chip removal + sort changes).
  onFiltersChange: (filters: ListingFilters) => void;
  // Opens the filter sheet. Omit to hide the Filters button (e.g. when a filter
  // icon already lives in the screen's search row).
  onOpenFilters?: () => void;
  // Sort options to offer; omit / empty to hide the sort bar.
  sortOptions?: SortOptionItem[];
  // Optional result-count label, e.g. "142 results".
  resultLabel?: string;
}

// Renders the results toolbar + sort + active chips.
function ResultsHeaderComponent({
  filters,
  onFiltersChange,
  onOpenFilters,
  sortOptions,
  resultLabel,
}: ResultsHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createResultsHeaderStyles);
  const { t } = useTranslation();

  const sortValue: ListingSort =
    filters.sort ?? sortOptions?.[0]?.value ?? 'RELEVANCE';

  return (
    <View style={styles.container}>
      {onOpenFilters || resultLabel ? (
        <View style={styles.toolbar}>
          {onOpenFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('market.filtersButton')}
              onPress={onOpenFilters}
            >
              {({ pressed }) => (
                <View
                  style={[styles.filterButton, pressed ? styles.pressed : null]}
                >
                  <SlidersHorizontal
                    size={theme.sizing.iconSm}
                    color={theme.colors.textPrimary}
                  />
                  <Text variant="label">{t('market.filtersButton')}</Text>
                </View>
              )}
            </Pressable>
          ) : null}
          {resultLabel ? (
            <Text
              variant="caption"
              color="textSecondary"
              numberOfLines={1}
              style={styles.count}
            >
              {resultLabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      {sortOptions && sortOptions.length > 0 ? (
        <SortBar
          options={sortOptions}
          value={sortValue}
          onChange={(sort) => onFiltersChange({ ...filters, sort })}
        />
      ) : null}

      <ActiveFilterChips filters={filters} onChange={onFiltersChange} />
    </View>
  );
}

// Memoized results header.
export const ResultsHeader = memo(ResultsHeaderComponent);
