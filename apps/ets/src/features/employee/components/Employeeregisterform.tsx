import React, { useState, useCallback, useRef } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGoogleMap } from "../../../shared/hooks/useGoogleMap";
import { EMP_TYPE_OPTIONS } from "../constants/Employeeconstants";
import type {
  EmployeeFormDto,
  UserStage,
  AddressComponents,
} from "../types/Employee.types";
import type { FieldError } from "../../../shared/types/api-error.types";
import {
  EnvironmentOutlined,
  HomeOutlined,
  IdcardOutlined,
  MessageOutlined,
  SaveOutlined,
  WomanOutlined,
  StopOutlined,
  ManOutlined,
  LeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Divider, Modal } from "antd";
import { useLookups } from "../../lookups";

import type { Gender } from "../types/Employee.types";
import { fetchPincodeDetails } from "../services/pincode.service";
import {
  // lettersOnlyProps,
  numbersOnlyProps,
  alphanumericOnlyProps,
  landlineOnlyProps,
  lettersNameOnlyProps,
} from "../utils/inputRestrictions";
import { T } from "../../../styles/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// ─── Phone Validation Helper ─────────────────────────────────────
const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone) return true; // optional fields
  const cleaned = phone.trim();
  return /^\d{10}$/.test(cleaned);
};

const PHONE_REGEX = /^\d{10}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ɏ\s.\-']+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ADDRESS_REGEX = /^[^<>{}[\]\\|^`~$%]+$/;

type GenderOption = {
  label: string;
  value: Gender;
  icon?: React.ReactNode;
};

const GENDER_OPTIONS: GenderOption[] = [
  { label: "Male", value: "M", icon: <ManOutlined /> },
  { label: "Female", value: "F", icon: <WomanOutlined /> },
  { label: "Other", value: "O", icon: <StopOutlined /> },
];

// ─── Props ───────────────────────────────────────────────────────
export interface EmployeeRegisterFormProps {
  editingRecord?: UserStage | null;
  onSubmit: (values: EmployeeFormDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isInternal?: boolean;
  serverErrors?: FieldError[] | null;
  officeOptions?: { label: string; value: string }[];
  departmentOptions?: { label: string; value: string }[];
  lobOptions?: { label: string; value: string }[];
  projectOptions?: { label: string; value: string }[];
  geocodeOptions?: { label: string; value: string }[];
  areaOptions?: { label: string; value: string }[];
  zoneOptions?: { label: string; value: string }[];
  showArea?: boolean;
  showZone?: boolean;
  approveEmployee?: (id: string) => void;
  rejectEmployee?: (id: string) => void;
  isListPage?: boolean;
}

// ─── Styles ──────────────────────────────────────────────────────
const FIELD_STYLE: React.CSSProperties = {
  backgroundColor: "#F0FAF4",
  borderRadius: 8,
  fontSize: 12,
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: T.text.secondary, //"#52796F",
  marginBottom: 2,
  display: "block",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#4B4B4B",
  marginBottom: 2,
  borderBottom: `1px solid ${T.formcss.greyBorder}`,
};

// const InputCSS: React.CSSProperties = {
//   background: T.formcss.inputBg,
//   border: `1px solid ${T.formcss.greyBorder}`,
// };

// ─── FieldWrap ───────────────────────────────────────────────────
// fieldKey is used by scroll-to-first-error: add data-field-key so
// the container can querySelector("[data-field-key=xxx]") and scrollIntoView.
interface FieldWrapProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
  fieldKey?: string;
}

const FieldWrap: React.FC<FieldWrapProps> = ({
  label,
  required,
  children,
  error,
  className = "",
  fieldKey,
}) => (
  <div
    style={{ marginBottom: 10 }}
    className={className}
    {...(fieldKey ? { "data-field-key": fieldKey } : {})}
  >
    <label style={LABEL_STYLE}>
      {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
    </label>
    {children}
    {error && (
      <div style={{ color: "#e53e3e", fontSize: 10, marginTop: 3 }}>
        {error}
      </div>
    )}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────
export const EmployeeRegisterForm: React.FC<EmployeeRegisterFormProps> = ({
  editingRecord,
  onSubmit,
  onCancel,
  isSubmitting,
  isInternal = true,
  serverErrors,
  officeOptions = [],
  departmentOptions = [],
  lobOptions = [],
  projectOptions = [],
  geocodeOptions = [],
  areaOptions = [],
  zoneOptions = [],
  showArea = false,
  showZone = false,
  approveEmployee,
  rejectEmployee,
  isListPage = true,
}) => {
  const isMobile = useIsMobile();
  const { Input, Select, Button, Spin } = useUILibrary();
  const { statesOptions, allSpecialCaseOptions, approveUserOptions } =
    useLookups({
      only: ["statesOptions", "allSpecialCaseOptions", "userOptions"],
    });

  const currentUserId = (editingRecord as any)?.user_Id ?? null;

  console.log("editingRecord");

  // const supervisorOptions = currentUserId
  //   ? approveUserOptions.filter((opt) => opt.userId !== currentUserId)
  //   : approveUserOptions;

  // const supervisorOptions = [
  //   { value: "" as string, label: "— Not Assigned —" },
  //   ...(currentUserId
  //     ? approveUserOptions.filter((opt) => opt.value !== currentUserId)
  //     : approveUserOptions),
  // ];

  const supervisorOptions = [
    { value: "", label: "— Not Assigned —" },
    ...(currentUserId
      ? approveUserOptions.filter((opt) => opt.value !== currentUserId)
      : approveUserOptions
    ).map((opt) => ({ ...opt, value: String(opt.value) })),
  ];

  console.log("supervisorOptions from employee", supervisorOptions);

  const [approveModalOpen, setApproveModalOpen] = useState(false);

  // isDirty: true whenever any field changes after last save.
  // Approve button is blocked until isDirty is false.
  const [isDirty, setIsDirty] = useState(false);

  // formContainerRef + data-field-key on FieldWrap enables scroll-to-first-error.
  const formContainerRef = useRef<HTMLDivElement>(null);

  const getStateCodeByName = (stateName?: string | null) => {
    if (!stateName) return null;
    const normalizedGoogleState = stateName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const matched = statesOptions.find((s) => {
      const normalizedLookup = String(s.label)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      return normalizedLookup.includes(normalizedGoogleState);
    });
    return matched ? Number(matched.value) : null;
  };

  // ── Form State ─────────────────────────────────────────────────
  const [form, setForm] = useState<Partial<EmployeeFormDto>>(() => ({
    firstName: editingRecord?.firstName ?? "",
    middleName: editingRecord?.middleName ?? "",
    lastName: editingRecord?.lastName ?? "",
    mobileNo: editingRecord?.mobileNo ?? "",
    emailId: editingRecord?.emailId ?? "",
    gender: editingRecord?.gender ?? "M",
    address: editingRecord?.address ?? "",
    city: editingRecord?.city ?? "",
    // state: editingRecord?.state ?? "",
    state:
      (editingRecord as any)?.state ?? (editingRecord as any)?.stateName ?? "",

    pin: editingRecord?.pin ?? "",
    phoneNo: editingRecord?.phoneNo ?? "",
    stateCode: editingRecord?.stateCode ?? null,
    emerContactNo: editingRecord?.emerContactNo ?? "",
    specialNeeds: editingRecord?.specialNeeds ?? null,
    empTypeId: editingRecord?.empTypeId ?? 1,
    empType: editingRecord?.empType,
    employeeId: editingRecord?.employeeId ?? "",
    locCode: editingRecord?.locCode ?? null,
    depCode: editingRecord?.depCode ?? null,
    lobCode: editingRecord?.lobCode ?? null,
    proCode: editingRecord?.proCode ?? null,
    geocodeId: editingRecord?.geocodeId ?? null,
    areaId: editingRecord?.areaId ?? null,
    zoneId: editingRecord?.zoneId ?? null,
    // empLat: editingRecord?.empLat ?? null,
    // empLng: editingRecord?.empLng ?? null,
    empLat:
      (editingRecord as any)?.empLat || (editingRecord as any)?.emp_Lat || null,
    empLng:
      (editingRecord as any)?.empLng || (editingRecord as any)?.emp_Lng || null,
    locationName: editingRecord?.locationName ?? "",
    supervisorName: editingRecord?.supervisorName ?? "",

    supEmployeeId: editingRecord?.supEmployeeId ?? null,
    spoc: editingRecord?.spoc ?? null,
    spocEmployeeId: editingRecord?.spocEmployeeId ?? null,

    supId: editingRecord?.spoc ?? null,
    locality: editingRecord?.locality?.trim() || null,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // set() clears the per-field error and marks the form dirty.
  const set = useCallback(
    <K extends keyof EmployeeFormDto>(key: K, value: EmployeeFormDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key as string];
        return n;
      });
    },
    [],
  );

  const isValidAddressText = (addr: string): boolean => {
    if (!addr || addr.trim().length < 5) return false;
    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(addr.trim())) return false;
    return true;
  };

  const handleAddressChange = useCallback(
    (components: AddressComponents) => {
      const sc = getStateCodeByName(components.state);

      setForm((p) => ({
        ...p,
        ...(isValidAddressText(components.fullAddress)
          ? {
              address: components.fullAddress,
              locationName: components.fullAddress,
            }
          : {}),
        ...(components.city ? { city: components.city } : {}),
        ...(components.pin ? { pin: components.pin } : {}),
        ...(components.state ? { state: components.state } : {}),
        stateCode: sc ?? p.stateCode,
        empLat: components.lat,
        empLng: components.lng,
        ...(components.locality ? { locality: components.locality } : {}), // ← add
      }));

      setIsDirty(true);

      setErrors((p) => {
        const n = { ...p };
        if (isValidAddressText(components.fullAddress)) delete n.address;
        if (components.city) delete n.city;
        if (components.pin) delete n.pin;
        if (sc != null) {
          delete n.stateCode;
        }
        if (components.lat && components.lng) delete n.mapLocation;
        return n;
      });
    },
    [statesOptions],
  );

  const { mapRef, searchInputRef, isLoaded, refreshMap } = useGoogleMap({
    onAddressChange: handleAddressChange,
    // defaultLat: editingRecord?.empLat ?? 28.6139,
    // defaultLng: editingRecord?.empLng ?? 77.209,
    defaultLat:
      (editingRecord as any)?.empLat ||
      (editingRecord as any)?.emp_Lat ||
      28.6139,
    defaultLng:
      (editingRecord as any)?.empLng ||
      (editingRecord as any)?.emp_Lng ||
      77.209,
  });

  const handlePinChange = async (pin: string) => {
    // set() already marks isDirty
    set("pin", pin);

    if (!/^\d{6}$/.test(pin)) return;

    const result = await fetchPincodeDetails(pin);
    if (!result) return;

    const matchedStateCode = getStateCodeByName(result.state);

    setForm((prev) => ({
      ...prev,
      city: result.city || prev.city,
      state: result.state || prev.state,
      stateCode: matchedStateCode || prev.stateCode,
    }));

    // Clear errors for fields that were just auto-filled
    setErrors((prev) => {
      const n = { ...prev };
      if (result.city) delete n.city;
      if (result.state) {
        delete n.state;
        delete n.stateCode;
      }
      return n;
    });
  };

  // ── Scroll to first error ───────────────────────────────────────
  const scrollToFirstError = (errs: Record<string, string>) => {
    const firstKey = Object.keys(errs)[0];
    if (!firstKey || !formContainerRef.current) return;
    const el = formContainerRef.current.querySelector(
      `[data-field-key="${firstKey}"]`,
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ── Validation ─────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // ── Personal ──────────────────────────────────────────────────
    if (!form.firstName?.trim()) errs.firstName = "First name is required";
    else if (form.firstName.trim().length < 2)
      errs.firstName = "Minimum 2 characters";
    else if (!NAME_REGEX.test(form.firstName.trim()))
      errs.firstName = "Invalid characters";

    if (!form.lastName?.trim()) errs.lastName = "Last name is required";
    else if (form.lastName.trim().length < 2)
      errs.lastName = "Minimum 2 characters";
    else if (!NAME_REGEX.test(form.lastName.trim()))
      errs.lastName = "Invalid characters";

    if (form.middleName?.trim() && !NAME_REGEX.test(form.middleName.trim()))
      errs.middleName = "Invalid characters";

    if (form.employeeId?.trim() && form.employeeId.length > 30)
      errs.employeeId = "Maximum 30 characters";

    if (!form.gender) errs.gender = "Gender is required";

    // ── Contact ───────────────────────────────────────────────────
    if (!form.mobileNo?.trim()) errs.mobileNo = "Mobile number is required";
    else if (!PHONE_REGEX.test(form.mobileNo.trim()))
      errs.mobileNo = "Must be exactly 10 digits";

    if (!form.emailId?.trim()) errs.emailId = "Email is required";
    else if (!EMAIL_REGEX.test(form.emailId.trim()))
      errs.emailId = "Enter valid email";

    if (!isValidPhone(form.phoneNo)) errs.phoneNo = "Must be exactly 10 digits";
    if (!isValidPhone(form.emerContactNo))
      errs.emerContactNo = "Must be exactly 10 digits";

    // ── Employment (internal only) ────────────────────────────────
    if (isInternal && !form.empTypeId)
      errs.empTypeId = "Employee type is required";

    // ── Map & Address block ───────────────────────────────────────
    // All four are checked together so the user can fix them in one pass.
    if (!form.empLat || !form.empLng)
      errs.mapLocation = "Please select your location on the map";

    if (!form.stateCode)
      errs.stateCode =
        "State is required — use map search or pincode to auto-fill";

    if (!form.city?.trim())
      errs.city = "City is required — use map search or pincode to auto-fill";

    if (!form.pin?.trim()) errs.pin = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pin.trim()))
      errs.pin = "Must be exactly 6 digits";

    if (!form.address?.trim())
      errs.address = "Address is required — use map search or type manually";
    else if (form.address.trim().length < 5) errs.address = "Address too short";
    else if (!ADDRESS_REGEX.test(form.address))
      errs.address = "Address contains invalid characters";

    // ── Debug ─────────────────────────────────────────────────────
    if (Object.keys(errs).length > 0) {
      console.group("[EmployeeRegisterForm] validate() — FAILED");
      console.table(
        Object.entries(errs).map(([field, message]) => ({
          field,
          message,
          currentValue: (form as any)[field],
        })),
      );
      console.log("Full form state:", form);
      console.groupEnd();
    } else {
      console.log("[EmployeeRegisterForm] validate() — PASSED", form);
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return false;
    }
    return true;
  };

  // ── Approve Pre-check ───────────────────────────────────────────
  const validateBeforeApprove = (): string[] => {
    const missing: string[] = [];
    if (!form.locCode) missing.push("Office");
    if (!form.depCode) missing.push("Department");
    if (!form.lobCode) missing.push("Line of Business");
    if (!form.proCode) missing.push("Process");
    return missing;
  };

  const getOptionLabel = (
    options: { label: string; value: string }[],
    value?: string | null,
  ) => options.find((o) => o.value === value)?.label || "-";

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: EmployeeFormDto = {
      ...form,
      id: editingRecord?.userStage_Id || editingRecord?.id || null,
      stateCode:
        form.stateCode != null && form.stateCode !== ""
          ? Number(form.stateCode)
          : null,
      actionType: null,
      regisLocation: null,
      ipAddress: null,
    } as EmployeeFormDto;

    await onSubmit(payload);
    // Mark clean only after a successful save so approve becomes available again
    setIsDirty(false);
  };

  // ── Approve Flow ────────────────────────────────────────────────
  const handleApproveClick = () => {
    // Gate 1: unsaved changes must be saved first
    if (isDirty) {
      Modal.warning({
        title: "Unsaved Changes",
        content:
          "Please save your changes first before approving the employee.",
        okText: "OK",
      });
      return;
    }

    // Gate 2: required office assignment fields
    const missing = validateBeforeApprove();
    if (missing.length > 0) {
      Modal.warning({
        title: "Profile Incomplete",
        content: (
          <div>
            <p>Please complete the following before approving:</p>
            <ul style={{ paddingLeft: 20, margin: "12px 0" }}>
              {missing.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ),
        okText: "OK",
      });
      return;
    }

    // Gate 3: full form validation
    if (!validate()) return;

    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!validate()) return;
    const userStageId = editingRecord?.userStage_Id || editingRecord?.id;
    if (!userStageId || !approveEmployee) return;
    setApproveModalOpen(false);
    await approveEmployee(userStageId);
  };

  const handleReject = async () => {
    const userStageId = editingRecord?.userStage_Id || editingRecord?.id;
    if (!userStageId || !rejectEmployee) return;
    await rejectEmployee(userStageId);
  };

  const inputStyle = {
    ...FIELD_STYLE,
    width: "100%",
    background: T.formcss.inputBg,
    border: `1px solid ${T.formcss.greyBorder}`,
  };
  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: "#E8F5EC",
    color: "#52796F",
    cursor: "not-allowed",
  };

  return (
    <div ref={formContainerRef} className="flex flex-col gap-3">
      {/* Header */}
      {isListPage && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={onCancel}>
              <LeftOutlined />
            </button>
            <div>
              <h2 style={{ margin: 0, color: "#00450D", fontWeight: 700 }}>
                User Registration
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
                Create account to get started
              </p>
            </div>
          </div>
          <hr style={{ marginTop: 4, borderTop: "1px solid #ddd" }} />
        </>
      )}

      <div
        className={`grid ${isMobile ? "grid-cols-[1fr]" : " grid-cols-[3fr_10px_2fr]"} gap-5`}
      >
        {/* ════════════════════ LEFT COLUMN ════════════════════ */}
        <div className="flex flex-col gap-3">
          {/* Personal Information */}
          <div className="flex flex-col gap-2">
            <div style={SECTION_TITLE}>
              <IdcardOutlined /> Personal Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: isMobile ? "4px 8px" : "6px 16px",
              }}
            >
              <FieldWrap
                label="First Name"
                required
                error={errors.firstName}
                fieldKey="firstName"
              >
                <Input
                  value={form.firstName ?? ""}
                  onChange={(e) => set("firstName", e.target.value)}
                  style={inputStyle}
                  maxLength={50}
                  {...lettersNameOnlyProps}
                />
              </FieldWrap>

              <FieldWrap
                label="Middle Name"
                error={errors.middleName}
                fieldKey="middleName"
              >
                <Input
                  value={form.middleName ?? ""}
                  onChange={(e) => set("middleName", e.target.value)}
                  style={inputStyle}
                  maxLength={50}
                  {...lettersNameOnlyProps}
                />
              </FieldWrap>

              <FieldWrap
                label="Last Name"
                required
                error={errors.lastName}
                fieldKey="lastName"
              >
                <Input
                  value={form.lastName ?? ""}
                  onChange={(e) => set("lastName", e.target.value)}
                  style={inputStyle}
                  maxLength={50}
                  {...lettersNameOnlyProps}
                />
              </FieldWrap>

              <FieldWrap
                label="Employee ID"
                error={errors.employeeId}
                fieldKey="employeeId"
              >
                <Input
                  value={form.employeeId ?? ""}
                  onChange={(e) => set("employeeId", e.target.value)}
                  style={inputStyle}
                  maxLength={30}
                  {...alphanumericOnlyProps}
                />
              </FieldWrap>

              <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                <FieldWrap
                  label="Gender"
                  required
                  error={errors.gender}
                  fieldKey="gender"
                >
                  <div className="flex items-center gap-2">
                    {GENDER_OPTIONS.map(({ label, value, icon }) => (
                      <Button
                        key={value}
                        icon={icon}
                        onClick={() => set("gender", value)}
                        style={{
                          borderRadius: 12,
                          height: 38,
                          paddingInline: 12,
                          fontSize: 11,
                          border: "none",
                          backgroundColor:
                            form.gender === value ? "#4CAF82" : "#f0f0f0",
                          color: form.gender === value ? "#fff" : "#aaa",
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </FieldWrap>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-1">
            <div style={SECTION_TITLE}>
              <MessageOutlined /> Contact Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: isMobile ? "4px 8px" : "6px 16px",
              }}
            >
              <FieldWrap
                label="Mobile Number"
                required
                error={errors.mobileNo}
                fieldKey="mobileNo"
              >
                <Input
                  value={form.mobileNo ?? ""}
                  onChange={(e) => set("mobileNo", e.target.value)}
                  style={inputStyle}
                  maxLength={10}
                  placeholder="10 digits"
                  {...numbersOnlyProps}
                />
              </FieldWrap>

              <FieldWrap
                label="Email ID"
                required
                error={errors.emailId}
                fieldKey="emailId"
              >
                <Input
                  type="email"
                  value={form.emailId ?? ""}
                  onChange={(e) => set("emailId", e.target.value)}
                  style={inputStyle}
                />
              </FieldWrap>

              <FieldWrap
                label="Landline Number"
                error={errors.phoneNo}
                fieldKey="phoneNo"
              >
                <Input
                  value={form.phoneNo ?? ""}
                  onChange={(e) => set("phoneNo", e.target.value)}
                  style={inputStyle}
                  maxLength={10}
                  placeholder="10 digits (optional)"
                  {...landlineOnlyProps}
                />
              </FieldWrap>

              <FieldWrap label="Locality / Area" error={errors.locality}>
                <Input
                  value={(form as any).locality ?? ""}
                  onChange={(e: any) => set("locality" as any, e.target.value)}
                  style={inputStyle}
                  placeholder="Sector 142, Noida Extension…"
                  maxLength={100}
                />
              </FieldWrap>

              <FieldWrap
                label="Emergency Contact"
                error={errors.emerContactNo}
                fieldKey="emerContactNo"
              >
                <Input
                  value={form.emerContactNo ?? ""}
                  onChange={(e) => set("emerContactNo", e.target.value)}
                  style={inputStyle}
                  maxLength={10}
                  placeholder="10 digits (optional)"
                  {...numbersOnlyProps}
                />
              </FieldWrap>
            </div>
          </div>

          {isInternal && (
            <>
              {/* Employment Details */}
              <div className="flex flex-col gap-1">
                <div style={SECTION_TITLE}>Employment Details</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? "4px 8px" : "6px 16px",
                  }}
                >
                  <FieldWrap
                    label="Employee Type"
                    required
                    error={errors.empTypeId}
                    fieldKey="empTypeId"
                  >
                    <Select
                      value={String(form.empTypeId)}
                      onChange={(v) => {
                        const opt = EMP_TYPE_OPTIONS.find((o) => o.value === v);
                        set("empTypeId", Number(v));
                        set("empType", opt?.label ?? null);
                      }}
                      options={EMP_TYPE_OPTIONS}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                    />
                  </FieldWrap>

                  <FieldWrap label="Special Needs">
                    <Select
                      value={form.specialNeeds ?? undefined}
                      onChange={(v) => set("specialNeeds", v)}
                      options={allSpecialCaseOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      allowClear
                      placeholder="None"
                    />
                  </FieldWrap>
                </div>
              </div>

              {/* Office Assignment */}
              <div className="flex flex-col gap-1">
                <div style={SECTION_TITLE}>
                  Office Assignment{" "}
                  <span style={{ fontSize: 11, color: "#888" }}>
                    (Required for approval)
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: isMobile ? "4px 8px" : "6px 16px",
                  }}
                >
                  <FieldWrap
                    label="Office"
                    required
                    error={errors.locCode}
                    fieldKey="locCode"
                  >
                    <Select
                      value={form.locCode ?? undefined}
                      onChange={(v) => set("locCode", v)}
                      options={officeOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                      allowClear
                    />
                  </FieldWrap>

                  <FieldWrap
                    label="Department"
                    required
                    error={errors.depCode}
                    fieldKey="depCode"
                  >
                    <Select
                      value={form.depCode ?? undefined}
                      onChange={(v) => set("depCode", v)}
                      options={departmentOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                      allowClear
                    />
                  </FieldWrap>

                  <FieldWrap
                    label="Line of Business"
                    required
                    error={errors.lobCode}
                    fieldKey="lobCode"
                  >
                    <Select
                      value={form.lobCode ?? undefined}
                      onChange={(v) => set("lobCode", v)}
                      options={lobOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                      allowClear
                    />
                  </FieldWrap>

                  <FieldWrap
                    label="Process"
                    required
                    error={errors.proCode}
                    fieldKey="proCode"
                  >
                    <Select
                      value={form.proCode ?? undefined}
                      onChange={(v) => set("proCode", v)}
                      options={projectOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                      allowClear
                    />
                  </FieldWrap>

                  <FieldWrap label="Geo Point" className="hidden">
                    <Select
                      value={form.geocodeId ?? undefined}
                      onChange={(v) => set("geocodeId", v)}
                      options={geocodeOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                      allowClear
                    />
                  </FieldWrap>

                  {showArea && (
                    <FieldWrap label="Area">
                      <Select
                        value={
                          form.areaId != null ? String(form.areaId) : undefined
                        }
                        onChange={(v) =>
                          set("areaId", v != null ? Number(v) : null)
                        }
                        options={areaOptions}
                        style={{ ...FIELD_STYLE, width: "100%" }}
                        showSearch
                        allowClear
                      />
                    </FieldWrap>
                  )}

                  {showZone && (
                    <FieldWrap label="Zone">
                      <Select
                        value={
                          form.zoneId != null ? String(form.zoneId) : undefined
                        }
                        onChange={(v) =>
                          set("zoneId", v != null ? Number(v) : null)
                        }
                        options={zoneOptions}
                        style={{ ...FIELD_STYLE, width: "100%" }}
                        showSearch
                        allowClear
                      />
                    </FieldWrap>
                  )}

                  <FieldWrap label="Supervisor Name">
                    <Select
                      // value={String(form.supervisorName)}
                      // onChange={(v) => {
                      //   const opt = approveUserOptions.find(
                      //     (o) => o.value === v,
                      //   );
                      //   set("supervisorName", String(opt?.label) ?? "");
                      //   set("spoc", String(opt?.value) ?? "");
                      //   set("spocEmployeeId", opt?.employeeCode ?? "");
                      // }}
                      // options={approveUserOptions}

                      value={form.spoc != null ? String(form.spoc) : ""}
                      onChange={(v) => {
                        if (!v) {
                          set("supervisorName", null);
                          set("spoc", null);
                          set("spocEmployeeId", null);
                          set("supId", null); // ← add
                          set("supEmployeeId", null); // ← add
                          return;
                        }
                        const opt = supervisorOptions.find(
                          (o) => String(o.value) === String(v),
                        ) as any;
                        set("supervisorName", opt?.label ?? "");
                        set("spoc", opt?.value ?? null);
                        set("supId", opt?.value ?? null); // ← add — same as spoc
                        set("spocEmployeeId", opt?.employeeCode ?? null);
                        set("supEmployeeId", opt?.employeeCode ?? null); // ← add — same as spocEmployeeId
                      }}
                      options={supervisorOptions}
                      style={{ ...FIELD_STYLE, width: "100%" }}
                      showSearch
                    />
                  </FieldWrap>
                </div>
              </div>

              {/* Supervisor & SPOC */}
              {/* <div className="flex flex-col gap-1">
                <div style={SECTION_TITLE}>Supervisor & SPOC (Optional)</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "4px 16px",
                  }}
                >
                  <FieldWrap label="Supervisor Employee ID">
                    <div
                      style={{
                        ...inputStyle,
                        display: "flex",
                        alignItems: "center",
                        minHeight: 34,
                        padding: "0 12px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 6,
                        color: "#262626",
                        fontWeight: 500,
                      }}
                    >
                      {form.supEmployeeId || "-"}
                    </div>
                  </FieldWrap>

                  <FieldWrap label="SPOC" className="hidden">
                    <Input
                      value={form.spoc ?? ""}
                      onChange={(e) => set("spoc", e.target.value)}
                      style={inputStyle}
                    />
                  </FieldWrap>
                </div>
              </div> */}
            </>
          )}
        </div>

        {/* Divider */}
        {!isMobile && (
          <Divider
            type="vertical"
            style={{ height: 470, background: "#ddd" }}
          />
        )}

        {/* ════════════════════ RIGHT COLUMN — Map ════════════════════ */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div
              style={{
                ...SECTION_TITLE,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <EnvironmentOutlined /> Home / Pickup Address
              </span>
              <button
                onClick={refreshMap}
                style={{
                  border: "1px solid #B7E4C7",
                  background: "#F0FAF4",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                <ReloadOutlined /> Refresh
              </button>
            </div>

            {/* mapLocation error sits at the top of the map section so it's visible */}
            {/* data-field-key here ensures scrollIntoView lands here when map is the first error */}
            <div data-field-key="mapLocation">
              {errors.mapLocation && (
                <div
                  style={{
                    color: "#e53e3e",
                    fontSize: 11,
                    marginBottom: 4,
                    padding: "4px 8px",
                    background: "#fff5f5",
                    borderRadius: 6,
                    border: "1px solid #fca5a5",
                  }}
                >
                  {errors.mapLocation}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={LABEL_STYLE}>Search Location</label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search your address..."
                style={{
                  ...FIELD_STYLE,
                  width: "100%",
                  padding: "8px 12px",
                  outline: "none",
                }}
              />
            </div>

            {/* Map border turns red when location is missing */}
            <div
              style={{
                height: 280,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${errors.mapLocation ? "#e53e3e" : "#B7E4C7"}`,
                position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              {!isLoaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#F0FAF4",
                  }}
                >
                  <Spin /> Loading map...
                </div>
              )}
            </div>
          </div>

          {/* Address Details */}
          <div className="flex flex-col gap-1">
            <div style={SECTION_TITLE}>
              <HomeOutlined /> Address Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: isMobile ? "4px 8px" : "6px 16px",
              }}
            >
              <FieldWrap
                label="PIN Code"
                required
                error={errors.pin}
                fieldKey="pin"
              >
                <Input
                  value={form.pin ?? ""}
                  readOnly
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (
                      [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                      ].includes(e.key)
                    )
                      return;
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                  maxLength={6}
                  style={{
                    ...inputStyle,
                    borderColor: errors.pin ? "#e53e3e" : undefined,
                  }}
                />
              </FieldWrap>

              {/* State is auto-filled by map / pincode — read-only, but shows error */}
              <FieldWrap
                label="State"
                required
                error={errors.stateCode}
                fieldKey="stateCode"
              >
                <Input
                  value={form.state ?? ""}
                  readOnly
                  style={{
                    ...readOnlyInputStyle,
                    borderColor: errors.stateCode ? "#e53e3e" : undefined,
                  }}
                />
              </FieldWrap>

              {/* City is auto-filled by map / pincode — read-only, but shows error */}
              <FieldWrap
                label="City"
                required
                error={errors.city}
                fieldKey="city"
              >
                <Input
                  value={form.city ?? ""}
                  readOnly
                  style={{
                    ...readOnlyInputStyle,
                    borderColor: errors.city ? "#e53e3e" : undefined,
                  }}
                />
              </FieldWrap>

              {/* Address: editable — auto-filled by map but admin can type manually */}
              <FieldWrap
                label="Full Address"
                required
                className={isMobile ? "col-span-1" : "col-span-3"}
                error={errors.address}
                fieldKey="address"
              >
                <Input.TextArea
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Auto-filled from map, or type manually"
                  readOnly
                  style={{
                    ...FIELD_STYLE,
                    width: "100%",
                    minHeight: 60,
                    borderColor: errors.address ? "#e53e3e" : undefined,
                  }}
                />
              </FieldWrap>
            </div>
          </div>
        </div>
      </div>

      {/* Server Errors */}
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

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 8,
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          style={{ border: "1px solid" }}
        >
          {editingRecord ? "Save Changes" : "Create Account"}
        </Button>

        {isInternal && editingRecord?.userStage_Id && (
          <>
            <Button
              danger
              onClick={handleReject}
              icon={<CloseCircleOutlined />}
              style={{ border: "1px solid" }}
            >
              Reject
            </Button>

            {/* Approve is visually disabled when there are unsaved changes */}
            <Button
              type="primary"
              onClick={handleApproveClick}
              disabled={isDirty}
              title={
                isDirty ? "Save your changes first before approving" : undefined
              }
              style={{
                background: isDirty ? "#a3a3a3" : "#2E7D32",
                border: `1px solid ${isDirty ? "#a3a3a3" : "#2E7D32"}`,
                cursor: isDirty ? "not-allowed" : "pointer",
                opacity: isDirty ? 0.65 : 1,
              }}
              icon={<CheckCircleOutlined />}
            >
              Approve Employee
            </Button>

            {/* Inline hint so the user understands why Approve is greyed */}
            {isDirty && (
              <span style={{ fontSize: 11, color: "#888" }}>
                Save changes first to enable approval
              </span>
            )}
          </>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        footer={null}
        centered
        width={440}
      >
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#E8F5EC",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 28, color: "#1B4332" }} />
          </div>

          <h3 style={{ color: "#1B4332", fontWeight: 700 }}>
            Approve this employee?
          </h3>

          <p style={{ margin: "12px 0", color: "#555" }}>
            You are about to approve{" "}
            <strong>
              {form.firstName} {form.lastName}
            </strong>
            .
          </p>

          <div
            style={{
              background: "#F8FAF8",
              border: "1px solid #D7EBDD",
              borderRadius: 12,
              padding: 16,
              textAlign: "left",
              margin: "20px 0",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Final Allocation
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
              <div>
                <strong>Office:</strong>{" "}
                {getOptionLabel(officeOptions, form.locCode)}
              </div>
              <div>
                <strong>Department:</strong>{" "}
                {getOptionLabel(departmentOptions, form.depCode)}
              </div>
              <div>
                <strong>LOB:</strong> {getOptionLabel(lobOptions, form.lobCode)}
              </div>
              <div>
                <strong>Process:</strong>{" "}
                {getOptionLabel(projectOptions, form.proCode)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button
              onClick={() => setApproveModalOpen(false)}
              style={{ border: "1px solid #d1fae5" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleApproveConfirm}
              style={{ background: "#1B4332", border: "1px solid transparent" }}
            >
              Yes, Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeRegisterForm;
