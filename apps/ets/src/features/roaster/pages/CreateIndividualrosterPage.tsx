import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import {
  useGetUserDetailsForRosterQuery,
  useGetUserFilterDataQuery,
  useGetWeeklyOffQuery,
  useUpdateWeeklyOffMutation,
  useUpdateIndividualScheduleMutation,
  useCancelIndividualScheduleMutation,
} from "../services/IndividualRosterApi";
import {
  hydrateFromApi,
  setRosterType,
  setFromDate,
  setToDate,
  setSelectedLocCode,
  setSelectedShiftId,
  setHasQueried,
  closeCancelModal,
  resetForm,
} from "../slice/IndividualRosterSlice";
import type {
  RosterType,
  WeekDayAbbr,
  WeekDayFull,
  WeekDayOption,
  IndividualScheduleEntry,
} from "../types/Individualroster.types";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { Select } from "../../../shared/components/ui/Select";
import dayjs, { Dayjs } from "dayjs";

export const WEEKDAYS: WeekDayOption[] = [
  { abbr: "SUN", full: "Sunday" },
  { abbr: "MON", full: "Monday" },
  { abbr: "TUE", full: "Tuesday" },
  { abbr: "WED", full: "Wednesday" },
  { abbr: "THU", full: "Thursday" },
  { abbr: "FRI", full: "Friday" },
  { abbr: "SAT", full: "Saturday" },
];

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  primaryDark: "#1B4332",
  primaryMid: "#2D6A4F",
  lightBg: "#F0FAF4",
  lightBorder: "#B7E4C7",
  cardBg: "#FAFFFE",
  cardBorder: "#D1E7DD",
  inputBorder: "#D1D5DB",
  border: "#E5E7EB",
  textBody: "#374151",
  textMuted: "#6B7280",
  textLabel: "#4B5563",
  white: "#fff",
  tabBg: "#E8F5EE",
  tabActiveBg: "#fff",
} as const;

export function parseWeekOffString(raw: string): WeekDayAbbr[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase() as WeekDayAbbr)
    .filter((s) => WEEKDAYS.some((w) => w.abbr === s));
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
    <rect
      x="1.5"
      y="3"
      width="14"
      height="12"
      rx="2"
      stroke={C.primaryDark}
      strokeWidth="1.35"
    />
    <path
      d="M1.5 7h14M5.5 1.5v3M11.5 1.5v3"
      stroke={C.primaryDark}
      strokeWidth="1.35"
      strokeLinecap="round"
    />
  </svg>
);

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
    <rect
      x="1.5"
      y="2"
      width="14"
      height="13"
      rx="2"
      stroke={C.primaryDark}
      strokeWidth="1.35"
    />
    <path d="M1.5 6.5h14M6 2v13" stroke={C.primaryDark} strokeWidth="1.1" />
    <path d="M6 9.5h9" stroke={C.primaryDark} strokeWidth="1.1" />
  </svg>
);

const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7" stroke={C.primaryDark} strokeWidth="1.35" />
    <path
      d="M8.5 5v4l2.7 2.2"
      stroke={C.primaryDark}
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconEdit = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path
      d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.5 7l3 3 6-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── RosterTypeTabs ───────────────────────────────────────────────────────────

const RosterTypeTabs = memo(function RosterTypeTabs({
  value,
  onChange,
}: {
  value: RosterType;
  onChange: (v: RosterType) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: C.tabBg,
        borderRadius: 999,
        padding: 4,
        gap: 0,
      }}
    >
      {(["LOGIN", "LOGOUT"] as RosterType[]).map((type) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            style={{
              padding: "7px 36px",
              borderRadius: 999,
              border: active
                ? `1.5px solid ${C.lightBorder}`
                : "1.5px solid transparent",
              background: active ? C.tabActiveBg : "transparent",
              color: C.primaryDark,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.18s ease",
              boxShadow: active ? "0 1px 6px rgba(27,67,50,0.10)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {type === "LOGIN" ? "Log In" : "Log Out"}
          </button>
        );
      })}
    </div>
  );
});

// ─── FormField ────────────────────────────────────────────────────────────────

const FormField = memo(function FormField({
  label,
  icon,
  children,
  style,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: C.textMuted,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 40,
          border: `1px solid ${C.inputBorder}`,
          borderRadius: 10,
          paddingLeft: 10,
          paddingRight: 6,
          background: C.white,
          gap: 7,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            color: C.primaryDark,
          }}
        >
          {icon}
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

// ─── WeeklyOffEditor ──────────────────────────────────────────────────────────

const WeeklyOffEditor = memo(function WeeklyOffEditor() {
  const { message } = useUILibrary();

  const { data: weeklyOffData, isLoading: isFetching } = useGetWeeklyOffQuery();
  const savedDays = useMemo(
    () => parseWeekOffString(weeklyOffData?.WeekOff ?? ""),
    [weeklyOffData],
  );

  const [updateWeeklyOff, { isLoading: isSaving }] =
    useUpdateWeeklyOffMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftDays, setDraftDays] = useState<WeekDayAbbr[]>([]);

  const handleStartEdit = useCallback(() => {
    setDraftDays([...savedDays]);
    setIsEditing(true);
  }, [savedDays]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setDraftDays([]);
  }, []);

  const toggleDraft = useCallback((day: WeekDayAbbr) => {
    setDraftDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateWeeklyOff({ WeekOff: draftDays.join(",") }).unwrap();
      message.success("Weekly off days updated.");
      setIsEditing(false);
    } catch {
      message.error("Failed to update weekly off days.");
    }
  }, [draftDays, message, updateWeeklyOff]);

  const hasChanges =
    JSON.stringify([...draftDays].sort()) !==
    JSON.stringify([...savedDays].sort());
  const isEmpty = !isFetching && savedDays.length === 0;

  return (
    <div
      style={{
        border: `1px solid ${isEditing ? C.lightBorder : C.inputBorder}`,
        borderRadius: 10,
        background: isEditing ? "#F6FDF9" : C.white,
        transition: "background 0.15s, border-color 0.15s",
        overflow: "hidden",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderBottom: isEditing ? `1px solid ${C.lightBorder}` : "none",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            flexShrink: 0,
            background: C.lightBg,
            border: `1px solid ${C.lightBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
            <rect
              x="2"
              y="3"
              width="16"
              height="15"
              rx="2"
              stroke={C.primaryDark}
              strokeWidth="1.4"
            />
            <path d="M2 7.5h16" stroke={C.primaryDark} strokeWidth="1.4" />
            <path
              d="M6.5 1.5v3M13.5 1.5v3"
              stroke={C.primaryDark}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M7 12l2 2 4-4"
              stroke={C.primaryDark}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.textBody,
            flexShrink: 0,
          }}
        >
          Weekly Off
        </span>

        <div
          style={{ width: 1, height: 16, background: C.border, flexShrink: 0 }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {isFetching ? (
            [52, 44, 48].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 22,
                  borderRadius: 999,
                  background: "#E5E7EB",
                }}
              />
            ))
          ) : isEmpty && !isEditing ? (
            <span
              style={{
                fontSize: 11,
                color: "#F59E0B",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="#F59E0B"
                  strokeWidth="1.4"
                />
                <path
                  d="M7 4.5v3M7 9.5v.5"
                  stroke="#F59E0B"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              No weekly off set
            </span>
          ) : !isEditing ? (
            savedDays.map((day) => (
              <span
                key={day}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 9px",
                  borderRadius: 999,
                  background: C.lightBg,
                  border: `1px solid ${C.lightBorder}`,
                  color: C.primaryDark,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {day}
              </span>
            ))
          ) : null}
        </div>

        <div
          style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: "auto" }}
        >
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={isFetching}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 11px",
                borderRadius: 999,
                border: `1px solid ${isEmpty ? C.primaryDark : C.border}`,
                background: isEmpty ? C.primaryDark : "#fff",
                color: isEmpty ? "#fff" : C.textMuted,
                fontSize: 11,
                fontWeight: 600,
                cursor: isFetching ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: isFetching ? 0.5 : 1,
              }}
            >
              {isEmpty ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2v8M2 6h8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add Days
                </>
              ) : (
                <>
                  <IconEdit /> Modify
                </>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `1px solid ${C.border}`,
                  background: "#F9FAFB",
                  color: C.textMuted,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: `1.5px solid ${hasChanges ? C.primaryDark : C.border}`,
                  background: hasChanges ? C.primaryDark : "#F3F4F6",
                  color: hasChanges ? "#fff" : C.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: !hasChanges || isSaving ? "default" : "pointer",
                  fontFamily: "inherit",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? (
                  "Saving…"
                ) : (
                  <>
                    <IconCheck /> Save
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px dashed ${C.lightBorder}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            Select days to mark as weekly off:
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {WEEKDAYS.map(({ abbr }) => {
              const sel = draftDays.includes(abbr);
              return (
                <button
                  key={abbr}
                  type="button"
                  onClick={() => toggleDraft(abbr)}
                  style={{
                    padding: "5px 13px",
                    borderRadius: 999,
                    border: `1.5px solid ${sel ? C.primaryDark : C.border}`,
                    background: sel ? C.primaryDark : "#F9FAFB",
                    color: sel ? "#fff" : C.textMuted,
                    fontSize: 11,
                    fontWeight: sel ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {abbr}
                </button>
              );
            })}
          </div>
          {hasChanges && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: C.primaryMid,
                fontWeight: 500,
              }}
            >
              Will be saved as:{" "}
              <strong>
                {draftDays.length > 0
                  ? draftDays.join(", ")
                  : "None (clears all)"}
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ─── CancelConfirmModal ───────────────────────────────────────────────────────

const CancelConfirmModal = memo(function CancelConfirmModal({
  open,
  entry,
  onConfirm,
  onClose,
  isLoading,
}: {
  open: boolean;
  entry: IndividualScheduleEntry | null;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const { Modal } = useUILibrary();
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: 16, fontWeight: 700, color: C.primaryDark }}>
          Cancel Schedule
        </span>
      }
      width={380}
      destroyOnClose
      footer={null}
      centered
      styles={{
        mask: { background: "rgba(0,60,30,0.32)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        content: { borderRadius: 14 },
      }}
    >
      {entry && (
        <p style={{ fontSize: 13, color: C.textMuted, margin: "4px 0 20px" }}>
          Cancel the schedule for{" "}
          <strong style={{ color: C.textBody }}>{entry.scheduleDate}</strong>?
          This will remove both login and logout shifts.
        </p>
      )}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        style={{
          display: "block",
          width: "100%",
          padding: "11px 0",
          borderRadius: 999,
          border: "none",
          background: isLoading ? "#fca5a5" : "#DC2626",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          marginBottom: 8,
        }}
      >
        {isLoading ? "Cancelling…" : "Confirm Cancellation"}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        style={{
          display: "block",
          width: "100%",
          padding: "11px 0",
          borderRadius: 999,
          border: `1px solid ${C.border}`,
          background: "#F9FAFB",
          color: C.textMuted,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Dismiss
      </button>
    </Modal>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateIndividualRosterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { message, DatePicker } = useUILibrary();

  const { RangePicker } = DatePicker as typeof import("antd").DatePicker;

  const ui = useSelector((s: RootState) => s.individualRosterUi);

  const [rangeValue, setRangeValue] = useState<[Dayjs | null, Dayjs | null]>([
    ui.fromDate ? dayjs(ui.fromDate) : null,
    ui.toDate ? dayjs(ui.toDate) : null,
  ]);

  const disablePastDates = (current: dayjs.Dayjs) =>
    current.isBefore(dayjs().startOf("day"));

  const handleDateRange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      setRangeValue(dates ?? [null, null]);
      if (dates?.[0] && dates?.[1]) {
        dispatch(setFromDate(dates[0].format("YYYY-MM-DD")));
        dispatch(setToDate(dates[1].format("YYYY-MM-DD")));
      }
    },
    [dispatch],
  );

  const {
    data: userDetails,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserDetailsForRosterQuery();

  // ── Fetch shifts based on SELECTED office (not user's home location) ────────
  // RTK Query auto-refetches whenever ui.selectedLocCode changes
  const { data: filterData, isLoading: shiftsLoading } =
    useGetUserFilterDataQuery(
      { LocCode: ui.selectedLocCode ?? 0, EmpId: userDetails?.EmpId ?? 0 },
      {
        skip: !ui.selectedLocCode || !userDetails?.EmpId,
        refetchOnMountOrArgChange: true,
      },
    );

  // Clear shift selection when office changes so stale shift isn't carried over
  const prevLocCodeRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (prevLocCodeRef.current !== ui.selectedLocCode) {
      if (prevLocCodeRef.current !== null) {
        // Only clear on actual change, not initial mount
        dispatch(setSelectedShiftId(""));
      }
      prevLocCodeRef.current = ui.selectedLocCode;
    }
  }, [ui.selectedLocCode, dispatch]);

  const { data: weeklyOffData } = useGetWeeklyOffQuery();
  const savedWeeklyOffDays = useMemo(
    () => parseWeekOffString(weeklyOffData?.WeekOff ?? ""),
    [weeklyOffData],
  );

  const [updateSchedule, { isLoading: isSubmitting }] =
    useUpdateIndividualScheduleMutation();
  const [cancelSchedule, { isLoading: isCancelling }] =
    useCancelIndividualScheduleMutation();

  // ── Multi-select employee IDs ─────────────────────────────────────────────
  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]);

  const isManager = (userDetails?.DrList?.length ?? 0) > 1;

  useEffect(() => {
    if (!userDetails) return;
    dispatch(
      hydrateFromApi({
        empId: userDetails.EmpId,
        locCode: userDetails.LocCode,
        employees: userDetails.DrList,
        locations: userDetails.locations,
      }),
    );
    // Auto-select self on mount
    if (selectedEmpIds.length === 0) {
      setSelectedEmpIds([userDetails.EmpId]);
    }
  }, [dispatch, userDetails]);

  const toggleEmp = useCallback((empId: number) => {
    setSelectedEmpIds((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  }, []);

  // Shift options react to rosterType (LOGIN vs LOGOUT) — no extra effect needed,
  // useMemo recomputes whenever filterData or ui.rosterType changes
  const shiftOptions = useMemo(() => {
    if (!filterData) return [];
    const list =
      ui.rosterType === "LOGIN" ? filterData.PickShifts : filterData.DropShifts;
    return list.map((s) => ({ value: String(s.SHIFTID), label: s.SHIFTTIME }));
  }, [filterData, ui.rosterType]);

  const officeOptions = useMemo(
    () =>
      (userDetails?.locations ?? []).map((loc) => ({
        value: String(loc.loccode),
        label: loc.locname,
      })),
    [userDetails],
  );

  const handleSubmit = useCallback(async () => {
    const empIds = isManager ? selectedEmpIds : [userDetails?.EmpId ?? 0];

    if (!ui.selectedLocCode) {
      message.error("Please select an office.");
      return;
    }
    if (!ui.selectedShiftId) {
      message.error(
        ui.rosterType === "LOGIN"
          ? "Please select a login shift."
          : "Please select a logout shift.",
      );
      return;
    }
    if (empIds.length === 0) {
      message.error("Please select at least one employee.");
      return;
    }
    if (!savedWeeklyOffDays.length) {
      message.error(
        "Please add your weekly off day(s) before filling the roster.",
      );
      return;
    }

    const shiftList =
      ui.rosterType === "LOGIN"
        ? filterData?.PickShifts
        : filterData?.DropShifts;
    const shift = shiftList?.find(
      (s) => String(s.SHIFTID) === ui.selectedShiftId,
    );
    if (!shift) {
      message.error("Invalid shift. Please re-select.");
      return;
    }

    const weekOffsStr = savedWeeklyOffDays
      .map((abbr) => WEEKDAYS.find((w) => w.abbr === abbr)?.full)
      .filter((v): v is WeekDayFull => Boolean(v))
      .join(",");

    // try {
    //   const result = await updateSchedule({
    //     ScheduleUpdateVersion: "APP",
    //     LocCode: ui.selectedLocCode,
    //     FromDate: ui.fromDate,
    //     ToDate: ui.toDate,
    //     ShiftStart: ui.rosterType === "LOGIN" ? shift.SHIFTTIME : "NA",
    //     ShiftEnd: ui.rosterType === "LOGOUT" ? shift.SHIFTTIME : "NA",
    //     WeekOffs: weekOffsStr,
    //     User_Empids: empIds.join(","),
    //   }).unwrap();

    //   const rows = Array.isArray(result) ? result : [];
    //   const apiErr = rows.find((r) => Number(r?.errorCode) === 1);
    //   // if (apiErr) {
    //   //   message.error(apiErr.dB_Response || "Failed to create schedule.");
    //   // } else {
    //   //   message.success("Schedule created successfully!");
    //   //   dispatch(resetForm());
    //   //   dispatch(setHasQueried(true));
    //   //   if (isManager) setSelectedEmpIds([userDetails?.EmpId ?? 0]);
    //   // }

    //   if (!result.isSuccess || apiErr) {
    //     message.error(
    //       apiErr?.dB_Response || result.message || "Failed to create schedule.",
    //     );
    //     return;
    //   }

    //   message.success(result.message || "Schedule created successfully!");
    // } catch {
    //   message.error("Failed to create schedule. Please try again.");
    // }

    try {
      const response = await updateSchedule({
        ScheduleUpdateVersion: "APP",
        LocCode: ui.selectedLocCode,
        FromDate: ui.fromDate,
        ToDate: ui.toDate,
        ShiftStart: ui.rosterType === "LOGIN" ? shift.SHIFTTIME : "NA",
        ShiftEnd: ui.rosterType === "LOGOUT" ? shift.SHIFTTIME : "NA",
        WeekOffs: weekOffsStr,
        User_Empids: empIds.join(","),
      }).unwrap();

      const apiResult = response.result?.[0];

      if (!response.isSuccess || apiResult?.errorCode === 1) {
        message.error(
          apiResult?.dB_Response ||
            response.message ||
            "Failed to create schedule.",
        );
        return;
      }

      message.success(
        apiResult?.dB_Response ||
          response.message ||
          "Schedule created successfully!",
      );

      dispatch(resetForm());
      dispatch(setHasQueried(true));

      if (isManager) {
        setSelectedEmpIds([userDetails?.EmpId ?? 0]);
      }
    } catch {
      message.error("Failed to create schedule. Please try again.");
    }
  }, [
    dispatch,
    filterData,
    isManager,
    message,
    selectedEmpIds,
    ui,
    updateSchedule,
    savedWeeklyOffDays,
    userDetails,
  ]);

  const handleCancelConfirm = useCallback(async () => {
    const entry = ui.cancellingEntry;
    if (!entry || !ui.userLocCode) return;
    try {
      await cancelSchedule({
        LocCode: ui.userLocCode,
        Empid: entry.empid ?? Number(entry.empCode),
        ScheduleDate: entry.scheduleDate,
        TripType: 0,
        ScheduleCancelVersion: "WEB",
      }).unwrap();
      message.success("Schedule cancelled successfully.");
      dispatch(closeCancelModal());
    } catch {
      message.error("Failed to cancel schedule.");
    }
  }, [cancelSchedule, dispatch, message, ui.cancellingEntry, ui.userLocCode]);

  if (userLoading) {
    return (
      <div style={outerStyle}>
        <CompactHeader />
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: C.textMuted,
            fontSize: 13,
          }}
        >
          Loading your details…
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div style={outerStyle}>
        <CompactHeader />
        <div
          style={{
            padding: 16,
            background: "#FEF2F2",
            borderRadius: 10,
            color: "#991B1B",
            fontSize: 13,
          }}
        >
          Failed to load roster data. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <CompactHeader />

      <div
        style={{
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 16,
          background: C.cardBg,
          padding: "20px 22px",
        }}
      >
        {/* ── Employee multi-select (manager only) ───────────────────── */}
        {isManager && userDetails && (
          <div
            style={{
              marginBottom: 18,
              paddingBottom: 18,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Creating schedule for
              {selectedEmpIds.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    padding: "1px 8px",
                    borderRadius: 999,
                    background: C.lightBg,
                    border: `1px solid ${C.lightBorder}`,
                    color: C.primaryDark,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {selectedEmpIds.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {userDetails.DrList.map((emp) => {
                const isSelf = emp.EMPID === userDetails.EmpId;
                const isSelected = selectedEmpIds.includes(emp.EMPID);
                return (
                  <button
                    key={emp.EMPID}
                    type="button"
                    onClick={() => toggleEmp(emp.EMPID)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 13px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? C.primaryDark : C.border}`,
                      background: isSelected ? C.lightBg : C.white,
                      color: isSelected ? C.primaryDark : C.textBody,
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "border-color 0.12s, background 0.12s",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: isSelected ? C.primaryDark : "#E5E7EB",
                        color: isSelected ? C.white : C.textMuted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {emp.EmpName.charAt(0).toUpperCase()}
                    </div>
                    {emp.EmpName}
                    {isSelf && (
                      <span
                        style={{
                          fontSize: 10,
                          color: C.textMuted,
                          fontWeight: 400,
                          marginLeft: -2,
                        }}
                      >
                        (Me)
                      </span>
                    )}
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        style={{ marginLeft: 2, flexShrink: 0 }}
                      >
                        <circle cx="7" cy="7" r="7" fill={C.primaryDark} />
                        <path
                          d="M4 7l2 2 4-4"
                          stroke="#fff"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Roster type tabs ────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <RosterTypeTabs
            value={ui.rosterType}
            onChange={(v) => dispatch(setRosterType(v))}
          />
        </div>

        {/* ── Form row ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1.2fr 1.2fr",
            alignItems: "end",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <FormField label="Date Range" icon={<IconCalendar />}>
            <RangePicker
              format="DD MMM YYYY"
              value={rangeValue}
              onChange={handleDateRange}
              disabledDate={disablePastDates}
              allowClear={false}
              placeholder={["From date", "To date"]}
              style={{
                border: "none",
                boxShadow: "none",
                width: "100%",
                fontSize: 13,
              }}
            />
          </FormField>

          <FormField label="Select Office" icon={<IconGrid />}>
            <Select
              value={
                ui.selectedLocCode != null
                  ? String(ui.selectedLocCode)
                  : undefined
              }
              onChange={(v: string | number | undefined) =>
                dispatch(setSelectedLocCode(v != null ? Number(v) : null))
              }
              options={officeOptions}
              placeholder={userLoading ? "Loading…" : "Select office"}
              showSearch
              style={{
                border: "none",
                boxShadow: "none",
                width: "100%",
                fontSize: 13,
              }}
            />
          </FormField>

          <FormField
            label={ui.rosterType === "LOGIN" ? "Login Shift" : "Logout Shift"}
            icon={<IconClock />}
          >
            <Select
              value={ui.selectedShiftId || undefined}
              onChange={(v: string | number | undefined) =>
                dispatch(setSelectedShiftId(v != null ? String(v) : ""))
              }
              options={shiftOptions}
              placeholder={
                !ui.selectedLocCode
                  ? "Select office first"
                  : shiftsLoading
                    ? "Loading shifts…"
                    : "Select shift"
              }
              disabled={!ui.selectedLocCode}
              style={{
                border: "none",
                boxShadow: "none",
                width: "100%",
                fontSize: 13,
              }}
            />
          </FormField>
        </div>

        {/* ── Weekly off ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <WeeklyOffEditor />
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: "12px 0",
              width: 280,
              borderRadius: 999,
              border: "none",
              background: isSubmitting ? C.primaryMid : C.primaryDark,
              color: C.white,
              fontSize: 14,
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
              opacity: isSubmitting ? 0.85 : 1,
            }}
          >
            {isSubmitting ? "Creating…" : "Create Schedule"}
          </button>
        </div>
      </div>

      <CancelConfirmModal
        open={ui.isCancelModalOpen}
        entry={ui.cancellingEntry}
        onConfirm={handleCancelConfirm}
        onClose={() => dispatch(closeCancelModal())}
        isLoading={isCancelling}
      />
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const outerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
  padding: "16px 28px 48px",
  boxSizing: "border-box",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
};

function CompactHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: C.primaryDark,
            lineHeight: 1.2,
          }}
        >
          Individual Roster
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
          Create schedule for yourself or your team
        </div>
      </div>
    </div>
  );
}
