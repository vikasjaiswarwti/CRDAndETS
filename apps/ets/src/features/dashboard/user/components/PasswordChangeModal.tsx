import React, { useState, useCallback } from "react";
import {
  LockOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context"; // adjust to your import path
import type { PasswordChangeRequest } from "../types/employeeProfile.types";

// ── Types ────────────────────────────────────────────────────────────────────

interface PasswordFormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ServerError {
  message: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PasswordChangeRequest) => Promise<void>;
  isSubmitting?: boolean;
  serverErrors?: ServerError[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: 8,
  borderColor: "#D1E8DD",
  fontSize: 13,
};

const FieldWrap: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: "#52796F",
        marginBottom: 4,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {label}
      {required && <span style={{ color: "#E53E3E", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <div
        style={{
          color: "#C53030",
          fontSize: 11,
          marginTop: 3,
          paddingLeft: 2,
        }}
      >
        {error}
      </div>
    )}
  </div>
);

/** Simple password strength scorer (0–4) */
const scorePassword = (pwd: string): number => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#E53E3E", "#DD6B20", "#D69E2E", "#1B4332"];
// const STRENGTH_BG = ["", "#FFF5F5", "#FFFAF0", "#FFFFF0", "#F0FAF4"];

// ── Component ─────────────────────────────────────────────────────────────────

export const PasswordChangeModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Input, Button, Modal } = useUILibrary();

  const [form, setForm] = useState<PasswordFormState>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PasswordFormState, string>>
  >({});

  const [show, setShow] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const strength = scorePassword(form.newPassword);

  const set = useCallback(
    <K extends keyof PasswordFormState>(key: K, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    },
    [],
  );

  const toggleShow = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PasswordFormState, string>> = {};

    if (!form.oldPassword.trim())
      errs.oldPassword = "Current password is required";

    if (!form.newPassword.trim()) {
      errs.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      errs.newPassword = "Must be at least 8 characters";
    } else if (form.newPassword === form.oldPassword) {
      errs.newPassword = "New password must differ from current password";
    }

    if (!form.confirmPassword.trim()) {
      errs.confirmPassword = "Please confirm your new password";
    } else if (form.confirmPassword !== form.newPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: PasswordChangeRequest = {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    };

    await onSubmit(payload);
  };

  const handleClose = () => {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    onClose();
  };

  // Eye-toggle suffix for password inputs
  const eyeSuffix = (field: keyof typeof show) => (
    <span
      onClick={() => toggleShow(field)}
      style={{ cursor: "pointer", color: "#8A9E99", fontSize: 14 }}
    >
      {show[field] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
    </span>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={480}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: {
          padding: "16px 24px 12px",
          borderBottom: "1px solid #F0F7F4",
          marginBottom: 0,
        },
        body: { padding: 0, overflow: "hidden" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#F0FAF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockOutlined style={{ color: "#1B4332", fontSize: 15 }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1B4332",
                lineHeight: 1.3,
              }}
            >
              Change Password
            </div>
            <div style={{ fontSize: 11, color: "#8A9E99", fontWeight: 400 }}>
              Update your account password securely
            </div>
          </div>
        </div>
      }
      style={{ top: 30 }}
    >
      {/* ── Form body ── */}
      <div style={{ padding: "20px 24px 8px" }}>
        {/* Current Password */}
        <FieldWrap label="Current Password" required error={errors.oldPassword}>
          <Input
            type={show.oldPassword ? "text" : "password"}
            value={form.oldPassword}
            onChange={(e: any) => set("oldPassword", e.target.value)}
            placeholder="Enter your current password"
            suffix={eyeSuffix("oldPassword")}
            style={FIELD_STYLE}
          />
        </FieldWrap>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px dashed #E8F5EE",
            margin: "4px 0 16px",
          }}
        />

        {/* New Password */}
        <FieldWrap label="New Password" required error={errors.newPassword}>
          <Input
            type={show.newPassword ? "text" : "password"}
            value={form.newPassword}
            onChange={(e: any) => set("newPassword", e.target.value)}
            placeholder="Min. 8 characters"
            suffix={eyeSuffix("newPassword")}
            style={FIELD_STYLE}
          />
        </FieldWrap>

        {/* Strength meter — only shown when user has started typing */}
        {form.newPassword.length > 0 && (
          <div style={{ marginTop: -8, marginBottom: 14 }}>
            {/* Bar track */}
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 5,
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 99,
                    background:
                      n <= strength ? STRENGTH_COLORS[strength] : "#E8F5EE",
                    transition: "background 0.25s ease",
                  }}
                />
              ))}
            </div>
            {/* Label */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: STRENGTH_COLORS[strength],
                  fontWeight: 600,
                }}
              >
                {STRENGTH_LABELS[strength]}
              </div>
              <div style={{ fontSize: 10, color: "#8A9E99" }}>
                Use uppercase, numbers &amp; symbols for a strong password
              </div>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <FieldWrap
          label="Confirm New Password"
          required
          error={errors.confirmPassword}
        >
          <Input
            type={show.confirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e: any) => set("confirmPassword", e.target.value)}
            placeholder="Re-enter your new password"
            suffix={eyeSuffix("confirmPassword")}
            style={FIELD_STYLE}
          />
        </FieldWrap>

        {/* Match badge */}
        {form.confirmPassword.length > 0 && (
          <div
            style={{
              background:
                form.confirmPassword === form.newPassword
                  ? "#F0FAF4"
                  : "#FFF5F5",
              border: `1px solid ${
                form.confirmPassword === form.newPassword
                  ? "#B7E4C7"
                  : "#FC8181"
              }`,
              borderRadius: 8,
              padding: "7px 10px",
              marginBottom: 12,
              fontSize: 11,
              color:
                form.confirmPassword === form.newPassword
                  ? "#1B4332"
                  : "#C53030",
              fontFamily: "monospace",
            }}
          >
            {form.confirmPassword === form.newPassword
              ? "✅ Passwords match"
              : "❌ Passwords do not match"}
          </div>
        )}

        {/* Server errors */}
        {serverErrors && serverErrors.length > 0 && (
          <div
            style={{
              background: "#FFF5F5",
              border: "1px solid #FC8181",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 10,
            }}
          >
            {serverErrors.map((e, i) => (
              <div key={i} style={{ color: "#C53030", fontSize: 12 }}>
                • {e.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "14px 24px 20px",
          borderTop: "1px solid #F0F7F4",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          style={{
            borderRadius: 999,
            borderColor: "#D1E8DD",
            color: "#52796F",
            fontWeight: 600,
            paddingInline: 20,
            height: 40,
          }}
        >
          Cancel
        </Button>

        <Button
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          style={{
            borderRadius: 999,
            background: "#1B4332",
            borderColor: "#1B4332",
            fontWeight: 600,
            paddingInline: 28,
            height: 40,
            minWidth: 150,
            boxShadow: "0 4px 12px rgba(27,67,50,0.18)",
          }}
        >
          Update Password
        </Button>
      </div>
    </Modal>
  );
};
