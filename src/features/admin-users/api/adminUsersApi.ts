// API repository for the admin User Control feature.
import { endpoints } from '@/config/api.config';
import { apiClient } from '@/lib/api/apiClient';

import type {
  AdminUserActionResult,
  AdminUserDetail,
  AdminUsersListParams,
  AdminUsersPage,
  BlockReasonCode,
  SubscriptionPlan,
} from '../types/adminUser.types';

export const adminUsersApi = {
  // Paginated, filterable list of app users.
  list: (params: AdminUsersListParams) =>
    apiClient.get<AdminUsersPage>(endpoints.adminUsers.list, { params }),

  // A single user's full detail.
  getDetail: (userId: string) =>
    apiClient.get<AdminUserDetail>(endpoints.adminUsers.detail(userId)),

  // Blocks the account: its active listings go INACTIVE and its JWT is
  // rejected immediately. `notes` is optional internal context.
  block: (userId: string, reason: BlockReasonCode, notes?: string) =>
    apiClient.put<AdminUserActionResult>(endpoints.adminUsers.block(userId), {
      reason,
      notes: notes?.trim() || undefined,
    }),

  // Unblocks the account. Listings stay INACTIVE — not restored automatically.
  unblock: (userId: string) =>
    apiClient.put<AdminUserActionResult>(endpoints.adminUsers.unblock(userId)),

  // Grants a plan; replaces any currently-active subscription.
  grantSubscription: (
    userId: string,
    planId: number,
    durationDays: number,
    notes?: string,
  ) =>
    apiClient.post<AdminUserActionResult>(endpoints.adminUsers.subscription(userId), {
      planId,
      durationDays,
      notes: notes?.trim() || undefined,
    }),

  // Revokes the user's active subscription.
  revokeSubscription: (userId: string) =>
    apiClient.remove<AdminUserActionResult>(endpoints.adminUsers.subscription(userId)),

  // The plan catalog for the grant-subscription picker.
  getPlans: () => apiClient.get<SubscriptionPlan[]>(endpoints.subscriptions.plans),
};
