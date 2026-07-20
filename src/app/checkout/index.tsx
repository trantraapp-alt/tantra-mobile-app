// Route binding for the checkout screen.
import { ComingSoonScreen } from '@/components/shared';

// Renders the checkout screen at /checkout.
export default function CheckoutRoute() {
  return (
    <ComingSoonScreen
      title="Checkout"
      description="Address selection, payment and order placement will appear here."
    />
  );
}
