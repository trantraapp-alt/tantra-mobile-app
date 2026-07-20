// Types describing a server-driven listing form (sections + typed fields with
// options, validation, conditional visibility and computed values).
import type { PreferredLanguage } from '@/types';

// Bilingual label pair.
export interface LocalizedText {
  // English text.
  en: string;
  // Hindi text.
  hi: string;
}

// A selectable option for dropdown/radio fields.
export interface ListingFieldOption {
  // Stored value.
  value: string;
  // Bilingual display label.
  label: LocalizedText;
  // Optional parent value for dependent option sets.
  parent?: string | null;
}

// Validation rules attached to a field.
export interface ListingFieldValidation {
  // Maximum text length.
  maxLength?: number;
  // Minimum numeric value.
  min?: number;
  // Maximum count (e.g. images).
  max?: number;
  // Accepted file extensions (images).
  acceptedTypes?: string[];
}

// Condition controlling whether a field is shown.
export interface ListingFieldVisibleWhen {
  // The field whose value is compared.
  field: string;
  // Comparison operator.
  operator: 'equals';
  // Value the field must equal for this field to be visible.
  value: string | boolean;
}

// Computed/auto-calculated field descriptor.
export interface ListingFieldComputed {
  // Formula expressed in field keys.
  formula: string;
  // Whether the value is read-only.
  readOnly: boolean;
}

// Supported field input types.
export type ListingFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DECIMAL'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX_GROUP'
  | 'BOOLEAN'
  | 'AUTO_CALC'
  | 'IMAGE'
  | 'ADDRESS';

// A single form field.
export interface ListingField {
  // Unique field key used as the form value name.
  fieldKey: string;
  // Bilingual label.
  label: LocalizedText;
  // Input type.
  type: ListingFieldType;
  // Order within its section.
  displayOrder: number;
  // Whether the field is required.
  required?: boolean;
  // Placeholder hint.
  placeholder?: string | null;
  // Bilingual helper text.
  help?: LocalizedText | null;
  // Options for dropdown/radio fields.
  options?: ListingFieldOption[] | null;
  // Whether multiple values are allowed (e.g. images).
  multiple?: boolean;
  // Whether an "other" option reveals a free-text field.
  allowOther?: boolean;
  // Validation rules.
  validation?: ListingFieldValidation | null;
  // Conditional visibility.
  visibleWhen?: ListingFieldVisibleWhen | null;
  // Computed-value descriptor.
  computed?: ListingFieldComputed | null;
  // Whether this is a common field (sent top-level) vs category-specific
  // (nested under `attributes`) when creating a listing.
  common?: boolean;
}

// A titled group of fields.
export interface ListingSection {
  // Stable section key.
  key: string;
  // Bilingual section title.
  title: LocalizedText;
  // Fields in the section.
  fields: ListingField[];
}

// A complete listing form for a category.
export interface ListingForm {
  // Owning category id.
  categoryId: number;
  // Form id.
  formId: number;
  // Listing type, e.g. "SELL".
  listingType: string;
  // Bilingual form title.
  title: LocalizedText;
  // Schema version.
  version: number;
  // Ordered sections.
  sections: ListingSection[];
}

// Returns the text for the active language.
export function localize(
  text: LocalizedText | null | undefined,
  language: PreferredLanguage,
): string {
  if (!text) {
    return '';
  }
  return language === 'HI' ? text.hi : text.en;
}
