import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { Vendor } from "../types/vendor.types";
import {
  FileProtectOutlined,
  PhoneOutlined,
  SettingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { T } from "../../../styles/tokens";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormValues {
  vendorName: string;
  prefixTag: string;
  bpId: string | number | "";
  singlePlan: boolean;
  mobile: string;
  emailId: string;
  remarks: string;
  contactFrom: string | Dayjs;
  contactTo: string | Dayjs;
  // map-derived (read-only inputs)
  locCode: string | number | null;
  address: string;
  active: boolean;
}

interface FormErrors {
  vendorName?: string;
  prefixTag?: string;
  bpId?: string;
  mobile?: string;
  emailId?: string;
  address?: string;
  locCode?: string;
  contactFrom?: string;
  contactTo?: string;
  remarks?: string;
}

interface VendorFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Vendor | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  locationOptions: { label: string; value: string | number }[];
  billPlanTypeOptions: { label: string; value: string | number }[];
  isLookupsLoading: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9\s\-()+]+$/;

const makeEmpty = (): FormValues => ({
  vendorName: "",
  prefixTag: "",
  bpId: "",
  singlePlan: true,
  mobile: "",
  emailId: "",
  remarks: "",
  contactFrom: "",
  locCode: null,
  contactTo: "",
  address: "",
  active: true,
});

const fromRecord = (r: Vendor): FormValues => ({
  vendorName: r.vendorName ?? "",
  prefixTag: r.prefixTag ?? "",
  bpId: r.bpId ?? "",
  singlePlan: r.singlePlan ?? true,
  mobile: r.mobile ?? "",
  emailId: r.emailId ?? "",
  locCode: r.locCode,
  remarks: r.remarks ?? "",
  contactFrom: r.contactFrom ? dayjs(r.contactFrom) : "",
  contactTo: r.contactTo ? dayjs(r.contactTo) : "",
  address: r.address ?? "",
  active: r.active ?? true,
});

// ── Design tokens ──────────────────────────────────────────────────────────────

// ── Style helpers ──────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: T.formcss.label,
  marginBottom: 3,
  display: "block",
};

const baseInput: React.CSSProperties = {
  width: "100%",
  height: 34,
  padding: "0 10px",
  fontSize: 12,
  borderRadius: 7,
  border: `1px solid ${T.formcss.greyBorder}`,
  background: T.formcss.inputBg,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const selectStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  fontSize: 12,
  background: T.formcss.inputBg,
  border: `1px solid ${hasError ? "#ff4d4f" : T.formcss.greyBorder}`,
  height: 34,
  borderRadius: 6,
});

const dateInput: React.CSSProperties = {
  border: `1px solid ${T.formcss.greyBorder}`,
  background: T.formcss.inputBg,
};

const lockedInput: React.CSSProperties = {
  ...baseInput,
  background: T.formcss.lockedBg,
  color: "#555",
  cursor: "not-allowed",
  border: `1px solid ${T.formcss.sectionBorder}`,
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const sectionHead: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: T.formcss.green,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  borderBottom: `1.2px solid ${T.formcss.greyBorder}`,
  paddingBottom: 5,
  marginBottom: 10,
  marginTop: 6,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      {required && (
        <span style={{ color: T.formcss.error, marginLeft: 2 }}>*</span>
      )}
    </label>
    {children}
    {hint && !error && (
      <div style={{ fontSize: 10, color: T.formcss.greenMid, marginTop: 2 }}>
        {hint}
      </div>
    )}
    {error && (
      <div style={{ fontSize: 10, color: T.formcss.error, marginTop: 2 }}>
        {error}
      </div>
    )}
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  error?: boolean;
  disabled?: boolean;
}> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  maxLength,
  type = "text",
  error,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      disabled={disabled}
      readOnly={disabled}
      tabIndex={disabled ? -1 : undefined}
      value={value}
      onChange={(e) => !disabled && onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={
        disabled
          ? lockedInput
          : {
              ...baseInput,
              borderColor: error
                ? T.formcss.error
                : focused
                  ? T.formcss.greyBorder
                  : T.formcss.greyBorder,
              boxShadow: focused
                ? `0 0 0 3px ${T.formcss.greenAccent}22`
                : "none",
            }
      }
    />
  );
};

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => {
  const { Switch } = useUILibrary();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: T.formcss.inputBg,
        border: `1px solid ${T.formcss.greyBorder}`,
        borderRadius: 7,
        padding: "7px 12px",
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 12, color: T.formcss.green, fontWeight: 500 }}>
        {label}
      </span>
      <Switch
        checked={checked}
        onChange={onChange}
        style={checked ? { background: T.formcss.green } : undefined}
      />
    </div>
  );
};

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(f: FormValues): FormErrors {
  const e: FormErrors = {};

  // Vendor Name
  if (!f.vendorName.trim()) {
    e.vendorName = "Vendor name is required";
  } else if (f.vendorName.trim().length > 120) {
    e.vendorName = "Max 120 characters";
  }

  // Prefix Tag
  if (!f.prefixTag.trim()) {
    e.prefixTag = "Prefix tag is required";
  }

  // Select Office (locCode)
  if (f.locCode === null || f.locCode === "" || f.locCode === undefined) {
    e.locCode = "Office is required";
  }

  // Bill Plan Type (bpId)
  if (!f.bpId && f.bpId !== 0) {
    e.bpId = "Bill plan type is required";
  }

  // Mobile
  if (!f.mobile.trim()) {
    e.mobile = "Mobile number is required";
  } else if (!PHONE_REGEX.test(f.mobile)) {
    e.mobile = "Digits, spaces, - and () only";
  } else {
    const digits = f.mobile.replace(/\D/g, "");
    if (digits.length !== 10) {
      e.mobile = "Mobile number must be 10 digits";
    }
  }

  // Email
  if (!f.emailId.trim()) {
    e.emailId = "Email is required";
  } else if (!EMAIL_REGEX.test(f.emailId)) {
    e.emailId = "Enter a valid email address";
  }

  // Address
  if (!f.address.trim()) {
    e.address = "Address is required";
  }

  // // Remarks
  // if (!f.remarks.trim()) {
  //   e.remarks = "Remarks are required";
  // }

  // Contact From
  if (!f.contactFrom) {
    e.contactFrom = "Start date is required";
  }

  // Contact To
  if (!f.contactTo) {
    e.contactTo = "End date is required";
  } else if (f.contactFrom && f.contactTo && f.contactFrom > f.contactTo) {
    e.contactTo = "End date must be after start date";
  }

  return e;
}

const allowPhoneKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;

  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ].includes(e.key)
  ) {
    return;
  }

  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  // First digit cannot be 0-5
  if (input.value.length === 0 && /[0-5]/.test(e.key)) {
    e.preventDefault();
  }
};

// ── Main Component ─────────────────────────────────────────────────────────────

const VendorFormModal: React.FC<VendorFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  locationOptions,
  billPlanTypeOptions,
  isLookupsLoading,
}) => {
  const { Modal, Select, Button, DatePicker } = useUILibrary();

  const [form, setForm] = useState<FormValues>(makeEmpty);
  const [errors, setErrors] = useState<FormErrors>({});

  // Seed form on open
  useEffect(() => {
    if (!open) return;
    setForm(editingRecord ? fromRecord(editingRecord) : makeEmpty());
    setErrors({});
  }, [open, editingRecord]);
  console.log(editingRecord, "editingRecord");

  const set = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete (n as Record<string, string>)[key];
        return n;
      });
    },
    [],
  );

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: Record<string, unknown> = {
      ...(editingRecord ? { mstVendor_Id: editingRecord.mstVendor_Id } : {}),
      vendorName: form.vendorName.trim(),
      locCode: form.locCode,
      prefixTag: form.prefixTag.trim() || null,
      bpId: Number(form.bpId),
      singlePlan: form.singlePlan,
      mobile: form.mobile.trim() || null,
      emailId: form.emailId.trim() || null,
      remarks: form.remarks.trim() || null,
      contactFrom: form.contactFrom || null,
      contactTo: form.contactTo || null,
      address: form.address,
      active: form.active,
    };

    await onSubmit(payload);
  };

  const isEdit = !!editingRecord;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div>
          <div
            style={{ fontSize: 16, fontWeight: 700, color: T.formcss.green }}
          >
            {isEdit ? "Edit Vendor" : "Add Vendor"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.formcss.greenMid,
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            {isEdit
              ? "Update vendor details and address."
              : "Fill in vendor details and address."}
          </div>
        </div>
      }
      width={860}
      destroyOnClose
      footer={null}
      style={{ borderRadius: 16, top: 20 }}
      styles={{
        mask: { background: "rgba(0,60,30,0.35)", backdropFilter: "blur(2px)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { paddingTop: 0 },
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div style={sectionStyle}>
          <div>
            <div style={sectionHead}>
              <UserAddOutlined /> Vendor Identity
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 12px",
              }}
            >
              <Field label="Vendor Name" required error={errors.vendorName}>
                <TextInput
                  value={form.vendorName}
                  onChange={(v) => {
                    const value = v.replace(/[^a-zA-Z0-9\s&.-]/g, "");
                    set("vendorName", value);
                  }}
                  placeholder="Enter vendor name"
                  maxLength={60}
                  error={!!errors.vendorName}
                />
              </Field>
              <Field
                label="Prefix Tag/Short Name"
                required
                error={errors.prefixTag}
                hint={
                  !errors.prefixTag ? "Short code prefixed to IDs" : undefined
                }
              >
                <TextInput
                  value={form.prefixTag}
                  onChange={(v) => set("prefixTag", v)}
                  placeholder="e.g. ACM"
                  maxLength={15}
                  error={!!errors.prefixTag}
                />
              </Field>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 12px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Field label="Select Office" required error={errors.locCode}>
                  <Select
                    value={form.locCode || undefined}
                    onChange={(v: string | number) => set("locCode", v)}
                    options={locationOptions}
                    loading={isLookupsLoading}
                    placeholder="Select Office"
                    showSearch
                    allowClear
                    style={selectStyle(!!errors.locCode)}
                  />
                </Field>
              </div>

              <div style={{ minWidth: 0 }}>
                <Field label="Bill Plan Type" required error={errors.bpId}>
                  <Select
                    value={form.bpId || undefined}
                    onChange={(v: string | number) => set("bpId", v)}
                    options={billPlanTypeOptions}
                    loading={isLookupsLoading}
                    placeholder="Select plan"
                    showSearch
                    allowClear
                    style={selectStyle(!!errors.bpId)}
                  />
                </Field>
              </div>
            </div>
          </div>
          <div>
            <div style={sectionHead}>
              <SettingOutlined /> Settings
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 12px",
              }}
            >
              <ToggleRow
                label="Single Plan"
                checked={form.singlePlan}
                onChange={(v) => set("singlePlan", v)}
              />
              <ToggleRow
                label="Active"
                checked={form.active}
                onChange={(v) => set("active", v)}
              />
            </div>
          </div>
          <div>
            <div style={sectionHead}>
              <FileProtectOutlined /> Contract Period
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 12px",
              }}
            >
              <Field label="Contact From" required error={errors.contactFrom}>
                <DatePicker
                  value={form.contactFrom || null}
                  onChange={(v: string) => set("contactFrom", v)}
                  placeholder="Start date"
                  style={{
                    width: "100%",
                    height: 34,
                    fontSize: 12,
                    ...dateInput,
                    ...(errors.contactFrom ? { borderColor: "#ff4d4f" } : {}),
                  }}
                />
              </Field>

              <Field label="Contact To" required error={errors.contactTo}>
                <DatePicker
                  value={form.contactTo || null}
                  onChange={(v: string) => set("contactTo", v)}
                  placeholder="End date"
                  style={{
                    width: "100%",
                    height: 34,
                    fontSize: 12,
                    ...dateInput,
                    ...(errors.contactTo ? { borderColor: "#ff4d4f" } : {}),
                  }}
                />
              </Field>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div>
            <div style={sectionHead}>
              <PhoneOutlined /> Contact Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 12px",
              }}
            >
              <Field label="Mobile" required error={errors.mobile}>
                <TextInput
                  value={form.mobile}
                  onChange={(v) => set("mobile", v)}
                  onKeyDown={allowPhoneKey}
                  placeholder="9876543210"
                  maxLength={10}
                  error={!!errors.mobile}
                />
              </Field>

              <Field label="Email" required error={errors.emailId}>
                <TextInput
                  value={form.emailId}
                  onChange={(v) => set("emailId", v)}
                  placeholder="vendor@example.com"
                  type="email"
                  maxLength={120}
                  error={!!errors.emailId}
                />
              </Field>
            </div>

            <Field label="Address" required error={errors.address}>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Enter your address..."
                rows={1}
                style={{
                  ...baseInput,
                  height: "auto",
                  minHeight: 48,
                  padding: "6px 10px",
                  resize: "none",
                  lineHeight: 1.5,
                  ...(errors.address ? { borderColor: T.formcss.error } : {}),
                }}
              />
            </Field>
            <Field label="Remarks" error={errors.remarks}>
              <textarea
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                placeholder="Any additional notes…"
                rows={1}
                maxLength={300}
                style={{
                  ...baseInput,
                  height: "auto",
                  minHeight: 48,
                  padding: "6px 10px",
                  resize: "none",
                  lineHeight: 1.5,
                  // ...(errors.remarks ? { borderColor: T.formcss.error } : {}),
                }}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Server errors */}
      {serverErrors && serverErrors.length > 0 && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fc8181",
            borderRadius: 8,
            padding: "8px 14px",
            marginTop: 10,
          }}
        >
          {serverErrors.map((e, i) => (
            <div key={i} style={{ color: "#c53030", fontSize: 11 }}>
              • {e.message}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 16,
        }}
      >
        <Button
          onClick={onClose}
          style={{
            borderRadius: 50,
            border: `1px solid ${T.formcss.green}`,
            color: T.formcss.green,
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
            background: T.formcss.green,
            fontWeight: 600,
            paddingInline: 28,
            border: `1px solid ${T.formcss.green}`,
          }}
        >
          {isEdit ? "Save Changes" : "Create Vendor"}
        </Button>
      </div>
    </Modal>
  );
};

export default VendorFormModal;
