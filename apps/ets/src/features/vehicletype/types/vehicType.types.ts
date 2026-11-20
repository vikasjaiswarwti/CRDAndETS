// ─── Entity ────────────────────────────────────────────────────────────────
export interface VehicleType {
  vehicleType_Id: string;
  locCode: number | null;
  vehicleTypeDesc: string;
  locationName: string; // Added for display purposes
  capacity: number | null;
  isActive:boolean;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────
export interface CreateVehicleTypeDto {
  locCode: number | null;
  vehicleTypeDesc: string;
  capacity: number | null;
  isActive:boolean | null;
}

export interface UpdateVehicleTypeDto extends CreateVehicleTypeDto {
  vehicleType_Id: string;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface VehicleTypeListParams {
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
