// ─── Role ───────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  roleName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  roleName: string;
  isActive: boolean;
}

export interface UpdateRoleDto extends CreateRoleDto {
  id: string;
}

// In SystemRolePermission.types.ts — extend CreateMenuResponse
export interface CreateMenuResponse {
  id: string; // what the API actually returns
  menuName: string;
  parentMenuId: string;
  routeUrl: string;
  orderNo: number;
  icon: string;
  isActive: boolean;
}

export interface RoleListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Menu ───────────────────────────────────────────────────────────────────

export interface MenuItem {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  isAssigned: boolean;
  routeUrl: string;
  icon: string;
  isActive: boolean;
  children?: MenuItem[];
  isShow?:boolean | null;
  
}

export interface CreateMenuDto {
  menuName: string;
  parentMenuId: string | null;
  routeUrl: string;
  orderNo: number;
  icon: string;
  isActive: boolean;
  isShow?: boolean;
}

// ── UpdateMenuDto uses `id` (the URL param) not `menuId` ─────────────────────
export interface UpdateMenuDto {
  id: string; // sent as URL param — NOT menuId
  menuName: string;
  parentMenuId: string | null;
  routeUrl: string;
  orderNo: number;
  icon: string;
  isActive: boolean;
  isShow: boolean;
}

export interface MenuListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Permission ──────────────────────────────────────────────────────────────

export type PermissionKey = "view" | "create" | "edit" | "delete" | "export";

export interface MenuPermission {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  permissions: Record<PermissionKey, boolean>;
  children?: MenuPermission[];
}

export interface RoleMenuPermission {
  roleId: string;
  roleName: string;
  menuPermissions: MenuPermission[];
}

export interface SaveRolePermissionsDto {
  roleId: string;
  menuPermissions: Array<{
    menuId: string;
    permissions: Record<PermissionKey, boolean>;
  }>;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type PermissionTab = "menu" | "api" | "data";

export interface PermissionDraft {
  [menuId: string]: Record<PermissionKey, boolean>;
}
