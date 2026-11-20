// Identity API (shared with ETS). Login itself happens in the launcher (/),
// never in CRD — CRD only reads the session, logs out and switches app.

import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "../../../shared/lib/api/baseQueries";
import type { AuthUser } from "../slices/authSlice";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: authBaseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => "/api/v1/Auth/me",
      providesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/v1/Auth/logout", method: "POST" }),
    }),

    // Response shape not confirmed yet — accessToken treated as optional.
    switchApp: builder.mutation<{ accessToken?: string }, { appId: number }>({
      query: (body) => ({
        url: "/api/v1/Auth/switch-app",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLogoutMutation,
  useSwitchAppMutation,
} = authApi;
