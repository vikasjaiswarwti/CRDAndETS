// ── Page ──────────────────────────────────────────────────────────────────────
export { default as RolePermissionPage } from "./pages/SystemRolePermissionPage";

// ── APIs ──────────────────────────────────────────────────────────────────────
export { roleApi } from "./services/SystemRoleApi";
export { adminMenuApi } from "./services/SystemMenuapi";

// ── RTK Query hooks (re-exported for external use) ────────────────────────────
export {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "./services/SystemRoleApi";

export {
  useGetAllMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
} from "./services/SystemMenuapi";

// ── Slice ─────────────────────────────────────────────────────────────────────
export {
  selectRole,
  setActiveTab,
  togglePermission,
  setAllPermissions,
  toggleMenuExpanded,
  expandAllMenus,
  resetDraft,
} from "./slice/RolePermissionSlice";
export { default as rolePermissionReducer } from "./slice/RolePermissionSlice";

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
