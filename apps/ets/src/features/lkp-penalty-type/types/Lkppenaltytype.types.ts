export interface LkpPenaltyType {
  penaltyType_ID: string;
  penaltyTypeId: number;
  penaltyType: string | null;
  applicableTo: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  createdOn: string | null;
}

export interface CreateLkpPenaltyTypeDto {
  penaltyType: string | null;
  applicableTo: string | null;
  isActive: boolean | null;
}

export interface UpdateLkpPenaltyTypeDto extends CreateLkpPenaltyTypeDto {
  id: string;
}

export interface LkpPenaltyTypeListParams {
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
