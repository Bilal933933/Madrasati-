export type UserRole = "student" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ApiMessageResponse {
  message: string;
}
