// ─── Entity ────────────────────────────────────────────────────────────────
export interface MstBillPlan {
  id: string;
  bpId: number;
  locCode: number;
  bptCode: string;
  billPlanTypeName: string;
  locationName: string;
  bpName: string;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateBillPlanDto {
  locCode: number;
  bptCode: string;
  bpName: string;
  active: boolean;
}

export interface UpdateBillPlanDto extends CreateBillPlanDto {
  id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface BillPlanListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
  location?: string | number;
}

// ─── Paginated Response ────────────────────────────────────────────────────
// The API returns a raw array — transformResponse in the API slice
// normalizes it into this shape.
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
