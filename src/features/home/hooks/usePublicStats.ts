// Loads the public marketplace stat tiles for the home trust bar. Re-fetches
// every time the home screen regains focus (app open or returning from another
// page) so newly-added listings and other live counts show up. Returns an empty
// array until loaded, or on failure / an empty response, so the bar hides when
// there is nothing to show.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { logger } from '@/lib';

import { getPublicStats } from '../api/statsApi';
import type { PublicStat } from '../types';

// Returns the public stat tiles (empty when unavailable).
export function usePublicStats(): PublicStat[] {
  const [stats, setStats] = useState<PublicStat[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getPublicStats()
        .then((data) => {
          if (active) {
            setStats(Array.isArray(data) ? data : []);
          }
        })
        .catch((error) => {
          logger.warn('[Stats] public stats load failed', error);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return stats;
}
