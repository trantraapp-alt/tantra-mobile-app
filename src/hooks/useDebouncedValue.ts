// Returns a debounced copy of a value that updates after a delay.
import { useEffect, useState } from 'react';

// Debounces a rapidly-changing value, useful for search inputs.
export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debounced, setDebounced] = useState<TValue>(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
