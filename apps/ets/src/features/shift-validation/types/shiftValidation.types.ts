// ─── Shift item as returned by API ───────────────────────────────────────────
export interface ShiftItem {
  ControlId: number;
  shiftid: number;
  shifttime: string;
  Active: boolean;
}

// ─── Normal shift API ─────────────────────────────────────────────────────────
export interface GetShiftManagementParams {
  locCode: number;
  shiftDate?: string;
}

export interface ShiftManagementResponse {
  pickupShifts: ShiftItem[];
  dropShifts: ShiftItem[];
}

export interface UpdateShiftManagementParams {
  locCode: number;
  controlIds: string; // comma-separated checked ControlIds
}

// ─── Validation shift API (modes 2–5) ────────────────────────────────────────
export interface GetShiftValidationParams {
  locCode: number;
  tripType: 1 | 2; // 1=pickup, 2=drop
  wiseID: string;
  validateType: 1 | 2 | 3 | 4 | 5;
}

export interface ShiftValidationResponse {
  jsonShiftsPick: string; // JSON string → parse to ShiftItem[]
  jsonShiftsDrop: string; // JSON string → parse to ShiftItem[]
}

export interface UpdateShiftValidationParams {
  locCode: number;
  tripType: 1 | 2;
  wiseID: string;
  validateType: 1 | 2 | 3 | 4 | 5;
  pickShifts: string; // comma-separated shiftids
  dropShifts: string; // comma-separated shiftids
}

// ─── UI state model ───────────────────────────────────────────────────────────
export interface ShiftSlot {
  controlId: number;
  shiftId: number;
  shiftTime: string;
  active: boolean;
}

export type ValidateType = 1 | 2 | 3 | 4 | 5;

export interface ValidationModeConfig {
  validateType: ValidateType;
  label: string;
  wiseIdLabel: string | null; // null = no entity ID needed (normal shift)
  apiEndpoint: "normal" | "validation";
}

export interface DefineShiftParams {
  locCode: number;
  interval: number;
}

export interface CreateShiftIntervalDto {
  intervalMinute: number;
  intervalText: string | null;
  active: boolean;
}

// ─── UI state model ───────────────────────────────────────────────────────────
