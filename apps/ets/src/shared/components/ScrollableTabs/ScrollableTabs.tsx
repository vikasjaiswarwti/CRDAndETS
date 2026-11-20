import React from "react";
import { useIsMobile } from "../../customHooks/useIsMobile";

export interface ScrollableTabItem {
  key: string;
  label: string;
  count?: number;
  badgeColor?: string;
}

interface ScrollableTabsProps {
  items: ScrollableTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  items,
  activeKey,
  onChange,
  activeColor = "#1B4332",
  inactiveColor = "#6b7c74",
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      <style>{`.sct-strip::-webkit-scrollbar { display: none; }`}</style>
      <div
        className="sct-strip"
        style={{
          display: "flex",
          gap: isMobile ? 0 : 24,
          alignItems: "center",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        {items.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              border: "none",
              background: "none",
              paddingBottom: 10,
              paddingInline: isMobile ? 14 : 0,
              flexShrink: 0,
              borderBottom:
                activeKey === tab.key
                  ? `3px solid ${activeColor}`
                  : "3px solid transparent",
              color: activeKey === tab.key ? activeColor : inactiveColor,
              fontWeight: activeKey === tab.key ? 700 : 500,
              fontSize: isMobile ? 13 : 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
            {tab.count ? (
              <span
                style={{
                  marginLeft: 6,
                  background: tab.badgeColor ?? activeColor,
                  color: "#fff",
                  padding: "2px 7px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </>
  );
};
