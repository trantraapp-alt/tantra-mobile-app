// Dispatches the registration thunk and exposes its Redux-held state.
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectRegisterOperation } from '@/store/selectors';
import { registerThunk } from '@/store/slices';
import type { RegisterPayload } from '@/types';

// Registers a new account; resolves true when registration succeeded.
export function useRegister() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectRegisterOperation);

  // Triggers the registration thunk with the provided payload.
  const register = useCallback(
    async (payload: RegisterPayload): Promise<boolean> => {
      const result = await dispatch(registerThunk(payload));
      return registerThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  return { register, isPending: status === 'loading', error };
}
