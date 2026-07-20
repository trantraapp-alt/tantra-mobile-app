// Route binding for the orders list screen.
import { ComingSoonScreen } from '@/components/shared';

// Renders the orders list screen at /orders.
export default function OrdersRoute() {
  return (
    <ComingSoonScreen
      title="My orders"
      description="Your order history will appear here once the orders service is connected."
    />
  );
}
