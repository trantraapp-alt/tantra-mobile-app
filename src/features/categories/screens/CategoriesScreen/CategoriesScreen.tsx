// Categories screen: entry point for browsing the catalog taxonomy.
import { LayoutGrid } from 'lucide-react-native';

import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';

// Renders the categories screen.
export function CategoriesScreen() {
  return (
    <Screen padded={false}>
      <Header title="Categories" />
      <EmptyState
        icon={LayoutGrid}
        title="No categories yet"
        description="Connect the catalog service to browse product categories."
      />
    </Screen>
  );
}
