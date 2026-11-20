import React, { useRef, useState, useEffect } from "react";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import type { UseOtpVerificationReturn } from "../../customHooks/useOtpVerification";
import type { ExistenceStatus } from "../../../shared/customHooks/useFieldExistence";

const OTP_LENGTH = 6;

interface OtpVerificationFieldProps {
  mobileNo: string;
  onMobileChange: (val: string) => void;
  otp: UseOtpVerificationReturn;
  disabled?: boolean;
  mobileLabel?: string;
  existenceStatus?: ExistenceStatus; // optional — passed from parent
  existenceError?: string | null; // "already registered" message
}

export const OtpVerificationField: React.FC<OtpVerificationFieldProps> = ({
  mobileNo,
  onMobileChange,
  otp,
  disabled = false,
  mobileLabel = "Mobile number",
  existenceStatus = "idle",
  existenceError = null,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otp.status === "idle") setDigits(Array(OTP_LENGTH).fill(""));
  }, [otp.status]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const otpString = digits.join("");
  const otpComplete = otpString.length === OTP_LENGTH;
  const verified = otp.isVerified;
  const isMobileLocked = [
    "pending",
    "verifying",
    "verified",
    "sending",
  ].includes(otp.status);
  const showOtpInput = ["pending", "verifying", "error"].includes(otp.status);

  // Send OTP disabled if mobile taken or not valid format
  const mobileBlocked =
    existenceStatus === "taken" || existenceStatus === "checking";
  const canSendOtp = mobileNo.length === 10 && !disabled && !mobileBlocked;

  // Suffix icon for mobile input
  const mobileSuffix = () => {
    if (verified) return null; // badge shown separately
    if (existenceStatus === "checking")
      return <LoadingOutlined style={{ color: "#888", fontSize: 12 }} />;
    if (existenceStatus === "available")
      return <CheckCircleFilled style={{ color: "#1d9e75", fontSize: 12 }} />;
    if (existenceStatus === "taken")
      return <span style={{ color: "#e53e3e", fontSize: 11 }}>✕ Taken</span>;
    return null;
  };

  const mobileError = existenceError ?? otp.error ?? null;
  const showError = !verified && mobileError;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Mobile input row */}
      <div>
        <label style={labelStyle}>{mobileLabel}</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={mobileNo}
              onChange={(e) =>
                onMobileChange(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              disabled={disabled || isMobileLocked}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
              style={{
                ...inputStyle,
                borderColor: verified
                  ? "#1d9e75"
                  : existenceStatus === "taken"
                    ? "#e53e3e"
                    : existenceStatus === "available"
                      ? "#1d9e75"
                      : undefined,
                paddingRight: 32,
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {mobileSuffix()}
            </span>
          </div>

          {/* Verified badge */}
          {verified && (
            <span style={verifiedBadgeStyle}>
              <CheckCircleFilled style={{ color: "#1d9e75", fontSize: 16 }} />
              Verified
            </span>
          )}

          {/* Send / Resend / Change */}
          {!verified && (
            <>
              {otp.status === "idle" && (
                <button
                  type="button"
                  disabled={!canSendOtp}
                  onClick={() => otp.sendOtp(mobileNo)}
                  style={sendBtnStyle(canSendOtp)}
                >
                  {otp.isSending ? (
                    <>
                      <LoadingOutlined /> Sending…
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              )}
              {showOtpInput && (
                <button
                  type="button"
                  onClick={() => otp.reset()}
                  style={{
                    ...sendBtnStyle(true),
                    background: "transparent",
                    color: "var(--color-text-secondary)",
                    border: "0.5px solid var(--color-border-secondary)",
                  }}
                >
                  Change
                </button>
              )}
            </>
          )}
        </div>

        {/* Error under mobile input */}
        {showError && (
          <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 4 }}>
            {mobileError}
          </div>
        )}
      </div>

      {/* OTP digit inputs */}
      {showOtpInput && (
        <div>
          <label style={labelStyle}>Enter OTP</label>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {Array(OTP_LENGTH)
              .fill(null)
              .map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onPaste={i === 0 ? handleDigitPaste : undefined}
                  disabled={disabled || otp.isVerifying}
                  style={digitStyle}
                />
              ))}

            <div
              style={{
                marginLeft: 6,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {otp.countdown > 0 ? (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Resend in {otp.countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDigits(Array(OTP_LENGTH).fill(""));
                    otp.sendOtp(mobileNo);
                  }}
                  style={{
                    fontSize: 12,
                    color: "#1d9e75",
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

          <button
            type="button"
            disabled={!otpComplete || otp.isVerifying || disabled}
            onClick={() => otp.verifyOtp(mobileNo, otpString)}
            style={{
              ...sendBtnStyle(otpComplete && !otp.isVerifying),
              marginTop: 10,
              width: "100%",
              height: 36,
            }}
          >
            {otp.isVerifying ? (
              <>
                <LoadingOutlined /> Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* OTP-specific error (wrong code etc.) */}
          {otp.error && !existenceError && (
            <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 6 }}>
              {otp.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  border: "0.5px solid var(--color-border-secondary)",
  borderRadius: 8,
  fontSize: 14,
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const digitStyle: React.CSSProperties = {
  width: 42,
  height: 46,
  textAlign: "center",
  fontSize: 18,
  fontWeight: 500,
  border: "0.5px solid var(--color-border-secondary)",
  borderRadius: 8,
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  outline: "none",
};

const sendBtnStyle = (active: boolean): React.CSSProperties => ({
  height: 36,
  padding: "0 16px",
  border: `0.5px solid ${active ? "#0f6e56" : "var(--color-border-secondary)"}`,
  borderRadius: 8,
  fontSize: 13,
  background: active ? "#1d9e75" : "var(--color-background-secondary)",
  color: active ? "#fff" : "var(--color-text-secondary)",
  cursor: active ? "pointer" : "default",
  opacity: active ? 1 : 0.55,
  whiteSpace: "nowrap" as const,
  transition: "all 0.15s",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  display: "block",
  marginBottom: 6,
};

const verifiedBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#1d9e75",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  padding: "0 4px",
};
