// src/features/route-maker/components/GlobalOperationOverlay.tsx


import { T } from "../constants/designTokens";

interface Props {
  visible: boolean;
  message: string;
}

export default function GlobalOperationOverlay({ visible, message }: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: T.card,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowLg,
          width: 360,
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Spinner */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          style={{ animation: "rmSpin 0.8s linear infinite", flexShrink: 0 }}
        >
          <circle cx="18" cy="18" r="15" stroke={T.border} strokeWidth="3" />
          <path
            d="M18 3 A15 15 0 0 1 33 18"
            stroke={T.accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Message */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: T.text,
            marginTop: 16,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 11,
            color: T.muted,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Please do not close or refresh this page.
        </div>
      </div>
    </div>
  );
}
