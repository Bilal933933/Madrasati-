import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import {
  adminUsersApi,
  type UserRolePayload,
  type UserStatusPayload,
} from "../services/usersApi";
import type { AdminUserListFilters } from "../types/user.types";

export function useAdminUsers(filters?: AdminUserListFilters) {
  return useQuery({
    queryKey: ["admin-users", filters ?? {}],
    queryFn: () => adminUsersApi.list(filters),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["admin-users"]];

export function useUpdateUserRole() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserRolePayload }) =>
      adminUsersApi.updateRole(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث دور المستخدم بنجاح.",
  });
}

export function useUpdateUserStatus() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserStatusPayload }) =>
      adminUsersApi.updateStatus(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث حالة الحساب.",
  });
}