// ─── DropDowns/Actiondropdown.tsx ─────────────────────────────────────────────
// Action popover for a route card or bulk toolbar.
//
// POSITIONING: position:fixed so it escapes overflow:hidden parents.
// Right-aligned to the trigger button (popover right edge = trigger right edge).
// Closes on outside-click, Escape, scroll, resize.

import { useState, useRef, useEffect } from "react";
import { T } from "../constants/designTokens";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActionDropdownProps {
  // routeId: string;
  isFlagged?: boolean;
  isApproved?: boolean;
  onFlag?: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
  onEmployeeComments?: () => void;
}

// ---------------------------------------------------------------------------
// Mock nodal points
// ---------------------------------------------------------------------------

const NODAL_POINTS = [
  "Metro Gate 9",
  "Cyber Hub Metro Gate",
  "Sector 29 Chowk",
  "IFFCO Chowk",
];

const POPOVER_WIDTH = 222;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActionDropdown({
  // routeId,
  isFlagged = false,
  isApproved = false,
  onFlag,
  onApprove,
  onDelete,
  onEmployeeComments,
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [nodalOpen, setNodalOpen] = useState(false);

  // fixed-position coordinates
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── Open handler ─────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      // right-align: left = trigger.right - popoverWidth (clamped to viewport)
      const left = Math.max(4, r.right - POPOVER_WIDTH);
      setDropPos({ top: r.bottom + 4, left });
    }
    if (open) setNodalOpen(false); // collapse nodal when closing
    setOpen((o) => !o);
  };

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !triggerRef.current?.contains(t) &&
        !popoverRef.current?.contains(t)
      ) {
        setOpen(false);
        setNodalOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setNodalOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ── Close on scroll / resize ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setNodalOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const act = (fn?: () => void) => () => {
    fn?.();
    setOpen(false);
    setNodalOpen(false);
  };

  // ── Shared menu-item style ───────────────────────────────────────────────
  // const menuItem = (color = T.text): React.CSSProperties => ({
  const menuItem = (color: string = T.text): React.CSSProperties => ({
    width: "100%",
    padding: "9px 14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: T.fontSm,
    color,
    fontWeight: 500,
    textAlign: "left" as const,
  });

  return (
    <div style={{ display: "inline-block" }}>
      {/* ── Trigger — 28px height to match toolbar ──────────────────────── */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        title="More actions"
        style={{
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
        Actions
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

      {/* ── Popover — position:fixed, right-aligned to trigger ───────────── */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: POPOVER_WIDTH,
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            boxShadow: T.shadowLg,
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Nodal Points (expandable) */}
          <div>
            <button onClick={() => setNodalOpen((o) => !o)} style={menuItem()}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ flex: 1 }}>Nodal Points</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.muted}
                strokeWidth="2.5"
                style={{
                  transform: nodalOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {nodalOpen && (
              <div style={{ background: T.bg, padding: "4px 14px 8px" }}>
                {NODAL_POINTS.map((np) => (
                  <div
                    key={np}
                    style={{
                      padding: "5px 0",
                      fontSize: T.fontXs,
                      color: T.textSm,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    · {np}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Employee Comments */}
          <button
            onClick={act(onEmployeeComments)}
            style={menuItem()}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = T.bg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Employee Comments
          </button>

          {/* Flag / Unflag */}
          <button
            onClick={act(onFlag)}
            style={menuItem(isFlagged ? T.warn : T.text)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = T.bg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isFlagged ? T.warn : "none"}
              stroke={isFlagged ? T.warn : "currentColor"}
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            {isFlagged ? "Unflag Route" : "Flag Route"}
          </button>

          {/* Approve / Unapprove */}
          <button
            onClick={act(onApprove)}
            style={menuItem(isApproved ? T.success : T.text)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = T.bg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isApproved ? T.success : "currentColor"}
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {isApproved ? "Unapprove" : "Approve Route"}
          </button>

          <div style={{ height: 1, background: T.border }} />

          {/* Delete — destructive */}
          <button
            onClick={act(onDelete)}
            style={menuItem(T.danger)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                T.dangerBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete Route
          </button>
        </div>
      )}
    </div>
  );
}
