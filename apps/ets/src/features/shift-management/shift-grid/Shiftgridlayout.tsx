// shared/components/shift-grid/ShiftGridLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  CHANGES
//  ─────────────────────────────────────────────────────────────────────────────
//  • searchText / onSearchChange / peakOnly / onPeakOnlyToggle are now OPTIONAL
//    and are NOT forwarded to ShiftGridToolbar.  These filters live in the
//    page-level filter bar (ShiftManagementPage).
//    The props are kept in the interface so existing callers compile without
//    changes (they are simply ignored here).
//
//  • Row selection support added:
//      enableSelection?: boolean
//      selectedIds?:     Set<string>
//      onSelectRow?:     (id: string) => void
//    These are forwarded to ShiftGridRow, which renders the selection CB in
//    Col 1 when enableSelection=true.
//
//  • Zone 3 (dirty bulk-save bar) remains REMOVED.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { C, F, SP, R, CM } from "./ShiftGridTokens";
import { ShiftGridToolbar } from "./ShiftGridToolbar";
import { ShiftGridHeader } from "./ShiftGridHeaders";
import { ShiftGridRow } from "./ShiftGridRow";
import { ShiftGridPagination } from "./ShiftGridPagination";

// ── ShiftRow ──────────────────────────────────────────────────────────────────
export interface ShiftRow {
  id: string;
  shiftTime: string;
  dropShift: string | null;
  dropShiftOptions?: string[];
  pickOccupancy: number | null;
  dropOccupancy: number | null;
  peakHour: boolean;
  isGuardPick: boolean;
  isGuardDrop: boolean;
  unsPickAllwd: boolean;
  unsDropAllwd: boolean;
  isSafeReachedMale: boolean;
  isSafeReachedFemale: boolean;
  avgSpeed: number | null;
  locCode?: number;
  shiftDesc?: string | null;
  dropDayShift?: boolean;
  pickDayShift?: boolean;
  [key: string]: unknown;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ShiftGridLayoutProps {
  filterSlot?: React.ReactNode;
  slots: ShiftRow[];
  onToggle?: (i: number, key: string) => void;
  onNumChange?: (i: number, key: string, v: number | null) => void;
  onStrChange?: (i: number, key: string, v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit?: (slot: any) => void;
  onRowClick?: (row: ShiftRow) => void;
  maxOccupancy?: number;
  isLoading?: boolean;
  readonly?: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;

  // ── Row selection ──────────────────────────────────────────────────────────
  enableSelection?: boolean;
  selectedIds?: Set<string>;
  onSelectRow?: (id: string) => void;

  // ── Kept for backward-compat — not rendered ────────────────────────────────
  dirtyIds?: Set<string>;
  hasDirty?: boolean;
  dirtyCount?: number;
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  isBulkRunning?: boolean;
  isSaveDisabled?: boolean;
  progressCompleted?: number;
  progressTotal?: number;
  /** Ignored — search/peak now live in page filter bar */
  searchText?: string;
  onSearchChange?: (v: string) => void;
  peakOnly?: boolean;
  onPeakOnlyToggle?: () => void;
  activeFilter?: "all" | "active" | "inactive";
  onActiveFilterChange?: (v: "all" | "active" | "inactive") => void;
  onAddNew?: () => void;
  lockType: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const ShiftGridLayout: React.FC<ShiftGridLayoutProps> = ({
  filterSlot,
  slots,
  onToggle,
  onNumChange,
  onStrChange,
  onEdit,
  onRowClick,
  maxOccupancy,
  isLoading = false,
  readonly = false,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  enableSelection = false,
  selectedIds,
  onSelectRow,
  dirtyIds,
  onAddNew,
  isBulkRunning,
  progressCompleted,
  progressTotal,
  lockType,
  // search/peak intentionally not destructured — they are ignored
}) => {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: R["3xl"],
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Zone 1: Toolbar ─────────────────────────────────────────────────── */}
      {/* search/peak NOT passed — they live in the page filter bar now */}
      <ShiftGridToolbar
        filterSlot={filterSlot}
        onAddNew={onAddNew}
        isBulkRunning={isBulkRunning}
        progressCompleted={progressCompleted}
        progressTotal={progressTotal}
      />

      {/* ── Zone 2: Header + rows (shared horizontal scroll) ────────────────── */}
      <div style={{ overflowX: "auto", flex: 1 }}>
        <ShiftGridHeader />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: CM.rowCardGap,
            padding: `${SP[3]}px 0`,
            minWidth: 900,
          }}
        >
          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: `${SP[8]}px 0`,
                fontSize: F.size.md,
                color: C.textSubtle,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  border: `2px solid ${C.border}`,
                  borderTopColor: C.primary,
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Loading…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : slots.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: `${SP[8]}px 0`,
                fontSize: F.size.md,
                color: C.textSubtle,
              }}
            >
              No shifts found
            </div>
          ) : (
            slots.map((row, idx) => (
              <ShiftGridRow
                key={row.id}
                row={row}
                idx={idx}
                isDirty={dirtyIds?.has(row.id) ?? false}
                readonly={readonly}
                lockType={lockType}
                maxOccupancy={maxOccupancy}
                onToggle={
                  onToggle ? (field) => onToggle(idx, field) : undefined
                }
                onNumChange={
                  onNumChange
                    ? (field, v) => onNumChange(idx, field, v)
                    : undefined
                }
                onStrChange={
                  onStrChange
                    ? (field, v) => onStrChange(idx, field, v)
                    : undefined
                }
                onEdit={onEdit}
                onRowClick={onRowClick}
                enableSelection={enableSelection}
                isSelected={selectedIds?.has(row.id) ?? false}
                onSelect={onSelectRow}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Zone 3: Pagination ───────────────────────────────────────────────── */}
      <ShiftGridPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default ShiftGridLayout;
