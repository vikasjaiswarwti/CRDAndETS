import { useState, useRef, useCallback } from "react";
import { useSendOtpMutation, useVerifyOtpMutation } from "../services/otpApi";
import type { OtpRequestType } from "../services/otpApi";

export type OtpStatus =
  | "idle"
  | "sending"
  | "pending"
  | "verifying"
  | "verified"
  | "error";

export interface UseInlineOtpReturn {
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

export const useInlineOtp = (
  requestType: OtpRequestType,
): UseInlineOtpReturn => {
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sendOtpMutation, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtpMutation, { isLoading: isVerifying }] =
    useVerifyOtpMutation();

  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOtp = useCallback(
    async (mobileNo: string) => {
      setError(null);
      setStatus("sending");
      try {
        const result = await sendOtpMutation({
          mobileNo,
          requestType,
        }).unwrap();
        if (result.success === false) {
          setStatus("error");
          setError(result.message ?? "Failed to send OTP");
          return;
        }
        setStatus("pending");
        startCountdown();
      } catch (err: any) {
        setStatus("error");
        setError(err?.data?.message ?? "Failed to send OTP. Try again.");
      }
    },
    [requestType, sendOtpMutation, startCountdown],
  );

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
          setError(result.message ?? "Invalid OTP. Try again.");
          return;
        }
        setStatus("verified");
        if (timerRef.current) clearInterval(timerRef.current);
      } catch (err: any) {
        setStatus("error");
        setError(err?.data?.message ?? "Verification failed. Try again.");
      }
    },
    [requestType, verifyOtpMutation],
  );

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
    isSending,
    isVerifying,
    sendOtp,
    verifyOtp,
    reset,
  };
};
