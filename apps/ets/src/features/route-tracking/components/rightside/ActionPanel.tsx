import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  // toggleEvent,
  setTripClose,
  setNoShow,
  setStopReach,
  setBoardDeboardClose,
  setActualSignIn,
  setActualSignOut,
} from "../../slice/routeTrackingSlice";
import {
  CheckCircleOutlined,
  PoweroffOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";

// dispatch(toggleEvent(event.key)
interface ActionsPanelProps {
  shouldStart: boolean;
  isCompleted: boolean;
  isShuttleTrip: boolean;
  isPickup: string;
  showmeter: boolean;
  onDriverAction?: (action: "arrived" | "callEmp" | "noShow") => void;
  onTrackingSourceChange?: (source: "driverApp" | "fixedDevice") => void;
  onToggle?: (key: "signIn" | "signOut" | "speed", value: boolean) => void;
  selectedSource?: "driverApp" | "fixedDevice";
}

// const STOPS = ["1st Pick up", "2nd Pick up", "Office"];

export function ActionsPanel({
  shouldStart,
  isCompleted,
  // isPickup,
  isShuttleTrip = false,
  showmeter,
  // onDriverAction,
  // onTrackingSourceChange,
  onToggle,
  selectedSource = "driverApp",
}: ActionsPanelProps) {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  // const [trafficOpen, setTrafficOpen] = useState(false);
  const [toggles, setToggles] = useState({
    signIn: false,
    signOut: false,
    speed: showmeter,
  });
  const { actualSignIn, actualSignOut } = useSelector(
    (state: any) => state.routeTrackingUi,
  );
  // const selectedEvents = useSelector(
  //   (state: any) => state.routeTrackingUi.selectedEvents,
  // );
  const handleToggle = (key: "signIn" | "signOut" | "speed") => {
    const next = { ...toggles, [key]: !toggles[key] };
    if (key === "signIn") {
      if (actualSignIn == false) {
        dispatch(setActualSignIn(true));
      } else {
        dispatch(setActualSignIn(false));
      }
    }
    if (key === "signOut") {
      if (actualSignOut == false) {
        dispatch(setActualSignOut(true));
      } else {
        dispatch(setActualSignOut(false));
      }
    }
    setToggles(next);
    onToggle?.(key, next[key]);
  };
  const handleAction = (key: "noShow" | "boardDeboard" | "tripClose" | "stopReach") => {
    console.log(key, "key");
    if (key === "noShow") {
      dispatch(setNoShow(true));
    }
    if (key === "tripClose") {
      dispatch(setTripClose(true));
    }
    if (key === "boardDeboard") {
      dispatch(setBoardDeboardClose(true));
    }
    if (key === "stopReach") {
      dispatch(setStopReach(true));
    }
  };
  // const disable = isCompleted || isPickup == "Drop";
  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 4 : 10,
        right: isMobile ? 4 : 10,
        width: isMobile ? 120 : 200,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        zIndex: 20,
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 12, color: "#1e293b" }}>
          Actions
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div style={{ padding: isMobile ? 4 : "8px" }}>
          {/* Driver Action */}
          {!isMobile && (
            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
                // margin: "0 0 8px 4px",
                letterSpacing: "0.04em",
              }}
            >
              Driver Action
            </p>
          )}
          {/* vehicle*/}
          {shouldStart ? (
            <button
              onClick={() => handleAction("tripClose")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 3 : 8,
                padding: isMobile ? " 2px 3px" : "4px 6px",
                marginBottom: 3,
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 50,
                fontSize: isMobile ? 9 : 11,
                fontWeight: 500,
                transition: "border-color 0.15s, background 0.15s",
                color: isCompleted ? "#94a3b8" : "#1e293b",
                cursor: isCompleted ? "not-allowed" : "pointer",
                opacity: isCompleted ? 0.6 : 1,
              }}
              disabled={isCompleted}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span style={{ fontSize: isMobile ? 9 : 11 }}>
                <PoweroffOutlined />
              </span>
              Start Trip
            </button>
          ) : (
            <button
              onClick={() => handleAction("tripClose")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 3 : 8,
                padding: isMobile ? " 2px 3px" : "4px 6px",
                marginBottom: 3,
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 50,
                fontSize: isMobile ? 9 : 11,
                fontWeight: 500,
                transition: "border-color 0.15s, background 0.15s",
                color: isCompleted ? "#94a3b8" : "#1e293b",
                cursor: isCompleted ? "not-allowed" : "pointer",
                opacity: isCompleted ? 0.6 : 1,
              }}
              disabled={isCompleted}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span style={{ fontSize: isMobile ? 9 : 11 }}>
                <PoweroffOutlined />
              </span>
              Close Trip
            </button>
          )}
          {isShuttleTrip && (
            <button
              onClick={() => handleAction("stopReach")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 3 : 8,
                padding: isMobile ? " 2px 3px" : "4px 6px",
                marginBottom: 3,
                border: "1.5px solid #e2e8f0",
                borderRadius: 50,
                fontSize: isMobile ? 9 : 11,
                fontWeight: 500,
                transition: "border-color 0.15s, background 0.15s",
                color: isCompleted ? "#94a3b8" : "#1e293b",
                background: isCompleted ? "#f8fafc" : "#fff",
                cursor: isCompleted ? "not-allowed" : "pointer",
                opacity: isCompleted ? 0.6 : 1,
                whiteSpace: "pre",
              }}
              disabled={isCompleted}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span style={{ fontSize: isMobile ? 9 : 11 }}>
                <CheckCircleOutlined />
              </span>
              Stop Reach
            </button>
          )}

          <button
            onClick={() => handleAction("boardDeboard")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? 3 : 8,
              padding: isMobile ? " 2px 3px" : "4px 6px",
              marginBottom: 3,
              border: "1.5px solid #e2e8f0",
              borderRadius: 50,
              fontSize: isMobile ? 9 : 11,
              fontWeight: 500,
              transition: "border-color 0.15s, background 0.15s",
              color: isCompleted ? "#94a3b8" : "#1e293b",
              background: isCompleted ? "#f8fafc" : "#fff",
              cursor: isCompleted ? "not-allowed" : "pointer",
              opacity: isCompleted ? 0.6 : 1,
              whiteSpace: "pre",
            }}
            disabled={isCompleted}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.background = "#f0f5ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#fff";
            }}
          >
            <span style={{ fontSize: isMobile ? 9 : 11 }}>
              <CheckCircleOutlined />
            </span>
            Boarded - Deboarded
          </button>

          <button
            onClick={() => handleAction("noShow")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? 3 : 8,
              padding: isMobile ? " 2px 3px" : "4px 6px",
              marginBottom: 3,
              background: isCompleted ? "#f8fafc" : "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 50,
              fontSize: isMobile ? 9 : 11,
              fontWeight: 500,
              transition: "border-color 0.15s, background 0.15s",
              color: isCompleted ? "#94a3b8" : "#1e293b",
              cursor: isCompleted ? "not-allowed" : "pointer",
              opacity: isCompleted ? 0.6 : 1,
            }}
            disabled={isCompleted}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.background = "#f0f5ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#fff";
            }}
          >
            <span style={{ fontSize: 11 }}>
              <StopOutlined
                style={{
                  fontSize: isMobile ? 9 : 11,
                  color: "#ff4d4f",
                }}
              />
            </span>
            No Show
          </button>

          {/* Vehicle Tracking From */}
          {!isMobile && (
            <>
              <p
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontWeight: 500,
                  margin: "8px 0 4px 4px",
                  letterSpacing: "0.04em",
                }}
              >
                Vehicle Tracking From
              </p>
              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: 50,
                  padding: 3,
                  marginBottom: 12,
                }}
              >
                {(["driverApp", "fixedDevice"] as const).map((src) => (
                  <button
                    key={src}
                    disabled // not manually changeable
                    style={{
                      flex: 1,
                      padding: "4px 0",
                      border: "none",
                      borderRadius: 50,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "default", // no pointer — display only
                      opacity: 1, // override disabled fade
                      background:
                        selectedSource === src ? "#fff" : "transparent",
                      color: selectedSource === src ? "#2563eb" : "#64748b",
                      boxShadow:
                        selectedSource === src
                          ? "0 1px 4px rgba(0,0,0,0.10)"
                          : "none",
                      transition: "all 0.18s",
                    }}
                  >
                    {src === "driverApp" ? "Driver App" : "Fixed Device"}
                  </button>
                ))}
              </div>
            </>
          )}
          {/* Toggles */}
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span style={{ fontSize: isMobile ? 9 : 10, color: "#334155" }}>
                Sign In {!isMobile && <>Locations</>}
              </span>
              <Toggle
                checked={actualSignIn}
                onChange={() => dispatch(setActualSignIn(!actualSignIn))}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span style={{ fontSize: isMobile ? 9 : 10, color: "#334155" }}>
                Sign Out {!isMobile && <>Locations</>}
              </span>
              <Toggle
                checked={actualSignOut}
                onChange={() => dispatch(setActualSignOut(!actualSignOut))}
              />
            </div>
          </>
          {([{ key: "speed" as const, label: "Speed" }] as const).map(
            ({ key, label }) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ fontSize: isMobile ? 9 : 10, color: "#334155" }}>
                  {label}
                </span>
                <Toggle
                  checked={toggles[key]}
                  onChange={() => handleToggle(key)}
                />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ── Reusable Toggle ──────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-block",
        width: 28,
        height: 12,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: checked ? "#2563eb" : "#cbd5e1",
          borderRadius: 18,
          transition: "background 0.2s",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 16 : 2,
          width: 8,
          height: 8,
          background: "#fff",
          borderRadius: "50%",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </label>
  );
}
