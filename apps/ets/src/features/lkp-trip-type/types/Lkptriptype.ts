export interface LkpTripType {
  id: string;
  tripTypeCode: number;
  tripTypeName: string | null;
  active: boolean;
  createdBy: string;
  createdOn: string;
}

export interface CreateLkpTripTypeDto {
  tripTypeName: string | null;
  active: boolean;
}

export interface UpdateLkpTripTypeDto extends CreateLkpTripTypeDto {
  id: string;
}

export interface LkpTripTypeListParams {
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
