// // src/features/individualRoster/components/RowActions.tsx

// import React from "react";
// import type { Tab } from "../types/scheduleView.types";
// import type { ScheduleHomepageEntry } from "../services/IndividualRosterApi";
// import { COLORS } from "../constants/Rosterconstants";

// export interface RowActionsProps {
//   entry: ScheduleHomepageEntry;
//   tab: Tab;
//   isChecking: boolean;
//   onCancel: (entry: ScheduleHomepageEntry) => void;
//   onNoShow: (entry: ScheduleHomepageEntry) => void;
// }

// const RowActions: React.FC<RowActionsProps> = ({
//   entry,
//   tab,
//   isChecking,
//   onCancel,
//   onNoShow,
// }) => {
//   const cfg = entry.ButtonUiConfig;

//   const showCancel =
//     tab === "LOGIN"
//       ? cfg.cancelSchedulePickupButtonShow
//       : cfg.cancelScheduleDropButtonShow;

//   const showNoShow =
//     tab === "LOGIN"
//       ? cfg.cancelSchedulePickupNoShowButtonShow
//       : cfg.cancelScheduleDropNoShowButtonShow;

//   if (isChecking) {
//     return (
//       <span
//         style={{
//           fontSize: 12,
//           color: COLORS.primaryDark,
//           display: "inline-flex",
//           alignItems: "center",
//           gap: 4,
//         }}
//       >
//         <svg
//           width="12"
//           height="12"
//           viewBox="0 0 16 16"
//           fill="none"
//           style={{ animation: "spin 1s linear infinite" }}
//         >
//           <circle cx="8" cy="8" r="6" stroke={COLORS.lightBg} strokeWidth="2" />
//           <path
//             d="M8 2a6 6 0 016 6"
//             stroke={COLORS.primaryDark}
//             strokeWidth="2"
//             strokeLinecap="round"
//           />
//         </svg>
//         Checking…
//       </span>
//     );
//   }

//   if (!showCancel && !showNoShow) {
//     return <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>;
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: 6,
//         justifyContent: "center",
//         flexWrap: "wrap",
//       }}
//     >
//       {showCancel && (
//         <button
//           type="button"
//           onClick={() => onCancel(entry)}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             padding: "4px 10px",
//             borderRadius: 20,
//             border: `1px solid ${COLORS.cancelRedBorder ?? "#fecaca"}`,
//             background: COLORS.cancelRedBg ?? "#fff1f2",
//             color: COLORS.cancelRed ?? "#ef4444",
//             fontSize: 11,
//             fontWeight: 600,
//             cursor: "pointer",
//             fontFamily: "inherit",
//             whiteSpace: "nowrap",
//           }}
//         >
//           <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
//             <circle
//               cx="7"
//               cy="7"
//               r="6"
//               stroke={COLORS.cancelRed ?? "#ef4444"}
//               strokeWidth="1.5"
//             />
//             <path
//               d="M4.5 4.5l5 5M9.5 4.5l-5 5"
//               stroke={COLORS.cancelRed ?? "#ef4444"}
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//           </svg>
//           Cancel
//         </button>
//       )}

//       {showNoShow && (
//         <button
//           type="button"
//           onClick={() => onNoShow(entry)}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             padding: "4px 10px",
//             borderRadius: 20,
//             border: "1px solid #fde68a",
//             background: "#fffbeb",
//             color: "#d97706",
//             fontSize: 11,
//             fontWeight: 600,
//             cursor: "pointer",
//             fontFamily: "inherit",
//             whiteSpace: "nowrap",
//           }}
//         >
//           <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
//             <circle cx="7" cy="7" r="6" stroke="#d97706" strokeWidth="1.5" />
//             <path
//               d="M7 4v3.5"
//               stroke="#d97706"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//             />
//             <circle cx="7" cy="10" r="0.7" fill="#d97706" />
//           </svg>
//           No Show
//         </button>
//       )}
//     </div>
//   );
// };

// export default RowActions;

// src/features/individualRoster/components/RowActions.tsx

import React from "react";
import type { Tab } from "../types/scheduleView.types";
import type { ScheduleHomepageEntry } from "../services/IndividualRosterApi";
import { COLORS } from "../constants/Rosterconstants";

export interface RowActionsProps {
  entry: ScheduleHomepageEntry;
  tab: Tab;
  isChecking: boolean;
  onCancel: (entry: ScheduleHomepageEntry) => void;
  onNoShow: (entry: ScheduleHomepageEntry) => void;
}

const RowActions: React.FC<RowActionsProps> = ({
  entry,
  tab,
  isChecking,
  onCancel,
  onNoShow,
}) => {
  const cfg = entry.ButtonUiConfig;

  // Priority 1: already Cancelled → hide everything
  // Priority 2: already No-Show  → hide everything
  // Priority 3: neither          → defer to ButtonUiConfig
  const isCancelled =
    tab === "LOGIN"
      ? !!entry.LoginCancelled // "Cancelled" or any non-empty string
      : !!entry.LogoutCancelled;

  const isNoshow = tab === "LOGIN" ? !!entry.LoginNoshow : !!entry.LogoutNoshow;

  const showCancel =
    !isCancelled && !isNoshow
      ? tab === "LOGIN"
        ? cfg.cancelSchedulePickupButtonShow
        : cfg.cancelScheduleDropButtonShow
      : false;

  const showNoShow =
    !isCancelled && !isNoshow
      ? tab === "LOGIN"
        ? cfg.cancelSchedulePickupNoShowButtonShow
        : cfg.cancelScheduleDropNoShowButtonShow
      : false;

  if (isChecking) {
    return (
      <span
        style={{
          fontSize: 12,
          color: COLORS.primaryDark,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <circle cx="8" cy="8" r="6" stroke={COLORS.lightBg} strokeWidth="2" />
          <path
            d="M8 2a6 6 0 016 6"
            stroke={COLORS.primaryDark}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Checking…
      </span>
    );
  }

  if (!showCancel && !showNoShow) {
    return <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {showCancel && (
        <button
          type="button"
          onClick={() => onCancel(entry)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 20,
            border: `1px solid ${COLORS.cancelRedBorder ?? "#fecaca"}`,
            background: COLORS.cancelRedBg ?? "#fff1f2",
            color: COLORS.cancelRed ?? "#ef4444",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke={COLORS.cancelRed ?? "#ef4444"}
              strokeWidth="1.5"
            />
            <path
              d="M4.5 4.5l5 5M9.5 4.5l-5 5"
              stroke={COLORS.cancelRed ?? "#ef4444"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Cancel
        </button>
      )}

      {showNoShow && (
        <button
          type="button"
          onClick={() => onNoShow(entry)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 20,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#d97706",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#d97706" strokeWidth="1.5" />
            <path
              d="M7 4v3.5"
              stroke="#d97706"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="7" cy="10" r="0.7" fill="#d97706" />
          </svg>
          No Show
        </button>
      )}
    </div>
  );
};

export default RowActions;
