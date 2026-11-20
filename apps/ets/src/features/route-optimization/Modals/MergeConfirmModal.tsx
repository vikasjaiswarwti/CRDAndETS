// src/features/route-maker/Modals/MergeConfirmModal.tsx

import React from "react";
import { T } from "../constants/designTokens";
import type { CabGroup } from "../types/Routemaker.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  groupA: CabGroup;
  groupB: CabGroup;
  colorMap: Record<number, string>;
  isMerging?: boolean;
  onConfirmAuto: () => void;
  onConfirmAndRearrange: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// TripCard sub-component
// ---------------------------------------------------------------------------

const TripCard: React.FC<{ group: CabGroup; color: string }> = ({
  group,
  color,
}) => (
  <div
    style={{
      flex: 1,
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      padding: "10px 12px",
      minWidth: 0,
      boxSizing: "border-box",
    }}
  >
    {/* Trip header */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        marginBottom: 8,
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
      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
        Trip #{group.vehicleId}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 10,
          color: T.muted,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "1px 6px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {group.passengers.length} emp
      </span>
    </div>

    {/* Passenger list */}
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {group.passengers.slice(0, 5).map((p) => (
        <div
          key={p.Id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: T.textSm,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {p.PickupSequence}
          </span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {p.Firstname}
          </span>
          {p.Gender === "F" && (
            <span
              style={{
                fontSize: 9,
                color: "#DB2777",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              F
            </span>
          )}
        </div>
      ))}
      {group.passengers.length > 5 && (
        <div style={{ fontSize: 10, color: T.muted, paddingLeft: 24 }}>
          +{group.passengers.length - 5} more
        </div>
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// MergeConfirmModal
// ---------------------------------------------------------------------------

export default function MergeConfirmModal({
  groupA,
  groupB,
  colorMap,
  isMerging = false,
  onConfirmAuto,
  onConfirmAndRearrange,
  onCancel,
}: Props) {
  const colorA = colorMap[groupA.vehicleId] ?? T.accent;
  const colorB = colorMap[groupB.vehicleId] ?? T.muted;
  const totalPassengers = groupA.passengers.length + groupB.passengers.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        zIndex: 2200,
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={isMerging ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Merge icon */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: T.accentBg,
              border: `1px solid ${T.accent}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"
                stroke={T.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Merge Trips
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
              Trip #{groupA.vehicleId} + Trip #{groupB.vehicleId} →{" "}
              {totalPassengers} employees
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isMerging}
            style={{
              background: "none",
              border: "none",
              cursor: isMerging ? "not-allowed" : "pointer",
              color: T.text,
              fontSize: 20,
              lineHeight: 1,
              padding: 2,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
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
          {/* Two trip cards side by side with merge arrow */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <TripCard group={groupA} color={colorA} />

            {/* Merge arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 24,
                flexShrink: 0,
                gap: 4,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M15 8l4 4-4 4"
                  stroke={T.accent}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 9,
                  color: T.muted,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                MERGE
              </span>
            </div>

            <TripCard group={groupB} color={colorB} />
          </div>

          {/* Warning banner */}
          <div
            style={{
              background: T.warnBg,
              border: `1px solid ${T.warnBorder}`,
              borderRadius: T.radiusSm,
              padding: "9px 12px",
              fontSize: 12,
              color: "#92400E",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="#D97706"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
                stroke="#D97706"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17" r="1" fill="#D97706" />
            </svg>
            <span>
              This action will permanently merge both trips. The merged trip
              will contain all <strong>{totalPassengers} employees</strong>.
              This cannot be undone.
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: T.border, margin: "0 20px" }} />

        {/* ── Footer ── */}
        <div
          style={{
            padding: "14px 20px 16px",
            display: "flex",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          {/* Merge Automatically */}
          <button
            type="button"
            onClick={onConfirmAuto}
            disabled={isMerging}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: T.radiusSm,
              border: "none",
              background: isMerging ? T.accentHover : T.accent,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: isMerging ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              opacity: isMerging ? 0.75 : 1,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {isMerging ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 36 36"
                  fill="none"
                  style={{ animation: "rmSpin 0.8s linear infinite" }}
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 3 A15 15 0 0 1 33 18"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span>Merge Automatically</span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 400,
              }}
            >
              System will re-optimize the route automatically.
            </span>
          </button>

          {/* Merge & Rearrange */}
          <button
            type="button"
            onClick={onConfirmAndRearrange}
            disabled={isMerging}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.accent}`,
              background: T.accentBg,
              color: T.accent,
              fontSize: 12,
              fontWeight: 700,
              cursor: isMerging ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              opacity: isMerging ? 0.6 : 1,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke={T.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke={T.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Merge &amp; Rearrange Stop Order</span>
            </div>
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}>
              You can define the exact pickup sequence after merging.
            </span>
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isMerging}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`,
              background: T.card,
              color: T.muted,
              fontSize: 12,
              fontWeight: 600,
              cursor: isMerging ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              opacity: isMerging ? 0.6 : 1,
              boxSizing: "border-box",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
