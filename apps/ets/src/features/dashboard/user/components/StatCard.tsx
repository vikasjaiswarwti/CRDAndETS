// StatCard.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  accentColor: string;
  label: string;
  value: string | number;
  subLabel?: string;
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    position: "relative" as const,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  } as React.CSSProperties,

  accentBar: (color: string): React.CSSProperties => ({
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 3,
    background: color,
  }),

  iconWrap: {
    width: 44,
    height: 44,
    minWidth: 44,       // ← belt-and-suspenders, prevents flex shrink
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as React.CSSProperties,

  body: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    color: "#6b7280",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  } as React.CSSProperties,

  value: {
    fontSize: 24,
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.1,
    letterSpacing: "-0.5px",
  } as React.CSSProperties,

  subLabel: (color: string): React.CSSProperties => ({
    display: "inline-flex",
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: 500,
    padding: "2px 8px",
    borderRadius: 20,
    marginTop: 4,
    color: color,
    background: `${color}18`,
  }),
};

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconBg,
  accentColor,
  label,
  value,
  subLabel,
}) => (
  <div style={styles.card}>
    <div style={styles.accentBar(accentColor)} />
    <div style={{ ...styles.iconWrap, background: iconBg }}>
      <Icon size={20} color="#fff" />
    </div>
    <div style={styles.body}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
      {subLabel && <span style={styles.subLabel(accentColor)}>{subLabel}</span>}
    </div>
  </div>
);