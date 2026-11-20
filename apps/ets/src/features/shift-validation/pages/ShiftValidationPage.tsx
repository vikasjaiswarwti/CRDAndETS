// features/shift-validation/pages/ShiftValidationPage.tsx
//
// ── CHANGES ──────────────────────────────────────────────────────────────────
// API REFETCH
//   • createTabClicks counter: incremented on every "Create Shifts" tab click.
//   • useEffect on [createTabClicks, state.locCode] → calls refetch() so the
//     API fires on EVERY tab switch AND on every location change in create tab.
//   • Merged two duplicate activeTab useEffects into one switchTab() handler.
//   • Mapping tab: locCode effect unchanged (fetches validationType then mode).
//
// UI
//   • TripTypeBadge used in Login/Logout section headers.
//   • Logout grid uses red accent (#991B1B) + red dot.
//   • Per-section info Popover: explains what Login/Logout shifts are for the
//     selected office.
//   • "How it works" global Popover button in the page header actions (step by
//     step process guide).
//   • ShiftGrid now receives titleContent?: ReactNode — see note at bottom.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useShiftValidationState } from "../hooks/useShiftValidationState";
import { useShiftMutations } from "../hooks/useShiftMutations";
import { useLookups } from "../../lookups/hooks/useLookups";
import { ShiftGrid } from "./ShiftValidationGrid";
import { ShiftConfirmModal } from "../components/ShiftConfirmModal";
import { DefineShiftModal } from "../components/Defineshiftmodal";
import { ShiftIntervalFormModal } from "../components/ShiftintervalformModal";
import { ShiftFlowHelpModal } from "../components/Shiftflowhelpmodal";
import { getShiftPermissions, canModifyMode } from "../Shiftpermissions.config";
import { FeaturePageLayout } from "../../../shared/components/FeaturePageLayout/Featurepagelayout";
import { ErrorBoundary } from "../../../shared/components/ErrorBounadry/ErrorBoundary";
import { Select } from "../../../shared/components/ui/Select";
import TripTypeBadge from "../../../shared/components/ui/LoginBadge";
import type {
  ValidateType,
  CreateShiftIntervalDto,
} from "../types/shiftValidation.types";
import dayjs from "dayjs";
import { useLazyGetShiftValidationTypeQuery } from "../services/shiftValidationApi";
import { T } from "../constants/Token";
import HowItWorksContent from "./HowItWorksContent";
import { CalendarClock } from "lucide-react";

import { EmployeeListModal } from "../components/EmployeeListModal";
import { resetShiftValidationUi } from "../slice/shiftValidationSlice";
import { useDispatch } from "react-redux";

// ── Constants ──────────────────────────────────────────────────────────────────
const CURRENT_ROLE = "admin" as const;
const PERMISSIONS = getShiftPermissions(CURRENT_ROLE);

type PageTab = "create" | "mapping";
type LookupKey = "departmentOptions" | "lobOptions" | "projectOptions";

const MAPPING_MODE_OPTIONS: { label: string; value: ValidateType }[] = [
  { label: "User Wise", value: 2 },
  { label: "Department Wise", value: 3 },
  { label: "LOB Wise", value: 4 },
  { label: "Process Wise", value: 5 },
];

const MODE_LOOKUP_KEY: Partial<Record<ValidateType, LookupKey>> = {
  3: "departmentOptions",
  4: "lobOptions",
  5: "projectOptions",
};

const filterCard: React.CSSProperties = {
  background: "#fff",
  border: `1px solid #E5E7EB`,
  borderRadius: 12,
  padding: "14px 18px",
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const filterLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  flexShrink: 0,
};

// ── Info icon (inline SVG, no extra dependency) ────────────────────────────────
const InfoIcon: React.FC<{ color?: string }> = ({ color = "#9CA3AF" }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    style={{ display: "block", flexShrink: 0, cursor: "pointer" }}
  >
    <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
    <path
      d="M10 9v5M10 7v.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// ── Dot indicator ──────────────────────────────────────────────────────────────
const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }}
  />
);

// ── Per-section title node (TripTypeBadge + label + Popover info) ─────────────
interface SectionTitleProps {
  type: "Login" | "Logout";
  officeName: string;
  Popover: React.ComponentType<any>;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  type,
  officeName,
  Popover,
}) => {
  const isLogin = type === "Login";
  const accentColor = T.green600; //isLogin ? T.green600 : T.red600;
  const dotColor = isLogin ? T.green600 : T.red600;

  const popoverContent = (
    <div style={{ maxWidth: 260, fontSize: 13, lineHeight: 1.6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Dot color={dotColor} />
        <strong style={{ color: T.textPrimary }}>
          {isLogin ? "Active Login Shifts" : "Active Logout Shifts"}
        </strong>
      </div>
      <p style={{ margin: 0, color: T.textSecondary }}>
        {isLogin
          ? `These are the login (pickup) shift windows configured for ${
              officeName || "this office"
            }. Select the ones applicable for your employees.`
          : `These are the logout (drop) shift windows configured for ${
              officeName || "this office"
            }. Select the ones applicable for your employees.`}
      </p>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <TripTypeBadge type={type} size={60} />

      <Popover content={popoverContent} trigger="hover" placement="right">
        <span style={{ display: "flex", alignItems: "center" }}>
          <InfoIcon color={accentColor} />
        </span>
      </Popover>
    </div>
  );
};

// ── "How it works" popover content ────────────────────────────────────────────

// ── Inner content ──────────────────────────────────────────────────────────────
const ShiftValidationContent: React.FC = () => {
  const { Spin, Popover } = useUILibrary();

  const dispatch = useDispatch();

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<PageTab>("create");
  const [isDefineOpen, setIsDefineOpen] = useState(false);
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [isEmpListOpen, setIsEmpListOpen] = useState(false);

  // ← Move wiseLabel HERE, after state is available

  /**
   * Incremented every time the user clicks "Create Shifts" tab.
   * The refetch effect depends on this value, so the API fires on every click
   * regardless of whether activeTab or locCode actually changed.
   */
  const [createTabClicks, setCreateTabClicks] = useState(0);

  const [fetchValidationType, { isFetching: isFetchingVT }] =
    useLazyGetShiftValidationTypeQuery();
  const [fetchedVT, setFetchedVT] = useState<number | null>(null);

  // ── Shift validation state ───────────────────────────────────────────────────
  const {
    state,
    isLoading,
    handleSetMode,
    handleSetLocCode,
    handleSetWiseId,
    handleSetDate,
    handleTogglePickup,
    handleToggleDrop,
    handleSelectAllPickup,
    handleSelectAllDrop,
    handleReset,
    handleOpenConfirm,
    handleCloseConfirm,
    handleClearShifts,
    handleRefetch: refetch,
  } = useShiftValidationState(activeTab);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const {
    handleSubmit,
    isUpdating,
    defineShift,
    isDefining,
    createShiftInterval,
    isintervalCreating,
  } = useShiftMutations({
    tab: activeTab,
    onSuccess: () => {
      setIsDefineOpen(false);
      refetch();
      refetchLocations();
    },
    onCreateIntervalSuccess: async () => {
      await refetchIntervals(); // wait for fresh data
      setIsIntervalOpen(false); // then close
    },
  });

  // ── Lookups ──────────────────────────────────────────────────────────────────
  const {
    locationOptions,
    departmentOptions,
    lobOptions,
    projectOptions,
    intervalOptions,

    refetchIntervals, // ← add
    refetchLocations, // ← add
  } = useLookups({
    only: [
      "locationOptions",
      "departmentOptions",
      "lobOptions",
      "projectOptions",
      "intervalOptions",
    ],
  });

  const wiseLabel = MAPPING_MODE_OPTIONS.find(
    (m) => m.value === state.currentMode,
  )?.label;

  // ── Tab switcher ─────────────────────────────────────────────────────────────
  // Single entry point for tab changes. Merges the two previous duplicate
  // useEffects (both triggered on activeTab) into one synchronous handler.
  const switchTab = useCallback(
    (tab: PageTab) => {
      setActiveTab(tab);
      handleClearShifts(); // ← immediately clear stale data on ANY tab switch
      if (tab === "create") {
        handleSetMode(1 as ValidateType);
        handleSetDate(dayjs().format("YYYY-MM-DD"));
        setCreateTabClicks((c) => c + 1);
      }
    },
    [handleSetMode, handleSetDate, handleClearShifts],
  );

  // ── 1. CREATE TAB: re-fetch on every tab activation OR location change ────────
  //
  //   Dependencies:
  //     createTabClicks — bumped by switchTab() on every "Create Shifts" click
  //     state.locCode   — bumped whenever user picks a new office
  //
  //   This ensures the API is called:
  //     a) Every time the user clicks "Create Shifts" (even from the same tab)
  //     b) Whenever the office dropdown changes while on this tab
  //
  useEffect(() => {
    if (activeTab !== "create" || !state.locCode) return;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createTabClicks]);

  // ── 2. MAPPING TAB: fetch validation type on location change ─────────────────
  useEffect(() => {
    if (activeTab !== "mapping" || !state.locCode) return;
    setFetchedVT(null);
    fetchValidationType(state.locCode)
      .then((res) => {
        const vt = "data" in res && res.data != null ? res.data : 1;
        // NO clamp — pass VT as-is; hook handles mode 1 via fetchValidation on mapping tab
        setFetchedVT(vt);
        handleSetMode(vt as ValidateType);
      })
      .catch(() => {
        setFetchedVT(1);
        handleSetMode(1 as ValidateType);
      });
  }, [state.locCode, activeTab]);

  useEffect(() => {
    refetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset Redux state when page unmounts (user navigates away)
  useEffect(() => {
    return () => {
      dispatch(resetShiftValidationUi());
    };
  }, []); // empty deps — only fires on unmount

  // ── Derived values ───────────────────────────────────────────────────────────
  const lookupOptionsMap: Record<
    LookupKey,
    { label: string; value: string | number }[]
  > = { departmentOptions, lobOptions, projectOptions };

  const readonly = !canModifyMode(PERMISSIONS, state.currentMode);

  const officeName =
    locationOptions.find((o) => Number(o.value) === state.locCode)?.label ??
    String(state.locCode);

  const isUserMode = state.currentMode === 2;
  const lookupKey = MODE_LOOKUP_KEY[state.currentMode];
  const entityOptions = lookupKey ? lookupOptionsMap[lookupKey] : [];
  const showEntityDropdown =
    activeTab === "mapping" && !isUserMode && lookupKey !== undefined;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDefineSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      await defineShift({
        locCode: Number(values.locCode),
        interval: Number(values.interval),
      });
    },
    [defineShift],
  );

  const handleIntervalSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      await createShiftInterval({
        intervalMinute: Number(values.intervalMinute),
        intervalText: (values.intervalText as string) || null,
        active: true,
      } as CreateShiftIntervalDto);
    },
    [createShiftInterval],
  );

  // ── Page actions ──────────────────────────────────────────────────────────────
  const actions = (
    <>
      {/* Global "How it works" popover */}
      <Popover
        content={<HowItWorksContent />}
        trigger="click"
        placement="bottomRight"
        title={null}
      >
        <button
          style={{
            padding: "9px 18px",
            borderRadius: 50,
            border: `1px solid ${T.border}`,
            background: "#fff",
            color: T.textSecondary,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <InfoIcon color={T.green900} />
          How it works
        </button>
      </Popover>

      <button
        onClick={() => setIsIntervalOpen(true)}
        style={{
          padding: "9px 20px",
          borderRadius: 50,
          border: "none",
          background: T.green900,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        + Add Shift Interval
      </button>

      <button
        onClick={() => setIsDefineOpen(true)}
        style={{
          padding: "9px 20px",
          borderRadius: 50,
          border: "none",
          background: T.green900,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Generate Shifts
      </button>
    </>
  );

  // ── Shift grids (replace the isLoading guard) ─────────────────────────────────
  // Include isFetchingVT so we show spinner while validation type is loading
  // const isLoadingGrid = isLoading || (activeTab === "mapping" && isFetchingVT);

  const isLoadingGrid =
    isLoading ||
    (activeTab === "mapping" && isFetchingVT) ||
    // Bridge gap: VT resolved, office selected, not VT=1, data not yet loaded
    (activeTab === "mapping" &&
      !!state.locCode &&
      fetchedVT != null &&
      fetchedVT !== 1 &&
      !state.isDataLoaded);

  // ── Tab bar ───────────────────────────────────────────────────────────────────
  const tabBar = (
    <div
      style={{
        display: "flex",
        borderBottom: `1px solid ${T.border}`,
        marginBottom: 20,
      }}
    >
      {(
        [
          { key: "create", label: "Create Shifts" },
          { key: "mapping", label: "Employee & Shift Mapping" },
        ] as { key: PageTab; label: string }[]
      ).map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => switchTab(key)}
            style={{
              padding: "10px 22px",
              border: "none",
              background: "none",
              borderBottom: isActive
                ? `2.5px solid ${T.green900}`
                : "2.5px solid transparent",
              marginBottom: -1,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? T.green900 : T.textSecondary,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "color 0.15s, border-color 0.15s",
              userSelect: "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  // ── Empty message ─────────────────────────────────────────────────────────────
  const emptyMessage = (() => {
    if (activeTab === "create") return "Select an office to load shifts";
    if (isUserMode) return "Select an office to load user shifts";
    const wiseLabel =
      MAPPING_MODE_OPTIONS.find((m) => m.value === state.currentMode)?.label ??
      "entity";
    return `Select an office and ${wiseLabel} to load shifts`;
  })();

  // ── Shift grids with rich section headers ─────────────────────────────────────
  const gridContent = (
    <>
      {/* {!state.isDataLoaded && !isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
            gap: 8,
          }}
        >
          <CalendarClock size={40} strokeWidth={1.4} color={T.textSecondary} />
          <div
            style={{ fontSize: 14, fontWeight: 500, color: T.textSecondary }}
          >
            {emptyMessage}
          </div>
        </div>
      )} */}

      {!state.isDataLoaded && !isLoadingGrid && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
            gap: 8,
          }}
        >
          <CalendarClock size={40} strokeWidth={1.4} color={T.textSecondary} />
          <div
            style={{ fontSize: 14, fontWeight: 500, color: T.textSecondary }}
          >
            {emptyMessage}
          </div>
        </div>
      )}

      {isLoadingGrid && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Spin size="large" />
        </div>
      )}

      {state.isDataLoaded && !isLoadingGrid && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* ── Login (Pickup) Shifts ── */}
          <ShiftGrid
            shifts={state.pickupShifts}
            // titleContent renders instead of the plain `title` string in ShiftGrid.
            // See note at the bottom of this file about ShiftGrid props.
            titleContent={
              <SectionTitle
                type="Login"
                officeName={officeName}
                Popover={Popover}
              />
            }
            title="Login Shifts"
            onToggle={handleTogglePickup}
            onSelectAll={handleSelectAllPickup}
            readonly={readonly}
            accentColor={T.accentColorLogin}
            dotColor={T.pillLoginDot}
            pillBg={T.pillLoginBg}
          />

          {/* ── Logout (Drop) Shifts — red theme ── */}
          <ShiftGrid
            shifts={state.dropShifts}
            titleContent={
              <SectionTitle
                type="Logout"
                officeName={officeName}
                Popover={Popover}
              />
            }
            title="Logout Shifts"
            onToggle={handleToggleDrop}
            onSelectAll={handleSelectAllDrop}
            readonly={readonly}
            accentColor={T.accentColorLogout}
            dotColor={T.pillLogoutDot}
            pillBg={T.pillLogoutBg}
          />
        </div>
      )}
    </>
  );

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footer =
    state.isDataLoaded &&
    !isLoading &&
    !readonly &&
    !(activeTab === "mapping" && fetchedVT === 1) ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          onClick={handleReset}
          style={{
            padding: "9px 24px",
            borderRadius: 50,
            border: "1px solid #D1D5DB",
            background: "#fff",
            color: "#6B7280",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Reset
        </button>
        <button
          onClick={handleOpenConfirm}
          disabled={isUpdating}
          style={{
            padding: "9px 28px",
            borderRadius: 50,
            border: "none",
            background: isUpdating ? T.green600 : T.green900,
            color: "#fff",
            fontSize: 13,
            cursor: isUpdating ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isUpdating ? 0.7 : 1,
          }}
        >
          {isUpdating ? "Submitting…" : "Submit"}
        </button>
      </div>
    ) : undefined;

  // console.log("tab:", tab, "idKey:", idKey);
  console.log(
    "pickup slots:",
    state.pickupShifts.map((s) => ({
      shiftId: s.shiftId,
      controlId: s.controlId,
      active: s.active,
    })),
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <FeaturePageLayout
      title="Shift Management"
      subtitle="Configure shift schedules and assign them to employees across offices"
      actions={activeTab === "create" ? actions : null}
      footer={footer}
    >
      {tabBar}

      {/* ── TAB 1 : Create Shifts ── */}
      {activeTab === "create" && (
        <>
          <div style={filterCard}>
            <span style={filterLabel}>Select Office</span>
            <Select
              style={{ width: 220 }}
              placeholder="Select office"
              autoSelectFirst
              value={state.locCode || undefined}
              onChange={(v: number | string) => handleSetLocCode(Number(v))}
              options={locationOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          </div>
          {gridContent}
        </>
      )}

      {/* ── TAB 2 : Employee & Shift Mapping ── */}
      {/* {activeTab === "mapping" && (
        <>
          <div style={filterCard}>
            <span style={filterLabel}>Select Office</span>
            <Select
              style={{ width: 220 }}
              placeholder="Select office"
              autoSelectFirst
              value={state.locCode || undefined}
              onChange={(v: number | string) => handleSetLocCode(Number(v))}
              options={locationOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />

            {isFetchingVT ? (
              <span style={{ fontSize: 12, color: T.textSecondary }}>
                Loading…
              </span>
            ) : fetchedVT != null ? (
              <>{![1, 2].includes(fetchedVT) ? "Shifts" : ""}</>
            ) : (
              <span style={{ fontSize: 12, color: T.textSecondary }}>
                Select an office
              </span>
            )}

            {showEntityDropdown && (
              <Select
                style={{ width: 220 }}
                placeholder="Select entity"
                value={state.wiseId || undefined}
                autoSelectFirst
                onChange={(v: string | number | null | undefined) =>
                  handleSetWiseId(v != null ? String(v) : "")
                }
                options={entityOptions}
                showSearch
                filterOption={(input: string, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            )}

            <button
              onClick={() => setIsEmpListOpen(true)}
              style={{
                marginLeft: "auto",
                padding: "7px 18px",
                borderRadius: 50,
                border: `1px solid ${T.border}`,
                background: "#fff",
                color: T.textSecondary,
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              View Employees
            </button>
          </div>
          {gridContent}
        </>
      )} */}

      {/* ── TAB 2 : Employee & Shift Mapping ── */}
      {activeTab === "mapping" && (
        <>
          <div style={filterCard}>
            <span style={filterLabel}>Select Office</span>
            <Select
              style={{ width: 220 }}
              placeholder="Select office"
              autoSelectFirst
              value={state.locCode || undefined}
              onChange={(v: number | string) => handleSetLocCode(Number(v))}
              options={locationOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />

            {/* entity dropdown — only when VT is not 1 or 2 */}
            {!isFetchingVT &&
              fetchedVT != null &&
              fetchedVT !== 1 &&
              showEntityDropdown && (
                <Select
                  style={{ width: 220 }}
                  placeholder="Select entity"
                  value={state.wiseId || undefined}
                  autoSelectFirst
                  onChange={(v: string | number | null | undefined) =>
                    handleSetWiseId(v != null ? String(v) : "")
                  }
                  options={entityOptions}
                  showSearch
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              )}

            <button
              onClick={() => setIsEmpListOpen(true)}
              style={{
                marginLeft: "auto",
                padding: "7px 18px",
                borderRadius: 50,
                border: `1px solid ${T.border}`,
                background: "#fff",
                color: T.textSecondary,
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              View Employees
            </button>
          </div>

          {/* VT = 1: no mapping needed */}
          {!isFetchingVT && fetchedVT === 1 && state.locCode ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 12,
                padding: "16px 20px",
                marginTop: 4,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#16A34A"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 9v5M10 7v.5"
                  stroke="#16A34A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#15803D",
                    marginBottom: 4,
                  }}
                >
                  No mapping required for this office
                </div>
                <div
                  style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}
                >
                  This office uses <strong>Normal</strong> shift allocation.
                  Employees automatically receive all active shifts configured
                  in the <strong>Create Shifts</strong> tab — no manual
                  assignment needed.
                </div>
              </div>
            </div>
          ) : (
            gridContent
          )}
        </>
      )}

      {/* ── Modals ── */}
      <ShiftConfirmModal
        open={state.isConfirmModalOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleSubmit}
        isSubmitting={isUpdating}
        locCode={state.locCode}
        officeName={officeName}
        currentMode={state.currentMode}
        wiseId={state.wiseId}
        pickupShifts={state.pickupShifts}
        dropShifts={state.dropShifts}
        originalPickup={state.originalPickup}
        originalDrop={state.originalDrop}
      />
      <DefineShiftModal
        open={isDefineOpen}
        onClose={() => setIsDefineOpen(false)}
        onSubmit={handleDefineSubmit}
        isSubmitting={isDefining}
        locationOptions={locationOptions}
        intervalOptions={intervalOptions}
      />
      <ShiftIntervalFormModal
        open={isIntervalOpen}
        onClose={() => setIsIntervalOpen(false)}
        onSubmit={handleIntervalSubmit}
        isSubmitting={isintervalCreating}
      />
      <ShiftFlowHelpModal
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <EmployeeListModal
        open={isEmpListOpen}
        onClose={() => setIsEmpListOpen(false)}
        locCode={state.locCode}
        shiftValidationID={state.currentMode}
        wiseId={
          [1, 2].includes(state.currentMode) ? "0" : (state.wiseId ?? "0")
        }
        officeName={officeName}
        wiseLabel={wiseLabel}
      />
    </FeaturePageLayout>
  );
};

// ── Export ─────────────────────────────────────────────────────────────────────
export const ShiftValidationPage: React.FC = () => (
  <ErrorBoundary fallbackTitle="Shift Validation Error">
    <ShiftValidationContent />
  </ErrorBoundary>
);

export default ShiftValidationPage;

// ── NOTE: ShiftGrid changes needed ────────────────────────────────────────────
//
// Add two props to ShiftGrid (ShiftValidationGrid.tsx):
//
//   titleContent?: React.ReactNode   // renders instead of `title` string when provided
//   dotColor?: string                // dot color in shift pills (defaults to accentColor)
//
// In the grid's header render:
//   {props.titleContent ?? <span>{props.title}</span>}
//
// In each shift pill/chip, use `dotColor ?? accentColor` for the status dot.
// The `accentColor` prop is already passed as red (#991B1B) for logout grids,
// so pill borders / selected backgrounds will already follow the red theme
// as long as they reference `accentColor`.
