import React from "react";
import { useGetAddressStatusQuery } from "../services/employeeProfileApi";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const CONFIG = {
  Pending: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    color: "#92400E",
    icon: <ClockCircleOutlined />,
    label: "Pending Approval",
  },
  Approved: {
    bg: "#F0FDF4",
    border: "#86EFAC",
    color: "#14532D",
    icon: <CheckCircleOutlined />,
    label: "Approved",
  },
  Rejected: {
    bg: "#FFF1F2",
    border: "#FECDD3",
    color: "#9F1239",
    icon: <CloseCircleOutlined />,
    label: "Rejected",
  },
};

const AddressChangeBanner: React.FC<{ empId: number }> = ({ empId }) => {
  const { data, isLoading } = useGetAddressStatusQuery(empId);

  if (isLoading || !data) return null;

  if (data.status === "NoRecord" || !data.address) return null;

  // ── Terminal states ───────────────────────────────────────────────────────
  if (data.actionType === "A" || data.actionType === "R") {
    const approved = data.actionType === "A";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "7px 6px",
          textAlign: "center",
          background: approved ? "#F0FDF4" : "#FFF1F2",
          border: `1px solid ${approved ? "#86EFAC" : "#FECDD3"}`,
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: approved ? "#14532D" : "#9F1239",
          }}
        >
          {" "}
          <span style={{ fontSize: 10 }}>{approved ? "✅" : "❌"}</span>
          {approved
            ? "Your address change request has been approved."
            : "Your address change request has been rejected."}
        </div>
        {!approved && data.rejectionRemark && (
          <div style={{ fontSize: 10, color: "#9F1239" }}>
            Reason: {data.rejectionRemark}
          </div>
        )}
      </div>
    );
  }

  // ── Pending banner ────────────────────────────────────────────────────────
  const cfg = CONFIG[data.status] ?? CONFIG.Pending;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      {/* Left */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            color: cfg.color,
            fontSize: 14,
            marginTop: 1,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "#374151",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {data.address}
          </div>
          <div style={{ fontSize: 10, color: "#6B7280", marginTop: 3 }}>
            Raised on ·{" "}
            {new Date(data.requestedOn).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Right — status badge */}
      <span
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          height: 24,
          padding: "0 10px",
          borderRadius: 99,
          background: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          color: cfg.color,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
};

export default AddressChangeBanner;
