// src/features/role-management/types/role.types.ts

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

export interface RoleListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

/** Normalized shape used throughout the app */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Raw API response shape (transformed in the API slice) */
export interface RoleApiResponse {
  items: Role[];
  totalCount: number;
  page: number;
  pageSize: number;
}
