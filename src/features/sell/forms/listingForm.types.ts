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
  // Option id, used as the cascade key a child option's `parent` points to.
  id?: number | string | null;
  // Stored value submitted for this option.
  value: string;
  // Bilingual display label.
  label: LocalizedText;
  // Parent option's id for cascading sets (`null` for a top-level option).
  parent?: number | string | null;
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

// Comparison operators supported by a field's conditional visibility.
export type VisibleWhenOperator = 'equals' | 'notEquals' | 'in' | 'notIn';

// Condition controlling whether a field is shown.
export interface ListingFieldVisibleWhen {
  // The field whose value is compared.
  field: string;
  // Comparison operator (defaults to `equals` when omitted).
  operator?: VisibleWhenOperator;
  // Value(s) the field is compared against. `in`/`notIn` take an array.
  value: string | boolean | Array<string | boolean>;
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
  | 'MULTISELECT'
  | 'CHECKBOX_GROUP'
  | 'BOOLEAN'
  | 'DATE'
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
  // Field key of the parent dropdown this field cascades from. Only options
  // whose `parent` equals the selected parent option's id are shown.
  parentField?: string | null;
  // Validation rules.
  validation?: ListingFieldValidation | null;
  // Conditional visibility.
  visibleWhen?: ListingFieldVisibleWhen | null;
  // Computed-value descriptor.
  computed?: ListingFieldComputed | null;
  // Whether this is a common field (sent top-level) vs category-specific
  // (nested under `attributes`) when creating a listing.
  common?: boolean;
  // Whether the field can be edited directly on the listing card (quick PATCH),
  // without opening the full edit form (e.g. price, quantity, description).
  inlineEditable?: boolean;
  // Whether the field may be changed when updating an existing listing. When
  // false, the field is locked on the edit form (core fields such as the
  // category type/name); to change it the user must delete and recreate.
  editableOnUpdate?: boolean;
  // Whether the field is display-only and never user-editable (e.g. discount %).
  readOnly?: boolean;
  // Maximum input length (mirrors validation.maxLength when the backend sends it
  // as a top-level flag).
  fieldLength?: number;
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
