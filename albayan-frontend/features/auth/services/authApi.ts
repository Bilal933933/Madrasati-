import { apiClient } from "@/lib/apiClient";
import type {
  ApiMessageResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "../types/auth.types";

interface AuthResponse extends ApiMessageResponse {
  user: AuthUser;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient<AuthResponse>("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  login: (payload: LoginPayload) =>
    apiClient<AuthResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  logout: () =>
    apiClient<ApiMessageResponse>("/api/logout", {
      method: "POST",
      withCsrf: true,
    }),

  getCurrentUser: async () => {
    const res = await apiClient<{ data: AuthUser }>("/api/user", {
      method: "GET",
    });
    return res.data;
  },

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient<ApiMessageResponse>("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient<ApiMessageResponse>("/api/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      withCsrf: true,
    }),
};

/**
 * رابط بدء تسجيل الدخول بجوجل — ليس طلب Fetch، بل Redirect كامل للمتصفح
 */
export function getGoogleLoginUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${apiUrl}/auth/google/redirect`;
}
