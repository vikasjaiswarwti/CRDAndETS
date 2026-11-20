// ─── DropDowns/Sortdropdown.tsx ───────────────────────────────────────────────
// Sort popover for the Route Stack panel.
//
// POSITIONING: Uses position:fixed so the popover is never clipped by
// parent containers that have overflow:hidden. Coordinates are computed
// from the trigger button's getBoundingClientRect() on every open.
// The popover closes automatically on outside-click, Escape, scroll, or resize.

import { useState, useRef, useEffect } from "react";
import { T } from "../constants/designTokens";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortField =
  | "radial"
  | "distance"
  | "duration"
  | "efficiency"
  | "passengers"
  | "departure"
  | "extraKm"
  | "employeeCount";

export type SortDir = "asc" | "desc";

export interface SortDropdownProps {
  sortField: SortField;
  sortDir: SortDir;
  onChange: (field: SortField, dir: SortDir) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "radial", label: "Radial" },
  { value: "distance", label: "Distance" },
  { value: "extraKm", label: "Extra KM" },
  { value: "employeeCount", label: "Employee Count" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SortDropdown({
  sortField,
  sortDir,
  onChange,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  // fixed-position coordinates of the popover
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  // ref on the trigger button (not the wrapper) so we get exact coordinates
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── Open handler: compute position from trigger rect ────────────────────
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  };

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ── Close on scroll or resize (trigger has moved, coords are stale) ──────
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Radial";

  return (
    // Wrapper has no overflow or position so it never clips the fixed popover
    <div style={{ display: "inline-block" }}>
      {/* ── Trigger ────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          // consistent toolbar height
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "0 9px",
          borderRadius: 6,
          border: `1px solid ${open ? T.accent : T.border}`,
          background: open ? T.accentBg : "#fff",
          color: open ? T.accent : T.muted,
          fontSize: T.fontSm,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          transition: "border-color 0.15s, background 0.15s, color 0.15s",
        }}
      >
        {currentLabel}
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Popover — position:fixed to escape any overflow:hidden parent ── */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed", // ← key: not clipped by any ancestor
            top: dropPos.top,
            left: dropPos.left,
            width: 188,
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            boxShadow: T.shadowLg,
            zIndex: 9999, // ← renders over entire route stack section
            overflow: "hidden",
          }}
        >
          {/* Direction row */}
          <div
            style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}
          >
            {(["asc", "desc"] as SortDir[]).map((dir) => (
              <button
                key={dir}
                onClick={() => onChange(sortField, dir)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: sortDir === dir ? T.accentBg : T.panel,
                  border: "none",
                  cursor: "pointer",
                  fontSize: T.fontSm,
                  fontWeight: sortDir === dir ? 700 : 400,
                  color: sortDir === dir ? T.accent : T.muted,
                  borderRight: dir === "asc" ? `1px solid ${T.border}` : "none",
                  transition: "background 0.1s",
                }}
              >
                {dir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            ))}
          </div>

          {/* Field list */}
          {SORT_OPTIONS.map((opt) => {
            const active = sortField === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value, sortDir);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  background: active ? T.accentBg : "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: T.fontSm,
                  fontWeight: active ? 700 : 400,
                  color: active ? T.accent : T.textSm,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      T.bg;
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "none";
                }}
              >
                {opt.label}
                {active && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.accent}
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
