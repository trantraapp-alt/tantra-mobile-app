// Pure field-presentation rules for the Business Profile detail screen —
// mirrors listings' listingDetailFields.ts, adapted for a profile's
// common/attributes split instead of a flat listing record.
import { type ListingField, type ListingForm, localize } from '@/features/sell';
import type { PreferredLanguage } from '@/types';
import { formatNumber } from '@/utils';

import type { BusinessProfile } from '../types/businessProfile.types';

// Common fields already shown in the identity block / visibility toggle —
// never repeated as a generic row.
const HOISTED_KEYS = new Set(['profileType', 'businessName', 'isVisible', 'photos']);
// Values longer than this stop being tokens and get a full-width stacked row.
const BLOCK_TEXT_LENGTH = 42;

export type BPDetailValue =
  | { kind: 'text'; text: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'tags'; items: string[] }
  | { kind: 'prose'; text: string };

export interface BPDetailRow {
  key: string;
  label: string;
  value: BPDetailValue;
  stacked: boolean;
}

export interface BPDetailSection {
  key: string;
  title: string;
  rows: BPDetailRow[];
}

export interface BPDetailProse {
  key: string;
  label: string;
  text: string;
}

export interface BPAddressBlock {
  lines: string[];
  phones: string[];
  coordinates: string | null;
}

export interface BusinessProfileDetailModel {
  sections: BPDetailSection[];
  descriptions: BPDetailProse[];
  photos: string[];
  address: BPAddressBlock | null;
}

// Reads a field's stored value: common fields sit at the profile's top level,
// everything else lives under `attributes`.
function readValue(profile: BusinessProfile, field: ListingField): unknown {
  return field.common
    ? (profile as unknown as Record<string, unknown>)[field.fieldKey]
    : (profile.attributes?.[field.fieldKey] ?? null);
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

function resolveOptionLabel(
  field: ListingField,
  value: string,
  language: PreferredLanguage,
): string {
  const option = field.options?.find((item) => item.value === value);
  return option ? localize(option.label, language) : value;
}

function isStacked(value: BPDetailValue): boolean {
  if (value.kind === 'tags') {
    return value.items.length >= 3;
  }
  if (value.kind === 'text') {
    return value.text.length > BLOCK_TEXT_LENGTH;
  }
  return false;
}

function formatFieldValue(
  field: ListingField,
  profile: BusinessProfile,
  language: PreferredLanguage,
): BPDetailValue | null {
  const raw = readValue(profile, field);
  if (!isFilled(raw)) {
    return null;
  }

  switch (field.type) {
    case 'BOOLEAN':
      return { kind: 'boolean', value: Boolean(raw) };
    case 'CHECKBOX_GROUP':
    case 'MULTISELECT': {
      const source = Array.isArray(raw) ? raw : [raw];
      const items = source
        .map((entry) => resolveOptionLabel(field, String(entry), language))
        .filter((label) => label.trim() !== '');
      return items.length > 0 ? { kind: 'tags', items } : null;
    }
    case 'DROPDOWN':
    case 'RADIO': {
      const stored = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw);
      const label = resolveOptionLabel(field, stored, language).trim();
      return label === '' ? null : { kind: 'text', text: label };
    }
    case 'TEXTAREA': {
      const text = String(raw).trim();
      return text === '' ? null : { kind: 'prose', text };
    }
    case 'NUMBER':
    case 'DECIMAL': {
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        const text = String(raw).trim();
        return text === '' ? null : { kind: 'text', text };
      }
      return {
        kind: 'text',
        text: formatNumber(numeric, Number.isInteger(numeric) ? 0 : 2),
      };
    }
    default: {
      const text = String(raw).trim();
      return text === '' ? null : { kind: 'text', text };
    }
  }
}

// Turns the stored address object into readable stacked lines.
function readAddressBlock(raw: unknown): BPAddressBlock | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const src = raw as Record<string, unknown>;
  const str = (key: string) =>
    src[key] === null || src[key] === undefined ? '' : String(src[key]).trim();

  const lines = [
    str('fullAddress'),
    [str('village'), str('district')].filter(Boolean).join(', '),
    [str('city'), str('state')].filter(Boolean).join(', '),
    [str('country'), str('pinCode')].filter(Boolean).join(' - '),
  ].filter((line) => line !== '');
  const phones = [str('mobileNumber'), str('altMobileNumber')].filter(
    (phone) => phone !== '',
  );
  const latitude = str('latitude');
  const longitude = str('longitude');
  const coordinates =
    latitude !== '' && longitude !== '' ? `${latitude}, ${longitude}` : null;

  if (lines.length === 0 && phones.length === 0 && coordinates === null) {
    return null;
  }
  return { lines, phones, coordinates };
}

// Reduces a profile plus its form schema to everything the detail screen
// renders: sections/rows in schema order, prose paragraphs hoisted out,
// photos and address given their own presentation.
export function buildBusinessProfileDetailModel(
  form: ListingForm | null,
  profile: BusinessProfile,
  language: PreferredLanguage,
): BusinessProfileDetailModel {
  const photosRaw = profile.attributes?.photos;
  const photos = Array.isArray(photosRaw)
    ? photosRaw.filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    : [];
  const address = readAddressBlock(profile.address);

  if (!form) {
    return { sections: [], descriptions: [], photos, address };
  }

  const sections: BPDetailSection[] = [];
  const descriptions: BPDetailProse[] = [];

  for (const section of form.sections) {
    const rows: BPDetailRow[] = [];
    const ordered = [...section.fields].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    for (const field of ordered) {
      if (field.type === 'IMAGE' || field.type === 'ADDRESS') {
        continue;
      }
      if (HOISTED_KEYS.has(field.fieldKey)) {
        continue;
      }
      const value = formatFieldValue(field, profile, language);
      if (!value) {
        continue;
      }
      const label = localize(field.label, language);
      if (value.kind === 'prose') {
        descriptions.push({ key: field.fieldKey, label, text: value.text });
        continue;
      }
      rows.push({ key: field.fieldKey, label, value, stacked: isStacked(value) });
    }

    if (rows.length > 0) {
      sections.push({
        key: section.key,
        title: localize(section.title, language).toUpperCase(),
        rows,
      });
    }
  }

  return { sections, descriptions, photos, address };
}
