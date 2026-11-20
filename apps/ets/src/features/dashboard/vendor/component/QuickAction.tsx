import React from "react";
import {
  IconChat,
  IconAlert,
  IconUser,
  // IconAdhoc,
} from "../../../../assets/dashboard/index";
import { CarFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  /** Outer wrapper */
  containerBg: "#ffffff",
  containerBorder: "#E8F5EE",

  /** Shared text */
  titleColor: "#111827",
  descColor: "#6B7280",
  viewBtnText: "#1B4332", // default; overridden per-card
  viewBtnBorder: "#D1D5DB",
  headingColor: "#111827", // subtle border on the button

  /** Badge text */
  badgeText: "#ffffff",

  /** ── Per-card theming ── */
  cards: {
    employee: {
      cardBg: "#F0FAF4", // light green
      iconCircleBg: "#FFFFFF",
      iconCircleBorder: "#D1FAE5",
      iconColor: "#1B9D6C",
      badgeBg: "#1B9D6C", // green
      viewBtnTextColor: "#1B9D6C",
    },
    driver: {
      cardBg: "#EEF4FF", // light blue
      iconCircleBg: "#FFFFFF",
      iconCircleBorder: "#BFDBFE",
      iconColor: "#3B82F6",
      badgeBg: "#3B82F6", // blue
      viewBtnTextColor: "#3B82F6",
    },
    vehicle: {
      cardBg: "#F3F0FF", // light purple
      iconCircleBg: "#FFFFFF",
      iconCircleBorder: "#DDD6FE",
      iconColor: "#7C3AED",
      badgeBg: "#7C3AED", // purple
      viewBtnTextColor: "#7C3AED",
    },
    address: {
      cardBg: "#FFFBEB", // light yellow/cream
      iconCircleBg: "#FFFFFF",
      iconCircleBorder: "#FDE68A",
      iconColor: "#D97706",
      badgeBg: "#F59E0B", // amber/orange
      viewBtnTextColor: "#D97706",
    },
  },
};

const RADII = {
  container: 16,
  card: 16,
  iconCircle: 9999,
  badge: 9999,
  viewBtn: 8,
};

const FONT = {
  heading: { fontSize: 16, fontWeight: 700 },
  cardTitle: { fontSize: 12, fontWeight: 600, lineHeight: 1.1 },
  cardDesc: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
  viewBtn: { fontSize: 10, fontWeight: 500 },
  badge: { fontSize: 11, fontWeight: 700 },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuickData {
  addressCount: number;
  driverCount: number;
  vehicleCount: number;
  userCount: number;
}

type CardTheme = typeof COLORS.cards.employee;

interface QACardProps {
  icon: React.ReactNode;
  title: string;
  // description: string;
  onClick: () => void;
  popupData?: number;
  theme: CardTheme;
  disabled?: boolean;
}

// ─── QACard ───────────────────────────────────────────────────────────────────
const QACard: React.FC<QACardProps> = ({
  icon,
  title,
  // description,
  onClick,
  popupData = 0,
  theme,
  disabled,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        position: "relative",
        background: theme.cardBg,
        borderRadius: RADII.card,
        padding: "20px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {popupData > 0 && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: theme.badgeBg,
            color: COLORS.badgeText,
            height: 22,
            minWidth: 22,
            padding: "0 5px",
            borderRadius: RADII.badge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...FONT.badge,
          }}
        >
          {popupData}
        </span>
      )}

      {/* Circular icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: RADII.iconCircle,
          background: theme.iconCircleBg,
          border: `1.5px solid ${theme.iconCircleBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: theme.iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <p style={{ margin: 0, color: COLORS.titleColor, ...FONT.cardTitle }}>
        {title}
      </p>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          marginTop: 4,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "6px",
          background: "#ffffff",
          border: `1px solid ${COLORS.viewBtnBorder}`,
          borderRadius: RADII.viewBtn,
          color: theme.viewBtnTextColor,
          cursor: disabled ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
          ...FONT.viewBtn,
        }}
      >
        View Requests
        <span style={{ fontSize: 10, lineHeight: 1 }}>›</span>
      </button>
    </div>
  );
};

// ─── QuickAction ──────────────────────────────────────────────────────────────
const QuickAction = ({ data }: { data: QuickData }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: COLORS.containerBg,
        border: `1px solid ${COLORS.containerBorder}`,
        borderRadius: RADII.container,
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: COLORS.headingColor,
          margin: "0 0 14px",
          ...FONT.heading,
        }}
      >
        Quick Actions
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <QACard
          icon={<IconUser stroke={COLORS.cards.employee.iconColor} />}
          title="Employee Approval Request"
          // description="Review and approve employee related requests"
          onClick={() => navigate("/account/employee")}
          popupData={data.userCount ?? 0}
          theme={COLORS.cards.employee}
        />
        <QACard
          icon={<IconChat stroke={COLORS.cards.driver.iconColor} />}
          title="Driver Approval Request"
          // description="Review and approve driver related requests"
          onClick={() => navigate("/fleet/driver")}
          popupData={data.driverCount ?? 0}
          theme={COLORS.cards.driver}
        />
        <QACard
          icon={
            <span>
              <CarFilled color={COLORS.cards.vehicle.iconColor} />
            </span>
          }
          title="Vehicle Approval Request"
          // description="Review and approve vehicle related requests"
          onClick={() => navigate("/fleet/vehicle")}
          popupData={data.vehicleCount ?? 0}
          theme={COLORS.cards.vehicle}
        />
        <QACard
          icon={<IconAlert stroke={COLORS.cards.address.iconColor} />}
          title="Address Change Request"
          // description="Review and approve address change requests"
          onClick={() => console.log("address")}
          popupData={data.addressCount ?? 0}
          theme={COLORS.cards.address}
        />
      </div>
    </div>
  );
};

export default QuickAction;
