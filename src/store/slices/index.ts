// Barrel export for all Redux slices.
export {
  type AuthOperation,
  authReducer,
  type AuthState,
  bootstrapAuthThunk,
  clearAuth,
  fetchProfileThunk,
  loginThunk,
  logoutThunk,
  type OperationState,
  registerThunk,
  requestPasswordResetThunk,
  resetAuthOperation,
  resetPasswordThunk,
} from './authSlice';
export {
  addToCart,
  applyCoupon,
  cartReducer,
  type CartState,
  clearCart,
  removeCoupon,
  removeFromCart,
  updateQuantity,
} from './cartSlice';
export {
  fetchModuleCategoriesThunk,
  fetchModulesThunk,
  modulesReducer,
  type ModulesState,
} from './modulesSlice';
export {
  addRecentSearch,
  clearRecentSearches,
  completeOnboarding,
  setLanguage,
  setOffline,
  setThemePreference,
  type ThemePreference,
  uiReducer,
  type UiState,
} from './uiSlice';
export {
  addToWishlist,
  clearWishlist,
  removeFromWishlist,
  toggleWishlist,
  wishlistReducer,
  type WishlistState,
} from './wishlistSlice';
