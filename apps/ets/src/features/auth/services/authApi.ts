// src/features/auth/services/authApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Auth API — cookie-based refresh token flow.
// Login uses `userName` (not `email`) per the actual API contract.
// ─────────────────────────────────────────────────────────────────────────────

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { User } from "../../../shared/types/user.types";
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SwitchAppRequest,
  SwitchAppResponse,
} from "../types/auth.types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // ── POST /api/v1/Auth/login ─────────────────────────────────────────────
    // Returns: { user, accessToken, roles }
    // Side effect: server sets HttpOnly refreshToken cookie via Set-Cookie
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/api/v1/Auth/login",
        method: "POST",
        body: credentials, // { userName, password }
      }),
      invalidatesTags: ["User"],
    }),

    // ── POST /api/v1/Auth/logout ────────────────────────────────────────────
    // Server should clear the refreshToken cookie via Set-Cookie with expired date
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/Auth/logout",
        method: "POST",
      }),
    }),

    // ── POST /api/v1/Auth/switch-app ────────────────────────────────────────
    // Body: { appId }. Requires the Bearer token (added by baseQuery).
    switchApp: builder.mutation<SwitchAppResponse, SwitchAppRequest>({
      query: (body) => ({
        url: "/api/v1/Auth/switch-app",
        method: "POST",
        body,
      }),
    }),

    // ── POST /api/v1/Auth/refresh-token ────────────────────────────────────
    // Exposed for manual use if needed.
    // Automatic refresh is handled inside baseQueryWithReauth — no need to call this manually.
    // Backend MUST read refreshToken from Request.Cookies["refreshToken"], NOT from body.
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: "/api/v1/Auth/refresh-token",
        method: "POST",
        // No body — backend reads the HttpOnly cookie automatically
      }),
    }),

    // ── GET /api/v1/Auth/me ─────────────────────────────────────────────────
    // Fetches current user profile using the Bearer accessToken.
    // Called on page reload to re-hydrate user from a persisted accessToken.
    getCurrentUser: builder.query<User, void>({
      query: () => "/api/v1/Auth/me",
      providesTags: ["User"],
    }),

    // ── POST /api/v1/Users/forgot-password ─────────────────────────────────
    // Sends reset link to user's email. No auth required.
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/api/v1/Users/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // ── POST /api/v1/Users/reset-password ──────────────────────────────────
    // Consumes the token from the email link and sets a new password.
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/api/v1/Users/reset-password",
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${body.token}`,
          // or if backend expects plain token:
          // token: token,
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useSwitchAppMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
