// src/features/escort-vendor/components/EscortVendorFormModal.tsx

import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { EscortVendor } from "../types/Escortvendor.types";
import {
  PhoneOutlined,
  SettingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormValues {
  vendorName: string;
  locCode: string | number | null;
  mobile: string;
  emailId: string;
  address: string;
  remarks: string;
  active: boolean;
}

interface FormErrors {
  vendorName?: string;
  mobile?: string;
  emailId?: string;
  address?: string;
  locCode?: string;
}

interface EscortVendorFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: EscortVendor | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  locationOptions: { label: string; value: string | number }[];
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  isLookupsLoading: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s.\-']+$/;

const makeEmpty = (): FormValues => ({
  vendorName: "",
  mobile: "",
  emailId: "",
  address: "",
  remarks: "",
  active: true,
  locCode: null,
});

const fromRecord = (r: EscortVendor): FormValues => ({
  vendorName: r.vendorName ?? "",
  mobile: r.mobile ?? "",
  emailId: r.emailId ?? "",
  address: r.address ?? "",
  remarks: r.remarks ?? "",
  locCode: r.locCode ?? null,
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
  sectionBorder: "#d0e8d8",
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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  error?: boolean;
}> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  maxLength,
  type = "text",
  error,
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
      <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>
        {label}
      </span>
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

  if (!f.vendorName.trim()) e.vendorName = "Escort name is required";
  if (!f.locCode) e.locCode = "Office is required";
  else if (!NAME_REGEX.test(f.vendorName.trim()))
    e.vendorName = "Letters, Number, spaces, . - ' only";
  else if (f.vendorName.trim().length > 120)
    e.vendorName = "Max 120 characters";

  if (!f.mobile.trim()) e.mobile = "Mobile number is required";
  else if (!MOBILE_REGEX.test(f.mobile.trim()))
    e.mobile = "Enter a valid 10-digit number starting with 6, 7, 8, or 9";

  if (!f.emailId.trim()) e.emailId = "Email is required";
  else if (!EMAIL_REGEX.test(f.emailId.trim()))
    e.emailId = "Enter a valid email address";

  if (!f.address.trim()) e.address = "Address is required";

  return e;
}

const allowDigitsOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;

  // Allow control/navigation keys
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

  // Allow only digits
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

export const EscortVendorFormModal: React.FC<EscortVendorFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  locationOptions,
  serverErrors,
  isLookupsLoading,
}) => {
  const { Modal, Button, Select } = useUILibrary();
  const [form, setForm] = useState<FormValues>(makeEmpty);
  const [errors, setErrors] = useState<FormErrors>({});

  // Seed form on open / record change
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
      ...(editingRecord
        ? { mstEscortVendor_Id: editingRecord.mstEscortVendor_Id }
        : {}),
      vendorName: form.vendorName.trim(),
      mobile: form.mobile.trim(),
      emailId: form.emailId.trim(),
      address: form.address.trim(),
      locCode: form.locCode,
      remarks: form.remarks.trim() || null,
      active: form.active,
    };

    await onSubmit(payload);
  };

  const isEdit = !!editingRecord;
  // console.log(form);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>
            {isEdit ? "Edit Escort Vendor" : "Add Escort Vendor"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.greenMid,
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            {isEdit
              ? "Update escort vendor details."
              : "Fill in the escort vendor details below."}
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
      {/* ── Vendor Identity ─────────────────────────────────────────────── */}
      <div style={sectionHead}>
        <UserAddOutlined /> Escort Vendor Identity
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 12px",
        }}
      >
        <Field label="Escort Vendor Name" required error={errors.vendorName}>
          <TextInput
            value={form.vendorName}
            onChange={(v) => set("vendorName", v)}
            placeholder="Enter escort vendor name"
            maxLength={60}
            error={!!errors.vendorName}
          />
        </Field>
        <div style={{ minWidth: 0 }}>
          <Field label="Select office" required error={errors.locCode}>
            <Select
              value={form.locCode || undefined}
              onChange={(v: string | number) => set("locCode", v)}
              options={locationOptions}
              loading={isLookupsLoading}
              placeholder="Select Office"
              showSearch
              allowClear
              style={{ width: "100%", fontSize: 13 }}
            />
          </Field>
        </div>
      </div>

      {/* ── Contact Details ─────────────────────────────────────────────── */}
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
        <Field label="Mobile Number" required error={errors.mobile}>
          <TextInput
            value={form.mobile}
            onChange={(v) => set("mobile", v)}
            onKeyDown={allowDigitsOnly}
            placeholder="9876543210"
            maxLength={10}
            type="tel"
            error={!!errors.mobile}
          />
        </Field>

        <Field label="Email Address" required error={errors.emailId}>
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

      {/* ── Address ─────────────────────────────────────────────────────── */}
      {/* <div style={sectionHead}>Address</div> */}

      <Field label="Address" required error={errors.address}>
        <textarea
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter full address…"
          rows={1.5}
          maxLength={300}
          style={{
            ...baseInput,
            height: "auto",
            minHeight: 52,
            padding: "6px 10px",
            resize: "none",
            // lineHeight: 1.5,
            borderColor: errors.address ? C.error : C.border,
          }}
        />
      </Field>

      <Field label="Remarks" hint="">
        <textarea
          value={form.remarks}
          onChange={(e) => set("remarks", e.target.value)}
          placeholder="Any additional notes…"
          rows={1.5}
          maxLength={300}
          style={{
            ...baseInput,
            height: "auto",
            minHeight: 52,
            padding: "6px 10px",
            resize: "none",
            // lineHeight: 1.5,
          }}
        />
      </Field>

      {/* ── Settings ────────────────────────────────────────────────────── */}
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

      {/* ── Server errors ────────────────────────────────────────────────── */}
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

      {/* ── Actions ─────────────────────────────────────────────────────── */}
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
            borderColor: C.green,
            color: C.green,
            fontWeight: 500,
          }}
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
          {isEdit ? "Save Changes" : "Create Escort Vendor"}
        </Button>
      </div>
    </Modal>
  );
};

export default EscortVendorFormModal;
// import React from 'react';
// import { AppForm } from '../../../shared/components/AppForm/AppForm';
// import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
// import { getEscortVendorFormFields } from '../constants/EscortVendorFormFields';
// import type { FieldError } from '../../../shared/types/api-error.types';
// import type { EscortVendor } from '../types/Escortvendor.types';

// interface EscortVendorFormModalProps {
//     open: boolean;
//     onClose: () => void;
//     editingRecord: EscortVendor | null;
//     onSubmit: (values: Record<string, unknown>) => Promise<void>;
//     isSubmitting: boolean;
//     serverErrors?: FieldError[] | null;
//     locationOptions: { label: string; value: string | number }[];
//     isLookupsLoading: boolean;
// }

// export const EscortVendorFormModal: React.FC<EscortVendorFormModalProps> = ({
//     open,
//     onClose,
//     editingRecord,
//     onSubmit,
//     isSubmitting,
//     serverErrors,
//     locationOptions,
//     isLookupsLoading
// }) => {
//     const { Modal } = useUILibrary();

//     const formFields = getEscortVendorFormFields(locationOptions);

//     const initialValues = editingRecord
//         ? {
//             ...editingRecord,
//             vendorName: editingRecord.vendorName ?? '',
//             address: editingRecord.address ?? '',
//             mobile: editingRecord.mobile ?? '',
//             emailId: editingRecord.emailId ?? '',
//             remarks: editingRecord.remarks ?? '',
//         }
//         : {
//             vendorName: '',
//             locCode: undefined,
//             address: '',
//             mobile: '',
//             emailId: '',
//             remarks: '',
//             active: true,
//         };

//     return (
//         <Modal
//             open={open}
//             onCancel={onClose}
//             title={editingRecord ? 'Edit Escort Vendor' : 'Add Escort Vendor'}
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
//                 fields={formFields}
//                 initialValues={initialValues}
//                 onSubmit={onSubmit}
//                 onCancel={onClose}
//                 serverErrors={serverErrors}
//                 isSubmitting={isSubmitting || isLookupsLoading}
//                 submitLabel={editingRecord ? 'Save Changes' : 'Create Escort Vendor'}
//                 showCancel
//                 columns={2}
//                 resetOnSuccess
//             />
//         </Modal>
//     );
// };
