// Encapsulates cart state access and mutations over the Redux store.
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAppliedCoupon,
  selectCartItemCount,
  selectCartItems,
  selectCartSummary,
} from '@/store/selectors';
import {
  addToCart,
  applyCoupon,
  clearCart,
  removeCoupon,
  removeFromCart,
  updateQuantity,
} from '@/store/slices';
import type { Coupon, Product } from '@/types';

// Provides cart items, summary and mutation helpers.
export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const summary = useAppSelector(selectCartSummary);
  const itemCount = useAppSelector(selectCartItemCount);
  const coupon = useAppSelector(selectAppliedCoupon);

  // Adds a product to the cart.
  const add = useCallback(
    (product: Product, quantity = 1, variantId?: string) =>
      dispatch(addToCart({ product, quantity, variantId })),
    [dispatch],
  );

  // Sets the quantity for a cart line item.
  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      dispatch(updateQuantity({ lineId, quantity })),
    [dispatch],
  );

  // Removes a cart line item.
  const remove = useCallback(
    (lineId: string) => dispatch(removeFromCart(lineId)),
    [dispatch],
  );

  // Applies a coupon to the cart.
  const applyPromo = useCallback(
    (value: Coupon) => dispatch(applyCoupon(value)),
    [dispatch],
  );

  // Removes any applied coupon.
  const removePromo = useCallback(() => dispatch(removeCoupon()), [dispatch]);

  // Empties the cart.
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  return {
    items,
    summary,
    itemCount,
    coupon,
    add,
    setQuantity,
    remove,
    applyPromo,
    removePromo,
    clear,
  };
}
