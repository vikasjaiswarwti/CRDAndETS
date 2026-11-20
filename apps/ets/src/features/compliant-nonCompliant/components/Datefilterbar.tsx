// import React, { useState, useRef, useEffect } from "react";

// import { useTokens } from "../constants/tokens";
// import type { DateFilter } from "../types/Vehiclecompliance.types";

// interface Props {
//   value: DateFilter;
//   customDays: number;
//   onChange: (filter: DateFilter, customDays?: number) => void;
// }

// const DATE_OPTIONS: { key: DateFilter; label: string }[] = [
//   { key: 7, label: "7 Days" },
//   { key: 15, label: "15 Days" },
//   { key: 30, label: "30 Days" },
//   { key: "custom", label: "Custom" },
// ];

// // ─── Custom day picker popup ──────────────────────────────────────────────────
// const CustomDayPicker: React.FC<{
//   days: number;
//   onApply: (days: number) => void;
//   onClose: () => void;
// }> = ({ days, onApply, onClose }) => {
//   const [count, setCount] = useState(days);
//   const { color, spacing, radius, font } = useTokens();
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) onClose();
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [onClose]);

//   return (
//     <div
//       ref={ref}
//       style={{
//         position: "absolute",
//         top: "calc(100% + 6px)",
//         left: 0,
//         zIndex: 200,
//         background: color.surface,
//         borderRadius: radius.lg,
//         boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
//         padding: `${spacing.md}px ${spacing.lg}px`,
//         minWidth: 200,
//         textAlign: "center",
//       }}
//     >
//       {/* Icon + title */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: spacing.sm,
//           marginBottom: spacing.sm,
//         }}
//       >
//         <span
//           style={{
//             background: color.primaryLight,
//             color: color.primary,
//             borderRadius: radius.md,
//             padding: "6px 8px",
//             display: "flex",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={1.5}
//           >
//             <rect x="3" y="4" width="18" height="18" rx="2" />
//             <line x1="16" y1="2" x2="16" y2="6" />
//             <line x1="8" y1="2" x2="8" y2="6" />
//             <line x1="3" y1="10" x2="21" y2="10" />
//           </svg>
//         </span>
//         <div style={{ textAlign: "left" }}>
//           <div
//             style={{
//               fontSize: font.sizeMd,
//               fontWeight: font.weightSemibold,
//               color: color.textPrimary,
//             }}
//           >
//             Custom
//           </div>
//           <div style={{ fontSize: font.sizeXs, color: color.textSecondary }}>
//             Select number of days
//           </div>
//         </div>
//       </div>

//       {/* Counter */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: spacing.md,
//           margin: `${spacing.md}px 0`,
//         }}
//       >
//         <button
//           onClick={() => setCount((n) => Math.max(1, n - 1))}
//           style={{
//             width: 28,
//             height: 28,
//             borderRadius: "50%",
//             border: `1px solid ${color.borderMid}`,
//             background: "#fff",
//             cursor: "pointer",
//             fontSize: 16,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           −
//         </button>
//         <span
//           style={{
//             minWidth: 60,
//             fontSize: font.sizeMd,
//             fontWeight: font.weightMedium,
//           }}
//         >
//           {count} Days
//         </span>
//         <button
//           onClick={() => setCount((n) => n + 1)}
//           style={{
//             width: 28,
//             height: 28,
//             borderRadius: "50%",
//             border: `1px solid ${color.borderMid}`,
//             background: "#fff",
//             cursor: "pointer",
//             fontSize: 16,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           +
//         </button>
//       </div>

//       {/* Apply */}
//       <button
//         onClick={() => {
//           onApply(count);
//           onClose();
//         }}
//         style={{
//           width: "100%",
//           padding: "8px 0",
//           borderRadius: radius.md,
//           background: color.primary,
//           color: "#fff",
//           border: "none",
//           cursor: "pointer",
//           fontSize: font.sizeMd,
//           fontWeight: font.weightMedium,
//         }}
//       >
//         Apply
//       </button>
//     </div>
//   );
// };

// // ─── Date filter bar ──────────────────────────────────────────────────────────
// export const DateFilterBar: React.FC<Props> = ({
//   value,
//   customDays,
//   onChange,
// }) => {
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const { color, spacing, radius, font } = useTokens();

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: spacing.xs,
//         position: "relative",
//       }}
//     >
//       {DATE_OPTIONS.map((opt) => {
//         const isActive = value === opt.key;
//         return (
//           <div key={String(opt.key)} style={{ position: "relative" }}>
//             <button
//               onClick={() => {
//                 if (opt.key === "custom") {
//                   setPickerOpen((o) => !o);
//                 } else {
//                   onChange(opt.key);
//                   setPickerOpen(false);
//                 }
//               }}
//               style={{
//                 padding: `5px ${spacing.md}px`,
//                 borderRadius: radius.pill,
//                 border: "none",
//                 background: isActive ? color.primary : "transparent",
//                 color: isActive ? "#fff" : color.textSecondary,
//                 cursor: "pointer",
//                 fontSize: font.sizeSm,
//                 fontWeight: isActive ? font.weightSemibold : font.weightNormal,
//                 fontFamily: "inherit",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 4,
//               }}
//             >
//               {opt.key === "custom" && (
//                 <svg
//                   width="12"
//                   height="12"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                 >
//                   <rect x="3" y="4" width="18" height="18" rx="2" />
//                   <line x1="3" y1="10" x2="21" y2="10" />
//                 </svg>
//               )}
//               {opt.key === "custom" && value === "custom"
//                 ? `${customDays} Days`
//                 : opt.label}
//             </button>

//             {opt.key === "custom" && pickerOpen && (
//               <CustomDayPicker
//                 days={customDays}
//                 onApply={(days) => onChange("custom", days)}
//                 onClose={() => setPickerOpen(false)}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

import React, { useState, useRef, useEffect } from "react";

import { useTokens } from "../constants/tokens";
import type { DateFilter } from "../types/Vehiclecompliance.types";

interface Props {
  value: DateFilter;
  customDays: number;
  onChange: (filter: DateFilter, customDays?: number) => void;
  /** Disable all filter buttons while an API request is in flight */
  loading?: boolean;
}

const DATE_OPTIONS: { key: DateFilter; label: string }[] = [
  { key: 7, label: "7 Days" },
  { key: 15, label: "15 Days" },
  { key: 30, label: "30 Days" },
  { key: "custom", label: "Custom" },
];

// Quick-select presets shown inside the custom picker popup
const QUICK_PRESETS = [7, 15, 30, 45, 60, 70, 90];

// ─── Custom day picker popup ──────────────────────────────────────────────────
const CustomDayPicker: React.FC<{
  days: number;
  onApply: (days: number) => void;
  onClose: () => void;
}> = ({ days, onApply, onClose }) => {
  const [count, setCount] = useState(days);
  const { color, spacing, radius, font } = useTokens();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Validate manual input
  const setCountSafe = (n: number) => setCount(Math.max(1, Math.min(365, n)));

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 200,
        background: color.surface,
        borderRadius: radius.lg,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: `${spacing.md}px ${spacing.lg}px`,
        minWidth: 220,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <span
          style={{
            background: color.primaryLight,
            color: color.primary,
            borderRadius: radius.md,
            padding: "6px 8px",
            display: "flex",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <div>
          <div
            style={{
              fontSize: font.sizeMd,
              fontWeight: font.weightSemibold,
              color: color.textPrimary,
            }}
          >
            Custom
          </div>
          <div style={{ fontSize: font.sizeXs, color: color.textSecondary }}>
            Select number of days
          </div>
        </div>
      </div>

      {/* Quick preset chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: spacing.md,
        }}
      >
        {QUICK_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setCount(p);
            }}
            style={{
              padding: "2px 8px",
              borderRadius: radius.pill,
              border: `1px solid ${count === p ? color.primary : color.borderMid}`,
              background: count === p ? color.primaryLight : "#fff",
              color: count === p ? color.primary : color.textSecondary,
              cursor: "pointer",
              fontSize: font.sizeXs,
              fontFamily: "inherit",
            }}
          >
            {p}d
          </button>
        ))}
      </div>

      {/* Counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
          margin: `${spacing.sm}px 0`,
        }}
      >
        <button
          onClick={() => setCountSafe(count - 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `1px solid ${color.borderMid}`,
            background: "#fff",
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: 60,
            fontSize: font.sizeMd,
            fontWeight: font.weightMedium,
            textAlign: "center",
          }}
        >
          {count} Days
        </span>
        <button
          onClick={() => setCountSafe(count + 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `1px solid ${color.borderMid}`,
            background: "#fff",
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* Apply */}
      <button
        onClick={() => {
          onApply(count);
          onClose();
        }}
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: radius.md,
          background: color.primary,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: font.sizeMd,
          fontWeight: font.weightMedium,
          marginTop: spacing.xs,
        }}
      >
        Apply
      </button>
    </div>
  );
};

// ─── Date filter bar ──────────────────────────────────────────────────────────
export const DateFilterBar: React.FC<Props> = ({
  value,
  customDays,
  onChange,
  loading = false,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { color, spacing, radius, font } = useTokens();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.xs,
        position: "relative",
      }}
    >
      {DATE_OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        return (
          <div key={String(opt.key)} style={{ position: "relative" }}>
            <button
              disabled={loading}
              onClick={() => {
                if (loading) return;
                if (opt.key === "custom") {
                  setPickerOpen((o) => !o);
                } else {
                  onChange(opt.key);
                  setPickerOpen(false);
                }
              }}
              style={{
                padding: `5px ${spacing.md}px`,
                borderRadius: radius.pill,
                border: "none",
                background: isActive ? color.primary : "transparent",
                color: isActive
                  ? "#fff"
                  : loading
                    ? color.textDisabled
                    : color.textSecondary,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: font.sizeSm,
                fontWeight: isActive ? font.weightSemibold : font.weightNormal,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {opt.key === "custom" && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              {opt.key === "custom" && value === "custom"
                ? `${customDays} Days`
                : opt.label}
            </button>

            {opt.key === "custom" && pickerOpen && !loading && (
              <CustomDayPicker
                days={customDays}
                onApply={(days) => onChange("custom", days)}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
