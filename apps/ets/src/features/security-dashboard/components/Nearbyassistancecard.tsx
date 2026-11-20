import React from "react";
import { T } from "../constants/Designtokens";
import type { SecurityIncident } from "../types/Security.types";

interface Props {
  incident: SecurityIncident;
}

export const NearbyAssistanceCard: React.FC<Props> = ({ incident }) => {
  const hospitals = incident.nearbyHospitals.slice(0, 2);
  const police = incident.nearbyPoliceStations.slice(0, 1);
  const items = [
    ...hospitals.map((h) => ({ ...h, icon: "H", color: T.danger, type: "hospital" as const })),
    ...police.map((p) => ({ ...p, icon: "▲", color: T.blue, type: "police" as const })),
  ];

  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: T.shadow,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Nearby Assistance
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: item.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            {/* Name */}
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name}
            </div>

            {/* Distance + ETA */}
            <div style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap", marginRight: 12 }}>
              {item.distanceKm} km · {item.etaMinutes} min
            </div>

            {/* Action icons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: T.muted,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3.5C3 2.67 3.67 2 4.5 2h1.38a.5.5 0 01.49.4l.6 2.98a.5.5 0 01-.15.47L5.5 7.1a9.09 9.09 0 004.4 4.4l1.25-1.32a.5.5 0 01.47-.15l2.98.6a.5.5 0 01.4.49V12.5A1.5 1.5 0 0113.5 14C7.7 14 2 8.3 2 2.5" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: T.muted,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10.09 5.26L14.73 5.98L11.37 9.26L12.18 13.9L8 11.7L3.82 13.9L4.63 9.26L1.27 5.98L5.91 5.26L8 1Z" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};