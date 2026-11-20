import React, { useState } from "react";
import { T } from "../constants/Designtokens";
import type { SecurityIncident } from "../types/Security.types";

interface Props {
  incident: SecurityIncident;
}

const EVENT_COLORS: Record<string, string> = {
  sos: T.danger,
  overspeed: T.warning,
  route: "#8B5CF6",
  gps: T.muted,
};

export const TimelinePanel: React.FC<Props> = ({ incident }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ padding: "0 16px 12px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Live Trip Timeline
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.muted }}>
            {incident.events.length} events
          </span>
          <span style={{ fontSize: 11, color: T.muted }}>8:10 PM — now</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.muted,
              padding: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .2s",
              }}
            >
              <path
                d="M3 5l4 4 4-4"
                stroke={T.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {incident.events.map((event, i) => {
            const color = EVENT_COLORS[event.type] || T.muted;
            const isLast = i === incident.events.length - 1;
            return (
              <div
                key={i}
                style={{ display: "flex", gap: 12, position: "relative" }}
              >
                {/* Dot + line */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                    width: 16,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      marginTop: 4,
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  />
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 24,
                        background: `${T.border}`,
                        margin: "2px 0",
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.muted,
                          marginBottom: 2,
                        }}
                      >
                        {event.time}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: event.type === "sos" ? 600 : 500,
                          color: event.type === "sos" ? T.danger : T.text,
                        }}
                      >
                        {event.title}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>
                        {event.subtitle}
                      </div>
                    </div>
                    <button
                      style={{
                        background: T.accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "3px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      ACT
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Full Details */}
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.blue,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 4,
            margin: "0 auto",
          }}
        >
          View Full Details
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 3l4 4-4 4"
              stroke={T.blue}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
