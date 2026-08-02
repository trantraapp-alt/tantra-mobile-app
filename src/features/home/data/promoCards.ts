// The home promo banners. Colours come from the theme (no hardcoded hex), so the
// banners are built at render time from `theme.colors`. Each banner carries a
// navigation action resolved by the home screen (which owns the router + feed).
import type { AppTheme } from '@/theme';

import type { PromoCard } from '../types';

// What tapping a promo banner does. Kept as data (resolved to navigation by the
// home screen).
export type PromoAction =
  | { type: 'sell' }
  | { type: 'nearby' }
  | { type: 'search' }
  | { type: 'browse'; key: string; name: string; listingType?: string }
  | { type: 'external'; url: string };

// A promo card plus its navigation action.
export interface HomePromoCard extends PromoCard {
  // Where this banner takes the user.
  action: PromoAction;
}

// Builds the home promo banners using theme colours (light/dark aware).
export function buildPromoBanners(colors: AppTheme['colors']): HomePromoCard[] {
  return [
    {
      cardId: 'promo-crop',
      title: {
        en: 'Buy your crops directly from sellers',
        hi: 'सीधे विक्रेता से फसल खरीदें',
      },
      subtitle: {
        en: 'Fresh produce from farmers near you',
        hi: 'आपके पास के किसानों से ताज़ा उपज',
      },
      ctaLabel: { en: 'Browse crops', hi: 'फसल देखें' },
      bgColor: colors.success,
      bgColorEnd: colors.success,
      textColor: colors.onPrimary,
      displayOrder: 1,
      action: { type: 'browse', key: 'crop', name: 'Crops' },
    },
    {
      cardId: 'promo-seed',
      title: {
        en: 'Better seeds, better harvest',
        hi: 'बेहतर बीज, बेहतर फ़सल',
      },
      subtitle: {
        en: 'Quality seeds for a stronger yield',
        hi: 'बेहतर पैदावार के लिए बेहतरीन बीज',
      },
      ctaLabel: { en: 'Shop seeds', hi: 'बीज खरीदें' },
      bgColor: colors.primary,
      bgColorEnd: colors.primary,
      textColor: colors.onPrimary,
      displayOrder: 2,
      action: { type: 'browse', key: 'seed', name: 'Seeds' },
    },
    {
      cardId: 'promo-equipment',
      title: { en: 'Tantra Equipment', hi: 'तंत्र उपकरण' },
      subtitle: {
        en: 'Rent tractors, tillers and tools on demand',
        hi: 'ट्रैक्टर, टिलर और औज़ार किराए पर',
      },
      ctaLabel: { en: 'View equipment', hi: 'उपकरण देखें' },
      bgColor: colors.secondary,
      bgColorEnd: colors.secondary,
      textColor: colors.onPrimary,
      displayOrder: 3,
      action: {
        type: 'browse',
        key: 'equipment',
        name: 'Equipment',
        listingType: 'RENT',
      },
    },
  ];
}
