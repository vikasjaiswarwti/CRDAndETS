// ─── components/EtaEditPopover.tsx ───────────────────────────────────────────
// Inline popover that renders on the ETA anchor click in PassengerRow.
// Shows passenger summary and lets the user pick a new scheduled pickup time.
// On save → calls POST /api/v1/TripManagement/UpdatePschTime, then fires
// the page-level refetch so the map and stats refresh correctly.

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { T } from "../constants/designTokens";
import type { Passenger } from "../types/Routemaker.types";
import { fmt12 } from "../utils/routeMakerHelpers";
import { useUpdatePschTimeMutation } from "../services/routeMakerApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  passenger: Passenger;
  vehicleId: number; // dsId
  groupColor: string;
  /** Fires after a successful save so the parent page can refetch */
  onAfterSave: () => void;
  /** Called when the popover wants to close itself */
  onClose: () => void;
  /** The anchor element to position against */
  anchorRef: React.RefObject<HTMLElement | null>;
  mobile?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert an ISO / "HH:MM" / "YYYY-MM-DDTHH:MM:SS" string to "HH:MM" for
 *  the <input type="time"> value attribute. */
function toTimeInput(raw: string | null | undefined): string {
  if (!raw) return "";
  // Already "HH:MM" or "HH:MM:SS"
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  // ISO string
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return d.toTimeString().slice(0, 5);
  } catch {
    return "";
  }
}

/** Build the ISO datetime the API expects ("YYYY-MM-DDTHH:MM:SS").
 *  We keep today's date if pschTime is null, otherwise preserve the date
 *  part of the existing scheduled time. */
function buildPschTime(
  existingIso: string | null | undefined,
  timeHHMM: string,
): string {
  let date = new Date();
  if (existingIso) {
    const d = new Date(existingIso);
    if (!isNaN(d.getTime())) date = d;
  }
  const [hh, mm] = timeHHMM.split(":").map(Number);
  date.setHours(hh, mm, 0, 0);
  // Local ISO without timezone suffix (matches API sample)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hh)}:${pad(mm)}:00`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EtaEditPopover({
  passenger,
  vehicleId,
  groupColor,
  onAfterSave,
  onClose,
  anchorRef,
  mobile = false,
}: Props) {
  console.log("passenger from eta edit", passenger);

  const [timeValue, setTimeValue] = useState<string>(
    toTimeInput(passenger.EstimatedPickupTime),
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  const { message } = useUILibrary();

  // Inside component, replace useState saving/error with mutation hook:
  const [updatePschTime, { isLoading: saving }] = useUpdatePschTimeMutation();

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose, anchorRef]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ── Save handler ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!timeValue) {
      setError("Please select a time.");
      return;
    }
    setError(null);
    try {
      const pschTime = buildPschTime(passenger.EstimatedPickupTime, timeValue);
      await updatePschTime({
        dsId: vehicleId,
        empId: Number(passenger.empId),
        pschTime,
      }).unwrap();

      message.success(`ETA updated for ${passenger.Firstname}.`);
      setSuccess(true);
      setTimeout(() => {
        onAfterSave();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to update ETA.";
      setError(errMsg);
      message.error(errMsg);
    }
  }

  const isFemale = passenger.Gender === "F";
  const badgeBg = isFemale ? "#EC4899" : groupColor;

  // ── Render ────────────────────────────────────────────────────────────────
  const popover = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label="Edit ETA"
      style={{
        position: mobile ? "fixed" : "absolute",
        zIndex: 9999,
        ...(mobile
          ? {
              left: 8,
              right: 8,
              bottom: "max(8px, env(safe-area-inset-bottom))",
              width: "auto",
              maxWidth: 360,
              maxHeight: "calc(100dvh - 16px)",
              overflowY: "auto" as const,
              margin: "0 auto",
            }
          : {
              right: 0,
              top: "calc(100% + 6px)",
              width: 248,
            }),
        borderRadius: T.radiusLg,
        background: "#fff",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,.08), 0 12px 28px -4px rgba(0,0,0,.14)",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
      }}
    >
      {/* ── Coloured header bar ── */}
      <div
        style={{
          background: badgeBg,
          padding: "10px 12px 8px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 0.2,
          }}
        >
          Edit ETA of selected Passenger
        </div>
        <div
          style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 }}
        >
          Trip #{vehicleId} · Stop {passenger.PickupSequence}
        </div>
      </div>

      {/* ── Passenger summary ── */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {/* Gender badge */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: isFemale ? "#FDF2F8" : "#EFF6FF",
              border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: isFemale ? "#EC4899" : "#3B82F6",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {isFemale ? "♀" : "♂"}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {passenger.displayName ? `${passenger.displayName} – ` : ""}
              {passenger.Firstname}
            </div>
            {passenger.EmployeeID && (
              <div style={{ fontSize: 10, color: T.muted }}>
                EMP ID: {passenger.EmployeeID}
              </div>
            )}
          </div>
        </div>

        {passenger.locality && (
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>
            Zone: {passenger.locality}
          </div>
        )}
        {passenger.Address && (
          <div
            style={{
              fontSize: 10,
              color: T.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {passenger.Address}
          </div>
        )}

        {/* Metric row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 4,
            fontSize: 10,
            color: T.textSm,
          }}
        >
          <span>
            <span style={{ color: T.muted }}>Dist </span>
            <strong>
              {passenger.routedDistanceKm != null
                ? `${passenger.routedDistanceKm.toFixed(1)} km`
                : "—"}
            </strong>
          </span>
          <span>
            <span style={{ color: T.muted }}>ED </span>
            <strong>
              {passenger.extraDistanceKm != null
                ? `${passenger.extraDistanceKm.toFixed(1)} km`
                : "—"}
            </strong>
          </span>
          <span>
            <span style={{ color: T.muted }}>ETA </span>
            <strong style={{ color: badgeBg }}>
              {fmt12(passenger.EstimatedPickupTime) || "—"}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Time picker ── */}
      <div style={{ padding: "10px 12px 12px" }}>
        <label
          htmlFor={`eta-time-${passenger.Id}`}
          style={{
            display: "block",
            fontSize: 10,
            fontWeight: 700,
            color: T.muted,
            marginBottom: 5,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          New Pickup Time
        </label>
        <input
          id={`eta-time-${passenger.Id}`}
          type="time"
          value={timeValue}
          onChange={(e) => {
            setTimeValue(e.target.value);
            setError(null);
          }}
          disabled={saving || success}
          style={{
            width: "100%",
            height: 34,
            borderRadius: T.radiusSm,
            border: `1.5px solid ${error ? "#ef4444" : T.border}`,
            padding: "0 10px",
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            background: saving || success ? T.accentBg : "#fff",
            outline: "none",
            boxSizing: "border-box",
            cursor: saving || success ? "not-allowed" : "text",
            transition: "border-color 0.15s",
          }}
        />

        {error && (
          <div
            style={{
              marginTop: 5,
              fontSize: 10,
              color: "#ef4444",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: 5,
              fontSize: 10,
              color: "#10b981",
              fontWeight: 700,
            }}
          >
            ✓ Updated successfully!
          </div>
        )}

        {/* Action row */}
        <div
          style={{
            display: "flex",
            gap: 7,
            marginTop: 10,
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              height: 30,
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.muted,
              fontSize: 11,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || success || !timeValue}
            style={{
              flex: 2,
              height: 30,
              borderRadius: T.radiusSm,
              border: "none",
              background:
                saving || success || !timeValue
                  ? `${groupColor}66`
                  : groupColor,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              cursor:
                saving || success || !timeValue ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "background 0.15s",
            }}
          >
            {saving ? (
              <>
                <svg
                  style={{
                    animation: "etaSpin 0.8s linear infinite",
                  }}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving…
              </>
            ) : success ? (
              "✓ Saved"
            ) : (
              "Update ETA"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes etaSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return mobile ? createPortal(popover, document.body) : popover;
}
