// Pure field-presentation rules for the listing detail (preview) screen.
//
// The screen promises to show every value the seller filled in, grouped by the
// form's own sections. All the sharp edges of that promise live here so they are
// in one testable place: falsy-vs-empty (`false` and `0` are values), stored
// `visibleWhen` re-evaluation, option-label resolution, hoisting of the values
// that get their own presentation (photos, price, quantity, title, description,
// address), and number/currency formatting. Nothing in here renders JSX and
// nothing in here can produce the string "undefined".
import { type ListingField, type ListingForm, localize } from '@/features/sell';
import type { PreferredLanguage } from '@/types';
import { formatCurrency, formatNumber } from '@/utils';

import { addressValueFromApi } from '../forms/listingValues';
import type { MyListing } from '../types';
import {
  isFilled,
  readFieldValue,
  resolveOptionLabel,
  resolveTitleField,
} from './listingDisplay';

// Common field keys hoisted out of the spec rows into the price band.
const HOISTED_KEYS = new Set([
  'offeredPrice',
  'actualPrice',
  'discountPct',
  'quantity',
]);
// Field keys whose numeric value reads as money rather than as a count.
const MONEY_KEY = /price|amount|cost|rent|fee|rate|total|mrp/i;
// Field key of the unit that pairs with the hoisted quantity.
const UNIT_KEY = /unit$/i;
// Values longer than this stop being tokens and get a full-width stacked row —
// a ragged multi-line value squeezed into a narrow column is unreadable.
const BLOCK_TEXT_LENGTH = 42;

// A formatted field value, discriminated by how it should be rendered.
export type ListingDetailValue =
  // A single short-to-medium string.
  | { kind: 'text'; text: string }
  // A yes/no answer; `false` is a real answer and is always shown.
  | { kind: 'boolean'; value: boolean }
  // A multi-select answer rendered as inert pills.
  | { kind: 'tags'; items: string[] }
  // A free-text paragraph.
  | { kind: 'prose'; text: string }
  // A required field the seller left empty — the one gap made visible.
  | { kind: 'missing' };

// One label/value pair ready to render.
export interface ListingDetailRow {
  // Stable key (the field key).
  key: string;
  // Localized field label.
  label: string;
  // Formatted value.
  value: ListingDetailValue;
  // Whether the value needs its own full-width line below the label.
  stacked: boolean;
}

// A form section reduced to its non-empty rows.
export interface ListingDetailSection {
  // Stable key (the section key).
  key: string;
  // Localized, uppercased section title.
  title: string;
  // Rows in `displayOrder`.
  rows: ListingDetailRow[];
}

// A free-text paragraph hoisted out of its section.
export interface ListingDetailProse {
  // Stable key (the field key).
  key: string;
  // Localized field label.
  label: string;
  // The paragraph text.
  text: string;
}

// The stored address rendered as readable lines.
export interface ListingAddressBlock {
  // Address lines, empty parts already dropped.
  lines: string[];
  // Contact numbers in order (primary first).
  phones: string[];
  // "lat, lng" when both coordinates were captured, else null.
  coordinates: string | null;
}

// Everything the detail screen needs to render its body.
export interface ListingDetailModel {
  // Sections that kept at least one row, in schema order.
  sections: ListingDetailSection[];
  // Free-text paragraphs, in schema order.
  descriptions: ListingDetailProse[];
  // The address block, or null when nothing was captured.
  address: ListingAddressBlock | null;
  // Quantity with its resolved unit label, or null when unset.
  quantityText: string | null;
  // Field key that became the page heading, so it is not repeated as a row.
  titleFieldKey: string | null;
}

// Options for building the detail model.
export interface BuildListingDetailOptions {
  // The category form schema, or null when it failed to load.
  form: ListingForm | null;
  // The listing whose stored values are being read.
  listing: MyListing;
  // Active language for every localized label.
  language: PreferredLanguage;
}

// Whether a field's `visibleWhen` condition holds against the STORED values.
// Mirrors ConditionalField in DynamicListingForm exactly; without it the preview
// resurrects answers to questions the form stopped asking.
export function isFieldVisible(
  field: ListingField,
  listing: MyListing,
  byKey: Map<string, ListingField>,
): boolean {
  const when = field.visibleWhen;
  if (!when) {
    return true;
  }
  const controller = byKey.get(when.field);
  if (!controller) {
    return true;
  }
  const raw = readFieldValue(listing, controller);
  return typeof when.value === 'boolean'
    ? Boolean(raw) === when.value
    : String(raw) === when.value;
}

// Formats a numeric-ish value, using currency for money-shaped field keys and
// keeping fraction digits only when the stored number actually has them.
function formatNumeric(field: ListingField, raw: unknown): string | null {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    const text = String(raw).trim();
    return text === '' ? null : text;
  }
  if (MONEY_KEY.test(field.fieldKey)) {
    return formatCurrency(numeric);
  }
  return formatNumber(numeric, Number.isInteger(numeric) ? 0 : 2);
}

// Formats one field's stored value, or returns null when the row should be
// omitted entirely. A required field left blank returns the `missing` marker
// instead, because that gap is itself information the seller must act on.
export function formatFieldValue(
  field: ListingField,
  listing: MyListing,
  language: PreferredLanguage,
): ListingDetailValue | null {
  const raw = readFieldValue(listing, field);
  if (!isFilled(raw)) {
    return field.required === true ? { kind: 'missing' } : null;
  }

  switch (field.type) {
    case 'BOOLEAN':
      return { kind: 'boolean', value: Boolean(raw) };
    case 'CHECKBOX_GROUP': {
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
    case 'DECIMAL':
    case 'AUTO_CALC': {
      const text = formatNumeric(field, raw);
      return text === null ? null : { kind: 'text', text };
    }
    default: {
      const text = String(raw).trim();
      return text === '' ? null : { kind: 'text', text };
    }
  }
}

// Whether a value is too long or too multi-part for the two-column row.
function isStacked(value: ListingDetailValue): boolean {
  if (value.kind === 'tags') {
    return value.items.length >= 3;
  }
  if (value.kind === 'text') {
    return value.text.length > BLOCK_TEXT_LENGTH;
  }
  return false;
}

// Turns the stored address object into readable stacked lines. An address read
// back as eleven key/value rows is unreadable, so it gets its own shape.
export function readAddressBlock(raw: unknown): ListingAddressBlock | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const address = addressValueFromApi(raw);
  const lines = [
    address.fullAddress,
    [address.village, address.district].filter(Boolean).join(', '),
    [address.city, address.state].filter(Boolean).join(', '),
    [address.country, address.pinCode].filter(Boolean).join(' - '),
  ]
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const phones = [address.mobileNumber, address.altMobileNumber]
    .map((phone) => phone.trim())
    .filter((phone) => phone !== '');
  const latitude = address.latitude.trim();
  const longitude = address.longitude.trim();
  const coordinates =
    latitude !== '' && longitude !== '' ? `${latitude}, ${longitude}` : null;

  if (lines.length === 0 && phones.length === 0 && coordinates === null) {
    return null;
  }
  return { lines, phones, coordinates };
}

// Builds the "40 Quintal" line from the hoisted quantity and its unit field.
function buildQuantityText(
  listing: MyListing,
  unitField: ListingField | undefined,
  language: PreferredLanguage,
): string | null {
  const raw = listing.quantity;
  if (!isFilled(raw)) {
    return null;
  }
  const numeric = Number(raw);
  const base = Number.isFinite(numeric)
    ? formatNumber(numeric, Number.isInteger(numeric) ? 0 : 2)
    : String(raw).trim();
  if (base === '') {
    return null;
  }
  if (!unitField) {
    return base;
  }
  const unitLabel = resolveOptionLabel(
    unitField,
    String(readFieldValue(listing, unitField)),
    language,
  ).trim();
  return unitLabel === '' ? base : `${base} ${unitLabel}`;
}

// Reduces a listing plus its form schema to everything the detail screen
// renders. Section order and per-section `displayOrder` are preserved exactly,
// so the preview reads back in the order the seller filled the form in.
export function buildListingDetailModel({
  form,
  listing,
  language,
}: BuildListingDetailOptions): ListingDetailModel {
  const address = readAddressBlock(listing.address);

  if (!form) {
    return {
      sections: [],
      descriptions: [],
      address,
      quantityText: buildQuantityText(listing, undefined, language),
      titleFieldKey: null,
    };
  }

  const allFields = form.sections.flatMap((section) => section.fields);
  const byKey = new Map(allFields.map((field) => [field.fieldKey, field]));

  // Only hide the heading's source field when the heading really came from it.
  const titleField = listing.title
    ? undefined
    : resolveTitleField(listing, form);
  const unitField = allFields.find(
    (field) =>
      UNIT_KEY.test(field.fieldKey) && isFilled(readFieldValue(listing, field)),
  );

  const hidden = new Set<string>(HOISTED_KEYS);
  if (titleField) {
    hidden.add(titleField.fieldKey);
  }
  if (unitField) {
    hidden.add(unitField.fieldKey);
  }

  const sections: ListingDetailSection[] = [];
  const descriptions: ListingDetailProse[] = [];

  for (const section of form.sections) {
    const rows: ListingDetailRow[] = [];
    const ordered = [...section.fields].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    for (const field of ordered) {
      // Photos are the gallery and the address has its own block.
      if (field.type === 'IMAGE' || field.type === 'ADDRESS') {
        continue;
      }
      if (hidden.has(field.fieldKey)) {
        continue;
      }
      if (!isFieldVisible(field, listing, byKey)) {
        continue;
      }
      const value = formatFieldValue(field, listing, language);
      if (!value) {
        continue;
      }
      const label = localize(field.label, language);
      if (value.kind === 'prose') {
        descriptions.push({ key: field.fieldKey, label, text: value.text });
        continue;
      }
      rows.push({
        key: field.fieldKey,
        label,
        value,
        stacked: isStacked(value),
      });
    }

    if (rows.length > 0) {
      sections.push({
        key: section.key,
        title: localize(section.title, language).toUpperCase(),
        rows,
      });
    }
  }

  return {
    sections,
    descriptions,
    address,
    quantityText: buildQuantityText(listing, unitField, language),
    titleFieldKey: titleField?.fieldKey ?? null,
  };
}
