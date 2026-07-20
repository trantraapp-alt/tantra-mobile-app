// Surfaces an operation error as a top toast whenever it changes to a new
// value, so screens don't need to render inline error banners.
import { useEffect } from 'react';

import { useToast } from '@/providers';

// Minimal shape needed to display an error message.
interface ToastableError {
  // Human-readable error message.
  message: string;
}

// Shows an error toast each time `error` becomes a new non-null value.
export function useToastError(error: ToastableError | null | undefined): void {
  const { showError } = useToast();

  useEffect(() => {
    if (error) {
      showError(error.message);
    }
  }, [error, showError]);
}
