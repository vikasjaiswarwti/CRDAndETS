// components/shuttle/StopMetaBadge.tsx

// import React from "react";

interface StopMetaBadgeProps {
  pax: number;
  distanceKms: number;
  eta: string;
}

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 10,
      color: "#6b7280",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{fontWeight:600}}>{label}</span>
    <span style={{ fontWeight: 700, color: "#111827" }}>{value}</span>
  </div>
);

export function StopMetaBadge({ pax, distanceKms, eta }: StopMetaBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        // flexDirection: "column",
        // alignItems: "flex-end",
        justifyContent: "space-around",
        gap: 2,
        flexShrink: 0,
      }}
    >
      <MetaRow label="Total Pax:" value={String(pax)} />

      <MetaRow label="Distance :" value={`${distanceKms} KM`} />

      <MetaRow label="ETA:" value={eta} />
    </div>
  );
}
