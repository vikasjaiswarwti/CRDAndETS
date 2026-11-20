export interface SpecialCase {
  specialCase_Id: string;
  specialCaseId: string | null;
  specialCaseDesc: string | null;
  createdBy: string;
  createdOn: string;
  modBy: string | null;
  modOn: string | null;
  isActive: boolean | null;
}

export interface CreateSpecialCaseDto {
  specialCaseDesc: string;
  isActive: boolean;
}

export interface UpdateSpecialCaseDto extends CreateSpecialCaseDto {
  id: string;
}

export interface SpecialCaseListParams {
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}