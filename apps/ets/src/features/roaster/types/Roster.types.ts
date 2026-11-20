// src/features/roster/types/Roster.types.ts
// All field names match backend API exactly.

export type WeekDay =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type WeekDayCode = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

// tripType values for CancelSchedules
// 0 = Both, 1 = Pickup only, 2 = Drop only
export type TripType = 0 | 1 | 2;

export type CancelShiftType = "PICK" | "DROP" | "BOTH";

export type RosterPageStatus = "idle" | "success" | "error";

export type ShiftTripType = "LOGIN" | "LOGOUT" | "BOTH";

// ─── Supervisor / Member ──────────────────────────────────────────────────────
// Shape from: GET /api/v1/TransRoster/GetRosterSuperVisorList

export interface RosterSupervisor {
  empId: number;
  empCode: string;
  empName: string;
  locCode: number;
  officeName: string;
  gender?: "M" | "F";
}

// ─── Shift ────────────────────────────────────────────────────────────────────
// Shape from: GET /api/v1/MstShiftControl/GetUserShiftWeb?locCode=xxx
// pickShifts and dropShifts are kept separate in the transformed response.

export interface UserShift {
  shiftId: number;
  shiftCode: string;
  shiftName: string;
  shiftStart: string; // e.g. "09:00"
  shiftEnd: string; // e.g. "18:00"
}

// ─── Schedule Entry ───────────────────────────────────────────────────────────
// Shape from: GET /api/v1/TransRoster/ViewSchedules

export interface ScheduleEntry {
  id: string; // derived: `${empid}-${scheduleDate}-${locCode}-${index}`
  userName: string;
  empid?: number; // what the API actually returns
  empCode: string; // derived from empid in transformResponse
  locCode: number;
  office: string;
  empName: string;
  scheduleDate: string; // "10-May-2026" format from API
  weekDays: string;
  pickShift: string;
  dropShift: string;
  weekOff: string;
  tripType: number;
  loginStatus: string;
  logoutStatus: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

// POST /api/v1/TransRoster/UpdateSchedules
export interface UpdateSchedulesDto {
  ScheduleUpdateVersion: string;
  LocCode: number;
  FromDate: string; // "YYYY-MM-DD"
  ToDate: string; // "YYYY-MM-DD"
  ShiftStart: string; // ShiftTime string of selected pickup shift e.g. "09:00"
  ShiftEnd: string; // ShiftTime string of selected drop shift e.g. "18:00"
  WeekOffs: string; // comma-separated codes e.g. "SUN,SAT"
  User_Empids: string; // comma-separated empId list e.g. "1,2,3"
}

// POST /api/v1/TransRoster/CancelSchedules
export interface CancelScheduleDto {
  LocCode: number;
  Empid: number;
  ScheduleDate: string; // "YYYY-MM-DD"
  TripType: TripType; // 0=Both, 1=Pick, 2=Drop
  ScheduleCancelVersion: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ViewScheduleParams {
  empId: number | string;
  dateFrom: string;
  dateTo: string;
}

// ─── Scheduler Template ───────────────────────────────────────────────────────
// Shape from: GET /api/v1/TransRoster/scheduler-upload-template

export interface SchedulerTemplateRow {
  EMPLOYEEID: string;
  EMPNAME: string;
  FROMDATE: string;
  TODATE: string;
  SHIFTSTART: string; // placeholder "HH:MM" — user fills in
  SHIFTEND: string; // placeholder "HH:MM" — user fills in
  WEEKOFF1: string;
  WEEKOFF2: string;
  WEEKOFF3: string;
}

export interface SchedulerTemplateParams {
  locCode: number;
  loginUser: number; // current user's numeric ID from auth state
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadBatchError {
  batchId: string;
  logDetails: string;
}

export interface UploadScheduleResponse {
  success: boolean;
  batchErrors?: UploadBatchError[];
  message?: string;
}

export interface BulkUploadParams {
  locCode: number;
  file: File;
}

export interface BulkUploadResponse {
  errorCode: number;
  dB_Response: string;
  batchId: number;
  errorLogs: BulkUploadErrorLog[];
}

// batchId is number — matches API response and useRosterBulkUpload hook
export interface BulkUploadErrorLog {
  batchId: number;
  logDetail: string;
}

// ─── Redux UI state ───────────────────────────────────────────────────────────

export type SelectedScheduleRow = Pick<
  ScheduleEntry,
  "empCode" | "empid" | "locCode" | "scheduleDate" | "tripType"
>;

export interface RosterUiState {
  // CreateRosterPage form
  selectedLocCode: number | null;
  selectedMemberEmpIds: number[];
  selectedWeeklyOffDays: WeekDayCode[];
  selectedPickupShiftId: string;
  selectedDropShiftId: string;
  fromDate: string;
  toDate: string;

  // EmployeeSchedulePage filters
  scheduleEmpId: number | string;
  scheduleFromDate: string;
  scheduleToDate: string;
  scheduleHasQueried: boolean;

  // Row selection for cancel
  selectedScheduleRows: SelectedScheduleRow[];

  // Cancel modal
  isCancelModalOpen: boolean;
  cancelShiftType: CancelShiftType;

  // Page feedback
  pageStatus: RosterPageStatus;
  pageStatusMessage: string;

  tripType: ShiftTripType;
}

export interface WiseIdOption {
  WiseID: string;
  WiseName: string;
  ValidationName: string;
}
