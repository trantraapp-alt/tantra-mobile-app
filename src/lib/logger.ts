// Lightweight logger that centralizes diagnostics and respects the environment.
import { env } from '@/config';

// Severity levels supported by the logger.
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Emits a structured log line for the given level when appropriate.
function write(level: LogLevel, message: string, context?: unknown): void {
  // Suppress verbose logs in production to avoid leaking data and noise.
  if (env.isProduction && (level === 'debug' || level === 'info')) {
    return;
  }

  const payload =
    context === undefined ? message : `${message} ${safeStringify(context)}`;

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(`[tantra:error] ${payload}`);
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(`[tantra:${level}] ${payload}`);
}

// Safely serializes arbitrary context, guarding against circular references.
function safeStringify(value: unknown): string {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

// Application logger with level-specific helpers.
export const logger = {
  // Logs a debug-level diagnostic (development only).
  debug: (message: string, context?: unknown) => write('debug', message, context),
  // Logs an informational message (development only).
  info: (message: string, context?: unknown) => write('info', message, context),
  // Logs a warning that should be investigated.
  warn: (message: string, context?: unknown) => write('warn', message, context),
  // Logs an error condition.
  error: (message: string, context?: unknown) => write('error', message, context),
} as const;
