// src/features/roster/pages/EmployeeSchedulePage.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import dayjs, { Dayjs } from "dayjs";

import {
  useViewScheduleQuery,
  useGetRosterSupervisorsQuery,
} from "../services/RosterApi";

import { useRosterMutations } from "../hooks/useRosterMutations";
import { useRosterScheduleTable } from "../hooks/useRosterScheduleTable";
import { useRosterModal } from "../hooks/useRosterModal";
import CancelScheduleModal from "../components/Cancelschedulemodal";
import { EditScheduleModal } from "../components/Editschedulemodal";

import {
  setScheduleEmpId,
  setScheduleFromDate,
  setScheduleToDate,
  setScheduleHasQueried,
  openCancelModal,
  closeCancelModal,
  setCancelShiftType,
  clearScheduleSelection,
} from "../slice/RosterSlice";

import {
  COLORS,
  CANCEL_SHIFT_TRIP_TYPE,
  ALL_EMPLOYEES_EMP_ID,
} from "../constants/Rosterconstants";
import type { CancelShiftType, ScheduleEntry } from "../types/Roster.types";
import { Select } from "../../../shared/components/ui/Select";
import { T } from "../../../styles/tokens";

// ─── Icons ────────────────────────────────────────────────────────────────────
const CancelIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke={COLORS.cancelRed} strokeWidth="1.5" />
    <path
      d="M4.5 4.5l5 5M9.5 4.5l-5 5"
      stroke={COLORS.cancelRed}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const FL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 500,
      color: COLORS.textMuted,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

// ─── Status bar types ─────────────────────────────────────────────────────────
type StatusVariant = "info" | "success" | "warning" | "selection";

// ─── Page ─────────────────────────────────────────────────────────────────────
const EmployeeSchedulePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as typeof import("antd").DatePicker;

  const {
    scheduleEmpId,
    scheduleFromDate,
    scheduleToDate,
    scheduleHasQueried,
    isCancelModalOpen,
    cancelShiftType,
    selectedScheduleRows,
  } = useSelector((s: RootState) => s.rosterUi);

  const [localEmpId, setLocalEmpId] = useState<string | undefined>(undefined);
  const [rangeValue, setRangeValue] = useState<[Dayjs | null, Dayjs | null]>([
    scheduleFromDate ? dayjs(scheduleFromDate) : null,
    scheduleToDate ? dayjs(scheduleToDate) : null,
  ]);
  const [localFrom, setLocalFrom] = useState(scheduleFromDate);
  const [localTo, setLocalTo] = useState(scheduleToDate);

  const [cancelTarget, setCancelTarget] = useState<ScheduleEntry | null>(null);
  const [cancelProgress, setCancelProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const {
    isOpen: isEditOpen,
    editingRecord,
    openEdit,
    close: closeEdit,
  } = useRosterModal();

  // ── Employees — locCode 0 = all offices ──────────────────────────────────
  const { data: supervisors = [], isLoading: supervisorsLoading } =
    useGetRosterSupervisorsQuery({ locCode: 0 });

  const employeeOptions = useMemo(
    () =>
      supervisors.map((s) => ({
        value: String(s.empId),
        label: `${s.empName} (${s.empId})`,
      })),
    [supervisors],
  );

  useEffect(() => {
    if (localEmpId === undefined && employeeOptions.length > 0) {
      setLocalEmpId(employeeOptions[0].value);
    }
  }, [employeeOptions]);

  // ── Auto-fetch: dispatch to Redux whenever filter changes ─────────────────
  // RTK Query auto-refetches because the query arg object changes.
  useEffect(() => {
    if (localFrom && localTo) {
      dispatch(
        setScheduleEmpId(
          localEmpId ? Number(localEmpId) : ALL_EMPLOYEES_EMP_ID,
        ),
      );
      dispatch(setScheduleFromDate(localFrom));
      dispatch(setScheduleToDate(localTo));
      dispatch(setScheduleHasQueried(true));
    }
  }, [localEmpId, localFrom, localTo, dispatch]);

  // ── Schedule data ─────────────────────────────────────────────────────────
  const {
    data: scheduleEntries = [],
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
    isFetching,
  } = useViewScheduleQuery(
    {
      empId: scheduleEmpId,
      dateFrom: scheduleFromDate,
      dateTo: scheduleToDate,
    },
    { skip: !scheduleHasQueried },
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { cancelSchedule, cancelScheduleBulk, isCancelling } =
    useRosterMutations({
      onCancelSuccess: () => {
        dispatch(closeCancelModal());
        dispatch(clearScheduleSelection());
        setCancelTarget(null);
        setCancelProgress(null);
        refetchSchedule();
      },
      onCancelProgress: (done, total) => {
        setCancelProgress({ done, total });
      },
    });

  // ── Bulk mode — disables row-level actions ────────────────────────────────
  const isBulkMode = selectedScheduleRows.length > 0;

  const handleCancelRow = (record: ScheduleEntry) => {
    if (isBulkMode) return; // row actions locked during bulk selection
    setCancelTarget(record);
    dispatch(openCancelModal());
  };

  const handleEditRow = (record: ScheduleEntry) => {
    if (isBulkMode) return;
    openEdit(record);
  };

  const { columns, filteredData, tableState, setTableState } =
    useRosterScheduleTable({
      onCancel: handleCancelRow,
      onEdit: handleEditRow,
      dataSource: scheduleEntries,
      isBulkMode, // hook uses this to visually disable row action icons
    });

  // ── Override last column to dim icons in bulk mode ────────────────────────
  const displayColumns = useMemo(() => {
    if (!isBulkMode) return columns;
    return columns.map((col: any) => {
      if (col.key === "actions" || col.dataIndex === "actions") {
        return {
          ...col,
          render: () => (
            <span
              title="Row actions disabled during multi-selection"
              style={{ fontSize: 11, color: "#d1d5db", userSelect: "none" }}
            >
              —
            </span>
          ),
        };
      }
      return col;
    });
  }, [columns, isBulkMode]);

  // ── Cancel confirm ────────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    const tripType = CANCEL_SHIFT_TRIP_TYPE[cancelShiftType];
    const fmt = (d: string) =>
      d ? dayjs(d, ["DD-MMM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD") : "";

    if (cancelTarget) {
      // Single row cancel
      await cancelSchedule({
        LocCode: cancelTarget.locCode,
        Empid: cancelTarget.empid != null ? Number(cancelTarget.empid) : 0,
        ScheduleDate: fmt(cancelTarget.scheduleDate),
        TripType: tripType,
        ScheduleCancelVersion: "WEB",
      });
    } else {
      // Bulk cancel — empid taken from the stored row object
      const payloads = selectedScheduleRows.map((row) => ({
        LocCode: row.locCode,
        Empid: row.empid != null ? Number(row.empid) : 0,
        ScheduleDate: fmt(row.scheduleDate),
        TripType: tripType,
        ScheduleCancelVersion: "WEB",
      }));
      await cancelScheduleBulk(payloads);
    }
  };

  const handleBulkCancel = () => {
    if (isBulkMode) {
      setCancelTarget(null);
      dispatch(openCancelModal());
    }
  };

  const handleDateRange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null, strings: [string, string]) => {
      setRangeValue(dates ?? [null, null]);
      dispatch(clearScheduleSelection());
      if (dates?.[0] && dates?.[1]) {
        setLocalFrom(strings[0]);
        setLocalTo(strings[1]);
      } else if (!dates) {
        setLocalFrom("");
        setLocalTo("");
        dispatch(setScheduleHasQueried(false));
      }
    },
    [dispatch],
  );

  const disablePastDates = (current: dayjs.Dayjs) =>
    current.isBefore(dayjs().startOf("day"));

  const statusContent = useMemo((): {
    variant: StatusVariant;
    message: React.ReactNode;
  } | null => {
    if (!localFrom || !localTo)
      return {
        variant: "info",
        message: "Select a date range to load schedule data.",
      };
    if (scheduleLoading || isFetching || scheduleError) return null;
    if (scheduleHasQueried && scheduleEntries.length === 0)
      return {
        variant: "warning",
        message: "No schedules found for the selected filters.",
      };
    if (scheduleHasQueried && scheduleEntries.length > 0) {
      const empLabel = localEmpId
        ? (supervisors.find((s) => String(s.empId) === localEmpId)?.empName ??
          "Employee")
        : "All Employees";
      return {
        variant: "success",
        message: (
          <>
            <strong>{filteredData.length}</strong> schedule
            {filteredData.length !== 1 ? "s" : ""} for{" "}
            <strong>{empLabel}</strong> ·{" "}
            {dayjs(localFrom).format("DD MMM YYYY")} –{" "}
            {dayjs(localTo).format("DD MMM YYYY")}
          </>
        ),
      };
    }
    return null;
  }, [
    localFrom,
    localTo,
    scheduleLoading,
    isFetching,
    scheduleError,
    scheduleHasQueried,
    scheduleEntries.length,
    filteredData.length,
    localEmpId,
    supervisors,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "88vh",
        minHeight: 0,
        overflow: "hidden",
        backgroundColor: "#fff",
        gap: 6,
        padding: 14,
        boxSizing: "border-box",
      }}
    >
      {/* ── Single header row: title | employee | date range | spinner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          background: "#fff",
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        {/* Title + subtitle */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.textBody,
              lineHeight: 1.2,
            }}
          >
            Employee Schedule
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            View and manage roster
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 32,
            background: COLORS.border,
            flexShrink: 0,
          }}
        />

        {/* Employee selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FL>Employee</FL>
          <Select
            value={localEmpId}
            onChange={(v: string | undefined) => {
              setLocalEmpId(v ?? undefined);
              dispatch(clearScheduleSelection());
            }}
            options={employeeOptions}
            placeholder={supervisorsLoading ? "Loading…" : "All Employees"}
            loading={supervisorsLoading}
            style={{
              width: 200,
              background: "#fff",
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
            showSearch
            allowClear
            filterOption={(
              input: string,
              option: { label: string; value: string },
            ) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Date range */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FL>
            Date Range <span style={{ color: "#ef4444" }}>*</span>
          </FL>
          <RangePicker
            format="YYYY-MM-DD"
            value={rangeValue}
            onChange={handleDateRange}
            disabledDate={disablePastDates}
            allowClear
            placeholder={["From date", "To date"]}
            style={{
              height: 36,
              width: 240,
              fontSize: 12,
              background: T.formcss.white,
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
          />
        </div>

        {/* Live spinner */}
        {(scheduleLoading || isFetching) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: COLORS.primaryDark,
              marginLeft: "auto",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke={COLORS.lightBg}
                strokeWidth="2"
              />
              <path
                d="M8 2a6 6 0 016 6"
                stroke={COLORS.primaryDark}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Loading…
          </div>
        )}
      </div>

      {/* ── Contextual status bar ────────────────────────────────────── */}

      {(statusContent || isBulkMode) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 8,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 12,
            ...(isBulkMode
              ? {
                  background: "#fff5f5",
                  border: `1px solid ${COLORS.cancelRedBorder}`,
                }
              : statusContent?.variant === "success"
                ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                : statusContent?.variant === "warning"
                  ? { background: "#fffbeb", border: "1px solid #fde68a" }
                  : { background: "#f0f9ff", border: "1px solid #bae6fd" }),
          }}
        >
          {/* Left — message or selection count */}
          <span
            style={{
              color: isBulkMode
                ? COLORS.cancelRed
                : statusContent?.variant === "success"
                  ? "#166534"
                  : statusContent?.variant === "warning"
                    ? "#92400e"
                    : "#0369a1",
              fontWeight: isBulkMode ? 600 : 400,
            }}
          >
            {isBulkMode
              ? `${selectedScheduleRows.length} row${selectedScheduleRows.length > 1 ? "s" : ""} selected — row actions disabled`
              : statusContent?.message}
          </span>

          {/* Right — only in bulk mode */}
          {isBulkMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => dispatch(clearScheduleSelection())}
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Clear
              </button>
              <button
                onClick={handleBulkCancel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: `1.5px solid ${COLORS.cancelRed}`,
                  // background:
                  color: COLORS.cancelRed,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ marginRight: "5px" }}>
                  <CancelIcon />
                </span>
                Cancel {selectedScheduleRows.length} Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Schedule table ───────────────────────────────────────────── */}
      <DataTableWrapper showSearch={false}>
        <ApiStateWrapper
          isLoading={scheduleLoading && !isFetching}
          error={scheduleError}
          isEmpty={
            scheduleHasQueried &&
            !scheduleLoading &&
            scheduleEntries.length === 0
          }
          onRetry={refetchSchedule}
          emptyMessage={
            scheduleHasQueried
              ? "No schedules found. Try adjusting the date range or employee filter."
              : "Select a date range above to load schedule data."
          }
        >
          <AppTable
            loading={scheduleLoading || isFetching}
            columns={displayColumns}
            dataSource={filteredData}
            rowKey="id"
            total={filteredData.length}
            tableState={tableState}
            scroll={{y:350}}
            onTableChange={setTableState}
          />
        </ApiStateWrapper>
      </DataTableWrapper>

      {/* ── Bulk cancel progress (fixed bottom) ─────────────────────── */}
      {cancelProgress && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "12px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            zIndex: 2000,
            minWidth: 280,
          }}
        >
          <div
            style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}
          >
            Cancelling {cancelProgress.done} of {cancelProgress.total}{" "}
            schedules…
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: COLORS.lightBg,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: COLORS.primaryDark,
                width: `${(cancelProgress.done / cancelProgress.total) * 100}%`,
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              marginTop: 6,
              textAlign: "right",
            }}
          >
            {Math.round((cancelProgress.done / cancelProgress.total) * 100)}%
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <CancelScheduleModal
        open={isCancelModalOpen}
        selectedType={cancelShiftType}
        onTypeChange={(type: CancelShiftType) =>
          dispatch(setCancelShiftType(type))
        }
        onConfirm={handleConfirmCancel}
        onDismiss={() => {
          dispatch(closeCancelModal());
          setCancelTarget(null);
        }}
        isLoading={isCancelling}
        selectedCount={cancelTarget ? 1 : selectedScheduleRows.length}
      />

      <EditScheduleModal
        open={isEditOpen}
        record={editingRecord}
        onClose={closeEdit}
        onSuccess={() => {
          refetchSchedule();
          dispatch(clearScheduleSelection());
        }}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EmployeeSchedulePage;
