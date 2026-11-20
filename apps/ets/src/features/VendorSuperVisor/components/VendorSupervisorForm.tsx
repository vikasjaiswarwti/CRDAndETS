import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { CreateVendorSupervisorDto } from "../types/vendorSupervisor.types";
import { T } from "../../../styles/tokens";
// ── Design tokens (mirrored from LkpLocationFormModal) ──────────────────────
const C = {
  green: "#1B4332",
  greenMid: "#52796F",
  greenLight: "#B7E4C7",
  inputBg: "#F0FAF4",
  border: "#B7E4C7",
  borderFocus: "#4CAF82",
  error: "#e53e3e",
  label: "#52796F",
  section: "#d0e8d8",
  borderGrey: "",
} as const;

// ── Style helpers ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.label,
  marginBottom: 3,
  display: "block",
};
const baseInput: React.CSSProperties = {
  width: "100%",
  height: 34,
  padding: "0 10px",
  fontSize: 12,
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: T.formcss.inputBg,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const sectionHead: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: C.green,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  borderBottom: `2px solid ${C.greenLight}`,
  paddingBottom: 5,
  marginBottom: 10,
  marginTop: 14,
};

// ── Sub-components ───────────────────────────────────────────────────────────
type SelectOption = { label: string; value: number | string };

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ label, required, error, hint, style, children }) => (
  <div style={{ marginBottom: 10, ...style }}>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <div style={{ fontSize: 10, color: C.greenMid, marginTop: 2 }}>
        {hint}
      </div>
    )}
    {error && (
      <div style={{ fontSize: 10, color: C.error, marginTop: 2 }}>{error}</div>
    )}
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  error?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  error,
  onKeyDown,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        ...baseInput,
        borderColor: error ? C.error : focused ? C.borderFocus : C.border,
        boxShadow: focused ? `0 0 0 3px ${C.borderFocus}22` : "none",
      }}
    />
  );
};

/** Multi-select dropdown + chips rendered below */
const ChipSelect: React.FC<{
  options: SelectOption[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  error?: boolean;
}> = ({ options, value, onChange, placeholder }) => {
  const { Select } = useUILibrary();
  const chips = value
    .map((id) => options.find((o) => Number(o.value) === id))
    .filter(Boolean) as SelectOption[];

  return (
    <div>
      <Select
        mode="multiple"
        style={{
          width: "100%",
          fontSize: 12,
          border: `1px solid ${C.border}`,
          background: T.formcss.inputBg,
        }}
        placeholder={placeholder ?? "Search and select…"}
        options={options}
        value={value}
        onChange={(vals: (number | string)[]) => onChange(vals.map(Number))}
        allowClear
        showSearch
        maxTagCount={0}
      />
      {chips.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            marginTop: 8,
            padding: "8px 10px",
            background: "#f0faf4",
            border: `1px solid ${C.greenLight}`,
            borderRadius: 7,
          }}
        >
          {chips.map((chip) => (
            <span
              key={chip.value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#374151", // dark gray
                border: "1px solid #4B5563",
                color: "#FFFFFF",
                borderRadius: 20,
                padding: "2px 9px",
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {chip.label}
              <span
                onClick={() =>
                  onChange(value.filter((id) => id !== Number(chip.value)))
                }
                style={{
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                  color: C.greenMid,
                  fontWeight: 700,
                  marginLeft: 1,
                }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Form state ───────────────────────────────────────────────────────────────
interface FormValues {
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId: string;
  locCode: string | number | "";
  transporterIds: number[];
}
interface FormErrors {
  firstName?: string;
  lastName?: string;
  mobileNo?: string;
  emailId?: string;
  locCode?: string;
  transporterIds?: string;
}

const makeEmpty = (): FormValues => ({
  firstName: "",
  lastName: "",
  mobileNo: "",
  emailId: "",
  locCode: "",
  transporterIds: [],
});

function validate(f: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!f.firstName.trim()) e.firstName = "First name is required";
  if (!f.lastName.trim()) e.lastName = "Last name is required";
  if (!f.mobileNo.trim()) e.mobileNo = "Mobile is required";
  else if (!/^\d{10}$/.test(f.mobileNo)) e.mobileNo = "Must be 10 digits";
  if (!f.emailId.trim()) e.emailId = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.emailId))
    e.emailId = "Enter a valid email";
  if (!f.locCode && f.locCode !== 0) e.locCode = "Location is required";
  if (!f.transporterIds.length) e.transporterIds = "Select at least one vendor";
  return e;
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateVendorSupervisorDto) => Promise<void>;
  vendorOptions: SelectOption[];
  locationOptions: SelectOption[];
  isSubmitting: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────
const VendorSupervisorForm: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  vendorOptions,
  locationOptions,
  isSubmitting,
}) => {
  const { Modal, Button, Select } = useUILibrary();
  const [form, setForm] = useState<FormValues>(makeEmpty);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(makeEmpty());
      setErrors({});
    }
  }, [open]);

  const set = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete (n as any)[key];
        return n;
      });
    },
    [],
  );

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      mobileNo: form.mobileNo,
      emailId: form.emailId.trim(),
      locCode: Number(form.locCode),
      transporterIds: form.transporterIds,
    });
  };

  // const initials =
  //   `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();
  // // const avatarBg = initials ? pickColor(initials) : "#9ca3af";
  // // const displayName =
  // //   `${form.firstName} ${form.lastName}`.trim() || "New Supervisor";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      width={560}
      centered
      footer={null}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Header ── */}
      {/* <div
        style={{
          padding: "18px 22px 14px",
          background: "linear-gradient(135deg, #f0faf4 0%, #e6f4ec 100%)",
          borderBottom: `1px solid ${C.greenLight}`,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            background: avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            boxShadow: `0 0 0 3px ${avatarBg}40`,
            transition: "all 0.2s",
          }}
        >
          {initials || "?"}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.green }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: C.greenMid, marginTop: 1 }}>
            Fill in the details to create a vendor supervisor account
          </div>
        </div>
      </div> */}

      {/* ── Body ── */}
      <div style={{ padding: "10px 22px 18px" }}>
        {/* Personal Info */}
        <div style={sectionHead}>Personal Information</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 14px",
          }}
        >
          <Field label="First Name" required error={errors.firstName}>
            <TextInput
              value={form.firstName}
              onChange={(v) => set("firstName", v)}
              placeholder="Enter your first name"
              maxLength={60}
              error={!!errors.firstName}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <TextInput
              value={form.lastName}
              onChange={(v) => set("lastName", v)}
              placeholder="Enter your last name"
              maxLength={60}
              error={!!errors.lastName}
            />
          </Field>
          <Field label="Mobile Number" required error={errors.mobileNo}>
            <TextInput
              value={form.mobileNo}
              onChange={(v) => set("mobileNo", v)}
              placeholder="Enter mobile no."
              maxLength={10}
              error={!!errors.mobileNo}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
                if (!/\d/.test(e.key)) e.preventDefault();
              }}
            />
          </Field>
          <Field label="Email Address" required error={errors.emailId}>
            <TextInput
              value={form.emailId}
              onChange={(v) => set("emailId", v)}
              placeholder="Enter your email"
              type="email"
              error={!!errors.emailId}
            />
          </Field>
        </div>

        {/* Assignment */}
        <div style={sectionHead}>Assignment</div>
        <Field label="Office Location" required error={errors.locCode}>
          <Select
            value={form.locCode || undefined}
            onChange={(v: string | number) => set("locCode", v)}
            options={locationOptions}
            placeholder="Select office location"
            showSearch
            allowClear
            style={{
              width: "100%",
              fontSize: 12,
              border: `1px solid ${C.border}`,
              background: T.formcss.inputBg,
            }}
          />
        </Field>
        <Field label="Assign Vendor(s)" required error={errors.transporterIds}>
          <ChipSelect
            options={vendorOptions}
            value={form.transporterIds}
            onChange={(ids) => set("transporterIds", ids)}
            placeholder="Search and select vendors…"
            error={!!errors.transporterIds}
          />
        </Field>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${C.greenLight}`,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              borderRadius: 50,
              borderColor: C.green,
              color: C.green,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit}
            style={{
              borderRadius: 50,
              background: C.green,
              borderColor: C.green,
              fontWeight: 600,
              paddingInline: 24,
            }}
          >
            Create Supervisor
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VendorSupervisorForm;
