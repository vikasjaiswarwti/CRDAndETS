// shared/components/shift-grid/ShiftGridPagination.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  Bottom pagination bar: showing text / pill buttons / page-size dropdown.
//  Pill size: 36×36, active = green fill, others = white + border.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { C, F, SP, R, CM, TR } from "./ShiftGridTokens";

export interface ShiftGridPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

// ── Build page number array with ellipsis ─────────────────────────────────────
function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ── Pill Button ───────────────────────────────────────────────────────────────
const Pill: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, active, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: CM.paginationPillSz, // 36px
      height: CM.paginationPillSz, // 36px
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: active ? "none" : `1px solid ${C.border}`,
      borderRadius: R.xl, // 10px
      background: active ? C.primary : C.white,
      color: active ? C.white : C.textSub,
      fontSize: F.size.md,
      fontWeight: active ? F.weight.semibold : F.weight.regular,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: TR.fast,
      padding: 0,
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

// ── Component ────────────────────────────────────────────────────────────────
export const ShiftGridPagination: React.FC<ShiftGridPaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, totalCount);
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div
      style={{
        height: CM.paginationH, // 56px
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${SP[6]}px`,
        borderTop: `1px solid ${C.border}`,
        background: C.white,
        flexShrink: 0,
        fontFamily: F.family,
      }}
    >
      {/* ── Left: showing text ── */}
      <span
        style={{
          fontSize: F.size.md,
          color: C.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        Showing {from}–{to} of {totalCount} shift{totalCount !== 1 ? "s" : ""}
      </span>

      {/* ── Center: page pills ── */}
      <div style={{ display: "flex", alignItems: "center", gap: SP[1.5] }}>
        <Pill
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft size={14} />
        </Pill>

        {buildPageRange(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span
              key={`e${i}`}
              style={{
                fontSize: F.size.md,
                color: C.textMuted,
                padding: `0 ${SP[1]}px`,
              }}
            >
              …
            </span>
          ) : (
            <Pill
              key={p}
              active={p === page}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Pill>
          ),
        )}

        <Pill
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight size={14} />
        </Pill>
      </div>

      {/* ── Right: rows per page ── */}
      <div style={{ position: "relative" }}>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            height: CM.paginationPillSz, // 36px
            width: 90,
            border: `1px solid ${C.border}`,
            borderRadius: R.xl, // 10px
            background: C.white,
            color: C.textSub,
            fontSize: F.size.md,
            paddingLeft: SP[3],
            paddingRight: SP[6],
            appearance: "none",
            cursor: "pointer",
            outline: "none",
            fontFamily: F.family,
          }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          color={C.textMuted}
          style={{
            position: "absolute",
            right: SP[2],
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

export default ShiftGridPagination;
