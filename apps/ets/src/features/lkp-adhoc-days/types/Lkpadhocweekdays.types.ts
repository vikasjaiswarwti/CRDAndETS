export interface LkpAdhocWeekDay {
  id: string;
  locCode: string | null;
  dayCode: string | null;
  daysName: string | null;
  active: boolean | null;
  createdBy: string;
  createdOn: string | null;
}

export interface CreateLkpAdhocWeekDayDto {
  locCode: string | null;
  dayCode: string | null;
  daysName: string | null;
  active: boolean | null;
}

export interface UpdateLkpAdhocWeekDayDto extends CreateLkpAdhocWeekDayDto {
  id: string;
}

export interface LkpAdhocWeekDayListParams {
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
