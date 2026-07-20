// Application-wide business constants.
export const appConstants = {
  // Default page size for paginated lists.
  defaultPageSize: 20,
  // Debounce delay (ms) for search input.
  searchDebounceMs: 350,
  // Maximum number of recent searches persisted locally.
  maxRecentSearches: 10,
  // Maximum quantity allowed per cart line item.
  maxCartItemQuantity: 10,
  // Default currency ISO code.
  currencyCode: 'INR',
  // Default locale for formatting.
  locale: 'en-IN',
  // Free shipping threshold in minor currency units resolved at runtime.
  freeShippingThreshold: 999,
  // Number of OTP digits expected.
  otpLength: 6,
  // OTP resend cooldown in seconds.
  otpResendCooldownSec: 30,
  // Stale time (ms) for general read queries.
  defaultStaleTimeMs: 60_000,
} as const;

// Application route paths kept centralized for type-safe navigation.
export const routes = {
  auth: {
    login: '/(auth)/login',
    register: '/(auth)/register',
    forgotPassword: '/(auth)/forgot-password',
    resetPassword: '/(auth)/reset-password',
  },
  tabs: {
    home: '/(tabs)/home',
    wishlist: '/(tabs)/wishlist',
    profile: '/(tabs)/profile',
  },
  product: (id: string) => `/product/${id}`,
  category: (id: string) => `/category/${id}`,
  search: '/search',
  cart: '/cart',
  sell: (moduleId: number) => `/sell/${moduleId}`,
  checkout: '/checkout',
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  notifications: '/notifications',
  coupons: '/coupons',
  settings: '/settings',
} as const;
