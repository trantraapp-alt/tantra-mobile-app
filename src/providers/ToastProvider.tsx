// Global toast host: holds the active toast and exposes an imperative API to
// show error/success/info/warning messages from anywhere in the app.
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Toast, type ToastData, type ToastVariant } from '@/components/feedback';

// Default time a toast stays on screen (ms).
const DEFAULT_DURATION = 3000;

// Options accepted when showing a toast.
export interface ToastOptions {
  // Tone controlling the icon and accent color (defaults to 'error').
  variant?: ToastVariant;
  // How long the toast stays before auto-dismissing (defaults to 3000ms).
  duration?: number;
}

// Imperative toast API exposed via context.
interface ToastContextValue {
  // Shows a toast with explicit options.
  show: (message: string, options?: ToastOptions) => void;
  // Shows an error toast.
  showError: (message: string, duration?: number) => void;
  // Shows a success toast.
  showSuccess: (message: string, duration?: number) => void;
  // Shows an informational toast.
  showInfo: (message: string, duration?: number) => void;
  // Shows a warning toast.
  showWarning: (message: string, duration?: number) => void;
  // Dismisses the current toast immediately.
  hide: () => void;
}

// Toast context; undefined until provided so misuse fails loudly.
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Provides the toast host and imperative API to the component tree.
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const idRef = useRef(0);

  // Clears the active toast.
  const hide = useCallback(() => setToast(null), []);

  // Queues a toast, replacing any currently visible one.
  const show = useCallback((message: string, options?: ToastOptions) => {
    idRef.current += 1;
    setToast({
      id: idRef.current,
      message,
      variant: options?.variant ?? 'error',
      duration: options?.duration ?? DEFAULT_DURATION,
    });
  }, []);

  const showError = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'error', duration }),
    [show],
  );
  const showSuccess = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'success', duration }),
    [show],
  );
  const showInfo = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'info', duration }),
    [show],
  );
  const showWarning = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'warning', duration }),
    [show],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ show, showError, showSuccess, showInfo, showWarning, hide }),
    [show, showError, showSuccess, showInfo, showWarning, hide],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <Toast key={toast.id} toast={toast} onDismiss={hide} /> : null}
    </ToastContext.Provider>
  );
}

// Returns the toast API, throwing if used outside the provider.
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
