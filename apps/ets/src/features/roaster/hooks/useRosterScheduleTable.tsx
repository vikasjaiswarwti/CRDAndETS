// src/features/roster/hooks/useRosterScheduleTable.ts
// Client-side: no day-pill filter (removed). Columns disable row actions in bulk mode.
// cancel action has NO confirm:true — CancelScheduleModal is the confirmation step.

import React, { useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import {
  col,
  action,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { ScheduleEntry, SelectedScheduleRow } from "../types/Roster.types";
// import { toggleScheduleRow } from "../slice/RosterSlice";
import { SCHEDULE_CONFIG } from "../config";

import {
  toggleScheduleRow,
  setAllScheduleRows,
  clearScheduleSelection,
} from "../slice/RosterSlice";

// ─── Shift time badge ─────────────────────────────────────────────────────────
const TimeBadge: React.FC<{ time: string; variant: "pick" | "drop" }> = ({
  time,
  variant,
}) => {
  const isNA = !time || time === "N" || time === "N/A" || time === "-";
  const isPick = variant === "pick";

  if (isNA) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 10px",
          borderRadius: 20,
          background: "#f3f4f6",
          color: "#9ca3af",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        —
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        background: isPick ? "#d1fae5" : "#dbeafe",
        color: isPick ? "#064e3b" : "#1e40af",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {time}
    </span>
  );
};

// ─── Hook options ─────────────────────────────────────────────────────────────
interface UseRosterScheduleTableOptions {
  onCancel: (record: ScheduleEntry) => void;
  onEdit: (record: ScheduleEntry) => void;
  /** Full dataset from API — passed straight through (no client filtering). */
  dataSource: ScheduleEntry[];
  /**
   * When true the actions column renders a locked placeholder instead of
   * Edit / Cancel buttons. Set this when one or more rows are selected for
   * bulk cancellation so the user cannot mix single-row and bulk operations.
   */
  isBulkMode?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRosterScheduleTable({
  onCancel,
  onEdit,
  dataSource,
  isBulkMode = false,
}: UseRosterScheduleTableOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const { Checkbox } = useUILibrary();

  const selectedScheduleRows = useSelector(
    (s: RootState) => s.rosterUi.selectedScheduleRows,
  );

  // ── Table state — large default page; data is all in memory ───────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 50,
  });

  // ── Row selection helpers ─────────────────────────────────────────────────
  const isRowSelected = useCallback(
    (record: ScheduleEntry) =>
      selectedScheduleRows.some(
        (r: SelectedScheduleRow) =>
          r.empCode === record.empCode &&
          r.scheduleDate === record.scheduleDate,
      ),
    [selectedScheduleRows],
  );

  const handleToggleRow = useCallback(
    (record: ScheduleEntry) => {
      dispatch(
        toggleScheduleRow({
          empCode: record.empCode,
          empid: record.empid, // ← include empid so bulk cancel has it
          locCode: record.locCode,
          scheduleDate: record.scheduleDate,
          tripType: record.tripType,
        }),
      );
    },
    [dispatch],
  );

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    // ── Actions column: locked placeholder when in bulk mode ────────────────
    const rowActionDefs = [
      ...(SCHEDULE_CONFIG.canEdit ? [action.edit<ScheduleEntry>(onEdit)] : []),
      ...(SCHEDULE_CONFIG.canCancel
        ? [action.cancel<ScheduleEntry>(onCancel)]
        : []),
    ];

    const actionsColumn =
      rowActionDefs.length === 0
        ? null
        : isBulkMode
          ? {
              key: "actions",
              title: "",
              width: 80,
              align: "center" as const,
              render: () => (
                <span
                  title="Row actions are disabled while rows are selected. Clear selection to use them."
                  style={{
                    fontSize: 18,
                    color: "#e5e7eb",
                    userSelect: "none" as const,
                    cursor: "default",
                    letterSpacing: 2,
                  }}
                >
                  ···
                </span>
              ),
            }
          : col.actions(rowActionDefs, {
              width: rowActionDefs.length === 1 ? 70 : 120,
            });

    return buildColumns<ScheduleEntry>([
      // ── Checkbox ──────────────────────────────────────────────────────────
      // {
      //   key: "select",
      //   title: "",
      //   width: 44,
      //   align: "center" as const,
      //   render: (_: unknown, record: ScheduleEntry) => (
      //     <Checkbox
      //       checked={isRowSelected(record)}
      //       onChange={() => handleToggleRow(record)}
      //     />
      //   ),
      // },

      {
        key: "select",
        title: (() => {
          const allSelected =
            dataSource.length > 0 &&
            dataSource.every((r) =>
              selectedScheduleRows.some(
                (s) =>
                  s.empCode === r.empCode && s.scheduleDate === r.scheduleDate,
              ),
            );
          return (
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && selectedScheduleRows.length > 0}
              onChange={() =>
                allSelected
                  ? dispatch(clearScheduleSelection())
                  : dispatch(
                      setAllScheduleRows(
                        dataSource.map((r) => ({
                          empCode: r.empCode,
                          empid: r.empid,
                          locCode: r.locCode,
                          scheduleDate: r.scheduleDate,
                          tripType: r.tripType,
                        })),
                      ),
                    )
              }
            />
          );
        })(),
        width: 44,
        align: "center" as const,
        render: (_: unknown, record: ScheduleEntry) => (
          <Checkbox
            checked={isRowSelected(record)}
            onChange={() => handleToggleRow(record)}
          />
        ),
      },

      col.text("scheduleDate", "Date", { width: 120 }),
      col.text("userName", "Employee", { width: 160 }),

      // ── Day pill ──────────────────────────────────────────────────────────
      {
        key: "weekDays",
        title: "Day",
        width: 80,
        align: "center" as const,
        render: (_: unknown, record: ScheduleEntry) => {
          const day = record.weekDays ?? "";
          const isWeekend = day === "SUN" || day === "SAT";
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: 20,
                background: isWeekend ? "#fef3c7" : "#f0fdf4",
                color: isWeekend ? "#92400e" : "#166534",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {day || "—"}
            </span>
          );
        },
      },

      // ── Shift badges ──────────────────────────────────────────────────────
      {
        key: "pickShift",
        title: "Login Shift",
        width: 130,
        render: (_: unknown, record: ScheduleEntry) => (
          <TimeBadge time={(record as any).pickShift ?? ""} variant="pick" />
        ),
      },
      {
        key: "dropShift",
        title: "Logout Shift",
        width: 130,
        render: (_: unknown, record: ScheduleEntry) => (
          <TimeBadge time={(record as any).dropShift ?? ""} variant="drop" />
        ),
      },
      col.text("loginStatus", "Login Status", { width: 120 }),
      col.text("logoutStatus", "Logout Status", { width: 160 }),

      col.text("office", "Office", { width: 200, ellipsis: true }),

      ...(actionsColumn ? [actionsColumn] : []),
    ]);
  }, [
    Checkbox,
    isRowSelected,
    handleToggleRow,
    onEdit,
    onCancel,
    isBulkMode,
    dataSource,
    selectedScheduleRows,
    dispatch,
  ]);

  return {
    columns,
    /** API data is already date-range filtered — returned as-is. */
    filteredData: dataSource,
    tableState,
    setTableState,
  };
}

export default useRosterScheduleTable;
