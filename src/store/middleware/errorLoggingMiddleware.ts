// Redux middleware that logs rejected async thunk actions for observability.
import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

import { logger } from '@/lib';

// Middleware capturing rejected actions and forwarding them to the logger.
export const errorLoggingMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    logger.warn('Redux action rejected', {
      type: action.type,
      payload: action.payload,
    });
  }
  return next(action);
};
