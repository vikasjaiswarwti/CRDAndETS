// // shared/components/shift-grid/ShiftGridCells.tsx
// // ════════════════════════════════════════════════════════════
// //  Visual atoms — CB, NumCell, DropShiftCell, TimeTag, EditBtn
// //  GroupHeaderRow, SubHeaderRow — new column order per spec
// // ════════════════════════════════════════════════════════════
// import React from "react";
// import { CloudSun, Sun, Sunset, Moon, Pencil } from "lucide-react";
// import { C, F, SP, R, SH, CM, TR } from "./ShiftGridTokens";

// // ── Time band ────────────────────────────────────────────────
// export type TimeBand = "morning" | "afternoon" | "evening" | "night";

// function parseHour(time: string): number {
//   if (!time) return 0;
//   const t = time.trim();
//   const ampm = /([ap]m)/i.exec(t);
//   if (ampm) {
//     const [h] = t.split(":");
//     let hr = parseInt(h, 10);
//     if (/pm/i.test(ampm[1]) && hr !== 12) hr += 12;
//     if (/am/i.test(ampm[1]) && hr === 12) hr = 0;
//     return hr;
//   }
//   return parseInt(t.split(":")[0], 10) || 0;
// }

// export function getTimeBand(time: string): TimeBand {
//   const h = parseHour(time);
//   if (h >= 5 && h < 12) return "morning";
//   if (h >= 12 && h < 18) return "afternoon";
//   if (h >= 18 && h < 22) return "evening";
//   return "night";
// }

// export const BAND_CONFIG: Record<
//   TimeBand,
//   {
//     icon: React.ElementType;
//     bg: string;
//     iconColor: string;
//     label: string;
//     range: string;
//   }
// > = {
//   morning: {
//     icon: CloudSun,
//     bg: "#FFF7ED",
//     iconColor: "#F97316",
//     label: "Morning",
//     range: "05–11",
//   },
//   afternoon: {
//     icon: Sun,
//     bg: "#FFFBEB",
//     iconColor: "#EAB308",
//     label: "Afternoon",
//     range: "12–17",
//   },
//   evening: {
//     icon: Sunset,
//     bg: "#FDF4FF",
//     iconColor: "#A855F7",
//     label: "Evening",
//     range: "18–21",
//   },
//   night: {
//     icon: Moon,
//     bg: "#EFF6FF",
//     iconColor: "#3B82F6",
//     label: "Night",
//     range: "22–04",
//   },
// };

// // ── TimeTag ───────────────────────────────────────────────────
// // Line 1: bold shift time. Line 2: muted band range (always shown).
// export const TimeTag: React.FC<{ time: string }> = ({ time }) => {
//   const band = getTimeBand(time);
//   const cfg = BAND_CONFIG[band];
//   const Icon = cfg.icon;
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: SP[1.5] }}>
//       <div
//         style={{
//           width: CM.timeBandIconW,
//           height: CM.timeBandIconH,
//           borderRadius: CM.timeBandIconR,
//           background: cfg.bg,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexShrink: 0,
//         }}
//       >
//         <Icon size={CM.timeBandIconSz} color={cfg.iconColor} strokeWidth={2} />
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
//         <span
//           style={{
//             fontSize: F.size.base,
//             fontWeight: F.weight.semibold,
//             color: C.text,
//             lineHeight: 1.2,
//             letterSpacing: F.ls.tight,
//             whiteSpace: "nowrap",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {time}
//         </span>
//         <span
//           style={{
//             fontSize: F.size.xs,
//             color: C.textMuted,
//             lineHeight: 1.2,
//             whiteSpace: "nowrap",
//           }}
//         >
//           {cfg.range}
//         </span>
//       </div>
//     </div>
//   );
// };

// // ── CB (Checkbox) ─────────────────────────────────────────────
// export const CB: React.FC<{
//   checked: boolean;
//   color?: string;
//   onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
//   readonly?: boolean;
//   size?: number;
// }> = ({ checked, color, onClick, readonly = false, size }) => {
//   const sz = size ?? CM.cbSize;
//   const col = color ?? C.primary;
//   return (
//     <div
//       onClick={readonly ? undefined : onClick}
//       style={{
//         width: sz,
//         height: sz,
//         borderRadius: CM.cbRadius,
//         border: checked ? `2px solid ${col}` : `2px solid ${C.border}`,
//         background: checked ? col : C.white,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         cursor: readonly ? "not-allowed" : "pointer",
//         transition: TR.fast,
//         flexShrink: 0,
//         boxShadow: checked ? SH.cb(col) : "none",
//         opacity: readonly ? 0.5 : 1,
//       }}
//     >
//       {checked && (
//         <svg width={sz - 6} height={sz - 6} viewBox="0 0 10 8" fill="none">
//           <path
//             d="M1 4l3 3 5-6"
//             stroke="#fff"
//             strokeWidth="1.8"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       )}
//     </div>
//   );
// };

// // ── NumCell ───────────────────────────────────────────────────
// export const NumCell: React.FC<{
//   value: number | null;
//   onChange: (v: number | null) => void;
//   min?: number;
//   max?: number;
//   placeholder?: string;
//   inputWidth?: number;
//   inputHeight?: number;
//   align?: "center" | "right";
// }> = ({
//   value,
//   onChange,
//   min = 0,
//   max = 9999,
//   placeholder = "—",
//   inputWidth,
//   inputHeight,
//   align = "center",
// }) => {
//   const w = inputWidth ?? CM.numCellW;
//   const h = inputHeight ?? CM.inputHSm;
//   return (
//     <input
//       type="number"
//       value={value ?? ""}
//       min={min}
//       max={max}
//       placeholder={placeholder}
//       onChange={(e) =>
//         onChange(e.target.value === "" ? null : Number(e.target.value))
//       }
//       style={
//         {
//           width: w,
//           height: h,
//           border: `1px solid ${C.border}`,
//           borderRadius: R.md,
//           background: C.white,
//           fontSize: F.size.base,
//           fontWeight: F.weight.medium,
//           color: C.text,
//           textAlign: align,
//           padding: `0 ${SP[1]}px`,
//           outline: "none",
//           transition: TR.fast,
//           appearance: "none",
//           MozAppearance: "textfield",
//           display: "block",
//         } as React.CSSProperties
//       }
//       onFocus={(e) => {
//         e.target.style.borderColor = C.borderFocus;
//         e.target.style.boxShadow = SH.focus(C.primary);
//       }}
//       onBlur={(e) => {
//         e.target.style.borderColor = C.border;
//         e.target.style.boxShadow = "none";
//       }}
//     />
//   );
// };

// // ── DropShiftCell ─────────────────────────────────────────────
// export const DropShiftCell: React.FC<{
//   value: string;
//   options: string[];
//   onChange: (v: string) => void;
//   width?: number;
//   height?: number;
// }> = ({ value, options, onChange, width, height }) => {
//   const w = width ?? CM.dropCellW;
//   const h = height ?? CM.inputH;
//   return (
//     <div style={{ position: "relative", display: "inline-block", width: w }}>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         style={{
//           width: "100%",
//           height: h,
//           border: `1px solid ${C.border}`,
//           borderRadius: R.md,
//           background: C.white,
//           fontSize: F.size.base,
//           fontWeight: F.weight.medium,
//           color: C.text,
//           padding: `0 ${SP[4]}px 0 ${SP[1.5]}px`,
//           outline: "none",
//           appearance: "none",
//           cursor: "pointer",
//           transition: TR.fast,
//         }}
//         onFocus={(e) => {
//           e.target.style.borderColor = C.borderFocus;
//         }}
//         onBlur={(e) => {
//           e.target.style.borderColor = C.border;
//         }}
//       >
//         {options.map((o) => (
//           <option key={o} value={o}>
//             {o}
//           </option>
//         ))}
//       </select>
//       <svg
//         style={{
//           position: "absolute",
//           right: 6,
//           top: "50%",
//           transform: "translateY(-50%)",
//           pointerEvents: "none",
//         }}
//         width={10}
//         height={10}
//         viewBox="0 0 10 10"
//       >
//         <path
//           d="M2 3.5l3 3 3-3"
//           stroke={C.textMuted}
//           strokeWidth="1.5"
//           fill="none"
//           strokeLinecap="round"
//         />
//       </svg>
//     </div>
//   );
// };

// // ── EditBtn — pencil only ─────────────────────────────────────
// // Three-dot "more" button removed per spec. Only the green pencil remains.
// export const EditBtn: React.FC<{
//   onEdit: () => void;
// }> = ({ onEdit }) => {
//   const btnBase: React.CSSProperties = {
//     width: 26,
//     height: 26,
//     border: `1px solid ${C.border}`,
//     borderRadius: R.md,
//     background: C.white,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     transition: TR.fast,
//     flexShrink: 0,
//     padding: 0,
//   };
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <button
//         onClick={onEdit}
//         style={btnBase}
//         title="Edit shift"
//         onMouseEnter={(e) => {
//           (e.currentTarget as HTMLElement).style.background = C.primaryLight;
//           (e.currentTarget as HTMLElement).style.borderColor = C.primaryBorder;
//         }}
//         onMouseLeave={(e) => {
//           (e.currentTarget as HTMLElement).style.background = C.white;
//           (e.currentTarget as HTMLElement).style.borderColor = C.border;
//         }}
//       >
//         <Pencil size={12} color={C.primary} strokeWidth={2} />
//       </button>
//     </div>
//   );
// };

// // ── Column definitions ────────────────────────────────────────
// // Column order per spec:
// // ShiftTime | DropShift | PickCap | DropCap | PeakHour |
// // BusNodalPick | BusNodalDrop | AdhocPick | AdhocDrop |
// // SafeReachMale | SafeReachFemale | AvgSpeed | Actions

// export const COLUMNS = [
//   {
//     key: "shiftTime",
//     label: "Shift Time",
//     minWidth: CM.colShiftTime,
//     group: "",
//   },
//   {
//     key: "dropShift",
//     label: "Drop Shift",
//     minWidth: CM.colDropTime,
//     group: "",
//   },
//   { key: "pickupCap", label: "Pickup", minWidth: CM.colNum, group: "Capacity" },
//   { key: "dropCap", label: "Drop", minWidth: CM.colNum, group: "Capacity" },
//   { key: "isPeakHour", label: "Peak", minWidth: CM.colBool, group: "" },
//   {
//     key: "isGuardPick",
//     label: "Pickup",
//     minWidth: CM.colBool,
//     group: "Bus Nodal",
//   },
//   {
//     key: "isGuardDrop",
//     label: "Drop",
//     minWidth: CM.colBool,
//     group: "Bus Nodal",
//   },
//   {
//     key: "unsPickAllwd",
//     label: "Pickup",
//     minWidth: CM.colBool,
//     group: "Adhoc",
//   },
//   { key: "unsDropAllwd", label: "Drop", minWidth: CM.colBool, group: "Adhoc" },
//   {
//     key: "isSafeReachedMale",
//     label: "Male",
//     minWidth: CM.colBool,
//     group: "Safe Reach",
//   },
//   {
//     key: "isSafeReachedFemale",
//     label: "Female",
//     minWidth: CM.colBool,
//     group: "Safe Reach",
//   },
//   { key: "avgSpeed", label: "Avg Speed", minWidth: CM.colAvgSpeed, group: "" },
//   { key: "actions", label: "Actions", minWidth: CM.colActions, group: "" },
// ] as const;

// export type ColKey = (typeof COLUMNS)[number]["key"];

// // ── GroupHeaderRow ────────────────────────────────────────────
// // Row 1: Spanning group labels
// export const GroupHeaderRow: React.FC = () => {
//   const cellBase: React.CSSProperties = {
//     padding: `${SP[0.5]}px ${SP[1.5]}px`,
//     borderBottom: `1px solid ${C.divider}`,
//     background: C.bgSub,
//     textAlign: "center",
//     fontSize: F.size.micro,
//     fontWeight: F.weight.heavy,
//     color: C.primary,
//     letterSpacing: F.ls.widest,
//     textTransform: "uppercase",
//     whiteSpace: "nowrap",
//   };
//   const empty: React.CSSProperties = { ...cellBase };
//   return (
//     <tr>
//       <th style={empty} />
//       <th style={empty} />
//       <th colSpan={2} style={cellBase}>
//         CAPACITY
//       </th>
//       <th style={empty} />
//       <th colSpan={2} style={cellBase}>
//         BUS NODAL
//       </th>
//       <th colSpan={2} style={cellBase}>
//         ADHOC
//       </th>
//       <th colSpan={2} style={cellBase}>
//         SAFE REACH
//       </th>
//       <th style={empty} />
//       <th style={empty} />
//     </tr>
//   );
// };

// // ── SubHeaderRow ──────────────────────────────────────────────
// // Row 2: Individual column labels
// export const SubHeaderRow: React.FC = () => {
//   const th: React.CSSProperties = {
//     padding: `${SP[1]}px ${SP[1.5]}px`,
//     background: C.bgSub,
//     borderBottom: `2px solid ${C.border}`,
//     textAlign: "left",
//     fontSize: F.size.xs,
//     fontWeight: F.weight.semibold,
//     color: C.textMuted,
//     letterSpacing: F.ls.wider,
//     textTransform: "uppercase",
//     whiteSpace: "nowrap",
//     position: "sticky",
//     top: 0,
//     zIndex: 2,
//   };
//   const thCenter: React.CSSProperties = { ...th, textAlign: "center" };
//   return (
//     <tr>
//       <th style={{ ...th, minWidth: CM.colShiftTime }}>SHIFT TIME</th>
//       <th style={{ ...th, minWidth: CM.colDropTime }}>DROP SHIFT</th>
//       <th style={{ ...thCenter, minWidth: CM.colNum }}>PICKUP</th>
//       <th style={{ ...thCenter, minWidth: CM.colNum }}>DROP</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>PEAK</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>PICKUP</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>DROP</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>PICKUP</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>DROP</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>MALE</th>
//       <th style={{ ...thCenter, minWidth: CM.colBool }}>FEMALE</th>
//       <th style={{ ...th, minWidth: CM.colAvgSpeed }}>SPD (km/h)</th>
//       <th style={{ ...thCenter, minWidth: CM.colActions }}></th>
//     </tr>
//   );
// };

// // backward-compat alias
// export const D = {
//   CB,
//   NumCell,
//   DropShiftCell,
//   TimeTag,
//   EditBtn,
//   GroupHeaderRow,
//   SubHeaderRow,
//   COLUMNS,
//   BAND_CONFIG,
//   getTimeBand,
// };
// export default D;

// shared/components/shift-grid/ShiftGridCells.tsx
// ════════════════════════════════════════════════════════════
//  CHANGES FROM PREVIOUS VERSION
//  ────────────────────────────────────────────────────────────
//  TimeTag:
//    • Band icon (CloudSun / Sun / Sunset / Moon) REMOVED from grid cell.
//      The icon still lives in BAND_CONFIG for use in EditSlotModal header.
//    • Static range text ("05–11", "12–17", etc.) REMOVED.
//    • Now renders: shiftTime (bold) + optional shiftDesc (muted subtitle).
//      shiftDesc is the real range string from the API e.g. "06:30–07:00 AM".
//
//  EditBtn:
//    • onEdit now accepts an optional MouseEvent so callers can
//      stopPropagation before row-click fires.
//
//  Everything else (CB, NumCell, DropShiftCell, BAND_CONFIG) unchanged.
// ════════════════════════════════════════════════════════════
import React from "react";
import { CloudSun, Sun, Sunset, Moon, Pencil } from "lucide-react";
import { C, F, SP, R, SH, CM, TR } from "./ShiftGridTokens";

// ── Time band ────────────────────────────────────────────────
export type TimeBand = "morning" | "afternoon" | "evening" | "night";

function parseHour(time: string): number {
  if (!time) return 0;
  const t = time.trim();
  const ampm = /([ap]m)/i.exec(t);
  if (ampm) {
    const [h] = t.split(":");
    let hr = parseInt(h, 10);
    if (/pm/i.test(ampm[1]) && hr !== 12) hr += 12;
    if (/am/i.test(ampm[1]) && hr === 12) hr = 0;
    return hr;
  }
  return parseInt(t.split(":")[0], 10) || 0;
}

export function getTimeBand(time: string): TimeBand {
  const h = parseHour(time);
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

// BAND_CONFIG kept — used by EditSlotModal header icon, not in the grid cell.
export const BAND_CONFIG: Record<
  TimeBand,
  {
    icon: React.ElementType;
    bg: string;
    iconColor: string;
    label: string;
  }
> = {
  morning: {
    icon: CloudSun,
    bg: "#FFF7ED",
    iconColor: "#F97316",
    label: "Morning",
  },
  afternoon: {
    icon: Sun,
    bg: "#FFFBEB",
    iconColor: "#EAB308",
    label: "Afternoon",
  },
  evening: {
    icon: Sunset,
    bg: "#FDF4FF",
    iconColor: "#A855F7",
    label: "Evening",
  },
  night: {
    icon: Moon,
    bg: "#EFF6FF",
    iconColor: "#3B82F6",
    label: "Night",
  },
};

// ── TimeTag — clean, no static range, no band icon ───────────
// desc = row.shiftDesc from API e.g. "06:30 AM – 07:00 AM"
export const TimeTag: React.FC<{
  time: string;
  desc?: string | null;
}> = ({ time, desc }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span
      style={{
        fontSize: F.size.base,
        fontWeight: F.weight.semibold,
        color: C.text,
        lineHeight: 1.2,
        letterSpacing: F.ls.tight,
        whiteSpace: "nowrap",
      }}
    >
      {time}
    </span>
    {desc && (
      <span
        style={{
          fontSize: F.size.xs,
          color: C.textMuted,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        {desc}
      </span>
    )}
  </div>
);

// ── CB (Checkbox) ─────────────────────────────────────────────
export const CB: React.FC<{
  checked: boolean;
  color?: string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly?: boolean;
  size?: number;
}> = ({ checked, color, onClick, readonly = false, size }) => {
  const sz = size ?? CM.cbSize;
  const col = color ?? C.primary;
  return (
    <div
      onClick={readonly ? undefined : onClick}
      style={{
        width: sz,
        height: sz,
        borderRadius: CM.cbRadius,
        border: checked ? `2px solid ${col}` : `2px solid ${C.border}`,
        background: checked ? col : C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: readonly ? "not-allowed" : "pointer",
        transition: TR.fast,
        flexShrink: 0,
        boxShadow: checked ? SH.cb(col) : "none",
        opacity: readonly ? 0.5 : 1,
      }}
    >
      {checked && (
        <svg width={sz - 6} height={sz - 6} viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

// ── NumCell ───────────────────────────────────────────────────
export const NumCell: React.FC<{
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  inputWidth?: number;
  inputHeight?: number;
  align?: "center" | "right";
}> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  placeholder = "—",
  inputWidth,
  inputHeight,
  align = "center",
}) => {
  const w = inputWidth ?? CM.numCellW;
  const h = inputHeight ?? CM.inputHSm;
  return (
    <input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      style={
        {
          width: w,
          height: h,
          border: `1px solid ${C.border}`,
          borderRadius: R.md,
          background: C.white,
          fontSize: F.size.base,
          fontWeight: F.weight.medium,
          color: C.text,
          textAlign: align,
          padding: `0 ${SP[1]}px`,
          outline: "none",
          transition: TR.fast,
          appearance: "none",
          MozAppearance: "textfield",
          display: "block",
        } as React.CSSProperties
      }
      onFocus={(e) => {
        e.target.style.borderColor = C.borderFocus;
        e.target.style.boxShadow = SH.focus(C.primary);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = C.border;
        e.target.style.boxShadow = "none";
      }}
    />
  );
};

// ── DropShiftCell ─────────────────────────────────────────────
export const DropShiftCell: React.FC<{
  value: string;
  options: string[];
  onChange: (v: string) => void;
  width?: number;
  height?: number;
}> = ({ value, options, onChange, width, height }) => {
  const w = width ?? CM.dropCellW;
  const h = height ?? CM.inputH;
  return (
    <div style={{ position: "relative", display: "inline-block", width: w }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: h,
          border: `1px solid ${C.border}`,
          borderRadius: R.md,
          background: C.white,
          fontSize: F.size.base,
          fontWeight: F.weight.medium,
          color: C.text,
          padding: `0 ${SP[4]}px 0 ${SP[1.5]}px`,
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          transition: TR.fast,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
        width={10}
        height={10}
        viewBox="0 0 10 10"
      >
        <path
          d="M2 3.5l3 3 3-3"
          stroke={C.textMuted}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// ── EditBtn — pencil, stopPropagation-aware ───────────────────
export const EditBtn: React.FC<{
  onEdit: (e?: React.MouseEvent) => void;
}> = ({ onEdit }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit(e);
      }}
      style={{
        width: 26,
        height: 26,
        border: `1px solid ${C.border}`,
        borderRadius: R.md,
        background: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: TR.fast,
        flexShrink: 0,
        padding: 0,
      }}
      title="Edit shift"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = C.primaryLight;
        (e.currentTarget as HTMLElement).style.borderColor = C.primaryBorder;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = C.white;
        (e.currentTarget as HTMLElement).style.borderColor = C.border;
      }}
    >
      <Pencil size={12} color={C.primary} strokeWidth={2} />
    </button>
  </div>
);

// ── Column definitions (unchanged) ───────────────────────────
export const COLUMNS = [
  {
    key: "shiftTime",
    label: "Shift Time",
    minWidth: CM.colShiftTime,
    group: "",
  },
  {
    key: "dropShift",
    label: "Drop Shift",
    minWidth: CM.colDropTime,
    group: "",
  },
  { key: "pickupCap", label: "Pickup", minWidth: CM.colNum, group: "Capacity" },
  { key: "dropCap", label: "Drop", minWidth: CM.colNum, group: "Capacity" },
  { key: "isPeakHour", label: "Peak", minWidth: CM.colBool, group: "" },
  {
    key: "isGuardPick",
    label: "Pickup",
    minWidth: CM.colBool,
    group: "Bus Nodal",
  },
  {
    key: "isGuardDrop",
    label: "Drop",
    minWidth: CM.colBool,
    group: "Bus Nodal",
  },
  {
    key: "unsPickAllwd",
    label: "Pickup",
    minWidth: CM.colBool,
    group: "Adhoc",
  },
  { key: "unsDropAllwd", label: "Drop", minWidth: CM.colBool, group: "Adhoc" },
  {
    key: "isSafeReachedMale",
    label: "Male",
    minWidth: CM.colBool,
    group: "Safe Reach",
  },
  {
    key: "isSafeReachedFemale",
    label: "Female",
    minWidth: CM.colBool,
    group: "Safe Reach",
  },
  { key: "avgSpeed", label: "Avg Speed", minWidth: CM.colAvgSpeed, group: "" },
  { key: "actions", label: "Actions", minWidth: CM.colActions, group: "" },
] as const;

export type ColKey = (typeof COLUMNS)[number]["key"];

// backward-compat alias
export const D = {
  CB,
  NumCell,
  DropShiftCell,
  TimeTag,
  EditBtn,
  COLUMNS,
  BAND_CONFIG,
  getTimeBand,
};
export default D;
