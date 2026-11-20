

// src/features/navigation/hooks/useNavigation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single hook consumed by Sidebar and any layout component.
// Abstracts the store — components never import selectors directly.
//
// CHANGED from previous version:
//   ✅ Exports `menuItems` (not `menus`) — matches what Sidebar.tsx destructures
//   ✅ Exports `toggleSidebar` (not `toggleCollapsed`) — matches Sidebar.tsx usage
//   ✅ Exports `isLoading` — Sidebar.tsx uses this to show its spinner
//   ✅ Kept `menus` alias too for any non-sidebar consumers
// ─────────────────────────────────────────────────────────────────────────────

import { useAppDispatch, useAppSelector } from "../../../app/store";
import {
  selectMenus,
  selectActiveRole,
  selectCollapsed,
  selectMobileOpen,
  selectIsHydrated,
  selectIsLoading,
  toggleCollapsed,
  setCollapsed,
  setMobileOpen,
} from "../slices/navigationSlice";

export const useNavigation = () => {
  const dispatch = useAppDispatch();
  const menus = useAppSelector(selectMenus);
  const activeRole = useAppSelector(selectActiveRole);
  const collapsed = useAppSelector(selectCollapsed);
  const mobileOpen = useAppSelector(selectMobileOpen);
  const isHydrated = useAppSelector(selectIsHydrated);
  const isLoading = useAppSelector(selectIsLoading);

  return {
    // ── Data ────────────────────────────────────────────────────────────────
    /**
     * `menuItems` — alias used by Sidebar.tsx and SidebarMenu.tsx.
     * Same data as `menus` — both exported so callers can use either name.
     */
    menuItems: menus,
    menus, // keep for non-sidebar consumers
    activeRole,
    isHydrated,
    isLoading,

    // ── Sidebar UI state ────────────────────────────────────────────────────
    collapsed,
    mobileOpen,

    // ── Actions ─────────────────────────────────────────────────────────────
    /**
     * `toggleSidebar` — alias used by Sidebar.tsx's CollapseButton.
     * Dispatches the same toggleCollapsed action.
     */
    toggleSidebar: () => dispatch(toggleCollapsed()),
    toggleCollapsed: () => dispatch(toggleCollapsed()), // keep for other callers
    setCollapsed: (v: boolean) => dispatch(setCollapsed(v)),
    setMobileOpen: (v: boolean) => dispatch(setMobileOpen(v)),
  };
};
