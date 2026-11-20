// src/features/routeManagement/constants/RouteTableLayout.ts
//
// ─── DETERMINISTIC ROW LAYOUT SYSTEM ─────────────────────────────────────────
//
// Single source of truth for all row/cell geometry.
//
// WHY this file exists:
//   Scroll synchronization between two side-by-side tables is only stable when
//   cumulative pixel offsets are identical at every row boundary. That requires
//   every row in both panels to share the same fixed height. Any dynamic sizing
//   (wrapped text, variable badges, dynamic content) breaks the offset mapping
//   and causes the panels to visually drift.
//
//   Fixing this at the CSS/style layer — not at the scroll-sync logic layer —
//   is the correct enterprise approach. The scroll hook itself is already
//   correct; the layout was feeding it bad geometry.
//
// VIRTUALIZATION NOTE:
//   Because ROW_H is a constant, react-window / react-virtual can be dropped in
//   with zero recalculation:
//     <FixedSizeList itemSize={ROW_H} ...>
//   The scroll hook works identically because scrollTop math stays linear.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from "react";

// ── Core geometry ─────────────────────────────────────────────────────────────

/** The single fixed row height shared by BOTH panels. Change here, applies everywhere. */
export const ROW_H = 52; // px — comfortable for two micro-lines of content

/** Column header row height. */
export const HEADER_ROW_H = 36; // px

// ── Row style ─────────────────────────────────────────────────────────────────

/**
 * Apply to every <tr>. Sets fixed height and prevents any child from
 * expanding the row.
 *
 * `height` on a <tr> acts as min-height in most browsers; `max-height`
 * is ignored on table rows. We therefore set overflow:hidden on every <td>
 * via TD_STYLE to enforce the ceiling.
 */
export const ROW_STYLE: CSSProperties = {
  height: ROW_H,
  maxHeight: ROW_H,
  boxSizing: "border-box",
};

// ── Cell (td) style ───────────────────────────────────────────────────────────

/**
 * Apply to every <td>. The combination of:
 *   - fixed height (inherits from row via table layout)
 *   - overflow: hidden       → clips any content that exceeds the cell box
 *   - verticalAlign: middle  → centres single-line and two-line content
 *   - maxWidth: 0            → required for text-overflow: ellipsis in
 *                              table cells with tableLayout: fixed
 */
export const TD_STYLE: CSSProperties = {
  height: ROW_H,
  maxHeight: ROW_H,
  overflow: "hidden",
  verticalAlign: "middle",
  boxSizing: "border-box",
  // maxWidth: 0 is set per-column via colgroup; we leave it absent here
  // so this constant remains composable.
};

// ── Cell padding variant ──────────────────────────────────────────────────────

/** Standard data cell padding. */
export const CELL_PAD: CSSProperties = {
  ...TD_STYLE,
  padding: "0 10px",
};

/** Checkbox cell (tighter horizontal padding). */
export const CHECKBOX_CELL_PAD: CSSProperties = {
  ...TD_STYLE,
  padding: "0 10px",
  width: 34,
};

// ── Text truncation utilities ─────────────────────────────────────────────────

/**
 * Single-line ellipsis truncation.
 * Apply to any inline text node that must not wrap.
 *
 * Requires the PARENT to have overflow:hidden + a defined width.
 * When used inside a table cell with tableLayout:fixed, this is guaranteed.
 */
export const ELLIPSIS: CSSProperties = {
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  display: "block",
  maxWidth: "100%",
};

/**
 * Two-line clamp. For cells that show a primary value + a secondary badge/label.
 * Uses line-clamp for the secondary line so it gracefully truncates without
 * expanding the cell.
 */
export const ELLIPSIS_TWO_LINE: CSSProperties = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  wordBreak: "break-word",
};

// ── Cell content wrapper ──────────────────────────────────────────────────────

/**
 * Inner wrapper for cells that contain a primary line + a secondary line
 * (e.g. shift time + badge, employee count + status badge).
 *
 * Using flex instead of block prevents the secondary line from pushing
 * the cell height when it wraps — overflow:hidden on the container clips it.
 */
export const CELL_INNER: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 2,
  height: "100%",
  overflow: "hidden", // critical: prevents badge/child from expanding row
  maxWidth: "100%",
};

/**
 * Single-line cell wrapper. For cells with only one value.
 */
export const CELL_INNER_SINGLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100%",
};

// ── Badge overflow safety ─────────────────────────────────────────────────────

/**
 * Apply to badge/pill containers. Prevents a badge from stretching its
 * parent cell when text inside the badge is long.
 */
export const BADGE_SAFE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  maxWidth: "100%",
  overflow: "hidden",
  flexShrink: 0, // badges shouldn't compress; they should be clipped by parent
};

// ── Table base style ──────────────────────────────────────────────────────────

/**
 * Required on every <table> for deterministic layout.
 * tableLayout: fixed is the contract that makes column widths from <colgroup>
 * authoritative and enables text-overflow: ellipsis on <td>.
 */
export const TABLE_BASE: CSSProperties = {
  width: "100%",
  tableLayout: "fixed",
  borderCollapse: "collapse",
};
