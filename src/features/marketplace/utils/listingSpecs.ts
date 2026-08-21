// Turns a public listing plus its category's form schema into the display model
// the buyer detail screen renders.
//
// The screen promises to read back EVERY question the seller's form asked — the
// answer when there is one, "NA" when there is not — so a buyer can tell an
// unanswered question from one that was never asked. All the sharp edges of that
// promise live here, in one pure, testable place:
//
//   • falsy-vs-empty: `false` and `0` are answers, `''` / `null` / `[]` are not;
//   • stored values live in two buckets — `common: true` fields are top-level on
//     the DTO, everything else sits under `attributes`;
//   • dropdown/checkbox answers are stored as raw option VALUES ("wheat") and
//     only become readable through the schema's localized option labels;
//   • `visibleWhen` is re-evaluated against the stored values, so questions the
//     form never asked this listing are not resurrected as a wall of "NA" —
//     unless the listing carries an answer for them anyway, which is never lost;
//   • attributes with no matching schema field (older listings, schema drift)
//     are still shown, under their humanized key.
//
// Nothing here renders JSX and nothing here can produce the string "undefined".
import { type FeedListing, humanizeAttributeKey } from '@/features/home';
import { type ListingField, type ListingForm, localize } from '@/features/sell';
import type { PreferredLanguage } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils';

// Field keys whose numeric value reads as money rather than as a count.
const MONEY_KEY = /price|amount|cost|rent|fee|rate|total|mrp/i;
// Field keys whose numeric value is a percentage.
const PERCENT_KEY = /pct|percent/i;
// Field keys that most likely hold the listing's descriptive name.
const NAME_HINT = /name|title|variety|breed|model|brand/i;
// Field types eligible to act as the listing's display name.
const NAME_TYPES: string[] = ['DROPDOWN', 'RADIO', 'TEXT'];
// Field keys that hold the unit the quantity is measured in. A form can carry
// several unit-ish fields (a price unit, a packaging unit), so the quantity's
// own unit is preferred and the looser pattern is only a fallback.
const QUANTITY_UNIT_KEY =
  /^(unit|uom|measurement|(quantity|qty)(unit|measurement)?)$/i;
const UNIT_KEY = /(unit|uom|measurement)$/i;
// Field keys whose value is a free-text description of the item.
const DESCRIPTION_KEY = /description|about|remarks/i;
// Values longer than this stop being tokens and get a full-width stacked row —
// a ragged multi-line value squeezed into a half-width column is unreadable.
const BLOCK_TEXT_LENGTH = 34;
// Types that never become a spec row: photos are the gallery and the address has
// its own Location card.
const HIDDEN_TYPES = new Set(['IMAGE', 'ADDRESS']);
// Attribute keys that are plumbing rather than answers.
const HIDDEN_ATTRIBUTE_KEYS = new Set(['images', 'photos', 'address']);

// Static labels the builder needs but must not resolve itself (it stays free of
// the i18n runtime so it can be unit-tested with plain strings).
export interface ListingSpecLabels {
  // Shown in place of an answer the seller did not give.
  na: string;
  // BOOLEAN answers.
  yes: string;
  no: string;
  // Section title for values that have no matching schema field.
  other: string;
}

// One label/value pair ready to render.
export interface ListingSpecRow {
  // Stable key (the field key).
  key: string;
  // Localized field label.
  label: string;
  // Formatted value, already fallen back to the "NA" label when unanswered.
  value: string;
  // Whether the value needs its own full-width line below the label.
  stacked: boolean;
  // Whether this row is the "NA" placeholder rather than a real answer.
  empty: boolean;
}

// A form section reduced to its rows, in schema order.
export interface ListingSpecSection {
  // Stable key (the section key).
  key: string;
  // Localized section title.
  title: string;
  // Rows in `displayOrder`.
  rows: ListingSpecRow[];
}

// Shared inputs for every builder in this module.
export interface ListingSpecOptions {
  // The listing whose stored values are being read.
  listing: FeedListing;
  // The category form schema, or null when it is still loading / failed.
  form: ListingForm | null;
  // Active language for every localized label.
  language: PreferredLanguage;
}

// Options for the full spec build.
export interface BuildListingSpecsOptions extends ListingSpecOptions {
  // Static labels ("NA", "Yes", "No", "Other details").
  labels: ListingSpecLabels;
  // Field keys already rendered elsewhere on the screen (e.g. the description
  // paragraph, which gets its own card and would be unreadable in the grid).
  skipKeys?: ReadonlySet<string>;
}

// Reads a field's stored value. `common: true` fields are top-level on the DTO
// and the rest live under `attributes`, but that flag is schema metadata which
// can disagree with what the API actually sent, so the other bucket is checked
// as a fallback before a value is declared missing.
export function readListingValue(
  listing: FeedListing,
  field: ListingField,
): unknown {
  const top = (listing as unknown as Record<string, unknown>)[field.fieldKey];
  const nested = listing.attributes?.[field.fieldKey];
  const primary = field.common ? top : nested;
  return primary === undefined ? (field.common ? nested : top) : primary;
}

// Whether a stored value counts as an answer. `false` and `0` do — a plain falsy
// check here would turn every "No" and every zero into "NA".
export function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).length > 0;
  }
  return true;
}

// Resolves a stored option value to its localized label, falling back to the raw
// value so an option later removed from the schema still reads as something.
function optionLabel(
  field: ListingField,
  value: string,
  language: PreferredLanguage,
): string {
  const option = field.options?.find((item) => item.value === value);
  const label = option ? localize(option.label, language).trim() : '';
  return label !== '' ? label : value.trim();
}

// Whether a field's `visibleWhen` condition holds against the STORED values —
// mirrors ConditionalField in DynamicListingForm, so the read-back asks exactly
// the questions the form asked.
function isVisible(
  field: ListingField,
  listing: FeedListing,
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
  const raw = readListingValue(listing, controller);
  const matches = (candidate: string | boolean): boolean =>
    typeof candidate === 'boolean'
      ? Boolean(raw) === candidate
      : String(raw) === candidate;

  switch (when.operator ?? 'equals') {
    case 'notEquals':
      return !matches(when.value as string | boolean);
    case 'in':
      return (
        Array.isArray(when.value) && when.value.some((entry) => matches(entry))
      );
    case 'notIn':
      return (
        Array.isArray(when.value) && !when.value.some((entry) => matches(entry))
      );
    default:
      return matches(when.value as string | boolean);
  }
}

// Formats a numeric-ish value: money for money-shaped keys, a percentage for
// percent-shaped ones, otherwise a grouped number that keeps fraction digits
// only when the stored number actually has them.
function formatNumeric(field: ListingField, raw: unknown): string {
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return String(raw).trim();
  }
  if (MONEY_KEY.test(field.fieldKey)) {
    return formatCurrency(numeric);
  }
  const text = formatNumber(numeric, Number.isInteger(numeric) ? 0 : 2);
  return PERCENT_KEY.test(field.fieldKey) ? `${text}%` : text;
}

// Formats one field's stored value as display text, or '' when unanswered.
export function formatListingValue(
  field: ListingField,
  listing: FeedListing,
  language: PreferredLanguage,
  labels: Pick<ListingSpecLabels, 'yes' | 'no'>,
): string {
  const raw = readListingValue(listing, field);
  if (!isAnswered(raw)) {
    return '';
  }

  switch (field.type) {
    case 'BOOLEAN':
      return raw === true || raw === 'true' ? labels.yes : labels.no;
    case 'CHECKBOX_GROUP':
    case 'MULTISELECT': {
      const source = Array.isArray(raw) ? raw : [raw];
      return source
        .map((entry) => optionLabel(field, String(entry), language))
        .filter((label) => label !== '')
        .join(', ');
    }
    case 'DROPDOWN':
    case 'RADIO': {
      const stored = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw);
      return optionLabel(field, stored, language);
    }
    case 'NUMBER':
    case 'DECIMAL':
    case 'AUTO_CALC':
      return formatNumeric(field, raw);
    case 'DATE': {
      const stored = String(raw).trim();
      const formatted = formatDate(stored);
      // dayjs answers "Invalid Date" for anything it cannot parse — show the
      // stored text rather than that.
      return formatted === 'Invalid Date' ? stored : formatted;
    }
    default:
      return typeof raw === 'object' ? JSON.stringify(raw) : String(raw).trim();
  }
}

// Builds one row, substituting the "NA" label for an unanswered field.
function toRow(
  key: string,
  label: string,
  text: string,
  labels: ListingSpecLabels,
  forceStacked = false,
): ListingSpecRow {
  const empty = text.trim() === '';
  return {
    key,
    label,
    value: empty ? labels.na : text,
    stacked: !empty && (forceStacked || text.length > BLOCK_TEXT_LENGTH),
    empty,
  };
}

// The field whose value acts as the listing's display name (the crop, breed or
// model actually being sold) — the heading a buyer should read instead of the
// category name. Undefined when the schema asks no such question.
export function resolveNameField(
  listing: FeedListing,
  form: ListingForm | null,
): ListingField | undefined {
  if (!form) {
    return undefined;
  }
  return form.sections
    .flatMap((section) => section.fields)
    .filter(
      (field) =>
        NAME_TYPES.includes(field.type) &&
        NAME_HINT.test(field.fieldKey) &&
        isAnswered(readListingValue(listing, field)),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder)[0];
}

// The listing's own name ("Wheat", "Sahiwal", "Mahindra 575"), resolved through
// the schema's option labels — null when the schema or the answer is missing, so
// the caller can fall back to the API title.
export function deriveListingName({
  listing,
  form,
  language,
}: ListingSpecOptions): string | null {
  const field = resolveNameField(listing, form);
  if (!field) {
    return null;
  }
  const text = formatListingValue(field, listing, language, {
    yes: '',
    no: '',
  }).trim();
  return text === '' ? null : text;
}

// The unit that pairs with the quantity, resolved to its localized option label
// ("Quintal", not "QUINTAL"). Falls back to the DTO's plain `unit` string.
export function resolveUnitLabel({
  listing,
  form,
  language,
}: ListingSpecOptions): string | null {
  const candidates = (form?.sections ?? [])
    .flatMap((section) => section.fields)
    .filter(
      (candidate) =>
        candidate.type !== 'NUMBER' &&
        candidate.type !== 'DECIMAL' &&
        UNIT_KEY.test(candidate.fieldKey) &&
        isAnswered(readListingValue(listing, candidate)),
    );
  const field =
    candidates.find((candidate) =>
      QUANTITY_UNIT_KEY.test(candidate.fieldKey),
    ) ?? candidates[0];
  if (field) {
    const label = formatListingValue(field, listing, language, {
      yes: '',
      no: '',
    }).trim();
    if (label !== '') {
      return label;
    }
  }
  const plain = (listing.unit ?? '').trim();
  return plain === '' ? null : plain;
}

// "50 Quintal" — the quantity with its unit, or null when no quantity is set.
export function listingQuantityLabel(
  options: ListingSpecOptions,
): string | null {
  const raw = options.listing.quantity ?? options.listing.attributes?.quantity;
  if (!isAnswered(raw)) {
    return null;
  }
  const numeric = Number(raw);
  const base = Number.isFinite(numeric)
    ? formatNumber(numeric, Number.isInteger(numeric) ? 0 : 2)
    : String(raw).trim();
  if (base === '') {
    return null;
  }
  const unit = resolveUnitLabel(options);
  return unit ? `${base} ${unit}` : base;
}

// The free-text paragraph shown in the "About this product" card, plus the field
// key it came from so the caller can keep it out of the spec grid.
export function listingDescription({
  listing,
  form,
  language,
}: ListingSpecOptions): { key: string; text: string } | null {
  const fields = form?.sections.flatMap((section) => section.fields) ?? [];
  const field =
    fields.find(
      (candidate) =>
        candidate.type === 'TEXTAREA' &&
        isAnswered(readListingValue(listing, candidate)),
    ) ??
    fields.find(
      (candidate) =>
        DESCRIPTION_KEY.test(candidate.fieldKey) &&
        isAnswered(readListingValue(listing, candidate)),
    );

  if (field) {
    const text = formatListingValue(field, listing, language, {
      yes: '',
      no: '',
    }).trim();
    if (text !== '') {
      return { key: field.fieldKey, text };
    }
  }

  // No schema (or nothing matched): fall back to scanning the raw attributes.
  for (const [key, value] of Object.entries(listing.attributes ?? {})) {
    if (
      DESCRIPTION_KEY.test(key) &&
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      return { key, text: value.trim() };
    }
  }
  return null;
}

// Every stored attribute that no schema field claimed, so schema drift and older
// listings never silently drop information.
function orphanRows(
  listing: FeedListing,
  claimed: ReadonlySet<string>,
  labels: ListingSpecLabels,
): ListingSpecRow[] {
  return Object.entries(listing.attributes ?? {})
    .filter(
      ([key, value]) =>
        !claimed.has(key) &&
        !HIDDEN_ATTRIBUTE_KEYS.has(key) &&
        isAnswered(value),
    )
    .map(([key, value]) =>
      toRow(
        key,
        humanizeAttributeKey(key),
        Array.isArray(value)
          ? value.map((entry) => String(entry)).join(', ')
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value).trim(),
        labels,
      ),
    );
}

// Reduces a listing plus its form schema to the sections the detail grid renders,
// preserving section order and each section's `displayOrder`, so the page reads
// back in the order the seller filled the form in.
export function buildListingSpecs({
  listing,
  form,
  language,
  labels,
  skipKeys,
}: BuildListingSpecsOptions): ListingSpecSection[] {
  const skip: ReadonlySet<string> = skipKeys ?? new Set<string>();

  // No schema yet: show the raw stored attributes rather than an empty card.
  if (!form) {
    const rows = orphanRows(listing, skip, labels);
    return rows.length > 0
      ? [{ key: 'attributes', title: labels.other, rows }]
      : [];
  }

  const allFields = form.sections.flatMap((section) => section.fields);
  const byKey = new Map(allFields.map((field) => [field.fieldKey, field]));
  const sections: ListingSpecSection[] = [];

  for (const section of form.sections) {
    const rows: ListingSpecRow[] = [];
    const ordered = [...section.fields].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    for (const field of ordered) {
      if (HIDDEN_TYPES.has(field.type) || skip.has(field.fieldKey)) {
        continue;
      }
      const text = formatListingValue(field, listing, language, labels);
      // A question this listing was never asked (a conditional that does not
      // hold) is only shown when it somehow carries an answer — printing "NA"
      // for it would invent a gap the seller never had.
      if (text === '' && !isVisible(field, listing, byKey)) {
        continue;
      }
      rows.push(
        toRow(
          field.fieldKey,
          localize(field.label, language) ||
            humanizeAttributeKey(field.fieldKey),
          text,
          labels,
          field.type === 'TEXTAREA',
        ),
      );
    }

    if (rows.length > 0) {
      sections.push({
        key: section.key,
        title: localize(section.title, language),
        rows,
      });
    }
  }

  const claimed = new Set([...byKey.keys(), ...skip]);
  const extras = orphanRows(listing, claimed, labels);
  if (extras.length > 0) {
    sections.push({ key: 'other', title: labels.other, rows: extras });
  }

  return sections;
}
