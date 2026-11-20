import { useEffect, useState } from "react";
import {
  CircleSlash,
  Eye,
  MapPin,
  PenLine,
  Shield,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAppSelector } from "../../../app/store";
import { selectCurrentUser } from "../slices/authSlice";

const CONSENT_VERSION = "2026-09";
const CONSENT_STORAGE_KEY = `commutr_dpdpa_consent:${CONSENT_VERSION}`;

export const hasDpdpaConsent = () => {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const saveDpdpaConsent = () => {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "1");
  } catch {
    // Keep the gate active when browser storage is unavailable.
  }
};

export const DpdpaConsent: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    try {
      // Remove keys created by the previous per-user implementation.
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);
        if (
          key?.startsWith("commutr_dpdpa_consent:") &&
          key !== CONSENT_STORAGE_KEY
        ) {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore storage cleanup errors.
    }
  }, []);

  if (!user) return null;

  const handleAccept = () => {
    if (!hasAccepted || !isAdult) return;
    saveDpdpaConsent();
    window.location.reload();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        background: "#f7f8f8",
        color: "#18221f",
      }}
    >
      <section
        aria-labelledby="dpdpa-consent-title"
        style={{
          width: "min(100%, 720px)",
          margin: "0 auto",
          overflow: "hidden",
          border: "1px solid #e3e8e6",
          borderRadius: "14px",
          background: "#ffffff",
          boxShadow: "0 14px 36px rgba(20, 52, 45, 0.08)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "24px",
            background: "linear-gradient(135deg, #58ab91, #328c74)",
            color: "#ffffff",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.18)",
            }}
          >
            <Shield size={28} aria-hidden="true" />
          </span>
          <div>
            <p style={{ margin: 0, opacity: 0.86, fontSize: "14px" }}>
              ASND Technology Private Limited
            </p>
            <h1
              id="dpdpa-consent-title"
              style={{ margin: "3px 0 0", fontSize: "26px" }}
            >
              Data Privacy Consent
            </h1>
          </div>
        </header>

        <div style={{ padding: "24px" }}>
          <p
            style={{
              margin: "0 0 28px",
              padding: "20px",
              borderLeft: "4px solid #4da88d",
              borderRadius: "0 10px 10px 0",
              background: "#edf8f4",
              lineHeight: 1.6,
            }}
          >
            Under the{" "}
            <strong>Digital Personal Data Protection Act, 2023</strong>, we are
            required to obtain your informed consent before processing your
            personal data.
          </p>

          <h2 style={{ margin: "0 0 14px", fontSize: "21px" }}>
            Data we collect
          </h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              {
                icon: UserRound,
                title: "Identity & Contact",
                text: "Name, email address, phone number",
              },
              {
                icon: Smartphone,
                title: "Device & Usage",
                text: "Device identifiers, app usage patterns",
              },
              {
                icon: MapPin,
                title: "Location Data",
                text: "Approximate location for service delivery",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  border: "1px solid #e2e8e5",
                  borderRadius: "12px",
                }}
              >
                <Icon size={23} color="#4d9f88" aria-hidden="true" />
                <div>
                  <strong style={{ display: "block", fontSize: "17px" }}>
                    {title}
                  </strong>
                  <span style={{ color: "#68736f", fontSize: "14px" }}>
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ margin: "28px 0 14px", fontSize: "21px" }}>
            Purpose of processing
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              "Account management",
              "Service personalisation",
              "Customer support",
              "Legal compliance",
            ].map((purpose) => (
              <span
                key={purpose}
                style={{
                  padding: "10px 15px",
                  borderRadius: "999px",
                  background: "#e2f5ef",
                  color: "#467c6c",
                }}
              >
                {purpose}
              </span>
            ))}
          </div>

          <h2 style={{ margin: "28px 0 14px", fontSize: "21px" }}>
            Your rights as a Data Principal
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "14px",
              color: "#495954",
            }}
          >
            {[
              { icon: Eye, label: "Right to access" },
              { icon: PenLine, label: "Right to correction" },
              { icon: Trash2, label: "Right to erasure" },
              { icon: CircleSlash, label: "Right to withdraw" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Icon size={19} color="#4d9f88" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>

          <div
            style={{
              margin: "28px 0 22px",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8e5",
              color: "#68736f",
            }}
          >
            For grievances, contact our{" "}
            <strong style={{ color: "#4d9f88" }}>Grievance Officer</strong>:
            <br />
            contact@asndtechnology.com
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <label
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "12px",
                alignItems: "flex-start",
                lineHeight: 1.45,
              }}
            >
              <input
                type="checkbox"
                checked={hasAccepted}
                onChange={(event) => setHasAccepted(event.target.checked)}
                style={{
                  marginTop: "4px",
                  width: "20px",
                  height: "20px",
                  accentColor: "#4d9f88",
                }}
              />
              <span>
                I have read and understood how my data will be used. I give my{" "}
                <strong>
                  free, specific, informed, unconditional, and unambiguous
                  consent.
                </strong>
              </span>
            </label>
            <label
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "12px",
                alignItems: "flex-start",
                lineHeight: 1.45,
              }}
            >
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(event) => setIsAdult(event.target.checked)}
                style={{
                  marginTop: "4px",
                  width: "20px",
                  height: "20px",
                  accentColor: "#4d9f88",
                }}
              />
              <span>
                I confirm I am 18 years or older.{" "}
                <em style={{ color: "#68736f" }}>
                  (For minors, parental/guardian consent is required.)
                </em>
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!hasAccepted || !isAdult}
            onClick={handleAccept}
            style={{
              marginTop: "28px",
              width: "100%",
              padding: "16px 20px",
              border: 0,
              borderRadius: "14px",
              background: hasAccepted && isAdult ? "#4d9f88" : "#c0d5ce",
              color: "#ffffff",
              cursor: hasAccepted && isAdult ? "pointer" : "not-allowed",
              fontSize: "17px",
              fontWeight: 600,
            }}
          >
            Give Consent
          </button>
        </div>
      </section>
    </main>
  );
};
