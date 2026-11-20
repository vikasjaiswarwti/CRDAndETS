import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { Mutex } from "async-mutex";
import { notification } from "antd";

import type { RootState } from "../../../app/store";
import {
  setTokens,
  logout,
  persistAccessToken,
  clearPersistedToken,
} from "../../../features/auth/slices/authSlice";

import type { RefreshTokenResponse } from "../../../features/auth/types/auth.types";
import { API_BASE_URL } from "../../constants/app.constants";
import { getTenant } from "../../auth-core";

// ── Compatibility exports ─────────────────────────────────────────────────────
export const clearRefreshToken = () => {
  /* noop — server clears via Set-Cookie */
};
export const storeRefreshToken = (_token: string) => {
  /* noop — HttpOnly cookie */
};

// ── Mutex ─────────────────────────────────────────────────────────────────────
const refreshMutex = new Mutex();

// ── Raw base query ────────────────────────────────────────────────────────────
// API_BASE_URL is "" so fetchBaseQuery uses relative URLs → same-origin → proxy
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    headers.set("X-Tenant", getTenant());

    // if (token) {
    //   headers.set("Authorization", `Bearer ${token}`);
    // } else {
    //   headers.set("X-Tenant", X_TENENT_ID);
    // }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// ── Global HTTP error handler ─────────────────────────────────────────────────
// Called for every failed request. Shows a notification for known status codes.
// Add new cases here — no other file needs to change.
function handleGlobalErrors(error: FetchBaseQueryError): void {
  const status = error.status;
  const data = error.data as
    | { detail?: string; title?: string; message?: string }
    | undefined;

  switch (status) {
    case 403:
      notification.error({
        message: data?.title ?? "Access Denied",
        description:
          data?.detail ?? "You do not have permission to access this resource.",
        placement: "topRight",
        duration: 5,
      });
      break;

    case 500:
      notification.error({
        message: "Server Error",
        description:
          data?.message ??
          data?.detail ??
          "Something went wrong on the server. Please try again.",
        placement: "topRight",
        duration: 5,
      });
      break;

    // 401 is handled by the refresh flow below — don't notify here
    // Add more cases as needed (e.g. 404, 422, etc.)
  }
}

// ── Standalone refresh using native fetch ─────────────────────────────────────
// Uses a relative URL (/api/...) so Vite proxies it → same-origin →
// browser attaches the HttpOnly SameSite=Strict cookie automatically.
const callRefreshToken = async (
  expiredAccessToken: string,
): Promise<RefreshTokenResponse | null> => {
  try {
    const response = await fetch("/api/v1/Auth/refresh-token", {
      method: "POST",
      credentials: "include", // sends HttpOnly cookie (same-origin via proxy)
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expiredAccessToken}`,
      },
      // No body — backend reads refreshToken from Request.Cookies["refreshToken"]
    });

    if (!response.ok) return null;

    return (await response.json()) as RefreshTokenResponse;
  } catch {
    return null;
  }
};

// ── Authenticated base query with silent refresh ──────────────────────────────
export const baseQueryWithReauth = (async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    handleGlobalErrors(result.error); // ← ADD (single line)
  }

  if (result.error?.status !== 401) {
    return result;
  }

  if (refreshMutex.isLocked()) {
    await refreshMutex.waitForUnlock();
    return await rawBaseQuery(args, api, extraOptions);
  }

  const release = await refreshMutex.acquire();

  try {
    const expiredAccessToken = (api.getState() as RootState).auth.accessToken;

    if (!expiredAccessToken) {
      api.dispatch(logout());
      clearPersistedToken();
      return result;
    }

    const refreshData = await callRefreshToken(expiredAccessToken);

    if (refreshData?.accessToken) {
      // ✅ Refresh succeeded
      api.dispatch(setTokens(refreshData.accessToken));
      persistAccessToken(refreshData.accessToken);
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // ❌ Refresh failed
      api.dispatch(logout());
      clearPersistedToken();
    }
  } finally {
    release();
  }

  return result;
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
