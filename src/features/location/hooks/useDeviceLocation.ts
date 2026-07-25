// Hook wrapping the device-location service with a loading flag and an
// unmount guard, so a screen can request the current place from a button press.
import { useCallback, useEffect, useRef, useState } from 'react';

import { requestCurrentPlace } from '../services/deviceLocation';
import type { LocationOutcome } from '../types';

// Exposes a `request()` that resolves the current place, plus its loading flag.
export function useDeviceLocation() {
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const request = useCallback(async (): Promise<LocationOutcome> => {
    setLoading(true);
    try {
      return await requestCurrentPlace();
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  return { request, loading };
}
