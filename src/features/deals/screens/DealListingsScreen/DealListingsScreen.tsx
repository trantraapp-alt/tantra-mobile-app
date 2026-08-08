// Listings behind a "Today's Deals" group: opens from a deal card. Fetches the
// group's listings (backend resolves which categories it spans) for the user's
// location, already price-ascending and paginated, and renders them in the shared
// 2-column grid with infinite scroll.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import type { FeedListing } from '@/features/home';
import {
  ListingResults,
  useListingFeed,
  useUserGeo,
} from '@/features/marketplace';
import { localize, type LocalizedText } from '@/features/sell';
import { useGoBack, useTranslation } from '@/hooks';

import { getDealListings } from '../../api';

// Screen-local bilingual copy (kept out of the global i18n catalog).
const TITLE: LocalizedText = { en: 'Deals', hi: 'डील' };
const EMPTY_TITLE: LocalizedText = {
  en: 'No deals right now',
  hi: 'अभी कोई डील नहीं',
};
const EMPTY_DESC: LocalizedText = {
  en: 'Check back soon — new deals appear as sellers list nearby.',
  hi: 'थोड़ी देर बाद दोबारा देखें — आस-पास नए डील आते रहते हैं।',
};

// Renders the deal-group listings screen.
export function DealListingsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { language } = useTranslation();
  const params = useLocalSearchParams<{ groupKey?: string; name?: string }>();
  const groupKey = params.groupKey?.trim() ?? '';
  const name = params.name?.trim();
  const geo = useUserGeo();
  const size = appConstants.defaultPageSize;

  const fetchPage = useCallback(
    (page: number) => getDealListings(groupKey, geo, page, size),
    [groupKey, geo, size],
  );
  const feed = useListingFeed(fetchPage, { enabled: groupKey !== '' });

  const openListing = useCallback(
    (listing: FeedListing) => {
      const id = listing.listingId ? String(listing.listingId) : '';
      if (id) {
        router.push(routes.marketListing(id));
      }
    },
    [router],
  );

  return (
    <Screen padded={false}>
      <Header
        title={name && name !== '' ? name : localize(TITLE, language)}
        showBack
        onBack={goBack}
      />
      <ListingResults
        feed={feed}
        onListingPress={openListing}
        emptyTitle={localize(EMPTY_TITLE, language)}
        emptyDescription={localize(EMPTY_DESC, language)}
      />
    </Screen>
  );
}
