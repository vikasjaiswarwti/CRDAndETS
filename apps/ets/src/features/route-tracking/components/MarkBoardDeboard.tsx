// import { useMemo, useState } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import type { TripPassenger, TripResponse } from "../types/tracking.types";
// import { T } from "../../../styles/tokens";
// import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";

// interface NoShowModalProps {
//   open: boolean;
//   onClose: () => void;
//   passengers: TripPassenger[];
//   leftData: TripResponse;
// }

// const MarkBoardDeboard = ({
//   open,
//   onClose,
//   passengers,
//   leftData,
// }: NoShowModalProps) => {
//   // const isDrop: boolean = leftData.tripTypeName === "Drop";
//   const { Modal, Select, Button } = useUILibrary();
//   const {
//     signOutEmployee,
//     isSignOutEmployeeLoading,
//     signInEmployee,
//     isSignInEmployeeLoading,
//     signInEmployeeError,
//     signOutEmployeeError,
//   } = useRouteTrackingMutation({
//     onSignInSuccess: () => onClose(),
//     onSignOutSuccess: () => onClose(),
//   });

//   const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();
//   // const [otp, setOtp] = useState<string>("");

//   const allBoarded = useMemo(
//     () =>
//       passengers
//         .filter((p) => !p.noShow)
//         .every((p) => p.empSigninTime !== null),
//     [passengers],
//   );

//   const isDeboardMode = allBoarded;

//   const employeeOptions = useMemo(
//     () =>
//       passengers
//         .filter((p) => {
//           if (p.noShow) return false;
//           return isDeboardMode
//             ? p.empSigninTime !== null && p.empSignOutTime === null
//             : p.empSigninTime === null;
//         })
//         .map((p) => ({
//           label: `${p.firstname} ${p.lastName}`,
//           value: p.empId,
//         })),
//     [passengers, isDeboardMode],
//   );

//   const selectedPassenger = useMemo(
//     () => passengers.find((p) => p.empId === selectedEmpId),
//     [passengers, selectedEmpId],
//   );

//   const isLoading = isSignInEmployeeLoading || isSignOutEmployeeLoading;
//   // const isOtpComplete = otp.length === 4;
//   const isSubmitDisabled = !selectedEmpId ||  isLoading; //  || !isOtpComplete;

//   const fieldErrors = [
//     ...(signInEmployeeError?.fieldErrors ?? []),
//     ...(signOutEmployeeError?.fieldErrors ?? []),
//   ];

//   const modalTitle = isDeboardMode
//     ? "Mark De-Boarded Employee"
//     : "Mark Boarded Employee";

//   const actionLabel = !selectedPassenger
//     ? "Select an employee"
//     : isDeboardMode
//       ? "Mark De-Boarded"
//       : "Mark Boarded";

//   // const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   const val = e.target.value.replace(/\D/g, "").slice(0, 4);
//   //   setOtp(val);
//   // };

//   // reset otp when employee changes
//   const handleEmployeeChange = (value: number) => {
//     setSelectedEmpId(value);
//     // setOtp("");
//   };

//   const handleSubmit = async () => {
//     if (!selectedEmpId || !selectedPassenger) return;
//     try {
//       if (isDeboardMode) {
//         await signOutEmployee({
//           tripID: leftData.dsId,
//           empId: selectedPassenger.empId,
//           tripType: leftData.tripType,
//           empSignOutLat: selectedPassenger.plannedLat,
//           empSignOutLng: selectedPassenger.plannedLng,
//           otp: selectedPassenger.otp,
//         });
//       } else {
//         await signInEmployee({
//           tripID: leftData.dsId,
//           empId: selectedPassenger.empId,
//           tripType: leftData.tripType,
//           empSigninLat: selectedPassenger.plannedLat,
//           empSigninLng: selectedPassenger.plannedLng,
//           otp: selectedPassenger.otp,
//         });
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={modalTitle}
//       width={480}
//       destroyOnClose
//       footer={
//         <Button
//           disabled={isSubmitDisabled}
//           loading={isLoading}
//           onClick={handleSubmit}
//           style={{
//             border: "1px solid transparent",
//             background: isSubmitDisabled ? "#a0cfb8" : "#3E9B73",
//             color: "#fff",
//             fontWeight: 500,
//           }}
//         >
//           {actionLabel}
//         </Button>
//       }
//       styles={{
//         header: { borderBottom: "none" },
//         mask: { background: "rgba(0, 60, 30, 0.35)" },
//       }}
//       style={{ borderRadius: 16 }}
//     >
//       <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//         {/* Mode indicator badge */}
//         <div
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 6,
//             padding: "4px 10px",
//             borderRadius: 20,
//             fontSize: 12,
//             fontWeight: 500,
//             width: "fit-content",
//             background: isDeboardMode ? "#e8f6f0" : "#fffbe6",
//             color: isDeboardMode ? "#3E9B73" : "#b45309",
//             border: `1px solid ${isDeboardMode ? "#3E9B73" : "#f59e0b"}`,
//           }}
//         >
//           <span
//             style={{
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               background: isDeboardMode ? "#3E9B73" : "#f59e0b",
//               display: "inline-block",
//             }}
//           />
//           {isDeboardMode
//             ? "All employees boarded — deboard mode"
//             : "Boarding in progress"}
//         </div>

//         {/* Employee select */}
//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 8,
//               fontSize: 13,
//               color: "#555",
//             }}
//           >
//             Select Employee
//           </label>
//           <Select
//             placeholder="Select Employee"
//             options={employeeOptions}
//             value={selectedEmpId}
//             onChange={handleEmployeeChange}
//             showSearch
//             allowClear
//             style={{ width: "100%", background: T.formcss.inputBg }}
//           />
//           {selectedPassenger && (
//             <p
//               style={{
//                 marginTop: 6,
//                 fontSize: 12,
//                 color: isDeboardMode ? "#3E9B73" : "#888",
//               }}
//             >
//               {isDeboardMode
//                 ? `✓ Boarded at ${selectedPassenger.empSigninTime}`
//                 : "Not yet boarded"}
//             </p>
//           )}
//         </div>

//         {/* {selectedPassenger && (
//           <div>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: 8,
//                 fontSize: 13,
//                 color: "#555",
//               }}
//             >
//               Enter OTP
//             </label>
//             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//               {[0, 1, 2, 3].map((i) => (
//                 <input
//                   key={i}
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={1}
//                   value={otp[i] ?? ""}
//                   onChange={(e) => {
//                     const val = e.target.value.replace(/\D/g, "");
//                     if (!val) {
//                       // backspace — clear this digit
//                       const next = otp.split("");
//                       next[i] = "";
//                       setOtp(next.join("").slice(0, 4));
//                       return;
//                     }
//                     const next = otp.split("");
//                     next[i] = val[0];
//                     setOtp(next.join("").slice(0, 4));
//                     // auto-focus next box
//                     const nextInput = document.getElementById(`otp-${i + 1}`);
//                     if (nextInput) (nextInput as HTMLInputElement).focus();
//                   }}
//                   onKeyDown={(e) => {
//                     if (e.key === "Backspace" && !otp[i]) {
//                       const prev = document.getElementById(`otp-${i - 1}`);
//                       if (prev) (prev as HTMLInputElement).focus();
//                     }
//                   }}
//                   id={`otp-${i}`}
//                   style={{
//                     width: 52,
//                     height: 52,
//                     textAlign: "center",
//                     fontSize: 20,
//                     fontWeight: 500,
//                     border: otp[i]
//                       ? "1.5px solid #3E9B73"
//                       : "1.5px solid #d9d9d9",
//                     borderRadius: 10,
//                     outline: "none",
//                     color: "#1a1a1a",
//                     background: otp[i] ? "#e8f6f0" : "#fafafa",
//                     transition: "border 0.15s, background 0.15s",
//                   }}
//                 />
//               ))}
//              <div
//                 style={{
//                   display: "flex",
//                   gap: 4,
//                   marginLeft: 4,
//                 }}
//               >
//                 {[0, 1, 2, 3].map((i) => (
//                   <span
//                     key={i}
//                     style={{
//                       width: 6,
//                       height: 6,
//                       borderRadius: "50%",
//                       background: otp.length > i ? "#3E9B73" : "#d9d9d9",
//                       transition: "background 0.15s",
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>

//             <p
//               style={{
//                 marginTop: 6,
//                 fontSize: 12,
//                 color: isOtpComplete ? "#3E9B73" : "#aaa",
//               }}
//             >
//               {isOtpComplete ? "✓ OTP entered" : "Enter 4-digit OTP to proceed"}
//             </p>
//           </div>
//         )}

//         {/* Field errors */}
//         {fieldErrors.length > 0 && (
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {fieldErrors.map((err) => (
//               <div
//                 key={err.field}
//                 style={{
//                   padding: "10px 12px",
//                   background: "#fff5f5",
//                   border: "0.5px solid #fca5a5",
//                   borderLeft: "3px solid #E24B4A",
//                   borderRadius: 8,
//                 }}
//               >
//                 <p
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 600,
//                     color: "#b91c1c",
//                     margin: "0 0 2px",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.03em",
//                   }}
//                 >
//                   {err.field}
//                 </p>
//                 <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
//                   {err.message}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default MarkBoardDeboard;
// -----------------------
// import { useEffect, useMemo, useState } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import type { TripPassenger, TripResponse } from "../types/tracking.types";
// import { T } from "../../../styles/tokens";
// import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";

// interface NoShowModalProps {
//   open: boolean;
//   onClose: () => void;
//   passengers: TripPassenger[];
//   leftData: TripResponse;
// }

// const MarkBoardDeboard = ({
//   open,
//   onClose,
//   passengers,
//   leftData,
// }: NoShowModalProps) => {
//   const { Modal, Select, Button } = useUILibrary();
//   const {
//     signOutEmployee,
//     isSignOutEmployeeLoading,
//     signInEmployee,
//     isSignInEmployeeLoading,
//     signInEmployeeError,
//     signOutEmployeeError,
//   } = useRouteTrackingMutation({
//     onSignInSuccess: () => onClose(),
//     onSignOutSuccess: () => onClose(),
//   });

//   const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();

//   // ── Reset selection when modal closes ──────────────────────────────
//   useEffect(() => {
//     if (!open) setSelectedEmpId(undefined);
//   }, [open]);

//   // ── Ordered list (noShow excluded, sequence preserved) ─────────────
//   const orderedPassengers = useMemo(
//     () => passengers.filter((p) => !p.noShow),
//     [passengers],
//   );

//   // ── Show all actionable employees with status label ─────────────────
//   const employeeOptions = useMemo(
//     () =>
//       orderedPassengers
//         .filter((p) => {
//           const canBoard = p.empSigninTime === null;
//           const canDeboard = p.empSignOutTime === null;
//           return canBoard || canDeboard;
//         })
//         .map((p) => ({
//           label: `${p.firstname} ${p.lastName} — ${
//             p.empSigninTime !== null ? "✓ Boarded" : "Not boarded"
//           }`,
//           value: p.empId,
//         })),
//     [orderedPassengers],
//   );

//   const selectedPassenger = useMemo(
//     () => passengers.find((p) => p.empId === selectedEmpId),
//     [passengers, selectedEmpId],
//   );

//   // ── Mode is per selected employee, not global ───────────────────────
//   const isDeboardMode =
//     selectedPassenger != null &&
//     selectedPassenger.empSigninTime !== null &&
//     selectedPassenger.empSignOutTime === null;

//   // ── Sequential validation: previous employee must be done first ─────
//   const sequenceValidation = useMemo<{
//     blocked: boolean;
//     message: string;
//   }>(() => {
//     if (!selectedPassenger) return { blocked: false, message: "" };

//     const idx = orderedPassengers.findIndex((p) => p.empId === selectedEmpId);

//     // First employee — no predecessor to check
//     if (idx <= 0) return { blocked: false, message: "" };

//     const prev = orderedPassengers[idx - 1];
//     const prevName = `${prev.firstname} ${prev.lastName}`;

//     if (isDeboardMode) {
//       if (prev.empSignOutTime === null) {
//         return {
//           blocked: true,
//           message: `${prevName} hasn't been de-boarded yet. Please de-board them first.`,
//         };
//       }
//     } else {
//       if (prev.empSigninTime === null) {
//         return {
//           blocked: true,
//           message: `${prevName} hasn't boarded yet. Please board them first.`,
//         };
//       }
//     }

//     return { blocked: false, message: "" };
//   }, [selectedEmpId, selectedPassenger, orderedPassengers, isDeboardMode]);

//   const isLoading = isSignInEmployeeLoading || isSignOutEmployeeLoading;
//   const isSubmitDisabled =
//     !selectedEmpId || isLoading || sequenceValidation.blocked;

//   const fieldErrors = [
//     ...(signInEmployeeError?.fieldErrors ?? []),
//     ...(signOutEmployeeError?.fieldErrors ?? []),
//   ];

//   const modalTitle = !selectedPassenger
//     ? "Board / De-board Employee"
//     : isDeboardMode
//       ? "Mark De-Boarded Employee"
//       : "Mark Boarded Employee";

//   const actionLabel = !selectedPassenger
//     ? "Select an employee"
//     : isDeboardMode
//       ? "Mark De-Boarded"
//       : "Mark Boarded";

//   const handleEmployeeChange = (value: number) => {
//     setSelectedEmpId(value);
//   };

//   const handleSubmit = async () => {
//     if (!selectedEmpId || !selectedPassenger) return;
//     try {
//       if (isDeboardMode) {
//         await signOutEmployee({
//           tripID: leftData.dsId,
//           empId: selectedPassenger.empId,
//           tripType: leftData.tripType,
//           empSignOutLat: selectedPassenger.plannedLat,
//           empSignOutLng: selectedPassenger.plannedLng,
//           otp: selectedPassenger.otp,
//         });
//       } else {
//         await signInEmployee({
//           tripID: leftData.dsId,
//           empId: selectedPassenger.empId,
//           tripType: leftData.tripType,
//           empSigninLat: selectedPassenger.plannedLat,
//           empSigninLng: selectedPassenger.plannedLng,
//           otp: selectedPassenger.otp,
//         });
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={modalTitle}
//       width={480}
//       destroyOnClose
//       footer={
//         <Button
//           disabled={isSubmitDisabled}
//           loading={isLoading}
//           onClick={handleSubmit}
//           style={{
//             border: "1px solid transparent",
//             background: isSubmitDisabled ? "#a0cfb8" : "#3E9B73",
//             color: "#fff",
//             fontWeight: 500,
//           }}
//         >
//           {actionLabel}
//         </Button>
//       }
//       styles={{
//         header: { borderBottom: "none" },
//         mask: { background: "rgba(0, 60, 30, 0.35)" },
//       }}
//       style={{ borderRadius: 16 }}
//     >
//       <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//         {/* Mode indicator badge */}
//         <div
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 6,
//             padding: "4px 10px",
//             borderRadius: 20,
//             fontSize: 12,
//             fontWeight: 500,
//             width: "fit-content",
//             background: isDeboardMode ? "#e8f6f0" : "#fffbe6",
//             color: isDeboardMode ? "#3E9B73" : "#b45309",
//             border: `1px solid ${isDeboardMode ? "#3E9B73" : "#f59e0b"}`,
//           }}
//         >
//           <span
//             style={{
//               width: 7,
//               height: 7,
//               borderRadius: "50%",
//               background: isDeboardMode ? "#3E9B73" : "#f59e0b",
//               display: "inline-block",
//             }}
//           />
//           {!selectedPassenger
//             ? "Select an employee to continue"
//             : isDeboardMode
//               ? "Deboard mode"
//               : "Boarding in progress"}
//         </div>

//         {/* Employee select */}
//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 8,
//               fontSize: 13,
//               color: "#555",
//             }}
//           >
//             Select Employee
//           </label>
//           <Select
//             placeholder="Select Employee"
//             options={employeeOptions}
//             value={selectedEmpId}
//             onChange={handleEmployeeChange}
//             showSearch
//             allowClear
//             style={{ width: "100%", background: T.formcss.inputBg }}
//           />

//           {/* Boarded-at hint */}
//           {selectedPassenger && !sequenceValidation.blocked && (
//             <p
//               style={{
//                 marginTop: 6,
//                 fontSize: 12,
//                 color: isDeboardMode ? "#3E9B73" : "#888",
//               }}
//             >
//               {isDeboardMode
//                 ? `✓ Boarded at ${selectedPassenger.empSigninTime}`
//                 : "Not yet boarded"}
//             </p>
//           )}

//           {/* ── Sequence warning banner ───────────────────────────── */}
//           {sequenceValidation.blocked && (
//             <div
//               style={{
//                 marginTop: 8,
//                 padding: "10px 12px",
//                 background: "#fffbe6",
//                 border: "0.5px solid #f59e0b",
//                 borderLeft: "3px solid #f59e0b",
//                 borderRadius: 8,
//               }}
//             >
//               <p
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   color: "#b45309",
//                   margin: "0 0 2px",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.03em",
//                 }}
//               >
//                 Sequence Required
//               </p>
//               <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
//                 {sequenceValidation.message}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Field errors */}
//         {fieldErrors.length > 0 && (
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {fieldErrors.map((err) => (
//               <div
//                 key={err.field}
//                 style={{
//                   padding: "10px 12px",
//                   background: "#fff5f5",
//                   border: "0.5px solid #fca5a5",
//                   borderLeft: "3px solid #E24B4A",
//                   borderRadius: 8,
//                 }}
//               >
//                 <p
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 600,
//                     color: "#b91c1c",
//                     margin: "0 0 2px",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.03em",
//                   }}
//                 >
//                   {err.field}
//                 </p>
//                 <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
//                   {err.message}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default MarkBoardDeboard;
// -----------------
import { useEffect, useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { TripPassenger, TripResponse } from "../types/tracking.types";
import { T } from "../../../styles/tokens";
import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";

interface NoShowModalProps {
  open: boolean;
  onClose: () => void;
  passengers: TripPassenger[];
  leftData: TripResponse;
}

const MarkBoardDeboard = ({
  open,
  onClose,
  passengers,
  leftData,
}: NoShowModalProps) => {
  const { Modal, Select, Button } = useUILibrary();
  const {
    signOutEmployee,
    isSignOutEmployeeLoading,
    signInEmployee,
    isSignInEmployeeLoading,
    signInEmployeeError,
    signOutEmployeeError,
  } = useRouteTrackingMutation({
    onSignInSuccess: () => onClose(),
    onSignOutSuccess: () => onClose(),
  });

  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>();

  useEffect(() => {
    if (!open) setSelectedEmpId(undefined);
  }, [open]);

  const orderedPassengers = useMemo(
    () => passengers.filter((p) => !p.noShow),
    [passengers],
  );

  // ── Global flag: true once every non-noShow employee has boarded ────
  const allBoarded = useMemo(
    () => orderedPassengers.every((p) => p.empSigninTime !== null),
    [orderedPassengers],
  );

  // ── Board mode → only unboarded | Deboard mode → only not-yet-deboarded ──
  const employeeOptions = useMemo(
    () =>
      orderedPassengers
        .filter((p) =>
          allBoarded
            ? p.empSigninTime !== null && p.empSignOutTime === null
            : p.empSigninTime === null,
        )
        .map((p) => ({
          label: `${p.firstname} ${p.lastName}`,
          value: p.empId,
        })),
    [orderedPassengers, allBoarded],
  );

  const selectedPassenger = useMemo(
    () => passengers.find((p) => p.empId === selectedEmpId),
    [passengers, selectedEmpId],
  );

  // ── Per-employee mode: drives action + hints ────────────────────────
  const isDeboardMode =
    selectedPassenger != null &&
    selectedPassenger.empSigninTime !== null &&
    selectedPassenger.empSignOutTime === null;

  // ── Sequential validation ───────────────────────────────────────────
  const sequenceValidation = useMemo<{ blocked: boolean; message: string }>(() => {
    if (!selectedPassenger) return { blocked: false, message: "" };

    const idx = orderedPassengers.findIndex((p) => p.empId === selectedEmpId);
    if (idx <= 0) return { blocked: false, message: "" };

    const prev = orderedPassengers[idx - 1];
    const prevName = `${prev.firstname} ${prev.lastName}`;

    if (isDeboardMode) {
      if (prev.empSignOutTime === null) {
        return {
          blocked: true,
          message: `${prevName} hasn't been de-boarded yet. Please de-board them first.`,
        };
      }
    } else {
      if (prev.empSigninTime === null) {
        return {
          blocked: true,
          message: `${prevName} hasn't boarded yet. Please board them first.`,
        };
      }
    }

    return { blocked: false, message: "" };
  }, [selectedEmpId, selectedPassenger, orderedPassengers, isDeboardMode]);

  const isLoading = isSignInEmployeeLoading || isSignOutEmployeeLoading;
  const isSubmitDisabled = !selectedEmpId || isLoading || sequenceValidation.blocked;

  const fieldErrors = [
    ...(signInEmployeeError?.fieldErrors ?? []),
    ...(signOutEmployeeError?.fieldErrors ?? []),
  ];

  const modalTitle = allBoarded ? "Mark De-Boarded Employee" : "Mark Boarded Employee";

  const actionLabel = !selectedPassenger
    ? "Select an employee"
    : isDeboardMode
      ? "Mark De-Boarded"
      : "Mark Boarded";

  const handleEmployeeChange = (value: number) => {
    setSelectedEmpId(value);
  };

  const handleSubmit = async () => {
    if (!selectedEmpId || !selectedPassenger) return;
    try {
      if (isDeboardMode) {
        await signOutEmployee({
          tripID: leftData.dsId,
          empId: selectedPassenger.empId,
          tripType: leftData.tripType,
          empSignOutLat: selectedPassenger.plannedLat,
          empSignOutLng: selectedPassenger.plannedLng,
          otp: selectedPassenger.otp,
        });
      } else {
        await signInEmployee({
          tripID: leftData.dsId,
          empId: selectedPassenger.empId,
          tripType: leftData.tripType,
          empSigninLat: selectedPassenger.plannedLat,
          empSigninLng: selectedPassenger.plannedLng,
          otp: selectedPassenger.otp,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={modalTitle}
      width={480}
      destroyOnClose
      footer={
        <Button
          disabled={isSubmitDisabled}
          loading={isLoading}
          onClick={handleSubmit}
          style={{
            border: "1px solid transparent",
            background: isSubmitDisabled ? "#a0cfb8" : "#3E9B73",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {actionLabel}
        </Button>
      }
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Mode indicator badge — uses allBoarded (global, stable) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            width: "fit-content",
            background: allBoarded ? "#e8f6f0" : "#fffbe6",
            color: allBoarded ? "#3E9B73" : "#b45309",
            border: `1px solid ${allBoarded ? "#3E9B73" : "#f59e0b"}`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: allBoarded ? "#3E9B73" : "#f59e0b",
              display: "inline-block",
            }}
          />
          {allBoarded
            ? "All employees boarded — deboard mode"
            : "Boarding in progress"}
        </div>

        {/* Employee select */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 13,
              color: "#555",
            }}
          >
            Select Employee
          </label>
          <Select
            placeholder="Select Employee"
            options={employeeOptions}
            value={selectedEmpId}
            onChange={handleEmployeeChange}
            showSearch
            allowClear
            style={{ width: "100%", background: T.formcss.inputBg }}
          />

          {/* Boarded-at hint */}
          {selectedPassenger && !sequenceValidation.blocked && (
            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                color: isDeboardMode ? "#3E9B73" : "#888",
              }}
            >
              {isDeboardMode
                ? `✓ Boarded at ${selectedPassenger.empSigninTime}`
                : "Not yet boarded"}
            </p>
          )}

          {/* Sequence warning */}
          {sequenceValidation.blocked && (
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                background: "#fffbe6",
                border: "0.5px solid #f59e0b",
                borderLeft: "3px solid #f59e0b",
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#b45309",
                  margin: "0 0 2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                Sequence Required
              </p>
              <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
                {sequenceValidation.message}
              </p>
            </div>
          )}
        </div>

        {/* Field errors */}
        {fieldErrors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fieldErrors.map((err) => (
              <div
                key={err.field}
                style={{
                  padding: "10px 12px",
                  background: "#fff5f5",
                  border: "0.5px solid #fca5a5",
                  borderLeft: "3px solid #E24B4A",
                  borderRadius: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#b91c1c",
                    margin: "0 0 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {err.field}
                </p>
                <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
                  {err.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MarkBoardDeboard;