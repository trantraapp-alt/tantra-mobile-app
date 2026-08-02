// The user's selected place as a district text filter, falling back through
// city → state (device geocoding and PIN lookups often leave `district` empty).
// Used as the default location scope for browse / search so results reflect the
// place chosen in the header, for both GPS and PIN locations (PIN sets no
// coordinates, so the text filter is the only location signal available there).
import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

// Returns the user's district (or city / state), or undefined when unset.
export function useUserDistrict(): string | undefined {
  const location = useAppSelector(selectSelectedLocation);
  const value =
    location?.district?.trim() ||
    location?.city?.trim() ||
    location?.state?.trim() ||
    '';
  return value !== '' ? value : undefined;
}
