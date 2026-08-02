// Route binding for the Nearby tab.
import { NearbyScreen } from '@/features/marketplace';

// Renders nearby listings as a bottom tab (no header back button).
export default function NearbyTabRoute() {
  return <NearbyScreen showBack={false} />;
}
