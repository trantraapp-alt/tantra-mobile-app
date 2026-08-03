// Unified search results: a debounced query drives a Listings / Sellers tabbed
// view. Listings reuse the shared filterable grid; Sellers render as full-width
// business cards. With no query, recent searches (or a prompt) are shown.
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, SearchX, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { EmptyState, ErrorState } from '@/components/empty-state';
import { SearchBar } from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { SectionHeader } from '@/components/shared';
import { type BottomSheetRef, Divider, Screen, Text } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeaturedBusiness, FeedListing } from '@/features/home';
import { FeaturedBusinessCard } from '@/features/home';
import { useDebouncedValue, useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectRecentSearches } from '@/store/selectors';
import { addRecentSearch, clearRecentSearches } from '@/store/slices';

import { FilterSheet, ListingResults, ResultsHeader } from '../../components';
import type { UseListingFeedResult } from '../../hooks';
import { useSearch, useUserGeo } from '../../hooks';
import type { ListingFilters } from '../../types';
import { hasActiveFilters } from '../../utils/filterState';
import { createSearchResultsStyles } from './SearchResultsScreen.styles';

// Which result set is showing.
type ResultTab = 'listings' | 'sellers';

// A stable key for a business tile.
function businessKey(business: FeaturedBusiness, index: number): string {
  return business.profileId || business.userId || `business-${index}`;
}

// Parses filters handed in via the `filters` route param (a flat JSON object of
// query-param values, e.g. from the home filter drawer) into ListingFilters.
function parseInitialFilters(raw?: string): ListingFilters {
  const base: ListingFilters = { sort: 'RELEVANCE' };
  if (!raw) {
    return base;
  }
  try {
    const obj = JSON.parse(raw) as Record<string, string>;
    const moduleId = Number(obj.moduleId);
    if (obj.moduleId != null && Number.isFinite(moduleId)) {
      base.moduleId = moduleId;
    }
    if (obj.listingType) {
      base.listingType = obj.listingType as ListingFilters['listingType'];
    }
    const min = Number(obj.minPrice);
    if (obj.minPrice && Number.isFinite(min)) {
      base.minPrice = min;
    }
    const max = Number(obj.maxPrice);
    if (obj.maxPrice && Number.isFinite(max)) {
      base.maxPrice = max;
    }
    if (obj.district) {
      base.district = obj.district;
    }
    if (obj.state) {
      base.state = obj.state;
    }
    if (obj.sellerType) {
      base.sellerType = obj.sellerType as ListingFilters['sellerType'];
    }
    if (obj.postedWithin) {
      base.postedWithin = obj.postedWithin as ListingFilters['postedWithin'];
    }
  } catch {
    // Ignore a malformed param and fall back to defaults.
  }
  return base;
}

// Renders the search results screen.
export function SearchResultsScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createSearchResultsStyles);
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const recentSearches = useAppSelector(selectRecentSearches);
  const params = useLocalSearchParams<{ filters?: string; title?: string }>();
  const moduleTitle = params.title?.trim();

  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, appConstants.searchDebounceMs);
  const [tab, setTab] = useState<ResultTab>('listings');
  const [filters, setFilters] = useState<ListingFilters>(() =>
    parseInitialFilters(params.filters),
  );
  const filterRef = useRef<BottomSheetRef>(null);

  const geo = useUserGeo();
  const search = useSearch(debounced, filters, geo);
  const hasQuery = debounced.trim().length > 0;
  const showResults = hasQuery || hasActiveFilters(filters);

  // Adapt the search state to the shared grid's feed shape (listings tab).
  const listingsFeed = useMemo<UseListingFeedResult>(
    () => ({
      listings: search.listings,
      isLoading: search.isLoading,
      isLoadingMore: search.isLoadingMore,
      isRefreshing: search.isRefreshing,
      isError: search.isError,
      isEmpty: !search.isLoading && search.listings.length === 0,
      hasMore: search.hasMore,
      total: search.totalListings,
      loadMore: search.loadMore,
      refresh: search.refresh,
    }),
    [search],
  );

  const openListing = useCallback(
    (listing: FeedListing) => {
      const id = listing.listingId ? String(listing.listingId) : '';
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  const openSeller = useCallback(
    (business: FeaturedBusiness) => {
      const userId = business.userId?.trim();
      if (userId) {
        router.push(routes.seller(userId, business.businessName));
      }
    },
    [router],
  );

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      dispatch(addRecentSearch(query.trim()));
    }
  }, [dispatch, query]);

  // Sellers list body: loading / error / empty / list.
  const renderSellers = () => {
    if (search.isLoading) {
      return (
        <View style={styles.state}>
          <Spinner />
        </View>
      );
    }
    if (search.isError) {
      return (
        <View style={styles.state}>
          <ErrorState onRetry={search.refresh} retryLabel={t('common.retry')} />
        </View>
      );
    }
    return (
      <FlashList
        data={search.businesses}
        keyExtractor={businessKey}
        renderItem={({ item }) => (
          <FeaturedBusinessCard business={item} onPress={openSeller} />
        )}
        contentContainerStyle={styles.sellersContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.state}>
            <EmptyState
              icon={SearchX}
              title={t('market.sellers.emptyTitle')}
              description={t('market.sellers.emptyDesc')}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Body for an active query: tabs + the selected result set.
  const renderResults = () => (
    <>
      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'listings' }}
          onPress={() => setTab('listings')}
          style={[styles.tab, tab === 'listings' ? styles.tabActive : null]}
        >
          <Text
            variant="label"
            color={tab === 'listings' ? 'onPrimary' : 'textPrimary'}
          >
            {t('market.tab.listings', { count: search.totalListings })}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'sellers' }}
          onPress={() => setTab('sellers')}
          style={[styles.tab, tab === 'sellers' ? styles.tabActive : null]}
        >
          <Text
            variant="label"
            color={tab === 'sellers' ? 'onPrimary' : 'textPrimary'}
          >
            {t('market.tab.sellers', { count: search.businesses.length })}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {tab === 'listings' ? (
          <ListingResults
            feed={listingsFeed}
            onListingPress={openListing}
            emptyTitle={t('market.search.emptyTitle')}
            emptyDescription={t('market.search.emptyDesc')}
            ListHeaderComponent={
              <ResultsHeader
                filters={filters}
                onFiltersChange={setFilters}
                onOpenFilters={() => filterRef.current?.present()}
              />
            }
          />
        ) : (
          renderSellers()
        )}
      </View>
    </>
  );

  // Body with no query: recent searches, or a first-time prompt.
  const renderIdle = () => {
    if (recentSearches.length === 0) {
      return (
        <View style={styles.state}>
          <EmptyState
            icon={Clock}
            title={t('market.search.startTitle')}
            description={t('market.search.startDesc')}
          />
        </View>
      );
    }
    // A scroll view, not a plain View: the history holds up to
    // `appConstants.maxRecentSearches` rows, which overflows a small screen
    // once the search row and section header are accounted for — the last
    // entries were unreachable. `handled` keeps a row tappable in one tap while
    // the keyboard is open; dragging dismisses it.
    return (
      <ScrollView
        contentContainerStyle={styles.recent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={t('market.search.recent')}
          actionLabel={t('market.search.clear')}
          onActionPress={() => dispatch(clearRecentSearches())}
        />
        {recentSearches.map((term) => (
          <View key={term}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={term}
              onPress={() => setQuery(term)}
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
    );
  };

  return (
    <Screen padded={false}>
      <View style={styles.searchRow}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={goBack}
        />
        <View style={styles.searchInput}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            onSubmit={handleSubmit}
            placeholder={
              moduleTitle
                ? t('market.searchInModule', { module: moduleTitle })
                : t('market.searchPlaceholder')
            }
          />
        </View>
        <IconButton
          icon={SlidersHorizontal}
          accessibilityLabel={t('market.filtersButton')}
          onPress={() => filterRef.current?.present()}
        />
      </View>

      {showResults ? renderResults() : renderIdle()}

      <FilterSheet
        ref={filterRef}
        filters={filters}
        onApply={setFilters}
        showRadius={Boolean(geo)}
      />
    </Screen>
  );
}
