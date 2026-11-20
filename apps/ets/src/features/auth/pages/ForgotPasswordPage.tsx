// src/features/auth/pages/ForgotPasswordPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { T } from "../../../styles/tokens";
import AuthLayout from "../components/AuthLayoutWrapper";

// ── Webmail redirect helper ───────────────────────────────────────────────────
const WEBMAIL_MAP: Record<string, string> = {
  "gmail.com": "https://mail.google.com",
  "googlemail.com": "https://mail.google.com",
  "outlook.com": "https://outlook.live.com",
  "hotmail.com": "https://outlook.live.com",
  "live.com": "https://outlook.live.com",
  "yahoo.com": "https://mail.yahoo.com",
  "yahoo.in": "https://mail.yahoo.com",
};

const getWebmailUrl = (email: string): string | null => {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? (WEBMAIL_MAP[domain] ?? null) : null;
};

const RESEND_COOLDOWN = 120;

// ── Component ─────────────────────────────────────────────────────────────────

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleForgotPassword, isForgotLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const webmailUrl = success ? getWebmailUrl(email) : null;

  useEffect(() => {
    if (!success || timeLeft <= 0) {
      if (timeLeft <= 0) setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, success]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const sendResetLink = async () => {
    setError(null);
    try {
      await handleForgotPassword({ email: email.trim() });
      setSuccess(true);
      setTimeLeft(RESEND_COOLDOWN);
      setCanResend(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     const trimmed = email.trim();
  //     if (!email) return setError("Email address is required");
  //     if (!/\S+@\S+\.\S+/.test(email))
  //       return setError("Please enter a valid email address");
  //     await sendResetLink();
  //   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return setError("Email address is required");
    if (!/\S+@\S+\.\S+/.test(trimmed))
      return setError("Please enter a valid email address");
    setEmail(trimmed); // keep state clean too
    await sendResetLink();
  };

  return (
    <AuthLayout showBanner={false}>
      <h1 style={s.heading}>Reset your password</h1>
      {/* <p style={s.subheading}>
                Enter your email and we'll send you a link to reset your password.
            </p> */}

      {!success ? (
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault(); // block space key entirely
              }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              required
              autoComplete="email"
              style={{
                ...s.input,
                borderColor: emailFocus ? T.border.focus : T.border.input,
                boxShadow: emailFocus ? "var(--shadow-input-focus)" : "none",
              }}
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              <p style={s.errorText}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isForgotLoading}
            style={{
              ...s.submitBtn,
              opacity: isForgotLoading ? 0.75 : 1,
              cursor: isForgotLoading ? "wait" : "pointer",
            }}
          >
            {isForgotLoading ? (
              <SpinnerRow label="Sending..." />
            ) : (
              "Send Reset Link →"
            )}
          </button>
        </form>
      ) : (
        <div style={s.successBox}>
          <div style={s.successIcon}>✓</div>
          <p style={s.successText}>
            We've sent a reset link to <strong>{email}</strong>
          </p>

          {webmailUrl && (
            <a
              href={webmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.openMailBtn}
            >
              <MailIcon /> Open your inbox
            </a>
          )}

          <div style={s.expiryBox}>
            <span>⏱</span>
            <span style={s.expiryText}>
              Link expires in <strong>{formatTime(timeLeft)}</strong>
            </span>
          </div>

          <div style={s.resendRow}>
            <span style={s.resendLabel}>Didn't receive it?</span>
            <button
              type="button"
              onClick={sendResetLink}
              disabled={!canResend || isForgotLoading}
              style={{
                ...s.resendBtn,
                opacity: !canResend || isForgotLoading ? 0.45 : 1,
                cursor:
                  !canResend || isForgotLoading ? "not-allowed" : "pointer",
              }}
            >
              {isForgotLoading ? "Resending..." : "Resend Link"}
            </button>
          </div>
        </div>
      )}

      <div style={s.backRow}>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={s.backBtn}
        >
          ← Back to Login
        </button>
      </div>

      <div style={s.signupRow}>
        <p style={s.signupText}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={s.signUpBtn}
          >
            Sign Up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

const SpinnerRow = ({ label }: { label: string }) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
    }}
  >
    <Spinner /> {label}
  </span>
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

const MailIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
    textAlign: "center",
  },
  subheading: {
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-tertiary)",
    margin: "0 0 32px",
    lineHeight: 1.5,
  },
  form: { display: "flex", flexDirection: "column", gap: 24 },
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
  },
  successBox: {
    borderRadius: T.radius.lg,
    padding: "20px",
    textAlign: "center" as const,
  },
  successIcon: {
    width: 40,
    height: 40,
    color: "var(--color-brand-primary)",
    border: "2px solid var(--color-brand-primary)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    margin: "0 auto 16px",
  },
  successText: {
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-primary)",
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  openMailBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    margin: "0 auto 16px",
    padding: "10px 20px",
    background: "var(--color-brand-primary)",
    color: T.bg.card,
    borderRadius: T.radius.lg,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    fontWeight: 600,
    textDecoration: "none",
    letterSpacing: "0.01em",
  },
  expiryBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px",
    background: "var(--color-brand-subtle)",
    borderRadius: T.radius.md,
    marginBottom: 16,
  },
  expiryText: {
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    color: "var(--color-text-secondary)",
    margin: 0,
  },
  resendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resendLabel: {
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    color: "var(--color-text-tertiary)",
  },
  resendBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    fontWeight: 600,
    color: "var(--color-brand-primary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  backRow: { marginTop: 24, textAlign: "center" as const },
  backBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  signupRow: { marginTop: 32, textAlign: "center" as const },
  signupText: {
    margin: 0,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    color: "var(--color-text-tertiary)",
  },
  signUpBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "var(--text-body-sm-size)" as unknown as number,
    fontWeight: 600,
    color: "var(--color-brand-primary)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
