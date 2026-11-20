// ─────────────────────────────────────────────────────────────────────────────
// useReportExport.ts
//
// Exports report data to an Excel (.xlsx) file using SheetJS (xlsx).
//
// Filename pattern:
//   <DisplayName>[ — <OfficeName>][ — <FromDate> to <ToDate>].xlsx
//
// Examples:
//   "Trip Summary Report.xlsx"
//   "Trip Summary Report — Andheri East.xlsx"
//   "Trip Summary Report — Andheri East — 2025-06-01 to 2025-06-30.xlsx"
//   "Trip Summary Report — 2025-06-01 to 2025-06-30.xlsx"
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from "react";
import * as XLSX from "xlsx";

export interface ExportOptions {
  /** Report display name — becomes the base filename */
  displayName: string;
  /** Currently selected office label (full label string from locationOptions) */
  officeLabel?: string | null;
  /** From date string "YYYY-MM-DD" */
  fromDate?: string;
  /** To date string "YYYY-MM-DD" */
  toDate?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strips characters that are illegal in filenames across OS */
const sanitize = (str: string): string =>
  str.replace(/[/\\?%*:|"<>]/g, "-").trim();

/**
 * Builds the filename from selected filter context.
 *
 * Parts are joined with " — " (em dash) for readability.
 * The office label from locationOptions is typically "Office Name — LOC 12",
 * so we take everything before " — LOC" to keep the name clean.
 */
function buildFilename(opts: ExportOptions): string {
  const parts: string[] = [sanitize(opts.displayName)];

  if (opts.officeLabel) {
    // Strip the " — LOC <n>" suffix that locationOptions appends
    const officeName = opts.officeLabel
      .replace(/\s*[—–-]+\s*LOC\s*\d+$/i, "")
      .trim();
    if (officeName) parts.push(sanitize(officeName));
  }

  if (opts.fromDate && opts.toDate) {
    parts.push(`${opts.fromDate} to ${opts.toDate}`);
  }

  return `${parts.join(" — ")}.xlsx`;
}

/**
 * Converts camelCase / snake_case keys to Title Case column headers.
 * Mirrors the toTitleCase logic already in useReportTable.
 */
function toTitleCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UseReportExportReturn {
  /**
   * Call with the current API data and filter context.
   * Triggers an immediate browser download.
   */
  exportToExcel: (
    data: Record<string, unknown>[],
    opts: ExportOptions,
  ) => void;
}

export function useReportExport(): UseReportExportReturn {
  const exportToExcel = useCallback(
    (data: Record<string, unknown>[], opts: ExportOptions) => {
      if (!data || data.length === 0) return;

      // ── 1. Collect ordered column keys from the first 20 rows (sparse-safe)
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

      // ── 2. Build array-of-arrays: header row + data rows
      const header = keys.map(toTitleCase);

      const rows = data.map((row) =>
        keys.map((k) => {
          const v = row[k];
          // Keep null/undefined as empty string for clean cells
          if (v === null || v === undefined) return "";
          return v;
        }),
      );

      const sheetData = [header, ...rows];

      // ── 3. Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // ── 4. Auto column widths based on content
      const colWidths = keys.map((k, i) => {
        const headerLen = header[i].length;
        const maxDataLen = data.reduce((max, row) => {
          const val = row[k];
          const len = val !== null && val !== undefined ? String(val).length : 0;
          return Math.max(max, len);
        }, 0);
        // Cap at 60 chars, minimum 10
        return { wch: Math.min(60, Math.max(10, headerLen, maxDataLen)) };
      });
      ws["!cols"] = colWidths;

      // ── 5. Freeze the header row
      ws["!freeze"] = { xSplit: 0, ySplit: 1 };

      // ── 6. Append sheet and trigger download
      const sheetName = sanitize(opts.displayName).slice(0, 31); // Excel tab limit
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const filename = buildFilename(opts);
      XLSX.writeFile(wb, filename);
    },
    [],
  );

  return { exportToExcel };
}