// ─── Entity ───────────────────────────────────────────────────────────────────
export interface LineOfBusiness {
  lobCode_Id: string;
  lobCode: number;
  lobName: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateLineOfBusinessDto {
  lobName: string | null;
  active: boolean;
}

export interface UpdateLineOfBusinessDto extends CreateLineOfBusinessDto {
  id: string; // mapped from lobCode_Id before sending
}

// ─── List Params ──────────────────────────────────────────────────────────────
export interface LineOfBusinessListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response (normalised in transformResponse) ─────────────────────
export interface PaginatedResponse<LineOfBusiness> {
  items: LineOfBusiness[];
  total: number;
  page: number;
  pageSize: number;
}
