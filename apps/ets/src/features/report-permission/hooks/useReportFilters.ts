import { useState, useMemo } from "react";
import type { Report } from "../types/reports.types";

// ── Schema introspection helpers ──────────────────────────────────────────────

export const fieldExists = (report: Report, name: string): boolean =>
  report.requestSchema?.fields.some(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  ) ?? false;

export const getFieldName = (report: Report, name: string): string =>
  report.requestSchema?.fields.find(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  )?.name ?? name;

export const isRequired = (report: Report, name: string): boolean =>
  report.requestSchema?.fields.find(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  )?.required ?? false;

// ── Filter state shape ────────────────────────────────────────────────────────

export interface ReportFilterState {
  selectedLocCode: number | null;
  fromDate: string;
  toDate: string;
  tripType: number | null;
  shiftId: number | null;
}

export interface ReportFilterFlags {
  showOffice: boolean;
  showDates: boolean;
  showTrip: boolean;
  showShift: boolean;
  hasAnyFilter: boolean;
  locKey: string;
}

export interface UseReportFiltersReturn {
  filters: ReportFilterState;
  flags: ReportFilterFlags;
  canGenerate: boolean;
  isDirty: boolean;
  setSelectedLocCode: (val: number | null) => void;
  setDateRange: (from: string, to: string) => void;
  setTripType: (val: number | null) => void;
  setShiftId: (val: number | null) => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useReportFilters(report: Report): UseReportFiltersReturn {
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tripType, setTripType] = useState<number | null>(null);
  const [shiftId, setShiftId] = useState<number | null>(null);

  // ── Schema-derived flags ──────────────────────────────────────────────────
  const flags = useMemo<ReportFilterFlags>(() => {
    const showOffice = fieldExists(report, "loccode");
    const showDates =
      fieldExists(report, "fromdate") && fieldExists(report, "todate");
    const showTrip = fieldExists(report, "triptype");
    const showShift = fieldExists(report, "shiftid");

    return {
      showOffice,
      showDates,
      showTrip,
      showShift,
      hasAnyFilter: showOffice || showDates || showTrip || showShift,
      locKey: getFieldName(report, "loccode"),
    };
  }, [report]);

  // ── Validation ────────────────────────────────────────────────────────────
  const canGenerate = useMemo(() => {
    const { showOffice, showDates, showTrip, showShift } = flags;
    if (showOffice && isRequired(report, "loccode") && selectedLocCode === null)
      return false;
    if (showDates && isRequired(report, "fromdate") && !fromDate) return false;
    if (showDates && isRequired(report, "todate") && !toDate) return false;
    if (showTrip && isRequired(report, "triptype") && tripType === null)
      return false;
    if (showShift && isRequired(report, "shiftid") && shiftId === null)
      return false;
    return true;
  }, [flags, report, selectedLocCode, fromDate, toDate, tripType, shiftId]);

  const isDirty =
    selectedLocCode !== null ||
    !!fromDate ||
    !!toDate ||
    tripType !== null ||
    shiftId !== null;

  const setDateRange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  const reset = () => {
    setSelectedLocCode(null);
    setFromDate("");
    setToDate("");
    setTripType(null);
    setShiftId(null);
  };

  return {
    filters: { selectedLocCode, fromDate, toDate, tripType, shiftId },
    flags,
    canGenerate,
    isDirty,
    setSelectedLocCode,
    setDateRange,
    setTripType,
    setShiftId,
    reset,
  };
}