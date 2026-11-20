// src/components/rightside/GpsLossOverlay.tsx
import { useEffect, useState } from "react";

interface GpsLossOverlayProps {
  isLost: boolean;
}

function GpsLossOverlay({ isLost }: GpsLossOverlayProps) {
  const [visible, setVisible] = useState(true);

  // Blink toggle every 800ms
  useEffect(() => {
    if (!isLost) return;
    const interval = setInterval(() => setVisible((v) => !v), 800);
    return () => clearInterval(interval);
  }, [isLost]);

  if (!isLost) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      {/* Icon */}
      <div
        style={{
          opacity: visible ? 1 : 0.15,
          transition: "opacity 0.3s ease",
          background: "rgba(255, 59, 48, 0.12)",
          border: "2px solid #FF3B30",
          borderRadius: 16,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          backdropFilter: "blur(6px)",
          boxShadow: "0 4px 16px rgba(255,59,48,0.3)",
        }}
      >
        {/* SVG: location pin with signal slash */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pin body */}
          <path
            d="M18 3C12.477 3 8 7.477 8 13c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z"
            fill="#FF3B30"
          />
          {/* White circle in pin */}
          <circle cx="18" cy="13" r="4" fill="white" />
          {/* Signal slash line */}
          <line
            x1="8"
            y1="4"
            x2="28"
            y2="30"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Label */}
        <span
          style={{
            color: "#FF3B30",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          GPS SIGNAL LOST
        </span>
      </div>
    </div>
  );
}

export default GpsLossOverlay;
