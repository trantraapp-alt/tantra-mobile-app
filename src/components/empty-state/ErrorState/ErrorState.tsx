// Error-state view with a retry affordance, built on top of EmptyState.
import { AlertTriangle } from 'lucide-react-native';
import { memo } from 'react';

import { EmptyState } from '../EmptyState';

// Props for the ErrorState component.
export interface ErrorStateProps {
  // Primary error title.
  title?: string;
  // Supporting error description.
  description?: string;
  // Called when the retry button is pressed.
  onRetry?: () => void;
  // Retry button label.
  retryLabel?: string;
}

// Renders a friendly error message with an optional retry action.
function ErrorStateComponent({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={description}
      actionLabel={onRetry ? retryLabel : undefined}
      onAction={onRetry}
    />
  );
}

// Memoized error-state view.
export const ErrorState = memo(ErrorStateComponent);
