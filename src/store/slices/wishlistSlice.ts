// Redux slice owning the local wishlist.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Product } from '@/types';

// Shape of the wishlist slice state.
export interface WishlistState {
  // Wishlisted products keyed by insertion order.
  items: Product[];
}

// Initial wishlist state.
const initialState: WishlistState = {
  items: [],
};

// Wishlist slice managing add, remove and toggle operations.
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Adds a product to the wishlist when not already present.
    addToWishlist(state, action: PayloadAction<Product>) {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    // Removes a product from the wishlist by id.
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    // Toggles a product's presence in the wishlist.
    toggleWishlist(state, action: PayloadAction<Product>) {
      const exists = state.items.some((item) => item.id === action.payload.id);
      state.items = exists
        ? state.items.filter((item) => item.id !== action.payload.id)
        : [action.payload, ...state.items];
    },
    // Clears the entire wishlist.
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export const wishlistReducer = wishlistSlice.reducer;
