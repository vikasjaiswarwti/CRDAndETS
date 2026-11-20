import CommutrLogo from "./CommutrLogo";
import { T } from "./designToken";
// import NotificationBell from "./NotificationBell";
import type { AppHeaderProps } from "./RoutingHeader";
import { BankOutlined } from "@ant-design/icons";
// import UserAvatar from "./UserAvatar";
import PlaySoundSwitch from "./PlaySoundSwitch";
import NotificationButton from "./NotificationButton";
import TripTypeBadge from "../../components/ui/LoginBadge"; // "../../../shared/components/ui/LoginBadge";
import { useIsMobile } from "../../customHooks/useIsMobile";

function RouteTracking({
  title = "Route Tracking",
  onBack,
  // notificationCount = 0,
  // userInitials = "AM",
  dateLabel,
  tripId,
  isGuard,
  datetime,
  tripType = 1,
  officeName = "",
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  const now =
    dateLabel ??
    new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  if (isMobile) {
    return (
      <>
        <header
          style={{
            height: 54,
            background: "#fff",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "relative",
            zIndex: 100,
          }}
        >
          <CommutrLogo />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PlaySoundSwitch />
            <NotificationButton />
          </div>
        </header>
      </>
    );
  }

  return (
    <header
      style={{
        height: 54,
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* ───────── LEFT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: T.sp12 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: T.radiusSm,
                color: T.muted,
                // display: "flex",
                alignItems: "center",
              }}
              title="Go back"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <CommutrLogo />
        </div>
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>

          <div
            style={{
              width: 1,
              height: 18,
              background: "#E5E7EB",
            }}
          />

          <span
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Trip ID: {tripId}
          </span>
        </div>
        {/* Driver Icon */}
        {isGuard && (
          <button
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: isGuard ? "red" : "#4B5563",
            }}
          >
            <abbr title="Guard Required">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </abbr>
          </button>
        )}

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#6B7280",
            fontSize: 12,
            fontWeight: 500,
            border: "1px solid #6B7280",
            padding: "4px",
            borderRadius: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          <span>{datetime ?? now}</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Logout */}
        {officeName && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "5px 12px",
              borderRadius: "8px",
              background: "#DBEAFE",
              border: "1px solid #93C5FD",
              // background: "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)",
              color: "#1D4ED8",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              // border: "1px solid #BBF7D0",
              backdropFilter: "blur(4px)",
              transition: "all 0.2s ease",
            }}
          >
            <BankOutlined /> {officeName}
          </span>
        )}

        <TripTypeBadge type={tripType === 2 ? "Logout" : "Login"} size={70} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 0,
        }}
      >
        <PlaySoundSwitch />
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />
        <NotificationButton />
      </div>
    </header>
  );
}
export default RouteTracking;
