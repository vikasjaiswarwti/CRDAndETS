// src/features/individualRoster/components/TatPopupModal.tsx

import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { TatPopup } from "../services/IndividualRosterApi";

interface TatPopupModalProps {
  open: boolean;
  popup: TatPopup | null;
  isLoading: boolean;
  onAction: (action: string) => void;
  onDismiss: () => void;
}

const TatPopupModal: React.FC<TatPopupModalProps> = ({
  open,
  popup,
  isLoading,
  onAction,
  onDismiss,
}) => {
  const { Modal } = useUILibrary();
  if (!popup) return null;

  const sortedButtons = [...(popup.buttons ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <Modal
      open={open}
      onCancel={onDismiss}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#fff1f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5L1.5 13.5h13L8 1.5z"
                stroke="#ef4444"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M8 6v4"
                stroke="#ef4444"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle
                cx="8"
                cy="11.5"
                r="0.6"
                fill="#ef4444"
                stroke="#ef4444"
                strokeWidth="0.8"
              />
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>
            {popup.title || "Cancellation Notice"}
          </div>
        </div>
      }
      width={400}
      destroyOnClose
      footer={null}
      centered
      styles={{
        mask: { background: "rgba(0,0,0,0.30)" },
        content: {
          borderRadius: 14,
          padding: 0,
          border: "1.5px solid #fecaca",
        },
        header: {
          padding: "12px 16px 10px",
          borderBottom: "1px solid #fecaca",
          background: "#fff1f2",
          borderRadius: "14px 14px 0 0",
        },
        body: { padding: "14px 16px 16px" },
      }}
    >
      {/* Message */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "#fff1f2",
          border: "1px solid #fecaca",
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#b91c1c",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {popup.message}
        </p>
      </div>

      {/* Dynamic buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sortedButtons.map((btn) => {
          const isConfirmAction =
            btn.action === "CONFIRM" ||
            btn.action === "YES" ||
            btn.action === "PROCEED";
          return (
            <button
              key={btn.id}
              type="button"
              disabled={isLoading}
              onClick={() => onAction(btn.action)}
              style={{
                width: "100%",
                padding: "9px 0",
                borderRadius: 50,
                border: "1.5px solid #ef4444",
                background: "#fff",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {isLoading && isConfirmAction ? (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="rgba(239,68,68,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 2a6 6 0 016 6"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Processing…
                </>
              ) : (
                btn.text
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default TatPopupModal;
