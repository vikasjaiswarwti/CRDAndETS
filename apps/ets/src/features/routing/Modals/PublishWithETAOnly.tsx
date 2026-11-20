// src/features/routeManagement/Modals/UpdateTripsheetsModal.tsx
import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTripPrintOrPublishFilterWiseWithETAMutation } from "../services/RouteManagementApi";
import type { PublishWithETAPayload } from "../types/RouteTypes";

interface Props {
  open: boolean;
  onClose: () => void;
  payload: PublishWithETAPayload;
}

type Step = "confirm" | "loading" | "done";

export const PublishWithETAOnly: React.FC<Props> = ({
  open,
  onClose,
  payload,
}) => {
  const { Modal, Button } = useUILibrary();
  const [publishTrips] = useTripPrintOrPublishFilterWiseWithETAMutation();

  const [step, setStep] = useState<Step>("confirm");
  const [resultMsg, setResultMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    setStep("loading");
    try {
      const res = await publishTrips({
        LocCode: payload.locCode,
        TripDate: payload.routeDate,
        TripType: payload.tripType,
        ShiftID: payload.shiftId,
      }).unwrap();

      setIsSuccess(res.isSuccess ?? true);
      setResultMsg(res.message ?? "Trips published successfully.");
    } catch (err: any) {
      setIsSuccess(false);
      setResultMsg(
        err?.data?.message ?? "Something went wrong. Please try again.",
      );
    } finally {
      setStep("done");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setStep("confirm");
      setResultMsg("");
      setIsSuccess(false);
    }, 300);
  };

  return (
    <Modal
      open={open}
      onCancel={step === "loading" ? () => {} : handleClose}
      closable={step !== "loading"}
      maskClosable={step !== "loading"}
      footer={null}
      width={420}
      destroyOnClose={false}
      title={
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1B4332" }}>
          Publish Trips
        </div>
      }
      styles={{
        mask: { background: "rgba(0,60,30,0.35)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { padding: "12px 24px 24px" },
      }}
      style={{ borderRadius: 16, top: "30vh" }}
    >
      {/* ── Shift info chip ─────────────────────────────────────────────── */}
      {/* <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px",
          background: "#F0FAF4",
          border: "1px solid #B7E4C7",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          color: "#166534",
          marginBottom: 16,
        }}
      >
        <span>Shift {payload.shiftId}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{payload.tripType === 1 ? "Login" : "Logout"}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{payload.shiftId}</span>
      </div> */}

      {/* ── Content by step ─────────────────────────────────────────────── */}
      {step === "confirm" && (
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "12px 14px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: 10,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B45309"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p
            style={{
              fontSize: 13,
              color: "#92400E",
              margin: 0,
              lineHeight: 1.55,
              fontWeight: 500,
            }}
          >
            Are you sure you want to publish selected trips{" "}
            <strong>without assigning vehicle and driver</strong>?
          </p>
        </div>
      )}

      {step === "loading" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "12px 0",
            color: "#6B7280",
            fontSize: 13,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              border: "3px solid #D1FAE5",
              borderTopColor: "#059669",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Publishing trips…
        </div>
      )}

      {step === "done" && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            background: isSuccess ? "#D1FAE5" : "#FEF2F2",
            border: `1px solid ${isSuccess ? "#6EE7B7" : "#FECACA"}`,
            fontSize: 14,
            fontWeight: 600,
            color: isSuccess ? "#065F46" : "#991B1B",
            textAlign: "center",
          }}
        >
          {isSuccess ? "✅ " : "❌ "}
          {resultMsg}
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        {step !== "loading" && (
          <Button
            onClick={handleClose}
            style={{
              borderRadius: 50,
              borderColor: "#D1D5DB",
              color: "#374151",
            }}
          >
            {step === "done" ? "Close" : "Cancel"}
          </Button>
        )}
        {step === "confirm" && (
          <Button
            type="primary"
            onClick={handleConfirm}
            style={{
              borderRadius: 50,
              background: "#1B4332",
              borderColor: "#1B4332",
              fontWeight: 600,
              paddingInline: 24,
            }}
          >
            Yes, Publish
          </Button>
        )}
      </div>
    </Modal>
  );
};
