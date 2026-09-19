import { apiClient } from "@/lib/apiClient";
import type {
  AdminUserListFilters,
  AdminUserListResponse,
  AdminUserMutationResponse,
  ManagedUserRole,
} from "../types/user.types";

export interface UserRolePayload {
  role: ManagedUserRole;
}

export interface UserStatusPayload {
  is_active: boolean;
}

export const adminUsersApi = {
  list: (filters?: AdminUserListFilters) => {
    const params = new URLSearchParams({
      ...(filters?.search ? { search: filters.search } : {}),
      ...(filters?.role ? { role: filters.role } : {}),
      ...(filters?.page ? { page: String(filters.page) } : {}),
      ...(filters?.perPage ? { per_page: String(filters.perPage) } : {}),
    }).toString();

    return apiClient<AdminUserListResponse>(
      `/api/admin/users${params ? `?${params}` : ""}`,
      { method: "GET" }
    );
  },

  updateRole: (id: number, payload: UserRolePayload) =>
    apiClient<AdminUserMutationResponse>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  updateStatus: (id: number, payload: UserStatusPayload) =>
    apiClient<AdminUserMutationResponse>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),
};