export interface Process {
  id: string;
  procode: string;
  proname: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
}

export interface CreateProcessDto {
  procode: string;
  proname: string | null;
  active: boolean;
}

export interface UpdateProcessDto extends CreateProcessDto {
  id: string;
}

export interface ProcessListParams {
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
