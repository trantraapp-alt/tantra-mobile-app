// Search screen: query input, recent searches and debounced query handling.
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { EmptyState } from '@/components/empty-state';
import { SearchBar } from '@/components/inputs';
import { SectionHeader } from '@/components/shared';
import { Divider, Screen, Text } from '@/components/ui';
import { appConstants } from '@/constants';
import { useDebouncedValue, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectRecentSearches } from '@/store/selectors';
import { addRecentSearch, clearRecentSearches } from '@/store/slices';

import { createSearchStyles } from './SearchScreen.styles';

// Renders the search screen.
export function SearchScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createSearchStyles);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const recentSearches = useAppSelector(selectRecentSearches);

  const [query, setQuery] = useState('');
  // Debounced query kept ready for downstream product search wiring.
  const debouncedQuery = useDebouncedValue(query, appConstants.searchDebounceMs);

  // Persists the submitted term to recent searches.
  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      dispatch(addRecentSearch(query));
    }
  }, [dispatch, query]);

  // Re-runs a previous search term.
  const handleRecentPress = useCallback((term: string) => setQuery(term), []);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <Screen>
      <View style={styles.searchWrapper}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <View style={styles.searchInput}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            onSubmit={handleSubmit}
            autoFocus
          />
        </View>
      </View>

      {!hasQuery && recentSearches.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <SectionHeader
            title="Recent searches"
            actionLabel="Clear"
            onActionPress={() => dispatch(clearRecentSearches())}
          />
          {recentSearches.map((term) => (
            <View key={term}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Search ${term}`}
                onPress={() => handleRecentPress(term)}
                style={styles.recentRow}
              >
                <Clock
                  size={theme.sizing.iconMd}
                  color={theme.colors.textTertiary}
                />
                <Text variant="body" style={styles.recentLabel}>
                  {term}
                </Text>
              </Pressable>
              <Divider />
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon={Clock}
          title={hasQuery ? `Results for "${debouncedQuery}"` : 'Search Tantra'}
          description={
            hasQuery
              ? 'Connect the catalog service to display matching products.'
              : 'Find products by name, brand or category.'
          }
        />
      )}
    </Screen>
  );
}
