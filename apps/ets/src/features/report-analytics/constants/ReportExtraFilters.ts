// ─────────────────────────────────────────────────────────────────────────────
// ReportExtraFilters.ts
//
// Client-only filters that aren't declared in a report's `requestSchema`.
// Use this when the backend can't (or won't) tell the UI about a filter —
// e.g. an Active/Inactive/All toggle — so it has to be defined here instead.
//
// Keyed by report.id (stable GUID from the /my-reports registry).
//
// Each entry renders as a dropdown alongside the schema-driven filters and
// sends `key` either as a query param or in the POST body, per `target` —
// independent of the report's httpMethod. GET reports always send as a
// query param (a GET request can't carry a body), regardless of `target`.
// ─────────────────────────────────────────────────────────────────────────────

export type ExtraFilterTarget = "query" | "body";

export interface ExtraFilterOption {
  label: string;
  value: string | number;
}

export interface ExtraFilterDef {
  /** backend param/body key this filter's value is sent under */
  key: string;
  label: string;
  /** where to place this filter's value when the report is POSTed */
  target: ExtraFilterTarget;
  options: ExtraFilterOption[];
  defaultValue: string | number;
}

export const REPORT_EXTRA_FILTERS: Record<string, ExtraFilterDef[]> = {
  // UserDumpReport (User category) — GET, requestSchema is null.
  // Backend expects `status` as a numeric code: 0 = DeActive, 1 = Active, 2 = Both.
  "a1000007-0000-0000-0000-000000000001": [
    {
      key: "status",
      label: "Status",
      target: "query",
      defaultValue: 1,
      options: [
        { label: "Active", value: 1 },
        { label: "Inactive", value: 0 },
        { label: "All", value: 2 },
      ],
    },
  ],
};
