// import React from "react";
// import { T } from "../constants/Designtokens";
// import type { SecurityIncident, SeverityFilter } from "../types/Security.types";
// import { MAP_CHIP_CONFIG } from "../constants/Securityconstants";
// import { countBySeverity } from "../utils/Securityhelpers";

// interface SecurityTabsProps {
//   incidents: SecurityIncident[];
//   activeFilter?: SeverityFilter;
//   onFilterChange?: (f: SeverityFilter) => void;
// }

// const TABS: { label: string; key: SeverityFilter }[] = [
//   { label: "SOS", key: "SOS" },
//   { label: "High", key: "high" },
//   { label: "Medium", key: "medium" },
//   { label: "All", key: "all" },
// ];

// export const SecurityTabs: React.FC<SecurityTabsProps> = ({ incidents, activeFilter, onFilterChange }) => {
//   return (
//     <div
//       style={{
//         height: T.tabsH,
//         background: T.panel,
//         borderBottom: `1px solid ${T.border}`,
//         display: "flex",
//         alignItems: "center",
//         padding: "0 0 0 0",
//         gap: 0,
//         flexShrink: 0,
//         overflow: "hidden",
//       }}
//     >
//       {/* Left tabs */}
//       <div
//         style={{
//           width: T.leftW,
//           flexShrink: 0,
//           display: "flex",
//           alignItems: "center",
//           height: "100%",
//           borderRight: `1px solid ${T.border}`,
//           gap: 0,
//         }}
//       >
//         {TABS.map((tab) => {
//           const count = countBySeverity(incidents, tab.key === "all" ? "all" : tab.key);
//           const isActive = activeFilter === tab.key;
//           const color =
//             tab.key === "SOS"
//               ? T.danger
//               : tab.key === "high"
//               ? T.warning
//               : tab.key === "medium"
//               ? T.muted
//               : T.text;

//           return (
//             <button
//               key={tab.key}
//               onClick={() => onFilterChange(tab?.key)}
//               style={{
//                 background: "none",
//                 border: "none",
//                 borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
//                 cursor: "pointer",
//                 padding: "0 20px",
//                 height: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//                 color: isActive ? color : T.muted,
//                 fontWeight: isActive ? 600 : 400,
//                 fontSize: 14,
//                 fontFamily: T.font,
//                 transition: "all .15s",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {tab.label}
//               {tab.key !== "all" && (
//                 <span
//                   style={{
//                     fontSize: 12,
//                     fontWeight: 600,
//                     color,
//                     background: tab.key === "SOS" ? T.dangerBg : tab.key === "high" ? T.warningBg : "#F1F5F9",
//                     borderRadius: 10,
//                     padding: "1px 6px",
//                   }}
//                 >
//                   {count}
//                 </span>
//               )}
//               {tab.key === "all" && (
//                 <span style={{ fontSize: 12, color: T.muted }}>({incidents.length})</span>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* Map chips */}
//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//           padding: "0 16px",
//           overflowX: "auto",
//           msOverflowStyle: "none",
//         }}
//       >
//         {MAP_CHIP_CONFIG.map((chip) => (
//           <div
//             key={chip.label}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               background: chip.bg,
//               borderRadius: 20,
//               padding: "4px 10px",
//               whiteSpace: "nowrap",
//               cursor: "pointer",
//             }}
//           >
//             <span style={{ fontSize: 12, color: chip.color, fontWeight: 500, fontFamily: T.font }}>
//               {chip.label}
//             </span>
//             <span
//               style={{
//                 fontSize: 11,
//                 fontWeight: 700,
//                 color: chip.color,
//                 background: chip.bg,
//                 borderRadius: 10,
//                 padding: "0 5px",
//                 border: `1px solid ${chip.color}30`,
//               }}
//             >
//               12
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };