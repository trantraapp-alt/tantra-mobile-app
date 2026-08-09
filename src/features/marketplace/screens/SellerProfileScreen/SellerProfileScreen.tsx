// Seller's public storefront: every active listing by one seller, filterable
// and sortable. The seller's userId (and optional display name) arrive as route
// params.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { type BottomSheetRef, Screen } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { useDebouncedValue, useGoBack, useTranslation } from '@/hooks';

import { marketplaceApi } from '../../api';
import {
  FilterChipsBar,
  type FilterSection,
  FilterSheet,
  ListingHeader,
  ListingResults,
  type SortOptionItem,
} from '../../components';
import { useListingFeed } from '../../hooks';
import type { ListingFilters } from '../../types';

// Renders a seller's public listings.
export function SellerProfileScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId?: string; name?: string }>();
  const userId = params.userId?.trim() ?? '';
  const enabled = userId !== '';

  const filterRef = useRef<BottomSheetRef>(null);
  const [filters, setFilters] = useState<ListingFilters>({ sort: 'NEWEST' });
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
    (page: number) =>
      marketplaceApi.bySeller(userId, filters, page, size, debouncedQuery),
    [userId, filters, size, debouncedQuery],
  );
  const feed = useListingFeed(fetchPage, { enabled });

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

  const title = params.name?.trim() || t('market.seller.title');
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
        feed={feed}
        onListingPress={openListing}
        emptyTitle={t('market.seller.emptyTitle')}
        emptyDescription={t('market.seller.emptyDesc')}
        ListHeaderComponent={
          <FilterChipsBar
            filters={filters}
            onFiltersChange={setFilters}
            onOpenFilters={openFilters}
            sortOptions={sortOptions}
          />
        }
      />
      <FilterSheet
        ref={filterRef}
        filters={filters}
        onApply={setFilters}
        focusSection={filterSection}
      />
    </Screen>
  );
}
