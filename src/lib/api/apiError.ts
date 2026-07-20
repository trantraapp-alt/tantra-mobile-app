// Normalizes arbitrary Axios / runtime errors into the app's ApiError contract.
import { AxiosError } from 'axios';

import type { ApiError } from '@/types';

// Error body shapes returned by the backend. Sign-in replies with
// `{ "error": "Error: Mobile number not registered!" }`, the forgot-password
// endpoints reply with a plain string such as `Error: Invalid OTP!`, and
// Spring's default handler may reply with `{ message, error, status }`.
interface BackendErrorObject {
  error?: string;
  message?: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// A backend error body is either a JSON object or a bare string.
type BackendErrorBody = BackendErrorObject | string;

// Default fallback message when the server provides none.
const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

// Strips the backend's redundant "Error: " prefix from a message.
function cleanMessage(message: string): string {
  return message.replace(/^Error:\s*/i, '').trim();
}

// Converts any thrown value into a normalized ApiError.
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return fromAxiosError(error);
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message || DEFAULT_MESSAGE,
      isNetworkError: false,
    };
  }

  return { code: 'UNKNOWN', message: DEFAULT_MESSAGE, isNetworkError: false };
}

// Maps an AxiosError into a normalized ApiError.
function fromAxiosError(error: AxiosError<BackendErrorBody>): ApiError {
  // No response means a network / timeout failure.
  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED';
    return {
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: isTimeout
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Check your connection.',
      isNetworkError: true,
    };
  }

  const { status, data } = error.response;

  // Some endpoints (forgot-password) return a bare string body.
  if (typeof data === 'string' && data.trim().length > 0) {
    return {
      code: `HTTP_${status}`,
      message: cleanMessage(data),
      status,
      isNetworkError: false,
    };
  }

  const body = typeof data === 'object' && data !== null ? data : undefined;
  // The backend puts the human-readable reason in `error`; fall back to
  // `message` for Spring's default error handler.
  const rawMessage = body?.error ?? body?.message;

  return {
    code: body?.code ?? `HTTP_${status}`,
    message: rawMessage ? cleanMessage(rawMessage) : DEFAULT_MESSAGE,
    status,
    fieldErrors: body?.errors,
    isNetworkError: false,
  };
}

// Returns a normalized ApiError, passing through values already normalized by
// the Axios interceptor. Use this at Redux thunk boundaries.
export function toApiError(value: unknown): ApiError {
  return isApiError(value) ? value : normalizeApiError(value);
}

// Type guard identifying a normalized ApiError.
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'isNetworkError' in value
  );
}
