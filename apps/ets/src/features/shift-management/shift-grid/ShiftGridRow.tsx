// shared/components/shift-grid/ShiftGridRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  CHANGES
//  ─────────────────────────────────────────────────────────────────────────────
//  • Row selection (Col 1):
//      When enableSelection=true the ChevronRight icon is replaced by a
//      selection CB.  onSelect fires on the checkbox; e.stopPropagation()
//      prevents the row-click drawer from opening simultaneously.
//
//  • Drop Shift col (Col 2):
//      DropsPopover REMOVED.  Replaced with a read-only drop-count chip:
//        "3 drops" (green pill)  or  "—" (muted).
//      Full drop configuration now lives in ShiftActionModal / EditSlotModal.
//
//  • Checkbox toggles now route through onToggle (same as before).
//    The PARENT (ShiftManagementPage) has changed onToggle to open a
//    confirmation modal instead of firing the API directly.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { ChevronRight } from "lucide-react";
import { C, SP, R, CM, TR, COL_TEMPLATE } from "./ShiftGridTokens";
import { CB, NumCell, TimeTag, EditBtn } from "./ShiftGridCells";
import type { ShiftRow } from "./Shiftgridlayout";

export interface ShiftGridRowProps {
  row: ShiftRow;
  idx: number;
  isDirty: boolean; // kept for compat — not used visually
  readonly: boolean;
  lockType: string;
  maxOccupancy?: number;
  /** Pre-bound to this row's index by ShiftGridLayout */
  onToggle?: (field: string) => void;
  onNumChange?: (field: string, v: number | null) => void;
  onStrChange?: (field: string, v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit?: (slot: any) => void;
  /** Non-interactive area click → detail drawer */
  onRowClick?: (row: ShiftRow) => void;
  /** Row selection — supplied when the grid is in multi-select mode */
  enableSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  allShiftTimes?: string[];
}

/** Suppresses row-click when the user targets a control */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  return !!(target as HTMLElement).closest(
    'input, select, button, [role="button"], [data-no-row-click]',
  );
}

export const ShiftGridRow: React.FC<ShiftGridRowProps> = ({
  row,
  readonly,
  onToggle,
  onNumChange,
  // onStrChange intentionally not destructured — no string-field cells remain
  // after DropsPopover was removed. The prop is kept in the interface so
  // ShiftGridLayout can still pass it without a TypeScript error.
  onEdit,
  onRowClick,
  enableSelection = false,
  isSelected = false,
  onSelect,
  maxOccupancy,
}) => {
  const [hovered, setHovered] = React.useState(false);

  const cell: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  };

  /** Stop propagation so the row-click drawer doesn't also fire */
  const handleCB = (e: React.MouseEvent, field: string) => {
    e.stopPropagation();
    if (!readonly && onToggle) onToggle(field);
  };

  /** Drop count chip — replaces DropsPopover */
  const drops = row.dropShift
    ? row.dropShift
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const dropChip =
    drops.length > 0 ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          height: 24,
          padding: "0 10px",
          border: "1px solid #86EFAC",
          borderRadius: 99,
          background: "#F0FDF4",
          color: "#14532D",
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {drops.length} drop{drops.length !== 1 ? "s" : ""}
      </span>
    ) : (
      <span style={{ fontSize: 11, color: C.textMuted }}>—</span>
    );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (!isInteractiveTarget(e.target) && onRowClick) {
          onRowClick(row);
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: COL_TEMPLATE,
        minWidth: 900,
        height: CM.rowH,
        padding: `0 ${CM.headerPadH}px`,
        margin: `0 ${SP[3]}px`,
        background: isSelected ? C.primaryLight : hovered ? C.bgHover : C.white,
        border: `1px solid ${isSelected ? C.primaryBorder : C.divider}`,
        borderRadius: R["2xl"],
        transition: TR.fast,
        boxSizing: "border-box",
        flexShrink: 0,
        cursor: onRowClick && !readonly ? "pointer" : "default",
      }}
    >
      {/* ── Col 1: Shift Time / Selection ── */}
      <div style={{ ...cell, justifyContent: "flex-start", gap: SP[1.5] }}>
        {enableSelection ? (
          /* Selection checkbox — stops row-click */
          <div
            data-no-row-click
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(row.id);
            }}
          >
            <CB
              checked={isSelected}
              color={C.primary}
              onClick={() => {}} // visual only; container owns the action
              size={16}
            />
          </div>
        ) : (
          <span
            style={{
              color: C.textSubtle,
              opacity: 0.4,
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <ChevronRight size={13} />
          </span>
        )}
        <TimeTag time={row.shiftTime} desc={row.shiftDesc ?? undefined} />
      </div>

      {/* ── Col 2: Drop Shift (read-only chip, no popover) ── */}
      <div style={{ ...cell, justifyContent: "flex-start" }}>{dropChip}</div>

      {/* ── Col 3: Pick Occupancy ── */}
      <div style={cell}>
        <NumCell
          value={row.pickOccupancy}
          onChange={(v) => onNumChange?.("pickOccupancy", v)}
          max={maxOccupancy}
          inputWidth={CM.numCellW}
          inputHeight={CM.inputHSm}
        />
      </div>

      {/* ── Col 4: Drop Occupancy ── */}
      <div style={cell}>
        <NumCell
          value={row.dropOccupancy}
          onChange={(v) => onNumChange?.("dropOccupancy", v)}
          max={maxOccupancy}
          inputWidth={CM.numCellW}
          inputHeight={CM.inputHSm}
        />
      </div>

      {/* ── Col 5: Peak Hour ── */}
      <div style={cell}>
        <CB
          checked={row.peakHour}
          color={C.primary}
          onClick={(e) => handleCB(e, "peakHour")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 6: Bus Nodal Pick ── */}
      <div style={cell}>
        <CB
          checked={row.isGuardPick}
          color={C.primary}
          onClick={(e) => handleCB(e, "isGuardPick")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 7: Bus Nodal Drop ── */}
      <div style={cell}>
        <CB
          checked={row.isGuardDrop}
          color={C.primary}
          onClick={(e) => handleCB(e, "isGuardDrop")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 8: Adhoc Pick ── */}
      <div style={cell}>
        <CB
          checked={row.unsPickAllwd}
          color={C.primary}
          onClick={(e) => handleCB(e, "unsPickAllwd")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 9: Adhoc Drop ── */}
      <div style={cell}>
        <CB
          checked={row.unsDropAllwd}
          color={C.primary}
          onClick={(e) => handleCB(e, "unsDropAllwd")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 10: Safe Reach Male ── */}
      <div style={cell}>
        <CB
          checked={row.isSafeReachedMale}
          color={C.success}
          onClick={(e) => handleCB(e, "isSafeReachedMale")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 11: Safe Reach Female ── */}
      <div style={cell}>
        <CB
          checked={row.isSafeReachedFemale}
          color={C.success}
          onClick={(e) => handleCB(e, "isSafeReachedFemale")}
          readonly={readonly}
        />
      </div>

      {/* ── Col 12: Avg Speed ── */}
      <div style={cell}>
        <NumCell
          value={row.avgSpeed}
          onChange={(v) => onNumChange?.("avgSpeed", v)}
          inputWidth={CM.numCellWLg}
          inputHeight={CM.inputHSm}
        />
      </div>

      {/* ── Col 13: Actions ── */}
      <div style={cell}>
        {onEdit && (
          <EditBtn
            onEdit={(e?: React.MouseEvent) => {
              e?.stopPropagation();
              onEdit(row);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftGridRow;
