// ─── Entity ───────────────────────────────────────────────────────────────────
export interface Department {
  dept_Id: string;
  deptId: number;
  depCode: string | null;
  depName: string | null;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateDepartmentDto {
  depCode: string | null;
  depName: string | null;
  isActive: boolean;
}

export interface UpdateDepartmentDto extends CreateDepartmentDto {
  id: string;
}

// ─── List Params ──────────────────────────────────────────────────────────────
export interface DepartmentListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────
// API returns a plain array — transformResponse will normalize it.
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
