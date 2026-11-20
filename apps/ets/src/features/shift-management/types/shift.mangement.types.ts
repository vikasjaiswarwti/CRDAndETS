// ─── Entity ────────────────────────────────────────────────────────────────
export interface ShiftSlot {
  id: string;
  shiftId: number;
  locCode: number;
  shiftDesc: string | null;
  shiftTime: string;
  dropDayShift: boolean;
  pickDayShift: boolean;
  peakHour: boolean;
  unsPickAllwd: boolean;
  unsDropAllwd: boolean;
  pickOccupancy: number;
  dropOccupancy: number;
  dropShift: string | null;
  isGuardPick: boolean;
  isGuardDrop: boolean;
  isSafeReachedMale: boolean;
  isSafeReachedFemale: boolean;
  avgSpeed: number;
  createdBy: string;
  createdOn: string;
}

export type ShiftStringKey = "dropShift";

// ─── Bool / Num key unions (used in grid toggle/input handlers) ────────────
export type ShiftBoolKey =
  | "pickDayShift"
  | "dropDayShift"
  | "unsPickAllwd"
  | "unsDropAllwd"
  | "isGuardPick"
  | "isGuardDrop"
  | "isSafeReachedMale"
  | "isSafeReachedFemale"
  | "peakHour";

export type ShiftNumKey = "pickOccupancy" | "dropOccupancy" | "avgSpeed";
// ← dropShift NOT here

// ─── API Payloads ──────────────────────────────────────────────────────────
export interface DefineShiftPayload {
  locCode: number;
  interval: number;
}

export interface UpdateShiftPayload {
  locCode: number;
  shiftDesc: string | null;
  shiftTime: string | null;
  dropDayShift: boolean | null;
  pickDayShift: boolean | null;
  peakHour: boolean | null;
  unsPickAllwd: boolean | null;
  unsDropAllwd: boolean | null;
  pickOccupancy: number | null;
  dropOccupancy: number | null;
  dropShift: string | null;
  isGuardPick: boolean | null;
  isGuardDrop: boolean | null;
  isSafeReachedMale: boolean | null;
  isSafeReachedFemale: boolean | null;
  avgSpeed: number | null;
}

// ─── List Params ───────────────────────────────────────────────────────────
export interface ShiftListParams {
  locCode: number;
  searchTerm?: string;
  sortColumn?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

// ─── Response Shape ────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── UI Options ───────────────────────────────────────────────────────────
export interface OfficeOption {
  label: string;
  value: number;
}

export interface IntervalOption {
  label: string;
  value: number;
}

// Type for a single dropdown item returned by ShiftDropDown
export interface ShiftDropDownItem {
  shiftTime: string;
  shiftId?: number;
  shiftDesc?: string;
}
