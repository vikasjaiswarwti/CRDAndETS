// src/features/route-maker/Modals/StopWisePassengerList.tsx

import { T } from "../../constants/designTokens";
import type { ShuttleStopApi } from "../../types/Shuttleapitypes";
import { Users } from "lucide-react";

interface Props {
  stops: ShuttleStopApi[];
}

export default function StopWisePassengerList({ stops }: Props) {
  console.log("stops from StopWisePassengerList", stops);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stops.map((stop, idx) => (
        <div key={stop.stopId}>
          {/* Stop header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              marginBottom: 5,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: T.accent,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {idx + 1}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  color: T.text,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 1,
                }}
              >
                {stop.stopAddress}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: T.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  marginTop: 1,
                }}
              >
                <Users size={8} />
                {stop.passengers.length} passenger
                {stop.passengers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div
            style={{
              marginLeft: 24,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {stop.passengers.map((p: any) => (
              <div
                key={p.empId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  background: T.bg,
                  borderRadius: 6,
                  border: `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: p.gender === "F" ? "#FDF2F8" : "#EFF6FF",
                    border: `1px solid ${p.gender === "F" ? "#F9A8D4" : "#BFDBFE"}`,
                    color: p.gender === "F" ? "#EC4899" : "#3B82F6",
                    fontSize: 8,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {p.gender === "F" ? "♀" : "♂"}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: T.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.passengerName}
                  </div>
                  {p.mobileNo && (
                    <div style={{ fontSize: 9, color: T.muted }}>
                      {p.mobileNo}
                    </div>
                  )}
                </div>
                {p.noShow && (
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 800,
                      color: "#DC2626",
                      background: "#FEE2E2",
                      padding: "1px 4px",
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  >
                    NO SHOW
                  </span>
                )}
              </div>
            ))}
          </div>

          {idx < stops.length - 1 && (
            <div
              style={{
                marginLeft: 8,
                marginTop: 4,
                width: 2,
                height: 10,
                background: T.border,
                borderRadius: 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
