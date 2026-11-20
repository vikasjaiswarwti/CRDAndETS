// src/features/auth/pages/LoginPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, setApps, setToken } from "@commutr/shared";
import { T } from "@commutr/ui/tokens";
import AuthLayout from "../components/AuthLayout";
import { login } from "../api";
import { routeUser } from "../routeUser";
import { TriangleAlert } from "lucide-react";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    const result = await routeUser();
    if (result === "choose") navigate("/choose-app", { replace: true });
    if (result === "no-access")
      setError("Your account has no application access.");
  };

  // Already signed in -> skip the form.
  useEffect(() => {
    if (getToken()) go().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userNameFocus, setUserNameFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  // Validation error states
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ userName: false, password: false });

  // Validation functions
  const validateUserName = (value: string) => {
    if (!value.trim()) {
      return "Please enter your username";
    }
    // Optional: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Please enter your password";
    }
    return "";
  };

  // const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setUserName(value);
  //   if (touched.userName) {
  //     setUserNameError(validateUserName(value));
  //   }
  // };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ""); // no leading space
    setUserName(value);
    if (touched.userName) {
      setUserNameError(validateUserName(value));
    }
  };

  // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setPassword(value);
  //   if (touched.password) {
  //     setPasswordError(validatePassword(value));
  //   }
  // };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ""); // remove all spaces
    setPassword(value);
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleBlur = (field: "userName" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "userName") {
      setUserNameError(validateUserName(userName));
    } else {
      setPasswordError(validatePassword(password));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark both fields as touched
    setTouched({ userName: true, password: true });

    // Validate both fields
    const userNameValidationError = validateUserName(userName);
    const passwordValidationError = validatePassword(password);

    setUserNameError(userNameValidationError);
    setPasswordError(passwordValidationError);

    // If there are validation errors, don't submit
    if (userNameValidationError || passwordValidationError) {
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await login(userName.trim(), password.trim());
      setToken(res.accessToken);
      setApps(res.apps);
      await go();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <style>{`
    @media (max-width: 480px) {
      .auth-heading { font-size: 16px !important; margin-bottom: 6px !important; }
      .auth-subheading { font-size: 12px !important; margin-bottom: 12px !important; }
       }
  `}</style>

      <h1 style={s.heading} className="auth-heading">
        Log in to your account.
      </h1>
      <p style={s.subheading} className="auth-subheading">
        Enter your username and password to log in.
      </p>

      <form onSubmit={handleSubmit} style={s.form}>
        {/* Username */}
        <div style={s.fieldWrap}>
          <label style={s.label}>
            Username <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="email@example.com"
            value={userName}
            onChange={handleUserNameChange}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault(); // block space key entirely
            }}
            onFocus={() => setUserNameFocus(true)}
            onBlur={() => {
              setUserNameFocus(false);
              handleBlur("userName");
            }}
            autoComplete="username"
            style={{
              ...s.input,
              borderColor:
                userNameError && touched.userName
                  ? T.error.border
                  : userNameFocus
                    ? T.border.focus
                    : T.border.input,
              boxShadow: userNameFocus ? "var(--shadow-input-focus)" : "none",
            }}
          />
          {userNameError && touched.userName && (
            <div style={s.errorMessage}>
              {/* <span style={s.errorIcon}>⚠️</span> */}
              <TriangleAlert
                size={14}
                color="var(--color-text-danger)"
                style={s.errorIcon}
              />
              <span style={s.errorMessageText}>{userNameError}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div style={s.fieldWrap}>
          <label style={s.label}>
            Password <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <div style={s.passWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPassFocus(true)}
              onBlur={() => {
                setPassFocus(false);
                handleBlur("password");
              }}
              autoComplete="current-password"
              style={{
                ...s.input,
                paddingRight: 48,
                borderColor:
                  passwordError && touched.password
                    ? T.error.border
                    : passFocus
                      ? T.border.focus
                      : T.border.input,
                boxShadow: passFocus ? "var(--shadow-input-focus)" : "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={s.eyeBtn}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
          {passwordError && touched.password && (
            <div style={s.errorMessage}>
              <TriangleAlert
                size={14}
                color="var(--color-text-danger)"
                style={s.errorIcon}
              />
              <span style={s.errorMessageText}>{passwordError}</span>
            </div>
          )}

          <div style={s.forgotRow}>
            {/* <label style={s.rememberWrap}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span style={{ marginLeft: 6 }}>Remember me</span>
            </label> */}

            <button
              type="button"
              onClick={() => window.location.assign("/ets/forgot-password")}
              style={s.forgotBtn}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && !(userNameError || passwordError) && (
          <div style={s.errorBox}>
            <p style={s.errorText}>
              {typeof error === "string"
                ? error
                : "Invalid credentials. Please try again."}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...s.submitBtn,
            opacity: isLoading ? 0.75 : 1,
            cursor: isLoading ? "wait" : "pointer",
          }}
        >
          {isLoading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <Spinner /> Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div style={s.footer}>
        <p style={s.footerText}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => window.location.assign("/ets/signup")}
            style={s.signUpBtn}
          >
            Sign Up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

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
  rememberWrap: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 12,
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
  },
  forgotBtn: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    fontWeight: 600,
    color: "var(--color-brand-primary)",
    cursor: "pointer",
    fontFamily: "inherit",
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
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
    fontSize: "var(--text-label-sm-size)" as unknown as number,
    color: T.error.text,
  },
  errorIcon: { fontSize: "12px" },
  errorMessageText: {
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
    transition: "background var(--transition-fast)",
    letterSpacing: "0.01em",
  },
  footer: { paddingTop: 32, display: "flex", justifyContent: "center" },
  footerText: {
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
