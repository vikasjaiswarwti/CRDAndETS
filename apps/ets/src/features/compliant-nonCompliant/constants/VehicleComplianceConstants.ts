import type {
  ComplianceTab,
  DriverTab,
  ApprovalFilterStatus,
} from "../types/Vehiclecompliance.types";
import { BRAND } from "./tokens";

// ─── Status maps (color keys match AppTable STATUS_COLOR_MAP) ─────────────────
export const COMPLIANCE_STATUS_MAP: Record<
  string,
  { label: string; color: string }
> = {
  "RC Expiring": { label: "RC Expiring", color: "warning" },
  "Insurance Expiring": { label: "Insurance Expiring", color: "warning" },
  "Fitness Expiring": { label: "Fitness Expiring", color: "warning" },
  "PUC Expiring": { label: "PUC Expiring", color: "warning" },
  Active: { label: "Active", color: "success" },
  Inactive: { label: "Inactive", color: "default" },
  Pending: { label: "Pending", color: "processing" },
};

export const APPROVAL_STATUS_MAP: Record<
  ApprovalFilterStatus,
  { label: string; color: string }
> = {
  Pending: { label: "Pending", color: "warning" },
  Reject: { label: "Reject", color: "error" },
  "System Reject": { label: "System Reject", color: "default" },
};

// ─── Vehicle tabs ─────────────────────────────────────────────────────────────
export interface TabConfig {
  key: ComplianceTab;
  label: string;
  dotColor: string;
}
export const COMPLIANCE_TABS: TabConfig[] = [
  {
    key: "active",
    label: "Vehicle Active Compliance Info",
    dotColor: BRAND.primaryMid,
  },
  {
    key: "pending",
    label: "Vehicle Pending Compliance Info",
    dotColor: BRAND.warning,
  },
  {
    key: "inactive",
    label: "Vehicle Inactive Compliance Info",
    dotColor: BRAND.textSecondary,
  },
  {
    key: "reachingNonCompliance",
    label: "Vehicle reaching non-compliance",
    dotColor: BRAND.textSecondary,
  },
  {
    key: "blacklisted",
    label: "Vehicle BlackListed",
    dotColor: BRAND.textSecondary,
  },
];

// ─── Driver tabs ──────────────────────────────────────────────────────────────
export interface DriverTabConfig {
  key: DriverTab;
  label: string;
  dotColor: string;
}
export const DRIVER_TABS: DriverTabConfig[] = [
  { key: "active", label: "Active", dotColor: BRAND.primaryMid },
  { key: "inactive", label: "Inactive", dotColor: BRAND.textSecondary },
  { key: "blacklisted", label: "Blacklisted", dotColor: BRAND.textSecondary },
  { key: "pending", label: "Pending", dotColor: BRAND.warning },
];

export const TAB_COUNT_KEY: Record<ComplianceTab, string> = {
  active: "active",
  pending: "pending",
  inactive: "inactive",
  reachingNonCompliance: "reachingNonCompliance",
  blacklisted: "blacklisted",
};

// ─── Stat cards ───────────────────────────────────────────────────────────────
export interface StatCardConfig {
  key: string;
  label: string;
  iconType:
  | "vehicle"
  | "insurance"
  | "clock"
  | "check"
  | "pause"
  | "permit"
  | "tax"
  | "fitness";
  iconBg: string;
}
export const STAT_CARDS: StatCardConfig[] = [
  {
    key: "totalVehicle",
    label: "Total Vehicle",
    iconType: "vehicle",
    iconBg: BRAND.primaryLight,
  },
  {
    key: "insuranceExpiry",
    label: "Insurance expiry",
    iconType: "insurance",
    iconBg: "#e0e7ff",
  },
  {
    key: "pending",
    label: "Pending",
    iconType: "clock",
    iconBg: BRAND.warningLight,
  },
  {
    key: "active",
    label: "Active",
    iconType: "check",
    iconBg: BRAND.primaryLight,
  },
  { key: "inactive", label: "Inactive", iconType: "pause", iconBg: "#f3f4f6" },
  {
    key: "permitExpiry",
    label: "Permit Expiry",
    iconType: "permit",
    iconBg: "#fce7f3",
  },
  {
    key: "roadTaxExpiry",
    label: "Road tax expiry",
    iconType: "tax",
    iconBg: "#e0f2fe",
  },
  {
    key: "fitnessExpiry",
    label: "Fitness expiry",
    iconType: "fitness",
    iconBg: "#ede9fe",
  },
];

// ─── Permit / Ownership options ───────────────────────────────────────────────
export const PERMIT_TYPE_OPTIONS = [
  { label: "National", value: "national" },
  { label: "State", value: "state" },
  { label: "City", value: "city" },
];

export const VEHICLE_OWNERSHIP_OPTIONS = [
  { label: "Own", value: "own" },
  { label: "Leased", value: "leased" },
  { label: "Rented", value: "rented" },
];

export const FIXED_DEVICE_OPTIONS = [
  { label: "Not Installed", value: "not_installed" },
  { label: "Installed", value: "installed" },
  { label: "Faulty", value: "faulty" },
];

export const OFFICE_OPTIONS = [
  { label: "ASND Delhi", value: "asnd_delhi" },
  { label: "ASND Mumbai", value: "asnd_mumbai" },
  { label: "ASND Bangalore", value: "asnd_bangalore" },
];
