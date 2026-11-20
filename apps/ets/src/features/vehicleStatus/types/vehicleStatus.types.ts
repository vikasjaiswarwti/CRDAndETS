export interface VehicleStatus {
  vehicleStatusName: string;
  vehicleStatus_Id: string,
  vehicleStatusId: string | number,
  createdBy: string,
  createdOn: string,
  modBy: string,
  modOn: string

}

export interface CreateVehicleStatusDto {
  vehicleStatusName: string;
}

export interface UpdateVehicleStatusDto extends CreateVehicleStatusDto {
  vehicleStatus_Id: string;
}

// API returns a plain array — no pagination
export type VehicleStatusListResponse = VehicleStatus[];
// ─── Paginated response (normalized) ─────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
