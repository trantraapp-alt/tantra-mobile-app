// Configured Axios instance with auth injection, language propagation,
// retry-with-backoff for transient failures and centralized error handling.
//
// The auth backend issues a single long-lived JWT and exposes no refresh
// endpoint, so an unauthorized response ends the session rather than
// triggering a token refresh.
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { apiConfig } from '@/config';

import { normalizeApiError } from './apiError';
import { localeStore } from './localeStore';
import { tokenStore } from './tokenStore';

// Adds an opt-out flag so specific requests (e.g. bootstrap validation) can
// handle a 401 themselves instead of triggering the global session-expiry flow.
declare module 'axios' {
  interface AxiosRequestConfig {
    // When true, a 401 on this request does not clear the token or end the
    // session — the caller decides the outcome.
    skipSessionExpiry?: boolean;
  }
}

// Extends the request config with internal retry bookkeeping.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  // Number of transient-failure retries already performed.
  _retryCount?: number;
}

// Callback invoked when the session is no longer valid.
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

// Registers the handler called when the server rejects the current token.
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

// Primary Axios instance used by every repository.
export const httpClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

// Determines whether a failed request is safe and eligible to retry.
function shouldRetry(error: AxiosError, config: RetryableRequestConfig): boolean {
  const method = (config.method ?? 'get').toLowerCase();
  const isIdempotent = method === 'get' || method === 'head';
  const isTransient =
    !error.response ||
    error.response.status >= 500 ||
    error.code === 'ECONNABORTED';
  const attempts = config._retryCount ?? 0;

  return isIdempotent && isTransient && attempts < apiConfig.maxRetries;
}

// Resolves after an exponential backoff delay for the given attempt.
function backoff(attempt: number): Promise<void> {
  const delay = apiConfig.retryDelayMs * 2 ** attempt;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Request interceptor: attaches the bearer token and the `lang` query param.
httpClient.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // The backend localizes responses via a `lang` query parameter.
  config.params = { lang: localeStore.getLanguage(), ...config.params };

  return config;
});

// Response interceptor: ends the session on 401 and retries transient failures.
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    if (!config) {
      return Promise.reject(normalizeApiError(error));
    }

    // An unauthorized response means the token is invalid or expired. With no
    // refresh endpoint available, the only correct action is to end the session
    // — unless the caller opted out (e.g. bootstrap, which validates elsewhere).
    if (error.response?.status === 401) {
      if (!config.skipSessionExpiry) {
        await tokenStore.clearTokens();
        onSessionExpired?.();
      }
      return Promise.reject(normalizeApiError(error));
    }

    // Retry idempotent requests on transient network / server failures.
    if (shouldRetry(error, config)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      await backoff(config._retryCount - 1);
      return httpClient(config);
    }

    return Promise.reject(normalizeApiError(error));
  },
);
