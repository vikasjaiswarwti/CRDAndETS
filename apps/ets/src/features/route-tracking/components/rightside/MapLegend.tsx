import type React from "react";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";

const RouteStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "12px 72px 1fr",
  alignItems: "center",
  gap: 4,
};

function MapLegend({
  showActual,
  showPlanned,
  hideShowPlanned,
  hideShowActual,
  onTogglePlanned,
  onToggleActual,
}: {
  showActual: boolean;
  showPlanned: boolean;
  hideShowPlanned: boolean;
  hideShowActual: boolean;
  onTogglePlanned: () => void;
  onToggleActual: () => void;
}) {
  const isMobile=useIsMobile();
  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 4:10,
        left: isMobile ? 4:10,
        background: "rgba(255,255,255,0.97)",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "8px 12px",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      }}
    >
     

      {/* Planned Route row */}
      {hideShowPlanned && (
        <div style={RouteStyle}>
          <div
            style={{
              width: isMobile ? 8:10,
              height: isMobile ? 8:10,
              background: showPlanned ? "#ec4899" : "#cbd5e1",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 10, color: "#1e293b", fontWeight: 500 }}>
            Planned Route
          </span>

          {/* Toggle switch */}
          <label
            style={{
              marginLeft: isMobile ? 0:2,
              position: "relative",
              display: "inline-block",
              width: 34,
              height: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showPlanned}
              onChange={onTogglePlanned}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: showPlanned ? "#2563eb" : "#cbd5e1",
                borderRadius: 18,
                transition: "background 0.2s",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 2,
                left: showPlanned ? 20 : 2,
                width: 10,
                height: 10,
                background: "#fff",
                borderRadius: "50%",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </label>
        </div>
      )}
       {/* Actual Route row */}
      {hideShowActual && (
        <div style={{ ...RouteStyle, marginBottom: 3 }}>
          <div
            style={{
              width: isMobile ? 8:10,
              height: isMobile ? 8:10,
              background: showActual ? "#2563eb" : "#cbd5e1",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: 10, color: "#1e293b", fontWeight: 500 }}>
            Actual Route
          </span>
          {/* Toggle switch */}
          <label
            style={{
              marginLeft: 2,
              position: "relative",
              display: "inline-block",
              width: 34,
              height: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showActual}
              onChange={onToggleActual}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: showActual ? "#2563eb" : "#cbd5e1",
                borderRadius: 18,
                transition: "background 0.2s",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 2,
                left: showActual ? 20 : 2,
                width: 10,
                height: 10,
                background: "#fff",
                borderRadius: "50%",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default MapLegend;
