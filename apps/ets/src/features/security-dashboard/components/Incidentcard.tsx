import React from "react";
import { T } from "../constants/Designtokens";
import type { Alert } from "../types/Security.types";
import { ArrowRight, Clock, MapPin } from "lucide-react";

import { useReverseGeocode } from "../../../shared/hooks/useReverseGeocode";

interface IncidentCardProps {
  incident: Alert;
  selected: boolean;
  onSelect: () => void;
}

const getStatusBadge = (bg: string, color: string, border: string) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3px 9px",
  borderRadius: 999,
  fontSize: 10.5,
  fontWeight: 600,
  background: bg,
  color,
  border: `1px solid ${border}`,
  whiteSpace: "nowrap" as const,
});

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  selected,
  onSelect,
}) => {
  const hasValidCoords =
    incident.lat != null &&
    incident.lng != null &&
    isFinite(incident.lat) &&
    isFinite(incident.lng) &&
    !(incident.lat === 0 && incident.lng === 0);

  const { address, loading: addressLoading } = useReverseGeocode(
    hasValidCoords ? { lat: incident.lat, lng: incident.lng } : null,
  );

  return (
    <div
      onClick={onSelect}
      style={{
        background: T.card,
        padding: "12px",
        cursor: "pointer",
        transition: "border .15s, box-shadow .15s",
        boxShadow: selected ? `0 0 0 3px ${T.dangerBg}` : T.shadow,
        border: selected ? `1px solid ${T.danger}` : `1px solid ${T.border}`,
        borderRadius: T.radius,
        marginBottom: 8,
      }}
      className="alertCardcom"
    >
      {/* ── Row 1: Trip ID + Time ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
          Trip ID-{incident.dsId ?? "N/A"}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: T.muted,
            fontWeight: 500,
          }}
        >
          <Clock size={11} />
          {formatTime(incident.alertTime)}
        </span>
      </div>

      {/* ── Row 2: Priority + Resolved + Acknowledged badges ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span style={getStatusBadge(`${T.danger}22`, T.danger, T.danger)}>
          {incident.priorityName}
        </span>

        <span
          style={getStatusBadge(
            incident.isResolved ? "#E8F5E9" : "#FDECEC",
            incident.isResolved ? "#2E7D32" : "#D32F2F",
            incident.isResolved ? "#A5D6A7" : "#F5B5B5",
          )}
        >
          {incident.isResolved ? "Resolved" : "Unresolved"}
        </span>

        <span
          style={getStatusBadge(
            incident.isAcknowledged ? "#E8F5E9" : "#FFF8E1",
            incident.isAcknowledged ? "#2E7D32" : "#B45309",
            incident.isAcknowledged ? "#A5D6A7" : "#FDE68A",
          )}
        >
          {incident.isAcknowledged ? "Acknowledged" : "Acknowledge Pending"}
        </span>
      </div>

      {/* ── Row 3: Message ── */}
      <div
        style={{
          fontSize: 12.5,
          color: T.text,
          fontWeight: 400,
          lineHeight: 1.5,
          marginBottom: 8,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {incident.message}
      </div>

      {hasValidCoords && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 5,
            marginBottom: 8,
            fontSize: 11.5,
            color: T.muted,
          }}
        >
          <MapPin
            size={12}
            color="#DC2626"
            style={{ marginTop: 1, flexShrink: 0 }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {addressLoading
              ? "Fetching address…"
              : (address ?? "Address unavailable")}
          </span>
        </div>
      )}
      {/* ── Row 4: Arrow ── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ArrowRight size={16} style={{ color: T.muted }} />
      </div>
    </div>
  );
};
