// Language-aware label helpers for marketplace modules and categories.
import type {
  MarketplaceModule,
  ModuleCategory,
  PreferredLanguage,
} from '@/types';

// Returns a module's name in the requested language.
export function getModuleName(
  module: MarketplaceModule,
  language: PreferredLanguage,
): string {
  return language === 'HI' ? module.moduleNameHi : module.moduleNameEn;
}

// Returns a category's name in the requested language.
export function getCategoryName(
  category: ModuleCategory,
  language: PreferredLanguage,
): string {
  return language === 'HI' ? category.categoryNameHi : category.categoryNameEn;
}
