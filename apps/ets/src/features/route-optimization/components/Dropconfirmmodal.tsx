// ─── Modals/DropConfirmModal.tsx ──────────────────────────────────────────────
// Confirmation modal that opens after every successful drag-and-drop.
//
// Usage in RouteMakerPage:
//   <DropConfirmModal
//     payload={dropModalPayload}   // built from DropResult + cabGroups lookup
//     onConfirm={handleConfirmDrop}
//     onCancel={handleCancelDrop}
//     colorMap={colorMap}
//   />
//
// onConfirm() → parent applies applyDropToCabGroup() + calls your API mutation.
// onCancel()  → pendingDrop cleared, no state change.

import React, { useEffect, useState } from "react";
import { T } from "../constants/designTokens";

export interface DragPassenger {
  passengerId: number;
  passengerName: string;
  employeeId: string;
  gender: "M" | "F";
  sourceVehicleId: number;
  sourceVehicleLabel: string;
  pickupSequence: number;
}

export interface DropConfirmPayload {
  passenger: DragPassenger;
  targetVehicleId: number;
  targetVehicleLabel: string;
  targetType: "CAB_GROUP" | "ROUTE_CARD";
}

export interface DropConfirmModalProps {
  payload: DropConfirmPayload | null;
  onMoveOnly: () => void;
  onMergeAndRearrange: () => void;
  onCancel: () => void;
  colorMap: Record<number, string>;
  isConfirming?: boolean;
}

const RouteDot: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      padding: "5px 10px",
      fontSize: 13,
      fontWeight: 500,
      color: T.text,
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 0 2px ${color}33`,
      }}
    />
    {label}
  </span>
);

export const DropConfirmModal: React.FC<DropConfirmModalProps> = ({
  payload,
  onMoveOnly,
  onMergeAndRearrange,
  onCancel,
  colorMap,
  isConfirming = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (payload !== null) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    } else {
      setMounted(false);
    }
  }, [payload]);

  if (payload === null) return null;

  const { passenger, targetVehicleId, targetVehicleLabel } = payload;
  const sourceColor = colorMap[passenger.sourceVehicleId] ?? T.text;
  const targetColor = colorMap[targetVehicleId] ?? T.accent;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drop-confirm-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 400,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          transform: mounted ? "scale(1)" : "scale(0.95)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            id="drop-confirm-title"
            style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}
          >
            Move Passenger?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.text,
              fontSize: 20,
              lineHeight: 1,
              padding: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Passenger card */}
          <div
            style={{
              background: T.bg,
              borderRadius: T.radiusSm,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: sourceColor,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 0 0 3px ${sourceColor}33`,
              }}
            >
              {passenger.pickupSequence}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {passenger.passengerName}
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>
                {passenger.employeeId}
                {" · "}
                {passenger.gender === "F" ? "Female" : "Male"}
              </div>
            </div>
          </div>

          {/* From → To */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <RouteDot
              color={sourceColor}
              label={passenger.sourceVehicleLabel}
            />
            <span style={{ color: T.muted, fontSize: 18 }} aria-hidden="true">
              →
            </span>
            <RouteDot color={targetColor} label={targetVehicleLabel} />
          </div>

          {/* Warning */}
          <div
            style={{
              fontSize: 12,
              color: T.muted,
              background: T.warnBg,
              border: `1px solid #FDE68A`,
              borderRadius: T.radiusSm,
              padding: "7px 12px",
              lineHeight: 1.5,
            }}
          >
            Pickup sequence will be recalculated after this move.
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: T.border, margin: "0 20px" }} />

        {/* ── Footer ── */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Option 1: Move Employee Only */}
          <button
            type="button"
            onClick={onMoveOnly}
            disabled={isConfirming}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              background: T.card,
              textAlign: "left",
              display: "flex",
              gap: 12,
              alignItems: "center",
              cursor: isConfirming ? "not-allowed" : "pointer",
              opacity: isConfirming ? 0.6 : 1,
              boxSizing: "border-box",
            }}
          >
            {/* Icon or spinner */}
            <div
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isConfirming ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 36 36"
                  fill="none"
                  style={{ animation: "rmSpin 0.8s linear infinite" }}
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke={T.border}
                    strokeWidth="3"
                  />
                  <path
                    d="M18 3 A15 15 0 0 1 33 18"
                    stroke={T.accent}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke={T.muted}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"
                    stroke={T.muted}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 8l2 2-2 2M16 10h6"
                    stroke={T.muted}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                Move Employee Only
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                Employee transferred to target trip. Sequence recalculated.
              </div>
            </div>
          </button>

          {/* Option 2: Merge Trips & Rearrange */}
          <button
            type="button"
            onClick={onMergeAndRearrange}
            disabled={isConfirming}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `1px solid ${T.accent}`,
              borderRadius: T.radiusSm,
              background: T.accentBg,
              textAlign: "left",
              display: "flex",
              gap: 12,
              alignItems: "center",
              cursor: isConfirming ? "not-allowed" : "pointer",
              opacity: isConfirming ? 0.6 : 1,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 3H5a2 2 0 0 0-2 2v3"
                  stroke={T.accent}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 8V5a2 2 0 0 0-2-2h-3"
                  stroke={T.accent}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 16v3a2 2 0 0 0 2 2h3"
                  stroke={T.accent}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 21h3a2 2 0 0 0 2-2v-3"
                  stroke={T.accent}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8v8M8 12l4 4 4-4"
                  stroke={T.accent}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>
                Merge Trips & Rearrange
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                Both trips merged. You define the pickup order.
              </div>
            </div>
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            style={{
              width: "100%",
              padding: "8px 16px",
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              background: T.card,
              color: T.muted,
              fontSize: 13,
              fontWeight: 500,
              cursor: isConfirming ? "not-allowed" : "pointer",
              opacity: isConfirming ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DropConfirmModal;
