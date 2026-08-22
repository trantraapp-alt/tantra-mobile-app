// API repository for the admin User Control feature.
import { endpoints } from '@/config/api.config';
import { apiClient } from '@/lib/api/apiClient';

import type {
  AdminUserDetail,
  AdminUsersListParams,
  AdminUsersPage,
} from '../types/adminUser.types';

export const adminUsersApi = {
  // Paginated, filterable list of app users.
  list: (params: AdminUsersListParams) =>
    apiClient.get<AdminUsersPage>(endpoints.adminUsers.list, { params }),

  // A single user's full detail.
  getDetail: (userId: string) =>
    apiClient.get<AdminUserDetail>(endpoints.adminUsers.detail(userId)),
};
