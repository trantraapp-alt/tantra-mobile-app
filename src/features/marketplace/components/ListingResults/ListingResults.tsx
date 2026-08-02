// Two-column, infinite-scrolling grid of FeedListingCards shared by every buyer
// list screen (Browse / Nearby / Seller / Search). Header content (filter chips,
// sort bar, result count) scrolls with the grid via `ListHeaderComponent`, and
// the loading / empty / error states render in place of the grid body so the
// header stays put.
import { FlashList } from '@shopify/flash-list';
import { PackageSearch } from 'lucide-react-native';
import { memo, type ReactElement } from 'react';
import { RefreshControl, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import type { FeedListing } from '@/features/home';
import { FeedListingCard } from '@/features/home';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { UseListingFeedResult } from '../../hooks';
import { createListingResultsStyles } from './ListingResults.styles';

// Props for the ListingResults component.
export interface ListingResultsProps {
  // Paginated feed state from useListingFeed.
  feed: UseListingFeedResult;
  // Called with the tapped listing.
  onListingPress: (listing: FeedListing) => void;
  // Content rendered above the grid (filter chips, sort bar…).
  ListHeaderComponent?: ReactElement | null;
  // Empty-state copy.
  emptyTitle: string;
  emptyDescription: string;
}

// A stable key for a listing tile.
function listingKey(listing: FeedListing, index: number): string {
  return listing.listingId ? String(listing.listingId) : `listing-${index}`;
}

// Renders the shared 2-column listing grid.
function ListingResultsComponent({
  feed,
  onListingPress,
  ListHeaderComponent,
  emptyTitle,
  emptyDescription,
}: ListingResultsProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createListingResultsStyles);
  const { t } = useTranslation();

  const renderEmpty = () => {
    if (feed.isLoading) {
      return (
        <View style={styles.state}>
          <Spinner />
        </View>
      );
    }
    if (feed.isError) {
      return (
        <View style={styles.state}>
          <ErrorState onRetry={feed.refresh} retryLabel={t('common.retry')} />
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <EmptyState
          icon={PackageSearch}
          title={emptyTitle}
          description={emptyDescription}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={feed.listings}
        numColumns={2}
        keyExtractor={listingKey}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FeedListingCard listing={item} onPress={onListingPress} />
          </View>
        )}
        contentContainerStyle={styles.content}
        // Scrolling the grid dismisses an open keyboard (the search screen's
        // bar sits above it); taps still reach the cards and header controls.
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmpty}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefreshing}
            onRefresh={feed.refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          feed.isLoadingMore ? (
            <View style={styles.footer}>
              <Spinner />
            </View>
          ) : null
        }
      />
    </View>
  );
}

// Memoized listing results grid.
export const ListingResults = memo(ListingResultsComponent);
