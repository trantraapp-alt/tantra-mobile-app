// Route binding for a single listing (opens the read-only preview).
import { useLocalSearchParams } from 'expo-router';

import { ListingDetailScreen } from '@/features/listings';

// Renders the listing preview at /listings/[id]. The id is passed through
// verbatim: listing references are opaque strings (e.g. "TN7805BEIZ"), so
// coercing with Number() would produce NaN.
export default function ListingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ListingDetailScreen listingId={id ?? ''} />;
}
