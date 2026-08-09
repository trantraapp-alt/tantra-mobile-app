// Public API barrel for the deals feature.
export { getDeals } from './api';
export { useDeals, type UseDealsResult } from './hooks';
export { DealListingsScreen } from './screens';
export type { DealCard as DealCardData, DealCtaType } from './types';
