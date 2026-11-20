// ============================================================
// components/DriverInfoCard.tsx
// Matches the Trip Details + Driver Info card UI exactly.
// All font sizes are 11px per spec.
// ============================================================

import React from "react";

// ── Types ─────────────────────────────────────────────────────

export interface Driver {
  name: string;
  rating: number;
  avatar?: string | null;
  phone?: string;
}

export interface Vehicle {
  number: string;
  type: string;
  seats: string;
}

export interface Vendor {
  name: string;
}

export type TripStatus = "Completed" | "Ongoing" | "Delayed";

export interface DriverInfoCardProps {
  /** Trip shift label, e.g. "Mon 18 May 2024, 09:00" */
  shift: string;
  /** Planned time range, e.g. "08:49 – 09:00" */
  plannedTime: string;
  /** Actual time range, e.g. "08:48 – 09:18" */
  actualTime: string;
  /** Delay string shown in red, e.g. "+18 min" */
  delay: string;
  /** Overall trip status */
  status: TripStatus;
  driver: Driver;
  vehicle: Vehicle;
  vendor: Vendor;
  /** Called when "Device Health" button is clicked */
  onDeviceHealth?: () => void;
  /** Called when the phone icon button is clicked */
  onCallDriver?: () => void;
  /** Called when the message icon button is clicked */
  onMessageDriver?: () => void;
}

// ── Status badge styles ───────────────────────────────────────

const STATUS_STYLES: Record<
  TripStatus,
  { background: string; color: string; border: string }
> = {
  Completed: {
    background: "#e8f5ee",
    color: "#1a7a45",
    border: "0.5px solid #a8dbbe",
  },
  Ongoing: {
    background: "#fff8e1",
    color: "#b45309",
    border: "0.5px solid #fcd34d",
  },
  Delayed: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "0.5px solid #fca5a5",
  },
};

// ── Sub-components ────────────────────────────────────────────

/** Pill badge for trip status */
const StatusBadge: React.FC<{ status: TripStatus }> = ({ status }) => {
  const s = STATUS_STYLES[status];
  return (
    <span
      style={{
        background: s.background,
        color: s.color,
        border: s.border,
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 14px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

/** Circular icon button */
const IconButton: React.FC<{
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
}> = ({ icon, ariaLabel, onClick }) => (
  <button
    aria-label={ariaLabel}
    onClick={onClick}
    style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "0.5px solid #a8dbbe",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#1a7a45",
      flexShrink: 0,
    }}
  >
    <i className={`ti ${icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
  </button>
);

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
  margin = "14px 0",
}) => (
  <hr
    style={{
      border: "none",
      borderTop: "0.5px solid #e2e8f0",
      margin,
    }}
  />
);

// ── Main component ────────────────────────────────────────────

const DriverInfoCard: React.FC<DriverInfoCardProps> = ({
  shift,
  plannedTime,
  actualTime,
  delay,
  status,
  driver,
  vehicle,
  vendor,
  onDeviceHealth,
  onCallDriver,
  onMessageDriver,
}) => {
  /** Derive initials from driver name as fallback avatar */
  // const initials = driver.name
  //   .split(" ")
  //   .map((word) => word[0])
  //   .join("")
  //   .toUpperCase();

  return (
    <div
      style={{
        background: "#ffffff",
        border: "0.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "18px 20px",
        fontFamily: "inherit",
        fontSize: 11,
      }}
    >
      {/* ── Row 1: Title + Status badge ─────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: "#0f172a" }}>
          Trip Details
        </span>
        <StatusBadge status={status} />
      </div>

      {/* ── Row 2: Shift / Planned / Actual ─────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 0.5px 1fr 0.5px 1fr",
          gap: 0,
          marginBottom: 14,
        }}
      >
        {/* Shift */}
        <div style={{ paddingRight: 16 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Shift
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>
            {shift}
          </div>
        </div>

        <VerticalDivider />

        {/* Planned */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Planned
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>
            {plannedTime}
          </div>
        </div>

        <VerticalDivider />

        {/* Actual */}
        <div style={{ paddingLeft: 16 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Actual
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>
              {actualTime}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#dc2626" }}>
              {delay}
            </span>
          </div>
        </div>
      </div>

      <HorizontalDivider />

      {/* ── Row 3: Driver info ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f0faf4",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 12,
        }}
      >
        {/* Avatar */}
        {/* {driver.avatar ? (
          <img
            src={driver.avatar}
            alt={driver.name}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#e0e7ff",
              border: "0.5px solid #c7d2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 500,
              color: "#4338ca",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )} */}

        {/* Name & rating */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
            Driver
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
              {driver.name}
            </span>
            <span style={{ fontSize: 13, color: "#f59e0b" }}>★</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#f59e0b" }}>
              {driver.rating}
            </span>
          </div>
        </div>

        {/* Phone button */}
        <IconButton
          icon="ti-phone"
          ariaLabel="Call driver"
          onClick={onCallDriver}
        />

        {/* Message button */}
        <IconButton
          icon="ti-message-circle"
          ariaLabel="Message driver"
          onClick={onMessageDriver}
        />

        {/* Device Health button */}
        <button
          onClick={onDeviceHealth}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "0.5px solid #e2e8f0",
            borderRadius: 99,
            padding: "6px 14px",
            fontSize: 11,
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
          Device Health
        </button>
      </div>

      <HorizontalDivider margin="10px 0" />

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
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Vehicle
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>
              {vehicle.number}
            </span>
            <Dot />
            <span style={{ fontSize: 11, color: "#475569" }}>
              {vehicle.type}
            </span>
            <Dot />
            <span style={{ fontSize: 11, color: "#475569" }}>
              {vehicle.seats}
            </span>
          </div>
        </div>

        <VerticalDivider />

        {/* Vendor */}
        <div style={{ paddingLeft: 16 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Vendor
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>
            {vendor.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverInfoCard;

// ── Usage example ─────────────────────────────────────────────
//
// <DriverInfoCard
//   shift="Mon 18 May 2024, 09:00"
//   plannedTime="08:49 – 09:00"
//   actualTime="08:48 – 09:18"
//   delay="+18 min"
//   status="Completed"
//   driver={{ name: "Abbas Ali", rating: 4.8, avatar: null }}
//   vehicle={{ number: "MH43BX6755", type: "CNG", seats: "4 Seater" }}
//   vendor={{ name: "WTi Cabs" }}
//   onCallDriver={() => console.log("Call driver")}
//   onMessageDriver={() => console.log("Message driver")}
//   onDeviceHealth={() => console.log("Device health")}
// />

// const DriverInfoCard=({ driver, vehicle, vendor }) =>{
//   return (
//     <div style={{ marginTop: 12 }}>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 10,
//           padding: "8px 0",
//           borderTop: "1px solid #f1f5f9",
//           borderBottom: "1px solid #f1f5f9",
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
//             Driver
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: "50%",
//                 background: "#e0e7ff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 12,
//                 fontWeight: 700,
//                 color: "#4338ca",
//               }}
//             >
//               {driver.name
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")}
//             </div>
//             <div>
//               <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
//                 {driver.name}
//               </div>
//               <div style={{ fontSize: 11, color: "#f59e0b" }}>
//                 {"★".repeat(Math.floor(driver.rating))} {driver.rating}
//               </div>
//             </div>
//             <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
//               <button
//                 style={{
//                   background: "#f0fdf4",
//                   border: "1px solid #bbf7d0",
//                   borderRadius: 6,
//                   padding: "3px 8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 <i
//                   className="ti ti-phone"
//                   style={{ fontSize: 13, color: "#15803d" }}
//                   aria-hidden="true"
//                 />
//               </button>
//               <button
//                 style={{
//                   background: "#eff6ff",
//                   border: "1px solid #bfdbfe",
//                   borderRadius: 6,
//                   padding: "3px 8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 <i
//                   className="ti ti-message"
//                   style={{ fontSize: 13, color: "#2563eb" }}
//                   aria-hidden="true"
//                 />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginTop: 8,
//         }}
//       >
//         <button
//           style={{
//             background: "#f8fafc",
//             border: "1px solid #e2e8f0",
//             borderRadius: 6,
//             padding: "4px 10px",
//             fontSize: 11,
//             cursor: "pointer",
//             color: "#475569",
//             display: "flex",
//             alignItems: "center",
//             gap: 5,
//           }}
//         >
//           <i
//             className="ti ti-device-tablet"
//             style={{ fontSize: 13 }}
//             aria-hidden="true"
//           />
//           Device Health
//         </button>
//       </div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//           gap: 6,
//           marginTop: 10,
//         }}
//       >
//         <div style={{ fontSize: 11 }}>
//           <div style={{ color: "#94a3b8" }}>Vehicle</div>
//           <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
//             {vehicle.number}
//           </div>
//           <div style={{ color: "#64748b" }}>
//             {vehicle.type} · {vehicle.seats}
//           </div>
//         </div>
//         <div style={{ fontSize: 11 }}>
//           <div style={{ color: "#94a3b8" }}>Vendor</div>
//           <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
//             {vendor.name}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default DriverInfoCard
