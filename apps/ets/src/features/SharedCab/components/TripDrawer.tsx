import React, { useState } from "react";
import { Check, Hash, MapPin, Navigation, Phone, User } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import { decodePolyline } from "../../route-tracking/hooks/useRouteTrackingMap";
import type {
  SharedCabPassenger,
  SharedCabResponse,
} from "../types/sharedCab.types"; 

dayjs.extend(customParseFormat);

interface TripDrawerProps {
  trip: SharedCabResponse;
  // Live socket data merged onto trip.passengers; falls back to trip.passengers when absent
  passengers?: SharedCabPassenger[];
}

const BAR_HEIGHT = 28;
const EXPANDED_HEIGHT_VH = 40;
const DROP_TRIP_TYPE = 2;

const COLORS = {
  text: "#0B1220",
  muted: "#6B7280",
  border: "#EEF0F3",
  green: "#16A34A",
  red: "#E5484D",
  sheet: "#F5F6F8",
};

// Accepts full date-times as well as bare "HH:mm" / "HH:mm:ss" values
const parseTime = (value: string | null | undefined) => {
  if (!value) return null;
  const full = dayjs(value);
  if (full.isValid()) return full;
  const bare = dayjs(value, ["HH:mm:ss", "HH:mm"], true);
  return bare.isValid() ? bare : null;
};

const getInitials = (name: string | null | undefined) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const getPassengerName = (passenger: SharedCabPassenger) =>
  `${passenger.firstname ?? ""} ${passenger.lastName ?? ""}`.trim();

const TripDrawer: React.FC<TripDrawerProps> = ({ trip, passengers }) => {
  const [expanded, setExpanded] = useState(true);

  const tripPassengers = passengers ?? trip.passengers;
  const isDrop = trip.tripType === DROP_TRIP_TYPE;
  const firstPassenger = tripPassengers?.[0];
  const employeeAddress = firstPassenger?.address || "-";
  const officeName =
    trip.officeDisplayName ||
    trip.officeLocName ||
    trip.officeAddress ||
    "Office";

  // Drop: office → employee, Pickup: employee → office
  const pickupLabel = isDrop ? officeName : employeeAddress;
  const dropLabel = isDrop ? employeeAddress : officeName;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: COLORS.sheet,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
        transition: "max-height 0.25s ease",
        maxHeight: expanded ? `${EXPANDED_HEIGHT_VH}vh` : BAR_HEIGHT,
        overflowY: expanded ? "auto" : "hidden",
        zIndex: 10,
      }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          height: BAR_HEIGHT,
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "#D1D5DB",
          }}
        />
      </div>

      {expanded && (
        <div
          style={{
            padding: "0 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Employees */}
          {tripPassengers?.length ? (
            tripPassengers.map((passenger) => (
              <EmployeeCard key={passenger.empId} passenger={passenger} />
            ))
          ) : (
            <Card>
              <div
                style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}
              >
                {trip.employeeName || "-"}
              </div>
            </Card>
          )}
          {/* ETA + driver */}
          <Card>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 14,
              }}
            >
              Driver Details
            </div>
            <PersonRow
              name={trip.driverName}
              subtitle={[trip.vehicleRegNo, trip.vehicleTypeDesc]
                .filter(Boolean)
                .join("  •  ")}
              phone={trip.driverMobile}
              label="driver"
            />
            {trip.isGuard && (
              <>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginTop: 10,
                  }}
                >
                  Guard Details
                </div>
                <div style={{ marginTop: 14 }}>
                  <PersonRow
                    name={trip.guardName}
                    subtitle=""
                    phone={trip.guardMobile}
                    label="guard"
                  />
                </div>
              </>
            )}
          </Card>

          {/* Trip details */}
          <Card>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 14,
              }}
            >
              Trip Details
            </div>
            <div className="grid grid-cols-3 gap-10 max-md:grid-cols-1 max-md:gap-2">
              <DetailItem
                icon={<MapPin size={14} />}
                label="Pickup"
                value={pickupLabel}
              />
              <DetailItem
                icon={<Navigation size={14} />}
                label="Drop"
                value={dropLabel}
              />
              <DetailItem
                icon={<Hash size={14} />}
                label="Trip ID"
                value={`#${trip.dsId}`}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: "#FFFFFF",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 2px 10px rgba(16,24,40,0.06)",
    }}
  >
    {children}
  </div>
);

const PersonRow: React.FC<{
  name: string | null | undefined;
  subtitle: string;
  phone: string | null | undefined;
  label: string;
}> = ({ name, subtitle, phone, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#E5E7EB",
        color: COLORS.muted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
        {name || "-"}
      </div>
      <div
        style={{
          fontSize: 13,
          color: COLORS.muted,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {subtitle}
      </div>
    </div>
    {phone && (
      <a
        href={`tel:${phone}`}
        aria-label={`Call ${label} ${name || phone}`}
        title={`Call ${name || label}`}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#2F9E6A",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Phone size={16} fill="currentColor" />
      </a>
    )}
  </div>
);

const getStatusStyle = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes("board"))
    return { background: "#EAF1FF", color: "#2563EB" };
  if (
    value.includes("reach") ||
    value.includes("complete") ||
    value.includes("drop")
  )
    return { background: "#E8F7EF", color: "#15803D" };
  if (
    value.includes("no show") ||
    value.includes("noshow") ||
    value.includes("cancel")
  )
    return { background: "#FDECEC", color: "#DC2626" };
  return { background: "#F3F4F6", color: "#4B5563" };
};

const EmployeeCard: React.FC<{ passenger: SharedCabPassenger }> = ({
  passenger,
}) => {
  const status = passenger.noShow ? "No Show" : passenger.paxTrackingStatus;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#E8F7EF",
            color: COLORS.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
            {getPassengerName(passenger) || "-"}
          </div>
          {/* <div style={{ fontSize: 12, color: COLORS.muted }}>
            Emp ID: {passenger.employeeID || passenger.empId}
          </div> */}
        </div>
        {status && (
          <span
            style={{
              ...getStatusStyle(status),
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              alignSelf: "flex-start",
            }}
          >
            {status}
          </span>
        )}
      </div>

      <TripSteps
        steps={[
          { label: "Planned Pickup", value: passenger.plannedScheduleTime },
          { label: "Cab Reached", value: passenger.cabReachedTime },
          { label: "Actual Pickup", value: passenger.empSigninTime },
          { label: "Actual Drop", value: passenger.empSignOutTime },
        ]}
      />

      {passenger.address && (
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "flex-start",
            background: "#F7F8FA",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "8px 10px",
            fontSize: 12,
            color: COLORS.text,
          }}
        >
          <MapPin
            size={16}
            color={COLORS.muted}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <span>{passenger.address}</span>
        </div>
      )}
    </Card>
  );
};

// Vertical timeline; a step is done once its time is recorded
const TripSteps: React.FC<{
  steps: { label: string; value: string | null | undefined }[];
}> = ({ steps }) => (
  <div
    style={{ display: "flex", flexDirection: "column", margin: "16px 0 14px" }}
  >
    {steps.map((step, index) => {
      const parsed = parseTime(step.value);
      const done = !!parsed;
      const isLast = index === steps.length - 1;
      const nextDone = !isLast && !!parseTime(steps[index + 1].value);
      const hasDate = !!step.value && dayjs(step.value).isValid();
      return (
        <div key={step.label} style={{ display: "flex", gap: 12 }}>
          {/* Dot + connector to the next step */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: done ? COLORS.green : "#FFFFFF",
                border: `2px solid ${done ? COLORS.green : "#D1D5DB"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {done && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
            </div>
            {!isLast && (
              <div
                style={{
                  width: 2,
                  flex: 1,
                  minHeight: 18,
                  background: nextDone ? COLORS.green : COLORS.border,
                }}
              />
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              paddingBottom: isLast ? 0 : 14,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: done ? COLORS.text : COLORS.muted,
              }}
            >
              {step.label}
            </span>
            <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}
              >
                {parsed?.format("HH:mm") ?? "--:--"}
              </span>
              {parsed && hasDate && (
                <span
                  style={{ fontSize: 11, color: COLORS.muted, marginLeft: 6 }}
                >
                  {parsed.format("DD MMM YYYY")}
                </span>
              )}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div
    style={{ display: "flex", gap: 8, alignItems: "flex-start", minWidth: 0 }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#F3F4F6",
        color: COLORS.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: COLORS.muted }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.text,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default TripDrawer;
