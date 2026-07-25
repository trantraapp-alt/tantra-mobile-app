// Repository layer for the address book. Responses are unwrapped from the
// standard envelope by the shared httpClient, so these return payloads directly.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type {
  AddressWritePayload,
  AddressWriteResponse,
  SavedAddress,
} from '../types';

// Lists the user's saved addresses (default first).
function list(): Promise<SavedAddress[]> {
  return apiClient.get<SavedAddress[]>(endpoints.addresses.list);
}

// Fetches the default address, or null when the user has none.
function getDefault(): Promise<SavedAddress | null> {
  return apiClient.get<SavedAddress | null>(endpoints.addresses.default);
}

// Creates a new saved address.
function create(payload: AddressWritePayload): Promise<AddressWriteResponse> {
  return apiClient.post<AddressWriteResponse, AddressWritePayload>(
    endpoints.addresses.create,
    payload,
  );
}

// Updates an existing saved address.
function update(
  addressId: string,
  payload: AddressWritePayload,
): Promise<AddressWriteResponse> {
  return apiClient.put<AddressWriteResponse, AddressWritePayload>(
    endpoints.addresses.detail(addressId),
    payload,
  );
}

// Makes the address the user's default.
function setDefault(addressId: string): Promise<AddressWriteResponse> {
  return apiClient.patch<AddressWriteResponse, undefined>(
    endpoints.addresses.setDefault(addressId),
    undefined,
  );
}

// Deletes a saved address.
function remove(addressId: string): Promise<AddressWriteResponse> {
  return apiClient.remove<AddressWriteResponse>(
    endpoints.addresses.detail(addressId),
  );
}

// Address book repository.
export const addressesApi = {
  list,
  getDefault,
  create,
  update,
  setDefault,
  remove,
} as const;
