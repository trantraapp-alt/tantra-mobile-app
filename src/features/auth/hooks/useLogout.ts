// Dispatches the logout thunk and clears client-side state.
import { useCallback, useState } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { clearCart, logoutThunk } from '@/store/slices';

// Logs the user out, clearing the session token and the local cart.
export function useLogout() {
  const dispatch = useAppDispatch();
  const [isPending, setIsPending] = useState(false);

  // Triggers the logout flow.
  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await dispatch(logoutThunk());
      dispatch(clearCart());
    } finally {
      setIsPending(false);
    }
  }, [dispatch]);

  return { logout, isPending };
}
