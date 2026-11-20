import React, { useEffect, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";

interface Props {
  open: boolean;
  isSubmitting: boolean;
  message?: string;
  onCancel: () => void;
  onConfirm: (message: string) => void;
}

export const ResolveCloseModal: React.FC<Props> = ({
  open,
  isSubmitting,
  message = "",
  onCancel,
  onConfirm,
}) => {
  const { Modal, Input } = useUILibrary();
  const { spacing } = useTokens();
  const [customMessage, setCustomMessage] = useState(message);
  useEffect(() => {
    if (open) setCustomMessage(message);
  }, [open, message]);
  const finalMessage = customMessage.trim();
  // mandatory comment: Close Ticket stays disabled until there's real content
  const canSubmit = finalMessage.length > 0 && !isSubmitting;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Resolve / Close Ticket"
      width={420}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}
      >
        <p style={{ fontSize: 13, color: "#374151" }}>
          Are you sure you want to close this ticket?
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Type your message here..."
          value={customMessage}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCustomMessage(e.target.value)
          }
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(finalMessage)}
            disabled={!canSubmit}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              background: canSubmit ? "#065f46" : "#9ca3af",
              color: "#fff",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Closing…" : "Close Ticket"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
