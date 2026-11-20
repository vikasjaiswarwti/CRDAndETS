import { useNavigate } from "react-router-dom";
import { useReportExport } from "../hooks/useReportExport";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useLookups } from "../../lookups";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Report } from "../types/reports.types";
import useReportTable from "../hooks/useReportTable";
import { useFetchReportMutation } from "../services/ReportApi";
import { normalizeError } from "../../../shared/utils/normalize-error";
import dayjs, { Dayjs } from "dayjs";
import { CATEGORY_COLORS } from "./Reportcard";
import { C } from "../pages/ReportPage";
import CategoryIcon from "./CategoryIcon";
import FilterField from "./FilterField";
import { useGetMyOfficeShiftQuery, useGetUserListDDLQuery } from "../services/ReportApi";
import { TRIP_TYPE_OPTIONS } from "../constants/Reportoption";
import { REPORT_EXTRA_FILTERS } from "../constants/ReportExtraFilters";

interface ReportDetailViewProps {
  report: Report;
  category: string;
}

// ── Employee search debounce ──────────────────────────────────────────────────
// 3+ characters is a strong enough signal to search quickly; 1-2 characters
// waits longer so we don't fire a request on every keystroke of a short query.
const EMP_SEARCH_MIN_CHARS_FAST = 3;
const EMP_SEARCH_FAST_DEBOUNCE_MS = 300;
const EMP_SEARCH_SLOW_DEBOUNCE_MS = 2000;
// ── Schema introspection helpers ──────────────────────────────────────────────
const fieldExists = (report: Report, name: string) =>
  report.requestSchema?.fields.some(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  ) ?? false;

const getFieldName = (report: Report, name: string): string =>
  report.requestSchema?.fields.find(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  )?.name ?? name;

const isRequired = (report: Report, name: string): boolean =>
  report.requestSchema?.fields.find(
    (f) => f.name.toLowerCase() === name.toLowerCase(),
  )?.required ?? false;

const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  report,
  category,
}) => {
  const navigate = useNavigate();
  const { exportToExcel } = useReportExport();
  const { Select, DatePicker, Button, Table, Empty, Tooltip } = useUILibrary();
  const { RangePicker } = DatePicker as any;
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });

  // ── Filter state ────────────────────────────────────────────────────────────
  const [selectedLocCode, setSelectedLocCode] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tripType, setTripType] = useState<number | null>(null);
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [empId, setEmpId] = useState<number | null>(null);
  const [selectedEmpLabel, setSelectedEmpLabel] = useState<string | null>(null);
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const empSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Schema flags ────────────────────────────────────────────────────────────
  const showOffice = fieldExists(report, "loccode");
  const showDates =
    fieldExists(report, "fromdate") && fieldExists(report, "todate");
  const showTrip = fieldExists(report, "triptype");
  const showShift = fieldExists(report, "shiftid");
  const showEmp = fieldExists(report, "empid");
  const locKey = getFieldName(report, "loccode");

  // ── Client-defined extra filters (not in requestSchema) ────────────────────
  const extraFilterDefs = useMemo(
    () => REPORT_EXTRA_FILTERS[report.id] ?? [],
    [report.id],
  );
  const [extraFilterValues, setExtraFilterValues] = useState<
    Record<string, string | number>
  >({});
  useEffect(() => {
    setExtraFilterValues(
      Object.fromEntries(extraFilterDefs.map((f) => [f.key, f.defaultValue])),
    );
  }, [extraFilterDefs]);

  const hasAnyFilter =
    showOffice || showDates || showTrip || showShift || showEmp || extraFilterDefs.length > 0;
  // --------------------- api call for the shift when location selected
  const { data: shiftData, isLoading: isShiftLoading } =
    useGetMyOfficeShiftQuery(
      { locCode: selectedLocCode, tripType, tripdate: fromDate },
      {
        skip:
          selectedLocCode === null ||
          tripType === null ||
          fromDate === null ||
          !showShift,
      },
    );
  console.log(shiftData, "shiftData");
  // Pick the right list based on tripType
  const shiftOptions: { label: string; value: string | number }[] =
    useMemo(() => {
      if (!shiftData) return [];
      // default to pick
      return shiftData.map((s) => ({
        label: s.ShiftTime,
        value: s.ShiftId,
      }));
    }, [shiftData]);

  // --------------------- api call for employee search (debounced)
  const { data: empData, isFetching: isEmpLoading } = useGetUserListDDLQuery(
    { locCode: 0, name: empSearchTerm },
    { skip: !showEmp || empSearchTerm.trim().length === 0 },
  );

  // Keep the currently-selected employee visible even after the search
  // term changes and the fetched list no longer contains them.
  const employeeOptions: { label: string; value: number }[] = useMemo(() => {
    const base = empData ?? [];
    if (empId !== null && selectedEmpLabel && !base.some((o) => o.value === empId)) {
      return [{ value: empId, label: selectedEmpLabel }, ...base];
    }
    return base;
  }, [empData, empId, selectedEmpLabel]);

  const handleEmpSearch = useCallback((value: string) => {
    if (empSearchTimeoutRef.current) clearTimeout(empSearchTimeoutRef.current);

    const trimmed = value.trim();
    if (!trimmed) {
      setEmpSearchTerm("");
      return;
    }

    const delay =
      trimmed.length >= EMP_SEARCH_MIN_CHARS_FAST
        ? EMP_SEARCH_FAST_DEBOUNCE_MS
        : EMP_SEARCH_SLOW_DEBOUNCE_MS;

    empSearchTimeoutRef.current = setTimeout(() => {
      setEmpSearchTerm(trimmed);
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (empSearchTimeoutRef.current) clearTimeout(empSearchTimeoutRef.current);
    };
  }, []);

  // ── Can generate? ───────────────────────────────────────────────────────────
  const canGenerate = useMemo(() => {
    if (showOffice && isRequired(report, "loccode") && selectedLocCode === null)
      return false;
    if (showDates && isRequired(report, "fromdate") && !fromDate) return false;
    if (showDates && isRequired(report, "todate") && !toDate) return false;
    if (showTrip && isRequired(report, "triptype") && tripType === null)
      return false;
    if (showShift && isRequired(report, "shiftid") && shiftId === null)
      return false;
    if (showEmp && isRequired(report, "empid") && empId === null) return false;
    return true;
  }, [
    report,
    showOffice,
    showDates,
    showTrip,
    showShift,
    showEmp,
    selectedLocCode,
    fromDate,
    toDate,
    tripType,
    shiftId,
    empId,
  ]);

  // ── API ─────────────────────────────────────────────────────────────────────
  const [fetchReport, { data, isLoading, error, reset }] =
    useFetchReportMutation();
  const { columns, scrollX } = useReportTable(data);
  const errorMsg = error ? normalizeError(error).message : null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDateRange = useCallback(
    (_: unknown, strings: [string, string]) => {
      setFromDate(strings[0]);
      setToDate(strings[1]);
    },
    [],
  );

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    if (report.httpMethod === "GET") {
      const queryParams: Record<string, string | number> = {};
      if (showOffice && selectedLocCode !== null)
        queryParams[locKey] = selectedLocCode;
      if (showTrip && tripType !== null) queryParams["tripType"] = tripType;
      if (showShift && shiftId !== null) queryParams["shiftId"] = shiftId;
      if (showEmp && empId !== null) queryParams["empId"] = empId;
      // GET can't carry a body — every extra filter goes on the query string.
      extraFilterDefs.forEach((f) => {
        queryParams[f.key] = extraFilterValues[f.key];
      });
      await fetchReport({ endpoint: report.link, method: "GET", queryParams });
    } else {
      const body: Record<string, unknown> = {};
      const queryParams: Record<string, string | number> = {};
      if (showOffice && selectedLocCode !== null)
        body[locKey] = selectedLocCode;
      if (showDates && fromDate) body["fromDate"] = fromDate;
      if (showDates && toDate) body["toDate"] = toDate;
      if (showTrip && tripType !== null) body["tripType"] = tripType;
      if (showShift && shiftId !== null) body["shiftId"] = shiftId;
      if (showEmp && empId !== null) body["empId"] = empId;
      // Extra filters can be routed to the body or the query string per
      // their own `target`, regardless of this report being a POST.
      extraFilterDefs.forEach((f) => {
        if (f.target === "query") {
          queryParams[f.key] = extraFilterValues[f.key];
        } else {
          body[f.key] = extraFilterValues[f.key];
        }
      });
      await fetchReport({
        endpoint: report.link,
        method: "POST",
        body,
        queryParams: Object.keys(queryParams).length ? queryParams : undefined,
      });
    }
  }, [
    report,
    canGenerate,
    showOffice,
    showDates,
    showTrip,
    showShift,
    showEmp,
    selectedLocCode,
    fromDate,
    toDate,
    tripType,
    shiftId,
    empId,
    locKey,
    extraFilterDefs,
    extraFilterValues,
    fetchReport,
  ]);

  const handleReset = useCallback(() => {
    reset();
    setSelectedLocCode(null);
    setFromDate("");
    setToDate("");
    setTripType(null);
    setShiftId(null);
    setEmpId(null);
    setSelectedEmpLabel(null);
    setEmpSearchTerm("");
    setExtraFilterValues(
      Object.fromEntries(extraFilterDefs.map((f) => [f.key, f.defaultValue])),
    );
  }, [reset, extraFilterDefs]);

  const handleBack = useCallback(() => {
    navigate("/reports/analytics");
  }, [navigate]);

  const handleExport = useCallback(() => {
    if (!data || data.length === 0) return;
    const officeLabel =
      selectedLocCode !== null
        ? (locationOptions.find(
            (o: { value: number; label: string }) =>
              o.value === selectedLocCode,
          )?.label ?? null)
        : null;
    exportToExcel(data, {
      displayName: report.displayName,
      officeLabel,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  }, [
    data,
    report.displayName,
    selectedLocCode,
    locationOptions,
    fromDate,
    toDate,
    exportToExcel,
  ]);

  const rangeDayjs: [Dayjs | null, Dayjs | null] | undefined =
    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : undefined;

  const catColors = CATEGORY_COLORS[category] ?? {
    icon: C.gray500,
    circleBg: C.gray100,
  };

  const isDirty =
    selectedLocCode !== null ||
    !!fromDate ||
    !!toDate ||
    tripType !== null ||
    shiftId !== null ||
    empId !== null ||
    extraFilterDefs.some((f) => extraFilterValues[f.key] !== f.defaultValue);

  return (
    <div style={{ background: C.pageBg, minHeight: "100%" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: C.white,
          // background: "red",
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 20px",
          gap: 20,

          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        {/* Breadcrumb */}
        <Button
          onClick={handleBack}
          style={{
            justifySelf: "start",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: C.gray400,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Reports
        </Button>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: catColors.circleBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CategoryIcon category={category} color={catColors.icon} />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.gray900,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {report.displayName}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: catColors.circleBg,
                  color: catColors.icon,
                  fontWeight: 600,
                }}
              >
                {category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Filter panel ─────────────────────────────────────────────── */}
        {hasAnyFilter && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                gap: 16,
              }}
            >
              {showOffice && (
                <FilterField
                  label={`Office${isRequired(report, "loccode") ? " *" : ""}`}
                >
                  <Select
                    showSearch
                    placeholder="Select office…"
                    value={selectedLocCode ?? undefined}
                    onChange={(val: number) => setSelectedLocCode(val)}
                    options={locationOptions}
                    filterOption={(input: string, opt: any) =>
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ height: 36, width: 200, background: C.gray100 }}
                  />
                </FilterField>
              )}

              {showDates && (
                <FilterField
                  label={`Period${isRequired(report, "fromdate") ? " *" : ""}`}
                >
                  <RangePicker
                    format="YYYY-MM-DD"
                    value={rangeDayjs}
                    onChange={handleDateRange}
                    allowClear
                    style={{
                      height: 36,
                      width: 240,
                      fontSize: 12,
                      background: C.gray100,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                </FilterField>
              )}

              {showTrip && (
                <FilterField
                  label={`Trip Type${isRequired(report, "triptype") ? " *" : ""}`}
                >
                  <Select
                    placeholder="Select type…"
                    value={tripType ?? undefined}
                    onChange={(val: number) => setTripType(val)}
                    options={TRIP_TYPE_OPTIONS}
                    style={{ height: 36, width: 90, background: C.gray100 }}
                  />
                </FilterField>
              )}

              {showShift && (
                <FilterField
                  label={`Shift${isRequired(report, "shiftid") ? " *" : ""}`}
                >
                  <Select
                    placeholder="Select shift…"
                    value={shiftId ?? undefined}
                    loading={isShiftLoading}
                    onChange={(val: number) => setShiftId(val)}
                    options={shiftOptions}
                    disabled={!selectedLocCode || !tripType}
                    style={{ height: 36, minWidth: 90, background: C.gray100 }}
                  />
                </FilterField>
              )}

              {showEmp && (
                <FilterField
                  label={`Employee${isRequired(report, "empid") ? " *" : ""}`}
                >
                  <Select
                    showSearch
                    placeholder="Search employee…"
                    value={empId ?? undefined}
                    loading={isEmpLoading}
                    filterOption={false}
                    onSearch={handleEmpSearch}
                    onChange={(val: number, option: any) => {
                      setEmpId(val);
                      setSelectedEmpLabel(option?.label ?? null);
                    }}
                    notFoundContent={
                      isEmpLoading
                        ? "Searching…"
                        : empSearchTerm
                          ? "No matches"
                          : "Type at least 1 letter to search"
                    }
                    options={employeeOptions}
                    style={{ height: 36, width: 220, background: C.gray100 }}
                  />
                </FilterField>
              )}

              {extraFilterDefs.map((f) => (
                <FilterField key={f.key} label={f.label}>
                  <Select
                    value={extraFilterValues[f.key] ?? f.defaultValue}
                    onChange={(val: string | number) =>
                      setExtraFilterValues((prev) => ({ ...prev, [f.key]: val }))
                    }
                    options={f.options}
                    style={{ height: 36, width: 140, background: C.gray100 }}
                  />
                </FilterField>
              ))}

              {/* Actions — pushed right */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-end",
                  marginLeft: "auto",
                }}
              >
                {isDirty && (
                  <button
                    onClick={handleReset}
                    style={{
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 999,
                      border: `1px solid ${C.border}`,
                      background: C.white,
                      color: C.gray500,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                )}

                <Tooltip
                  title={!canGenerate ? "Fill in required filters (*)" : ""}
                >
                  <Button
                    type="primary"
                    loading={isLoading}
                    disabled={!canGenerate}
                    onClick={handleGenerate}
                    style={{
                      height: 36,
                      minWidth: 160,
                      fontWeight: 600,
                      fontSize: 13,
                      background: C.green,
                      border: "none",
                      borderRadius: 999,
                      color: !canGenerate ? "#f5f5f5" : undefined, // Clear gray text color
                      boxShadow: "none",
                    }}
                    icon={
                      !isLoading ? (
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      ) : undefined
                    }
                  >
                    {isLoading ? "Generating…" : "Generate Report"}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* No-filter report — generate button standalone */}
        {!hasAnyFilter && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              loading={isLoading}
              onClick={handleGenerate}
              style={{
                height: 36,
                minWidth: 160,
                fontWeight: 600,
                fontSize: 13,
                background: C.green,
                border: "none",
                borderRadius: 999,
                boxShadow: "none",
              }}
              icon={
                !isLoading ? (
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ) : undefined
              }
            >
              {isLoading ? "Generating…" : "Generate Report"}
            </Button>
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {errorMsg && (
          <div
            style={{
              background: C.errorBg,
              border: "1px solid #FCA5A5",
              borderRadius: 10,
              padding: "12px 16px",
              color: C.errorRed,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ flex: 1 }}>{errorMsg}</span>
            <button
              onClick={handleGenerate}
              style={{
                height: 28,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #FCA5A5",
                background: C.white,
                color: C.errorRed,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Idle / prompt ─────────────────────────────────────────────── */}
        {!data && !isLoading && !errorMsg && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "64px 24px",
              textAlign: "center",
              color: C.gray400,
            }}
          >
            {/* <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke={C.border}
              strokeWidth={1.2}
              style={{ marginBottom: 14 }}
            >
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg> */}
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.gray700,
                margin: "0 0 4px",
              }}
            >
              {!canGenerate && hasAnyFilter
                ? "Fill in the required filters"
                : "Ready to generate"}
            </p>
            <p style={{ fontSize: 13, color: C.gray400, margin: 0 }}>
              {!canGenerate && hasAnyFilter
                ? "Complete all required fields (*) above, then click Generate Report."
                : "Click Generate Report to fetch the latest data."}
            </p>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────── */}
        {isLoading && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 24,
            }}
          >
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  borderRadius: 4,
                  background: C.gray100,
                  marginBottom: 14,
                  width: `${88 - i * 7}%`,
                  animation: "rpt-pulse 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Empty result ──────────────────────────────────────────────── */}
        {data && data.length === 0 && !isLoading && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "60px 24px",
            }}
          >
            <Empty
              description={
                <span style={{ color: C.gray400, fontSize: 13 }}>
                  No records found for the selected filters.
                </span>
              }
            />
          </div>
        )}

        {/* ── Data table ───────────────────────────────────────────────── */}
        {data && data.length > 0 && !isLoading && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Table toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: `1px solid ${C.borderLight}`,
              }}
            >
              <span style={{ fontSize: 13, color: C.gray400 }}>
                <strong style={{ color: C.gray700 }}>{data.length}</strong>{" "}
                record{data.length !== 1 ? "s" : ""} found
              </span>

              <button
                onClick={handleExport}
                style={{
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.gray700,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>

            <Table
              columns={columns as any[]}
              dataSource={data}
              rowKey={(row: any) => String(row.id)}
              size="small"
              scroll={{ x: scrollX, y: 520 }}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total: number) => `${total} records`,
              }}
              style={{ fontSize: 12 }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes rpt-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
export default ReportDetailView;
