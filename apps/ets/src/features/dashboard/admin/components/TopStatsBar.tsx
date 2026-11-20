import React from "react";
import { Users, Navigation, UserX, Bell, Car } from "lucide-react";
import { StatCard } from "./StatCard";
import type { DashboardSummary } from "../types/admin.types";
// KPI : {"TotalUsers":275,"TotalTrip":1,"NoShow":0,"AdhocActivities":2,"ActiveDriver":8}
export const TopStatsBar: React.FC<{ data: DashboardSummary }> = ({ data }) => (
  <div className="top-stats-bar">
    <StatCard
      icon={Users}
      iconBg="#0ab3a0"
      label="Total Users"
      value={data.TotalUsers}
      // badge={{ text: "+5.2%", positive: true }}
    />
    <StatCard
      icon={Navigation}
      iconBg="#4a6cf7"
      label="Total Trips"
      value={data.TotalTrip}
      // badge={{ text: "+3.1%", positive: true }}
    />
    <StatCard
      icon={UserX}
      iconBg="#ef4444"
      label="No Show"
      value={data.NoShow}
      // badge={{ text: "-2.3%", positive: false }}
    />
    <StatCard
      icon={Bell}
      iconBg="#f59e0b"
      label="Adhoc Active"
      value={data.AdhocActivities}
      // badge={{ text: "+4.5%", positive: true }}
    />
    <StatCard
      icon={Car}
      iconBg="#8b5cf6"
      label="Active Driver"
      value={data.ActiveDriver}
      // badge={{ text: "+5.5%", positive: true }}
    />
  </div>
);
