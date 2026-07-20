// Generic API response and error contracts shared by every repository.

// Standard envelope returned by the backend for a single resource.
export interface ApiResponse<TData> {
  // Whether the request succeeded at the application level.
  success: boolean;
  // Response payload.
  data: TData;
  // Optional human-readable message.
  message?: string;
  // Server timestamp (ISO 8601).
  timestamp?: string;
}

// Pagination metadata returned alongside list responses.
export interface PaginationMeta {
  // Current page number (1-based).
  page: number;
  // Number of items per page.
  pageSize: number;
  // Total number of items across all pages.
  total: number;
  // Total number of pages.
  totalPages: number;
  // Whether a subsequent page exists.
  hasNextPage: boolean;
}

// Standard envelope for paginated list responses.
export interface PaginatedResponse<TItem> {
  // Whether the request succeeded at the application level.
  success: boolean;
  // The page of items.
  data: TItem[];
  // Pagination metadata.
  meta: PaginationMeta;
  // Optional human-readable message.
  message?: string;
}

// Normalized error emitted by the networking layer to the rest of the app.
export interface ApiError {
  // Machine-readable error code.
  code: string;
  // Human-readable error message.
  message: string;
  // HTTP status code, when available.
  status?: number;
  // Field-level validation errors keyed by field name.
  fieldErrors?: Record<string, string[]>;
  // Whether the failure is network-related (offline / timeout).
  isNetworkError: boolean;
}

// Common cursor / page based query parameters.
export interface PaginationParams {
  // Page number to request (1-based).
  page?: number;
  // Number of items per page.
  pageSize?: number;
}
