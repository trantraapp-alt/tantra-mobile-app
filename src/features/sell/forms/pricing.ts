// Shared pricing rules for every listing form: the offered price may never
// exceed the actual (MRP) price, and the discount percentage is derived from the
// two. One module backs the create/edit form validation, the computed discount
// field, and the rent-capable forms that need the offered-price + discount
// inputs added — so the rule is defined once and reused everywhere.
import type {
  ListingField,
  ListingForm,
  LocalizedText,
} from './listingForm.types';

// Canonical field keys for the two price inputs (the backend's convention, also
// assumed by the computed discount field).
export const ACTUAL_PRICE_KEY = 'actualPrice';
export const OFFERED_PRICE_KEY = 'offeredPrice';

// Matches an actual/MRP/rent price field key when the canonical key is absent.
const ACTUAL_PRICE_PATTERN = /actual.*price|mrp|rent.*price/i;

// Message shown when the offered price is above the actual price.
const OFFERED_ABOVE_ACTUAL_MESSAGE =
  'Offered price cannot be more than the actual price';

// Parses a raw form value into a finite number, or null when blank/invalid.
export function toPriceNumber(raw: unknown): number | null {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text === '') {
      return null;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

// Reads the actual (MRP) price from a set of form values, preferring the
// canonical key and falling back to a keyed pattern match.
export function readActualPrice(values: Record<string, unknown>): number | null {
  const direct = toPriceNumber(values[ACTUAL_PRICE_KEY]);
  if (direct != null) {
    return direct;
  }
  for (const [key, raw] of Object.entries(values)) {
    if (ACTUAL_PRICE_PATTERN.test(key)) {
      const parsed = toPriceNumber(raw);
      if (parsed != null) {
        return parsed;
      }
    }
  }
  return null;
}

// Computes the discount percentage (0–100) from an actual + offered price, or
// null when either is missing or the actual price is not positive.
export function computeDiscountPercent(
  actual: number | null,
  offered: number | null,
): number | null {
  if (actual == null || offered == null || actual <= 0) {
    return null;
  }
  return Math.max(0, Math.round(((actual - offered) / actual) * 100));
}

// Whether a field is the offered (selling) price input.
export function isOfferedPriceField(field: ListingField): boolean {
  return (
    field.fieldKey === OFFERED_PRICE_KEY ||
    /offer(ed)?.?price/i.test(field.fieldKey)
  );
}

// Whether a field is the actual (MRP) price input.
export function isActualPriceField(field: ListingField): boolean {
  return (
    field.fieldKey === ACTUAL_PRICE_KEY ||
    ACTUAL_PRICE_PATTERN.test(field.fieldKey)
  );
}

// Validates that the offered price does not exceed the actual price. Returns an
// error message when it does, otherwise true. Either value being blank is valid
// (the required rules handle emptiness). Reused by every category form.
export function validateOfferedNotAboveActual(
  offeredRaw: unknown,
  values: Record<string, unknown>,
): true | string {
  const offered = toPriceNumber(offeredRaw);
  const actual = readActualPrice(values);
  if (offered == null || actual == null) {
    return true;
  }
  return offered <= actual ? true : OFFERED_ABOVE_ACTUAL_MESSAGE;
}

// Bilingual labels for the injected price fields.
const OFFERED_PRICE_LABEL: LocalizedText = {
  en: 'Offered Price',
  hi: 'प्रस्तावित मूल्य',
};
const DISCOUNT_LABEL: LocalizedText = {
  en: 'Discount %',
  hi: 'छूट %',
};

// Builds a synthetic offered-price input, anchored just after the actual price.
function makeOfferedPriceField(order: number, common: boolean): ListingField {
  return {
    fieldKey: OFFERED_PRICE_KEY,
    label: OFFERED_PRICE_LABEL,
    type: 'DECIMAL',
    displayOrder: order,
    required: false,
    common,
    validation: { min: 0 },
  };
}

// Builds a synthetic computed discount field (derived from actual + offered).
function makeDiscountField(order: number): ListingField {
  return {
    fieldKey: 'discountPercent',
    label: DISCOUNT_LABEL,
    type: 'AUTO_CALC',
    displayOrder: order,
    readOnly: true,
  };
}

// Ensures a rent-capable form's pricing section offers the offered-price input
// and the computed discount, adding whichever is missing so a rental is priced
// like a sale. A no-op when the form is not rent-capable, has no price field, or
// already carries both — so re-running it is always safe.
export function ensureOfferedPriceFields(
  form: ListingForm,
  isRentCapable: boolean,
): ListingForm {
  if (!isRentCapable) {
    return form;
  }
  const sections = form.sections.map((section) => {
    const actualIndex = section.fields.findIndex(isActualPriceField);
    if (actualIndex < 0) {
      return section;
    }
    const hasOffered = section.fields.some(isOfferedPriceField);
    const hasDiscount = section.fields.some(
      (field) => field.type === 'AUTO_CALC',
    );
    if (hasOffered && hasDiscount) {
      return section;
    }
    const actual = section.fields[actualIndex];
    const baseOrder = actual?.displayOrder ?? actualIndex;
    const additions: ListingField[] = [];
    if (!hasOffered) {
      additions.push(makeOfferedPriceField(baseOrder + 0.1, actual?.common ?? true));
    }
    if (!hasDiscount) {
      additions.push(makeDiscountField(baseOrder + 0.2));
    }
    const fields = [...section.fields];
    fields.splice(actualIndex + 1, 0, ...additions);
    return { ...section, fields };
  });
  return { ...form, sections };
}
