import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import dayjs, { Dayjs } from "dayjs";
import { Select } from "../../../shared/components/ui/Select";

import {
  useGetPickupAgainstDropShiftQuery,
  useGetRosterSupervisorsQuery,
  useGetUserShiftsQuery,
  useLazyGetShiftValidationQuery,
  useGetLookupBasedonShiftValidationQuery,
  useGetRosterSupervisorsByWiseIdQuery,
} from "../services/RosterApi";

import { useRosterMutations } from "../hooks/useRosterMutations";

import {
  setLocCode,
  setFromDate,
  setToDate,
  setPickupShift,
  setDropShift,
  setTripType,
  toggleWeeklyOffDay,
  toggleMember,
  setAllMembers,
  clearAllMembers,
  resetCreateForm,
} from "../slice/RosterSlice";

import { WEEKLY_OFF_OPTIONS, COLORS } from "../constants/Rosterconstants";

import { useLookups } from "../../lookups";
import { T } from "../../../styles/tokens";
import RosterTypeTabs from "../components/RosterTypeTab";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalSvg = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="2.5"
      width="14"
      height="12"
      rx="2.5"
      stroke={COLORS.primaryDark}
      strokeWidth="1.3"
    />
    <path
      d="M1 6.5h14M5 1v3M11 1v3"
      stroke={COLORS.primaryDark}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const UsersSvg = () => (
  <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
    <circle cx="7" cy="6" r="3" stroke={COLORS.primaryDark} strokeWidth="1.3" />
    <path
      d="M1 16c0-3.314 2.686-5 6-5s6 1.686 6 5"
      stroke={COLORS.primaryDark}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle
      cx="13"
      cy="6"
      r="2.5"
      stroke={COLORS.primaryDark}
      strokeWidth="1.3"
    />
    <path
      d="M17 16c0-2.761-1.79-4-4-4"
      stroke={COLORS.primaryDark}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const SaveSvg = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M11 14v-5H5v5M5 2v4h5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const EyeSvg = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const BackSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10 3L5 8l5 5"
      stroke={COLORS.primaryDark}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RosterIconSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="18" rx="3" fill={COLORS.primaryDark} />
    <path
      d="M7 8h10M7 12h10M7 16h6"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const UploadSvg = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M5 6l3-3 3 3M8 3v8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 13h12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Field error ──────────────────────────────────────────────────────────────

const FieldError: React.FC<{ msg?: string }> = ({ msg }) => {
  if (!msg) return null;
  return (
    <div
      style={{
        fontSize: 11,
        color: "#ff4d4f",
        marginTop: 4,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.5" stroke="#ff4d4f" strokeWidth="1" />
        <path
          d="M6 3.5v3M6 8h.01"
          stroke="#ff4d4f"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {msg}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div
    style={{
      background: "#fff",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: "13px 20px",
      marginBottom: 12,
    }}
  >
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}
    >
      <span style={{ display: "flex", color: COLORS.primaryDark }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textBody }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

const Req = () => <span style={{ color: "#ff4d4f", marginLeft: 2 }}>*</span>;

const FieldLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <label
    style={{
      display: "block",
      fontSize: 12,
      fontWeight: 500,
      color: COLORS.textMuted,
      marginBottom: 5,
    }}
  >
    {children}
    {required && <Req />}
  </label>
);

const DayPill: React.FC<{
  day: string;
  selected: boolean;
  onClick: () => void;
}> = ({ day, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "7px 20px",
      borderRadius: 8,
      border: `1px solid ${selected ? COLORS.primaryDark : COLORS.inputBorder}`,
      background: selected ? "" : "#fff",
      color: selected ? COLORS.primaryDark : COLORS.primaryMid,
      fontSize: 11,
      fontWeight: selected ? 600 : 400,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.15s",
    }}
  >
    <div
      style={{
        width: 15,
        height: 12,
        borderRadius: 3,
        border: `1px solid ${selected ? COLORS.primaryDark : COLORS.inputBorder}`,
        background: selected ? "#fff" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {selected && (
        <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
          <path
            d="M1 4.5L4 7.5L10 1"
            stroke={COLORS.primaryDark}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    {day}
  </button>
);

const GenderBadge: React.FC<{ gender?: "M" | "F" }> = ({ gender }) => {
  if (!gender) return null;
  const isMale = gender === "M";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: isMale ? "#dbeafe" : "#fce7f3",
        color: isMale ? "#1d4ed8" : "#be185d",
        fontSize: 9,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {isMale ? "♂" : "♀"}
    </span>
  );
};

const MemberCard: React.FC<{
  name: string;

  gender?: "M" | "F";
  checked: boolean;
  onClick: () => void;
}> = ({ name, gender, checked, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderRadius: 8,
      border: `1px solid ${checked ? COLORS.primaryDark : COLORS.inputBorder}`,
      background: checked ? COLORS.lightBg : "#fff",
      cursor: "pointer",
      transition: "all 0.15s",
      userSelect: "none",
    }}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: `2px solid ${checked ? COLORS.primaryDark : COLORS.inputBorder}`,
        background: checked ? COLORS.primaryDark : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: checked ? 600 : 400,
            color: COLORS.textBody,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <GenderBadge gender={gender} />
      </div>
      {/* <div style={{ fontSize: 11, color: COLORS.textMuted }}>{empCode}</div> */}
    </div>
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  locCode?: string;
  fromDate?: string;
  toDate?: string;
  pickupShift?: string;
  dropShift?: string;
  members?: string;
}

const NA_SHIFT_TIME = "NA";

// ─── Page ─────────────────────────────────────────────────────────────────────

const CreateRosterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { DatePicker } = useUILibrary();
  const { RangePicker } = DatePicker as any;
  const [errors, setErrors] = useState<FormErrors>({});

  const [memberSearch, setMemberSearch] = useState("");

  // ── Redux state (unchanged) ───────────────────────────────────────────────
  const {
    selectedLocCode,
    selectedMemberEmpIds,
    selectedWeeklyOffDays,
    selectedPickupShiftId,
    selectedDropShiftId,
    tripType,
    fromDate,
    toDate,
  } = useSelector((s: RootState) => s.rosterUi);

  const [rangeValue, setRangeValue] = useState<[Dayjs | null, Dayjs | null]>(
    () => [fromDate ? dayjs(fromDate) : null, toDate ? dayjs(toDate) : null],
  );

  // ── NEW: shift-validation state ───────────────────────────────────────────
  // null = not fetched | 1/2 = normal flow | 3/4/5 = WiseID flow
  const [validationType, setValidationType] = useState<number | null>(null);
  const [selectedWiseId, setSelectedWiseId] = useState<string>("");

  const [fetchShiftValidation] = useLazyGetShiftValidationQuery();

  // ── NEW: isWiseIdMode — only for LOGIN / LOGOUT tabs, never for BOTH ──────
  // BOTH tab always uses the existing pick-against-drop flow unchanged.
  const isWiseIdMode =
    tripType !== "BOTH" && validationType !== null && validationType >= 3;

  // ── Derived visibility (unchanged) ───────────────────────────────────────
  const showPickup = tripType === "LOGIN" || tripType === "BOTH";
  const showDrop = tripType === "LOGOUT" || tripType === "BOTH";

  // ── NEW: trigger shift-validation on every office + tab change ────────────
  useEffect(() => {
    if (!selectedLocCode) {
      setValidationType(null);
      setSelectedWiseId("");
      return;
    }
    fetchShiftValidation(selectedLocCode, false) // false = always refetch
      .then((res) => setValidationType(res.data ?? null))
      .catch(() => setValidationType(null));
  }, [selectedLocCode, tripType, fetchShiftValidation]);

  // Reset WiseID + members when office or tab changes
  useEffect(() => {
    setSelectedWiseId("");
    dispatch(clearAllMembers());
  }, [selectedLocCode, tripType, dispatch]);

  console.log("setValidationType after useEffect", validationType);

  // ── Shifts — only for normal flow (types 1/2) or BOTH tab ────────────────
  // Skip getUserShifts when in WiseID mode (LOGIN/LOGOUT tabs only)
  const { data: shiftData, isLoading: shiftsLoading } = useGetUserShiftsQuery(
    selectedLocCode ?? 0,
    {
      skip: !selectedLocCode || selectedLocCode <= 0 || isWiseIdMode,
      refetchOnMountOrArgChange: true,
    },
  );

  // Reset shift selections when location or trip type changes
  useEffect(() => {
    dispatch(setPickupShift(""));
    dispatch(setDropShift(""));
  }, [selectedLocCode, dispatch]);

  useEffect(() => {
    dispatch(setPickupShift(""));
    dispatch(setDropShift(""));
  }, [tripType, dispatch]);

  useEffect(() => {
    dispatch(setDropShift(""));
  }, [selectedPickupShiftId, dispatch]);

  // ── GetPickupAgainstDropShift — BOTH tab behaviour unchanged ──────────────
  // This query is ONLY used when showDrop is true (LOGOUT or BOTH tab).
  // For BOTH tab:   gated on selectedPickupShiftId (existing behaviour)
  // For LOGOUT tab: uses pickShiftID=0 to get all drop shifts (unblocked)
  const pickShiftIdForDrop =
    tripType === "BOTH" ? Number(selectedPickupShiftId) : 0;

  const { data: dropShifts = [], isLoading: dropShiftsLoading } =
    useGetPickupAgainstDropShiftQuery(
      { locCode: selectedLocCode!, pickShiftID: pickShiftIdForDrop },
      {
        skip:
          !selectedLocCode ||
          !showDrop ||
          isWiseIdMode || // skip in WiseID mode
          (tripType === "BOTH" && !selectedPickupShiftId), // BOTH still gated
        refetchOnMountOrArgChange: true,
      },
    );

  // ── Supervisors ───────────────────────────────────────────────────────────
  const pickShiftId = Number(selectedPickupShiftId) || 0;
  const dropShiftId = Number(selectedDropShiftId) || 0;

  const {
    data: normalSupervisors = [],
    isLoading: normalSupervisorsLoading,
    error: normalSupervisorsError,
    refetch: refetchNormalSupervisors,
  } = useGetRosterSupervisorsQuery(
    {
      locCode: selectedLocCode!,
      pickShift: pickShiftId,
      dropShift: dropShiftId,
    },
    {
      skip:
        isWiseIdMode || // skip in WiseID mode
        !selectedLocCode ||
        (showPickup && !pickShiftId) ||
        (showDrop && !dropShiftId),
      refetchOnMountOrArgChange: true,
    },
  );

  // ── NEW: WiseID lookup + employee list (LOGIN / LOGOUT, types 3/4/5) ──────
  const { data: wiseIdOptions = [] } = useGetLookupBasedonShiftValidationQuery(
    selectedLocCode ?? 0,
    { skip: !selectedLocCode || !isWiseIdMode },
  );

  const {
    data: wiseIdSupervisors = [],
    isLoading: wiseIdSupervisorsLoading,
    error: wiseIdSupervisorsError,
    refetch: refetchWiseIdSupervisors,
  } = useGetRosterSupervisorsByWiseIdQuery(
    { locCode: selectedLocCode!, wiseId: selectedWiseId },
    {
      skip: !selectedLocCode || !isWiseIdMode || !selectedWiseId,
      refetchOnMountOrArgChange: true,
    },
  );

  // ── Unified member source ─────────────────────────────────────────────────
  const supervisors = isWiseIdMode ? wiseIdSupervisors : normalSupervisors;
  const supervisorsLoading = isWiseIdMode
    ? wiseIdSupervisorsLoading
    : normalSupervisorsLoading;
  const supervisorsError = isWiseIdMode
    ? wiseIdSupervisorsError
    : normalSupervisorsError;
  const refetchSupervisors = isWiseIdMode
    ? refetchWiseIdSupervisors
    : refetchNormalSupervisors;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { updateSchedules, isCreating } = useRosterMutations({
    onCreateSuccess: () => {
      dispatch(resetCreateForm());
      setErrors({});
      setSelectedWiseId("");
      setRangeValue([null, null]);
    },
  });

  // ── Lookups ───────────────────────────────────────────────────────────────
  const { locationOptions, isLoading: loadingLookup } = useLookups({
    only: ["locationOptions"],
  });

  // ── Shift options ─────────────────────────────────────────────────────────
  const pickShiftOptions = useMemo(
    () =>
      (shiftData?.pickShifts ?? []).map((s) => ({
        value: String(s.shiftId),
        label: s.shiftStart,
      })),
    [shiftData],
  );

  const dropShiftOptions = useMemo(
    () =>
      dropShifts.map((s) => ({
        value: String(s.shiftId),
        label: s.shiftStart,
      })),
    [dropShifts],
  );

  const wiseIdSelectOptions = useMemo(
    () => wiseIdOptions.map((w) => ({ value: w.WiseID, label: w.WiseName })),
    [wiseIdOptions],
  );

  // ── Members ───────────────────────────────────────────────────────────────
  const allMembers = supervisors;

  const filteredMembers = useMemo(
    () =>
      memberSearch.trim()
        ? allMembers.filter((m) =>
            m.empName.toLowerCase().includes(memberSearch.toLowerCase()),
          )
        : allMembers,
    [allMembers, memberSearch],
  );

  const allSelected =
    allMembers.length > 0 &&
    allMembers.every((m) => selectedMemberEmpIds.includes(m.empId));

  // ── Date constraints ──────────────────────────────────────────────────────
  const disableDate = (current: dayjs.Dayjs) =>
    current && current.isBefore(dayjs().startOf("day"));

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!selectedLocCode) e.locCode = "Office is required.";
    if (!fromDate) e.fromDate = "From date is required.";
    if (!toDate) e.toDate = "To date is required.";

    if (isWiseIdMode) {
      // LOGIN / LOGOUT + validation 3/4/5 → require WiseID selection
      if (!selectedWiseId) e.pickupShift = "Shift configuration is required.";
    } else {
      // BOTH tab or normal validation → original shift checks
      if (showPickup && !selectedPickupShiftId)
        e.pickupShift = "Login shift is required.";
      if (showDrop && !selectedDropShiftId)
        e.dropShift = "Logout shift is required.";
    }

    if (selectedMemberEmpIds.length === 0)
      e.members = "Select at least one member.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    let shiftStart: string;
    let shiftEnd: string;

    if (isWiseIdMode) {
      // WiseName: "09:00 AM to 04:00 PM" → split on " to "
      const wise = wiseIdOptions.find((w) => w.WiseID === selectedWiseId);
      const parts = (wise?.WiseName ?? "").split(" to ");
      shiftStart = showPickup ? (parts[0]?.trim() ?? "") : NA_SHIFT_TIME;
      shiftEnd = showDrop ? (parts[1]?.trim() ?? "") : NA_SHIFT_TIME;
    } else {
      // Original logic (unchanged)
      const pickupShift = shiftData?.pickShifts.find(
        (s) => String(s.shiftId) === selectedPickupShiftId,
      );
      const dropShift = dropShifts.find(
        (s) => String(s.shiftId) === selectedDropShiftId,
      );
      const shiftSt = showPickup
        ? (pickupShift?.shiftStart ?? "")
        : NA_SHIFT_TIME;
      const shiftEn = showDrop ? (dropShift?.shiftStart ?? "") : NA_SHIFT_TIME;
      if (showPickup && !pickupShift) return;
      if (showDrop && !dropShift) return;
      shiftStart = shiftSt;
      shiftEnd = shiftEn;
    }

    updateSchedules({
      ScheduleUpdateVersion: "WEB",
      LocCode: selectedLocCode!,
      FromDate: fromDate!,
      ToDate: toDate!,
      ShiftStart: shiftStart,
      ShiftEnd: shiftEnd,
      WeekOffs: selectedWeeklyOffDays.join(","),
      User_Empids: selectedMemberEmpIds.join(","),
    });
  };

  // ── Date range handler ────────────────────────────────────────────────────
  const handleDateRange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null, strings: [string, string]) => {
      setRangeValue(dates ?? [null, null]);
      if (strings[0] && strings[1]) {
        dispatch(setFromDate(strings[0]));
        dispatch(setToDate(strings[1]));
        clearError("fromDate");
        clearError("toDate");
      }
      if (!dates) {
        dispatch(setFromDate(""));
        dispatch(setToDate(""));
      }
    },
    [dispatch],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "0" }}>
      {/* ── Page Header ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 20px 10px",
          background: "#fff",
          borderBottom: `1px solid ${COLORS.border}`,
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <BackSvg />
        </button>

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: COLORS.lightBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RosterIconSvg />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.textBody,
              lineHeight: 1.3,
            }}
          >
            Create New Roster
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>
            Fill in the details below to create a new schedule
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/schedule/bulk-roaster-upload")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: `1.5px solid ${COLORS.primaryDark}`,
            background: "#fff",
            color: COLORS.primaryDark,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          <UploadSvg />
          Bulk Upload
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div style={{ padding: "0 24px 24px" }}>
        <SectionCard icon={<CalSvg />} title="Schedule Details">
          <RosterTypeTabs
            value={tripType}
            onChange={(v) => dispatch(setTripType(v))}
          />

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Office */}
            <div style={{ flex: "0 0 200px", minWidth: 160 }}>
              <FieldLabel required>Office</FieldLabel>
              <Select
                value={
                  selectedLocCode != null ? String(selectedLocCode) : undefined
                }
                onChange={(v: string) => {
                  dispatch(setLocCode(Number(v)));
                  clearError("locCode");
                }}
                autoSelectFirst={true}
                options={locationOptions.map((o) => ({
                  ...o,
                  value: String(o.value),
                }))}
                placeholder={loadingLookup ? "Loading…" : "Select Office"}
                loading={supervisorsLoading}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: `1px solid ${T.formcss.greyBorder}`,
                }}
                showSearch
                filterOption={(
                  input: string,
                  option: { label: string; value: string },
                ) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
              <FieldError msg={errors.locCode} />
            </div>

            {/* Date Range */}
            <div style={{ flex: "0 0 auto" }}>
              <FieldLabel required>Select Date</FieldLabel>
              <RangePicker
                format="YYYY-MM-DD"
                value={rangeValue}
                onChange={handleDateRange}
                disabledDate={disableDate}
                allowClear
                style={{
                  height: 36,
                  width: 230,
                  fontSize: 12,
                  background: "#fff",
                  border: `1px solid ${T.formcss.greyBorder}`,
                }}
              />
              <FieldError msg={errors.fromDate ?? errors.toDate} />
            </div>

            {/* ── Shift area ──────────────────────────────────────────────────
                BOTH tab      → always normal pick/drop flow (unchanged)
                LOGIN/LOGOUT  → WiseID dropdown (types 3/4/5) OR normal shift (types 1/2)
            ─────────────────────────────────────────────────────────────────── */}

            {/* WiseID mode: LOGIN or LOGOUT tab + validationType 3/4/5 */}
            {isWiseIdMode && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <FieldLabel required>Shift Configuration</FieldLabel>
                <Select
                  value={selectedWiseId || undefined}
                  onChange={(v: string) => {
                    setSelectedWiseId(v);
                    clearError("pickupShift");
                    dispatch(clearAllMembers());
                  }}
                  options={wiseIdSelectOptions}
                  placeholder={
                    wiseIdSelectOptions.length === 0
                      ? "No configurations"
                      : "Select shift configuration"
                  }
                  disabled={
                    !selectedLocCode || wiseIdSelectOptions.length === 0
                  }
                  style={{
                    width: "100%",
                    background: "#fff",
                    border: `1px solid ${T.formcss.greyBorder}`,
                  }}
                  showSearch
                  filterOption={(
                    input: string,
                    option: { label: string; value: string },
                  ) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
                <FieldError msg={errors.pickupShift} />
              </div>
            )}

            {/* Normal mode — Login Shift (LOGIN tab or BOTH tab) */}
            {!isWiseIdMode && showPickup && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldLabel required>Login Shift</FieldLabel>
                <Select
                  value={selectedPickupShiftId || undefined}
                  onChange={(v: string) => {
                    dispatch(setPickupShift(v));
                    clearError("pickupShift");
                  }}
                  options={pickShiftOptions}
                  placeholder={
                    !selectedLocCode
                      ? "Select office first"
                      : shiftsLoading
                        ? "Loading…"
                        : "Select login shift"
                  }
                  disabled={!selectedLocCode || shiftsLoading}
                  loading={shiftsLoading}
                  style={{
                    width: "100%",
                    background: "#fff",
                    border: `1px solid ${T.formcss.greyBorder}`,
                  }}
                />
                <FieldError msg={errors.pickupShift} />
              </div>
            )}

            {/* Normal mode — Logout Shift (LOGOUT tab or BOTH tab)
                BOTH   tab: gated on login shift (existing behaviour, unchanged)
                LOGOUT tab: uses pickShiftID=0 → not gated (unblocked)         */}
            {!isWiseIdMode && showDrop && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldLabel required>Logout Shift</FieldLabel>
                <Select
                  value={selectedDropShiftId || undefined}
                  onChange={(v: string) => {
                    dispatch(setDropShift(v));
                    clearError("dropShift");
                  }}
                  options={dropShiftOptions}
                  placeholder={
                    !selectedLocCode
                      ? "Select office first"
                      : tripType === "BOTH" && !selectedPickupShiftId
                        ? "Select login shift first"
                        : dropShiftsLoading
                          ? "Loading…"
                          : "Select logout shift"
                  }
                  disabled={
                    !selectedLocCode ||
                    (tripType === "BOTH" && !selectedPickupShiftId) || // gate only for BOTH tab
                    dropShiftsLoading
                  }
                  loading={dropShiftsLoading}
                  style={{
                    width: "100%",
                    background: "#fff",
                    border: `1px solid ${T.formcss.greyBorder}`,
                  }}
                />
                <FieldError msg={errors.dropShift} />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Weekly Off Days ─────────────────────────────────── */}
        <SectionCard icon={<CalSvg />} title="Weekly Off Days">
          <div
            style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}
          >
            Select days
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            {WEEKLY_OFF_OPTIONS.map((day) => (
              <DayPill
                key={day.value}
                day={day.label}
                selected={selectedWeeklyOffDays.includes(day.value)}
                onClick={() => dispatch(toggleWeeklyOffDay(day.value))}
              />
            ))}
          </div>
        </SectionCard>

        {/* ── Select Members ───────────────────────────────────── */}
        <SectionCard icon={<UsersSvg />} title="Select Members">
          <ApiStateWrapper
            isLoading={supervisorsLoading}
            error={supervisorsError}
            isEmpty={!supervisorsLoading && allMembers.length === 0}
            onRetry={refetchSupervisors}
            emptyMessage={
              !selectedLocCode
                ? "Select an office to see members."
                : isWiseIdMode && !selectedWiseId
                  ? "Select a shift configuration to see members."
                  : "No members found for this office."
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ position: "relative", flex: 1, maxWidth: 220 }}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="5"
                    stroke="#9ca3af"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M10 10l3 3"
                    stroke="#9ca3af"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by name…"
                  style={{
                    width: "100%",
                    paddingLeft: 28,
                    paddingRight: 8,
                    paddingTop: 6,
                    paddingBottom: 6,
                    border: `1px solid ${COLORS.inputBorder}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: "inherit",
                    color: COLORS.textBody,
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff",
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.primaryDark,
                  whiteSpace: "nowrap",
                }}
              >
                {selectedMemberEmpIds.length} / {allMembers.length} Selected
              </span>

              <FieldError msg={errors.members} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
                onClick={() =>
                  allSelected
                    ? dispatch(clearAllMembers())
                    : dispatch(setAllMembers(allMembers.map((m) => m.empId)))
                }
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.primaryDark,
                  }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </span>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: `1px solid ${allSelected ? COLORS.primaryDark : COLORS.inputBorder}`,
                    background: allSelected
                      ? COLORS.primaryDark
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {allSelected && (
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 8,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {filteredMembers.length === 0 && memberSearch.trim() ? (
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    padding: "8px 0",
                    gridColumn: "1/-1",
                  }}
                >
                  No members match "{memberSearch}"
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <MemberCard
                    key={member.empId}
                    name={member.empName}
                    gender={member.gender}
                    checked={selectedMemberEmpIds.includes(member.empId)}
                    onClick={() => {
                      dispatch(toggleMember(member.empId));
                      if (errors.members) clearError("members");
                    }}
                  />
                ))
              )}
            </div>
          </ApiStateWrapper>
        </SectionCard>

        {/* ── Action Buttons ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            maxWidth: "520px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/schedule/roaster-data")}
            style={{
              flex: 1,
              minWidth: "160px",
              maxWidth: "220px",
              padding: "10px 24px",
              borderRadius: 50,
              border: `1.5px solid ${COLORS.primaryDark}`,
              background: "#fff",
              color: COLORS.primaryDark,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            <EyeSvg />
            View Schedule
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isCreating}
            style={{
              flex: 1,
              minWidth: "160px",
              maxWidth: "220px",
              padding: "10px 24px",
              borderRadius: 50,
              border: "none",
              background: isCreating ? COLORS.primaryMid : COLORS.primaryDark,
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isCreating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
              opacity: isCreating ? 0.85 : 1,
            }}
          >
            <SaveSvg />
            {isCreating ? "Saving…" : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRosterPage;
