// // src/features/routeManagement/Modals/CopyRoutesModal.tsx
// import React, { useState } from "react";
// import {
//   Copy,
//   LogIn,
//   LogOut,
//   CheckCircle2,
//   XCircle,
//   Loader2,
//   CalendarDays,
//   Truck,
//   ArrowRight,
//   BookOpen,
// } from "lucide-react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import {
//   useGetCopyRouteAnalysisQuery,
//   useReplicateShiftwiseMutation,
// } from "../services/RouteManagementApi";
// import { BaseDateOptionsModal } from "./BaseDateOptionsModal";

// // ─────────────────────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────────────────────

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   payload: {
//     locCode: number;
//     shiftId: number;
//     tripType: number; // 1 = Login, 2 = Logout  (same type for both source & target)
//     tripDate: string;
//     shiftTime?: string;
//   };
// }

// type Step = "form" | "loading" | "done";

// interface DoneState {
//   isSuccess: boolean;
//   message: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// // ─────────────────────────────────────────────────────────────────────────────
// // Toggle
// // ─────────────────────────────────────────────────────────────────────────────

// const Toggle: React.FC<{
//   checked: boolean;
//   onChange: (v: boolean) => void;
// }> = ({ checked, onChange }) => (
//   <div
//     onClick={() => onChange(!checked)}
//     style={{
//       width: 40,
//       height: 22,
//       borderRadius: 11,
//       background: checked ? "#2563EB" : "#D1D5DB",
//       position: "relative",
//       cursor: "pointer",
//       transition: "background 0.2s",
//       flexShrink: 0,
//     }}
//   >
//     <div
//       style={{
//         width: 16,
//         height: 16,
//         borderRadius: "50%",
//         background: "#fff",
//         position: "absolute",
//         top: 3,
//         left: checked ? 21 : 3,
//         transition: "left 0.2s",
//         boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
//       }}
//     />
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Field row
// // ─────────────────────────────────────────────────────────────────────────────

// const Field: React.FC<{
//   label: string;
//   hint?: string;
//   children: React.ReactNode;
// }> = ({ label, hint, children }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
//     <div>
//       <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
//         {label}
//       </div>
//       {hint && (
//         <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
//           {hint}
//         </div>
//       )}
//     </div>
//     {children}
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Main modal
// // ─────────────────────────────────────────────────────────────────────────────

// export const CopyRoutesModal: React.FC<Props> = ({
//   open,
//   onClose,
//   payload,
// }) => {
//   const { Modal } = useUILibrary();
//   const [replicate] = useReplicateShiftwiseMutation();

//   const [step, setStep] = useState<Step>("form");
//   const [done, setDone] = useState<DoneState | null>(null);

//   // ── Form state ─────────────────────────────────────────────────────────────
//   const [baseDate, setBaseDate] = useState(payload.tripDate);
//   const [targetDate, setTargetDate] = useState(payload.tripDate);
//   const [copyCabs, setCopyCabs] = useState(true);
//   const [femaleConstraint, setFemaleConstraint] = useState(1);
//   const [showBaseOpts, setShowBaseOpts] = useState(false);

//   const isLogin = payload.tripType === 1;

//   // ── Base date analysis (for BaseDateOptionsModal) ──────────────────────────
//   const { data: analysisData, isLoading: analysisLoading } =
//     useGetCopyRouteAnalysisQuery(
//       {
//         locCode: payload.locCode,
//         shiftId: payload.shiftId,
//         tripType: payload.tripType,
//         targetDate: targetDate || payload.tripDate,
//       },
//       { skip: !open },
//     );

//   // ── Submit ─────────────────────────────────────────────────────────────────
//   const handleCopy = async () => {
//     setStep("loading");
//     try {
//       // API returns { information, dbResponse } directly — no isSuccess wrapper.
//       // Any non-thrown response is a success; errors throw and land in catch below.
//       const res = (await replicate({
//         locCode: payload.locCode,
//         dateToReplicate: baseDate,
//         tripTypeToReplicate: payload.tripType,
//         shiftToReplicate: payload.shiftId,
//         replicateDate: targetDate,
//         replicateTripType: payload.tripType, // same type — Login→Login / Logout→Logout
//         replicateShift: payload.shiftId, // same shift
//         replicateFleetDetails: copyCabs,
//         femaleConstraint,
//         includeAdhocs: false,
//         //generateGuid(),
//       }).unwrap()) as { information?: string; dbResponse?: string };

//       setDone({
//         isSuccess: true,
//         message:
//           res.information ?? res.dbResponse ?? "Routes copied successfully.",
//       });
//     } catch {
//       setDone({
//         isSuccess: false,
//         message: "Something went wrong. Please try again.",
//       });
//     } finally {
//       setStep("done");
//     }
//   };

//   // ── Reset & close ──────────────────────────────────────────────────────────
//   const handleClose = () => {
//     onClose();
//     setTimeout(() => {
//       setStep("form");
//       setDone(null);
//       setBaseDate(payload.tripDate);
//       setTargetDate(payload.tripDate);
//       setCopyCabs(true);
//       setFemaleConstraint(1);
//     }, 300);
//   };

//   const isRunning = step === "loading";
//   const canSubmit = !!targetDate && !isRunning;

//   return (
//     <>
//       <Modal
//         open={open}
//         onCancel={isRunning ? () => {} : handleClose}
//         closable={!isRunning}
//         maskClosable={!isRunning}
//         footer={null}
//         width={480}
//         destroyOnClose={false}
//         style={{ top: 30 }}
//         title={
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//             <div
//               style={{
//                 width: 38,
//                 height: 38,
//                 borderRadius: 10,
//                 background: "#EFF6FF",
//                 border: "1px solid #BFDBFE",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "#2563EB",
//                 flexShrink: 0,
//               }}
//             >
//               <Copy size={17} strokeWidth={1.8} />
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
//                 Copy Routes
//               </div>
//               <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
//                 {[
//                   payload.tripDate,
//                   `Shift #${payload.shiftId}`,
//                   payload.shiftTime ?? "",
//                 ]
//                   .filter(Boolean)
//                   .map((label) => (
//                     <span
//                       key={label}
//                       style={{
//                         fontSize: 11,
//                         fontWeight: 500,
//                         color: "#64748B",
//                         background: "#F8FAFC",
//                         border: "1px solid #E2E8F0",
//                         borderRadius: 5,
//                         padding: "1px 8px",
//                       }}
//                     >
//                       {label}
//                     </span>
//                   ))}
//                 <span
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 3,
//                     fontSize: 11,
//                     fontWeight: 600,
//                     background: isLogin ? "#EFF6FF" : "#FFF7ED",
//                     color: isLogin ? "#1D4ED8" : "#C2410C",
//                     borderRadius: 5,
//                     padding: "1px 8px",
//                   }}
//                 >
//                   {isLogin ? (
//                     <LogIn size={9} strokeWidth={2.5} />
//                   ) : (
//                     <LogOut size={9} strokeWidth={2.5} />
//                   )}
//                   {isLogin ? "Login" : "Logout"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         }
//       >
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           {/* ── Form ─────────────────────────────────────────────────────── */}
//           {step === "form" && (
//             <>
//               {/* Direction banner — same type */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   padding: "10px 14px",
//                   background: "#EFF6FF",
//                   border: "1px solid #BFDBFE",
//                   borderRadius: 8,
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 5,
//                     fontSize: 12,
//                     fontWeight: 700,
//                     color: isLogin ? "#1D4ED8" : "#C2410C",
//                   }}
//                 >
//                   {isLogin ? <LogIn size={12} /> : <LogOut size={12} />}
//                   {isLogin ? "Login" : "Logout"} Shift
//                 </div>
//                 <ArrowRight size={13} style={{ color: "#60A5FA" }} />
//                 <div
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 5,
//                     fontSize: 12,
//                     fontWeight: 700,
//                     color: isLogin ? "#1D4ED8" : "#C2410C",
//                   }}
//                 >
//                   {isLogin ? <LogIn size={12} /> : <LogOut size={12} />}
//                   {isLogin ? "Login" : "Logout"} Shift
//                 </div>
//                 <span
//                   style={{ fontSize: 11, color: "#3B82F6", marginLeft: "auto" }}
//                 >
//                   Same shift type is preserved
//                 </span>
//               </div>

//               {/* ── Base Date ── */}
//               <Field
//                 label="Base Date"
//                 hint="The source date to copy routes from"
//               >
//                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                   <div
//                     style={{
//                       position: "relative",
//                       display: "inline-flex",
//                       alignItems: "center",
//                     }}
//                   >
//                     <CalendarDays
//                       size={14}
//                       style={{
//                         position: "absolute",
//                         left: 10,
//                         color: "#9CA3AF",
//                         pointerEvents: "none",
//                       }}
//                     />
//                     <input
//                       type="date"
//                       value={baseDate}
//                       onChange={(e) => setBaseDate(e.target.value)}
//                       style={{
//                         paddingLeft: 30,
//                         paddingRight: 10,
//                         paddingTop: 7,
//                         paddingBottom: 7,
//                         border: "1px solid #D1D5DB",
//                         borderRadius: 8,
//                         fontSize: 13,
//                         color: "#111827",
//                         outline: "none",
//                         background: "#fff",
//                         width: 165,
//                       }}
//                     />
//                   </div>

//                   {/* See other base date options */}
//                   <button
//                     onClick={() => setShowBaseOpts(true)}
//                     style={{
//                       display: "inline-flex",
//                       alignItems: "center",
//                       gap: 5,
//                       fontSize: 12,
//                       fontWeight: 500,
//                       color: "#2563EB",
//                       background: "none",
//                       border: "none",
//                       cursor: "pointer",
//                       padding: 0,
//                       textDecoration: "underline",
//                       textUnderlineOffset: 2,
//                       fontFamily: "inherit",
//                     }}
//                   >
//                     <BookOpen size={12} strokeWidth={2} />
//                     Other Options
//                   </button>
//                 </div>
//               </Field>

//               {/* ── Target Date ── */}
//               <Field
//                 label="Target Date"
//                 hint="The date on which routes will be replicated"
//               >
//                 <div
//                   style={{
//                     position: "relative",
//                     display: "inline-flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <CalendarDays
//                     size={14}
//                     style={{
//                       position: "absolute",
//                       left: 10,
//                       color: "#9CA3AF",
//                       pointerEvents: "none",
//                     }}
//                   />
//                   <input
//                     type="date"
//                     value={targetDate}
//                     onChange={(e) => setTargetDate(e.target.value)}
//                     style={{
//                       paddingLeft: 30,
//                       paddingRight: 10,
//                       paddingTop: 7,
//                       paddingBottom: 7,
//                       border: "1px solid #D1D5DB",
//                       borderRadius: 8,
//                       fontSize: 13,
//                       color: "#111827",
//                       outline: "none",
//                       background: "#fff",
//                       width: 165,
//                     }}
//                   />
//                 </div>
//               </Field>

//               {/* ── Female Constraint ── */}
//               <Field
//                 label="Female Constraint"
//                 hint="Controls how female employee routing constraints are applied"
//               >
//                 <select
//                   value={femaleConstraint}
//                   onChange={(e) => setFemaleConstraint(Number(e.target.value))}
//                   style={{
//                     padding: "8px 12px",
//                     border: "1px solid #D1D5DB",
//                     borderRadius: 8,
//                     fontSize: 13,
//                     color: "#111827",
//                     background: "#fff",
//                     cursor: "pointer",
//                     outline: "none",
//                     width: "100%",
//                   }}
//                 >
//                   <option value={1}>Same as Shift</option>
//                   <option value={2}>Ignore Female Constraint</option>
//                 </select>
//               </Field>

//               {/* ── Copy Cabs toggle ── */}
//               <div
//                 style={{
//                   padding: "12px 14px",
//                   border: "1px solid #E5E7EB",
//                   borderRadius: 10,
//                   background: "#FAFAFA",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                   }}
//                 >
//                   <div>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 6,
//                         fontSize: 13,
//                         fontWeight: 600,
//                         color: "#111827",
//                       }}
//                     >
//                       <Truck size={14} style={{ color: "#6B7280" }} />
//                       Copy Cabs (Fleet Details)
//                     </div>
//                     <div
//                       style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}
//                     >
//                       When enabled, the same vehicles will be allocated to the
//                       copied trips.
//                     </div>
//                   </div>
//                   <Toggle checked={copyCabs} onChange={setCopyCabs} />
//                 </div>
//               </div>
//             </>
//           )}

//           {/* ── Loading ───────────────────────────────────────────────────── */}
//           {step === "loading" && (
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 10,
//                 padding: "24px 0",
//               }}
//             >
//               <div
//                 style={{
//                   width: 44,
//                   height: 44,
//                   borderRadius: 12,
//                   background: "#EFF6FF",
//                   border: "1px solid #BFDBFE",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Loader2
//                   size={22}
//                   strokeWidth={2}
//                   style={{
//                     color: "#2563EB",
//                     animation: "spin 0.8s linear infinite",
//                   }}
//                 />
//               </div>
//               <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
//                 Copying routes to {targetDate}…
//               </div>
//             </div>
//           )}

//           {/* ── Done ─────────────────────────────────────────────────────── */}
//           {step === "done" && done && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: 12,
//                 padding: "14px 16px",
//                 borderRadius: 10,
//                 background: done.isSuccess ? "#F0FDF4" : "#FEF2F2",
//                 border: `1px solid ${done.isSuccess ? "#BBF7D0" : "#FECACA"}`,
//               }}
//             >
//               <div
//                 style={{
//                   width: 32,
//                   height: 32,
//                   borderRadius: 8,
//                   flexShrink: 0,
//                   background: done.isSuccess ? "#DCFCE7" : "#FEE2E2",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 {done.isSuccess ? (
//                   <CheckCircle2
//                     size={16}
//                     strokeWidth={2}
//                     style={{ color: "#16A34A" }}
//                   />
//                 ) : (
//                   <XCircle
//                     size={16}
//                     strokeWidth={2}
//                     style={{ color: "#DC2626" }}
//                   />
//                 )}
//               </div>
//               <div>
//                 <div
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 700,
//                     marginBottom: 3,
//                     color: done.isSuccess ? "#15803D" : "#991B1B",
//                   }}
//                 >
//                   {done.isSuccess
//                     ? "Routes copied successfully"
//                     : "Copy failed"}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: 12,
//                     lineHeight: 1.5,
//                     color: done.isSuccess ? "#166534" : "#B91C1C",
//                   }}
//                 >
//                   {done.message}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── Footer ───────────────────────────────────────────────────── */}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               alignItems: "center",
//               gap: 8,
//               paddingTop: 4,
//               borderTop: "1px solid #F1F5F9",
//             }}
//           >
//             {!isRunning && (
//               <button
//                 onClick={handleClose}
//                 style={{
//                   padding: "8px 18px",
//                   borderRadius: 8,
//                   border: "1px solid #E2E8F0",
//                   background: "#fff",
//                   color: "#374151",
//                   fontSize: 12,
//                   fontWeight: 600,
//                   cursor: "pointer",
//                 }}
//               >
//                 {step === "done" ? "Close" : "Cancel"}
//               </button>
//             )}

//             {step === "form" && (
//               <button
//                 onClick={handleCopy}
//                 disabled={!canSubmit}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 7,
//                   padding: "8px 22px",
//                   borderRadius: 8,
//                   border: "none",
//                   background: canSubmit ? "#2563EB" : "#93C5FD",
//                   color: "#fff",
//                   fontSize: 12,
//                   fontWeight: 700,
//                   cursor: canSubmit ? "pointer" : "not-allowed",
//                   minWidth: 150,
//                   justifyContent: "center",
//                   transition: "background 0.15s",
//                 }}
//               >
//                 <Copy size={13} strokeWidth={2.5} />
//                 Copy Routes
//               </button>
//             )}

//             {isRunning && (
//               <div
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 7,
//                   padding: "8px 22px",
//                   borderRadius: 8,
//                   background: "#DBEAFE",
//                   color: "#1D4ED8",
//                   fontSize: 12,
//                   fontWeight: 700,
//                 }}
//               >
//                 <Loader2
//                   size={13}
//                   strokeWidth={2.5}
//                   style={{ animation: "spin 0.8s linear infinite" }}
//                 />
//                 Copying…
//               </div>
//             )}
//           </div>
//         </div>
//       </Modal>

//       {/* ── Nested base date options ──────────────────────────────────────── */}
//       <BaseDateOptionsModal
//         open={showBaseOpts}
//         onClose={() => setShowBaseOpts(false)}
//         payload={{ shiftId: String(payload.shiftId) }}
//         analysisData={analysisData?.dayWiseAnalysis}
//         isLoading={analysisLoading}
//         onSelect={(selectedDate) => {
//           setBaseDate(selectedDate);
//           setShowBaseOpts(false);
//         }}
//       />
//     </>
//   );
// };

// src/features/routeManagement/Modals/CopyRoutesModal.tsx
import React, { useState } from "react";
import {
  Copy,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  useGetCopyRouteAnalysisQuery,
  useCopyRouteNewApiMutation,
} from "../services/RouteManagementApi";
import { BaseDateOptionsModal } from "./BaseDateOptionsModal";

// ── Guard options — horizontal radio row ──────────────────────────────────────
export const GUARD_OPTIONS: {
  label: string;
  value: number | undefined;
  description: string;
}[] = [
  {
    value: undefined,
    label: "Same as base",
    description:
      "Keeps guard allocation as-is. Any trip that had a guard on the base date retains the same assignment.",
  },
  {
    value: 1,
    label: "First Female",
    description:
      "Trips where the very first boarding passenger is female will be assigned a guard.",
  },
  {
    value: 2,
    label: "Last Female",
    description:
      "Trips where the last drop-off passenger is female will be assigned a guard.",
  },
  {
    value: 3,
    label: "Any Female",
    description:
      "Any trip containing at least one female passenger at any stop will be assigned a guard.",
  },
];

// ── Inline info-tip (no portal — safe inside Modal) ──────────────────────────
export function InfoTip({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "1.5px solid #9CA3AF",
          color: "#9CA3AF",
          fontSize: 9,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
          userSelect: "none",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        i
      </div>

      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 7px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            background: "#1E293B",
            color: "#F1F5F9",
            fontSize: 11,
            lineHeight: 1.55,
            borderRadius: 7,
            padding: "7px 10px",
            zIndex: 20,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            whiteSpace: "normal",
          }}
        >
          {/* small arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #1E293B",
            }}
          />
          {text}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  payload: {
    locCode: number;
    shiftId: number;
    tripType: number; // 1 = Login, 2 = Logout
    tripDate: string;
    shiftTime?: string;
  };
}

type Step = "form" | "loading" | "done";

interface DoneState {
  isSuccess: boolean;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field row
// ─────────────────────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
          {hint}
        </div>
      )}
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const CopyRoutesModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
}) => {
  const { Modal } = useUILibrary();
  const [copyRoute] = useCopyRouteNewApiMutation();

  const [step, setStep] = useState<Step>("form");
  const [done, setDone] = useState<DoneState | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [baseDate, setBaseDate] = useState(payload.tripDate);
  const [targetDate, setTargetDate] = useState(payload.tripDate);
  const [guardPlacement, setGuardPlacement] = useState<number | undefined>(
    undefined,
  );
  const [showBaseOpts, setShowBaseOpts] = useState(false);

  const isLogin = payload.tripType === 1;

  // ── Base date analysis (for BaseDateOptionsModal) ──────────────────────────
  const { data: analysisData, isLoading: analysisLoading } =
    useGetCopyRouteAnalysisQuery(
      {
        locCode: payload.locCode,
        shiftId: payload.shiftId,
        tripType: payload.tripType,
        targetDate: targetDate || payload.tripDate,
      },
      { skip: !open },
    );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    setStep("loading");
    try {
      const body: {
        locCode: number;
        shiftId: number;
        tripType: number;
        baseDate: string;
        targetDate: string;
        guardPlacement?: number;
      } = {
        locCode: payload.locCode,
        shiftId: payload.shiftId,
        tripType: payload.tripType,
        baseDate,
        targetDate,
      };

      // Only include guardPlacement when user made an explicit selection
      if (guardPlacement !== undefined) {
        body.guardPlacement = guardPlacement;
      }

      const res = (await copyRoute(body).unwrap()) as {
        information?: string;
        dbResponse?: string;
      };

      setDone({
        isSuccess: true,
        message:
          res.information ?? res.dbResponse ?? "Routes copied successfully.",
      });
    } catch {
      setDone({
        isSuccess: false,
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setStep("done");
    }
  };

  // ── Reset & close ──────────────────────────────────────────────────────────
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setDone(null);
      setBaseDate(payload.tripDate);
      setTargetDate(payload.tripDate);
      setGuardPlacement(undefined);
    }, 300);
  };

  const isRunning = step === "loading";
  const canSubmit = !!targetDate && !isRunning;

  return (
    <>
      <Modal
        open={open}
        onCancel={isRunning ? () => {} : handleClose}
        closable={!isRunning}
        maskClosable={!isRunning}
        footer={null}
        width={480}
        destroyOnClose={false}
        style={{ top: 30 }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
                flexShrink: 0,
              }}
            >
              <Copy size={17} strokeWidth={1.8} />
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
                Copy Routes
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                {[
                  payload.tripDate,
                  `Shift #${payload.shiftId}`,
                  payload.shiftTime ?? "",
                ]
                  .filter(Boolean)
                  .map((label) => (
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
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    background: isLogin ? "#EFF6FF" : "#FFF7ED",
                    color: isLogin ? "#1D4ED8" : "#C2410C",
                    borderRadius: 5,
                    padding: "1px 8px",
                  }}
                >
                  {isLogin ? (
                    <LogIn size={9} strokeWidth={2.5} />
                  ) : (
                    <LogOut size={9} strokeWidth={2.5} />
                  )}
                  {isLogin ? "Login" : "Logout"}
                </span>
              </div>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Form ─────────────────────────────────────────────────────── */}
          {step === "form" && (
            <>
              {/* Direction banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: isLogin ? "#1D4ED8" : "#C2410C",
                  }}
                >
                  {isLogin ? <LogIn size={12} /> : <LogOut size={12} />}
                  {isLogin ? "Login" : "Logout"} Shift
                </div>
                <ArrowRight size={13} style={{ color: "#60A5FA" }} />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: isLogin ? "#1D4ED8" : "#C2410C",
                  }}
                >
                  {isLogin ? <LogIn size={12} /> : <LogOut size={12} />}
                  {isLogin ? "Login" : "Logout"} Shift
                </div>
                <span
                  style={{ fontSize: 11, color: "#3B82F6", marginLeft: "auto" }}
                >
                  Same shift type is preserved
                </span>
              </div>

              {/* ── Base Date ── */}
              <Field
                label="Base Date"
                hint="The source date to copy routes from"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <CalendarDays
                      size={14}
                      style={{
                        position: "absolute",
                        left: 10,
                        color: "#9CA3AF",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="date"
                      value={baseDate}
                      onChange={(e) => setBaseDate(e.target.value)}
                      style={{
                        paddingLeft: 30,
                        paddingRight: 10,
                        paddingTop: 7,
                        paddingBottom: 7,
                        border: "1px solid #D1D5DB",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#111827",
                        outline: "none",
                        background: "#fff",
                        width: 165,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setShowBaseOpts(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#2563EB",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                      fontFamily: "inherit",
                    }}
                  >
                    <BookOpen size={12} strokeWidth={2} />
                    Other Options
                  </button>
                </div>
              </Field>

              {/* ── Target Date ── */}
              <Field
                label="Target Date"
                hint="The date on which routes will be replicated"
              >
                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <CalendarDays
                    size={14}
                    style={{
                      position: "absolute",
                      left: 10,
                      color: "#9CA3AF",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{
                      paddingLeft: 30,
                      paddingRight: 10,
                      paddingTop: 7,
                      paddingBottom: 7,
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#111827",
                      outline: "none",
                      background: "#fff",
                      width: 165,
                    }}
                  />
                </div>
              </Field>

              {/* ── Guard Placement (optional) ── */}
              {/* <Field
                label="Guard Placement"
                hint="Optional — omit to use the shift's default guard placement"
              >
                <div style={{ position: "relative" }}>
                  <ShieldCheck
                    size={14}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    value={guardPlacement ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGuardPlacement(v === "" ? undefined : Number(v));
                    }}
                    style={{
                      paddingLeft: 32,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      fontSize: 13,
                      color:
                        guardPlacement === undefined ? "#9CA3AF" : "#111827",
                      background: "#fff",
                      cursor: "pointer",
                      outline: "none",
                      width: "100%",
                    }}
                  >
                    {GUARD_OPTIONS.map((opt) => (
                      <option key={opt.value ?? "none"} value={opt.value ?? ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Field> */}

              {/* ── Guard Placement ── */}
              <Field
                label="Guard Placement"
                hint="Optional — controls which trips receive a guard"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                    padding: "8px 10px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    background: "#FAFAFA",
                  }}
                >
                  {GUARD_OPTIONS.map((opt, i) => {
                    const isSelected = guardPlacement === opt.value;
                    return (
                      <React.Fragment key={opt.value ?? "none"}>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1.5px solid ${isSelected ? "#2563EB" : "transparent"}`,
                            background: isSelected ? "#EFF6FF" : "transparent",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <input
                            type="radio"
                            name="guardPlacement"
                            checked={isSelected}
                            onChange={() => setGuardPlacement(opt.value)}
                            style={{
                              accentColor: "#2563EB",
                              cursor: "pointer",
                              margin: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? "#1D4ED8" : "#374151",
                            }}
                          >
                            {opt.label}
                          </span>
                          <InfoTip text={opt.description} />
                        </label>

                        {/* divider between options, not after last */}
                        {i < GUARD_OPTIONS.length - 1 && (
                          <div
                            style={{
                              width: 1,
                              height: 16,
                              background: "#E5E7EB",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {/* ── Loading ───────────────────────────────────────────────────── */}
          {step === "loading" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "24px 0",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader2
                  size={22}
                  strokeWidth={2}
                  style={{
                    color: "#2563EB",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Copying routes to {targetDate}…
              </div>
            </div>
          )}

          {/* ── Done ─────────────────────────────────────────────────────── */}
          {step === "done" && done && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 10,
                background: done.isSuccess ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${done.isSuccess ? "#BBF7D0" : "#FECACA"}`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: done.isSuccess ? "#DCFCE7" : "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {done.isSuccess ? (
                  <CheckCircle2
                    size={16}
                    strokeWidth={2}
                    style={{ color: "#16A34A" }}
                  />
                ) : (
                  <XCircle
                    size={16}
                    strokeWidth={2}
                    style={{ color: "#DC2626" }}
                  />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 3,
                    color: done.isSuccess ? "#15803D" : "#991B1B",
                  }}
                >
                  {done.isSuccess
                    ? "Routes copied successfully"
                    : "Copy failed"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: done.isSuccess ? "#166534" : "#B91C1C",
                  }}
                >
                  {done.message}
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              paddingTop: 4,
              borderTop: "1px solid #F1F5F9",
            }}
          >
            {!isRunning && (
              <button
                onClick={handleClose}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {step === "done" ? "Close" : "Cancel"}
              </button>
            )}

            {step === "form" && (
              <button
                onClick={handleCopy}
                disabled={!canSubmit}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: canSubmit ? "#2563EB" : "#93C5FD",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  minWidth: 150,
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <Copy size={13} strokeWidth={2.5} />
                Copy Routes
              </button>
            )}

            {isRunning && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 22px",
                  borderRadius: 8,
                  background: "#DBEAFE",
                  color: "#1D4ED8",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Loader2
                  size={13}
                  strokeWidth={2.5}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                Copying…
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Nested base date options ──────────────────────────────────────── */}
      <BaseDateOptionsModal
        open={showBaseOpts}
        onClose={() => setShowBaseOpts(false)}
        payload={{ shiftId: String(payload.shiftId) }}
        analysisData={analysisData?.dayWiseAnalysis}
        isLoading={analysisLoading}
        onSelect={(selectedDate) => {
          setBaseDate(selectedDate);
          setShowBaseOpts(false);
        }}
      />
    </>
  );
};
