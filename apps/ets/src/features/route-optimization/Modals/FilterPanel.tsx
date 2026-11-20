// src/features/route-maker/Modals/FilterPanel.tsx
//
// Slide-in filter drawer.
//
// Each toggle/select directly maps to a backend query param.
// On "Apply", calls onApply(filters) → RouteMakerPage updates QUERY_ARGS
// → RTK Query re-fetches with new params → data refreshes.
//
// Props:
//   open          — controlled open state
//   onClose       — close without applying
//   onApply       — called with the selected RouteFilters when user hits Apply
//   activeFilters — current filters (to show current state when reopened)

import { useState, useEffect } from "react";
import { T } from "../constants/designTokens";
// import type {
//   FemaleFilter,
//   ApiSortBy,
//   ApiSortDir,
// } from "../services/routeMakerApi";
import type { RouteFilters, FemaleFilter } from "../types/Routemaker.types";

import { DEFAULT_FILTERS } from "../types/Routemaker.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: RouteFilters) => void;
  activeFilters: RouteFilters;
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div>
        <div style={{ fontSize: T.fontSm, fontWeight: 500, color: T.text }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: T.fontXs, color: T.muted, marginTop: 2 }}>
            {hint}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          background: value ? T.accent : T.border,
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            display: "block",
          }}
        />
      </button>
    </div>
  );
}

// ── Chip selector ─────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T | null; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div style={{ padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
      <div
        style={{
          fontSize: T.fontSm,
          fontWeight: 500,
          color: T.text,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(active ? null : opt.value)}
              style={{
                padding: "5px 12px",
                borderRadius: T.radiusFull,
                border: `1.5px solid ${active ? T.accent : T.border}`,
                background: active ? T.accentBg : T.panel,
                color: active ? T.accent : T.muted,
                fontSize: T.fontXs,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FilterPanel({
  open,
  onClose,
  onApply,
  activeFilters,
}: Props) {
  // Local draft — only committed to parent on Apply
  const [draft, setDraft] = useState<RouteFilters>(activeFilters);

  // Sync draft when panel reopens with new active filters
  useEffect(() => {
    if (open) setDraft(activeFilters);
  }, [open, activeFilters]);

  function set<K extends keyof RouteFilters>(key: K, val: RouteFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }

  // Count active filters (for badge)
  const activeCount = [
    draft.guardTrip,
    draft.singleEmployee,
    // draft.vendorAssigned != null,
    draft.vehicleAssigned != null,
    draft.femaleFilter !== null,
    draft.specialNeeds,
    draft.sortBy !== null,
  ].filter(Boolean).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 500,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100vh",
          background: T.panel,
          borderLeft: `1px solid ${T.border}`,
          zIndex: 501,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ fontWeight: 700, fontSize: T.fontMd, color: T.text }}
            >
              Filters
            </span>
            {activeCount > 0 && (
              <span
                style={{
                  background: T.accent,
                  color: "#fff",
                  fontSize: T.fontXs,
                  fontWeight: 700,
                  borderRadius: T.radiusFull,
                  padding: "1px 7px",
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: T.muted,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable filter body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px" }}>
          {/* ── Section: General ─────────────────────────────────────────── */}
          <div
            style={{
              fontSize: T.fontXs,
              fontWeight: 700,
              color: T.muted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "14px 0 4px",
            }}
          >
            General
          </div>

          <Toggle
            label="Guard Trip"
            hint="Show only routes with a guard allocated"
            value={draft.guardTrip}
            onChange={(v) => set("guardTrip", v)}
          />
          <Toggle
            label="Single Employee"
            hint="Routes with exactly one passenger"
            value={draft.singleEmployee}
            onChange={(v) => set("singleEmployee", v)}
          />
          {/* <Toggle
            label="Vendor Assigned"
            hint="Show only routes with a vendor"
            value={draft.vendorAssigned ?? false}
            onChange={(v) => set("vendorAssigned", v)}
          /> */}
          <Toggle
            label="Vehicle Assigned"
            hint="Show only routes with a Vehicle/Driver"
            value={draft.vehicleAssigned ?? false}
            onChange={(v) => set("vehicleAssigned", v)}
          />
          <Toggle
            label="Special Needs"
            hint="Passengers with accessibility requirements"
            value={draft.specialNeeds}
            onChange={(v) => set("specialNeeds", v)}
          />

          <ChipGroup<
            FemaleFilter extends null ? never : NonNullable<FemaleFilter>
          >
            label="Female Filter"
            options={[
              { value: null, label: "All" },
              { value: "single" as const, label: "Single Female" },
            ]}
            value={draft.femaleFilter}
            onChange={(v) => set("femaleFilter", v as FemaleFilter)}
          />
        </div>

        {/* Footer: Reset + Apply */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "16px 20px",
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setDraft(DEFAULT_FILTERS)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: T.radius,
              border: `1.5px solid ${T.border}`,
              background: T.panel,
              color: T.muted,
              fontSize: T.fontSm,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            style={{
              flex: 2,
              padding: "10px 0",
              borderRadius: T.radius,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: T.fontSm,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Apply Filters
            {activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      </div>
    </>
  );
}
