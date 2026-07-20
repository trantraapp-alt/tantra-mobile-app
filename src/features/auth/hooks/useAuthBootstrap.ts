// Restores a persisted session on app start and wires session-expiry handling.
import { useEffect } from 'react';

import { setSessionExpiredHandler } from '@/lib';
import { useAppDispatch } from '@/store/hooks';
import { bootstrapAuthThunk, clearAuth, clearCart } from '@/store/slices';

// Bootstraps authentication state once on mount.
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Register the global handler invoked when the server rejects the token.
    setSessionExpiredHandler(() => {
      dispatch(clearAuth());
      dispatch(clearCart());
    });

    // Restore the token and re-validate it against the profile endpoint.
    void dispatch(bootstrapAuthThunk());
  }, [dispatch]);
}
