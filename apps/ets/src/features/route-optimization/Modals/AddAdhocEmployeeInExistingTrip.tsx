// src/features/route-maker/Modals/AddAdhocEmployeeModal.tsx
//
// Modal to add a single employee to an EXISTING trip (adhoc).
// • Single-select employee from server-filtered list
// • Calls POST /api/v1/DriversApp/add-employee-to-trip
// • Does NOT close on error — shows inline error message instead
// • Closes only after a successful response
//
// Props:
//   tripID    — the dsId / trip ID to add the employee into
//   tripType  — 1 = pickup, 2 = drop
//   locCode   — for employee lookup filtering
//   onClose   — close without saving (cancel / backdrop)
//   onSuccess — called after successful addition (trigger refetch)

import React, { useState } from "react";
import { T } from "../constants/designTokens";
import { useAddEmployeeToTripMutation } from "../services/routeMakerApi";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { AlertCircle, UserPlus, Search, X } from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { extractApiError } from "../utils/extractApiError";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  tripID: number;
  tripType: number;
  locCode: number;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AddAdhocEmployeeModal({
  tripID,
  tripType,
  locCode,
  onClose,
  onSuccess,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { userOptions, isLoading: empLoading } = useLookups({
    // locCode,
    searchTerm: debouncedSearch,
    only: ["userOptions"],
  });

  const filtered = userOptions ?? [];

  const [addEmployee, { isLoading: adding }] = useAddEmployeeToTripMutation();
  const { message } = useUILibrary();

  // ── Handlers ────────────────────────────────────────────────────────────────

  function selectEmployee(id: number, label: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setSelectedLabel(label);
    setErrorMsg(null); // clear error on new selection
  }

  async function handleAdd() {
    if (!selectedId || adding) return;
    setErrorMsg(null);

    try {
      const result = await addEmployee({
        tripID,
        empID: selectedId,
        tripType,
      }).unwrap();

      // ── Show API success message, then close ──
      const successMsg =
        (result as any)?.message ?? "Employee added successfully.";
      message.success(successMsg, 4);
      onSuccess();
      onClose();
    } catch (err: any) {
      // ── Stay open, show error ──
      // const msg =
      //   err?.data?.message ??
      //   err?.data?.title ??
      //   err?.error ??
      //   "Failed to add employee. Please try again.";
      // setErrorMsg(String(msg));
      setErrorMsg(extractApiError(err));
    }
  }

  // Prevent backdrop close while request is in-flight
  function handleBackdropClick() {
    if (adding) return;
    onClose();
  }

  const tripTypeLabel = tripType === 2 ? "Drop" : "Pickup";

  return (
    // ── Backdrop ──
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2100,
        backdropFilter: "blur(2px)",
      }}
    >
      {/* ── Dialog ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 440,
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
            padding: "16px 18px 12px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: T.accentBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <UserPlus size={15} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                Add Adhoc Employee
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.muted,
                  marginTop: 2,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span>Trip #{tripID}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{tripTypeLabel}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>Loc {locCode}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={adding}
            style={{
              background: "none",
              border: "none",
              cursor: adding ? "not-allowed" : "pointer",
              color: T.textSub,
              opacity: adding ? 0.4 : 1,
              padding: 2,
              marginTop: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            padding: "12px 18px",
            gap: 10,
          }}
        >
          {/* ── Error banner ── */}
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

          {/* ── Search ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              padding: "6px 10px",
              flexShrink: 0,
            }}
          >
            <Search size={13} color={T.textSub} style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or ID…"
              autoFocus
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
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* ── Count row ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: T.muted }}>
              {empLoading
                ? "Loading…"
                : `${filtered.length} employee${filtered.length !== 1 ? "s" : ""}`}
            </span>
            {selectedId && (
              <button
                onClick={() => {
                  setSelectedId(null);
                  setSelectedLabel("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: T.muted,
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Clear selection
              </button>
            )}
          </div>

          {/* ── Employee list ── */}
          <div
            style={
              {
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                scrollbarWidth: "none",
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
                const checked = selectedId === emp.value;
                const [empName, empCode] = (emp.label as string).split(" - ");

                return (
                  <div
                    key={emp.value}
                    onClick={() => selectEmployee(emp.value, emp.label)}
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
                    {/* ── Radio indicator ── */}
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        border: `2px solid ${checked ? T.accent : T.border}`,
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "border-color 0.1s",
                      }}
                    >
                      {checked && (
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: T.accent,
                          }}
                        />
                      )}
                    </div>

                    {/* ── Avatar ── */}
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

                    {/* ── Details ── */}
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
            padding: "12px 18px",
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          {/* Selected label */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedId ? (
              <div
                style={{
                  fontSize: 11,
                  color: T.accent,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                ✓ {selectedLabel.split(" - ")[0]}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: T.muted }}>
                Select one employee to add
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            disabled={adding}
            style={{
              padding: "8px 16px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: T.card,
              color: T.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: adding ? "not-allowed" : "pointer",
              opacity: adding ? 0.5 : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={!selectedId || adding}
            style={{
              padding: "8px 18px",
              borderRadius: T.radiusSm,
              border: "none",
              background: !selectedId ? T.border : T.accent,
              color: !selectedId ? T.muted : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: !selectedId || adding ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {adding ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Adding…
              </>
            ) : (
              "Add to Trip"
            )}
          </button>
        </div>
      </div>

      {/* ── Spinner keyframes ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
