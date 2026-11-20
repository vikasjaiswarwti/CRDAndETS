import React from "react";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";
import { ThunderboltOutlined } from "@ant-design/icons";

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  batteryPercentage?: number;
  onCharging?: boolean;
}

const Speedometer: React.FC<SpeedometerProps> = ({
  speed = 0,
  maxSpeed = 120,
  batteryPercentage = 0,
  onCharging = false,
}) => {
  const isMobile = useIsMobile();
  const clampedSpeed = Math.min(speed, maxSpeed);

  const cx = 160;
  const cy = 175;
  const R = 128;

  const speedToAngle = (s: number) => -90 + (s / maxSpeed) * 180;

  const polar = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (from: number, to: number, r: number) => {
    const a1 = speedToAngle(from);
    const a2 = speedToAngle(to);
    const p1 = polar(a1, r);
    const p2 = polar(a2, r);
    return `M${p1.x} ${p1.y} A${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
  };

  const zones = [
    { from: 0, to: 40, color: "#4ade80" },
    { from: 40, to: 80, color: "#fb923c" },
    { from: 80, to: 120, color: "#f87171" },
  ];

  const getZoneColor = (value: number) =>
    (
      zones.find((z) => value >= z.from && value <= z.to) ??
      zones[zones.length - 1]
    ).color;

  const totalTicks = 48;
  const needleAngle = speedToAngle(clampedSpeed);
  //   const needleTip = polar(needleAngle, R - 24);
  //   const cwEnd = polar(needleAngle + 180, 16);
  // Needle — shorter & thinner, with triangle shape
  const needleTip = polar(needleAngle, R - 60); // was R - 24, now R - 60
  const cwEnd = polar(needleAngle + 180, 10); // counterweight shorter
  const leftWing = polar(needleAngle + 90, 3);
  const rightWing = polar(needleAngle - 90, 3);

  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 60 : 64,
        left: isMobile ? 4 : 10,
        width: 156,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 1000,
        // pointerEvents: "none",
        padding: 2,
      }}
    >
      <svg
        viewBox="0 0 320 210"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Colored arc zones */}
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.from, z.to, R)}
            fill="none"
            stroke={z.color}
            strokeWidth="10"
            strokeLinecap="butt"
          />
        ))}

        {/* Tick marks — colored per zone */}
        {Array.from({ length: totalTicks + 1 }).map((_, i) => {
          const frac = i / totalTicks;
          const deg = -90 + frac * 180;
          const spd = frac * maxSpeed;
          const isMajor = i % 8 === 0;
          const isMid = i % 4 === 0;
          const innerR = isMajor ? R - 30 : isMid ? R - 22 : R - 14;
          const p1 = polar(deg, innerR);
          const p2 = polar(deg, R - 20);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={getZoneColor(spd)}
              strokeWidth={isMajor ? 2 : isMid ? 2 : 1.2}
              strokeLinecap="round"
              opacity={isMajor ? 1 : isMid ? 0.85 : 0.65}
            />
          );
        })}

        {/* Labels every 10 km/h */}
        {Array.from({ length: Math.floor(maxSpeed / 20) + 1 }).map((_, i) => {
          const value = i * 20;
          const deg = speedToAngle(value);
          const p = polar(deg, R - 45);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              // fill={getZoneColor(value)}
              fontSize="14"
              fontWeight={600}
              fontFamily="system-ui, sans-serif"
            >
              {value}
            </text>
          );
        })}

        {/* Needle */}

        <polygon
          points={`${needleTip.x},${needleTip.y} ${leftWing.x},${leftWing.y} ${cwEnd.x},${cwEnd.y} ${rightWing.x},${rightWing.y}`}
          fill="#1e293b"
          opacity={0.9}
          style={{ transition: "all 0.4s ease-in-out" }}
        />

        {/* Hub — slightly smaller */}
        <circle cx={cx} cy={cy} r="8" fill="#1e293b" />
        <circle cx={cx} cy={cy} r="4" fill="white" />
        {/* Speed value */}
        {/* <text
          x={cx}
          y={cy + 26}
          textAnchor="middle"
          fontSize="24"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
          fill="#0f172a"
        >
          {Math.round(clampedSpeed)} km/h
        </text> */}
      </svg>
      <div
        className="flex flex-col justify-center items-center"
        style={{ fontSize: isMobile ? 11 : 12, paddingInline: 3 }}
      >
        <span>Speed : {Math.round(clampedSpeed)} Km/h</span>
        {batteryPercentage != 0 && (
          <span>
            Mobile Battery : {batteryPercentage}%{" "}
            {onCharging && (
              <ThunderboltOutlined style={{ color: "#22C55E", fontSize: 14 }} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Speedometer;
