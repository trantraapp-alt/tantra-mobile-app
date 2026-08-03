// Types for the backend-driven filter form: the API returns an ordered list of
// filter groups, each rendered by its `inputType`. The backend decides what
// filters exist and how to render them — no hardcoded filter lists on the client.
import type { LocalizedText } from '@/features/sell';

// Which widget to render for a filter group.
export type FilterInputType =
  | 'RADIO'
  | 'PRICE_RANGE'
  | 'LOCATION'
  | 'DROPDOWN'
  | 'GEO_RADIUS';

// A selectable option within a RADIO / DROPDOWN group.
export interface FilterOption {
  // Value submitted as the query param / stored in filter state.
  value: string;
  // Bilingual display label.
  label: LocalizedText;
  // Optional backend id.
  id?: number | string | null;
}

// One filter group returned by the filter-form endpoint.
export interface FilterGroup {
  // Unique key — React key, and state key for RADIO / DROPDOWN.
  groupKey: string;
  // Bilingual section heading.
  label: LocalizedText;
  // Which widget to render.
  inputType: FilterInputType;
  // Backend sort order (groups arrive pre-sorted).
  displayOrder: number;
  // Single URL/state param name (RADIO / DROPDOWN).
  queryParam?: string | null;
  // Multiple param names — PRICE_RANGE: [min, max]; LOCATION: [district, state].
  queryParams?: string[] | null;
  // Category-specific attribute key (DROPDOWN) — not yet passed to browse.
  attributeKey?: string | null;
  // Options for RADIO / DROPDOWN groups.
  options?: FilterOption[] | null;
  // Numeric bounds for a slider group (PRICE_RANGE): the lowest/highest values
  // and the drag increment.
  min?: number | null;
  max?: number | null;
  step?: number | null;
}

// The filter-form response body (unwrapped from the standard envelope).
export interface FilterForm {
  // The category this form is scoped to, or null for the global form.
  categoryId: number | null;
  // Filter groups to render, pre-sorted by displayOrder.
  groups: FilterGroup[];
}

// Flat draft / applied filter state keyed by queryParam (or groupKey for DROPDOWN).
export type FilterFormState = Record<string, string>;
