export interface Business {
  // id: string;
  businessId: number;
  businessFullName: string;
  businessShortName: string;
  // serviceID: number;
  businessUrl: string;
  // updation_Lmit: number;
  // scheduleUpdateVersion: string;
  // isAreaZone: boolean;
}

export interface CreateBusinessDto {
  businessFullName: string;
  businessShortName: string;
  // serviceID: number;
  businessUrl: string;
  // updation_Lmit: number;
  // scheduleUpdateVersion: string;
  // isAreaZone: boolean;
}

export interface UpdateBusinessDto extends CreateBusinessDto {
  businessId: number;
}

export interface BusinessListParams {
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
