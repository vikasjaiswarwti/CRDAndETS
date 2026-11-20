// FILE 1 — types/cityZone.types.ts

export interface CityZone {
  id: string;
  cityZoneCode: string;
  cityZoneDescription: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

export interface CreateCityZoneDto {
  cityZoneCode: string;
  cityZoneDescription: string | null;
  active: boolean;
}

export interface UpdateCityZoneDto extends CreateCityZoneDto {
  id: string;
}

export interface CityZoneListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// API returns a plain array — we normalise to PaginatedResponse<T> in transformResponse
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
