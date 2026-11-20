// import React, { useState } from "react";
// import {
//   Route,
//   CheckCircle2,
//   XCircle,
//   AlertTriangle,
//   Loader2,
//   LogIn,
//   LogOut,
// } from "lucide-react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import { useBulkGenerateRoutesMutation } from "../services/RouteManagementApi";
// import type { RoutePlanningRow } from "../types/RouteTypes";

// // ─────────────────────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────────────────────

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   tripDate: string;
//   locCode: number;
//   rows: RoutePlanningRow[];
// }

// interface ShiftResult {
//   shiftId: number;
//   tripType: number;
//   success: boolean;
//   message: string;
//   tripsCreated: number;
//   paxRouted: number;
// }

// interface GenerateResult {
//   totalShifts: number;
//   successCount: number;
//   failedCount: number;
//   totalTripsCreated: number;
//   totalPaxRouted: number;
//   results: ShiftResult[];
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Spinner keyframe
// // ─────────────────────────────────────────────────────────────────────────────

// const SpinStyle = () => (
//   <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// function formatDate(d: string) {
//   try {
//     return new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return d;
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Section divider (same as other modals)
// // ─────────────────────────────────────────────────────────────────────────────

// const Section: React.FC<{ label: string }> = ({ label }) => (
//   <div
//     style={{
//       paddingBottom: 8,
//       marginBottom: 10,
//       borderBottom: "1px solid #F1F5F9",
//     }}
//   >
//     <span
//       style={{
//         fontSize: 11,
//         fontWeight: 700,
//         color: "#64748B",
//         textTransform: "uppercase",
//         letterSpacing: "0.07em",
//       }}
//     >
//       {label}
//     </span>
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Shift row
// // ─────────────────────────────────────────────────────────────────────────────

// const ShiftRow: React.FC<{ row: RoutePlanningRow; idx: number }> = ({
//   row,
//   idx,
// }) => {
//   const isLogin = row.loginType === "Login";
//   const generated = row.isRouteGenerated;

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "64px 56px 90px 1fr 80px 100px",
//         alignItems: "center",
//         padding: "9px 14px",
//         borderBottom: "1px solid #F8FAFC",
//         background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
//         fontSize: 12,
//         gap: 4,
//       }}
//     >
//       {/* Shift ID */}
//       <div style={{ fontWeight: 600, color: "#475569" }}>#{row.shiftId}</div>

//       {/* Time */}
//       <div style={{ fontWeight: 700, color: "#0F172A" }}>{row.shiftTime}</div>

//       {/* Type */}
//       <div>
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             padding: "2px 8px",
//             borderRadius: 999,
//             fontSize: 11,
//             fontWeight: 600,
//             background: isLogin ? "#EFF6FF" : "#FFF7ED",
//             color: isLogin ? "#1D4ED8" : "#C2410C",
//           }}
//         >
//           {isLogin ? (
//             <LogIn size={10} strokeWidth={2.5} />
//           ) : (
//             <LogOut size={10} strokeWidth={2.5} />
//           )}
//           {row.loginType}
//         </span>
//       </div>

//       {/* Employees */}
//       <div style={{ color: "#64748B", fontSize: 11 }}>
//         <span style={{ fontWeight: 700, color: "#0F766E", fontSize: 13 }}>
//           {row.employeeCount}
//         </span>{" "}
//         emp
//       </div>

//       {/* V/V/R */}
//       <div
//         style={{
//           fontSize: 10,
//           color: "#94A3B8",
//           fontFamily: "monospace",
//           textAlign: "right",
//         }}
//       >
//         {row.vehicleVendorRouteText}
//       </div>

//       {/* Status */}
//       <div style={{ textAlign: "right" }}>
//         {generated ? (
//           <span
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 4,
//               padding: "2px 8px",
//               borderRadius: 999,
//               fontSize: 10,
//               fontWeight: 700,
//               background: "#DCFCE7",
//               color: "#15803D",
//               border: "1px solid #86EFAC",
//             }}
//           >
//             <CheckCircle2 size={9} strokeWidth={2.5} />
//             Done · Skip
//           </span>
//         ) : (
//           <span
//             style={{
//               padding: "2px 8px",
//               borderRadius: 999,
//               fontSize: 10,
//               fontWeight: 700,
//               background: "#F1F5F9",
//               color: "#475569",
//             }}
//           >
//             Pending
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Result row (shown after generation)
// // ─────────────────────────────────────────────────────────────────────────────

// const ResultRow: React.FC<{ r: ShiftResult; idx: number }> = ({ r, idx }) => (
//   <div
//     style={{
//       display: "grid",
//       gridTemplateColumns: "64px 90px 1fr 80px",
//       alignItems: "center",
//       padding: "9px 14px",
//       borderBottom: "1px solid #F8FAFC",
//       background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
//       fontSize: 12,
//       gap: 4,
//     }}
//   >
//     <div style={{ fontWeight: 600, color: "#475569" }}>#{r.shiftId}</div>
//     <div>
//       {r.success ? (
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             padding: "2px 8px",
//             borderRadius: 999,
//             fontSize: 10,
//             fontWeight: 700,
//             background: "#DCFCE7",
//             color: "#15803D",
//           }}
//         >
//           <CheckCircle2 size={10} strokeWidth={2.5} /> Success
//         </span>
//       ) : (
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             padding: "2px 8px",
//             borderRadius: 999,
//             fontSize: 10,
//             fontWeight: 700,
//             background: "#FEE2E2",
//             color: "#DC2626",
//           }}
//         >
//           <XCircle size={10} strokeWidth={2.5} /> Failed
//         </span>
//       )}
//     </div>
//     <div style={{ fontSize: 11, color: "#64748B" }}>{r.message}</div>
//     <div
//       style={{
//         textAlign: "right",
//         fontSize: 11,
//         color: "#0F766E",
//         fontWeight: 600,
//       }}
//     >
//       {r.tripsCreated} trip{r.tripsCreated !== 1 ? "s" : ""} · {r.paxRouted} emp
//     </div>
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Main modal
// // ─────────────────────────────────────────────────────────────────────────────

// export const GenerateRoutesModal: React.FC<Props> = ({
//   open,
//   onClose,
//   tripDate,
//   locCode,
//   rows,
// }) => {
//   const { Modal } = useUILibrary();
//   const [bulkGenerate, { isLoading, isError, error }] =
//     useBulkGenerateRoutesMutation();
//   const [result, setResult] = useState<GenerateResult | null>(null);

//   const alreadyGenerated = rows.filter((r) => r.isRouteGenerated);
//   const pending = rows.filter((r) => !r.isRouteGenerated);
//   const loginCount = rows.filter((r) => r.loginType === "Login").length;
//   const logoutCount = rows.filter((r) => r.loginType === "Logout").length;

//   const handleGenerate = async () => {
//     if (!pending.length) return; // only send shifts that need generation
//     try {
//       const res = await bulkGenerate({
//         locCode,
//         tripDate,
//         shifts: pending.map((r) => ({
//           // ← pending only, never already-generated
//           shiftId: r.shiftId,
//           tripType: r.loginType === "Login" ? 1 : 2,
//         })),
//       }).unwrap();
//       setResult(res as unknown as GenerateResult);
//     } catch {
//       // isError + error from RTK handles display
//     }
//   };

//   const handleClose = () => {
//     setResult(null);
//     onClose();
//   };

//   // ── error message ──────────────────────────────────────────────────────────
//   const errorMsg = (() => {
//     if (!isError || !error) return null;
//     if ("data" in error) {
//       const d = error.data as Record<string, unknown>;
//       return (d?.message as string) ?? "Route generation failed.";
//     }
//     return "Route generation failed. Please try again.";
//   })();

//   return (
//     <Modal
//       open={open}
//       onCancel={handleClose}
//       footer={null}
//       width={620}
//       destroyOnClose
//       styles={{
//         content: { borderRadius: 16, padding: 0, overflow: "hidden" },
//         header: { padding: "20px 24px 0", marginBottom: 0 },
//         body: { padding: "16px 24px 24px" },
//       }}
//       title={
//         <div>
//           <SpinStyle />
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div
//               style={{
//                 width: 38,
//                 height: 38,
//                 borderRadius: 10,
//                 background: "#F0FDF4",
//                 border: "1px solid #BBF7D0",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "#16A34A",
//                 flexShrink: 0,
//               }}
//             >
//               <Route size={18} strokeWidth={1.8} />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: 15,
//                   fontWeight: 700,
//                   color: "#0F172A",
//                   letterSpacing: "-0.01em",
//                 }}
//               >
//                 {result ? "Generation Results" : "Generate Routes"}
//               </div>
//               <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
//                 {[
//                   formatDate(tripDate),
//                   `${rows.length} Shift${rows.length !== 1 ? "s" : ""}`,
//                   ...(loginCount ? [`${loginCount} Login`] : []),
//                   ...(logoutCount ? [`${logoutCount} Logout`] : []),
//                 ].map((label) => (
//                   <span
//                     key={label}
//                     style={{
//                       fontSize: 11,
//                       fontWeight: 500,
//                       color: "#64748B",
//                       background: "#F8FAFC",
//                       border: "1px solid #E2E8F0",
//                       borderRadius: 5,
//                       padding: "1px 8px",
//                     }}
//                   >
//                     {label}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       }
//     >
//       {/* ══════════════ RESULT VIEW ══════════════ */}
//       {result ? (
//         <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//           {/* Summary stats */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr 1fr",
//               gap: 8,
//             }}
//           >
//             {[
//               {
//                 label: "Total Shifts",
//                 value: result.totalShifts,
//                 color: "#0F172A",
//               },
//               {
//                 label: "Succeeded",
//                 value: result.successCount,
//                 color: "#15803D",
//               },
//               {
//                 label: "Failed",
//                 value: result.failedCount,
//                 color: result.failedCount ? "#DC2626" : "#94A3B8",
//               },
//               {
//                 label: "Trips Created",
//                 value: result.totalTripsCreated,
//                 color: "#0F766E",
//               },
//             ].map(({ label, value, color }) => (
//               <div
//                 key={label}
//                 style={{
//                   background: "#F8FAFC",
//                   border: "1px solid #E2E8F0",
//                   borderRadius: 8,
//                   padding: "10px 12px",
//                   textAlign: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: 10,
//                     color: "#94A3B8",
//                     marginBottom: 3,
//                     textTransform: "uppercase",
//                     letterSpacing: "0.06em",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {label}
//                 </div>
//                 <div style={{ fontSize: 20, fontWeight: 800, color }}>
//                   {value}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Per-shift results */}
//           <div>
//             <Section label="Per-shift Results" />
//             <div
//               style={{
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 10,
//                 overflow: "hidden",
//               }}
//             >
//               {/* Table header */}
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "64px 90px 1fr 80px",
//                   padding: "8px 14px",
//                   background: "#F1F5F9",
//                   borderBottom: "1px solid #E2E8F0",
//                   fontSize: 10,
//                   fontWeight: 700,
//                   color: "#64748B",
//                   letterSpacing: "0.05em",
//                   textTransform: "uppercase",
//                   gap: 4,
//                 }}
//               >
//                 <div>Shift</div>
//                 <div>Status</div>
//                 <div>Message</div>
//                 <div style={{ textAlign: "right" }}>Output</div>
//               </div>
//               {result.results.map((r, i) => (
//                 <ResultRow key={r.shiftId} r={r} idx={i} />
//               ))}
//             </div>
//           </div>

//           {/* Footer — done */}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               paddingTop: 14,
//               borderTop: "1px solid #F1F5F9",
//             }}
//           >
//             <button
//               onClick={handleClose}
//               style={{
//                 padding: "8px 28px",
//                 borderRadius: 8,
//                 border: "none",
//                 background: "#0F766E",
//                 color: "#fff",
//                 fontSize: 13,
//                 fontWeight: 700,
//                 cursor: "pointer",
//               }}
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       ) : (
//         /* ══════════════ CONFIRM VIEW ══════════════ */
//         <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//           {/* All-done banner — nothing left to generate */}
//           {pending.length === 0 && alreadyGenerated.length > 0 && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: 10,
//                 padding: "10px 14px",
//                 background: "#F0FDF4",
//                 border: "1px solid #86EFAC",
//                 borderRadius: 8,
//               }}
//             >
//               <CheckCircle2
//                 size={15}
//                 strokeWidth={2}
//                 style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }}
//               />
//               <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
//                 All{" "}
//                 <strong>
//                   {alreadyGenerated.length} shift
//                   {alreadyGenerated.length !== 1 ? "s" : ""}
//                 </strong>{" "}
//                 already have routes generated. There is nothing new to generate.
//               </div>
//             </div>
//           )}

//           {/* Skip notice — some already done, some pending */}
//           {pending.length > 0 && alreadyGenerated.length > 0 && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: 10,
//                 padding: "10px 14px",
//                 background: "#F0FDF4",
//                 border: "1px solid #86EFAC",
//                 borderRadius: 8,
//               }}
//             >
//               <CheckCircle2
//                 size={15}
//                 strokeWidth={2}
//                 style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }}
//               />
//               <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
//                 <strong>
//                   {alreadyGenerated.length} shift
//                   {alreadyGenerated.length !== 1 ? "s" : ""}
//                 </strong>{" "}
//                 already {alreadyGenerated.length === 1 ? "has" : "have"} routes
//                 — <strong>will be skipped</strong>. Only the{" "}
//                 <strong>{pending.length} pending</strong> shift
//                 {pending.length !== 1 ? "s" : ""} will be generated.
//               </div>
//             </div>
//           )}

//           {/* Shift list */}
//           {rows.length > 0 ? (
//             <div>
//               <Section label={`Shifts to process · ${rows.length} selected`} />
//               <div
//                 style={{
//                   border: "1px solid #E5E7EB",
//                   borderRadius: 10,
//                   overflow: "hidden",
//                 }}
//               >
//                 {/* Header */}
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "64px 56px 90px 1fr 80px 100px",
//                     padding: "8px 14px",
//                     background: "#F1F5F9",
//                     borderBottom: "1px solid #E2E8F0",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     color: "#64748B",
//                     letterSpacing: "0.05em",
//                     textTransform: "uppercase",
//                     gap: 4,
//                   }}
//                 >
//                   <div>Shift</div>
//                   <div>Time</div>
//                   <div>Type</div>
//                   <div>Employees</div>
//                   <div style={{ textAlign: "right" }}>V/V/R</div>
//                   <div style={{ textAlign: "right" }}>Action</div>
//                 </div>

//                 {/* Rows */}
//                 {rows.map((row, idx) => (
//                   <ShiftRow key={row.id} row={row} idx={idx} />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 10,
//                 padding: "16px 18px",
//                 background: "#FEF3C7",
//                 border: "1px solid #FCD34D",
//                 borderRadius: 8,
//                 color: "#92400E",
//                 fontSize: 13,
//               }}
//             >
//               <AlertTriangle size={16} strokeWidth={2} />
//               No shifts selected. Please select at least one shift to continue.
//             </div>
//           )}

//           {/* API error */}
//           {isError && errorMsg && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 10,
//                 padding: "10px 14px",
//                 background: "#FEF2F2",
//                 border: "1px solid #FECACA",
//                 borderRadius: 8,
//               }}
//             >
//               <XCircle
//                 size={15}
//                 strokeWidth={2}
//                 style={{ color: "#DC2626", flexShrink: 0 }}
//               />
//               <span style={{ fontSize: 12, color: "#991B1B" }}>{errorMsg}</span>
//             </div>
//           )}

//           {/* Footer */}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               paddingTop: 14,
//               borderTop: "1px solid #F1F5F9",
//             }}
//           >
//             {/* Left hint */}
//             <span style={{ fontSize: 11, color: "#94A3B8" }}>
//               {pending.length} to generate · {alreadyGenerated.length} skipped
//             </span>

//             {/* Buttons */}
//             <div style={{ display: "flex", gap: 8 }}>
//               <button
//                 onClick={handleClose}
//                 disabled={isLoading}
//                 style={{
//                   padding: "8px 18px",
//                   borderRadius: 8,
//                   border: "1px solid #E2E8F0",
//                   background: "#fff",
//                   color: "#374151",
//                   fontSize: 12,
//                   fontWeight: 600,
//                   cursor: isLoading ? "not-allowed" : "pointer",
//                   opacity: isLoading ? 0.5 : 1,
//                 }}
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleGenerate}
//                 disabled={isLoading || pending.length === 0} // ← block when nothing pending
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 7,
//                   padding: "8px 22px",
//                   borderRadius: 8,
//                   border: "none",
//                   background:
//                     isLoading || pending.length === 0 ? "#94A3B8" : "#0F766E",
//                   color: "#fff",
//                   fontSize: 12,
//                   fontWeight: 700,
//                   cursor:
//                     isLoading || pending.length === 0
//                       ? "not-allowed"
//                       : "pointer",
//                   minWidth: 160,
//                   justifyContent: "center",
//                   transition: "background 0.15s",
//                 }}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2
//                       size={13}
//                       strokeWidth={2.5}
//                       style={{ animation: "spin 0.8s linear infinite" }}
//                     />
//                     Generating…
//                   </>
//                 ) : (
//                   <>
//                     <Route size={13} strokeWidth={2.5} />
//                     Generate {pending.length} Shift
//                     {pending.length !== 1 ? "s" : ""}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// };

import React, { useState } from "react";
import {
  Route,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useBulkGenerateRoutesMutation } from "../services/RouteManagementApi";
import type { RoutePlanningRow } from "../types/RouteTypes";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  tripDate: string;
  locCode: number;
  rows: RoutePlanningRow[];
}

interface ShiftResult {
  shiftId: number;
  tripType: number;
  success: boolean;
  message: string;
  tripsCreated: number;
  paxRouted: number;
}

interface GenerateResult {
  totalShifts: number;
  successCount: number;
  failedCount: number;
  totalTripsCreated: number;
  totalPaxRouted: number;
  results: ShiftResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner keyframe
// ─────────────────────────────────────────────────────────────────────────────

const SpinStyle = () => (
  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section divider (same as other modals)
// ─────────────────────────────────────────────────────────────────────────────

const Section: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      paddingBottom: 8,
      marginBottom: 10,
      borderBottom: "1px solid #F1F5F9",
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {label}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shift row
// ─────────────────────────────────────────────────────────────────────────────

const ShiftRow: React.FC<{
  row: RoutePlanningRow;
  idx: number;
  isMobile?: boolean;
}> = ({ row, idx, isMobile }) => {
  const isLogin = row.loginType === "Login";
  const generated = row.isRouteGenerated;

  const typeBadge = (
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
      {row.loginType}
    </span>
  );
  const statusBadge = generated ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        background: "#DCFCE7",
        color: "#15803D",
        border: "1px solid #86EFAC",
      }}
    >
      <CheckCircle2 size={9} strokeWidth={2.5} />
      {isMobile ? "Skip" : "Done · Skip"}
    </span>
  ) : (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        background: "#F1F5F9",
        color: "#475569",
      }}
    >
      Pending
    </span>
  );

  // ── MOBILE: 3-col — Shift+Time stacked | Type+Emp stacked | Status ──────────
  if (isMobile) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr auto",
          alignItems: "center",
          padding: "9px 12px",
          borderBottom: "1px solid #F8FAFC",
          background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
          fontSize: 12,
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: "#475569" }}>
            #{row.shiftId}
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>
            {row.shiftTime}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {typeBadge}
          <span style={{ fontSize: 11, color: "#64748B" }}>
            <span style={{ fontWeight: 700, color: "#0F766E" }}>
              {row.employeeCount}
            </span>{" "}
            emp
          </span>
        </div>
        <div>{statusBadge}</div>
      </div>
    );
  }

  // ── DESKTOP (unchanged) ─────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 56px 90px 1fr 80px 100px",
        alignItems: "center",
        padding: "9px 14px",
        borderBottom: "1px solid #F8FAFC",
        background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
        fontSize: 12,
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 600, color: "#475569" }}>#{row.shiftId}</div>
      <div style={{ fontWeight: 700, color: "#0F172A" }}>{row.shiftTime}</div>
      <div>{typeBadge}</div>
      <div style={{ color: "#64748B", fontSize: 11 }}>
        <span style={{ fontWeight: 700, color: "#0F766E", fontSize: 13 }}>
          {row.employeeCount}
        </span>{" "}
        emp
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#94A3B8",
          fontFamily: "monospace",
          textAlign: "right",
        }}
      >
        {row.vehicleVendorRouteText}
      </div>
      <div style={{ textAlign: "right" }}>{statusBadge}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Result row (shown after generation)
// ─────────────────────────────────────────────────────────────────────────────

const ResultRow: React.FC<{
  r: ShiftResult;
  idx: number;
  isMobile?: boolean;
}> = ({ r, idx, isMobile }) => {
  const statusBadge = r.success ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        background: "#DCFCE7",
        color: "#15803D",
      }}
    >
      <CheckCircle2 size={10} strokeWidth={2.5} /> Success
    </span>
  ) : (
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
      <XCircle size={10} strokeWidth={2.5} /> Failed
    </span>
  );
  const output = `${r.tripsCreated} trip${r.tripsCreated !== 1 ? "s" : ""} · ${r.paxRouted} emp`;

  // ── MOBILE: Output folded under Message ──────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px 76px 1fr",
          alignItems: "center",
          padding: "9px 12px",
          borderBottom: "1px solid #F8FAFC",
          background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
          fontSize: 12,
          gap: 6,
        }}
      >
        <div style={{ fontWeight: 600, color: "#475569" }}>#{r.shiftId}</div>
        <div>{statusBadge}</div>
        <div>
          <div style={{ fontSize: 11, color: "#64748B" }}>{r.message}</div>
          <div
            style={{
              fontSize: 10,
              color: "#0F766E",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {output}
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP (unchanged) ─────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 90px 1fr 80px",
        alignItems: "center",
        padding: "9px 14px",
        borderBottom: "1px solid #F8FAFC",
        background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
        fontSize: 12,
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 600, color: "#475569" }}>#{r.shiftId}</div>
      <div>{statusBadge}</div>
      <div style={{ fontSize: 11, color: "#64748B" }}>{r.message}</div>
      <div
        style={{
          textAlign: "right",
          fontSize: 11,
          color: "#0F766E",
          fontWeight: 600,
        }}
      >
        {output}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const GenerateRoutesModal: React.FC<Props> = ({
  open,
  onClose,
  tripDate,
  locCode,
  rows,
}) => {
  const { Modal } = useUILibrary();
  const isMobile = useIsMobile();
  const [bulkGenerate, { isLoading, isError, error }] =
    useBulkGenerateRoutesMutation();
  const [result, setResult] = useState<GenerateResult | null>(null);

  const alreadyGenerated = rows.filter((r) => r.isRouteGenerated);
  const pending = rows.filter((r) => !r.isRouteGenerated);
  const loginCount = rows.filter((r) => r.loginType === "Login").length;
  const logoutCount = rows.filter((r) => r.loginType === "Logout").length;

  const handleGenerate = async () => {
    if (!pending.length) return; // only send shifts that need generation
    try {
      const res = await bulkGenerate({
        locCode,
        tripDate,
        shifts: pending.map((r) => ({
          // ← pending only, never already-generated
          shiftId: r.shiftId,
          tripType: r.loginType === "Login" ? 1 : 2,
        })),
      }).unwrap();
      setResult(res as unknown as GenerateResult);
    } catch {
      // isError + error from RTK handles display
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  // ── error message ──────────────────────────────────────────────────────────
  const errorMsg = (() => {
    if (!isError || !error) return null;
    if ("data" in error) {
      const d = error.data as Record<string, unknown>;
      return (d?.message as string) ?? "Route generation failed.";
    }
    return "Route generation failed. Please try again.";
  })();

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={isMobile ? "95vw" : 620}
      destroyOnClose
      styles={{
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px 0", marginBottom: 0 },
        body: { padding: isMobile ? "12px 14px 16px" : "16px 24px 24px" },
      }}
      title={
        <div>
          <SpinStyle />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16A34A",
                flexShrink: 0,
              }}
            >
              <Route size={18} strokeWidth={1.8} />
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
                {result ? "Generation Results" : "Generate Routes"}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  marginTop: 4,
                  flexWrap: "wrap",
                }}
              >
                {[
                  formatDate(tripDate),
                  `${rows.length} Shift${rows.length !== 1 ? "s" : ""}`,
                  ...(loginCount ? [`${loginCount} Login`] : []),
                  ...(logoutCount ? [`${logoutCount} Logout`] : []),
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
        </div>
      }
    >
      {/* ══════════════ RESULT VIEW ══════════════ */}
      {result ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary stats — 2×2 on mobile */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              {
                label: "Total Shifts",
                value: result.totalShifts,
                color: "#0F172A",
              },
              {
                label: "Succeeded",
                value: result.successCount,
                color: "#15803D",
              },
              {
                label: "Failed",
                value: result.failedCount,
                color: result.failedCount ? "#DC2626" : "#94A3B8",
              },
              {
                label: "Trips Created",
                value: result.totalTripsCreated,
                color: "#0F766E",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#94A3B8",
                    marginBottom: 3,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Per-shift results */}
          <div>
            <Section label="Per-shift Results" />
            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Table header — matches ResultRow grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "52px 76px 1fr"
                    : "64px 90px 1fr 80px",
                  padding: isMobile ? "8px 12px" : "8px 14px",
                  background: "#F1F5F9",
                  borderBottom: "1px solid #E2E8F0",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#64748B",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  gap: isMobile ? 6 : 4,
                }}
              >
                <div>Shift</div>
                <div>Status</div>
                <div>{isMobile ? "Message / Output" : "Message"}</div>
                {!isMobile && <div style={{ textAlign: "right" }}>Output</div>}
              </div>
              {result.results.map((r, i) => (
                <ResultRow key={r.shiftId} r={r} idx={i} isMobile={isMobile} />
              ))}
            </div>
          </div>

          {/* Footer — done */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: 14,
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                padding: "8px 28px",
                borderRadius: 8,
                border: "none",
                background: "#0F766E",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════ CONFIRM VIEW ══════════════ */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* All-done banner — nothing left to generate */}
          {pending.length === 0 && alreadyGenerated.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 14px",
                background: "#F0FDF4",
                border: "1px solid #86EFAC",
                borderRadius: 8,
              }}
            >
              <CheckCircle2
                size={15}
                strokeWidth={2}
                style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }}
              />
              <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
                All{" "}
                <strong>
                  {alreadyGenerated.length} shift
                  {alreadyGenerated.length !== 1 ? "s" : ""}
                </strong>{" "}
                already have routes generated. There is nothing new to generate.
              </div>
            </div>
          )}

          {/* Skip notice — some already done, some pending */}
          {pending.length > 0 && alreadyGenerated.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 14px",
                background: "#F0FDF4",
                border: "1px solid #86EFAC",
                borderRadius: 8,
              }}
            >
              <CheckCircle2
                size={15}
                strokeWidth={2}
                style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }}
              />
              <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
                <strong>
                  {alreadyGenerated.length} shift
                  {alreadyGenerated.length !== 1 ? "s" : ""}
                </strong>{" "}
                already {alreadyGenerated.length === 1 ? "has" : "have"} routes
                — <strong>will be skipped</strong>. Only the{" "}
                <strong>{pending.length} pending</strong> shift
                {pending.length !== 1 ? "s" : ""} will be generated.
              </div>
            </div>
          )}

          {/* Shift list */}
          {rows.length > 0 ? (
            <div>
              <Section label={`Shifts to process · ${rows.length} selected`} />
              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {/* Header — matches ShiftRow grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "52px 1fr auto"
                      : "64px 56px 90px 1fr 80px 100px",
                    padding: isMobile ? "8px 12px" : "8px 14px",
                    background: "#F1F5F9",
                    borderBottom: "1px solid #E2E8F0",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748B",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    gap: isMobile ? 8 : 4,
                  }}
                >
                  <div>Shift</div>
                  {!isMobile && <div>Time</div>}
                  <div>Type</div>
                  {!isMobile && <div>Employees</div>}
                  {!isMobile && <div style={{ textAlign: "right" }}>V/V/R</div>}
                  <div style={{ textAlign: "right" }}>Action</div>
                </div>

                {/* Rows */}
                {rows.map((row, idx) => (
                  <ShiftRow
                    key={row.id}
                    row={row}
                    idx={idx}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 18px",
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                borderRadius: 8,
                color: "#92400E",
                fontSize: 13,
              }}
            >
              <AlertTriangle size={16} strokeWidth={2} />
              No shifts selected. Please select at least one shift to continue.
            </div>
          )}

          {/* API error */}
          {isError && errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
              }}
            >
              <XCircle
                size={15}
                strokeWidth={2}
                style={{ color: "#DC2626", flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: "#991B1B" }}>{errorMsg}</span>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? 8 : 0,
              paddingTop: 14,
              borderTop: "1px solid #F1F5F9",
            }}
          >
            {/* Hint — hide on mobile to save space */}
            {!isMobile && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {pending.length} to generate · {alreadyGenerated.length} skipped
              </span>
            )}

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexDirection: isMobile ? "column" : "row",
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
                onClick={handleGenerate}
                disabled={isLoading || pending.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 22px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    isLoading || pending.length === 0 ? "#94A3B8" : "#0F766E",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor:
                    isLoading || pending.length === 0
                      ? "not-allowed"
                      : "pointer",
                  minWidth: isMobile ? "unset" : 160,
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
                    Generating…
                  </>
                ) : (
                  <>
                    <Route size={13} strokeWidth={2.5} />
                    Generate {pending.length} Shift
                    {pending.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
