// Dependencies injected into async thunks via Redux Toolkit's `extraArgument`.
//
// Slices read services from `thunkAPI.extra` instead of importing them, which
// keeps frequently hot-reloaded slices free of cross-feature imports and makes
// services trivially swappable in tests.
import { authService } from '@/features/auth/services';
import { modulesService } from '@/features/sell/services';
import type { ApiError } from '@/types';

// Service container passed to every thunk as its extra argument.
export interface ThunkExtra {
  // Authentication service (sign-in, sign-up, profile, password reset).
  authService: typeof authService;
  // Marketplace modules/categories service.
  modulesService: typeof modulesService;
}

// Concrete extra-argument instance wired into the store.
export const thunkExtra: ThunkExtra = {
  authService,
  modulesService,
};

// Shared thunk configuration: injected services + normalized reject value.
export interface AppThunkConfig {
  // Injected service container.
  extra: ThunkExtra;
  // Rejected thunks carry a normalized ApiError.
  rejectValue: ApiError;
}
