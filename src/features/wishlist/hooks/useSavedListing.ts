// Wishlist state + toggle for a single listing, backing every card's heart.
// Reads membership from the `saved` slice, toggles optimistically and calls the
// backend (reverting on failure). The full id set is fetched once per session
// (guarded across all card instances) when the user is authenticated.
import { useCallback, useEffect } from 'react';

import { useTranslation } from '@/hooks';
import { useToast } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';
import { markSaved, setSavedIds, unmarkSaved } from '@/store/slices';

import { wishlistApi } from '../api';

// Guards the one-time wishlist fetch against the many cards mounting at once.
let syncInFlight = false;

// Reports and toggles whether a listing is wishlisted.
export function useSavedListing(listingId: string) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { showInfo } = useToast();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loaded = useAppSelector((state) => state.saved.loaded);
  const saved = useAppSelector((state) =>
    Boolean(listingId && state.saved.map[listingId]),
  );

  // Fetch the wishlist ids once when signed in (idempotent across cards).
  useEffect(() => {
    if (!isAuthenticated || loaded || syncInFlight) {
      return;
    }
    syncInFlight = true;
    wishlistApi
      .getAll()
      .then((items) =>
        dispatch(setSavedIds(items.map((item) => item.listingId))),
      )
      .catch(() => undefined)
      .finally(() => {
        syncInFlight = false;
      });
  }, [isAuthenticated, loaded, dispatch]);

  // Toggles the listing in the wishlist (optimistic; reverts on failure).
  const toggle = useCallback(() => {
    if (!listingId) {
      return;
    }
    if (!isAuthenticated) {
      showInfo(t('wishlist.loginRequired'));
      return;
    }
    if (saved) {
      dispatch(unmarkSaved(listingId));
      wishlistApi
        .remove(listingId)
        .catch(() => dispatch(markSaved(listingId)));
    } else {
      dispatch(markSaved(listingId));
      wishlistApi.add(listingId).catch(() => dispatch(unmarkSaved(listingId)));
    }
  }, [listingId, isAuthenticated, saved, dispatch, showInfo, t]);

  return { saved, toggle };
}
