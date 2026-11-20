// // ─────────────────────────────────────────────────────────────────────────────
// // report.types.ts
// // Single source of truth for all types in the Reports feature module.
// // Field names mirror the exact API response shapes.
// // ─────────────────────────────────────────────────────────────────────────────

// // ── Office ───────────────────────────────────────────────────────────────────
// /** Returned by GET /Report/OfficeListReport */
// export interface Office {
//   locCode: number;
//   locName: string;
// }

// // ── My-reports registry ───────────────────────────────────────────────────────
// /** Returned by GET /my-reports */
// export interface MyReport {
//   reportId: string;
//   name: string; // e.g. "TripSummaryReport"
//   displayName: string; // e.g. "Trip Summary Report"
//   link: string; // e.g. "/reports/trip-summary"
//   isActive: boolean;
//   roleIds: string[];
// }

// /** POST / — create a new report definition */
// export interface CreateReportDto {
//   name: string;
//   displayName: string;
//   link: string;
//   roleIds: string[];
// }

// /** PUT /roles — update report role assignment */
// export interface UpdateReportRolesDto {
//   reportId: string;
//   roleIds: string[];
//   displayName: string;
//   isActive: boolean;
// }

// // ── Report execution ──────────────────────────────────────────────────────────
// /** The filter values the user picks in the filter bar */
// export interface ReportFilterState {
//   fromDate: string; // "YYYY-MM-DD"
//   toDate: string; // "YYYY-MM-DD"
// }

// /** What the RTK mutation receives to call any report endpoint */
// export interface FetchReportRequest {
//   endpoint: string;
//   method: "GET" | "POST";
//   body?: Record<string, unknown>;
//   queryParams?: Record<string, unknown>;
// }

// /**
//  * Generic row type — all report APIs return arrays of flat objects.
//  * Columns are derived dynamically from the first row's keys at runtime.
//  */
// export type ReportRow = Record<string, unknown>;

// // ── Redux slice state ────────────────────────────────────────────────────────
// export interface ReportState {
//   selectedReportKey: string | null;
//   selectedOffice: Office | null;
//   filterParams: ReportFilterState;
// }
// ─────────────────────────────────────────────────────────────────────────────
// Report.types.ts
// All shared types for the Reports feature.
// ─────────────────────────────────────────────────────────────────────────────

/** Row from Report/OfficeListReport */
export interface Office {
  locCode: number;
  locName: string;
}

/** Row from my-reports registry */
export interface MyReport {
  name: string;
  isActive: boolean;
  displayName: string;
  id: string;
  link: string;
}

/** Body for createReport mutation — adjust to backend contract */
export interface CreateReportDto {
  name: string;
  displayName: string;
  category: string;
  roleIds: number[];
}

/** Body for updateReportRoles mutation */
export interface UpdateReportRolesDto {
  reportId: number;
  roleIds: number[];
}

/**
 * Argument for the dynamic fetchReport mutation.
 * Built from ReportConfig + user filter inputs.
 */
export interface FetchReportRequest {
  /** Relative URL, no leading slash (e.g. "Report/NoShowReport") */
  endpoint: string;
  method: "GET" | "POST";
  /** POST body — e.g. { LocCode, fromDate, toDate } */
  body?: Record<string, unknown>;
  /** GET query params — e.g. { LocCode: 183 } */
  queryParams?: Record<string, string | number>;
}

/**
 * Report rows have unknown, endpoint-specific shapes.
 * Columns are derived dynamically at runtime (useReportTable).
 */
export type ReportRow = Record<string, unknown>;