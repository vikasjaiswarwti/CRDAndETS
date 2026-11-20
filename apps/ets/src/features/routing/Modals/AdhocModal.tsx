import React, { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { AlertCircle, Search, X } from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGetUserShiftsQuery } from "../../roaster/services/RosterApi";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useDebouncedValue } from "../../route-optimization/hooks/useDebouncedValue";
import {
  useGetAdhocRouteQuery,
  useCreateAdhocRouteMutation,
  useUpdateAdhocRouteMutation,
} from "../../route-optimization/services/routeMakerApi";
import { extractApiError } from "../../route-optimization/utils/extractApiError";
import { T } from "../../../styles/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

const REMARKS_MAX = 120;

const C = {
  green: T.brand.primary,
  greenBg: T.brand.subtle,
  text: T.text.primary,
  sub: T.text.tertiary,
  muted: T.text.muted,
  border: T.border.input,
  headerBg: "#F9FAFB",
  required: T.error.text,
  male: "#2563EB",
  female: "#DB2777",
};

// Deterministic avatar colours so the same employee always gets the same one
const AVATAR_COLORS = [
  "#2563EB",
  "#DB2777",
  "#D97706",
  "#0D9488",
  "#7C3AED",
  "#059669",
];

function avatarColor(seed: number) {
  return AVATAR_COLORS[Math.abs(seed) % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** "09:30" | "21:00:00" → "09:30 AM" | "09:00 PM"; anything else passes through */
// function to12h(time: string) {
//   const m = /^(\d{1,2}):(\d{2})/.exec(time ?? "");
//   if (!m) return time;
//   const h = Number(m[1]);
//   const suffix = h >= 12 ? "PM" : "AM";
//   const h12 = h % 12 === 0 ? 12 : h % 12;
//   return `${String(h12).padStart(2, "0")}:${m[2]} ${suffix}`;
// }

interface Option {
  label: string;
  value: number;
}

export interface AdhocEmployee {
  empId: number;
  name: string;
  employeeId: string;
  gender: string;
  zone: string;
  area: string;
}

function toEmployee(option: Option): AdhocEmployee {
  const separatorIndex = option.label.lastIndexOf(" - ");
  return {
    empId: Number(option.value),
    name:
      (separatorIndex >= 0
        ? option.label.slice(0, separatorIndex)
        : option.label) || "Unnamed",
    employeeId:
      separatorIndex >= 0 ? option.label.slice(separatorIndex + 3) : "",
    gender: "",
    zone: "",
    area: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Small building blocks
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
}> = ({ children, required }) => (
  <div
    style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}
  >
    {children}
    {required && <span style={{ color: C.required, marginLeft: 2 }}>*</span>}
  </div>
);

const TripTypeToggle: React.FC<{
  value: 1 | 2;
  onChange: (v: 1 | 2) => void;
}> = ({ value, onChange }) => (
  <div
    style={{
      display: "flex",
      height: 36,
      padding: 3,
      gap: 3,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      background: "#fff",
    }}
  >
    {(
      [
        { v: 1, label: "Login" },
        { v: 2, label: "Logout" },
      ] as const
    ).map((opt) => {
      const active = value === opt.v;
      return (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          style={{
            flex: 1,
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            color: active ? "#fff" : C.text,
            background: active ? C.green : "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const Checkbox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: 4,
      border: `1.5px solid ${checked ? C.green : "#D1D5DB"}`,
      background: checked ? C.green : "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.1s",
    }}
  >
    {checked && (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </div>
);

const GenderMark: React.FC<{ gender: string }> = ({ gender }) => {
  if (gender === "M")
    return <span style={{ color: C.male, fontSize: 12 }}>♂</span>;
  if (gender === "F")
    return <span style={{ color: C.female, fontSize: 12 }}>♀</span>;
  return null;
};

const EmployeeTile: React.FC<{
  emp: AdhocEmployee;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}> = ({ emp, checked, disabled = false, onToggle }) => {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onToggle}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 8px",
        borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        minWidth: 0,
        background: checked ? C.greenBg : "transparent",
        transition: "background 0.1s",
        opacity: disabled ? 0.8 : 1,
      }}
    >
      <Checkbox checked={checked} />
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: avatarColor(emp.empId),
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {initials(emp.name)}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {emp.name}
          </span>
          <GenderMark gender={emp.gender} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

// export interface AdhocTripPayload {
//   locCode: number;
//   tripDate: string;
//   tripType?: number; // 1 = Login, 2 = Logout (defaults to Login)
//   shiftId?: number;
// }

interface Props {
  officeOptions: { value: string | number; label: string }[];
  open: boolean;
  onClose: () => void;
  dsId?: number;
  payload?: {
    locCode: number;
    tripDate: string;
    tripType?: number;
  };
  onSuccess?: () => void;
}

export const AdhocModal: React.FC<Props> = ({
  officeOptions,
  open,
  onClose,
  dsId,
  payload,
  onSuccess,
}) => {
  const { DatePicker, Select, message } = useUILibrary();
  const editDsId = dsId != null && dsId > 0 ? dsId : undefined;
  const isEditing = editDsId !== undefined;
  const {
    currentData: tripData,
    isFetching: adhocRouteLoading,
    error: adhocRouteError,
  } = useGetAdhocRouteQuery(editDsId ?? 0, {
    skip: !open || editDsId === undefined,
  });

  const [formOverrides, setFormOverrides] = useState<{
    tripType?: 1 | 2;
    locCode?: number;
    shiftId?: number | null;
    tripDate?: string;
    selected?: Map<number, AdhocEmployee>;
    remarks?: string;
  }>({});
  const tripType =
    formOverrides.tripType ??
    (tripData?.tripType === 2 || payload?.tripType === 2 ? 2 : 1);
  const locCode =
    formOverrides.locCode ?? tripData?.locCode ?? payload?.locCode ?? 1;
  const shiftId =
    formOverrides.shiftId === undefined
      ? (tripData?.shiftId ?? 1)
      : (formOverrides.shiftId ?? undefined);
  const tripDate =
    formOverrides.tripDate ??
    tripData?.tripDate ??
    payload?.tripDate ??
    dayjs().format("YYYY-MM-DD");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const selectedFromTripData = useMemo(
    () =>
      new Map(
        (tripData?.passengers ?? []).map((passenger) => [
          Number(passenger.empId),
          {
            empId: Number(passenger.empId),
            name: passenger.passengerName || "Unnamed",
            employeeId: String(passenger.empId),
            gender: passenger.gender ?? "",
            zone: "",
            area: "",
          },
        ]),
      ),
    [tripData],
  );
  const selected = formOverrides.selected ?? selectedFromTripData;
  const remarks = formOverrides.remarks ?? tripData?.tripRemarks ?? "";
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Shifts — reloaded whenever the location changes ──────────────────────
  const { data: shiftData, isFetching: shiftsLoading } = useGetUserShiftsQuery(
    locCode,
    {
      skip: !open || !locCode || locCode <= 0,
      refetchOnMountOrArgChange: true,
    },
  );

  // ── Shift options ─────────────────────────────────────────────────────────
  const pickShiftOptions = useMemo<Option[]>(
    () =>
      (shiftData?.pickShifts ?? [])
        .filter((s) => s.shiftStart !== "NA")
        .map((s) => ({ value: s.shiftId, label: s.shiftStart })),
    [shiftData],
  );

  const dropShiftOptions = useMemo<Option[]>(
    () =>
      (shiftData?.dropShifts ?? [])
        .filter((s) => s.shiftStart !== "NA")
        .map((s) => ({ value: s.shiftId, label: s.shiftStart })),
    [shiftData],
  );

  const shiftOptions = tripType === 1 ? pickShiftOptions : dropShiftOptions;

  // A shift picked earlier may not exist for the current location / trip type
  const validShift = shiftOptions.find((o) => o.value === shiftId);
  const effectiveShift = validShift ?? shiftOptions[0];
  const effectiveShiftId = effectiveShift?.value;
  const datePickerValue = useMemo(() => dayjs(tripDate), [tripDate]);
  const disablePastDates = useCallback(
    (date: dayjs.Dayjs) => date.isBefore(dayjs(), "day"),
    [],
  );
  const handleDateChange = useCallback(
    (date: dayjs.Dayjs | null) => {
      if (!date) return;
      const nextTripDate = date.format("YYYY-MM-DD");
      if (tripDate !== nextTripDate) {
        setFormOverrides((previous) => ({
          ...previous,
          tripDate: nextTripDate,
        }));
      }
    },
    [tripDate],
  );
  const officeSelectOptions = useMemo(
    () =>
      officeOptions.map((option) => ({
        ...option,
        value: String(option.value),
      })),
    [officeOptions],
  );

  const { userOptions, isLoading: empLoading } = useLookups({
    locCode,
    searchTerm: debouncedSearch,
    only: ["userOptions"],
  });

  const employees = useMemo(() => {
    const employeesById = new Map(
      (userOptions ?? []).map((option) => [
        Number(option.value),
        toEmployee(option),
      ]),
    );

    (tripData?.passengers ?? []).forEach((passenger) => {
      const empId = Number(passenger.empId);
      const employee = employeesById.get(empId);
      employeesById.set(empId, {
        empId,
        name: passenger.passengerName || employee?.name || "Unnamed",
        employeeId: employee?.employeeId || String(passenger.empId),
        gender: passenger.gender || employee?.gender || "",
        zone: employee?.zone ?? "",
        area: employee?.area ?? "",
      });
    });

    if (!isEditing) return [...employeesById.values()];

    const tripEmployeeIds = new Set(
      (tripData?.passengers ?? []).map((passenger) => Number(passenger.empId)),
    );
    return [...employeesById.values()].filter((employee) =>
      tripEmployeeIds.has(employee.empId),
    );
  }, [isEditing, tripData, userOptions]);

  const [createAdhocRoute, { isLoading: creating }] =
    useCreateAdhocRouteMutation();
  const [updateAdhocRoute, { isLoading: updating }] =
    useUpdateAdhocRouteMutation();
  const submitting = creating || updating;
  const displayedError =
    errorMsg ?? (adhocRouteError ? extractApiError(adhocRouteError) : null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleEmployee = (emp: AdhocEmployee) => {
    setErrorMsg(null);
    setFormOverrides((previous) => {
      const next = new Map(previous.selected ?? selected);
      if (next.has(emp.empId)) next.delete(emp.empId);
      else next.set(emp.empId, emp);
      return { ...previous, selected: next };
    });
  };

  const handleLocationChange = (v: string | number) => {
    setFormOverrides((previous) => ({
      ...previous,
      locCode: Number(v),
      shiftId: null,
    }));
  };

  const handleTripTypeChange = (value: 1 | 2) => {
    setFormOverrides((previous) => ({
      ...previous,
      tripType: value,
      shiftId: null,
    }));
  };

  const handleShiftChange = (value: string | number) => {
    setFormOverrides((previous) => ({
      ...previous,
      shiftId: Number(value),
    }));
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const shiftLabel = effectiveShift?.label ?? "";
  const canSubmit =
    !!locCode &&
    effectiveShiftId != null &&
    !!tripDate &&
    selected.size > 0 &&
    !adhocRouteLoading &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || effectiveShiftId == null) return;
    setErrorMsg(null);
    try {
      const request = {
        locCode,
        shiftId: effectiveShiftId,
        tripType,
        tripDate,
        employeeIds: Array.from(selected.keys()),
      };
      const result =
        editDsId !== undefined
          ? await updateAdhocRoute({
              dsId: editDsId,
              ...request,
              tripRemarks: remarks.trim(),
            }).unwrap()
          : await createAdhocRoute({
              ...request,
              tripRemarks: remarks.trim() || undefined,
            }).unwrap();

      message.success(
        (result as { message?: string } | undefined)?.message ??
          (isEditing
            ? "Adhoc trip updated successfully."
            : "Adhoc trip created successfully."),
        4,
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(extractApiError(err));
    }
  };

  if (!open) return null;

  const tripTypeLabel = tripType === 1 ? "login" : "logout";
  const count = selected.size;

  return (
    // Backdrop
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
          width: 810,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 18px 12px",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {isEditing ? "Edit trip" : "New trip"}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
              {isEditing
                ? "Update employees and details for this adhoc trip."
                : "Books employees outside the rostered plan. The trip joins the stack as an adhoc route."}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            disabled={submitting}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: "#fff",
              color: C.text,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {displayedError && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "10px 12px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
              }}
            >
              <AlertCircle
                size={14}
                color="#EF4444"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span style={{ fontSize: 12, color: "#DC2626", lineHeight: 1.5 }}>
                {displayedError}
              </span>
            </div>
          )}

          {/* Trip details row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <FieldLabel required>Select Office</FieldLabel>
              <Select
                style={{
                  width: "100%",
                  height: 36,
                  background: T.formcss.inputBg,
                }}
                placeholder="Select office"
                value={locCode ? String(locCode) : undefined}
                onChange={handleLocationChange}
                options={officeSelectOptions}
                showSearch
              />
            </div>
            <div>
              <FieldLabel required>Trip type</FieldLabel>
              <TripTypeToggle
                value={tripType}
                onChange={handleTripTypeChange}
              />
            </div>

            <div>
              <FieldLabel required>Shift</FieldLabel>
              <Select
                style={{
                  width: "100%",
                  height: 36,
                  background: T.formcss.inputBg,
                }}
                placeholder={shiftsLoading ? "Loading…" : "Select shift"}
                autoSelectFirst={true}
                value={effectiveShiftId}
                onChange={handleShiftChange}
                options={shiftOptions}
                loading={shiftsLoading}
                showSearch
              />
            </div>
            <div>
              <FieldLabel required>Trip date</FieldLabel>
              <DatePicker
                style={{
                  width: "100%",
                  height: 36,
                  background: T.formcss.inputBg,
                  border: `1px solid ${T.formcss.greyBorder}`,
                  borderRadius: 8,
                }}
                value={datePickerValue}
                format="YYYY-MM-DD"
                allowClear={false}
                disabledDate={disablePastDates}
                onChange={handleDateChange}
              />
            </div>
          </div>

          {/* Employees */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                Employees
                <span style={{ color: C.required, marginLeft: 2 }}>*</span>
              </span>
              <span style={{ fontSize: 12, color: C.sub }}>
                {count} selected
              </span>
              {count > 0 && !isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setFormOverrides((previous) => ({
                      ...previous,
                      selected: new Map(),
                    }))
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.green,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Search */}
              {!isEditing && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <Search size={15} color={C.sub} style={{ flexShrink: 0 }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or ID"
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: C.text,
                      fontFamily: "inherit",
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: C.sub,
                        display: "flex",
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Grid */}
              <div
                style={{
                  height: 130,
                  overflowY: "auto",
                  padding: 6,
                }}
              >
                {!locCode ? (
                  <EmptyState text="Select a location to load employees." />
                ) : (empLoading || (isEditing && adhocRouteLoading)) &&
                  employees.length === 0 ? (
                  <EmptyState text="Loading employees…" />
                ) : employees.length === 0 ? (
                  <EmptyState
                    text={
                      search
                        ? "No employees match your search."
                        : "No employees found for this location."
                    }
                  />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {employees.map((emp) => (
                      <EmployeeTile
                        key={emp.empId}
                        emp={emp}
                        checked={selected.has(emp.empId)}
                        disabled={isEditing}
                        onToggle={() => toggleEmployee(emp)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <FieldLabel>Remarks</FieldLabel>
            <textarea
              value={remarks}
              maxLength={REMARKS_MAX}
              onChange={(e) =>
                setFormOverrides((previous) => ({
                  ...previous,
                  remarks: e.target.value,
                }))
              }
              placeholder="Why this trip is being added — e.g. late client call, system outage"
              rows={2}
              style={{
                width: "100%",
                resize: "none",
                padding: "10px 12px",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontSize: 13,
                color: C.text,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: C.sub,
                marginTop: 4,
              }}
            >
              <span>TripRemarks · optional, shown to the vendor</span>
              <span>
                {remarks.length}/{REMARKS_MAX}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 18px",
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: 600,
              color: count > 0 ? C.green : C.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {count > 0
              ? `${count} employee${count !== 1 ? "s" : ""}${
                  shiftLabel ? ` · ${shiftLabel} ${tripTypeLabel}` : ""
                }`
              : `Select employees to ${isEditing ? "update" : "create"} a trip`}
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "#fff",
              color: C.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              background: canSubmit || submitting ? C.green : "#D1D5DB",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {submitting
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save changes"
                : "Create trip"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      color: C.sub,
    }}
  >
    {text}
  </div>
);
