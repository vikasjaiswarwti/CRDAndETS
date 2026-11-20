// ─────────────────────────────────────────────────────────────────────────────
// reportConfig.ts
//
// The single config map for every report endpoint.
// Business rules (which params a report needs) live here — never in components.
//
// paramType drives which filter controls the UI shows:
//   'none'             → no filter needed  (GET, no params)
//   'locCodeOnly'      → office selector only  (GET ?LocCode=)
//   'locCodeWithDates' → office + date range  (POST { LocCode, fromDate, toDate })
//
// locCodeKey handles the inconsistency in the API:
//   TripDumpReport uses lowercase "locCode";
//   all Report/* endpoints use uppercase "LocCode".
// ─────────────────────────────────────────────────────────────────────────────

export type ReportParamType = "none" | "locCodeOnly" | "locCodeWithDates";
export type ReportHttpMethod = "GET" | "POST";

export const REPORT_CATEGORY = {
  TRIP: "Trip Reports",
  COMPLIANCE: "Compliance",
  OPERATIONS: "Operations",
  MASTER: "Master Data",
} as const;

export type ReportCategory =
  (typeof REPORT_CATEGORY)[keyof typeof REPORT_CATEGORY];

/** Badge variant maps 1-to-1 with Tailwind classes in ReportSidebar */
export const CATEGORY_BADGE_CLASS: Record<ReportCategory, string> = {
  [REPORT_CATEGORY.TRIP]: "rpt-category-badge--trip",
  [REPORT_CATEGORY.COMPLIANCE]: "rpt-category-badge--comp",
  [REPORT_CATEGORY.OPERATIONS]: "rpt-category-badge--ops",
  [REPORT_CATEGORY.MASTER]: "rpt-category-badge--master",
};

export interface ReportConfig {
  key: string; // unique identifier, matches API "name" field
  displayName: string; // human-readable label in sidebar + content header
  endpoint: string; // relative URL path (no leading slash)
  method: ReportHttpMethod;
  paramType: ReportParamType;
  locCodeKey: "locCode" | "LocCode"; // body field name for POST requests
  category: ReportCategory;
}

/** Ordered list — sidebar renders them in this order, grouped by category */
export const REPORT_CONFIGS: ReportConfig[] = [
  // ── Trip Reports ──────────────────────────────────────────────────────────
  {
    key: "TripDumpReport",
    displayName: "Trip Dump",
    endpoint: "TripDumpReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "locCode",
    category: REPORT_CATEGORY.TRIP,
  },
  {
    key: "TripCancelationReport",
    displayName: "Trip Cancellation",
    endpoint: "Report/TripCancelationReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.TRIP,
  },
  {
    key: "NoShowReport",
    displayName: "No Show",
    endpoint: "Report/NoShowReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.TRIP,
  },
  {
    key: "OnTimeArrivalSummaryReport",
    displayName: "OTA Summary",
    endpoint: "Report/OnTimeArrivalSummaryReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.TRIP,
  },
  {
    key: "OnTimeArrivalTripDetailsReport",
    displayName: "OTA Trip Details",
    endpoint: "Report/OnTimeArrivalTripDetailsReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.TRIP,
  },
  {
    key: "OnTimeArrivalReport",
    displayName: "On Time Arrival",
    endpoint: "Report/OnTimeArrivalReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.TRIP,
  },

  // ── Compliance ────────────────────────────────────────────────────────────
  {
    key: "VehicleComplianceExpiryReport",
    displayName: "Vehicle Compliance Expiry",
    endpoint: "Report/VehicleComplianceExpiryReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.COMPLIANCE,
  },
  {
    key: "DriverComplianceExpiryReport",
    displayName: "Driver Compliance Expiry",
    endpoint: "Report/DriverComplianceExpiryReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.COMPLIANCE,
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    key: "AdhocRequestReport",
    displayName: "Adhoc Request",
    endpoint: "Report/AdhocRequestReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "ScheduleDataDumpReport",
    displayName: "Schedule Data Dump",
    endpoint: "Report/ScheduleDataDumpReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "ScheduleRouteVarianceReport",
    displayName: "Schedule Route Variance",
    endpoint: "Report/ScheduleRouteVarianceReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "TransTripListHeaderReport",
    displayName: "Trip List Header",
    endpoint: "Report/TransTripListHeaderReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "OccupancyReport",
    displayName: "Occupancy",
    endpoint: "Report/OccupancyReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "FeedbackReport",
    displayName: "Feedback",
    endpoint: "Report/FeedbackReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "ComplaintReport",
    displayName: "Complaint",
    endpoint: "Report/ComplaintReport",
    method: "POST",
    paramType: "locCodeWithDates",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },
  {
    key: "TransSOSAlertsReport",
    displayName: "SOS Alerts",
    endpoint: "Report/TransSOSAlertsReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.OPERATIONS,
  },

  // ── Master Data ───────────────────────────────────────────────────────────
  {
    key: "VehicleDumpReport",
    displayName: "Vehicle Dump",
    endpoint: "Report/VehicleDumpReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.MASTER,
  },
  {
    key: "VendorDumpReport",
    displayName: "Vendor Dump",
    endpoint: "Report/VendorDumpReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.MASTER,
  },
  {
    key: "DriverDumpReport",
    displayName: "Driver Dump",
    endpoint: "Report/DriverDumpReport",
    method: "GET",
    paramType: "locCodeOnly",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.MASTER,
  },
  {
    key: "UserDumpReport",
    displayName: "User Dump",
    endpoint: "Report/UserDumpReport",
    method: "GET",
    paramType: "none",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.MASTER,
  },
  {
    key: "AppRegistrationsStatusReport",
    displayName: "App Registrations",
    endpoint: "Report/AppRegistrationsStatusReport",
    method: "GET",
    paramType: "none",
    locCodeKey: "LocCode",
    category: REPORT_CATEGORY.MASTER,
  },
];

/** Fast O(1) lookup by key */
export const REPORT_CONFIG_MAP: Record<string, ReportConfig> =
  Object.fromEntries(REPORT_CONFIGS.map((r) => [r.key, r]));

/** Reports grouped by category in sidebar order */
export const GROUPED_REPORTS: Record<ReportCategory, ReportConfig[]> = {
  [REPORT_CATEGORY.TRIP]: REPORT_CONFIGS.filter(
    (r) => r.category === REPORT_CATEGORY.TRIP,
  ),
  [REPORT_CATEGORY.COMPLIANCE]: REPORT_CONFIGS.filter(
    (r) => r.category === REPORT_CATEGORY.COMPLIANCE,
  ),
  [REPORT_CATEGORY.OPERATIONS]: REPORT_CONFIGS.filter(
    (r) => r.category === REPORT_CATEGORY.OPERATIONS,
  ),
  [REPORT_CATEGORY.MASTER]: REPORT_CONFIGS.filter(
    (r) => r.category === REPORT_CATEGORY.MASTER,
  ),
};

/** Ordered category list for sidebar rendering */
export const CATEGORY_ORDER: ReportCategory[] = [
  REPORT_CATEGORY.TRIP,
  REPORT_CATEGORY.COMPLIANCE,
  REPORT_CATEGORY.OPERATIONS,
  REPORT_CATEGORY.MASTER,
];
