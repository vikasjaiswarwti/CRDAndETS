// ============================================================
// RuleTypeToggle.tsx — User / Spoc segmented toggle
//
// Pure UI — switching tabs never calls the API.
// ============================================================

import React from "react";

const PRIMARY = "#2563EB";
const BORDER = "#E5E7EB";
const BG_SEL = "#EFF6FF";
const TEXT_SEC = "#6B7280";

interface RuleTypeToggleProps {
  value: "User" | "Spoc";
  onChange: (who: "User" | "Spoc") => void;
}

export const RuleTypeToggle: React.FC<RuleTypeToggleProps> = ({
  value,
  onChange,
}) => (
  <div
    style={{
      display: "inline-flex",
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      overflow: "hidden",
    }}
  >
    {(["User", "Spoc"] as const).map((w, i) => (
      <button
        key={w}
        onClick={() => onChange(w)}
        style={{
          height: 36,
          padding: "0 24px",
          border: "none",
          borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
          background: value === w ? BG_SEL : "#fff",
          color: value === w ? PRIMARY : TEXT_SEC,
          fontSize: 13,
          fontWeight: value === w ? 600 : 400,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {w}
      </button>
    ))}
  </div>
);
