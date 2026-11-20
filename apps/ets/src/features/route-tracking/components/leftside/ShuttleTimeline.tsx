import {
  CheckOutlined,
  DownOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useState } from "react";
// import { colors } from "../../style/styles";
import type { StopPassenger, Stops } from "../../types/tracking.types";
import { formatTime } from "../../utils/commonFunction";
import { ClockAlert } from "lucide-react";

type StopState = "reached" | "next" | "upcoming";

// One palette drives the marker, the connector below it, and the badge,
// so all three always agree about a stop's state.
const STATE_COLORS: Record<
  StopState,
  { solid: string; tint: string; text: string; border: string }
> = {
  reached: {
    solid: "#16a34a",
    tint: "#dcfce7",
    text: "#166534",
    border: "#bbf7d0",
  },
  next: {
    solid: "#2563eb",
    tint: "#dbeafe",
    text: "#1d4ed8",
    border: "#bfdbfe",
  },
  upcoming: {
    solid: "#cbd5e1",
    tint: "#f1f5f9",
    text: "#64748b",
    border: "#e2e8f0",
  },
};

const STATE_LABEL: Record<StopState, string> = {
  reached: "Reached",
  next: "Next stop",
  upcoming: "Upcoming",
};

const Badge = ({ state, children }: { state: StopState; children: string }) => {
  const palette = STATE_COLORS[state];

  return (
    <span
      style={{
        background: palette.tint,
        border: `1px solid ${palette.border}`,
        borderRadius: 999,
        color: palette.text,
        display: "inline-flex",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.1,
        padding: "3px 8px",
      }}
    >
      {children}
    </span>
  );
};

const getStopState = (stop: Stops): StopState => {
  if (stop.reached) return "reached";
  if (stop.stopStatus === "Current") return "next";
  return "upcoming";
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const EmployeeRow = ({ passenger }: { passenger: StopPassenger }) => {
  const hasContactInfo = passenger.mobileNo || passenger.pickupAddress;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 10,
        padding: "9px 0",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#ede9fe",
          borderRadius: "50%",
          color: "#6d28d9",
          display: "flex",
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          height: 24,
          justifyContent: "center",
          width: 24,
        }}
      >
        {getInitials(passenger.passengerName || `Employee ${passenger.empId}`)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
          <span
            style={{
              color: "#0f172a",
              fontSize: 12,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {passenger.passengerName || `Employee ${passenger.empId}`}
          </span>
          {hasContactInfo && (
            <Tooltip
              title={
                <>
                  {passenger.mobileNo && <div>{passenger.mobileNo}</div>}
                  {passenger.pickupAddress && (
                    <div>{passenger.pickupAddress}</div>
                  )}
                </>
              }
            >
              <InfoCircleOutlined style={{ color: "#64748b", fontSize: 12 }} />
            </Tooltip>
          )}
          <span  style={{  fontSize: 12 }}>{passenger.status}</span>
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {passenger.reached && passenger.pSchTime && (
          <div
            style={{
              color: STATE_COLORS.reached.text,
              fontSize: 11,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            <ClockAlert style={{ color: "#64748b", height: 14 }} />{" "}
            {formatTime(passenger.pSchTime)}
          </div>
        )}
      </div>
    </div>
  );
};

const ShuttleStop = ({ stop, isLast }: { stop: Stops; isLast: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const employeeCount = stop.passengers?.length ?? stop.totalPassengers ?? 0;
  const state = getStopState(stop);
  const palette = STATE_COLORS[state];

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: state === "upcoming" ? "#fff" : palette.solid,
            border: `2px solid ${palette.solid}`,
            borderRadius: "50%",
            color: state === "upcoming" ? palette.text : "#fff",
            display: "flex",
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 700,
            height: 22,
            justifyContent: "center",
            width: 22,
          }}
        >
          {state === "reached" ? (
            <CheckOutlined style={{ fontSize: 12 }} />
          ) : (
            stop.stopOrder
          )}
        </div>
        {!isLast && (
          <div
            style={
              state === "reached"
                ? {
                    background: STATE_COLORS.reached.solid,
                    flex: 1,
                    minHeight: 40,
                    width: 2,
                  }
                : {
                    borderLeft: "2px dashed #cbd5e1",
                    flex: 1,
                    minHeight: 40,
                    width: 0,
                  }
            }
          />
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 8 }}>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          style={{
            background: state === "next" ? "#eff6ff" : "#fff",
            border: `1px solid ${state === "next" ? STATE_COLORS.next.border : "#e2e8f0"}`,
            borderRadius: expanded ? "10px 10px 0 0" : 10,
            cursor: "pointer",
            display: "block",
            padding: 6,
            textAlign: "left",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 4,
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
              {stop.stopAddress || `Stop ${stop.stopOrder}`}
            </span>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexShrink: 0,
                gap: 10,
              }}
            >
              <Badge state={state}>{STATE_LABEL[state]}</Badge>
              {expanded ? (
                <UpOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
              ) : (
                <DownOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
              )}
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              color: "#64748b",
              display: "flex",
              fontSize: 12,
              gap: 6,
              marginTop: 4,
            }}
          >
            <span className="flex items-center gap-1 font-semibold text-gray-600">
              <TeamOutlined style={{ fontSize: 12 }} /> {employeeCount}
            </span>
            |<span>Sch {formatTime(stop.schArrivalTime)}</span>
            {stop.actArrivalTime && (
              <>
                |
                <span
                  style={{
                    color: STATE_COLORS.reached.text,
                    fontWeight: 600,
                  }}
                >
                  ETA -{" "}
                  {stop.actArrivalTime ? formatTime(stop.actArrivalTime) : "-"}
                </span>
              </>
            )}
          </div>
        </button>

        {expanded && (
          <div
            style={{
              background: "#fafafa",
              border: `1px solid ${state === "next" ? STATE_COLORS.next.border : "#e2e8f0"}`,
              borderRadius: "0 0 10px 10px",
              borderTop: "none",
              padding: "0px 8px 2px",
            }}
          >
            {stop.passengers?.length ? (
              stop.passengers.map((passenger, i) => (
                <div
                  key={passenger.empId}
                  style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}
                >
                  <EmployeeRow passenger={passenger} />
                </div>
              ))
            ) : (
              <div
                style={{ color: "#64748b", fontSize: 11, padding: "10px 0" }}
              >
                No employees assigned to this stop.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ShuttleTimeline = ({ stops }: { stops: Stops[] }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      padding: 10,
    }}
  >
    <div
      style={{
        color: "#0f172a",
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 12,
      }}
    >
      Shuttle stops
    </div>
    {stops.map((stop, index) => (
      <ShuttleStop
        key={stop.stopId}
        stop={stop}
        isLast={index === stops.length - 1}
      />
    ))}
  </div>
);

export default ShuttleTimeline;
