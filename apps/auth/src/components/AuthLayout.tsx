// src/features/auth/components/AuthLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared shell for ALL auth pages (Login, ForgotPassword, SetNewPassword).
// Owns: page frame, logo, right-side banner image.
// Pages only provide: their form content via children.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { T } from "@commutr/ui/tokens";
const LoginPageLogoUrl =
  "https://devz7jtpricpk.cloudfront.net/commutr_Logo/Commutr_Logo.svg";
const LoginPageBanner =
  "https://devz7jtpricpk.cloudfront.net/commutr_Logo/login.svg";
import "./AuthLayout.css";

const FALLBACK =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Pass false on pages where the banner should be hidden (default: true) */
  showBanner?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBanner = true,
}) => (
  <div style={s.page}>
    <div style={s.wrapper} className="auth-wrapper">
      <div style={s.body} className="auth-body">
        {/* LEFT: logo + page-specific form content */}
        <div style={s.formCol} className="auth-form-col">
          <div style={s.logoArea}>
            <img src={LoginPageLogoUrl} alt="COMMUTR" style={s.logoImg} />
          </div>
          {children}
        </div>

        {/* RIGHT: banner — hidden when showBanner=false */}
        {showBanner && (
          <div style={s.imageCol} className="auth-image-col">
            <div style={s.imageCard}>
              <img
                src={LoginPageBanner}
                alt="COMMUTR — Your Everyday Commute Partner"
                style={s.carImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK;
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default AuthLayout;

/* ── Styles ──────────────────────────────────────────────────────────────────
   These were copy-pasted identically across LoginPage, ForgotPasswordPage,
   and SetNewPasswordPage. Now they live here exactly once.
─────────────────────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: T.bg.card,
    display: "flex",
    flexDirection: "column",
    fontFamily: T.font.sans,
  },
  wrapper: {
    maxWidth: 1440,
    width: "100%",
    margin: "0 auto",
    padding: "36px 60px 40px",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 80,
  },
  formCol: {
    flex: "0 0 420px" as unknown as number,
    maxWidth: 420,
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 48,
  },
  logoImg: {
    height: 36,
    width: "auto",
    objectFit: "contain",
  },
  imageCol: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  imageCard: {
    position: "relative",
    width: "100%",
    maxWidth: 680,
    aspectRatio: "680 / 480",
    borderRadius: T.radius["2xl"],
    overflow: "hidden",
    boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
  },
  carImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};
