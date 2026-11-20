// ─────────────────────────────────────────────────────────────────────────────
// ReportCard.tsx — PURELY PRESENTATIONAL
// Single report tile inside the category grid.
// Inline CSS only — no external token file.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ── Category colour map ───────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<
  string,
  { icon: string; iconBg: string; circleBg: string }
> = {
  "Trip Reports": { icon: "#3B82F6", iconBg: "#DBEAFE", circleBg: "#EFF6FF" },
  Compliance: { icon: "#F97316", iconBg: "#FED7AA", circleBg: "#FFF7ED" },
  Operations: { icon: "#7C3AED", iconBg: "#DDD6FE", circleBg: "#F5F3FF" },
  "Master Data": { icon: "#059669", iconBg: "#A7F3D0", circleBg: "#ECFDF5" },
};

const DEFAULT_COLOR = {
  icon: "#6B7280",
  iconBg: "#E5E7EB",
  circleBg: "#F9FAFB",
};

interface ReportCardProps {
  displayName: string;
  category: string;
  onClick: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  displayName,
  category,
  onClick,
}) => {
  const c = CATEGORY_COLORS[category] ?? DEFAULT_COLOR;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        background: "#ffffff",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 14px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
      }}
    >
      {/* Coloured document icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          // background: c.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            fill={c.icon}
            fillOpacity={0.2}
            stroke={c.icon}
            strokeWidth={1.8}
          />
          <polyline
            points="14 2 14 8 20 8"
            stroke={c.icon}
            strokeWidth={1.8}
            fill="none"
          />
          <line
            x1="16"
            y1="13"
            x2="8"
            y2="13"
            stroke={c.icon}
            strokeWidth={1.5}
          />
          <line
            x1="16"
            y1="17"
            x2="8"
            y2="17"
            stroke={c.icon}
            strokeWidth={1.5}
          />
          <line
            x1="10"
            y1="9"
            x2="8"
            y2="9"
            stroke={c.icon}
            strokeWidth={1.5}
          />
        </svg>
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 13,
          color: "#374151",
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {displayName}
      </span>
    </div>
  );
};

