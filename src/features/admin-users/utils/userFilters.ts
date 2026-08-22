// Local filter option sets for the admin Users screen — a clean "All" state
// on top of the API's plain isBlocked/hasSub booleans.

// Account-status filter — maps to the `isBlocked` query param.
export type StatusFilter = 'ALL' | 'ACTIVE' | 'BLOCKED';
export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
];

// Subscription filter — maps to the `hasSub` query param.
export type SubFilter = 'ALL' | 'HAS' | 'NONE';
export const SUB_FILTERS: { value: SubFilter; label: string }[] = [
  { value: 'ALL', label: 'Any plan' },
  { value: 'HAS', label: 'Subscribed' },
  { value: 'NONE', label: 'No subscription' },
];

export function isBlockedParam(status: StatusFilter): boolean | undefined {
  return status === 'ACTIVE' ? false : status === 'BLOCKED' ? true : undefined;
}

export function hasSubParam(sub: SubFilter): boolean | undefined {
  return sub === 'HAS' ? true : sub === 'NONE' ? false : undefined;
}

// Count of non-"All" filters currently active, for the filter icon's badge.
export function activeFilterCount(status: StatusFilter, sub: SubFilter): number {
  return (status !== 'ALL' ? 1 : 0) + (sub !== 'ALL' ? 1 : 0);
}
