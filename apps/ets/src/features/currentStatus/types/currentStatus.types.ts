// ─── Raw API response shape ───────────────────────────────────────────────────
export interface CurrentStatusRaw {
  currentStatus_Id: string;
  id: number;
  statusName: string | null;
  status: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}


// ─── DTOs ────────────────────────────────────────────────────────────────────
export interface CreateCurrentStatusDto {
  statusName: string | null;
}

export interface UpdateCurrentStatusDto {
  currentStatus_Id: string; // currentStatus_Id UUID
  statusName: string | null;
  status: boolean;
}

// ─── List params ─────────────────────────────────────────────────────────────
export interface CurrentStatusListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated response (normalized) ─────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

