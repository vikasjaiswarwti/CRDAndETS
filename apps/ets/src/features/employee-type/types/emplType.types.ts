// ─── Entity ───────────────────────────────────────────────────────────────────
export interface EmployeeType {
  empTypeCode_Id: string;
  empType: string | null;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateEmployeeTypeDto {
  empType: string | null;
  description: string | null;
  isActive: boolean;
}

export interface UpdateEmployeeTypeDto extends CreateEmployeeTypeDto {
  id: string;
}

// ─── List Params ──────────────────────────────────────────────────────────────
export interface EmployeeTypeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
