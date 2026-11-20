// FILE 1 — types/state.types.ts

export interface State {
  id: string;
  stateCode: number;
  stateName: string;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
}

export interface CreateStateDto {
  stateName: string;
}

export interface UpdateStateDto extends CreateStateDto {
  id: string;
}

export interface StateListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

// NOTE: The API returns a plain array [] — NOT a paginated envelope.
// transformResponse in stateApi.ts normalises it into PaginatedResponse<State>.
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number; // optional, in case API doesn't provide it
  hasNextPage?: boolean; // optional, in case API doesn't provide it
  hasPrevPage?: boolean; // optional, in case API doesn't provide it
}