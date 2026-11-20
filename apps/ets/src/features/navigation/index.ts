// src/features/navigation/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Public API for the navigation feature.
// All consumers import from here — never from internal file paths.
// ─────────────────────────────────────────────────────────────────────────────

// ── RTK Query service ─────────────────────────────────────────────────────────
export { menuApi, useGetMenuQuery } from "./services/menuApi";
export type { MenuQueryResult } from "./services/menuApi";

// ── Slice — reducer + actions + selectors ─────────────────────────────────────
export { default as navigationReducer } from "./slices/navigationSlice";
export {
  setActiveRole,
  toggleCollapsed,
  setCollapsed,
  setMobileOpen,
  resetNavigation,
  selectMenus,
  selectRoles,
  selectActiveRole,
  selectIsLoading,
  selectIsHydrated,
  selectCollapsed,
  selectMobileOpen,
} from "./slices/navigationSlice";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useNavigation } from "./hooks/useNavigation";
export { useRoleSwitcher } from "./hooks/useRoleSwitcher";

// ── Components ────────────────────────────────────────────────────────────────
export { RoleSwitcherWidget } from "./components/Roleswitcherwidget";
