import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  UserAddOutlined,
  CarOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { QuickActionItem } from "../types/admin.types";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";
const IconStyle: React.CSSProperties = {
  fontSize: 22,
};

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: "View Schedule",
    icon: <CalendarOutlined style={{ ...IconStyle, color: "#0F6E56" }} />,
    bg: "#E1F5EE",
    color: "#0F6E56",
    path: "/schedule/fill-roaster",
    roles: ["admin", "transport manager"],
  },
  {
    label: "Employee Approval",
    icon: <UserAddOutlined style={{ ...IconStyle, color: "#185FA5" }} />,
    bg: "#E6F1FB",
    color: "#185FA5",
    path: "/user/employee",
    roles: ["admin"],
  },
  {
    label: "Driver Approval",
    icon: <CarOutlined style={{ ...IconStyle, color: "#534AB7" }} />,
    bg: "#EEEDFE",
    color: "#534AB7",
    path: "/compliance/approval-dashboard",
    roles: ["admin"],
  },
  {
    label: "Vehicle Approval",
    icon: <TruckOutlined style={{ ...IconStyle, color: "#854F0B" }} />,
    bg: "#FAEEDA",
    color: "#854F0B",
    path: "/compliance/approval-dashboard",
    roles: ["admin"],
  },
  {
    label: "Track Vehicle",
    icon: <EnvironmentOutlined style={{ ...IconStyle, color: "#1A73E8" }} />,
    bg: "#E8F0FE",
    color: "#1A73E8",
    path: "/compliance/approval-dashboard",
    roles: ["transport manager", "vendor"],
  },
  {
    label: "Check Compliance",
    icon: <SafetyOutlined style={{ ...IconStyle, color: "#7C3AED" }} />,
    bg: "#F3E8FF",
    color: "#7C3AED",
    path: "/compliance/vendor-mangement",
    roles: ["transport manager", "vendor"],
  },
];

const QuickActionsSection: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const role = useSelector((s: any) => s?.navigation?.activeRole);

  const filteredActions = QUICK_ACTIONS.filter((a) => a.roles.includes(role));

  const isMobile = useIsMobile();

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCollapsed((p) => !p);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          paddingBottom: collapsed ? 0 : 12,
        }}
      >
        {!isMobile && (
          <>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Quick Actions
            </h3>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: "transform 0.25s ease",
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </div>

      {/* ── Collapsible grid ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: collapsed ? "0fr" : "1fr",
          transition: "grid-template-rows 0.28s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {filteredActions.length === 0 ? (
              <p
                style={{
                  gridColumn: "1/-1",
                  fontSize: 13,
                  color: "#9CA3AF",
                  textAlign: "center",
                  margin: "8px 0",
                }}
              >
                No quick actions for your role.
              </p>
            ) : (
              filteredActions.map((item) => (
                <QAButton item={item} />
                // <div
                //   key={item.label}
                //   style={{
                //     border: "1px solid #e5e7eb",
                //     borderRadius: 10,
                //     padding: 12,
                //     display: "flex",
                //     flexDirection: "column",
                //     gap: 8,
                //   }}
                // >
                //   {/* Icon */}
                //   <div
                //     style={{
                //       width: 36,
                //       height: 36,
                //       borderRadius: 8,
                //       background: item.bg,
                //       color: item.color,
                //       display: "flex",
                //       alignItems: "center",
                //       justifyContent: "center",
                //       fontSize: 18,
                //     }}
                //   >
                //     {item.icon}
                //   </div>

                //   {/* Label */}
                //   <p
                //     style={{
                //       margin: 0,
                //       fontSize: 13,
                //       fontWeight: 500,
                //       color: "#111827",
                //       lineHeight: 1.3,
                //     }}
                //   >
                //     {item.label}
                //   </p>

                //   {/* Button */}
                //   <button
                //     onClick={() => navigate(item.path)}
                //     style={{
                //       width: "fit-content",
                //       fontSize: 12,
                //       padding: "4px 10px",
                //       borderRadius: 6,
                //       border: "1px solid #e5e7eb",
                //       background: "transparent",
                //       cursor: "pointer",
                //       color: "#6B7280",
                //     }}
                //     onMouseEnter={(e) => {
                //       (e.currentTarget as HTMLButtonElement).style.background =
                //         "#f3f4f6";
                //     }}
                //     onMouseLeave={(e) => {
                //       (e.currentTarget as HTMLButtonElement).style.background =
                //         "transparent";
                //     }}
                //   >
                //     View →
                //   </button>
                // </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const QAButton = ({ item }: { item: QuickActionItem }) => {
  const navigate = useNavigate();
  return (
    <div
      key={item.label}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: item.bg,
          color: item.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {item.icon}
      </div>

      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 500,
          color: "#111827",
          lineHeight: 1.3,
        }}
      >
        {item.label}
      </p>

      {/* Button */}
      <button
        onClick={() => navigate(item.path)}
        style={{
          width: "fit-content",
          fontSize: 12,
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "transparent",
          cursor: "pointer",
          color: "#6B7280",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
        }}
      >
        View →
      </button>
    </div>
  );
};

export default QuickActionsSection;
