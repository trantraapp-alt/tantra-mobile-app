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

// A category within a marketplace module.
export interface ModuleCategory {
  // Numeric category identifier.
  id: number;
  // Owning module identifier.
  moduleId: number;
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
