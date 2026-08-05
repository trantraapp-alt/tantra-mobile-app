// Loads the public marketplace stat tiles once for the home trust bar. Returns
// an empty array until loaded, or on failure / an empty response, so the trust
// bar simply hides when there is nothing to show.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getPublicStats } from '../api/statsApi';
import type { PublicStat } from '../types';

// Returns the public stat tiles (empty when unavailable).
export function usePublicStats(): PublicStat[] {
  const [stats, setStats] = useState<PublicStat[]>([]);

  useEffect(() => {
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
  }, []);

  return stats;
}
