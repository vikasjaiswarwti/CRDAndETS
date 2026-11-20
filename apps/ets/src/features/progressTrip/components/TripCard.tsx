import React, { useState } from "react";
import type { TripTrackingPacket } from "../types/progressTrip.types";
import { getTripColor, formatTime } from "../utils/commonFunction";
import TripTypeBadge from "../../../shared/components/ui/LoginBadge";
import {
  ChevronDown,
  UsersRound,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getStatusStyle } from "../hooks/useTripsInProgressTable";
import { Tooltip } from "antd";
import { useGetPassengerDetailsQuery } from "../services/progressTripApi";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

interface TripCardProps {
  trip: TripTrackingPacket;
  isSelected: boolean;
  onToggle: () => void;
  onViewEmployees: () => void;
}
// ── Passenger from API response ──────────────────────────────────────────────
interface PassengerDetail {
  empId: number;
  employeeID: string;
  firstname: string;
  lastName: string;
  gender: string;
  mobileno: string;
  emailID: string;
  empLocCode: number;
  empOffice: string;
  tripType: number;
  paxOrder: number;
  address: string;
  plannedLat: number;
  plannedLng: number;
  noShow: boolean;
  noShowReasonId: number | null;
  scheduled: boolean;
  paxAdded: boolean;
  paxType: string;
  empDistance: number;
  empDirectDistance: number;
  plannedScheduleTime: string;
  empSigninTime: string | null;
  empSigninLat: number | null;
  empSigninLng: number | null;
  empSignOutTime: string | null;
  empSignOutLat: number | null;
  empSignOutLng: number | null;
  cabReachedTime: string | null;
  reachedHomeTime: string | null;
  etaDeviationMinutes: number;
  otp: number;
  paxTrackingStatus: string;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  isSelected,
  onToggle,
  onViewEmployees,
}) => {
  const isMobile = useIsMobile();
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const accentColor = getTripColor(trip.dsId);
  const { color, backgroundColor } = getStatusStyle(trip.statusCode);
  const {
    data: passengers = [],
    isFetching,
    refetch,
  } = useGetPassengerDetailsQuery(trip.dsId, {
    skip: !trip.dsId,
  });

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetch();
  };

  return (
    <div
      style={{
        ...styles.tripCard,
        ...(isMobile ? styles.tripCardMobile : {}),
        borderColor: accentColor,
        background: isSelected
          ? accentColor.replace("rgb", "rgba").replace(")", ", 0.1)")
          : "#fff",
      }}
      onClick={onToggle}
    >
      {/* Top row: checkbox, vehicle plate, shift badge */}
      <div
        style={{
          ...styles.cardTop,
          ...(isMobile ? styles.cardTopMobile : {}),
        }}
      >
        <p className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            style={{ ...styles.checkbox, accentColor }}
            onClick={(e) => e.stopPropagation()}
          />

          <span
            style={{
              ...styles.vehiclePlate,
              ...(isMobile ? { fontSize: 11 } : {}),
            }}
          >
            {trip.vehicleNo}
          </span>
          <span
            style={{
              color,
              backgroundColor,
              padding: "2px 10px",
              borderRadius: "8px",
              fontWeight: 500,
              display: "flex",
              fontSize: isMobile ? 10 : undefined,
            }}
            className="flex items-end"
          >
            {trip.statusName}
          </span>
        </p>
        <span
          style={{
            ...styles.shiftTime,
            ...(isMobile ? { fontSize: 11 } : {}),
          }}
        >
          <strong>{trip.shiftTime}</strong>{" "}
          <TripTypeBadge
            type={trip.tripType === 2 ? "Logout" : "Login"}
            size={isMobile ? 44 : 56}
          />
        </span>
      </div>
      <div
        style={{
          ...styles.timingRow,
          ...(isMobile ? { paddingLeft: 8, gap: 16 } : {}),
        }}
      >
        <span style={{display:"flex", gap:5}}>
          <span style={styles.timingLabel}>Driver - </span>
          <span style={styles.timingValue}>
            {trip.driverName}({trip.driverNumber})
          </span>
        </span>
      </div>

      {/* Timing row: scheduled vs actual */}
      <div
        style={{
          ...styles.timingRow,
          ...(isMobile ? { paddingLeft: 8, gap: 16 } : {}),
        }}
      >
        <span style={styles.timingBlock}>
          <span style={styles.timingLabel}>Scheduled Time</span>
          <span style={styles.timingValue}>
            {formatTime(trip.scheduledStartTime)} /{" "}
            {formatTime(trip.scheduledEndTime)}
          </span>
        </span>
        <span style={styles.timingDivider} />
        <span style={styles.timingBlock}>
          <span style={styles.timingLabel}>Actual Time</span>
          <span style={styles.timingValue}>
            {formatTime(trip.actualStartTime)} /{" "}
            {formatTime(trip.actualEndTime)}
          </span>
        </span>
      </div>
      <span
        style={{
          ...styles.horizontalDivider,
          paddingLeft: isMobile ? 8 : 20,
        }}
      />

      {/* Bottom row: trip link, pax, no-show badge */}
      <div
        style={{
          ...styles.cardBottom,
          paddingLeft: isMobile ? 8 : 20,
        }}
      >
        <Tooltip title={`Open tracking for Trip ${trip.dsId}`}>
          <a
            href={`/routing/route-tracking?dsId=${trip.dsId}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...styles.tripLink, textDecoration: "underline" }}
            className="flex justify-center items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} /> Trip - {trip.dsId}
          </a>
        </Tooltip>
        <p className="flex items-center justify-center gap-1">
          <Tooltip
            title={`${trip.boardedCount} boarded out of ${trip.totalPax} employees`}
          >
            <span
              style={{
                ...styles.paxInfo,
                cursor: "pointer",
                textDecoration: "underline",
                ...(isMobile ? styles.paxInfoMobile : {}),
              }}
              className="flex justify-center items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewEmployees();
              }}
            >
              <UsersRound size={12} /> {trip.totalPax}
            </span>
          </Tooltip>
          {trip.noShowCount > 0 && (
            <span style={styles.noShowBadge}>{trip.noShowCount} no-show</span>
          )}
        </p>
      </div>

      {/* Employee List */}
      <div
        style={{
          ...styles.employeeAccordion,
          marginLeft: isMobile ? 8 : 20,
        }}
      >
        <div
          style={styles.employeeAccordionHeader}
          onClick={(e) => {
            e.stopPropagation();
            setEmployeeOpen((prev) => !prev);
          }}
        >
          <p className="flex items-center gap-1">
            <span>Employees ({trip.totalPax})</span>
            {employeeOpen && (
              <Tooltip title="Refresh Employee list">
                <button
                  style={{
                    ...styles.refreshBtn,
                    ...(isFetching ? styles.refreshBtnSpinning : {}),
                  }}
                  onClick={handleRefresh}
                  aria-label="Refresh"
                >
                  <RefreshCw size={12} />
                </button>
              </Tooltip>
            )}
          </p>
          <span
            style={{
              transition: "transform 0.2s",
              transform: employeeOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={14} />
          </span>
        </div>
        {employeeOpen && (
          <div style={styles.accordionBody}>
            {isFetching ? (
              <div style={styles.loadingRow}>
                <RefreshCw
                  size={12}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span>Loading...</span>
              </div>
            ) : passengers.length === 0 ? (
              <div style={styles.emptyRow}>No passenger data available.</div>
            ) : (
              <>
                {(passengers as PassengerDetail[]).map((pax, idx) => {
                  const meta = getPaxStatusMeta(pax.paxTrackingStatus);
                  const fullName = `${pax.firstname} ${pax.lastName}`.trim();
                  return (
                    <div
                      key={pax.empId}
                      style={{
                        ...styles.passengerRow,
                        background: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <span style={styles.paxOrder}>{pax.paxOrder}</span>
                        <div style={{ minWidth: 0 }}>
                          <p style={styles.paxName}>{fullName}</p>
                        </div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 600,
                          color: meta.color,
                          background: meta.bg,
                          borderRadius: 10,
                          padding: "2px 7px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tripCard: {
    borderLeft: "3px solid",
    borderRadius: 4,
    padding: "12px",
    marginBottom: 4,
    cursor: "pointer",
    fontSize: 12,
    lineHeight: 1.3,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  tripCardMobile: {
    padding: "10px",
    gap: 6,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 2,
  },
  cardTopMobile: {
    flexWrap: "wrap",
    rowGap: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    marginRight: 2,
    cursor: "pointer",
  },
  vehiclePlate: {
    fontWeight: 600,
    fontSize: 12,
    color: "#1f2937",
    flex: 1,
  },
  shiftTime: {
    display: "flex",
    justifyContent: "center",
    gap: 5,
    alignItems: "center",
    fontSize: 12,
    color: "#374151",
    whiteSpace: "nowrap",
  },
  timingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "2px 0 4px 20px",
  },
  timingBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  timingLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "var(--text-muted, #4b5563)",
    letterSpacing: 0.3,
  },
  timingValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#374151",
  },
  timingDivider: {
    width: 1,
    height: 20,
    background: "var(--border, #e5e5e3)",
  },
  horizontalDivider: {
    width: "100%",
    height: 1,
    paddingLeft: 20,
    background: "var(--border, #e5e5e3)",
  },
  cardBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingLeft: 20,
    // paddingTop: 10,
    // borderTop: "1px solid #D1D5DB",
  },
  paxPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 11,
    color: "#374151",
    cursor: "pointer",
  },
  tripLink: {
    fontSize: 11,
    color: "#2563eb",
    textDecoration: "none",
    // padding: "4px",
    // border: "1px solid #4b5563",
    // borderRadius: "6px",
  },
  paxInfo: {
    fontSize: 11,
    color: "#4b5563",
    borderRadius: "6px",
  },
  paxInfoMobile: {
    fontSize: 9,
  },
  noShowBadge: {
    fontSize: 10,
    color: "#dc2626",
    background: "#fee2e2",
    borderRadius: 10,
    padding: "1px 6px",
    fontWeight: 500,
  },
  employeeAccordion: {
    marginTop: 6,
    marginLeft: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#f9fafb",
    overflow: "hidden",
  },

  employeeAccordionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    background: "#f9fafb",
    overflow: "hidden",
  },

  employeeAccordionBody: {
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
  },

  employeeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 6px",
    borderTop: "1px solid #f1f5f9",
  },

  employeeName: {
    fontSize: 11,
    color: "#374151",
  },

  employeeStatus: {
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 12,
    fontWeight: 600,
  },

  // Accordion
  accordionWrap: {
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    background: "#F9FAFB",
  },
  accordionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    cursor: "pointer",
    userSelect: "none",
    background: "#F3F4F6",
    borderBottom: "1px solid transparent",
  },
  accordionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    flex: 1,
  },
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    // justifyContent: "center",
    background: "transparent",
    // border: "1px solid #D1D5DB",
    borderRadius: 5,
    padding: "3px 5px",
    cursor: "pointer",
    color: "#6B7280",
    outline: "none",
    transition: "background 0.15s",
  },
  refreshBtnSpinning: {
    animation: "spin 1s linear infinite",
    opacity: 0.6,
  },
  accordionBody: {
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 12px",
    fontSize: 11,
    color: "#6B7280",
  },
  emptyRow: {
    padding: "10px 12px",
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  // passengerHeader: {
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   padding: "5px 10px",
  //   background: "#F3F4F6",
  //   fontSize: 10,
  //   fontWeight: 700,
  //   color: "#6B7280",
  //   letterSpacing: 0.4,
  //   textTransform: "uppercase",
  //   borderBottom: "1px solid #E5E7EB",
  // },
  passengerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    borderBottom: "1px solid #F3F4F6",
    gap: 8,
  },
  paxOrder: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    fontWeight: 700,
    color: "#374151",
    flexShrink: 0,
  },
  paxName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#111827",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  // paxAddress: {
  //   fontSize: 9,
  //   color: "#9CA3AF",
  //   margin: 0,
  //   overflow: "hidden",
  //   textOverflow: "ellipsis",
  //   whiteSpace: "nowrap",
  //   maxWidth: 160,
  // },
};

export default TripCard;
// ── Status badge helper ───────────────────────────────────────────────────────
const getPaxStatusMeta = (
  status: string,
): { label: string; color: string; bg: string; icon: React.ReactNode } => {
  const s = (status ?? "").toLowerCase().replace(/[-_\s]/g, "");
  if (s === "boarded" || s === "signedin")
    return {
      label: "Boarded",
      color: "#166534",
      bg: "#dcfce7",
      icon: <CheckCircle2 size={10} />,
    };
  if (s === "notboarded")
    return {
      label: "Not Boarded",
      color: "#92400e",
      bg: "#fef3c7",
      icon: <MinusCircle size={10} />,
    };
  if (s === "noshow")
    return {
      label: "No Show",
      color: "#b91c1c",
      bg: "#fee2e2",
      icon: <XCircle size={10} />,
    };
  if (s === "signedout" || s === "dropped")
    return {
      label: "Signed Out",
      color: "#1d4ed8",
      bg: "#dbeafe",
      icon: <CheckCircle2 size={10} />,
    };
  if (s === "waiting" || s === "pending")
    return {
      label: "Waiting",
      color: "#d97706",
      bg: "#fef3c7",
      icon: <Clock size={10} />,
    };
  return {
    label: status ?? "—",
    color: "#4b5563",
    bg: "#f3f4f6",
    icon: <AlertCircle size={10} />,
  };
};
