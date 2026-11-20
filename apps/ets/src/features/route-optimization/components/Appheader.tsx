// src/features/route-maker/components/AppHeader.tsx

import dayjs from "dayjs";
import { useState } from "react";
import { T } from "../constants/designTokens";
import CommutrLogoSvg from "../../../assets/commutr.svg";
import TripTypeBadge from "../../../shared/components/ui/LoginBadge";
import type { VehicleMode } from "../types/apiRouteTypes";
import { Select } from "../../../shared/components/ui/Select";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { NavLink } from "react-router-dom";

type HeaderVariant = "default" | "route-maker";

export interface AppHeaderProps {
  variant?: HeaderVariant;
  title?: string;
  onBack?: () => void;
  notificationCount?: number;
  userInitials?: string;
  userName?: string;
  onLogout?: () => void;
  dateLabel?: string;
  tripType?: number;
  // -------------
  isShuttleOn: boolean;
  vehicleMode?: VehicleMode;
  onVehicleModeChange?: (mode: VehicleMode) => void;
  shiftTime?: string;
  tripDate?: string;

  // ── Header filters: location / date / login-logout / shift ─────────────
  locationOptions?: { value: number | string; label: string }[];
  selectedLocCode?: number;
  onLocCodeChange?: (locCode: number) => void;
  onRouteDateChange?: (date: string) => void;
  onTripTypeChange?: (tripType: number) => void;
  shiftOptions?: { value: number; label: string }[];
  selectedShiftId?: number;
  onShiftChange?: (shiftId: number) => void;
  isShiftsLoading?: boolean;
  shiftsErrorMessage?: string;
  onNewRoute: () => void;
}

function CommutrLogo() {
  return (
    <NavLink to="/">
      <img
        src={CommutrLogoSvg}
        alt="Commutr"
        style={{ height: 18, width: "auto", display: "block" }}
      />
    </NavLink>
  );
}

function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button
      style={{
        position: "relative",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 6,
        borderRadius: T.radiusSm,
        display: "flex",
        alignItems: "center",
        color: T.muted,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: T.danger,
            border: `1.5px solid #fff`,
          }}
        />
      )}
    </button>
  );
}

function UserAvatar({
  initials = "AM",
  onClick,
}: {
  initials?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "3px 6px",
        borderRadius: T.radiusSm,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke={T.muted}
        strokeWidth="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
// interface CabsShuttleToggleProps {
//   value: VehicleMode;
//   onChange: (mode: VehicleMode) => void;
//   compact?: boolean; // ← ADD
// }

// function CabsShuttleToggle({
//   value,
//   onChange,
//   compact = false,
// }: CabsShuttleToggleProps) {
//   const options: { label: string; val: VehicleMode }[] = [
//     { label: "Cabs", val: "cabs" },
//     { label: "Shuttle", val: "shuttle" },
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         border: `1px solid ${T.border}`,
//         borderRadius: 8,
//         overflow: "hidden",
//         background: T.bg,
//       }}
//     >
//       {options.map(({ label, val }) => {
//         const isActive = value === val;
//         return (
//           <button
//             key={val}
//             onClick={() => onChange(val)}
//             style={{
//               padding: compact
//                 ? isActive
//                   ? "3px 8px"
//                   : "4px 9px"
//                 : isActive
//                   ? "4px 12px"
//                   : "5px 14px",
//               fontSize: compact ? 10 : 12, // ← 11 on mobile
//               fontWeight: 600,
//               cursor: "pointer",
//               border: isActive ? `1px solid ${T.selectedBlue}` : "none",
//               borderRadius: isActive ? 7 : 0,
//               margin: isActive ? 2 : 0,
//               background: isActive ? `${T.selectedBlue}` : "transparent",
//               color: isActive ? "#fff" : T.muted,
//               // transition: "all 0.15s",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {label}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

interface CabsShuttleToggleProps {
  value: VehicleMode;
  onChange: (mode: VehicleMode) => void;
  compact?: boolean; // ← ADD
}

function CabsShuttleToggle({
  value,
  onChange,
  compact,
}: CabsShuttleToggleProps) {
  const options: { label: string; val: VehicleMode }[] = [
    { label: "Cabs", val: "cabs" },
    { label: "Shuttle", val: "shuttle" },
  ];

  return (
    <div
      style={{
        display: "flex",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: T.bg,
      }}
    >
      {options.map(({ label, val }) => {
        const isActive = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            style={{
              padding: compact
                ? isActive
                  ? "3px 8px"
                  : "4px 9px"
                : isActive
                  ? "4px 12px"
                  : "5px 14px",
              fontSize: compact ? 11 : 12, // ← 11 on mobile
              fontWeight: 600,
              cursor: "pointer",
              border: isActive ? `1px solid ${T.selectedBlue}` : "none",
              borderRadius: isActive ? 7 : 0,
              margin: isActive ? 2 : 0,
              background: isActive ? `${T.selectedBlue}` : "transparent",
              color: isActive ? "#fff" : T.muted,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Trip type filter used by the header select — 0 = All, 1 = Login, 2 = Logout
const TRIP_TYPE_OPTIONS: { value: number; label: string }[] = [
  // { value: 0, label: "All" },
  { value: 1, label: "Login" },
  { value: 2, label: "Logout" },
];

// ── Route-maker header ────────────────────────────────────────────────────────

function RouteMakerHeader({
  title = "Route Optimization",
  // notificationCount = 0,
  // userInitials = "AM",
  // dateLabel,
  onLogout,
  tripType,
  isShuttleOn = false,
  vehicleMode, // ← new
  onVehicleModeChange, // ← new
  shiftTime,
  tripDate,
  // new Button Props
  locationOptions,
  selectedLocCode,
  onLocCodeChange,
  onRouteDateChange,
  onTripTypeChange,
  shiftOptions,
  selectedShiftId,
  onShiftChange,
  isShiftsLoading,
  shiftsErrorMessage,
  onNewRoute = () => {},
}: AppHeaderProps) {
  const { DatePicker } = useUILibrary();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const now =
  //   dateLabel ??
  //   new Date()
  //     .toLocaleString("en-GB", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: false,
  //     })
  //     .replace(",", "");

  const isMobile = useIsMobile(); // ← ADD

  // ── Mobile variant ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header
          style={{
            height: T.headerH,
            background: "#ffffff",
            borderBottom: `1px solid ${T.border}`,
            display: "grid",
            gridTemplateColumns: "1fr auto", // left | center | right
            alignItems: "center",
            paddingInline: 12,
            gap: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          {/* ── Center: Logo ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CommutrLogo />
          </div>

          {/* ── Right: Toggle + Badge ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isShuttleOn &&
              vehicleMode !== undefined &&
              onVehicleModeChange && (
                <CabsShuttleToggle
                  value={vehicleMode as VehicleMode}
                  onChange={onVehicleModeChange as (mode: VehicleMode) => void}
                  compact // ← smaller on mobile
                />
              )}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              aria-label="Open filters"
              aria-expanded={isMobileFilterOpen}
              style={{
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                background: "#fff",
                color: T.text,
                cursor: "pointer",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
            </button>
          </div>
        </header>
        {isMobileFilterOpen && (
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.4)",
            }}
          />
        )}
        <aside
          aria-label="Route filters"
          aria-hidden={!isMobileFilterOpen}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1001,
            width: "min(88vw, 360px)",
            background: "#fff",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.14)",
            transform: isMobileFilterOpen
              ? "translateX(0)"
              : "translateX(100%)",
            transition: "transform 0.2s ease",
            display: "flex",
            flexDirection: "column",
            pointerEvents: isMobileFilterOpen ? "auto" : "none",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong style={{ color: T.text, fontSize: 16 }}>Filters</strong>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Close filters"
              style={{
                border: "none",
                background: "transparent",
                color: T.muted,
                cursor: "pointer",
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => {
                setIsMobileFilterOpen(false);
                onNewRoute();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                height: 28,
                padding: "0 12px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
                letterSpacing: "0.01em",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adhoc Trip
            </button>
            {locationOptions && onLocCodeChange && (
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Office
                <Select
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.borderMd}` }}
                  placeholder="Select office"
                  value={selectedLocCode}
                  onChange={(v: string | number) => onLocCodeChange(Number(v))}
                  options={locationOptions}
                  autoSelectFirst={false}
                  showSearch
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </label>
            )}
            {onRouteDateChange && (
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Date
                <DatePicker
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.borderMd}` }}
                  value={tripDate ? dayjs(tripDate, "YYYY-MM-DD") : dayjs()}
                  format="DD/MM/YYYY"
                  allowClear={false}
                  onChange={(date) =>
                    onRouteDateChange(
                      date
                        ? date.format("YYYY-MM-DD")
                        : dayjs().format("YYYY-MM-DD"),
                    )
                  }
                />
              </label>
            )}
            {onTripTypeChange && (
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Trip Type
                <Select
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.borderMd}` }}
                  value={tripType ?? 0}
                  onChange={(v: string | number) => onTripTypeChange(Number(v))}
                  options={TRIP_TYPE_OPTIONS}
                  autoSelectFirst={false}
                />
              </label>
            )}
            {shiftOptions && onShiftChange && (
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Shift
                <Select
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.borderMd}` }}
                  placeholder={isShiftsLoading ? "Loading…" : "Select shift"}
                  value={Number(selectedShiftId)}
                  onChange={(v: string | number) => onShiftChange(Number(v))}
                  options={shiftOptions}
                  autoSelectFirst={false}
                  loading={isShiftsLoading}
                />
                {shiftsErrorMessage && !isShiftsLoading && (
                  <span
                    style={{ color: T.danger, fontSize: 11, fontWeight: 500 }}
                  >
                    {shiftsErrorMessage}
                  </span>
                )}
              </label>
            )}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              style={{
                border: "none",
                background: "#2563EB",
                color: "#FFFFFF",
                cursor: "pointer",
                padding: "9px 18px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                transition: "all 0.2s ease",
              }}
            >
              Apply
            </button>
          </div>
        </aside>
      </>
    );
  }

  const divider = (
    <div
      style={{ height: 20, width: 1, background: T.border, flexShrink: 0 }}
    />
  );

  return (
    <header
      style={{
        height: T.headerH,
        background: "#ffffff",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        paddingInline: 16,
        gap: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        position: "relative",
        zIndex: 100,
        overflowX: "auto",
      }}
    >
      {/* ── Logo ── */}
      <CommutrLogo />
      {divider}

      {/* ── Title ── */}
      <h1
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: T.text,
          letterSpacing: -0.3,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {title}
      </h1>
      {divider}

      {/* ── Cabs / Shuttle toggle ── */}
      {isShuttleOn && vehicleMode !== undefined && onVehicleModeChange && (
        <CabsShuttleToggle value={vehicleMode} onChange={onVehicleModeChange} />
      )}

      {/* ── Location select ── */}
      {locationOptions && onLocCodeChange && (
        <Select
          style={{ width: 180, flexShrink: 0, background:T.bg, border:`1px solid ${T.borderMd}` }}
          placeholder="Location"
          value={selectedLocCode}
          onChange={(v: string | number) => onLocCodeChange(Number(v))}
          options={locationOptions}
          autoSelectFirst={false}
          showSearch
          filterOption={(input: string, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      )}

      {/* ── Date — interactive when onRouteDateChange is provided ── */}
      {onRouteDateChange ? (
        <DatePicker
          style={{ width: 140, flexShrink: 0, background:T.bg, border:`1px solid ${T.borderMd}` }}
          value={tripDate ? dayjs(tripDate, "YYYY-MM-DD") : dayjs()}
          format="DD/MM/YYYY"
          allowClear={false}
          onChange={(date) =>
            onRouteDateChange(
              date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            )
          }
        />
      ) : (
        tripDate && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: "#F0FDF4",
              border: "1px solid #86EFAC",
              fontSize: 11,
              fontWeight: 700,
              color: "#15803D",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {tripDate}
          </div>
        )
      )}

      {/* ── Trip type (All / Login / Logout) — select, interactive when onTripTypeChange is provided ── */}
      {onTripTypeChange ? (
        <Select
          style={{ width: 96, flexShrink: 0,background:T.bg, border:`1px solid ${T.borderMd}` }}
          value={tripType ?? 0}
          onChange={(v: string | number) => onTripTypeChange(Number(v))}
          options={TRIP_TYPE_OPTIONS}
          autoSelectFirst={false}
        />
      ) : (
        <TripTypeBadge type={tripType === 2 ? "Logout" : "Login"} size={70} />
      )}

      {/* ── Shift select — populated from shift-route-info, replaces the static badge.
           On error, the select is hidden entirely (nothing valid to pick from) and
           the error pill alone takes its place, free to use the reclaimed width. ── */}
      {shiftOptions && onShiftChange ? (
        shiftsErrorMessage && !isShiftsLoading ? (
          <div
            title={shiftsErrorMessage}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              fontSize: 10,
              fontWeight: 600,
              color: "#991B1B",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              maxWidth: 300,
              flex: "0 1 auto",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {shiftsErrorMessage}
          </div>
        ) : (
          <Select
            style={{ width: 108, flexShrink: 0, background:T.bg, border:`1px solid ${T.borderMd}` }}
            placeholder={isShiftsLoading ? "Loading…" : "Shift"}
            value={Number(selectedShiftId)}
            onChange={(v: string | number) => onShiftChange(Number(v))}
            options={shiftOptions}
            autoSelectFirst={false}
            loading={isShiftsLoading}
          />
        )
      ) : (
        shiftTime && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              fontSize: 11,
              fontWeight: 700,
              color: "#1D4ED8",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {shiftTime}
          </div>
        )
      )}

      {/* ── Spacer pushes logout/notifications/avatar to the right ── */}
      <div style={{ flex: 1 }} />

      {onLogout && (
        <>
          {divider}
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.danger,
              fontSize: 11,
              fontWeight: 600,
              padding: 0,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Logout Shift
          </button>
        </>
      )}

      {/* ── Notifications + avatar (currently unused) ── */}
      {/* <NotificationBell count={notificationCount} /> */}
      {/* <UserAvatar initials={userInitials} /> */}
    </header>
  );
}

// ── Default header ────────────────────────────────────────────────────────────

function DefaultHeader({
  notificationCount = 0,
  userInitials = "AM",
}: AppHeaderProps) {
  return (
    <header
      style={{
        height: T.headerH,
        background: "#ffffff",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        paddingInline: 20,
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        zIndex: 100,
      }}
    >
      <div style={{ flex: 1 }} />
      <NotificationBell count={notificationCount} />
      <UserAvatar initials={userInitials} />
    </header>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function AppHeader({
  variant = "default",
  tripType,
  ...props
}: AppHeaderProps) {
  if (variant === "route-maker")
    return <RouteMakerHeader tripType={tripType} {...props} />;
  return <DefaultHeader {...props} />;
}
