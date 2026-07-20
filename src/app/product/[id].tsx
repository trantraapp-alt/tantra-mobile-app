// Route binding for the product detail screen.
import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '@/components/shared';

// Renders the product detail screen at /product/[id].
export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ComingSoonScreen
      title="Product"
      description={`Product detail for ${id} will appear here once the catalog service is connected.`}
    />
  );
}
