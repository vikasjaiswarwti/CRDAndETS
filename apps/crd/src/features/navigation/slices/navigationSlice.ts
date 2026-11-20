// Navigation state. Menus are static today (CRD_MENU); when CrdCore exposes a
// user-menu API, fill `menus` from it (as ETS does) — the shell does not change.
// `collapsed` is hydrated from, and persisted to, the crd:-namespaced storage by
// app/store/persistence.ts (reducers stay pure).

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MenuItem } from "@commutr/ui/layout";
import { CRD_MENU } from "../data/crdMenu";
import { crdStorage, STORAGE_KEYS } from "../../../shared/lib/storage";

interface NavigationState {
  menus: MenuItem[];
  isLoading: boolean;
  isHydrated: boolean;
  collapsed: boolean;
}

const initialState: NavigationState = {
  menus: CRD_MENU,
  isLoading: false,
  isHydrated: true, // static menu: ready immediately
  collapsed: crdStorage.get<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    setMenus: (state, action: PayloadAction<MenuItem[]>) => {
      state.menus = action.payload;
      state.isHydrated = true;
    },
  },
});

export const { toggleCollapsed, setCollapsed, setMenus } =
  navigationSlice.actions;
export default navigationSlice.reducer;

type S = { navigation: NavigationState };
export const selectMenus = (s: S) => s.navigation.menus;
export const selectCollapsed = (s: S) => s.navigation.collapsed;
export const selectNavLoading = (s: S) =>
  s.navigation.isLoading || !s.navigation.isHydrated;
