export interface ShiftInterval {
  id: string;
  intervalMinute: number;
  intervalText: string | null;
  active: boolean;
}

export interface CreateShiftIntervalDto {
  intervalMinute: number;
  intervalText: string | null;
  active: boolean;
}

export interface UpdateShiftIntervalDto extends CreateShiftIntervalDto {
  id: string;
}

export interface ShiftIntervalListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
