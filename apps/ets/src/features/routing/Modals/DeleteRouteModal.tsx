// // src/features/routeManagement/Modals/DeleteRouteModal.tsx
// import React, { useState } from "react";
// import {
//   Trash2,
//   AlertTriangle,
//   XCircle,
//   LogIn,
//   LogOut,
//   Loader2,
//   ShieldAlert,
//   Clock,
// } from "lucide-react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import { useDeleteRoutesMutation } from "../services/RouteManagementApi";

// import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// // ─────────────────────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────────────────────

// interface Shift {
//   shiftId: number;
//   tripType: number;
//   shiftTime?: string;
// }

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   payload: {
//     locCode: number;
//     shifts: Shift[];
//     tripDate: string;
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Error parser  — handles 409, 400 validation, and generic
// // ─────────────────────────────────────────────────────────────────────────────

// interface ParsedError {
//   type: "locked" | "in_progress" | "generic";
//   message: string;
// }

// function parseError(err: unknown): ParsedError {
//   if (!err || typeof err !== "object") {
//     return { type: "generic", message: "Delete failed. Please try again." };
//   }

//   const e = err as { status?: number; data?: Record<string, unknown> };
//   const data = e.data ?? {};
//   const status = e.status;

//   // 409 — trips in progress
//   if (status === 409) {
//     return {
//       type: "in_progress",
//       message:
//         (data.title as string) ??
//         "Cannot delete routing — one or more trips are already in progress.",
//     };
//   }

//   // 400 — shift locked
//   if (status === 400) {
//     const errors = data.errors as Record<string, string[]> | undefined;
//     const lockedMsg = errors?.["ShiftLockedForDelete.ShiftWiseRouting"]?.[0];
//     if (lockedMsg) {
//       return { type: "locked", message: lockedMsg };
//     }
//     return {
//       type: "generic",
//       message: (data.title as string) ?? "Validation error. Please try again.",
//     };
//   }

//   return {
//     type: "generic",
//     message: (data.title as string) ?? "Delete failed. Please try again.",
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Error banner — icon + message varies by type
// // ─────────────────────────────────────────────────────────────────────────────

// const ErrorBanner: React.FC<{ parsed: ParsedError }> = ({ parsed }) => {
//   const cfg = {
//     in_progress: {
//       bg: "#FEF2F2",
//       border: "#FECACA",
//       color: "#991B1B",
//       icon: (
//         <XCircle
//           size={15}
//           strokeWidth={2}
//           style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
//         />
//       ),
//     },
//     locked: {
//       bg: "#FFFBEB",
//       border: "#FDE68A",
//       color: "#92400E",
//       icon: (
//         <Clock
//           size={15}
//           strokeWidth={2}
//           style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}
//         />
//       ),
//     },
//     generic: {
//       bg: "#FEF2F2",
//       border: "#FECACA",
//       color: "#991B1B",
//       icon: (
//         <ShieldAlert
//           size={15}
//           strokeWidth={2}
//           style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
//         />
//       ),
//     },
//   }[parsed.type];

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "flex-start",
//         gap: 10,
//         padding: "10px 14px",
//         background: cfg.bg,
//         border: `1px solid ${cfg.border}`,
//         borderRadius: 8,
//         marginTop: 4,
//       }}
//     >
//       {cfg.icon}
//       <div style={{ fontSize: 12, color: cfg.color, lineHeight: 1.5 }}>
//         {parsed.type === "locked" && (
//           <div style={{ fontWeight: 700, marginBottom: 2 }}>
//             Shift is locked
//           </div>
//         )}
//         {parsed.type === "in_progress" && (
//           <div style={{ fontWeight: 700, marginBottom: 2 }}>
//             Trips in progress
//           </div>
//         )}
//         {parsed.message}
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Main modal
// // ─────────────────────────────────────────────────────────────────────────────

// export const DeleteRouteModal: React.FC<Props> = ({
//   open,
//   onClose,
//   payload,
// }) => {
//   const { Modal } = useUILibrary();

//   const isMobile = useIsMobile();

//   const [deleteRoutes, { isLoading }] = useDeleteRoutesMutation();
//   const [error, setError] = useState<ParsedError | null>(null);

//   const handleClose = () => {
//     setError(null);
//     onClose();
//   };

//   const handleDelete = async () => {
//     setError(null);
//     try {
//       await deleteRoutes({
//         locCode: payload.locCode,
//         shiftId: payload.shifts[0].shiftId,
//         tripType: payload.shifts[0].tripType,
//         tripDate: payload.tripDate,
//       }).unwrap();
//       handleClose();
//     } catch (err) {
//       setError(parseError(err));
//     }
//   };

//   const count = payload.shifts.length;

//   return (
//     <Modal
//       open={open}
//       onCancel={handleClose}
//       footer={null}
//       width={isMobile ? "95vw" : 500}
//       destroyOnClose
//       styles={{
//         content: { borderRadius: 16, padding: 0, overflow: "hidden" },
//         header: { padding: "20px 24px 0", marginBottom: 0 },
//         body: { padding: isMobile ? "12px 14px 16px" : "16px 24px 24px" },
//       }}
//       title={
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <div
//             style={{
//               width: 38,
//               height: 38,
//               borderRadius: 10,
//               background: "#FEF2F2",
//               border: "1px solid #FECACA",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#DC2626",
//               flexShrink: 0,
//             }}
//           >
//             <Trash2 size={17} strokeWidth={1.8} />
//           </div>
//           <div>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 700,
//                 color: "#0F172A",
//                 letterSpacing: "-0.01em",
//               }}
//             >
//               Delete Route{count > 1 ? "s" : ""}
//             </div>
//             <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
//               {[
//                 payload.tripDate,
//                 `${count} Shift${count !== 1 ? "s" : ""}`,
//               ].map((label) => (
//                 <span
//                   key={label}
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 500,
//                     color: "#64748B",
//                     background: "#F8FAFC",
//                     border: "1px solid #E2E8F0",
//                     borderRadius: 5,
//                     padding: "1px 8px",
//                   }}
//                 >
//                   {label}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </div>
//       }
//     >
//       <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//         {/* Warning */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-start",
//             gap: 10,
//             padding: "10px 14px",
//             background: "#FFFBEB",
//             border: "1px solid #FDE68A",
//             borderRadius: 8,
//           }}
//         >
//           <AlertTriangle
//             size={15}
//             strokeWidth={2}
//             style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}
//           />
//           <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
//             This will <strong>permanently delete</strong> all generated routes
//             for the selected shift{count !== 1 ? "s" : ""}. This action{" "}
//             <strong>cannot be undone</strong>.
//           </div>
//         </div>

//         {/* Shift list */}
//         <div>
//           <div
//             style={{
//               paddingBottom: 8,
//               marginBottom: 10,
//               borderBottom: "1px solid #F1F5F9",
//               fontSize: 11,
//               fontWeight: 700,
//               color: "#64748B",
//               textTransform: "uppercase",
//               letterSpacing: "0.07em",
//             }}
//           >
//             Shifts to be deleted
//           </div>

//           <div
//             style={{
//               border: "1px solid #E5E7EB",
//               borderRadius: 10,
//               overflow: "hidden",
//             }}
//           >
//             {/* Header */}
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: isMobile
//                   ? "60px 1fr 80px"
//                   : "60px 80px 1fr 100px",
//                 padding: isMobile ? "7px 12px" : "7px 14px",
//                 background: "#F1F5F9",
//                 borderBottom: "1px solid #E2E8F0",
//                 fontSize: 10,
//                 fontWeight: 700,
//                 color: "#64748B",
//                 letterSpacing: "0.05em",
//                 textTransform: "uppercase",
//                 gap: 4,
//               }}
//             >
//               <div>Shift</div>
//               {!isMobile && <div>Time</div>}
//               <div>Type</div>
//               <div style={{ textAlign: "right" }}>Action</div>
//             </div>

//             {/* Rows */}
//             {payload.shifts.map((s, i) => {
//               const isLogin = s.tripType === 1;
//               return (
//                 <div
//                   key={i}
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "60px 80px 1fr 100px",
//                     alignItems: "center",
//                     padding: "9px 14px",
//                     borderBottom:
//                       i !== payload.shifts.length - 1
//                         ? "1px solid #F8FAFC"
//                         : "none",
//                     background: i % 2 === 0 ? "#fff" : "#FAFAFA",
//                     fontSize: 12,
//                     gap: 4,
//                   }}
//                 >
//                   <div style={{ fontWeight: 600, color: "#475569" }}>
//                     #{s.shiftId}
//                   </div>
//                   <div style={{ fontWeight: 700, color: "#0F172A" }}>
//                     {s.shiftTime ?? "—"}
//                   </div>
//                   <div>
//                     <span
//                       style={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         gap: 4,
//                         padding: "2px 8px",
//                         borderRadius: 999,
//                         fontSize: 11,
//                         fontWeight: 600,
//                         background: isLogin ? "#EFF6FF" : "#FFF7ED",
//                         color: isLogin ? "#1D4ED8" : "#C2410C",
//                       }}
//                     >
//                       {isLogin ? (
//                         <LogIn size={10} strokeWidth={2.5} />
//                       ) : (
//                         <LogOut size={10} strokeWidth={2.5} />
//                       )}
//                       {isLogin ? "Login" : "Logout"}
//                     </span>
//                   </div>

//                   <div style={{ textAlign: "right" }}>
//                     <span
//                       style={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         gap: 4,
//                         padding: "2px 8px",
//                         borderRadius: 999,
//                         fontSize: 10,
//                         fontWeight: 700,
//                         background: "#FEE2E2",
//                         color: "#DC2626",
//                       }}
//                     >
//                       <Trash2 size={9} strokeWidth={2.5} />
//                       Delete
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* API error */}
//         {error && <ErrorBanner parsed={error} />}

//         {/* Footer */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             alignItems: "center",
//             gap: 8,
//             paddingTop: 4,
//             borderTop: "1px solid #F1F5F9",
//           }}
//         >
//           <button
//             onClick={handleClose}
//             disabled={isLoading}
//             style={{
//               padding: "8px 18px",
//               borderRadius: 8,
//               border: "1px solid #E2E8F0",
//               background: "#fff",
//               color: "#374151",
//               fontSize: 12,
//               fontWeight: 600,
//               cursor: isLoading ? "not-allowed" : "pointer",
//               opacity: isLoading ? 0.5 : 1,
//             }}
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleDelete}
//             disabled={isLoading}
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 7,
//               padding: "8px 22px",
//               borderRadius: 8,
//               border: "none",
//               background: isLoading ? "#FCA5A5" : "#DC2626",
//               color: "#fff",
//               fontSize: 12,
//               fontWeight: 700,
//               cursor: isLoading ? "not-allowed" : "pointer",
//               minWidth: 140,
//               justifyContent: "center",
//               transition: "background 0.15s",
//             }}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2
//                   size={13}
//                   strokeWidth={2.5}
//                   style={{ animation: "spin 0.8s linear infinite" }}
//                 />
//                 Deleting…
//               </>
//             ) : (
//               <>
//                 <Trash2 size={13} strokeWidth={2.5} />
//                 Delete {count} Route{count !== 1 ? "s" : ""}
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// src/features/routeManagement/Modals/DeleteRouteModal.tsx
import React, { useState } from "react";
import {
  Trash2,
  AlertTriangle,
  XCircle,
  LogIn,
  LogOut,
  Loader2,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useDeleteRoutesMutation } from "../services/RouteManagementApi";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Shift {
  shiftId: number;
  tripType: number;
  shiftTime?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  payload: {
    locCode: number;
    shifts: Shift[];
    tripDate: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error parser  — handles 409, 400 validation, and generic
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedError {
  type: "locked" | "in_progress" | "generic";
  message: string;
}

function parseError(err: unknown): ParsedError {
  if (!err || typeof err !== "object") {
    return { type: "generic", message: "Delete failed. Please try again." };
  }

  const e = err as { status?: number; data?: Record<string, unknown> };
  const data = e.data ?? {};
  const status = e.status;

  // 409 — trips in progress
  if (status === 409) {
    return {
      type: "in_progress",
      message:
        (data.title as string) ??
        "Cannot delete routing — one or more trips are already in progress.",
    };
  }

  // 400 — shift locked
  if (status === 400) {
    const errors = data.errors as Record<string, string[]> | undefined;
    const lockedMsg = errors?.["ShiftLockedForDelete.ShiftWiseRouting"]?.[0];
    if (lockedMsg) {
      return { type: "locked", message: lockedMsg };
    }
    return {
      type: "generic",
      message: (data.title as string) ?? "Validation error. Please try again.",
    };
  }

  return {
    type: "generic",
    message: (data.title as string) ?? "Delete failed. Please try again.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error banner — icon + message varies by type
// ─────────────────────────────────────────────────────────────────────────────

const ErrorBanner: React.FC<{ parsed: ParsedError }> = ({ parsed }) => {
  const cfg = {
    in_progress: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: (
        <XCircle
          size={15}
          strokeWidth={2}
          style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
        />
      ),
    },
    locked: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      color: "#92400E",
      icon: (
        <Clock
          size={15}
          strokeWidth={2}
          style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}
        />
      ),
    },
    generic: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: (
        <ShieldAlert
          size={15}
          strokeWidth={2}
          style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
        />
      ),
    },
  }[parsed.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 14px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 8,
        marginTop: 4,
      }}
    >
      {cfg.icon}
      <div style={{ fontSize: 12, color: cfg.color, lineHeight: 1.5 }}>
        {parsed.type === "locked" && (
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            Shift is locked
          </div>
        )}
        {parsed.type === "in_progress" && (
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            Trips in progress
          </div>
        )}
        {parsed.message}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const DeleteRouteModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
}) => {
  const { Modal } = useUILibrary();
  const isMobile = useIsMobile();
  const [deleteRoutes, { isLoading }] = useDeleteRoutesMutation();
  const [error, setError] = useState<ParsedError | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteRoutes({
        locCode: payload.locCode,
        shiftId: payload.shifts[0].shiftId,
        tripType: payload.shifts[0].tripType,
        tripDate: payload.tripDate,
      }).unwrap();
      handleClose();
    } catch (err) {
      setError(parseError(err));
    }
  };

  const count = payload.shifts.length;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={isMobile ? "95vw" : 500}
      destroyOnClose
      styles={{
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px 0", marginBottom: 0 },
        body: { padding: isMobile ? "12px 14px 16px" : "16px 24px 24px" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#DC2626",
              flexShrink: 0,
            }}
          >
            <Trash2 size={17} strokeWidth={1.8} />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0F172A",
                letterSpacing: "-0.01em",
              }}
            >
              Delete Route{count > 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
              {[
                payload.tripDate,
                `${count} Shift${count !== 1 ? "s" : ""}`,
              ].map((label) => (
                <span
                  key={label}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#64748B",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 5,
                    padding: "1px 8px",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Warning */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 14px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: 8,
          }}
        >
          <AlertTriangle
            size={15}
            strokeWidth={2}
            style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
            This will <strong>permanently delete</strong> all generated routes
            for the selected shift{count !== 1 ? "s" : ""}. This action{" "}
            <strong>cannot be undone</strong>.
          </div>
        </div>

        {/* Shift list */}
        <div>
          <div
            style={{
              paddingBottom: 8,
              marginBottom: 10,
              borderBottom: "1px solid #F1F5F9",
              fontSize: 11,
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Shifts to be deleted
          </div>

          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Header — mobile merges Shift+Time into one col */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "60px 1fr 80px"
                  : "60px 80px 1fr 100px",
                padding: isMobile ? "7px 12px" : "7px 14px",
                background: "#F1F5F9",
                borderBottom: "1px solid #E2E8F0",
                fontSize: 10,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                gap: 4,
              }}
            >
              <div>Shift</div>
              {!isMobile && <div>Time</div>}
              <div>Type</div>
              <div style={{ textAlign: "right" }}>Action</div>
            </div>

            {/* Rows */}
            {payload.shifts.map((s, i) => {
              const isLogin = s.tripType === 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "60px 1fr 80px"
                      : "60px 80px 1fr 100px",
                    alignItems: "center",
                    padding: isMobile ? "9px 12px" : "9px 14px",
                    borderBottom:
                      i !== payload.shifts.length - 1
                        ? "1px solid #F8FAFC"
                        : "none",
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    fontSize: 12,
                    gap: 4,
                  }}
                >
                  {/* Mobile: Shift ID + time stacked. Desktop: separate cols */}
                  <div>
                    <div style={{ fontWeight: 600, color: "#475569" }}>
                      #{s.shiftId}
                    </div>
                    {isMobile && (
                      <div
                        style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}
                      >
                        {s.shiftTime ?? "—"}
                      </div>
                    )}
                  </div>
                  {!isMobile && (
                    <div style={{ fontWeight: 700, color: "#0F172A" }}>
                      {s.shiftTime ?? "—"}
                    </div>
                  )}
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: isLogin ? "#EFF6FF" : "#FFF7ED",
                        color: isLogin ? "#1D4ED8" : "#C2410C",
                      }}
                    >
                      {isLogin ? (
                        <LogIn size={10} strokeWidth={2.5} />
                      ) : (
                        <LogOut size={10} strokeWidth={2.5} />
                      )}
                      {isLogin ? "Login" : "Logout"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#FEE2E2",
                        color: "#DC2626",
                      }}
                    >
                      <Trash2 size={9} strokeWidth={2.5} />
                      Delete
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API error */}
        {error && <ErrorBanner parsed={error} />}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "flex-end",
            alignItems: isMobile ? "stretch" : "center",
            gap: 8,
            paddingTop: 4,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 22px",
              borderRadius: 8,
              border: "none",
              background: isLoading ? "#FCA5A5" : "#DC2626",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              minWidth: 140,
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            {isLoading ? (
              <>
                <Loader2
                  size={13}
                  strokeWidth={2.5}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={13} strokeWidth={2.5} />
                Delete {count} Route{count !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
