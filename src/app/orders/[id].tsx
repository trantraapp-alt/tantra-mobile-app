// Route binding for the order detail screen.
import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '@/components/shared';

// Renders the order detail screen at /orders/[id].
export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ComingSoonScreen
      title="Order details"
      description={`Details for order ${id} will appear here.`}
    />
  );
}
