// Display helpers for notifications.
import {
  BadgeCheck,
  Ban,
  Bell,
  type LucideIcon,
  Package,
  ShoppingBag,
  XCircle,
} from 'lucide-react-native';

import { localize,type LocalizedText } from '@/features/sell';
import type { ColorScheme } from '@/theme';
import type { PreferredLanguage } from '@/types';

// Resolves a bilingual-or-plain text to the active language.
export function localizedText(
  text: LocalizedText | string | null | undefined,
  language: PreferredLanguage,
): string {
  if (!text) {
    return '';
  }
  return typeof text === 'string' ? text : localize(text, language);
}

// Builds the row's display title: "{title} - {refId}" when the notification
// carries a refId (so e.g. two "Business profile verified" rows for
// different profiles read as distinct entries), otherwise just the title.
export function notificationDisplayTitle(
  title: string,
  refId: string | number | null | undefined,
): string {
  return refId != null && String(refId).trim() !== '' ? `${title} - ${refId}` : title;
}

// Appends an alpha channel to a 6-digit hex theme color — React Native
// understands #RRGGBBAA natively. Duplicated (not imported) from the
// business-profile feature's own copy: a small pure color-math helper isn't
// worth a cross-feature import.
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const channel = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${channel}`;
}

// Semantic tone keys this feature uses for a notification's leading icon.
type NotificationTone = Extract<keyof ColorScheme, 'success' | 'danger' | 'warning' | 'primary'>;

// Icon + tone for a notification's leading avatar, resolved from its machine
// `type` (e.g. "BUSINESS_PROFILE_APPROVED"). Matched by suffix rather than an
// exhaustive type list, so a new "<DOMAIN>_APPROVED"/"_REJECTED"/"_BLOCKED"
// type from another domain (orders, listings, ...) picks up the right
// icon/tone automatically instead of falling back to the generic bell.
export function getNotificationVisual(type: string | undefined): {
  icon: LucideIcon;
  tone: NotificationTone;
} {
  const value = (type ?? '').toUpperCase();
  if (value.endsWith('_APPROVED') || value.endsWith('_VERIFIED')) {
    return { icon: BadgeCheck, tone: 'success' };
  }
  if (value.endsWith('_REJECTED')) {
    return { icon: XCircle, tone: 'danger' };
  }
  if (value.endsWith('_BLOCKED')) {
    return { icon: Ban, tone: 'danger' };
  }
  if (value.includes('ORDER')) {
    return { icon: ShoppingBag, tone: 'primary' };
  }
  if (value.includes('LISTING')) {
    return { icon: Package, tone: 'primary' };
  }
  return { icon: Bell, tone: 'primary' };
}
