import { useMemo } from "react";
import React from "react";
import dayjs from "dayjs";
import type { ColumnType } from "antd/es/table";
import type { ReportRow } from "../types/Report.types";
import {
  BOOLEAN_COLUMN_KEYWORDS,
  DATETIME_COLUMN_KEYWORDS,
  COLUMN_LABEL_OVERRIDES,
  TABLE_SCROLL_X,
} from "../constants/Reportconstants";

const DATE_DISPLAY_FORMAT = "DD-MMM-YYYY HH:mm";
const MIN_COL_WIDTH = 180;
const CHAR_WIDTH = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────
const toTitleCase = (key: string): string =>
  COLUMN_LABEL_OVERRIDES[key] ??
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) =>
      word === word.toUpperCase()
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");

const matchesKeyword = (key: string, keywords: string[]): boolean => {
  const lower = key.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
};

const isIsoDateString = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}/.test(v) &&
  dayjs(v).isValid();

const isBooleanColumn = (key: string, sample: unknown): boolean =>
  typeof sample === "boolean" ||
  (matchesKeyword(key, BOOLEAN_COLUMN_KEYWORDS) &&
    (sample === "true" || sample === "false" || typeof sample === "boolean"));

const isDateColumn = (key: string, sample: unknown): boolean =>
  matchesKeyword(key, DATETIME_COLUMN_KEYWORDS) && isIsoDateString(sample);

/** First non-null value for a key — used as the type sample */
const firstNonNull = (rows: ReportRow[], key: string): unknown => {
  for (const row of rows) {
    const v = row[key];
    if (v !== null && v !== undefined && v !== "") return v;
  }
  return undefined;
};

// ── Cell renderers ────────────────────────────────────────────────────────────

const renderBoolean = (v: unknown): React.ReactNode => {
  if (v === null || v === undefined || v === "") return "—";
  const truthy = v === true || v === "true" || v === 1;
  return React.createElement(
    "span",
    {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: "1px 8px",
        borderRadius: 99,
        background: truthy ? "#ECFDF5" : "#FEF2F2",
        color: truthy ? "#059669" : "#EF4444",
      },
    },
    truthy ? "Yes" : "No",
  );
};

const renderDate = (v: unknown): React.ReactNode => {
  if (v === null || v === undefined || v === "") return "—";
  const d = dayjs(v as string);
  return d.isValid() ? d.format(DATE_DISPLAY_FORMAT) : String(v);
};

const renderDefault = (v: unknown): React.ReactNode =>
  v === null || v === undefined || v === "" ? "—" : String(v);

// ── Null-safe sorters ─────────────────────────────────────────────────────────

const compareNullSafe = (
  a: unknown,
  b: unknown,
  cmp: (x: unknown, y: unknown) => number,
): number => {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return -1;
  if (bEmpty) return 1;
  return cmp(a, b);
};

const numberCmp = (a: unknown, b: unknown) => Number(a) - Number(b);
const dateCmp = (a: unknown, b: unknown) =>
  dayjs(a as string).valueOf() - dayjs(b as string).valueOf();
const stringCmp = (a: unknown, b: unknown) =>
  String(a).localeCompare(String(b));

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseReportTableResult {
  columns: ColumnType<ReportRow>[];
  scrollX: number;
}

export function useReportTable(
  data: ReportRow[] | undefined,
): UseReportTableResult {
  return useMemo<UseReportTableResult>(() => {
    if (!data || data.length === 0) {
      return { columns: [], scrollX: TABLE_SCROLL_X };
    }

    // Union of keys across the first few rows (rows can be sparse)
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const row of data.slice(0, 20)) {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
    }

    const columns: ColumnType<ReportRow>[] = keys.map((key) => {
      const sample = firstNonNull(data, key);
      const title = toTitleCase(key);
      const width = Math.max(MIN_COL_WIDTH, title.length * CHAR_WIDTH + 40);

      if (isBooleanColumn(key, sample)) {
        return {
          title,
          dataIndex: key,
          key,
          width,
          render: renderBoolean,
          sorter: (a, b) =>
            compareNullSafe(a[key], b[key], (x, y) =>
              Number(x === true || x === "true") -
              Number(y === true || y === "true"),
            ),
        };
      }

      if (isDateColumn(key, sample)) {
        return {
          title,
          dataIndex: key,
          key,
          width: Math.max(width, 160),
          render: renderDate,
          sorter: (a, b) => compareNullSafe(a[key], b[key], dateCmp),
        };
      }

      if (typeof sample === "number") {
        return {
          title,
          dataIndex: key,
          key,
          width,
          align: "right" as const,
          render: renderDefault,
          sorter: (a, b) => compareNullSafe(a[key], b[key], numberCmp),
        };
      }

      return {
        title,
        dataIndex: key,
        key,
        width,
        ellipsis: true,
        render: renderDefault,
        sorter: (a, b) => compareNullSafe(a[key], b[key], stringCmp),
      };
    });

    const totalWidth = columns.reduce(
      (sum, c) => sum + ((c.width as number) ?? MIN_COL_WIDTH),
      0,
    );

    return { columns, scrollX: Math.max(TABLE_SCROLL_X, totalWidth) };
  }, [data]);
}

export default useReportTable;