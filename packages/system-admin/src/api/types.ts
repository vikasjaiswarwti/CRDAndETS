// Types that were previously declared next to the ETS RTK Query services.

export interface AvailablePermission {
  id: number;
  name: string;
  isAssigned: boolean;
}

export interface MenuPermissionsResponse {
  menuId: string;
  availablePermissions: AvailablePermission[];
}

export interface BulkUpdatePermissionsDto {
  roleId: string;
  menuId: string;
  permissionIds: number[];
}

export interface RoleMenuMapping {
  id: string;
  roleId: string;
  menuId: string | null;
  isActive: boolean;
}

export interface RoleMenuMappingListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface CreateRoleMenuMappingDto {
  roleId: string;
  menuId: string;
  isActive: boolean;
}

export interface UpdateRoleMenuMappingDto {
  id: string;
  roleId: string;
  menuId: string;
  isActive: boolean;
}

/** Shape returned by /tree/{roleId}: the menu tree with isAssigned populated. */
export interface RoleMenuTreeItem {
  menuId: string;
  menuName: string;
  parentMenuId: string | null;
  orderNo: number;
  isAssigned: boolean;
  routeUrl: string;
  icon: string;
  isShow?: boolean;
  isActive: boolean;
  mappingId?: string; // the RoleMenuMapping.id, present when isAssigned === true
  children?: RoleMenuTreeItem[];
}
