import React, { useState, useCallback, useRef } from "react";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useGoogleMap } from "../../../shared/hooks/useGoogleMap";
import { useInlineOtp } from "../../../shared/customHooks/useInlineOtp";
import { useInlineExistence } from "../../../shared/customHooks/useInlineExistence";
import { fetchPincodeDetails } from "../services/pincode.service";
import { useLookups } from "../../lookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { T } from "../../../styles/tokens";
import { LoginPageLogoUrl } from "../../../shared/constants/app.constants";
import type {
  CreateUserStageDto,
  AddressComponents,
  Gender,
} from "../types/Employee.types";
import type { FieldError } from "../../../shared/types/api-error.types";
import {
  IdcardOutlined,
  HomeOutlined,
  MessageOutlined,
  SaveOutlined,
  ManOutlined,
  WomanOutlined,
  StopOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// ─────────────────────────────────────────────────────────────────────────────
// ── TOP-LEVEL FEATURE CONFIG ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Toggle these flags to control feature behaviour globally.
 *
 * enableOtp            – When true  : mobile OTP flow is active; user MUST verify
 *                                     their number before submitting.
 *                        When false : OTP UI is hidden entirely; mobile is treated
 *                                     as a plain text field.
 *
 * enableExistenceCheck – When true  : email & mobile are checked against the server
 *                                     in real-time; duplicates block submission.
 *                        When false : no duplicate check is performed.
 */
export const SIGNUP_CONFIG = {
  enableOtp: true,
  enableExistenceCheck: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ── Constants ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s.\-']+$/;
const DIGITS_RE = /^\d+$/;
const MOBILE_RE = /^\d{10}$/;
const PIN_RE = /^\d{6}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const ADDRESS_RE = /^[^<>{}[\]\\|^`~$%]+$/;
const PHONE_RE = /^[\d\s\-()]+$/;
const EMP_ID_RE = /^[a-zA-Z0-9\-_]+$/;
const OTP_LENGTH = 4;

const INPUT_BG = "#F0FAF4";
const BORDER_COL = "#d0e8d8";
const LABEL_COL = "#52796F";
const GREEN_DARK = T.brand.primary;

// ─────────────────────────────────────────────────────────────────────────────
// ── Key guards ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const allowName = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
  if (!/[a-zA-Z\u00C0-\u024F\s.\-']/.test(e.key)) e.preventDefault();
};
const allowDigits = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
  if (!/\d/.test(e.key)) e.preventDefault();
};
const allowPhone = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
  if (!/[\d\s\-()+]/.test(e.key)) e.preventDefault();
};
const allowEmpId = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
  if (!/[a-zA-Z0-9\-_]/.test(e.key)) e.preventDefault();
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared styles ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  backgroundColor: INPUT_BG,
  borderRadius: 8,
  fontSize: 12,
  width: "100%",
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
};
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: LABEL_COL,
  marginBottom: 3,
  display: "block",
};
const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#333",
  marginBottom: 6,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// ─────────────────────────────────────────────────────────────────────────────
// ── FieldWrap ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

interface FieldWrapProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}
const FieldWrap: React.FC<FieldWrapProps> = ({
  label,
  required,
  error,
  className = "",
  hint,
  children,
}) => (
  <div style={{ marginBottom: 8 }} className={className}>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <div style={{ color: LABEL_COL, fontSize: 10, marginTop: 2 }}>{hint}</div>
    )}
    {error && (
      <div style={{ color: "#e53e3e", fontSize: 10, marginTop: 2 }}>
        {error}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── Gender options ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const GENDER_OPTIONS: {
  label: string;
  value: Gender;
  icon: React.ReactNode;
}[] = [
  { label: "Male", value: "M", icon: <ManOutlined /> },
  { label: "Female", value: "F", icon: <WomanOutlined /> },
  { label: "Other", value: "O", icon: <StopOutlined /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Initial form state ────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const makeInitial = (): Partial<CreateUserStageDto> => ({
  firstName: "",
  middleName: "",
  lastName: "",
  mobileNo: "",
  emailId: "",
  gender: "M",
  address: "",
  city: "",
  state: "",
  stateCode: "",
  pin: "",
  phoneNo: "",
  emerContactNo: "",
  specialNeeds: null,
  empTypeId: 1,
  empType: "",
  employeeId: "",
  locCode: null,
  depCode: null,
  lobCode: null,
  proCode: null,
  geocodeId: null,
  empLat: null,
  empLng: null,
  locationName: "",
  nodalPick: null,
  nodalDrop: null,
  supId: null,
  supervisorName: "",
  supEmployeeId: null,
  spoc: null,
  spocEmployeeId: null,
  transport: null,
  useDayPickupPoint: null,
  tpin: null,
  actionType: null,
  departmentName: "",
  projectName: "",
  regisLocation: null,
  ipAddress: null,
  id: null,
  locality: null,
});

// ─────────────────────────────────────────────────────────────────────────────
// ── Props ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicEmployeeSignupFormProps {
  onSubmit: (values: CreateUserStageDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  /**
   * Overrides the top-level SIGNUP_CONFIG.enableOtp at instance level.
   * Leave undefined to use the config default.
   */
  enableOtp?: boolean;
  /**
   * Overrides the top-level SIGNUP_CONFIG.enableExistenceCheck at instance level.
   * Leave undefined to use the config default.
   */
  enableExistenceCheck?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Component ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export const PublicEmployeeSignupForm: React.FC<
  PublicEmployeeSignupFormProps
> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
  // Prop overrides fall back to the global SIGNUP_CONFIG
  enableOtp = SIGNUP_CONFIG.enableOtp,
  enableExistenceCheck = SIGNUP_CONFIG.enableExistenceCheck,
}) => {
  const isMobile = useIsMobile();
  const { Input, Select, Button, Spin } = useUILibrary();
  const { statesOptions } = useLookups({
    only: ["statesOptions"],
  });

  const [form, setForm] = useState<Partial<CreateUserStageDto>>(makeInitial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── OTP state ────────────────────────────────────────────────────────────────
  const otp = useInlineOtp("S");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  // Track whether the latest auto-verify attempt failed (to colour boxes red)
  const [otpFailed, setOtpFailed] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Existence check ───────────────────────────────────────────────────────────
  const existence = useInlineExistence(enableExistenceCheck);

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Derived gating flags ──────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * mobileBlocked  – true while the existence check is in-flight or confirmed taken
   * canSendOtp     – user typed a valid 10-digit number that is not yet known taken
   * otpVerified    – true when OTP flow is disabled (bypass) OR already verified
   * canSubmit      – master gate for the Create Account button
   */
  const mobileBlocked =
    existence.status.mobile === "taken" ||
    existence.status.mobile === "checking";

  const canSendOtp = (form.mobileNo?.length ?? 0) === 10 && !mobileBlocked;

  // When OTP is disabled we treat mobile as always "verified"
  const otpVerified = !enableOtp || otp.isVerified;

  const emailTaken = enableExistenceCheck && existence.status.email === "taken";
  const mobileTaken =
    enableExistenceCheck && existence.status.mobile === "taken";

  const canSubmit = otpVerified && !emailTaken && !mobileTaken;

  const showOtpBox =
    enableOtp && ["pending", "verifying", "error"].includes(otp.status);

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Helpers ───────────────────────────────────────────────────────────────
  // ────
  // ─────────────────────────────────────────────────────────────────────────────

  const getStateCode = (name?: string | null) => {
    if (!name) return null;
    const m = statesOptions.find(
      (s) => s.label.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    return m ? Number(m.value) : null;
  };

  const set = useCallback(
    <K extends keyof CreateUserStageDto>(
      key: K,
      value: CreateUserStageDto[K],
    ) => {
      setForm((p) => ({ ...p, [key]: value }));
      setErrors((p) => {
        const n = { ...p };
        delete n[key as string];
        return n;
      });
    },
    [],
  );

  const setError = useCallback((field: string, msg: string | null) => {
    setErrors((p) => {
      if (!msg) {
        const n = { ...p };
        delete n[field];
        return n;
      }
      return { ...p, [field]: msg };
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // ── OTP digit handlers ────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Called whenever a digit box changes. After filling the last box we
   * automatically trigger verification — no separate button needed.
   */
  const handleOtpDigit = async (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    const next = [...otpDigits];
    next[i] = val;
    setOtpDigits(next);
    setOtpFailed(false); // reset red state on new input

    // Move focus forward
    if (val && i < OTP_LENGTH - 1) {
      otpRefs.current[i + 1]?.focus();
    }

    // Auto-verify when last digit is filled
    const full = next.join("");
    if (full.length === OTP_LENGTH && next.every((d) => d !== "")) {
      try {
        await otp.verifyOtp(form.mobileNo ?? "", full);
        // verifyOtp updates otp.isVerified internally; failure throws or sets otp.error
      } catch {
        setOtpFailed(true);
      }
      // If otp hook sets an error string we also mark failed
      if (otp.error) setOtpFailed(true);
    }
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    p.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtpDigits(next);
    otpRefs.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();

    // Auto-verify if paste fills all digits
    if (p.length === OTP_LENGTH) {
      otp.verifyOtp(form.mobileNo ?? "", p).catch(() => setOtpFailed(true));
    }
  };

  const resetOtp = () => {
    otp.reset();
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpFailed(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Mobile change ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMobileChange = (raw: string) => {
    const val = raw.replace(/\D/g, "").slice(0, 10);
    set("mobileNo", val);

    if (enableOtp) resetOtp();

    // Always run existence check (honours enableExistenceCheck internally)
    existence.checkMobile(val);

    if (!val) setError("mobileNo", "Mobile number is required");
    else if (!MOBILE_RE.test(val))
      setError("mobileNo", "Must be exactly 10 digits");
    else setError("mobileNo", null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Email change ──────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  const handleEmailChange = (val: string) => {
    set("emailId", val);
    existence.checkEmail(val);
    if (!val) setError("emailId", "Email is required");
    else if (!EMAIL_RE.test(val))
      setError("emailId", "Enter a valid email address");
    else setError("emailId", null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Address via map ───────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAddressChange = useCallback(
    (components: AddressComponents) => {
      const sc = getStateCode(components.state);
      setForm((p) => ({
        ...p,
        address: components.fullAddress,
        city: components.city || p.city,
        pin: components.pin || p.pin,
        state: components.state || p.state,
        stateCode: sc || p.stateCode,
        empLat: components.lat,
        empLng: components.lng,
        locationName: components.fullAddress,
        locality: components.locality || p.locality, // ← add
      }));
      setErrors((p) => {
        const n = { ...p };
        delete n.address;
        delete n.city;
        delete n.pin;
        delete n.stateCode;
        delete n.mapLocation;
        return n;
      });
    },
    [statesOptions],
  );

  const { mapRef, searchInputRef, isLoaded, isGeocoding } = useGoogleMap({
    onAddressChange: handleAddressChange,
    defaultLat: 28.6139,
    defaultLng: 77.209,
  });

  const handlePinChange = async (pin: string) => {
    set("pin", pin);
    if (!/^\d{6}$/.test(pin)) return;
    const r = await fetchPincodeDetails(pin);
    if (!r) return;
    const sc = getStateCode(r.state);
    setForm((p) => ({
      ...p,
      city: r.city || p.city,
      state: r.state || p.state,
      stateCode: sc || p.stateCode,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Validation ────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    const fn = form.firstName?.trim() ?? "";
    if (!fn) e.firstName = "First name is required";
    else if (fn.length < 2) e.firstName = "Minimum 2 characters";
    else if (fn.length > 50) e.firstName = "Maximum 50 characters";
    else if (!NAME_REGEX.test(fn))
      e.firstName = "Only letters, spaces, hyphens and dots";

    const mn = form.middleName?.trim() ?? "";
    if (mn && !NAME_REGEX.test(mn))
      e.middleName = "Only letters, spaces, hyphens and dots";
    if (mn.length > 50) e.middleName = "Maximum 50 characters";

    const ln = form.lastName?.trim() ?? "";
    if (!ln) e.lastName = "Last name is required";
    else if (ln.length < 2) e.lastName = "Minimum 2 characters";
    else if (!NAME_REGEX.test(ln))
      e.lastName = "Only letters, spaces, hyphens and dots";

    const eid = form.employeeId?.trim() ?? "";
    if (eid && !EMP_ID_RE.test(eid))
      e.employeeId = "Only letters, digits, hyphens and underscores";
    if (eid.length > 30) e.employeeId = "Maximum 30 characters";

    if (!form.gender) e.gender = "Gender is required";

    const mob = form.mobileNo?.trim() ?? "";
    if (!mob) e.mobileNo = "Mobile number is required";
    else if (!DIGITS_RE.test(mob)) e.mobileNo = "Digits only";
    else if (!MOBILE_RE.test(mob)) e.mobileNo = "Must be exactly 10 digits";

    // OTP gate — only when feature is enabled
    if (enableOtp && !otp.isVerified) {
      e.mobileNo = "Please verify your mobile number via OTP";
    }
    // Existence gate — always enforced regardless of OTP flag
    if (enableExistenceCheck && existence.status.mobile === "taken") {
      e.mobileNo = "This mobile number is already registered";
    }

    const email = form.emailId?.trim() ?? "";
    if (!email) e.emailId = "Email is required";
    else if (email.length > 254) e.emailId = "Email too long";
    else if (!EMAIL_RE.test(email)) e.emailId = "Enter a valid email address";
    if (enableExistenceCheck && existence.status.email === "taken") {
      e.emailId = "This email is already registered";
    }

    const phone = form.phoneNo?.trim() ?? "";
    if (phone && !PHONE_RE.test(phone))
      e.phoneNo = "Digits, spaces, hyphens and brackets only";
    if (phone.replace(/\D/g, "").length > 12)
      e.phoneNo = "Phone number too long";

    if (!form.stateCode) e.stateCode = "State is required";

    const city = form.city?.trim() ?? "";
    if (!city) e.city = "City is required";
    else if (!NAME_REGEX.test(city)) e.city = "Letters and spaces only";
    else if (city.length > 60) e.city = "Maximum 60 characters";

    const pin = form.pin?.trim() ?? "";
    if (!pin) e.pin = "Pincode is required";
    else if (!DIGITS_RE.test(pin)) e.pin = "Digits only";
    else if (!PIN_RE.test(pin)) e.pin = "Must be exactly 6 digits";

    const addr = form.address?.trim() ?? "";
    if (!addr) e.address = "Address is required";
    else if (addr.length < 3) e.address = "Address too short";
    else if (addr.length > 500) e.address = "Maximum 500 characters";
    else if (!ADDRESS_RE.test(addr))
      e.address = "Address contains invalid characters";

    if (!form.empLat || !form.empLng) {
      e.mapLocation = "Please select your location on the map";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Submit ────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return; // extra guard beyond the disabled button
    if (!validate()) return;
    await onSubmit({
      id: null,
      firstName: form.firstName?.trim() || null,
      middleName: form.middleName?.trim() || null,
      lastName: form.lastName?.trim() ?? "",
      mobileNo: form.mobileNo?.trim() ?? "",
      emailId: form.emailId?.trim().toLowerCase() ?? "",
      gender: form.gender ?? "M",
      address: form.address?.trim() || null,
      city: form.city?.trim() || null,
      state: form.state || null,
      stateCode: Number(form.stateCode) || "",
      pin: form.pin?.trim() || null,
      phoneNo: form.phoneNo?.trim() || null,
      emerContactNo: form.emerContactNo?.trim() || null,
      employeeId: form.employeeId?.trim() || null,
      empType: "Permanent",
      empTypeId: 1,
      locCode: null,
      depCode: null,
      proCode: null,
      lobCode: null,
      geocodeId: null,
      empLat: form.empLat ?? null,
      empLng: form.empLng ?? null,
      locationName: form.locationName || null,
      nodalPick: null,
      nodalDrop: null,
      supId: null,
      supervisorName: null,
      supEmployeeId: null,
      spoc: null,
      spocEmployeeId: null,
      transport: null,
      useDayPickupPoint: null,
      specialNeeds: null,
      tpin: null,
      actionType: null,
      departmentName: null,
      projectName: null,
      regisLocation: null,
      ipAddress: null,
      locality: form.locality ?? null,
    });
  };

  const inp = { ...fieldStyle };
  const sel = { ...fieldStyle };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Render ────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "#F8F8F8",
        minHeight: "100vh",
        padding: isMobile ? "10px 6px" : "20px 12px",
      }}
    >
      <div
        style={{
          maxWidth: isMobile ? "100%" : 1100,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          border: `1px solid ${BORDER_COL}`,
          boxShadow: "0 4px 24px rgba(27,67,50,0.10)",
          padding: isMobile ? "9px 10px" : "18px 25px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: isMobile ? 8 : 20,
          }}
        >
          {onCancel && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                style={{
                  paddingInline: isMobile ? 0 : 10,
                  color: LABEL_COL,
                  fontWeight: 500,
                  fontSize: isMobile ? 12 : 16,
                }}
              >
                Back
              </Button>
            </div>
          )}
          <img
            src={LoginPageLogoUrl}
            alt="COMMUTR"
            style={{ height: isMobile ? 24 : 28, objectFit: "contain" }}
          />
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${BORDER_COL}` }} />
        <div
          style={{
            fontSize: isMobile ? 13 : 15,
            fontWeight: 600,
            color: "rgb(0,92,61)",
            letterSpacing: 0.2,
            margin: "5px",
            textAlign: "center",
          }}
        >
          User Registration
        </div>

        {/* ── Two-column layout ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2.7fr 2.3fr",
            gap: isMobile ? 12 : 32,
          }}
        >
          {/* ══════════════════════════ LEFT COLUMN ══════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Personal */}
            <section>
              <div style={sectionTitle}>
                <IdcardOutlined /> Personal Details
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                  gap: isMobile ? "4px 8px" : "6px 16px",
                }}
              >
                <FieldWrap label="First Name" required error={errors.firstName}>
                  <Input
                    value={form.firstName ?? ""}
                    onChange={(e: any) => {
                      set("firstName", e.target.value);
                      if (!e.target.value.trim())
                        setError("firstName", "First name is required");
                      else setError("firstName", null);
                    }}
                    onKeyDown={allowName}
                    style={inp}
                    placeholder="First Name"
                    maxLength={50}
                  />
                </FieldWrap>
                <FieldWrap label="Middle Name" error={errors.middleName}>
                  <Input
                    value={form.middleName ?? ""}
                    onChange={(e: any) => set("middleName", e.target.value)}
                    onKeyDown={allowName}
                    style={inp}
                    placeholder="Middle Name"
                    maxLength={50}
                  />
                </FieldWrap>
                <FieldWrap label="Last Name" required error={errors.lastName}>
                  <Input
                    value={form.lastName ?? ""}
                    onChange={(e: any) => {
                      set("lastName", e.target.value);
                      if (!e.target.value.trim())
                        setError("lastName", "Last name is required");
                      else setError("lastName", null);
                    }}
                    onKeyDown={allowName}
                    style={inp}
                    placeholder="Last Name"
                    maxLength={50}
                  />
                </FieldWrap>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
                  gap: isMobile ? "4px 8px" : "6px 16px",

                  alignItems: "start",
                }}
              >
                <FieldWrap
                  label="User ID"
                  error={errors.employeeId}
                  hint="Letters, digits, - and _ only"
                >
                  <Input
                    value={form.employeeId ?? ""}
                    onChange={(e: any) => set("employeeId", e.target.value)}
                    onKeyDown={allowEmpId}
                    style={inp}
                    placeholder="EMP-0000"
                    maxLength={30}
                  />
                </FieldWrap>
                <FieldWrap label="Gender" required error={errors.gender}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {GENDER_OPTIONS.map(({ label, value, icon }) => {
                      const selected = form.gender === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => set("gender", value)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 12,
                            border: selected
                              ? "1px solid #4CAF82"
                              : "1px solid #E5E7EB",
                            background: selected
                              ? "#4CAF82"
                              : T.formcss.inputBg,
                            color: selected ? "#fff" : "#666",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600,
                            minHeight: 34,
                          }}
                        >
                          {icon} {label}
                        </button>
                      );
                    })}
                  </div>
                </FieldWrap>
              </div>
            </section>
            {/* Communication */}
            {!isMobile && (
              <>
                <section>
                <div style={sectionTitle}>
                  <HomeOutlined /> Address
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: isMobile ? "4px 8px" : "6px 16px",
                  }}
                >
                  <FieldWrap label="Pincode" required error={errors.pin}>
                    <Input
                      value={form.pin ?? ""}
                      onChange={(e) => handlePinChange(e.target.value)}
                      onKeyDown={allowDigits}
                      style={inp}
                      placeholder="Enter Pin Code"
                      maxLength={6}
                    />
                  </FieldWrap>
                  <FieldWrap label="State" required error={errors.stateCode}>
                    <Select
                      value={form.stateCode ?? undefined}
                      onChange={(v: string) => {
                        const opt = statesOptions.find((o) => o.value === v);
                        set("stateCode", Number(v));
                        set("state", opt?.label ?? null);
                      }}
                      options={statesOptions}
                      style={sel}
                      placeholder="— Select State —"
                      showSearch
                      allowClear
                      defaultActiveFirstOption={false}
                    />
                  </FieldWrap>
                  <FieldWrap label="City" required error={errors.city}>
                    <Input
                      value={form.city ?? ""}
                      onChange={(e: any) => set("city", e.target.value)}
                      onKeyDown={allowName}
                      style={inp}
                      placeholder="Enter city"
                      maxLength={60}
                    />
                  </FieldWrap>

                  <FieldWrap label="Locality / Area" error={errors.locality}>
                    <Input
                      value={(form as any).locality ?? ""}
                      onChange={(e: any) =>
                        set("locality" as any, e.target.value)
                      }
                      style={inp}
                      placeholder="Locality / Area" 
                      maxLength={100}
                    />
                  </FieldWrap>
                </div>
              </section>
              <section>
                <div style={sectionTitle}>
                  <MessageOutlined /> Communication
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? "4px 8px" : "6px 16px",
                  }}
                >
                  {/* ── Email with existence check ── */}
                  <FieldWrap
                    label="Official Email ID"
                    required
                    error={errors.emailId}
                  >
                    <div style={{ position: "relative" }}>
                      <Input
                        type="email"
                        value={form.emailId ?? ""}
                        onChange={(e: any) => handleEmailChange(e.target.value)}
                        style={{
                          ...inp,
                          borderColor:
                            existence.status.email === "taken"
                              ? "#e53e3e"
                              : existence.status.email === "available"
                                ? "#1d9e75"
                                : undefined,
                          paddingRight: 28,
                        }}
                        placeholder="Enter Email Id"
                        maxLength={254}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {existence.status.email === "checking" && (
                          <LoadingOutlined
                            style={{ fontSize: 12, color: "#888" }}
                          />
                        )}
                        {existence.status.email === "available" && (
                          <CheckCircleFilled
                            style={{ fontSize: 12, color: "#1d9e75" }}
                          />
                        )}
                        {existence.status.email === "taken" && (
                          <span style={{ fontSize: 11, color: "#e53e3e" }}>
                            ✕
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Extra inline hint for taken email */}
                    {existence.status.email === "taken" && !errors.emailId && (
                      <div
                        style={{ color: "#e53e3e", fontSize: 10, marginTop: 2 }}
                      >
                        {existence.emailError}
                      </div>
                    )}
                    {existence.emailError &&
                      !errors.emailId &&
                      existence.status.email !== "taken" && (
                        <div
                          style={{
                            color: "#e53e3e",
                            fontSize: 10,
                            marginTop: 2,
                          }}
                        >
                          {existence.emailError}
                        </div>
                      )}
                  </FieldWrap>

                  <FieldWrap
                    label="Landline No."
                    error={errors.phoneNo}
                    // hint="Digits, spaces, - () only"
                  >
                    <Input
                      value={form.phoneNo ?? ""}
                      onChange={(e: any) => set("phoneNo", e.target.value)}
                      onKeyDown={allowPhone}
                      style={inp}
                      placeholder="011 23456789"
                      maxLength={15}
                    />
                  </FieldWrap>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FieldWrap
                      label="Mobile No."
                      required
                      error={errors.mobileNo}
                    >
                      {/* ── Mobile input row ── */}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1, position: "relative" }}>
                          <input
                            value={form.mobileNo ?? ""}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            // FIX: was `otpLocked` — that blocked the field even after verification.
                            // Now only locks while the OTP box is actively shown.
                            disabled={enableOtp && showOtpBox}
                            placeholder="Enter Mobile No."
                            maxLength={10}
                            inputMode="numeric"
                            onKeyDown={allowDigits}
                            style={{
                              height: 32,
                              padding: "0 28px 0 10px",
                              border: `1px solid ${
                                otp.isVerified
                                  ? "#1d9e75"
                                  : existence.status.mobile === "taken"
                                    ? "#e53e3e"
                                    : BORDER_COL
                              }`,
                              borderRadius: 8,
                              fontSize: 12,
                              // background: INPUT_BG,
                              background: T.formcss.inputBg,
                              // border: `1px solid ${T.formcss.greyBorder}`,
                              width: "100%",
                              outline: "none",
                              color: "#333",
                            }}
                          />

                          {/* Status icon inside mobile field */}
                          <span
                            style={{
                              position: "absolute",
                              right: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {otp.isVerified ? (
                              <CheckCircleFilled
                                style={{ fontSize: 13, color: "#1d9e75" }}
                              />
                            ) : existence.status.mobile === "checking" ? (
                              <LoadingOutlined
                                style={{ fontSize: 12, color: "#888" }}
                              />
                            ) : existence.status.mobile === "available" ? (
                              <CheckCircleFilled
                                style={{ fontSize: 12, color: "#1d9e75" }}
                              />
                            ) : existence.status.mobile === "taken" ? (
                              <span style={{ fontSize: 10, color: "#e53e3e" }}>
                                ✕
                              </span>
                            ) : null}
                          </span>
                        </div>

                        {/* "Already registered" banner */}
                        {existence.status.mobile === "taken" && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#e53e3e",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Already registered
                          </span>
                        )}

                        {/* Send OTP — only when idle and not yet verified */}
                        {enableOtp && otp.status === "idle" && (
                          <button
                            type="button"
                            disabled={!canSendOtp}
                            onClick={() => otp.sendOtp(form.mobileNo ?? "")}
                            style={otpBtnStyle(canSendOtp)}
                          >
                            {otp.isSending ? (
                              <>
                                <LoadingOutlined /> Sending…
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        )}

                        {/* FIX: Change Number — visible in EVERY non-idle state INCLUDING after verification.
          Previously "Change" was hidden once verified, leaving user stuck. */}
                        {enableOtp && otp.status !== "idle" && (
                          <button
                            type="button"
                            onClick={() => {
                              resetOtp();
                              set("mobileNo", ""); // clear field so user types a fresh number
                              existence.checkMobile(""); // reset the existence status badge
                            }}
                            style={{
                              ...otpBtnStyle(true),
                              background: "transparent",
                              color: "#52796F",
                              borderColor: BORDER_COL,
                            }}
                          >
                            Change Number
                          </button>
                        )}

                        {/* Verified badge */}
                        {enableOtp && otp.isVerified && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#1d9e75",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {/* ── OTP digit boxes — auto-verify on last digit ── */}
                      {showOtpBox && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "12px",
                            background: "#f9fdf9",
                            borderRadius: 8,
                            border: `1px solid ${BORDER_COL}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: LABEL_COL,
                              marginBottom: 8,
                              fontWeight: 600,
                            }}
                          >
                            Enter {OTP_LENGTH}-digit OTP
                            {otp.isVerifying && (
                              <span style={{ marginLeft: 8, color: "#888" }}>
                                <LoadingOutlined style={{ fontSize: 11 }} />{" "}
                                Verifying…
                              </span>
                            )}
                            {otpFailed && !otp.isVerifying && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: "#e53e3e",
                                  fontSize: 10,
                                }}
                              >
                                Incorrect OTP — try again
                              </span>
                            )}
                          </div>

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
                                    otpRefs.current[i] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={otpDigits[i]}
                                  onChange={(e) =>
                                    handleOtpDigit(i, e.target.value)
                                  }
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  onPaste={i === 0 ? handleOtpPaste : undefined}
                                  disabled={otp.isVerifying}
                                  style={{
                                    width: 38,
                                    height: 42,
                                    textAlign: "center",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    border: `1px solid ${
                                      otpFailed
                                        ? "#e53e3e"
                                        : otp.isVerified
                                          ? "#1d9e75"
                                          : BORDER_COL
                                    }`,
                                    borderRadius: 8,
                                    background: otpFailed
                                      ? "#fff5f5"
                                      : otp.isVerified
                                        ? "#f0fdf4"
                                        : INPUT_BG,
                                    outline: "none",
                                    transition:
                                      "border-color 0.2s, background 0.2s",
                                  }}
                                />
                              ))}

                            {/* Resend section */}
                            <div style={{ marginLeft: 4 }}>
                              {otp.countdown > 0 ? (
                                <span
                                  style={{ fontSize: 11, color: LABEL_COL }}
                                >
                                  Resend in {otp.countdown}s
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                                    setOtpFailed(false);
                                    otp.sendOtp(form.mobileNo ?? "");
                                  }}
                                  style={{
                                    fontSize: 12,
                                    color: GREEN_DARK,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontWeight: 600,
                                  }}
                                >
                                  Resend OTP
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Generic OTP error from hook */}
                          {otp.error && !otpFailed && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#e53e3e",
                                marginTop: 6,
                              }}
                            >
                              {otp.error}
                            </div>
                          )}
                        </div>
                      )}
                    </FieldWrap>
                  </div>
                </div>
              </section>
              </>
            )}
            {/* Server errors */}
            {serverErrors && serverErrors.length > 0 && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fc8181",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                {serverErrors.map((e, i) => (
                  <div key={i} style={{ color: "#c53030", fontSize: 12 }}>
                    • {e.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════ RIGHT COLUMN — Map ══════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={sectionTitle}>
              <EnvironmentOutlined /> Location on Map{" "}
              <span style={{ color: "#e53e3e" }}>*</span>
            </div>
            {errors.mapLocation && (
              <div
                style={{
                  color: "#e53e3e",
                  fontSize: 11,
                  marginTop: -4,
                  marginBottom: 4,
                }}
              >
                {errors.mapLocation}
              </div>
            )}
            <div style={{ position: "relative" }}>
              <input
                ref={searchInputRef as React.RefObject<HTMLInputElement>}
                type="text"
                placeholder="Search Location"
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 8,
                  // border: `1px solid ${BORDER_COL}`,
                  background: T.formcss.inputBg,
                  border: `1px solid ${T.formcss.greyBorder}`,
                  fontSize: 12,
                  outline: "none",
                }}
              />
              {/* Geocoding loader inside search bar — only within map section */}
              {isGeocoding && (
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <Spin size="small" />
                </span>
              )}
            </div>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                // border: `1px solid ${BORDER_COL}`,
                background: T.formcss.inputBg,
                border: `1px solid ${T.formcss.greyBorder}`,
                flex: 1,
                minHeight: 200,
                maxHeight: 420,
                // background: "#e8f5e9",
                position: "relative",
              }}
            >
              <div
                ref={mapRef as React.RefObject<HTMLDivElement>}
                style={{ width: "100%", height: "100%" }}
              />
              {/* Map-only loading overlay — no global spinner anywhere else */}
              {!isLoaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // background: INPUT_BG,
                    color: LABEL_COL,
                    background: T.formcss.inputBg,
                    // border: `1px solid ${T.formcss.greyBorder}`,
                  }}
                >
                  <Spin /> &nbsp; Loading map…
                </div>
              )}
            </div>
            {isMobile && (
              <>
                <section>
                  <div style={sectionTitle}>
                    <HomeOutlined /> Address
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                      gap: isMobile ? "4px 8px" : "6px 16px",
                    }}
                  >
                    <FieldWrap label="Pincode" required error={errors.pin}>
                      <Input
                        value={form.pin ?? ""}
                        onChange={(e) => handlePinChange(e.target.value)}
                        onKeyDown={allowDigits}
                        style={inp}
                        placeholder="110078"
                        maxLength={6}
                      />
                    </FieldWrap>
                    <FieldWrap label="State" required error={errors.stateCode}>
                      <Select
                        value={form.stateCode ?? undefined}
                        onChange={(v: string) => {
                          const opt = statesOptions.find((o) => o.value === v);
                          set("stateCode", Number(v));
                          set("state", opt?.label ?? null);
                        }}
                        options={statesOptions}
                        style={sel}
                        placeholder="— Select State —"
                        showSearch
                        allowClear
                        defaultActiveFirstOption={false}
                      />
                    </FieldWrap>
                    <FieldWrap label="City" required error={errors.city}>
                      <Input
                        value={form.city ?? ""}
                        onChange={(e: any) => set("city", e.target.value)}
                        onKeyDown={allowName}
                        style={inp}
                        placeholder="e.g. Delhi"
                        maxLength={60}
                      />
                    </FieldWrap>

                    <FieldWrap label="Locality / Area" error={errors.locality}>
                      <Input
                        value={(form as any).locality ?? ""}
                        onChange={(e: any) =>
                          set("locality" as any, e.target.value)
                        }
                        style={inp}
                        placeholder="Sector 142, Noida Extension…"
                        maxLength={100}
                      />
                    </FieldWrap>
                  </div>
                </section>
                <section>
                  <div style={sectionTitle}>
                    <MessageOutlined /> Communication
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: isMobile ? "4px 8px" : "6px 16px",
                    }}
                  >
                    {/* ── Email with existence check ── */}
                    <FieldWrap
                      label="Official Email ID"
                      required
                      error={errors.emailId}
                    >
                      <div style={{ position: "relative" }}>
                        <Input
                          type="email"
                          value={form.emailId ?? ""}
                          onChange={(e: any) =>
                            handleEmailChange(e.target.value)
                          }
                          style={{
                            ...inp,
                            borderColor:
                              existence.status.email === "taken"
                                ? "#e53e3e"
                                : existence.status.email === "available"
                                  ? "#1d9e75"
                                  : undefined,
                            paddingRight: 28,
                          }}
                          placeholder="john@company.com"
                          maxLength={254}
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {existence.status.email === "checking" && (
                            <LoadingOutlined
                              style={{ fontSize: 12, color: "#888" }}
                            />
                          )}
                          {existence.status.email === "available" && (
                            <CheckCircleFilled
                              style={{ fontSize: 12, color: "#1d9e75" }}
                            />
                          )}
                          {existence.status.email === "taken" && (
                            <span style={{ fontSize: 11, color: "#e53e3e" }}>
                              ✕
                            </span>
                          )}
                        </span>
                      </div>
                      {/* Extra inline hint for taken email */}
                      {existence.status.email === "taken" &&
                        !errors.emailId && (
                          <div
                            style={{
                              color: "#e53e3e",
                              fontSize: 10,
                              marginTop: 2,
                            }}
                          >
                            {existence.emailError}
                          </div>
                        )}
                      {existence.emailError &&
                        !errors.emailId &&
                        existence.status.email !== "taken" && (
                          <div
                            style={{
                              color: "#e53e3e",
                              fontSize: 10,
                              marginTop: 2,
                            }}
                          >
                            {existence.emailError}
                          </div>
                        )}
                    </FieldWrap>

                    <FieldWrap
                      label="Landline No."
                      error={errors.phoneNo}
                      // hint="Digits, spaces, - () only"
                    >
                      <Input
                        value={form.phoneNo ?? ""}
                        onChange={(e: any) => set("phoneNo", e.target.value)}
                        onKeyDown={allowPhone}
                        style={inp}
                        placeholder="011 23456789"
                        maxLength={15}
                      />
                    </FieldWrap>

                    {/* ── Mobile + OTP (full row) ── */}
                    {/* <div style={{ gridColumn: "1 / -1" }}>
                  <FieldWrap
                    label="Mobile No."
                    required
                    error={errors.mobileNo}
                  >
                   
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <div style={{ flex: 1, position: "relative" }}>
                        <input
                          value={form.mobileNo ?? ""}
                          onChange={(e) => handleMobileChange(e.target.value)}
                          disabled={enableOtp && otpLocked}
                          placeholder="9876543210"
                          maxLength={10}
                          inputMode="numeric"
                          onKeyDown={allowDigits}
                          style={{
                            height: 32,
                            padding: "0 28px 0 10px",
                            border: `1px solid ${
                              otp.isVerified
                                ? "#1d9e75"
                                : existence.status.mobile === "taken"
                                  ? "#e53e3e"
                                  : BORDER_COL
                            }`,
                            borderRadius: 8,
                            fontSize: 12,
                            background: INPUT_BG,
                            width: "100%",
                            outline: "none",
                            color: "#333",
                          }}
                        />
                        
                        <span
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {otp.isVerified ? (
                            <CheckCircleFilled
                              style={{ fontSize: 13, color: "#1d9e75" }}
                            />
                          ) : existence.status.mobile === "checking" ? (
                            <LoadingOutlined
                              style={{ fontSize: 12, color: "#888" }}
                            />
                          ) : existence.status.mobile === "available" ? (
                            <CheckCircleFilled
                              style={{ fontSize: 12, color: "#1d9e75" }}
                            />
                          ) : existence.status.mobile === "taken" ? (
                            <span style={{ fontSize: 10, color: "#e53e3e" }}>
                              ✕
                            </span>
                          ) : null}
                        </span>
                      </div>

                     
                      {existence.status.mobile === "taken" && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#e53e3e",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Already registered
                        </span>
                      )}

                     
                      {enableOtp &&
                        !otp.isVerified &&
                        otp.status === "idle" && (
                          <button
                            type="button"
                            disabled={!canSendOtp}
                            onClick={() => otp.sendOtp(form.mobileNo ?? "")}
                            style={otpBtnStyle(canSendOtp)}
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

                     
                      {enableOtp && !otp.isVerified && showOtpBox && (
                        <button
                          type="button"
                          onClick={resetOtp}
                          style={{
                            ...otpBtnStyle(true),
                            background: "transparent",
                            color: "#52796F",
                            borderColor: BORDER_COL,
                          }}
                        >
                          Change
                        </button>
                      )}

                    
                      {enableOtp && otp.isVerified && (
                        <span
                          style={{
                            fontSize: 12,
                            color: "#1d9e75",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>

                   
                    {showOtpBox && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "12px",
                          background: "#f9fdf9",
                          borderRadius: 8,
                          border: `1px solid ${BORDER_COL}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: LABEL_COL,
                            marginBottom: 8,
                            fontWeight: 600,
                          }}
                        >
                          Enter {OTP_LENGTH}-digit OTP
                          {otp.isVerifying && (
                            <span style={{ marginLeft: 8, color: "#888" }}>
                              <LoadingOutlined style={{ fontSize: 11 }} />{" "}
                              Verifying…
                            </span>
                          )}
                          {otpFailed && !otp.isVerifying && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "#e53e3e",
                                fontSize: 10,
                              }}
                            >
                              Incorrect OTP — try again
                            </span>
                          )}
                        </div>
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
                                  otpRefs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otpDigits[i]}
                                onChange={(e) =>
                                  handleOtpDigit(i, e.target.value)
                                }
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                onPaste={i === 0 ? handleOtpPaste : undefined}
                                disabled={otp.isVerifying}
                                style={{
                                  width: 38,
                                  height: 42,
                                  textAlign: "center",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  border: `1px solid ${
                                    otpFailed
                                      ? "#e53e3e" 
                                      : otp.isVerified
                                        ? "#1d9e75" 
                                        : BORDER_COL 
                                  }`,
                                  borderRadius: 8,
                                  background: otpFailed
                                    ? "#fff5f5"
                                    : otp.isVerified
                                      ? "#f0fdf4"
                                      : INPUT_BG,
                                  outline: "none",
                                  transition:
                                    "border-color 0.2s, background 0.2s",
                                }}
                              />
                            ))}
                       
                          <div style={{ marginLeft: 4 }}>
                            {otp.countdown > 0 ? (
                              <span style={{ fontSize: 11, color: LABEL_COL }}>
                                Resend in {otp.countdown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpDigits(Array(OTP_LENGTH).fill(""));
                                  setOtpFailed(false);
                                  otp.sendOtp(form.mobileNo ?? "");
                                }}
                                style={{
                                  fontSize: 12,
                                  color: GREEN_DARK,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  fontWeight: 600,
                                }}
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </div>
                   
                        {otp.error && !otpFailed && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#e53e3e",
                              marginTop: 6,
                            }}
                          >
                            {otp.error}
                          </div>
                        )}
                      </div>
                    )}
                  </FieldWrap>
                </div> */}

                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldWrap
                        label="Mobile No."
                        required
                        error={errors.mobileNo}
                      >
                        {/* ── Mobile input row ── */}
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 1, position: "relative" }}>
                            <input
                              value={form.mobileNo ?? ""}
                              onChange={(e) =>
                                handleMobileChange(e.target.value)
                              }
                              // FIX: was `otpLocked` — that blocked the field even after verification.
                              // Now only locks while the OTP box is actively shown.
                              disabled={enableOtp && showOtpBox}
                              placeholder="9876543210"
                              maxLength={10}
                              inputMode="numeric"
                              onKeyDown={allowDigits}
                              style={{
                                height: 32,
                                padding: "0 28px 0 10px",
                                border: `1px solid ${
                                  otp.isVerified
                                    ? "#1d9e75"
                                    : existence.status.mobile === "taken"
                                      ? "#e53e3e"
                                      : BORDER_COL
                                }`,
                                borderRadius: 8,
                                fontSize: 12,
                                // background: INPUT_BG,
                                background: T.formcss.inputBg,
                                // border: `1px solid ${T.formcss.greyBorder}`,
                                width: "100%",
                                outline: "none",
                                color: "#333",
                              }}
                            />

                            {/* Status icon inside mobile field */}
                            <span
                              style={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {otp.isVerified ? (
                                <CheckCircleFilled
                                  style={{ fontSize: 13, color: "#1d9e75" }}
                                />
                              ) : existence.status.mobile === "checking" ? (
                                <LoadingOutlined
                                  style={{ fontSize: 12, color: "#888" }}
                                />
                              ) : existence.status.mobile === "available" ? (
                                <CheckCircleFilled
                                  style={{ fontSize: 12, color: "#1d9e75" }}
                                />
                              ) : existence.status.mobile === "taken" ? (
                                <span
                                  style={{ fontSize: 10, color: "#e53e3e" }}
                                >
                                  ✕
                                </span>
                              ) : null}
                            </span>
                          </div>

                          {/* "Already registered" banner */}
                          {existence.status.mobile === "taken" && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#e53e3e",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Already registered
                            </span>
                          )}

                          {/* Send OTP — only when idle and not yet verified */}
                          {enableOtp && otp.status === "idle" && (
                            <button
                              type="button"
                              disabled={!canSendOtp}
                              onClick={() => otp.sendOtp(form.mobileNo ?? "")}
                              style={otpBtnStyle(canSendOtp)}
                            >
                              {otp.isSending ? (
                                <>
                                  <LoadingOutlined /> Sending…
                                </>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          )}

                          {/* FIX: Change Number — visible in EVERY non-idle state INCLUDING after verification.
          Previously "Change" was hidden once verified, leaving user stuck. */}
                          {enableOtp && otp.status !== "idle" && (
                            <button
                              type="button"
                              onClick={() => {
                                resetOtp();
                                set("mobileNo", ""); // clear field so user types a fresh number
                                existence.checkMobile(""); // reset the existence status badge
                              }}
                              style={{
                                ...otpBtnStyle(true),
                                background: "transparent",
                                color: "#52796F",
                                borderColor: BORDER_COL,
                              }}
                            >
                              Change Number
                            </button>
                          )}

                          {/* Verified badge */}
                          {enableOtp && otp.isVerified && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "#1d9e75",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {/* ── OTP digit boxes — auto-verify on last digit ── */}
                        {showOtpBox && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: "12px",
                              background: "#f9fdf9",
                              borderRadius: 8,
                              border: `1px solid ${BORDER_COL}`,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: LABEL_COL,
                                marginBottom: 8,
                                fontWeight: 600,
                              }}
                            >
                              Enter {OTP_LENGTH}-digit OTP
                              {otp.isVerifying && (
                                <span style={{ marginLeft: 8, color: "#888" }}>
                                  <LoadingOutlined style={{ fontSize: 11 }} />{" "}
                                  Verifying…
                                </span>
                              )}
                              {otpFailed && !otp.isVerifying && (
                                <span
                                  style={{
                                    marginLeft: 8,
                                    color: "#e53e3e",
                                    fontSize: 10,
                                  }}
                                >
                                  Incorrect OTP — try again
                                </span>
                              )}
                            </div>

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
                                      otpRefs.current[i] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={otpDigits[i]}
                                    onChange={(e) =>
                                      handleOtpDigit(i, e.target.value)
                                    }
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={
                                      i === 0 ? handleOtpPaste : undefined
                                    }
                                    disabled={otp.isVerifying}
                                    style={{
                                      width: 38,
                                      height: 42,
                                      textAlign: "center",
                                      fontSize: 16,
                                      fontWeight: 600,
                                      border: `1px solid ${
                                        otpFailed
                                          ? "#e53e3e"
                                          : otp.isVerified
                                            ? "#1d9e75"
                                            : BORDER_COL
                                      }`,
                                      borderRadius: 8,
                                      background: otpFailed
                                        ? "#fff5f5"
                                        : otp.isVerified
                                          ? "#f0fdf4"
                                          : INPUT_BG,
                                      outline: "none",
                                      transition:
                                        "border-color 0.2s, background 0.2s",
                                    }}
                                  />
                                ))}

                              {/* Resend section */}
                              <div style={{ marginLeft: 4 }}>
                                {otp.countdown > 0 ? (
                                  <span
                                    style={{ fontSize: 11, color: LABEL_COL }}
                                  >
                                    Resend in {otp.countdown}s
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOtpDigits(Array(OTP_LENGTH).fill(""));
                                      setOtpFailed(false);
                                      otp.sendOtp(form.mobileNo ?? "");
                                    }}
                                    style={{
                                      fontSize: 12,
                                      color: GREEN_DARK,
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: 0,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Resend OTP
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Generic OTP error from hook */}
                            {otp.error && !otpFailed && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#e53e3e",
                                  marginTop: 6,
                                }}
                              >
                                {otp.error}
                              </div>
                            )}
                          </div>
                        )}
                      </FieldWrap>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* ── Submit ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit}
            icon={<SaveOutlined />}
            disabled={!canSubmit}
            style={{
              borderRadius: 50,
              border: "1px solid transparent",
              background: canSubmit ? GREEN_DARK : "#a0a0a0",
              borderColor: canSubmit ? GREEN_DARK : "#a0a0a0",
              color: "#fff",
              fontWeight: 600,
              paddingInline:isMobile?12: 32,
              height:isMobile?  32: 42,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.65,
              // transition: "background 0.2s, opacity 0.2s",
            }}
          >
            Create Account
          </Button>

          {/* Contextual hint below the button so user knows exactly what's blocking */}
          {!canSubmit && (
            <span style={{ fontSize:isMobile?10: 11, color: "#888" }}>
              {enableOtp && !otp.isVerified && !emailTaken && !mobileTaken
                ? "Verify your mobile number to continue"
                : emailTaken
                  ? "This email is already registered. Please use a different email."
                  : mobileTaken
                    ? "This mobile is already registered. Please use a different number."
                    : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── OTP button style helper ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const otpBtnStyle = (active: boolean): React.CSSProperties => ({
  height: 34,
  padding: "0 14px",
  border: `1px solid ${active ? "#0f6e56" : "#d0e8d8"}`,
  borderRadius: 8,
  fontSize: 12,
  background: active ? "#1d9e75" : "#F0FAF4",
  color: active ? "#fff" : "#52796F",
  cursor: active ? "pointer" : "default",
  opacity: active ? 1 : 0.6,
  whiteSpace: "nowrap" as const,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s",
});

export default PublicEmployeeSignupForm;
