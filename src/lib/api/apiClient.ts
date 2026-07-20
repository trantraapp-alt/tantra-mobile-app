// Typed convenience wrapper over the Axios instance.
// The backend returns raw JSON bodies (no success/data envelope), so the
// response body is handed back to callers as-is.
import type { AxiosRequestConfig } from 'axios';

import { httpClient } from './httpClient';

// Performs a GET request and returns the response body.
async function get<TData>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TData> {
  const response = await httpClient.get<TData>(url, config);
  return response.data;
}

// Performs a POST request and returns the response body.
async function post<TData, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TData> {
  const response = await httpClient.post<TData>(url, body, config);
  return response.data;
}

// Performs a PUT request and returns the response body.
async function put<TData, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TData> {
  const response = await httpClient.put<TData>(url, body, config);
  return response.data;
}

// Performs a PATCH request and returns the response body.
async function patch<TData, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
): Promise<TData> {
  const response = await httpClient.patch<TData>(url, body, config);
  return response.data;
}

// Performs a DELETE request and returns the response body.
async function remove<TData>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TData> {
  const response = await httpClient.delete<TData>(url, config);
  return response.data;
}

// Unified, typed API client used by every repository.
export const apiClient = { get, post, put, patch, remove } as const;
