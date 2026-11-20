// // ─── components/DragLogPanel.tsx ─────────────────────────────────────────────
// // Floating dark terminal panel that displays the drag-and-drop activity log.
// // Toggled by the "D&D Log" button in RouteStackPanel header.
// // Positioned fixed bottom-right; does not scroll the page behind it.

// import type { DragLogEntry } from "../hooks/useDragAndDrop";

// interface Props {
//   logs: DragLogEntry[];
//   onClear: () => void;
//   onClose: () => void;
// }

// // Colour per action type (matches console badge colours)
// const ACTION_COLOR: Record<string, string> = {
//   START: "#F59E0B",
//   DROP: "#10B981",
//   CANCEL: "#EF4444",
//   SAME_VEHICLE: "#6B7280",
// };

// // Human-readable action label
// const ACTION_LABEL: Record<string, string> = {
//   START: "DRAG START",
//   DROP: "DROPPED ✓",
//   CANCEL: "CANCELLED",
//   SAME_VEHICLE: "SAME VEH.",
// };

// export default function DragLogPanel({ logs, onClear, onClose }: Props) {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         bottom: 16,
//         right: 16,
//         zIndex: 200,
//         width: 400,
//         maxHeight: 360,
//         background: "#0f172a",
//         borderRadius: 10,
//         border: "1px solid #1e293b",
//         display: "flex",
//         flexDirection: "column",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
//         fontFamily: 'ui-monospace, "Courier New", monospace',
//       }}
//     >
//       {/* ── Header ── */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "10px 14px 8px",
//           borderBottom: "1px solid #1e293b",
//           flexShrink: 0,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           {/* live indicator */}
//           <span
//             style={{
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               background: "#10B981",
//               display: "inline-block",
//               boxShadow: "0 0 6px #10B981",
//             }}
//           />
//           <span
//             style={{
//               color: "#94a3b8",
//               fontSize: 11,
//               fontWeight: 700,
//               letterSpacing: "0.08em",
//             }}
//           >
//             DRAG &amp; DROP LOG
//           </span>
//           <span
//             style={{
//               background: "#1e293b",
//               color: "#64748b",
//               fontSize: 10,
//               padding: "1px 7px",
//               borderRadius: 10,
//             }}
//           >
//             {logs.length}
//           </span>
//         </div>

//         <div style={{ display: "flex", gap: 6 }}>
//           <button
//             onClick={onClear}
//             style={{
//               background: "none",
//               border: "1px solid #334155",
//               color: "#64748b",
//               fontSize: 10,
//               padding: "2px 8px",
//               borderRadius: 4,
//               cursor: "pointer",
//             }}
//           >
//             Clear
//           </button>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "1px solid #334155",
//               color: "#64748b",
//               fontSize: 12,
//               padding: "2px 8px",
//               borderRadius: 4,
//               cursor: "pointer",
//             }}
//           >
//             ✕
//           </button>
//         </div>
//       </div>

//       {/* ── Help hint (shows when empty) ── */}
//       {logs.length === 0 && (
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//             gap: 6,
//             color: "#334155",
//             fontSize: 11,
//             padding: "24px 16px",
//             textAlign: "center",
//           }}
//         >
//           <span style={{ fontSize: 24 }}>⟵⟶</span>
//           <span>No drag events yet.</span>
//           <span style={{ color: "#1e293b" }}>
//             Grab a passenger row from the left sidebar and drop it onto a cab
//             group or route card.
//           </span>
//         </div>
//       )}

//       {/* ── Log entries ── */}
//       {logs.length > 0 && (
//         <div style={{ flex: 1, overflowY: "auto" }}>
//           {logs.map((log, i) => {
//             const acColor = ACTION_COLOR[log.action] ?? "#64748b";
//             const isFirst = i === 0;
//             return (
//               <div
//                 key={log.id}
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "52px 78px 1fr",
//                   gap: "0 8px",
//                   padding: "7px 14px",
//                   borderBottom: "1px solid #0f172a",
//                   background: isFirst ? "#0d1f38" : "transparent",
//                   alignItems: "start",
//                 }}
//               >
//                 {/* timestamp */}
//                 <span
//                   style={{ color: "#475569", fontSize: 9.5, paddingTop: 1 }}
//                 >
//                   {log.timestamp}
//                 </span>

//                 {/* action badge */}
//                 <span
//                   style={{
//                     fontSize: 9,
//                     fontWeight: 700,
//                     color: acColor,
//                     background: `${acColor}18`,
//                     padding: "2px 5px",
//                     borderRadius: 3,
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {ACTION_LABEL[log.action] ?? log.action}
//                 </span>

//                 {/* details */}
//                 <div>
//                   <div
//                     style={{
//                       color: "#e2e8f0",
//                       fontSize: 10.5,
//                       lineHeight: 1.4,
//                     }}
//                   >
//                     {log.passengerName}
//                     <span style={{ color: "#64748b" }}>
//                       {" "}
//                       · {log.employeeId}
//                     </span>
//                   </div>
//                   <div style={{ color: "#64748b", fontSize: 10, marginTop: 1 }}>
//                     V#{log.fromVehicle}
//                     {log.toVehicle !== null && (
//                       <span>
//                         <span style={{ color: "#334155" }}> → </span>
//                         <span style={{ color: acColor }}>
//                           V#{log.toVehicle}
//                         </span>
//                         <span style={{ color: "#334155" }}>
//                           {" "}
//                           ({log.toType})
//                         </span>
//                       </span>
//                     )}
//                   </div>
//                   <div
//                     style={{ color: "#334155", fontSize: 9.5, marginTop: 2 }}
//                   >
//                     {log.note}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── Footer tip ── */}
//       <div
//         style={{
//           padding: "6px 14px",
//           borderTop: "1px solid #1e293b",
//           color: "#334155",
//           fontSize: 9.5,
//           flexShrink: 0,
//         }}
//       >
//         All events also logged to browser DevTools → Console (grouped by action)
//       </div>
//     </div>
//   );
// }

// ─── components/DragLogPanel.tsx ──────────────────────────────────────────────
// Slide-in activity feed for drag-and-drop events.
//
// FIX: entries prop now defaults to [] — previously crashed with
//      "Cannot read properties of undefined (reading 'length')" at line 91
//      because RouteMakerPage was passing dd.logEntries (nonexistent field).

import { T } from "../constants/designTokens";
import type { DragLogEntry, DragAction } from "../hooks/useDragAndDrop";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  entries?: DragLogEntry[]; // ← optional with default [] prevents crash
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTION_LABEL: Record<DragAction, string> = {
  START: "Drag started",
  DROP: "Moved",
  CANCEL: "Cancelled",
  SAME_VEHICLE: "Same vehicle",
};

const ACTION_COLOR: Record<DragAction, string> = {
  START: T.info ?? "#2563EB",
  DROP: T.success,
  CANCEL: T.danger,
  SAME_VEHICLE: T.warn,
};

const ACTION_BG: Record<DragAction, string> = {
  START: T.infoBg ?? "#DBEAFE",
  DROP: T.successBg,
  CANCEL: T.dangerBg,
  SAME_VEHICLE: T.warnBg,
};

// ---------------------------------------------------------------------------
// LogRow
// ---------------------------------------------------------------------------

function LogRow({ entry }: { entry: DragLogEntry }) {
  const color = ACTION_COLOR[entry.action];
  const bg = ACTION_BG[entry.action];

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 14px",
        borderBottom: `1px solid ${T.border}`,
        alignItems: "flex-start",
      }}
    >
      {/* Badge */}
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color,
          background: bg,
          border: `1px solid ${color}44`,
          borderRadius: T.radiusSm,
          padding: "2px 6px",
          marginTop: 1,
          whiteSpace: "nowrap",
        }}
      >
        {ACTION_LABEL[entry.action]}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.passengerName}
          <span style={{ color: T.muted, fontWeight: 400, marginLeft: 5 }}>
            {entry.employeeId}
          </span>
        </div>

        {entry.toVehicle !== null ? (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            Vehicle #{entry.fromVehicle}
            <span style={{ margin: "0 4px", color: T.text }}>→</span>
            Vehicle #{entry.toVehicle}
            {entry.toType && (
              <span style={{ marginLeft: 5, color: T.text }}>
                ({entry.toType === "CAB_GROUP" ? "Cab" : "Route"})
              </span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {entry.note}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          color: T.text,
          marginTop: 2,
          whiteSpace: "nowrap",
        }}
      >
        {entry.timestamp}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DragLogPanel
// ---------------------------------------------------------------------------

export default function DragLogPanel({ entries = [], onClose }: Props) {
  // Guard: entries is safely defaulted to [] above, but add one more layer
  const safeEntries = Array.isArray(entries) ? entries : [];

  const successCount = safeEntries.filter((e) => e.action === "DROP").length;
  const cancelCount = safeEntries.filter((e) => e.action === "CANCEL").length;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: 380,
        maxHeight: "60vh",
        zIndex: 999,
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusLg,
        boxShadow: T.shadowXl ?? T.shadowLg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          background: T.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Move Log
          </span>
          <span
            style={{
              fontSize: 11,
              color: T.muted,
              background: T.border,
              borderRadius: T.radiusSm,
              padding: "1px 7px",
            }}
          >
            {safeEntries.length} events
          </span>
          {successCount > 0 && (
            <span
              style={{
                fontSize: 11,
                color: T.success,
                background: T.successBg,
                borderRadius: T.radiusSm,
                padding: "1px 7px",
                fontWeight: 600,
              }}
            >
              {successCount} moved
            </span>
          )}
          {cancelCount > 0 && (
            <span
              style={{
                fontSize: 11,
                color: T.danger,
                background: T.dangerBg,
                borderRadius: T.radiusSm,
                padding: "1px 7px",
                fontWeight: 600,
              }}
            >
              {cancelCount} cancelled
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          title="Close log"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.muted,
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: T.radiusSm,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {safeEntries.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: T.text,
              fontSize: 13,
            }}
          >
            No moves yet
          </div>
        ) : (
          safeEntries.map((entry) => <LogRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
