import type React from "react";

export type StatusType = "Approved" | "Processing" | "Rejected" | "Pending";

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const styles: Record<StatusType, React.CSSProperties> = {
    Approved:   { background: "#E8F5EE", color: "#1B4332" },
    Processing: { background: "#FFF8E1", color: "#B45309" },
    Rejected:   { background: "#FEE2E2", color: "#B91C1C" },
    Pending:    { background: "#F0F0F0", color: "#666" },
  };
  return (
    <span
      style={{
        ...styles[status],
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 99,
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
};