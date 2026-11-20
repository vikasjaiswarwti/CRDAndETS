import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useAssignFlapNumbersMutation } from "../services/RouteManagementApi";
import type { AssignPhysicalIdPayload } from "../types/RouteTypes";
import { Tag } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  payload: AssignPhysicalIdPayload;
}

const G = "#0F766E";

export const AssignPhysicalIdModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
}) => {
  const { Modal, Button } = useUILibrary();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [assign, { isLoading }] = useAssignFlapNumbersMutation();

  const handleAssign = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await assign(payload).unwrap();
      if (res.isSuccess) {
        setSuccess("Physical IDs assigned successfully.");
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 1500);
      } else {
        setError(res.message || "Assignment failed.");
      }
    } catch (e: any) {
      setError(e?.data?.message || "Failed to assign physical IDs.");
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    onClose();
  };

  const chip = (icon: string, text: string) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "#F0FDF4",
        border: "1px solid #86EFAC",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: "#166534",
      }}
    >
      {icon} {text}
    </span>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            <Tag className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Assign Physical IDs
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
              Assign flap / physical numbers to trips
            </div>
          </div>
        </div>
      }
      destroyOnClose
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "4px 0 8px",
        }}
      >
        {/* Shift chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {chip("⚙", `Shift #${payload.shiftId}`)}
          {chip("⏱", payload.tripType === 1 ? "Login" : "Logout")}
          {chip("📅", payload.routeDate)}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.6,
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "12px 16px",
          }}
        >
          This will automatically assign sequential physical (flap) numbers to
          all trips in this shift. This action can be re-run at any time to
          reassign numbers.
        </div>

        {/* Warning */}
        <div
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: 8,
            padding: "12px 14px",
            display: "flex",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#92400E" }}>
            Existing physical numbers on this shift will be overwritten.
          </span>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 6,
              padding: "10px 14px",
              color: "#B91C1C",
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: 6,
              padding: "10px 14px",
              color: G,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✓ {success}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid #F1F5F9",
            marginTop: 4,
          }}
        >
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={handleAssign}
            style={{ background: G, borderColor: G }}
          >
            Assign Physical IDs
          </Button>
        </div>
      </div>
    </Modal>
  );
};
