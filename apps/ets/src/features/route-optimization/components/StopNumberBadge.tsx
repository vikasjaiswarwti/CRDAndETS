// components/shuttle/StopNumberBadge.tsx

// import React from "react";

const STOP_COLORS: Record<number, string> = {
  1: "#1d4ed8", // blue
  2: "#ea580c", // orange
  3: "#d97706", // amber
  4: "#dc2626", // red
};

const DEFAULT_COLOR = "#6b7280"; // gray fallback for stop 5+

interface StopNumberBadgeProps {
  number: number;
  size?: number;
}

// const BusIcon = ({ size }: { size: number }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#ffffff"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <rect x="2" y="7" width="20" height="13" rx="2" />
//     <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" />
//     <line x1="2" y1="13" x2="22" y2="13" />
//     <circle cx="8" cy="17" r="0.5" fill="#fff" />
//     <circle cx="16" cy="17" r="0.5" fill="#fff" />
//   </svg>
// );

export function StopNumberBadge({ number, size = 18 }: StopNumberBadgeProps) {
  const backgroundColor = STOP_COLORS[number] ?? DEFAULT_COLOR;
  // const iconSize = Math.round(size * 0.5);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
        fontSize:11,
        color:"#fff"
      }}
      title={`Stop ${number}`}
      aria-label={`Stop number ${number}`}
    >
      {number}
      {/* <BusIcon size={iconSize} /> */}
    </div>
  );
}