// Pure pricing calculations shared by the cart, checkout and product features.
import { appConstants } from '@/constants';
import type { CartItem, CartSummary, Coupon, Money } from '@/types';

// Standard tax rate applied to the discounted subtotal.
const TAX_RATE = 0.05;

// Flat shipping fee applied below the free-shipping threshold.
const SHIPPING_FEE: Money = 49;

// Rounds a monetary value to two decimal places.
export function roundMoney(value: Money): Money {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Calculates the subtotal for a set of cart line items.
export function calculateSubtotal(items: CartItem[]): Money {
  return roundMoney(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
}

// Calculates the discount amount produced by a coupon for a given subtotal.
export function calculateDiscount(subtotal: Money, coupon: Coupon | null): Money {
  if (!coupon || !coupon.isActive) {
    return 0;
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return 0;
  }

  const raw =
    coupon.type === 'percentage'
      ? (subtotal * coupon.value) / 100
      : coupon.value;

  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return roundMoney(Math.min(capped, subtotal));
}

// Determines the shipping fee based on the discounted order value.
export function calculateShipping(payableBeforeShipping: Money): Money {
  if (payableBeforeShipping <= 0) {
    return 0;
  }
  return payableBeforeShipping >= appConstants.freeShippingThreshold
    ? 0
    : SHIPPING_FEE;
}

// Computes a full monetary summary for the cart, including tax and shipping.
export function calculateCartSummary(
  items: CartItem[],
  coupon: Coupon | null,
): CartSummary {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, coupon);
  const discounted = subtotal - discount;
  const shipping = calculateShipping(discounted);
  const tax = roundMoney(discounted * TAX_RATE);
  const total = roundMoney(discounted + shipping + tax);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return { subtotal, discount, shipping, tax, total, itemCount };
}

// Calculates the final unit price of a product after its discount percentage.
export function calculateDiscountedPrice(
  price: Money,
  discountPercentage?: number,
): Money {
  if (!discountPercentage) {
    return price;
  }
  return roundMoney(price - (price * discountPercentage) / 100);
}
