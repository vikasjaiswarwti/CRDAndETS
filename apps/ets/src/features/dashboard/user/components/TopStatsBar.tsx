// TopStatsBar.tsx
import React from "react";
import { Users, Navigation, UserX, Bell, Car } from "lucide-react";
import { StatCard } from "./StatCard";
import type { UserInfo } from "../types/employeeProfile.types";

// export const TopStatsBar: React.FC<{ data: UserInfo }> = ({ data }) => (
//   <div
//     style={{
//       display: "grid",
//       gridTemplateColumns: "repeat(5, 1fr)",
//       gap: 12,
//     }}
//   >
//     <StatCard
//       icon={Users}
//       iconBg="#0ab3a0"
//       label="Total Users"
//       value={data.TeamCount}
//     />
//     <StatCard
//       icon={Navigation}
//       iconBg="#4a6cf7"
//       label="Total Trips"
//       value={data.TeamTrips}
//     />
//     <StatCard
//       icon={UserX}
//       iconBg="#ef4444"
//       label="No Show"
//       value={data.TeamNoshowCount}
//     />
//     <StatCard
//       icon={Bell}
//       iconBg="#f59e0b"
//       label="Team Adhoc"
//       value={data.TeamAdhoc}
//     />
//     <StatCard
//       icon={Car}
//       iconBg="#8b5cf6"
//       label="Total Complaint"
//       value={data.TeamComplaintCount}
//     />
//   </div>
// );
// TopStatsBar.tsx — pass accentColor explicitly (same value as iconBg)
export const TopStatsBar: React.FC<{ data: UserInfo }> = ({ data }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 12,
    }}
  >
    <StatCard
      icon={Users}
      iconBg="#0ab3a0"
      accentColor="#0ab3a0"
      label="Total Users"
      value={data.TeamCount}
    />
    <StatCard
      icon={Navigation}
      iconBg="#4a6cf7"
      accentColor="#4a6cf7"
      label="Total Trips"
      value={data.TeamTrips}
    />
    <StatCard
      icon={UserX}
      iconBg="#ef4444"
      accentColor="#ef4444"
      label="No Show"
      value={data.TeamNoshowCount}
    />
    <StatCard
      icon={Bell}
      iconBg="#f59e0b"
      accentColor="#f59e0b"
      label="Team Adhoc"
      value={data.TeamAdhoc}
    />
    <StatCard
      icon={Car}
      iconBg="#8b5cf6"
      accentColor="#8b5cf6"
      label="Total Complaint"
      value={data.TeamComplaintCount}
    />
  </div>
);
