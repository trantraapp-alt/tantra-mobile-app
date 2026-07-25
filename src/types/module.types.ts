// Marketplace module and category domain types (from the masters API).
import type { IsoDateString } from './common.types';

// A top-level marketplace module (e.g. Agriculture, Local Services).
export interface MarketplaceModule {
  // Numeric module identifier.
  id: number;
  // Stable machine key, e.g. "MOD_AGRI".
  moduleKey: string;
  // Module name in English.
  moduleNameEn: string;
  // Module name in Hindi.
  moduleNameHi: string;
  // Optional remote icon/image URL; when present it replaces the fallback icon.
  iconUrl?: string;
  // Whether the module is active.
  isActive: boolean;
  // Creation timestamp.
  createdAt: IsoDateString;
}

// What a category opens when tapped: a listing form or the business-profile
// flow (the latter is a separate workstream — this app hands off to it).
export type CategoryActionType = 'LISTING' | 'BUSINESS_PROFILE';

// A category within a marketplace module. Categories form a tree via `parentId`:
// a category with no `parentId` is top-level under its module; its children are
// subcategories. The leaf category's id feeds the form / listing APIs.
export interface ModuleCategory {
  // Numeric category identifier.
  id: number;
  // Owning module identifier.
  moduleId: number;
  // Parent category id, or null/absent for a top-level category.
  parentId?: number | null;
  // What tapping the category opens (defaults to LISTING when absent).
  actionType?: CategoryActionType | string;
  // Handoff key for BUSINESS_PROFILE categories (e.g. "vet_clinic").
  linkKey?: string | null;
  // Stable machine key, e.g. "CAT_CROP".
  categoryKey: string;
  // Category name in English.
  categoryNameEn: string;
  // Category name in Hindi.
  categoryNameHi: string;
  // Remote icon image URL.
  iconUrl: string;
  // Sort order within the module.
  displayOrder: number;
  // Whether the category is active.
  isActive: boolean;
  // Creation timestamp.
  createdAt: IsoDateString;
}
