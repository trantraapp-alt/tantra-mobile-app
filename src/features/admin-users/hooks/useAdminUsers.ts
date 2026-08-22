// Paginated, filterable list of app users for the admin User Control screen.
// Mirrors the useAdminProfiles/useMyProfiles pattern: a requestId guards
// against a stale response landing after a newer request (e.g. the admin
// changes a filter mid-fetch), and changing any filter/search argument gives
// `fetchPage` a new identity, which the mount effect below picks up to
// restart the list from page 0.
import { useCallback, useEffect, useRef, useState } from 'react';

import { appConstants } from '@/constants';
import { logger } from '@/lib';

import { adminUsersApi } from '../api/adminUsersApi';
import type { AdminUserSummary } from '../types/adminUser.types';

type Phase = 'loading' | 'loadingMore' | 'refreshing' | 'idle' | 'error';

export interface UseAdminUsersArgs {
  // Free-text search over name / mobile number.
  search?: string;
  // Filter by block status. Omit for both.
  isBlocked?: boolean;
  // Filter by whether the user has an active subscription. Omit for both.
  hasSub?: boolean;
  // Sort spec, e.g. "createdAt,desc". Defaults to the backend's own order.
  sort?: string;
}

export function useAdminUsers({
  search,
  isBlocked,
  hasSub,
  sort,
}: UseAdminUsersArgs = {}) {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      const id = requestId.current + 1;
      requestId.current = id;
      setPhase(
        mode === 'append'
          ? 'loadingMore'
          : mode === 'refresh'
            ? 'refreshing'
            : 'loading',
      );
      try {
        const res = await adminUsersApi.list({
          search: search?.trim() || undefined,
          isBlocked,
          hasSub,
          sort,
          page: pageToLoad,
          size: appConstants.defaultPageSize,
        });
        console.log('Fetched users page', res.number, 'of', res.totalPages, 'with', res.content.length, 'items');
        console.log("response:", res);
        if (id !== requestId.current) {
          return;
        }
        setUsers((prev) =>
          mode === 'append' ? [...prev, ...res.content] : res.content,
        );
        setPage(res.number);
        setLast(res.number + 1 >= res.totalPages);
        setTotalElements(res.totalElements);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[AdminUsers] Failed to load users', error);
        setPhase('error');
      }
    },
    [search, isBlocked, hasSub, sort],
  );

  // Restarts from page 0 whenever the search/filter/sort arguments change —
  // `fetchPage` gets a new identity, so this effect reruns.
  useEffect(() => {
    void fetchPage(0, 'replace');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      last ||
      phase === 'loading' ||
      phase === 'loadingMore' ||
      phase === 'refreshing'
    ) {
      return;
    }
    void fetchPage(page + 1, 'append');
  }, [last, phase, page, fetchPage]);

  const refresh = useCallback(() => {
    void fetchPage(0, 'refresh');
  }, [fetchPage]);

  return {
    users,
    totalElements,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    isEmpty: phase === 'idle' && users.length === 0,
    hasMore: !last,
    loadMore,
    refresh,
  };
}
