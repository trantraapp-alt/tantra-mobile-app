// Service layer for marketplace modules and their categories.
import type { MarketplaceModule, ModuleCategory } from '@/types';

import { modulesApi } from '../api';

// Returns active modules sorted by id for a stable display order.
async function getModules(): Promise<MarketplaceModule[]> {
  const modules = await modulesApi.getModules();
  return [...modules].sort((a, b) => a.id - b.id);
}

// Returns active categories for a module sorted by display order.
async function getModuleCategories(moduleId: number): Promise<ModuleCategory[]> {
  const categories = await modulesApi.getModuleCategories(moduleId);
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

// Marketplace modules service consumed via thunk injection.
export const modulesService = { getModules, getModuleCategories } as const;
