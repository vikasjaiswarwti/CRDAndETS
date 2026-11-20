export interface RequestField {
  name: string;
  type: string;
  required: boolean;
}

export interface RequestSchema {
  fields: RequestField[];
}

export interface Report {
  id: string;
  name: string;
  displayName: string;
  category: string;
  link: string;
  httpMethod: string;
  requestSchema: RequestSchema | null;
  isActive: boolean;
  roleIds: string[];
}

export interface ReportCategory {
  category: string;
  reports: Report[];
}

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
export interface UpdateReportRolesRequest {
  reportId:    string;
  roleIds:     string[];
  displayName: string | null;
  isActive:    boolean | null;
}
 