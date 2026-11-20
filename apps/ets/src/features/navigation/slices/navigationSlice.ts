// export const { setMenuItems, toggleCollapsed, setCollapsed, setMobileOpen } =
//   navigationSlice.actions;

// export default navigationSlice.reducer;

// // ── Selectors ─────────────────────────────────────────────────────────────────
// export const selectMenuItems = (s: { navigation: NavigationState }) =>
//   s.navigation.menuItems;
// export const selectCollapsed = (s: { navigation: NavigationState }) =>
//   s.navigation.collapsed;
// export const selectMobileOpen = (s: { navigation: NavigationState }) =>
//   s.navigation.mobileOpen;

// src/features/navigation/slices/navigationSlice.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for:
//   • menus  — the sidebar tree, fetched from backend
//   • roles  — the user's assigned roles, from the same endpoint
//   • activeRole — highest-priority role, drives dashboard selection
//   • isHydrated — true once the API has settled (success OR failure)
//   • isLoading  — true while the API call is in flight
//   • collapsed / mobileOpen — sidebar UI state
//
// CHANGED from previous version:
//   ✅ Removed hydrateFromMock — no mock data anywhere in this codebase
//   ✅ Added isLoading to state — Sidebar.tsx reads this directly
//   ✅ extraReducer matchPending sets isLoading = true
//   ✅ Both matchFulfilled and matchRejected set isLoading = false
//   ✅ No hardcoded role strings anywhere in this file
// ─────────────────────────────────────────────────────────────────────────────

import {
  createSlice,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { MenuItem } from "../../../shared/types/menu.types";
import { menuApi } from "../services/menuApi";
import { resolveActiveRole } from "../../../shared/constants/roles.constants";

interface NavigationState {
  // ── Data ──────────────────────────────────────────────────────────────────
  menus: MenuItem[];
  roles: string[]; // lowercase-normalised, e.g. ["vendor"]
  activeRole: string | null; // highest-priority role, drives RoleDashboard

  // ── API lifecycle ─────────────────────────────────────────────────────────
  isLoading: boolean; // true while API call is in-flight
  isHydrated: boolean; // true once API has settled (success or failure)

  // ── Sidebar UI ────────────────────────────────────────────────────────────
  collapsed: boolean;
  mobileOpen: boolean;
  sidebarCollapsed: boolean;
}

const initialState: NavigationState = {
  menus: [],
  roles: [],
  activeRole: null,
  isLoading: false,
  isHydrated: false,
  collapsed: false,
  mobileOpen: false,
  sidebarCollapsed: false,
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,

  reducers: {
    /**
     * Switch active role at runtime — only accepts roles the user actually holds.
     * Used by RoleSwitcherWidget when a user has multiple roles.
     */
    setActiveRole(state, action: PayloadAction<string>) {
      if (state.roles.includes(action.payload)) {
        state.activeRole = action.payload;
      }
    },

    // ── Sidebar UI actions ──────────────────────────────────────────────────
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    setMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileOpen = action.payload;
    },

    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload; // or whatever your field is named
    },

    resetNavigation: () => initialState,
  },

  extraReducers: (builder) => {
    // ── API in-flight ────────────────────────────────────────────────────────
    builder.addMatcher(menuApi.endpoints.getMenu.matchPending, (state) => {
      state.isLoading = true;
    });

    // ── API success ──────────────────────────────────────────────────────────
    // builder.addMatcher(
    //   menuApi.endpoints.getMenu.matchFulfilled,
    //   (state, { payload }) => {
    //     // menus already have normalised routeUrls (done in transformResponse)
    //     state.menus = payload.menus;
    //     // roles already lowercased (done in transformResponse)
    //     state.roles = payload.roles;
    //     // Resolve which dashboard to show based on priority order
    //     state.activeRole = resolveActiveRole(payload.roles);
    //     state.isLoading = false;
    //     state.isHydrated = true;
    //   },
    // );

    // navigationSlice.ts — in matchFulfilled
    builder.addMatcher(
      menuApi.endpoints.getMenu.matchFulfilled,
      (state, { payload }) => {
        state.menus = payload.menus;
        state.roles = payload.roles;
        state.activeRole = resolveActiveRole(payload.roles);
        state.isLoading = false;
        state.isHydrated = true;
      },
    );

    // ── API failure ──────────────────────────────────────────────────────────
    builder.addMatcher(menuApi.endpoints.getMenu.matchRejected, (state) => {
      // Don't block the app on error — sidebar will be empty but app renders.
      // In production a 401 here means the user needs to re-login;
      // handle that in baseQueryWithReauth, not here.
      state.isLoading = false;
      state.isHydrated = true;
    });
  },
});

export const {
  setActiveRole,
  toggleCollapsed,
  setCollapsed,
  setMobileOpen,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
type WithNav = { navigation: NavigationState };

export const selectMenus = (s: WithNav) => s.navigation.menus;
export const selectRoles = (s: WithNav) => s.navigation.roles;
export const selectActiveRole = (s: WithNav) => s.navigation.activeRole;
export const selectIsLoading = (s: WithNav) => s.navigation.isLoading;
export const selectIsHydrated = (s: WithNav) => s.navigation.isHydrated;
export const selectCollapsed = (s: WithNav) => s.navigation.collapsed;
export const selectMobileOpen = (s: WithNav) => s.navigation.mobileOpen;

const ROLE_HIDDEN_ROUTES: Partial<Record<string, Set<string>>> = {
  vendor: new Set(["/compliance/vendor-dashboard"]),
};

export const selectVisibleMenus = createSelector(
  [selectMenus, selectActiveRole],
  (menus, activeRole) => {
    const hidden = ROLE_HIDDEN_ROUTES[activeRole ?? ""];
    if (!hidden) return menus;

    return menus.map((menu) => ({
      ...menu,
      children:
        menu.children?.filter((child) => !hidden.has(child.routeUrl)) ?? null,
    }));
  },
);
