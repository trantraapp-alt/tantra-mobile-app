// Heuristics about a category's place in the tree, used to pick the right layout
// (and skeleton) before its children have been fetched.
import type { ModuleCategory } from '@/types';

// Whether a top-level category is expected to contain subcategories (a
// "marketplace" grouping) rather than open a listing form directly. Lets the UI
// choose the rail + grid vs full-screen form layout — and the matching skeleton
// — the instant the category is selected, before its children load.
export function expectsSubcategories(category: ModuleCategory): boolean {
  const key = `${category.categoryKey} ${category.categoryNameEn}`.toLowerCase();
  return /market|bazaar|bazar/.test(key);
}
