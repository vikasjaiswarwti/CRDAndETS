export interface MasterWeeklyScheduleItem {
  commutrId: number;
  employeeid: string;
  empname: string;
  mobileno: string;
  lock_Days: string;
  pickShift: string | null;
  pickShiftId: number;
  dropShift: string | null;
  dropShiftId: number;
  rowNumber: number;
  totalCount: number;
}

export interface MasterWeeklyScheduleListParams {
  locCode: number;
  searchString: string | null;
  page: number;
  pageSize: number;
}

export interface MasterWeeklyScheduleRawResponse {
  result: MasterWeeklyScheduleItem[];
  total: number;
  pageNo: number;
  pageSize: number;
  isSuccess: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// POST /api/v1/TransRoster/UpdateMasterSchedule
export interface UpdateMasterScheduleDto {
  empID: number; // commutrId
  employeeID: string | null; // employeeid
  days: string | null; // comma-separated WeekDayCode, e.g. "SUN,MON"
  pickShift: string | null; // pickShiftId
  dropShift: string | null; // dropShiftId
}

export interface UpdateMasterScheduleResponse {
  isSuccess: boolean;
  message: string;
}

// POST /api/v1/TransRoster/CreateScheduleFromMaster
export interface CreateScheduleFromMasterDto {
  locCode: number;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
}

export interface CreateScheduleFromMasterResponse {
  isSuccess: boolean;
  message: string;
}
