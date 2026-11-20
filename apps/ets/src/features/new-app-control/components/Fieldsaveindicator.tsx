
// ============================================================
// FieldSaveIndicator.tsx — Field-level save state icon
//
// Shows: spinner (saving) · filled green circle + bold white ✓ (success)
//        · filled red circle + bold white ✕ (error)
// Disappears after 2s on success / 3s on error.
// ============================================================

import React from "react";
import { Loader2 } from "lucide-react";

export type FieldSaveState = "idle" | "saving" | "success" | "error";

interface FieldSaveIndicatorProps {
  state: FieldSaveState;
}

/** Filled green circle with a bold white checkmark drawn via SVG path */
const GreenTick: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Saved"
  >
    {/* Filled green circle */}
    <circle cx="9" cy="9" r="9" fill="#16A34A" />
    {/* Bold white checkmark — stroke-width 2.4 for visibility */}
    <polyline
      points="4.5,9.2 7.5,12.2 13.5,6.2"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/** Filled red circle with a bold white × */
const RedCross: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Failed"
  >
    <circle cx="9" cy="9" r="9" fill="#DC2626" />
    <line
      x1="5.5"
      y1="5.5"
      x2="12.5"
      y2="12.5"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <line
      x1="12.5"
      y1="5.5"
      x2="5.5"
      y2="12.5"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const FieldSaveIndicator: React.FC<FieldSaveIndicatorProps> = ({
  state,
}) => {
  if (state === "idle") return null;

  return (
    <>
      <style>{`@keyframes field-spin { to { transform: rotate(360deg); } }`}</style>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: 8,
          flexShrink: 0,
          verticalAlign: "middle",
        }}
        aria-live="polite"
      >
        {state === "saving" && (
          <Loader2
            size={16}
            style={{
              animation: "field-spin 0.8s linear infinite",
              color: "#2563EB",
            }}
          />
        )}
        {state === "success" && <GreenTick />}
        {state === "error" && <RedCross />}
      </span>
    </>
  );
};
