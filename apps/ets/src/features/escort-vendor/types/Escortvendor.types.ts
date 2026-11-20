// ─── Entity ────────────────────────────────────────────────────────────────
export interface EscortVendor {
  mstEscortVendor_Id: string;
  escortVendorId: number;
  locCode: number;
  vendorName: string;
  address: string;
  mobile: string;
  emailId: string;
  remarks: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateEscortVendorDto {
  locCode: number;
  vendorName: string;
  address: string;
  mobile: string;
  emailId: string;
  remarks: string | null;
  active: boolean;
}

export interface UpdateEscortVendorDto extends CreateEscortVendorDto {
  id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface EscortVendorListParams {
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
