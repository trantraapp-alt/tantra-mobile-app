// Route binding for the full listing edit form.
//
// Deliberately a flat `/listings/edit/[id]` rather than a nested
// `/listings/[id]/edit`: the nested dynamic segment did not resolve in this
// project, and a sibling `[id]/` folder next to `[id].tsx` is ambiguous.
import { useLocalSearchParams } from 'expo-router';

import { EditListingScreen } from '@/features/listings';

// Renders the listing edit form at /listings/edit/[id]. The id is passed
// through verbatim: listing references are opaque strings (e.g. "TN7805BEIZ").
export default function EditListingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditListingScreen listingId={id ?? ''} />;
}
