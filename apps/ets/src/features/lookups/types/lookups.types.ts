export interface CityZone {
  id: string;
  cityZoneCode: string;
  cityZoneDescription: string;
  active: boolean;
}

export interface Location {
  id: string; // or lkpLocation_Id depending on your API
  locCode: number;
  locName: string;
  // add other fields you need
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LookupParams {
  searchTerm?: string;
  page: number;
  pageSize: number;
}

export interface LookupParamsForEmployee {
  page?: number;
  pageSize?: number;

  // NEW
  locCode?: number;
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;

  [key: string]: any;
}
