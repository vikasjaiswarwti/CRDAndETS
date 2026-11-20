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
export interface ShiftOption { ShiftId: number; ShiftTime: string; }
export interface UserOption { value: number; label: string; }
// ----------------------------
export interface ApiRequestField {
  name: string;
  type: string;
  required: boolean;
}

export interface RequestSchema {
  fields: ApiRequestField[];
}

export interface CreateApiPayload {
  name: string;
  displayName: string;
  category: string;
  link: string;
  httpMethod: string;
  requestSchema: RequestSchema;
  roleIds: string[];
}