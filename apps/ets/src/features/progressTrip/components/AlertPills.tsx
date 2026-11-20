import React from "react";

export interface AlertItem {
  id: string;
  label: string;
  count: number;
  showCount?: boolean;
}

interface AlertPillsProps {
  items: AlertItem[];
  onClick?: (item: AlertItem) => void;
}

const alertColorMap: Record<
  string,
  { border: string; bg: string; badge: string; text: string }
> = {
  womenTravellingAlone: {
    border: "#f9a8d4",
    bg: "#fdf2f8",
    badge: "#db2777",
    text: "#9d174d",
  },
  adhocTrips: {
    border: "#fcd34d",
    bg: "#fffbeb",
    badge: "#d97706",
    text: "#92400e",
  },
  pendingDropVerification: {
    border: "#f87171",
    bg: "#fef2f2",
    badge: "#dc2626",
    text: "#991b1b",
  },
};

const fallbackColor = {
  border: "#4CAF84",
  bg: "#F8FAF9",
  badge: "#26A269",
  text: "#4B5563",
};

const AlertPills: React.FC<AlertPillsProps> = ({ items, onClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {items.map((item) => {
        const c = alertColorMap[item.id] ?? fallbackColor;
        return (
          <button
            key={item.id}
            onClick={() => onClick?.(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${c.border}`,
              background: c.bg,
              cursor: "pointer",
              fontSize: 12,
              color: c.text,
              fontWeight: 500,
              transition: "all .2s",
            }}
          >
            <span>{item.label}</span>
            {item.showCount !== false && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: c.badge,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  paddingInline: 4,
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AlertPills;
