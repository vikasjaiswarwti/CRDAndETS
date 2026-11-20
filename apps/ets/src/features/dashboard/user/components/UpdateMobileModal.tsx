import React, { useState, useRef, useCallback } from "react";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";
import { useInlineOtp } from "../../../../shared/customHooks/useInlineOtp";
import { useInlineExistence } from "../../../../shared/customHooks/useInlineExistence";
import type { FieldError } from "../../../../shared/types/api-error.types";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ── Constants ──────────────────────────────────────────────────────────────────

const OTP_LENGTH = 4;
const G = "#1d9e75"; // green — only hardcoded brand color
const MOBILE_RE = /^[6-9]\d{9}$/;
// ── Types ──────────────────────────────────────────────────────────────────────

// Single source of truth for where we are in the flow
type Phase =
  | "view" // showing current number
  | "enter" // user typing new number
  | "otp" // OTP sent, awaiting entry
  | "submitting" // OTP verified, API in flight
  | "success" // done
  | "failed"; // API error

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  serverErrors?: FieldError[] | null;
  currentMobile?: string | null; // e.g. "9876543210" — shown in view phase
}

// ── Component ──────────────────────────────────────────────────────────────────

export const UpdateMobileModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  serverErrors,
  currentMobile = "",
}) => {
  const { Modal, Button } = useUILibrary();

  // ── State ────────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("view");
  const [mobileNo, setMobile] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [apiError, setApiError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = useInlineOtp("S");
  const existence = useInlineExistence(true);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const otpString = digits.join("");
  const otpReady = otpString.length === OTP_LENGTH;

  const existenceChecking = existence.status.mobile === "checking";
  const mobileTaken = existence.status.mobile === "taken";
  const mobileAvailable = existence.status.mobile === "available";

  const mobileValid = MOBILE_RE.test(mobileNo); // ← Now defined
  const canSendOtp =
    mobileValid && mobileAvailable && !existenceChecking && !otp.isSending;

  // ── Reset everything ──────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setPhase("view");
    setMobile("");
    setDigits(Array(OTP_LENGTH).fill(""));
    setApiError(null);
    otp.reset();
    existence.reset();
  }, [otp, existence]);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleMobileChange = (value: string) => {
    const cleaned = value.replace(/^91/, "").slice(0, 10);
    setMobile(cleaned);

    // Reset OTP and existence when number changes
    if (cleaned !== mobileNo) {
      otp.reset();
      setDigits(Array(OTP_LENGTH).fill(""));

      if (cleaned.length === 10) {
        existence.checkMobile(cleaned);
      } else {
        existence.reset();
      }
    }
  };

  // ── Send OTP ──────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!canSendOtp) return;
    setPhase("otp");
    await otp.sendOtp(mobileNo);
    // If sending failed, go back
    if (otp.status === "error") {
      setPhase("enter");
    }
  };

  // Watch otp.status to transition phase after sendOtp resolves
  // (sendOtp is async so we use a useEffect pattern inline via derived value)
  const showOtpPhase = phase === "otp";

  // ── OTP digit handlers ────────────────────────────────────────────────────────
  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };

  const handleDigitKey = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    p.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    otpRefs.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otpReady) return;
    await otp.verifyOtp(mobileNo, otpString);
    // If verified, go straight to submit
    if (otp.isVerified) {
      await handleFinalSubmit();
    }
  };

  // ── Final API submit ──────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setPhase("submitting");
    setApiError(null);
    try {
      await onSubmit({ mobileNo });
      setPhase("success");
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.message ??
        "Unable to update number. Please try again.";
      setApiError(msg);
      setPhase("failed");
    }
  };

  // ── OTP wrong — show red outline when status is 'error' ───────────────────────
  const otpWrong = otp.status === "error" && phase === "otp";

  // ── Format display number ─────────────────────────────────────────────────────
  const fmt = (n: string) => (n ? `+91 ${n.slice(0, 5)} ${n.slice(5)}` : "—");

  // ── Render ────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (otp.isVerified && phase === "otp") {
      handleFinalSubmit();
    }
  }, [otp.isVerified, phase]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Update mobile number"
      width={440}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0,60,30,0.35)" },
        content: { borderRadius: 16 },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: "4px 0 8px",
        }}
      >
        {/* ── Phase: view ── */}
        {phase === "view" && (
          <>
            <div style={sectionLabel}>Current mobile number</div>
            <div style={currentRow}>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {currentMobile ? `+91 ${currentMobile}` : "—"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: currentMobile ? G : "var(--color-text-danger)",
                    marginTop: 2,
                  }}
                >
                  {currentMobile ? "✓ Verified" : "Invalid"}
                </div>
              </div>
              <button
                onClick={() => setPhase("enter")}
                style={{
                  fontSize: 13,
                  color: G,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Change
              </button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <Button onClick={handleClose}>Close</Button>
            </div>
          </>
        )}

        {/* ── Phase: enter ── */}
        {phase === "enter" && (
          <>
            <div style={sectionLabel}>New mobile number</div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  flex: 1,
                  position: "relative",
                }}
              >
                <PhoneInput
                  country="in"
                  onlyCountries={["in"]}
                  disableDropdown
                  countryCodeEditable={false}
                  value={mobileNo ? `91${mobileNo}` : ""}
                  onChange={handleMobileChange}
                  inputProps={{
                    autoFocus: true,
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  inputStyle={{
                    width: "100%",
                    height: 38,
                    borderRadius: 8,
                    fontSize: 14,
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    border: `1px solid ${
                      mobileTaken
                        ? "var(--color-border-danger)"
                        : mobileAvailable
                          ? "var(--color-border-success)"
                          : "var(--color-border-secondary)"
                    }`,
                    paddingLeft: 52,
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    border: "none",
                    background: "transparent",
                  }}
                />

                {/* STATUS */}
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                  }}
                >
                  {existenceChecking && (
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      …
                    </span>
                  )}

                  {mobileAvailable && <span style={{ color: G }}>✓</span>}

                  {mobileTaken && (
                    <span style={{ color: "var(--color-text-danger)" }}>✕</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={!canSendOtp || otp.isSending}
                onClick={handleSendOtp}
                style={primaryBtn(!canSendOtp || otp.isSending)}
              >
                {otp.isSending ? "Sending…" : "Send OTP"}
              </button>
            </div>

            {/* Status hint */}
            {mobileNo.length > 0 && mobileNo.length < 10 && (
              <div style={{ ...hint, color: "var(--color-text-tertiary)" }}>
                {10 - mobileNo.length} more digits needed
              </div>
            )}
            {existenceChecking && (
              <div style={{ ...hint, color: "var(--color-text-tertiary)" }}>
                Checking availability…
              </div>
            )}
            {mobileAvailable && (
              <div style={{ ...hint, color: G }}>
                ✓ Number available — tap Send OTP
              </div>
            )}
            {mobileTaken && (
              <div style={{ ...hint, color: "var(--color-text-danger)" }}>
                This number is already registered
              </div>
            )}
            {otp.error && otp.status === "error" && phase === "enter" && (
              <div style={{ ...hint, color: "var(--color-text-danger)" }}>
                {otp.error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <Button
                onClick={() => {
                  otp.reset();
                  existence.reset();
                  setMobile("");
                  setPhase("view");
                }}
              >
                Back
              </Button>
            </div>
          </>
        )}

        {/* ── Phase: otp ── */}
        {showOtpPhase && (
          <>
            <div style={sectionLabel}>Verify OTP</div>

            {/* Show locked number */}
            <div style={currentRow}>
              <div>
                <div
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  Sending to
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {`+91 ${mobileNo}`}
                </div>
              </div>
              <button
                onClick={() => {
                  otp.reset();
                  setDigits(Array(OTP_LENGTH).fill(""));
                  setPhase("enter");
                }}
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Change
              </button>
            </div>

            {/* OTP digits */}
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                background: "var(--color-background-secondary)",
                borderRadius: 10,
                border: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 12,
                }}
              >
                Enter the 4-digit OTP
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {Array(OTP_LENGTH)
                  .fill(null)
                  .map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digits[i]}
                      onChange={(e) => handleDigit(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKey(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      disabled={otp.isVerifying}
                      style={{
                        width: 42,
                        height: 46,
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 500,
                        border: `1.5px solid ${otpWrong ? "var(--color-border-danger)" : digits[i] ? G : "var(--color-border-secondary)"}`,
                        borderRadius: 8,
                        background: "var(--color-background-primary)",
                        color: "var(--color-text-primary)",
                        outline: "none",
                        transition: "border-color 0.15s",
                      }}
                    />
                  ))}
              </div>

              {/* Wrong OTP error */}
              {otpWrong && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-danger)",
                    marginBottom: 10,
                  }}
                >
                  Incorrect OTP. Please try again.
                </div>
              )}

              {/* Resend */}
              <div
                style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}
              >
                {otp.countdown > 0 ? (
                  <>
                    Resend in{" "}
                    <span
                      style={{
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {otp.countdown}s
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDigits(Array(OTP_LENGTH).fill(""));
                      otp.sendOtp(mobileNo);
                    }}
                    style={{
                      fontSize: 12,
                      color: G,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 500,
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Verify button */}
            <button
              type="button"
              disabled={!otpReady || otp.isVerifying}
              onClick={handleVerifyOtp}
              style={{
                ...primaryBtn(!otpReady || otp.isVerifying),
                marginTop: 14,
                width: "100%",
                height: 40,
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              {otp.isVerifying ? "Verifying…" : "Verify & Update Number"}
            </button>
          </>
        )}

        {/* ── Phase: submitting ── */}
        {phase === "submitting" && (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div
              style={{
                fontSize: 15,
                color: "var(--color-text-primary)",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              OTP verified ✓
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Please wait, updating your number…
            </div>
          </div>
        )}

        {/* ── Phase: success ── */}
        {phase === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--color-background-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <span style={{ fontSize: 22, color: G }}>✓</span>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--color-text-success)",
                marginBottom: 6,
              }}
            >
              Mobile number updated
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                marginBottom: 20,
              }}
            >
              Your new number {fmt(mobileNo)} is now active.
            </div>
            <Button
              type="primary"
              onClick={handleClose}
              style={{ background: G, borderColor: G }}
            >
              Done
            </Button>
          </div>
        )}

        {/* ── Phase: failed ── */}
        {phase === "failed" && (
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                padding: "12px 14px",
                background: "var(--color-background-danger)",
                borderRadius: 10,
                border: "0.5px solid var(--color-border-danger)",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-danger)",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Update failed
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-danger)" }}>
                {apiError ?? "Something went wrong. Please try again."}
              </div>
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button onClick={resetAll}>Try again</Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}

        {/* Server errors from parent (prop-based) */}
        {serverErrors &&
          serverErrors.length > 0 &&
          phase !== "success" &&
          phase !== "failed" && (
            <div style={{ marginTop: 12 }}>
              {serverErrors.map((e, i) => (
                <div
                  key={i}
                  style={{ fontSize: 12, color: "var(--color-text-danger)" }}
                >
                  • {e.message}
                </div>
              ))}
            </div>
          )}
      </div>
    </Modal>
  );
};

// ── Style helpers ──────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "var(--color-text-tertiary)",
  //   textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 10,
};

const currentRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  background: "var(--color-background-secondary)",
  borderRadius: 10,
  border: "0.5px solid var(--color-border-tertiary)",
};

const hint: React.CSSProperties = { fontSize: 11, marginTop: 5 };

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  height: 36,
  padding: "0 16px",
  background: disabled ? "var(--color-background-secondary)" : "#1d9e75",
  color: disabled ? "var(--color-text-tertiary)" : "#fff",
  border: `0.5px solid ${disabled ? "var(--color-border-secondary)" : "#0f6e56"}`,
  borderRadius: 8,
  fontSize: 13,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.6 : 1,
  whiteSpace: "nowrap" as const,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s",
});
