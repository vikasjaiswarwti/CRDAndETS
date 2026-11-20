// shared/components/shift-grid/ShiftGridToolbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  Toolbar inside the grid card (Zone 1).
//
//  searchText / onSearchChange / peakOnly / onPeakOnlyToggle are now OPTIONAL.
//  When not provided they are not rendered — these filters live in the page-level
//  filter bar (ShiftManagementPage) instead.
//
//  Only rendered items:
//    • filterSlot   — arbitrary React content from the parent (left)
//    • onAddNew     — "+ Add Shift" button (right)
//    • isBulkRunning progress indicator (right)
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { Plus, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { C, F, SP, R, TR } from "./ShiftGridTokens";

export interface ShiftGridToolbarProps {
  filterSlot?: React.ReactNode;
  /** Optional — renders a search input if provided */
  searchText?: string;
  onSearchChange?: (v: string) => void;
  /** Optional — renders a peak-only toggle if provided */
  peakOnly?: boolean;
  onPeakOnlyToggle?: () => void;
  onAddNew?: () => void;
  isBulkRunning?: boolean;
  progressCompleted?: number;
  progressTotal?: number;
}

export const ShiftGridToolbar: React.FC<ShiftGridToolbarProps> = ({
  filterSlot,
  searchText,
  onSearchChange,
  peakOnly,
  onPeakOnlyToggle,
  onAddNew,
  isBulkRunning,
  progressCompleted = 0,
  progressTotal = 0,
}) => {
  const hasAnyContent =
    filterSlot ||
    onSearchChange ||
    onPeakOnlyToggle ||
    onAddNew ||
    isBulkRunning;

  if (!hasAnyContent) return null;

  return (
    <div
      style={{
        padding: `${SP[3]}px ${SP[4]}px`,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: SP[2],
        flexWrap: "wrap",
        minHeight: 52,
      }}
    >
      {/* Filter slot — arbitrary content */}
      {filterSlot && (
        <div
          style={{ flex: 1, display: "flex", alignItems: "center", gap: SP[2] }}
        >
          {filterSlot}
        </div>
      )}

      {/* Search (only rendered if callback provided) */}
      {onSearchChange && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${C.border}`,
            borderRadius: R.lg,
            padding: "0 10px",
            height: 32,
            background: "#F9FAFB",
            minWidth: 170,
          }}
        >
          <Search size={13} color={C.textMuted} strokeWidth={2} />
          <input
            value={searchText ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shift time…"
            style={{
              border: "none",
              background: "none",
              outline: "none",
              fontSize: F.size.sm,
              color: C.text,
              width: "100%",
            }}
          />
        </div>
      )}

      {/* Peak filter (only rendered if callback provided) */}
      {onPeakOnlyToggle && (
        <button
          onClick={onPeakOnlyToggle}
          style={{
            height: 32,
            padding: "0 12px",
            border: `1px solid ${peakOnly ? C.primary : C.border}`,
            borderRadius: R.lg,
            background: peakOnly ? C.primaryLight : C.white,
            color: peakOnly ? C.primary : C.textSub,
            fontSize: F.size.sm,
            fontWeight: peakOnly ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: TR.fast,
          }}
        >
          <SlidersHorizontal size={12} strokeWidth={2} />
          Peak Only
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bulk progress indicator */}
      {isBulkRunning && progressTotal > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: F.size.sm,
            color: C.textMuted,
          }}
        >
          <Loader2
            size={13}
            color={C.primary}
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          {progressCompleted} / {progressTotal}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Add Shift button */}
      {onAddNew && (
        <button
          onClick={onAddNew}
          style={{
            height: 32,
            padding: "0 14px",
            border: "none",
            borderRadius: R.lg,
            background: C.primary,
            color: C.white,
            fontSize: F.size.sm,
            fontWeight: F.weight.semibold,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: TR.fast,
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "0.88")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "1")
          }
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Shift
        </button>
      )}
    </div>
  );
};

export default ShiftGridToolbar;
