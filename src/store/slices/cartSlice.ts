// Redux slice owning the local shopping cart and applied coupon.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { appConstants } from '@/constants';
import type { CartItem, Coupon, Product } from '@/types';

// Shape of the cart slice state.
export interface CartState {
  // Line items currently in the cart.
  items: CartItem[];
  // Coupon applied to the cart, if any.
  appliedCoupon: Coupon | null;
}

// Payload used when adding a product to the cart.
interface AddToCartPayload {
  // Product being added.
  product: Product;
  // Quantity to add (defaults to 1).
  quantity?: number;
  // Optional selected variant identifier.
  variantId?: string;
}

// Initial cart state.
const initialState: CartState = {
  items: [],
  appliedCoupon: null,
};

// Builds a stable line-item id from product and variant identifiers.
function buildLineId(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

// Clamps a quantity to the allowed inclusive range.
function clampQuantity(quantity: number): number {
  return Math.min(Math.max(quantity, 1), appConstants.maxCartItemQuantity);
}

// Cart slice managing add, remove, quantity and coupon operations.
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Adds a product to the cart or increments its quantity when present.
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { product, quantity = 1, variantId } = action.payload;
      const lineId = buildLineId(product.id, variantId);
      const existing = state.items.find((item) => item.id === lineId);

      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + quantity);
        return;
      }

      state.items.push({
        id: lineId,
        product,
        variantId,
        quantity: clampQuantity(quantity),
        unitPrice: product.price,
      });
    },
    // Sets an explicit quantity for a line item, removing it at zero.
    updateQuantity(
      state,
      action: PayloadAction<{ lineId: string; quantity: number }>,
    ) {
      const { lineId, quantity } = action.payload;
      const item = state.items.find((entry) => entry.id === lineId);
      if (!item) {
        return;
      }
      if (quantity <= 0) {
        state.items = state.items.filter((entry) => entry.id !== lineId);
        return;
      }
      item.quantity = clampQuantity(quantity);
    },
    // Removes a line item from the cart.
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    // Applies a coupon to the cart.
    applyCoupon(state, action: PayloadAction<Coupon>) {
      state.appliedCoupon = action.payload;
    },
    // Removes any applied coupon.
    removeCoupon(state) {
      state.appliedCoupon = null;
    },
    // Empties the cart and clears any applied coupon.
    clearCart(state) {
      state.items = [];
      state.appliedCoupon = null;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
