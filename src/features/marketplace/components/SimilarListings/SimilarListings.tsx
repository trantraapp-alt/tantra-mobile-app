// A titled, edge-to-edge horizontal rail of the marketplace ListingCard, used
// for "Similar listings" on the detail screen so those cards match the buyer
// grid design. Renders nothing when there are no listings.
import { memo } from 'react';
import { ScrollView, View } from 'react-native';

import { SectionHeader } from '@/components/shared';
import type { FeedListing } from '@/features/home/types';
import { feedListingId } from '@/features/home/utils/feedListing';
import { useThemedStyles } from '@/hooks';

import { ListingCard } from '../ListingCard';
import { createSimilarListingsStyles } from './SimilarListings.styles';

// Fixed card width for the horizontal rail.
const CARD_WIDTH = 200;

// Props for the SimilarListings component.
export interface SimilarListingsProps {
  // Section title.
  title: string;
  // Listings to render in the rail.
  listings: FeedListing[];
  // Called with the tapped listing.
  onListingPress?: (listing: FeedListing) => void;
}

// Renders the similar-listings rail.
function SimilarListingsComponent({
  title,
  listings,
  onListingPress,
}: SimilarListingsProps) {
  const styles = useThemedStyles(createSimilarListingsStyles);

  if (listings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title={title} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {listings.map((listing, index) => (
          <ListingCard
            key={feedListingId(listing) || `similar-${index}`}
            listing={listing}
            width={CARD_WIDTH}
            onPress={onListingPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Memoized similar-listings rail.
export const SimilarListings = memo(SimilarListingsComponent);
