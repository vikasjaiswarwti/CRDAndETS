/**
 * formValidation.ts
 * Shared validation rule factories for compliance Add Vehicle / Add Driver forms.
 *
 * Usage:
 *   import { v } from '../utils/formValidation';
 *   rules={[v.required()]}           ← text inputs
 *   rules={[v.requiredSelect()]}      ← Select / DatePicker
 */
import dayjs from "dayjs";
import type { Rule } from "antd/es/form";

const CURRENT_YEAR = new Date().getFullYear();

export const v = {
  /** For text / textarea inputs */
  required: (msg = "This field is required"): Rule => ({
    required: true,
    whitespace: true,
    message: msg,
  }),

  /**
   * For Select, DatePicker, Switch.
   * NO whitespace:true — that flag causes false-positive failures on non-string values.
   */
  requiredSelect: (msg = "This field is required"): Rule => ({
    required: true,
    message: msg,
  }),

  maxLen: (n: number): Rule => ({
    max: n,
    message: `Maximum ${n} characters allowed`,
  }),

  minLen: (n: number): Rule => ({
    min: n,
    message: `At least ${n} characters required`,
  }),

  /**
   * Indian vehicle registration — permissive.
   * Covers all common formats:
   *   DL-01-AB-1234 | MH01AB1234 | UP-58-P-6228 | KA01A0001
   * Separators (space / hyphen) are optional.
   * Series letters: 1–3 chars (some states use 1 letter).
   * Number: 1–4 digits.
   */
  vehicleRegNo: (): Rule => ({
    pattern: /^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}$/i,
    message:
      "Enter a valid registration number (e.g. UP-58-P-6228 or DL-01-AB-1234)",
  }),

  /** Alphanumeric + hyphens */
  alphaNumDash: (label = "This field"): Rule => ({
    pattern: /^[a-zA-Z0-9\-]+$/,
    message: `${label} can only contain letters, numbers, and hyphens`,
  }),

  /** Letters and spaces only — for names */
  lettersOnly: (label = "This field"): Rule => ({
    pattern: /^[a-zA-Z\s]+$/,
    message: `${label} should contain only letters`,
  }),

  /** Indian mobile: 10 digits starting with 6-9 */
  mobile: (): Rule => ({
    pattern: /^[6-9]\d{9}$/,
    message: "Enter a valid 10-digit mobile number (must start with 6–9)",
  }),

  /** 4-digit make year: 1980 - current+1 */
  makeYear: (): Rule => ({
    validator: (_, value: string | undefined) => {
      if (!value) return Promise.resolve();
      const y = parseInt(value, 10);
      if (isNaN(y) || y < 1980 || y > CURRENT_YEAR + 1) {
        return Promise.reject(
          `Make year must be between 1980 and ${CURRENT_YEAR + 1}`,
        );
      }
      return Promise.resolve();
    },
  }),

  /** Expiry / future dates */
  futureDate: (label = "Date"): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const d = dayjs.isDayjs(value) ? value : dayjs(value);
      if (!d.isValid()) return Promise.reject("Invalid date");
      return d.isBefore(dayjs(), "day")
        ? Promise.reject(`${label} must be today or a future date`)
        : Promise.resolve();
    },
  }),

  /** Issue / purchase / install dates */
  pastDate: (label = "Date"): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const d = dayjs.isDayjs(value) ? value : dayjs(value);
      if (!d.isValid()) return Promise.reject("Invalid date");
      return d.isAfter(dayjs(), "day")
        ? Promise.reject(`${label} must be today or a past date`)
        : Promise.resolve();
    },
  }),

  /** Date-of-birth: age 18 - 70 */
  driverDOB: (): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const d = dayjs.isDayjs(value) ? value : dayjs(value);
      if (!d.isValid()) return Promise.reject("Invalid date of birth");
      const age = dayjs().diff(d, "year");
      if (age < 18)
        return Promise.reject("Driver must be at least 18 years old");
      if (age > 70) return Promise.reject("Please verify the date of birth");
      return Promise.resolve();
    },
  }),

  /** License issue must be before license expiry */
  licenseDateOrder: (form: any): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const expiry = form.getFieldValue("licenseExpDate");
      if (!expiry) return Promise.resolve();
      const issue = dayjs.isDayjs(value) ? value : dayjs(value);
      const exp = dayjs.isDayjs(expiry) ? expiry : dayjs(expiry);
      return issue.isAfter(exp, "day")
        ? Promise.reject("License issue date must be before expiry date")
        : Promise.resolve();
    },
  }),
};

// ─── Input normalizers ────────────────────────────────────────────────────────
export const normalize = {
  /** Uppercase only — preserves hyphens/spaces so regex can validate them */
  vehicleRegNo: (val: string) => (val ?? "").toUpperCase(),
  mobile: (val: string) => (val ?? "").replace(/\D/g, "").slice(0, 10),
  alphaNumUpper: (val: string) =>
    (val ?? "").toUpperCase().replace(/[^A-Z0-9\-]/g, ""),
  year: (val: string) => (val ?? "").replace(/\D/g, "").slice(0, 4),
  titleCase: (val: string) =>
    (val ?? "").replace(/\b\w/g, (c) => c.toUpperCase()),
};
