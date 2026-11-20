import { useState, useRef, useCallback } from "react";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  type OtpRequestType,
} from "../services/otpApi";

export type OtpStatus =
  | "idle"
  | "sending"
  | "pending"
  | "verifying"
  | "verified"
  | "error";

interface UseOtpVerificationOptions {
  requestType: OtpRequestType;
  resendCooldownSeconds?: number;
}

export interface UseOtpVerificationReturn {
  status: OtpStatus;
  error: string | null;
  countdown: number;
  isVerified: boolean;
  isSending: boolean;
  isVerifying: boolean;
  sendOtp: (mobileNo: string) => Promise<void>;
  verifyOtp: (mobileNo: string, otp: string) => Promise<void>;
  reset: () => void;
}

export const useOtpVerification = ({
  requestType,
  resendCooldownSeconds = 60,
}: UseOtpVerificationOptions): UseOtpVerificationReturn => {
    
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── RTK mutations ──────────────────────────────────────────────────────────
  const [sendOtpMutation, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtpMutation, { isLoading: isVerifying }] =
    useVerifyOtpMutation();

  // ── Countdown timer ────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(resendCooldownSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCooldownSeconds]);

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const sendOtp = useCallback(
    async (mobileNo: string) => {
      setError(null);
      setStatus("sending");
      try {
        const result = await sendOtpMutation({
          mobileNo,
          requestType,
        }).unwrap();

        // Some backends return { success: false } with 200 status
        if (result.success === false) {
          setStatus("error");
          setError(result.message ?? "Failed to send OTP. Please try again.");
          return;
        }

        setStatus("pending");
        startCountdown();
      } catch (err: any) {
        setStatus("error");
        // RTK Query puts server error details in err.data
        const msg =
          err?.data?.message ??
          err?.message ??
          "Failed to send OTP. Please try again.";
        setError(msg);
      }
    },
    [requestType, sendOtpMutation, startCountdown],
  );

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(
    async (mobileNo: string, otp: string) => {
      setError(null);
      setStatus("verifying");
      try {
        const result = await verifyOtpMutation({
          mobileNo,
          otp: Number(otp),
          requestType,
        }).unwrap();

        if (result.success === false) {
          setStatus("error");
          setError(result.message ?? "Invalid OTP. Please try again.");
          return;
        }

        setStatus("verified");
        if (timerRef.current) clearInterval(timerRef.current);
      } catch (err: any) {
        setStatus("error");
        const msg =
          err?.data?.message ??
          err?.message ??
          "OTP verification failed. Please try again.";
        setError(msg);
      }
    },
    [requestType, verifyOtpMutation],
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setError(null);
    setCountdown(0);
  }, []);

  return {
    status,
    error,
    countdown,
    isVerified: status === "verified",
    isSending, // from RTK — more accurate than local 'sending' status
    isVerifying, // from RTK
    sendOtp,
    verifyOtp,
    reset,
  };
};
