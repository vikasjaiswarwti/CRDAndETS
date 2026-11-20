import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../features/auth/hooks/useAuth";
import PlaySoundSwitch from "../../RoutingHeader/PlaySoundSwitch";

const DRAWER_WIDTH = 260;

export const MobileActionsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const initials = (() => {
    const name = user?.name?.trim();
    if (!name) return "AM";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  })();

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
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
          right: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: "var(--color-bg-card)",
          borderLeft: "1px solid var(--color-border)",
          zIndex: 1100,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--transition-normal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-brand-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                marginRight: "4px",
              }}
            >
              {initials}
            </div>
            <span
              style={{ fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              {user?.name ?? "Account"}
            </span>
          </div>
          {/* <button
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="var(--color-text-danger)"
                strokeWidth="2"
              />
              <path
                d="M9 9L15 15M15 9L9 15"
                stroke="var(--color-text-danger)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}
        </div>

        <div style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
            }}
          >
            <PlaySoundSwitch />
          </div>
          <ActionItem label="Profile" onClick={() => go("/account/profile")} />
          <ActionItem
            label="Change Password"
            onClick={() => go("/account/change-password")}
          />
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", padding: 8 }}>
          <ActionItem
            label="Logout"
            danger
            onClick={async () => {
              onClose();
              await handleLogout();
            }}
          />
        </div>
      </div>
    </>
  );
};

const ActionItem: React.FC<{
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ label, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      textAlign: "left",
      padding: "10px 16px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      color: danger ? "var(--color-error)" : "var(--color-text-primary)",
    }}
  >
    {label}
  </button>
);
