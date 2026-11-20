// ─── Office mock options (replace with API lookup when available) ──────────
export const MOCK_OFFICES = [
  { label: "D_21 Corporate Park", value: 1 },
  { label: "ABC BLR2", value: 2 },
  { label: "Chennai", value: 3 },
  { label: "ASND", value: 4 },
  { label: "Pune", value: 5 },
] as const;

// ─── Interval options ─────────────────────────────────────────────────────
export const INTERVAL_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
] as const;

// ─── Legend items ──────────────────────────────────────────────────────────
export const LEGEND_ITEMS = [
  { color: "#C0DD97", label: "Day Pick" },
  { color: "#9FE1CB", label: "Day Drop" },
  { color: "#FAC775", label: "Peak Hour" },
  { color: "#CECBF6", label: "Adhoc Pick" },
  { color: "#D4B8E0", label: "Adhoc Drop" },
  { color: "#F5C4B3", label: "Guard Pick" },
  { color: "#FBD9C8", label: "Guard Drop" },
  { color: "#B5D4F4", label: "Safe Reach Male" },
  { color: "#C5E3F8", label: "Safe Reach Female" },
  { color: "#D3D1C7", label: "Drop Shift" },
] as const;

import type {
  ShiftBoolKey,
  ShiftNumKey,
  ShiftStringKey,
} from "../types/shift.mangement.types";

export const SHIFT_BOOL_COLUMNS: {
  key: ShiftBoolKey;
  group: string;
  label: string;
  subLabel: string;
  color: string;
}[] = [
  {
    key: "pickDayShift",
    group: "dayShift",
    label: "Day Shift",
    subLabel: "Pick",
    color: "#1B4332",
  },
  {
    key: "dropDayShift",
    group: "dayShift",
    label: "Day Shift",
    subLabel: "Drop",
    color: "#1B4332",
  },
  {
    key: "unsPickAllwd",
    group: "adhoc",
    label: "Adhoc Allowed",
    subLabel: "Pick",
    color: "#2D6A4F",
  },
  {
    key: "unsDropAllwd",
    group: "adhoc",
    label: "Adhoc Allowed",
    subLabel: "Drop",
    color: "#2D6A4F",
  },
  {
    key: "isGuardPick",
    group: "guard",
    label: "Is Guard",
    subLabel: "Pick",
    color: "#40916C",
  },
  {
    key: "isGuardDrop",
    group: "guard",
    label: "Is Guard",
    subLabel: "Drop",
    color: "#40916C",
  },
  {
    key: "isSafeReachedMale",
    group: "safeReach",
    label: "Is Safe Reach",
    subLabel: "Pick",
    color: "#52B788",
  },
  {
    key: "isSafeReachedFemale",
    group: "safeReach",
    label: "Is Safe Reach",
    subLabel: "Drop",
    color: "#52B788",
  },
];

// peakHour — standalone, sits between num cols and string cols
export const SHIFT_STANDALONE_BOOL_COLUMNS: {
  key: ShiftBoolKey;
  label: string;
  color: string;
}[] = [{ key: "peakHour", label: "Peak Hour", color: "#1B4332" }];

// cab occupancy only
export const SHIFT_NUM_COLUMNS: {
  key: ShiftNumKey;
  label: string;
  suffix: string;
  group: string;
}[] = [
  { key: "pickOccupancy", label: "Pick", suffix: "", group: "cabOccupancy" },
  { key: "dropOccupancy", label: "Drop", suffix: "", group: "cabOccupancy" },
];

// avgSpeed — standalone last num col
export const SHIFT_STANDALONE_NUM_COLUMNS: {
  key: ShiftNumKey;
  label: string;
  suffix: string;
}[] = [{ key: "avgSpeed", label: "Avg. Speed", suffix: "" }];

// dropShift — string col
export const SHIFT_STRING_COLUMNS: {
  key: ShiftStringKey;
  label: string;
}[] = [{ key: "dropShift", label: "Drop Shift" }];
