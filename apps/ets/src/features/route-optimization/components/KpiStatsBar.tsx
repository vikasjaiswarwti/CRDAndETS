// src/features/route-maker/components/KpiStatsBar.tsx

import { T } from "../constants/designTokens";

interface Props {
  // Direct API-level summary fields
  totalEmployees?: number;
  totalTrips?: number;
  guardTrips?: number;
  specialNeedsCount?: number;
  totalDistanceKm?: number;
  totalExtraKm?: number;
  totalVendorsAllocated?: number;

  hasSelection?: boolean;
  onNewRoute?: () => void;
  onHistory?: () => void;
  onDistribution: () => void;
}

// ── Single KPI tile — single row: icon · label · value ───────────────────────

function KpiTile({
  icon,
  label,
  value,
  valueColor,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "0 10px",
        borderRight: `1px solid ${T.border}`,
        height: "100%",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {/* icon */}
      <span
        style={{
          color: warn ? "#D97706" : T.muted,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      {/* label */}
      <span style={{ fontSize: 10, fontWeight: 600, color: T.muted }}>
        {label}
      </span>
      {/* value */}
      <span
        style={{ fontSize: 11, fontWeight: 800, color: valueColor ?? T.text }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icons = {
  employees: (
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
  ),
  trips: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  guard: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  special: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  distance: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  extra: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  vendor: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function KpiStatsBar({
  totalEmployees = 0,
  totalTrips = 0,
  guardTrips = 0,
  specialNeedsCount = 0,
  totalDistanceKm = 0,
  totalExtraKm = 0,
  totalVendorsAllocated = 0,
  onNewRoute,
  onHistory,
  onDistribution,
}: Props) {
  const extraKmWarn = totalExtraKm > 50;

  return (
    <div
      style={{
        height: T.statsH,
        background: "#ffffff",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        paddingInline: 16,
        gap: 10,
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* ── New Route button — distinct teal accent ── */}
      <button
        onClick={onNewRoute}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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

      {/* Divider */}
      <div
        style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }}
      />

      {/* ── KPI strip ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          height: 28,
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <KpiTile
          icon={Icons.employees}
          label="Total Employees"
          value={totalEmployees}
          valueColor="#1D6BF3"
        />
        <KpiTile icon={Icons.trips} label="Total Trips" value={totalTrips} />
        <KpiTile
          icon={Icons.guard}
          label="Guard Trips"
          value={guardTrips}
          valueColor={guardTrips > 0 ? "#7C3AED" : T.muted}
        />
        <KpiTile
          icon={Icons.special}
          label="Special Need Trips"
          value={specialNeedsCount}
          valueColor={specialNeedsCount > 0 ? "#F59E0B" : T.muted}
          warn={specialNeedsCount > 0}
        />
        <KpiTile
          icon={Icons.distance}
          label="Total Distance"
          value={`${totalDistanceKm.toFixed(2)} KM`}
        />
        <KpiTile
          icon={Icons.extra}
          label="Extra Distance"
          value={`${totalExtraKm.toFixed(1)} km`}
          valueColor={extraKmWarn ? "#D97706" : T.text}
          warn={extraKmWarn}
        />
        <KpiTile
          icon={Icons.vendor}
          label="Vendors Assigned"
          value={totalVendorsAllocated}
          valueColor={totalVendorsAllocated > 0 ? "#10B981" : T.muted}
        />
      </div>

      {/* Divider */}
      <div
        style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }}
      />

      {/* ── Right actions ── */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        {onHistory && (
          <button
            onClick={onHistory}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              height: 28,
              padding: "0 10px",
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: T.muted,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Trip History
          </button>
        )}

        <button
          onClick={onDistribution}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 28,
            padding: "0 10px",
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            color: T.muted,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          Distribution
        </button>
      </div>
    </div>
  );
}
