// ============================================================
// // ConfirmationModal.tsx — Enhanced for clarity
// ============================================================

import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import type { ImpactMessage } from "./Configimpactmessages";

interface ConfirmationModalProps {
  open: boolean;
  fieldLabel: string;
  backendColumn?: string; // ← NEW: Show actual ColumnName sent to API
  oldDisplay: string;
  newDisplay: string;
  impact: ImpactMessage;
  onCancel: () => void;
  onProceed: () => void;
}

const SEVERITY_STYLES = {
  info: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: <Info size={16} style={{ color: "#2563EB", flexShrink: 0 }} />,
    badgeBg: "#DBEAFE",
    badgeColor: "#1D4ED8",
    badgeLabel: "Info",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: (
      <AlertTriangle size={16} style={{ color: "#D97706", flexShrink: 0 }} />
    ),
    badgeBg: "#FEF3C7",
    badgeColor: "#B45309",
    badgeLabel: "Caution",
  },
  critical: {
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: (
      <AlertTriangle size={16} style={{ color: "#DC2626", flexShrink: 0 }} />
    ),
    badgeBg: "#FEE2E2",
    badgeColor: "#991B1B",
    badgeLabel: "Critical",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  fieldLabel,
  // backendColumn,
  oldDisplay,
  newDisplay,
  impact,
  onCancel,
  onProceed,
}) => {
  if (!open) return null;

  const style = SEVERITY_STYLES[impact.severity];
  const showValueGrid = Boolean(oldDisplay || newDisplay);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <style>{`
        @keyframes modal-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 460,
          maxWidth: "calc(100vw - 32px)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          animation: "modal-slide-up 0.18s ease",
          overflow: "hidden",
        }}
        role="dialog"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 16px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Update Configuration
          </div>
          <button
            onClick={onCancel}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "#F9FAFB",
              borderRadius: 6,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6B7280",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            YOU ARE UPDATING
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 12,
            }}
          >
            {fieldLabel}
          </div>

          {/* Show backend column name for clarity */}
          {/* {backendColumn && (
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
              Backend Field:{" "}
              <code
                style={{
                  background: "#F3F4F6",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {backendColumn}
              </code>
            </div>
          )} */}

          {/* Enhanced Value Comparison */}
          {showValueGrid && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 0,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  PREVIOUS
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#6B7280",
                    fontWeight: 600,
                    textDecoration: "line-through",
                    textDecorationColor: "#D1D5DB",
                  }}
                >
                  {oldDisplay || "—"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#9CA3AF",
                  fontSize: 22,
                  padding: "0 12px",
                }}
              >
                →
              </div>

              <div
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#60A5FA",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  NEW
                </div>
                <div
                  style={{ fontSize: 15, color: "#1D4ED8", fontWeight: 700 }}
                >
                  {newDisplay || "—"}
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: 8,
              padding: "14px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {style.icon}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: style.badgeColor,
                  background: style.badgeBg,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {style.badgeLabel}
              </span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#374151" }}>
              {impact.description}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0 20px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              height: 36,
              padding: "0 18px",
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              background: "#fff",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            style={{
              height: 36,
              padding: "0 20px",
              border: "none",
              borderRadius: 8,
              background: "#2563EB",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
