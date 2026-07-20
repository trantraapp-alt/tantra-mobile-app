// Dispatches the sign-in thunk and exposes its Redux-held state.
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLoginOperation } from '@/store/selectors';
import { loginThunk } from '@/store/slices';
import type { LoginCredentials } from '@/types';

// Authenticates the user; resolves true when the session was established.
export function useLogin() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectLoginOperation);

  // Triggers the login thunk with the provided credentials.
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      const result = await dispatch(loginThunk(credentials));
      return loginThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  return { login, isPending: status === 'loading', error };
}
