// Browse a category's public listings — a filtered, sorted, infinite grid. The
// path param is either a numeric category id (drill-down) or a string category
// key (crop/seed/equipment…) from the DB-driven carousel; a display name and an
// optional pre-applied listing type arrive as query params.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { type BottomSheetRef, Screen, Text } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { marketplaceApi } from '../../api';
import {
  FilterSheet,
  ListingResults,
  ResultsHeader,
  type SortOptionItem,
} from '../../components';
import { useListingFeed, useUserGeo } from '../../hooks';
import type { ListingFilters } from '../../types';
import { sortListings } from '../../utils/sortListings';
import { createBrowseStyles } from './BrowseScreen.styles';

// Renders the browse-by-category screen.
export function BrowseScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createBrowseStyles);
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
          )
        : marketplaceApi.browseByKey(
            categoryKey,
            filters,
            geoForRequest,
            page,
            size,
          );
    },
    [isNumericId, numericId, categoryKey, filters, geo, size],
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
    <Screen padded={false}>
      <View style={styles.searchRow}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={goBack}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('market.searchPlaceholder')}
          onPress={() => router.push(routes.search)}
          style={styles.searchField}
        >
          <Search
            size={theme.sizing.iconSm}
            color={theme.colors.textTertiary}
          />
          <Text
            variant="body"
            color="textTertiary"
            numberOfLines={1}
            style={styles.searchText}
          >
            {title}
          </Text>
        </Pressable>
        <IconButton
          icon={SlidersHorizontal}
          accessibilityLabel={t('market.filtersButton')}
          onPress={() => filterRef.current?.present()}
        />
      </View>
      <ListingResults
        feed={sortedFeed}
        onListingPress={openListing}
        emptyTitle={t('market.emptyTitle')}
        emptyDescription={t('market.emptyDesc')}
        ListHeaderComponent={
          <ResultsHeader
            filters={filters}
            onFiltersChange={setFilters}
            sortOptions={sortOptions}
            resultLabel={resultLabel}
          />
        }
      />
      <FilterSheet
        ref={filterRef}
        filters={filters}
        onApply={setFilters}
        showRadius={Boolean(geo)}
        categoryId={isNumericId ? numericId : undefined}
      />
    </Screen>
  );
}
