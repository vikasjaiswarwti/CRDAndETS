// ─── Entity ────────────────────────────────────────────────────────────────
export interface Escort {
  mstEscort_Id: string;
  escortId: number;
  locCode: number;
  locationName:string;
  escortVendorId: number;
  name: string;
  address: string;
  mobileNo: string;
  emailId: string | null;
  remarks: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateEscortDto {
  locCode: number;
  escortVendorId: number;
  name: string;
  address: string;
  mobileNo: string;
  emailId: string;
  remarks: string | null;
  active: boolean;
}

export interface UpdateEscortDto extends CreateEscortDto {
  id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface EscortListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// ─── Paginated Response ────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
