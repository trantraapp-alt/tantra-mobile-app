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
    chat: '/(tabs)/chat',
    wishlist: '/(tabs)/wishlist',
    profile: '/(tabs)/profile',
  },
  product: (id: string) => `/product/${id}`,
  category: (id: string) => `/category/${id}`,
  search: '/search',
  // Browse a marketplace category's listings (optionally carrying its name and a
  // pre-applied listing type, e.g. a "Rent …" promo opens RENT-only listings).
  browse: (categoryId: number | string, name?: string, listingType?: string) => {
    const parts: string[] = [];
    if (name) {
      parts.push(`name=${encodeURIComponent(name)}`);
    }
    if (listingType) {
      parts.push(`type=${encodeURIComponent(listingType)}`);
    }
    const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
    return `/browse/${categoryId}${qs}`;
  },
  // Browse a category by its string key (crop/seed/equipment…) from the carousel,
  // carrying an optional display name and a pre-applied listing type.
  browseKey: (key: string, name?: string, listingType?: string) => {
    const parts: string[] = [];
    if (name) {
      parts.push(`name=${encodeURIComponent(name)}`);
    }
    if (listingType) {
      parts.push(`type=${encodeURIComponent(listingType)}`);
    }
    const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
    return `/browse/${encodeURIComponent(key)}${qs}`;
  },
  // Nearby listings around the user's GPS point.
  nearby: '/nearby',
  // Weather + farming advisory for the selected location.
  weather: '/weather',
  // Listings behind a "Today's Deals" group (optionally carrying its label).
  dealListings: (groupKey: string, name?: string) =>
    name
      ? `/deals/${encodeURIComponent(groupKey)}?name=${encodeURIComponent(name)}`
      : `/deals/${encodeURIComponent(groupKey)}`,
  // A seller's public storefront (optionally carrying their display name).
  seller: (userId: string, name?: string) =>
    name
      ? `/seller/${userId}?name=${encodeURIComponent(name)}`
      : `/seller/${userId}`,
  cart: '/cart',
  sell: (moduleId: number) => `/sell/${moduleId}`,
  // Saved address book.
  addresses: '/addresses',
  // Add a new saved address (optionally with a `returnTo` param).
  addAddress: '/addresses/new',
  // Edit a saved address.
  editAddress: (id: string) => `/addresses/${id}`,
  // Seller's own listings.
  listings: '/listings',
  // A single listing (opens the read-only preview).
  listingDetail: (id: string | number) => `/listings/${id}`,
  // Buyer-facing public listing detail with contact reveal.
  marketListing: (id: string | number) => `/listing/${id}`,
  // The full edit form for a listing.
  editListing: (id: string | number) => `/listings/edit/${id}`,
  checkout: '/checkout',
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  notifications: '/notifications',
  coupons: '/coupons',
  settings: '/settings',
  // Business Profile — owner screens.
  businessProfile: {
    list: '/business-profile',
    create: '/business-profile/create',
    detail: (id: string) => `/business-profile/${id}`,
    edit: (id: string) => `/business-profile/edit/${id}`,
  },
  // Admin-only screens.
  admin: {
    businessProfile: '/admin/business-profile',
    businessProfileList: '/admin/business-profile/list',
    businessProfileReview: (id: string) => `/admin/business-profile/${id}`,
    // A single app user's full detail (activity, subscription, business
    // profile, addresses).
    userDetail: (userId: string) => `/admin/users/${userId}`,
  },
} as const;
