// Formatting helpers for currency, dates and numbers using the app locale.
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { appConstants } from '@/constants';
import type { IsoDateString, Money } from '@/types';

dayjs.extend(relativeTime);

// Formats a monetary amount into a localized currency string.
export function formatCurrency(
  amount: Money,
  currency: string = appConstants.currencyCode,
): string {
  return new Intl.NumberFormat(appConstants.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formats an ISO date into a human-readable calendar date.
export function formatDate(
  value: IsoDateString,
  template = 'DD MMM YYYY',
): string {
  return dayjs(value).format(template);
}

// Formats an ISO date into a relative time such as "3 hours ago".
export function formatRelativeTime(value: IsoDateString): string {
  return dayjs(value).fromNow();
}

// Formats a large number into a compact form such as "1.2k".
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(appConstants.locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

// Truncates text to a maximum length, appending an ellipsis when clipped.
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
