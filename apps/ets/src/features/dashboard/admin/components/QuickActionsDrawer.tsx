import React, { useState } from "react";
import QuickActionsSection from "./QuickAction";
import EmployeeTripSearch from "./EmployeeTripSearch";

type Tab = "actions" | "search";

export const QuickActionsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [tab, setTab] = useState<Tab>("actions");

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
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 10px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#f3f4f6",
              borderRadius: 8,
              padding: 3,
            }}
          >
            <TabButton
              label="Quick Actions"
              active={tab === "actions"}
              onClick={() => setTab("actions")}
            />
            <TabButton
              label="Trip Search"
              active={tab === "search"}
              onClick={() => setTab("search")}
            />
          </div>
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

        <div style={{ padding: 16, overflowY: "auto" }}>
          {tab === "actions" ? (
            <QuickActionsSection />
          ) : (
            <EmployeeTripSearch onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
};

const TabButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      background: active ? "#fff" : "transparent",
      color: active ? "#111827" : "#6B7280",
      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
      transition: "all 0.15s ease",
    }}
  >
    {label}
  </button>
);
