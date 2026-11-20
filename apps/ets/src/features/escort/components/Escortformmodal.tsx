// src/features/escort/components/EscortFormModal.tsx

import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { Escort } from "../types/Escort.types";
import {
  PhoneOutlined,
  SettingOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormValues {
  name: string;
  escortVendorId: number | null;
  locCode: string | number | null;
  mobileNo: string;
  emailId: string;
  address: string;
  remarks: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
  escortVendorId?: string;
  locCode?: string;
  mobileNo?: string;
  emailId?: string;
  address?: string;
}

interface EscortFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Escort | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  escortVendorOptions: { label: string; value: number }[];
  locationOptions: { label: string; value: string | number }[];
  isLookupsLoading: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s.\-']+$/;

const makeEmpty = (): FormValues => ({
  name: "",
  escortVendorId: null,
  locCode: null,
  mobileNo: "",
  emailId: "",
  address: "",
  remarks: "",
  active: true,
});

const fromRecord = (r: Escort): FormValues => ({
  name: r.name ?? "",
  escortVendorId: r.escortVendorId ?? null,
  locCode: r.locCode ?? null,
  mobileNo: r.mobileNo ?? "",
  emailId: r.emailId ?? "",
  address: r.address ?? "",
  remarks: r.remarks ?? "",
  active: r.active ?? true,
});

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  green: "#1B4332",
  greenMid: "#52796F",
  greenLight: "#B7E4C7",
  inputBg: "#F0FAF4",
  border: "#B7E4C7",
  borderFocus: "#4CAF82",
  error: "#e53e3e",
  label: "#52796F",
} as const;

// ── Style helpers ──────────────────────────────────────────────────────────────

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
  background: C.inputBg,
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
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  gap: 6,
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
      {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <div style={{ fontSize: 10, color: C.greenMid, marginTop: 2 }}>{hint}</div>
    )}
    {error && (
      <div style={{ fontSize: 10, color: C.error, marginTop: 2 }}>{error}</div>
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
}> = ({ value, onChange, onKeyDown, placeholder, maxLength, type = "text", error }) => {
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
        background: C.inputBg,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
        padding: "7px 12px",
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{label}</span>
      <Switch
        checked={checked}
        onChange={onChange}
        style={checked ? { background: C.green } : undefined}
      />
    </div>
  );
};

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(f: FormValues): FormErrors {
  const e: FormErrors = {};

  if (!f.name.trim())
    e.name = "Escort name is required";
  else if (!NAME_REGEX.test(f.name.trim()))
    e.name = "Letters, spaces, . - ' only";
  else if (f.name.trim().length > 120)
    e.name = "Max 120 characters";

  if (!f.escortVendorId)
    e.escortVendorId = "Escort vendor is required";

  if (!f.locCode)
    e.locCode = "Office is required";

  if (!f.mobileNo.trim())
    e.mobileNo = "Mobile number is required";
  else if (!MOBILE_REGEX.test(f.mobileNo.trim()))
    e.mobileNo = "Enter a valid 10-digit number starting with 6, 7, 8, or 9";

  if (!f.emailId.trim())
    e.emailId = "Email is required";
  else if (!EMAIL_REGEX.test(f.emailId.trim()))
    e.emailId = "Enter a valid email address";

  if (!f.address.trim())
    e.address = "Address is required";

  return e;
}

const allowDigitsOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  if (
    e.ctrlKey || e.metaKey || e.altKey ||
    ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) return;
  if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
  if (input.value.length === 0 && /[0-5]/.test(e.key)) e.preventDefault();
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const EscortFormModal: React.FC<EscortFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  escortVendorOptions,
  locationOptions,
  isLookupsLoading,
}) => {
  const { Modal, Button, Select } = useUILibrary();
  const [form, setForm] = useState<FormValues>(makeEmpty);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    setForm(editingRecord ? fromRecord(editingRecord) : makeEmpty());
    setErrors({});
  }, [open, editingRecord]);

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
      ...(editingRecord ? { escortId: editingRecord.escortId } : {}),
      name: form.name.trim(),
      escortVendorId: form.escortVendorId,
      locCode: form.locCode,
      mobileNo: form.mobileNo.trim(),
      emailId: form.emailId.trim(),
      address: form.address.trim(),
      remarks: form.remarks.trim() || null,
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
          <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>
            {isEdit ? "Edit Escort" : "Add Escort"}
          </div>
          <div style={{ fontSize: 11, color: C.greenMid, fontWeight: 400, marginTop: 2 }}>
            {isEdit
              ? "Update escort details."
              : "Fill in the escort details below."}
          </div>
        </div>
      }
      width={580}
      destroyOnClose
      footer={null}
      style={{ borderRadius: 16, top: 15 }}
      styles={{
        mask: { background: "rgba(0,60,30,0.35)", backdropFilter: "blur(2px)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { paddingTop: 0 },
      }}
    >
      {/* ── Identity ───────────────────────────────────────────────────── */}
      <div style={sectionHead}>
        <UserAddOutlined /> Escort Identity
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Field label="Escort Name" required error={errors.name}>
          <TextInput
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="Enter escort name"
            maxLength={60}
            error={!!errors.name}
          />
        </Field>

        <Field label="Escort Vendor" required error={errors.escortVendorId}>
          <Select
            value={form.escortVendorId || undefined}
            onChange={(v: number) => set("escortVendorId", v)}
            options={escortVendorOptions}
            loading={isLookupsLoading}
            placeholder="Select escort vendor"
            showSearch
            allowClear
            style={{ width: "100%", fontSize: 13 }}
          />
        </Field>
      </div>

      {/* ── Assignment ─────────────────────────────────────────────────── */}
      <div style={sectionHead}>
        <EnvironmentOutlined /> Assignment
      </div>

      <Field label="Office" required error={errors.locCode}>
        <Select
          value={form.locCode || undefined}
          onChange={(v: string | number) => set("locCode", v)}
          options={locationOptions}
          loading={isLookupsLoading}
          placeholder="Select office"
          showSearch
          allowClear
          style={{ width: "100%", fontSize:13 }}
        />
      </Field>

      {/* ── Contact Details ────────────────────────────────────────────── */}
      <div style={sectionHead}>
        <PhoneOutlined /> Contact Details
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Field label="Mobile Number" required error={errors.mobileNo}>
          <TextInput
            value={form.mobileNo}
            onChange={(v) => set("mobileNo", v)}
            onKeyDown={allowDigitsOnly}
            placeholder="9876543210"
            maxLength={10}
            type="tel"
            error={!!errors.mobileNo}
          />
        </Field>

        <Field label="Email ID" required error={errors.emailId}>
          <TextInput
            value={form.emailId}
            onChange={(v) => set("emailId", v)}
            placeholder="escort@example.com"
            type="email"
            maxLength={120}
            error={!!errors.emailId}
          />
        </Field>
      </div>

      {/* ── Address & Remarks ──────────────────────────────────────────── */}
      <Field label="Address" required error={errors.address}>
        <textarea
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter full address…"
          rows={2}
          maxLength={300}
          style={{
            ...baseInput,
            height: "auto",
            minHeight: 52,
            padding: "6px 10px",
            resize: "none",
            borderColor: errors.address ? C.error : C.border,
          }}
        />
      </Field>

      <Field label="Remarks" hint="Optional notes">
        <textarea
          value={form.remarks}
          onChange={(e) => set("remarks", e.target.value)}
          placeholder="Enter remarks (optional)…"
          rows={2}
          maxLength={300}
          style={{
            ...baseInput,
            height: "auto",
            minHeight: 52,
            padding: "6px 10px",
            resize: "none",
          }}
        />
      </Field>

      {/* ── Settings (edit only) ───────────────────────────────────────── */}
      {isEdit && (
        <>
          <div style={sectionHead}>
            <SettingOutlined /> Settings
          </div>
          <ToggleRow
            label="Active"
            checked={form.active}
            onChange={(v) => set("active", v)}
          />
        </>
      )}

      {/* ── Server errors ──────────────────────────────────────────────── */}
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

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <Button
          onClick={onClose}
          style={{ borderRadius: 50, borderColor: C.green, color: C.green, fontWeight: 500 }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          loading={isSubmitting || isLookupsLoading}
          onClick={handleSubmit}
          style={{
            borderRadius: 50,
            background: C.green,
            borderColor: C.green,
            fontWeight: 600,
            paddingInline: 28,
          }}
        >
          {isEdit ? "Save Changes" : "Create Escort"}
        </Button>
      </div>
    </Modal>
  );
};

export default EscortFormModal;
// import React from 'react';
// import { AppForm } from '../../../shared/components/AppForm/AppForm';
// import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
// import { getEscortFormFields } from '../constants/EscortFormFields';
// import type { FieldError } from '../../../shared/types/api-error.types';
// import type { Escort } from '../types/Escort.types';

// interface EscortFormModalProps {
//     open: boolean;
//     onClose: () => void;
//     editingRecord: Escort | null;
//     onSubmit: (values: Record<string, unknown>) => Promise<void>;
//     isSubmitting: boolean;
//     serverErrors?: FieldError[] | null;
//     escortVendorOptions: { label: string; value: number }[];
//     locationOptions: { label: string; value: string | number }[];
//     isLookupsLoading: boolean;
// }

// export const EscortFormModal: React.FC<EscortFormModalProps> = ({
//     open,
//     onClose,
//     editingRecord,
//     onSubmit,
//     isSubmitting,
//     serverErrors,
//     escortVendorOptions,
//     locationOptions,
//     isLookupsLoading
// }) => {
//     const { Modal } = useUILibrary();

//     const fields = getEscortFormFields({ escortVendorOptions, locationOptions });

//     const initialValues = editingRecord
//         ? {
//             ...editingRecord,
//             name: editingRecord.name ?? '',
//             address: editingRecord.address ?? '',
//             mobileNo: editingRecord.mobileNo ?? '',
//             emailId: editingRecord.emailId ?? '',
//             remarks: editingRecord.remarks ?? '',
//         }
//         : {
//             name: '',
//             escortVendorId: undefined,
//             locCode: undefined,
//             address: '',
//             mobileNo: '',
//             emailId: '',
//             remarks: '',
//             active: true,
//         };

//     return (
//         <Modal
//             open={open}
//             onCancel={onClose}
//             title={editingRecord ? 'Edit Escort' : 'Add Escort'}
//             width={580}
//             destroyOnClose
//             footer={null}
//             // styles={{
//             //     header: { borderBottom: 'none' },
//             //     mask: { background: 'rgba(0, 60, 30, 0.35)' },
//             // }}
//             style={{ borderRadius: 16, top: 15 }}
//         >
//             <AppForm
//                 fields={fields}
//                 initialValues={initialValues}
//                 onSubmit={onSubmit}
//                 onCancel={onClose}
//                 serverErrors={serverErrors}
//                 isSubmitting={isSubmitting || isLookupsLoading}
//                 submitLabel={editingRecord ? 'Save Changes' : 'Create Escort'}
//                 showCancel
//                 columns={2}
//                 resetOnSuccess
//             />
//         </Modal>
//     );
// };