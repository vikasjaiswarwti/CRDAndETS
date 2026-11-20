// // src/features/routeManagement/Modals/UpdateTripsheetsModal.tsx
// import React, { useState } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import {
//   useGetTripPrintOrPublishFilterWiseMutation,
//   usePublishTripsMutation,
// } from "../services/RouteManagementApi";
// import type { UpdateTripsheetsPayload } from "../types/RouteTypes";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   payload: UpdateTripsheetsPayload;
// }

// type Step = "confirm" | "loading" | "done";

// export const UpdateTripsheetsModal: React.FC<Props> = ({
//   open,
//   onClose,
//   payload,
// }) => {
//   const { Modal, Button } = useUILibrary();

//   const [fetchTrips] = useGetTripPrintOrPublishFilterWiseMutation();
//   const [publishTrips] = usePublishTripsMutation();

//   const [step, setStep] = useState<Step>("confirm");
//   const [resultMsg, setResultMsg] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);

//   // Reset state whenever modal opens
//   // const handleOpen = () => {
//   //   setStep("confirm");
//   //   setResultMsg("");
//   //   setIsSuccess(false);
//   // };

//   const handleConfirm = async () => {
//     setStep("loading");
//     try {
//       // 1. Fetch trips for this specific shift
//       const res = await fetchTrips({
//         LocCode: payload.locCode,
//         TripDate: payload.date,
//         TripType: payload.tripType,
//         ShiftID: payload.shiftId,
//       }).unwrap();

//       const trips = res.result ?? [];
//       const unpublished = trips.filter((t) => t.tripStatus !== "Published");

//       if (unpublished.length === 0) {
//         setResultMsg("All trips for this shift are already published.");
//         setIsSuccess(true);
//         setStep("done");
//         return;
//       }

//       // 2. Publish them all
//       const tripIdStr = unpublished.map((t) => t.tripId).join(",");
//       const publishRes = await publishTrips({ tripId: tripIdStr }).unwrap();

//       setResultMsg(
//         publishRes.message ??
//           `${unpublished.length} trip${unpublished.length !== 1 ? "s" : ""} published successfully.`,
//       );
//       setIsSuccess(true);
//     } catch {
//       setResultMsg("Something went wrong. Please try again.");
//       setIsSuccess(false);
//     } finally {
//       setStep("done");
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     // Reset after close animation
//     setTimeout(() => {
//       setStep("confirm");
//       setResultMsg("");
//     }, 300);
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={step === "loading" ? () => {} : handleClose}
//       closable={step !== "loading"}
//       maskClosable={step !== "loading"}
//       footer={null}
//       width={420}
//       destroyOnClose={false}
//       title={
//         <div style={{ fontSize: 16, fontWeight: 700, color: "#1B4332" }}>
//           Publish Trips
//         </div>
//       }
//       styles={{
//         mask: { background: "rgba(0,60,30,0.35)" },
//         header: { borderBottom: "none", paddingBottom: 0 },
//         body: { padding: "12px 24px 24px" },
//       }}
//       style={{ borderRadius: 16, top: "30vh" }}
//     >
//       {/* ── Shift info chip ─────────────────────────────────────────────── */}
//       <div
//         style={{
//           display: "inline-flex",
//           alignItems: "center",
//           gap: 8,
//           padding: "4px 12px",
//           background: "#F0FAF4",
//           border: "1px solid #B7E4C7",
//           borderRadius: 999,
//           fontSize: 12,
//           fontWeight: 600,
//           color: "#166534",
//           marginBottom: 16,
//         }}
//       >
//         <span>Shift {payload.shiftId}</span>
//         <span style={{ opacity: 0.4 }}>·</span>
//         <span>{payload.tripType === 1 ? "Login" : "Logout"}</span>
//         <span style={{ opacity: 0.4 }}>·</span>
//         <span>{payload.date}</span>
//       </div>

//       {/* ── Content by step ─────────────────────────────────────────────── */}
//       {step === "confirm" && (
//         <div>
//           <p
//             style={{
//               fontSize: 14,
//               color: "#374151",
//               margin: "0 0 6px",
//               lineHeight: 1.6,
//             }}
//           >
//             All trips for the selected shift will be marked as published.
//           </p>
//           <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
//             Already-published trips will be skipped automatically.
//           </p>
//         </div>
//       )}

//       {step === "loading" && (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 10,
//             padding: "12px 0",
//             color: "#6B7280",
//             fontSize: 13,
//           }}
//         >
//           <div
//             style={{
//               width: 28,
//               height: 28,
//               border: "3px solid #D1FAE5",
//               borderTopColor: "#059669",
//               borderRadius: "50%",
//               animation: "spin 0.7s linear infinite",
//             }}
//           />
//           <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//           Fetching and publishing trips…
//         </div>
//       )}

//       {step === "done" && (
//         <div
//           style={{
//             padding: "14px 16px",
//             borderRadius: 10,
//             background: isSuccess ? "#D1FAE5" : "#FEF2F2",
//             border: `1px solid ${isSuccess ? "#6EE7B7" : "#FECACA"}`,
//             fontSize: 14,
//             fontWeight: 600,
//             color: isSuccess ? "#065F46" : "#991B1B",
//             textAlign: "center",
//           }}
//         >
//           {isSuccess ? "✅ " : "❌ "}
//           {resultMsg}
//         </div>
//       )}

//       {/* ── Actions ─────────────────────────────────────────────────────── */}
//       <div
//         style={{
//           display: "flex",
//           gap: 10,
//           justifyContent: "flex-end",
//           marginTop: 20,
//         }}
//       >
//         {step !== "loading" && (
//           <Button
//             onClick={handleClose}
//             style={{
//               borderRadius: 50,
//               borderColor: "#D1D5DB",
//               color: "#374151",
//             }}
//           >
//             {step === "done" ? "Close" : "Cancel"}
//           </Button>
//         )}

//         {step === "confirm" && (
//           <Button
//             type="primary"
//             onClick={handleConfirm}
//             style={{
//               borderRadius: 50,
//               background: "#1B4332",
//               borderColor: "#1B4332",
//               fontWeight: 600,
//               paddingInline: 24,
//             }}
//           >
//             Yes, Publish
//           </Button>
//         )}
//       </div>
//     </Modal>
//   );
// };

// src/features/routeManagement/Modals/UpdateTripsheetsModal.tsx
import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  useGetTripPrintOrPublishFilterWiseMutation,
  usePublishTripsMutation,
} from "../services/RouteManagementApi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  payload: {
    locCode: number;
    date: string;
    shiftId: number;
    tripType: number;
    shiftTime?: string;
  };
}

type Step = "confirm" | "loading" | "done";

interface DoneState {
  isSuccess: boolean;
  message: string;
}

// Things that are locked after publishing
const LOCKED_ACTIONS = [
  "Change vehicle or cab assignment",
  "Change vendor",
  "Assign physical ID / flap number",
  "Modify trip assignments",
];

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const UpdateTripsheetsModal: React.FC<Props> = ({
  open,
  onClose,
  onRefresh,
  payload,
}) => {
  const { Modal } = useUILibrary();
  const [fetchTrips] = useGetTripPrintOrPublishFilterWiseMutation();
  const [publishTrips] = usePublishTripsMutation();

  const [step, setStep] = useState<Step>("confirm");
  const [done, setDone] = useState<DoneState | null>(null);

  const isLogin = payload.tripType === 1;

  // ── publish flow ───────────────────────────────────────────────────────────

  const handlePublish = async () => {
    setStep("loading");
    try {
      // 1. Fetch unpublished trips for this shift
      const fetchRes = (await fetchTrips({
        LocCode: payload.locCode,
        TripDate: payload.date,
        TripType: payload.tripType,
        ShiftID: payload.shiftId,
      }).unwrap()) as {
        result?: { tripId: number; tripStatus: string }[];
        isSuccess?: boolean;
        message?: string;
      };
      const trips = fetchRes.result ?? [];
      const unpublished = trips.filter((t) => t.tripStatus !== "Published");
      // ----- 29 July Amit Start -----
      if (fetchRes.isSuccess == false) {
        setDone({
          isSuccess: fetchRes.isSuccess,
          message: fetchRes.message ?? "",
        });
        setStep("done");
        return;
      }
      // ----- 29 July End -----

      if (unpublished.length === 0) {
        setDone({
          isSuccess: true,
          message: "All trips for this shift are already published.",
        });
        setStep("done");
        return;
      }

      // 2. Publish them
      const tripIdStr = unpublished.map((t) => t.tripId).join(",");
      const pubRes = (await publishTrips({ tripId: tripIdStr }).unwrap()) as {
        isSuccess: boolean;
        message: string;
      };

      setDone({
        isSuccess: pubRes.isSuccess,
        message:
          pubRes.message ??
          (pubRes.isSuccess
            ? `${unpublished.length} trip(s) published successfully.`
            : "Publishing failed."),
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

  // ── close / reset ──────────────────────────────────────────────────────────

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("confirm");
      setDone(null);
    }, 300);
  };

  const handleRefresh = () => {
    onRefresh?.();
    handleClose();
  };

  const isRunning = step === "loading";

  return (
    <Modal
      open={open}
      onCancel={isRunning ? () => {} : handleClose}
      closable={!isRunning}
      maskClosable={!isRunning}
      footer={null}
      width={460}
      destroyOnClose={false}
      styles={{
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px 0", marginBottom: 0 },
        body: { padding: "16px 24px 24px" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
            <Send size={16} strokeWidth={1.8} />
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
              Publish Trips
            </div>
            {/* Shift metadata badges */}
            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
              {[
                payload.date,
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
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isLogin ? "#EFF6FF" : "#FFF7ED",
                  color: isLogin ? "#1D4ED8" : "#C2410C",
                  borderRadius: 5,
                  padding: "1px 8px",
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
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* ── Confirm view ────────────────────────────────────────────── */}
        {step === "confirm" && (
          <>
            {/* Main warning — irreversible actions */}
            <div
              style={{
                padding: "12px 14px",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#92400E",
                }}
              >
                <AlertTriangle
                  size={14}
                  strokeWidth={2}
                  style={{ color: "#D97706", flexShrink: 0 }}
                />
                Once published, the following actions will be locked:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {LOCKED_ACTIONS.map((action) => (
                  <div
                    key={action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        flexShrink: 0,
                        background: "#FEF3C7",
                        border: "1px solid #FDE68A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lock
                        size={10}
                        strokeWidth={2.5}
                        style={{ color: "#D97706" }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "#78350F" }}>
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm message */}
            <div
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
                paddingLeft: 2,
              }}
            >
              Please verify that all vehicle, vendor, driver, and route details
              are correct before proceeding.{" "}
              <strong style={{ color: "#0F172A" }}>
                This action cannot be undone.
              </strong>
            </div>
          </>
        )}

        {/* ── Loading view ─────────────────────────────────────────────── */}
        {step === "loading" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "20px 0",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2
                size={22}
                strokeWidth={2}
                style={{
                  color: "#16A34A",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
              Fetching and publishing trips…
            </div>
          </div>
        )}

        {/* ── Done view ───────────────────────────────────────────────── */}
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
                  color: done.isSuccess ? "#15803D" : "#991B1B",
                  marginBottom: 3,
                }}
              >
                {done.isSuccess
                  ? "Published successfully"
                  : "Publishing failed"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: done.isSuccess ? "#166534" : "#B91C1C",
                  lineHeight: 1.5,
                }}
              >
                {done.message}
              </div>
              {!done.isSuccess && (
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                  Please ensure vendor, vehicle, and driver are attached to all
                  trips before retrying.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
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

          {/* Refresh button after successful publish */}
          {step === "done" && done?.isSuccess && onRefresh && (
            <button
              onClick={handleRefresh}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                color: "#15803D",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} strokeWidth={2.5} />
              Refresh Data
            </button>
          )}

          {/* Publish button — confirm step */}
          {step === "confirm" && (
            <button
              onClick={handlePublish}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: "#16A34A",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                justifyContent: "center",
                minWidth: 130,
              }}
            >
              <Send size={13} strokeWidth={2.5} />
              Yes, Publish
            </button>
          )}

          {/* Spinner — loading step */}
          {isRunning && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 22px",
                borderRadius: 8,
                background: "#D1FAE5",
                color: "#065F46",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Loader2
                size={13}
                strokeWidth={2.5}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Publishing…
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
