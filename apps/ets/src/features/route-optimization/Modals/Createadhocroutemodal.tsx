// src/features/route-maker/Modals/CreateAdhocRouteModal.tsx
//
// Modal to create an ad-hoc route.
// • Fetches employees filtered by locCode (location)
// • Multi-select employees via checkbox list with search
// • Pre-fills trip date from routeParams.routeDate
// • Calls createAdhocRoute mutation on confirm
//
// Props:
//   routeParams  — { locCode, shiftId, tripType, routeDate } from Redux
//   tripType     — 1 = pickup, 2 = drop (used to label the modal)
//   onClose      — close without saving
//   onSuccess    — called after successful creation (triggers refetch)

import React, { useState } from "react";
import { T } from "../constants/designTokens";
import { useCreateAdhocRouteMutation } from "../services/routeMakerApi";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { AlertCircle } from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { extractApiError } from "../utils/extractApiError";

import { MapPin, Calendar, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RouteParams {
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string; // "YYYY-MM-DD"
}

interface Props {
  routeParams: RouteParams;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CreateAdhocRouteModal({
  routeParams,
  onClose,
  onSuccess,
}: Props) {
  const { locCode, shiftId, tripType, routeDate } = routeParams;

  console.log("routeParams", routeParams);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { message } = useUILibrary();

  const debouncedSearch = useDebouncedValue(search, 300);

  // Server-side filtered employee lookup
  const { userOptions, isLoading: empLoading } = useLookups({
    locCode,
    searchTerm: debouncedSearch,
    only: ["userOptions"],
  });

  // console.log("empLoading from create adhoc model", empLoading);

  const filtered = userOptions ?? [];

  const [createAdhocRoute, { isLoading: creating }] =
    useCreateAdhocRouteMutation();

  function toggleEmployee(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (filtered.every((e: any) => selectedIds.has(e.value))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((e: any) => next.delete(e.value));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((e: any) => next.add(e.value));
        return next;
      });
    }
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((e: any) => selectedIds.has(e.value));

  async function handleCreate() {
    if (selectedIds.size === 0) return;

    try {
      const result = await createAdhocRoute({
        locCode,
        shiftId,
        tripType,
        tripDate: routeDate,
        employeeIds: Array.from(selectedIds),
      }).unwrap();

      const successMsg =
        (result as any)?.message ?? "Adhoc route created successfully.";
      message.success(successMsg, 4);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[CreateAdhocRouteModal] create failed", err);
      setErrorMsg(extractApiError(err));
    }
  }

  const tripTypeLabel = tripType === 2 ? "Drop" : "Pickup";

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(2px)",
      }}
    >
      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Adhoc {tripTypeLabel} Trip
            </div>
            <div
              style={{
                fontSize: 12,
                color: T.muted,
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} color={T.muted} />
                Loc {locCode}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Shift {shiftId}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={11} color={T.muted} />
                {routeDate}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textSub,
              padding: 2,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: T.radiusSm,
              flexShrink: 0,
            }}
          >
            <AlertCircle
              size={14}
              color="#ef4444"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <span style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>
              {errorMsg}
            </span>
          </div>
        )}

        {/* ── Body ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            padding: "14px 20px",
            gap: 10,
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              padding: "6px 10px",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.textSub}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or ID…"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 12,
                color: T.text,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textSub,
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Selection summary + select-all */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>
              {empLoading
                ? "Loading employees…"
                : `${filtered.length} employee${filtered.length !== 1 ? "s" : ""} shown`}
            </span>
            {filtered.length > 0 && !empLoading && (
              <button
                onClick={toggleAll}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.accent,
                  padding: 0,
                }}
              >
                {allFilteredSelected ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>

          {/* Employee list */}
          <div
            style={
              {
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                scrollbarWidth: "none" as any,
                msOverflowStyle: "none" as any,
              } as React.CSSProperties
            }
          >
            {empLoading ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  fontSize: 12,
                  color: T.muted,
                }}
              >
                Loading employees…
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  fontSize: 12,
                  color: T.muted,
                }}
              >
                {search
                  ? "No employees match your search."
                  : "No employees found for this location."}
              </div>
            ) : (
              filtered.map((emp: any) => {
                const checked = selectedIds.has(emp.value);
                // emp.label may be "John Doe - EMP001" or just a name — split on " - " for display
                const [empName, empCode] = (emp.label as string).split(" - ");
                return (
                  <div
                    key={emp.value}
                    onClick={() => toggleEmployee(emp.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: checked ? T.accentBg : "transparent",
                      borderBottom: `1px solid ${T.border}`,
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 3,
                        border: `2px solid ${checked ? T.accent : T.border}`,
                        background: checked ? T.accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.1s",
                      }}
                    >
                      {checked && (
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: checked ? T.accent : T.border,
                        color: checked ? "#fff" : T.muted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: "all 0.12s",
                      }}
                    >
                      {(empName ?? "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: checked ? 600 : 400,
                          color: checked ? T.accent : T.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          transition: "color 0.1s",
                        }}
                      >
                        {empName}
                      </div>
                      {empCode && (
                        <div style={{ fontSize: 11, color: T.muted }}>
                          {empCode}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 20px",
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          {/* Selected count badge */}
          <div
            style={{
              flex: 1,
              fontSize: 12,
              color: selectedIds.size > 0 ? T.accent : T.muted,
              fontWeight: selectedIds.size > 0 ? 600 : 400,
            }}
          >
            {selectedIds.size > 0
              ? `${selectedIds.size} employee${selectedIds.size !== 1 ? "s" : ""} selected`
              : "Select employees to create route"}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: T.card,
              color: T.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={selectedIds.size === 0 || creating}
            style={{
              padding: "9px 20px",
              borderRadius: T.radiusSm,
              border: "none",
              background: selectedIds.size === 0 ? T.border : T.accent,
              color: selectedIds.size === 0 ? T.muted : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {creating ? "Creating…" : `Create Route (${selectedIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
