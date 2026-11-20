export interface Menu {
    id: string;
    menuName: string;
    parentMenuId: string | null;
    routeUrl: string;
    orderNo: number;
    icon: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMenuDto {
    menuName: string;
    parentMenuId: string | null;
    routeUrl: string;
    orderNo: number;
    icon: string;
    isActive: boolean;
}

export interface UpdateMenuDto extends CreateMenuDto {
    id: string;
}

export interface MenuListParams {
    searchTerm?: string;
    sortColumn?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
}
export interface PaginatedMenuResponse {
    items: Menu[];
    totalCount: number;
    page: number;
    pageSize: number;
}
export interface Permission {
  id: number;
  name: string;
}
export interface AssignMenuPermissionDto {
    menuId: string;
    permissionId: number;
}
export interface AssignMenuPermissionResult {
    permissionId: number;
    permissionName: string;
    success: boolean;
    error?: string;
}
 
export interface PermissionGroup {
    groupName: string;
    permissions: Permission[];
}
 