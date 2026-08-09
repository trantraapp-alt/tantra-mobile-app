// Listings behind a "Fresh Deals" group, opened from a deal card. A filtered,
// sorted, infinite grid: the shared ListingHeader (with in-place search), a
// Sort / Category / Price / Distance chip row, and the shared FilterSheet. With
// GPS the backend returns the group's listings nearest-first; sort is applied
// client-side and the search query narrows the group.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { type BottomSheetRef, Screen } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import {
  FilterChipsBar,
  type FilterSection,
  FilterSheet,
  type ListingFilters,
  ListingHeader,
  ListingResults,
  marketplaceApi,
  sortListings,
  type SortOptionItem,
  useListingFeed,
  useUserGeo,
} from '@/features/marketplace';
import { localize, type LocalizedText } from '@/features/sell';
import { useDebouncedValue, useGoBack, useTranslation } from '@/hooks';

// Screen-local title fallback when the deal card passes no name.
const TITLE: LocalizedText = { en: 'Deals', hi: 'डील' };

// Renders the deal-group listings screen.
export function DealListingsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ groupKey?: string; name?: string }>();
  const groupKey = params.groupKey?.trim() ?? '';
  const name = params.name?.trim();

  const geo = useUserGeo();
  const filterRef = useRef<BottomSheetRef>(null);
  const [filters, setFilters] = useState<ListingFilters>({ sort: 'NEWEST' });
  const [filterSection, setFilterSection] = useState<FilterSection>();
  const openFilters = useCallback((section?: FilterSection) => {
    setFilterSection(section);
    filterRef.current?.present();
  }, []);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, appConstants.searchDebounceMs);
  const size = appConstants.defaultPageSize;

  const fetchPage = useCallback(
    (page: number) =>
      marketplaceApi.browseDealGroup(
        groupKey,
        filters,
        geo,
        page,
        size,
        debouncedQuery,
      ),
    [groupKey, filters, geo, size, debouncedQuery],
  );
  const feed = useListingFeed(fetchPage, { enabled: groupKey !== '' });
  // The deal endpoint orders nearest-first; apply the chosen sort client-side.
  const sortedFeed = useMemo(
    () => ({ ...feed, listings: sortListings(feed.listings, filters.sort) }),
    [feed, filters.sort],
  );

  const sortOptions = useMemo<SortOptionItem[]>(
    () => [
      { value: 'NEWEST', label: t('market.sort.newest') },
      { value: 'PRICE_ASC', label: t('market.sort.priceLow') },
      { value: 'PRICE_DESC', label: t('market.sort.priceHigh') },
    ],
    [t],
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

  const title = name && name !== '' ? name : localize(TITLE, language);
  const resultLabel =
    feed.total > 0 ? t('market.results', { count: feed.total }) : undefined;

  return (
    <Screen padded={false} edges={['bottom']}>
      <ListingHeader
        title={title}
        resultLabel={resultLabel}
        onBack={goBack}
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => openFilters()}
      />
      <ListingResults
        feed={sortedFeed}
        onListingPress={openListing}
        emptyTitle={t('market.emptyTitle')}
        emptyDescription={t('market.emptyDesc')}
        ListHeaderComponent={
          <FilterChipsBar
            filters={filters}
            onFiltersChange={setFilters}
            onOpenFilters={openFilters}
            sortOptions={sortOptions}
            showDistance={Boolean(geo)}
          />
        }
      />
      <FilterSheet
        ref={filterRef}
        filters={filters}
        onApply={setFilters}
        showRadius={Boolean(geo)}
        focusSection={filterSection}
      />
    </Screen>
  );
}
