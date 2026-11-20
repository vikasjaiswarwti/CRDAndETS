import React, { useState, useCallback } from "react";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { useRequestPasswordChangeMutation } from "../services/employeeProfileApi";
import type { PasswordChangeRequest } from "../types/employeeProfile.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordFormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Password rules ───────────────────────────────────────────────────────────

const RULES = [
  {
    id: "len",
    test: (p: string) => p.length >= 8,
    label: "At least 8 characters",
  },
  {
    id: "upper",
    test: (p: string) => /[A-Z]/.test(p),
    label: "One uppercase letter",
  },
  { id: "num", test: (p: string) => /[0-9]/.test(p), label: "One number" },
  {
    id: "sym",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    label: "One special character",
  },
];

const STRENGTH = [
  { label: "", barColor: "#e5e7eb", textColor: "#9ca3af" },
  { label: "Weak", barColor: "#ef4444", textColor: "#dc2626" },
  { label: "Fair", barColor: "#f97316", textColor: "#ea580c" },
  { label: "Good", barColor: "#eab308", textColor: "#ca8a04" },
  { label: "Strong", barColor: "#22c55e", textColor: "#16a34a" },
];

const scorePassword = (p: string) =>
  RULES.reduce((n, r) => n + (r.test(p) ? 1 : 0), 0);

// ─── PasswordInput ────────────────────────────────────────────────────────────

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  autoComplete?: string;
}> = ({ value, onChange, placeholder, error, autoComplete }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "10px 40px 10px 14px",
            border: `1.5px solid ${error ? "#fca5a5" : "#d1fae5"}`,
            borderRadius: 10,
            fontSize: 13,
            color: "#111827",
            background: error ? "#fff5f5" : "#f9fffe",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "#f87171" : "#064E3B";
            e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? "rgba(239,68,68,0.1)" : "rgba(6,78,59,0.08)"}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#fca5a5" : "#d1fae5";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            padding: 0,
            display: "flex",
            fontSize: 15,
          }}
        >
          {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
      {error && (
        <p style={{ margin: "4px 0 0 2px", fontSize: 11, color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
};

// ─── Label style ──────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
  letterSpacing: 0.2,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ChangePasswordForm: React.FC = () => {
  const [requestPasswordChange, { isLoading: isSubmitting, error: apiError }] =
    useRequestPasswordChangeMutation();

  const [form, setForm] = useState<PasswordFormState>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PasswordFormState, string>>
  >({});
  const [success, setSuccess] = useState(false);

  const strength = scorePassword(form.newPassword);
  const sm = STRENGTH[strength];
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.confirmPassword === form.newPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.confirmPassword !== form.newPassword;

  const set = useCallback(
    <K extends keyof PasswordFormState>(key: K, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
      setSuccess(false);
    },
    [],
  );

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PasswordFormState, string>> = {};
    if (!form.oldPassword.trim())
      errs.oldPassword = "Current password is required";
    if (!form.newPassword.trim()) errs.newPassword = "New password is required";
    else if (form.newPassword.length < 8)
      errs.newPassword = "Must be at least 8 characters";
    else if (form.newPassword === form.oldPassword)
      errs.newPassword = "New password must differ from current";
    if (!form.confirmPassword.trim())
      errs.confirmPassword = "Please confirm your new password";
    else if (form.confirmPassword !== form.newPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: PasswordChangeRequest = {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    };

    try {
      await requestPasswordChange(payload).unwrap();
      setSuccess(true);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch {
      // apiError displayed below
    }
  };

  console.log("apiError", apiError);

  // const serverMessage =
  //   apiError && "data" in apiError
  //     ? ((apiError.data as any)?.message ??
  //       "Something went wrong. Please try again.")
  //     : null;

  const serverMessage =
    apiError && "data" in apiError
      ? ((apiError.data as any)?.title ??
        "Something went wrong. Please try again.")
      : null;

  return (
    <>
      <style>{`@keyframes cpf-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page container — centers the card */}
      <div
        style={{
          minHeight: "100vh",
          background: "#f6fdf8",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #d1fae5",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(6,78,59,0.07)",
          }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div
            style={{
              padding: "18px 24px 16px",
              borderBottom: "1px solid #f0fdf4",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                background: "linear-gradient(135deg, #064E3B 0%, #065f46 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(6,78,59,0.2)",
              }}
            >
              <LockOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#064E3B" }}>
                Change Password
              </div>
              <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 1 }}>
                Keep your account secure with a strong password
              </div>
            </div>
          </div>

          {/* ── Form ───────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ padding: "22px 24px 24px" }}>
            {/* Success banner */}
            {success && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "#064E3B",
                  fontWeight: 500,
                }}
              >
                <CheckCircleFilled style={{ color: "#22c55e", fontSize: 15 }} />
                Password updated successfully!
              </div>
            )}

            {/* Server error */}
            {serverMessage && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                <CloseCircleFilled style={{ flexShrink: 0 }} />
                {serverMessage}
              </div>
            )}

            {/* Current Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>
                Current Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <PasswordInput
                value={form.oldPassword}
                onChange={(v) => set("oldPassword", v)}
                placeholder="Enter your current password"
                error={errors.oldPassword}
                autoComplete="current-password"
              />
            </div>

            <div
              style={{ borderTop: "1px dashed #d1fae5", margin: "2px 0 20px" }}
            />

            {/* New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>
                New Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <PasswordInput
                value={form.newPassword}
                onChange={(v) => set("newPassword", v)}
                placeholder="Minimum 8 characters"
                error={errors.newPassword}
                autoComplete="new-password"
              />
            </div>

            {/* Strength meter */}
            {form.newPassword.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 99,
                        background: n <= strength ? sm.barColor : "#e5e7eb",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: sm.textColor,
                    }}
                  >
                    {sm.label}
                  </span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>
                    Use uppercase, numbers &amp; symbols
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px 12px",
                  }}
                >
                  {RULES.map((r) => {
                    const ok = r.test(form.newPassword);
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                        }}
                      >
                        <span
                          style={{
                            color: ok ? "#22c55e" : "#d1d5db",
                            fontSize: 13,
                            lineHeight: 1,
                          }}
                        >
                          {ok ? "✓" : "○"}
                        </span>
                        <span
                          style={{
                            color: ok ? "#374151" : "#9ca3af",
                            fontWeight: ok ? 500 : 400,
                          }}
                        >
                          {r.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>
                Confirm New Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <PasswordInput
                value={form.confirmPassword}
                onChange={(v) => set("confirmPassword", v)}
                placeholder="Re-enter your new password"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            {/* Match badge */}
            {(passwordsMatch || passwordsMismatch) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 12px",
                  borderRadius: 8,
                  marginBottom: 18,
                  background: passwordsMatch ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${passwordsMatch ? "#86efac" : "#fca5a5"}`,
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: passwordsMatch ? "#064E3B" : "#dc2626",
                }}
              >
                {passwordsMatch ? (
                  <>
                    <CheckCircleFilled style={{ color: "#22c55e" }} /> Passwords
                    match
                  </>
                ) : (
                  <>
                    <CloseCircleFilled style={{ color: "#ef4444" }} /> Passwords
                    do not match
                  </>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: isSubmitting
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #064E3B 0%, #065f46 100%)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: isSubmitting
                  ? "none"
                  : "0 4px 14px rgba(6,78,59,0.25)",
                transition: "opacity 0.15s",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      display: "inline-block",
                      animation: "cpf-spin 0.8s linear infinite",
                    }}
                  />
                  Updating…
                </>
              ) : (
                <>
                  <LockOutlined /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordForm;
