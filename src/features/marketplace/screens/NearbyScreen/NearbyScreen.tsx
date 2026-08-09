// Nearby listings: closest-first around the user's GPS point (server-sorted, so
// no sort bar — only a distance-radius filter). Prompts to set a location when
// no coordinates are known.
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { type BottomSheetRef, Screen, Text } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import { LocationChip } from '@/features/location';
import {
  useDebouncedValue,
  useGoBack,
  useThemedStyles,
  useTranslation,
} from '@/hooks';
import { useTheme } from '@/providers';
import { useAppSelector } from '@/store/hooks';
import { selectSearchRadius } from '@/store/selectors';

import { marketplaceApi } from '../../api';
import {
  FilterChipsBar,
  type FilterSection,
  FilterSheet,
  ListingHeader,
  ListingResults,
} from '../../components';
import { useListingFeed, useUserGeo } from '../../hooks';
import type { ListingFilters, MarketplacePage } from '../../types';
import { createNearbyScreenStyles } from './NearbyScreen.styles';

// An empty page, used while no location is known.
const EMPTY_PAGE: MarketplacePage<FeedListing> = { content: [], last: true };

// Props for the NearbyScreen.
export interface NearbyScreenProps {
  // Whether to show the header back button (false when used as a bottom tab).
  showBack?: boolean;
}

// Renders the nearby-listings screen.
export function NearbyScreen({ showBack = true }: NearbyScreenProps = {}) {
  const theme = useTheme();
  const styles = useThemedStyles(createNearbyScreenStyles);
  const router = useRouter();
  const goBack = useGoBack();
  const { t } = useTranslation();

  const geo = useUserGeo();
  const radiusKm = useAppSelector(selectSearchRadius);
  const filterRef = useRef<BottomSheetRef>(null);
  const [filters, setFilters] = useState<ListingFilters>(() => ({
    radius: radiusKm,
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
    (page: number) =>
      geo
        ? marketplaceApi.nearby(filters, geo, page, size, debouncedQuery)
        : Promise.resolve(EMPTY_PAGE),
    [geo, filters, size, debouncedQuery],
  );
  const feed = useListingFeed(fetchPage, { enabled: Boolean(geo) });

  const openListing = useCallback(
    (listing: FeedListing) => {
      const id = listing.listingId ? String(listing.listingId) : '';
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  const resultLabel =
    feed.total > 0 ? t('market.results', { count: feed.total }) : undefined;

  return (
    <Screen padded={false}>
      <ListingHeader
        title={t('market.nearbyTitle')}
        resultLabel={resultLabel}
        showBack={showBack}
        onBack={goBack}
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => openFilters()}
      />
      {geo ? (
        <ListingResults
          feed={feed}
          onListingPress={openListing}
          emptyTitle={t('market.emptyTitle')}
          emptyDescription={t('market.emptyDesc')}
          ListHeaderComponent={
            <FilterChipsBar
              filters={filters}
              onFiltersChange={setFilters}
              onOpenFilters={openFilters}
              showDistance
            />
          }
        />
      ) : (
        <View style={styles.prompt}>
          <MapPin size={theme.sizing.iconXxl} color={theme.colors.primary} />
          <View style={styles.promptText}>
            <Text variant="h4" align="center">
              {t('market.nearby.needLocationTitle')}
            </Text>
            <Text variant="body" color="textSecondary" align="center">
              {t('market.nearby.needLocation')}
            </Text>
          </View>
          <LocationChip />
        </View>
      )}
      <FilterSheet
        ref={filterRef}
        filters={filters}
        onApply={setFilters}
        showRadius
        focusSection={filterSection}
      />
    </Screen>
  );
}
