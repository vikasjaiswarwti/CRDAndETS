import React, { useState } from "react";
import QAButton from "./QAButton";
import {
  IconAddress,
  IconPlus,
  IconPhone,
  // IconDoc,
  IconLock,
  IconAlert,
  // IconChat,
} from "../../../../assets/dashboard/index";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";

interface QuickActionProps {
  isProfileLoading: boolean;
  setAddressOpen: () => void;
  setMobileOpen: () => void;
  setPasswordOpen: () => void;
  setComplaintOpen: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  isProfileLoading,
  setAddressOpen,
  setMobileOpen,
  setPasswordOpen,
  setComplaintOpen,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div
      style={{
        background: "#ffffff",
        border: "0.5px solid #e5e7eb",
        borderRadius: 12,
        padding: "18px 20px",
      }}
    >
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: isOpen ? 10 : 0,
          userSelect: "none",
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            // margin: "0 0 16px",
            color: "#111827",
          }}
        >
          Quick Actions
        </h2>
        <DownOutlined
          style={{
            fontSize: 12,
            color: "#6B7280",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </div>
      {isOpen && (
        <>
          {/* Card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <QAButton
              variant="card"
              theme="blue"
              badge="+ New Schedule"
              icon={<IconPlus stroke="#185FA5" />}
              label="Create Schedule"
              desc="Create new bus schedules"
              onClick={() => navigate("/schedule/fill-employee-roaster")}
            />
            {/* <QAButton
              variant="card"
              theme="green"
              badge="View Feedback"
              icon={<IconChat stroke="#0F6E56" />}
              label="Submit Feedback"
              desc="View and respond to feedback"
              onClick={() => {}}
            /> */}
            <QAButton
              variant="card"
              theme="purple"
              badge="Raise Request"
              icon={<IconAddress stroke="#534AB7" />}
              label="Address Update"
              desc="Review and manage address updates"
              onClick={setAddressOpen}
              disabled={isProfileLoading}
            />
            <QAButton
              variant="card"
              theme="amber"
              badge="Raise Complaint"
              icon={<IconAlert stroke="#854F0B" />}
              label="Complaint"
              desc="View and resolve complaints"
              onClick={setComplaintOpen}
            />
          </div>

          {/* Row list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QAButton
              variant="row"
              rowTheme="teal"
              icon={<IconPhone stroke="#0F6E56" />}
              label="Contact Info. Update"
              desc="Update employee contact information"
              onClick={setMobileOpen}
              disabled={isProfileLoading}
            />
            {/* <QAButton
              variant="row"
              rowTheme="default"
              icon={<IconDoc stroke="#185FA5" />}
              label="Transport Policies"
              desc="View and update transport policies"
              onClick={() => {}}
            /> */}
            <QAButton
              variant="row"
              rowTheme="danger"
              icon={<IconLock stroke="#E24B4A" />}
              label="Change Password"
              desc="Update your account password"
              onClick={setPasswordOpen}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default QuickAction;
