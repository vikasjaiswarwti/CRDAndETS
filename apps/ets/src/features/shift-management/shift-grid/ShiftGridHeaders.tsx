// shared/components/shift-grid/ShiftGridHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  Two-row grouped header using a single CSS Grid container.
//  Each cell has an explicit gridRow + gridColumn — no auto-placement ambiguity.
//
//  Row 1 (group labels):  Shift Time | Drop Shift | Capacity | Peak | Bus Nodal
//                         | Adhoc | Safe Reach | Avg Speed | (Actions)
//  Row 2 (sub-labels):    Pick | Drop — only for multi-column groups
//
//  COL_TEMPLATE is shared with ShiftGridRow to guarantee pixel alignment.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { C, F, SP, CM, Z, COL_TEMPLATE } from "./ShiftGridTokens";

// ── Shared cell helpers ───────────────────────────────────────────────────────
const cellBase: React.CSSProperties = {
  fontSize: F.size.base, // 12px
  fontWeight: F.weight.semibold,
  color: C.textSub, // #374151
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
};

// Top row: group label (has bottom-border separator above sub-row)
const groupCell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cellBase,
  padding: `${SP[2]}px ${SP[1.5]}px ${SP[1]}px`,
  borderBottom: `1px solid ${C.divider}`,
  ...extra,
});

// Top row: standalone label (spans both rows visually — no bottom border)
const spanCell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cellBase,
  padding: `${SP[2]}px ${SP[1.5]}px`,
  ...extra,
});

// Bottom row: sub-label (Pick / Drop / Male / Female)
const subCell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cellBase,
  fontSize: F.size.sm, // 11px
  color: C.textMuted,
  fontWeight: F.weight.medium,
  padding: `${SP[0.5]}px ${SP[1.5]}px ${SP[2]}px`,
  ...extra,
});

// ── Component ────────────────────────────────────────────────────────────────
export const ShiftGridHeader: React.FC = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: COL_TEMPLATE,
      gridTemplateRows: "auto auto",
      minWidth: 900,
      padding: `0 ${CM.headerPadH}px`,
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      position: "sticky",
      top: 0,
      zIndex: Z.sticky,
    }}
  >
    {/* ── ROW 1 — group-level labels ── */}

    {/* Col 1: Shift Time — spans rows 1+2 */}
    <div
      style={spanCell({
        gridRow: "1/3",
        gridColumn: 1,
        justifyContent: "flex-start",
      })}
    >
      Shift Time
    </div>

    {/* Col 2: Drop Shift — spans rows 1+2 */}
    <div
      style={spanCell({
        gridRow: "1/3",
        gridColumn: 2,
        justifyContent: "flex-start",
      })}
    >
      Drop Shift
    </div>

    {/* Cols 3-4: Capacity (Cab) */}
    <div style={groupCell({ gridRow: 1, gridColumn: "3/5" })}>
      Capacity (Cab)
    </div>

    {/* Col 5: Peak Hour — spans rows 1+2 */}
    <div style={spanCell({ gridRow: "1/3", gridColumn: 5 })}>Peak Hour</div>

    {/* Cols 6-7: Bus Nodal Point */}
    <div style={groupCell({ gridRow: 1, gridColumn: "6/8" })}>
      Guard Allowed
    </div>

    {/* Cols 8-9: Adhoc Allowed */}
    <div style={groupCell({ gridRow: 1, gridColumn: "8/10" })}>
      Adhoc Allowed
    </div>

    {/* Cols 10-11: Safe Reach */}
    <div style={groupCell({ gridRow: 1, gridColumn: "10/12" })}>Safe Reach</div>

    {/* Col 12: Avg Speed — spans rows 1+2 */}
    <div style={spanCell({ gridRow: "1/3", gridColumn: 12 })}>Avg Speed</div>

    {/* Col 13: Actions — spans rows 1+2, empty label */}
    <div style={spanCell({ gridRow: "1/3", gridColumn: 13 })} />

    {/* ── ROW 2 — sub-labels for grouped columns only ── */}

    {/* Cols 3-4: Capacity sub */}
    <div style={subCell({ gridRow: 2, gridColumn: 3 })}>Pick</div>
    <div style={subCell({ gridRow: 2, gridColumn: 4 })}>Drop</div>

    {/* Cols 6-7: Bus Nodal sub */}
    <div style={subCell({ gridRow: 2, gridColumn: 6 })}>Pick</div>
    <div style={subCell({ gridRow: 2, gridColumn: 7 })}>Drop</div>

    {/* Cols 8-9: Adhoc sub */}
    <div style={subCell({ gridRow: 2, gridColumn: 8 })}>Pick</div>
    <div style={subCell({ gridRow: 2, gridColumn: 9 })}>Drop</div>

    {/* Cols 10-11: Safe Reach sub */}
    <div style={subCell({ gridRow: 2, gridColumn: 10 })}>Male</div>
    <div style={subCell({ gridRow: 2, gridColumn: 11 })}>Female</div>
  </div>
);

export default ShiftGridHeader;
