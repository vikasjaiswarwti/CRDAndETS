import React from "react";
import { T } from "../constants/Designtokens";
import type { SecurityIncident } from "../types/Security.types";

interface Props {
  incident: SecurityIncident;
}

export const IncidentSummaryCard: React.FC<Props> = ({ incident }) => {
  const isSLABreached = incident.severity === "critical";

  return (
    <div style={{ padding: "12px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Incident Summary
        </span>
        {isSLABreached && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.danger,
              background: "#FEF2F2",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            SLA Breached
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SummaryCell label="Risk Score" value={String(incident.riskScore)} valueColor={T.danger} />
        <SummaryCell label="Incident Age" value={incident.incidentAge} valueColor={T.warning} />
        <SummaryCell label="Owner" value="Security Team A" />
        <SummaryCell label="Security Status" value={incident.severity === "critical" ? "Critical" : incident.severity === "high" ? "High" : "Medium"} valueColor={incident.severity === "critical" ? T.danger : incident.severity === "high" ? T.warning : T.blue} />
      </div>
    </div>
  );
};

const SummaryCell: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => (
  <div
    style={{
      background: T.bg,
      borderRadius: 8,
      padding: "10px 12px",
    }}
  >
    <div style={{ fontSize: 10, color: T.muted, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </div>
    <div style={{ fontSize: 18, fontWeight: 700, color: valueColor || T.text }}>
      {value}
    </div>
  </div>
);