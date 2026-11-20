import React, { useState } from "react";
// import { colors } from "../style/styles";
import AlertBanner from "./leftside/AlertBanner";
import TripSummaryCard from "./leftside/TripSummaryCard";
import { TripTimeline } from "./leftside/TripTimeline";
import ShuttleTimeline from "./leftside/ShuttleTimeline";
import ReplayButton from "./leftside/ReplayButton";
import type {
  Stops,
  TripPassenger,
  TripResponse,
} from "../types/tracking.types";
// import {
//   getTimeDifference,
//   formatDateTime,
//   formatTime,
// } from "../utils/commonFunction";
import { TRIP_STATUS } from "../constants/trackConstant";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleEvent,
  setAllEvents,
  // toggleReplay,
  // resetRouteTrackingUi,
} from "../slice/routeTrackingSlice";
import {
  CheckCircleFilled,
  LogoutOutlined,
  EnvironmentOutlined,
  CloseCircleFilled,
  ThunderboltFilled,
  PauseCircleFilled,
  DisconnectOutlined,
  AlertFilled,
} from "@ant-design/icons";
export const EVENT_COLORS: Record<string, string> = {
  actualSignIn: "#22c55e",
  actualSignOut: "#f59e0b",
  calls: "#3b82f6",
  noShow: "#ef4444",
  gpsLoss: "#a855f7",
  sos: "#dc2626",
  overspeed: "#f97316",
  vehicleStop: "#64748b",
  networkLoss: "#ec4899",
};

interface LeftSidebarProps {
  leftData: TripResponse;
  passengers: TripPassenger[];
  isMobile?: boolean;
  stops?: Stops[];
  isShuttleTrip: boolean;
}
const eventOptions = [
  {
    key: "actualSignIn",
    label: "Actual sign ins",
    icon: <CheckCircleFilled style={{ color: "#22c55e" }} />,
  },
  {
    key: "actualSignOut",
    label: "Actual sign outs",
    icon: <LogoutOutlined style={{ color: "#3b82f6" }} />,
  },
  {
    key: "noShow",
    label: "No Show (on map)",
    icon: <CloseCircleFilled style={{ color: "#dc2626" }} />,
  },
  {
    key: "gpsLosss",
    label: "GPS Loss",
    icon: <EnvironmentOutlined style={{ color: "#ef4444" }} />,
  },
  {
    key: "overspeed",
    label: "Over Speeding",
    icon: <ThunderboltFilled style={{ color: "#f59e0b" }} />,
  },
  {
    key: "vehicleStop",
    label: "Vehicle Stoppage",
    icon: <PauseCircleFilled style={{ color: "#9333ea" }} />,
  },
  {
    key: "sos",
    label: "SOS Alert",
    icon: <AlertFilled style={{ color: "#dc2626" }} />,
  },
  {
    key: "networkLoss",
    label: "Network Loss",
    icon: <DisconnectOutlined style={{ color: "#6b7280" }} />,
  },
];

const tabs: { key: string; label: string }[] = [
  { key: "trip", label: "Trip" },
  { key: "events", label: "Events" },
];
const LeftSidebar: React.FC<LeftSidebarProps> = ({
  leftData,
  passengers,
  isMobile = false,
  stops = [],
  isShuttleTrip = false,
}) => {
  const [activeTab, setActiveTab] = useState<"trip" | "events">("trip");
  // ------------------------
  const dispatch = useDispatch();
  const selectedEvents = useSelector(
    (state: any) => state.routeTrackingUi.selectedEvents,
  );
  const selectAll = selectedEvents.length - 1 === eventOptions.length;
  const handleSelectAll = () => dispatch(setAllEvents(!selectAll));

  const handleClick = (key: "trip" | "events") => {
    setActiveTab(key);
  };

  const isCompleted =
    leftData.tripTypeCode > TRIP_STATUS.STARTED &&
    leftData.transTripStatusCode != TRIP_STATUS.CANCELLED;
  return (
    <div
      style={{
        background: "#FFF",
        // borderRadius: 4,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: isMobile ? "none" : "1px solid #e5e7eb",
        borderRadius: isMobile ? 0 : 12,
        overflow: "hidden",
      }}
    >
      {!isMobile && leftData.isCompleted && (
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 2,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleClick(tab.key as "trip" | "events")}
              style={{
                flex: 1,
                padding: "6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #00A76F"
                    : "2px solid transparent",
                fontWeight: activeTab === tab.key ? 500 : 400,
                color: activeTab === tab.key ? "#00A76F" : "#637381",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flexShrink: 0,
          // height: isCompleted ? "70vh" : "75vh",
          flex: isMobile ? 1 : undefined,
          height: isMobile ? undefined : isCompleted ? "70vh" : "75vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingInline: 6,
        }}
      >
        {activeTab === "trip" && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                flexShrink: 0,
                paddingBlock: 12,
              }}
            >
              {passengers[0] && passengers[0].gender != "M" && (
                <AlertBanner message="First pickup women" />
              )}
              <TripSummaryCard trip={leftData} />
              {isShuttleTrip ? (
                <ShuttleTimeline stops={stops} />
              ) : (
                <TripTimeline data={leftData} passengers={passengers} />
              )}
            </div>
          </>
        )}
        {activeTab === "events" && (
          <div style={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span>Select All</span>
            </div>

            {eventOptions.map((event) => (
              <div
                key={event.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.key)}
                    onChange={() => dispatch(toggleEvent(event.key))}
                  />
                  <span>{event.label}</span>
                </div>

                <span>{event.icon}</span>
                {/* <PinIcon color={EVENT_COLORS[event.key] ?? "#94a3b8"} /> */}
              </div>
            ))}
          </div>
        )}
        {!isMobile && leftData.isCompleted && <ReplayButton />}
      </div>
    </div>
  );
};

export default LeftSidebar;
