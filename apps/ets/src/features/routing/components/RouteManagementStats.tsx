import { memo, useState } from "react";
import {
  Users,
  UserPlus,
  Route,
  ClipboardList,
  BarChart2,
  Shield,
  ChevronDown,
} from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import type { RouteStats } from "../types/RouteTypes";
import { RM_SPACE } from "../Routeuiconfig";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

interface RouteManagementStatsProps {
  stats: RouteStats;
  loading?: boolean;
}

const GenderSub = ({ male, female }: { male: number; female: number }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
      marginLeft: 6,
    }}
  >
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 600,
        color: "#2563EB",
        background: "#EFF6FF",
        borderRadius: 4,
        padding: "1px 6px",
      }}
    >
      M {male}
    </span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 600,
        color: "#DB2777",
        background: "#FDF2F8",
        borderRadius: 4,
        padding: "1px 6px",
      }}
    >
      F {female}
    </span>
  </div>
);

export const RouteManagementStats = memo(function RouteManagementStats({
  stats,
  loading = false,
}: RouteManagementStatsProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  const cards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      iconBg: "#ECFDF5",
      iconColor: "#065F46",
      icon: <Users size={18} strokeWidth={1.8} />,
      sub: (
        <GenderSub male={stats.maleEmployees} female={stats.femaleEmployees} />
      ),
    },
    {
      label: "Adhoc Employees",
      value: String(stats.adhocEmployees).padStart(2, "0"),
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
      icon: <UserPlus size={18} strokeWidth={1.8} />,
    },
    {
      label: "Routes Generated",
      value: stats.routesGenerated,
      iconBg: "#F0FDFA",
      iconColor: "#0D9488",
      icon: <Route size={18} strokeWidth={1.8} />,
    },
    {
      label: "Employees in Tripsheets",
      value: stats.employeesInTripSheets,
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
      icon: <ClipboardList size={18} strokeWidth={1.8} />,
    },
    {
      label: "Avg Occupancy",
      value: `${stats.avgOccupancy}%`,
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
      icon: <BarChart2 size={18} strokeWidth={1.8} />,
    },
    {
      label: "Guard Trips",
      value: stats.guardTrips,
      iconBg: "#EEF2FF",
      iconColor: "#4338CA",
      icon: <Shield size={18} strokeWidth={1.8} />,
    },
  ];

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #F3F4F6",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Collapse toggle row */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            borderBottom: collapsed ? "none" : "1px solid #F3F4F6",
          }}
        >
          {/* Summary line — always visible */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={14} color="#065F46" strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
              {loading ? "—" : stats.totalEmployees} emp
            </span>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>·</span>
            <Route size={13} color="#0D9488" strokeWidth={2} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0D9488" }}>
              {loading ? "—" : stats.routesGenerated} routes
            </span>
            {stats.adhocEmployees > 0 && (
              <>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>·</span>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#D97706" }}
                >
                  {stats.adhocEmployees} adhoc
                </span>
              </>
            )}
          </div>

          <ChevronDown
            size={16}
            color="#94A3B8"
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          />
        </button>

        {/* Horizontally scrollable cards — hidden when collapsed */}
        {!collapsed && (
          <div
            style={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              scrollbarWidth: "none",
              background: "#F3F4F6",
            }}
          >
            {cards.map((c) => (
              <div
                key={c.label}
                style={{
                  flexShrink: 0,
                  width: 110,
                  background: "#fff",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: c.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.iconColor,
                  }}
                >
                  {c.icon}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0F172A",
                    lineHeight: 1,
                  }}
                >
                  {loading ? "—" : c.value}
                </div>
                <div
                  style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.3 }}
                >
                  {c.label}
                </div>
                {c.sub}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: RM_SPACE.statsGap,
      }}
    >
      {cards.map((c) => (
        <DashboardStatCard
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          iconBg={c.iconBg}
          iconColor={c.iconColor}
          sub={c.sub}
          loading={loading}
        />
      ))}
    </div>
  );
});
