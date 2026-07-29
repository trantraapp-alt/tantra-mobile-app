// Centralized API configuration: base URL, timeouts, headers and endpoint paths.
import { env } from './env';

// Networking configuration for the Axios client.
export const apiConfig = {
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  // Number of automatic retries for idempotent requests on transient failures.
  maxRetries: 2,
  // Base delay in milliseconds used for exponential backoff between retries.
  retryDelayMs: 500,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Bypasses the ngrok free-tier browser interstitial for API requests.
    'ngrok-skip-browser-warning': 'true',
  },
} as const;

// Immutable map of all REST endpoints grouped by feature domain.
// Paths are relative to the versioned API base URL (e.g. /api/v1).
export const endpoints = {
  auth: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    profile: '/auth/profile',
    // Validates the stored JWT on launch; returns `{ authenticated, message }`.
    verifySession: '/auth/verify-session',
    // Sends an OTP; expects `mobileNumber` as a query parameter.
    forgotPasswordRequest: '/auth/forgot-password/request',
    // Completes the reset; expects a JSON body.
    forgotPasswordReset: '/auth/forgot-password/reset',
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    related: (id: string) => `/products/${id}/related`,
    reviews: (id: string) => `/products/${id}/reviews`,
    search: '/products/search',
  },
  categories: {
    list: '/categories',
    detail: (id: string) => `/categories/${id}`,
    products: (id: string) => `/categories/${id}/products`,
  },
  cart: {
    root: '/cart',
    items: '/cart/items',
    item: (id: string) => `/cart/items/${id}`,
  },
  wishlist: {
    root: '/wishlist',
    item: (productId: string) => `/wishlist/${productId}`,
  },
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    create: '/orders',
    cancel: (id: string) => `/orders/${id}/cancel`,
  },
  coupons: {
    list: '/coupons',
    validate: '/coupons/validate',
  },
  addresses: {
    // The user's saved addresses (default first).
    list: '/addresses',
    // The user's default address (or null).
    default: '/addresses/default',
    // Creates a saved address.
    create: '/addresses',
    // A single address by id — used for update (PUT) and delete (DELETE).
    detail: (id: string) => `/addresses/${id}`,
    // Makes the address the default (PATCH).
    setDefault: (id: string) => `/addresses/${id}/default`,
  },
  optionSets: {
    // Seeded option-set items (country/state/district…). Pass a `parentItemId`
    // query param to fetch a cascading child set.
    items: (setKey: string) => `/option-sets/${setKey}/items`,
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
  banners: {
    list: '/banners',
  },
  masters: {
    // Marketplace modules shown on the Sell sheet.
    modules: '/masters/modules',
    // Top-level categories within a module.
    moduleCategories: (moduleId: number) =>
      `/masters/modules/${moduleId}/categories`,
    // Subcategories (children) of a parent category.
    subcategories: (parentId: number) =>
      `/masters/categories/${parentId}/subcategories`,
    // Server-driven listing form for a category (expects a `listingType` query).
    categoryForm: (categoryId: number) => `/categories/${categoryId}/form`,
  },
  listings: {
    // Creates a new marketplace listing.
    create: '/listings',
    // The user's own listings (paginated).
    mine: '/listings/mine',
    // A single listing by id — used for read, update (PUT), inline edit (PATCH)
    // and soft delete (DELETE).
    detail: (id: string | number) => `/listings/${id}`,
    // Public listings within a category (paginated).
    category: (categoryId: number) => `/listings/category/${categoryId}`,
    // Uploads image files; returns relative `/files/...` URLs.
    uploads: '/uploads',
  },
  businessProfiles: {
    // Authenticated metadata form for a business-profile type (e.g. vet_clinic);
    // expects a `profileType` query param. Unlike the listing form, this is NOT
    // public — the bearer token must be attached.
    form: '/business-profiles/form',
    // Creates a business profile; returns PENDING until an admin approves it.
    create: '/business-profiles',
  },
} as const;

// Resolves a relative server path (e.g. an uploaded `/files/..` URL) to an
// absolute, publicly-servable URL by prefixing the API origin (without /api/vN).
export function fileUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const origin = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
