// src/features/route-maker/Modals/SingleEmployeeWarningModal.tsx

import { T } from "../constants/designTokens";

interface Props {
  sourceVehicleId: number;
  targetVehicleId: number;
  passengerName: string;
  onMerge: () => void;
  onCancel: () => void;
}

export default function SingleEmployeeWarningModal({
  sourceVehicleId,
  targetVehicleId,
  passengerName,
  onMerge,
  onCancel,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 2500,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
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
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          {/* Warning shield icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#F97316"
                opacity="0.2"
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="#F97316" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Cannot Move Employee
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
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
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Yellow warning banner */}
          <div
            style={{
              background: T.warnBg,
              border: `1px solid ${T.warnBorder}`,
              borderRadius: T.radiusSm,
              padding: "10px 14px",
              fontSize: 12,
              color: "#92400E",
              lineHeight: 1.55,
              fontWeight: 500,
            }}
          >
            <strong>Trip #{sourceVehicleId}</strong> has only 1 employee. Moving
            them individually would leave the trip empty.
          </div>

          {/* Explanation */}
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55 }}>
            To transfer <strong>{passengerName}</strong>, you must merge both
            trips together.
          </div>

          {/* Visual: Trip A → merge → Trip B */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              padding: "10px 14px",
            }}
          >
            {/* Source trip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: T.accent,
                  boxShadow: `0 0 0 2px ${T.accentBg}`,
                  flexShrink: 0,
                }}
              />
              Trip #{sourceVehicleId}
            </div>

            {/* Merge arrow */}
            <div
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}
            >
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M15 8l4 4-4 4"
                  stroke={T.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Target trip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: T.accent,
                  boxShadow: `0 0 0 2px ${T.accentBg}`,
                  flexShrink: 0,
                }}
              />
              Trip #{targetVehicleId}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <button
            type="button"
            onClick={onMerge}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: T.radiusSm,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Yes, Merge Trips
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: "100%",
              padding: "10px 16px",
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
        </div>
      </div>
    </div>
  );
}
