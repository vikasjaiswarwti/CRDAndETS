// // src/features/route-maker/components/Shimmer.tsx
// //
// // Reusable shimmer skeleton primitives.

// import React from "react";
// import { T } from "../constants/designTokens";

// // Inject keyframe once
// const SHIMMER_CSS = `
// @keyframes rm-shimmer {
//   0%   { background-position: -400px 0; }
//   100% { background-position:  400px 0; }
// }
// `;
// let injected = false;
// function injectShimmerCSS() {
//   if (injected || typeof document === "undefined") return;
//   const style = document.createElement("style");
//   style.textContent = SHIMMER_CSS;
//   document.head.appendChild(style);
//   injected = true;
// }

// interface ShimmerBoxProps {
//   width?: string | number;
//   height?: string | number;
//   radius?: number;
//   style?: React.CSSProperties;
// }

// export function ShimmerBox({
//   width = "100%",
//   height = 16,
//   radius,
//   style,
// }: ShimmerBoxProps) {
//   injectShimmerCSS();
//   return (
//     <div
//       style={{
//         width,
//         height,
//         borderRadius: radius ?? T.radiusSm,
//         background: `linear-gradient(90deg, ${T.shimmerBase} 25%, ${T.shimmerShine} 50%, ${T.shimmerBase} 75%)`,
//         backgroundSize: "800px 100%",
//         animation: "rm-shimmer 1.4s ease-in-out infinite",
//         flexShrink: 0,
//         ...style,
//       }}
//     />
//   );
// }

// /** Full route card skeleton */
// export function RouteCardShimmer() {
//   return (
//     <div
//       style={{
//         background: T.panel,
//         borderRadius: T.radius,
//         padding: "12px 14px",
//         border: `1px solid ${T.border}`,
//         display: "flex",
//         flexDirection: "column",
//         gap: 10,
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//         <ShimmerBox width={16} height={16} radius={3} />
//         <ShimmerBox width={60} height={14} />
//         <div style={{ flex: 1 }} />
//         <ShimmerBox width={80} height={20} radius={T.radiusFull} />
//       </div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4,1fr)",
//           gap: 6,
//         }}
//       >
//         {[0, 1, 2, 3].map((i) => (
//           <div
//             key={i}
//             style={{ display: "flex", flexDirection: "column", gap: 4 }}
//           >
//             <ShimmerBox height={13} />
//             <ShimmerBox height={11} width="60%" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /** Passenger row skeleton */
// export function PassengerRowShimmer() {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         padding: "8px 12px",
//       }}
//     >
//       <ShimmerBox width={24} height={24} radius={T.radiusFull} />
//       <div
//         style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}
//       >
//         <ShimmerBox height={13} width="55%" />
//         <ShimmerBox height={11} width="75%" />
//       </div>
//       <ShimmerBox width={48} height={18} radius={T.radiusFull} />
//     </div>
//   );
// }

// /** KPI stat shimmer */
// export function KpiShimmer() {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 8,
//         padding: "8px 16px",
//       }}
//     >
//       {[100, 80, 90, 70, 110, 60].map((w, i) => (
//         <ShimmerBox key={i} width={w} height={14} />
//       ))}
//     </div>
//   );
// }

import React, { useEffect } from "react";

const T = {
  bg: "#F5F6FA",
  panel: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F8FAFC",
  text: "#1A202C",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  accent: "#16A34A",
  accentBg: "#F0FDF4",
  accentHover: "#15803D",
  success: "#16A34A",
  successBg: "#DCFCE7",
  warn: "#D97706",
  warnBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.07)",
  shadowLg: "0 10px 15px rgba(0,0,0,0.08)",
  radius: 10,
  radiusSm: 6,
  radiusLg: 14,
  headerH: 56,
  statsH: 52,
  sidebarW: 260,
  routeStackW: 380,
  shimmerBase: "#F1F5F9",
  shimmerHighlight: "#E2E8F0",
};

const KEYFRAME_ID = "shimmer-sweep-keyframe";

function injectShimmerKeyframe(): void {
  if (document.getElementById(KEYFRAME_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAME_ID;
  style.textContent = `
    @keyframes shimmer-sweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── ShimmerCard ─────────────────────────────────────────────────────────────

export interface ShimmerCardProps {
  height?: number;
  width?: string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const ShimmerCard: React.FC<ShimmerCardProps> = ({
  height = 120,
  width = "100%",
  borderRadius = T.radius,
  style,
}) => {
  useEffect(() => {
    injectShimmerKeyframe();
  }, []);

  const shimmerStyle: React.CSSProperties = {
    height,
    width,
    borderRadius,
    background: `linear-gradient(90deg, ${T.shimmerBase} 25%, ${T.shimmerHighlight} 50%, ${T.shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer-sweep 1.4s linear infinite",
    display: "block",
    flexShrink: 0,
    ...style,
  };

  return <span style={shimmerStyle} aria-hidden="true" />;
};

// ─── Internal helper ──────────────────────────────────────────────────────────

interface ShimmerLineProps {
  height: number;
  width: string;
  borderRadius?: number;
}

function ShimmerLine({
  height,
  width,
  borderRadius,
}: ShimmerLineProps): React.ReactElement {
  return (
    <ShimmerCard
      height={height}
      width={width}
      borderRadius={borderRadius ?? T.radiusSm}
    />
  );
}

// ─── ShimmerRouteCard ─────────────────────────────────────────────────────────

export const ShimmerRouteCard: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => {
  useEffect(() => {
    injectShimmerKeyframe();
  }, []);

  const cardStyle: React.CSSProperties = {
    background: T.card,
    borderRadius: T.radius,
    boxShadow: T.shadow,
    border: `1px solid ${T.border}`,
    overflow: "hidden",
    width: "100%",
    ...style,
  };

  const topBarStyle: React.CSSProperties = {
    width: "100%",
    height: 20,
    background: `linear-gradient(90deg, ${T.shimmerBase} 25%, ${T.shimmerHighlight} 50%, ${T.shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer-sweep 1.4s linear infinite",
  };

  const bodyStyle: React.CSSProperties = {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const bottomRowStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
    marginTop: 4,
  };

  return (
    <div style={cardStyle} aria-hidden="true">
      {/* Top accent bar */}
      <div style={topBarStyle} />

      <div style={bodyStyle}>
        {/* Title block */}
        <ShimmerLine height={14} width="60%" />

        {/* Metadata line 1 */}
        <ShimmerLine height={10} width="40%" />

        {/* Metadata line 2 */}
        <ShimmerLine height={10} width="55%" />

        {/* Bottom pill row */}
        <div style={bottomRowStyle}>
          <ShimmerCard height={24} width="30%" borderRadius={T.radiusSm} />
          <ShimmerCard height={24} width="30%" borderRadius={T.radiusSm} />
        </div>
      </div>
    </div>
  );
};
