import React from "react";

interface TripStatsData {
  totalEmployees?: number;
  totalTrips?: number;
  assignedTrips?: number;
  pendingTrips?: number;
  guardTrips?: number;
  specialNeedsCount?: number;
  totalDistanceKm?: number;
  totalExtraKm?: number;
  totalVendorsAllocated?: number;
}

interface StatCardProps {
  value: string | number;
  label: string;
  subLabel?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  size?: "large" | "small";
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
//   subLabel,
  iconBg,
  iconColor,
  icon,
  size = "large",
}) => {
  const isLarge = size === "large";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: isLarge ? "10px 12px" : "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: isLarge ? 14 : 12,
        flex: 1,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: isLarge ? 36 : 28,
          height: isLarge ? 36 : 28,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: iconColor,
          fontSize: isLarge ? 18 : 14,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: isLarge ? 16 : 14,
            fontWeight: 600,
            color: "#1a1a2e",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#374151",
            marginTop: 2,
          }}
        >
          {label}
        </div>
        {/* {subLabel && (
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
            {subLabel}
          </div>
        )} */}
      </div>
    </div>
  );
};

// SVG Icons
const UsersIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// const CheckCircleIcon = () => (
//   <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
//     <polyline points="22 4 12 14.01 9 11.01"/>
//   </svg>
// );

// const ClockIcon = () => (
//   <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
//     <line x1="12" y1="8" x2="12" y2="12"/>
//     <line x1="12" y1="12" x2="15" y2="15"/>
//   </svg>
// );

const MapPinIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const RoadIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l3-10 3 4 3-8 3 4 3-10"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="M9 3v18"/>
    <path d="M3 9h6"/>
    <path d="M3 15h6"/>
    <path d="M15 3v18"/>
    <path d="M15 9h6"/>
    <path d="M15 15h6"/>
  </svg>
);

interface TripStatsDashboardProps {
  data?: TripStatsData;
}

const TripStatsDashboard: React.FC<TripStatsDashboardProps> = ({ data }) => {
  const totalTrips = data?.totalTrips ?? 0;
//   const assignedTrips = data?.assignedTrips ?? 12;
//   const pendingTrips = data?.pendingTrips ?? totalTrips - assignedTrips;
  const totalDistance = (data?.totalDistanceKm ?? 0).toFixed(2);
  const extraKm = (data?.totalExtraKm ?? 0).toFixed(2);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", paddingInline: 24, marginBottom: 5 }}>
      {/* Top row - 4 primary stats */}
      <div style={{ display: "flex", gap: 10 }}>
        <StatCard
          value={totalTrips}
          label="Total Trips"
          subLabel="All trips in selected period"
          iconBg="#e8f5e9"
          iconColor="#388e3c"
          icon={<UsersIcon />}
          size="small"
        />
        <StatCard
          value={`${totalDistance} km`}
          label="Total Distance"
          subLabel="All trips distance"
          iconBg="#ede7f6"
          iconColor="#6a1b9a"
          icon={<MapPinIcon />}
          size="small"
        />
        <StatCard
          value={data?.totalEmployees ?? 0}
          label="Total Employees"
          iconBg="#e3f2fd"
          iconColor="#1565c0"
          icon={<UsersIcon />}
          size="small"
        />
        <StatCard
          value={data?.guardTrips ?? 0}
          label="Guard Trips"
          iconBg="#e3f2fd"
          iconColor="#1565c0"
          icon={<ShieldIcon />}
          size="small"
        />
        <StatCard
          value={data?.specialNeedsCount ?? 0}
          label="Special Needs"
          iconBg="#fce4ec"
          iconColor="#c2185b"
          icon={<HeartIcon />}
          size="small"
        />
        <StatCard
          value={`${extraKm} km`}
          label="Extra KM"
          iconBg="#e8f5e9"
          iconColor="#388e3c"
          icon={<RoadIcon />}
          size="small"
        />
        <StatCard
          value={data?.totalVendorsAllocated ?? 0}
          label="Vendors"
          iconBg="#e3f2fd"
          iconColor="#1565c0"
          icon={<BuildingIcon />}
          size="small"
        />
      </div>
    </div>
  );
};

export default TripStatsDashboard;

// Usage example:
// <TripStatsDashboard data={data} />