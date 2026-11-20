// Authenticated base query with silent refresh — same behaviour as ETS.
//   • Bearer token from the auth slice, X-Tenant from the shared tenant helper
//   • 401 -> one refresh call (mutex-guarded) -> retry, else logout
//   • refresh token is an HttpOnly cookie, never touched by JS
//
// createBaseQuery(baseUrl) lets CRD APIs (/crd-api) and identity APIs (/api/v1)
// share the same refresh logic with different base URLs.

import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { notification } from "antd";
import { clearToken, setToken, getTenant as sharedGetTenant } from "@commutr/shared";

import type { RootState } from "../../../app/store";
import { logout, setTokens } from "../../../features/auth/slices/authSlice";

const getTenant = () =>
  sharedGetTenant((import.meta.env.VITE_X_TENENT_ID as string) ?? "");

const refreshMutex = new Mutex();

function handleGlobalErrors(error: FetchBaseQueryError): void {
  const data = error.data as
    | { detail?: string; title?: string; message?: string }
    | undefined;

  if (error.status === 403) {
    notification.error({
      message: data?.title ?? "Access Denied",
      description:
        data?.detail ?? "You do not have permission to access this resource.",
      placement: "topRight",
      duration: 5,
    });
  } else if (error.status === 500) {
    notification.error({
      message: "Server Error",
      description:
        data?.message ??
        data?.detail ??
        "Something went wrong on the server. Please try again.",
      placement: "topRight",
      duration: 5,
    });
  }
}

const callRefreshToken = async (
  expiredAccessToken: string,
): Promise<{ accessToken?: string } | null> => {
  try {
    const res = await fetch("/api/v1/Auth/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${expiredAccessToken}`,
      },
    });
    return res.ok ? ((await res.json()) as { accessToken?: string }) : null;
  } catch {
    return null;
  }
};

export const createBaseQuery = (baseUrl: string) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.set("X-Tenant", getTenant());
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });

  return (async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) handleGlobalErrors(result.error);
    if (result.error?.status !== 401) return result;

    if (refreshMutex.isLocked()) {
      await refreshMutex.waitForUnlock();
      return rawBaseQuery(args, api, extraOptions);
    }

    const release = await refreshMutex.acquire();
    try {
      const expired = (api.getState() as RootState).auth.accessToken;
      if (!expired) {
        api.dispatch(logout());
        clearToken();
        return result;
      }

      const refreshed = await callRefreshToken(expired);
      if (refreshed?.accessToken) {
        api.dispatch(setTokens(refreshed.accessToken));
        setToken(refreshed.accessToken); // shared key -> ETS stays in sync
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        clearToken();
      }
    } finally {
      release();
    }
    return result;
  }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
};
