import React, { useCallback } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useLookups } from "../../lookups/hooks/useLookups";
import FilterField from "./FilterField";
import { TRIP_TYPE_OPTIONS, SHIFT_OPTIONS } from "../constants/Reportoption";
import type { Report } from "../types/reports.types";
import type {
  ReportFilterState,
  ReportFilterFlags,
} from "../hooks/useReportFilters";
import { isRequired } from "../hooks/useReportFilters";

const C = {
  white: "#ffffff",
  border: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  green: "#3E9B73",
};

interface FilterPanelProps {
  report: Report;
  filters: ReportFilterState;
  flags: ReportFilterFlags;
  canGenerate: boolean;
  isDirty: boolean;
  isLoading: boolean;
  onLocCodeChange: (val: number | null) => void;
  onDateRangeChange: (from: string, to: string) => void;
  onTripTypeChange: (val: number | null) => void;
  onShiftChange: (val: number | null) => void;
  onGenerate: () => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  report,
  filters,
  flags,
  canGenerate,
  isDirty,
  isLoading,
  onLocCodeChange,
  onDateRangeChange,
  onTripTypeChange,
  onShiftChange,
  onGenerate,
  onReset,
}) => {
  const { Select, DatePicker, Button, Tooltip } = useUILibrary();
  const { RangePicker } = DatePicker as any;
  const { locationOptions, isLoading: officesLoading } = useLookups({
    only: ["locationOptions"],
  });

  const { selectedLocCode, fromDate, toDate, tripType, shiftId } = filters;
  const { showOffice, showDates, showTrip, showShift } = flags;

  const rangeDayjs: [Dayjs | null, Dayjs | null] | undefined =
    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : undefined;

  const handleDateRange = useCallback(
    (_: unknown, strings: [string, string]) => {
      onDateRangeChange(strings[0], strings[1]);
    },
    [onDateRangeChange],
  );

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.gray400,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          margin: "0 0 16px",
        }}
      >
        Filters
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 6,
        }}
      >
        {/* Office */}
        {showOffice && (
          <FilterField
            label={`Office${isRequired(report, "loccode") ? " *" : ""}`}
          >
            <Select
              showSearch
              placeholder="Select office…"
              loading={officesLoading}
              value={selectedLocCode ?? undefined}
              onChange={(val: number) => onLocCodeChange(val)}
              options={locationOptions}
              filterOption={(input: string, opt: any) =>
                String(opt?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ height: 36, minWidth: 220 }}
            />
          </FilterField>
        )}

        {/* Date range */}
        {showDates && (
          <FilterField
            label={`Period${isRequired(report, "fromdate") ? " *" : ""}`}
          >
            <RangePicker
              format="YYYY-MM-DD"
              value={rangeDayjs}
              onChange={handleDateRange}
              allowClear
              size="small"
              style={{ height: 36, minWidth: 220 }}
            />
          </FilterField>
        )}

        {/* Trip type */}
        {showTrip && (
          <FilterField
            label={`Trip Type${isRequired(report, "triptype") ? " *" : ""}`}
          >
            <Select
              placeholder="Select type…"
              value={tripType ?? undefined}
              onChange={(val: number) => onTripTypeChange(val)}
              options={TRIP_TYPE_OPTIONS}
              style={{ height: 36, minWidth: 150 }}
            />
          </FilterField>
        )}

        {/* Shift */}
        {showShift && (
          <FilterField
            label={`Shift${isRequired(report, "shiftid") ? " *" : ""}`}
          >
            <Select
              placeholder="Select shift…"
              value={shiftId ?? undefined}
              onChange={(val: number) => onShiftChange(val)}
              options={SHIFT_OPTIONS}
              style={{ height: 36, minWidth: 150 }}
            />
          </FilterField>
        )}

        {/* Actions */}
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
              onClick={onReset}
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

          <Tooltip title={!canGenerate ? "Fill in required filters (*)" : ""}>
            <Button
              type="primary"
              loading={isLoading}
              disabled={!canGenerate}
              onClick={onGenerate}
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
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
