// @commutr/system-admin — shared System Administration UI (roles, menus, permissions).
//
// Wiring in an app (see apps/ets/src/features/system-administration):
//   1. const apis = createSystemAdminApis({ baseQuery, basePath })
//   2. register apis.* reducers + middleware in the app's store
//   3. register rolePermissionReducer under ROLE_PERMISSION_REDUCER_KEY
//   4. render <SystemAdminPage apis={apis} /> from the app's router

// NOTE: the screen is NOT exported here on purpose. This entry is imported by the
// app STORE (eager), so it must stay light. Import the screen from
// "@commutr/system-admin/page" inside a lazy route so it code-splits.

// ── Data layer (each app builds its own) ──────────────────────────────────────
export {
  createSystemAdminApis,
  type SystemAdminApis,
  type SystemAdminApiConfig,
  type SystemAdminBaseQuery,
} from "./api/createSystemAdminApis";
export { SystemAdminProvider, useSystemAdminApis } from "./api/context";

// ── Redux slice (UI state: selected role, draft permissions, tabs) ────────────
export {
  default as rolePermissionReducer,
  ROLE_PERMISSION_REDUCER_KEY,
  selectRole,
  setActiveTab,
  togglePermission,
  setAllPermissions,
  toggleMenuExpanded,
  expandAllMenus,
  resetDraft,
  type RolePermissionRootState,
  type RolePermissionUiState,
} from "./slice/RolePermissionSlice";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  MenuPermission,
  PermissionKey,
  PermissionDraft,
  PermissionTab,
} from "./types/SystemRolePermission.types";
export type {
  AvailablePermission,
  RoleMenuTreeItem,
  RoleMenuMapping,
} from "./api/types";
