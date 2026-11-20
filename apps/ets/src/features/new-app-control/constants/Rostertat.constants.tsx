// Rostertat.constants.ts — business constants + Lucide icons
import React from "react";
import {
  Settings2,
  Calendar,
  CalendarX2,
  Zap,
  BellOff,
  Bell,
  Layers,
  CircleX,
  MapPin,
} from "lucide-react";

// ── Lock section configurations ───────────────────────────────────────────────
export const LOCK_CONFIGS = [
  { ltKey: "schUpdateLockTypeFor", fp: "sch" },
  { ltKey: "schCancelLockTypeFor", fp: "schCancel" },
  { ltKey: "adhocLockTypeFor", fp: "adhoc" },
  { ltKey: "adhocCancelLockTypeFor", fp: "adhocCancel" },
] as const;

// ── Section types ─────────────────────────────────────────────────────────────
export type SectionKey =
  | "basic"
  | "sch"
  | "schCancel"
  | "adhoc"
  | "adhocCancel"
  | "notifications"
  | "geofence"
  | "features"
  | "tripCancel";

export type Who = "User" | "Spoc";
export type LockType = 1 | 2 | 3 | 4;

export interface SectionDef {
  key: SectionKey;
  icon: React.ReactNode;
  title: string;
  accent: string;
  // bg kept for backward-compat with chips helper (can be same as accent+'15')
  bg: string;
}

export const SECTIONS: SectionDef[] = [
  {
    key: "basic",
    icon: <Settings2 size={13} />,
    title: "Basic Settings",
    accent: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    key: "sch",
    icon: <Calendar size={13} />,
    title: "Scheduling TAT",
    accent: "#6366f1",
    bg: "#eef2ff",
  },
  {
    key: "schCancel",
    icon: <CalendarX2 size={13} />,
    title: "Schedule Cancellation TAT",
    accent: "#ef4444",
    bg: "#fef2f2",
  },
  {
    key: "adhoc",
    icon: <Zap size={13} />,
    title: "Adhoc TAT",
    accent: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    key: "adhocCancel",
    icon: <BellOff size={13} />,
    title: "Adhoc Cancellation TAT",
    accent: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    key: "notifications",
    icon: <Bell size={13} />,
    title: "Notifications",
    accent: "#0ea5e9",
    bg: "#e0f2fe",
  },
  {
    key: "geofence",
    icon: <MapPin size={13} />,
    title: "Geofence & Routing",
    accent: "#06b6d4",
    bg: "#ecfeff",
  },
  {
    key: "features",
    icon: <Layers size={13} />,
    title: "Other Features",
    accent: "#14b8a6",
    bg: "#f0fdfa",
  },

  {
    key: "tripCancel",
    title: "Trip Cancellation",
    icon: <CircleX size={13} />, // or whichever icon fits
    accent: "#ef4444",
    bg: "#fef2f2",
  },
];

// ── Validation scope options ───────────────────────────────────────────────────
export const SCOPE_OPTIONS = [
  { value: 1, label: "Normal Shift" },
  { value: 2, label: "User Wise" },
  { value: 3, label: "Department Wise" },
  { value: 4, label: "LOB Wise" },
  { value: 5, label: "Process Wise" },
];

// ── Week day options (Sun=1 … Sat=7) ──────────────────────────────────────────
export const WEEK_DAY_OPTIONS = [
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
  { value: 7, label: "Saturday" },
];

export const WEEK_SHORT: Record<number, string> = {
  1: "Sun",
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat",
};

// Legacy – MODE_OPTIONS / MODE_LABEL / MODE_COLOR kept so chip/helper files don't break
export const MODE_OPTIONS = [
  { value: 1, label: "Calendar Days", description: "" },
  { value: 2, label: "Day & Time", description: "" },
  { value: 3, label: "Weekly Deadline", description: "" },
  { value: 4, label: "Minutes Before", description: "" },
] as const;

export const MODE_LABEL: Record<number, string> = {
  1: "Calendar Days",
  2: "Day & Time",
  3: "Weekly",
  4: "Minutes Before",
};

export const SCOPE_LABEL: Record<number, string> = {
  1: "Normal Shift",
  2: "User Wise",
  3: "Dept Wise",
  4: "LOB Wise",
  5: "Process Wise",
};
export const ADHOC_REQUEST_RESET_FREQUENCY_OPTIONS = [
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
];
