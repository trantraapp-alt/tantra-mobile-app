// Exposes the current authentication state from the Redux store.
import { useAppSelector } from '@/store/hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsBootstrapped,
} from '@/store/selectors';

// Returns the current user and session flags.
export function useAuth() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBootstrapped = useAppSelector(selectIsBootstrapped);

  return { user, isAuthenticated, isBootstrapped };
}
