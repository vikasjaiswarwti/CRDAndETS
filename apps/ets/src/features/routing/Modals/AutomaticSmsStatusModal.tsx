// ─────────────────────────────────────────────────────────────────────────────
// src/features/routeManagement/modals/components/AutomaticSmsStatusModal.tsx
// Image ref: "Automatic SMS Status" – sent stats + comments + Reviewed button
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { AutomaticSmsStatusPayload } from "../types/RouteTypes";

interface AutomaticSmsStatusProps {
  open: boolean;
  onClose: () => void;
  payload: AutomaticSmsStatusPayload;
  onReviewed: (comments: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const AutomaticSmsStatusModal: React.FC<AutomaticSmsStatusProps> = ({
  open,
  onClose,
  payload,
  onReviewed,
  isSubmitting,
}) => {
  const { Modal, Button } = useUILibrary();
  const [comments, setComments] = useState("");

  const STAT_ROW = (label: string, value: string | number) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid #E9F5EE",
      }}
    >
      <span style={{ fontSize: 13, color: "#52796F" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#1B4332" }}>
        {value}
      </span>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={480}
      footer={null}
      destroyOnClose
      title={
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1B4332" }}>
          Automatic SMS Status
        </div>
      }
      styles={{
        mask: { background: "rgba(0,60,30,0.35)" },
        header: { borderBottom: "none" },
      }}
      style={{ borderRadius: 16, top: 40 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Sent header */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1B4332",
            borderBottom: "2px solid #B7E4C7",
            paddingBottom: 6,
          }}
        >
          Automatic SMS Sent
        </div>

        {/* Stats */}
        <div>
          {STAT_ROW("SMS has been sent @", payload.sentAt)}
          {STAT_ROW("Employees Eligible for SMS", 13)}
          {STAT_ROW("Successfully Sent", 13)}
          {STAT_ROW("Failed", 0)}
          {STAT_ROW("SMS waiting for delivery", 0)}
        </div>

        {/* Comments textarea */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#52796F",
              display: "block",
              marginBottom: 4,
            }}
          >
            Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{
              width: "100%",
              minHeight: 72,
              borderRadius: 8,
              border: "1px solid #B7E4C7",
              background: "#F0FAF4",
              padding: "8px 10px",
              fontSize: 13,
              color: "#1B4332",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={() => onReviewed(comments)}
            style={{
              borderRadius: 50,
              background: "#1B4332",
              borderColor: "#1B4332",
              fontWeight: 600,
              paddingInline: 32,
            }}
          >
            Reviewed
          </Button>
        </div>
      </div>
    </Modal>
  );
};
