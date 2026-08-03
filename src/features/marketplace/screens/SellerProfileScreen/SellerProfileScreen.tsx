// Seller's public storefront: every active listing by one seller, filterable
// and sortable. The seller's userId (and optional display name) arrive as route
// params.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Header } from '@/components/shared';
import { type BottomSheetRef, Screen } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { useGoBack, useTranslation } from '@/hooks';

import { marketplaceApi } from '../../api';
import {
  FilterSheet,
  ListingResults,
  ResultsHeader,
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

  const size = appConstants.defaultPageSize;
  const fetchPage = useCallback(
    (page: number) => marketplaceApi.bySeller(userId, filters, page, size),
    [userId, filters, size],
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
    <Screen padded={false}>
      <Header title={title} showBack onBack={goBack} />
      <ListingResults
        feed={feed}
        onListingPress={openListing}
        emptyTitle={t('market.seller.emptyTitle')}
        emptyDescription={t('market.seller.emptyDesc')}
        ListHeaderComponent={
          <ResultsHeader
            filters={filters}
            onFiltersChange={setFilters}
            onOpenFilters={() => filterRef.current?.present()}
            sortOptions={sortOptions}
            resultLabel={resultLabel}
          />
        }
      />
      <FilterSheet ref={filterRef} filters={filters} onApply={setFilters} />
    </Screen>
  );
}
