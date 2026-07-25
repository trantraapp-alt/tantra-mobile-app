// Memoized, typed selectors deriving view state from the Redux store.
import { createSelector } from '@reduxjs/toolkit';

import { calculateCartSummary } from '@/utils/pricing';

import type { RootState } from './index';

// Selects the auth slice.
const selectAuthState = (state: RootState) => state.auth;
// Selects the cart slice.
const selectCartState = (state: RootState) => state.cart;
// Selects the wishlist slice.
const selectWishlistState = (state: RootState) => state.wishlist;
// Selects the UI slice.
const selectUiState = (state: RootState) => state.ui;
// Selects the modules slice.
const selectModulesState = (state: RootState) => state.modules;
// Selects the location slice.
const selectLocationState = (state: RootState) => state.location;

// Selects the user's selected location (null when unset).
export const selectSelectedLocation = (state: RootState) =>
  selectLocationState(state).selected;

// Selects the currently authenticated user.
export const selectCurrentUser = createSelector(
  selectAuthState,
  (auth) => auth.user,
);

// Selects the active app language (user-controlled UI setting, defaults to English).
export const selectAppLanguage = createSelector(
  selectUiState,
  (ui) => ui.language ?? 'EN',
);

// Selects the loaded marketplace modules.
export const selectModules = createSelector(
  selectModulesState,
  (modules) => modules.items,
);

// Selects the fetch status of the modules list.
export const selectModulesStatus = createSelector(
  selectModulesState,
  (modules) => modules.status,
);

// Builds a selector for a specific module's category collection.
export const selectModuleCategories = (moduleId: number) =>
  createSelector(
    selectModulesState,
    (modules) =>
      modules.categoriesByModule[moduleId] ?? {
        status: 'idle' as const,
        items: [],
        error: null,
      },
  );

// Selects whether a valid session exists.
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.isAuthenticated,
);

// Selects whether the session bootstrap has completed.
export const selectIsBootstrapped = createSelector(
  selectAuthState,
  (auth) => auth.isBootstrapped,
);

// Fallback idle operation used when persisted state predates a given operation.
const IDLE_OPERATION = { status: 'idle', error: null } as const;

// Selects the loading/error state of the sign-in operation.
export const selectLoginOperation = createSelector(
  selectAuthState,
  (auth) => auth.operations?.login ?? IDLE_OPERATION,
);

// Selects the loading/error state of the registration operation.
export const selectRegisterOperation = createSelector(
  selectAuthState,
  (auth) => auth.operations?.register ?? IDLE_OPERATION,
);

// Selects the loading/error state of the OTP request operation.
export const selectForgotPasswordOperation = createSelector(
  selectAuthState,
  (auth) => auth.operations?.forgotPassword ?? IDLE_OPERATION,
);

// Selects the loading/error state of the password reset operation.
export const selectResetPasswordOperation = createSelector(
  selectAuthState,
  (auth) => auth.operations?.resetPassword ?? IDLE_OPERATION,
);

// Selects all cart line items.
export const selectCartItems = createSelector(
  selectCartState,
  (cart) => cart.items,
);

// Selects the coupon applied to the cart.
export const selectAppliedCoupon = createSelector(
  selectCartState,
  (cart) => cart.appliedCoupon,
);

// Selects the total number of units in the cart.
export const selectCartItemCount = createSelector(selectCartItems, (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

// Selects the fully computed monetary summary of the cart.
export const selectCartSummary = createSelector(
  selectCartItems,
  selectAppliedCoupon,
  (items, coupon) => calculateCartSummary(items, coupon),
);

// Builds a selector reporting whether a given product is in the cart.
export const selectIsInCart = (productId: string) =>
  createSelector(selectCartItems, (items) =>
    items.some((item) => item.product.id === productId),
  );

// Selects all wishlisted products.
export const selectWishlistItems = createSelector(
  selectWishlistState,
  (wishlist) => wishlist.items,
);

// Selects the set of wishlisted product ids for O(1) membership checks.
export const selectWishlistIds = createSelector(selectWishlistItems, (items) =>
  items.map((item) => item.id),
);

// Builds a selector reporting whether a given product is wishlisted.
export const selectIsWishlisted = (productId: string) =>
  createSelector(selectWishlistItems, (items) =>
    items.some((item) => item.id === productId),
  );

// Selects the user's theme preference.
export const selectThemePreference = createSelector(
  selectUiState,
  (ui) => ui.themePreference,
);

// Selects the current offline connectivity flag.
export const selectIsOffline = createSelector(
  selectUiState,
  (ui) => ui.isOffline,
);

// Selects the locally cached recent search terms.
export const selectRecentSearches = createSelector(
  selectUiState,
  (ui) => ui.recentSearches,
);
