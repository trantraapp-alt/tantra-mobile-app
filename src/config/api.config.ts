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
    list: '/addresses',
    detail: (id: string) => `/addresses/${id}`,
  },
  notifications: {
    list: '/notifications',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
  banners: {
    list: '/banners',
  },
  masters: {
    // Marketplace modules shown on the Sell sheet.
    modules: '/masters/modules',
    // Categories within a module.
    moduleCategories: (moduleId: number) =>
      `/masters/modules/${moduleId}/categories`,
    // Server-driven listing form for a category (expects a `listingType` query).
    categoryForm: (categoryId: number) => `/categories/${categoryId}/form`,
  },
  listings: {
    // Creates a new marketplace listing.
    create: '/listings',
    // The user's own listings.
    mine: '/listings/mine',
    // Uploads image files; returns relative `/files/...` URLs.
    uploads: '/uploads',
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
