// src/features/routeManagement/components/DashboardStatCard.tsx
import { memo, type ReactNode, type CSSProperties } from "react";
import { RM_COLOR, RM_FONT, RM_RADIUS, RM_SPACE } from "../Routeuiconfig";

interface DashboardStatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  iconBg: string; // hex color e.g. "#ECFDF5"
  iconColor: string; // hex color e.g. "#065F46"
  sub?: ReactNode;
  loading?: boolean;
}

const shimmerStyle: CSSProperties = {
  background: `linear-gradient(90deg, ${RM_COLOR.gray100} 25%, ${RM_COLOR.gray50} 50%, ${RM_COLOR.gray100} 75%)`,
  backgroundSize: "200% 100%",
  animation: "rm-shimmer 1.4s infinite",
  borderRadius: 4,
};

export const DashboardStatCard = memo(function DashboardStatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  sub,
  loading = false,
}: DashboardStatCardProps) {
  const cardStyle: CSSProperties = {
    background: RM_COLOR.white,
    border: RM_COLOR.border,
    borderRadius: RM_RADIUS.card,
    padding: RM_SPACE.statCardPad,
    display: "flex",
    alignItems: "center",
    gap: RM_SPACE.statCardGap,
    boxShadow: RM_COLOR.shadow,
    transition: "box-shadow 0.15s, border-color 0.15s",
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: RM_RADIUS.icon,
            flexShrink: 0,
            ...shimmerStyle,
          }}
        />
        <div
          style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}
        >
          <div style={{ height: 10, width: "70%", ...shimmerStyle }} />
          <div style={{ height: 18, width: "45%", ...shimmerStyle }} />
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: RM_RADIUS.icon,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontSize: RM_FONT.sm,
            color: RM_COLOR.gray900,
            fontWeight: 500,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "flex",
            fontSize: 16, //RM_FONT.stat,
            fontWeight: 500,
            color: RM_COLOR.gray900,
            lineHeight: 1.1,
            marginTop: 1,
          }}
        >
          {value} {sub && <div style={{ marginTop: 2 }}>{sub}</div>}
        </span>
      </div>
    </div>
  );
});
