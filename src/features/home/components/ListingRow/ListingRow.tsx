// A titled, edge-to-edge horizontal rail of FeedListingCards with an optional
// "See all" action. Renders nothing when there are no listings, so a caller can
// hand it a section's data unconditionally.
import { memo } from 'react';
import { ScrollView, View } from 'react-native';

import { SectionHeader } from '@/components/shared';
import { useThemedStyles } from '@/hooks';

import type { FeedListing } from '../../types';
import { feedListingId } from '../../utils/feedListing';
import { FeedListingCard } from '../FeedListingCard';
import { createListingRowStyles } from './ListingRow.styles';

// Default fixed card width for a horizontal rail.
const CARD_WIDTH = 176;

// Props for the ListingRow component.
export interface ListingRowProps {
  // Section title. Omit to render only the rail (e.g. under a caller's own
  // header + category chips in a module section).
  title?: string;
  // Optional supporting subtitle.
  subtitle?: string;
  // Listings to render in the rail.
  listings: FeedListing[];
  // Fixed card width; defaults to a comfortable poster width.
  cardWidth?: number;
  // Trailing action label (e.g. "See all").
  seeAllLabel?: string;
  // Called when the action label is pressed.
  onSeeAll?: () => void;
  // Called with the tapped listing.
  onListingPress?: (listing: FeedListing) => void;
}

// Renders a horizontal section of listing cards.
function ListingRowComponent({
  title,
  subtitle,
  listings,
  cardWidth = CARD_WIDTH,
  seeAllLabel,
  onSeeAll,
  onListingPress,
}: ListingRowProps) {
  const styles = useThemedStyles(createListingRowStyles);

  if (listings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.header}>
          <SectionHeader
            title={title}
            subtitle={subtitle}
            actionLabel={onSeeAll ? seeAllLabel : undefined}
            onActionPress={onSeeAll}
          />
        </View>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {listings.map((listing, index) => (
          <FeedListingCard
            key={feedListingId(listing) || `listing-${index}`}
            listing={listing}
            width={cardWidth}
            onPress={onListingPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Memoized horizontal listing rail.
export const ListingRow = memo(ListingRowComponent);
