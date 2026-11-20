// ─── Entity ────────────────────────────────────────────────────────────────
export interface FuelType {
  id: string; // GUID — primary key
  fuelTypeCode: number;
  fuelTypeDesc: string;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateFuelTypeDto {
  fuelTypeDesc: string;
  active: boolean;
}

export interface UpdateFuelTypeDto extends CreateFuelTypeDto {
  id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface FuelTypeListParams {
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
