// Route binding for the full edit form of a single listing.
import { useLocalSearchParams } from 'expo-router';

import { EditListingScreen } from '@/features/listings';

// Renders the edit form at /listings/[id]/edit.
export default function EditListingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditListingScreen listingId={Number(id)} />;
}
