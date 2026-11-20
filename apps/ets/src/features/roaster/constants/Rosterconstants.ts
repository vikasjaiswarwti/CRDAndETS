// src/features/roster/constants/Rosterconstants.ts
import type { CancelShiftType, TripType } from "../types/Roster.types";

// ─── Design tokens ────────────────────────────────────────────────────────────

export const COLORS = {
  primaryDark: "#1B4332",
  primaryMid: "#52796F",
  lightBorder: "#B7E4C7",
  lightBg: "#F0FAF4",
  cancelRed: "#C0392B",
  cancelRedBg: "#FEF2F2",
  cancelRedBorder: "#FECACA",
  successBg: "#F0FAF4",
  successBorder: "#B7E4C7",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  border: "#E5E7EB",
  inputBorder: "#D1D5DB",
  textMuted: "#6B7280",
  textBody: "#374151",
  white: "#fff",
} as const;

// ─── Week days ────────────────────────────────────────────────────────────────

export const WEEKLY_OFF_OPTIONS = [
  { value: "SUN", label: "Sunday" },
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
  { value: "SAT", label: "Saturday" },
] as const;

// ─── Cancel shift options ─────────────────────────────────────────────────────
// tripType mapping: PICK=1, DROP=2, BOTH=0

export const CANCEL_SHIFT_OPTIONS: {
  value: CancelShiftType;
  label: string;
  tripType: TripType;
}[] = [
  { value: "PICK", label: "Cancel Login Shift", tripType: 1 },
  { value: "DROP", label: "Cancel Logout Shift", tripType: 2 },
  { value: "BOTH", label: "Cancel Both Shifts", tripType: 0 },
];

export const CANCEL_SHIFT_TRIP_TYPE: Record<CancelShiftType, TripType> = {
  PICK: 1,
  DROP: 2,
  BOTH: 0,
};

// ─── All-employees sentinel ───────────────────────────────────────────────────

export const ALL_EMPLOYEES_EMP_ID = 0; // used in ViewScheduleWeb when no specific employee
