// src/features/routeManagement/Modals/IntershiftCopyModal.tsx
import React, { useState } from "react";
import {
  ArrowLeftRight,
  LogOut,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  CalendarDays,
  ArrowRight,
  LogIn,
  AlertTriangle,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useInterShiftCopyRouteApiMutation } from "../services/RouteManagementApi";
import type { ShiftTypeOption } from "../types/RouteTypes";
import { GUARD_OPTIONS, InfoTip } from "./CopyRoutesModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  payload: {
    locCode: number;
    date: string; // dateToReplicate
    shiftId: number; // shiftToReplicate
    tripType: number; // tripTypeToReplicate  1=Login  2=Logout
    shiftTime?: string;
  };
  loginShiftsOptions?: ShiftTypeOption[];
}

type Step = "form" | "loading" | "done";

interface DoneState {
  isSuccess: boolean;
  message: string;
}

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

export const IntershiftCopyModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
  loginShiftsOptions = [],
}) => {
  const { Modal } = useUILibrary();
  const [interShiftCopy] = useInterShiftCopyRouteApiMutation();

  const [step, setStep] = useState<Step>("form");
  const [done, setDone] = useState<DoneState | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [replicateDate, setReplicateDate] = useState(payload.date);
  const [replicateShift, setReplicateShift] = useState<number | "">("");
  const [guardPlacement, setGuardPlacement] = useState<number | undefined>(
    undefined,
  );

  const isSourceUnsupported = payload.tripType === 1;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!replicateShift || isSourceUnsupported) return;
    setStep("loading");
    try {
      const res = await interShiftCopy({
        locCode: payload.locCode,
        loginShiftId: Number(replicateShift),
        dropShiftId: payload.shiftId,
        routeDate: replicateDate,
        guardPlacement: guardPlacement,
      }).unwrap(); // as { information?: string; dbResponse?: string };
      console.log(res, "res from interShiftCopy");
      setDone({
        isSuccess: true,
        message:
          res.information ??
          res.dbResponse ??
          "Replication completed successfully.",
      });
    } catch (error: unknown) {
      const httpError = error as {
        data?: {
          errors?: Record<string, string[]>;
        };
      };

      const errorMessage =
        httpError?.data?.errors?.["InterShiftCopy.LogoutTripExists"]?.[0] ??
        "Something went wrong. Please try again.";
      setDone({
        isSuccess: false,
        message: errorMessage,
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
      setReplicateDate(payload.date);
      setReplicateShift("");
    }, 300);
  };

  const isRunning = step === "loading";
  const canSubmit = !!replicateShift && !isRunning;

  return (
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
            <ArrowLeftRight size={17} strokeWidth={1.8} />
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
              Intershift Copy
            </div>
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
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  background: payload.tripType == 1 ? "#EFF6FF" : "#FFF7ED",
                  color: payload.tripType == 1 ? "#1D4ED8" : "#B45309",
                  borderRadius: 5,
                  padding: "1px 8px",
                }}
              >
                {payload.tripType == 1 ? (
                  <>
                    <LogIn size={9} strokeWidth={2.5} />
                    Login
                  </>
                ) : (
                  <>
                    <LogOut size={9} strokeWidth={2.5} />
                    Logout
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* ── Unsupported source (Login) notice ───────────────────────────── */}
        {step === "form" && isSourceUnsupported && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 10,
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                flexShrink: 0,
                background: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle
                size={16}
                strokeWidth={2}
                style={{ color: "#B45309" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 3,
                  color: "#92400E",
                }}
              >
                Login shifts can't be copied directly
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#92400E" }}>
                You can only select a Logout trip shift to copy — its routes
                will then be replicated into a Login shift.
              </div>
            </div>
          </div>
        )}
        {/* ── Form ─────────────────────────────────────────────────────── */}
        {step === "form" && isSourceUnsupported == false && (
          <>
            {/* Source → Target direction banner */}
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
                  color: "#1D4ED8",
                }}
              >
                Login Shift
              </div>
              <ArrowRight size={13} style={{ color: "#60A5FA" }} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#C2410C",
                }}
              >
                Logout Shift
              </div>
              <span
                style={{ fontSize: 11, color: "#3B82F6", marginLeft: "auto" }}
              >
                Routes will be copied across shift types
              </span>
            </div>

            {/* ── Replicate Date ── */}
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
                  value={replicateDate}
                  onChange={(e) => setReplicateDate(e.target.value)}
                  disabled={true}
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
                    width: "100%",
                  }}
                />
              </div>
            </Field>

            {/* ── Target Shift dropdown ── */}
            <Field
              label={`Target Login Shift`}
              hint={`Select the login shift to copy routes into`}
            >
              {loginShiftsOptions.length === 0 ? (
                <div
                  style={{
                    padding: "8px 12px",
                    border: "1px dashed #E5E7EB",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  No login shifts available.
                </div>
              ) : (
                <select
                  value={replicateShift}
                  onChange={(e) =>
                    setReplicateShift(Number(e.target.value) || "")
                  }
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#111827",
                    background: "#fff",
                    cursor: "pointer",
                    outline: "none",
                    width: "100%",
                  }}
                >
                  <option value="">— Select shift —</option>
                  {loginShiftsOptions.map((s: ShiftTypeOption) => (
                    <option key={s.value} value={s.value}>
                      {s.label} (Login)
                    </option>
                  ))}
                </select>
              )}
            </Field>
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
                {GUARD_OPTIONS.map((opt, _i) => {
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
                      {/* {i < GUARD_OPTIONS.length - 1 && (
                        <div
                          style={{
                            width: 1,
                            height: 16,
                            background: "#E5E7EB",
                            flexShrink: 0,
                          }}
                        />
                      )} */}
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
              Replicating routes across shifts…
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
                  ? "Replication completed"
                  : "Replication failed"}
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

          {step === "form" && !isSourceUnsupported && (
            <button
              onClick={handleSubmit}
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
              Intershift Copy Routes
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
              Replicating…
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
