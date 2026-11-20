// src/features/individualRoster/components/StatusBadge.tsx

import React from "react";
import type { RowStatus } from "../types/scheduleView.types";

const STATUS_STYLE: Record<
  RowStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  Noshow: {
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
    label: "No Show",
  },
  Cancelled: {
    bg: "#fff1f2",
    color: "#ef4444",
    border: "#fecaca",
    label: "Cancelled",
  },
  Scheduled: {
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#bbf7d0",
    label: "Scheduled",
  },
};

const StatusBadge: React.FC<{ status: RowStatus }> = ({ status }) => {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

export default StatusBadge;
