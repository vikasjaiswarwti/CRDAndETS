import React from "react";
import QuickAction from "./QuickAction";

interface Props {
  open: boolean;
  onClose: () => void;
  isProfileLoading: boolean;
  setAddressOpen: () => void;
  setMobileOpen: () => void;
  setPasswordOpen: () => void;
  setComplaintOpen: () => void;
}

export const EmployeeQuickActionsDrawer: React.FC<Props> = ({
  open,
  onClose,
  isProfileLoading,
  setAddressOpen,
  setMobileOpen,
  setPasswordOpen,
  setComplaintOpen,
}) => (
  <>
    {open && (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1099,
        }}
      />
    )}
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: "80vh",
        background: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
        zIndex: 1100,
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.28s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px 0 6px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "#e5e7eb",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 16px",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#6B7280",
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ padding: "0 16px 16px", overflowY: "auto" }}>
        <QuickAction
          isProfileLoading={isProfileLoading}
          setAddressOpen={() => {
            onClose();
            setAddressOpen();
          }}
          setMobileOpen={() => {
            onClose();
            setMobileOpen();
          }}
          setPasswordOpen={() => {
            onClose();
            setPasswordOpen();
          }}
          setComplaintOpen={() => {
            onClose();
            setComplaintOpen();
          }}
        />
      </div>
    </div>
  </>
);
