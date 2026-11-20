import React, { useState } from "react";
import { T } from "../constants/Designtokens";
import type { SecurityIncident } from "../types/Security.types";

interface Props {
  incident: SecurityIncident;
}

type Tab = "SIGNALS" | "NEARBY" | "HISTORY";

export const SignalTabs: React.FC<Props> = ({ incident }) => {
  const [activeTab, setActiveTab] = useState<Tab>("SIGNALS");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "SIGNALS", label: "Signals", icon: <BellIcon /> },
    { key: "NEARBY", label: "Nearby", icon: <LocationIcon /> },
    { key: "HISTORY", label: "History", icon: <ClockIcon /> },
  ];

  return (
    <div style={{ borderTop: `1px solid ${T.border}` }}>
      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                borderBottom: isActive ? `2px solid ${T.blue}` : "2px solid transparent",
                cursor: "pointer",
                padding: "10px 4px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                color: isActive ? T.blue : T.muted,
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                transition: "all .15s",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "12px 16px" }}>
        {activeTab === "SIGNALS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {incident.activeRisks.map((risk, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: T.bg,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i === 0 ? T.danger : i === 1 ? T.warning : T.blue,
                  }}
                />
                <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{risk}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "NEARBY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...incident.nearbyHospitals, ...incident.nearbyPoliceStations].map((loc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: T.bg,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: loc.type === "hospital" ? T.danger : T.blue,
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loc.type === "hospital" ? "H" : "P"}
                  </span>
                  <span style={{ fontSize: 12, color: T.text }}>{loc.name}</span>
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>
                  {loc.distanceKm} km · {loc.etaMinutes} min
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "HISTORY" && (
          <div style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>
            No prior incidents for this vehicle
          </div>
        )}
      </div>
    </div>
  );
};

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5A4.5 4.5 0 003.5 6v3.5L2 11h12l-1.5-1.5V6A4.5 4.5 0 008 1.5zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 1a6 6 0 016 6c0 4-6 9-6 9S2 11 2 7a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);