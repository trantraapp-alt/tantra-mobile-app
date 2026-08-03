// The scrolling header above a listing grid: a result count / Filters button on
// the left, and a Clear button + Sort field on the right, with the active-filter
// chip row below. Placed inside a ListingResults `ListHeaderComponent`, so it
// scrolls with the results.
import { SlidersHorizontal } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { SortSelect } from '@/components/inputs';
import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ListingFilters, ListingSort } from '../../types';
import { hasActiveFilters } from '../../utils/filterState';
import { ActiveFilterChips } from '../ActiveFilterChips';
import { type SortOptionItem } from '../SortBar';
import { createResultsHeaderStyles } from './ResultsHeader.styles';

// Props for the ResultsHeader component.
export interface ResultsHeaderProps {
  // Applied filters (drives the sort selection and active chips).
  filters: ListingFilters;
  // Called with the next filter set (chip removal + sort changes + clear).
  onFiltersChange: (filters: ListingFilters) => void;
  // Opens the filter sheet. Omit to hide the Filters button (e.g. when a filter
  // icon already lives in the screen's search row).
  onOpenFilters?: () => void;
  // Sort options to offer; omit / empty to hide the sort field.
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
  const hasSort = Boolean(sortOptions && sortOptions.length > 0);
  // The Clear button appears once any narrowing filter is applied.
  const showClear = hasActiveFilters(filters);
  const showToolbar = Boolean(
    onOpenFilters || resultLabel || hasSort || showClear,
  );

  // Clears the applied filters, keeping only the sort + browse scope (moduleId).
  const clearFilters = () =>
    onFiltersChange({ sort: filters.sort, moduleId: filters.moduleId });

  return (
    <View style={styles.container}>
      {showToolbar ? (
        <View style={styles.toolbar}>
          <View style={styles.left}>
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

          <View style={styles.right}>
            {showClear ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('market.search.clear')}
                onPress={clearFilters}
              >
                {({ pressed }) => (
                  <View style={[styles.clear, pressed ? styles.pressed : null]}>
                    <Text variant="label" color="primary">
                      {t('market.search.clear')}
                    </Text>
                  </View>
                )}
              </Pressable>
            ) : null}
            {hasSort ? (
              <SortSelect
                options={sortOptions ?? []}
                value={sortValue}
                onChange={(sort) =>
                  onFiltersChange({ ...filters, sort: sort as ListingSort })
                }
              />
            ) : null}
          </View>
        </View>
      ) : null}

      <ActiveFilterChips filters={filters} onChange={onFiltersChange} />
    </View>
  );
}

// Memoized results header.
export const ResultsHeader = memo(ResultsHeaderComponent);
