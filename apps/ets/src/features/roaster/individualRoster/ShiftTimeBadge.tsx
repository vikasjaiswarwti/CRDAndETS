// src/features/individualRoster/components/ShiftTimeBadge.tsx

import React from "react";
import type { Tab } from "../types/scheduleView.types";

interface ShiftTimeBadgeProps {
  time?: string;
  tab: Tab;
}

const ShiftTimeBadge: React.FC<ShiftTimeBadgeProps> = ({ time, tab }) => {
  const isNA =
    !time || time === "N" || time === "N/A" || time === "-" || time === "00:00";

  if (isNA) {
    return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        background: tab === "LOGIN" ? "#d1fae5" : "#dbeafe",
        color: tab === "LOGIN" ? "#064e3b" : "#1e40af",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {time}
    </span>
  );
};

export default ShiftTimeBadge;
