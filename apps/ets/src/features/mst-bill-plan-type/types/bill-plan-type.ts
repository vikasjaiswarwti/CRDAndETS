// ─── Entity ────────────────────────────────────────────────────────────────
export interface LkpBillPlanType {
  id: string;
  bptCode?: string; // present in POST/PUT body; API list response omits it — kept optional
  bptName: string;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateBillPlanTypeDto {
  bptCode: string;
  bptName: string;
  active: boolean;
}

export interface UpdateBillPlanTypeDto extends CreateBillPlanTypeDto {
  id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface BillPlanTypeListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ────────────────────────────────────────────────────
// API returns raw array — normalized via transformResponse in the API slice.
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
