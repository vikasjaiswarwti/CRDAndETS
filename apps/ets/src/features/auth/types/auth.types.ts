// src/features/auth/types/auth.types.ts
import type { User } from "../../../shared/types/user.types";
import type { AppInfo } from "../../../shared/auth-core";

export interface LoginCredentials {
  userName: string; // API uses userName, not email
  password: string;
}

export type { AppInfo };

export interface LoginResponse {
  user: User;
  accessToken: string;
  roles: string[];
  accessAppId?: string; // e.g. "1,2" — prefer `apps`
  apps?: AppInfo[];
  // refreshToken comes via HttpOnly cookie — NOT in body
}

// POST /api/v1/Auth/switch-app  { appId }
// Response shape not confirmed yet — treat accessToken as optional.
export interface SwitchAppRequest {
  appId: number;
}
export interface SwitchAppResponse {
  accessToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  // No refreshToken field — it lives in an HttpOnly cookie
}

export interface RefreshTokenResponse {
  accessToken: string;
  // New refreshToken rotation (if any) also arrives via Set-Cookie
}

// ── Unused / future ───────────────────────────────────────────────────────────

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// ── Forgot Password ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

// ── Reset Password ────────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
