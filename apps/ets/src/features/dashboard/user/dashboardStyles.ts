import type React from "react";

export const thStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#8A9E99",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  padding: "8px 12px",
  width:"fit",
  textAlign: "left",
  borderBottom: "1px solid #F0F0F0",
};

export const tdStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#1B4332",
  padding: "13px 12px",
  borderBottom: "1px solid #F9F9F9",
};

export const sectionCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E8F5EE",
  borderRadius: 12,
  padding: "18px 20px",
  // marginBottom: 16,
};

export const sectionHdr: React.CSSProperties = {
  display: "flex",
  // justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

export const viewAllBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#40916C",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
};

/* ─── Top Stats Bar ───────────────────────────────────────── */

export const topStatsBar: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 12,
};

export const statCard: React.CSSProperties = {
  background: "#fff", // var(--surface)
  borderRadius: 12, // var(--radius)
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", // var(--shadow)
  border: "1px solid #E8F5EE", // var(--border)
};

export const statIcon: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export const statBody: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

export const statLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#8A9E99", // text-secondary
};

export const statValue: React.CSSProperties = {
  display: "block",
  fontSize: 20,
  fontWeight: 700,
  color: "#1B4332", // text-primary
  lineHeight: 1.2,
};

export const statBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: 20,
  whiteSpace: "nowrap",
};

export const statBadgePositive: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#16A34A",
};

export const statBadgeNegative: React.CSSProperties = {
  background: "#FEE2E2",
  color: "#DC2626",
};