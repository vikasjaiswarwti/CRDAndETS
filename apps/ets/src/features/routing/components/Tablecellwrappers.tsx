// src/features/routeManagement/components/TableCellWrappers.tsx
//
// ─── REUSABLE OVERFLOW-SAFE CELL CONTENT WRAPPERS ────────────────────────────
//
// These are pure presentational components. They handle NO data fetching,
// NO side effects, NO context. They exist solely to enforce deterministic
// layout geometry inside table cells.
//
// All components are memoized — safe for use in virtualized lists.
// ─────────────────────────────────────────────────────────────────────────────

import { memo, type CSSProperties, type ReactNode } from "react";
import {
  BADGE_SAFE,
  CELL_INNER,
  CELL_INNER_SINGLE,
  ELLIPSIS,
} from "../constants/Routetablelayout";
import { RM_COLOR, RM_FONT } from "../Routeuiconfig";
import LoginIcon from "../assets/login.svg";
import LogoutIcon from "../assets/logout.svg";

// ─────────────────────────────────────────────────────────────────────────────
// CellStack — primary + secondary line layout
// ─────────────────────────────────────────────────────────────────────────────

interface CellStackProps {
  primary: ReactNode;
  secondary?: ReactNode;
}

/**
 * Renders a primary line and an optional secondary line (badge/label) inside
 * a fixed-height cell. The container is overflow:hidden so neither line can
 * expand the row, even if the secondary line wraps.
 */
export const CellStack = memo(function CellStack({
  primary,
  secondary,
}: CellStackProps) {
  return (
    <div style={CELL_INNER}>
      <div style={ELLIPSIS}>{primary}</div>
      {secondary !== undefined && (
        <div
          style={{
            ...BADGE_SAFE,
            // flex-shrink allows the secondary row to compress if space is
            // extremely tight, rather than overflow the cell vertically.
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          {secondary}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CellSingle — single-line cell
// ─────────────────────────────────────────────────────────────────────────────

interface CellSingleProps {
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Single-line cell content. Truncates with ellipsis.
 */
export const CellSingle = memo(function CellSingle({
  children,
  style,
}: CellSingleProps) {
  return (
    <div style={{ ...CELL_INNER_SINGLE, ...style }}>
      <span style={ELLIPSIS}>{children}</span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// LoginBadge — Login / Logout pill
// ─────────────────────────────────────────────────────────────────────────────

export const LoginBadge = memo(function LoginBadge({
  type,
}: {
  type: "Login" | "Logout";
}) {
  return type === "Login" ? (
    <img src={LoginIcon} alt="login" style={{ width: 52 }} />
  ) : (
    <img src={LogoutIcon} alt="login" style={{ width: 52 }} />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// RouteStatusBadge
// ─────────────────────────────────────────────────────────────────────────────

export const RouteStatusBadge = memo(function RouteStatusBadge({
  status,
}: {
  status: string;
}) {
  const isGenerated = status === "Routes Generated";
  if (isGenerated) {
    return (
      <span
        style={{
          ...BADGE_SAFE,
          gap: 3,
          fontSize: RM_FONT.xs,
          fontWeight: 500,
          color: RM_COLOR.green600,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: RM_COLOR.green500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="7"
            height="7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>

        <span style={ELLIPSIS}>Routes Generated</span>
      </span>
    );
  }
  return (
    <span
      style={{
        ...BADGE_SAFE,
        gap: 3,
        fontSize: RM_FONT.xs,
        fontWeight: 500,
        color: RM_COLOR.amber600,
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={ELLIPSIS}>Scheduled</span>
    </span>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// VehicleCell — "V / Ve / R" numeric display
// ─────────────────────────────────────────────────────────────────────────────

export const VehicleCell = memo(function VehicleCell({
  v,
  ve,
  r,
}: {
  v: number;
  ve: number;
  r: number;
}) {
  const isZero = v === 0 && ve === 0 && r === 0;
  return (
    <CellSingle
      style={{
        fontSize: RM_FONT.md,
        fontWeight: 600,
        color: isZero ? RM_COLOR.red500 : RM_COLOR.green600,
      }}
    >
      {v}/{ve}/{r}
    </CellSingle>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OccupancyCell — progress bar + vehicle info
// ─────────────────────────────────────────────────────────────────────────────

interface OccupancyCellProps {
  pct: number;
  vehicleInfo: string | null;
}

/**
 * Renders occupancy progress + label. When not generated, shows a placeholder.
 * The progress bar height is fixed so it cannot stretch the row regardless of
 * the vehicleInfo string length.
 */
export const OccupancyCell = memo(function OccupancyCell({
  pct,
  vehicleInfo,
}: OccupancyCellProps) {
  console.log("pct from OccupancyCell", pct);

  if (!vehicleInfo) {
    return (
      <CellSingle>
        <span style={{ fontSize: RM_FONT.sm, color: RM_COLOR.gray400 }}>
          Not Generated
        </span>
      </CellSingle>
    );
  }

  const clampedPct = Math.min(100, Math.max(0, pct));

  console.log("clampedPct-------", clampedPct);

  const barColor =
    clampedPct < 25
      ? RM_COLOR.red500
      : clampedPct < 50
        ? RM_COLOR.orange600
        : clampedPct < 75
          ? RM_COLOR.yellow500
          : RM_COLOR.green500;

  // console.log("clampedPct", clampedPct);

  return (
    <div style={CELL_INNER}>
      {/* Progress bar — fixed geometry, never expands */}
      <div
        style={{
          width: "100%",
          height: 4,
          background: RM_COLOR.gray100 ?? "#F3F4F6",
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${clampedPct}%`,
            height: "100%",
            background: barColor,
            borderRadius: 2,
            transition: "width 0.2s ease",
          }}
        />
      </div>
      {/* Vehicle info — single line, truncated */}
      <span
        style={{
          ...ELLIPSIS,
          fontSize: RM_FONT.xs,
          color: RM_COLOR.gray400,
          lineHeight: 1.3,
        }}
      >
        {vehicleInfo}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeCell — total + adhoc breakdown
// ─────────────────────────────────────────────────────────────────────────────

interface EmployeeCellProps {
  totalEmployees: number;
  adhocEmployees: number;
}

/**
 * Shows total employee count. If adhoc > 0, shows the (regular + adhoc) split
 * on a second micro-line, truncated safely.
 */
export const EmployeeCell = memo(function EmployeeCell({
  totalEmployees,
  adhocEmployees,
}: EmployeeCellProps) {
  const hasAdhoc = adhocEmployees > 0;
  const regular = totalEmployees - adhocEmployees;

  if (!hasAdhoc) {
    return (
      <CellSingle>
        <span
          style={{
            fontSize: RM_FONT.md,
            fontWeight: 600,
            color: RM_COLOR.gray900,
          }}
        >
          {totalEmployees}
        </span>
      </CellSingle>
    );
  }

  return (
    <div style={CELL_INNER}>
      <span
        style={{
          ...ELLIPSIS,
          fontSize: RM_FONT.md,
          fontWeight: 600,
          color: RM_COLOR.gray900,
        }}
      >
        {totalEmployees}
      </span>
      <span
        style={{
          ...ELLIPSIS,
          fontSize: RM_FONT.xs,
          fontWeight: 400,
          color: RM_COLOR.gray400,
        }}
      >
        {regular} + {adhocEmployees} Adhoc
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CommunicationCell — "Prefix: clickable detail" layout
// ─────────────────────────────────────────────────────────────────────────────

export const CommunicationCell = memo(function CommunicationCell({
  detail,
}: {
  detail: string | null;
}) {
  if (!detail) {
    return (
      <CellSingle>
        <span style={{ fontSize: RM_FONT.md, color: RM_COLOR.gray200 }}>
          ——
        </span>
      </CellSingle>
    );
  }

  const colonIdx = detail.indexOf(":");
  const prefix = colonIdx >= 0 ? detail.slice(0, colonIdx) : detail;
  const rest = colonIdx >= 0 ? detail.slice(colonIdx + 1).trim() : "";

  return (
    <div
      style={{
        ...CELL_INNER_SINGLE,
        gap: 3,
        // flex row so prefix + rest sit on the same line, truncating as a unit
        flexDirection: "row",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: RM_FONT.sm,
          color: RM_COLOR.gray500,
          flexShrink: 0, // "SMS:" label never truncates
          whiteSpace: "nowrap",
        }}
      >
        {prefix}:
      </span>
      <span
        style={{
          ...ELLIPSIS,
          fontSize: RM_FONT.sm,
          color: RM_COLOR.blue500,
          fontWeight: 500,
          cursor: "pointer",
          minWidth: 0,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLSpanElement).style.textDecoration =
            "underline")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLSpanElement).style.textDecoration = "none")
        }
      >
        {rest}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// InfoIcon — shared info tooltip trigger
// ─────────────────────────────────────────────────────────────────────────────

export const InfoIcon = memo(function InfoIcon() {
  return (
    <svg
      style={{
        display: "inline",
        marginLeft: 3,
        color: RM_COLOR.gray400,
        cursor: "help",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
});
