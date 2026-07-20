// Cart and coupon domain types.
import type { ID, Money } from './common.types';
import type { Product } from './product.types';

// A single line item within the cart.
export interface CartItem {
  // Unique line item identifier.
  id: ID;
  // Referenced product.
  product: Product;
  // Selected variant identifier, when applicable.
  variantId?: ID;
  // Quantity of the product in the cart.
  quantity: number;
  // Unit price captured at add-to-cart time.
  unitPrice: Money;
}

// Discount coupon.
export interface Coupon {
  // Unique coupon identifier.
  id: ID;
  // Human-facing coupon code.
  code: string;
  // Coupon description.
  description: string;
  // Discount type.
  type: 'percentage' | 'fixed';
  // Discount value (percentage points or fixed amount).
  value: number;
  // Minimum cart subtotal required to apply.
  minSubtotal?: Money;
  // Maximum discount amount for percentage coupons.
  maxDiscount?: Money;
  // Coupon expiry timestamp (ISO 8601).
  expiresAt?: string;
  // Whether the coupon is currently active.
  isActive: boolean;
}

// Computed monetary summary of the cart.
export interface CartSummary {
  // Sum of all line item totals before discounts.
  subtotal: Money;
  // Total discount amount applied.
  discount: Money;
  // Shipping charge.
  shipping: Money;
  // Tax amount.
  tax: Money;
  // Final payable amount.
  total: Money;
  // Total number of units across all line items.
  itemCount: number;
}
