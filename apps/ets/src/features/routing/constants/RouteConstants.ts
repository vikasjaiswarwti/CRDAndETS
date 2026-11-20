// src/features/routeManagement/constants/RouteConstants.ts

import type {
  OfficeOption,
  ShiftTypeOption,
  RouteManagementFilterState,
  RouteManagementPermissions,
} from "../types/RouteTypes";
import dayjs from "dayjs";

// ─── Filter Constants ──────────────────────────────────────────────────────────
export const OFFICE_OPTIONS: OfficeOption[] = [
  { value: 183, label: "Western Union, Pune" },
  { value: 185, label: "Infosys, Hyderabad" },
  { value: 186, label: "TCS, Mumbai" },
];

export const SHIFT_TYPE_OPTIONS: ShiftTypeOption[] = [
  { value: 0, label: "All" },
  { value: 1, label: "Login" },
  { value: 2, label: "Logout" },
];

// ─── Default Filters ───────────────────────────────────────────────────────────
export const DEFAULT_FILTERS: RouteManagementFilterState = {
  officeId: "", // empty = no office selected
  date: dayjs().format("YYYY-MM-DD"), // today
  shiftType: 0, // 0 = All (both pickup + drop)
};

// ─── Default Permissions ───────────────────────────────────────────────────────
// This is the "full access" config used for admin/manager roles.
// For restricted roles, override specific keys in useRoutePermissions hook.
//
// HOW TO ADD ROLE-BASED ACCESS:
//   1. Create src/features/routeManagement/hooks/useRoutePermissions.ts
//   2. Read user role from auth store
//   3. Return a partial override merged with FULL_ACCESS_PERMISSIONS
//   4. Pass permissions into RouteManagementTables — no component changes needed.

export const FULL_ACCESS_PERMISSIONS: RouteManagementPermissions = {
  canGenerateRoutes: true,
  canCopyRoutes: true,
  canDeleteRoutes: true,
  canDownloadRouteData: true,
  canUploadVehicleFile: true,
  canUpdateTripsheets: true,
  canViewEmployeeDetails: true,
  canViewSmsStatus: true,
  canDownloadReports: true,
  canSelectRows: true,
  canSendSms: true,
  canClickEmployeeCount: true,
};

export const READ_ONLY_PERMISSIONS: RouteManagementPermissions = {
  canGenerateRoutes: false,
  canCopyRoutes: false,
  canDeleteRoutes: false,
  canDownloadRouteData: true,
  canUploadVehicleFile: false,
  canUpdateTripsheets: false,
  canViewEmployeeDetails: true,
  canViewSmsStatus: true,
  canDownloadReports: true,
  canSelectRows: false,
  canSendSms: true,
  canClickEmployeeCount: true,
};

// ─── Action Dropdown Options ───────────────────────────────────────────────────
// These are the raw option definitions.
// Filtering by permissions happens in the component using RouteManagementPermissions.

export type RoutePlanningActionKey =
  | "GENERATE_ROUTES"
  | "COPY_ROUTES"
  | "DELETE_ROUTES"
  | "DOWNLOAD_ROUTE_DATA"
  | "UPLOAD_VEHICLE_FILE"
  | "ASSIGN_PHYSICAL_ID";

export type TripPublishingActionKey =
  | "UPDATE_TRIPSHEETS"
  | "UPLOAD_VEHICLE_FILE"
  | "EMPLOYEE_DETAILS";

export interface ActionOption<K extends string> {
  value: K;
  label: string;
  /** Which permission key gates this action */
  permissionKey: keyof RouteManagementPermissions;
}

export const ROUTE_PLANNING_ACTIONS: ActionOption<RoutePlanningActionKey>[] = [
  {
    value: "GENERATE_ROUTES",
    label: "Generate Route",
    permissionKey: "canGenerateRoutes",
  },
  {
    value: "COPY_ROUTES",
    label: "Copy Routes",
    permissionKey: "canCopyRoutes",
  },
  {
    value: "DELETE_ROUTES",
    label: "Delete Routes",
    permissionKey: "canDeleteRoutes",
  },
  {
    value: "DOWNLOAD_ROUTE_DATA",
    label: "Download Route Data",
    permissionKey: "canDownloadRouteData",
  },
  {
    value: "UPLOAD_VEHICLE_FILE",
    label: "Upload Vehicle File",
    permissionKey: "canUploadVehicleFile",
  },
];

export const TRIP_PUBLISHING_ACTIONS: ActionOption<TripPublishingActionKey>[] =
  [
    {
      value: "UPDATE_TRIPSHEETS",
      label: "Update Trip Sheet",
      permissionKey: "canUpdateTripsheets",
    },
    {
      value: "UPLOAD_VEHICLE_FILE",
      label: "Upload Vehicle File",
      permissionKey: "canUploadVehicleFile",
    },
    {
      value: "EMPLOYEE_DETAILS",
      label: "Employee Details",
      permissionKey: "canViewEmployeeDetails",
    },
  ];

// ─── Occupancy Thresholds ──────────────────────────────────────────────────────
export const OCCUPANCY_THRESHOLDS = {
  danger: { max: 40 },
  warning: { max: 70 },
  success: { max: 100 },
} as const;

// ─── Design Tokens ─────────────────────────────────────────────────────────────
export const STAT_CARD_THEMES = {
  green: { bg: "bg-emerald-50", icon: "text-emerald-700" },
  orange: { bg: "bg-amber-50", icon: "text-amber-600" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600" },
  purple: { bg: "bg-violet-50", icon: "text-violet-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600" },
} as const;

export type StatCardTheme = keyof typeof STAT_CARD_THEMES;
