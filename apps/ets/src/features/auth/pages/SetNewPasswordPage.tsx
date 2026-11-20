// src/features/auth/pages/SetNewPasswordPage.tsx

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { T } from "../../../styles/tokens";
import AuthLayout from "../components/AuthLayoutWrapper";

// ── Password strength helpers (pure — no side effects) ────────────────────────

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(3, score) as 0 | 1 | 2 | 3;
}

const STRENGTH_LABEL: Record<0 | 1 | 2 | 3, string> = {
  0: "Very weak",
  1: "Weak",
  2: "Medium",
  3: "Strong",
};
const STRENGTH_COLOR: Record<0 | 1 | 2 | 3, string> = {
  0: "#ef4444",
  1: "#f97316",
  2: "#eab308",
  3: "#22c55e",
};

// ── Component ─────────────────────────────────────────────────────────────────

const SetNewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleResetPassword, isResetLoading } = useAuth();

  // Token comes from the email link: /reset-password?token=<JWT>
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(newPassword) as 0 | 1 | 2 | 3;

  // ── Missing token guard ─────────────────────────────────────────────────────
  if (!token) {
    return (
      <AuthLayout showBanner={false}>
        <div style={s.errorBox}>
          <p style={s.errorText}>
            This reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <div style={s.backRow}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={s.backBtn}
          >
            ← Request new link
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout showBanner={false}>
        <div style={s.successBox}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successHeading}>Password reset successful!</h2>
          <p style={s.successText}>
            Your password has been changed. Redirecting you to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  function isPasswordStrongEnough(password: string): boolean {
    // Require at least "Medium" strength (score >= 2)
    const value = getPasswordStrength(password) >= 3;
    // console.log('value', value);
    return value;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters long.");

    if (!isPasswordStrongEnough(newPassword)) {
      return setError(
        "Password is too weak. Please create a stronger password with uppercase, lowercase, numbers, or special characters.",
      );
    }

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    try {
      await handleResetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthLayout showBanner={false}>
      <h1 style={s.heading}>Set a new password</h1>
      <p style={s.subheading}>
        Your new password must be different from previous passwords.
      </p>

      <form onSubmit={handleSubmit} style={s.form}>
        {/* New Password */}
        <div style={s.fieldWrap}>
          <label style={s.label}>New Password</label>
          <div style={s.passWrap}>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value.replace(/\s/g, ""))
              }
              onFocus={() => setNewPasswordFocus(true)}
              onBlur={() => setNewPasswordFocus(false)}
              required
              autoComplete="new-password"
              style={{
                ...s.input,
                paddingRight: 48,
                borderColor: newPasswordFocus ? T.border.focus : T.border.input,
                boxShadow: newPasswordFocus
                  ? "var(--shadow-input-focus)"
                  : "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((p) => !p)}
              style={s.eyeBtn}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={s.fieldWrap}>
          <label style={s.label}>Confirm New Password</label>
          <div style={s.passWrap}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value.replace(/\s/g, ""))
              }
              onFocus={() => setConfirmFocus(true)}
              onBlur={() => setConfirmFocus(false)}
              required
              autoComplete="new-password"
              style={{
                ...s.input,
                paddingRight: 48,
                borderColor: confirmFocus ? T.border.focus : T.border.input,
                boxShadow: confirmFocus ? "var(--shadow-input-focus)" : "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              style={s.eyeBtn}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        {/* Strength indicator */}
        {newPassword && (
          <div>
            <div style={s.strengthLabel}>Password strength:</div>
            <div style={s.strengthBars}>
              {([0, 1, 2] as const).map((i) => (
                <div
                  key={i}
                  style={{
                    ...s.strengthBar,
                    background:
                      strength > i ? STRENGTH_COLOR[strength] : T.border.input,
                  }}
                />
              ))}
            </div>
            <div style={{ ...s.strengthText, color: STRENGTH_COLOR[strength] }}>
              {STRENGTH_LABEL[strength]}
            </div>
          </div>
        )}

        {error && (
          <div style={s.errorBox}>
            <p style={s.errorText}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isResetLoading}
          style={{
            ...s.submitBtn,
            opacity: isResetLoading ? 0.75 : 1,
            cursor: isResetLoading ? "wait" : "pointer",
          }}
        >
          {isResetLoading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <Spinner /> Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div style={s.backRow}>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={s.backBtn}
        >
          ← Back to Sign In
        </button>
      </div>
    </AuthLayout>
  );
};

export default SetNewPasswordPage;

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="3"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const s: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: "var(--text-h3-size)" as unknown as number,
    fontWeight: 700,
    color: "var(--color-text-primary)",
    margin: "0 0 8px",
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
  },
  subheading: {
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-tertiary)",
    margin: "0 0 32px",
    lineHeight: 1.5,
  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    letterSpacing: "0.005em",
  },
  input: {
    width: "100%",
    height: 44,
    padding: "0 16px",
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-primary)",
    background: "var(--color-brand-subtle)",
    border: `1.5px solid ${T.border.input}`,
    borderRadius: T.radius.lg,
    outline: "none",
    transition:
      "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    boxSizing: "border-box",
    fontFamily: T.font.sans,
  } as React.CSSProperties,
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "var(--color-text-placeholder)",
    display: "flex",
    alignItems: "center",
  },
  strengthBox: {
    padding: "8px 12px",
    background: "var(--color-brand-subtle)",
    borderRadius: T.radius.md,
  },
  strengthLabel: {
    fontSize: "var(--text-label-xs-size)" as unknown as number,
    color: "var(--color-text-secondary)",
    marginBottom: 6,
  },
  strengthBars: { display: "flex", gap: 6, marginBottom: 6 },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    transition: "background var(--transition-fast)",
  },
  strengthText: {
    fontSize: "var(--text-label-xs-size)" as unknown as number,
    fontWeight: 600,
  },
  errorBox: {
    background: T.error.bg,
    border: `1px solid ${T.error.border}`,
    borderRadius: T.radius.md,
    padding: "10px 14px",
  },
  errorText: {
    margin: 0,
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    color: T.error.text,
  },
  submitBtn: {
    width: "100%",
    height: 46,
    background: "var(--color-brand-primary)",
    color: T.bg.card,
    border: "none",
    borderRadius: T.radius.lg,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    marginTop: 8,
  },
  successBox: {
    borderRadius: T.radius.lg,
    padding: "32px 24px",
    textAlign: "center" as const,
  },
  successIcon: {
    width: 56,
    height: 56,
    color: "var(--color-brand-primary)",
    border: "2px solid var(--color-brand-primary)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    margin: "0 auto 20px",
  },
  successHeading: {
    fontSize: "var(--text-h4-size)" as unknown as number,
    fontWeight: 600,
    color: "var(--color-text-primary)",
    margin: "0 0 12px",
  },
  successText: {
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-secondary)",
    margin: 0,
    lineHeight: 1.5,
  },
  backRow: { marginTop: 32, textAlign: "center" as const },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
