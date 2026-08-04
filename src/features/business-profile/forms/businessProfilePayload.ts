// Assembles the create/update business-profile payload from a form schema and
// collected values. Common fields (common:true) go top-level; the rest land in
// `attributes`. The business-profile API only accepts an inline address object
// (no addressId / useDefaultAddress reference support, unlike listings), so a
// "use my default address" or "saved address" selection has to be resolved to
// its actual field values here rather than passed through as a reference.
import { addressesApi, type SavedAddress } from '@/features/addresses';
import {
  type AddressPayload,
  addressToPayload,
  type AddressValue,
  isAddressSelection,
  isAddressValue,
} from '@/features/sell/forms/address';
import type { ListingForm } from '@/features/sell/forms/listingForm.types';
import type { ListingValues } from '@/features/sell/forms/listingPayload';
import { coerceFieldValue } from '@/features/sell/forms/listingPayload';

import type { BusinessProfilePayload } from '../api/businessProfileApi';

// Trims a string, returning null when empty — mirrors address.ts's own helper
// since a saved-address record's fields are already plain strings/numbers,
// not the form's AddressValue shape.
function text(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

// Converts a saved address-book record to the inline shape the business-profile
// API expects.
function savedAddressToPayload(saved: SavedAddress): AddressPayload {
  return {
    fullAddress: text(saved.fullAddress),
    village: text(saved.village),
    district: text(saved.district),
    city: text(saved.city),
    state: text(saved.state),
    country: text(saved.country),
    pinCode: text(saved.pinCode),
    mobileNumber: text(saved.mobileNumber),
    altMobileNumber: text(saved.altMobileNumber),
    latitude: saved.latitude ?? null,
    longitude: saved.longitude ?? null,
  };
}

// Resolves the user's default saved address (or a specific one by id) from
// the address book, converted to the inline payload shape.
async function resolveSavedAddress(
  addressId?: string,
): Promise<Record<string, unknown> | undefined> {
  const addresses = await addressesApi.list();
  const match = addressId
    ? addresses.find((item) => item.addressId === addressId)
    : (addresses.find((item) => item.isDefault) ?? addresses[0]);
  return match
    ? (savedAddressToPayload(match) as unknown as Record<string, unknown>)
    : undefined;
}

// Converts a form AddressValue/AddressSelection to the inline address object
// the business-profile API expects — resolving a "default"/"saved" selection
// against the address book rather than dropping it.
async function extractAddress(
  raw: unknown,
): Promise<Record<string, unknown> | undefined> {
  if (isAddressSelection(raw)) {
    if (raw.mode === 'manual') {
      return addressToPayload(raw.value) as unknown as Record<string, unknown>;
    }
    if (raw.mode === 'saved') {
      return resolveSavedAddress(raw.addressId);
    }
    // mode === 'default'
    return resolveSavedAddress();
  }
  if (isAddressValue(raw)) {
    return addressToPayload(raw as AddressValue) as unknown as Record<
      string,
      unknown
    >;
  }
  return undefined;
}

// Builds the business-profile POST/PUT body from the schema and form values.
export async function buildBusinessProfilePayload(
  form: ListingForm,
  values: ListingValues,
): Promise<BusinessProfilePayload> {
  const common: Record<string, unknown> = {};
  const attributes: Record<string, unknown> = {};

  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'ADDRESS') {
        const address = await extractAddress(values[field.fieldKey]);
        if (address) {
          common.address = address;
        }
        continue;
      }

      const value = coerceFieldValue(field, values[field.fieldKey]);
      if (value === undefined) {
        continue;
      }

      if (field.common) {
        common[field.fieldKey] = value;
      } else {
        attributes[field.fieldKey] = value;
      }
    }
  }

  return {
    profileType: (common.profileType as string) ?? '',
    businessName: (common.businessName as string) ?? '',
    isVisible: typeof common.isVisible === 'boolean' ? common.isVisible : true,
    address: (common.address as Record<string, unknown>) ?? {},
    ...common,
    attributes,
  };
}

// Maps a stored BusinessProfile back to flat ListingValues for the edit pre-fill.
// Common fields come from the profile's top level; the rest from attributes.
export function profileToFormValues(
  profile: {
    profileType?: string;
    businessName?: string;
    isVisible?: boolean;
    address?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
  },
  form: ListingForm,
): ListingValues {
  const values: ListingValues = {};

  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'ADDRESS') {
        // Convert stored address object back to an AddressValue wrapped in a
        // manual AddressSelection so the AddressSelectorField can display it.
        const addr = profile.address ?? {};
        values[field.fieldKey] = {
          mode: 'manual',
          value: {
            fullAddress: String(addr.fullAddress ?? ''),
            village: String(addr.village ?? ''),
            district: String(addr.district ?? ''),
            city: String(addr.city ?? ''),
            state: String(addr.state ?? ''),
            country: String(addr.country ?? ''),
            pinCode: String(addr.pinCode ?? ''),
            mobileNumber: String(addr.mobileNumber ?? ''),
            altMobileNumber: String(addr.altMobileNumber ?? ''),
            latitude: String(addr.latitude ?? ''),
            longitude: String(addr.longitude ?? ''),
          },
        };
        continue;
      }

      if (field.type === 'BOOLEAN') {
        if (field.common) {
          const raw = profile[field.fieldKey as keyof typeof profile];
          values[field.fieldKey] = typeof raw === 'boolean' ? raw : false;
        } else {
          const raw = profile.attributes?.[field.fieldKey];
          values[field.fieldKey] = typeof raw === 'boolean' ? raw : false;
        }
        continue;
      }

      if (
        field.type === 'IMAGE' ||
        field.type === 'CHECKBOX_GROUP' ||
        field.type === 'MULTISELECT'
      ) {
        const raw = field.common
          ? profile[field.fieldKey as keyof typeof profile]
          : profile.attributes?.[field.fieldKey];
        values[field.fieldKey] = Array.isArray(raw) ? raw : [];
        continue;
      }

      if (field.common) {
        const raw = profile[field.fieldKey as keyof typeof profile];
        values[field.fieldKey] = raw != null ? String(raw) : '';
      } else {
        const raw = profile.attributes?.[field.fieldKey];
        values[field.fieldKey] = raw != null ? String(raw) : '';
      }
    }
  }

  return values;
}
