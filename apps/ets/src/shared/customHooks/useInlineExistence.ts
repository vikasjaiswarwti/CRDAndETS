// import { useState, useRef, useCallback } from "react";
// import { useLazyCheckExistsQuery } from "../../features/employee/services/Employeeapi";

// export type ExistenceStatus =
//   | "idle"
//   | "checking"
//   | "available"
//   | "taken"
//   | "error";

// interface State {
//   mobile: ExistenceStatus;
//   email: ExistenceStatus;
// }

// export interface UseInlineExistenceReturn {
//   status: State;
//   checkMobile: (val: string) => void;
//   checkEmail: (val: string) => void;
//   mobileError: string | null;
//   emailError: string | null;
//   reset: () => void;
// }

// const MOBILE_RE = /^\d{10}$/;
// const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// export const useInlineExistence = (
//   enabled = true,
// ): UseInlineExistenceReturn => {
//   const [status, setStatus] = useState<State>({
//     mobile: "idle",
//     email: "idle",
//   });
//   const mTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const eTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [trigger] = useLazyCheckExistsQuery();

//   const checkMobile = useCallback(
//     (val: string) => {
//       if (!enabled) return;
//       if (mTimer.current) clearTimeout(mTimer.current);
//       if (!MOBILE_RE.test(val)) {
//         setStatus((p) => ({ ...p, mobile: "idle" }));
//         return;
//       }
//       setStatus((p) => ({ ...p, mobile: "checking" }));
//       mTimer.current = setTimeout(async () => {
//         try {
//           const r = await trigger({ mobile: val }).unwrap();
//           setStatus((p) => ({
//             ...p,
//             mobile: r.mobileExists ? "taken" : "available",
//           }));
//         } catch {
//           setStatus((p) => ({ ...p, mobile: "error" }));
//         }
//       }, 600);
//     },
//     [enabled, trigger],
//   );

//   const checkEmail = useCallback(
//     (val: string) => {
//       if (!enabled) return;
//       if (eTimer.current) clearTimeout(eTimer.current);
//       if (!EMAIL_RE.test(val)) {
//         setStatus((p) => ({ ...p, email: "idle" }));
//         return;
//       }
//       setStatus((p) => ({ ...p, email: "checking" }));
//       eTimer.current = setTimeout(async () => {
//         try {
//           const r = await trigger({ email: val }).unwrap();
//           setStatus((p) => ({
//             ...p,
//             email: r.emailExists ? "taken" : "available",
//           }));
//         } catch {
//           setStatus((p) => ({ ...p, email: "error" }));
//         }
//       }, 600);
//     },
//     [enabled, trigger],
//   );

//   const reset = useCallback(() => {
//     if (mTimer.current) clearTimeout(mTimer.current);
//     if (eTimer.current) clearTimeout(eTimer.current);
//     setStatus({ mobile: "idle", email: "idle" });
//   }, []);

//   const mobileError =
//     status.mobile === "taken"
//       ? "This mobile number is already registered"
//       : status.mobile === "error"
//         ? "Could not verify — try again"
//         : null;

//   const emailError =
//     status.email === "taken"
//       ? "This email is already registered"
//       : status.email === "error"
//         ? "Could not verify — try again"
//         : null;

//   return { status, checkMobile, checkEmail, mobileError, emailError, reset };
// };

import { useState, useRef, useCallback } from "react";
import { useLazyCheckExistsQuery } from "../../features/employee/services/Employeeapi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExistenceStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

interface State {
  mobile: ExistenceStatus;
  email: ExistenceStatus;
}

export interface UseInlineExistenceReturn {
  status: State;
  checkMobile: (val: string) => void;
  checkEmail: (val: string) => void;
  mobileError: string | null;
  emailError: string | null;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_RE = /^\d{10}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const DEBOUNCE_MS = 600;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Real-time duplicate check for mobile & email fields.
 *
 * API contract (GET /api/v1/Users/check-exists):
 *   ?mobile=XXXXXXXXXX  →  { result: { mobileExists: boolean, ... }, isSuccess: boolean }
 *   ?email=xxx@yyy.zzz  →  { result: { emailExists: boolean,  ... }, isSuccess: boolean }
 *
 * Pass `enabled = false` to skip all checks (e.g. for admin flows).
 */
export const useInlineExistence = (
  enabled = true,
): UseInlineExistenceReturn => {
  const [status, setStatus] = useState<State>({
    mobile: "idle",
    email: "idle",
  });

  const mTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trigger] = useLazyCheckExistsQuery();

  // ── Mobile check ────────────────────────────────────────────────────────────

  const checkMobile = useCallback(
    (val: string) => {
      // Bail-out: feature disabled
      if (!enabled) return;

      // Cancel any pending debounce
      if (mTimer.current) clearTimeout(mTimer.current);

      // Reset to idle when value is not yet a valid 10-digit number
      if (!MOBILE_RE.test(val)) {
        setStatus((p) => ({ ...p, mobile: "idle" }));
        return;
      }

      // Optimistic "checking" indicator
      setStatus((p) => ({ ...p, mobile: "checking" }));

      mTimer.current = setTimeout(async () => {
        try {
          // RTK Query lazy trigger — sends GET ?mobile=<val>
          const response = await trigger({ mobile: val }).unwrap();
          // response.result.mobileExists comes from the API shape shown in the spec
          setStatus((p) => ({
            ...p,
            mobile: response.result.mobileExists ? "taken" : "available",
          }));
        } catch {
          setStatus((p) => ({ ...p, mobile: "error" }));
        }
      }, DEBOUNCE_MS);
    },
    [enabled, trigger],
  );

  // ── Email check ─────────────────────────────────────────────────────────────

  const checkEmail = useCallback(
    (val: string) => {
      if (!enabled) return;

      if (eTimer.current) clearTimeout(eTimer.current);

      if (!EMAIL_RE.test(val)) {
        setStatus((p) => ({ ...p, email: "idle" }));
        return;
      }

      setStatus((p) => ({ ...p, email: "checking" }));

      eTimer.current = setTimeout(async () => {
        try {
          // RTK Query lazy trigger — sends GET ?email=<val>
          const response = await trigger({ email: val }).unwrap();
          setStatus((p) => ({
            ...p,
            email: response.result.emailExists ? "taken" : "available",
          }));
        } catch {
          setStatus((p) => ({ ...p, email: "error" }));
        }
      }, DEBOUNCE_MS);
    },
    [enabled, trigger],
  );

  // ── Reset ───────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    if (mTimer.current) clearTimeout(mTimer.current);
    if (eTimer.current) clearTimeout(eTimer.current);
    setStatus({ mobile: "idle", email: "idle" });
  }, []);

  // ── Derived error strings ───────────────────────────────────────────────────

  const mobileError =
    status.mobile === "taken"
      ? "This mobile number is already registered — please use a different number"
      : status.mobile === "error"
        ? "Could not verify availability — please try again"
        : null;

  const emailError =
    status.email === "taken"
      ? "This email is already registered — please use a different email"
      : status.email === "error"
        ? "Could not verify availability — please try again"
        : null;

  return { status, checkMobile, checkEmail, mobileError, emailError, reset };
};
