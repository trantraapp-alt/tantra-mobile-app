// Loads the public marketplace stats once for the home trust bar. Returns null
// until loaded or on failure, so the trust bar can fall back to curated values.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getPublicStats } from '../api/statsApi';
import type { PublicStats } from '../types';

// Returns the public stats, or null when unavailable.
export function usePublicStats(): PublicStats | null {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let active = true;
    getPublicStats()
      .then((data) => {
        if (active) {
          setStats(data);
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
