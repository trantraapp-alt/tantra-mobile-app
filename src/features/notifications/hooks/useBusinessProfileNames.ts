// Resolves the business name behind each BUSINESS_PROFILE notification's
// refId, so a row can show which profile it's about — the notification's own
// title/body don't carry that, only an opaque refId. One fetch per profile,
// cached for the life of the screen and never repeated once resolved.
import { useEffect, useRef, useState } from 'react';

// Imports the API client directly rather than the feature's barrel — the
// barrel also re-exports every business-profile screen, which would pull
// admin-only UI (and its dependencies, like the price-range slider) into
// every bundle that merely wants to resolve a profile name.
import { businessProfileApi } from '@/features/business-profile/api/businessProfileApi';
import { logger } from '@/lib';

import type { AppNotification } from '../types';

export function useBusinessProfileNames(
  notifications: AppNotification[],
): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  const requested = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pending = Array.from(
      new Set(
        notifications
          .filter((item) => item.refType === 'BUSINESS_PROFILE' && item.refId != null)
          .map((item) => String(item.refId)),
      ),
    ).filter((id) => !requested.current.has(id));

    if (pending.length === 0) {
      return;
    }
    pending.forEach((id) => requested.current.add(id));

    pending.forEach((id) => {
      businessProfileApi
        .getProfile(id)
        .then((profile) => {
          setNames((prev) => ({ ...prev, [id]: profile.businessName }));
        })
        .catch((error) => {
          logger.warn('[Notifications] Failed to load business profile name', {
            id,
            error,
          });
        });
    });
  }, [notifications]);

  return names;
}
