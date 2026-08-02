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

import { apiErrorFromEnvelope, normalizeApiError } from './apiError';
import { localeStore } from './localeStore';
import { tokenStore } from './tokenStore';

// The standard success/error envelope every endpoint now returns. The real
// payload lives in `data`; a compact write response may instead carry its
// fields (listingId, message…) at the top level alongside `success`.
interface ResponseEnvelope {
  // Application-level success flag.
  success: boolean;
  // The unwrapped payload, when the endpoint wraps one.
  data?: unknown;
  // Server trace id, mirrored in the X-Trace-Id header.
  traceId?: string;
}

// Whether a response body is the standard envelope (has a boolean `success`).
function isEnvelope(body: unknown): body is ResponseEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as ResponseEnvelope).success === 'boolean'
  );
}

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

// Response interceptor: unwraps the standard envelope, ends the session on 401,
// and retries transient failures.
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;
    // A packaged app hitting a wrong URL or the ngrok browser-warning page gets
    // HTML (HTTP 200) instead of JSON. Left unchecked this surfaces as cryptic
    // "undefined field" / SecureStore errors far downstream, so fail clearly and
    // point at the real cause.
    if (typeof body === 'string' && /<\s*(!doctype|html)/i.test(body)) {
      return Promise.reject(
        new Error(
          'The API returned an HTML page instead of JSON — the request is likely ' +
            'hitting the ngrok warning page or a wrong API base URL. Check ' +
            'apiBaseUrl / the ngrok tunnel.',
        ),
      );
    }
    if (isEnvelope(body)) {
      // A 2xx with success:false is still an application-level failure.
      if (body.success === false) {
        return Promise.reject(apiErrorFromEnvelope(body, response.status));
      }
      // Unwrap the payload when the endpoint wraps one; leave compact write
      // responses ({ success, listingId, message }) untouched so their
      // top-level fields survive for the caller.
      if ('data' in body && body.data !== undefined) {
        response.data = body.data;
      }
    }
    return response;
  },
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
