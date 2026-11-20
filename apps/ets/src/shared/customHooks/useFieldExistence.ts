import { useState, useRef, useCallback } from "react";
import { useLazyCheckExistsQuery } from "../../features/employee/services/Employeeapi";

export type ExistenceStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

interface FieldExistenceState {
  mobile: ExistenceStatus;
  email: ExistenceStatus;
}

interface UseFieldExistenceOptions {
  enabled?: boolean; // set false to disable all checks (e.g. edit mode)
  debounceMs?: number; // default 600ms
}

export interface UseFieldExistenceReturn {
  status: FieldExistenceState;
  checkMobile: (mobile: string) => void; // call on every onChange
  checkEmail: (email: string) => void;
  getMobileError: () => string | null;
  getEmailError: () => string | null;
  reset: () => void;
}

const MOBILE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const useFieldExistence = ({
  enabled = true,
  debounceMs = 600,
}: UseFieldExistenceOptions = {}): UseFieldExistenceReturn => {
  const [status, setStatus] = useState<FieldExistenceState>({
    mobile: "idle",
    email: "idle",
  });

  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [triggerCheck] = useLazyCheckExistsQuery();

  // ── Mobile ─────────────────────────────────────────────────────────────────
  const checkMobile = useCallback(
    (mobile: string) => {
      if (!enabled) return;

      // Clear previous timer
      if (mobileTimer.current) clearTimeout(mobileTimer.current);

      // Don't check until format is valid
      if (!MOBILE_REGEX.test(mobile)) {
        setStatus((prev) => ({ ...prev, mobile: "idle" }));
        return;
      }

      setStatus((prev) => ({ ...prev, mobile: "checking" }));

      mobileTimer.current = setTimeout(async () => {
        try {
          const result = (await triggerCheck({ mobile }).unwrap()) as any;
          setStatus((prev) => ({
            ...prev,
            mobile: result.mobileExists ? "taken" : "available",
          }));
        } catch {
          setStatus((prev) => ({ ...prev, mobile: "error" }));
        }
      }, debounceMs);
    },
    [enabled, debounceMs, triggerCheck],
  );

  // ── Email ──────────────────────────────────────────────────────────────────
  const checkEmail = useCallback(
    (email: string) => {
      if (!enabled) return;

      if (emailTimer.current) clearTimeout(emailTimer.current);

      if (!EMAIL_REGEX.test(email)) {
        setStatus((prev) => ({ ...prev, email: "idle" }));
        return;
      }

      setStatus((prev) => ({ ...prev, email: "checking" }));

      emailTimer.current = setTimeout(async () => {
        try {
          const result = (await triggerCheck({ email }).unwrap()) as any;

          setStatus((prev) => ({
            ...prev,
            email: result.emailExists ? "taken" : "available",
          }));
        } catch {
          setStatus((prev) => ({ ...prev, email: "error" }));
        }
      }, debounceMs);
    },
    [enabled, debounceMs, triggerCheck],
  );

  // ── Error messages ─────────────────────────────────────────────────────────
  const getMobileError = useCallback((): string | null => {
    if (status.mobile === "taken")
      return "This mobile number is already registered";
    if (status.mobile === "error") return "Could not verify — please try again";
    return null;
  }, [status.mobile]);

  const getEmailError = useCallback((): string | null => {
    if (status.email === "taken") return "This email is already registered";
    if (status.email === "error") return "Could not verify — please try again";
    return null;
  }, [status.email]);

  const reset = useCallback(() => {
    if (mobileTimer.current) clearTimeout(mobileTimer.current);
    if (emailTimer.current) clearTimeout(emailTimer.current);
    setStatus({ mobile: "idle", email: "idle" });
  }, []);

  return {
    status,
    checkMobile,
    checkEmail,
    getMobileError,
    getEmailError,
    reset,
  };
};
