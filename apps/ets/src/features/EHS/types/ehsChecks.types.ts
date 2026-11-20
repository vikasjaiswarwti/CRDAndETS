// ─── Entity ───────────────────────────────────────────────────────────────────
export interface EhsCheck {
  ehs_Id: string;
  id: number;
  ehsType: string;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
  active: boolean;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateEhsCheckDto {
  ehsType: string;
  active: boolean;
}


// ─── List Params ──────────────────────────────────────────────────────────────
export interface EhsCheckListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────
// NOTE: The API returns a plain array (not a paginated envelope).
// We normalise this in transformResponse inside the API slice.
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}