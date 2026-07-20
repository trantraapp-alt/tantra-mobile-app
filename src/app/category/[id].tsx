// Route binding for the category detail screen.
import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '@/components/shared';

// Renders the category detail screen at /category/[id].
export default function CategoryDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ComingSoonScreen
      title="Category"
      description={`Products for category ${id} will appear here once the catalog service is connected.`}
    />
  );
}
