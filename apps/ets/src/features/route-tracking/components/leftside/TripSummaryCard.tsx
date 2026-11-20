import React, { useState } from "react";
import { formatTime } from "../../utils/commonFunction";
import { CaretRightOutlined, MobileOutlined } from "@ant-design/icons";
import type { TripResponse } from "../../types/tracking.types";
import { TRIP_STATUS } from "../../constants/trackConstant";
import DeviceHealthModal from "../DeviceHealth";
import { Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { selectRoles } from "../../../navigation/slices/navigationSlice";
import Icon from "../../../route-optimization/components/Icon";
import GuardSvg from "../../../route-optimization/assets/icons/guard.svg";

interface TripSummaryCardProps {
  trip: TripResponse;
}

const TripSummaryCard: React.FC<TripSummaryCardProps> = ({ trip }) => {
  const [open, setOpen] = useState(false);
  const [deviceHealthOpen, setDeviceHealthOpen] = useState(false);
  const roles = useSelector(selectRoles);
  const isEmployee = roles.includes("employee");
  const plannedStartTime = formatTime(trip.scheduledStartTime) ?? "-";
  const plannedEndTime = formatTime(trip.scheduledEndTime) ?? "-";
  // const shiftTime = formatDateTime(trip.scheduledStartTime) ?? "-";

  // const getRatingColor = (rating: number) => {
  //   if (rating >= 4.5) return "#16a34a"; // Green
  //   if (rating >= 3.5) return "#f59e0b"; // Orange
  //   return "#ef4444"; // Red
  // };
  return (
    <div
      style={{
        background: "#ffffff",
        border: "0.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "6px",
        fontFamily: "inherit",
        fontSize: 11,
      }}
      className="flex flex-col gap-2"
    >
      {/* ── Row 1: Title + Status badge ─────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          // marginBottom: 6,
          width: "100%",
          cursor: "pointer",
        }}
      >
        <p className="flex items-center gap-2">
          <CaretRightOutlined
            style={{
              transform: open ? "rotate(90deg)" : "none",
              transition: "0.2s",
              fontSize: 14,
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", display:"flex" , alignItems:"center", gap:10 }}>
            Trip Details{" "}
            {trip.isGuard && (
              <Icon
                src={GuardSvg}
                size={16}
                style={
                  {
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize:14,
                    background: "#EFF6FF",
                    color: "#1E40AF",
                  } as React.CSSProperties
                }
              />
            )}
          </span>{" "}
        </p>
        <StatusBadge
          status={`${trip.transTripStatusName}`}
          statusCode={trip.transTripStatusCode}
        />
      </button>

      {open && (
        <>
          {/* ── Row 2: Shift / Planned / Actual ─────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
              gap: 4,
            }}
          >
            {/* Shift */}
            {trip.shiftTime && (
              <div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Shift Time</div>
                <div
                  style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}
                >
                  {trip.shiftTime}
                </div>
              </div>
            )}

            {/* Planned */}
            {trip.scheduledStartTime && (
              <>
                <VerticalDivider />
                <div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Planned Time
                  </div>
                  <div
                    style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}
                  >
                    {trip.scheduledStartTime && <>{plannedStartTime}</>}
                    {trip.scheduledEndTime && <>-{plannedEndTime}</>}
                  </div>
                </div>
              </>
            )}

            {/* Actual */}
            {trip.actualStartTime && (
              <>
                <VerticalDivider />
                <div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Actual Time
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {trip.actualStartTime && (
                        <>{formatTime(trip.actualStartTime)}</>
                      )}
                      {trip.actualEndTime && (
                        <>-{formatTime(trip.actualEndTime)}</>
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <HorizontalDivider />
          <div className="flex items-center justify-between gap-2">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f0faf4",
                borderRadius: 10,
                padding: "8px",
                // marginBottom: 12,
                width: "100%",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}
                >
                  Driver
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    // flexDirection: "column",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}
                  >
                    {trip.driverName}
                  </span>
                  {/* <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      background: getRatingColor(5),
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 8px",
                    }}
                  >
                    {5} ★
                  </span> */}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#0f172a",
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    <Phone size={12} /> {trip.driverMobileNo ?? "-"}
                  </span>
                </div>
              </div>
              {/* Device Health button */}
            </div>
            {!isEmployee &&
              trip.transTripStatusCode != TRIP_STATUS.CANCELLED && (
                <button
                  onClick={() => setDeviceHealthOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "0.5px solid #e2e8f0",
                    borderRadius: 99,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: "#0f172a",
                    cursor: "pointer",
                    background: "#ffffff",
                    whiteSpace: "nowrap",
                  }}
                >
                  <i
                    className="ti ti-device-mobile"
                    style={{ fontSize: 13, color: "#64748b" }}
                    aria-hidden="true"
                  />
                  <MobileOutlined />
                  Device Health
                </button>
              )}
          </div>

          {/* ── Row 3: Driver info ───────────────────────────────── */}
          <HorizontalDivider margin="0px 0" />

          {/* ── Row 4: Vehicle / Vendor ──────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.5px 1fr",
              gap: 0,
            }}
          >
            {/* Vehicle */}
            <div style={{ paddingRight: 16 }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Vehicle</div>
              <div
                style={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  // flexDirection:"column",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}
                >
                  {trip.vehicleNo}
                </span>

                {/* <span
                  style={{ fontSize: 11, color: "#475569", marginLeft: 2 }}
                  className="flex items-center gap-1"
                >
                  <Dot /> {trip.vehicleType}
                </span> */}

                <span
                  style={{ fontSize: 13, color: "#475569" }}
                  className="flex items-center gap-1"
                >
                  <Dot /> {trip.cabCapacity} seats
                </span>
              </div>
            </div>

            <VerticalDivider />

            {/* Vendor */}
            <div style={{ paddingLeft: 16 }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Vendor</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                {trip.vendorName}
              </div>
            </div>
          </div>
          {trip.isGuard && (
            <>
              <HorizontalDivider margin="0px 0" />
              <div style={{ paddingRight: 16 }}>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Marshal</div>
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}
                  >
                    {trip.guardName}
                  </span>

                  <span
                    style={{ fontSize: 13, color: "#475569" }}
                    className="flex items-center gap-1"
                  >
                    ({trip.guardMobileNo})
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {/* ── Device Health Modal ───────────────────────────────── */}
      <DeviceHealthModal
        open={deviceHealthOpen}
        onClose={() => setDeviceHealthOpen(false)}
        dsid={trip.dsId}
        isCompleted={trip.isCompleted}
      />
    </div>
  );
};

export default TripSummaryCard;

// ── Status badge styles ───────────────────────────────────────
const STATUS_STYLES: Record<
  number,
  { background: string; color: string; border: string }
> = {
  [TRIP_STATUS.CREATED]: {
    background: "#EFF6FF",
    color: "#1D4ED8",
    border: "0.5px solid #93C5FD",
  },

  [TRIP_STATUS.PRINTED]: {
    background: "#F5F3FF",
    color: "#7C3AED",
    border: "0.5px solid #C4B5FD",
  },

  [TRIP_STATUS.STARTED]: {
    background: "#FFF8E1",
    color: "#B45309",
    border: "0.5px solid #FCD34D",
  },

  [TRIP_STATUS.END]: {
    background: "#E8F5EE",
    color: "#1A7A45",
    border: "0.5px solid #A8DBBE",
  },

  [TRIP_STATUS.AUDITED]: {
    background: "#ECFDF5",
    color: "#047857",
    border: "0.5px solid #6EE7B7",
  },

  [TRIP_STATUS.BILLED]: {
    background: "#F0FDF4",
    color: "#15803D",
    border: "0.5px solid #86EFAC",
  },

  [TRIP_STATUS.CANCELLED]: {
    background: "#FEF2F2",
    color: "#B91C1C",
    border: "0.5px solid #FCA5A5",
  },
};

// ── Sub-components ────────────────────────────────────────────
/** Pill badge for trip status */
const StatusBadge: React.FC<{ status: string; statusCode: number }> = ({
  status,
  statusCode,
}) => {
  // console.log(status, "status");
  const s = STATUS_STYLES[statusCode] ?? "";
  return (
    <span
      style={{
        background: s.background,
        color: s.color,
        border: s.border,
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 14px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

/** Dot separator used in the vehicle row */
const Dot: React.FC = () => (
  <span
    style={{
      width: 4,
      height: 4,
      borderRadius: "50%",
      background: "#94a3b8",
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

/** Thin vertical divider line */
const VerticalDivider: React.FC = () => (
  <div
    style={{ width: "0.5px", background: "#e2e8f0", alignSelf: "stretch" }}
  />
);

/** Thin horizontal rule */
const HorizontalDivider: React.FC<{ margin?: string }> = ({
  margin = "0px 0",
}) => (
  <hr
    style={{
      border: "none",
      borderTop: "0.5px solid #e2e8f0",
      margin,
    }}
  />
);
