// src/features/role-menu-mapping/types/roleMenuMapping.types.ts

export interface RoleMenuMapping {
  id: string;
  roleId: string;
  menuId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleMenuMappingDto {
  roleId: string;
  menuId: string;
  isActive: boolean;
}

export interface UpdateRoleMenuMappingDto extends CreateRoleMenuMappingDto {
  id: string;
}

export interface RoleMenuMappingListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RoleMenuMappingApiResponse {
  data: RoleMenuMapping[];
  totalCount: number;
  page: number;
  pageSize: number;
}
