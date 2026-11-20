// ─────────────────────────────────────────────────────────────────────────────
// reportConstants.ts
// Non-config constants: default filter values, pagination, column helpers.
// ─────────────────────────────────────────────────────────────────────────────

/** Default date range: last 30 days */
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

export const DEFAULT_PAGE_SIZE = 50 as const;

/** Ant Design Table scroll width — enables horizontal scroll on narrow screens */
export const TABLE_SCROLL_X = 1000;

/**
 * Keys whose values should be rendered as a boolean badge (Yes / No)
 * rather than raw "true"/"false" string.
 */
export const BOOLEAN_COLUMN_KEYWORDS = [
  "isActive",
  "active",
  "status",
  "enabled",
  "assigned",
];

/**
 * Keys whose values look like date-time strings and should be
 * formatted via dayjs inside the dynamic column builder.
 */
export const DATETIME_COLUMN_KEYWORDS = [
  "date",
  "Date",
  "time",
  "Time",
  "At",
  "On",
];

/**
 * Column header display overrides.
 * When the API key exactly matches a key here, use this label instead of
 * the auto-generated Pascal-case split.
 */
export const COLUMN_LABEL_OVERRIDES: Record<string, string> = {
  locCode: "Loc Code",
  LocCode: "Loc Code",
  empId: "Emp ID",
  vehicleNo: "Vehicle No.",
  driverCode: "Driver Code",
  vendorCode: "Vendor Code",
  fromDate: "From",
  toDate: "To",
};
