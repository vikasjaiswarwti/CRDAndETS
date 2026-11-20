import React from "react";
import { T } from "../constants/Designtokens";
import type { SecurityIncident } from "../types/Security.types";

interface Props {
  incident: SecurityIncident;
}

export const DriverVendorCard: React.FC<Props> = ({ incident }) => {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Driver & Vendor Details
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
            {incident.driverName} ({incident.driverPhone})
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {incident.vendorName}
          </div>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: T.blue,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3.5C3 2.67 3.67 2 4.5 2h1.38a.5.5 0 01.49.4l.6 2.98a.5.5 0 01-.15.47L5.5 7.1a9.09 9.09 0 004.4 4.4l1.25-1.32a.5.5 0 01.47-.15l2.98.6a.5.5 0 01.4.49V12.5A1.5 1.5 0 0113.5 14C7.7 14 2 8.3 2 2.5"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Call
        </button>
      </div>

      {/* Map toggles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <Toggle label="Actual route" />
        <Toggle label="Fixed GPS Location" accent />
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; accent?: boolean }> = ({ label, accent }) => {
  const [on, setOn] = React.useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          width: 34,
          height: 18,
          borderRadius: 9,
          border: "none",
          background: on ? (accent ? T.warning : T.accent) : T.border,
          cursor: "pointer",
          padding: 0,
          position: "relative",
          transition: "background .2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 18 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,.2)",
            transition: "left .2s",
          }}
        />
      </button>
      <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
      {accent && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: T.warning,
            border: "2px solid #fff",
            boxShadow: "0 0 0 2px " + T.warning,
          }}
        />
      )}
    </div>
  );
};