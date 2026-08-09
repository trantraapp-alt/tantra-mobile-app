// Browse a category's public listings — a filtered, sorted, infinite grid. The
// path param is either a numeric category id (drill-down) or a string category
// key (crop/seed/equipment…) from the DB-driven carousel; a display name and an
// optional pre-applied listing type arrive as query params.
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
import { useDebouncedValue, useGoBack, useTranslation } from '@/hooks';

// Renders the browse-by-category screen.
export function BrowseScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    categoryId?: string;
    name?: string;
    type?: string;
  }>();
  // The path segment is either a numeric category id or a string category key
  // (crop/seed/equipment…) coming from the carousel.
  const rawId = params.categoryId?.trim() ?? '';
  const numericId = Number(rawId);
  const isNumericId = Number.isFinite(numericId) && numericId > 0;
  const categoryKey = isNumericId ? '' : rawId;
  const enabled = isNumericId || categoryKey !== '';

  const geo = useUserGeo();
  const filterRef = useRef<BottomSheetRef>(null);
  const [filters, setFilters] = useState<ListingFilters>(() => ({
    sort: 'NEWEST',
    listingType:
      params.type === 'RENT' || params.type === 'SELL'
        ? params.type
        : undefined,
  }));
  // Which FilterSheet section a tapped chip opens (undefined = full sheet).
  const [filterSection, setFilterSection] = useState<FilterSection>();
  const openFilters = useCallback((section?: FilterSection) => {
    setFilterSection(section);
    filterRef.current?.present();
  }, []);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, appConstants.searchDebounceMs);

  const size = appConstants.defaultPageSize;
  const fetchPage = useCallback(
    (page: number) => {
      // Show the WHOLE category (backend default order, no district filter) by
      // default. Location (lat/lng) is sent ONLY when the user picks a distance
      // radius — so applying the radius filter narrows results to nearby ones.
      const geoForRequest = filters.radius != null ? geo : undefined;
      return isNumericId
        ? marketplaceApi.browseCategory(
            numericId,
            filters,
            geoForRequest,
            page,
            size,
            debouncedQuery,
          )
        : marketplaceApi.browseByKey(
            categoryKey,
            filters,
            geoForRequest,
            page,
            size,
            debouncedQuery,
          );
    },
    [isNumericId, numericId, categoryKey, filters, geo, size, debouncedQuery],
  );
  const feed = useListingFeed(fetchPage, { enabled });
  // The browse endpoints reject the backend sort param, so order the loaded
  // results client-side by the selected sort option.
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

  const title = params.name?.trim() || t('market.browseTitle');
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
        categoryId={isNumericId ? numericId : undefined}
        focusSection={filterSection}
      />
    </Screen>
  );
}
