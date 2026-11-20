

// src/features/navigation/services/menuApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// RTK Query service for GET /api/v1/Users/user-menu
//
// This is the ONLY place where the menu + roles are fetched.
// No mock data, no fallback — real API only.
//
// transformResponse does two things:
//   1. Normalises role casing to lowercase ("Vendor" → "vendor")
//   2. Normalises routeUrl to always have a leading slash ("fleet/vendor" → "/fleet/vendor")
//      so React Router path matching works correctly everywhere.
// ─────────────────────────────────────────────────────────────────────────────

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  UserMenuApiResponse,
  MenuItem,
} from "../../../shared/types/menu.types";

/** Shape the rest of the app receives — already normalised */
export interface MenuQueryResult {
  menus: MenuItem[];
  /** Lowercase-normalised role slugs, e.g. ["vendor"] */
  roles: string[];
}

/**
 * Recursively normalises every routeUrl in the menu tree to have a leading slash.
 * The backend sends "fleet/vendor" — React Router needs "/fleet/vendor".
 * We fix it once here so nothing downstream ever has to worry about it.
 */
const normaliseMenuUrls = (items: MenuItem[]): MenuItem[] =>
  items.map((item) => ({
    ...item,
    // Add leading slash only if routeUrl is non-empty and doesn't already have one
    routeUrl:
      item.routeUrl && !item.routeUrl.startsWith("/")
        ? `/${item.routeUrl}`
        : item.routeUrl,
    children: item.children ? normaliseMenuUrls(item.children) : null,
  }));

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Menu"],
  endpoints: (builder) => ({
    getMenu: builder.query<MenuQueryResult, void>({
      query: () => "/api/v1/Users/user-menu",
      keepUnusedDataFor: Infinity, // never evict from cache
      transformResponse: (raw: UserMenuApiResponse): MenuQueryResult => ({
        // Normalise all routeUrls to have leading slash
        menus: normaliseMenuUrls(raw.menus ?? []),
        // Normalise role casing to lowercase once — never handle casing downstream
        roles: (raw.roles ?? []).map((r) => r.toLowerCase()),
      }),

      providesTags: ["Menu"],
    }),
  }),
});

export const { useGetMenuQuery } = menuApi;
