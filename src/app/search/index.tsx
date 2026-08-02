// Route binding for the search screen (reachable from the home search bar):
// the unified marketplace search over listings + business profiles.
import { SearchResultsScreen } from '@/features/marketplace';

// Renders the search screen at /search.
export default function SearchRoute() {
  return <SearchResultsScreen />;
}
