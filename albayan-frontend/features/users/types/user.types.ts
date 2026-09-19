import type { PaginationMeta } from "@/types/pagination";

export type ManagedUserRole = "student" | "teacher" | "admin";

export const USER_ROLE_LABELS: Record<ManagedUserRole, string> = {
  student: "طالب",
  teacher: "معلم",
  admin: "مشرف",
};

export const USER_ROLES = Object.keys(USER_ROLE_LABELS) as ManagedUserRole[];

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: ManagedUserRole;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string | null;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface AdminUserMutationResponse {
  data: AdminUser;
  message: string;
}

export interface AdminUserListFilters {
  search?: string;
  role?: ManagedUserRole;
  page?: number;
  perPage?: number;
}