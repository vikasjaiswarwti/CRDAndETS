import type { CancelShiftType } from "./Roster.types";

export type RosterType = "LOGIN" | "LOGOUT";

export type WeekDayAbbr = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type WeekDayFull =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface WeekDayOption {
  abbr: WeekDayAbbr;
  full: WeekDayFull;
}

// ─── GET /api/v1/TransRoster/UserDetailsForRoster ─────────────────────────────

export interface UserFilterDataParams {
  LocCode: number;
  EmpId: number;
}

export interface UserRosterLocation {
  loccode: number;
  locname: string;
}

export interface UserRosterTripType {
  EmpTripTypeID: number;
  EmpTripType: "Pickup" | "Drop";
}

export interface ManagedEmployee {
  EMPID: number;
  EmpName: string;
}

export interface UserDetailsResult {
  locations: UserRosterLocation[];
  TripTypes: UserRosterTripType[];
  DrList: ManagedEmployee[];
  LocCode: number;
  EmpId: number;
  Gender: "M" | "F";
  HelpDeskContactNumber: string;
  DriverIVRNumber: string;
  SOSContactNumber: string;
}

export interface UserDetailsApiRow {
  errorCode: number;
  dB_Response: string;
  result: string; // JSON string — must be JSON.parse'd
}

// ─── GET /api/v1/TransRoster/GetUserFilterData ────────────────────────────────

export interface IndividualShift {
  SHIFTID: number;
  SHIFTTIME: string;
  DropShift?: string;
}

export interface UserFilterDataResult {
  PickShifts: IndividualShift[];
  DropShifts: IndividualShift[];
  EmpId: number;
}

// ─── POST /api/v1/TransRoster/UpdateSchedules ─────────────────────────────────

export interface IndividualUpdateSchedulesDto {
  ScheduleUpdateVersion: "APP";
  LocCode: number;
  FromDate: string;
  ToDate: string;
  ShiftStart: string;
  ShiftEnd: string;
  WeekOffs: string;
  User_Empids: string;
}

// ─── GET /api/v1/TransRoster/ViewSchedules ────────────────────────────────────

export interface IndividualViewParams {
  empId: number;
  dateFrom: string;
  dateTo: string;
}

export interface IndividualScheduleEntry {
  id: string;
  empid?: number;
  empCode: string;
  userName: string;
  empName: string;
  locCode: number;
  office: string;
  scheduleDate: string; // "10-May-2026" from API
  weekDays: string;
  pickShift: string;
  dropShift: string;
  weekOff: string;
  tripType: number;
}

// ─── Redux UI state ───────────────────────────────────────────────────────────

export interface IndividualRosterUiState {
  userEmpId: number | null;
  userLocCode: number | null;
  managedEmployees: ManagedEmployee[];
  locations: UserRosterLocation[];

  rosterType: RosterType;
  fromDate: string;
  toDate: string;
  selectedLocCode: number | null;
  selectedShiftId: string;
  selectedWeeklyOffDays: WeekDayAbbr[];
  targetEmpId: number | null;

  viewFromDate: string;
  viewToDate: string;
  hasQueried: boolean;

  isCancelModalOpen: boolean;
  cancellingEntry: IndividualScheduleEntry | null;
  /** Which shift type to cancel — pick/drop/both */
  cancelShiftType: CancelShiftType;
}

export interface UpdateScheduleResult {
  errorCode: 0 | 1;
  dB_Response: string;
}

export interface UpdateScheduleResponse {
  result: UpdateScheduleResult[];
  isSuccess: boolean;
  message: string;
}
