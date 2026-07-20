// Redux slice owning marketplace modules and per-module category state.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/lib';
import type {
  ApiError,
  AsyncStatus,
  MarketplaceModule,
  ModuleCategory,
} from '@/types';

import type { AppThunkConfig } from '../thunkExtra';

// Category collection state for a single module.
interface CategoriesState {
  // Current fetch status.
  status: AsyncStatus;
  // Loaded categories.
  items: ModuleCategory[];
  // Last error, if any.
  error: ApiError | null;
}

// Shape of the modules slice state.
export interface ModulesState {
  // Fetch status of the modules list.
  status: AsyncStatus;
  // Loaded marketplace modules.
  items: MarketplaceModule[];
  // Last modules-list error, if any.
  error: ApiError | null;
  // Category collections keyed by module id.
  categoriesByModule: Record<number, CategoriesState>;
}

// Initial modules state.
const initialState: ModulesState = {
  status: 'idle',
  items: [],
  error: null,
  categoriesByModule: {},
};

// Fetches the list of active marketplace modules.
export const fetchModulesThunk = createAsyncThunk<
  MarketplaceModule[],
  void,
  AppThunkConfig
>('modules/fetch', async (_, { extra, rejectWithValue }) => {
  try {
    return await extra.modulesService.getModules();
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Fetches active categories for a given module.
export const fetchModuleCategoriesThunk = createAsyncThunk<
  { moduleId: number; categories: ModuleCategory[] },
  number,
  AppThunkConfig
>('modules/fetchCategories', async (moduleId, { extra, rejectWithValue }) => {
  try {
    const categories = await extra.modulesService.getModuleCategories(moduleId);
    return { moduleId, categories };
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Ensures a category state entry exists for the given module.
function ensureCategoryState(
  state: ModulesState,
  moduleId: number,
): CategoriesState {
  const existing = state.categoriesByModule[moduleId];
  if (existing) {
    return existing;
  }
  const created: CategoriesState = { status: 'idle', items: [], error: null };
  state.categoriesByModule[moduleId] = created;
  return created;
}

// Modules slice managing modules and their categories.
const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModulesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchModulesThunk.fulfilled, (state, action) => {
        state.status = 'success';
        state.items = action.payload;
      })
      .addCase(fetchModulesThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? null;
      })
      .addCase(fetchModuleCategoriesThunk.pending, (state, action) => {
        const entry = ensureCategoryState(state, action.meta.arg);
        entry.status = 'loading';
        entry.error = null;
      })
      .addCase(fetchModuleCategoriesThunk.fulfilled, (state, action) => {
        const entry = ensureCategoryState(state, action.payload.moduleId);
        entry.status = 'success';
        entry.items = action.payload.categories;
      })
      .addCase(fetchModuleCategoriesThunk.rejected, (state, action) => {
        const entry = ensureCategoryState(state, action.meta.arg);
        entry.status = 'error';
        entry.error = action.payload ?? null;
      });
  },
});

export const modulesReducer = modulesSlice.reducer;
