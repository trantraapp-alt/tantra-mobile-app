// Encapsulates wishlist state access and mutations over the Redux store.
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWishlistIds, selectWishlistItems } from '@/store/selectors';
import { clearWishlist, removeFromWishlist, toggleWishlist } from '@/store/slices';
import type { Product } from '@/types';

// Provides wishlist items and mutation helpers.
export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const ids = useAppSelector(selectWishlistIds);

  // Toggles a product's presence in the wishlist.
  const toggle = useCallback(
    (product: Product) => dispatch(toggleWishlist(product)),
    [dispatch],
  );

  // Removes a product from the wishlist.
  const remove = useCallback(
    (productId: string) => dispatch(removeFromWishlist(productId)),
    [dispatch],
  );

  // Clears the entire wishlist.
  const clear = useCallback(() => dispatch(clearWishlist()), [dispatch]);

  // Reports whether a product id is wishlisted.
  const isWishlisted = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  return { items, ids, toggle, remove, clear, isWishlisted };
}
