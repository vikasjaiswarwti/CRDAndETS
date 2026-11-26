import React from "react";
import type { Role } from "../types/SystemRolePermission.types";
import {
  SafetyOutlined,
  UserOutlined,
  ClusterOutlined,
  ShopOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

interface RoleSidebarProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onAddRole: () => void;
  onEditRole: (role: Role) => void;
  isLoading: boolean;
}

// Icon map for roles — keeps icon logic out of page
const ROLE_ICON_MAP: Record<string, React.ReactNode> = {
  admin: <SafetyOutlined />,
  employee: <UserOutlined />,
  vendor: <ShopOutlined />,
  transportManager: <ClusterOutlined />,
  tester: <UserOutlined />,
  driver: <IdcardOutlined />,
  default: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  ),
};

function getRoleIcon(roleName: string) {
  const lower = roleName.toLowerCase();
  if (lower.includes("admin")) return ROLE_ICON_MAP.admin;
  if (lower.includes("employee")) return ROLE_ICON_MAP.employee;
  if (lower.includes("vendor")) return ROLE_ICON_MAP.vendor;
  if (lower.includes("transport manager"))
    return ROLE_ICON_MAP.transportManager;
  if (lower.includes("tester")) return ROLE_ICON_MAP.tester;
  if (lower.includes("driver")) return ROLE_ICON_MAP.driver;
  return ROLE_ICON_MAP.default;
}

const RoleSidebar: React.FC<RoleSidebarProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  onAddRole,
  onEditRole,
  isLoading,
}) => {
  return (
    <div
      style={{
        width: 168,
        flexShrink: 0,
        // background: "#fff",
        // background: "#E3E9ED",
        background: "#F0F4F7",
        borderRadius: 12,
        border: "1px solid #E8F5EE",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: "1px solid #F0FAF4",
          background: "#E3E9ED",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: "#52796F",
            textTransform: "uppercase",
            background: "#E3E9ED",
          }}
        >
          Roles
        </span>
        <button
          onClick={onAddRole}
          title="Add Role"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "1.5px solid #1B4332",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#1B4332",
            padding: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1v8M1 5h8"
              stroke="#1B4332"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Role list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 0",
          background: "#FCFCFC",
        }}
      >
        {isLoading ? (
          <div style={{ padding: "12px 16px", color: "#52796F", fontSize: 13 }}>
            Loading...
          </div>
        ) : (
          roles.map((role) => {
            const isSelected = role.id === selectedRoleId;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 16px",
                  margin: `0 8px`,
                  cursor: "pointer",
                  background: isSelected ? "#fff" : "transparent",
                  color: isSelected ? "#1B4332" : "#52796F",
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: 14,
                  //   borderRight: "3px solid #1B4332",
                  borderRadius: "12px",
                  transition: "all 0.6s",
                }}
                onDoubleClick={() => onEditRole(role)}
                title="Double-click to edit"
              >
                <span
                  style={{
                    opacity: 0.7,
                    flexShrink: 0,
                    color: isSelected ? "#3E9B73" : "#596064",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {getRoleIcon(role.roleName)}
                </span>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: isSelected ? "#3E9B73" : "#596064",
                  }}
                >
                  {role.roleName}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Add Role footer button */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #F0FAF4" }}>
        <button
          onClick={onAddRole}
          style={{
            width: "100%",
            background: "#1B4332",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "8px 0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          ADD ROLE
        </button>
      </div>
    </div>
  );
};

export default RoleSidebar;
