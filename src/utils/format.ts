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
  // `style: 'currency'` defaults INR to two fraction digits and
  // `maximumFractionDigits` alone does not override that, so whole amounts
  // rendered as "₹260.00". Pinning the minimum to 0 keeps them as "₹260" while
  // still showing paise when they exist.
  return new Intl.NumberFormat(appConstants.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
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

// Formats a number with locale digit grouping (e.g. 40000 -> "40,000").
export function formatNumber(
  value: number,
  maximumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(appConstants.locale, {
    maximumFractionDigits,
  }).format(value);
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
